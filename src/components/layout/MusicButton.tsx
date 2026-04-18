import { useSettingsStore } from '@/stores/settingsStore';
import { useWorkoutStore } from '@/stores/workoutStore';

export function MusicButton() {
  const musicUrl = useSettingsStore((s) => s.settings.musicPlaylistUrl);
  const activeSession = useWorkoutStore((s) => s.activeSession);

  if (!musicUrl) return null;

  return (
    <button
      onClick={() => window.open(musicUrl, '_blank', 'noopener')}
      aria-label="Open workout playlist"
      className={`
        fixed bottom-20 right-4 z-40
        w-14 h-14 rounded-full
        bg-accent hover:bg-accent-dim active:scale-90
        flex items-center justify-center
        shadow-lg shadow-accent/30
        transition-all duration-200
        ${activeSession ? 'animate-pulse-slow' : ''}
      `}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-black">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    </button>
  );
}
