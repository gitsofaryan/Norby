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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useDMContext = exports.useSocialContext = exports.ChatProvider = exports.DMContext = exports.SocialContext = void 0;
var react_1 = require("react");
var eventBus_1 = require("@/lib/eventBus");
var sounds_1 = require("@/lib/sounds");
var beePrompt_1 = require("@/lib/beePrompt");
var beeActions_1 = require("@/lib/beeActions");
exports.SocialContext = react_1.createContext(undefined);
exports.DMContext = react_1.createContext(undefined);
var MAX_STORED_CONVERSATIONS = 20;
function saveConversationToLocalStorage(convoId, messages) {
    if (typeof window === "undefined")
        return;
    try {
        localStorage.setItem("chat_msgs_" + convoId, JSON.stringify(messages));
        var index = [];
        var storedIndex = localStorage.getItem("norby_chat_index");
        if (storedIndex) {
            try {
                index = JSON.parse(storedIndex);
            }
            catch (e) {
                index = [];
            }
        }
        index = index.filter(function (item) { return item.convoId !== convoId; });
        index.push({ convoId: convoId, lastUpdated: Date.now() });
        if (index.length > MAX_STORED_CONVERSATIONS) {
            index.sort(function (a, b) { return a.lastUpdated - b.lastUpdated; });
            while (index.length > MAX_STORED_CONVERSATIONS) {
                var evicted = index.shift();
                if (evicted) {
                    localStorage.removeItem("chat_msgs_" + evicted.convoId);
                }
            }
        }
        localStorage.setItem("norby_chat_index", JSON.stringify(index));
    }
    catch (e) {
        console.warn("[norby] Failed to save conversation or index to localStorage:", e);
    }
}
function ChatProvider(_a) {
    var children = _a.children, socket = _a.socket, myUserId = _a.myUserId, handle = _a.handle, myAvatarUrl = _a.myAvatarUrl, addToast = _a.addToast, setNotifications = _a.setNotifications, activeUsers = _a.activeUsers, isSignedIn = _a.isSignedIn, location = _a.location, filteredHotspots = _a.filteredHotspots;
    var _b = react_1.useState([]), chatRequests = _b[0], setChatRequests = _b[1];
    var _c = react_1.useState(null), activeChatUser = _c[0], _setActiveChatUser = _c[1];
    var activeChatUserRef = react_1.useRef(null);
    var setActiveChatUser = function (val) {
        activeChatUserRef.current = val;
        _setActiveChatUser(val);
    };
    var _d = react_1.useState([]), chatMessages = _d[0], setChatMessages = _d[1];
    var _e = react_1.useState({}), peerTyping = _e[0], setPeerTyping = _e[1];
    var _f = react_1.useState(false), isLoadingHistory = _f[0], setIsLoadingHistory = _f[1];
    // Unread messages tracking (debounced localStorage save)
    var _g = react_1.useState(function () {
        if (typeof window !== "undefined") {
            try {
                return JSON.parse(localStorage.getItem("norby_unread_messages") || "{}");
            }
            catch (e) {
                return {};
            }
        }
        return {};
    }), unreadMessages = _g[0], setUnreadMessages = _g[1];
    var unreadSaveTimeoutRef = react_1.useRef(null);
    react_1.useEffect(function () {
        if (unreadSaveTimeoutRef.current)
            clearTimeout(unreadSaveTimeoutRef.current);
        unreadSaveTimeoutRef.current = setTimeout(function () {
            try {
                localStorage.setItem("norby_unread_messages", JSON.stringify(unreadMessages));
            }
            catch (e) { }
        }, 500);
        return function () { return clearTimeout(unreadSaveTimeoutRef.current); };
    }, [unreadMessages]);
    var unreadMessagesCount = react_1.useMemo(function () {
        return Object.values(unreadMessages).reduce(function (a, b) { return a + b; }, 0);
    }, [unreadMessages]);
    react_1.useEffect(function () {
        if (activeChatUser) {
            setUnreadMessages(function (prev) {
                if (!prev[activeChatUser.user_id])
                    return prev;
                var copy = __assign({}, prev);
                delete copy[activeChatUser.user_id];
                return copy;
            });
        }
    }, [activeChatUser]);
    // Load / Save friends to Puter KV
    var friendsSaveTimeoutRef = react_1.useRef(null);
    react_1.useEffect(function () {
        if (!isSignedIn || !myUserId || myUserId === "anon" || myUserId.startsWith("anon_"))
            return;
        if (typeof window !== "undefined" && window.puter) {
            if (friendsSaveTimeoutRef.current)
                clearTimeout(friendsSaveTimeoutRef.current);
            friendsSaveTimeoutRef.current = setTimeout(function () {
                var acceptedIds = chatRequests
                    .filter(function (r) { return r.status === "accepted"; })
                    .map(function (r) { return (r.sender_id === myUserId ? r.target_id : r.sender_id); });
                if (acceptedIds.length > 0) {
                    window.puter.kv.set("friends_list_" + myUserId, JSON.stringify(acceptedIds))["catch"](function () { });
                }
            }, 1000);
        }
        return function () { return clearTimeout(friendsSaveTimeoutRef.current); };
    }, [chatRequests, myUserId, isSignedIn]);
    var friendsLoadedRef = react_1.useRef(false);
    react_1.useEffect(function () {
        if (friendsLoadedRef.current || !isSignedIn || !myUserId || myUserId === "anon" || myUserId.startsWith("anon_"))
            return;
        if (typeof window !== "undefined" && window.puter) {
            friendsLoadedRef.current = true;
            window.puter.kv.get("friends_list_" + myUserId)
                .then(function (raw) {
                if (!raw)
                    return;
                try {
                    var friendIds_1 = JSON.parse(raw);
                    if (Array.isArray(friendIds_1) && friendIds_1.length > 0) {
                        setChatRequests(function (prev) {
                            var existingIds = new Set(prev.map(function (r) { return r.sender_id === myUserId ? r.target_id : r.sender_id; }));
                            var newPlaceholders = friendIds_1
                                .filter(function (id) { return !existingIds.has(id); })
                                .map(function (id) { return ({
                                sender_id: myUserId,
                                sender_username: handle || myUserId,
                                sender_avatar: myAvatarUrl,
                                target_id: id,
                                status: "accepted",
                                timestamp: Date.now()
                            }); });
                            return newPlaceholders.length > 0 ? __spreadArrays(prev, newPlaceholders) : prev;
                        });
                    }
                }
                catch (e) { }
            })["catch"](function () { });
        }
    }, [myUserId, handle, myAvatarUrl, isSignedIn]);
    // Load DM history from localStorage only (device-local, no server)
    react_1.useEffect(function () {
        if (!activeChatUser || !myUserId || myUserId === "anon") {
            setChatMessages([]);
            setIsLoadingHistory(false);
            return;
        }
        var targetUserId = activeChatUser.user_id;
        var convoId = [myUserId, targetUserId].sort().join(":");
        if (typeof window !== "undefined") {
            try {
                var stored = localStorage.getItem("chat_msgs_" + convoId);
                if (stored) {
                    var msgs = JSON.parse(stored);
                    var oneHourAgo_1 = Date.now() - 60 * 60 * 1000;
                    var validMsgs = msgs.map(function (m) { return (__assign(__assign({}, m), { text: typeof m.text === 'string' ? m.text : (typeof m.text === 'object' ? JSON.stringify(m.text) : String(m.text)) })); }).filter(function (m) { return m.timestamp > oneHourAgo_1; });
                    setChatMessages(validMsgs);
                    saveConversationToLocalStorage(convoId, validMsgs);
                }
                else {
                    setChatMessages([]);
                }
            }
            catch (e) {
                setChatMessages([]);
            }
        }
        setIsLoadingHistory(false);
    }, [activeChatUser === null || activeChatUser === void 0 ? void 0 : activeChatUser.user_id, myUserId]);
    var friends = react_1.useMemo(function () {
        var beeBot = {
            user_id: "bee_ai_bot",
            username: "bee",
            avatar_url: "/bee_avatar.png",
            vibeEmoji: "🐝",
            bio: "I'm Bee, the witty AI buzzing around Norby! Always here to share local tea, suggest cool spots, and keep the vibes immaculate.",
            selectedTags: ["ai", "guide", "smart", "friendly", "chatty", "fun"],
            gender: "bot",
            age: "Ageless",
            status: "active"
        };
        var friendIds = chatRequests
            .filter(function (r) { return r.status === "accepted"; })
            .map(function (r) { return (r.sender_id === myUserId ? r.target_id : r.sender_id); });
        var activeFriends = activeUsers.filter(function (u) { return friendIds.includes(u.user_id); });
        var offlineFriendIds = friendIds.filter(function (id) { return !activeUsers.some(function (u) { return u.user_id === id; }); });
        var offlineFriends = offlineFriendIds.map(function (id) {
            var requestData = chatRequests.find(function (r) { return r.status === "accepted" && (r.sender_id === id || r.target_id === id); });
            return {
                user_id: id,
                username: (requestData === null || requestData === void 0 ? void 0 : requestData.sender_id) === id ? requestData.sender_username : ((requestData === null || requestData === void 0 ? void 0 : requestData.target_username) || "Unknown"),
                avatar_url: (requestData === null || requestData === void 0 ? void 0 : requestData.sender_id) === id ? requestData.sender_avatar : ((requestData === null || requestData === void 0 ? void 0 : requestData.target_avatar) || ""),
                vibeEmoji: "😴",
                bio: "Offline",
                status: "away"
            };
        });
        return __spreadArrays([beeBot], activeFriends, offlineFriends);
    }, [chatRequests, activeUsers, myUserId]);
    // Event bus listeners for socket events
    react_1.useEffect(function () {
        var unsubNewDM = eventBus_1.globalEventBus.on("chat:new_dm", function (msg) {
            var _a;
            if (activeChatUserRef.current && (msg.message.sender_id === activeChatUserRef.current.user_id || msg.message.recipient_id === activeChatUserRef.current.user_id)) {
                setChatMessages(function (prev) {
                    if (prev.some(function (m) { return m.id === msg.message.id; }))
                        return prev;
                    var filtered = prev;
                    if (msg.message.sender_id === myUserId) {
                        filtered = prev.filter(function (m) { return !m.id.startsWith("local_") || m.text !== msg.message.text; });
                    }
                    var newMsgs = __spreadArrays(filtered, [msg.message]);
                    var convoId = [myUserId, activeChatUserRef.current.user_id].sort().join(":");
                    if (typeof window !== "undefined") {
                        try {
                            var oneHourAgo_2 = Date.now() - 60 * 60 * 1000;
                            var filteredStorage = newMsgs.filter(function (m) { return m.timestamp > oneHourAgo_2; });
                            saveConversationToLocalStorage(convoId, filteredStorage);
                        }
                        catch (e) { }
                    }
                    return newMsgs;
                });
            }
            else {
                var textStr = typeof msg.message.text === 'string' ? msg.message.text : (typeof msg.message.text === 'object' ? JSON.stringify(msg.message.text) : String(msg.message.text));
                if (msg.message.sender_id !== myUserId && ((_a = activeChatUserRef.current) === null || _a === void 0 ? void 0 : _a.user_id) !== msg.message.sender_id) {
                    addToast("\u2709\uFE0F New message from @" + msg.message.sender_username + ": \"" + textStr.substring(0, 20) + (textStr.length > 20 ? "..." : "") + "\"", "default");
                    setUnreadMessages(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[msg.message.sender_id] = (prev[msg.message.sender_id] || 0) + 1, _a)));
                    });
                    setNotifications(function (prev) { return __spreadArrays([
                        {
                            id: Math.random().toString(36).substring(7),
                            text: "\u2709\uFE0F Message from @" + msg.message.sender_username,
                            time: Date.now(),
                            read: false
                        }
                    ], prev).slice(0, 5); });
                }
                if (typeof window !== "undefined") {
                    try {
                        var otherUserId = msg.message.sender_id === myUserId ? msg.message.recipient_id : msg.message.sender_id;
                        var convoId = [myUserId, otherUserId].sort().join(":");
                        var list = [];
                        var stored = localStorage.getItem("chat_msgs_" + convoId);
                        if (stored) {
                            list = JSON.parse(stored);
                        }
                        if (!list.some(function (m) { return m.id === msg.message.id; })) {
                            var safeMsg = __assign(__assign({}, msg.message), { text: typeof msg.message.text === 'string' ? msg.message.text : (typeof msg.message.text === 'object' ? JSON.stringify(msg.message.text) : String(msg.message.text)) });
                            list.push(safeMsg);
                            var oneHourAgo_3 = Date.now() - 60 * 60 * 1000;
                            var filtered = list.filter(function (m) { return m.timestamp > oneHourAgo_3; });
                            saveConversationToLocalStorage(convoId, filtered);
                        }
                    }
                    catch (e) { }
                }
            }
        });
        var unsubTyping = eventBus_1.globalEventBus.on("chat:typing_indicator", function (msg) {
            setPeerTyping(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[msg.sender_id] = msg.is_typing, _a)));
            });
        });
        var unsubChatsList = eventBus_1.globalEventBus.on("chat:chats_list", function (msg) {
            setChatRequests(msg.requests || []);
        });
        var unsubChatReq = eventBus_1.globalEventBus.on("chat:chat_request", function (msg) {
            addToast("\uD83D\uDCAC Chat request from @" + msg.request.sender_username + "!", "request");
            setNotifications(function (prev) { return __spreadArrays([
                {
                    id: Math.random().toString(36).substring(7),
                    text: "@" + msg.request.sender_username + " wants to connect with you",
                    time: Date.now(),
                    read: false
                }
            ], prev).slice(0, 5); });
            setChatRequests(function (prev) {
                var filtered = prev.filter(function (r) { return r.sender_id !== msg.request.sender_id || r.target_id !== msg.request.target_id; });
                return __spreadArrays(filtered, [msg.request]);
            });
        });
        var unsubChatRes = eventBus_1.globalEventBus.on("chat:chat_respond", function (msg) {
            var isAccepted = msg.request.status === "accepted";
            var otherUser = msg.request.sender_id === myUserId ? msg.request.target_id : msg.request.sender_id;
            var otherInfo = activeUsers.find(function (u) { return u.user_id === otherUser; });
            var otherHandle = (otherInfo === null || otherInfo === void 0 ? void 0 : otherInfo.username) || "Someone";
            sounds_1.playSound(isAccepted ? "success" : "error");
            if (isAccepted) {
                addToast("\u2705 Connected with @" + otherHandle + "! You can now chat.", "default");
                setNotifications(function (prev) { return __spreadArrays([
                    {
                        id: Math.random().toString(36).substring(7),
                        text: "\u2705 Connected with @" + otherHandle,
                        time: Date.now(),
                        read: false
                    }
                ], prev).slice(0, 5); });
            }
            else {
                addToast("\u274C Chat request to @" + otherHandle + " was declined.", "default");
                setNotifications(function (prev) { return __spreadArrays([
                    {
                        id: Math.random().toString(36).substring(7),
                        text: "\u274C Request to @" + otherHandle + " declined",
                        time: Date.now(),
                        read: false
                    }
                ], prev).slice(0, 5); });
            }
            setChatRequests(function (prev) {
                var filtered = prev.filter(function (r) { return r.sender_id !== msg.request.sender_id || r.target_id !== msg.request.target_id; });
                return __spreadArrays(filtered, [msg.request]);
            });
        });
        return function () {
            unsubNewDM();
            unsubTyping();
            unsubChatsList();
            unsubChatReq();
            unsubChatRes();
        };
    }, [myUserId, activeUsers, addToast, setNotifications]);
    var clearChatHistory = react_1.useCallback(function (targetUserId) {
        var _a;
        var convoId = [myUserId, targetUserId].sort().join(":");
        if (typeof window !== "undefined") {
            try {
                localStorage.removeItem("chat_msgs_" + convoId);
                var storedIndex = localStorage.getItem("norby_chat_index");
                if (storedIndex) {
                    try {
                        var index = JSON.parse(storedIndex).filter(function (item) { return item.convoId !== convoId; });
                        localStorage.setItem("norby_chat_index", JSON.stringify(index));
                    }
                    catch (e) { }
                }
            }
            catch (e) { }
        }
        if (((_a = activeChatUserRef.current) === null || _a === void 0 ? void 0 : _a.user_id) === targetUserId) {
            setChatMessages([]);
        }
    }, [myUserId]);
    var sendChatRequest = react_1.useCallback(function (targetUserId) {
        setChatRequests(function (prev) {
            if (prev.some(function (r) { return r.target_id === targetUserId && r.status === "pending"; }))
                return prev;
            return __spreadArrays(prev, [{
                    sender_id: myUserId,
                    target_id: targetUserId,
                    status: "pending",
                    timestamp: Date.now()
                }]);
        });
        if (socket === null || socket === void 0 ? void 0 : socket.sendChatRequest)
            socket.sendChatRequest(targetUserId);
    }, [socket, myUserId]);
    var respondChatRequest = react_1.useCallback(function (senderId, status) {
        setChatRequests(function (prev) { return prev.map(function (r) {
            if (r.sender_id === senderId && r.target_id === myUserId) {
                return __assign(__assign({}, r), { status: status });
            }
            return r;
        }); });
        if (socket === null || socket === void 0 ? void 0 : socket.respondChatRequest)
            socket.respondChatRequest(senderId, status);
    }, [socket, myUserId]);
    var sendDirectMessage = react_1.useCallback(function (text) {
        var chatUser = activeChatUserRef.current;
        if (!chatUser || !socket)
            return;
        var msg = {
            id: "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
            sender_id: myUserId,
            sender_username: handle,
            sender_avatar: myAvatarUrl,
            recipient_id: chatUser.user_id,
            text: text,
            timestamp: Date.now()
        };
        setChatMessages(function (prev) {
            var next = __spreadArrays(prev, [msg]);
            var convoId = [myUserId, chatUser.user_id].sort().join(":");
            if (typeof window !== "undefined") {
                try {
                    var oneHourAgo_4 = Date.now() - 60 * 60 * 1000;
                    var filtered = next.filter(function (m) { return m.timestamp > oneHourAgo_4; });
                    saveConversationToLocalStorage(convoId, filtered);
                }
                catch (e) { }
            }
            return next;
        });
        if (chatUser.user_id !== "bee_ai_bot") {
            socket.sendDirectMessage(chatUser.user_id, text);
        }
        if (chatUser.user_id === "bee_ai_bot") {
            setPeerTyping(function (prev) { return (__assign(__assign({}, prev), { bee_ai_bot: true })); });
            var appendBeeReply_1 = function (reply) {
                var aiMsg = {
                    id: "bee_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
                    sender_id: "bee_ai_bot",
                    sender_username: "bee",
                    sender_avatar: "/bee_avatar.png",
                    recipient_id: myUserId,
                    text: reply,
                    timestamp: Date.now()
                };
                setChatMessages(function (prevMsgs) {
                    var nextMsgs = __spreadArrays(prevMsgs, [aiMsg]);
                    var convo = [myUserId, "bee_ai_bot"].sort().join(":");
                    try {
                        var oneHourAgo_5 = Date.now() - 60 * 60 * 1000;
                        localStorage.setItem("chat_msgs_" + convo, JSON.stringify(nextMsgs.filter(function (m) { return m.timestamp > oneHourAgo_5; })));
                    }
                    catch (e) { }
                    return nextMsgs;
                });
            };
            var action = beeActions_1.parseBeeAction(text, myUserId, filteredHotspots || []);
            if (action) {
                if (action.type === "create_hotspot") {
                    if (!location) {
                        appendBeeReply_1("I need your location enabled before I can create a meetup. You can turn it on from the map.");
                    }
                    else {
                        var created = socket.createHotspot(action.title, 15, undefined, action.category);
                        appendBeeReply_1(created === false
                            ? "I couldn't create that meetup because the live connection is unavailable. Try again when the socket reconnects."
                            : "Done. I started \u201C" + action.title + "\u201D as a " + action.category.replaceAll("-", " ") + " meetup. You can manage it from your hotspot drawer.");
                    }
                }
                else if (action.type === "close_hotspot") {
                    var closed = socket.leaveHotspot(action.roomId);
                    appendBeeReply_1(closed === false ? "I couldn't close it because the live connection is unavailable." : "Your hotspot is closed. I removed it from the live map.");
                }
                else {
                    var responded = socket.respondRequest(action.roomId, action.guestId, action.status);
                    appendBeeReply_1(responded === false
                        ? "I couldn't update that request because the live connection is unavailable."
                        : action.status === "accepted" ? "Accepted. They can now enter your hotspot chat." : "Declined. Their request will not enter your hotspot.");
                }
                setPeerTyping(function (prev) { return (__assign(__assign({}, prev), { bee_ai_bot: false })); });
                return;
            }
            var otherUsers = activeUsers.filter(function (u) { return u.user_id !== "bee_ai_bot" && u.user_id !== myUserId; });
            var prompt = beePrompt_1.buildBeePrompt({
                userText: text,
                location: location,
                hotspots: filteredHotspots || [],
                users: otherUsers
            });
            if (typeof window !== "undefined" && window.puter) {
                window.puter.ai.chat(prompt, { model: 'openai/gpt-4o-mini' })
                    .then(function (response) {
                    var getReplyText = function (res) {
                        var _a, _b;
                        if (typeof res === 'string')
                            return res;
                        if (typeof (res === null || res === void 0 ? void 0 : res.message) === 'string')
                            return res.message;
                        if (typeof (res === null || res === void 0 ? void 0 : res.text) === 'string')
                            return res.text;
                        if ((_a = res === null || res === void 0 ? void 0 : res.message) === null || _a === void 0 ? void 0 : _a.content) {
                            if (typeof res.message.content === 'string')
                                return res.message.content;
                            if (Array.isArray(res.message.content))
                                return ((_b = res.message.content[0]) === null || _b === void 0 ? void 0 : _b.text) || "Bzz...";
                        }
                        return "Bzz... I couldn't compute that!";
                    };
                    var replyText = getReplyText(response);
                    var messages = replyText.split('|||').map(function (m) { return m.trim(); }).filter(Boolean);
                    messages.forEach(function (msgTxt, index) {
                        setTimeout(function () {
                            appendBeeReply_1(msgTxt);
                            if (index === messages.length - 1) {
                                setPeerTyping(function (prev) { return (__assign(__assign({}, prev), { bee_ai_bot: false })); });
                            }
                        }, index * 1000);
                    });
                })["catch"](function () {
                    setPeerTyping(function (prev) { return (__assign(__assign({}, prev), { bee_ai_bot: false })); });
                });
            }
            else {
                setTimeout(function () {
                    setPeerTyping(function (prev) { return (__assign(__assign({}, prev), { bee_ai_bot: false })); });
                }, 1000);
            }
        }
    }, [myUserId, handle, myAvatarUrl, socket, location, filteredHotspots, activeUsers]);
    var sendTypingState = react_1.useCallback(function (isTyping) {
        if (activeChatUserRef.current && (socket === null || socket === void 0 ? void 0 : socket.sendTypingState) && activeChatUserRef.current.user_id !== "bee_ai_bot") {
            socket.sendTypingState(activeChatUserRef.current.user_id, isTyping);
        }
    }, [socket]);
    var requestDMHistory = react_1.useCallback(function (targetUserId) {
        // Deprecated: no-op since history is loaded from localStorage locally
    }, []);
    var socialValue = react_1.useMemo(function () { return ({
        chatRequests: chatRequests,
        friends: friends,
        sendChatRequest: sendChatRequest,
        respondChatRequest: respondChatRequest
    }); }, [chatRequests, friends, sendChatRequest, respondChatRequest]);
    var dmValue = react_1.useMemo(function () { return ({
        chatMessages: chatMessages,
        peerTyping: peerTyping,
        activeChatUser: activeChatUser,
        setActiveChatUser: setActiveChatUser,
        sendDirectMessage: sendDirectMessage,
        sendTypingState: sendTypingState,
        requestDMHistory: requestDMHistory,
        isLoadingHistory: isLoadingHistory,
        unreadMessagesCount: unreadMessagesCount,
        clearChatHistory: clearChatHistory
    }); }, [chatMessages, peerTyping, activeChatUser, sendDirectMessage, sendTypingState, requestDMHistory, isLoadingHistory, unreadMessagesCount, clearChatHistory]);
    return (React.createElement(exports.SocialContext.Provider, { value: socialValue },
        React.createElement(exports.DMContext.Provider, { value: dmValue }, children)));
}
exports.ChatProvider = ChatProvider;
function useSocialContext() {
    var context = react_1.useContext(exports.SocialContext);
    if (!context) {
        throw new Error("useSocialContext must be used within a ChatProvider");
    }
    return context;
}
exports.useSocialContext = useSocialContext;
function useDMContext() {
    var context = react_1.useContext(exports.DMContext);
    if (!context) {
        throw new Error("useDMContext must be used within a ChatProvider");
    }
    return context;
}
exports.useDMContext = useDMContext;
