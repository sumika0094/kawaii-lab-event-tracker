import fs from "fs";
import path from "path";
import type { EventItem, EventsData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "events.json");

/**
 * グループ名＋詳細URLから一意なIDを作る。
 * 同じイベントが複数回スクレイピングされても同じIDになるようにし、
 * 重複除外のキーとして使う。
 */
export function buildEventId(groupName: string, detailUrl: string): string {
  return `${groupName}__${detailUrl}`;
}

/**
 * イベント配列から重複を取り除く。
 * 同じ id（グループ名+詳細URL）が複数あれば、最初に出てきたものだけ残す。
 */
export function dedupeEvents(events: EventItem[]): EventItem[] {
  const seen = new Set<string>();
  const result: EventItem[] = [];

  for (const event of events) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    result.push(event);
  }

  return result;
}

/**
 * イベント配列を開催日時の新しい順（未定は最後）に並べ替える。
 * ※ 表示側でも並べ替えはできるが、保存時にも整えておくと
 *   JSONファイルをそのまま見たときに分かりやすい。
 */
export function sortEventsByDate(events: EventItem[]): EventItem[] {
  return [...events].sort((a, b) => {
    if (a.sortDate && b.sortDate) {
      return a.sortDate.localeCompare(b.sortDate);
    }
    if (a.sortDate && !b.sortDate) return -1;
    if (!a.sortDate && b.sortDate) return 1;
    return 0;
  });
}

/**
 * イベントデータをdata/events.jsonに保存する。
 */
export function saveEventsToJson(events: EventItem[]): EventsData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const deduped = dedupeEvents(events);
  const sorted = sortEventsByDate(deduped);

  const data: EventsData = {
    updatedAt: new Date().toISOString(),
    count: sorted.length,
    events: sorted,
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

/**
 * data/events.jsonを読み込む。ファイルが無い場合は空データを返す
 * （初回デプロイ時やスクレイピング実行前でもアプリが落ちないようにするため）。
 */
export function loadEventsFromJson(): EventsData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as EventsData;
  } catch {
    return {
      updatedAt: new Date(0).toISOString(),
      count: 0,
      events: [],
    };
  }
}
