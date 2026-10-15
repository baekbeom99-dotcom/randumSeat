import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  Users,
  LayoutGrid,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';

export interface HeaderControlBarProps {
  totalStudents: number;
  totalGroups: number;
  onTotalStudentsChange: (value: number) => void;
  onTotalGroupsChange: (value: number) => void;
  mode: 'instant' | 'sequential';
  onModeChange: (mode: 'instant' | 'sequential') => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  onStartLottery: () => void;
  isAnimating: boolean;
}

export const HeaderControlBar: React.FC<HeaderControlBarProps> = ({
  totalStudents,
  totalGroups,
  onTotalStudentsChange,
  onTotalGroupsChange,
  mode,
  onModeChange,
  soundEnabled,
  onSoundToggle,
  isFullscreen,
  onFullscreenToggle,
  onStartLottery,
  isAnimating,
}) => {
  const isStudentLessThanGroup = totalStudents < totalGroups;
  const isOutOfBounds =
    totalStudents < 2 ||
    totalStudents > 60 ||
    totalGroups < 1 ||
    totalGroups > 15;
  const isInvalid = isStudentLessThanGroup || isOutOfBounds;

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onTotalStudentsChange(val);
    }
  };

  const handleStudentBlur = () => {
    const clamped = Math.min(60, Math.max(2, totalStudents || 2));
    if (clamped !== totalStudents) {
      onTotalStudentsChange(clamped);
    }
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onTotalGroupsChange(val);
    }
  };

  const handleGroupBlur = () => {
    const clamped = Math.min(15, Math.max(1, totalGroups || 1));
    if (clamped !== totalGroups) {
      onTotalGroupsChange(clamped);
    }
  };

  const handleStudentIncrement = () => {
    if (totalStudents < 60) {
      onTotalStudentsChange(Math.min(60, totalStudents + 1));
    }
  };

  const handleStudentDecrement = () => {
    if (totalStudents > 2) {
      onTotalStudentsChange(Math.max(2, totalStudents - 1));
    }
  };

  const handleGroupIncrement = () => {
    if (totalGroups < 15) {
      onTotalGroupsChange(Math.min(15, totalGroups + 1));
    }
  };

  const handleGroupDecrement = () => {
    if (totalGroups > 1) {
      onTotalGroupsChange(Math.max(1, totalGroups - 1));
    }
  };

  return (
    <header className="no-print w-full max-w-6xl mx-auto px-4 py-3 sm:py-4">
      {/* Top Bar Card */}
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-md border border-slate-200/80 p-4 sm:p-5 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Input Steppers */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            {/* Student Count Stepper */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
                <Users className="w-4 h-4 text-indigo-500" aria-hidden="true" />
                <label htmlFor="total-students" className="cursor-pointer">
                  학생 수
                </label>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="학생 수 감소"
                  onClick={handleStudentDecrement}
                  disabled={isAnimating || totalStudents <= 2}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <input
                  id="total-students"
                  type="number"
                  aria-label="학생 수"
                  min={2}
                  max={60}
                  value={totalStudents}
                  onChange={handleStudentChange}
                  onBlur={handleStudentBlur}
                  disabled={isAnimating}
                  className="w-12 text-center font-bold text-slate-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                />
                <button
                  type="button"
                  aria-label="학생 수 증가"
                  onClick={handleStudentIncrement}
                  disabled={isAnimating || totalStudents >= 60}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Group Count Stepper */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
                <LayoutGrid className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                <label htmlFor="total-groups" className="cursor-pointer">
                  모둠 수
                </label>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="모둠 수 감소"
                  onClick={handleGroupDecrement}
                  disabled={isAnimating || totalGroups <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <input
                  id="total-groups"
                  type="number"
                  aria-label="모둠 수"
                  min={1}
                  max={15}
                  value={totalGroups}
                  onChange={handleGroupChange}
                  onBlur={handleGroupBlur}
                  disabled={isAnimating}
                  className="w-12 text-center font-bold text-slate-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                />
                <button
                  type="button"
                  aria-label="모둠 수 증가"
                  onClick={handleGroupIncrement}
                  disabled={isAnimating || totalGroups >= 15}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Center: Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              type="button"
              aria-pressed={mode === 'sequential'}
              onClick={() => onModeChange('sequential')}
              disabled={isAnimating}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'sequential'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              } disabled:cursor-not-allowed`}
            >
              긴장감 모드 🎲
            </button>
            <button
              type="button"
              aria-pressed={mode === 'instant'}
              onClick={() => onModeChange('instant')}
              disabled={isAnimating}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'instant'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              } disabled:cursor-not-allowed`}
            >
              빠른 모드 ⚡
            </button>
          </div>

          {/* Right: Quick actions & Start Lottery Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={onSoundToggle}
              aria-label={soundEnabled ? '소리 끄기' : '소리 켜기'}
              title={soundEnabled ? '소리 끄기' : '소리 켜기'}
              className={`p-2.5 rounded-xl border transition active:scale-95 ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-5 h-5" aria-hidden="true" />
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={onFullscreenToggle}
              aria-label={isFullscreen ? '전체화면 종료' : '전체화면'}
              title={isFullscreen ? '전체화면 종료' : '전체화면'}
              className={`p-2.5 rounded-xl border transition active:scale-95 ${
                isFullscreen
                  ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Maximize className="w-5 h-5" aria-hidden="true" />
              )}
            </button>

            {/* Start Lottery Primary Button */}
            <button
              type="button"
              onClick={onStartLottery}
              disabled={isAnimating || isInvalid}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 ${
                isAnimating || isInvalid
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-lg'
              }`}
            >
              <Sparkles
                className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>자리 뽑기 시작!</span>
            </button>
          </div>

        </div>

        {/* Validation Warning Alert */}
        {isInvalid && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium animate-fadeIn"
          >
            <AlertCircle
              className="w-4 h-4 text-amber-600 flex-shrink-0"
              aria-hidden="true"
            />
            <span>
              {isOutOfBounds
                ? '학생 수는 2~60명, 모둠 수는 1~15개 범위 내에서 설정해 주세요!'
                : '학생 수가 모둠 수 이상이어야 자리를 나눌 수 있어요!'}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderControlBar;
