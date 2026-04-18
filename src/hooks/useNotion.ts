import { useCallback, useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { syncSessionToNotion } from '@/utils/notionSync';
import type { WorkoutSession } from '@/types';

export function useNotion() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; errors: number } | null>(null);

  const exercises = useWorkoutStore((s) => s.exercises);
  const notionConfig = useSettingsStore((s) => s.settings.notionConfig);
  const saveNotionConfig = useSettingsStore((s) => s.saveNotionConfig);

  const sync = useCallback(
    async (session: WorkoutSession) => {
      if (!notionConfig) return;
      setIsSyncing(true);
      setSyncResult(null);

      const result = await syncSessionToNotion(session, exercises, notionConfig);
      setSyncResult(result);

      if (result.success > 0) {
        saveNotionConfig({ ...notionConfig, lastSyncedAt: new Date().toISOString() });
      }

      setIsSyncing(false);
    },
    [notionConfig, exercises, saveNotionConfig]
  );

  return { sync, isSyncing, syncResult, isConfigured: !!notionConfig };
}
