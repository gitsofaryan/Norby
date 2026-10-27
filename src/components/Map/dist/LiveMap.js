"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var react_leaflet_1 = require("react-leaflet");
require("leaflet/dist/leaflet.css");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var navigation_1 = require("next/navigation");
var MapProvider_1 = require("./MapProvider");
var UserMarker_1 = require("./markers/UserMarker");
var HotspotMarker_1 = require("./markers/HotspotMarker");
var UserDrawer_1 = require("./drawers/UserDrawer");
var HotspotDrawer_1 = require("./drawers/HotspotDrawer");
var SpaceDrawer_1 = require("./drawers/SpaceDrawer");
var VibeFilterBar_1 = require("./overlays/VibeFilterBar");
var FloatingControls_1 = require("./overlays/FloatingControls");
var IntentModal_1 = require("./overlays/IntentModal");
var RouteHUD_1 = require("./overlays/RouteHUD");
var CallOverlay_1 = require("./CallOverlay");
var IncomingCallModal_1 = require("./overlays/IncomingCallModal");
var ActiveCallHUD_1 = require("./overlays/ActiveCallHUD");
// private MapController component to synchronize Leaflet instance states
function MapController(_a) {
    var lat = _a.lat, lng = _a.lng, trigger = _a.trigger, followUser = _a.followUser, setFollowUser = _a.setFollowUser, setZoom = _a.setZoom, setIsInteracting = _a.setIsInteracting, setBounds = _a.setBounds;
    var map = react_leaflet_1.useMap();
    react_1.useEffect(function () {
        window.leafletMap = map;
        return function () {
            delete window.leafletMap;
        };
    }, [map]);
    react_1.useEffect(function () {
        setZoom(map.getZoom());
        var onZoom = function () {
            setZoom(map.getZoom());
        };
        map.on("zoomend", onZoom);
        return function () {
            map.off("zoomend", onZoom);
        };
    }, [map, setZoom]);
    react_1.useEffect(function () {
        var onMoveStart = function () { return setIsInteracting(true); };
        var onMoveEnd = function () {
            setIsInteracting(false);
            setBounds(map.getBounds());
        };
        var onDragStart = function () {
            setFollowUser(false);
            setIsInteracting(true);
        };
        var onDragEnd = function () {
            setIsInteracting(false);
            setBounds(map.getBounds());
        };
        map.on("movestart", onMoveStart);
        map.on("moveend", onMoveEnd);
        map.on("dragstart", onDragStart);
        map.on("dragend", onDragEnd);
        return function () {
            map.off("movestart", onMoveStart);
            map.off("moveend", onMoveEnd);
            map.off("dragstart", onDragStart);
            map.off("dragend", onDragEnd);
        };
    }, [map, setFollowUser, setIsInteracting]);
    react_1.useEffect(function () {
        if (followUser) {
            map.panTo([lat, lng], { animate: true, duration: 0.5 });
            setTimeout(function () { return setBounds(map.getBounds()); }, 600);
        }
    }, [lat, lng, followUser, map, setBounds]);
    react_1.useEffect(function () {
        map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 0.8 });
        setTimeout(function () { return setBounds(map.getBounds()); }, 900);
    }, [trigger, map, lat, lng, setBounds]);
    return null;
}
var useOSM_1 = require("@/hooks/useOSM");
var OSMMarker_1 = require("./markers/OSMMarker");
function LiveMapContent() {
    var _a = MapProvider_1.useMapContext(), location = _a.location, zoom = _a.zoom, setZoom = _a.setZoom, recenterTrigger = _a.recenterTrigger, followUser = _a.followUser, setFollowUser = _a.setFollowUser, isInteracting = _a.isInteracting, setIsInteracting = _a.setIsInteracting, toasts = _a.toasts, filteredUsers = _a.filteredUsers, filteredHotspots = _a.filteredHotspots, activeRoute = _a.activeRoute, connectionFailed = _a.connectionFailed, myUserId = _a.myUserId, handle = _a.handle, myAvatarUrl = _a.myAvatarUrl, vibeEmoji = _a.vibeEmoji, profile = _a.profile, setSelectedUser = _a.setSelectedUser, activeUsers = _a.activeUsers;
    var _b = react_1.useState(null), onboardingStep = _b[0], setOnboardingStep = _b[1];
    var _c = react_1.useState(null), highlightRect = _c[0], setHighlightRect = _c[1];
    var router = navigation_1.useRouter();
    react_1.useEffect(function () {
        if (typeof window !== "undefined" && myUserId) {
            var completed = localStorage.getItem("norby_onboarding_completed") === "true";
            var restartTrigger = localStorage.getItem("norby_start_onboarding_tour") === "true";
            if (restartTrigger) {
                localStorage.removeItem("norby_start_onboarding_tour");
                setOnboardingStep(0);
            }
            else if (!completed) {
                setOnboardingStep(0);
            }
        }
    }, [myUserId]);
    react_1.useEffect(function () {
        var updatePosition = function () {
            if (onboardingStep === null || onboardingStep === 0 || onboardingStep === 5) {
                setHighlightRect(null);
                return;
            }
            var selectors = [
                "#vibe-filter-bar",
                "#btn-post-intent",
                "#btn-recenter",
                "#btn-mic",
                null,
                "#nav-chat",
                "#nav-profile"
            ];
            var selector = selectors[onboardingStep - 1];
            if (selector) {
                var el = document.querySelector(selector);
                if (el) {
                    var rect_1 = el.getBoundingClientRect();
                    setHighlightRect(function (prev) {
                        if (prev &&
                            prev.top === rect_1.top &&
                            prev.left === rect_1.left &&
                            prev.width === rect_1.width &&
                            prev.height === rect_1.height) {
                            return prev;
                        }
                        return {
                            top: rect_1.top,
                            left: rect_1.left,
                            width: rect_1.width,
                            height: rect_1.height
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
        var interval = setInterval(updatePosition, 400);
        var timer = setTimeout(updatePosition, 300);
        return function () {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition);
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [onboardingStep]);
    var handleNextOnboarding = function () {
        setOnboardingStep(function (prev) {
            if (prev === null)
                return null;
            if (prev >= 7) {
                localStorage.setItem("norby_onboarding_completed", "true");
                router.push("/profile");
                return null;
            }
            return prev + 1;
        });
    };
    var handleSkipOnboarding = function () {
        localStorage.setItem("norby_onboarding_completed", "true");
        setOnboardingStep(null);
        router.push("/profile");
    };
    var _d = react_1.useState(null), bounds = _d[0], setBoundsRaw = _d[1];
    var boundsTimerRef = react_1.useRef(null);
    var setBounds = react_1.useCallback(function (newBounds) {
        if (boundsTimerRef.current)
            clearTimeout(boundsTimerRef.current);
        boundsTimerRef.current = setTimeout(function () {
            setBoundsRaw(newBounds);
        }, 150);
    }, []);
    var osmPlaces = useOSM_1.useOSM(bounds, zoom);
    // Calculate dispersion of markers to prevent overlapping
    var dispersedMarkers = react_1.useMemo(function () {
        if (!location)
            return [];
        var list = [];
        var userHostingHotspot = function (userId) {
            return filteredHotspots.some(function (h) { return h.host_id === userId; });
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
                    bio: (profile === null || profile === void 0 ? void 0 : profile.bio) || "",
                    selectedTags: (profile === null || profile === void 0 ? void 0 : profile.selectedTags) || [],
                    gender: (profile === null || profile === void 0 ? void 0 : profile.gender) || "",
                    age: (profile === null || profile === void 0 ? void 0 : profile.age) || ""
                }
            });
        }
        filteredUsers.forEach(function (u, idx) {
            if (!userHostingHotspot(u.user_id)) {
                list.push({
                    key: "user-" + (u.user_id || idx),
                    type: "user",
                    originalLat: u.lat,
                    originalLng: u.lng,
                    lat: u.lat,
                    lng: u.lng,
                    raw: u
                });
            }
        });
        filteredHotspots.forEach(function (h) {
            list.push({
                key: "hotspot-" + h.id,
                type: "hotspot",
                originalLat: h.lat,
                originalLng: h.lng,
                lat: h.lat,
                lng: h.lng,
                raw: h
            });
        });
        // Grouping threshold (approx 10 meters)
        var GRID_SIZE = 0.00009;
        var groups = {};
        list.forEach(function (item) {
            var gridLat = Math.round(item.originalLat / GRID_SIZE);
            var gridLng = Math.round(item.originalLng / GRID_SIZE);
            var groupKey = gridLat + "_" + gridLng;
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });
        // Apply radial dispersion to overlaps
        Object.values(groups).forEach(function (group) {
            var N = group.length;
            if (N <= 1)
                return;
            var baseRadius = 0.00016; // base offset
            var zoomScale = Math.pow(2, 15 - zoom);
            var radius = baseRadius * Math.max(0.5, Math.min(2.0, zoomScale));
            group.forEach(function (item, index) {
                var angle = (2 * Math.PI * index) / N;
                var offsetLat = radius * Math.sin(angle);
                var cosLat = Math.cos((item.originalLat * Math.PI) / 180);
                var offsetLng = (radius * Math.cos(angle)) / (cosLat || 1);
                item.lat = item.originalLat + offsetLat;
                item.lng = item.originalLng + offsetLng;
            });
        });
        // Render culling: only render markers within viewport + buffer
        if (bounds && bounds.pad) {
            var paddedBounds_1 = bounds.pad(0.3); // 30% padding for smooth panning
            return list.filter(function (item) { return paddedBounds_1.contains([item.lat, item.lng]); });
        }
        return list;
    }, [filteredUsers, filteredHotspots, location === null || location === void 0 ? void 0 : location.lat, location === null || location === void 0 ? void 0 : location.lng, zoom, bounds]);
    var MAP_FALLBACK = { lat: 28.6139, lng: 77.209 }; // New Delhi fallback
    var activeLocation = location || MAP_FALLBACK;
    return (React.createElement("div", { className: "absolute inset-0" },
        React.createElement(framer_motion_1.AnimatePresence, null, connectionFailed && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "absolute top-4 left-4 right-4 z-[999] md:max-w-md md:mx-auto bg-amber-50/95 backdrop-blur-md border border-amber-200 rounded-2xl p-3.5 shadow-md flex items-center gap-3" },
            React.createElement("div", { className: "w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-800 font-bold" }, "\u26A0\uFE0F"),
            React.createElement("div", { className: "flex-1 min-w-0" },
                React.createElement("h4", { className: "text-xs font-bold text-amber-900 leading-tight" }, "Connection Issue"),
                React.createElement("p", { className: "text-[10px] text-amber-700/90 font-medium mt-0.5 leading-normal" }, "Reconnecting to live sync server. Check your internet connection."))))),
        React.createElement(react_leaflet_1.MapContainer, { center: [activeLocation.lat, activeLocation.lng], zoom: 15, style: { height: "100%", width: "100%" }, zoomControl: false },
            React.createElement(react_leaflet_1.TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }),
            React.createElement(MapController, { lat: activeLocation.lat, lng: activeLocation.lng, trigger: recenterTrigger, followUser: followUser, setFollowUser: setFollowUser, setZoom: setZoom, setIsInteracting: setIsInteracting, setBounds: setBounds }),
            dispersedMarkers.map(function (item) {
                if (item.type === "me" || item.type === "user") {
                    return React.createElement(UserMarker_1.UserMarker, { key: item.key, item: item });
                }
                else if (item.type === "hotspot") {
                    return React.createElement(HotspotMarker_1.HotspotMarker, { key: item.key, item: item });
                }
                return null;
            }),
            osmPlaces.map(function (place) { return (React.createElement(OSMMarker_1.OSMMarker, { key: place.id, place: place })); }),
            activeRoute && activeRoute.coordinates && (React.createElement(React.Fragment, null,
                React.createElement(react_leaflet_1.Polyline, { positions: activeRoute.coordinates, color: "#000000", weight: 10, opacity: 0.15 }),
                React.createElement(react_leaflet_1.Polyline, { positions: activeRoute.coordinates, color: "#f43f5e", weight: 6, opacity: 0.8 }),
                React.createElement(react_leaflet_1.Polyline, { positions: activeRoute.coordinates, color: "#ffffff", weight: 2.5, opacity: 0.95, dashArray: "6, 8" })))),
        React.createElement(framer_motion_1.AnimatePresence, null, !isInteracting && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 }, className: "pointer-events-none absolute inset-0 z-[400]" },
            React.createElement(VibeFilterBar_1.VibeFilterBar, null),
            React.createElement(FloatingControls_1.FloatingControls, null),
            React.createElement(RouteHUD_1.RouteHUD, null)))),
        React.createElement(IntentModal_1.IntentModal, { osmPlaces: osmPlaces }),
        React.createElement(HotspotDrawer_1.HotspotDrawer, null),
        React.createElement(UserDrawer_1.UserDrawer, null),
        React.createElement(SpaceDrawer_1.SpaceDrawer, null),
        React.createElement(CallOverlay_1.CallOverlay, null),
        React.createElement(IncomingCallModal_1.IncomingCallModal, null),
        React.createElement(ActiveCallHUD_1.ActiveCallHUD, null),
        React.createElement("div", { className: "fixed top-20 left-0 right-0 z-[99999] flex flex-col items-center gap-2 pointer-events-none px-4" },
            React.createElement(framer_motion_1.AnimatePresence, null, toasts.map(function (toast) { return (React.createElement(framer_motion_1.motion.div, { key: toast.id, initial: { y: -20, opacity: 0, scale: 0.9 }, animate: { y: 0, opacity: 1, scale: 1 }, exit: { y: -20, opacity: 0, scale: 0.9 }, className: "px-5 py-3 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 pointer-events-auto " + (toast.type === "wave" ? "bg-emerald-500 text-white" : toast.type === "request" ? "bg-black text-white" : "bg-white text-zinc-900 border border-zinc-200") }, toast.message)); }))),
        React.createElement(framer_motion_1.AnimatePresence, null, onboardingStep !== null && (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "fixed inset-0 z-[1180] bg-transparent pointer-events-auto cursor-default" }),
            React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[1190] bg-black/65 pointer-events-none", style: highlightRect
                    ? {
                        clipPath: "polygon(\n                        0% 0%, 0% 100%, \n                        " + highlightRect.left + "px 100%, \n                        " + highlightRect.left + "px " + highlightRect.top + "px, \n                        " + (highlightRect.left + highlightRect.width) + "px " + highlightRect.top + "px, \n                        " + (highlightRect.left + highlightRect.width) + "px " + (highlightRect.top + highlightRect.height) + "px, \n                        " + highlightRect.left + "px " + (highlightRect.top + highlightRect.height) + "px, \n                        " + highlightRect.left + "px 100%, \n                        100% 100%, 100% 0%\n                      )"
                    }
                    : undefined })))),
        React.createElement(framer_motion_1.AnimatePresence, null, onboardingStep !== null && highlightRect && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: {
                opacity: 1,
                scale: 1,
                boxShadow: [
                    "0 0 0 0 rgba(245,158,11,0.6)",
                    "0 0 0 10px rgba(245,158,11,0)",
                    "0 0 0 0 rgba(245,158,11,0.6)"
                ]
            }, exit: { opacity: 0 }, className: "fixed z-[1195] pointer-events-none border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] " + (onboardingStep === 3 || onboardingStep === 4 ? "rounded-full" : "rounded-2xl"), style: {
                top: highlightRect.top - 4,
                left: highlightRect.left - 4,
                width: highlightRect.width + 8,
                height: highlightRect.height + 8
            }, transition: {
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut"
            } }))),
        React.createElement(framer_motion_1.AnimatePresence, null, onboardingStep !== null && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 15 }, className: "fixed z-[1200] w-[calc(100%-32px)] max-w-sm bg-white/95 backdrop-blur-lg border border-zinc-200/80 shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-[32px] p-6 flex flex-col gap-4 text-zinc-900 select-none pointer-events-auto", style: highlightRect
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
                } },
            React.createElement("button", { onClick: handleSkipOnboarding, className: "absolute top-5 right-5 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer", title: "Skip onboarding" },
                React.createElement(lucide_react_1.X, { size: 13 })),
            React.createElement("div", { className: "flex justify-between items-center" },
                React.createElement("span", { className: "text-[9px] uppercase tracking-widest font-black text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full" }, "Norby Tour"),
                React.createElement("div", { className: "flex gap-1 items-center mr-6" }, [0, 1, 2, 3, 4, 5, 6, 7].map(function (s) { return (React.createElement("div", { key: s, className: "h-1.5 rounded-full transition-all duration-300 " + (onboardingStep === s ? "w-4 bg-amber-500" : "w-1 bg-zinc-200") })); }))),
            onboardingStep === 0 && (React.createElement("div", { className: "flex flex-col gap-2 mt-1" },
                React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-50 to-amber-100 border border-amber-200/40 flex items-center justify-center text-2xl shadow-inner" }, "\uD83D\uDC4B"),
                React.createElement("h3", { className: "text-base font-black tracking-tight text-zinc-950 mt-1 font-sans" }, "Welcome to Norby!"),
                React.createElement("p", { className: "text-xs text-zinc-500 font-medium leading-relaxed font-sans" }, "Norby connects you with people nearby in real-time. Drop a hotspot, broadcast your vibe, and chat with neighbors. Stop scrolling, start meeting!"),
                React.createElement("p", { className: "text-[11px] text-amber-600 bg-amber-50/50 border border-amber-200/40 rounded-2xl p-3 font-semibold leading-relaxed mt-1 font-sans" },
                    "\uD83D\uDD12 ",
                    React.createElement("strong", null, "Important:"),
                    " To unlock calling, voice spaces, and chat rooms, you need to sign in. We'll direct you to the Profile page at the end of this tour!"))),
            onboardingStep === 1 && (React.createElement("div", { className: "flex flex-col gap-2 mt-1" },
                React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-50 to-amber-100 border border-amber-200/40 flex items-center justify-center text-2xl shadow-inner" }, "\u2615"),
                React.createElement("h3", { className: "text-base font-black tracking-tight text-zinc-955 mt-1 font-sans" }, "Choose a Vibe"),
                React.createElement("p", { className: "text-xs text-zinc-500 font-medium leading-relaxed font-sans" }, "Tap these buttons to find people who want to do the same things as you\u2014like grab coffee, study, lift weights, or play games."))),
            onboardingStep === 2 && (React.createElement("div", { className: "flex flex-col gap-2 mt-1" },
                React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-50 to-rose-100 border border-rose-200/40 flex items-center justify-center text-2xl shadow-inner" }, "\uD83D\uDD25"),
                React.createElement("h3", { className: "text-base font-black tracking-tight text-zinc-955 mt-1 font-sans" }, "Host a Hangout"),
                React.createElement("p", { className: "text-xs text-zinc-500 font-medium leading-relaxed font-sans" }, "Tap this button to drop a \"Hotspot\" on the map. Say what you want to do (e.g. \"Study at Starbucks\") so others can request to join you!"))),
            onboardingStep === 3 && (React.createElement("div", { className: "flex flex-col gap-2 mt-1" },
                React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-blue-100 border border-blue-200/40 flex items-center justify-center text-2xl shadow-inner" }, "\uD83E\uDDED"),
                React.createElement("h3", { className: "text-base font-black tracking-tight text-zinc-955 mt-1 font-sans" }, "Recenter & Scan"),
                React.createElement("p", { className: "text-xs text-zinc-500 font-medium leading-relaxed font-sans" }, "Tap this compass button to scan for nearby neighbors and recenter the map on your current location."))),
            onboardingStep === 4 && (React.createElement("div", { className: "flex flex-col gap-2 mt-1" },
                React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-50 to-purple-100 border border-purple-200/40 flex items-center justify-center text-2xl shadow-inner" }, "\uD83C\uDF99\uFE0F"),
                React.createElement("h3", { className: "text-base font-black tracking-tight text-zinc-955 mt-1 font-sans" }, "Start a Live Space"),
                React.createElement("p", { className: "text-xs text-zinc-500 font-medium leading-relaxed font-sans" }, "Tap the microphone to start a live voice room. Speak with anyone nearby in real-time, or invite approved speakers to join the stage."))),
            onboardingStep === 5 && (React.createElement("div", { className: "flex flex-col gap-2 mt-1" },
                React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-50 to-orange-100 border border-orange-200/40 flex items-center justify-center text-2xl shadow-inner" }, "\uD83D\uDCDE"),
                React.createElement("h3", { className: "text-base font-black tracking-tight text-zinc-955 mt-1 font-sans" }, "Wave & Voice Call"),
                React.createElement("p", { className: "text-xs text-zinc-500 font-medium leading-relaxed font-sans" }, "Tap any neighbor's icon on the map to wave at them (with a sound effect) or start a direct, free voice call!"))),
            onboardingStep === 6 && (React.createElement("div", { className: "flex flex-col gap-2 mt-1" },
                React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-50 to-teal-100 border border-teal-200/40 flex items-center justify-center text-2xl shadow-inner" }, "\uD83D\uDCAC"),
                React.createElement("h3", { className: "text-base font-black tracking-tight text-zinc-955 mt-1 font-sans" }, "Chats & Groups"),
                React.createElement("p", { className: "text-xs text-zinc-500 font-medium leading-relaxed font-sans" }, "Go here to manage your direct conversations, accept pending friend requests, or chat in group rooms for hotspots you've joined."))),
            onboardingStep === 7 && (React.createElement("div", { className: "flex flex-col gap-2 mt-1" },
                React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-50 to-emerald-100 border border-emerald-200/40 flex items-center justify-center text-2xl shadow-inner" }, "\uD83D\uDC64"),
                React.createElement("h3", { className: "text-base font-black tracking-tight text-zinc-955 mt-1 font-sans" }, "Your Profile"),
                React.createElement("p", { className: "text-xs text-zinc-500 font-medium leading-relaxed font-sans" }, "Go here to customize your username, select a custom avatar, add interests, and toggle sound or location preferences."))),
            React.createElement("div", { className: "flex justify-between items-center mt-3 pt-3.5 border-t border-zinc-100" },
                React.createElement("button", { onClick: handleSkipOnboarding, className: "text-xs font-bold text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer font-sans" }, "Skip Tour"),
                React.createElement("button", { onClick: handleNextOnboarding, className: "px-5 py-3 rounded-2xl bg-zinc-950 hover:bg-black text-white text-xs font-extrabold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1 shadow-md font-sans" },
                    onboardingStep === 7 ? "Go to Profile ➡️" : "Next Step",
                    onboardingStep !== 7 && React.createElement(lucide_react_1.ChevronRight, { size: 13 }))))))));
}
function LiveMap() {
    return React.createElement(LiveMapContent, null);
}
exports["default"] = LiveMap;
