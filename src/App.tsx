import { useState, useEffect, useRef } from 'react';
import HeaderControlBar from './components/HeaderControlBar';
import BlackboardBanner from './components/BlackboardBanner';
import SeatingGrid from './components/SeatingGrid';
import ActionToolbar from './components/ActionToolbar';
import { useSeatLottery, AnimationMode } from './hooks/useSeatLottery';
import { useSoundEffects } from './hooks/useSoundEffects';
import { triggerConfetti } from './utils/exportUtils';

export default function App() {
  const [totalStudents, setTotalStudents] = useState<number>(24);
  const [totalGroups, setTotalGroups] = useState<number>(6);
  const [mode, setMode] = useState<AnimationMode>('sequential');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const seatingRef = useRef<HTMLDivElement>(null);

  const soundEffects = useSoundEffects(soundEnabled);

  const {
    status,
    groups,
    displaySlotValues,
    revealedSeats,
    startLottery,
  } = useSeatLottery({
    totalStudents,
    totalGroups,
    mode,
    soundEffects,
    onComplete: triggerConfetti,
  });

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const isAnimating = status === 'animating';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-indigo-100 text-slate-800">
      {/* Header Area */}
      <HeaderControlBar
        totalStudents={totalStudents}
        totalGroups={totalGroups}
        onTotalStudentsChange={setTotalStudents}
        onTotalGroupsChange={setTotalGroups}
        mode={mode}
        onModeChange={setMode}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled((prev) => !prev)}
        isFullscreen={isFullscreen}
        onFullscreenToggle={handleFullscreenToggle}
        onStartLottery={startLottery}
        isAnimating={isAnimating}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-2 sm:py-4 flex flex-col items-center gap-6">
        {/* Printable/Exportable Seating Chart Container */}
        <div
          ref={seatingRef}
          className="w-full flex flex-col items-center gap-6 bg-slate-100 p-2 sm:p-4 rounded-3xl"
        >
          <BlackboardBanner />
          <SeatingGrid
            groups={groups}
            displaySlotValues={displaySlotValues}
            revealedSeats={revealedSeats}
            isAnimating={isAnimating}
          />
        </div>
      </main>

      {/* Action Toolbar Bottom Area */}
      <footer className="no-print mt-auto pb-4">
        <ActionToolbar
          onReshuffle={startLottery}
          isAnimating={isAnimating}
          status={status}
          targetRef={seatingRef}
        />
        <div className="text-center text-xs text-slate-400 mt-2">
          우리 반 자리 뽑기 &bull; 공정하고 즐거운 교실 자리 배치
        </div>
      </footer>
    </div>
  );
}
