export interface Seat {
  id: string;
  studentNumber: number;
}

export interface Group {
  id: number;
  name: string;
  seats: Seat[];
}

/**
 * Fisher-Yates shuffle algorithm to randomly shuffle an array.
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Allocates students randomly across groups using Fisher-Yates shuffle and modulo distribution.
 *
 * @param totalStudents Total number of students to allocate (must be >= totalGroups and > 0)
 * @param totalGroups Total number of groups to form (must be > 0)
 * @returns Array of groups containing allocated seats
 */
export function allocateSeats(totalStudents: number, totalGroups: number): Group[] {
  if (totalStudents <= 0 || totalGroups <= 0) {
    throw new Error('학생 수와 모둠 수는 1 이상이어야 합니다.');
  }

  if (totalStudents < totalGroups) {
    throw new Error('학생 수가 모둠 수보다 많아야 합니다.');
  }

  // Generate student numbers 1 to totalStudents
  const students = Array.from({ length: totalStudents }, (_, i) => i + 1);

  // Randomize student order with Fisher-Yates shuffle
  const shuffledStudents = shuffle(students);

  const baseCount = Math.floor(totalStudents / totalGroups);
  const remainder = totalStudents % totalGroups;

  const groups: Group[] = [];
  let studentIndex = 0;

  for (let g = 0; g < totalGroups; g++) {
    const seatCount = g < remainder ? baseCount + 1 : baseCount;
    const seats: Seat[] = [];

    for (let idx = 0; idx < seatCount; idx++) {
      seats.push({
        id: `group-${g + 1}-seat-${idx + 1}`,
        studentNumber: shuffledStudents[studentIndex++],
      });
    }

    groups.push({
      id: g + 1,
      name: `${g + 1}모둠`,
      seats,
    });
  }

  return groups;
}
