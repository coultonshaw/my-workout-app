// ─── Core Domain ──────────────────────────────────────────────────────────────

export type Recommendation = 'increase' | 'decrease' | 'keep' | 'pending';
export type WeightUnit = 'kg' | 'lbs';
export type MuscleGroup = 'back' | 'chest' | 'shoulders' | 'arms' | 'legs' | 'core';
export type RecoveryCategory = 'red' | 'yellow' | 'green';

export interface SetEntry {
  setNumber: 1 | 2 | 3;
  weight: number;
  reps: number;
  isPersonalBest: boolean;
  completedAt: string; // ISO timestamp
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetEntry[];
  recommendation: Recommendation;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  startedAt: string;
  completedAt: string | null;
  exercises: ExerciseLog[];
  totalVolume: number;
  rpe?: number;
}

// ─── Exercise Catalog ─────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultWeight: number;
  weightIncrement: number;
  isBodyweight: boolean;
  order: number;
  active: boolean;
}

// ─── Personal Bests ───────────────────────────────────────────────────────────

export interface PersonalBest {
  exerciseId: string;
  weight: number;
  reps: number;
  volume: number; // weight × reps
  achievedAt: string;
  sessionId: string;
}

// ─── Recommendation ───────────────────────────────────────────────────────────

export interface RecommendationResult {
  recommendation: Recommendation;
  reason: string;
  suggestedWeight?: number;
}

// ─── WHOOP ────────────────────────────────────────────────────────────────────

export interface WhoopTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp ms
}

export interface WhoopRecovery {
  score: number; // 0–100
  hrv: number; // ms
  restingHeartRate: number;
  sleepPerformance: number; // 0–100
  category: RecoveryCategory;
  fetchedAt: string;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  corsProxyUrl: string;
  lastSyncedAt: string | null;
}

export interface AppSettings {
  musicPlaylistUrl: string;
  restTimerSeconds: number;
  weightUnit: WeightUnit;
  notionConfig: NotionConfig | null;
  whoopEnabled: boolean;
  whoopClientId: string;
}

// ─── Activity Tracking ────────────────────────────────────────────────────────

export type ActivityType = 'run' | 'pliability' | 'sauna' | 'boxing' | 'hike' | 'bike';

export interface DailyActivities {
  date: string; // YYYY-MM-DD
  activities: ActivityType[];
}

// ─── Store Shapes ─────────────────────────────────────────────────────────────

export interface RestTimerState {
  isRunning: boolean;
  secondsLeft: number;
  totalSeconds: number;
  exerciseId: string | null;
  nextSetNumber: number;
}
