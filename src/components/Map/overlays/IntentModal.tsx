"use client";

import { useMapContext } from "../MapProvider";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin } from "lucide-react";
import { OSMPlace } from "@/hooks/useOSM";
import { useState } from "react";
import { HOTSPOT_CATEGORIES } from "@/lib/mapFilters";

const INTENT_SUGGESTIONS = [
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

export function IntentModal({ osmPlaces = [] }: { osmPlaces?: OSMPlace[] }) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const {
    showIntentModal,
    setShowIntentModal,
    intentText,
    setIntentText,
    intentCategory,
    setIntentCategory,
    customHotspotRange,
    setCustomHotspotRange,
    postIntent,
    socketReady,
    filteredHotspots,
    myUserId,
    leaveHotspot,
  } = useMapContext();

  const myActiveHotspot = filteredHotspots?.find((h: any) => h.host_id === myUserId);

  const handleDeleteHotspot = () => {
    if (myActiveHotspot) {
      leaveHotspot(myActiveHotspot.id);
      setShowIntentModal(false);
    }
  };

  const handleCreateClick = () => {
    const place = osmPlaces.find((p) => p.id === selectedPlaceId);
    postIntent(place);
  };

  return (
    <AnimatePresence>
      {showIntentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/30 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIntentModal(false);
          }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex h-[calc(100vh-24px)] max-h-[calc(100dvh-24px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-200" />
            </div>

            <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-5 pb-3 pt-2">
              <h3 className="text-lg font-bold text-zinc-900">
                {myActiveHotspot ? "Active Hotspot" : "Post Intent"}
              </h3>
              <button
                onClick={() => setShowIntentModal(false)}
                className="p-1.5 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3 pt-3 scrollbar-none">
              {myActiveHotspot ? (
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                    <h4 className="text-sm font-bold text-zinc-900 mb-1">{myActiveHotspot.title}</h4>
                    <p className="text-xs text-zinc-500">
                      You already have an active hotspot. You can only have one active hotspot at a time.
                      Delete it to create a new one.
                    </p>
                  </div>
                  <div className="sticky bottom-0 -mx-5 flex gap-3 border-t border-zinc-100 bg-white/95 px-5 pb-2 pt-3 backdrop-blur-sm">
                    <button
                      onClick={() => setShowIntentModal(false)}
                      className="flex-1 py-3.5 rounded-xl bg-zinc-100 text-zinc-600 font-semibold text-sm hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteHotspot}
                      className="flex-1 py-3.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Delete Hotspot
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                    Post what you are doing. Adjust the slider below to control how far away (10km - 50km) others can be to see your hotspot on their map.
                  </p>

                  {/* Devcon-friendly hotspot categories */}
                  <div className="mb-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Hotspot type</p>
                      <span className="max-w-[150px] truncate rounded-full bg-white px-2 py-1 text-[9px] font-bold text-zinc-400">
                        {HOTSPOT_CATEGORIES.find((category) => category.key === intentCategory)?.label || "Community"}
                      </span>
                    </div>
                    <div className="grid max-h-[112px] grid-cols-3 gap-1.5 overflow-y-auto pr-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden">
                      {HOTSPOT_CATEGORIES.map((category) => (
                        <button
                          key={category.key}
                          type="button"
                          onClick={() => {
                            setIntentCategory(category.key);
                            if (!intentText.trim() || INTENT_SUGGESTIONS.includes(intentText)) {
                              setIntentText(category.prompt);
                            }
                          }}
                          className={`min-h-8 truncate rounded-lg border px-1.5 py-1 text-[9px] font-bold transition-colors ${intentCategory === category.key
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                            }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="mb-4 rounded-2xl border border-dashed border-zinc-200 bg-white p-2.5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Quick prompts</p>
                    <div className="flex max-h-[92px] flex-wrap gap-1.5 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
                      {INTENT_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setIntentText(s)}
                          className={`rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition-colors cursor-pointer ${intentText === s
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <input
                    autoFocus
                    type="text"
                    value={intentText}
                    onChange={(e) => setIntentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateClick()}
                    placeholder="Or type your own..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors mb-4"
                  />

                  {/* Hotspot Range Slider */}
                  <div className="mb-4 bg-zinc-50/50 border border-zinc-100 p-3 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-zinc-700">Hotspot Proximity Range</span>
                      <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
                        {customHotspotRange} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="1"
                      value={customHotspotRange}
                      onChange={(e) => setCustomHotspotRange(parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-full cursor-pointer accent-zinc-900 bg-zinc-200"
                    />
                    <p className="text-[9px] text-zinc-400 mt-1">
                      Your hotspot will only be discoverable by users physically within this radius.
                    </p>
                  </div>

                  {/* OSM Places Picker */}
                  {osmPlaces.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-xs font-bold text-zinc-900 mb-2 flex items-center gap-1">
                        <MapPin size={12} /> Attach to nearby place
                      </h4>
                      <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden bg-zinc-50/50 border border-zinc-100 p-2 rounded-xl">
                        <button
                          onClick={() => setSelectedPlaceId(null)}
                          className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedPlaceId === null
                            ? "bg-zinc-900 text-white"
                            : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200/50"
                            }`}
                        >
                          None (Use my exact location)
                        </button>
                        {osmPlaces.map((place) => (
                          <button
                            key={place.id}
                            onClick={() => setSelectedPlaceId(place.id)}
                            className={`text-left px-3 py-2 rounded-lg transition-colors flex flex-col gap-0.5 ${selectedPlaceId === place.id
                              ? "bg-zinc-900 text-white"
                              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200/50"
                              }`}
                          >
                            <span className="text-xs font-bold truncate">{place.tags.name}</span>
                            {place.tags.amenity && (
                              <span className={`text-[9px] uppercase tracking-wider ${selectedPlaceId === place.id ? "text-zinc-300" : "text-zinc-400"}`}>
                                {place.tags.amenity}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="sticky bottom-0 -mx-5 flex gap-3 border-t border-zinc-100 bg-white/95 px-5 pb-2 pt-3 backdrop-blur-sm">
                    <button
                      onClick={() => setShowIntentModal(false)}
                      className="flex-1 py-3.5 rounded-xl bg-zinc-100 text-zinc-600 font-semibold text-sm hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateClick}
                      disabled={!intentText.trim() || !socketReady}
                      className="flex-1 py-3.5 rounded-xl bg-zinc-900 text-white font-bold text-sm disabled:opacity-40 hover:bg-black transition-colors cursor-pointer"
                    >
                      Create Hotspot
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
