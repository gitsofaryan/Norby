"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { useMapContext } from "./MapProvider";
import { UserMarker } from "./markers/UserMarker";
import { HotspotMarker } from "./markers/HotspotMarker";
import { UserDrawer } from "./drawers/UserDrawer";
import { HotspotDrawer } from "./drawers/HotspotDrawer";
import { SpaceDrawer } from "./drawers/SpaceDrawer";
import { VibeFilterBar } from "./overlays/VibeFilterBar";
import { FloatingControls } from "./overlays/FloatingControls";
import { IntentModal } from "./overlays/IntentModal";
import { RouteHUD } from "./overlays/RouteHUD";
import { CallOverlay } from "./CallOverlay";
import { IncomingCallModal } from "./overlays/IncomingCallModal";
import { ActiveCallHUD } from "./overlays/ActiveCallHUD";

// private MapController component to synchronize Leaflet instance states
function MapController({
  lat,
  lng,
  trigger,
  followUser,
  setFollowUser,
  setZoom,
  setIsInteracting,
  setBounds,
}: {
  lat: number;
  lng: number;
  trigger: number;
  followUser: boolean;
  setFollowUser: (val: boolean) => void;
  setZoom: (val: number) => void;
  setIsInteracting: (val: boolean) => void;
  setBounds: (bounds: any) => void;
}) {
  const map = useMap();

  useEffect(() => {
    (window as any).leafletMap = map;
    return () => {
      delete (window as any).leafletMap;
    };
  }, [map]);

  useEffect(() => {
    setZoom(map.getZoom());
    const onZoom = () => {
      setZoom(map.getZoom());
    };
    map.on("zoomend", onZoom);
    return () => {
      map.off("zoomend", onZoom);
    };
  }, [map, setZoom]);

  useEffect(() => {
    const onMoveStart = () => setIsInteracting(true);
    const onMoveEnd = () => {
      setIsInteracting(false);
      setBounds(map.getBounds());
    };
    const onDragStart = () => {
      setFollowUser(false);
      setIsInteracting(true);
    };
    const onDragEnd = () => {
      setIsInteracting(false);
      setBounds(map.getBounds());
    };

    map.on("movestart", onMoveStart);
    map.on("moveend", onMoveEnd);
    map.on("dragstart", onDragStart);
    map.on("dragend", onDragEnd);

    return () => {
      map.off("movestart", onMoveStart);
      map.off("moveend", onMoveEnd);
      map.off("dragstart", onDragStart);
      map.off("dragend", onDragEnd);
    };
  }, [map, setFollowUser, setIsInteracting]);

  useEffect(() => {
    if (followUser) {
      map.panTo([lat, lng], { animate: true, duration: 0.5 });
      setTimeout(() => setBounds(map.getBounds()), 600);
    }
  }, [lat, lng, followUser, map, setBounds]);

  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 0.8 });
    setTimeout(() => setBounds(map.getBounds()), 900);
  }, [trigger, map, lat, lng, setBounds]);

  return null;
}

import { useOSM } from "@/hooks/useOSM";
import { OSMMarker } from "./markers/OSMMarker";



function LiveMapContent() {
  const {
    location,
    zoom,
    setZoom,
    recenterTrigger,
    followUser,
    setFollowUser,
    isInteracting,
    setIsInteracting,
    toasts,
    filteredUsers,
    filteredHotspots,
    activeRoute,
    connectionFailed,
    myUserId,
    handle,
    myAvatarUrl,
    vibeEmoji,
    profile,
    setSelectedUser,
    activeUsers,
  } = useMapContext();

  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [highlightRect, setHighlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && myUserId) {
      const completed = localStorage.getItem("norby_onboarding_completed") === "true";
      const restartTrigger = localStorage.getItem("norby_start_onboarding_tour") === "true";
      
      if (restartTrigger) {
        localStorage.removeItem("norby_start_onboarding_tour");
        setOnboardingStep(0);
      } else if (!completed) {
        setOnboardingStep(0);
      }
    }
  }, [myUserId]);

  useEffect(() => {
    const updatePosition = () => {
      if (onboardingStep === null || onboardingStep === 0 || onboardingStep === 5) {
        setHighlightRect(null);
        return;
      }
      const selectors = [
        "#vibe-filter-bar",
        "#btn-post-intent",
        "#btn-recenter",
        "#btn-mic",
        null, // Step 5 is centered info about calls/waves
        "#nav-chat",
        "#nav-profile"
      ];
      const selector = selectors[onboardingStep - 1];
      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setHighlightRect((prev) => {
            if (
              prev &&
              prev.top === rect.top &&
              prev.left === rect.left &&
              prev.width === rect.width &&
              prev.height === rect.height
            ) {
              return prev;
            }
            return {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            };
          });
          return;
        }
      }
      setHighlightRect(null);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    // Poll every 400ms to handle dynamic overlays and bottom navigation loading shifts
    const interval = setInterval(updatePosition, 400);
    const timer = setTimeout(updatePosition, 300);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onboardingStep]);

  const handleNextOnboarding = () => {
    setOnboardingStep((prev) => {
      if (prev === null) return null;
      if (prev >= 7) {
        localStorage.setItem("norby_onboarding_completed", "true");
        router.push("/profile");
        return null;
      }
      return prev + 1;
    });
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem("norby_onboarding_completed", "true");
    setOnboardingStep(null);
    router.push("/profile");
  };
  
  const [bounds, setBoundsRaw] = useState<any>(null);
  const boundsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setBounds = useCallback((newBounds: any) => {
    if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
    boundsTimerRef.current = setTimeout(() => {
      setBoundsRaw(newBounds);
    }, 150);
  }, []);
  const osmPlaces = useOSM(bounds, zoom);

  // Calculate dispersion of markers to prevent overlapping
  const dispersedMarkers = useMemo(() => {
    if (!location) return [];

    const list: Array<{
      key: string;
      type: "me" | "user" | "hotspot";
      originalLat: number;
      originalLng: number;
      lat: number;
      lng: number;
      raw: any;
    }> = [];

    const userHostingHotspot = (userId: string) => {
      return filteredHotspots.some(h => h.host_id === userId);
    };

    if (!userHostingHotspot(myUserId)) {
      list.push({
        key: "me",
        type: "me",
        originalLat: location.lat,
        originalLng: location.lng,
        lat: location.lat,
        lng: location.lng,
        raw: {
          user_id: myUserId,
          username: handle,
          avatar_url: myAvatarUrl,
          vibeEmoji: vibeEmoji,
          lat: location.lat,
          lng: location.lng,
          bio: profile?.bio || "",
          selectedTags: profile?.selectedTags || [],
          gender: profile?.gender || "",
          age: profile?.age || "",
        },
      });
    }

    filteredUsers.forEach((u, idx) => {
      if (!userHostingHotspot(u.user_id)) {
        list.push({
          key: `user-${u.user_id || idx}`,
          type: "user",
          originalLat: u.lat,
          originalLng: u.lng,
          lat: u.lat,
          lng: u.lng,
          raw: u,
        });
      }
    });

    filteredHotspots.forEach((h) => {
      list.push({
        key: `hotspot-${h.id}`,
        type: "hotspot",
        originalLat: h.lat,
        originalLng: h.lng,
        lat: h.lat,
        lng: h.lng,
        raw: h,
      });
    });

    // Grouping threshold (approx 10 meters)
    const GRID_SIZE = 0.00009;
    const groups: Record<string, typeof list> = {};

    list.forEach((item) => {
      const gridLat = Math.round(item.originalLat / GRID_SIZE);
      const gridLng = Math.round(item.originalLng / GRID_SIZE);
      const groupKey = `${gridLat}_${gridLng}`;

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    // Apply radial dispersion to overlaps
    Object.values(groups).forEach((group) => {
      const N = group.length;
      if (N <= 1) return;

      const baseRadius = 0.00016; // base offset
      const zoomScale = Math.pow(2, 15 - zoom);
      const radius = baseRadius * Math.max(0.5, Math.min(2.0, zoomScale));

      group.forEach((item, index) => {
        const angle = (2 * Math.PI * index) / N;
        const offsetLat = radius * Math.sin(angle);
        const cosLat = Math.cos((item.originalLat * Math.PI) / 180);
        const offsetLng = (radius * Math.cos(angle)) / (cosLat || 1);

        item.lat = item.originalLat + offsetLat;
        item.lng = item.originalLng + offsetLng;
      });
    });

    // Render culling: only render markers within viewport + buffer
    if (bounds && bounds.pad) {
      const paddedBounds = bounds.pad(0.3); // 30% padding for smooth panning
      return list.filter(item => paddedBounds.contains([item.lat, item.lng]));
    }

    return list;
  }, [filteredUsers, filteredHotspots, location?.lat, location?.lng, zoom, bounds]);

  const MAP_FALLBACK = { lat: 28.6139, lng: 77.209 }; // New Delhi fallback
  const activeLocation = location || MAP_FALLBACK;

  return (
    <div className="absolute inset-0">
      <AnimatePresence>
        {connectionFailed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-[999] md:max-w-md md:mx-auto bg-amber-50/95 backdrop-blur-md border border-amber-200 rounded-2xl p-3.5 shadow-md flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-800 font-bold">
              ⚠️
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-amber-900 leading-tight">Connection Issue</h4>
              <p className="text-[10px] text-amber-700/90 font-medium mt-0.5 leading-normal">
                Reconnecting to live sync server. Check your internet connection.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <MapContainer
        center={[activeLocation.lat, activeLocation.lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" />
        <MapController
          lat={activeLocation.lat}
          lng={activeLocation.lng}
          trigger={recenterTrigger}
          followUser={followUser}
          setFollowUser={setFollowUser}
          setZoom={setZoom}
          setIsInteracting={setIsInteracting}
          setBounds={setBounds}
        />

        {dispersedMarkers.map((item) => {
          if (item.type === "me" || item.type === "user") {
            return <UserMarker key={item.key} item={item as any} />;
          } else if (item.type === "hotspot") {
            return <HotspotMarker key={item.key} item={item as any} />;
          }
          return null;
        })}

        {osmPlaces.map((place) => (
          <OSMMarker key={place.id} place={place} />
        ))}

        {activeRoute && activeRoute.coordinates && (
          <>
            <Polyline
              positions={activeRoute.coordinates}
              color="#000000"
              weight={10}
              opacity={0.15}
            />
            <Polyline
              positions={activeRoute.coordinates}
              color="#f43f5e"
              weight={6}
              opacity={0.8}
            />
            <Polyline
              positions={activeRoute.coordinates}
              color="#ffffff"
              weight={2.5}
              opacity={0.95}
              dashArray="6, 8"
            />
          </>
        )}
      </MapContainer>

      {/* Overlays */}
      <AnimatePresence>
        {!isInteracting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute inset-0 z-[400]"
          >
            <VibeFilterBar />
            <FloatingControls />
            <RouteHUD />

            {/* Removed Empty Map Invite Prompt as requested */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawers & Modals */}
      <IntentModal osmPlaces={osmPlaces} />
      <HotspotDrawer />
      <UserDrawer />
      <SpaceDrawer />
      <CallOverlay />
      <IncomingCallModal />
      <ActiveCallHUD />


      {/* Toast Notifications */}
      <div className="fixed top-20 left-0 right-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ y: -20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              className={`px-5 py-3 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 pointer-events-auto ${
                toast.type === "wave" ? "bg-emerald-500 text-white" : toast.type === "request" ? "bg-black text-white" : "bg-white text-zinc-900 border border-zinc-200"
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Onboarding Spotlight Backdrop */}
      <AnimatePresence>
        {onboardingStep !== null && (
          <>
            {/* Transparent click blocker to prevent clicking underlying elements and messing up the tour state */}
            <div className="fixed inset-0 z-[1180] bg-transparent pointer-events-auto cursor-default" />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1190] bg-black/65 pointer-events-none"
              style={
                highlightRect
                  ? {
                      clipPath: `polygon(
                        0% 0%, 0% 100%, 
                        ${highlightRect.left}px 100%, 
                        ${highlightRect.left}px ${highlightRect.top}px, 
                        ${highlightRect.left + highlightRect.width}px ${highlightRect.top}px, 
                        ${highlightRect.left + highlightRect.width}px ${highlightRect.top + highlightRect.height}px, 
                        ${highlightRect.left}px ${highlightRect.top + highlightRect.height}px, 
                        ${highlightRect.left}px 100%, 
                        100% 100%, 100% 0%
                      )`
                    }
                  : undefined
              }
            />
          </>
        )}
      </AnimatePresence>

      {/* Highlight Ring Overlay */}
      <AnimatePresence>
        {onboardingStep !== null && highlightRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              boxShadow: [
                "0 0 0 0 rgba(245,158,11,0.6)",
                "0 0 0 10px rgba(245,158,11,0)",
                "0 0 0 0 rgba(245,158,11,0.6)"
              ]
            }}
            exit={{ opacity: 0 }}
            className={`fixed z-[1195] pointer-events-none border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] ${
              onboardingStep === 3 || onboardingStep === 4 ? "rounded-full" : "rounded-2xl"
            }`}
            style={{
              top: highlightRect.top - 4,
              left: highlightRect.left - 4,
              width: highlightRect.width + 8,
              height: highlightRect.height + 8,
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: "easeInOut"
            }}
          />
        )}
      </AnimatePresence>

      {/* Onboarding Walkthrough Tooltip */}
      <AnimatePresence>
        {onboardingStep !== null && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed z-[1200] w-[calc(100%-32px)] max-w-sm bg-white/95 backdrop-blur-lg border border-zinc-200/80 shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-[32px] p-6 flex flex-col gap-4 text-zinc-900 select-none pointer-events-auto"
            style={
              highlightRect
                ? highlightRect.top < (typeof window !== "undefined" ? window.innerHeight / 2 : 400)
                  ? {
                      top: highlightRect.top + highlightRect.height + 16,
                      left: "16px",
                      right: "16px",
                      marginLeft: "auto",
                      marginRight: "auto"
                    }
                  : {
                      bottom: (typeof window !== "undefined" ? window.innerHeight - highlightRect.top : 400) + 16,
                      left: "16px",
                      right: "16px",
                      marginLeft: "auto",
                      marginRight: "auto"
                    }
                : {
                    top: "50%",
                    left: "16px",
                    right: "16px",
                    marginTop: "-145px",
                    marginLeft: "auto",
                    marginRight: "auto"
                  }
            }
          >
            {/* Skip button */}
            <button
              onClick={handleSkipOnboarding}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer"
              title="Skip onboarding"
            >
              <X size={13} />
            </button>

            {/* Tour branding and Step indicator */}
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-widest font-black text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full">
                Norby Tour
              </span>
              <div className="flex gap-1 items-center mr-6">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      onboardingStep === s ? "w-4 bg-amber-500" : "w-1 bg-zinc-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            {onboardingStep === 0 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-50 to-amber-100 border border-amber-200/40 flex items-center justify-center text-2xl shadow-inner">
                  👋
                </div>
                <h3 className="text-base font-black tracking-tight text-zinc-950 mt-1 font-sans">Welcome to Norby!</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed font-sans">
                  Norby connects you with people nearby in real-time. Drop a hotspot, broadcast your vibe, and chat with neighbors. Stop scrolling, start meeting!
                </p>
                <p className="text-[11px] text-amber-600 bg-amber-50/50 border border-amber-200/40 rounded-2xl p-3 font-semibold leading-relaxed mt-1 font-sans">
                  🔒 <strong>Important:</strong> To unlock calling, voice spaces, and chat rooms, you need to sign in. We'll direct you to the Profile page at the end of this tour!
                </p>
              </div>
            )}

            {onboardingStep === 1 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-50 to-amber-100 border border-amber-200/40 flex items-center justify-center text-2xl shadow-inner">
                  ☕
                </div>
                <h3 className="text-base font-black tracking-tight text-zinc-955 mt-1 font-sans">Choose a Vibe</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed font-sans">
                  Tap these buttons to find people who want to do the same things as you—like grab coffee, study, lift weights, or play games.
                </p>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-50 to-rose-100 border border-rose-200/40 flex items-center justify-center text-2xl shadow-inner">
                  🔥
                </div>
                <h3 className="text-base font-black tracking-tight text-zinc-955 mt-1 font-sans">Host a Hangout</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed font-sans">
                  Tap this button to drop a "Hotspot" on the map. Say what you want to do (e.g. "Study at Starbucks") so others can request to join you!
                </p>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-blue-100 border border-blue-200/40 flex items-center justify-center text-2xl shadow-inner">
                  🧭
                </div>
                <h3 className="text-base font-black tracking-tight text-zinc-955 mt-1 font-sans">Recenter & Scan</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed font-sans">
                  Tap this compass button to scan for nearby neighbors and recenter the map on your current location.
                </p>
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-50 to-purple-100 border border-purple-200/40 flex items-center justify-center text-2xl shadow-inner">
                  🎙️
                </div>
                <h3 className="text-base font-black tracking-tight text-zinc-955 mt-1 font-sans">Start a Live Space</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed font-sans">
                  Tap the microphone to start a live voice room. Speak with anyone nearby in real-time, or invite approved speakers to join the stage.
                </p>
              </div>
            )}

            {onboardingStep === 5 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-50 to-orange-100 border border-orange-200/40 flex items-center justify-center text-2xl shadow-inner">
                  📞
                </div>
                <h3 className="text-base font-black tracking-tight text-zinc-955 mt-1 font-sans">Wave & Voice Call</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed font-sans">
                  Tap any neighbor's icon on the map to wave at them (with a sound effect) or start a direct, free voice call!
                </p>
              </div>
            )}

            {onboardingStep === 6 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-50 to-teal-100 border border-teal-200/40 flex items-center justify-center text-2xl shadow-inner">
                  💬
                </div>
                <h3 className="text-base font-black tracking-tight text-zinc-955 mt-1 font-sans">Chats & Groups</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed font-sans">
                  Go here to manage your direct conversations, accept pending friend requests, or chat in group rooms for hotspots you've joined.
                </p>
              </div>
            )}

            {onboardingStep === 7 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-50 to-emerald-100 border border-emerald-200/40 flex items-center justify-center text-2xl shadow-inner">
                  👤
                </div>
                <h3 className="text-base font-black tracking-tight text-zinc-955 mt-1 font-sans">Your Profile</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed font-sans">
                  Go here to customize your username, select a custom avatar, add interests, and toggle sound or location preferences.
                </p>
              </div>
            )}

            {/* Footer controls */}
            <div className="flex justify-between items-center mt-3 pt-3.5 border-t border-zinc-100">
              <button
                onClick={handleSkipOnboarding}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer font-sans"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNextOnboarding}
                className="px-5 py-3 rounded-2xl bg-zinc-950 hover:bg-black text-white text-xs font-extrabold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1 shadow-md font-sans"
              >
                {onboardingStep === 7 ? "Go to Profile ➡️" : "Next Step"}
                {onboardingStep !== 7 && <ChevronRight size={13} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LiveMap() {
  return <LiveMapContent />;
}
