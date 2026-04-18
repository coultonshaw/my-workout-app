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
  const { activeSession, exercises, cancelSession } = useWorkoutStore();
  const [showCancel, setShowCancel] = useState(false);

  if (!activeSession) {
    navigate('/');
    return null;
  }

  const allComplete = activeSession.exercises.every(
    (l) => l.sets.length === SETS_PER_EXERCISE
  );

  const duration = formatDuration(activeSession.startedAt, new Date().toISOString());

  const handleFinish = () => {
    navigate('/workout/complete');
  };

  const handleCancel = () => {
    cancelSession();
    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-sm px-4 pt-12 pb-3 safe-top">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-white">Workout</h1>
            <p className="text-sm text-gray-500">{duration} elapsed</p>
          </div>
          <button
            onClick={() => setShowCancel(true)}
            className="text-sm text-gray-500 hover:text-white transition-colors px-3 py-1.5"
          >
            Cancel
          </button>
        </div>
        <WorkoutProgress exerciseLogs={activeSession.exercises} />
      </div>

      {/* Exercise list */}
      <div className="px-4 py-3 space-y-3 pb-32">
        {activeSession.exercises.map((log) => {
          const exercise = exercises.find((e) => e.id === log.exerciseId);
          if (!exercise) return null;
          return <ExerciseCard key={log.exerciseId} exercise={exercise} log={log} />;
        })}

        {/* Finish button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!allComplete}
            onClick={handleFinish}
          >
            {allComplete ? 'Finish Workout 🎉' : `Complete all exercises to finish`}
          </Button>
          {!allComplete && (
            <p className="text-center text-xs text-gray-500 mt-2">
              {activeSession.exercises.filter((l) => l.sets.length === SETS_PER_EXERCISE).length} of{' '}
              {activeSession.exercises.length} exercises complete
            </p>
          )}
        </div>
      </div>

      {/* Cancel confirmation */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-bg-elevated rounded-3xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-white font-bold text-lg">Cancel workout?</h2>
            <p className="text-gray-400 text-sm">Your progress will be lost.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCancel(false)}>
                Keep going
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <RestTimer />
    </div>
  );
}
