import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { SetEntry } from '@/types';

interface SetLoggerProps {
  setNumber: 1 | 2 | 3;
  defaultWeight: number;
  weightIncrement: number;
  unit: string;
  isBodyweight: boolean;
  existingSet?: SetEntry;
  onLog: (weight: number, reps: number) => void;
  disabled?: boolean;
}

export function SetLogger({
  setNumber,
  defaultWeight,
  weightIncrement,
  unit,
  isBodyweight,
  existingSet,
  onLog,
  disabled = false,
}: SetLoggerProps) {
  const [weight, setWeight] = useState(existingSet?.weight ?? defaultWeight);
  const [reps, setReps] = useState(existingSet?.reps ?? 8);
  const isLogged = !!existingSet;

  const handleLog = () => {
    if (!isLogged) onLog(weight, reps);
  };

  const adjustWeight = (delta: number) => {
    setWeight((w) => Math.max(0, Math.round((w + delta) * 10) / 10));
  };

  const adjustReps = (delta: number) => {
    setReps((r) => Math.max(1, Math.min(30, r + delta)));
  };

  if (isLogged) {
    return (
      <div className="flex items-center gap-3 py-2.5 px-3 bg-bg-surface rounded-xl">
        <span className="text-gray-500 text-sm w-12">Set {setNumber}</span>
        <span className="flex-1 text-white font-medium">
          {isBodyweight ? `BW` : `${existingSet.weight}${unit}`}
          {' '}&times;{' '}{existingSet.reps} reps
        </span>
        {existingSet.isPersonalBest && <Badge type="pb" label="PB" />}
        <span className="text-status-increase text-lg">✓</span>
      </div>
    );
  }

  return (
    <div className={`p-3 bg-bg-surface rounded-xl space-y-3 ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-gray-400 text-sm font-medium">Set {setNumber}</span>

      <div className="grid grid-cols-2 gap-3">
        {!isBodyweight && (
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Weight ({unit})</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustWeight(-weightIncrement)}
                className="w-9 h-9 rounded-lg bg-bg-elevated text-white text-lg font-bold active:scale-90 transition-transform flex items-center justify-center"
                disabled={disabled}
              >
                −
              </button>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="flex-1 h-9 bg-bg-elevated text-white text-center text-base font-semibold rounded-lg border-0 outline-none focus:ring-1 focus:ring-accent"
                min={0}
                step={weightIncrement}
                disabled={disabled}
              />
              <button
                onClick={() => adjustWeight(weightIncrement)}
                className="w-9 h-9 rounded-lg bg-bg-elevated text-white text-lg font-bold active:scale-90 transition-transform flex items-center justify-center"
                disabled={disabled}
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className={`space-y-1 ${isBodyweight ? 'col-span-2' : ''}`}>
          <label className="text-xs text-gray-500">Reps</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustReps(-1)}
              className="w-9 h-9 rounded-lg bg-bg-elevated text-white text-lg font-bold active:scale-90 transition-transform flex items-center justify-center"
              disabled={disabled}
            >
              −
            </button>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value) || 0)}
              className="flex-1 h-9 bg-bg-elevated text-white text-center text-base font-semibold rounded-lg border-0 outline-none focus:ring-1 focus:ring-accent"
              min={1}
              max={30}
              disabled={disabled}
            />
            <button
              onClick={() => adjustReps(1)}
              className="w-9 h-9 rounded-lg bg-bg-elevated text-white text-lg font-bold active:scale-90 transition-transform flex items-center justify-center"
              disabled={disabled}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={handleLog}
        disabled={disabled}
      >
        Log Set {setNumber}
      </Button>
    </div>
  );
}
