"use strict";
exports.__esModule = true;
var vitest_1 = require("vitest");
var mapFilters_1 = require("../../src/lib/mapFilters");
vitest_1.describe("map filters", function () {
    vitest_1.it("keeps existing filters and adds Devcon categories", function () {
        vitest_1.expect(mapFilters_1.MAP_FILTERS.map(function (filter) { return filter.key; })).toEqual([
            "all",
            "cafe",
            "dating",
            "gaming",
            "movies",
            "study",
            "music",
            "sports",
            "side-events",
            "views",
            "landmarks",
            "local-eats",
            "hidden-gems",
            "community",
            "ethereum",
            "ai",
            "defi",
            "zk",
            "hackathons",
            "networking",
            "coworking",
            "explore-mumbai",
            "chill",
        ]);
    });
    vitest_1.it("matches Devcon categories against titles and tags", function () {
        vitest_1.expect(mapFilters_1.matchesMapFilterText("Ethereum builders meetup", "ethereum")).toBe(true);
        vitest_1.expect(mapFilters_1.matchesMapFilterText("AI agents discussion", "ai")).toBe(true);
        vitest_1.expect(mapFilters_1.matchesMapFilterText("casual lunch", "hackathons")).toBe(false);
    });
    vitest_1.it("restores the unfiltered view with All", function () {
        vitest_1.expect(mapFilters_1.matchesMapFilterText("anything", "all")).toBe(true);
    });
});
