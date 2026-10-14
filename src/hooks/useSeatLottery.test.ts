import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSeatLottery } from './useSeatLottery';

describe('useSeatLottery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('initializes with idle status, preview groups, and empty revealed seats', () => {
      const { result } = renderHook(() =>
        useSeatLottery({
          totalStudents: 20,
          totalGroups: 4,
          mode: 'instant',
        })
      );

      expect(result.current.status).toBe('idle');
      expect(result.current.groups).toHaveLength(4);
      expect(result.current.revealedSeats.size).toBe(0);
      expect(result.current.displaySlotValues).toEqual({});
      expect(typeof result.current.startLottery).toBe('function');
      expect(typeof result.current.resetLottery).toBe('function');
    });
  });

  describe('Instant Mode', () => {
    it('transitions idle -> animating -> completed and reveals all seats simultaneously', () => {
      const playTick = vi.fn();
      const playChime = vi.fn();
      const playFanfare = vi.fn();
      const onComplete = vi.fn();

      const { result } = renderHook(() =>
        useSeatLottery({
          totalStudents: 6,
          totalGroups: 2,
          mode: 'instant',
          tickIntervalMs: 50,
          instantDurationMs: 1000,
          soundEffects: { playTick, playChime, playFanfare },
          onComplete,
        })
      );

      // Start lottery
      act(() => {
        result.current.startLottery();
      });

      expect(result.current.status).toBe('animating');
      expect(result.current.revealedSeats.size).toBe(0);

      // Advance by 1 tick interval
      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(result.current.status).toBe('animating');
      expect(playTick).toHaveBeenCalled();

      // Check rolling values are assigned
      const seatIds = result.current.groups.flatMap((g) => g.seats.map((s) => s.id));
      seatIds.forEach((id) => {
        expect(result.current.displaySlotValues[id]).toBeGreaterThanOrEqual(1);
        expect(result.current.displaySlotValues[id]).toBeLessThanOrEqual(6);
      });

      // Advance to full duration
      act(() => {
        vi.advanceTimersByTime(950);
      });

      expect(result.current.status).toBe('completed');
      expect(result.current.revealedSeats.size).toBe(6);
      expect(playChime).toHaveBeenCalledTimes(1);
      expect(playFanfare).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);

      // Verify all displaySlotValues match allocated target studentNumber
      result.current.groups.forEach((group) => {
        group.seats.forEach((seat) => {
          expect(result.current.revealedSeats.has(seat.id)).toBe(true);
          expect(result.current.displaySlotValues[seat.id]).toBe(seat.studentNumber);
        });
      });
    });
  });

  describe('Sequential Mode', () => {
    it('reveals seats one by one every sequentialStepMs and completes with fanfare', () => {
      const playTick = vi.fn();
      const playChime = vi.fn();
      const playFanfare = vi.fn();
      const onComplete = vi.fn();

      const { result } = renderHook(() =>
        useSeatLottery({
          totalStudents: 4,
          totalGroups: 2,
          mode: 'sequential',
          tickIntervalMs: 50,
          sequentialStepMs: 150,
          soundEffects: { playTick, playChime, playFanfare },
          onComplete,
        })
      );

      act(() => {
        result.current.startLottery();
      });

      expect(result.current.status).toBe('animating');
      expect(result.current.revealedSeats.size).toBe(0);

      const allSeats = result.current.groups.flatMap((g) => g.seats);
      expect(allSeats).toHaveLength(4);

      // Step 1: Reveal first seat at 150ms
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.revealedSeats.size).toBe(1);
      expect(result.current.revealedSeats.has(allSeats[0].id)).toBe(true);
      expect(result.current.displaySlotValues[allSeats[0].id]).toBe(allSeats[0].studentNumber);
      expect(playChime).toHaveBeenCalledTimes(1);
      expect(result.current.status).toBe('animating');

      // Step 2: Reveal second seat at 300ms
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.revealedSeats.size).toBe(2);
      expect(result.current.revealedSeats.has(allSeats[1].id)).toBe(true);
      expect(result.current.displaySlotValues[allSeats[1].id]).toBe(allSeats[1].studentNumber);
      expect(playChime).toHaveBeenCalledTimes(2);

      // Step 3: Reveal third seat at 450ms
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.revealedSeats.size).toBe(3);
      expect(playChime).toHaveBeenCalledTimes(3);

      // Step 4: Reveal fourth (last) seat at 600ms
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.revealedSeats.size).toBe(4);
      expect(playChime).toHaveBeenCalledTimes(4);
      expect(playFanfare).toHaveBeenCalledTimes(1);
      expect(result.current.status).toBe('completed');
      expect(onComplete).toHaveBeenCalledTimes(1);

      // All seats locked to their targets
      allSeats.forEach((seat) => {
        expect(result.current.displaySlotValues[seat.id]).toBe(seat.studentNumber);
      });
    });
  });

  describe('Spam Prevention', () => {
    it('ignores startLottery calls while already animating', () => {
      const { result } = renderHook(() =>
        useSeatLottery({
          totalStudents: 4,
          totalGroups: 2,
          mode: 'instant',
          instantDurationMs: 1000,
        })
      );

      act(() => {
        result.current.startLottery();
      });

      const initialGroups = result.current.groups;
      expect(result.current.status).toBe('animating');

      // Second startLottery call should be ignored
      act(() => {
        result.current.startLottery();
      });

      expect(result.current.groups).toBe(initialGroups);
      expect(result.current.status).toBe('animating');
    });
  });

  describe('Reset Functionality', () => {
    it('cancels active timers and resets status and revealed seats', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useSeatLottery({
          totalStudents: 6,
          totalGroups: 2,
          mode: 'instant',
          instantDurationMs: 1000,
          onComplete,
        })
      );

      act(() => {
        result.current.startLottery();
      });

      expect(result.current.status).toBe('animating');

      // Reset lottery halfway through
      act(() => {
        vi.advanceTimersByTime(500);
        result.current.resetLottery();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.revealedSeats.size).toBe(0);
      expect(result.current.displaySlotValues).toEqual({});

      // Advance remaining time - onComplete should NOT fire
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onComplete).not.toHaveBeenCalled();
      expect(result.current.status).toBe('idle');
    });
  });

  describe('Tick sound throttling', () => {
    it('throttles tick sound to ~100ms intervals instead of every tick interval', () => {
      const playTick = vi.fn();
      const { result } = renderHook(() =>
        useSeatLottery({
          totalStudents: 10,
          totalGroups: 2,
          mode: 'instant',
          tickIntervalMs: 50,
          instantDurationMs: 1000,
          soundEffects: { playTick },
        })
      );

      act(() => {
        result.current.startLottery();
      });

      // 4 ticks (200ms) with 50ms interval -> should be throttled to ~2 plays
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Ticks at 50ms (1st), 150ms (2nd). 100ms and 200ms are skipped because < 100ms elapsed.
      expect(playTick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cleanup on Unmount', () => {
    it('cancels all active timers when unmounted', () => {
      const onComplete = vi.fn();
      const playFanfare = vi.fn();

      const { result, unmount } = renderHook(() =>
        useSeatLottery({
          totalStudents: 6,
          totalGroups: 2,
          mode: 'instant',
          instantDurationMs: 1000,
          soundEffects: { playFanfare },
          onComplete,
        })
      );

      act(() => {
        result.current.startLottery();
      });

      // Unmount while animating
      unmount();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onComplete).not.toHaveBeenCalled();
      expect(playFanfare).not.toHaveBeenCalled();
    });
  });

  describe('Re-running lottery', () => {
    it('allows starting a new lottery after previous lottery completed', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useSeatLottery({
          totalStudents: 4,
          totalGroups: 2,
          mode: 'instant',
          instantDurationMs: 500,
          onComplete,
        })
      );

      // First run
      act(() => {
        result.current.startLottery();
      });
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current.status).toBe('completed');
      expect(onComplete).toHaveBeenCalledTimes(1);

      // Second run
      act(() => {
        result.current.startLottery();
      });
      expect(result.current.status).toBe('animating');
      expect(result.current.revealedSeats.size).toBe(0);

      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current.status).toBe('completed');
      expect(onComplete).toHaveBeenCalledTimes(2);
    });
  });

  describe('Options change & preview update', () => {
    it('updates preview groups when totalStudents/totalGroups change in idle status', () => {
      const { result, rerender } = renderHook(
        (props: { totalStudents: number; totalGroups: number }) =>
          useSeatLottery({
            totalStudents: props.totalStudents,
            totalGroups: props.totalGroups,
            mode: 'instant',
          }),
        {
          initialProps: { totalStudents: 10, totalGroups: 2 },
        }
      );

      expect(result.current.groups).toHaveLength(2);

      rerender({ totalStudents: 15, totalGroups: 3 });
      expect(result.current.groups).toHaveLength(3);
    });

    it('handles invalid totalStudents gracefully', () => {
      const { result } = renderHook(() =>
        useSeatLottery({
          totalStudents: 2,
          totalGroups: 5,
          mode: 'instant',
        })
      );

      expect(result.current.groups).toEqual([]);
      expect(result.current.status).toBe('idle');

      // Calling startLottery with invalid config does not throw
      expect(() => {
        act(() => {
          result.current.startLottery();
        });
      }).not.toThrow();
    });
  });
});

