import { useEffect } from 'react';
import { Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { ActiveWorkoutPage } from '@/pages/ActiveWorkoutPage';
import { WorkoutCompletePage } from '@/pages/WorkoutCompletePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useWhoopStore } from '@/stores/whoopStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { exchangeWhoopCode } from '@/utils/whoopAuth';
import { WHOOP_REDIRECT_PARAM } from '@/constants/config';

function WhoopCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokens, setError } = useWhoopStore();
  const whoopClientId = useSettingsStore((s) => s.settings.whoopClientId);

  useEffect(() => {
    const isCallback = searchParams.get(WHOOP_REDIRECT_PARAM) === '1';
    const code = searchParams.get('code');

    if (!isCallback || !code) return;

    exchangeWhoopCode(code, whoopClientId)
      .then((tokens) => {
        setTokens(tokens);
        navigate('/', { replace: true });
      })
      .catch((err) => {
        setError(err.message);
        navigate('/', { replace: true });
      });
  }, [searchParams, whoopClientId, setTokens, setError, navigate]);

  return null;
}

export function App() {
  return (
    <>
      <WhoopCallbackHandler />
      <Routes>
        {/* Active workout — full screen, no shell nav */}
        <Route path="/workout/active" element={<ActiveWorkoutPage />} />
        <Route path="/workout/complete" element={<WorkoutCompletePage />} />

        {/* Shell-wrapped routes */}
        <Route
          path="/*"
          element={
            <AppShell>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </AppShell>
          }
        />
      </Routes>
    </>
  );
}
