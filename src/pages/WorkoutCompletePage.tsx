import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NotionSyncModal } from '@/components/notion/NotionSyncModal';
import { formatDateTime, formatDuration, formatVolume } from '@/utils/formatters';

export function WorkoutCompletePage() {
  const navigate = useNavigate();
  const { activeSession, completeSession, exercises } = useWorkoutStore();
  const [rpe, setRpe] = useState(7);
  const [showNotion, setShowNotion] = useState(false);
  const [savedSession, setSavedSession] = useState(activeSession);
  const [isDone, setIsDone] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (!activeSession) return;
    if (!fired.current) {
      fired.current = true;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ffffff', '#10b981', '#f59e0b'],
      });
    }
  }, [activeSession]);

  const handleDone = () => {
    if (!activeSession) return navigate('/');
    setSavedSession({ ...activeSession });
    completeSession(rpe);
    setIsDone(true);
  };

  const handleNavHome = () => navigate('/');

  const session = isDone ? savedSession : activeSession;

  if (!session) {
    navigate('/');
    return null;
  }

  const pbCount = session.exercises.flatMap((l) => l.sets).filter((s) => s.isPersonalBest).length;
  const now = new Date().toISOString();
  const duration = formatDuration(session.startedAt, isDone ? (session.completedAt ?? now) : now);

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col items-center justify-center px-4 py-12 safe-top">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        {/* Trophy */}
        <div className="text-center">
          <div className="text-7xl mb-3">🏆</div>
          <h1 className="text-3xl font-bold text-white">Workout Complete!</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {formatDateTime(session.startedAt)}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <div className="text-2xl font-bold text-accent">{duration}</div>
            <div className="text-xs text-gray-400 mt-1">Duration</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-accent">{formatVolume(session.totalVolume)}</div>
            <div className="text-xs text-gray-400 mt-1">Volume</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-accent">{pbCount}</div>
            <div className="text-xs text-gray-400 mt-1">New PBs</div>
          </Card>
        </div>

        {/* Exercise summary */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Summary</h3>
          <div className="space-y-2">
            {session.exercises.map((log) => {
              const exercise = exercises.find((e) => e.id === log.exerciseId);
              const lastSet = log.sets[log.sets.length - 1];
              return (
                <div key={log.exerciseId} className="flex justify-between items-center">
                  <span className="text-sm text-white">{exercise?.name ?? log.exerciseId}</span>
                  <span className="text-sm text-gray-400">
                    {lastSet ? `${lastSet.weight > 0 ? `${lastSet.weight}kg ×` : ''} ${log.sets.map(s => s.reps).join('/')}` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* RPE */}
        {!isDone && (
          <Card>
            <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide block mb-3">
              Rate Intensity (RPE {rpe}/10)
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Max effort</span>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!isDone ? (
            <Button variant="primary" size="lg" className="w-full" onClick={handleDone}>
              Save Workout
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setShowNotion(true)}
              >
                Sync to Notion
              </Button>
              <Button variant="ghost" size="lg" className="w-full" onClick={handleNavHome}>
                Done
              </Button>
            </>
          )}
        </div>
      </div>

      {showNotion && savedSession && (
        <NotionSyncModal
          session={savedSession}
          onClose={() => setShowNotion(false)}
        />
      )}
    </div>
  );
}
