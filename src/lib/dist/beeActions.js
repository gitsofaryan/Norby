"use strict";
exports.__esModule = true;
exports.parseBeeAction = void 0;
var mapFilters_1 = require("@/lib/mapFilters");
function findCategory(text) {
    var normalized = text.toLowerCase();
    return mapFilters_1.HOTSPOT_CATEGORIES.find(function (category) {
        return [category.key, category.label, category.prompt].some(function (value) { return normalized.includes(value.toLowerCase()); });
    });
}
function titleFromCommand(text, category) {
    var _a, _b;
    var named = (_b = (_a = text.match(/(?:called|named|titled)\s+["']?(.+?)["']?$/i)) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.trim();
    if (named)
        return named.slice(0, 100);
    return (category === null || category === void 0 ? void 0 : category.prompt) || "Community meetup";
}
function parseBeeAction(text, userId, hotspots) {
    var normalized = text.trim().toLowerCase();
    var ownHotspots = hotspots.filter(function (hotspot) { return hotspot.host_id === userId; });
    if (/\b(close|end|delete|cancel)\b.*\b(hotspot|meetup)\b/.test(normalized)) {
        if (ownHotspots.length === 1) {
            return { type: "close_hotspot", roomId: ownHotspots[0].id };
        }
        return null;
    }
    var response = normalized.match(/\b(accept|approve|decline|reject)\b(?:\s+(?:the\s+)?(?:request|join request)\s*)?(?:from\s+)?@?([a-z0-9_.-]+)?/i);
    if (response) {
        var status = response[1].toLowerCase() === "accept" || response[1].toLowerCase() === "approve" ? "accepted" : "declined";
        var requestedName_1 = response[2];
        var pending = ownHotspots.flatMap(function (hotspot) {
            return (hotspot.requests || [])
                .filter(function (request) { return request.status === "pending"; })
                .map(function (request) { return ({ hotspot: hotspot, request: request }); });
        });
        var matches = requestedName_1
            ? pending.filter(function (_a) {
                var _b;
                var request = _a.request;
                return ((_b = request.username) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === requestedName_1;
            })
            : pending;
        if (matches.length === 1) {
            return {
                type: "respond_join",
                roomId: matches[0].hotspot.id,
                guestId: matches[0].request.user_id,
                status: status
            };
        }
        return null;
    }
    if (/\b(create|creat5e|cretae|start|post|open|make)\b.*\b(hotspot|hostpost|hotspost|meetup|group|chat)\b/.test(normalized)) {
        var category = findCategory(normalized);
        return {
            type: "create_hotspot",
            title: titleFromCommand(text, category),
            category: (category === null || category === void 0 ? void 0 : category.key) || "community"
        };
    }
    return null;
}
exports.parseBeeAction = parseBeeAction;
