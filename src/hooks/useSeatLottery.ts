import { useState, useCallback, useRef, useEffect } from 'react';
import { allocateSeats, Group, Seat } from '../utils/seatAllocation';

export type AnimationMode = 'instant' | 'sequential';
export type LotteryStatus = 'idle' | 'animating' | 'completed';

export interface UseSeatLotteryOptions {
  totalStudents: number;
  totalGroups: number;
  mode: AnimationMode;
  soundEffects?: {
    playTick?: () => void;
    playChime?: () => void;
    playFanfare?: () => void;
  };
  onComplete?: () => void;
  tickIntervalMs?: number; // default 50
  instantDurationMs?: number; // default 2000
  sequentialStepMs?: number; // default 150
}

export interface UseSeatLotteryResult {
  status: LotteryStatus;
  groups: Group[];
  displaySlotValues: Record<string, number>;
  revealedSeats: Set<string>;
  startLottery: () => void;
  resetLottery: () => void;
}

const DEFAULT_TICK_INTERVAL_MS = 50;
const DEFAULT_INSTANT_DURATION_MS = 2000;
const DEFAULT_SEQUENTIAL_STEP_MS = 150;
const TICK_SOUND_THROTTLE_MS = 100;

export function useSeatLottery(options: UseSeatLotteryOptions): UseSeatLotteryResult {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [status, setStatus] = useState<LotteryStatus>('idle');
  const [groups, setGroups] = useState<Group[]>(() => {
    try {
      return allocateSeats(options.totalStudents, options.totalGroups);
    } catch {
      return [];
    }
  });
  const [displaySlotValues, setDisplaySlotValues] = useState<Record<string, number>>({});
  const [revealedSeats, setRevealedSeats] = useState<Set<string>>(() => new Set());

  const statusRef = useRef<LotteryStatus>('idle');
  const revealedSeatsRef = useRef<Set<string>>(new Set());
  const currentSeatsRef = useRef<Seat[]>([]);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeTimerRef = useRef<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null>(null);
  const isModeTimerIntervalRef = useRef<boolean>(false);
  const sequentialIndexRef = useRef<number>(0);
  const lastTickSoundTimeRef = useRef<number>(-Infinity);

  const clearTimers = useCallback(() => {
    if (tickTimerRef.current !== null) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    if (modeTimerRef.current !== null) {
      if (isModeTimerIntervalRef.current) {
        clearInterval(modeTimerRef.current);
      } else {
        clearTimeout(modeTimerRef.current);
      }
      modeTimerRef.current = null;
    }
  }, []);

  // Update preview groups when idle if student or group count changes
  useEffect(() => {
    if (statusRef.current === 'idle') {
      try {
        const preview = allocateSeats(options.totalStudents, options.totalGroups);
        setGroups(preview);
      } catch {
        setGroups([]);
      }
    }
  }, [options.totalStudents, options.totalGroups]);

  // Clean up all active timers on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const startLottery = useCallback(() => {
    // Spam prevention: ignore if already animating
    if (statusRef.current === 'animating') {
      return;
    }

    clearTimers();

    const totalStudents = optionsRef.current.totalStudents;
    const totalGroups = optionsRef.current.totalGroups;

    let newGroups: Group[];
    try {
      newGroups = allocateSeats(totalStudents, totalGroups);
    } catch {
      return;
    }

    setGroups(newGroups);
    const seats = newGroups.flatMap((g) => g.seats);
    currentSeatsRef.current = seats;

    revealedSeatsRef.current = new Set();
    setRevealedSeats(new Set());
    lastTickSoundTimeRef.current = -Infinity;

    // Immediately seed displaySlotValues with fresh random numbers at t=0
    const initialSlotValues: Record<string, number> = {};
    for (const seat of seats) {
      initialSlotValues[seat.id] = Math.floor(Math.random() * totalStudents) + 1;
    }
    setDisplaySlotValues(initialSlotValues);

    statusRef.current = 'animating';
    setStatus('animating');

    if (seats.length === 0) {
      statusRef.current = 'completed';
      setStatus('completed');
      optionsRef.current.soundEffects?.playFanfare?.();
      optionsRef.current.onComplete?.();
      return;
    }

    const tickInterval = optionsRef.current.tickIntervalMs ?? DEFAULT_TICK_INTERVAL_MS;

    // Start rapid rolling ticker using captured snapshot of totalStudents
    tickTimerRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastTickSoundTimeRef.current >= TICK_SOUND_THROTTLE_MS) {
        lastTickSoundTimeRef.current = now;
        optionsRef.current.soundEffects?.playTick?.();
      }

      setDisplaySlotValues((prev) => {
        const unrevealedSeats = currentSeatsRef.current.filter(
          (seat) => !revealedSeatsRef.current.has(seat.id)
        );

        if (unrevealedSeats.length === 0) {
          return prev;
        }

        const next = { ...prev };
        for (const seat of unrevealedSeats) {
          next[seat.id] = Math.floor(Math.random() * totalStudents) + 1;
        }
        return next;
      });
    }, tickInterval);

    const mode = optionsRef.current.mode;

    if (mode === 'instant') {
      isModeTimerIntervalRef.current = false;
      const duration = optionsRef.current.instantDurationMs ?? DEFAULT_INSTANT_DURATION_MS;

      modeTimerRef.current = setTimeout(() => {
        clearTimers();

        const allRevealed = new Set<string>();
        const finalValues: Record<string, number> = {};

        for (const seat of currentSeatsRef.current) {
          allRevealed.add(seat.id);
          finalValues[seat.id] = seat.studentNumber;
        }

        revealedSeatsRef.current = allRevealed;
        setRevealedSeats(allRevealed);
        setDisplaySlotValues(finalValues);

        statusRef.current = 'completed';
        setStatus('completed');

        optionsRef.current.soundEffects?.playFanfare?.();
        optionsRef.current.onComplete?.();
      }, duration);
    } else {
      // Sequential mode
      sequentialIndexRef.current = 0;
      isModeTimerIntervalRef.current = true;
      const stepMs = optionsRef.current.sequentialStepMs ?? DEFAULT_SEQUENTIAL_STEP_MS;

      modeTimerRef.current = setInterval(() => {
        const index = sequentialIndexRef.current;
        const seats = currentSeatsRef.current;

        if (index < seats.length) {
          const seat = seats[index];
          revealedSeatsRef.current.add(seat.id);
          setRevealedSeats(new Set(revealedSeatsRef.current));

          setDisplaySlotValues((prev) => ({
            ...prev,
            [seat.id]: seat.studentNumber,
          }));

          optionsRef.current.soundEffects?.playChime?.();
          sequentialIndexRef.current++;

          if (sequentialIndexRef.current >= seats.length) {
            clearTimers();
            statusRef.current = 'completed';
            setStatus('completed');

            optionsRef.current.soundEffects?.playFanfare?.();
            optionsRef.current.onComplete?.();
          }
        } else {
          clearTimers();
        }
      }, stepMs);
    }
  }, [clearTimers]);

  const resetLottery = useCallback(() => {
    clearTimers();
    statusRef.current = 'idle';
    setStatus('idle');
    revealedSeatsRef.current = new Set();
    setRevealedSeats(new Set());
    setDisplaySlotValues({});
  }, [clearTimers]);

  return {
    status,
    groups,
    displaySlotValues,
    revealedSeats,
    startLottery,
    resetLottery,
  };
}
