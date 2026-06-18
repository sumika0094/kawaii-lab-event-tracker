/**
 * イベント1件分のデータ構造。
 * スクレイパー（scripts/scrape.ts）が生成し、
 * フロントエンド（app/page.tsx）が読み込んで表示する。
 */
export interface EventItem {
  /** 重複判定・React の key に使う一意なID（グループ名+詳細URLから生成） */
  id: string;
  /** グループ名（例: "FRUITS ZIPPER"） */
  groupName: string;
  /** イベント名（記事タイトルから抽出 or 記事タイトルそのもの） */
  eventName: string;
  /**
   * 開催日時の文字列表現（例: "2026-06-21" や "2026-06-21 13:00"）。
   * 抽出できなかった場合は null。
   */
  eventDate: string | null;
  /** ソート用に使う日付（ISO文字列）。抽出できなかった場合は null。 */
  sortDate: string | null;
  /** 会場名。抽出できなかった場合は null。 */
  venue: string | null;
  /** 詳細ページのURL */
  detailUrl: string;
  /** 元記事の公開日（一覧ページに表示されている日付） */
  publishedDate: string | null;
  /** どのソース（監視対象サイト）から取得したか */
  sourceId: string;
}

/** 監視対象サイト1件分の設定 */
export interface SourceConfig {
  /** ソースの識別子（スラッグ） */
  id: string;
  /** 表示用のグループ名 */
  groupName: string;
  /** イベント一覧ページ（SCHEDULE）のベースURL */
  scheduleListUrl: string;
  /** 詳細ページURLの相対パスを絶対URLに変換するためのオリジン */
  origin: string;
}

/** scripts/scrape.ts が書き出すJSONファイル全体の構造 */
export interface EventsData {
  /** 最終更新日時（ISO文字列） */
  updatedAt: string;
  /** 収集できたイベント件数 */
  count: number;
  /** イベント一覧 */
  events: EventItem[];
}
