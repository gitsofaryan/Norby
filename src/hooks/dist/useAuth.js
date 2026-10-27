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
exports.useAuth = exports.AuthProvider = exports.getAvatarUrl = void 0;
var react_1 = require("react");
var AuthContext = react_1.createContext(undefined);
// Generate a DiceBear avatar URL from a seed (username) — completely free & open source
function getAvatarUrl(seed) {
    var styles = [
        "adventurer",
        "adventurer-neutral",
        "avataaars",
        "avataaars-neutral",
        "big-ears",
        "big-ears-neutral",
        "big-smile",
        "bottts",
        "bottts-neutral",
        "croodles",
        "croodles-neutral",
        "dylan",
        "fun-emoji",
        "lorelei",
        "lorelei-neutral",
        "micah",
        "miniavs",
        "notionists",
        "notionists-neutral",
        "open-peeps",
        "personas",
        "pixel-art",
        "pixel-art-neutral",
        "toon-head"
    ];
    // Pick a style deterministically from the seed
    var idx = Math.abs(seed.split("").reduce(function (a, c) { return a + c.charCodeAt(0); }, 0)) % styles.length;
    var style = styles[idx];
    return "https://api.dicebear.com/9.x/" + style + "/svg?seed=" + encodeURIComponent(seed);
}
exports.getAvatarUrl = getAvatarUrl;
exports.AuthProvider = function (_a) {
    var children = _a.children;
    var _b = react_1.useState(false), isSignedIn = _b[0], setIsSignedIn = _b[1];
    var _c = react_1.useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = react_1.useState(null), user = _d[0], setUser = _d[1];
    var _e = react_1.useState(null), profile = _e[0], setProfile = _e[1];
    var loadProfile = function (u) { return __awaiter(void 0, void 0, void 0, function () {
        var raw, parsed, rRange, hRange, defaultProfile, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, window.puter.kv.get("profile_v2_" + u.username)];
                case 1:
                    raw = _a.sent();
                    if (!raw) return [3 /*break*/, 2];
                    parsed = JSON.parse(raw);
                    rRange = parsed.radarRange;
                    if (typeof rRange !== "number" || rRange < 10)
                        rRange = 15;
                    if (rRange > 50)
                        rRange = 50;
                    hRange = parsed.hotspotRange;
                    if (typeof hRange !== "number" || hRange < 10)
                        hRange = 15;
                    if (hRange > 50)
                        hRange = 50;
                    setProfile(__assign(__assign({ gender: "", age: "", blockedUsers: [] }, parsed), { projectDescription: typeof parsed.projectDescription === "string" ? parsed.projectDescription.slice(0, 200) : "", openTo: Array.isArray(parsed.openTo) ? parsed.openTo.filter(function (value) { return typeof value === "string"; }).slice(0, 9) : [], radarRange: rRange, hotspotRange: hRange }));
                    return [3 /*break*/, 4];
                case 2:
                    defaultProfile = {
                        id: u.id || u.username,
                        username: u.username,
                        avatar_url: getAvatarUrl(u.username),
                        handle: u.username,
                        bio: "",
                        projectDescription: "",
                        openTo: [],
                        vibeEmoji: "☕",
                        radarRange: 15,
                        hotspotRange: 15,
                        selectedTags: [],
                        maskLocation: true,
                        gender: "",
                        age: "",
                        blockedUsers: [],
                        isGhostMode: false
                    };
                    setProfile(defaultProfile);
                    return [4 /*yield*/, window.puter.kv.set("profile_v2_" + u.username, JSON.stringify(defaultProfile))];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    console.error("Failed to load profile", e_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        var checkAuth = function () { return __awaiter(void 0, void 0, void 0, function () {
            var retries, signedIn, userData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, 8, 9]);
                        retries = 0;
                        _a.label = 1;
                    case 1:
                        if (!(!window.puter && retries < 20)) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 150); })];
                    case 2:
                        _a.sent();
                        retries++;
                        return [3 /*break*/, 1];
                    case 3:
                        if (!window.puter) return [3 /*break*/, 6];
                        signedIn = window.puter.auth.isSignedIn();
                        setIsSignedIn(signedIn);
                        if (!signedIn) return [3 /*break*/, 6];
                        return [4 /*yield*/, window.puter.auth.getUser()];
                    case 4:
                        userData = _a.sent();
                        setUser(userData);
                        return [4 /*yield*/, loadProfile(userData)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        error_1 = _a.sent();
                        console.error("Auth check failed:", error_1);
                        return [3 /*break*/, 9];
                    case 8:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        checkAuth();
    }, []);
    // Reload profile from cloud KV on tab focus (debounced to avoid spam)
    var lastFocusLoadRef = react_1.useRef(0);
    react_1.useEffect(function () {
        if (!user)
            return;
        var handleFocus = function () {
            var now = Date.now();
            if (now - lastFocusLoadRef.current < 2000)
                return;
            lastFocusLoadRef.current = now;
            loadProfile(user);
        };
        window.addEventListener("focus", handleFocus);
        return function () { return window.removeEventListener("focus", handleFocus); };
    }, [user]);
    var saveProfile = function (partial) { return __awaiter(void 0, void 0, void 0, function () {
        var updated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user || !profile)
                        return [2 /*return*/];
                    updated = __assign(__assign({}, profile), partial);
                    setProfile(updated);
                    return [4 /*yield*/, window.puter.kv.set("profile_v2_" + user.username, JSON.stringify(updated))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var blockUser = function (targetUserId) { return __awaiter(void 0, void 0, void 0, function () {
        var currentBlocks, updatedBlocks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!profile)
                        return [2 /*return*/];
                    currentBlocks = profile.blockedUsers || [];
                    if (currentBlocks.includes(targetUserId))
                        return [2 /*return*/];
                    updatedBlocks = __spreadArrays(currentBlocks, [targetUserId]);
                    return [4 /*yield*/, saveProfile({ blockedUsers: updatedBlocks })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var unblockUser = function (targetUserId) { return __awaiter(void 0, void 0, void 0, function () {
        var currentBlocks, local, filtered, updatedBlocks, local, filtered;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!profile)
                        return [2 /*return*/];
                    currentBlocks = profile.blockedUsers || [];
                    if (!currentBlocks.includes(targetUserId)) {
                        // Even if not in profile, check local storage (fallback for sync)
                        if (typeof window !== "undefined") {
                            try {
                                local = JSON.parse(localStorage.getItem("norby_local_blocks") || "[]");
                                filtered = local.filter(function (id) { return id !== targetUserId; });
                                localStorage.setItem("norby_local_blocks", JSON.stringify(filtered));
                                // Trigger a storage event for other tabs/components
                                window.dispatchEvent(new Event("storage"));
                            }
                            catch (e) { }
                        }
                        return [2 /*return*/];
                    }
                    updatedBlocks = currentBlocks.filter(function (id) { return id !== targetUserId; });
                    return [4 /*yield*/, saveProfile({ blockedUsers: updatedBlocks })];
                case 1:
                    _a.sent();
                    // Also clear from local storage if present
                    if (typeof window !== "undefined") {
                        try {
                            local = JSON.parse(localStorage.getItem("norby_local_blocks") || "[]");
                            filtered = local.filter(function (id) { return id !== targetUserId; });
                            localStorage.setItem("norby_local_blocks", JSON.stringify(filtered));
                            window.dispatchEvent(new Event("storage"));
                        }
                        catch (e) { }
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var signIn = function () { return __awaiter(void 0, void 0, void 0, function () {
        var userData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.puter)
                        return [2 /*return*/];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, window.puter.auth.signIn()];
                case 2:
                    _a.sent();
                    setIsSignedIn(true);
                    return [4 /*yield*/, window.puter.auth.getUser()];
                case 3:
                    userData = _a.sent();
                    setUser(userData);
                    return [4 /*yield*/, loadProfile(userData)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    error_2 = _a.sent();
                    console.error("Sign in failed:", error_2);
                    return [3 /*break*/, 7];
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var signOut = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!window.puter)
                return [2 /*return*/];
            window.puter.auth.signOut();
            setIsSignedIn(false);
            setUser(null);
            setProfile(null);
            return [2 /*return*/];
        });
    }); };
    return (React.createElement(AuthContext.Provider, { value: { isSignedIn: isSignedIn, isLoading: isLoading, user: user, profile: profile, saveProfile: saveProfile, blockUser: blockUser, unblockUser: unblockUser, signIn: signIn, signOut: signOut } }, children));
};
function useAuth() {
    var ctx = react_1.useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
exports.useAuth = useAuth;
