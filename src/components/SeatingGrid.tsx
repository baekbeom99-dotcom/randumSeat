import type { Ref } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Group } from '../utils/seatAllocation';
import GroupCard from './GroupCard';

export interface SeatingGridProps {
  groups: Group[];
  displaySlotValues: Record<string, number>;
  revealedSeats: Set<string>;
  isAnimating: boolean;
  gridRef?: Ref<HTMLDivElement>;
}

function getGridColsClass(groupCount: number): string {
  if (groupCount <= 1) {
    return 'grid-cols-1 max-w-md mx-auto';
  }
  if (groupCount === 2) {
    return 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto';
  }
  if (groupCount <= 4) {
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto';
  }
  if (groupCount <= 8) {
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto';
  }
  return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 max-w-7xl mx-auto';
}

export default function SeatingGrid({
  groups,
  displaySlotValues,
  revealedSeats,
  isAnimating,
  gridRef,
}: SeatingGridProps) {
  if (groups.length === 0) {
    return (
      <div
        ref={gridRef}
        data-testid="seating-grid-empty"
        className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white/60 rounded-2xl border-2 border-dashed border-slate-200 min-h-[300px]"
      >
        <LayoutGrid className="w-12 h-12 stroke-[1.5] text-slate-300 mb-3" />
        <p className="text-base font-medium">배치된 모둠이 없습니다.</p>
        <p className="text-xs text-slate-400 mt-1">
          상단 설정에서 학생 수와 모둠 수를 선택한 후 자리 뽑기를 시작해 주세요.
        </p>
      </div>
    );
  }

  const gridColsClass = getGridColsClass(groups.length);

  return (
    <div
      ref={gridRef}
      data-testid="seating-grid"
      className={`grid gap-4 sm:gap-6 p-4 sm:p-6 w-full ${gridColsClass}`}
    >
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          displaySlotValues={displaySlotValues}
          revealedSeats={revealedSeats}
          isAnimating={isAnimating}
        />
      ))}
    </div>
  );
}
