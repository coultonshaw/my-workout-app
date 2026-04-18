import { create } from 'zustand';
import type { RestTimerState } from '@/types';

interface TimerStore extends RestTimerState {
  startTimer: (seconds: number, exerciseId: string, nextSetNumber: number) => void;
  tick: () => void;
  skipTimer: () => void;
  addTime: (seconds: number) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  isRunning: false,
  secondsLeft: 0,
  totalSeconds: 0,
  exerciseId: null,
  nextSetNumber: 1,

  startTimer: (seconds, exerciseId, nextSetNumber) =>
    set({ isRunning: true, secondsLeft: seconds, totalSeconds: seconds, exerciseId, nextSetNumber }),

  tick: () => {
    const { secondsLeft } = get();
    if (secondsLeft <= 1) {
      set({ isRunning: false, secondsLeft: 0, exerciseId: null });
    } else {
      set({ secondsLeft: secondsLeft - 1 });
    }
  },

  skipTimer: () => set({ isRunning: false, secondsLeft: 0, exerciseId: null }),

  addTime: (seconds) =>
    set((s) => ({
      secondsLeft: s.secondsLeft + seconds,
      totalSeconds: s.totalSeconds + seconds,
    })),
}));
