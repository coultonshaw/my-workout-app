import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RecoveryBanner } from '@/components/whoop/RecoveryBanner';
import { formatDate, formatDuration } from '@/utils/formatters';

export function HomePage() {
  const navigate = useNavigate();
  const { activeSession, sessions, exercises, startSession } = useWorkoutStore();
  const whoopEnabled = useSettingsStore((s) => s.settings.whoopEnabled);

  const handleStart = () => {
    if (!activeSession) startSession();
    navigate('/workout/active');
  };

  const lastSession = sessions[0];
  const todayStr = new Date().toDateString();
  const trainedToday = lastSession && new Date(lastSession.startedAt).toDateString() === todayStr;

  const activeExercises = exercises.filter((e) => e.active);

  return (
    <div className="px-4 pt-14 pb-6 space-y-5 safe-top">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">Let's lift.</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* WHOOP recovery */}
      {whoopEnabled && <RecoveryBanner />}

      {/* Active session notice */}
      {activeSession && (
        <Card className="border border-accent/40 bg-accent/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-accent font-semibold text-sm">Workout in progress</p>
              <p className="text-gray-400 text-xs mt-0.5">
                {formatDuration(activeSession.startedAt, new Date().toISOString())} elapsed
              </p>
            </div>
            <Button size="sm" onClick={handleStart}>Continue</Button>
          </div>
        </Card>
      )}

      {/* Start workout */}
      {!activeSession && (
        <Button variant="primary" size="lg" className="w-full" onClick={handleStart}>
          Start Workout
        </Button>
      )}

      {/* Today's program */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Today's Program
        </h2>
        <div className="space-y-2">
          {activeExercises.map((ex) => (
            <div key={ex.id} className="flex justify-between items-center py-1">
              <span className="text-white text-sm">{ex.name}</span>
              <span className="text-gray-500 text-xs">3 × 6–10</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Last session */}
      {lastSession && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Last Session
          </h2>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white text-sm font-medium">{formatDate(lastSession.startedAt)}</p>
              {lastSession.completedAt && (
                <p className="text-gray-500 text-xs mt-0.5">
                  {formatDuration(lastSession.startedAt, lastSession.completedAt)}
                  {lastSession.rpe !== undefined && ` · RPE ${lastSession.rpe}/10`}
                </p>
              )}
            </div>
            {trainedToday && (
              <span className="text-xs text-status-increase font-semibold bg-status-increase/10 px-2 py-1 rounded-full">
                Today ✓
              </span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
