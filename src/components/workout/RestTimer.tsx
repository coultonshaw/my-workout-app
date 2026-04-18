import { useEffect } from 'react';
import { useTimerStore } from '@/stores/timerStore';
import { useRestTimer, useTimerBeep } from '@/hooks/useRestTimer';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { formatTimerDisplay } from '@/utils/formatters';

export function RestTimer() {
  const { isRunning, secondsLeft, totalSeconds, skipTimer, addTime } = useTimerStore();
  const { playBeep } = useTimerBeep();
  useRestTimer();

  useEffect(() => {
    if (isRunning && secondsLeft === 0) {
      playBeep();
    }
  }, [secondsLeft, isRunning, playBeep]);

  if (!isRunning && secondsLeft === 0) return null;

  const percent = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const timerColor =
    percent > 50 ? '#10b981' : percent > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm mx-4 mb-24 bg-bg-elevated rounded-3xl p-6 shadow-2xl animate-slide-up">
        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-4">Rest</p>
          <div className="flex justify-center mb-4">
            <ProgressRing value={percent} size={120} strokeWidth={8} color={timerColor}>
              <span className="text-3xl font-bold text-white tabular-nums">
                {formatTimerDisplay(secondsLeft)}
              </span>
            </ProgressRing>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => addTime(30)}
            className="flex-1 py-3 rounded-xl bg-bg-surface text-gray-300 text-sm font-medium active:scale-95 transition-transform"
          >
            +30s
          </button>
          <button
            onClick={skipTimer}
            className="flex-1 py-3 rounded-xl bg-accent text-black text-sm font-semibold active:scale-95 transition-transform"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
