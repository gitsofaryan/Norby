import { describe, expect, it } from "vitest";
import { buildBeePrompt } from "../../src/lib/beePrompt";

describe("Bee prompt", () => {
  it("includes Devcon guidance and public meetup directions", () => {
    const prompt = buildBeePrompt({
      userText: "Find me a technical meetup and route",
      location: { lat: 19.076, lng: 72.8777 },
      hotspots: [{ title: "ZK builders", category: "technical-discussion", lat: 19.08, lng: 72.88 }],
      users: [],
    });

    expect(prompt).toContain("Devcon 8");
    expect(prompt).toContain("Jio World Centre");
    expect(prompt).toContain("ZK builders");
    expect(prompt).toContain("openstreetmap.org/directions");
  });

  it("does not expose individual user coordinates", () => {
    const prompt = buildBeePrompt({
      userText: "Who is around?",
      location: { lat: 19.076, lng: 72.8777 },
      hotspots: [],
      users: [{ username: "builder", projectDescription: "Wallet tooling" }],
    });

    expect(prompt).toContain("builder");
    expect(prompt).not.toContain("builder coordinates");
    expect(prompt).toContain("Do not reveal individual user coordinates");
  });
});
