export const runtime = "nodejs";

type OsmElement = Record<string, unknown> & {
  tags?: { name?: unknown };
};

type OsmPayload = { elements: OsmElement[] };

const cache = new Map<string, { timestamp: number; payload: OsmPayload }>();
const inflight = new Map<string, Promise<OsmPayload>>();

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const FETCH_TIMEOUT_MS = 8_000;

function parseNumber(value: string | null) {
  if (value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isValidBbox(s: number, w: number, n: number, e: number) {
  return (
    s >= -90 &&
    n <= 90 &&
    w >= -180 &&
    e <= 180 &&
    s < n &&
    w < e
  );
}

function hasPlaceName(element: unknown): element is OsmElement {
  if (!element || typeof element !== "object") return false;
  const tags = (element as OsmElement).tags;
  return typeof tags?.name === "string" && tags.name.length > 0;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const bboxParam = url.searchParams.get("bbox");

  let s: number | null = null;
  let w: number | null = null;
  let n: number | null = null;
  let e: number | null = null;

  if (bboxParam) {
    const parts = bboxParam.split(",").map((p) => Number(p));
    if (parts.length === 4 && parts.every((p) => Number.isFinite(p))) {
      [s, w, n, e] = parts;
    }
  } else {
    s = parseNumber(url.searchParams.get("s"));
    w = parseNumber(url.searchParams.get("w"));
    n = parseNumber(url.searchParams.get("n"));
    e = parseNumber(url.searchParams.get("e"));
  }

  if (s === null || w === null || n === null || e === null) {
    return Response.json(
      { error: "Invalid bbox. Provide bbox=s,w,n,e or s,w,n,e params." },
      { status: 400 }
    );
  }

  // Keep invalid geographic coordinates out of the generated Overpass query.
  if (!isValidBbox(s, w, n, e)) {
    return Response.json(
      { error: "Invalid bbox coordinates. Use south,west,north,east within geographic bounds." },
      { status: 400 },
    );
  }

  // BUG-01: Bounding box area validation to prevent abuse/DoS
  const latDiff = Math.abs(n - s);
  const lngDiff = Math.abs(e - w);
  if (latDiff > 0.1 || lngDiff > 0.1) {
    return Response.json(
      { error: "Bbox dimensions too large. Maximum size is 0.1 x 0.1 degrees." },
      { status: 400 }
    );
  }

  const cacheKey = `${s},${w},${n},${e}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return Response.json(cached.payload, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600",
      },
    });
  }

  if (inflight.has(cacheKey)) {
    const payload = await inflight.get(cacheKey)!;
    return Response.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600",
      },
    });
  }

  const query = `
    [out:json][timeout:5];
    (
      node["amenity"](${s},${w},${n},${e});
      node["leisure"](${s},${w},${n},${e});
      node["tourism"](${s},${w},${n},${e});
    );
    out body;
  `;

  const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  const requestPromise = fetch(overpassUrl, {
    headers: {
      "User-Agent": "norby-app/1.0",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Overpass error: ${res.status}`);
      }
      const data: unknown = await res.json();
      const elements =
        data && typeof data === "object" && Array.isArray((data as { elements?: unknown }).elements)
          ? (data as { elements: unknown[] }).elements
          : [];
      const namedPlaces = elements.filter(hasPlaceName);
      return { elements: namedPlaces };
    })
    .then((payload) => {
      // BUG-02: Implement Cache growth cap to prevent memory leak
      if (cache.size >= 500) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) {
          cache.delete(oldestKey);
        }
      }
      cache.set(cacheKey, { timestamp: Date.now(), payload });
      return payload;
    })
    .finally(() => {
      inflight.delete(cacheKey);
    });

  inflight.set(cacheKey, requestPromise);

  try {
    const payload = await requestPromise;
    return Response.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600",
      },
    });
  } catch {
    return Response.json(
      { elements: [] },
      { 
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
        }
      }
    );
  }
}
