import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useNotion } from '@/hooks/useNotion';
import { useSettingsStore } from '@/stores/settingsStore';
import type { WorkoutSession } from '@/types';

interface NotionSyncModalProps {
  session: WorkoutSession;
  onClose: () => void;
}

export function NotionSyncModal({ session, onClose }: NotionSyncModalProps) {
  const { sync, isSyncing, syncResult, isConfigured } = useNotion();
  const notionConfig = useSettingsStore((s) => s.settings.notionConfig);
  const [started, setStarted] = useState(false);

  const handleSync = async () => {
    setStarted(true);
    await sync(session);
  };

  const totalSets = session.exercises.reduce((t, l) => t + l.sets.length, 0);

  return (
    <Modal isOpen title="Sync to Notion" onClose={onClose}>
      {!isConfigured ? (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">
            Configure your Notion API key and database ID in Settings to enable syncing.
          </p>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : syncResult ? (
        <div className="space-y-4">
          {syncResult.errors === 0 ? (
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-white font-semibold">Synced successfully!</p>
              <p className="text-gray-400 text-sm mt-1">
                {syncResult.success} sets added to Notion
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-white font-semibold">Partial sync</p>
              <p className="text-gray-400 text-sm mt-1">
                {syncResult.success} succeeded · {syncResult.errors} failed
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Check your CORS proxy URL and Notion API key in Settings.
              </p>
            </div>
          )}
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            This will create <span className="text-white font-semibold">{totalSets} rows</span> in your Notion database
            {notionConfig?.lastSyncedAt
              ? ` (last synced ${new Date(notionConfig.lastSyncedAt).toLocaleDateString()})`
              : ''}.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isSyncing}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSync}
              disabled={isSyncing || started}
            >
              {isSyncing ? 'Syncing…' : 'Sync Now'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
