"use client";
"use strict";
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
exports.__esModule = true;
exports.useGeolocation = exports.getStableOffset = exports.getDistanceKm = void 0;
var react_1 = require("react");
var LOCATION_ENABLED_KEY = "norby_location_enabled";
// Helper to calculate distance in km using Haversine formula
function getDistanceKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the Earth in km
    var dLat = ((lat2 - lat1) * Math.PI) / 180;
    var dLon = ((lon2 - lon1) * Math.PI) / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
exports.getDistanceKm = getDistanceKm;
function getStableOffset(actualLat, actualLng) {
    var gridScale = 0.0045; // ~500m grid cell boundaries
    var cellLat = Math.floor(actualLat / gridScale);
    var cellLng = Math.floor(actualLng / gridScale);
    // Seed-based deterministic hashing to get a stable offset per grid cell
    var seed1 = (cellLat * 73856093) ^ (cellLng * 19349663);
    var rand1 = (Math.abs(Math.sin(seed1) * 1000) % 1) - 0.5;
    var latOffset = rand1 * 0.0018;
    var seed2 = (cellLat * 83492791) ^ (cellLng * 73856093);
    var rand2 = (Math.abs(Math.sin(seed2) * 1000) % 1) - 0.5;
    var lngOffset = rand2 * 0.0018;
    return { latOffset: latOffset, lngOffset: lngOffset };
}
exports.getStableOffset = getStableOffset;
function getIPLocation() {
    return __awaiter(this, void 0, Promise, function () {
        var cached, parsed, result, res, data, err_1, res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Check sessionStorage cache first (10-min TTL)
                    if (typeof window !== "undefined") {
                        try {
                            cached = sessionStorage.getItem("norby_ip_location");
                            if (cached) {
                                parsed = JSON.parse(cached);
                                if (parsed.expires > Date.now() && typeof parsed.lat === "number") {
                                    return [2 /*return*/, { lat: parsed.lat, lng: parsed.lng }];
                                }
                            }
                        }
                        catch (e) {
                            /* ignore */
                        }
                    }
                    result = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("https://freeipapi.com/api/json")];
                case 2:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (typeof data.latitude === "number" &&
                        typeof data.longitude === "number") {
                        result = { lat: data.latitude, lng: data.longitude };
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    return [3 /*break*/, 6];
                case 6:
                    if (!!result) return [3 /*break*/, 12];
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 11, , 12]);
                    return [4 /*yield*/, fetch("https://ipwho.is/")];
                case 8:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 10];
                    return [4 /*yield*/, res.json()];
                case 9:
                    data = _a.sent();
                    if (typeof data.latitude === "number" &&
                        typeof data.longitude === "number") {
                        result = { lat: data.latitude, lng: data.longitude };
                    }
                    _a.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    err_2 = _a.sent();
                    return [3 /*break*/, 12];
                case 12:
                    // Cache in sessionStorage for 10 minutes
                    if (result && typeof window !== "undefined") {
                        try {
                            sessionStorage.setItem("norby_ip_location", JSON.stringify({
                                lat: result.lat,
                                lng: result.lng,
                                expires: Date.now() + 10 * 60 * 1000
                            }));
                        }
                        catch (e) {
                            /* ignore */
                        }
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
function useGeolocation(maskLocation) {
    if (maskLocation === void 0) { maskLocation = true; }
    var _a = react_1.useState(function () {
        if (typeof window !== "undefined") {
            if (localStorage.getItem(LOCATION_ENABLED_KEY) !== "true")
                return null;
            var cached = localStorage.getItem("norby_last_location");
            if (cached) {
                try {
                    var parsed = JSON.parse(cached);
                    if (typeof parsed.lat === "number" &&
                        typeof parsed.lng === "number") {
                        return parsed;
                    }
                }
                catch (e) {
                    // Ignore
                }
            }
        }
        return null;
    }), location = _a[0], setLocationState = _a[1];
    var _b = react_1.useState("waiting"), status = _b[0], setStatusState = _b[1];
    var _c = react_1.useState(function () {
        return (typeof window !== "undefined" &&
            localStorage.getItem(LOCATION_ENABLED_KEY) === "true");
    }), locationEnabled = _c[0], setLocationEnabled = _c[1];
    var statusRef = react_1.useRef(status);
    statusRef.current = status;
    var setStatus = function (val) {
        if (typeof val === "function") {
            setStatusState(function (prev) {
                var next = val(prev);
                statusRef.current = next;
                return next;
            });
        }
        else {
            statusRef.current = val;
            setStatusState(val);
        }
    };
    var _d = react_1.useState(false), isStasis = _d[0], setIsStasis = _d[1];
    var _e = react_1.useState(null), accuracy = _e[0], setAccuracy = _e[1];
    var _f = react_1.useState("waiting"), accuracySource = _f[0], setAccuracySource = _f[1];
    var hasGPSRef = react_1.useRef(false);
    var wakeFromStasisRef = react_1.useRef(null);
    // Use refs to avoid re-running effects on location updates
    var locationRef = react_1.useRef(location);
    locationRef.current = location;
    var setLocation = function (newLoc) {
        setLocationState(newLoc);
        if (typeof window !== "undefined") {
            localStorage.setItem("norby_last_location", JSON.stringify(newLoc));
        }
    };
    react_1.useEffect(function () {
        if (!locationEnabled) {
            setStatus("waiting");
            setAccuracySource("waiting");
            return;
        }
        var finished = false;
        var watchId = null;
        var passivePollInterval = null;
        var localIsStasis = false;
        var lastMoveTime = Date.now();
        var lastLatitude = null;
        var lastLongitude = null;
        // Fast IP Geolocation fallback so map is never collapsed
        getIPLocation()
            .then(function (ipLoc) {
            if (!finished && ipLoc && !hasGPSRef.current) {
                var offset = maskLocation
                    ? getStableOffset(ipLoc.lat, ipLoc.lng)
                    : { latOffset: 0, lngOffset: 0 };
                var newLat = ipLoc.lat + offset.latOffset;
                var newLng = ipLoc.lng + offset.lngOffset;
                if (!locationRef.current) {
                    setLocation({ lat: newLat, lng: newLng });
                    setStatus("granted");
                    setAccuracySource("ip-fallback");
                }
            }
        })["catch"](function (err) {
            console.warn("IP Geolocation mount error:", err);
        });
        var startHighAccuracyWatch = function () {
            if (watchId !== null)
                return;
            if (passivePollInterval !== null) {
                clearInterval(passivePollInterval);
                passivePollInterval = null;
            }
            localIsStasis = false;
            setIsStasis(false);
            lastMoveTime = Date.now();
            console.log("[norby] Starting high-power GPS watchPosition driver.");
            watchId = navigator.geolocation.watchPosition(function (pos) {
                // Discard extremely inaccurate coordinates (e.g. > 5km) which often happen during poor signal
                if (pos.coords.accuracy > 5000) {
                    console.log("[norby] Discarding low-accuracy GPS signal:", pos.coords.accuracy, "meters");
                    return;
                }
                finished = true;
                hasGPSRef.current = true;
                var lat = pos.coords.latitude;
                var lng = pos.coords.longitude;
                setAccuracy(pos.coords.accuracy);
                setAccuracySource(pos.coords.accuracy <= 200 ? "gps-high" : "gps-low");
                var offset = maskLocation
                    ? getStableOffset(lat, lng)
                    : { latOffset: 0, lngOffset: 0 };
                var newLat = lat + offset.latOffset;
                var newLng = lng + offset.lngOffset;
                var prev = locationRef.current;
                if (!prev) {
                    lastLatitude = lat;
                    lastLongitude = lng;
                    setLocation({ lat: newLat, lng: newLng });
                    setStatus("granted");
                    return;
                }
                var dist = getDistanceKm(prev.lat, prev.lng, newLat, newLng);
                if (dist > 0.003) {
                    // User is moving! Update coordinates & reset stasis timer
                    lastLatitude = lat;
                    lastLongitude = lng;
                    lastMoveTime = Date.now();
                    setLocation({ lat: newLat, lng: newLng });
                }
                else {
                    // If user has been stationary for more than 3 minutes, transition to passive battery saver!
                    if (Date.now() - lastMoveTime > 180000 && !localIsStasis) {
                        console.log("[norby] User is stationary. Transitioning to low-power stasis GPS poll.");
                        localIsStasis = true;
                        setIsStasis(true);
                        switchToPassivePoll();
                    }
                }
                setStatus("granted");
            }, function () {
                finished = true;
                setStatus(function (prev) { return (prev === "granted" ? "granted" : "denied"); });
                if (statusRef.current !== "granted") {
                    setAccuracySource("offline");
                }
            }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        };
        var switchToPassivePoll = function () {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            if (passivePollInterval !== null)
                return;
            // Poll low-power location every 2 minutes
            passivePollInterval = setInterval(function () {
                console.log("[norby] Low-power stasis GPS check-in.");
                navigator.geolocation.getCurrentPosition(function (pos) {
                    var lat = pos.coords.latitude;
                    var lng = pos.coords.longitude;
                    setAccuracy(pos.coords.accuracy);
                    if (lastLatitude !== null && lastLongitude !== null) {
                        var movedDist = getDistanceKm(lastLatitude, lastLongitude, lat, lng);
                        if (movedDist > 0.005) {
                            // User has started moving! Exit stasis and restore active high-power GPS watch
                            console.log("[norby] Movement detected during stasis. Waking up high-power GPS watch.");
                            startHighAccuracyWatch();
                            var offset = maskLocation
                                ? getStableOffset(lat, lng)
                                : { latOffset: 0, lngOffset: 0 };
                            setLocation({
                                lat: lat + offset.latOffset,
                                lng: lng + offset.lngOffset
                            });
                        }
                    }
                    else {
                        lastLatitude = lat;
                        lastLongitude = lng;
                    }
                }, function () { }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
            }, 120000);
        };
        if (!navigator.geolocation) {
            setStatus("denied");
            setAccuracySource("offline");
            return;
        }
        // Fast OS-level cached location for near-instant map loading
        navigator.geolocation.getCurrentPosition(function (pos) {
            if (!finished && !hasGPSRef.current) {
                var offset = maskLocation
                    ? getStableOffset(pos.coords.latitude, pos.coords.longitude)
                    : { latOffset: 0, lngOffset: 0 };
                var newLat = pos.coords.latitude + offset.latOffset;
                var newLng = pos.coords.longitude + offset.lngOffset;
                setLocation({ lat: newLat, lng: newLng });
                setAccuracy(pos.coords.accuracy);
                setAccuracySource(pos.coords.accuracy <= 200 ? "gps-high" : "gps-low");
                setStatus("granted");
            }
        }, function () { }, // Ignore errors, watchPosition will handle it
        { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity });
        // Start active high-accuracy watch tracking immediately
        startHighAccuracyWatch();
        // Listen to user map interactions to wake up from stasis instantly
        var handleUserWakeup = function () {
            if (localIsStasis) {
                console.log("[norby] User interaction detected. Waking up high-power GPS watch.");
                startHighAccuracyWatch();
            }
            else {
                lastMoveTime = Date.now(); // reset timer on click/activity
            }
        };
        // Expose wake-up for refreshLocation
        wakeFromStasisRef.current = handleUserWakeup;
        window.addEventListener("click", handleUserWakeup);
        window.addEventListener("touchstart", handleUserWakeup);
        return function () {
            finished = true;
            window.removeEventListener("click", handleUserWakeup);
            window.removeEventListener("touchstart", handleUserWakeup);
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
            if (passivePollInterval !== null) {
                clearInterval(passivePollInterval);
            }
        };
    }, [locationEnabled, maskLocation]);
    var requestLocation = function () {
        if (typeof window !== "undefined") {
            localStorage.setItem(LOCATION_ENABLED_KEY, "true");
        }
        setLocationEnabled(true);
    };
    var disableLocation = function () {
        if (typeof window !== "undefined") {
            localStorage.removeItem(LOCATION_ENABLED_KEY);
            localStorage.removeItem("norby_last_location");
        }
        hasGPSRef.current = false;
        setLocationState(null);
        setAccuracy(null);
        setAccuracySource("waiting");
        setStatus("waiting");
        setLocationEnabled(false);
    };
    var refreshLocation = function () {
        if (!locationEnabled) {
            return Promise.resolve(null);
        }
        // Wake from stasis if currently in low-power mode
        if (wakeFromStasisRef.current) {
            wakeFromStasisRef.current();
        }
        return new Promise(function (resolve, reject) {
            var finished = false;
            getIPLocation()
                .then(function (ipLoc) {
                if (!finished &&
                    ipLoc &&
                    !locationRef.current &&
                    !hasGPSRef.current) {
                    var offset = maskLocation
                        ? getStableOffset(ipLoc.lat, ipLoc.lng)
                        : { latOffset: 0, lngOffset: 0 };
                    var newCoords = {
                        lat: ipLoc.lat + offset.latOffset,
                        lng: ipLoc.lng + offset.lngOffset
                    };
                    setLocation(newCoords);
                    setStatus("granted");
                    setAccuracySource("ip-fallback");
                }
            })["catch"](function (err) { return console.warn("IP location error on refresh:", err); });
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (pos) {
                    finished = true;
                    if (pos.coords.accuracy > 5000 && locationRef.current) {
                        console.log("[norby] Discarding low-accuracy GPS on refresh");
                        resolve(locationRef.current);
                        return;
                    }
                    hasGPSRef.current = true;
                    var offset = maskLocation
                        ? getStableOffset(pos.coords.latitude, pos.coords.longitude)
                        : { latOffset: 0, lngOffset: 0 };
                    var newCoords = {
                        lat: pos.coords.latitude + offset.latOffset,
                        lng: pos.coords.longitude + offset.lngOffset
                    };
                    setLocation(newCoords);
                    setAccuracy(pos.coords.accuracy);
                    setAccuracySource(pos.coords.accuracy <= 200 ? "gps-high" : "gps-low");
                    setStatus("granted");
                    resolve(newCoords);
                }, function (err) {
                    finished = true;
                    resolve(locationRef.current);
                }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
            }
            else {
                finished = true;
                resolve(locationRef.current);
            }
        });
    };
    return {
        location: location,
        status: status,
        locationEnabled: locationEnabled,
        requestLocation: requestLocation,
        disableLocation: disableLocation,
        accuracy: accuracy,
        accuracySource: accuracySource,
        isStasis: isStasis,
        refreshLocation: refreshLocation
    };
}
exports.useGeolocation = useGeolocation;
