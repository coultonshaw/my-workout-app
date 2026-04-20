import { useActivityStore } from '@/stores/activityStore';
import type { ActivityType } from '@/types';

const ACTIVITIES: { type: ActivityType; label: string; symbol: string }[] = [
  { type: 'run',        label: 'Run',        symbol: '↗' },
  { type: 'pliability', label: 'Pliability', symbol: '∿' },
  { type: 'sauna',      label: 'Sauna',      symbol: '♨' },
  { type: 'boxing',     label: 'Boxing',     symbol: '◉' },
  { type: 'hike',       label: 'Hike',       symbol: '△' },
  { type: 'bike',       label: 'Bike',       symbol: '⊙' },
];

function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ActivityTracker() {
  const { toggleActivity, hasActivity } = useActivityStore();
  const today = todayDateStr();

  const active = ACTIVITIES.filter((a) => hasActivity(today, a.type));
  const hasAny = active.length > 0;

  return (
    <div className="rounded-2xl border border-white/[0.04] bg-bg-surface overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <span className="label-luxury">Today's Activity</span>
        {hasAny && (
          <span className="text-[10px] font-semibold text-accent/70 tracking-wide">
            {active.map((a) => a.label).join(' · ')}
          </span>
        )}
      </div>

      <div className="mx-4 h-px bg-white/[0.04]" />

      <div className="px-4 py-3 grid grid-cols-3 gap-2">
        {ACTIVITIES.map(({ type, label, symbol }) => {
          const on = hasActivity(today, type);
          return (
            <button
              key={type}
              onClick={() => toggleActivity(today, type)}
              className={`
                relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl
                border transition-all duration-200 active:scale-[0.95]
                ${on
                  ? 'bg-accent/12 border-accent/40 shadow-gold-sm'
                  : 'bg-bg-elevated border-white/[0.05] hover:border-white/[0.12]'}
              `}
            >
              {on && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
              <span
                className={`text-base leading-none font-light ${on ? 'text-accent' : 'text-white/40'}`}
                aria-hidden
              >
                {symbol}
              </span>
              <span
                className={`text-[10px] font-semibold tracking-wide uppercase ${
                  on ? 'text-accent' : 'text-white/40'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {!hasAny && (
        <p className="px-4 pb-3 text-[11px] text-white/20 text-center">
          Tap to log a recovery or cross-training activity
        </p>
      )}
    </div>
  );
}
