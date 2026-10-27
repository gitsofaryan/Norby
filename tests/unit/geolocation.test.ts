import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { getDistanceKm, getStableOffset, useGeolocation } from '../../src/hooks/useGeolocation';

describe('getDistanceKm', () => {
  it('calculates Delhi to Mumbai correctly (~1150km)', () => {
    // Delhi: 28.6139, 77.209
    // Mumbai: 19.0760, 72.8777
    const dist = getDistanceKm(28.6139, 77.209, 19.0760, 72.8777);
    expect(dist).toBeGreaterThan(1130);
    expect(dist).toBeLessThan(1170);
  });

  it('returns 0 for the same point', () => {
    const dist = getDistanceKm(40.7128, -74.0060, 40.7128, -74.0060);
    expect(dist).toBe(0);
  });
});

describe('getStableOffset', () => {
  it('is deterministic for the same coordinates', () => {
    const lat = 40.7128;
    const lng = -74.0060;
    const offset1 = getStableOffset(lat, lng);
    const offset2 = getStableOffset(lat, lng);
    expect(offset1.latOffset).toBe(offset2.latOffset);
    expect(offset1.lngOffset).toBe(offset2.lngOffset);
  });

  it('masks locations within reasonable limits (<0.002 degrees / ~200m)', () => {
    const lat = 40.7128;
    const lng = -74.0060;
    const offset = getStableOffset(lat, lng);
    expect(Math.abs(offset.latOffset)).toBeLessThan(0.002);
    expect(Math.abs(offset.lngOffset)).toBeLessThan(0.002);
  });
});

describe('useGeolocation', () => {
  const devicePosition = {
    timestamp: 2_000,
    coords: {
      latitude: 19.076,
      longitude: 72.8777,
      accuracy: 12,
    },
  } as GeolocationPosition;

  function installGeolocation() {
    const successes: PositionCallback[] = [];
    const failures: PositionErrorCallback[] = [];
    let watchSuccess: PositionCallback | undefined;
    const getCurrentPosition = vi.fn((
      onSuccess: PositionCallback,
      onError: PositionErrorCallback,
    ) => {
      successes.push(onSuccess);
      failures.push(onError);
    });
    const watchPosition = vi.fn((onSuccess: PositionCallback) => {
      watchSuccess = onSuccess;
      return 73;
    });
    const clearWatch = vi.fn();
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition, watchPosition, clearWatch },
    });
    return {
      getCurrentPosition,
      watchPosition,
      clearWatch,
      getSuccess: (index = successes.length - 1) => successes[index],
      getFailure: (index = failures.length - 1) => failures[index],
      getWatchSuccess: () => watchSuccess,
    };
  }

  it('requests a fresh high-accuracy device position and keeps exact local coordinates', () => {
    localStorage.clear();
    const geo = installGeolocation();
    const { result } = renderHook(() => useGeolocation(true));

    act(() => result.current.requestLocation());
    expect(geo.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 },
    );

    act(() => geo.getSuccess()?.(devicePosition));

    expect(result.current.location).toEqual({ lat: 19.076, lng: 72.8777 });
    expect(result.current.sharedLocation).not.toEqual(result.current.location);
    expect(result.current.status).toBe('granted');
    expect(geo.watchPosition).toHaveBeenCalled();
  });

  it('does not use stored coordinates as current device location', () => {
    localStorage.setItem('norby_location_enabled', 'true');
    localStorage.setItem('norby_last_location', JSON.stringify({ lat: 1, lng: 2 }));
    installGeolocation();

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.location).toBeNull();
    expect(result.current.status).toBe('requesting');
  });

  it('maps browser permission denial to a retryable denied status', () => {
    localStorage.clear();
    const geo = installGeolocation();
    const { result } = renderHook(() => useGeolocation());
    const error = {
      code: 1,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    act(() => result.current.requestLocation());
    act(() => geo.getFailure()?.(error));

    expect(result.current.status).toBe('denied');
    expect(result.current.location).toBeNull();
  });

  it('waits for the location control gesture and does not repeat after denial', () => {
    localStorage.clear();
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: undefined,
    });
    const firstGeo = installGeolocation();
    const firstMount = renderHook(() => useGeolocation());

    expect(firstGeo.getCurrentPosition).toHaveBeenCalledTimes(1);
    act(() => firstGeo.getFailure()?.({
      code: 1,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
      message: "denied",
    } as GeolocationPositionError));
    firstMount.unmount();

    const secondGeo = installGeolocation();
    const secondMount = renderHook(() => useGeolocation());
    expect(secondGeo.getCurrentPosition).not.toHaveBeenCalled();
    expect(secondMount.result.current.status).toBe('denied');
    secondMount.unmount();
  });

  it('requests location on mount when browser permission is undecided (prompt)', async () => {
    localStorage.clear();
    const geo = installGeolocation();
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: { query: vi.fn().mockResolvedValue({ state: 'prompt' }) },
    });
    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await Promise.resolve();
    });

    expect(geo.getCurrentPosition).toHaveBeenCalledTimes(1);
    act(() => geo.getSuccess()?.(devicePosition));
    expect(result.current.status).toBe('granted');
    expect(result.current.location).toEqual({ lat: 19.076, lng: 72.8777 });
  });

  it('gets a fresh device fix automatically when browser permission is already granted', async () => {
    localStorage.clear();
    const geo = installGeolocation();
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: { query: vi.fn().mockResolvedValue({ state: 'granted' }) },
    });
    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await Promise.resolve();
    });
    act(() => geo.getSuccess()?.(devicePosition));

    expect(geo.getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(result.current.location).toEqual({ lat: 19.076, lng: 72.8777 });
  });

  it('honors browser permission if a prior local denial flag is stale', async () => {
    localStorage.clear();
    localStorage.setItem('norby_location_denied', 'true');
    const geo = installGeolocation();
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: { query: vi.fn().mockResolvedValue({ state: 'granted' }) },
    });
    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await Promise.resolve();
    });

    expect(geo.getCurrentPosition).toHaveBeenCalledTimes(1);
    act(() => geo.getSuccess()?.(devicePosition));
    expect(result.current.location).toEqual({ lat: 19.076, lng: 72.8777 });
  });

  it('ignores an older GPS response that arrives after a newer fix', async () => {
    localStorage.clear();
    const geo = installGeolocation();
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: { query: vi.fn().mockResolvedValue({ state: 'denied' }) },
    });
    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await Promise.resolve();
    });
    act(() => result.current.requestLocation());
    act(() => geo.getSuccess(0)?.(devicePosition));
    act(() => geo.getWatchSuccess()?.({
        timestamp: 3_000,
        coords: {
          latitude: 20,
          longitude: 73,
          accuracy: 5,
        },
      } as GeolocationPosition));

    let refreshResult: Promise<{ lat: number; lng: number } | null>;
    act(() => {
      refreshResult = result.current.refreshLocation();
    });
    act(() =>
      geo.getSuccess(1)?.({
        timestamp: 2_000,
        coords: {
          latitude: 1,
          longitude: 2,
          accuracy: 5,
        },
      } as GeolocationPosition),
    );

    expect(result.current.location).toEqual({ lat: 20, lng: 73 });
    await expect(refreshResult!).resolves.toEqual({ lat: 20, lng: 73 });
  });

  it('reports GPS timeouts and leaves location unset so the user can retry', () => {
    localStorage.clear();
    const geo = installGeolocation();
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestLocation());
    act(() => geo.getFailure()?.({
      code: 3,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
      message: "Timed out",
    } as GeolocationPositionError));

    expect(result.current.status).toBe('timeout');
    expect(result.current.location).toBeNull();
  });
});
