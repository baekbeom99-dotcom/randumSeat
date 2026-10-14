import { useCallback, useRef } from 'react';
import {
  getAudioContext,
  playTickSound,
  playChimeSound,
  playFanfareSound,
} from '../utils/soundSynth';

export interface SoundEffects {
  playTick: () => void;
  playChime: () => void;
  playFanfare: () => void;
}

/**
 * Custom hook providing Web Audio synthesized sound effects.
 * Safely handles muted states and environments without Web Audio API support.
 */
export function useSoundEffects(enabled: boolean = true): SoundEffects {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const playTick = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      const ctx = getAudioContext();
      if (ctx) {
        playTickSound(ctx);
      }
    } catch {
      // safe no-op
    }
  }, []);

  const playChime = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      const ctx = getAudioContext();
      if (ctx) {
        playChimeSound(ctx);
      }
    } catch {
      // safe no-op
    }
  }, []);

  const playFanfare = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      const ctx = getAudioContext();
      if (ctx) {
        playFanfareSound(ctx);
      }
    } catch {
      // safe no-op
    }
  }, []);

  return {
    playTick,
    playChime,
    playFanfare,
  };
}
