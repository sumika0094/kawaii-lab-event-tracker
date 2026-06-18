/**
 * スクレイパー本体
 * ===========================================
 *
 * 実行方法: npm run scrape
 * （内部的には tsx scripts/scrape.ts を実行するだけ）
 *
 * 処理の流れ：
 *   1. lib/sources.ts に書かれた各公式サイトの SCHEDULE 一覧ページを取得
 *   2. 一覧ページから「イベントタイトル」と「詳細ページURL」を抜き出す
 *   3. 詳細ページを取得して本文から日時・会場を抽出
 *   4. 全サイトの結果をまとめて重複除外し、data/events.json に保存
 *
 * GitHub Actions（.github/workflows/scrape.yml）からも
 * このスクリプトが12時間ごとに自動実行される。
 */

import * as cheerio from "cheerio";
import { SOURCES } from "../lib/sources";
import {
  extractEventDate,
  extractEventName,
  extractVenue,
  looksLikeEventArticle,
} from "../lib/extractor";
import { buildEventId, saveEventsToJson } from "../lib/storage";
import type { EventItem, SourceConfig } from "../lib/types";

const USER_AGENT =
  "Mozilla/5.0 (compatible; KawaiiLabEventTrackerBot/1.0; +https://github.com/)";

/** 1件のfetchが失敗してもスクリプト全体は止めず、ログだけ出して続行する */
async function safeFetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      // 1サイトの応答が遅すぎる場合に備えたタイムアウト
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`[warn] ${url} -> HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`[warn] fetch failed: ${url}`, err);
    return null;
  }
}

interface ListItem {
  title: string;
  detailUrl: string;
  publishedDate: string | null;
}

/**
 * SCHEDULE一覧ページ（または代替のNEWS一覧ページ）から
 * 「タイトル + 詳細URLへのリンク」の一覧を抜き出す。
 *
 * サイトのHTML構造は厳密には公開ドキュメントが無いため、
 * 「detail を含むリンクをすべて拾う」という緩い条件にしてある。
 * これにより多少サイト側のデザインが変わっても拾える可能性が高い。
 */
function parseListPage(html: string, source: SourceConfig): ListItem[] {
  const $ = cheerio.load(html);
  const items: ListItem[] = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    // /live_information/detail/123 や /news/detail/123 のようなリンクのみ対象
    if (!/\/(live_information|news)\/detail\//.test(href)) return;

    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (!title) return;

    const detailUrl = href.startsWith("http")
      ? href
      : new URL(href, source.origin).toString();

    items.push({ title, detailUrl, publishedDate: null });
  });

  return items;
}

/**
 * 一覧テキストの中に日付（2026.06.15 のような形式）が
 * タイトル直前に含まれているケースがあるため、簡易的に分離する。
 * 見つからなければ publishedDate は null のまま。
 */
function splitPublishedDateFromTitle(title: string): {
  title: string;
  publishedDate: string | null;
} {
  const match = title.match(/^(\d{4})[.\/年](\d{1,2})[.\/月](\d{1,2})日?\s*(.*)$/);
  if (!match) {
    return { title, publishedDate: null };
  }
  const [, y, m, d, rest] = match;
  const publishedDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return { title: rest.trim() || title, publishedDate };
}

/**
 * 詳細ページの本文テキストを取得する（タグを除いたプレーンテキスト）。
 */
function extractDetailBodyText(html: string): string {
  const $ = cheerio.load(html);
  // script/style/nav/footer など本文に関係ない部分は除外
  $("script, style, nav, footer, header").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

async function scrapeSource(source: SourceConfig): Promise<EventItem[]> {
  console.log(`\n=== ${source.groupName} (${source.id}) ===`);

  const listHtml = await safeFetchText(source.scheduleListUrl);
  if (!listHtml) {
    console.warn(`[warn] ${source.groupName}: 一覧ページの取得に失敗しました`);
    return [];
  }

  const rawItems = parseListPage(listHtml, source);
  console.log(`一覧から ${rawItems.length} 件のリンクを検出`);

  // 同じ詳細URLが一覧ページ内に複数回出てくることがあるので先に間引く
  const uniqueByUrl = new Map<string, ListItem>();
  for (const item of rawItems) {
    if (!uniqueByUrl.has(item.detailUrl)) {
      uniqueByUrl.set(item.detailUrl, item);
    }
  }

  const events: EventItem[] = [];

  for (const item of uniqueByUrl.values()) {
    const { title, publishedDate } = splitPublishedDateFromTitle(item.title);

    if (!looksLikeEventArticle(title)) {
      continue;
    }

    // 詳細ページを取得して、本文から日時・会場をより正確に抽出する。
    // 詳細取得に失敗してもタイトルだけで最低限の情報は残す。
    const detailHtml = await safeFetchText(item.detailUrl);
    const detailText = detailHtml ? extractDetailBodyText(detailHtml) : "";

    const dateSource = `${title} ${detailText}`;
    const extractedDate = extractEventDate(dateSource);
    const venue = extractVenue(`${detailText} ${title}`);

    const eventItem: EventItem = {
      id: buildEventId(source.groupName, item.detailUrl),
      groupName: source.groupName,
      eventName: extractEventName(title) || title,
      eventDate: extractedDate?.display ?? null,
      sortDate: extractedDate?.iso ?? null,
      venue: venue,
      detailUrl: item.detailUrl,
      publishedDate,
      sourceId: source.id,
    };

    events.push(eventItem);
  }

  console.log(`${source.groupName}: ${events.length} 件のイベントを抽出`);
  return events;
}

async function main() {
  console.log("KAWAII LAB. Event Tracker scraper 開始");
  console.log(`対象サイト数: ${SOURCES.length}`);

  const allEvents: EventItem[] = [];

  for (const source of SOURCES) {
    const events = await scrapeSource(source);
    allEvents.push(...events);
  }

  const data = saveEventsToJson(allEvents);

  console.log(`\n保存完了: ${data.count} 件のイベントを data/events.json に保存しました`);
  console.log(`更新日時: ${data.updatedAt}`);
}

main().catch((err) => {
  console.error("スクレイパーの実行中にエラーが発生しました:", err);
  process.exit(1);
});
