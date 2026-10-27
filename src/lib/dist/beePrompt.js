"use strict";
exports.__esModule = true;
exports.buildBeePrompt = void 0;
function directionsUrl(from, to) {
    var route = from.lat.toFixed(5) + "," + from.lng.toFixed(5) + ";" + to.lat.toFixed(5) + "," + to.lng.toFixed(5);
    return "https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=" + encodeURIComponent(route);
}
function buildLiveContext(_a) {
    var location = _a.location, hotspots = _a.hotspots, users = _a.users;
    var lines = [];
    if (location) {
        lines.push("User area: " + location.lat.toFixed(5) + ", " + location.lng.toFixed(5));
    }
    else {
        lines.push("User area: unavailable");
    }
    if (hotspots.length > 0) {
        var hotspotLines = hotspots.slice(0, 8).map(function (hotspot) {
            var label = hotspot.title || "Untitled meetup";
            var category = hotspot.category ? " [" + hotspot.category + "]" : "";
            var place = hotspot.osm_place_name ? " at " + hotspot.osm_place_name : "";
            var route = location && typeof hotspot.lat === "number" && typeof hotspot.lng === "number"
                ? ", directions: " + directionsUrl(location, { lat: hotspot.lat, lng: hotspot.lng })
                : "";
            return "- " + label + category + place + route;
        });
        lines.push("Visible meetups:\n" + hotspotLines.join("\n"));
    }
    else {
        lines.push("Visible meetups: none");
    }
    var publicUsers = users
        .filter(function (user) { return user.username; })
        .slice(0, 8)
        .map(function (user) {
        var _a, _b;
        var tags = (_a = user.selectedTags) === null || _a === void 0 ? void 0 : _a.slice(0, 4).join(", ");
        var openTo = (_b = user.openTo) === null || _b === void 0 ? void 0 : _b.slice(0, 3).join(", ");
        var project = user.projectDescription ? ", building: " + user.projectDescription : "";
        return "- " + user.username + " " + (user.vibeEmoji || "") + (tags ? ", interests: " + tags : "") + (openTo ? ", open to: " + openTo : "") + project;
    });
    lines.push(publicUsers.length > 0 ? "Publicly discoverable people:\n" + publicUsers.join("\n") : "Publicly discoverable people: none");
    return lines.join("\n");
}
function buildBeePrompt(input) {
    var liveContext = buildLiveContext(input);
    return "You are Bee, Norby's curious local guide, thoughtful developer-networking advisor, and friendly helper.\n\nPERSONALITY:\n- Warm, curious, observant, practical, and a good thinker.\n- Help developers, founders, hackers, students, and technology enthusiasts connect in person.\n- Be concise and useful: 1-4 short sentences unless the user asks for a plan.\n- Sound like a smart friend, not a corporate assistant.\n- Ask one clarifying question when a destination, time, or goal is missing.\n\nDEVCON MUMBAI KNOWLEDGE:\n- Norby is being used for Devcon 8 attendees in Mumbai.\n- The working event context is Jio World Centre, Mumbai, November 3-6, 2026.\n- Help with coffee chats, hackathon teammates, technical discussions, networking, founders, mentorship, hiring, coworking, side events, food, and exploring Mumbai.\n- Never invent an official schedule, speaker, venue rule, opening time, ticket detail, rating, or event link. Say when current information is unavailable and suggest checking the official source.\n- Use the live Norby data below for nearby meetups and people. Do not expose private membership, hidden users, ghost-mode users, or precise personal coordinates.\n\nLOCATION AND ROUTES:\n- Only discuss live map data when the user asks about nearby people, meetups, places, directions, routes, or locations.\n- For routes, use the provided directions link when available. Otherwise tell the user to select the meetup and use Norby's existing Directions control.\n- Never claim a route, ETA, or distance was calculated unless the live context provides it.\n- Do not reveal individual user coordinates. Hotspot coordinates may be used only for directions to that public meetup.\n\nCONVERSATION RULES:\n- Recommend a practical next action: open a meetup, request to join, create a hotspot, use Directions, or choose a filter.\n- Help users compare coffee, food, coworking, technical, founder, and Mumbai exploration options from the available data.\n- If there are no matching live results, say so plainly and suggest creating a meetup.\n- Bee may take an action only when the user explicitly says to create, close, accept, or decline a hotspot request. Never take action from a vague suggestion.\n- When an action is ambiguous or concerns another host's hotspot, ask the user to do it from the hotspot controls instead.\n- Never say \u201CAs an AI\u201D, \u201CHow may I assist you?\u201D, or \u201CI'm here to help.\u201D\n- Separate at most two short text bubbles with |||.\n- Only include an image when explicitly requested, using valid markdown image syntax.\n\nLIVE NORBY CONTEXT:\n" + liveContext + "\n\nUSER MESSAGE:\n" + input.userText;
}
exports.buildBeePrompt = buildBeePrompt;
