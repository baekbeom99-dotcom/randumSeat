import { Users } from 'lucide-react';
import { Group } from '../utils/seatAllocation';
import SeatTile from './SeatTile';

export interface GroupCardProps {
  group: Group;
  displaySlotValues: Record<string, number>;
  revealedSeats: Set<string>;
  isAnimating: boolean;
}

interface Palette {
  cardBorder: string;
  cardBg: string;
  title: string;
  badge: string;
  accentDot: string;
}

const PALETTES: Palette[] = [
  // 0: Blue
  {
    cardBorder: 'border-sky-200 shadow-sky-100/50',
    cardBg: 'bg-white',
    title: 'text-sky-950',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    accentDot: 'bg-sky-500',
  },
  // 1: Green
  {
    cardBorder: 'border-emerald-200 shadow-emerald-100/50',
    cardBg: 'bg-white',
    title: 'text-emerald-950',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentDot: 'bg-emerald-500',
  },
  // 2: Purple
  {
    cardBorder: 'border-purple-200 shadow-purple-100/50',
    cardBg: 'bg-white',
    title: 'text-purple-950',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    accentDot: 'bg-purple-500',
  },
  // 3: Amber
  {
    cardBorder: 'border-amber-200 shadow-amber-100/50',
    cardBg: 'bg-white',
    title: 'text-amber-950',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    accentDot: 'bg-amber-500',
  },
  // 4: Rose
  {
    cardBorder: 'border-rose-200 shadow-rose-100/50',
    cardBg: 'bg-white',
    title: 'text-rose-950',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    accentDot: 'bg-rose-500',
  },
  // 5: Teal
  {
    cardBorder: 'border-teal-200 shadow-teal-100/50',
    cardBg: 'bg-white',
    title: 'text-teal-950',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    accentDot: 'bg-teal-500',
  },
];

export default function GroupCard({
  group,
  displaySlotValues,
  revealedSeats,
  isAnimating,
}: GroupCardProps) {
  const paletteIndex = ((group.id - 1) % PALETTES.length + PALETTES.length) % PALETTES.length;
  const palette = PALETTES[paletteIndex];

  return (
    <div
      data-testid={`group-card-${group.id}`}
      className={`flex flex-col rounded-2xl border-2 p-3 sm:p-4 shadow-md transition-all duration-200 ${palette.cardBorder} ${palette.cardBg}`}
    >
      {/* Header with group title and member count badge */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${palette.accentDot}`}
            aria-hidden="true"
          />
          <h3 className={`text-base sm:text-lg font-bold tracking-tight ${palette.title}`}>
            {group.name}
          </h3>
        </div>
        <div
          className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${palette.badge}`}
        >
          <Users className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{group.seats.length}명</span>
        </div>
      </div>

      {/* Classroom Desk Formation (Pair/Grid layout) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 flex-1 items-stretch">
        {group.seats.map((seat, index) => (
          <SeatTile
            key={seat.id}
            seatId={seat.id}
            seatIndex={index + 1}
            displayValue={displaySlotValues[seat.id] ?? 0}
            isRevealed={revealedSeats.has(seat.id)}
            isAnimating={isAnimating}
          />
        ))}
      </div>
    </div>
  );
}
