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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useMapContext = exports.MapProvider = void 0;
var react_1 = require("react");
var useAuth_1 = require("@/hooks/useAuth");
var useGeolocation_1 = require("@/hooks/useGeolocation");
var useSocket_1 = require("@/hooks/useSocket");
var useWebRTC_1 = require("@/hooks/useWebRTC");
var routing_1 = require("@/lib/routing");
var eventBus_1 = require("@/lib/eventBus");
var sounds_1 = require("@/lib/sounds");
var mapFilters_1 = require("@/lib/mapFilters");
var ChatProvider_1 = require("./ChatProvider");
var ChatProvider_2 = require("./ChatProvider");
__createBinding(exports, ChatProvider_2, "SocialContext");
__createBinding(exports, ChatProvider_2, "DMContext");
__createBinding(exports, ChatProvider_2, "useSocialContext");
__createBinding(exports, ChatProvider_2, "useDMContext");
__createBinding(exports, ChatProvider_2, "type");
__createBinding(exports, ChatProvider_2, "type");
var MapContext = react_1.createContext(undefined);
function MapProvider(_a) {
    var _this = this;
    var _b;
    var children = _a.children;
    var _c = useAuth_1.useAuth(), isSignedIn = _c.isSignedIn, user = _c.user, profile = _c.profile, blockUser = _c.blockUser;
    var _d = react_1.useState(null), anonDetails = _d[0], setAnonDetails = _d[1];
    react_1.useEffect(function () {
        if (typeof window !== "undefined") {
            var anonId = localStorage.getItem("norby_anon_id");
            var anonHandle = localStorage.getItem("norby_anon_handle");
            if (!anonId) {
                anonId = "anon_" + Math.random().toString(36).substring(2, 10);
                localStorage.setItem("norby_anon_id", anonId);
            }
            if (!anonHandle) {
                var adjs = ["Swift", "Silent", "Neon", "Stellar", "Lunar", "Cosmic", "Urban", "Phantom", "Retro", "Vapor", "Vibrant", "Crypto"];
                var nouns = ["Ghost", "Nomad", "Rider", "Shadow", "Seeker", "Drifter", "Pulse", "Volt", "Zenith", "Spark", "Wave", "Echo"];
                var adj = adjs[Math.floor(Math.random() * adjs.length)];
                var noun = nouns[Math.floor(Math.random() * nouns.length)];
                var num = Math.floor(100 + Math.random() * 900); // 100-999
                anonHandle = "" + adj + noun + "_" + num;
                localStorage.setItem("norby_anon_handle", anonHandle);
            }
            setAnonDetails({ id: anonId, handle: anonHandle });
        }
    }, []);
    var myUserId = (user === null || user === void 0 ? void 0 : user.id) || (user === null || user === void 0 ? void 0 : user.username) || (anonDetails === null || anonDetails === void 0 ? void 0 : anonDetails.id) ||
        "anon";
    var handle = (profile === null || profile === void 0 ? void 0 : profile.handle) || (user === null || user === void 0 ? void 0 : user.username) || (anonDetails === null || anonDetails === void 0 ? void 0 : anonDetails.handle) || "";
    var vibeEmoji = (profile === null || profile === void 0 ? void 0 : profile.vibeEmoji) || "☕";
    var myAvatarUrl = (profile === null || profile === void 0 ? void 0 : profile.avatar_url) || (user ? useAuth_1.getAvatarUrl(user.username) : useAuth_1.getAvatarUrl("anon"));
    var _e = react_1.useState(function () {
        if (typeof window !== "undefined") {
            try {
                return JSON.parse(localStorage.getItem("norby_local_blocks") || "[]");
            }
            catch (_a) {
                return [];
            }
        }
        return [];
    }), localBlocks = _e[0], setLocalBlocks = _e[1];
    // Sync with local storage events (for unblocking from profile page)
    react_1.useEffect(function () {
        var syncBlocks = function () {
            try {
                var local = JSON.parse(localStorage.getItem("norby_local_blocks") || "[]");
                setLocalBlocks(local);
            }
            catch (e) { }
        };
        window.addEventListener("storage", syncBlocks);
        return function () { return window.removeEventListener("storage", syncBlocks); };
    }, []);
    // UI state
    var _f = react_1.useState(15), zoom = _f[0], setZoom = _f[1];
    var _g = react_1.useState(0), recenterTrigger = _g[0], setRecenterTrigger = _g[1];
    var _h = react_1.useState(true), followUser = _h[0], setFollowUser = _h[1];
    var _j = react_1.useState(false), isInteracting = _j[0], setIsInteracting = _j[1];
    var _k = react_1.useState("all"), selectedFilter = _k[0], setSelectedFilter = _k[1];
    var _l = react_1.useState(false), isSpeakerMuted = _l[0], setIsSpeakerMuted = _l[1];
    var _m = react_1.useState(null), selectedUser = _m[0], setSelectedUser = _m[1];
    var _o = react_1.useState(null), selectedHotspot = _o[0], _setSelectedHotspot = _o[1];
    var _p = react_1.useState(false), showSpaceDrawer = _p[0], setShowSpaceDrawer = _p[1];
    var selectedHotspotRef = react_1.useRef(null);
    var setSelectedHotspot = function (val) {
        if (typeof val === "function") {
            var nextVal = val(selectedHotspotRef.current);
            selectedHotspotRef.current = nextVal;
            _setSelectedHotspot(nextVal);
        }
        else {
            selectedHotspotRef.current = val;
            _setSelectedHotspot(val);
        }
    };
    var _q = react_1.useState(false), showIntentModal = _q[0], setShowIntentModal = _q[1];
    var _r = react_1.useState(""), intentText = _r[0], setIntentText = _r[1];
    var _s = react_1.useState(15), customHotspotRange = _s[0], setCustomHotspotRange = _s[1];
    react_1.useEffect(function () {
        if (showIntentModal) {
            setCustomHotspotRange((profile === null || profile === void 0 ? void 0 : profile.hotspotRange) || 15);
        }
    }, [showIntentModal, profile === null || profile === void 0 ? void 0 : profile.hotspotRange]);
    var _t = react_1.useState(false), hasWaved = _t[0], setHasWaved = _t[1];
    var _u = react_1.useState(false), confirmBlock = _u[0], setConfirmBlock = _u[1];
    react_1.useEffect(function () {
        setHasWaved(false);
        setConfirmBlock(false);
    }, [selectedUser]);
    // Notifications and Toast streams
    var _v = react_1.useState([]), toasts = _v[0], setToasts = _v[1];
    var _w = react_1.useState([]), notifications = _w[0], setNotifications = _w[1];
    var _x = react_1.useState(false), showNotifDropdown = _x[0], setShowNotifDropdown = _x[1];
    var _y = react_1.useState([]), activeWaves = _y[0], setActiveWaves = _y[1];
    var addToast = react_1.useCallback(function (message, type) {
        if (type === void 0) { type = "default"; }
        var id = Math.random().toString(36).substring(2, 9);
        setToasts(function (prev) {
            var next = __spreadArrays(prev, [{ id: id, message: message, type: type }]);
            if (next.length > 3) {
                return next.slice(-3);
            }
            return next;
        });
        setTimeout(function () {
            setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id; }); });
        }, 4000);
    }, []);
    react_1.useEffect(function () {
        var interval = setInterval(function () {
            var now = Date.now();
            setActiveWaves(function (prev) { return prev.filter(function (w) { return w.expires_at > now; }); });
        }, 1000);
        return function () { return clearInterval(interval); };
    }, []);
    // Geolocation
    var maskLocation = (_b = profile === null || profile === void 0 ? void 0 : profile.maskLocation) !== null && _b !== void 0 ? _b : true;
    var _z = useGeolocation_1.useGeolocation(maskLocation), location = _z.location, locStatus = _z.status, isStasis = _z.isStasis, accuracy = _z.accuracy, accuracySource = _z.accuracySource, refreshLocation = _z.refreshLocation;
    // Sync lists from socket
    var _0 = react_1.useState([]), activeUsers = _0[0], setActiveUsers = _0[1];
    var _1 = react_1.useState([]), intents = _1[0], setIntents = _1[1];
    // Chat states have been moved to ChatProvider
    // 1-to-1 Calling state
    var _2 = react_1.useState(null), incomingCall = _2[0], setIncomingCall = _2[1];
    var _3 = react_1.useState(null), callStatus = _3[0], setCallStatus = _3[1];
    var _4 = react_1.useState(null), outgoingCallUserId = _4[0], setOutgoingCallUserId = _4[1];
    // Routing state
    var _5 = react_1.useState(null), activeRoute = _5[0], setActiveRoute = _5[1];
    var _6 = react_1.useState("foot"), activeRouteMode = _6[0], setActiveRouteMode = _6[1];
    var _7 = react_1.useState(null), routingTarget = _7[0], setRoutingTarget = _7[1];
    var _8 = react_1.useState(false), isLoadingRoute = _8[0], setIsLoadingRoute = _8[1];
    var clearActiveRoute = react_1.useCallback(function () {
        setActiveRoute(null);
        setRoutingTarget(null);
    }, []);
    var lastFetchedLocationRef = react_1.useRef(null);
    react_1.useEffect(function () {
        if (!location || !routingTarget) {
            setActiveRoute(null);
            lastFetchedLocationRef.current = null;
            return;
        }
        // Debounce location updates: only re-fetch route if user moved >50m (0.05km)
        if (lastFetchedLocationRef.current && activeRoute) {
            var movedDist = useGeolocation_1.getDistanceKm(location.lat, location.lng, lastFetchedLocationRef.current.lat, lastFetchedLocationRef.current.lng);
            if (movedDist < 0.05) {
                return;
            }
        }
        var active = true;
        setIsLoadingRoute(true);
        routing_1.fetchOSRMRoute(location.lat, location.lng, routingTarget.lat, routingTarget.lng, activeRouteMode)
            .then(function (data) {
            if (active) {
                setActiveRoute(data);
                lastFetchedLocationRef.current = { lat: location.lat, lng: location.lng };
                setIsLoadingRoute(false);
            }
        })["catch"](function (err) {
            console.error("[norby] Route fetch failed:", err);
            if (active) {
                setIsLoadingRoute(false);
                addToast("Failed to calculate route", "default");
            }
        });
        return function () {
            active = false;
        };
    }, [location === null || location === void 0 ? void 0 : location.lat, location === null || location === void 0 ? void 0 : location.lng, routingTarget, activeRouteMode]);
    // Sync selected user drawer with real-time active users updates
    var selectedUserRef = react_1.useRef(null);
    selectedUserRef.current = selectedUser;
    react_1.useEffect(function () {
        var current = selectedUserRef.current;
        if (!current)
            return;
        var latest = activeUsers.find(function (u) { return u.user_id === current.user_id; });
        if (latest) {
            if (latest.age !== current.age ||
                latest.gender !== current.gender ||
                latest.bio !== current.bio ||
                latest.vibeEmoji !== current.vibeEmoji ||
                latest.avatar_url !== current.avatar_url ||
                latest.username !== current.username ||
                JSON.stringify(latest.selectedTags) !== JSON.stringify(current.selectedTags)) {
                setSelectedUser(latest);
            }
        }
        else {
            setSelectedUser(null);
        }
    }, [activeUsers]);
    // Socket methods Ref to pass to WebRTC without circular dependency
    var socketMethodsRef = react_1.useRef(null);
    var webRTC = useWebRTC_1.useWebRTC({
        myUserId: myUserId,
        myUsername: handle,
        myAvatarUrl: myAvatarUrl,
        sendRtcOffer: function (target, offer) { var _a; return (_a = socketMethodsRef.current) === null || _a === void 0 ? void 0 : _a.sendRtcOffer(target, offer); },
        sendRtcAnswer: function (target, answer) { var _a; return (_a = socketMethodsRef.current) === null || _a === void 0 ? void 0 : _a.sendRtcAnswer(target, answer); },
        sendRtcIceCandidate: function (target, cand) { var _a; return (_a = socketMethodsRef.current) === null || _a === void 0 ? void 0 : _a.sendRtcIceCandidate(target, cand); }
    });
    react_1.useEffect(function () {
        if (webRTC.isBroadcastingAudio && webRTC.isSpaceHost) {
            setShowSpaceDrawer(true);
        }
        else {
            setShowSpaceDrawer(false);
        }
    }, [webRTC.isBroadcastingAudio, webRTC.isSpaceHost]);
    // Detect newly created hotspots nearby
    var prevIntentsRef = react_1.useRef([]);
    react_1.useEffect(function () {
        if (prevIntentsRef.current.length > 0 && intents.length > prevIntentsRef.current.length) {
            var prevIds_1 = new Set(prevIntentsRef.current.map(function (h) { return h.id; }));
            var newHotspots = intents.filter(function (h) { return !prevIds_1.has(h.id); });
            newHotspots.forEach(function (h) {
                if (h.host_id !== myUserId) {
                    sounds_1.playSound("broadcast");
                    addToast("\uD83D\uDD25 New hotspot \"" + h.title + "\" created nearby!", "default");
                    setNotifications(function (prev) { return __spreadArrays([
                        {
                            id: Math.random().toString(36).substring(7),
                            text: "\uD83D\uDD25 New hotspot \"" + h.title + "\" created nearby",
                            time: Date.now(),
                            read: false
                        }
                    ], prev).slice(0, 5); });
                }
            });
        }
        prevIntentsRef.current = intents;
    }, [intents, myUserId, addToast, setNotifications]);
    // Socket
    var socket = useSocket_1.useSocket({
        userId: myUserId,
        handle: handle,
        vibeEmoji: vibeEmoji,
        avatarUrl: myAvatarUrl,
        location: location,
        profile: profile,
        localBlocks: localBlocks,
        isBroadcastingAudio: webRTC.isBroadcastingAudio && webRTC.isSpaceHost,
        onSync: function (msg) {
            performance.mark("sync-start");
            var userMap = new Map();
            for (var _i = 0, _a = msg.users; _i < _a.length; _i++) {
                var u = _a[_i];
                if (u.user_id !== myUserId)
                    userMap.set(u.user_id, u);
            }
            setActiveUsers(Array.from(userMap.values()));
            setIntents(msg.hotspots || []);
            requestAnimationFrame(function () {
                if (typeof document !== 'undefined' && document.visibilityState !== 'visible')
                    return;
                performance.mark("sync-end");
                performance.measure("norby_client_sync_render_duration", "sync-start", "sync-end");
                var measures = performance.getEntriesByName("norby_client_sync_render_duration");
                var last = measures[measures.length - 1];
                // Ignore massive outliers and normal frame variation (flag only >100ms frame updates)
                if (last && last.duration > 100 && last.duration < 1000) {
                    // console.warn(`[norby metrics] Slow render detected: ${last.duration.toFixed(2)}ms for ${msg.users.length} users`);
                }
            });
        },
        onLocationUpdate: function (msg) {
            if (msg.data.user_id !== myUserId) {
                setActiveUsers(function (prev) {
                    var existingUser = prev.find(function (u) { return u.user_id === msg.data.user_id; });
                    var filtered = prev.filter(function (u) { return u.user_id !== msg.data.user_id; });
                    if (!existingUser) {
                        if (!msg.data.isGhostMode) {
                            sounds_1.playSound("nearby");
                            setNotifications(function (prevNotifs) {
                                return __spreadArrays([
                                    {
                                        id: Math.random().toString(36).substring(7),
                                        text: "@" + msg.data.username + " is now nearby",
                                        time: Date.now(),
                                        read: false
                                    }
                                ], prevNotifs).slice(0, 5);
                            });
                        }
                    }
                    else if (!existingUser.is_broadcasting_audio && msg.data.is_broadcasting_audio) {
                        var isFriend = true; // Everyone nearby who speaks triggers it
                        if (isFriend) {
                            sounds_1.playSound("broadcast");
                            addToast("\uD83C\uDF99\uFE0F @" + msg.data.username + " is speaking nearby!", "default");
                            setNotifications(function (prevNotifs) {
                                return __spreadArrays([
                                    {
                                        id: Math.random().toString(36).substring(7),
                                        text: "\uD83C\uDF99\uFE0F @" + msg.data.username + " started an audio broadcast",
                                        time: Date.now(),
                                        read: false
                                    }
                                ], prevNotifs).slice(0, 5);
                            });
                        }
                    }
                    return __spreadArrays(filtered, [msg.data]);
                });
            }
        },
        onHotspotsList: function (msg) {
            setIntents(msg.hotspots || []);
            if (selectedHotspotRef.current) {
                var updated = msg.hotspots.find(function (h) { var _a; return h.id === ((_a = selectedHotspotRef.current) === null || _a === void 0 ? void 0 : _a.id); });
                if (updated) {
                    setSelectedHotspot(updated);
                }
                else {
                    setSelectedHotspot(null);
                }
            }
        },
        onHotspotCreated: function (msg) {
            setSelectedHotspot(msg.hotspot);
        },
        onJoinRequestReceived: function (msg) {
            sounds_1.playSound("pop");
            setNotifications(function (prev) {
                return __spreadArrays([
                    {
                        id: Math.random().toString(36).substring(7),
                        text: "@" + msg.username + " wants to join your hotspot",
                        time: Date.now(),
                        read: false
                    }
                ], prev).slice(0, 5);
            });
            if (selectedHotspotRef.current && selectedHotspotRef.current.id === msg.roomId) {
                setSelectedHotspot(msg.hotspot);
            }
        },
        onJoinResponse: function (msg) {
            var isAccepted = msg.status === "accepted";
            sounds_1.playSound(isAccepted ? "success" : "error");
            addToast(isAccepted
                ? "\u2705 Your request to join hotspot was accepted!"
                : "\u274C Your request to join hotspot was declined.", "default");
            setNotifications(function (prev) { return __spreadArrays([
                {
                    id: Math.random().toString(36).substring(7),
                    text: isAccepted
                        ? "\u2705 Request to join hotspot accepted"
                        : "\u274C Request to join hotspot declined",
                    time: Date.now(),
                    read: false
                }
            ], prev).slice(0, 5); });
            if (selectedHotspotRef.current && selectedHotspotRef.current.id === msg.roomId) {
                setSelectedHotspot(msg.hotspot);
            }
        },
        onRoomSync: function (msg) {
            if (selectedHotspotRef.current && selectedHotspotRef.current.id === msg.roomId) {
                setSelectedHotspot(msg.hotspot);
            }
        },
        onNewMessage: function (msg) {
            if (selectedHotspotRef.current && selectedHotspotRef.current.id === msg.roomId) {
                setSelectedHotspot(function (prev) {
                    if (!prev)
                        return null;
                    // Filter out matching offline optimistic message from log
                    var rawMsgs = prev.messages.filter(function (m) { return !m.id.startsWith("msg_offline_") || m.text !== msg.message.text; });
                    if (rawMsgs.some(function (m) { return m.id === msg.message.id; }))
                        return prev;
                    return __assign(__assign({}, prev), { messages: __spreadArrays(rawMsgs, [msg.message]) });
                });
                sounds_1.playSound("click");
            }
        },
        onWaveReceived: function (msg) {
            sounds_1.playSound("wave");
            addToast("\uD83D\uDC4B " + msg.sender_username + " waved at you!", "wave");
            setNotifications(function (prev) {
                return __spreadArrays([
                    {
                        id: Math.random().toString(36).substring(7),
                        text: "@" + msg.sender_username + " waved at you!",
                        time: Date.now(),
                        read: false
                    }
                ], prev).slice(0, 5);
            });
            setActiveWaves(function (prev) { return __spreadArrays(prev.filter(function (w) { return w.sender_id !== msg.sender_id; }), [
                { sender_id: msg.sender_id, expires_at: Date.now() + 10000 },
            ]); });
        },
        onUserDisconnected: function (msg) {
            setActiveUsers(function (prev) { return prev.filter(function (u) { return u.user_id !== msg.user_id; }); });
        },
        onChatRequestReceived: function (msg) {
            sounds_1.playSound("pop");
            eventBus_1.globalEventBus.emit("chat:chat_request", msg);
        },
        onChatRequestResponded: function (msg) { return eventBus_1.globalEventBus.emit("chat:chat_respond", msg); },
        onNewDirectMessage: function (msg) {
            sounds_1.playSound("click");
            eventBus_1.globalEventBus.emit("chat:new_dm", msg);
        },
        onDMHistory: function (msg) { },
        onTypingIndicator: function (msg) { return eventBus_1.globalEventBus.emit("chat:typing_indicator", msg); },
        onChatsList: function (msg) { return eventBus_1.globalEventBus.emit("chat:chats_list", msg); },
        onRtcOffer: webRTC.handleRtcOffer,
        onRtcAnswer: webRTC.handleRtcAnswer,
        onRtcIceCandidate: webRTC.handleRtcIceCandidate,
        onCallRequest: function (msg) {
            var _a;
            if (webRTC.activeCallUserId || webRTC.isBroadcastingAudio || (profile === null || profile === void 0 ? void 0 : profile.isGhostMode)) {
                (_a = socketMethodsRef.current) === null || _a === void 0 ? void 0 : _a.respondCallRequest(msg.caller_id, myUserId, "rejected");
                return;
            }
            setIncomingCall({
                caller_id: msg.caller_id,
                caller_username: msg.caller_username,
                caller_avatar: msg.caller_avatar
            });
            sounds_1.playSound("ring");
            addToast("Incoming call from @" + msg.caller_username, "default");
            setNotifications(function (prev) { return __spreadArrays([
                {
                    id: Math.random().toString(36).substring(7),
                    text: "\uD83D\uDCDE Incoming call from @" + msg.caller_username,
                    time: Date.now(),
                    read: false
                }
            ], prev).slice(0, 5); });
        },
        onCallResponse: function (msg) {
            var isAccepted = msg.status === "accepted";
            var otherInfo = activeUsers.find(function (u) { return u.user_id === msg.responder_id; });
            var otherHandle = (otherInfo === null || otherInfo === void 0 ? void 0 : otherInfo.username) || "user";
            setNotifications(function (prev) { return __spreadArrays([
                {
                    id: Math.random().toString(36).substring(7),
                    text: isAccepted
                        ? "\uD83D\uDCDE Call with @" + otherHandle + " connected"
                        : "\uD83D\uDCDE Call request to @" + otherHandle + " rejected",
                    time: Date.now(),
                    read: false
                }
            ], prev).slice(0, 5); });
            if (isAccepted) {
                sounds_1.playSound("connect");
                setCallStatus("connected");
                webRTC.startCall(msg.responder_id);
            }
            else {
                sounds_1.playSound("error");
                setOutgoingCallUserId(null);
                setCallStatus(null);
                addToast("Call rejected or user busy", "default");
            }
        },
        onCallEnd: function (msg) {
            setNotifications(function (prev) { return __spreadArrays([
                {
                    id: Math.random().toString(36).substring(7),
                    text: "\uD83D\uDCDE Call ended",
                    time: Date.now(),
                    read: false
                }
            ], prev).slice(0, 5); });
            setIncomingCall(null);
            setOutgoingCallUserId(null);
            setCallStatus(null);
            webRTC.endCall(msg.sender_id || msg.target_user_id || msg.caller_id);
            addToast("Call ended", "default");
        }
    });
    react_1.useEffect(function () {
        socketMethodsRef.current = socket;
    }, [socket]);
    // Action methods
    var handleWave = react_1.useCallback(function () {
        if (!selectedUser)
            return;
        setHasWaved(true);
        sounds_1.playSound("wave");
        addToast("You waved at " + selectedUser.username);
        socket.sendWave(selectedUser.user_id);
    }, [selectedUser, addToast, socket]);
    var handleBlock = react_1.useCallback(function (userId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, blockUser(userId)];
                case 1:
                    _a.sent();
                    setLocalBlocks(function (prev) {
                        var newBlocks = __spreadArrays(prev, [userId]);
                        localStorage.setItem("norby_local_blocks", JSON.stringify(newBlocks));
                        return newBlocks;
                    });
                    setSelectedUser(null);
                    return [2 /*return*/];
            }
        });
    }); }, [blockUser]);
    var postIntent = react_1.useCallback(function (osmPlace) {
        if (!intentText.trim())
            return;
        sounds_1.playSound("success");
        socket.createHotspot(intentText, customHotspotRange, osmPlace);
        setIntentText("");
        setShowIntentModal(false);
    }, [intentText, customHotspotRange, socket]);
    var requestJoin = react_1.useCallback(function (roomId) {
        var _a;
        var id = typeof roomId === "string" ? roomId : (_a = selectedHotspotRef.current) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return;
        socket.requestJoin(id);
    }, [socket]);
    var respondRequest = react_1.useCallback(function (guestId, status) {
        if (!selectedHotspotRef.current)
            return;
        socket.respondRequest(selectedHotspotRef.current.id, guestId, status);
    }, [socket]);
    var sendMessage = react_1.useCallback(function (text) {
        if (!selectedHotspotRef.current)
            return;
        socket.sendMessage(selectedHotspotRef.current.id, text, function (optimisticMsg) {
            setSelectedHotspot(function (prev) {
                if (!prev)
                    return null;
                return __assign(__assign({}, prev), { messages: __spreadArrays(prev.messages, [optimisticMsg]) });
            });
            addToast("Offline: Message queued.", "default");
        });
    }, [socket, addToast]);
    var leaveHotspot = react_1.useCallback(function (roomId) {
        var _a, _b;
        var id = roomId || ((_a = selectedHotspotRef.current) === null || _a === void 0 ? void 0 : _a.id);
        if (!id)
            return;
        socket.leaveHotspot(id);
        if (((_b = selectedHotspotRef.current) === null || _b === void 0 ? void 0 : _b.id) === id) {
            setSelectedHotspot(null);
        }
    }, [socket]);
    var initiateCall = react_1.useCallback(function (targetUserId) {
        if (webRTC.isBroadcastingAudio) {
            addToast("You cannot make a 1-to-1 call while in a Space.", "default");
            return;
        }
        setCallStatus("ringing");
        setOutgoingCallUserId(targetUserId);
        socket.sendCallRequest(targetUserId);
    }, [socket, webRTC, addToast]);
    var acceptCall = react_1.useCallback(function () {
        if (!incomingCall)
            return;
        setCallStatus("connected");
        setOutgoingCallUserId(incomingCall.caller_id);
        socket.respondCallRequest(incomingCall.caller_id, myUserId, "accepted");
        setNotifications(function (prev) { return __spreadArrays([
            {
                id: Math.random().toString(36).substring(7),
                text: "\uD83D\uDCDE Call with @" + incomingCall.caller_username + " connected",
                time: Date.now(),
                read: false
            }
        ], prev).slice(0, 5); });
        setIncomingCall(null);
    }, [incomingCall, socket, myUserId]);
    var rejectCall = react_1.useCallback(function () {
        if (!incomingCall)
            return;
        socket.respondCallRequest(incomingCall.caller_id, myUserId, "rejected");
        setIncomingCall(null);
        setOutgoingCallUserId(null);
        setCallStatus(null);
    }, [incomingCall, socket, myUserId]);
    var hangUp = react_1.useCallback(function () {
        var target = webRTC.activeCallUserId || outgoingCallUserId || (incomingCall === null || incomingCall === void 0 ? void 0 : incomingCall.caller_id);
        if (target) {
            socket.sendCallEnd(target);
            webRTC.endCall(target);
        }
        setIncomingCall(null);
        setOutgoingCallUserId(null);
        setCallStatus(null);
    }, [socket, webRTC, outgoingCallUserId, incomingCall]);
    // Call Timeout Refs to avoid dependency-triggered resets.
    // Updated synchronously in render body to guarantee the latest closure is always available.
    var hangUpRef = react_1.useRef(hangUp);
    var rejectCallRef = react_1.useRef(rejectCall);
    hangUpRef.current = hangUp;
    rejectCallRef.current = rejectCall;
    // Track outgoing/incoming calls in refs for logging purposes
    var outgoingCallUserIdRef = react_1.useRef(outgoingCallUserId);
    outgoingCallUserIdRef.current = outgoingCallUserId;
    var incomingCallRef = react_1.useRef(incomingCall);
    incomingCallRef.current = incomingCall;
    // Log state updates to help diagnose any unexpected state resets
    react_1.useEffect(function () {
        console.log("[MapProvider Call State] Updated - callStatus:", callStatus, "incomingCall:", incomingCall, "outgoingCallUserId:", outgoingCallUserId);
    }, [callStatus, incomingCall, outgoingCallUserId]);
    // Outgoing call timeout (unanswered calls cut after 30 seconds)
    react_1.useEffect(function () {
        var timeout;
        if (callStatus === "ringing") {
            var targetId = outgoingCallUserIdRef.current;
            console.log("[call_timeout] Setting outgoing call timeout for 30 seconds targeting: " + targetId);
            timeout = setTimeout(function () {
                console.log("[call_timeout] Outgoing call timeout fired! Closing unanswered call to target: " + outgoingCallUserIdRef.current);
                addToast("Call unanswered", "default");
                hangUpRef.current();
            }, 30000);
        }
        return function () {
            if (timeout) {
                console.log("[call_timeout] Clearing outgoing call timeout");
                clearTimeout(timeout);
            }
        };
    }, [callStatus, addToast]);
    // Incoming call timeout (missed calls cut after 30 seconds)
    react_1.useEffect(function () {
        var timeout;
        if (incomingCall) {
            var callerId = incomingCall.caller_id;
            console.log("[call_timeout] Setting incoming call timeout for 30 seconds from caller: " + callerId);
            timeout = setTimeout(function () {
                var _a;
                console.log("[call_timeout] Incoming call timeout fired! Rejecting missed call from caller: " + ((_a = incomingCallRef.current) === null || _a === void 0 ? void 0 : _a.caller_id));
                addToast("Call missed", "default");
                rejectCallRef.current();
            }, 30000);
        }
        return function () {
            if (timeout) {
                console.log("[call_timeout] Clearing incoming call timeout");
                clearTimeout(timeout);
            }
        };
    }, [incomingCall === null || incomingCall === void 0 ? void 0 : incomingCall.caller_id, addToast]);
    // Deprecated - history loaded directly in main effect from localStorage
    // Chat action methods have been moved to ChatProvider
    var refreshRadar = react_1.useCallback(function () {
        setFollowUser(true);
        setRecenterTrigger(function (t) { return t + 1; });
        socket.requestSync();
        refreshLocation().then(function () {
            socket.requestSync();
        });
    }, [refreshLocation, socket]);
    function matchesFilter(intent, key) {
        var searchableFields = __spreadArrays([
            intent.title,
            intent.description,
            intent.category,
            intent.activity
        ], (Array.isArray(intent.host_tags) ? intent.host_tags : []), (Array.isArray(intent.tags) ? intent.tags : []));
        return mapFilters_1.matchesMapFilterText(searchableFields.filter(Boolean).join(" "), key);
    }
    function matchesUserFilter(u, key) {
        if (key === "all")
            return true;
        var keywords = mapFilters_1.MAP_FILTER_KEYWORDS[key];
        if (!keywords)
            return true;
        // Match by vibe emoji
        var userVibe = u.vibeEmoji || "";
        if (keywords.includes(userVibe))
            return true;
        // Match by bio or tags
        var bio = (u.bio || "").toLowerCase();
        var tags = u.selectedTags || [];
        if (mapFilters_1.matchesMapFilterText(bio, key))
            return true;
        if (tags.some(function (tag) { return mapFilters_1.matchesMapFilterText(tag, key); }))
            return true;
        return false;
    }
    // Filter lists based on user settings and ranges
    var radarRadius = (profile === null || profile === void 0 ? void 0 : profile.radarRange) || 15;
    var filteredUsers = react_1.useMemo(function () {
        var blockedIds = __spreadArrays(((profile === null || profile === void 0 ? void 0 : profile.blockedUsers) || []), localBlocks);
        if (!location)
            return [];
        return activeUsers.filter(function (u) {
            var isBlocked = blockedIds.includes(u.user_id) || (u.blockedUsers || []).includes(myUserId);
            var isWithinRange = useGeolocation_1.getDistanceKm(location.lat, location.lng, u.lat, u.lng) <= radarRadius;
            var isMatchesFilter = matchesUserFilter(u, selectedFilter);
            return !isBlocked && isWithinRange && isMatchesFilter;
        });
    }, [activeUsers, profile === null || profile === void 0 ? void 0 : profile.blockedUsers, localBlocks, location, radarRadius, selectedFilter, myUserId]);
    var filteredHotspots = react_1.useMemo(function () {
        var blockedIds = __spreadArrays(((profile === null || profile === void 0 ? void 0 : profile.blockedUsers) || []), localBlocks);
        if (!location)
            return [];
        return intents.filter(function (h) {
            var isBlocked = blockedIds.includes(h.host_id);
            var dist = useGeolocation_1.getDistanceKm(location.lat, location.lng, h.lat, h.lng);
            var isWithinRange = dist <= radarRadius;
            var isNotExpired = h.expires_at > Date.now();
            var isMatchesFilter = matchesFilter(h, selectedFilter);
            return !isBlocked && isWithinRange && isNotExpired && isMatchesFilter;
        });
    }, [intents, profile === null || profile === void 0 ? void 0 : profile.blockedUsers, localBlocks, location, radarRadius, selectedFilter]);
    var mapValue = react_1.useMemo(function () { return ({
        myUserId: myUserId,
        handle: handle,
        vibeEmoji: vibeEmoji,
        myAvatarUrl: myAvatarUrl,
        localBlocks: localBlocks,
        location: location,
        locStatus: locStatus,
        isStasis: isStasis,
        accuracy: accuracy,
        accuracySource: accuracySource,
        refreshRadar: refreshRadar,
        socketReady: socket.socketReady,
        connectionState: socket.connectionState,
        offlineMessages: socket.offlineMessages,
        connectionFailed: socket.connectionFailed,
        zoom: zoom,
        setZoom: setZoom,
        recenterTrigger: recenterTrigger,
        followUser: followUser,
        setFollowUser: setFollowUser,
        isInteracting: isInteracting,
        setIsInteracting: setIsInteracting,
        selectedFilter: selectedFilter,
        setSelectedFilter: setSelectedFilter,
        selectedUser: selectedUser,
        setSelectedUser: setSelectedUser,
        selectedHotspot: selectedHotspot,
        setSelectedHotspot: setSelectedHotspot,
        showIntentModal: showIntentModal,
        setShowIntentModal: setShowIntentModal,
        intentText: intentText,
        setIntentText: setIntentText,
        customHotspotRange: customHotspotRange,
        setCustomHotspotRange: setCustomHotspotRange,
        hasWaved: hasWaved,
        setHasWaved: setHasWaved,
        confirmBlock: confirmBlock,
        setConfirmBlock: setConfirmBlock,
        toasts: toasts,
        addToast: addToast,
        notifications: notifications,
        setNotifications: setNotifications,
        showNotifDropdown: showNotifDropdown,
        setShowNotifDropdown: setShowNotifDropdown,
        activeWaves: activeWaves,
        handleWave: handleWave,
        handleBlock: handleBlock,
        postIntent: postIntent,
        requestJoin: requestJoin,
        respondRequest: respondRequest,
        sendMessage: sendMessage,
        leaveHotspot: leaveHotspot,
        incomingCall: incomingCall,
        callStatus: callStatus,
        activeCallUserId: webRTC.activeCallUserId,
        initiateCall: initiateCall,
        acceptCall: acceptCall,
        rejectCall: rejectCall,
        hangUp: hangUp,
        isBroadcastingAudio: webRTC.isBroadcastingAudio,
        isSpaceHost: webRTC.isSpaceHost,
        startBroadcast: webRTC.startBroadcast,
        stopBroadcast: webRTC.stopBroadcast,
        startListening: webRTC.startListening,
        stopListening: webRTC.stopListening,
        incomingStreams: webRTC.incomingStreams,
        isSpeakerMuted: isSpeakerMuted,
        setIsSpeakerMuted: setIsSpeakerMuted,
        speakRequests: webRTC.speakRequests,
        activeSpeakers: webRTC.activeSpeakers,
        activeListeners: webRTC.activeListeners,
        mySpeakStatus: webRTC.mySpeakStatus,
        isMutedByHost: webRTC.isMutedByHost,
        isLocalMicMuted: webRTC.isLocalMicMuted,
        requestToSpeak: webRTC.requestToSpeak,
        cancelSpeakRequest: webRTC.cancelSpeakRequest,
        approveSpeaker: webRTC.approveSpeaker,
        declineSpeaker: webRTC.declineSpeaker,
        muteSpeaker: webRTC.muteSpeaker,
        unmuteSpeaker: webRTC.unmuteSpeaker,
        removeSpeaker: webRTC.removeSpeaker,
        toggleLocalMic: webRTC.toggleLocalMic,
        leaveSpace: webRTC.leaveSpace,
        showSpaceDrawer: showSpaceDrawer,
        setShowSpaceDrawer: setShowSpaceDrawer,
        profile: profile,
        filteredUsers: filteredUsers,
        filteredHotspots: filteredHotspots,
        activeUsers: activeUsers,
        activeRoute: activeRoute,
        activeRouteMode: activeRouteMode,
        setActiveRouteMode: setActiveRouteMode,
        routingTarget: routingTarget,
        setRoutingTarget: setRoutingTarget,
        isLoadingRoute: isLoadingRoute,
        clearActiveRoute: clearActiveRoute
    }); }, [
        myUserId,
        handle,
        vibeEmoji,
        myAvatarUrl,
        localBlocks,
        location,
        locStatus,
        isStasis,
        accuracy,
        accuracySource,
        socket.socketReady,
        socket.connectionState,
        socket.offlineMessages,
        socket.connectionFailed,
        zoom,
        recenterTrigger,
        followUser,
        isInteracting,
        selectedFilter,
        selectedUser,
        selectedHotspot,
        showIntentModal,
        intentText,
        customHotspotRange,
        hasWaved,
        confirmBlock,
        toasts,
        notifications,
        showNotifDropdown,
        activeWaves,
        webRTC.isBroadcastingAudio,
        webRTC.activeCallUserId,
        incomingCall,
        callStatus,
        webRTC.isSpaceHost,
        webRTC.incomingStreams,
        isSpeakerMuted,
        webRTC.speakRequests,
        webRTC.activeSpeakers,
        webRTC.activeListeners,
        webRTC.mySpeakStatus,
        webRTC.isMutedByHost,
        webRTC.isLocalMicMuted,
        showSpaceDrawer,
        profile,
        filteredUsers,
        filteredHotspots,
        activeUsers,
        activeRoute,
        activeRouteMode,
        routingTarget,
        isLoadingRoute,
        refreshRadar,
        setZoom,
        setFollowUser,
        setIsInteracting,
        setSelectedFilter,
        setSelectedUser,
        setSelectedHotspot,
        setShowIntentModal,
        setIntentText,
        setCustomHotspotRange,
        setHasWaved,
        setConfirmBlock,
        addToast,
        setNotifications,
        setShowNotifDropdown,
        handleWave,
        handleBlock,
        postIntent,
        requestJoin,
        respondRequest,
        sendMessage,
        leaveHotspot,
        initiateCall,
        acceptCall,
        rejectCall,
        hangUp,
        webRTC.startBroadcast,
        webRTC.stopBroadcast,
        webRTC.startListening,
        webRTC.stopListening,
        setIsSpeakerMuted,
        webRTC.requestToSpeak,
        webRTC.cancelSpeakRequest,
        webRTC.approveSpeaker,
        webRTC.declineSpeaker,
        webRTC.muteSpeaker,
        webRTC.unmuteSpeaker,
        webRTC.removeSpeaker,
        webRTC.toggleLocalMic,
        webRTC.leaveSpace,
        setShowSpaceDrawer,
        clearActiveRoute,
        setActiveRouteMode,
        setRoutingTarget,
    ]);
    return (React.createElement(MapContext.Provider, { value: mapValue },
        React.createElement(ChatProvider_1.ChatProvider, { socket: socket, myUserId: myUserId, handle: handle, myAvatarUrl: myAvatarUrl, addToast: addToast, setNotifications: setNotifications, activeUsers: activeUsers, isSignedIn: isSignedIn, location: location, filteredHotspots: filteredHotspots }, children)));
}
exports.MapProvider = MapProvider;
function useMapContext() {
    var context = react_1.useContext(MapContext);
    if (!context) {
        throw new Error("useMapContext must be used within a MapProvider");
    }
    return context;
}
exports.useMapContext = useMapContext;
