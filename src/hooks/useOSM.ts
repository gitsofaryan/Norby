import { useState, useEffect, useMemo, useRef } from "react";

export interface OSMPlace {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    leisure?: string;
    shop?: string;
    tourism?: string;
    [key: string]: string | undefined;
  };
}

export function useOSM(
  mapBounds: {
    _southWest: { lat: number; lng: number };
    _northEast: { lat: number; lng: number };
  } | null,
  zoom: number,
) {
  const [places, setPlaces] = useState<OSMPlace[]>([]);
  const cache = useRef<Map<string, OSMPlace[]>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchedKeyRef = useRef<string | null>(null);

  // Bounds objects are recreated by Leaflet frequently, including while the
  // viewport is still. Only the rounded query bounds should drive a request.
  const query = useMemo(() => {
    if (!mapBounds || zoom < 14) return null;

    const { _southWest: sw, _northEast: ne } = mapBounds;
    const roundTo = 0.01;
    const s = Math.floor(sw.lat / roundTo) * roundTo;
    const w = Math.floor(sw.lng / roundTo) * roundTo;
    const n = Math.ceil(ne.lat / roundTo) * roundTo;
    const e = Math.ceil(ne.lng / roundTo) * roundTo;
    const cacheKey = `${s},${w},${n},${e}`;

    return {
      s,
      w,
      n,
      e,
      cacheKey,
      storageKey: `norby_osm_cache_${cacheKey}`,
    };
  }, [
    mapBounds?._southWest.lat,
    mapBounds?._southWest.lng,
    mapBounds?._northEast.lat,
    mapBounds?._northEast.lng,
    zoom,
  ]);

  // Clean up expired cache items from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const EXPIRE_TIME = 12 * 60 * 60 * 1000; // 12 hours
      const now = Date.now();
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("norby_osm_cache_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (now - parsed.timestamp > EXPIRE_TIME) {
              keysToRemove.push(key);
            }
          }
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      // Cap at 30 entries — evict oldest first
      const remaining: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("norby_osm_cache_")) remaining.push(key);
      }
      if (remaining.length > 30) {
        const toEvict = remaining.slice(0, remaining.length - 30);
        toEvict.forEach((key) => localStorage.removeItem(key));
      }
      if (keysToRemove.length > 0) {
        console.log(
          `[norby-osm] Evicted ${keysToRemove.length} expired OSM cache entries.`,
        );
      }
    } catch (e) {
      // Ignore local storage quota or privacy sandbox issues
    }
  }, []);

  useEffect(() => {
    if (!query) {
      if (zoom < 14) setPlaces([]);
      return;
    }

    const { s, w, n, e, cacheKey, storageKey } = query;

    // 1. In-memory fast cache check
    if (cache.current.has(cacheKey)) {
      setPlaces(cache.current.get(cacheKey)!);
      lastFetchedKeyRef.current = cacheKey;
      return;
    }

    // 2. Persistent localStorage cache check
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const EXPIRE_TIME = 12 * 60 * 60 * 1000; // 12 hours
          if (Date.now() - parsed.timestamp < EXPIRE_TIME) {
            cache.current.set(cacheKey, parsed.places);
            setPlaces(parsed.places);
            return;
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      } catch (e) {}
    }

    // Skip if already fetching same key (deduplication)
    if (lastFetchedKeyRef.current === cacheKey) return;
    lastFetchedKeyRef.current = cacheKey;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce: wait 500ms after last bounds change before fetching
    debounceTimerRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const url = `/api/osm?s=${s}&w=${w}&n=${n}&e=${e}`;

      fetch(url, { signal: abortControllerRef.current.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Overpass API rate limit or error");
          return res.json();
        })
        .then((data) => {
          if (data && data.elements) {
            const namedPlaces = data.elements.filter(
              (el: OSMPlace) => el.tags && el.tags.name,
            ) as OSMPlace[];

            // Cache in memory
            cache.current.set(cacheKey, namedPlaces);

            // Cache in persistent localStorage
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(
                  storageKey,
                  JSON.stringify({
                    places: namedPlaces,
                    timestamp: Date.now(),
                  }),
                );
              } catch (e) {}
            }

            setPlaces(namedPlaces);
          }
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
        });
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, zoom]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return places;
}
