import { describe, it, expect } from 'vitest';
import { formatDistance, formatDuration } from '../../src/lib/routing';

describe('formatDistance', () => {
  it('displays m vs km correctly', () => {
    expect(formatDistance(500)).toBe('500 m');
    expect(formatDistance(999)).toBe('999 m');
    expect(formatDistance(1000)).toBe('1.0 km');
    expect(formatDistance(1500)).toBe('1.5 km');
    expect(formatDistance(12345)).toBe('12.3 km');
  });
});

describe('formatDuration', () => {
  it('displays min vs hr correctly', () => {
    expect(formatDuration(30)).toBe('1 min'); // 30s rounds up to 1 min
    expect(formatDuration(120)).toBe('2 min');
    expect(formatDuration(3540)).toBe('59 min');
    expect(formatDuration(3600)).toBe('1 hr 0 min');
    expect(formatDuration(5400)).toBe('1 hr 30 min');
  });
});
