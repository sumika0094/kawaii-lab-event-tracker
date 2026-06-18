import { loadEventsFromJson } from "@/lib/storage";
import EventList from "@/components/EventList";

// このページは events.json の内容を毎回読みに行きたいので、
// 静的キャッシュを無効化しておく（更新が反映されやすいようにする）。
export const dynamic = "force-dynamic";

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return "未実行";
  }
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const data = loadEventsFromJson();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <header className="mb-6 text-center sm:mb-10">
        <h1 className="text-2xl font-extrabold text-pink-500 sm:text-3xl">
          🎀 KAWAII LAB Event Tracker
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          KAWAII LAB. / FRUITS ZIPPER / CANDY TUNE / SWEET STEADY / CUTIE
          STREET / MORE STAR
          のイベント情報をまとめてチェックできます。
        </p>
        <p className="mt-1 text-xs text-gray-400">
          最終更新: {formatUpdatedAt(data.updatedAt)}（12時間ごとに自動更新）
        </p>
      </header>

      <EventList events={data.events} />
    </main>
  );
}
