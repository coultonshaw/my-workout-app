import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/Button';
import { RecoveryBanner } from '@/components/whoop/RecoveryBanner';
import { StreakWidget } from '@/components/home/StreakWidget';
import { ActivityTracker } from '@/components/home/ActivityTracker';
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

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning.';
    if (h < 17) return 'Good afternoon.';
    return 'Good evening.';
  })();

  return (
    <div className="px-4 pt-12 pb-6 space-y-4 safe-top animate-fade-in">

      {/* Hero header */}
      <div className="pb-2">
        <p className="text-white/30 text-xs font-medium tracking-luxury uppercase mb-1">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#E8E0D0' }}>
          {greeting}
        </h1>
      </div>

      {/* WHOOP recovery */}
      {whoopEnabled && <RecoveryBanner />}

      {/* Active session resume */}
      {activeSession && (
        <div
          className="rounded-2xl p-4 flex items-center justify-between border border-accent/25 shadow-gold-sm"
          style={{ background: 'rgba(201,168,76,0.07)' }}
        >
          <div>
            <p className="text-accent text-sm font-semibold tracking-wide">Workout in progress</p>
            <p className="text-white/35 text-xs mt-0.5 tabular-nums">
              {formatDuration(activeSession.startedAt, new Date().toISOString())} elapsed
            </p>
          </div>
          <Button size="sm" onClick={handleStart}>Continue</Button>
        </div>
      )}

      {/* Start workout CTA */}
      {!activeSession && (
        <button
          onClick={handleStart}
          className="w-full rounded-2xl py-5 relative overflow-hidden active:scale-[0.98] transition-transform duration-150"
          style={{
            background: 'linear-gradient(135deg, #C9A84C 0%, #9A7A30 100%)',
            boxShadow: '0 6px 32px rgba(201,168,76,0.30)',
          }}
        >
          <span className="relative z-10 text-black text-base font-bold tracking-wide">
            Begin Workout
          </span>
          {/* shimmer layer */}
          <span className="absolute inset-0 shimmer-gold pointer-events-none" />
        </button>
      )}

      {/* Streak */}
      <StreakWidget />

      {/* Activity tracker */}
      <ActivityTracker />

      {/* Today's program */}
      <div className="rounded-2xl border border-white/[0.04] bg-bg-surface overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <span className="label-luxury">Today's Program</span>
          <span className="text-[11px] text-white/25">{activeExercises.length} exercises</span>
        </div>
        <div className="mx-4 h-px bg-white/[0.04]" />
        <div className="px-4 pb-4 pt-2 space-y-0">
          {activeExercises.map((ex, i) => (
            <div
              key={ex.id}
              className={`flex justify-between items-center py-2.5 ${
                i < activeExercises.length - 1 ? 'border-b border-white/[0.03]' : ''
              }`}
            >
              <span className="text-white/70 text-sm">{ex.name}</span>
              <span className="text-white/25 text-xs tabular-nums">3 × 6–10</span>
            </div>
          ))}
        </div>
      </div>

      {/* Last session */}
      {lastSession && (
        <div className="rounded-2xl border border-white/[0.04] bg-bg-surface overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <span className="label-luxury">Last Session</span>
            {trainedToday && (
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full"
                style={{ color: '#4ade80', background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.20)' }}>
                Today ✓
              </span>
            )}
          </div>
          <div className="mx-4 h-px bg-white/[0.04]" />
          <div className="px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-white/70 text-sm font-medium">{formatDate(lastSession.startedAt)}</p>
              {lastSession.completedAt && (
                <p className="text-white/30 text-xs mt-0.5 tabular-nums">
                  {formatDuration(lastSession.startedAt, lastSession.completedAt)}
                  {lastSession.rpe !== undefined && ` · RPE ${lastSession.rpe}/10`}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-white/25 text-xs">
                {lastSession.totalVolume > 0
                  ? `${(lastSession.totalVolume / 1000).toFixed(1)}t`
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
