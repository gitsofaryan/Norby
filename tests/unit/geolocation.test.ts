import { describe, it, expect } from 'vitest';
import { getDistanceKm, getStableOffset } from '../../src/hooks/useGeolocation';

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
