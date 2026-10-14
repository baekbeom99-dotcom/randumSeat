import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  getAudioContext,
  playTickSound,
  playChimeSound,
  playFanfareSound,
  resetAudioContextForTesting,
} from './soundSynth';
import { useSoundEffects } from '../hooks/useSoundEffects';

function createMockAudioContext(state: AudioContextState = 'running') {
  return {
    state,
    currentTime: 1.0,
    destination: {} as AudioDestinationNode,
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => ({
      type: 'sine' as OscillatorType,
      frequency: {
        value: 440,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    })),
  } as unknown as AudioContext;
}

describe('soundSynth', () => {
  const originalAudioContext = window.AudioContext;
  const originalWebkitAudioContext = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  beforeEach(() => {
    vi.restoreAllMocks();
    resetAudioContextForTesting?.();
    delete (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext;
    delete (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  });

  afterEach(() => {
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext = originalAudioContext;
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext = originalWebkitAudioContext;
  });

  describe('getAudioContext', () => {
    it('returns null when AudioContext is not supported', () => {
      const ctx = getAudioContext();
      expect(ctx).toBeNull();
    });

    it('creates singleton AudioContext when window.AudioContext exists', () => {
      const mockCtx = createMockAudioContext('running');
      const MockCtor = vi.fn().mockImplementation(() => mockCtx);
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext = MockCtor as unknown as typeof AudioContext;

      const first = getAudioContext();
      const second = getAudioContext();

      expect(first).toBe(mockCtx);
      expect(second).toBe(mockCtx);
      expect(MockCtor).toHaveBeenCalledTimes(1);
    });

    it('falls back to window.webkitAudioContext if AudioContext is missing', () => {
      const mockCtx = createMockAudioContext('running');
      const MockCtor = vi.fn().mockImplementation(() => mockCtx);
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext = MockCtor as unknown as typeof AudioContext;

      const ctx = getAudioContext();
      expect(ctx).toBe(mockCtx);
      expect(MockCtor).toHaveBeenCalledTimes(1);
    });

    it('resumes audio context if it is suspended', () => {
      const mockCtx = createMockAudioContext('suspended');
      const MockCtor = vi.fn().mockImplementation(() => mockCtx);
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext = MockCtor as unknown as typeof AudioContext;

      const ctx = getAudioContext();
      expect(ctx).toBe(mockCtx);
      expect(mockCtx.resume).toHaveBeenCalled();
    });

    it('recreates audio context if previous context was closed', () => {
      const mockCtx1 = createMockAudioContext('running');
      const mockCtx2 = createMockAudioContext('running');
      const MockCtor = vi.fn()
        .mockImplementationOnce(() => mockCtx1)
        .mockImplementationOnce(() => mockCtx2);
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext = MockCtor as unknown as typeof AudioContext;

      const first = getAudioContext();
      expect(first).toBe(mockCtx1);

      // Now simulate context closing
      (mockCtx1 as unknown as { state: AudioContextState }).state = 'closed';

      const second = getAudioContext();
      expect(second).toBe(mockCtx2);
      expect(MockCtor).toHaveBeenCalledTimes(2);
    });
  });

  describe('playTickSound', () => {
    it('creates oscillator and gain, ramps parameters, and starts/stops (~30ms)', () => {
      const mockCtx = createMockAudioContext();
      playTickSound(mockCtx);

      expect(mockCtx.createOscillator).toHaveBeenCalledTimes(1);
      expect(mockCtx.createGain).toHaveBeenCalledTimes(1);

      const osc = (mockCtx.createOscillator as ReturnType<typeof vi.fn>).mock.results[0].value;
      const gain = (mockCtx.createGain as ReturnType<typeof vi.fn>).mock.results[0].value;

      expect(osc.connect).toHaveBeenCalledWith(gain);
      expect(gain.connect).toHaveBeenCalledWith(mockCtx.destination);
      expect(osc.start).toHaveBeenCalledWith(mockCtx.currentTime);
      expect(osc.stop).toHaveBeenCalledWith(mockCtx.currentTime + 0.03);
    });

    it('does not throw when an error occurs during audio node setup', () => {
      const brokenCtx = {
        currentTime: 0,
        createOscillator: vi.fn().mockImplementation(() => {
          throw new Error('AudioContext error');
        }),
      } as unknown as AudioContext;

      expect(() => playTickSound(brokenCtx)).not.toThrow();
    });
  });

  describe('playChimeSound', () => {
    it('creates sine wave oscillator (~880-1046Hz) and plays for ~250ms', () => {
      const mockCtx = createMockAudioContext();
      playChimeSound(mockCtx);

      expect(mockCtx.createOscillator).toHaveBeenCalledTimes(1);
      expect(mockCtx.createGain).toHaveBeenCalledTimes(1);

      const osc = (mockCtx.createOscillator as ReturnType<typeof vi.fn>).mock.results[0].value;
      const gain = (mockCtx.createGain as ReturnType<typeof vi.fn>).mock.results[0].value;

      expect(osc.type).toBe('sine');
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(expect.any(Number), mockCtx.currentTime);
      expect(osc.start).toHaveBeenCalledWith(mockCtx.currentTime);
      expect(osc.stop).toHaveBeenCalledWith(mockCtx.currentTime + 0.25);
      expect(gain.connect).toHaveBeenCalledWith(mockCtx.destination);
    });

    it('does not throw when an error occurs', () => {
      const brokenCtx = {
        currentTime: 0,
        createOscillator: vi.fn().mockImplementation(() => {
          throw new Error('Chime failure');
        }),
      } as unknown as AudioContext;

      expect(() => playChimeSound(brokenCtx)).not.toThrow();
    });
  });

  describe('playFanfareSound', () => {
    it('creates arpeggio notes for celebratory fanfare', () => {
      const mockCtx = createMockAudioContext();
      playFanfareSound(mockCtx);

      // Should schedule multiple notes (C-E-G-C, at least 4 notes)
      expect(mockCtx.createOscillator).toHaveBeenCalledTimes(4);
      expect(mockCtx.createGain).toHaveBeenCalledTimes(4);
    });

    it('does not throw when an error occurs', () => {
      const brokenCtx = {
        currentTime: 0,
        createOscillator: vi.fn().mockImplementation(() => {
          throw new Error('Fanfare failure');
        }),
      } as unknown as AudioContext;

      expect(() => playFanfareSound(brokenCtx)).not.toThrow();
    });
  });
});

describe('useSoundEffects', () => {
  beforeEach(() => {
    resetAudioContextForTesting?.();
    delete (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext;
  });

  it('safely handles missing AudioContext without error', () => {
    const { result } = renderHook(() => useSoundEffects(true));

    expect(() => {
      act(() => {
        result.current.playTick();
        result.current.playChime();
        result.current.playFanfare();
      });
    }).not.toThrow();
  });

  it('plays sounds when enabled is true and AudioContext is available', () => {
    const mockCtx = createMockAudioContext();
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext = vi.fn().mockImplementation(() => mockCtx);

    const { result } = renderHook(() => useSoundEffects(true));

    act(() => {
      result.current.playTick();
    });
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.playChime();
    });
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.playFanfare();
    });
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(6); // 2 + 4 = 6
  });

  it('does not play sounds when enabled is false (muted)', () => {
    const mockCtx = createMockAudioContext();
    const MockCtor = vi.fn().mockImplementation(() => mockCtx);
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext = MockCtor;

    const { result } = renderHook(() => useSoundEffects(false));

    act(() => {
      result.current.playTick();
      result.current.playChime();
      result.current.playFanfare();
    });

    expect(MockCtor).not.toHaveBeenCalled();
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });
});
