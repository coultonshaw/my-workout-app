import { useWorkoutStore } from '@/stores/workoutStore';
import { useWhoopStore } from '@/stores/whoopStore';
import { analyzeExerciseSets, applyWhoopModifier } from '@/utils/recommendation';
import type { RecommendationResult } from '@/types';

export function useRecommendation(exerciseId: string): RecommendationResult {
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const exercise = useWorkoutStore((s) => s.getExerciseById(exerciseId));
  const recovery = useWhoopStore((s) => s.recovery);

  const log = activeSession?.exercises.find((l) => l.exerciseId === exerciseId);

  if (!log || !exercise || log.sets.length < 3) {
    return { recommendation: 'pending', reason: 'Complete all 3 sets' };
  }

  const base = analyzeExerciseSets(log.sets, exercise);
  return applyWhoopModifier(base, recovery);
}
