/**
 * Sound synthesis utilities using the Web Audio API.
 * Synthesizes UI sound effects (ticks, chimes, fanfares) on the fly without audio asset files.
 */

let audioCtx: AudioContext | null = null;

/**
 * Resets the cached singleton AudioContext (used in test environments).
 */
export function resetAudioContextForTesting(): void {
  audioCtx = null;
}

/**
 * Safely gets or creates a singleton AudioContext.
 * Handles browser vendor prefixes and auto-resumes suspended contexts.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return null;

  try {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Synthesizes a quick mechanical slot/roulette tick (~30ms) with short exponential decay.
 */
export function playTickSound(ctx: AudioContext): void {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const duration = 0.03; // ~30ms

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + duration);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Ignore audio playback errors
  }
}

/**
 * Synthesizes a bright, crisp seat reveal chime (~250ms) using a sine wave ascending to ~1046Hz.
 */
export function playChimeSound(ctx: AudioContext): void {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const duration = 0.25; // ~250ms

    osc.type = 'sine';
    // Ascends from A5 (880Hz) to C6 (1046.5Hz)
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Ignore audio playback errors
  }
}

/**
 * Synthesizes a celebratory victory fanfare/arpeggio (C-E-G-C) with decay.
 */
export function playFanfareSound(ctx: AudioContext): void {
  try {
    // C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
    const notes = [
      { freq: 523.25, startOffset: 0.0, duration: 0.12 },
      { freq: 659.25, startOffset: 0.1, duration: 0.12 },
      { freq: 783.99, startOffset: 0.2, duration: 0.12 },
      { freq: 1046.5, startOffset: 0.3, duration: 0.35 },
    ];
    const now = ctx.currentTime;

    notes.forEach(({ freq, startOffset, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + startOffset;
      const stopTime = startTime + duration;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stopTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(startTime);
      osc.stop(stopTime);
    });
  } catch {
    // Ignore audio playback errors
  }
}
