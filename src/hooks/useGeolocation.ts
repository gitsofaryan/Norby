"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LOCATION_ENABLED_KEY = "norby_location_enabled";
const LOCATION_DENIED_KEY = "norby_location_denied";

export type GeolocationStatus =
  | "waiting"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "insecure"
  | "timeout";

export type Coordinates = { lat: number; lng: number };

export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Stable displacement used only for the location shared with other users. */
export function getStableOffset(actualLat: number, actualLng: number) {
  const gridScale = 0.0045;
  const cellLat = Math.floor(actualLat / gridScale);
  const cellLng = Math.floor(actualLng / gridScale);
  const seed1 = (cellLat * 73856093) ^ (cellLng * 19349663);
  const seed2 = (cellLat * 83492791) ^ (cellLng * 73856093);

  return {
    latOffset: ((Math.abs(Math.sin(seed1) * 1000) % 1) - 0.5) * 0.0018,
    lngOffset: ((Math.abs(Math.sin(seed2) * 1000) % 1) - 0.5) * 0.0018,
  };
}

function getStatusFromError(error: GeolocationPositionError): GeolocationStatus {
  if (error.code === error.PERMISSION_DENIED) return "denied";
  if (error.code === error.TIMEOUT) return "timeout";
  return "unavailable";
}

function getInitialEnabledState() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LOCATION_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

export function useGeolocation(maskLocation = true) {
  const [location, setLocationState] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>("waiting");
  const [locationEnabled, setLocationEnabled] = useState(getInitialEnabledState);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isStasis, setIsStasis] = useState(false);
  const [accuracySource, setAccuracySource] = useState<
    "gps-high" | "gps-low" | "offline" | "waiting"
  >("waiting");
  const locationRef = useRef<Coordinates | null>(null);
  const accuracyRef = useRef<number | null>(null);
  const autoRequestStartedRef = useRef(false);
  const locationRequestPendingRef = useRef(false);
  const latestPositionTimestampRef = useRef<number | null>(null);

  const acceptPosition = useCallback((position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const acc = position.coords.accuracy;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180 ||
      (lat === 0 && lng === 0)
    ) {
      setStatus("unavailable");
      return false;
    }

    const positionTimestamp = position.timestamp;
    if (
      Number.isFinite(positionTimestamp) &&
      latestPositionTimestampRef.current !== null &&
      positionTimestamp < latestPositionTimestampRef.current
    ) {
      return false;
    }
    if (Number.isFinite(positionTimestamp)) {
      latestPositionTimestampRef.current = positionTimestamp;
    }

    // Ignore wildly degraded fixes if we already hold an accurate GPS fix
    if (
      accuracyRef.current !== null &&
      accuracyRef.current < 100 &&
      acc > 1500 &&
      locationRef.current !== null
    ) {
      return false;
    }

    const actualCoordinates = { lat, lng };
    locationRef.current = actualCoordinates;
    accuracyRef.current = acc;
    setLocationState(actualCoordinates);
    setAccuracy(acc);
    setAccuracySource(acc <= 200 ? "gps-high" : "gps-low");
    setStatus("granted");
    return true;
  }, []);

  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    // Keep the last real fix during a temporary GPS outage. Before the first
    // fix, expose the failure so the existing map location control can retry.
    if (locationRef.current) return;

    const nextStatus = getStatusFromError(error);
    setStatus(nextStatus);
    if (nextStatus === "unavailable" || nextStatus === "timeout") {
      setAccuracySource("offline");
    }
    if (nextStatus === "denied") {
      setLocationEnabled(false);
      try {
        localStorage.removeItem(LOCATION_ENABLED_KEY);
        localStorage.setItem(LOCATION_DENIED_KEY, "true");
      } catch {
        // Storage can be unavailable in private browsing modes.
      }
    }
  }, []);

  const acquireDeviceLocation = useCallback((clearDenial = false) => {
    if (clearDenial) {
      try {
        localStorage.removeItem(LOCATION_DENIED_KEY);
      } catch {
        // Storage can be unavailable in private browsing modes.
      }
    }
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setStatus("insecure");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      setAccuracySource("offline");
      return;
    }
    if (locationRequestPendingRef.current) return;

    locationRequestPendingRef.current = true;
    if (!locationRef.current) setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationRequestPendingRef.current = false;
        acceptPosition(position);
        setLocationEnabled(true);
        try {
          localStorage.removeItem(LOCATION_DENIED_KEY);
          localStorage.setItem(LOCATION_ENABLED_KEY, "true");
        } catch {
          // The current session still works when storage is unavailable.
        }
      },
      (error) => {
        locationRequestPendingRef.current = false;
        handlePositionError(error);
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 },
    );
  }, [acceptPosition, handlePositionError]);

  const requestLocation = useCallback(() => {
    acquireDeviceLocation(true);
  }, [acquireDeviceLocation]);

  // Request native location permission when undecided on load, or restore if already granted.
  useEffect(() => {
    if (locationEnabled || autoRequestStartedRef.current) return;
    autoRequestStartedRef.current = true;

    let wasPreviouslyDenied = false;
    try {
      wasPreviouslyDenied =
        localStorage.getItem(LOCATION_DENIED_KEY) === "true";
    } catch {
      // Permission state can still be queried if storage is unavailable.
    }

    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setStatus("insecure");
      return;
    }

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => {
          if (permission.state === "denied") {
            handlePositionError({
              code: 1,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
              message: "Location permission denied",
            } as GeolocationPositionError);
            return;
          }
          if (permission.state === "granted") {
            acquireDeviceLocation(true);
            return;
          }
          // Permission is undecided ("prompt"): request native permission on first visit
          if (wasPreviouslyDenied) {
            setStatus("denied");
            return;
          }
          acquireDeviceLocation();
        })
        .catch((err) => {
          if (wasPreviouslyDenied) {
            setStatus("denied");
            return;
          }
          acquireDeviceLocation();
        });
      return;
    }

    if (wasPreviouslyDenied) {
      setStatus("denied");
      return;
    }
    acquireDeviceLocation();
  }, [locationEnabled, acquireDeviceLocation, handlePositionError]);

  // Returning users who previously allowed location get continuous GPS tracking.
  useEffect(() => {
    if (!locationEnabled) return;
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setStatus("insecure");
      return;
    }
    if (!navigator.geolocation) {
      setStatus("unavailable");
      setAccuracySource("offline");
      return;
    }

    if (!locationRef.current) setStatus("requesting");
    const watchId = navigator.geolocation.watchPosition(
      acceptPosition,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationEnabled, acceptPosition, handlePositionError]);

  const disableLocation = useCallback(() => {
    setLocationState(null);
    locationRef.current = null;
    accuracyRef.current = null;
    latestPositionTimestampRef.current = null;
    setAccuracy(null);
    setAccuracySource("waiting");
    setStatus("waiting");
    setIsStasis(false);
    setLocationEnabled(false);
    try {
      localStorage.removeItem(LOCATION_ENABLED_KEY);
      localStorage.removeItem(LOCATION_DENIED_KEY);
    } catch {
      // Storage can be unavailable in private browsing modes.
    }
  }, []);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return Promise.resolve(locationRef.current);
    }
    if (locationRequestPendingRef.current) {
      return Promise.resolve(locationRef.current);
    }

    locationRequestPendingRef.current = true;
    if (!locationRef.current) setStatus("requesting");
    return new Promise<Coordinates | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          locationRequestPendingRef.current = false;
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(acceptPosition(position) ? coordinates : locationRef.current);
        },
        (error) => {
          locationRequestPendingRef.current = false;
          handlePositionError(error);
          resolve(locationRef.current);
        },
        { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 },
      );
    });
  }, [acceptPosition, handlePositionError]);

  const sharedLocation = (() => {
    if (!location || !maskLocation) return location;
    const offset = getStableOffset(location.lat, location.lng);
    return {
      lat: Math.max(-90, Math.min(90, location.lat + offset.latOffset)),
      lng: Math.max(-180, Math.min(180, location.lng + offset.lngOffset)),
    };
  })();

  return {
    location,
    sharedLocation,
    status,
    locationEnabled,
    requestLocation,
    disableLocation,
    accuracy,
    accuracySource,
    isStasis,
    refreshLocation,
  };
}
