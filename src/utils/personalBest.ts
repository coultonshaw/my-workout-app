import type { PersonalBest } from '@/types';

export function isNewPB(
  weight: number,
  reps: number,
  currentPB: PersonalBest | undefined
): boolean {
  if (!currentPB) return true;
  return weight * reps > currentPB.volume;
}

export function formatPB(pb: PersonalBest, unit: string): string {
  if (pb.weight === 0) return `${pb.reps} reps (bodyweight)`;
  return `${pb.weight}${unit} × ${pb.reps}`;
}
