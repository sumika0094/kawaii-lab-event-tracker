/**
 * イベント抽出ロジック（パーサー）
 * ===========================================
 *
 * 公式サイトの「イベント詳細ページ」には決まったフォーマットのAPIは無く、
 * 人間が読むための自由なテキスト（タイトル・本文）しかない。
 * そのため、このファイルでは「よくあるパターン」を正規表現で探して
 * 日時・会場を推測する、というシンプルな方針をとっている。
 *
 * 方針（未経験者でも保守しやすいことを優先）：
 *   - 完璧な抽出は目指さない。失敗したら null を返すだけで、
 *     アプリ全体が落ちたりはしない。
 *   - パターンを増やしたくなったら、EVENT_DATE_PATTERNS /
 *     VENUE_PATTERNS の配列に追記するだけで拡張できるようにする。
 */

/** 全角数字・記号を半角に正規化する */
function normalizeText(text: string): string {
  return text
    .replace(/[０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    )
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/[〜～]/g, "~")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 日付抽出パターン一覧。
 * 上から順に試して、最初にマッチしたものを採用する。
 * グループ1, 2, 3 は (年), 月, 日 を表す想定（年が無いパターンは year=null）。
 */
const DATE_PATTERNS: { regex: RegExp; hasYear: boolean }[] = [
  // 2026年6月21日 / 2026/6/21 / 2026.6.21
  { regex: /(\d{4})[年/.](\d{1,2})[月/.](\d{1,2})日?/, hasYear: true },
  // 6月21日（日） / 6/21(日) ※年が書かれていないケース
  { regex: /(?:^|[^\d])(\d{1,2})[月/.](\d{1,2})日?\s*[(（]/, hasYear: false },
  // 6月21日 のみ（曖昧だが最後の手段）
  { regex: /(?:^|[^\d])(\d{1,2})月(\d{1,2})日/, hasYear: false },
];

/** 時刻抽出パターン（開演 13:00 / 13時00分 / 13:00開演 など） */
const TIME_PATTERN = /(\d{1,2})[:時](\d{2})分?/;

/**
 * 会場名らしき文字列を抜き出すためのパターン。
 * 「会場：◯◯」「@◯◯」「＠◯◯」「at ◯◯」など。
 */
const VENUE_PATTERNS: RegExp[] = [
  /会場[:：]\s*([^\n、,。]{2,40})/,
  /開催場所[:：]\s*([^\n、,。]{2,40})/,
  /[@＠]\s*([^\n、,。]{2,40})/,
];

/**
 * タイトル・本文からイベント名らしき文字列を作る。
 * 「@会場名」より前の部分をイベント名とみなし、
 * 余計な記号（【】や末尾の「開催決定！」など）を軽く取り除く。
 */
export function extractEventName(rawTitle: string): string {
  const normalized = normalizeText(rawTitle);
  // "@" や "＠" より前をイベント名候補とする
  const beforeAt = normalized.split(/[@＠]/)[0];
  return beforeAt
    .replace(/^[\s【】\[\]]+/, "")
    .replace(/開催決定[！!]?$/, "")
    .replace(/のお知らせ$/, "")
    .trim();
}

/**
 * 年が分からない月日だけの日付を補完するための基準年。
 * 「12月のイベントを6月に見つけた」場合は来年、
 * それ以外は当年として扱う簡易ロジック。
 */
function resolveYear(month: number, referenceDate: Date): number {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  // 今より3ヶ月以上前の月が出てきたら「来年」の可能性が高いとみなす
  if (month < currentMonth - 3) {
    return currentYear + 1;
  }
  return currentYear;
}

export interface ExtractedDate {
  /** 表示用文字列（例: "2026-06-21 13:00"） */
  display: string;
  /** ソート用のISO文字列（例: "2026-06-21T13:00:00"） */
  iso: string;
}

/**
 * テキストから日時を抽出する。
 * 見つからない場合は null を返す（呼び出し側はその場合「日時未定」と表示する）。
 */
export function extractEventDate(
  text: string,
  referenceDate: Date = new Date()
): ExtractedDate | null {
  const normalized = normalizeText(text);

  for (const pattern of DATE_PATTERNS) {
    const match = normalized.match(pattern.regex);
    if (!match) continue;

    let year: number;
    let month: number;
    let day: number;

    if (pattern.hasYear) {
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    } else {
      month = parseInt(match[1], 10);
      day = parseInt(match[2], 10);
      year = resolveYear(month, referenceDate);
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) continue;

    // 時刻も探す
    const timeMatch = normalized.match(TIME_PATTERN);
    const hour = timeMatch ? parseInt(timeMatch[1], 10) : null;
    const minute = timeMatch ? parseInt(timeMatch[2], 10) : null;

    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    if (hour !== null && minute !== null && hour < 24 && minute < 60) {
      const hh = String(hour).padStart(2, "0");
      const mi = String(minute).padStart(2, "0");
      return {
        display: `${year}-${mm}-${dd} ${hh}:${mi}`,
        iso: `${year}-${mm}-${dd}T${hh}:${mi}:00`,
      };
    }

    return {
      display: `${year}-${mm}-${dd}`,
      iso: `${year}-${mm}-${dd}T00:00:00`,
    };
  }

  return null;
}

/**
 * テキストから会場名を抽出する。見つからなければ null。
 */
export function extractVenue(text: string): string | null {
  const normalized = normalizeText(text);

  for (const pattern of VENUE_PATTERNS) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * 「これはイベント記事らしいか？」を判定する簡易フィルタ。
 * グッズ販売情報や物販案内など、イベントそのものではない記事を
 * できるだけ除外するために使う（完璧ではないが、明らかに無関係なものは弾く）。
 */
const NON_EVENT_KEYWORDS = [
  "グッズ",
  "物販",
  "通販",
  "プレゼント",
  "発送",
  "リセール",
  "アップグレード抽選",
];

export function looksLikeEventArticle(title: string): boolean {
  return !NON_EVENT_KEYWORDS.some((keyword) => title.includes(keyword));
}
