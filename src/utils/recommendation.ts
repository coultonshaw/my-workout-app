import { REP_TARGET_MAX, REP_TARGET_MIN } from '@/constants/config';
import type { Exercise, RecommendationResult, SetEntry, WhoopRecovery } from '@/types';

export function analyzeExerciseSets(
  sets: SetEntry[],
  exercise: Exercise
): RecommendationResult {
  if (sets.length < 3) {
    return { recommendation: 'pending', reason: 'Complete all 3 sets' };
  }

  const allReps = sets.map((s) => s.reps);
  const minReps = Math.min(...allReps);
  const allHitMax = allReps.every((r) => r >= REP_TARGET_MAX);
  const anyBelowMin = allReps.some((r) => r < REP_TARGET_MIN);
  const avgReps = allReps.reduce((a, b) => a + b, 0) / 3;
  const lastWeight = sets[sets.length - 1].weight;

  if (allHitMax) {
    const suggested = lastWeight + exercise.weightIncrement;
    return {
      recommendation: 'increase',
      reason: `All sets hit ${allReps.join('/')} reps — add ${exercise.weightIncrement}kg next session`,
      suggestedWeight: suggested,
    };
  }

  if (anyBelowMin) {
    const suggested = Math.max(0, lastWeight - exercise.weightIncrement);
    return {
      recommendation: 'decrease',
      reason: `Hit only ${minReps} reps — reduce weight to stay in ${REP_TARGET_MIN}–${REP_TARGET_MAX} range`,
      suggestedWeight: suggested,
    };
  }

  return {
    recommendation: 'keep',
    reason: `Averaging ${avgReps.toFixed(1)} reps — keep weight, push for ${REP_TARGET_MAX}`,
  };
}

export function applyWhoopModifier(
  base: RecommendationResult,
  recovery: WhoopRecovery | null
): RecommendationResult {
  if (!recovery) return base;

  if (recovery.score < 33) {
    if (base.recommendation === 'increase') {
      return {
        ...base,
        recommendation: 'keep',
        reason: `${base.reason} — but recovery is low (${recovery.score}%), consider holding weight`,
      };
    }
    return {
      ...base,
      reason: `${base.reason} — low recovery (${recovery.score}%), listen to your body`,
    };
  }

  return base;
}
