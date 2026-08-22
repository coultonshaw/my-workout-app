import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { WorkoutSession } from '@/types';
import { formatDate, formatDuration, formatVolume } from '@/utils/formatters';

interface SessionCardProps {
  session: WorkoutSession;
}

interface EditState {
  exerciseId: string;
  setNumber: 1 | 2 | 3;
  weight: string;
  reps: string;
}

export function SessionCard({ session }: SessionCardProps) {
  const { exercises, deleteSession, updateSessionSet } = useWorkoutStore();
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pbCount = session.exercises.flatMap((l) => l.sets).filter((s) => s.isPersonalBest).length;

  const startEdit = (exerciseId: string, setNumber: 1 | 2 | 3, weight: number, reps: number) => {
    setEditState({ exerciseId, setNumber, weight: String(weight), reps: String(reps) });
  };

  const commitEdit = () => {
    if (!editState) return;
    const w = parseFloat(editState.weight);
    const r = parseInt(editState.reps);
    if (!isNaN(w) && !isNaN(r) && r > 0) {
      updateSessionSet(session.id, editState.exerciseId, editState.setNumber, w, r);
    }
    setEditState(null);
  };

  const isEditing = (exerciseId: string, setNumber: number) =>
    editState?.exerciseId === exerciseId && editState?.setNumber === setNumber;

  return (
    <Card className={isExpanded ? 'border border-white/10' : ''}>
      {/* Header row — tap to expand */}
      <button
        className="w-full flex justify-between items-start"
        onClick={() => { setIsExpanded((v) => !v); setEditState(null); setConfirmDelete(false); }}
      >
        <div className="text-left">
          <p className="text-white font-medium text-sm">{formatDate(session.startedAt)}</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {session.completedAt && formatDuration(session.startedAt, session.completedAt)}
            {session.rpe !== undefined && ` · RPE ${session.rpe}/10`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-accent text-sm font-semibold">{formatVolume(session.totalVolume)}</p>
            {pbCount > 0 && (
              <p className="text-xs text-amber-400 mt-0.5">{pbCount} PB{pbCount > 1 ? 's' : ''} 🏆</p>
            )}
          </div>
          <svg
            width="16" height="16" viewBox="0 0 20 20" fill="currentColor"
            className={`text-gray-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {session.exercises.map((log) => {
            if (log.sets.length === 0) return null;
            const exercise = exercises.find((e) => e.id === log.exerciseId);
            return (
              <div key={log.exerciseId}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  {exercise?.name ?? log.exerciseId}
                </p>
                <div className="space-y-1.5">
                  {log.sets.map((s) => {
                    const editing = isEditing(log.exerciseId, s.setNumber);
                    return (
                      <div key={s.setNumber} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-6 shrink-0">S{s.setNumber}</span>

                        {editing ? (
                          <>
                            <input
                              type="number"
                              value={editState!.weight}
                              onChange={(e) => setEditState((es) => es && { ...es, weight: e.target.value })}
                              className="w-16 bg-bg-elevated text-white text-xs rounded-lg px-2 py-1.5 border border-accent/40 focus:outline-none focus:border-accent"
                              step={exercise?.weightIncrement ?? 2.5}
                            />
                            <span className="text-xs text-gray-500">{weightUnit} ×</span>
                            <input
                              type="number"
                              value={editState!.reps}
                              onChange={(e) => setEditState((es) => es && { ...es, reps: e.target.value })}
                              className="w-12 bg-bg-elevated text-white text-xs rounded-lg px-2 py-1.5 border border-accent/40 focus:outline-none focus:border-accent"
                            />
                            <span className="text-xs text-gray-500">reps</span>
                            <button
                              onClick={commitEdit}
                              className="ml-auto text-xs text-status-increase font-semibold px-2 py-1 rounded-lg hover:bg-status-increase/10 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditState(null)}
                              className="text-xs text-gray-500 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-white">
                              {s.weight > 0 ? `${s.weight} ${weightUnit} × ` : ''}{s.reps} reps
                            </span>
                            {s.isPersonalBest && (
                              <span className="text-xs text-amber-400 ml-1">PB 🏆</span>
                            )}
                            <button
                              onClick={() => startEdit(log.exerciseId, s.setNumber, s.weight, s.reps)}
                              className="ml-auto text-xs text-gray-600 hover:text-gray-300 transition-colors px-1.5 py-0.5 rounded"
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Delete */}
          <div className="pt-2 border-t border-white/[0.05]">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <p className="text-xs text-white/40 flex-1">Delete this session?</p>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1"
                >
                  Cancel
                </button>
                <Button variant="danger" className="text-xs px-3 py-1.5 h-auto" onClick={() => deleteSession(session.id)}>
                  Delete
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-white/20 hover:text-red-400 transition-colors"
              >
                Delete session
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
