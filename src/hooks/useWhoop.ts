import { useCallback } from 'react';
import { useWhoopStore } from '@/stores/whoopStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { WHOOP_API_BASE } from '@/constants/config';
import { refreshWhoopToken } from '@/utils/whoopAuth';
import type { RecoveryCategory, WhoopRecovery, WhoopTokens } from '@/types';

async function getValidToken(
  tokens: WhoopTokens,
  clientId: string
): Promise<WhoopTokens> {
  if (tokens.expiresAt - 5 * 60 * 1000 > Date.now()) return tokens;
  return refreshWhoopToken(tokens.refreshToken, clientId);
}

function categorize(score: number): RecoveryCategory {
  if (score >= 67) return 'green';
  if (score >= 34) return 'yellow';
  return 'red';
}

export function useWhoop() {
  const { tokens, setTokens, setRecovery, setLoading, setError } = useWhoopStore();
  const whoopClientId = useSettingsStore((s) => s.settings.whoopClientId);

  const fetchRecovery = useCallback(async () => {
    if (!tokens) return;
    setLoading(true);
    try {
      const validTokens = await getValidToken(tokens, whoopClientId);
      if (validTokens !== tokens) setTokens(validTokens);

      const res = await fetch(`${WHOOP_API_BASE}/recovery`, {
        headers: { Authorization: `Bearer ${validTokens.accessToken}` },
      });

      if (!res.ok) throw new Error('Failed to fetch recovery');

      const data = await res.json();
      const record = data.records?.[0];
      if (!record) return;

      const recovery: WhoopRecovery = {
        score: record.score?.recovery_score ?? 0,
        hrv: record.score?.hrv_rmssd_milli ?? 0,
        restingHeartRate: record.score?.resting_heart_rate ?? 0,
        sleepPerformance: record.score?.sleep_performance_percentage ?? 0,
        category: categorize(record.score?.recovery_score ?? 0),
        fetchedAt: new Date().toISOString(),
      };

      setRecovery(recovery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'WHOOP fetch failed');
    } finally {
      setLoading(false);
    }
  }, [tokens, whoopClientId, setTokens, setRecovery, setLoading, setError]);

  return { fetchRecovery };
}
