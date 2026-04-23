import { useMemo } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useActivityStore } from '@/stores/activityStore';
import type { WorkoutSession, DailyActivities } from '@/types';

const WORKOUTS_PER_WEEK = 3;

function toLocalDateStr(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

interface WeekData {
  mondayMs: number;
  count: number;
  complete: boolean;
  isCurrent: boolean;
}

function computeStreak(sessions: WorkoutSession[], dailyActivities: DailyActivities[]): {
  streak: number;
  thisWeekCount: number;
  thisWeekDays: boolean[]; // Mon–Sun, true if active that day
  recentWeeks: WeekData[];
} {
  const completedSessions = sessions.filter((s) => s.completedAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonday = getMondayOf(today);

  // A day is active if a workout was completed OR any activity was logged
  const dateSet = new Set<string>();
  for (const s of completedSessions) {
    dateSet.add(toLocalDateStr(s.completedAt!));
  }
  for (const da of dailyActivities) {
    if (da.activities.length > 0) dateSet.add(da.date);
  }

  // Current week: Mon–Sun workout days
  const thisWeekDays: boolean[] = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(currentMonday, i);
    return dateSet.has(toLocalDateStr(day.toISOString().replace('Z', '')));
  }).map((_, i) => {
    const day = addDays(currentMonday, i);
    const ds = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    return dateSet.has(ds);
  });

  const thisWeekCount = thisWeekDays.filter(Boolean).length;

  // Build recent 8 weeks (including current)
  const recentWeeks: WeekData[] = [];
  for (let w = 7; w >= 0; w--) {
    const monday = addDays(currentMonday, -w * 7);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(monday, i);
      const ds = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      return dateSet.has(ds);
    });
    const count = weekDays.filter(Boolean).length;
    const isCurrent = w === 0;
    // A past week is complete if it had 3+ workouts
    // Current week can't be "failed" yet if it's still ongoing
    const complete = isCurrent ? count >= WORKOUTS_PER_WEEK : count >= WORKOUTS_PER_WEEK;
    recentWeeks.push({ mondayMs: monday.getTime(), count, complete, isCurrent });
  }

  // Streak = consecutive complete weeks going back from the most recent complete week
  // Include the current week only if it's already complete
  let streak = 0;
  for (let i = recentWeeks.length - 1; i >= 0; i--) {
    const w = recentWeeks[i];
    if (w.complete) {
      streak++;
    } else if (!w.isCurrent) {
      break; // broke the streak
    } else {
      break; // current week incomplete, don't break but don't add
    }
  }

  return { streak, thisWeekCount, thisWeekDays, recentWeeks };
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakWidget() {
  const sessions = useWorkoutStore((s) => s.sessions);
  const dailyActivities = useActivityStore((s) => s.dailyActivities);
  const { streak, thisWeekCount, thisWeekDays, recentWeeks } = useMemo(
    () => computeStreak(sessions, dailyActivities),
    [sessions, dailyActivities]
  );

  const todayDowIndex = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // Mon=0 … Sun=6
  })();

  return (
    <div className="rounded-2xl border border-white/[0.04] bg-bg-surface overflow-hidden">
      {/* Header row */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <span className="label-luxury">Weekly Streak</span>
        <div className="flex items-center gap-1.5">
          {streak > 0 ? (
            <>
              <span className="text-lg leading-none">🔥</span>
              <span className="text-gold-gradient text-xl font-bold tabular-nums">{streak}</span>
              <span className="text-white/30 text-xs font-medium">{streak === 1 ? 'week' : 'weeks'}</span>
            </>
          ) : (
            <span className="text-white/20 text-xs">No streak yet</span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.04]" />

      {/* This week dots */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-white/40 font-medium">This week</span>
          <span className="text-[11px] font-semibold" style={{ color: thisWeekCount >= WORKOUTS_PER_WEEK ? '#C9A84C' : 'rgba(255,255,255,0.35)' }}>
            {thisWeekCount} / {WORKOUTS_PER_WEEK}
          </span>
        </div>
        <div className="flex gap-1.5">
          {thisWeekDays.map((done, i) => {
            const isPast = i < todayDowIndex;
            const isToday = i === todayDowIndex;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    done
                      ? 'bg-accent shadow-gold-sm'
                      : isPast || isToday
                      ? 'bg-white/10'
                      : 'bg-white/[0.04]'
                  }`}
                />
                <span className={`text-[9px] font-semibold ${isToday ? 'text-accent' : 'text-white/25'}`}>
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past 8 weeks mini tiles */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-white/40 font-medium">Past 8 weeks</span>
        </div>
        <div className="flex gap-1">
          {recentWeeks.map((w) => (
            <div
              key={w.mondayMs}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                w.isCurrent
                  ? w.complete
                    ? 'bg-accent'
                    : w.count > 0
                    ? 'bg-accent/40'
                    : 'bg-white/10'
                  : w.complete
                  ? 'bg-accent'
                  : 'bg-white/10'
              }`}
              title={`${w.count} workouts`}
            />
          ))}
        </div>
        <div className="flex mt-1">
          <span className="text-[9px] text-white/20 flex-1 text-left">8w ago</span>
          <span className="text-[9px] text-accent/60">Now</span>
        </div>
      </div>
    </div>
  );
}
