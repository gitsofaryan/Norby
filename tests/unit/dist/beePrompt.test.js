"use strict";
exports.__esModule = true;
var vitest_1 = require("vitest");
var beePrompt_1 = require("../../src/lib/beePrompt");
vitest_1.describe("Bee prompt", function () {
    vitest_1.it("includes Devcon guidance and public meetup directions", function () {
        var prompt = beePrompt_1.buildBeePrompt({
            userText: "Find me a technical meetup and route",
            location: { lat: 19.076, lng: 72.8777 },
            hotspots: [{ title: "ZK builders", category: "technical-discussion", lat: 19.08, lng: 72.88 }],
            users: []
        });
        vitest_1.expect(prompt).toContain("Devcon 8");
        vitest_1.expect(prompt).toContain("Jio World Centre");
        vitest_1.expect(prompt).toContain("ZK builders");
        vitest_1.expect(prompt).toContain("openstreetmap.org/directions");
    });
    vitest_1.it("does not expose individual user coordinates", function () {
        var prompt = beePrompt_1.buildBeePrompt({
            userText: "Who is around?",
            location: { lat: 19.076, lng: 72.8777 },
            hotspots: [],
            users: [{ username: "builder", projectDescription: "Wallet tooling" }]
        });
        vitest_1.expect(prompt).toContain("builder");
        vitest_1.expect(prompt).not.toContain("builder coordinates");
        vitest_1.expect(prompt).toContain("Do not reveal individual user coordinates");
    });
});
