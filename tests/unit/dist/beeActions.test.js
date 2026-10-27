"use strict";
exports.__esModule = true;
var vitest_1 = require("vitest");
var beeActions_1 = require("../../src/lib/beeActions");
var ownHotspot = {
    id: "room_own",
    host_id: "me",
    title: "Coffee with builders",
    requests: [{ user_id: "guest-1", username: "Aria", status: "pending" }]
};
var otherHotspot = {
    id: "room_other",
    host_id: "someone-else",
    title: "Networking",
    requests: [{ user_id: "guest-2", username: "Liam", status: "pending" }]
};
vitest_1.describe("Bee hotspot actions", function () {
    vitest_1.it("creates a categorized hotspot from an explicit command", function () {
        vitest_1.expect(beeActions_1.parseBeeAction("Create a coffee chat called Builders coffee", "me", [])).toEqual({
            type: "create_hotspot",
            title: "Builders coffee",
            category: "coffee-chat"
        });
    });
    vitest_1.it("accepts a common typo in the hotspot command", function () {
        vitest_1.expect(beeActions_1.parseBeeAction("creat5e an hostpost", "me", [])).toEqual({
            type: "create_hotspot",
            title: "Community meetup",
            category: "community"
        });
    });
    vitest_1.it("manages only the user's own hotspot", function () {
        vitest_1.expect(beeActions_1.parseBeeAction("close my meetup", "me", [ownHotspot])).toEqual({
            type: "close_hotspot",
            roomId: "room_own"
        });
        vitest_1.expect(beeActions_1.parseBeeAction("accept Aria", "me", [ownHotspot, otherHotspot])).toEqual({
            type: "respond_join",
            roomId: "room_own",
            guestId: "guest-1",
            status: "accepted"
        });
        vitest_1.expect(beeActions_1.parseBeeAction("accept Liam", "me", [otherHotspot])).toBeNull();
    });
});
