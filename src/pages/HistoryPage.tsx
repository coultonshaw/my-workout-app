import { useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Card } from '@/components/ui/Card';
import { ExerciseChart } from '@/components/history/ExerciseChart';
import { SessionCard } from '@/components/history/SessionCard';
import { formatPB } from '@/utils/personalBest';
import { useSettingsStore } from '@/stores/settingsStore';

export function HistoryPage() {
  const { sessions, exercises, personalBests } = useWorkoutStore();
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);
  const activeExercises = exercises.filter((e) => e.active);
  const [selectedId, setSelectedId] = useState(activeExercises[0]?.id ?? '');

  const completedSessions = sessions.filter((s) => s.completedAt);

  return (
    <div className="px-4 pt-14 pb-6 space-y-5 safe-top">
      <h1 className="text-2xl font-bold text-white">History</h1>

      {completedSessions.length === 0 ? (
        <Card>
          <p className="text-gray-400 text-sm text-center py-4">
            Complete your first workout to see history here.
          </p>
        </Card>
      ) : (
        <>
          {/* Personal Bests */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Personal Bests
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {activeExercises.map((ex) => {
                const pb = personalBests[ex.id];
                return (
                  <Card key={ex.id} className="border border-accent/20">
                    <p className="text-xs text-gray-400 leading-tight mb-1">{ex.name}</p>
                    <p className="text-accent font-bold text-sm">
                      {pb ? formatPB(pb, weightUnit) : '—'}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Progress Chart */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Weight Progression
            </h2>
            <Card>
              {/* Exercise selector */}
              <div className="flex gap-2 flex-wrap mb-4">
                {activeExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedId(ex.id)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                      selectedId === ex.id
                        ? 'bg-accent text-black'
                        : 'bg-bg-elevated text-gray-400'
                    }`}
                  >
                    {ex.name.split(' ')[0]}
                  </button>
                ))}
              </div>
              <ExerciseChart exerciseId={selectedId} sessions={completedSessions} />
            </Card>
          </div>

          {/* Session list */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Sessions
            </h2>
            <div className="space-y-2">
              {completedSessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
