import { describe, expect, it } from "vitest";
import { MAP_FILTERS, matchesMapFilterText } from "../../src/lib/mapFilters";

describe("map filters", () => {
  it("keeps existing filters and adds Devcon categories", () => {
    expect(MAP_FILTERS.map((filter) => filter.key)).toEqual([
      "all", "cafe", "dating", "gaming", "movies", "study", "music", "sports",
      "side-events", "views", "landmarks", "local-eats", "hidden-gems", "community",
      "ethereum", "ai", "defi", "zk", "hackathons", "networking", "coworking",
      "explore-mumbai", "chill",
    ]);
  });

  it("matches Devcon categories against titles and tags", () => {
    expect(matchesMapFilterText("Ethereum builders meetup", "ethereum")).toBe(true);
    expect(matchesMapFilterText("AI agents discussion", "ai")).toBe(true);
    expect(matchesMapFilterText("casual lunch", "hackathons")).toBe(false);
  });

  it("restores the unfiltered view with All", () => {
    expect(matchesMapFilterText("anything", "all")).toBe(true);
  });
});