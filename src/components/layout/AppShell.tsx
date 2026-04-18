import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { MusicButton } from './MusicButton';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col">
      <main className="flex-1 pb-safe overflow-y-auto">{children}</main>
      <MusicButton />
      <BottomNav />
    </div>
  );
}
