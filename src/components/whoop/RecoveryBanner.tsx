import { useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useWhoopStore } from '@/stores/whoopStore';
import { useWhoop } from '@/hooks/useWhoop';

const categoryColors: Record<string, string> = {
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
};

const categoryAdvice: Record<string, string> = {
  green: 'Great recovery — push hard today',
  yellow: 'Moderate recovery — train smart',
  red: 'Low recovery — consider lighter session',
};

export function RecoveryBanner() {
  const { recovery, tokens, isLoading, error } = useWhoopStore();
  const { fetchRecovery } = useWhoop();

  useEffect(() => {
    if (tokens && !recovery) {
      fetchRecovery();
    }
  }, [tokens, recovery, fetchRecovery]);

  if (!tokens) return null;

  if (isLoading) {
    return (
      <Card className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-bg-elevated animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-bg-elevated rounded animate-pulse w-24" />
          <div className="h-3 bg-bg-elevated rounded animate-pulse w-36" />
        </div>
      </Card>
    );
  }

  if (error || !recovery) {
    return (
      <Card>
        <p className="text-xs text-gray-500">
          WHOOP data unavailable.{' '}
          <button onClick={fetchRecovery} className="text-accent underline">Retry</button>
        </p>
      </Card>
    );
  }

  const color = categoryColors[recovery.category] ?? '#f59e0b';

  return (
    <Card>
      <div className="flex items-center gap-4">
        <ProgressRing value={recovery.score} size={72} strokeWidth={6} color={color}>
          <span className="text-lg font-bold text-white">{recovery.score}%</span>
        </ProgressRing>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
            WHOOP Recovery
          </p>
          <p className="text-white text-sm font-semibold">
            {categoryAdvice[recovery.category]}
          </p>
          <div className="flex gap-3 mt-2">
            <span className="text-xs text-gray-500">
              HRV <span className="text-white font-medium">{recovery.hrv.toFixed(0)}ms</span>
            </span>
            <span className="text-xs text-gray-500">
              RHR <span className="text-white font-medium">{recovery.restingHeartRate}bpm</span>
            </span>
            <span className="text-xs text-gray-500">
              Sleep <span className="text-white font-medium">{recovery.sleepPerformance.toFixed(0)}%</span>
            </span>
          </div>
        </div>

        <button
          onClick={fetchRecovery}
          className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
          title="Refresh"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </button>
      </div>
    </Card>
  );
}
