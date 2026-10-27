"use client";
"use strict";
exports.__esModule = true;
exports.UserDrawer = void 0;
var MapProvider_1 = require("../MapProvider");
var useAuth_1 = require("@/hooks/useAuth");
var useGeolocation_1 = require("@/hooks/useGeolocation");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var navigation_1 = require("next/navigation");
function UserDrawer() {
    var router = navigation_1.useRouter();
    var isSignedIn = useAuth_1.useAuth().isSignedIn;
    var _a = MapProvider_1.useMapContext(), location = _a.location, selectedUser = _a.selectedUser, setSelectedUser = _a.setSelectedUser, hasWaved = _a.hasWaved, confirmBlock = _a.confirmBlock, setConfirmBlock = _a.setConfirmBlock, handleWave = _a.handleWave, handleBlock = _a.handleBlock, setRoutingTarget = _a.setRoutingTarget, myUserId = _a.myUserId, incomingStreams = _a.incomingStreams, startListening = _a.startListening, stopListening = _a.stopListening, speakRequests = _a.speakRequests, activeSpeakers = _a.activeSpeakers, mySpeakStatus = _a.mySpeakStatus, isMutedByHost = _a.isMutedByHost, isLocalMicMuted = _a.isLocalMicMuted, requestToSpeak = _a.requestToSpeak, cancelSpeakRequest = _a.cancelSpeakRequest, toggleLocalMic = _a.toggleLocalMic, leaveSpace = _a.leaveSpace, initiateCall = _a.initiateCall, activeCallUserId = _a.activeCallUserId, callStatus = _a.callStatus;
    var _b = MapProvider_1.useSocialContext(), chatRequests = _b.chatRequests, sendChatRequest = _b.sendChatRequest;
    var setActiveChatUser = MapProvider_1.useDMContext().setActiveChatUser;
    var requestSent = selectedUser
        ? chatRequests.find(function (r) { return r.sender_id === myUserId && r.target_id === selectedUser.user_id; })
        : null;
    var requestReceived = selectedUser
        ? chatRequests.find(function (r) { return r.sender_id === selectedUser.user_id && r.target_id === myUserId; })
        : null;
    var isPendingSent = !!(requestSent && requestSent.status === "pending");
    var isPendingReceived = !!(requestReceived && requestReceived.status === "pending");
    var isConnected = !!((requestSent && requestSent.status === "accepted") ||
        (requestReceived && requestReceived.status === "accepted"));
    return (React.createElement(framer_motion_1.AnimatePresence, null, selectedUser && (React.createElement(React.Fragment, null,
        React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: function () { return setSelectedUser(null); }, className: "fixed inset-0 bg-black/10 z-[890] backdrop-blur-[1px]" }),
        React.createElement(framer_motion_1.motion.div, { initial: { x: "110%", opacity: 0.95 }, animate: { x: 0, opacity: 1 }, exit: { x: "110%", opacity: 0.95 }, transition: { type: "spring", stiffness: 350, damping: 35 }, className: "fixed right-3 top-20 bottom-20 z-[900] w-[min(360px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl" },
            React.createElement("div", { className: "h-full overflow-y-auto bg-white px-4 pb-5 pt-4 scrollbar-none space-y-4" },
                React.createElement("div", { className: "flex justify-between items-start gap-3 border-b border-zinc-100 pb-4" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "relative" },
                            selectedUser.isGhostMode ? (React.createElement("div", { className: "w-14 h-14 rounded-full border border-zinc-100 bg-zinc-100 flex items-center justify-center text-2xl" }, "\uD83D\uDC7B")) : (React.createElement("img", { src: selectedUser.avatar_url || useAuth_1.getAvatarUrl(selectedUser.username), className: "w-14 h-14 rounded-full object-cover border border-zinc-100 bg-zinc-50", alt: selectedUser.username })),
                            React.createElement("div", { className: "absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-sm shadow-sm" }, selectedUser.vibeEmoji || "🙂")),
                        React.createElement("div", null,
                            React.createElement("h3", { className: "text-base font-bold text-zinc-900 leading-tight" }, selectedUser.isGhostMode ? "Ghost User" : selectedUser.username),
                            React.createElement("p", { className: "text-[10px] text-zinc-400 font-semibold mt-0.5" }, selectedUser.isGhostMode ? "Information hidden" : (React.createElement(React.Fragment, null,
                                selectedUser.age ? selectedUser.age + " y/o" : "Age not shared",
                                " \u00B7 ",
                                selectedUser.gender || "Gender not shared"))),
                            React.createElement("p", { className: "text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-bold" },
                                React.createElement(lucide_react_1.MapPin, { size: 10, className: "text-zinc-400" }),
                                (function () {
                                    if (!location)
                                        return "Unknown distance";
                                    var dist = useGeolocation_1.getDistanceKm(location.lat, location.lng, selectedUser.lat, selectedUser.lng);
                                    return dist < 0.1 ? "Here" : dist.toFixed(1) + " km away";
                                })()))),
                    React.createElement("button", { onClick: function () { return setSelectedUser(null); }, className: "p-1.5 rounded-full bg-zinc-50 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" },
                        React.createElement(lucide_react_1.X, { size: 14 }))),
                React.createElement("div", { className: "space-y-1.5" },
                    React.createElement("h4", { className: "text-[10px] font-bold tracking-widest uppercase text-zinc-400" }, "Tagline"),
                    React.createElement("p", { className: "text-xs leading-relaxed font-medium bg-zinc-50 rounded-2xl p-4 border border-zinc-100 " + (selectedUser.isGhostMode ? 'text-zinc-400 italic' : 'text-zinc-700') }, selectedUser.isGhostMode ? "User is currently in Ghost Mode. 👻" : (selectedUser.bio || "No tagline set."))),
                !selectedUser.isGhostMode && selectedUser.projectDescription && (React.createElement("div", { className: "space-y-1.5" },
                    React.createElement("h4", { className: "text-[10px] font-bold tracking-widest uppercase text-zinc-400" }, "Building"),
                    React.createElement("p", { className: "rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-xs font-medium leading-relaxed text-zinc-700" }, selectedUser.projectDescription))),
                !selectedUser.isGhostMode && selectedUser.selectedTags && selectedUser.selectedTags.length > 0 && (React.createElement("div", { className: "space-y-2" },
                    React.createElement("h4", { className: "text-[10px] font-bold tracking-widest uppercase text-zinc-400" }, "Interests"),
                    React.createElement("div", { className: "flex flex-wrap gap-1.5" }, selectedUser.selectedTags.map(function (tag) { return (React.createElement("span", { key: tag, className: "px-3 py-1.5 bg-zinc-100 rounded-full text-[10px] font-semibold text-zinc-600" }, tag)); })))),
                !selectedUser.isGhostMode && selectedUser.openTo && selectedUser.openTo.length > 0 && (React.createElement("div", { className: "space-y-2" },
                    React.createElement("h4", { className: "text-[10px] font-bold tracking-widest uppercase text-zinc-400" }, "Open to"),
                    React.createElement("div", { className: "flex flex-wrap gap-1.5" }, selectedUser.openTo.map(function (option) { return (React.createElement("span", { key: option, className: "rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700" }, option)); })))),
                React.createElement("div", { className: "flex flex-col gap-3.5 pt-2" },
                    React.createElement("button", { onClick: function () {
                            if (typeof navigator !== "undefined" && navigator.vibrate) {
                                navigator.vibrate(10);
                            }
                            setRoutingTarget({
                                lat: selectedUser.lat,
                                lng: selectedUser.lng,
                                name: "@" + selectedUser.username
                            });
                            setSelectedUser(null);
                        }, className: "w-full py-3.5 rounded-2xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer" },
                        React.createElement(lucide_react_1.Navigation, { size: 13 }),
                        " Get Directions"),
                    isSignedIn && ((function () {
                        var isMe = selectedUser.user_id === myUserId;
                        if (isMe) {
                            return null;
                        }
                        if (selectedUser.is_broadcasting_audio) {
                            var isListening = !!incomingStreams[selectedUser.user_id];
                            return (React.createElement("div", { className: "bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-3.5" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1" },
                                        React.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }),
                                        "Live Audio Space \uD83C\uDF99\uFE0F")),
                                !isListening ? (React.createElement("button", { onClick: function () { return startListening(selectedUser.user_id); }, className: "w-full py-3.5 rounded-2xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-md" },
                                    React.createElement(lucide_react_1.Volume2, { size: 13 }),
                                    " Join Space as Listener \uD83C\uDFA7")) : (React.createElement("div", { className: "space-y-3" },
                                    React.createElement("div", { className: "flex gap-2" },
                                        React.createElement("button", { onClick: function () { return leaveSpace(selectedUser.user_id); }, className: "flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-sm" }, "Leave Space \uD83D\uDED1"),
                                        mySpeakStatus === "listener" && (React.createElement("button", { onClick: function () { return requestToSpeak(selectedUser.user_id); }, className: "flex-1 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-sm" },
                                            React.createElement(lucide_react_1.Mic, { size: 13 }),
                                            " Request to Speak")),
                                        mySpeakStatus === "requesting" && (React.createElement("button", { onClick: function () { return cancelSpeakRequest(selectedUser.user_id); }, className: "flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-sm animate-pulse" }, "Pending... (Cancel)"))),
                                    mySpeakStatus === "speaker" && (React.createElement("div", { className: "border-t border-zinc-200/60 pt-3 flex flex-col gap-2" },
                                        React.createElement("div", { className: "flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider" },
                                            React.createElement("span", null, "You are a Speaker"),
                                            isMutedByHost && React.createElement("span", { className: "text-rose-500 font-black" }, "Muted by Host")),
                                        React.createElement("button", { onClick: function () { return !isMutedByHost && toggleLocalMic(); }, disabled: isMutedByHost, className: "w-full py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 shadow-sm " + (isMutedByHost
                                                ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                                                : isLocalMicMuted
                                                    ? "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                                                    : "bg-zinc-900 border-zinc-900 text-white hover:bg-black") }, isMutedByHost ? (React.createElement(React.Fragment, null,
                                            React.createElement(lucide_react_1.MicOff, { size: 13 }),
                                            " Muted by Host")) : isLocalMicMuted ? (React.createElement(React.Fragment, null,
                                            React.createElement(lucide_react_1.MicOff, { size: 13 }),
                                            " Unmute Microphone")) : (React.createElement(React.Fragment, null,
                                            React.createElement(lucide_react_1.Mic, { size: 13 }),
                                            " Mute Microphone")))))))));
                        }
                        return null;
                    })()),
                    !selectedUser.isGhostMode && selectedUser.user_id !== myUserId && (React.createElement("button", { onClick: function () { return initiateCall(selectedUser.user_id); }, disabled: callStatus === "ringing" || callStatus === "connected" || activeCallUserId === selectedUser.user_id, className: "w-full py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm border " + (activeCallUserId === selectedUser.user_id || callStatus === "connected"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-not-allowed"
                            : callStatus === "ringing"
                                ? "bg-zinc-850 text-zinc-550 border-zinc-750 cursor-not-allowed"
                                : "bg-zinc-900 text-white border-zinc-900 hover:bg-black active:scale-[0.98] cursor-pointer") },
                        React.createElement(lucide_react_1.Mic, { size: 13 }),
                        activeCallUserId === selectedUser.user_id || callStatus === "connected"
                            ? "In Call"
                            : callStatus === "ringing"
                                ? "Calling..."
                                : "Audio Call")),
                    !selectedUser.isGhostMode && (function () {
                        if (isConnected) {
                            return (React.createElement("button", { onClick: function () {
                                    var friendDetails = {
                                        user_id: selectedUser.user_id,
                                        username: selectedUser.username,
                                        avatar_url: selectedUser.avatar_url,
                                        vibeEmoji: selectedUser.vibeEmoji
                                    };
                                    setActiveChatUser(friendDetails);
                                    setSelectedUser(null);
                                    router.push("/chat");
                                }, className: "w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-sm" }, "Open Chat \uD83D\uDCAC"));
                        }
                        else if (isPendingSent) {
                            return (React.createElement("button", { disabled: true, className: "w-full py-3.5 rounded-2xl bg-zinc-100 text-zinc-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed border border-zinc-200/50" }, "Request Pending... \u2709\uFE0F"));
                        }
                        else if (isPendingReceived) {
                            return (React.createElement("button", { onClick: function () {
                                    setSelectedUser(null);
                                    router.push("/chat");
                                }, className: "w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-sm" }, "Respond to Request \uD83D\uDCAC"));
                        }
                        else {
                            return (React.createElement("button", { onClick: function () {
                                    sendChatRequest(selectedUser.user_id);
                                }, className: "w-full py-3.5 rounded-2xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer" }, "Request to Chat \uD83D\uDCAC"));
                        }
                    })(),
                    !selectedUser.isGhostMode && (React.createElement("div", { className: "flex gap-3" },
                        React.createElement("button", { onClick: function () {
                                if (confirmBlock) {
                                    handleBlock(selectedUser.user_id);
                                }
                                else {
                                    setConfirmBlock(true);
                                }
                            }, className: "flex-1 py-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] " + (confirmBlock
                                ? "border-rose-600 bg-rose-600 text-white hover:bg-rose-700"
                                : "border-rose-200 hover:bg-rose-50 text-rose-600") }, confirmBlock ? "Confirm Block?" : "Block / Report"),
                        React.createElement("button", { onClick: handleWave, disabled: hasWaved, className: "flex-1 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 " + (hasWaved
                                ? "bg-emerald-500 text-white"
                                : "bg-zinc-900 text-white hover:bg-black active:scale-[0.98]") }, hasWaved ? "Waved! 👋" : "Wave 👋"))),
                    selectedUser.isGhostMode && (React.createElement("div", { className: "flex gap-3" },
                        React.createElement("button", { onClick: function () {
                                if (confirmBlock) {
                                    handleBlock(selectedUser.user_id);
                                }
                                else {
                                    setConfirmBlock(true);
                                }
                            }, className: "flex-1 py-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] " + (confirmBlock
                                ? "border-rose-600 bg-rose-600 text-white hover:bg-rose-700"
                                : "border-rose-200 hover:bg-rose-50 text-rose-600") }, confirmBlock ? "Confirm Block?" : "Block / Report"))))))))));
}
exports.UserDrawer = UserDrawer;
