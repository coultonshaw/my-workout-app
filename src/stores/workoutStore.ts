import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise, ExerciseLog, PersonalBest, SetEntry, WorkoutSession } from '@/types';
import { DEFAULT_EXERCISES } from '@/constants/exercises';
import { SETS_PER_EXERCISE } from '@/constants/config';
import { analyzeExerciseSets } from '@/utils/recommendation';

// Rebuilds isPersonalBest flags and personalBests record from scratch, preserving session order.
function recomputeAllPBs(sessions: WorkoutSession[]): {
  sessions: WorkoutSession[];
  personalBests: Record<string, PersonalBest>;
} {
  const chronological = [...sessions].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  const bestVolume: Record<string, number> = {};
  const personalBests: Record<string, PersonalBest> = {};

  const updated = chronological.map((session) => ({
    ...session,
    exercises: session.exercises.map((log) => ({
      ...log,
      sets: log.sets.map((s) => {
        const vol = s.weight * s.reps;
        const isPB = vol > (bestVolume[log.exerciseId] ?? 0);
        if (isPB) {
          bestVolume[log.exerciseId] = vol;
          personalBests[log.exerciseId] = {
            exerciseId: log.exerciseId,
            weight: s.weight,
            reps: s.reps,
            volume: vol,
            achievedAt: s.completedAt,
            sessionId: session.id,
          };
        }
        return { ...s, isPersonalBest: isPB };
      }),
    })),
  }));

  // Restore original order (newest-first)
  const idOrder = sessions.map((s) => s.id);
  const reordered = [...updated].sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));

  return { sessions: reordered, personalBests };
}

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
  moveActiveExercise: (index: number, dir: -1 | 1) => void;
  logSet: (exerciseId: string, setNumber: 1 | 2 | 3, weight: number, reps: number) => void;
  completeSession: (rpe: number) => void;
  updateLastSessionRpe: (rpe: number) => void;
  cancelSession: () => void;

  // History editing
  deleteSession: (sessionId: string) => void;
  updateSessionSet: (sessionId: string, exerciseId: string, setNumber: 1 | 2 | 3, weight: number, reps: number) => void;

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

      moveActiveExercise: (index, dir) => {
        const { activeSession } = get();
        if (!activeSession) return;
        const exs = [...activeSession.exercises];
        const swap = index + dir;
        if (swap < 0 || swap >= exs.length) return;
        [exs[index], exs[swap]] = [exs[swap], exs[index]];
        set({ activeSession: { ...activeSession, exercises: exs } });
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

      updateLastSessionRpe: (rpe) => {
        const { sessions } = get();
        if (sessions.length === 0) return;
        const [latest, ...rest] = sessions;
        set({ sessions: [{ ...latest, rpe }, ...rest] });
      },

      cancelSession: () => set({ activeSession: null }),

      deleteSession: (sessionId) => {
        const { sessions } = get();
        const remaining = sessions.filter((s) => s.id !== sessionId);
        const { sessions: updated, personalBests } = recomputeAllPBs(remaining);
        set({ sessions: updated, personalBests });
      },

      updateSessionSet: (sessionId, exerciseId, setNumber, weight, reps) => {
        const { sessions } = get();
        const patched = sessions.map((session) => {
          if (session.id !== sessionId) return session;
          const updatedExercises = session.exercises.map((log) => {
            if (log.exerciseId !== exerciseId) return log;
            const updatedSets = [
              ...log.sets.filter((s) => s.setNumber !== setNumber),
              { setNumber, weight, reps, isPersonalBest: false, completedAt: new Date().toISOString() },
            ].sort((a, b) => a.setNumber - b.setNumber);
            return { ...log, sets: updatedSets };
          });
          const totalVolume = updatedExercises.reduce(
            (t, log) => t + log.sets.reduce((s, set) => s + set.weight * set.reps, 0),
            0
          );
          return { ...session, exercises: updatedExercises, totalVolume };
        });
        const { sessions: updated, personalBests } = recomputeAllPBs(patched);
        set({ sessions: updated, personalBests });
      },

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
