import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActivityType, DailyActivities } from '@/types';

interface ActivityState {
  dailyActivities: DailyActivities[];
  toggleActivity: (date: string, type: ActivityType) => void;
  getActivitiesForDate: (date: string) => ActivityType[];
  hasActivity: (date: string, type: ActivityType) => boolean;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      dailyActivities: [],

      toggleActivity: (date, type) => {
        set((state) => {
          const existing = state.dailyActivities.find((d) => d.date === date);
          if (existing) {
            const has = existing.activities.includes(type);
            return {
              dailyActivities: state.dailyActivities.map((d) =>
                d.date === date
                  ? { ...d, activities: has ? d.activities.filter((a) => a !== type) : [...d.activities, type] }
                  : d
              ),
            };
          }
          return { dailyActivities: [...state.dailyActivities, { date, activities: [type] }] };
        });
      },

      getActivitiesForDate: (date) =>
        get().dailyActivities.find((d) => d.date === date)?.activities ?? [],

      hasActivity: (date, type) =>
        get().dailyActivities.find((d) => d.date === date)?.activities.includes(type) ?? false,
    }),
    { name: 'activity-store' }
  )
);
