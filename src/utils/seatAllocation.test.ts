import { describe, it, expect } from 'vitest';
import { allocateSeats } from './seatAllocation';

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
      expect(() => allocateSeats(4, 5)).toThrow('학생 수가 모둠 수보다 많아야 합니다.');
    });

    it('throws error when totalGroups is 0 or negative', () => {
      expect(() => allocateSeats(10, 0)).toThrow();
      expect(() => allocateSeats(10, -2)).toThrow();
    });

    it('throws error when totalStudents is 0 or negative', () => {
      expect(() => allocateSeats(0, 5)).toThrow();
      expect(() => allocateSeats(-10, 2)).toThrow();
    });
  });
});
