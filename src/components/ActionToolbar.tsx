import React, { useState } from 'react';
import { RotateCcw, Printer, Download, PartyPopper, Loader2 } from 'lucide-react';
import { triggerConfetti, exportSeatingAsPng, printSeating } from '../utils/exportUtils';

export interface ActionToolbarProps {
  onReshuffle: () => void;
  isAnimating: boolean;
  status: 'idle' | 'animating' | 'completed';
  targetRef: React.RefObject<HTMLElement | null>;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onReshuffle,
  isAnimating,
  status,
  targetRef,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPng = async () => {
    if (isExporting || isAnimating || status === 'idle') {
      return;
    }
    setIsExporting(true);
    try {
      await exportSeatingAsPng(targetRef.current);
    } finally {
      setIsExporting(false);
    }
  };

  const isReshuffleDisabled = isAnimating;
  const isPrintDisabled = isAnimating;
  const isExportDisabled = isAnimating || status === 'idle' || isExporting;
  const isConfettiDisabled = isAnimating || status !== 'completed';

  return (
    <div
      role="toolbar"
      aria-label="배치표 도구 모음"
      className="no-print flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/90 shadow-sm max-w-4xl mx-auto my-4 transition-all"
    >
      {/* 다시 뽑기 */}
      <button
        type="button"
        onClick={onReshuffle}
        disabled={isReshuffleDisabled}
        aria-label="자리 다시 뽑기"
        title="자리를 다시 섞어서 추첨합니다"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        <span>다시 뽑기</span>
      </button>

      {/* 자리 배치표 인쇄 */}
      <button
        type="button"
        onClick={printSeating}
        disabled={isPrintDisabled}
        aria-label="자리 배치표 인쇄"
        title="현재 자리 배치표를 인쇄합니다"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 active:scale-95 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
      >
        <Printer className="w-4 h-4 text-slate-600" aria-hidden="true" />
        <span>자리 배치표 인쇄</span>
      </button>

      {/* 이미지(PNG) 저장 */}
      <button
        type="button"
        onClick={handleExportPng}
        disabled={isExportDisabled}
        aria-label="자리 배치표 이미지(PNG) 저장"
        title="자리 배치표를 고화질 PNG 이미지로 저장합니다"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>저장 중...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>이미지(PNG) 저장</span>
          </>
        )}
      </button>

      {/* 축하 폭죽 */}
      <button
        type="button"
        onClick={triggerConfetti}
        disabled={isConfettiDisabled}
        aria-label="축하 폭죽 터뜨리기"
        title="축하 폭죽 애니메이션을 실행합니다"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 active:scale-95 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
      >
        <PartyPopper className="w-4 h-4 text-amber-600" aria-hidden="true" />
        <span>축하 폭죽</span>
      </button>
    </div>
  );
};

export default ActionToolbar;
