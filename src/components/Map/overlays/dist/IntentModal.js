"use client";
"use strict";
exports.__esModule = true;
exports.IntentModal = void 0;
var MapProvider_1 = require("../MapProvider");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var mapFilters_1 = require("@/lib/mapFilters");
var INTENT_SUGGESTIONS = [
    "Need a chai buddy ☕",
    "Anyone up for a walk? 🚶",
    "Study partner needed 📚",
    "Guitar jam session 🎸",
    "Boba run 🧋",
    "Midnight ramen? 🍜",
    "Gym buddy 🏋️",
    "Coding together? 💻",
    "Movie night? 🍿",
    "Let's play chess ♟️",
    "Coffee date? ☕💕",
    "Anime marathon 🎌",
    "Board games tonight 🎲",
    "Sunset walk 🌅",
    "Karaoke time 🎤",
    "Cooking together 🍳",
];
function IntentModal(_a) {
    var _b;
    var _c = _a.osmPlaces, osmPlaces = _c === void 0 ? [] : _c;
    var _d = react_1.useState(null), selectedPlaceId = _d[0], setSelectedPlaceId = _d[1];
    var _e = MapProvider_1.useMapContext(), showIntentModal = _e.showIntentModal, setShowIntentModal = _e.setShowIntentModal, intentText = _e.intentText, setIntentText = _e.setIntentText, intentCategory = _e.intentCategory, setIntentCategory = _e.setIntentCategory, customHotspotRange = _e.customHotspotRange, setCustomHotspotRange = _e.setCustomHotspotRange, postIntent = _e.postIntent, socketReady = _e.socketReady, filteredHotspots = _e.filteredHotspots, myUserId = _e.myUserId, leaveHotspot = _e.leaveHotspot;
    var myActiveHotspot = filteredHotspots === null || filteredHotspots === void 0 ? void 0 : filteredHotspots.find(function (h) { return h.host_id === myUserId; });
    var handleDeleteHotspot = function () {
        if (myActiveHotspot) {
            leaveHotspot(myActiveHotspot.id);
            setShowIntentModal(false);
        }
    };
    var handleCreateClick = function () {
        var place = osmPlaces.find(function (p) { return p.id === selectedPlaceId; });
        postIntent(place);
    };
    return (React.createElement(framer_motion_1.AnimatePresence, null, showIntentModal && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[1000] flex items-end justify-center bg-black/30 backdrop-blur-[2px]", onClick: function (e) {
            if (e.target === e.currentTarget)
                setShowIntentModal(false);
        } },
        React.createElement(framer_motion_1.motion.div, { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "spring", stiffness: 300, damping: 30 }, className: "flex h-[calc(100vh-24px)] max-h-[calc(100dvh-24px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl" },
            React.createElement("div", { className: "flex justify-center pt-3 pb-1" },
                React.createElement("div", { className: "w-10 h-1 rounded-full bg-zinc-200" })),
            React.createElement("div", { className: "flex shrink-0 items-center justify-between border-b border-zinc-100 px-5 pb-3 pt-2" },
                React.createElement("h3", { className: "text-lg font-bold text-zinc-900" }, myActiveHotspot ? "Active Hotspot" : "Post Intent"),
                React.createElement("button", { onClick: function () { return setShowIntentModal(false); }, className: "p-1.5 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors cursor-pointer" },
                    React.createElement(lucide_react_1.X, { size: 15 }))),
            React.createElement("div", { className: "min-h-0 flex-1 overflow-y-auto px-5 pb-3 pt-3 scrollbar-none" }, myActiveHotspot ? (React.createElement("div", { className: "flex flex-col gap-4" },
                React.createElement("div", { className: "p-4 rounded-xl bg-zinc-50 border border-zinc-200" },
                    React.createElement("h4", { className: "text-sm font-bold text-zinc-900 mb-1" }, myActiveHotspot.title),
                    React.createElement("p", { className: "text-xs text-zinc-500" }, "You already have an active hotspot. You can only have one active hotspot at a time. Delete it to create a new one.")),
                React.createElement("div", { className: "sticky bottom-0 -mx-5 flex gap-3 border-t border-zinc-100 bg-white/95 px-5 pb-2 pt-3 backdrop-blur-sm" },
                    React.createElement("button", { onClick: function () { return setShowIntentModal(false); }, className: "flex-1 py-3.5 rounded-xl bg-zinc-100 text-zinc-600 font-semibold text-sm hover:bg-zinc-200 transition-colors cursor-pointer" }, "Cancel"),
                    React.createElement("button", { onClick: handleDeleteHotspot, className: "flex-1 py-3.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors cursor-pointer" }, "Delete Hotspot")))) : (React.createElement(React.Fragment, null,
                React.createElement("p", { className: "text-xs text-zinc-400 mb-4 leading-relaxed" }, "Post what you are doing. Adjust the slider below to control how far away (10km - 50km) others can be to see your hotspot on their map."),
                React.createElement("div", { className: "mb-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5" },
                    React.createElement("div", { className: "mb-2 flex items-center justify-between gap-2" },
                        React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-wider text-zinc-500" }, "Hotspot type"),
                        React.createElement("span", { className: "max-w-[150px] truncate rounded-full bg-white px-2 py-1 text-[9px] font-bold text-zinc-400" }, ((_b = mapFilters_1.HOTSPOT_CATEGORIES.find(function (category) { return category.key === intentCategory; })) === null || _b === void 0 ? void 0 : _b.label) || "Community")),
                    React.createElement("div", { className: "grid max-h-[112px] grid-cols-3 gap-1.5 overflow-y-auto pr-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden" }, mapFilters_1.HOTSPOT_CATEGORIES.map(function (category) { return (React.createElement("button", { key: category.key, type: "button", onClick: function () {
                            setIntentCategory(category.key);
                            if (!intentText.trim() || INTENT_SUGGESTIONS.includes(intentText)) {
                                setIntentText(category.prompt);
                            }
                        }, className: "min-h-8 truncate rounded-lg border px-1.5 py-1 text-[9px] font-bold transition-colors " + (intentCategory === category.key
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400") }, category.label)); }))),
                React.createElement("div", { className: "mb-4 rounded-2xl border border-dashed border-zinc-200 bg-white p-2.5" },
                    React.createElement("p", { className: "mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400" }, "Quick prompts"),
                    React.createElement("div", { className: "flex max-h-[92px] flex-wrap gap-1.5 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden" }, INTENT_SUGGESTIONS.map(function (s) { return (React.createElement("button", { key: s, onClick: function () { return setIntentText(s); }, className: "rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition-colors cursor-pointer " + (intentText === s
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400") }, s)); }))),
                React.createElement("input", { autoFocus: true, type: "text", value: intentText, onChange: function (e) { return setIntentText(e.target.value); }, onKeyDown: function (e) { return e.key === "Enter" && handleCreateClick(); }, placeholder: "Or type your own...", className: "w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors mb-4" }),
                React.createElement("div", { className: "mb-4 bg-zinc-50/50 border border-zinc-100 p-3 rounded-2xl" },
                    React.createElement("div", { className: "flex justify-between items-center mb-2" },
                        React.createElement("span", { className: "text-xs font-semibold text-zinc-700" }, "Hotspot Proximity Range"),
                        React.createElement("span", { className: "text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full" },
                            customHotspotRange,
                            " km")),
                    React.createElement("input", { type: "range", min: "10", max: "50", step: "1", value: customHotspotRange, onChange: function (e) { return setCustomHotspotRange(parseInt(e.target.value)); }, className: "w-full h-1.5 rounded-full cursor-pointer accent-zinc-900 bg-zinc-200" }),
                    React.createElement("p", { className: "text-[9px] text-zinc-400 mt-1" }, "Your hotspot will only be discoverable by users physically within this radius.")),
                osmPlaces.length > 0 && (React.createElement("div", { className: "mb-5" },
                    React.createElement("h4", { className: "text-xs font-bold text-zinc-900 mb-2 flex items-center gap-1" },
                        React.createElement(lucide_react_1.MapPin, { size: 12 }),
                        " Attach to nearby place"),
                    React.createElement("div", { className: "flex flex-col gap-1.5 max-h-[140px] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden bg-zinc-50/50 border border-zinc-100 p-2 rounded-xl" },
                        React.createElement("button", { onClick: function () { return setSelectedPlaceId(null); }, className: "text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors " + (selectedPlaceId === null
                                ? "bg-zinc-900 text-white"
                                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200/50") }, "None (Use my exact location)"),
                        osmPlaces.map(function (place) { return (React.createElement("button", { key: place.id, onClick: function () { return setSelectedPlaceId(place.id); }, className: "text-left px-3 py-2 rounded-lg transition-colors flex flex-col gap-0.5 " + (selectedPlaceId === place.id
                                ? "bg-zinc-900 text-white"
                                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200/50") },
                            React.createElement("span", { className: "text-xs font-bold truncate" }, place.tags.name),
                            place.tags.amenity && (React.createElement("span", { className: "text-[9px] uppercase tracking-wider " + (selectedPlaceId === place.id ? "text-zinc-300" : "text-zinc-400") }, place.tags.amenity)))); })))),
                React.createElement("div", { className: "sticky bottom-0 -mx-5 flex gap-3 border-t border-zinc-100 bg-white/95 px-5 pb-2 pt-3 backdrop-blur-sm" },
                    React.createElement("button", { onClick: function () { return setShowIntentModal(false); }, className: "flex-1 py-3.5 rounded-xl bg-zinc-100 text-zinc-600 font-semibold text-sm hover:bg-zinc-200 transition-colors cursor-pointer" }, "Cancel"),
                    React.createElement("button", { onClick: handleCreateClick, disabled: !intentText.trim() || !socketReady, className: "flex-1 py-3.5 rounded-xl bg-zinc-900 text-white font-bold text-sm disabled:opacity-40 hover:bg-black transition-colors cursor-pointer" }, "Create Hotspot"))))))))));
}
exports.IntentModal = IntentModal;
