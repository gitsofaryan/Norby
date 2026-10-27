"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.FloatingControls = void 0;
var react_1 = require("react");
var MapProvider_1 = require("../MapProvider");
var useAuth_1 = require("@/hooks/useAuth");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
function FloatingControlsInner() {
    var isSignedIn = useAuth_1.useAuth().isSignedIn;
    var _a = MapProvider_1.useMapContext(), filteredUsers = _a.filteredUsers, socketReady = _a.socketReady, showNotifDropdown = _a.showNotifDropdown, setShowNotifDropdown = _a.setShowNotifDropdown, notifications = _a.notifications, setNotifications = _a.setNotifications, refreshRadar = _a.refreshRadar, setShowIntentModal = _a.setShowIntentModal, isBroadcastingAudio = _a.isBroadcastingAudio, isSpaceHost = _a.isSpaceHost, startBroadcast = _a.startBroadcast, stopBroadcast = _a.stopBroadcast, showSpaceDrawer = _a.showSpaceDrawer, setShowSpaceDrawer = _a.setShowSpaceDrawer;
    var handleRecenterClick = function () {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(12);
        }
        refreshRadar();
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "pointer-events-auto absolute top-[72px] left-4 z-[410]" },
            React.createElement("div", { "aria-label": filteredUsers.length + " people on the map", title: filteredUsers.length + " people on the map", className: "relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-[11px] font-extrabold text-zinc-900 shadow-sm backdrop-blur-sm" },
                React.createElement("span", { className: "absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full " + (socketReady ? "bg-emerald-500" : "bg-amber-400") }),
                filteredUsers.length)),
        React.createElement("div", { className: "pointer-events-auto absolute top-[72px] right-4 z-[9500]" },
            React.createElement("button", { onClick: function () { return setShowNotifDropdown(!showNotifDropdown); }, className: "relative w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full border border-zinc-200 shadow-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer" },
                React.createElement(lucide_react_1.Bell, { size: 18 }),
                notifications.some(function (n) { return !n.read; }) && (React.createElement("span", { className: "absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" }))),
            React.createElement(framer_motion_1.AnimatePresence, null, showNotifDropdown && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "fixed inset-0 z-[9501] bg-transparent cursor-default pointer-events-auto", onClick: function () { return setShowNotifDropdown(false); } }),
                React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 10, scale: 0.95 }, className: "absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden z-[9502]" },
                    React.createElement("div", { className: "px-4 py-3 border-b border-zinc-100 flex justify-between items-center" },
                        React.createElement("span", { className: "text-xs font-bold text-zinc-900 uppercase tracking-tight" }, "Recent Activity"),
                        React.createElement("button", { onClick: function () { return setNotifications(function (prev) { return prev.map(function (n) { return (__assign(__assign({}, n), { read: true })); }); }); }, className: "text-[10px] text-zinc-400 font-bold hover:text-zinc-900 cursor-pointer" }, "Clear")),
                    React.createElement("div", { className: "max-h-60 overflow-y-auto py-1" }, notifications.length === 0 ? (React.createElement("div", { className: "px-4 py-8 text-center" },
                        React.createElement("p", { className: "text-[11px] font-medium text-zinc-400" }, "No recent activity"))) : (notifications.map(function (n) { return (React.createElement("div", { key: n.id, className: "px-4 py-3 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0" },
                        React.createElement("p", { className: "text-[11px] font-medium text-zinc-800 leading-tight" }, n.text),
                        React.createElement("p", { className: "text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-tighter" }, new Date(n.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })))); })))))))),
        isSignedIn && (React.createElement("div", { className: "pointer-events-auto absolute top-[120px] right-4 z-[410] flex flex-col gap-2" },
            React.createElement("button", { id: "btn-mic", onClick: function () {
                    if (isBroadcastingAudio && isSpaceHost) {
                        stopBroadcast();
                        setShowSpaceDrawer(false);
                    }
                    else {
                        startBroadcast(true);
                        setShowSpaceDrawer(true);
                    }
                }, className: "relative w-9 h-9 flex items-center justify-center rounded-full shadow-sm transition-colors cursor-pointer border " + (isBroadcastingAudio && isSpaceHost
                    ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                    : "bg-white/95 backdrop-blur-sm text-zinc-600 hover:text-zinc-900 border-zinc-200"), title: isBroadcastingAudio && isSpaceHost ? "Stop Broadcast" : "Start Broadcast" }, isBroadcastingAudio && isSpaceHost ? (React.createElement(lucide_react_1.Mic, { size: 18 })) : (React.createElement(lucide_react_1.MicOff, { size: 18 }))),
            React.createElement(framer_motion_1.AnimatePresence, null, isBroadcastingAudio && isSpaceHost && (React.createElement(framer_motion_1.motion.button, { initial: { opacity: 0, scale: 0.8, y: -10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.8, y: -10 }, transition: { duration: 0.15 }, onClick: function () {
                    setShowSpaceDrawer(!showSpaceDrawer);
                }, className: "w-9 h-9 flex items-center justify-center rounded-full shadow-sm transition-colors cursor-pointer border " + (showSpaceDrawer
                    ? "bg-zinc-900 text-white border-zinc-800"
                    : "bg-white/95 backdrop-blur-sm text-zinc-600 hover:text-zinc-900 border-zinc-200"), title: showSpaceDrawer ? "Hide Space Drawer" : "Show Space Drawer" },
                React.createElement(lucide_react_1.Radio, { size: 16, className: showSpaceDrawer ? "animate-pulse" : "" })))))),
        React.createElement("div", { className: "pointer-events-auto absolute bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-[410] flex flex-col items-center gap-3 sm:right-5 sm:gap-4" },
            React.createElement("button", { id: "btn-recenter", onClick: handleRecenterClick, className: "w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-zinc-200 shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors active:scale-90 cursor-pointer", title: "Refresh Radar" },
                React.createElement(lucide_react_1.Compass, { size: 22, strokeWidth: 2.5 })),
            isSignedIn && (React.createElement(framer_motion_1.motion.button, { id: "btn-post-intent", whileTap: { scale: 0.88 }, onClick: function () { return setShowIntentModal(true); }, className: "w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-black transition-colors cursor-pointer" },
                React.createElement(lucide_react_1.Send, { className: "w-6 h-6", strokeWidth: 2 }))))));
}
exports.FloatingControls = react_1.memo(FloatingControlsInner);
