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
exports.stopServer = exports.startServer = exports.activeServer = exports.sanitizeInput = void 0;
var http_1 = require("http");
var ws_1 = require("ws");
var redis_1 = require("redis");
var zod_1 = require("zod");
var client = require("prom-client");
var crypto_1 = require("crypto");
// ── Metrics Configuration ────────────────────────────────────────────────────
client.collectDefaultMetrics({ prefix: "norby_socket_" });
var metricMessagesReceived = new client.Counter({
    name: "norby_socket_messages_received_total",
    help: "Total number of WebSocket messages received",
    labelNames: ["type"]
});
var metricMessagesSent = new client.Counter({
    name: "norby_socket_messages_sent_total",
    help: "Total number of WebSocket messages sent",
    labelNames: ["type"]
});
var metricSyncDuration = new client.Histogram({
    name: "norby_socket_sync_duration_seconds",
    help: "Time taken to execute full synchronization logic",
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2]
});
var metricRedisCommands = new client.Histogram({
    name: "norby_socket_redis_command_duration_seconds",
    help: "Time taken to execute Redis commands",
    labelNames: ["command"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5]
});
// Global crash guards — never let the server process die
process.on("uncaughtException", function (err) {
    logEvent("uncaught_exception", { error: err.message, stack: err.stack });
});
process.on("unhandledRejection", function (reason) {
    logEvent("unhandled_rejection", { reason: String(reason) });
});
// ── Structured Logging Helper ────────────────────────────────────────────────
function logEvent(action, metadata) {
    if (metadata === void 0) { metadata = {}; }
    var logObj = __assign({ timestamp: new Date().toISOString(), action: action }, metadata);
    console.log(JSON.stringify(logObj));
}
function sanitizeInput(input) {
    if (!input)
        return "";
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}
exports.sanitizeInput = sanitizeInput;
function userExists(userId) {
    return __awaiter(this, void 0, Promise, function () {
        var exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(useRedis && redisPub)) return [3 /*break*/, 2];
                    return [4 /*yield*/, redisPub.hExists("norby:active_users", userId)];
                case 1:
                    exists = _a.sent();
                    return [2 /*return*/, !!exists];
                case 2: return [2 /*return*/, Array.from(clientsLocal.values()).some(function (u) { return u.user_id === userId; })];
            }
        });
    });
}
var PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
var REDIS_URL = process.env.REDIS_URL;
// ── Zod Message Validation Schemas ───────────────────────────────────────────
var LocationUpdateSchema = zod_1.z.object({
    type: zod_1.z.literal("location_update"),
    user_id: zod_1.z.string(),
    username: zod_1.z.string(),
    avatar_url: zod_1.z.string().optional(),
    vibeEmoji: zod_1.z.string().optional(),
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
    bio: zod_1.z.string().max(200).optional().nullable(),
    projectDescription: zod_1.z.string().max(200).optional().nullable(),
    openTo: zod_1.z.array(zod_1.z.string().max(50)).max(9).optional().nullable(),
    selectedTags: zod_1.z.array(zod_1.z.string().max(50)).max(6).optional().nullable(),
    gender: zod_1.z.string().optional().nullable(),
    age: zod_1.z
        .union([zod_1.z.number(), zod_1.z.string(), zod_1.z.literal("")])
        .optional()
        .nullable(),
    blockedUsers: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    radarRange: zod_1.z.number().min(10).max(50).optional().nullable(),
    hotspotRange: zod_1.z.number().min(10).max(50).optional().nullable(),
    is_broadcasting_audio: zod_1.z.boolean().optional().nullable(),
    isGhostMode: zod_1.z.boolean().optional().nullable()
});
var CreateHotspotSchema = zod_1.z.object({
    type: zod_1.z.literal("create_hotspot"),
    user_id: zod_1.z.string(),
    username: zod_1.z.string(),
    avatar_url: zod_1.z.string(),
    vibeEmoji: zod_1.z.string(),
    title: zod_1.z.string().min(1).max(100),
    category: zod_1.z.string().max(50).optional().nullable(),
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
    host_bio: zod_1.z.string().max(200).optional().nullable(),
    host_tags: zod_1.z.array(zod_1.z.string().max(50)).max(6).optional().nullable(),
    host_gender: zod_1.z.string().optional().nullable(),
    host_age: zod_1.z
        .union([zod_1.z.number(), zod_1.z.string(), zod_1.z.literal("")])
        .optional()
        .nullable(),
    hotspotRange: zod_1.z.number().min(10).max(50).optional().nullable(),
    osm_place_id: zod_1.z.number().optional().nullable(),
    osm_place_name: zod_1.z.string().optional().nullable()
});
var RequestJoinSchema = zod_1.z.object({
    type: zod_1.z.literal("request_join"),
    roomId: zod_1.z.string(),
    user_id: zod_1.z.string(),
    username: zod_1.z.string(),
    avatar_url: zod_1.z.string()
});
var RespondJoinSchema = zod_1.z.object({
    type: zod_1.z.literal("respond_join"),
    roomId: zod_1.z.string(),
    guestId: zod_1.z.string(),
    status: zod_1.z["enum"](["accepted", "declined"])
});
var SendMessageSchema = zod_1.z.object({
    type: zod_1.z.literal("send_message"),
    roomId: zod_1.z.string(),
    text: zod_1.z.string().min(1).max(500),
    sender_id: zod_1.z.string(),
    sender_username: zod_1.z.string(),
    sender_avatar: zod_1.z.string()
});
var LeaveHotspotSchema = zod_1.z.object({
    type: zod_1.z.literal("leave_hotspot"),
    roomId: zod_1.z.string(),
    user_id: zod_1.z.string()
});
var SendWaveSchema = zod_1.z.object({
    type: zod_1.z.literal("send_wave"),
    target_user_id: zod_1.z.string(),
    sender_id: zod_1.z.string(),
    sender_username: zod_1.z.string()
});
var SendChatRequestSchema = zod_1.z.object({
    type: zod_1.z.literal("send_chat_request"),
    target_user_id: zod_1.z.string()
});
var RespondChatRequestSchema = zod_1.z.object({
    type: zod_1.z.literal("respond_chat_request"),
    sender_id: zod_1.z.string(),
    status: zod_1.z["enum"](["accepted", "rejected"])
});
var SendDirectMessageSchema = zod_1.z.object({
    type: zod_1.z.literal("send_direct_message"),
    recipient_id: zod_1.z.string(),
    text: zod_1.z.string().min(1).max(500)
});
var DirectMessageTypingSchema = zod_1.z.object({
    type: zod_1.z.literal("direct_message_typing"),
    recipient_id: zod_1.z.string(),
    is_typing: zod_1.z.boolean()
});
var RequestChatsSchema = zod_1.z.object({
    type: zod_1.z.literal("request_chats"),
    user_id: zod_1.z.string().optional()
});
// ── Call Signaling Schemas ──
var CallRequestSchema = zod_1.z.object({
    type: zod_1.z.literal("call_request"),
    target_user_id: zod_1.z.string(),
    caller_id: zod_1.z.string(),
    caller_username: zod_1.z.string(),
    caller_avatar: zod_1.z.string().optional().nullable()
});
var CallResponseSchema = zod_1.z.object({
    type: zod_1.z.literal("call_response"),
    target_user_id: zod_1.z.string(),
    responder_id: zod_1.z.string(),
    status: zod_1.z["enum"](["accepted", "rejected"])
});
var CallEndSchema = zod_1.z.object({
    type: zod_1.z.literal("call_end"),
    target_user_id: zod_1.z.string()
});
// ── WebRTC Signaling Schemas ──
var RTCOfferSchema = zod_1.z.object({
    type: zod_1.z.literal("rtc_offer"),
    target_user_id: zod_1.z.string(),
    sender_id: zod_1.z.string(),
    offer: zod_1.z.any()
});
var RTCAnswerSchema = zod_1.z.object({
    type: zod_1.z.literal("rtc_answer"),
    target_user_id: zod_1.z.string(),
    sender_id: zod_1.z.string(),
    answer: zod_1.z.any()
});
var RTCICECandidateSchema = zod_1.z.object({
    type: zod_1.z.literal("rtc_ice_candidate"),
    target_user_id: zod_1.z.string(),
    sender_id: zod_1.z.string(),
    candidate: zod_1.z.any()
});
var IncomingMessageSchema = zod_1.z.discriminatedUnion("type", [
    zod_1.z.object({ type: zod_1.z.literal("request_sync"), user_id: zod_1.z.string().optional() }),
    LocationUpdateSchema,
    CreateHotspotSchema,
    RequestJoinSchema,
    RespondJoinSchema,
    SendMessageSchema,
    LeaveHotspotSchema,
    SendWaveSchema,
    SendChatRequestSchema,
    RespondChatRequestSchema,
    SendDirectMessageSchema,
    DirectMessageTypingSchema,
    RequestChatsSchema,
    RTCOfferSchema,
    RTCAnswerSchema,
    RTCICECandidateSchema,
    CallRequestSchema,
    CallResponseSchema,
    CallEndSchema,
]);
// ── In-Memory Fallback State (used if Redis is inactive/not configured) ──────
var clientsLocal = new Map();
var hotspotsLocal = new Map();
var lastBroadcastTime = new Map(); // userId -> timestamp for throttle
var lastSyncTime = new Map(); // ws -> timestamp for sync throttle
var rateLimits = new Map();
// Chat state (local fallback)
var chatRequestsLocal = new Map(); // key: "senderId:targetId"
var directMessagesLocal = new Map(); // key: "sortedUserA:sortedUserB"
// ── Redis Clients ────────────────────────────────────────────────────────────
var redisPub = null;
var redisSub = null;
var useRedis = false;
// ── Clean Expired Data Loop (1 min) ──────────────────────────────────────────
setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
    var now, dayAgo, expiredTimer, expiredIds, pipeline_1, e_1, changed, _i, _a, _b, id, hotspot, _c, _d, _e, key, req, _f, _g, _h, convoId, msgs, filtered;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                now = Date.now();
                dayAgo = now - 24 * 60 * 60 * 1000;
                if (!(useRedis && redisPub)) return [3 /*break*/, 7];
                _j.label = 1;
            case 1:
                _j.trys.push([1, 5, , 6]);
                expiredTimer = metricRedisCommands.startTimer({
                    command: "ZRANGEBYSCORE"
                });
                return [4 /*yield*/, redisPub.zRangeByScore("norby:hotspot_expirations", 0, now)];
            case 2:
                expiredIds = _j.sent();
                expiredTimer();
                if (!(expiredIds.length > 0)) return [3 /*break*/, 4];
                pipeline_1 = redisPub.multi();
                expiredIds.forEach(function (id) {
                    pipeline_1.hDel("norby:hotspots", id);
                    pipeline_1.zRem("norby:hotspot_locations", id);
                    pipeline_1.zRem("norby:hotspot_expirations", id);
                });
                return [4 /*yield*/, pipeline_1.exec()];
            case 3:
                _j.sent();
                expiredIds.forEach(function (id) { return logEvent("hotspot_expired", { id: id }); });
                publishHotspotUpdate();
                _j.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                e_1 = _j.sent();
                logEvent("redis_cleanup_error", { error: e_1.message });
                return [3 /*break*/, 6];
            case 6: return [3 /*break*/, 8];
            case 7:
                changed = false;
                for (_i = 0, _a = hotspotsLocal.entries(); _i < _a.length; _i++) {
                    _b = _a[_i], id = _b[0], hotspot = _b[1];
                    if (hotspot.expires_at < now) {
                        hotspotsLocal["delete"](id);
                        changed = true;
                        logEvent("local_hotspot_expired", { id: id });
                    }
                }
                if (changed) {
                    broadcastLocal({
                        type: "hotspots_list",
                        hotspots: Array.from(hotspotsLocal.values())
                    });
                }
                // Prune local expired chat requests
                for (_c = 0, _d = chatRequestsLocal.entries(); _c < _d.length; _c++) {
                    _e = _d[_c], key = _e[0], req = _e[1];
                    if (req.timestamp < dayAgo) {
                        chatRequestsLocal["delete"](key);
                        logEvent("local_chat_request_expired", { key: key });
                    }
                }
                // Prune local expired direct messages
                for (_f = 0, _g = directMessagesLocal.entries(); _f < _g.length; _f++) {
                    _h = _g[_f], convoId = _h[0], msgs = _h[1];
                    filtered = msgs.filter(function (m) { return m.timestamp > dayAgo; });
                    if (filtered.length !== msgs.length) {
                        if (filtered.length === 0) {
                            directMessagesLocal["delete"](convoId);
                        }
                        else {
                            directMessagesLocal.set(convoId, filtered);
                        }
                        logEvent("local_dms_expired", {
                            convoId: convoId,
                            deleted_count: msgs.length - filtered.length
                        });
                    }
                }
                _j.label = 8;
            case 8: return [2 /*return*/];
        }
    });
}); }, 60 * 1000);
// Health check + static endpoint server
var server = http_1.createServer(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var health, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (req.url === "/health") {
                    health = {
                        status: "ok",
                        timestamp: new Date().toISOString(),
                        redis: {
                            enabled: useRedis,
                            connected: useRedis && (redisPub === null || redisPub === void 0 ? void 0 : redisPub.isOpen) ? "connected" : "disconnected"
                        },
                        clients: wss.clients.size
                    };
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(health));
                    return [2 /*return*/];
                }
                if (!(req.url === "/metrics")) return [3 /*break*/, 2];
                res.writeHead(200, { "Content-Type": client.register.contentType });
                _b = (_a = res).end;
                return [4 /*yield*/, client.register.metrics()];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
            case 2:
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("Norby WebSocket server is running.");
                return [2 /*return*/];
        }
    });
}); });
var wss = new ws_1.WebSocketServer({ server: server });
// ── Local Broadcast ──────────────────────────────────────────────────────────
function broadcastLocal(msg) {
    var payload = JSON.stringify(msg);
    wss.clients.forEach(function (client) {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(payload);
            metricMessagesSent.inc({ type: "local_broadcast" });
        }
    });
}
// ── Find Local Socket by User ID ─────────────────────────────────────────────
function findLocalSocketByUserId(userId) {
    for (var _i = 0, _a = clientsLocal.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], ws = _b[0], info = _b[1];
        if (info.user_id === userId && ws.readyState === ws_1.WebSocket.OPEN) {
            return ws;
        }
    }
    return null;
}
// ── Chat Synchronization Helpers ─────────────────────────────────────────────
function sendChatsSync(ws, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var dayAgo, allRequests, metricEnd, fetchEnd, raw, e_2, _i, _a, _b, key, req, uniqueRequests;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    dayAgo = Date.now() - 24 * 60 * 60 * 1000;
                    allRequests = [];
                    if (!(useRedis && redisPub)) return [3 /*break*/, 6];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    metricEnd = metricRedisCommands.startTimer({
                        command: "ZREMRANGEBYSCORE"
                    });
                    return [4 /*yield*/, redisPub.zRemRangeByScore("norby:chat_reqs:" + userId, 0, dayAgo)];
                case 2:
                    _c.sent();
                    metricEnd();
                    fetchEnd = metricRedisCommands.startTimer({ command: "ZRANGE" });
                    return [4 /*yield*/, redisPub.zRange("norby:chat_reqs:" + userId, 0, -1)];
                case 3:
                    raw = _c.sent();
                    fetchEnd();
                    allRequests = raw.map(function (r) { return JSON.parse(r); });
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _c.sent();
                    logEvent("redis_sync_chats_error", { error: e_2.message });
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    // Local fallback
                    for (_i = 0, _a = chatRequestsLocal.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], req = _b[1];
                        if (req.timestamp < dayAgo) {
                            chatRequestsLocal["delete"](key);
                        }
                        else if (req.sender_id === userId || req.target_id === userId) {
                            allRequests.push(req);
                        }
                    }
                    _c.label = 7;
                case 7:
                    uniqueRequests = Array.from(new Map(allRequests.map(function (r) { return [r.sender_id + ":" + r.target_id, r]; })).values());
                    ws.send(JSON.stringify({
                        type: "chats_list",
                        requests: uniqueRequests
                    }));
                    metricMessagesSent.inc({ type: "chats_list" });
                    return [2 /*return*/];
            }
        });
    });
}
function triggerChatsSync(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var localSocket, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    localSocket = findLocalSocketByUserId(userId);
                    if (!localSocket) return [3 /*break*/, 2];
                    return [4 /*yield*/, sendChatsSync(localSocket, userId)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!(useRedis && redisPub)) return [3 /*break*/, 6];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                            target_user_id: userId,
                            payload: {
                                type: "chats_sync_needed"
                            }
                        }))];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_3 = _a.sent();
                    logEvent("redis_trigger_chats_sync_failed", { error: e_3.message });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// ── Redis Communication Helpers ──────────────────────────────────────────────
function publishHotspotUpdate() {
    return __awaiter(this, void 0, void 0, function () {
        var all, list, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!redisPub) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, redisPub.hGetAll("norby:hotspots")];
                case 2:
                    all = _a.sent();
                    list = Object.values(all).map(function (h) { return JSON.parse(h); });
                    return [4 /*yield*/, redisPub.publish("norby:hotspots_updates", JSON.stringify({
                            type: "hotspots_list",
                            hotspots: list
                        }))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_4 = _a.sent();
                    logEvent("redis_publish_hotspots_error", { error: e_4.message });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// ── Secure Sync & Broadcast Helpers ──────────────────────────────────────────
function getDistanceKm(lat1, lon1, lat2, lon2) {
    if (Math.abs(lat1 - lat2) > 0.35 || Math.abs(lon1 - lon2) > 0.35) {
        return 999999;
    }
    var R = 6371; // Radius of the earth in km
    var dLat = (lat2 - lat1) * (Math.PI / 180);
    var dLon = (lon2 - lon1) * (Math.PI / 180);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}
function sendSync(ws) {
    return __awaiter(this, void 0, void 0, function () {
        var endTimer, clientInfo, allUsers, allHotspots, maxRange, nearbyUserIds, rawUsers, now_1, nearbyHotspotIds_1, validHotspots_1, expiredHotspotIds_1, fetchTimer, rawHotspots, purgePipeline_1, e_5, activeUsers, activeHotspots;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endTimer = metricSyncDuration.startTimer();
                    clientInfo = clientsLocal.get(ws);
                    if (!clientInfo) {
                        endTimer();
                        return [2 /*return*/];
                    }
                    if (clientInfo.lat === 0 && clientInfo.lng === 0) {
                        // BUG-19: Skip geo operations when coordinates are 0,0
                        ws.send(JSON.stringify({
                            type: "sync",
                            users: [],
                            hotspots: []
                        }));
                        endTimer();
                        return [2 /*return*/];
                    }
                    allUsers = [];
                    allHotspots = [];
                    if (!(useRedis && redisPub)) return [3 /*break*/, 13];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, , 12]);
                    return [4 /*yield*/, redisPub.set("norby:user_session:" + clientInfo.user_id, ws.socketId || "default", { EX: 45 })];
                case 2:
                    _a.sent();
                    maxRange = Math.max(10, Math.min(50, clientInfo.radarRange || 15));
                    return [4 /*yield*/, redisPub.geoSearch("norby:user_locations", { latitude: clientInfo.lat, longitude: clientInfo.lng }, { radius: maxRange, unit: "km" })];
                case 3:
                    nearbyUserIds = _a.sent();
                    if (!(nearbyUserIds && nearbyUserIds.length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, redisPub.hmGet("norby:active_users", nearbyUserIds)];
                case 4:
                    rawUsers = (_a.sent());
                    now_1 = Date.now();
                    allUsers = rawUsers
                        .filter(Boolean)
                        .map(function (u) { return JSON.parse(u); })
                        .filter(function (user) {
                        var isAlive = now_1 - (user.last_seen || 0) <= 45000;
                        return isAlive;
                    });
                    _a.label = 5;
                case 5: return [4 /*yield*/, redisPub.geoSearch("norby:hotspot_locations", { latitude: clientInfo.lat, longitude: clientInfo.lng }, { radius: maxRange, unit: "km" })];
                case 6:
                    nearbyHotspotIds_1 = _a.sent();
                    validHotspots_1 = [];
                    expiredHotspotIds_1 = [];
                    if (!(nearbyHotspotIds_1 && nearbyHotspotIds_1.length > 0)) return [3 /*break*/, 8];
                    fetchTimer = metricRedisCommands.startTimer({ command: "HMGET" });
                    return [4 /*yield*/, redisPub.hmGet("norby:hotspots", nearbyHotspotIds_1)];
                case 7:
                    rawHotspots = _a.sent();
                    fetchTimer();
                    rawHotspots.forEach(function (raw, i) {
                        if (!raw)
                            return;
                        try {
                            var h = JSON.parse(raw);
                            if (h.expires_at > Date.now()) {
                                validHotspots_1.push(h);
                            }
                            else {
                                expiredHotspotIds_1.push(nearbyHotspotIds_1[i]);
                            }
                        }
                        catch (_a) {
                            expiredHotspotIds_1.push(nearbyHotspotIds_1[i]);
                        }
                    });
                    _a.label = 8;
                case 8:
                    if (!(expiredHotspotIds_1.length > 0)) return [3 /*break*/, 10];
                    logEvent("redis_purge_expired_hotspots", {
                        count: expiredHotspotIds_1.length
                    });
                    purgePipeline_1 = redisPub.multi();
                    expiredHotspotIds_1.forEach(function (rid) {
                        purgePipeline_1.zRem("norby:hotspot_locations", rid);
                        purgePipeline_1.hDel("norby:hotspots", rid);
                        purgePipeline_1.zRem("norby:hotspot_expirations", rid);
                    });
                    return [4 /*yield*/, purgePipeline_1.exec()];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10:
                    allHotspots = validHotspots_1;
                    return [3 /*break*/, 12];
                case 11:
                    e_5 = _a.sent();
                    logEvent("redis_geo_sync_failed", { error: e_5.message });
                    return [3 /*break*/, 12];
                case 12: return [3 /*break*/, 14];
                case 13:
                    allUsers = Array.from(clientsLocal.values());
                    allHotspots = Array.from(hotspotsLocal.values());
                    _a.label = 14;
                case 14:
                    activeUsers = allUsers.filter(function (u) {
                        if (!u.lat || !u.lng)
                            return false;
                        if (u.user_id === clientInfo.user_id)
                            return false;
                        if (u.isGhostMode)
                            return false; // BUG-09: Filter out ghost mode users
                        var iBlockedU = (clientInfo.blockedUsers || []).includes(u.user_id);
                        var uBlockedMe = (u.blockedUsers || []).includes(clientInfo.user_id);
                        if (iBlockedU || uBlockedMe)
                            return false;
                        var distance = getDistanceKm(clientInfo.lat, clientInfo.lng, u.lat, u.lng);
                        var maxRange = Math.max(10, Math.min(50, clientInfo.radarRange || 15));
                        return distance <= maxRange;
                    });
                    activeHotspots = allHotspots.filter(function (h) {
                        if (h.expires_at <= Date.now())
                            return false;
                        var iBlockedHost = (clientInfo.blockedUsers || []).includes(h.host_id);
                        var hostInfo = Array.from(clientsLocal.values()).find(function (u) { return u.user_id === h.host_id; });
                        var hostBlockedMe = ((hostInfo === null || hostInfo === void 0 ? void 0 : hostInfo.blockedUsers) || []).includes(clientInfo.user_id);
                        if (iBlockedHost || hostBlockedMe)
                            return false;
                        return true;
                    });
                    ws.send(JSON.stringify({
                        type: "sync",
                        users: activeUsers,
                        hotspots: activeHotspots
                    }));
                    return [2 /*return*/];
            }
        });
    });
}
function broadcastLocationUpdate(data, senderWs) {
    if (data.isGhostMode)
        return; // BUG-09: Do not broadcast location of ghost mode users
    wss.clients.forEach(function (client) {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            if (senderWs && client === senderWs)
                return;
            var recipientInfo = clientsLocal.get(client);
            if (recipientInfo) {
                if (recipientInfo.user_id === data.user_id)
                    return;
                var iBlockedU = (data.blockedUsers || []).includes(recipientInfo.user_id);
                var uBlockedMe = (recipientInfo.blockedUsers || []).includes(data.user_id);
                if (iBlockedU || uBlockedMe)
                    return;
                // If recipient has no valid coordinates yet, don't leak other locations to them
                if (recipientInfo.lat === 0 ||
                    recipientInfo.lng === 0 ||
                    !recipientInfo.lat ||
                    !recipientInfo.lng) {
                    return;
                }
                var distance = getDistanceKm(recipientInfo.lat, recipientInfo.lng, data.lat, data.lng);
                var maxRange = Math.max(10, Math.min(50, recipientInfo.radarRange || 15));
                if (distance > maxRange)
                    return;
            }
            client.send(JSON.stringify({
                type: "location_update",
                data: data
            }));
        }
    });
}
// ── Connection Handler ───────────────────────────────────────────────────────
wss.on("connection", function (ws) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        ws.socketId = crypto_1["default"].randomUUID();
        logEvent("client_connected", {
            connected_clients: wss.clients.size,
            socket_id: ws.socketId
        });
        ws.isAlive = true;
        ws.on("pong", function () {
            ws.isAlive = true;
        });
        ws.on("message", function (raw) { return __awaiter(void 0, void 0, void 0, function () {
            var now, limit, info, parsedData, validation, data, boundClient, incomingUserId, userId, existing, info_1, infoBlocks_1, existingBlocks, blocksChanged, rawHotspots, _i, _a, _b, rid, rawH, hotspot, isHostBlocker, changed, initialLen, isGuestBlocked, initialLen, e_6, _loop_1, _c, _d, _e, rid, hotspot, nowBroadcast, lastTime, nowBroadcast, lastTime, nowSync, lastSync, roomId, hostId, newHotspot, roomId, user_id_1, username, avatar_url, rawHotspot, hotspot, request, hotspot, request, hostSocket, roomId, guestId_1, status, responderInfo, rawHotspot, hotspot, request, hotspot, request, guestSocket, roomId_1, text, sender_id_1, sender_username, sender_avatar, sanitizedText, rawHotspot, hotspot, member, isHost, newMessage, hotspot, member, isHost, newMessage_1, recipientIds, roomId_2, user_id_2, rawHotspot, hotspot, hotspot_1, localUids, target_user_id, sender_id, sender_username, exists, targetSocket, target_user_id, senderInfo, exists, reqKey_1, existingRequest, raw_2, parsed, newRequest, payload, targetSocket, sender_id, status, responderInfo, reqKey, request, oldPayload, raw_3, _f, raw_1, r, parsed, payload, senderSocket_1, senderSocket, recipient_id, text, senderInfo, exists, msgId, directMsg, convoId, list, recipientSocket, recipient_id, is_typing, senderInfo, recipientSocket, userId, target_user_id, senderInfo, exists, targetSocket, activeUserIds, e_7;
            var _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        now = Date.now();
                        limit = rateLimits.get(ws);
                        if (!limit || now > limit.resetAt) {
                            limit = { count: 1, resetAt: now + 1000 };
                            rateLimits.set(ws, limit);
                        }
                        else {
                            limit.count++;
                            if (limit.count > 20) {
                                info = clientsLocal.get(ws);
                                logEvent("rate_limit_exceeded", {
                                    user_id: info === null || info === void 0 ? void 0 : info.user_id,
                                    username: info === null || info === void 0 ? void 0 : info.username
                                });
                                ws.send(JSON.stringify({
                                    type: "error",
                                    message: "Rate limit exceeded (max 20 messages/second)"
                                }));
                                return [2 /*return*/];
                            }
                        }
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 121, , 122]);
                        parsedData = JSON.parse(raw.toString());
                        validation = IncomingMessageSchema.safeParse(parsedData);
                        if (!validation.success) {
                            logEvent("message_validation_failed", {
                                error: validation.error.format(),
                                rawData: parsedData
                            });
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "Message validation failed"
                            }));
                            return [2 /*return*/];
                        }
                        data = validation.data;
                        metricMessagesReceived.inc({ type: data.type });
                        boundClient = clientsLocal.get(ws);
                        if (boundClient) {
                            incomingUserId = data.type === "respond_chat_request"
                                ? null
                                : data.user_id || data.sender_id;
                            if (incomingUserId && incomingUserId !== boundClient.user_id) {
                                logEvent("identity_mismatch_rejected", {
                                    bound_id: boundClient.user_id,
                                    incoming_id: incomingUserId,
                                    type: data.type
                                });
                                ws.send(JSON.stringify({
                                    type: "error",
                                    message: "Identity mismatch"
                                }));
                                return [2 /*return*/];
                            }
                        }
                        else if (data.type !== "location_update" &&
                            data.type !== "request_chats" &&
                            data.type !== "request_sync") {
                            logEvent("unregistered_client_action_rejected", { type: data.type });
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "Client must register location first"
                            }));
                            return [2 /*return*/];
                        }
                        if (!(data.type === "request_sync")) return [3 /*break*/, 3];
                        userId = data.user_id;
                        if (userId && !clientsLocal.has(ws)) {
                            clientsLocal.set(ws, {
                                user_id: userId,
                                username: "",
                                avatar_url: "",
                                vibeEmoji: "☕",
                                lat: 0,
                                lng: 0,
                                last_seen: Date.now()
                            });
                        }
                        return [4 /*yield*/, sendSync(ws)];
                    case 2:
                        _h.sent();
                        return [2 /*return*/];
                    case 3:
                        if (!(data.type === "location_update")) return [3 /*break*/, 24];
                        existing = clientsLocal.get(ws);
                        info_1 = {
                            user_id: data.user_id,
                            username: data.username,
                            avatar_url: data.avatar_url || (existing === null || existing === void 0 ? void 0 : existing.avatar_url) || "",
                            vibeEmoji: data.vibeEmoji || (existing === null || existing === void 0 ? void 0 : existing.vibeEmoji) || "☕",
                            lat: data.lat,
                            lng: data.lng,
                            last_seen: Date.now(),
                            bio: data.bio !== undefined
                                ? sanitizeInput(data.bio)
                                : (existing === null || existing === void 0 ? void 0 : existing.bio) || "",
                            projectDescription: data.projectDescription !== undefined
                                ? sanitizeInput(data.projectDescription)
                                : (existing === null || existing === void 0 ? void 0 : existing.projectDescription) || "",
                            openTo: data.openTo !== undefined
                                ? (data.openTo || [])
                                    .slice(0, 9)
                                    .map(function (value) { return sanitizeInput(value); })
                                : (existing === null || existing === void 0 ? void 0 : existing.openTo) || [],
                            selectedTags: data.selectedTags !== undefined
                                ? data.selectedTags || []
                                : (existing === null || existing === void 0 ? void 0 : existing.selectedTags) || [],
                            gender: data.gender !== undefined
                                ? data.gender || ""
                                : (existing === null || existing === void 0 ? void 0 : existing.gender) || "",
                            age: typeof data.age === "number" ? data.age : existing === null || existing === void 0 ? void 0 : existing.age,
                            blockedUsers: data.blockedUsers !== undefined
                                ? data.blockedUsers || []
                                : (existing === null || existing === void 0 ? void 0 : existing.blockedUsers) || [],
                            radarRange: typeof data.radarRange === "number"
                                ? Math.max(10, Math.min(50, data.radarRange))
                                : (existing === null || existing === void 0 ? void 0 : existing.radarRange) || 15,
                            hotspotRange: typeof data.hotspotRange === "number"
                                ? Math.max(10, Math.min(50, data.hotspotRange))
                                : (existing === null || existing === void 0 ? void 0 : existing.hotspotRange) || 15,
                            is_broadcasting_audio: data.is_broadcasting_audio !== undefined
                                ? !!data.is_broadcasting_audio
                                : (existing === null || existing === void 0 ? void 0 : existing.is_broadcasting_audio) || false,
                            isGhostMode: data.isGhostMode !== undefined
                                ? !!data.isGhostMode
                                : (existing === null || existing === void 0 ? void 0 : existing.isGhostMode) || false
                        };
                        clientsLocal.set(ws, info_1);
                        infoBlocks_1 = info_1.blockedUsers || [];
                        existingBlocks = (existing === null || existing === void 0 ? void 0 : existing.blockedUsers) || [];
                        blocksChanged = JSON.stringify(__spreadArrays(infoBlocks_1).sort()) !==
                            JSON.stringify(__spreadArrays(existingBlocks).sort());
                        if (!(infoBlocks_1.length > 0 && blocksChanged)) return [3 /*break*/, 14];
                        if (!(useRedis && redisPub)) return [3 /*break*/, 13];
                        _h.label = 4;
                    case 4:
                        _h.trys.push([4, 11, , 12]);
                        return [4 /*yield*/, redisPub.hGetAll("norby:hotspots")];
                    case 5:
                        rawHotspots = _h.sent();
                        _i = 0, _a = Object.entries(rawHotspots);
                        _h.label = 6;
                    case 6:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        _b = _a[_i], rid = _b[0], rawH = _b[1];
                        hotspot = JSON.parse(rawH);
                        isHostBlocker = hotspot.host_id === info_1.user_id;
                        changed = false;
                        if (isHostBlocker) {
                            initialLen = hotspot.requests.length;
                            hotspot.requests = hotspot.requests.filter(function (r) { return !infoBlocks_1.includes(r.user_id); });
                            if (hotspot.requests.length !== initialLen)
                                changed = true;
                        }
                        else {
                            isGuestBlocked = infoBlocks_1.includes(hotspot.host_id);
                            if (isGuestBlocked) {
                                initialLen = hotspot.requests.length;
                                hotspot.requests = hotspot.requests.filter(function (r) { return r.user_id !== info_1.user_id; });
                                if (hotspot.requests.length !== initialLen)
                                    changed = true;
                            }
                        }
                        if (!changed) return [3 /*break*/, 9];
                        return [4 /*yield*/, redisPub.hSet("norby:hotspots", rid, JSON.stringify(hotspot))];
                    case 7:
                        _h.sent();
                        return [4 /*yield*/, redisPub.publish("norby:chat_messages", JSON.stringify({
                                roomId: rid,
                                rosterUpdateOnly: true,
                                hotspot: hotspot
                            }))];
                    case 8:
                        _h.sent();
                        _h.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 6];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        e_6 = _h.sent();
                        logEvent("kick_on_block_failed", { error: e_6.message });
                        return [3 /*break*/, 12];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        _loop_1 = function (rid, hotspot) {
                            var isHostBlocker = hotspot.host_id === info_1.user_id;
                            var changed = false;
                            if (isHostBlocker) {
                                var initialLen = hotspot.requests.length;
                                hotspot.requests = hotspot.requests.filter(function (r) { return !infoBlocks_1.includes(r.user_id); });
                                if (hotspot.requests.length !== initialLen)
                                    changed = true;
                            }
                            else {
                                var isGuestBlocked = infoBlocks_1.includes(hotspot.host_id);
                                if (isGuestBlocked) {
                                    var initialLen = hotspot.requests.length;
                                    hotspot.requests = hotspot.requests.filter(function (r) { return r.user_id !== info_1.user_id; });
                                    if (hotspot.requests.length !== initialLen)
                                        changed = true;
                                }
                            }
                            if (changed) {
                                var localUids = hotspot.requests
                                    .filter(function (r) { return r.status === "accepted"; })
                                    .map(function (r) { return r.user_id; });
                                localUids.push(hotspot.host_id);
                                localUids.forEach(function (uid) {
                                    var cs = findLocalSocketByUserId(uid);
                                    if (cs)
                                        cs.send(JSON.stringify({
                                            type: "room_sync",
                                            roomId: rid,
                                            hotspot: hotspot
                                        }));
                                });
                            }
                        };
                        // Local fallback
                        for (_c = 0, _d = hotspotsLocal.entries(); _c < _d.length; _c++) {
                            _e = _d[_c], rid = _e[0], hotspot = _e[1];
                            _loop_1(rid, hotspot);
                        }
                        _h.label = 14;
                    case 14:
                        if (!(useRedis && redisPub)) return [3 /*break*/, 20];
                        return [4 /*yield*/, redisPub.hSet("norby:active_users", info_1.user_id, JSON.stringify(info_1))];
                    case 15:
                        _h.sent();
                        return [4 /*yield*/, redisPub.geoAdd("norby:user_locations", {
                                longitude: info_1.lng,
                                latitude: info_1.lat,
                                member: info_1.user_id
                            })];
                    case 16:
                        _h.sent();
                        return [4 /*yield*/, redisPub.set("norby:user_session:" + info_1.user_id, ws.socketId || "default", {
                                EX: 45
                            })];
                    case 17:
                        _h.sent();
                        nowBroadcast = Date.now();
                        lastTime = lastBroadcastTime.get(info_1.user_id) || 0;
                        if (!(nowBroadcast - lastTime >= 2000)) return [3 /*break*/, 19];
                        lastBroadcastTime.set(info_1.user_id, nowBroadcast);
                        return [4 /*yield*/, redisPub.publish("norby:location_updates", JSON.stringify({
                                type: "location_update",
                                data: info_1
                            }))];
                    case 18:
                        _h.sent();
                        _h.label = 19;
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        nowBroadcast = Date.now();
                        lastTime = lastBroadcastTime.get(info_1.user_id) || 0;
                        if (nowBroadcast - lastTime >= 2000) {
                            lastBroadcastTime.set(info_1.user_id, nowBroadcast);
                            broadcastLocationUpdate(info_1, ws);
                        }
                        _h.label = 21;
                    case 21:
                        nowSync = Date.now();
                        lastSync = lastSyncTime.get(ws) || 0;
                        if (!(nowSync - lastSync >= 3000)) return [3 /*break*/, 23];
                        lastSyncTime.set(ws, nowSync);
                        return [4 /*yield*/, sendSync(ws)];
                    case 22:
                        _h.sent();
                        _h.label = 23;
                    case 23: return [3 /*break*/, 120];
                    case 24:
                        if (!(data.type === "create_hotspot")) return [3 /*break*/, 31];
                        roomId = "room_" + Math.random().toString(36).substring(2, 8);
                        hostId = data.user_id;
                        newHotspot = {
                            id: roomId,
                            host_id: hostId,
                            host_username: data.username,
                            host_avatar: data.avatar_url || "",
                            title: sanitizeInput(data.title),
                            category: data.category ? sanitizeInput(data.category) : "community",
                            vibeEmoji: data.vibeEmoji || "☕",
                            lat: data.lat,
                            lng: data.lng,
                            created_at: Date.now(),
                            expires_at: Date.now() + 60 * 60 * 1000,
                            requests: [
                                {
                                    user_id: hostId,
                                    username: data.username,
                                    avatar_url: data.avatar_url || "",
                                    status: "accepted"
                                },
                            ],
                            messages: [],
                            host_bio: sanitizeInput(data.host_bio),
                            host_tags: data.host_tags || [],
                            host_gender: data.host_gender || "",
                            host_age: typeof data.host_age === "number" ? data.host_age : undefined,
                            hotspotRange: typeof data.hotspotRange === "number"
                                ? data.hotspotRange
                                : undefined,
                            osm_place_id: typeof data.osm_place_id === "number"
                                ? data.osm_place_id
                                : undefined,
                            osm_place_name: typeof data.osm_place_name === "string"
                                ? data.osm_place_name
                                : undefined
                        };
                        logEvent("hotspot_created", {
                            roomId: roomId,
                            host_id: hostId,
                            title: newHotspot.title
                        });
                        if (!(useRedis && redisPub)) return [3 /*break*/, 29];
                        return [4 /*yield*/, redisPub.hSet("norby:hotspots", roomId, JSON.stringify(newHotspot))];
                    case 25:
                        _h.sent();
                        return [4 /*yield*/, redisPub.geoAdd("norby:hotspot_locations", {
                                longitude: newHotspot.lng,
                                latitude: newHotspot.lat,
                                member: roomId
                            })];
                    case 26:
                        _h.sent();
                        return [4 /*yield*/, redisPub.zAdd("norby:hotspot_expirations", {
                                score: newHotspot.expires_at,
                                value: roomId
                            })];
                    case 27:
                        _h.sent();
                        return [4 /*yield*/, publishHotspotUpdate()];
                    case 28:
                        _h.sent();
                        ws.send(JSON.stringify({
                            type: "hotspot_created",
                            roomId: roomId,
                            hotspot: newHotspot
                        }));
                        return [3 /*break*/, 30];
                    case 29:
                        hotspotsLocal.set(roomId, newHotspot);
                        broadcastLocal({
                            type: "hotspots_list",
                            hotspots: Array.from(hotspotsLocal.values())
                        });
                        ws.send(JSON.stringify({
                            type: "hotspot_created",
                            roomId: roomId,
                            hotspot: newHotspot
                        }));
                        _h.label = 30;
                    case 30: return [3 /*break*/, 120];
                    case 31:
                        if (!(data.type === "request_join")) return [3 /*break*/, 38];
                        roomId = data.roomId, user_id_1 = data.user_id, username = data.username, avatar_url = data.avatar_url;
                        logEvent("join_requested", { roomId: roomId, user_id: user_id_1, username: username });
                        if (!(useRedis && redisPub)) return [3 /*break*/, 36];
                        return [4 /*yield*/, redisPub.hGet("norby:hotspots", roomId)];
                    case 32:
                        rawHotspot = _h.sent();
                        if (!rawHotspot)
                            return [2 /*return*/];
                        hotspot = JSON.parse(rawHotspot);
                        request = hotspot.requests.find(function (r) { return r.user_id === user_id_1; });
                        if (request) {
                            request.status = "pending";
                        }
                        else {
                            request = {
                                user_id: user_id_1,
                                username: username,
                                avatar_url: avatar_url || "",
                                status: "pending"
                            };
                            hotspot.requests.push(request);
                        }
                        return [4 /*yield*/, redisPub.hSet("norby:hotspots", roomId, JSON.stringify(hotspot))];
                    case 33:
                        _h.sent();
                        return [4 /*yield*/, publishHotspotUpdate()];
                    case 34:
                        _h.sent();
                        return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                                target_user_id: hotspot.host_id,
                                payload: {
                                    type: "join_request_received",
                                    roomId: roomId,
                                    username: username,
                                    request: request,
                                    hotspot: hotspot
                                }
                            }))];
                    case 35:
                        _h.sent();
                        ws.send(JSON.stringify({
                            type: "request_status",
                            roomId: roomId,
                            status: "pending"
                        }));
                        return [3 /*break*/, 37];
                    case 36:
                        hotspot = hotspotsLocal.get(roomId);
                        if (!hotspot)
                            return [2 /*return*/];
                        request = hotspot.requests.find(function (r) { return r.user_id === user_id_1; });
                        if (request) {
                            request.status = "pending";
                        }
                        else {
                            request = {
                                user_id: user_id_1,
                                username: username,
                                avatar_url: avatar_url || "",
                                status: "pending"
                            };
                            hotspot.requests.push(request);
                        }
                        broadcastLocal({
                            type: "hotspots_list",
                            hotspots: Array.from(hotspotsLocal.values())
                        });
                        hostSocket = findLocalSocketByUserId(hotspot.host_id);
                        if (hostSocket) {
                            hostSocket.send(JSON.stringify({
                                type: "join_request_received",
                                roomId: roomId,
                                username: username,
                                request: request,
                                hotspot: hotspot
                            }));
                        }
                        ws.send(JSON.stringify({
                            type: "request_status",
                            roomId: roomId,
                            status: "pending"
                        }));
                        _h.label = 37;
                    case 37: return [3 /*break*/, 120];
                    case 38:
                        if (!(data.type === "respond_join")) return [3 /*break*/, 48];
                        roomId = data.roomId, guestId_1 = data.guestId, status = data.status;
                        responderInfo = clientsLocal.get(ws);
                        if (!responderInfo)
                            return [2 /*return*/];
                        logEvent("join_responded", { roomId: roomId, guestId: guestId_1, status: status });
                        if (!(useRedis && redisPub)) return [3 /*break*/, 46];
                        return [4 /*yield*/, redisPub.hGet("norby:hotspots", roomId)];
                    case 39:
                        rawHotspot = _h.sent();
                        if (!rawHotspot)
                            return [2 /*return*/];
                        hotspot = JSON.parse(rawHotspot);
                        // BUG-12: Add host authorization check
                        if (hotspot.host_id !== responderInfo.user_id) {
                            logEvent("unauthorized_join_response_attempt", {
                                roomId: roomId,
                                host_id: hotspot.host_id,
                                attempted_by: responderInfo.user_id
                            });
                            return [2 /*return*/];
                        }
                        request = hotspot.requests.find(function (r) { return r.user_id === guestId_1; });
                        if (!request) return [3 /*break*/, 45];
                        request.status = status;
                        return [4 /*yield*/, redisPub.hSet("norby:hotspots", roomId, JSON.stringify(hotspot))];
                    case 40:
                        _h.sent();
                        return [4 /*yield*/, publishHotspotUpdate()];
                    case 41:
                        _h.sent();
                        return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                                target_user_id: guestId_1,
                                payload: {
                                    type: "join_response",
                                    roomId: roomId,
                                    status: status,
                                    hotspot: hotspot
                                }
                            }))];
                    case 42:
                        _h.sent();
                        if (!(status === "accepted")) return [3 /*break*/, 44];
                        return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                                target_user_id: guestId_1,
                                payload: {
                                    type: "room_sync",
                                    roomId: roomId,
                                    hotspot: hotspot
                                }
                            }))];
                    case 43:
                        _h.sent();
                        _h.label = 44;
                    case 44:
                        ws.send(JSON.stringify({ type: "room_sync", roomId: roomId, hotspot: hotspot }));
                        _h.label = 45;
                    case 45: return [3 /*break*/, 47];
                    case 46:
                        hotspot = hotspotsLocal.get(roomId);
                        if (!hotspot)
                            return [2 /*return*/];
                        // BUG-12: Add host authorization check for local fallback
                        if (hotspot.host_id !== responderInfo.user_id) {
                            logEvent("unauthorized_join_response_attempt_local", {
                                roomId: roomId,
                                host_id: hotspot.host_id,
                                attempted_by: responderInfo.user_id
                            });
                            return [2 /*return*/];
                        }
                        request = hotspot.requests.find(function (r) { return r.user_id === guestId_1; });
                        if (request) {
                            request.status = status;
                            broadcastLocal({
                                type: "hotspots_list",
                                hotspots: Array.from(hotspotsLocal.values())
                            });
                            guestSocket = findLocalSocketByUserId(guestId_1);
                            if (guestSocket) {
                                guestSocket.send(JSON.stringify({
                                    type: "join_response",
                                    roomId: roomId,
                                    status: status,
                                    hotspot: hotspot
                                }));
                                if (status === "accepted") {
                                    guestSocket.send(JSON.stringify({ type: "room_sync", roomId: roomId, hotspot: hotspot }));
                                }
                            }
                            ws.send(JSON.stringify({ type: "room_sync", roomId: roomId, hotspot: hotspot }));
                        }
                        _h.label = 47;
                    case 47: return [3 /*break*/, 120];
                    case 48:
                        if (!(data.type === "send_message")) return [3 /*break*/, 55];
                        roomId_1 = data.roomId, text = data.text, sender_id_1 = data.sender_id, sender_username = data.sender_username, sender_avatar = data.sender_avatar;
                        sanitizedText = sanitizeInput(text);
                        logEvent("message_sent", { roomId: roomId_1, sender_id: sender_id_1, sender_username: sender_username });
                        if (!(useRedis && redisPub)) return [3 /*break*/, 53];
                        return [4 /*yield*/, redisPub.hGet("norby:hotspots", roomId_1)];
                    case 49:
                        rawHotspot = _h.sent();
                        if (!rawHotspot)
                            return [2 /*return*/];
                        hotspot = JSON.parse(rawHotspot);
                        member = hotspot.requests.find(function (r) { return r.user_id === sender_id_1 && r.status === "accepted"; });
                        isHost = hotspot.host_id === sender_id_1;
                        if (!(member || isHost)) return [3 /*break*/, 52];
                        newMessage = {
                            id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
                            sender_id: sender_id_1,
                            sender_username: sender_username,
                            sender_avatar: sender_avatar || "",
                            text: sanitizedText,
                            timestamp: Date.now()
                        };
                        hotspot.messages.push(newMessage);
                        if (hotspot.messages.length > 100) {
                            hotspot.messages = hotspot.messages.slice(-100);
                        }
                        return [4 /*yield*/, redisPub.hSet("norby:hotspots", roomId_1, JSON.stringify(hotspot))];
                    case 50:
                        _h.sent();
                        return [4 /*yield*/, redisPub.publish("norby:chat_messages", JSON.stringify({
                                roomId: roomId_1,
                                message: newMessage,
                                members: hotspot.requests
                                    .filter(function (r) { return r.status === "accepted"; })
                                    .map(function (r) { return r.user_id; }),
                                host_id: hotspot.host_id
                            }))];
                    case 51:
                        _h.sent();
                        _h.label = 52;
                    case 52: return [3 /*break*/, 54];
                    case 53:
                        hotspot = hotspotsLocal.get(roomId_1);
                        if (!hotspot)
                            return [2 /*return*/];
                        member = hotspot.requests.find(function (r) { return r.user_id === sender_id_1 && r.status === "accepted"; });
                        isHost = hotspot.host_id === sender_id_1;
                        if (member || isHost) {
                            newMessage_1 = {
                                id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
                                sender_id: sender_id_1,
                                sender_username: sender_username,
                                sender_avatar: sender_avatar || "",
                                text: sanitizedText,
                                timestamp: Date.now()
                            };
                            hotspot.messages.push(newMessage_1);
                            if (hotspot.messages.length > 100) {
                                hotspot.messages = hotspot.messages.slice(-100);
                            }
                            recipientIds = hotspot.requests
                                .filter(function (r) { return r.status === "accepted"; })
                                .map(function (r) { return r.user_id; });
                            if (!recipientIds.includes(hotspot.host_id)) {
                                recipientIds.push(hotspot.host_id);
                            }
                            recipientIds.forEach(function (uid) {
                                var clientSocket = findLocalSocketByUserId(uid);
                                if (clientSocket) {
                                    clientSocket.send(JSON.stringify({
                                        type: "new_message",
                                        roomId: roomId_1,
                                        message: newMessage_1
                                    }));
                                }
                            });
                        }
                        _h.label = 54;
                    case 54: return [3 /*break*/, 120];
                    case 55:
                        if (!(data.type === "leave_hotspot")) return [3 /*break*/, 68];
                        roomId_2 = data.roomId, user_id_2 = data.user_id;
                        logEvent("hotspot_left", { roomId: roomId_2, user_id: user_id_2 });
                        if (!(useRedis && redisPub)) return [3 /*break*/, 66];
                        return [4 /*yield*/, redisPub.hGet("norby:hotspots", roomId_2)];
                    case 56:
                        rawHotspot = _h.sent();
                        if (!rawHotspot)
                            return [2 /*return*/];
                        hotspot = JSON.parse(rawHotspot);
                        if (!(hotspot.host_id === user_id_2)) return [3 /*break*/, 61];
                        return [4 /*yield*/, redisPub.hDel("norby:hotspots", roomId_2)];
                    case 57:
                        _h.sent();
                        return [4 /*yield*/, redisPub.zRem("norby:hotspot_locations", roomId_2)];
                    case 58:
                        _h.sent();
                        return [4 /*yield*/, redisPub.zRem("norby:hotspot_expirations", roomId_2)];
                    case 59:
                        _h.sent();
                        return [4 /*yield*/, publishHotspotUpdate()];
                    case 60:
                        _h.sent();
                        return [3 /*break*/, 65];
                    case 61:
                        hotspot.requests = hotspot.requests.filter(function (r) { return r.user_id !== user_id_2; });
                        return [4 /*yield*/, redisPub.hSet("norby:hotspots", roomId_2, JSON.stringify(hotspot))];
                    case 62:
                        _h.sent();
                        return [4 /*yield*/, publishHotspotUpdate()];
                    case 63:
                        _h.sent();
                        return [4 /*yield*/, redisPub.publish("norby:chat_messages", JSON.stringify({
                                roomId: roomId_2,
                                rosterUpdateOnly: true,
                                hotspot: hotspot
                            }))];
                    case 64:
                        _h.sent();
                        _h.label = 65;
                    case 65: return [3 /*break*/, 67];
                    case 66:
                        hotspot_1 = hotspotsLocal.get(roomId_2);
                        if (!hotspot_1)
                            return [2 /*return*/];
                        if (hotspot_1.host_id === user_id_2) {
                            hotspotsLocal["delete"](roomId_2);
                            broadcastLocal({
                                type: "hotspots_list",
                                hotspots: Array.from(hotspotsLocal.values())
                            });
                        }
                        else {
                            hotspot_1.requests = hotspot_1.requests.filter(function (r) { return r.user_id !== user_id_2; });
                            broadcastLocal({
                                type: "hotspots_list",
                                hotspots: Array.from(hotspotsLocal.values())
                            });
                            localUids = hotspot_1.requests
                                .filter(function (r) { return r.status === "accepted"; })
                                .map(function (r) { return r.user_id; });
                            localUids.push(hotspot_1.host_id);
                            localUids.forEach(function (uid) {
                                var cs = findLocalSocketByUserId(uid);
                                if (cs)
                                    cs.send(JSON.stringify({ type: "room_sync", roomId: roomId_2, hotspot: hotspot_1 }));
                            });
                        }
                        _h.label = 67;
                    case 67: return [3 /*break*/, 120];
                    case 68:
                        if (!(data.type === "send_wave")) return [3 /*break*/, 73];
                        target_user_id = data.target_user_id, sender_id = data.sender_id, sender_username = data.sender_username;
                        return [4 /*yield*/, userExists(target_user_id)];
                    case 69:
                        exists = _h.sent();
                        if (!exists) {
                            logEvent("wave_rejected_target_missing", {
                                target_user_id: target_user_id,
                                sender_id: sender_id
                            });
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "Target user is offline or does not exist."
                            }));
                            return [2 /*return*/];
                        }
                        logEvent("wave_sent", { target_user_id: target_user_id, sender_id: sender_id, sender_username: sender_username });
                        console.log("[socket_server] Wave sent from @" + sender_username + " (" + sender_id + ") targeting: " + target_user_id);
                        if (!(useRedis && redisPub)) return [3 /*break*/, 71];
                        console.log("[socket_server] Publishing wave to Redis for: " + target_user_id);
                        return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                                target_user_id: target_user_id,
                                payload: {
                                    type: "wave_received",
                                    sender_id: sender_id,
                                    sender_username: sender_username
                                }
                            }))];
                    case 70:
                        _h.sent();
                        return [3 /*break*/, 72];
                    case 71:
                        targetSocket = findLocalSocketByUserId(target_user_id);
                        if (targetSocket) {
                            console.log("[socket_server] Wave forwarded to active socket for target user ID: " + target_user_id);
                            targetSocket.send(JSON.stringify({
                                type: "wave_received",
                                sender_id: sender_id,
                                sender_username: sender_username
                            }));
                        }
                        else {
                            console.warn("[socket_server] Wave target socket NOT found for user ID: " + target_user_id);
                        }
                        _h.label = 72;
                    case 72: return [3 /*break*/, 120];
                    case 73:
                        if (!(data.type === "send_chat_request")) return [3 /*break*/, 84];
                        target_user_id = data.target_user_id;
                        senderInfo = clientsLocal.get(ws);
                        if (!senderInfo)
                            return [2 /*return*/];
                        return [4 /*yield*/, userExists(target_user_id)];
                    case 74:
                        exists = _h.sent();
                        if (!exists) {
                            logEvent("chat_request_rejected_target_missing", {
                                target_user_id: target_user_id,
                                sender_id: senderInfo.user_id
                            });
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "Target user is offline or does not exist."
                            }));
                            return [2 /*return*/];
                        }
                        reqKey_1 = senderInfo.user_id + ":" + target_user_id;
                        existingRequest = null;
                        if (!(useRedis && redisPub)) return [3 /*break*/, 76];
                        return [4 /*yield*/, redisPub.zRange("norby:chat_reqs:" + senderInfo.user_id, 0, -1)];
                    case 75:
                        raw_2 = _h.sent();
                        parsed = raw_2.map(function (r) { return JSON.parse(r); });
                        existingRequest =
                            parsed.find(function (r) { return r.sender_id + ":" + r.target_id === reqKey_1; }) ||
                                null;
                        return [3 /*break*/, 77];
                    case 76:
                        existingRequest = chatRequestsLocal.get(reqKey_1) || null;
                        _h.label = 77;
                    case 77:
                        if (existingRequest && existingRequest.status === "pending") {
                            logEvent("chat_request_spam_prevented", {
                                sender_id: senderInfo.user_id,
                                target_id: target_user_id
                            });
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "A pending chat request already exists."
                            }));
                            return [2 /*return*/];
                        }
                        newRequest = {
                            sender_id: senderInfo.user_id,
                            sender_username: senderInfo.username,
                            sender_avatar: senderInfo.avatar_url,
                            target_id: target_user_id,
                            status: "pending",
                            timestamp: Date.now()
                        };
                        logEvent("chat_request_sent", {
                            sender_id: senderInfo.user_id,
                            target_id: target_user_id
                        });
                        if (!(useRedis && redisPub)) return [3 /*break*/, 81];
                        payload = JSON.stringify(newRequest);
                        return [4 /*yield*/, redisPub.zAdd("norby:chat_reqs:" + senderInfo.user_id, {
                                score: newRequest.timestamp,
                                value: payload
                            })];
                    case 78:
                        _h.sent();
                        return [4 /*yield*/, redisPub.zAdd("norby:chat_reqs:" + target_user_id, {
                                score: newRequest.timestamp,
                                value: payload
                            })];
                    case 79:
                        _h.sent();
                        return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                                target_user_id: target_user_id,
                                payload: {
                                    type: "chat_request_received",
                                    request: newRequest
                                }
                            }))];
                    case 80:
                        _h.sent();
                        return [3 /*break*/, 82];
                    case 81:
                        chatRequestsLocal.set(reqKey_1, newRequest);
                        targetSocket = findLocalSocketByUserId(target_user_id);
                        if (targetSocket) {
                            targetSocket.send(JSON.stringify({
                                type: "chat_request_received",
                                request: newRequest
                            }));
                        }
                        _h.label = 82;
                    case 82: return [4 /*yield*/, sendChatsSync(ws, senderInfo.user_id)];
                    case 83:
                        _h.sent();
                        return [3 /*break*/, 120];
                    case 84:
                        if (!(data.type === "respond_chat_request")) return [3 /*break*/, 102];
                        sender_id = data.sender_id, status = data.status;
                        responderInfo = clientsLocal.get(ws);
                        if (!responderInfo)
                            return [2 /*return*/];
                        reqKey = sender_id + ":" + responderInfo.user_id;
                        request = null;
                        oldPayload = null;
                        if (!(useRedis && redisPub)) return [3 /*break*/, 86];
                        return [4 /*yield*/, redisPub.zRange("norby:chat_reqs:" + responderInfo.user_id, 0, -1)];
                    case 85:
                        raw_3 = _h.sent();
                        for (_f = 0, raw_1 = raw_3; _f < raw_1.length; _f++) {
                            r = raw_1[_f];
                            parsed = JSON.parse(r);
                            if (parsed.sender_id + ":" + parsed.target_id === reqKey) {
                                request = parsed;
                                oldPayload = r;
                                break;
                            }
                        }
                        return [3 /*break*/, 87];
                    case 86:
                        request = chatRequestsLocal.get(reqKey) || null;
                        _h.label = 87;
                    case 87:
                        if (!request)
                            return [2 /*return*/];
                        request.status = status;
                        logEvent("chat_request_responded", {
                            sender_id: sender_id,
                            target_id: responderInfo.user_id,
                            status: status
                        });
                        if (!(useRedis && redisPub)) return [3 /*break*/, 95];
                        payload = JSON.stringify(request);
                        if (!oldPayload) return [3 /*break*/, 90];
                        return [4 /*yield*/, redisPub.zRem("norby:chat_reqs:" + sender_id, oldPayload)];
                    case 88:
                        _h.sent();
                        return [4 /*yield*/, redisPub.zRem("norby:chat_reqs:" + responderInfo.user_id, oldPayload)];
                    case 89:
                        _h.sent();
                        _h.label = 90;
                    case 90: return [4 /*yield*/, redisPub.zAdd("norby:chat_reqs:" + sender_id, {
                            score: request.timestamp,
                            value: payload
                        })];
                    case 91:
                        _h.sent();
                        return [4 /*yield*/, redisPub.zAdd("norby:chat_reqs:" + responderInfo.user_id, {
                                score: request.timestamp,
                                value: payload
                            })];
                    case 92:
                        _h.sent();
                        return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                                target_user_id: sender_id,
                                payload: {
                                    type: "chat_request_responded",
                                    request: request
                                }
                            }))];
                    case 93:
                        _h.sent();
                        return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                                target_user_id: responderInfo.user_id,
                                payload: {
                                    type: "chat_request_responded",
                                    request: request
                                }
                            }))];
                    case 94:
                        _h.sent();
                        return [3 /*break*/, 96];
                    case 95:
                        chatRequestsLocal.set(reqKey, request);
                        senderSocket_1 = findLocalSocketByUserId(sender_id);
                        if (senderSocket_1) {
                            senderSocket_1.send(JSON.stringify({
                                type: "chat_request_responded",
                                request: request
                            }));
                        }
                        ws.send(JSON.stringify({
                            type: "chat_request_responded",
                            request: request
                        }));
                        _h.label = 96;
                    case 96: return [4 /*yield*/, sendChatsSync(ws, responderInfo.user_id)];
                    case 97:
                        _h.sent();
                        senderSocket = findLocalSocketByUserId(sender_id);
                        if (!senderSocket) return [3 /*break*/, 99];
                        return [4 /*yield*/, sendChatsSync(senderSocket, sender_id)];
                    case 98:
                        _h.sent();
                        _h.label = 99;
                    case 99: return [4 /*yield*/, triggerChatsSync(sender_id)];
                    case 100:
                        _h.sent();
                        return [4 /*yield*/, triggerChatsSync(responderInfo.user_id)];
                    case 101:
                        _h.sent();
                        return [3 /*break*/, 120];
                    case 102:
                        if (!(data.type === "send_direct_message")) return [3 /*break*/, 109];
                        recipient_id = data.recipient_id, text = data.text;
                        senderInfo = clientsLocal.get(ws);
                        if (!senderInfo)
                            return [2 /*return*/];
                        return [4 /*yield*/, userExists(recipient_id)];
                    case 103:
                        exists = _h.sent();
                        if (!exists) {
                            logEvent("direct_message_rejected_target_missing", {
                                recipient_id: recipient_id,
                                sender_id: senderInfo.user_id
                            });
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "Target user is offline or does not exist."
                            }));
                            return [2 /*return*/];
                        }
                        msgId = "dm_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
                        directMsg = {
                            id: msgId,
                            sender_id: senderInfo.user_id,
                            sender_username: senderInfo.username,
                            sender_avatar: senderInfo.avatar_url,
                            recipient_id: recipient_id,
                            text: sanitizeInput(text),
                            timestamp: Date.now()
                        };
                        convoId = [senderInfo.user_id, recipient_id].sort().join(":");
                        logEvent("direct_message_sent", {
                            convoId: convoId,
                            sender_id: senderInfo.user_id
                        });
                        if (!(useRedis && redisPub)) return [3 /*break*/, 107];
                        return [4 /*yield*/, redisPub.zAdd("norby:dm_history:" + convoId, {
                                score: directMsg.timestamp,
                                value: JSON.stringify(directMsg)
                            })];
                    case 104:
                        _h.sent();
                        return [4 /*yield*/, redisPub.expire("norby:dm_history:" + convoId, 24 * 60 * 60)];
                    case 105:
                        _h.sent();
                        return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                                target_user_id: recipient_id,
                                payload: {
                                    type: "new_direct_message",
                                    message: directMsg
                                }
                            }))];
                    case 106:
                        _h.sent();
                        return [3 /*break*/, 108];
                    case 107:
                        list = directMessagesLocal.get(convoId) || [];
                        list.push(directMsg);
                        directMessagesLocal.set(convoId, list);
                        recipientSocket = findLocalSocketByUserId(recipient_id);
                        if (recipientSocket) {
                            recipientSocket.send(JSON.stringify({
                                type: "new_direct_message",
                                message: directMsg
                            }));
                        }
                        _h.label = 108;
                    case 108:
                        ws.send(JSON.stringify({
                            type: "new_direct_message",
                            message: directMsg
                        }));
                        return [3 /*break*/, 120];
                    case 109:
                        if (!(data.type === "direct_message_typing")) return [3 /*break*/, 113];
                        recipient_id = data.recipient_id, is_typing = data.is_typing;
                        senderInfo = clientsLocal.get(ws);
                        if (!senderInfo)
                            return [2 /*return*/];
                        if (!(useRedis && redisPub)) return [3 /*break*/, 111];
                        return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                                target_user_id: recipient_id,
                                payload: {
                                    type: "direct_message_typing",
                                    sender_id: senderInfo.user_id,
                                    is_typing: is_typing
                                }
                            }))];
                    case 110:
                        _h.sent();
                        return [3 /*break*/, 112];
                    case 111:
                        recipientSocket = findLocalSocketByUserId(recipient_id);
                        if (recipientSocket) {
                            recipientSocket.send(JSON.stringify({
                                type: "direct_message_typing",
                                sender_id: senderInfo.user_id,
                                is_typing: is_typing
                            }));
                        }
                        _h.label = 112;
                    case 112: return [3 /*break*/, 120];
                    case 113:
                        if (!(data.type === "request_chats")) return [3 /*break*/, 116];
                        userId = data.user_id || ((_g = clientsLocal.get(ws)) === null || _g === void 0 ? void 0 : _g.user_id);
                        if (!userId) return [3 /*break*/, 115];
                        if (!clientsLocal.has(ws)) {
                            clientsLocal.set(ws, {
                                user_id: userId,
                                username: "",
                                avatar_url: "",
                                vibeEmoji: "☕",
                                lat: 0,
                                lng: 0,
                                last_seen: Date.now()
                            });
                        }
                        return [4 /*yield*/, sendChatsSync(ws, userId)];
                    case 114:
                        _h.sent();
                        _h.label = 115;
                    case 115: return [3 /*break*/, 120];
                    case 116:
                        if (!(data.type === "rtc_offer" ||
                            data.type === "rtc_answer" ||
                            data.type === "rtc_ice_candidate" ||
                            data.type === "call_request" ||
                            data.type === "call_response" ||
                            data.type === "call_end")) return [3 /*break*/, 120];
                        target_user_id = data.target_user_id;
                        senderInfo = clientsLocal.get(ws);
                        return [4 /*yield*/, userExists(target_user_id)];
                    case 117:
                        exists = _h.sent();
                        if (!exists) {
                            logEvent("rtc_signal_rejected_target_missing", {
                                type: data.type,
                                target_user_id: target_user_id,
                                sender_id: senderInfo === null || senderInfo === void 0 ? void 0 : senderInfo.user_id
                            });
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "Target user is offline or does not exist."
                            }));
                            return [2 /*return*/];
                        }
                        console.log("[socket_server] Signaling message type: " + data.type + " targeting user ID: " + target_user_id);
                        if (!(useRedis && redisPub)) return [3 /*break*/, 119];
                        console.log("[socket_server] Publishing to Redis for target user ID: " + target_user_id);
                        return [4 /*yield*/, redisPub.publish("norby:direct_notifications", JSON.stringify({
                                target_user_id: target_user_id,
                                payload: data
                            }))];
                    case 118:
                        _h.sent();
                        return [3 /*break*/, 120];
                    case 119:
                        targetSocket = findLocalSocketByUserId(target_user_id);
                        if (targetSocket) {
                            console.log("[socket_server] Found local socket for target user ID: " + target_user_id + ", sending message.");
                            targetSocket.send(JSON.stringify(data));
                        }
                        else {
                            activeUserIds = Array.from(clientsLocal.values()).map(function (info) { return info.user_id; });
                            console.warn("[socket_server] Target socket NOT found for user ID: " + target_user_id + ". Active users:", activeUserIds);
                        }
                        _h.label = 120;
                    case 120: return [3 /*break*/, 122];
                    case 121:
                        e_7 = _h.sent();
                        logEvent("message_handle_exception", {
                            error: e_7.message,
                            stack: e_7.stack
                        });
                        return [3 /*break*/, 122];
                    case 122: return [2 /*return*/];
                }
            });
        }); });
        ws.on("close", function () { return __awaiter(void 0, void 0, void 0, function () {
            var info;
            return __generator(this, function (_a) {
                rateLimits["delete"](ws);
                lastSyncTime["delete"](ws);
                info = clientsLocal.get(ws);
                if (info) {
                    logEvent("client_disconnected_scheduled", {
                        user_id: info.user_id,
                        username: info.username,
                        socket_id: ws.socketId
                    });
                    clientsLocal["delete"](ws);
                    lastBroadcastTime["delete"](info.user_id);
                    // Schedule session cleanup after a grace period of 15 seconds.
                    // This prevents blinking off-and-on when reloading the page or recovering from brief network drops.
                    setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var hasOtherLocal, _i, _a, _b, otherWs, otherInfo, activeSocketId, e_8;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    hasOtherLocal = false;
                                    for (_i = 0, _a = clientsLocal.entries(); _i < _a.length; _i++) {
                                        _b = _a[_i], otherWs = _b[0], otherInfo = _b[1];
                                        if (otherInfo.user_id === info.user_id &&
                                            otherWs.readyState === ws_1.WebSocket.OPEN) {
                                            hasOtherLocal = true;
                                            break;
                                        }
                                    }
                                    if (!(useRedis && redisPub)) return [3 /*break*/, 11];
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 9, , 10]);
                                    return [4 /*yield*/, redisPub.get("norby:user_session:" + info.user_id)];
                                case 2:
                                    activeSocketId = _c.sent();
                                    if (!(!hasOtherLocal &&
                                        (!activeSocketId || activeSocketId === ws.socketId))) return [3 /*break*/, 7];
                                    return [4 /*yield*/, redisPub.hDel("norby:active_users", info.user_id)];
                                case 3:
                                    _c.sent();
                                    return [4 /*yield*/, redisPub.zRem("norby:user_locations", info.user_id)];
                                case 4:
                                    _c.sent();
                                    return [4 /*yield*/, redisPub.del("norby:user_session:" + info.user_id)];
                                case 5:
                                    _c.sent();
                                    return [4 /*yield*/, redisPub.publish("norby:location_updates", JSON.stringify({
                                            type: "user_disconnected",
                                            user_id: info.user_id
                                        }))];
                                case 6:
                                    _c.sent();
                                    logEvent("client_session_deleted", {
                                        user_id: info.user_id,
                                        socket_id: ws.socketId
                                    });
                                    return [3 /*break*/, 8];
                                case 7:
                                    logEvent("client_session_retained", {
                                        user_id: info.user_id,
                                        socket_id: ws.socketId,
                                        active_socket_id: activeSocketId,
                                        has_other_local: hasOtherLocal
                                    });
                                    _c.label = 8;
                                case 8: return [3 /*break*/, 10];
                                case 9:
                                    e_8 = _c.sent();
                                    logEvent("redis_cleanup_exception", { error: e_8.message });
                                    return [3 /*break*/, 10];
                                case 10: return [3 /*break*/, 12];
                                case 11:
                                    if (!hasOtherLocal) {
                                        broadcastLocal({
                                            type: "user_disconnected",
                                            user_id: info.user_id
                                        });
                                        logEvent("local_client_session_deleted", {
                                            user_id: info.user_id,
                                            socket_id: ws.socketId
                                        });
                                    }
                                    else {
                                        logEvent("local_client_session_retained", {
                                            user_id: info.user_id,
                                            socket_id: ws.socketId
                                        });
                                    }
                                    _c.label = 12;
                                case 12: return [2 /*return*/];
                            }
                        });
                    }); }, 15000); // 15 seconds grace period
                }
                return [2 /*return*/];
            });
        }); });
        return [2 /*return*/];
    });
}); });
// ── Redis Connection Initialization ──────────────────────────────────────────
function initRedis() {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!REDIS_URL) {
                        logEvent("redis_skipped", {
                            reason: "No REDIS_URL provided. Operating in single-instance mode."
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    logEvent("redis_connecting", { url: REDIS_URL });
                    redisPub = redis_1.createClient({ url: REDIS_URL });
                    redisSub = redis_1.createClient({ url: REDIS_URL });
                    redisPub.on("error", function (err) {
                        return logEvent("redis_pub_error", { error: err.message });
                    });
                    redisSub.on("error", function (err) {
                        return logEvent("redis_sub_error", { error: err.message });
                    });
                    return [4 /*yield*/, redisPub.connect()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, redisSub.connect()];
                case 3:
                    _a.sent();
                    useRedis = true;
                    logEvent("redis_connected");
                    return [4 /*yield*/, redisSub.subscribe("norby:location_updates", function (message) {
                            try {
                                var payload = JSON.parse(message);
                                if (payload.type === "location_update") {
                                    broadcastLocationUpdate(payload.data);
                                }
                                else {
                                    broadcastLocal(payload);
                                }
                            }
                            catch (err) {
                                logEvent("redis_subscriber_error", {
                                    channel: "norby:location_updates",
                                    error: err.message
                                });
                            }
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, redisSub.subscribe("norby:hotspots_updates", function (message) {
                            try {
                                var payload = JSON.parse(message);
                                broadcastLocal(payload);
                            }
                            catch (err) {
                                logEvent("redis_subscriber_error", {
                                    channel: "norby:hotspots_updates",
                                    error: err.message
                                });
                            }
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, redisSub.subscribe("norby:chat_messages", function (message) {
                            try {
                                var payload_1 = JSON.parse(message);
                                if (payload_1.rosterUpdateOnly) {
                                    var recipientIds = payload_1.hotspot.requests
                                        .filter(function (r) { return r.status === "accepted"; })
                                        .map(function (r) { return r.user_id; });
                                    recipientIds.push(payload_1.hotspot.host_id);
                                    recipientIds.forEach(function (uid) {
                                        var localSocket = findLocalSocketByUserId(uid);
                                        if (localSocket) {
                                            localSocket.send(JSON.stringify({
                                                type: "room_sync",
                                                roomId: payload_1.roomId,
                                                hotspot: payload_1.hotspot
                                            }));
                                        }
                                    });
                                }
                                else {
                                    var recipientIds = payload_1.members;
                                    if (!recipientIds.includes(payload_1.host_id)) {
                                        recipientIds.push(payload_1.host_id);
                                    }
                                    recipientIds.forEach(function (uid) {
                                        var localSocket = findLocalSocketByUserId(uid);
                                        if (localSocket) {
                                            localSocket.send(JSON.stringify({
                                                type: "new_message",
                                                roomId: payload_1.roomId,
                                                message: payload_1.message
                                            }));
                                        }
                                    });
                                }
                            }
                            catch (err) {
                                logEvent("redis_subscriber_error", {
                                    channel: "norby:chat_messages",
                                    error: err.message
                                });
                            }
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, redisSub.subscribe("norby:direct_notifications", function (message) {
                            try {
                                var _a = JSON.parse(message), target_user_id = _a.target_user_id, payload = _a.payload;
                                var localSocket = findLocalSocketByUserId(target_user_id);
                                if (localSocket) {
                                    if (payload.type === "chats_sync_needed") {
                                        sendChatsSync(localSocket, target_user_id);
                                    }
                                    else {
                                        localSocket.send(JSON.stringify(payload));
                                    }
                                }
                            }
                            catch (err) {
                                logEvent("redis_subscriber_error", {
                                    channel: "norby:direct_notifications",
                                    error: err.message
                                });
                            }
                        })];
                case 7:
                    _a.sent();
                    // Background Redis Sweeper: cleans zombie coordinates & profiles once every 60s
                    setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                        var allUserIds, now_2, pipeline_2, rawUsers_1, e_9;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    if (!useRedis || !redisPub)
                                        return [2 /*return*/];
                                    return [4 /*yield*/, redisPub.zRange("norby:user_locations", 0, -1)];
                                case 1:
                                    allUserIds = _a.sent();
                                    if (!(allUserIds && allUserIds.length > 0)) return [3 /*break*/, 4];
                                    now_2 = Date.now();
                                    pipeline_2 = redisPub.multi();
                                    return [4 /*yield*/, redisPub.hmGet("norby:active_users", allUserIds)];
                                case 2:
                                    rawUsers_1 = _a.sent();
                                    allUserIds.forEach(function (uid, idx) {
                                        var raw = rawUsers_1[idx];
                                        var isZombie = true;
                                        if (raw) {
                                            try {
                                                var u = JSON.parse(raw);
                                                if (now_2 - (u.last_seen || 0) <= 45000) {
                                                    isZombie = false;
                                                }
                                            }
                                            catch (e) { }
                                        }
                                        if (isZombie) {
                                            pipeline_2.zRem("norby:user_locations", uid);
                                            pipeline_2.hDel("norby:active_users", uid);
                                            pipeline_2.del("norby:user_session:" + uid);
                                            pipeline_2.publish("norby:location_updates", JSON.stringify({
                                                type: "user_disconnected",
                                                user_id: uid
                                            }));
                                        }
                                    });
                                    return [4 /*yield*/, pipeline_2.exec()];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    e_9 = _a.sent();
                                    logEvent("background_redis_cleanup_failed", { error: e_9.message });
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); }, 30000);
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _a.sent();
                    logEvent("redis_init_failed", { error: err_1.message });
                    useRedis = false;
                    redisPub = null;
                    redisSub = null;
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Heartbeat check every 20 seconds to clean up dead connections faster
setInterval(function () {
    wss.clients.forEach(function (ws) {
        if (ws.isAlive === false) {
            logEvent("terminating_dead_client");
            ws.terminate();
            return;
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 20000);
// ── Graceful Shutdown Handler ────────────────────────────────────────────────
var shutdown = function () { return __awaiter(void 0, void 0, void 0, function () {
    var drainMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logEvent("server_shutdown_triggered");
                drainMessage = JSON.stringify({
                    type: "server_draining",
                    message: "Server is restarting, please reconnect"
                });
                wss.clients.forEach(function (client) {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(drainMessage);
                        client.close(1012, "Service Restart"); // 1012 is standard for "Service Restart"
                    }
                });
                wss.close(function () {
                    logEvent("ws_server_closed");
                });
                server.close(function () {
                    logEvent("http_server_closed");
                });
                if (!redisPub) return [3 /*break*/, 2];
                return [4 /*yield*/, redisPub.quit()];
            case 1:
                _a.sent();
                logEvent("redis_pub_connection_closed");
                _a.label = 2;
            case 2:
                if (!redisSub) return [3 /*break*/, 4];
                return [4 /*yield*/, redisSub.quit()];
            case 3:
                _a.sent();
                logEvent("redis_sub_connection_closed");
                _a.label = 4;
            case 4:
                logEvent("server_shutdown_complete");
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); };
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
exports.activeServer = null;
function startServer(port) {
    if (port === void 0) { port = PORT; }
    return __awaiter(this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, initRedis()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            exports.activeServer = server.listen(port, function () {
                                logEvent("server_running", {
                                    port: port,
                                    environment: process.env.NODE_ENV || "development",
                                    redis_enabled: useRedis
                                });
                                resolve();
                            });
                            exports.activeServer.on("error", function (err) {
                                logEvent("server_error", { error: err.message, code: err.code });
                                reject(err);
                            });
                        })];
                case 2:
                    err_2 = _a.sent();
                    logEvent("redis_init_failed", { error: err_2.message, stack: err_2.stack });
                    console.error("Failed to initialize Redis. Starting in fallback mode...");
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            exports.activeServer = server.listen(port, function () {
                                logEvent("server_running_fallback", {
                                    port: port,
                                    redis_enabled: false
                                });
                                resolve();
                            });
                            exports.activeServer.on("error", function (err) {
                                reject(err);
                            });
                        })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.startServer = startServer;
function stopServer() {
    return __awaiter(this, void 0, void 0, function () {
        var e_10, e_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!exports.activeServer) return [3 /*break*/, 2];
                    return [4 /*yield*/, new Promise(function (resolve) { return exports.activeServer.close(function () { return resolve(); }); })];
                case 1:
                    _a.sent();
                    exports.activeServer = null;
                    _a.label = 2;
                case 2:
                    if (!redisPub) return [3 /*break*/, 6];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, redisPub.quit()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_10 = _a.sent();
                    return [3 /*break*/, 6];
                case 6:
                    if (!redisSub) return [3 /*break*/, 10];
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, redisSub.quit()];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_11 = _a.sent();
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.stopServer = stopServer;
// Auto-start only when run directly (not during vitest testing)
if (!process.env.VITEST) {
    startServer()["catch"](function (err) {
        console.error("Failed to start socket server:", err);
        process.exit(1);
    });
}
