"use client";
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useSocket = void 0;
var react_1 = require("react");
function useSocket(_a) {
    var userId = _a.userId, handle = _a.handle, vibeEmoji = _a.vibeEmoji, avatarUrl = _a.avatarUrl, location = _a.location, profile = _a.profile, localBlocks = _a.localBlocks, isBroadcastingAudio = _a.isBroadcastingAudio, onSync = _a.onSync, onLocationUpdate = _a.onLocationUpdate, onHotspotsList = _a.onHotspotsList, onHotspotCreated = _a.onHotspotCreated, onJoinRequestReceived = _a.onJoinRequestReceived, onJoinResponse = _a.onJoinResponse, onRoomSync = _a.onRoomSync, onNewMessage = _a.onNewMessage, onWaveReceived = _a.onWaveReceived, onUserDisconnected = _a.onUserDisconnected, onChatRequestReceived = _a.onChatRequestReceived, onChatRequestResponded = _a.onChatRequestResponded, onNewDirectMessage = _a.onNewDirectMessage, onDMHistory = _a.onDMHistory, onTypingIndicator = _a.onTypingIndicator, onChatsList = _a.onChatsList, onRtcOffer = _a.onRtcOffer, onRtcAnswer = _a.onRtcAnswer, onRtcIceCandidate = _a.onRtcIceCandidate, onCallRequest = _a.onCallRequest, onCallResponse = _a.onCallResponse, onCallEnd = _a.onCallEnd;
    var _b = react_1.useState(false), socketReady = _b[0], setSocketReady = _b[1];
    var _c = react_1.useState("disconnected"), connectionState = _c[0], setConnectionState = _c[1];
    var _d = react_1.useState([]), offlineMessages = _d[0], setOfflineMessagesState = _d[1];
    var socketRef = react_1.useRef(null);
    var offlineMessagesRef = react_1.useRef([]);
    var outgoingQueueRef = react_1.useRef([]);
    var lastSentTimeRef = react_1.useRef(0);
    var _e = react_1.useState(false), connectionFailed = _e[0], setConnectionFailed = _e[1];
    // Store all callbacks in a ref to avoid closure issues during WebSocket reconnection cycles
    var callbacksRef = react_1.useRef({
        onSync: onSync,
        onLocationUpdate: onLocationUpdate,
        onHotspotsList: onHotspotsList,
        onHotspotCreated: onHotspotCreated,
        onJoinRequestReceived: onJoinRequestReceived,
        onJoinResponse: onJoinResponse,
        onRoomSync: onRoomSync,
        onNewMessage: onNewMessage,
        onWaveReceived: onWaveReceived,
        onUserDisconnected: onUserDisconnected,
        onChatRequestReceived: onChatRequestReceived,
        onChatRequestResponded: onChatRequestResponded,
        onNewDirectMessage: onNewDirectMessage,
        onDMHistory: onDMHistory,
        onTypingIndicator: onTypingIndicator,
        onChatsList: onChatsList,
        onRtcOffer: onRtcOffer,
        onRtcAnswer: onRtcAnswer,
        onRtcIceCandidate: onRtcIceCandidate,
        onCallRequest: onCallRequest,
        onCallResponse: onCallResponse,
        onCallEnd: onCallEnd
    });
    react_1.useEffect(function () {
        callbacksRef.current = {
            onSync: onSync,
            onLocationUpdate: onLocationUpdate,
            onHotspotsList: onHotspotsList,
            onHotspotCreated: onHotspotCreated,
            onJoinRequestReceived: onJoinRequestReceived,
            onJoinResponse: onJoinResponse,
            onRoomSync: onRoomSync,
            onNewMessage: onNewMessage,
            onWaveReceived: onWaveReceived,
            onUserDisconnected: onUserDisconnected,
            onChatRequestReceived: onChatRequestReceived,
            onChatRequestResponded: onChatRequestResponded,
            onNewDirectMessage: onNewDirectMessage,
            onDMHistory: onDMHistory,
            onTypingIndicator: onTypingIndicator,
            onChatsList: onChatsList,
            onRtcOffer: onRtcOffer,
            onRtcAnswer: onRtcAnswer,
            onRtcIceCandidate: onRtcIceCandidate,
            onCallRequest: onCallRequest,
            onCallResponse: onCallResponse,
            onCallEnd: onCallEnd
        };
    });
    var latestValuesRef = react_1.useRef({
        userId: userId,
        handle: handle,
        vibeEmoji: vibeEmoji,
        avatarUrl: avatarUrl,
        location: location,
        profile: profile,
        localBlocks: localBlocks,
        isBroadcastingAudio: isBroadcastingAudio
    });
    react_1.useEffect(function () {
        latestValuesRef.current = {
            userId: userId,
            handle: handle,
            vibeEmoji: vibeEmoji,
            avatarUrl: avatarUrl,
            location: location,
            profile: profile,
            localBlocks: localBlocks,
            isBroadcastingAudio: isBroadcastingAudio
        };
    });
    // Track whether profile data has changed since last full send
    var profileDirtyRef = react_1.useRef(true); // Start dirty to force full initial send
    var lastSentLocationRef = react_1.useRef(null);
    var sendLocationUpdate = function (forceFull) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        if (forceFull === void 0) { forceFull = false; }
        var ws = socketRef.current;
        var vals = latestValuesRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN || !vals.location)
            return;
        var now = Date.now();
        var lastSentLoc = lastSentLocationRef.current;
        var timeSinceLastUpdate = now - (lastSentTimeRef.current || 0);
        var movedSignificantly = true;
        if (lastSentLoc) {
            // rough distance calculation (simplistic pythagorean on lat/lng)
            var dLat = (vals.location.lat - lastSentLoc.lat) * 111000; // ~meters
            var dLng = (vals.location.lng - lastSentLoc.lng) *
                111000 *
                Math.cos(vals.location.lat * (Math.PI / 180));
            var distance = Math.sqrt(dLat * dLat + dLng * dLng);
            movedSignificantly = distance > 5; // > 5 meters
        }
        // Throttle unless moved > 5m or 10s elapsed
        if (!forceFull &&
            !profileDirtyRef.current &&
            !movedSignificantly &&
            timeSinceLastUpdate < 10000) {
            return;
        }
        lastSentTimeRef.current = now;
        // Send full payload only when profile data is dirty or forced
        if (profileDirtyRef.current || forceFull) {
            profileDirtyRef.current = false;
            lastSentLocationRef.current = {
                lat: vals.location.lat,
                lng: vals.location.lng
            };
            ws.send(JSON.stringify({
                type: "location_update",
                user_id: vals.userId,
                username: vals.handle,
                vibeEmoji: vals.vibeEmoji,
                avatar_url: vals.avatarUrl,
                lat: vals.location.lat,
                lng: vals.location.lng,
                bio: ((_a = vals.profile) === null || _a === void 0 ? void 0 : _a.bio) || "",
                projectDescription: ((_b = vals.profile) === null || _b === void 0 ? void 0 : _b.projectDescription) || "",
                openTo: ((_c = vals.profile) === null || _c === void 0 ? void 0 : _c.openTo) || [],
                selectedTags: ((_d = vals.profile) === null || _d === void 0 ? void 0 : _d.selectedTags) || [],
                gender: ((_e = vals.profile) === null || _e === void 0 ? void 0 : _e.gender) || "",
                age: ((_f = vals.profile) === null || _f === void 0 ? void 0 : _f.age) || "",
                blockedUsers: __spreadArrays((((_g = vals.profile) === null || _g === void 0 ? void 0 : _g.blockedUsers) || []), vals.localBlocks),
                radarRange: ((_h = vals.profile) === null || _h === void 0 ? void 0 : _h.radarRange) || 15,
                hotspotRange: ((_j = vals.profile) === null || _j === void 0 ? void 0 : _j.hotspotRange) || 15,
                is_broadcasting_audio: !!vals.isBroadcastingAudio,
                isGhostMode: !!((_k = vals.profile) === null || _k === void 0 ? void 0 : _k.isGhostMode)
            }));
        }
        else {
            // Lightweight ping — just location coordinates
            lastSentLocationRef.current = {
                lat: vals.location.lat,
                lng: vals.location.lng
            };
            ws.send(JSON.stringify({
                type: "location_update",
                user_id: vals.userId,
                username: vals.handle,
                avatar_url: vals.avatarUrl,
                vibeEmoji: vals.vibeEmoji,
                lat: vals.location.lat,
                lng: vals.location.lng,
                is_broadcasting_audio: !!vals.isBroadcastingAudio,
                isGhostMode: !!((_l = vals.profile) === null || _l === void 0 ? void 0 : _l.isGhostMode)
            }));
        }
    };
    // Send a helper to set offline messages
    var setOfflineMessages = function (msgs) {
        offlineMessagesRef.current = msgs;
        setOfflineMessagesState(msgs);
    };
    // Connect and reconnect management
    react_1.useEffect(function () {
        if (!location)
            return;
        var mounted = true;
        var ws = null;
        var retryTimer = null;
        var retryCount = 0;
        var connect = function () {
            if (!mounted)
                return;
            setConnectionState(retryCount > 0 ? "reconnecting" : "connecting");
            var wsUrl = process.env.NEXT_PUBLIC_WS_URL;
            if (!wsUrl) {
                var proto = window.location.protocol === "https:" ? "wss:" : "ws:";
                if (window.location.hostname === "localhost" ||
                    window.location.hostname === "127.0.0.1") {
                    wsUrl = "ws://localhost:3001";
                }
                else {
                    // Auto-map dev server port 3000 to socket server port 3001 when accessed on LAN IP
                    var host = window.location.host;
                    var portIndex = host.indexOf(":");
                    if (portIndex !== -1) {
                        var domain = host.substring(0, portIndex);
                        wsUrl = proto + "//" + domain + ":3001";
                    }
                    else {
                        wsUrl = proto + "//" + host;
                    }
                }
            }
            console.log("[norby] Connecting to WebSocket: " + wsUrl + " (Retry count: " + retryCount + ")");
            ws = new WebSocket(wsUrl);
            socketRef.current = ws;
            ws.onopen = function () {
                if (!mounted)
                    return;
                setSocketReady(true);
                setConnectionState("connected");
                setConnectionFailed(false);
                retryCount = 0;
                var activeWs = ws;
                if (activeWs) {
                    sendLocationUpdate();
                    activeWs.send(JSON.stringify({ type: "request_chats", user_id: userId }));
                    // Flush general queued messages (BUG-04)
                    if (outgoingQueueRef.current.length > 0) {
                        console.log("[norby] Socket opened. Flushing " + outgoingQueueRef.current.length + " queued outgoing messages...");
                        outgoingQueueRef.current.forEach(function (data) {
                            if (data.type === "location_update" ||
                                data.type === "request_chats" ||
                                data.type === "request_sync")
                                return;
                            activeWs.send(JSON.stringify(data));
                        });
                        outgoingQueueRef.current = [];
                    }
                    // Flush offline messages
                    if (offlineMessagesRef.current.length > 0) {
                        console.log("[norby] Offline outbox has " + offlineMessagesRef.current.length + " messages. Flushing...");
                        offlineMessagesRef.current.forEach(function (item) {
                            activeWs.send(JSON.stringify({
                                type: "send_message",
                                roomId: item.roomId,
                                text: item.msg.text,
                                sender_id: item.msg.sender_id,
                                sender_username: item.msg.sender_username,
                                sender_avatar: item.msg.sender_avatar
                            }));
                        });
                        setOfflineMessages([]);
                    }
                }
            };
            ws.onmessage = function (ev) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
                if (!mounted)
                    return;
                try {
                    var msg = JSON.parse(ev.data);
                    switch (msg.type) {
                        case "sync":
                            callbacksRef.current.onSync(msg);
                            break;
                        case "location_update":
                            callbacksRef.current.onLocationUpdate(msg);
                            break;
                        case "hotspots_list":
                            callbacksRef.current.onHotspotsList(msg);
                            break;
                        case "hotspot_created":
                            callbacksRef.current.onHotspotCreated(msg);
                            break;
                        case "join_request_received":
                            callbacksRef.current.onJoinRequestReceived(msg);
                            break;
                        case "join_response":
                            callbacksRef.current.onJoinResponse(msg);
                            break;
                        case "room_sync":
                            callbacksRef.current.onRoomSync(msg);
                            break;
                        case "new_message":
                            callbacksRef.current.onNewMessage(msg);
                            break;
                        case "wave_received":
                            callbacksRef.current.onWaveReceived(msg);
                            break;
                        case "user_disconnected":
                            callbacksRef.current.onUserDisconnected(msg);
                            break;
                        case "chat_request_received":
                            (_b = (_a = callbacksRef.current).onChatRequestReceived) === null || _b === void 0 ? void 0 : _b.call(_a, msg);
                            break;
                        case "chat_request_responded":
                            (_d = (_c = callbacksRef.current).onChatRequestResponded) === null || _d === void 0 ? void 0 : _d.call(_c, msg);
                            break;
                        case "new_direct_message":
                            (_f = (_e = callbacksRef.current).onNewDirectMessage) === null || _f === void 0 ? void 0 : _f.call(_e, msg);
                            break;
                        case "dm_history":
                            (_h = (_g = callbacksRef.current).onDMHistory) === null || _h === void 0 ? void 0 : _h.call(_g, msg);
                            break;
                        case "direct_message_typing":
                            (_k = (_j = callbacksRef.current).onTypingIndicator) === null || _k === void 0 ? void 0 : _k.call(_j, msg);
                            break;
                        case "chats_list":
                            (_m = (_l = callbacksRef.current).onChatsList) === null || _m === void 0 ? void 0 : _m.call(_l, msg);
                            break;
                        case "rtc_offer":
                            (_p = (_o = callbacksRef.current).onRtcOffer) === null || _p === void 0 ? void 0 : _p.call(_o, msg);
                            break;
                        case "rtc_answer":
                            (_r = (_q = callbacksRef.current).onRtcAnswer) === null || _r === void 0 ? void 0 : _r.call(_q, msg);
                            break;
                        case "rtc_ice_candidate":
                            (_t = (_s = callbacksRef.current).onRtcIceCandidate) === null || _t === void 0 ? void 0 : _t.call(_s, msg);
                            break;
                        case "call_request":
                            (_v = (_u = callbacksRef.current).onCallRequest) === null || _v === void 0 ? void 0 : _v.call(_u, msg);
                            break;
                        case "call_response":
                            (_x = (_w = callbacksRef.current).onCallResponse) === null || _x === void 0 ? void 0 : _x.call(_w, msg);
                            break;
                        case "call_end":
                            (_z = (_y = callbacksRef.current).onCallEnd) === null || _z === void 0 ? void 0 : _z.call(_y, msg);
                            break;
                        default:
                            break;
                    }
                }
                catch (e) {
                    console.error("[norby] Msg parse error:", e);
                }
            };
            ws.onerror = function () {
                console.warn("[norby] WebSocket connection error on URL: " + wsUrl);
            };
            ws.onclose = function () {
                if (!mounted)
                    return;
                setSocketReady(false);
                setConnectionState("disconnected");
                socketRef.current = null;
                // Exponential backoff reconnect with jitter
                var delay = Math.min(10000, Math.pow(2, retryCount) * 1000) +
                    (Math.random() - 0.5) * 1000;
                console.log("[norby] Socket closed. Reconnecting in " + Math.round(delay) + "ms...");
                retryCount++;
                if (retryCount >= 3) {
                    setConnectionFailed(true);
                }
                retryTimer = setTimeout(connect, Math.max(1000, delay));
            };
        };
        connect();
        var handleUnload = function () {
            if (ws)
                ws.close();
        };
        window.addEventListener("beforeunload", handleUnload);
        return function () {
            mounted = false;
            window.removeEventListener("beforeunload", handleUnload);
            if (retryTimer)
                clearTimeout(retryTimer);
            if (ws)
                ws.close();
        };
    }, [!!location, userId]);
    // Periodic location heartbeat and sync to keep session alive and handle server recycles
    react_1.useEffect(function () {
        if (!socketReady)
            return;
        var interval = setInterval(function () {
            sendLocationUpdate();
        }, 30000);
        return function () { return clearInterval(interval); };
    }, [socketReady]);
    // Location-only sync (lightweight)
    react_1.useEffect(function () {
        sendLocationUpdate();
    }, [location === null || location === void 0 ? void 0 : location.lat, location === null || location === void 0 ? void 0 : location.lng, socketReady]);
    // Profile data changes mark dirty and trigger full send
    react_1.useEffect(function () {
        profileDirtyRef.current = true;
        sendLocationUpdate(true);
    }, [
        handle,
        vibeEmoji,
        avatarUrl,
        profile === null || profile === void 0 ? void 0 : profile.bio,
        profile === null || profile === void 0 ? void 0 : profile.projectDescription,
        profile === null || profile === void 0 ? void 0 : profile.openTo,
        profile === null || profile === void 0 ? void 0 : profile.selectedTags,
        profile === null || profile === void 0 ? void 0 : profile.gender,
        profile === null || profile === void 0 ? void 0 : profile.age,
        profile === null || profile === void 0 ? void 0 : profile.blockedUsers,
        localBlocks,
        profile === null || profile === void 0 ? void 0 : profile.radarRange,
        profile === null || profile === void 0 ? void 0 : profile.hotspotRange,
        profile === null || profile === void 0 ? void 0 : profile.isGhostMode,
        isBroadcastingAudio,
    ]);
    // Helper send methods
    var send = function (data) {
        var ws = socketRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
            return true;
        }
        // BUG-04: Queue outgoing messages during reconnection window
        console.log("[norby] Socket not open. Queueing outgoing message of type: " + (data === null || data === void 0 ? void 0 : data.type));
        outgoingQueueRef.current.push(data);
        return false;
    };
    var requestSync = function () {
        return send({ type: "request_sync", user_id: userId });
    };
    var sendWave = function (targetUserId) {
        return send({
            type: "send_wave",
            target_user_id: targetUserId,
            sender_id: userId,
            sender_username: handle
        });
    };
    var createHotspot = function (title, customRange, osmPlace, category) {
        var _a;
        if (!location)
            return false;
        return send({
            type: "create_hotspot",
            user_id: userId,
            username: handle,
            avatar_url: avatarUrl,
            vibeEmoji: vibeEmoji,
            title: title.trim(),
            category: category || "community",
            lat: location.lat,
            lng: location.lng,
            host_bio: (profile === null || profile === void 0 ? void 0 : profile.bio) || "",
            host_tags: (profile === null || profile === void 0 ? void 0 : profile.selectedTags) || [],
            host_gender: (profile === null || profile === void 0 ? void 0 : profile.gender) || "",
            host_age: (profile === null || profile === void 0 ? void 0 : profile.age) || undefined,
            hotspotRange: customRange,
            osm_place_id: osmPlace === null || osmPlace === void 0 ? void 0 : osmPlace.id,
            osm_place_name: (_a = osmPlace === null || osmPlace === void 0 ? void 0 : osmPlace.tags) === null || _a === void 0 ? void 0 : _a.name
        });
    };
    var requestJoin = function (roomId) {
        return send({
            type: "request_join",
            roomId: roomId,
            user_id: userId,
            username: handle,
            avatar_url: avatarUrl
        });
    };
    var respondRequest = function (roomId, guestId, status) {
        return send({
            type: "respond_join",
            roomId: roomId,
            guestId: guestId,
            status: status
        });
    };
    var leaveHotspot = function (roomId) {
        return send({
            type: "leave_hotspot",
            roomId: roomId,
            user_id: userId
        });
    };
    var sendMessage = function (roomId, text, onOptimisticAdd) {
        var ws = socketRef.current;
        var isSocketConnected = ws && ws.readyState === WebSocket.OPEN;
        var trimmedText = text.trim();
        if (!isSocketConnected) {
            // Local optimistic message object
            var offlineMsg = {
                id: "msg_offline_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
                sender_id: userId,
                sender_username: handle,
                sender_avatar: avatarUrl,
                text: trimmedText,
                timestamp: Date.now(),
                isOffline: true
            };
            // Buffer inside Ref queue and update React state
            var queueItem = { roomId: roomId, msg: offlineMsg };
            var newOffline = __spreadArrays(offlineMessagesRef.current, [queueItem]);
            setOfflineMessages(newOffline);
            if (onOptimisticAdd) {
                onOptimisticAdd(offlineMsg);
            }
            return false;
        }
        ws.send(JSON.stringify({
            type: "send_message",
            roomId: roomId,
            text: trimmedText,
            sender_id: userId,
            sender_username: handle,
            sender_avatar: avatarUrl
        }));
        return true;
    };
    var sendChatRequest = function (targetUserId) {
        return send({
            type: "send_chat_request",
            target_user_id: targetUserId
        });
    };
    var respondChatRequest = function (senderId, status) {
        return send({
            type: "respond_chat_request",
            sender_id: senderId,
            status: status
        });
    };
    var sendDirectMessage = function (recipientId, text) {
        return send({
            type: "send_direct_message",
            recipient_id: recipientId,
            text: text.trim()
        });
    };
    var sendTypingState = function (recipientId, isTyping) {
        return send({
            type: "direct_message_typing",
            recipient_id: recipientId,
            is_typing: isTyping
        });
    };
    var requestChats = function () {
        return send({
            type: "request_chats"
        });
    };
    var sendRtcOffer = function (targetUserId, offer) {
        return send({
            type: "rtc_offer",
            target_user_id: targetUserId,
            sender_id: userId,
            offer: offer
        });
    };
    var sendRtcAnswer = function (targetUserId, answer) {
        return send({
            type: "rtc_answer",
            target_user_id: targetUserId,
            sender_id: userId,
            answer: answer
        });
    };
    var sendRtcIceCandidate = function (targetUserId, candidate) {
        return send({
            type: "rtc_ice_candidate",
            target_user_id: targetUserId,
            sender_id: userId,
            candidate: candidate
        });
    };
    var sendCallRequest = function (targetUserId) {
        return send({
            type: "call_request",
            target_user_id: targetUserId,
            caller_id: userId,
            caller_username: handle,
            caller_avatar: avatarUrl
        });
    };
    var respondCallRequest = function (targetUserId, responderId, status) {
        return send({
            type: "call_response",
            target_user_id: targetUserId,
            responder_id: responderId,
            status: status
        });
    };
    var sendCallEnd = function (targetUserId) {
        return send({
            type: "call_end",
            target_user_id: targetUserId,
            sender_id: userId
        });
    };
    return {
        socketReady: socketReady,
        connectionState: connectionState,
        offlineMessages: offlineMessages,
        connectionFailed: connectionFailed,
        requestSync: requestSync,
        sendWave: sendWave,
        createHotspot: createHotspot,
        requestJoin: requestJoin,
        respondRequest: respondRequest,
        leaveHotspot: leaveHotspot,
        sendMessage: sendMessage,
        sendChatRequest: sendChatRequest,
        respondChatRequest: respondChatRequest,
        sendDirectMessage: sendDirectMessage,
        sendTypingState: sendTypingState,
        requestChats: requestChats,
        sendRtcOffer: sendRtcOffer,
        sendRtcAnswer: sendRtcAnswer,
        sendRtcIceCandidate: sendRtcIceCandidate,
        sendCallRequest: sendCallRequest,
        respondCallRequest: respondCallRequest,
        sendCallEnd: sendCallEnd
    };
}
exports.useSocket = useSocket;
