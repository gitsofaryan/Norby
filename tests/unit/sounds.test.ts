import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playSound } from '../../src/lib/sounds';

describe('playSound', () => {
  let mockOscillator: any;
  let mockGain: any;
  let mockAudioContext: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();

    mockOscillator = {
      connect: vi.fn(),
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      start: vi.fn(),
      stop: vi.fn(),
      type: 'sine',
    };

    mockGain = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    mockAudioContext = {
      state: 'suspended',
      currentTime: 10,
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
    };

    // Define AudioContext mock on global window
    global.window.AudioContext = vi.fn().mockImplementation(function (this: any) {
      return mockAudioContext;
    });
  });

  it('does not play sound if muted in localStorage', () => {
    localStorage.setItem('norby_mute_sounds', 'true');
    playSound('pop');
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  it('plays sound, creates oscillator and gain, and sets frequencies when not muted', () => {
    playSound('pop');
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
    expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });
});
