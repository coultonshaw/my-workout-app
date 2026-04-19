import { type ReactNode, useEffect, useState } from 'react';
import { BottomNav } from './BottomNav';
import { MusicButton } from './MusicButton';

interface AppShellProps {
  children: ReactNode;
}

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (!offline) return null;
  return (
    <div className="bg-amber-900/80 text-amber-200 text-xs text-center py-1 px-3 tracking-wide">
      Offline — data saved locally
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col">
      <OfflineBanner />
      <main className="flex-1 pb-safe overflow-y-auto">{children}</main>
      <MusicButton />
      <BottomNav />
    </div>
  );
}
