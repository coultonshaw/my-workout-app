import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, NotionConfig, WeightUnit } from '@/types';
import { REST_TIMER_DEFAULT } from '@/constants/config';

interface SettingsStore {
  settings: AppSettings;
  updateMusicUrl: (url: string) => void;
  updateRestTimer: (seconds: number) => void;
  updateWeightUnit: (unit: WeightUnit) => void;
  saveNotionConfig: (config: NotionConfig) => void;
  clearNotionConfig: () => void;
  setWhoopEnabled: (enabled: boolean) => void;
  setWhoopClientId: (clientId: string) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  musicPlaylistUrl: '',
  restTimerSeconds: REST_TIMER_DEFAULT,
  weightUnit: 'kg',
  notionConfig: null,
  whoopEnabled: false,
  whoopClientId: '',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateMusicUrl: (url) =>
        set((s) => ({ settings: { ...s.settings, musicPlaylistUrl: url } })),

      updateRestTimer: (seconds) =>
        set((s) => ({ settings: { ...s.settings, restTimerSeconds: seconds } })),

      updateWeightUnit: (unit) =>
        set((s) => ({ settings: { ...s.settings, weightUnit: unit } })),

      saveNotionConfig: (config) =>
        set((s) => ({ settings: { ...s.settings, notionConfig: config } })),

      clearNotionConfig: () =>
        set((s) => ({ settings: { ...s.settings, notionConfig: null } })),

      setWhoopEnabled: (enabled) =>
        set((s) => ({ settings: { ...s.settings, whoopEnabled: enabled } })),

      setWhoopClientId: (clientId) =>
        set((s) => ({ settings: { ...s.settings, whoopClientId: clientId } })),
    }),
    { name: 'settings-store' }
  )
);
