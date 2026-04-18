import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WhoopRecovery, WhoopTokens } from '@/types';

interface WhoopStore {
  tokens: WhoopTokens | null;
  recovery: WhoopRecovery | null;
  isLoading: boolean;
  error: string | null;

  setTokens: (tokens: WhoopTokens) => void;
  setRecovery: (recovery: WhoopRecovery) => void;
  clearWhoop: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWhoopStore = create<WhoopStore>()(
  persist(
    (set) => ({
      tokens: null,
      recovery: null,
      isLoading: false,
      error: null,

      setTokens: (tokens) => set({ tokens, error: null }),
      setRecovery: (recovery) => set({ recovery }),
      clearWhoop: () => set({ tokens: null, recovery: null, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: 'whoop-store',
      partialize: (s) => ({ tokens: s.tokens, recovery: s.recovery }),
    }
  )
);
