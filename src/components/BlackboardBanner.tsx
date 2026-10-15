import React from 'react';
import { Presentation, GraduationCap } from 'lucide-react';

export interface BlackboardBannerProps {
  className?: string;
}

export const BlackboardBanner: React.FC<BlackboardBannerProps> = ({
  className = '',
}) => {
  return (
    <div
      role="region"
      aria-label="교실 앞쪽 (칠판/교탁 위치)"
      className={`relative w-full max-w-4xl mx-auto rounded-2xl border-4 sm:border-8 border-amber-800 bg-[#1e3f20] text-white shadow-xl overflow-hidden py-3.5 px-4 sm:py-4 sm:px-8 select-none ${className}`}
    >
      {/* Chalkboard Texture / Inner Border */}
      <div className="absolute inset-1 rounded-xl border border-dashed border-white/20 pointer-events-none" />

      <div className="relative flex items-center justify-between sm:justify-center gap-3 sm:gap-8 text-center">
        {/* Podium / Teacher desk icon */}
        <div className="flex items-center gap-2 text-amber-200/90 bg-amber-900/40 px-3 py-1 rounded-lg border border-amber-700/50">
          <Presentation className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-semibold tracking-wider">
            교탁
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px bg-emerald-700/80" aria-hidden="true" />

        {/* Blackboard Center Banner */}
        <div className="flex items-center gap-2 sm:gap-3">
          <GraduationCap
            className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300"
            aria-hidden="true"
          />
          <span className="text-base sm:text-xl font-bold tracking-widest text-emerald-50 drop-shadow">
            칠판 (교실 앞)
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px bg-emerald-700/80" aria-hidden="true" />

        {/* Direction hint */}
        <span className="hidden sm:inline-block text-xs text-emerald-200/70 font-medium">
          선생님을 바라보는 방향입니다
        </span>
      </div>

      {/* Chalk tray accent at bottom with chalk pieces */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-amber-900/90 flex items-center justify-center gap-3"
        aria-hidden="true"
      >
        <span className="w-6 h-0.5 sm:h-1 bg-white/80 rounded-full" />
        <span className="w-5 h-0.5 sm:h-1 bg-yellow-200/80 rounded-full" />
        <span className="w-4 h-0.5 sm:h-1 bg-pink-200/80 rounded-full" />
      </div>
    </div>
  );
};

export default BlackboardBanner;
