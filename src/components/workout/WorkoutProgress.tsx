import { SETS_PER_EXERCISE } from '@/constants/config';
import type { ExerciseLog } from '@/types';

interface WorkoutProgressProps {
  exerciseLogs: ExerciseLog[];
}

export function WorkoutProgress({ exerciseLogs }: WorkoutProgressProps) {
  const completed = exerciseLogs.filter((l) => l.sets.length === SETS_PER_EXERCISE).length;
  const total = exerciseLogs.length;
  const percent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">Exercises</span>
        <span className="text-sm font-semibold text-white">{completed} / {total}</span>
      </div>
      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
