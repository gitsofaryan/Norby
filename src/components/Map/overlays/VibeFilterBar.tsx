"use client";

import { useMapContext } from "../MapProvider";
import { MAP_FILTERS } from "@/lib/mapFilters";

export function VibeFilterBar() {
  const { selectedFilter, setSelectedFilter } = useMapContext();

  const handleFilterClick = (key: string) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8);
    }
    setSelectedFilter(key);
  };

  return (
    <div id="vibe-filter-bar" className="pointer-events-auto absolute left-3 right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[410] sm:left-4 sm:right-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-0.5">
        {MAP_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilterClick(f.key)}
            className={`px-3.5 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer ${selectedFilter === f.key
              ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
              : "bg-white/95 border-zinc-200 text-zinc-600 shadow-sm"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
