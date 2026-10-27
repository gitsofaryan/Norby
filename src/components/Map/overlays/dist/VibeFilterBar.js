"use client";
"use strict";
exports.__esModule = true;
exports.VibeFilterBar = void 0;
var MapProvider_1 = require("../MapProvider");
var mapFilters_1 = require("@/lib/mapFilters");
function VibeFilterBar() {
    var _a = MapProvider_1.useMapContext(), selectedFilter = _a.selectedFilter, setSelectedFilter = _a.setSelectedFilter;
    var handleFilterClick = function (key) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(8);
        }
        setSelectedFilter(key);
    };
    return (React.createElement("div", { id: "vibe-filter-bar", className: "pointer-events-auto absolute top-4 left-4 right-4 z-[410]" },
        React.createElement("div", { className: "flex gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-0.5" }, mapFilters_1.MAP_FILTERS.map(function (f) { return (React.createElement("button", { key: f.key, onClick: function () { return handleFilterClick(f.key); }, className: "px-3.5 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer " + (selectedFilter === f.key
                ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                : "bg-white/95 border-zinc-200 text-zinc-600 shadow-sm") }, f.label)); }))));
}
exports.VibeFilterBar = VibeFilterBar;
