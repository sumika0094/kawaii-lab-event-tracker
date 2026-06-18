"use client";

export type SortOrder = "asc" | "desc";

interface FilterBarProps {
  groups: string[];
  searchText: string;
  onSearchTextChange: (value: string) => void;
  selectedGroup: string;
  onSelectedGroupChange: (value: string) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
}

export default function FilterBar({
  groups,
  searchText,
  onSearchTextChange,
  selectedGroup,
  onSelectedGroupChange,
  sortOrder,
  onSortOrderChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-4 bg-[#fff7fb]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:px-4 sm:shadow-sm sm:ring-1 sm:ring-pink-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* 検索ボックス */}
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          placeholder="イベント名・会場名で検索"
          className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
        />

        <div className="flex gap-2">
          {/* グループ絞り込み */}
          <select
            value={selectedGroup}
            onChange={(e) => onSelectedGroupChange(e.target.value)}
            className="w-full rounded-xl border border-pink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 sm:w-auto"
          >
            <option value="ALL">すべてのグループ</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* 日付順ソート */}
          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
            className="w-full rounded-xl border border-pink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 sm:w-auto"
          >
            <option value="asc">開催日が近い順</option>
            <option value="desc">開催日が遠い順</option>
          </select>
        </div>
      </div>
    </div>
  );
}
