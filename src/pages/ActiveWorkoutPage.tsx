import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '@/stores/workoutStore';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { WorkoutProgress } from '@/components/workout/WorkoutProgress';
import { RestTimer } from '@/components/workout/RestTimer';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/utils/formatters';
import { SETS_PER_EXERCISE } from '@/constants/config';
import { useState } from 'react';

export function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const { activeSession, exercises, cancelSession, moveActiveExercise } = useWorkoutStore();
  const [showCancel, setShowCancel] = useState(false);
  const [showFinishEarly, setShowFinishEarly] = useState(false);

  if (!activeSession) {
    navigate('/');
    return null;
  }

  const doneCount = activeSession.exercises.filter((l) => l.sets.length === SETS_PER_EXERCISE).length;
  const totalCount = activeSession.exercises.length;
  const allComplete = doneCount === totalCount;
  const anyStarted = activeSession.exercises.some((l) => l.sets.length > 0);

  const duration = formatDuration(activeSession.startedAt, new Date().toISOString());

  const handleFinish = () => navigate('/workout/complete');
  const handleCancel = () => { cancelSession(); navigate('/'); };

  return (
    <div className="min-h-dvh bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-sm px-4 pt-12 pb-3 safe-top">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-white">Workout</h1>
            <p className="text-sm text-gray-500 tabular-nums">{duration} elapsed</p>
          </div>
          <button
            onClick={() => setShowCancel(true)}
            className="text-sm text-white/25 hover:text-white/60 transition-colors px-3 py-1.5"
          >
            Discard
          </button>
        </div>
        <WorkoutProgress exerciseLogs={activeSession.exercises} />
      </div>

      {/* Exercise list */}
      <div className="px-4 py-3 space-y-3 pb-36">
        {activeSession.exercises.map((log, i) => {
          const exercise = exercises.find((e) => e.id === log.exerciseId);
          if (!exercise) return null;
          return (
            <ExerciseCard
              key={log.exerciseId}
              exercise={exercise}
              log={log}
              canMoveUp={i > 0}
              canMoveDown={i < activeSession.exercises.length - 1}
              onMoveUp={() => moveActiveExercise(i, -1)}
              onMoveDown={() => moveActiveExercise(i, 1)}
            />
          );
        })}

        {/* Finish buttons */}
        <div className="pt-2 space-y-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!allComplete}
            onClick={handleFinish}
          >
            {allComplete ? 'Finish Workout 🎉' : `${doneCount} of ${totalCount} exercises done`}
          </Button>
          {!allComplete && anyStarted && (
            <button
              onClick={() => setShowFinishEarly(true)}
              className="w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors py-2"
            >
              End workout early
            </button>
          )}
        </div>
      </div>

      {/* Discard confirmation */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-bg-elevated rounded-3xl p-6 w-full max-w-sm space-y-4 border border-white/[0.06]">
            <h2 className="text-white font-bold text-lg">Discard workout?</h2>
            <p className="text-white/40 text-sm">Your progress will not be saved.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancel(false)}>
                Keep going
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleCancel}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* End early confirmation */}
      {showFinishEarly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-bg-elevated rounded-3xl p-6 w-full max-w-sm space-y-4 border border-white/[0.06]">
            <h2 className="text-white font-bold text-lg">End workout early?</h2>
            <p className="text-white/40 text-sm">
              {doneCount} of {totalCount} exercises completed. Your sets will still be saved.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowFinishEarly(false)}>
                Keep going
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleFinish}>
                Save & finish
              </Button>
            </div>
          </div>
        </div>
      )}

      <RestTimer />
    </div>
  );
}
