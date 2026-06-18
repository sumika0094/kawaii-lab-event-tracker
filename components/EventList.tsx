"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/lib/types";
import FilterBar, { type SortOrder } from "./FilterBar";
import EventCard from "./EventCard";

export default function EventList({ events }: { events: EventItem[] }) {
  const [searchText, setSearchText] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const groups = useMemo(() => {
    const set = new Set(events.map((e) => e.groupName));
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    let result = events.filter((event) => {
      if (selectedGroup !== "ALL" && event.groupName !== selectedGroup) {
        return false;
      }
      if (!keyword) return true;

      const haystack = [event.eventName, event.venue ?? "", event.groupName]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });

    result = [...result].sort((a, b) => {
      // 日付未定のイベントは常に末尾に配置する
      if (!a.sortDate && !b.sortDate) return 0;
      if (!a.sortDate) return 1;
      if (!b.sortDate) return -1;

      return sortOrder === "asc"
        ? a.sortDate.localeCompare(b.sortDate)
        : b.sortDate.localeCompare(a.sortDate);
    });

    return result;
  }, [events, searchText, selectedGroup, sortOrder]);

  return (
    <div>
      <FilterBar
        groups={groups}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        selectedGroup={selectedGroup}
        onSelectedGroupChange={setSelectedGroup}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <p className="mb-3 px-1 text-sm text-gray-500">
        {filteredEvents.length} 件のイベントを表示中
      </p>

      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 ring-1 ring-pink-100">
          条件に合うイベントが見つかりませんでした。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
