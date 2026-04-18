import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { SetLogger } from './SetLogger';
import { RecommendationBadge } from './RecommendationBadge';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTimerStore } from '@/stores/timerStore';
import { useRecommendation } from '@/hooks/useRecommendation';
import { SETS_PER_EXERCISE } from '@/constants/config';
import type { Exercise, ExerciseLog } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  log: ExerciseLog;
}

const muscleColors: Record<string, string> = {
  back: 'text-blue-400',
  chest: 'text-red-400',
  shoulders: 'text-purple-400',
  arms: 'text-orange-400',
  legs: 'text-green-400',
  core: 'text-yellow-400',
};

export function ExerciseCard({ exercise, log }: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(log.sets.length < SETS_PER_EXERCISE);
  const logSet = useWorkoutStore((s) => s.logSet);
  const getLastSessionWeight = useWorkoutStore((s) => s.getLastSessionWeight);
  const restTimerSeconds = useSettingsStore((s) => s.settings.restTimerSeconds);
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);
  const startTimer = useTimerStore((s) => s.startTimer);
  const recommendation = useRecommendation(exercise.id);

  const isComplete = log.sets.length === SETS_PER_EXERCISE;
  const nextSetNumber = (log.sets.length + 1) as 1 | 2 | 3;
  const lastWeight = getLastSessionWeight(exercise.id);

  const handleLog = (setNumber: 1 | 2 | 3, weight: number, reps: number) => {
    logSet(exercise.id, setNumber, weight, reps);
    if (setNumber < SETS_PER_EXERCISE) {
      startTimer(restTimerSeconds, exercise.id, setNumber + 1);
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <Card className={`transition-all duration-200 ${isComplete ? 'border border-status-increase/30' : ''}`}>
      <button
        className="w-full flex items-center justify-between mb-3"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="text-left">
          <h3 className="text-white font-semibold text-base leading-tight">{exercise.name}</h3>
          <span className={`text-xs font-medium capitalize ${muscleColors[exercise.muscleGroup] ?? 'text-gray-400'}`}>
            {exercise.muscleGroup}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{log.sets.length}/{SETS_PER_EXERCISE}</span>
          {isComplete ? (
            <span className="text-status-increase text-xl">✓</span>
          ) : (
            <svg
              width="20" height="20" viewBox="0 0 20 20" fill="currentColor"
              className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-2">
          {([1, 2, 3] as const).map((setNum) => {
            const existingSet = log.sets.find((s) => s.setNumber === setNum);
            const isDisabled = !existingSet && setNum !== nextSetNumber;

            return (
              <SetLogger
                key={setNum}
                setNumber={setNum}
                defaultWeight={lastWeight}
                weightIncrement={exercise.weightIncrement}
                unit={weightUnit}
                isBodyweight={exercise.isBodyweight}
                existingSet={existingSet}
                onLog={(weight, reps) => handleLog(setNum, weight, reps)}
                disabled={isDisabled}
              />
            );
          })}

          {isComplete && <RecommendationBadge result={recommendation} unit={weightUnit} />}
        </div>
      )}

      {!isExpanded && isComplete && (
        <RecommendationBadge result={recommendation} unit={weightUnit} />
      )}
    </Card>
  );
}
