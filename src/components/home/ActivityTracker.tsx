import { useState } from 'react';
import { useActivityStore } from '@/stores/activityStore';
import type { ActivityType } from '@/types';

const ACTIVITIES: { type: ActivityType; label: string; symbol: string }[] = [
  { type: 'run',        label: 'Run',        symbol: '↗' },
  { type: 'pliability', label: 'Pliability', symbol: '∿' },
  { type: 'sauna',      label: 'Sauna',      symbol: '♨' },
  { type: 'boxing',     label: 'Boxing',     symbol: '◉' },
  { type: 'hike',       label: 'Hike',       symbol: '△' },
  { type: 'bike',       label: 'Bike',       symbol: '⊙' },
  { type: 'swim',       label: 'Swim',       symbol: '〜' },
  { type: 'dive',       label: 'Dive',       symbol: '↓' },
];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayDateStr(): string {
  return toDateStr(new Date());
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const todayMs = new Date(todayDateStr() + 'T00:00:00').getTime();
  const diff = (todayMs - d.getTime()) / 86_400_000;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function ActivityTracker() {
  const [selectedDate, setSelectedDate] = useState(todayDateStr());
  const { toggleActivity, hasActivity } = useActivityStore();

  const isToday = selectedDate === todayDateStr();

  const shiftDay = (n: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + n);
    const next = toDateStr(d);
    if (next <= todayDateStr()) setSelectedDate(next);
  };

  const active = ACTIVITIES.filter((a) => hasActivity(selectedDate, a.type));
  const hasAny = active.length > 0;

  return (
    <div className="rounded-2xl border border-white/[0.04] bg-bg-surface overflow-hidden">
      {/* Header with date nav */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <span className="label-luxury">Activity</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shiftDay(-1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors text-sm"
          >
            ‹
          </button>
          <span className="text-[11px] font-semibold text-white/50 min-w-[70px] text-center">
            {formatDisplayDate(selectedDate)}
          </span>
          <button
            onClick={() => shiftDay(1)}
            disabled={isToday}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors text-sm disabled:opacity-20 disabled:pointer-events-none"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/[0.04]" />

      <div className="px-4 py-3 grid grid-cols-4 gap-2">
        {ACTIVITIES.map(({ type, label, symbol }) => {
          const on = hasActivity(selectedDate, type);
          return (
            <button
              key={type}
              onClick={() => toggleActivity(selectedDate, type)}
              className={`
                relative flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl
                border transition-all duration-200 active:scale-[0.95]
                ${on
                  ? 'bg-accent/12 border-accent/40 shadow-gold-sm'
                  : 'bg-bg-elevated border-white/[0.05] hover:border-white/[0.12]'}
              `}
            >
              {on && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
              <span className={`text-sm leading-none ${on ? 'text-accent' : 'text-white/35'}`} aria-hidden>
                {symbol}
              </span>
              <span className={`text-[9px] font-semibold tracking-wide uppercase leading-tight text-center ${on ? 'text-accent' : 'text-white/35'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {!hasAny && (
        <p className="px-4 pb-3 text-[11px] text-white/20 text-center">
          {isToday ? 'Tap to log a recovery or cross-training activity' : 'Nothing logged for this day'}
        </p>
      )}
    </div>
  );
}
