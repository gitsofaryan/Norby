export type TransportMode = "foot" | "bicycle" | "driving";

export interface RouteData {
  coordinates: [number, number][]; // [lat, lng] array
  distanceMeters: number;
  durationSeconds: number;
}

export async function fetchOSRMRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  mode: TransportMode = "foot"
): Promise<RouteData> {
  const url = `https://router.project-osrm.org/route/v1/${mode}/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&overview=full`;

  console.log(`[norby] OSRM API routing (${mode}) from ${startLat},${startLng} to ${endLat},${endLng}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OSRM API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error("No route found between coordinates");
  }

  const route = data.routes[0];
  const geojsonCoords = route.geometry.coordinates as [number, number][]; // [lng, lat]
  
  // Swap OSRM [lng, lat] coordinates to Leaflet [lat, lng]
  const coordinates = geojsonCoords.map(([lng, lat]) => [lat, lng] as [number, number]);

  // The public OSRM demo server only properly supports the 'driving' profile.
  // It returns the driving route and duration even if we request 'foot' or 'bicycle'.
  // To provide realistic ETAs, we manually recalculate duration based on average speeds:
  // Foot: ~5 km/h (1.38 m/s)
  // Bicycle: ~15 km/h (4.16 m/s)
  let durationSeconds = route.duration;
  let distanceMeters = route.distance;

  if (mode === "foot") {
    durationSeconds = distanceMeters / 1.38;
    // Walking paths are often slightly more direct than driving roads
    distanceMeters = distanceMeters * 0.95;
  } else if (mode === "bicycle") {
    durationSeconds = distanceMeters / 4.16;
    distanceMeters = distanceMeters * 0.98;
  }

  return {
    coordinates,
    distanceMeters,
    durationSeconds,
  };
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs} hr ${remainingMins} min`;
}
