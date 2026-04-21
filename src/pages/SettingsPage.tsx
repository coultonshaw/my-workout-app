import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWhoopStore } from '@/stores/whoopStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { REST_TIMER_MAX, REST_TIMER_MIN } from '@/constants/config';
import { initiateWhoopOAuth } from '@/utils/whoopAuth';
import type { NotionConfig } from '@/types';

export function SettingsPage() {
  const { settings, updateMusicUrl, updateRestTimer, updateWeightUnit, setWhoopEnabled, setWhoopClientId, saveNotionConfig, clearNotionConfig } = useSettingsStore();
  const { tokens: whoopTokens, clearWhoop } = useWhoopStore();
  const { exercises, reorderExercises, toggleExerciseActive } = useWorkoutStore();

  const [musicInput, setMusicInput] = useState(settings.musicPlaylistUrl);
  const [whoopClientInput, setWhoopClientInput] = useState(settings.whoopClientId);

  // Notion form state
  const [notionKey, setNotionKey] = useState(settings.notionConfig?.apiKey ?? '');
  const [notionDb, setNotionDb] = useState(settings.notionConfig?.databaseId ?? '');
  const [notionProxy, setNotionProxy] = useState(settings.notionConfig?.corsProxyUrl ?? '');

  const handleSaveNotion = () => {
    if (!notionKey || !notionDb) return;
    const config: NotionConfig = {
      apiKey: notionKey,
      databaseId: notionDb,
      corsProxyUrl: notionProxy,
      lastSyncedAt: settings.notionConfig?.lastSyncedAt ?? null,
    };
    saveNotionConfig(config);
  };

  const handleWhoopConnect = async () => {
    if (!whoopClientInput) return;
    setWhoopClientId(whoopClientInput);
    setWhoopEnabled(true);
    await initiateWhoopOAuth(whoopClientInput);
  };

  const sortedExercises = [...exercises].sort((a, b) => a.order - b.order);

  const moveExercise = (index: number, dir: -1 | 1) => {
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= sortedExercises.length) return;
    const updated = sortedExercises.map((ex, i) => {
      if (i === index) return { ...ex, order: sortedExercises[swapIndex].order };
      if (i === swapIndex) return { ...ex, order: sortedExercises[index].order };
      return ex;
    });
    reorderExercises(updated);
  };

  return (
    <div className="px-4 pt-14 pb-6 space-y-5 safe-top">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Exercise order */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Exercises
        </h2>
        <div className="space-y-1">
          {sortedExercises.map((ex, i) => (
            <div key={ex.id} className="flex items-center gap-2 py-1.5">
              {/* Up / down */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveExercise(i, -1)}
                  disabled={i === 0}
                  className="w-6 h-5 flex items-center justify-center text-white/25 hover:text-white/70 disabled:opacity-20 transition-colors text-xs"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveExercise(i, 1)}
                  disabled={i === sortedExercises.length - 1}
                  className="w-6 h-5 flex items-center justify-center text-white/25 hover:text-white/70 disabled:opacity-20 transition-colors text-xs"
                >
                  ▼
                </button>
              </div>
              {/* Name */}
              <span className={`flex-1 text-sm ${ex.active ? 'text-white/80' : 'text-white/25 line-through'}`}>
                {ex.name}
              </span>
              {/* Active toggle */}
              <button
                onClick={() => toggleExerciseActive(ex.id)}
                className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-lg transition-colors ${
                  ex.active
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'bg-white/[0.04] text-white/25 border border-white/[0.06]'
                }`}
              >
                {ex.active ? 'On' : 'Off'}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Music */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Music
        </h2>
        <label className="text-xs text-gray-500 block mb-1.5">YouTube Playlist URL</label>
        <input
          type="url"
          value={musicInput}
          onChange={(e) => setMusicInput(e.target.value)}
          onBlur={() => updateMusicUrl(musicInput)}
          placeholder="https://youtube.com/playlist?list=..."
          className="w-full bg-bg-elevated text-white text-sm rounded-xl px-4 py-3 border-0 outline-none focus:ring-1 focus:ring-accent placeholder-gray-600"
        />
        <p className="text-xs text-gray-600 mt-2">
          The music button will open this URL in a new tab.
        </p>
      </Card>

      {/* Workout preferences */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Workout
        </h2>

        <div className="space-y-4">
          {/* Weight unit */}
          <div>
            <label className="text-xs text-gray-500 block mb-2">Weight Unit</label>
            <div className="flex gap-2">
              {(['kg', 'lbs'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => updateWeightUnit(unit)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    settings.weightUnit === unit
                      ? 'bg-accent text-black'
                      : 'bg-bg-elevated text-gray-400'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Rest timer */}
          <div>
            <label className="text-xs text-gray-500 block mb-2">
              Rest Timer: {settings.restTimerSeconds}s
            </label>
            <input
              type="range"
              min={REST_TIMER_MIN}
              max={REST_TIMER_MAX}
              step={15}
              value={settings.restTimerSeconds}
              onChange={(e) => updateRestTimer(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{REST_TIMER_MIN}s</span>
              <span>{REST_TIMER_MAX}s</span>
            </div>
          </div>
        </div>
      </Card>

      {/* WHOOP */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          WHOOP Integration
        </h2>

        {whoopTokens ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-increase" />
              <span className="text-sm text-white">Connected to WHOOP</span>
            </div>
            <Button variant="danger" size="sm" onClick={clearWhoop}>
              Disconnect WHOOP
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              Connect your WHOOP account to see recovery score and HRV on the home screen. You'll need a WHOOP developer app Client ID from{' '}
              <span className="text-accent">developer.whoop.com</span>.
            </p>
            <label className="text-xs text-gray-500 block mb-1.5">WHOOP Client ID</label>
            <input
              type="text"
              value={whoopClientInput}
              onChange={(e) => setWhoopClientInput(e.target.value)}
              placeholder="your-client-id"
              className="w-full bg-bg-elevated text-white text-sm rounded-xl px-4 py-3 border-0 outline-none focus:ring-1 focus:ring-accent placeholder-gray-600"
            />
            <Button
              variant="outline"
              className="w-full"
              disabled={!whoopClientInput}
              onClick={handleWhoopConnect}
            >
              Connect WHOOP
            </Button>
          </div>
        )}
      </Card>

      {/* Notion */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Notion Integration
        </h2>
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Sync workouts to your Notion database. Get your Internal Integration Token from notion.com/my-integrations.
          </p>

          {/* CORS proxy note */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3">
            <p className="text-xs text-accent font-medium mb-1">⚠️ CORS Proxy Required</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Notion's API blocks browser requests. Deploy a Cloudflare Worker as a CORS proxy (see docs) and paste its URL below. Leave blank to attempt direct (may fail).
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Integration Token</label>
              <input
                type="password"
                value={notionKey}
                onChange={(e) => setNotionKey(e.target.value)}
                placeholder="secret_..."
                className="w-full bg-bg-elevated text-white text-sm rounded-xl px-4 py-3 border-0 outline-none focus:ring-1 focus:ring-accent placeholder-gray-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Database ID</label>
              <input
                type="text"
                value={notionDb}
                onChange={(e) => setNotionDb(e.target.value)}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-bg-elevated text-white text-sm rounded-xl px-4 py-3 border-0 outline-none focus:ring-1 focus:ring-accent placeholder-gray-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">CORS Proxy URL (optional)</label>
              <input
                type="url"
                value={notionProxy}
                onChange={(e) => setNotionProxy(e.target.value)}
                placeholder="https://my-worker.workers.dev"
                className="w-full bg-bg-elevated text-white text-sm rounded-xl px-4 py-3 border-0 outline-none focus:ring-1 focus:ring-accent placeholder-gray-600"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={!notionKey || !notionDb}
              onClick={handleSaveNotion}
            >
              Save
            </Button>
            {settings.notionConfig && (
              <Button variant="danger" size="sm" onClick={clearNotionConfig}>
                Clear
              </Button>
            )}
          </div>

          {settings.notionConfig?.lastSyncedAt && (
            <p className="text-xs text-gray-600">
              Last synced: {new Date(settings.notionConfig.lastSyncedAt).toLocaleString()}
            </p>
          )}
        </div>
      </Card>

      {/* App info */}
      <p className="text-center text-xs text-gray-700 pb-4">
        Workout Tracker v0.1.0 · Data stored locally on device
      </p>
    </div>
  );
}
