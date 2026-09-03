import { useCallback, useEffect, useRef } from 'react';
import { useTimerStore } from '@/stores/timerStore';

export function useRestTimer() {
  const { isRunning, tick, skipTimer } = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  return { skipTimer };
}

// Browsers cap the number of AudioContexts a page may create, so share one.
let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedCtx) sharedCtx = new AudioContext();
    // iOS suspends the context until a user gesture unlocks it.
    if (sharedCtx.state === 'suspended') void sharedCtx.resume();
    return sharedCtx;
  } catch {
    // AudioContext blocked in some environments
    return null;
  }
}

function tone(ctx: AudioContext, frequency: number, startAt: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

export function useTimerBeep() {
  // Called on a user gesture so the context is unlocked before the timer ends.
  const primeAudio = useCallback(() => {
    getAudioContext();
  }, []);

  const playBeep = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    tone(ctx, 880, ctx.currentTime, 0.5, 0.3);
  }, []);

  // Softer, lower double blip so it is clearly not the "rest is over" beep.
  const playWarningBeep = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    tone(ctx, 587.33, ctx.currentTime, 0.15, 0.18);
    tone(ctx, 587.33, ctx.currentTime + 0.22, 0.15, 0.18);
  }, []);

  return { playBeep, playWarningBeep, primeAudio };
}
