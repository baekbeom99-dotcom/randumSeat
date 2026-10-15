import { Sparkles, Check } from 'lucide-react';

export interface SeatTileProps {
  seatId: string;
  seatIndex: number; // e.g. 1st seat in group (1-based)
  displayValue: number; // currently displayed number
  isRevealed: boolean;
  isAnimating: boolean;
}

export default function SeatTile({
  seatId,
  seatIndex,
  displayValue,
  isRevealed,
  isAnimating,
}: SeatTileProps) {
  const isRolling = isAnimating && !isRevealed;
  const hasValue = displayValue > 0;

  let containerStyle = '';
  let badgeStyle = '';
  let numberStyle = '';

  if (isRevealed) {
    // Triumphant confirmed stamp appearance
    containerStyle =
      'bg-emerald-500 border-2 border-emerald-600 text-white shadow-lg ring-2 ring-emerald-300/60 scale-100 transition-transform duration-200';
    badgeStyle = 'bg-emerald-600/80 text-emerald-100 border border-emerald-400/30';
    numberStyle = 'text-white font-extrabold drop-shadow-sm';
  } else if (isRolling) {
    // Energetic roulette/slot rolling state
    containerStyle =
      'bg-amber-50 border-2 border-amber-400 text-amber-900 shadow-md ring-2 ring-amber-400/50 animate-pulse';
    badgeStyle = 'bg-amber-200 text-amber-800 font-semibold';
    numberStyle = 'text-amber-600 font-black';
  } else {
    // Idle desk preview card
    containerStyle =
      'bg-slate-50/80 border-2 border-dashed border-slate-300 text-slate-700 shadow-sm hover:border-slate-400 transition-colors';
    badgeStyle = 'bg-slate-200/90 text-slate-600 font-medium';
    numberStyle = hasValue ? 'text-slate-800 font-bold' : 'text-slate-400 font-bold';
  }

  return (
    <div
      data-testid={`seat-tile-${seatId}`}
      data-seat-id={seatId}
      data-revealed={isRevealed}
      data-animating={isRolling}
      aria-label={`자리 ${seatIndex}: ${isRevealed ? `${displayValue}번` : isRolling ? '추첨 진행 중' : '대기 중'}`}
      className={`relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-xl min-h-[96px] sm:min-h-[110px] select-none ${containerStyle}`}
    >
      {/* Top Header: Seat index badge */}
      <div className="w-full flex items-center justify-between">
        <span
          className={`text-[11px] sm:text-xs px-2 py-0.5 rounded-full tracking-wide ${badgeStyle}`}
        >
          자리 {seatIndex}
        </span>
        {isRevealed ? (
          <span
            className="flex items-center text-xs text-emerald-100 bg-emerald-600/70 rounded-full p-0.5"
            aria-hidden="true"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        ) : isRolling ? (
          <span
            className="flex items-center text-xs text-amber-600 animate-spin"
            aria-hidden="true"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        ) : null}
      </div>

      {/* Center Number Display */}
      <div className="flex-1 flex items-center justify-center my-1">
        <span
          className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${numberStyle}`}
        >
          {hasValue ? displayValue : '?'}
        </span>
      </div>

      {/* Bottom Sub-label / Desk feel */}
      <div className="text-[10px] sm:text-[11px] opacity-80 font-medium">
        {isRevealed ? '확정' : isRolling ? '뽑는 중...' : '준비'}
      </div>
    </div>
  );
}
