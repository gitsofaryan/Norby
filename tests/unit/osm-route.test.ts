import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

async function loadRoute() {
  vi.resetModules();
  return import("../../src/app/api/osm/route");
}

function request(query: string) {
  return new Request(`http://norby.test/api/osm?${query}`);
}

describe("OSM route security and scale safeguards", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it.each([
    "bbox=19.0,72.8,19.2,72.9",
    "bbox=91,72.8,19.1,72.9",
    "bbox=19.0,181,19.1,72.9",
    "bbox=19.1,72.8,19.0,72.9",
    "bbox=19.0,72.9,19.1,72.8",
    "bbox=19.0,72.8,19.1,72.9;node(0,0)",
  ])("rejects unsafe bbox input: %s", async (query) => {
    const { GET } = await loadRoute();

    const response = await GET(request(query));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends only encoded, validated bounds to Overpass", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ elements: [{ tags: { name: "Jio World Centre" } }] }),
    });
    const { GET } = await loadRoute();

    const response = await GET(request("bbox=19.064,72.866,19.074,72.876"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      elements: [{ tags: { name: "Jio World Centre" } }],
    });
    expect(fetchMock.mock.calls[0][0]).toMatch(/^https:\/\/overpass-api\.de\/api\/interpreter\?data=/);
    expect(fetchMock.mock.calls[0][0]).not.toContain(";");
  });

  it("coalesces simultaneous identical requests and serves the cached result", async () => {
    let resolveFetch!: (value: unknown) => void;
    fetchMock.mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve; }),
    );
    const { GET } = await loadRoute();
    const bbox = "bbox=19.064,72.866,19.074,72.876";

    const concurrent = Array.from({ length: 50 }, () => GET(request(bbox)));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFetch({ ok: true, json: async () => ({ elements: [] }) });
    const responses = await Promise.all(concurrent);

    expect(responses).toHaveLength(50);
    expect(await responses[0].json()).toEqual({ elements: [] });
    await GET(request(bbox));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
