import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise, ExerciseLog, PersonalBest, SetEntry, WorkoutSession } from '@/types';
import { DEFAULT_EXERCISES } from '@/constants/exercises';
import { SETS_PER_EXERCISE } from '@/constants/config';
import { analyzeExerciseSets } from '@/utils/recommendation';

interface WorkoutStore {
  exercises: Exercise[];
  sessions: WorkoutSession[];
  activeSession: WorkoutSession | null;
  personalBests: Record<string, PersonalBest>;

  // Exercise management
  addExercise: (exercise: Exercise) => void;
  updateExercise: (exercise: Exercise) => void;
  toggleExerciseActive: (exerciseId: string) => void;
  reorderExercises: (exercises: Exercise[]) => void;

  // Session management
  startSession: () => void;
  logSet: (exerciseId: string, setNumber: 1 | 2 | 3, weight: number, reps: number) => void;
  completeSession: (rpe: number) => void;
  cancelSession: () => void;

  // Queries
  getLastSessionWeight: (exerciseId: string) => number;
  getExerciseById: (exerciseId: string) => Exercise | undefined;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      exercises: DEFAULT_EXERCISES,
      sessions: [],
      activeSession: null,
      personalBests: {},

      addExercise: (exercise) =>
        set((s) => ({ exercises: [...s.exercises, exercise] })),

      updateExercise: (exercise) =>
        set((s) => ({
          exercises: s.exercises.map((e) => (e.id === exercise.id ? exercise : e)),
        })),

      toggleExerciseActive: (exerciseId) =>
        set((s) => ({
          exercises: s.exercises.map((e) =>
            e.id === exerciseId ? { ...e, active: !e.active } : e
          ),
        })),

      reorderExercises: (exercises) => set({ exercises }),

      startSession: () => {
        const { exercises } = get();
        const activeExercises = exercises
          .filter((e) => e.active)
          .sort((a, b) => a.order - b.order);

        const session: WorkoutSession = {
          id: crypto.randomUUID(),
          startedAt: new Date().toISOString(),
          completedAt: null,
          exercises: activeExercises.map((e) => ({
            exerciseId: e.id,
            sets: [],
            recommendation: 'pending',
          })),
          totalVolume: 0,
        };

        set({ activeSession: session });
      },

      logSet: (exerciseId, setNumber, weight, reps) => {
        const { activeSession, personalBests, exercises } = get();
        if (!activeSession) return;

        const exercise = exercises.find((e) => e.id === exerciseId);
        if (!exercise) return;

        const currentPB = personalBests[exerciseId];
        const volume = weight * reps;
        const isPersonalBest = !currentPB || volume > currentPB.volume;

        const newSet: SetEntry = {
          setNumber,
          weight,
          reps,
          isPersonalBest,
          completedAt: new Date().toISOString(),
        };

        const updatedExercises: ExerciseLog[] = activeSession.exercises.map((log) => {
          if (log.exerciseId !== exerciseId) return log;

          const updatedSets = [
            ...log.sets.filter((s) => s.setNumber !== setNumber),
            newSet,
          ].sort((a, b) => a.setNumber - b.setNumber);

          const recommendation =
            updatedSets.length === SETS_PER_EXERCISE
              ? analyzeExerciseSets(updatedSets, exercise).recommendation
              : 'pending';

          return { ...log, sets: updatedSets, recommendation };
        });

        const totalVolume = updatedExercises.reduce(
          (total, log) =>
            total + log.sets.reduce((s, set) => s + set.weight * set.reps, 0),
          0
        );

        const updatedSession: WorkoutSession = {
          ...activeSession,
          exercises: updatedExercises,
          totalVolume,
        };

        const updatedPBs = { ...personalBests };
        if (isPersonalBest) {
          updatedPBs[exerciseId] = {
            exerciseId,
            weight,
            reps,
            volume,
            achievedAt: new Date().toISOString(),
            sessionId: activeSession.id,
          };
        }

        set({ activeSession: updatedSession, personalBests: updatedPBs });
      },

      completeSession: (rpe) => {
        const { activeSession, sessions } = get();
        if (!activeSession) return;

        const completed: WorkoutSession = {
          ...activeSession,
          completedAt: new Date().toISOString(),
          rpe,
        };

        set({ activeSession: null, sessions: [completed, ...sessions] });
      },

      cancelSession: () => set({ activeSession: null }),

      getLastSessionWeight: (exerciseId) => {
        const { sessions, exercises } = get();
        const exercise = exercises.find((e) => e.id === exerciseId);
        for (const session of sessions) {
          const log = session.exercises.find((l) => l.exerciseId === exerciseId);
          if (log && log.sets.length > 0) {
            return log.sets[log.sets.length - 1].weight;
          }
        }
        return exercise?.defaultWeight ?? 0;
      },

      getExerciseById: (exerciseId) => {
        return get().exercises.find((e) => e.id === exerciseId);
      },
    }),
    { name: 'workout-store' }
  )
);
