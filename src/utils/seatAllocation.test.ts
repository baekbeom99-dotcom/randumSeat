import { describe, it, expect } from 'vitest';
import { allocateSeats, shuffle } from './seatAllocation';

describe('seatAllocation', () => {
  describe('divisible distribution', () => {
    it('evenly distributes students when totalStudents is divisible by totalGroups', () => {
      const totalStudents = 24;
      const totalGroups = 6;
      const groups = allocateSeats(totalStudents, totalGroups);

      expect(groups).toHaveLength(totalGroups);

      groups.forEach((group, groupIdx) => {
        expect(group.id).toBe(groupIdx + 1);
        expect(group.name).toBe(`${groupIdx + 1}모둠`);
        expect(group.seats).toHaveLength(4);

        group.seats.forEach((seat, seatIdx) => {
          expect(seat.id).toBe(`group-${groupIdx + 1}-seat-${seatIdx + 1}`);
          expect(seat.studentNumber).toBeGreaterThanOrEqual(1);
          expect(seat.studentNumber).toBeLessThanOrEqual(totalStudents);
        });
      });
    });
  });

  describe('indivisible distribution', () => {
    it('allocates remainder students to earlier groups', () => {
      const totalStudents = 25;
      const totalGroups = 6;
      const groups = allocateSeats(totalStudents, totalGroups);

      expect(groups).toHaveLength(6);

      // remainder = 25 % 6 = 1 -> group 0 has 5 seats, groups 1..5 have 4 seats
      expect(groups[0].seats).toHaveLength(5);
      for (let i = 1; i < 6; i++) {
        expect(groups[i].seats).toHaveLength(4);
      }

      const totalSeats = groups.reduce((acc, g) => acc + g.seats.length, 0);
      expect(totalSeats).toBe(totalStudents);
    });

    it('handles multiple remainders correctly', () => {
      const totalStudents = 26;
      const totalGroups = 4;
      // 26 / 4 = 6 remainder 2 -> groups 0 and 1 have 7 seats, groups 2 and 3 have 6 seats
      const groups = allocateSeats(totalStudents, totalGroups);

      expect(groups).toHaveLength(4);
      expect(groups[0].seats).toHaveLength(7);
      expect(groups[1].seats).toHaveLength(7);
      expect(groups[2].seats).toHaveLength(6);
      expect(groups[3].seats).toHaveLength(6);

      const totalSeats = groups.reduce((acc, g) => acc + g.seats.length, 0);
      expect(totalSeats).toBe(totalStudents);
    });
  });

  describe('boundary conditions', () => {
    it('handles totalStudents === totalGroups (1 student per group)', () => {
      const totalStudents = 5;
      const totalGroups = 5;
      const groups = allocateSeats(totalStudents, totalGroups);

      expect(groups).toHaveLength(5);
      groups.forEach((group, idx) => {
        expect(group.id).toBe(idx + 1);
        expect(group.seats).toHaveLength(1);
        expect(group.seats[0].id).toBe(`group-${idx + 1}-seat-1`);
      });

      const totalSeats = groups.reduce((acc, g) => acc + g.seats.length, 0);
      expect(totalSeats).toBe(5);
    });

    it('handles totalGroups === 1 (all students in one group)', () => {
      const totalStudents = 20;
      const totalGroups = 1;
      const groups = allocateSeats(totalStudents, totalGroups);

      expect(groups).toHaveLength(1);
      expect(groups[0].id).toBe(1);
      expect(groups[0].name).toBe('1모둠');
      expect(groups[0].seats).toHaveLength(20);

      groups[0].seats.forEach((seat, seatIdx) => {
        expect(seat.id).toBe(`group-1-seat-${seatIdx + 1}`);
      });
    });
  });

  describe('custom randomFn & shuffle', () => {
    it('exports and uses custom randomFn in shuffle', () => {
      const input = [1, 2, 3, 4];
      // When randomFn returns 0, Math.floor(0 * (i + 1)) is always 0
      const shuffled = shuffle(input, () => 0);
      expect(shuffled).toHaveLength(4);
      expect(shuffled.sort()).toEqual([1, 2, 3, 4]);
    });

    it('supports deterministic testing via randomFn parameter in allocateSeats', () => {
      // Identity-like random: always swap with 0th index
      const groups = allocateSeats(4, 2, () => 0);
      expect(groups).toHaveLength(2);
      expect(groups[0].seats).toHaveLength(2);
      expect(groups[1].seats).toHaveLength(2);
    });
  });

  describe('uniqueness and integrity', () => {
    it('contains every student number from 1 to totalStudents exactly once', () => {
      const totalStudents = 30;
      const totalGroups = 5;
      const groups = allocateSeats(totalStudents, totalGroups);

      const allAssignedStudents: number[] = [];
      groups.forEach((group) => {
        group.seats.forEach((seat) => {
          allAssignedStudents.push(seat.studentNumber);
        });
      });

      expect(allAssignedStudents).toHaveLength(totalStudents);

      const uniqueStudents = new Set(allAssignedStudents);
      expect(uniqueStudents.size).toBe(totalStudents);

      const sortedStudents = [...allAssignedStudents].sort((a, b) => a - b);
      const expectedStudents = Array.from({ length: totalStudents }, (_, i) => i + 1);
      expect(sortedStudents).toEqual(expectedStudents);
    });
  });

  describe('validation and edge cases', () => {
    it('throws error when totalStudents is less than totalGroups', () => {
      expect(() => allocateSeats(4, 5)).toThrow('학생 수는 모둠 수 이상이어야 합니다.');
    });

    it('throws error when totalGroups is 0 or negative', () => {
      expect(() => allocateSeats(10, 0)).toThrow('학생 수와 모둠 수는 1 이상의 정수여야 합니다.');
      expect(() => allocateSeats(10, -2)).toThrow('학생 수와 모둠 수는 1 이상의 정수여야 합니다.');
    });

    it('throws error when totalStudents is 0 or negative', () => {
      expect(() => allocateSeats(0, 5)).toThrow('학생 수와 모둠 수는 1 이상의 정수여야 합니다.');
      expect(() => allocateSeats(-10, 2)).toThrow('학생 수와 모둠 수는 1 이상의 정수여야 합니다.');
    });

    it('throws error when inputs are non-integers or NaN', () => {
      expect(() => allocateSeats(25.5, 6)).toThrow('학생 수와 모둠 수는 1 이상의 정수여야 합니다.');
      expect(() => allocateSeats(24, 3.5)).toThrow('학생 수와 모둠 수는 1 이상의 정수여야 합니다.');
      expect(() => allocateSeats(NaN, 5)).toThrow('학생 수와 모둠 수는 1 이상의 정수여야 합니다.');
      expect(() => allocateSeats(20, NaN)).toThrow('학생 수와 모둠 수는 1 이상의 정수여야 합니다.');
    });
  });
});
