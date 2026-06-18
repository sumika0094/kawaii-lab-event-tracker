import type { EventItem } from "@/lib/types";

const GROUP_COLOR_MAP: Record<string, string> = {
  "KAWAII LAB.": "bg-kawaii-purple",
  "FRUITS ZIPPER": "bg-kawaii-pink",
  "CANDY TUNE": "bg-kawaii-yellow",
  "SWEET STEADY": "bg-kawaii-mint",
  "CUTIE STREET": "bg-kawaii-pink",
  "MORE STAR": "bg-kawaii-purple",
};

function formatDisplayDate(eventDate: string | null): string {
  if (!eventDate) return "日時未定";
  // "2026-06-21" or "2026-06-21 13:00" を読みやすい表記に変換
  const [datePart, timePart] = eventDate.split(" ");
  const [y, m, d] = datePart.split("-");
  const formatted = `${y}年${m}月${d}日`;
  return timePart ? `${formatted} ${timePart}` : formatted;
}

export default function EventCard({ event }: { event: EventItem }) {
  const badgeColor = GROUP_COLOR_MAP[event.groupName] ?? "bg-kawaii-pink";

  return (
    <a
      href={event.detailUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-pink-100 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-bold text-white ${badgeColor}`}
      >
        {event.groupName}
      </span>

      <h3 className="mt-3 text-base font-bold leading-snug text-gray-800">
        {event.eventName}
      </h3>

      <dl className="mt-3 space-y-1.5 text-sm text-gray-600">
        <div className="flex gap-2">
          <dt className="shrink-0 text-pink-400">📅</dt>
          <dd>{formatDisplayDate(event.eventDate)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 text-pink-400">📍</dt>
          <dd>{event.venue ?? "会場未定"}</dd>
        </div>
      </dl>

      <span className="mt-4 inline-block text-sm font-semibold text-pink-500 underline-offset-2 hover:underline">
        詳細を見る →
      </span>
    </a>
  );
}
