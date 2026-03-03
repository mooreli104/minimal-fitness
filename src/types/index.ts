// Type definitions for the entire app

// Workouts
export interface Exercise {
  id: number;
  name: string;
  target: string; // Format: "3x8", "5x5", etc.
  actual: string; // Format: "3x8", "5x5", etc.
  weight: string;
  // Legacy fields for backwards compatibility
  sets?: string;
  reps?: string;
}

export interface WorkoutDay {
  id: number;
  name: string;
  exercises: Exercise[];
  isRest?: boolean;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  days: WorkoutDay[];
}

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface WeeklyPlan {
  [key: string]: number | null; // Maps day of week to WorkoutDay id, or null for rest/no plan
}

export interface ExerciseHistoryEntry {
  date: string;           // YYYY-MM-DD
  workoutName: string;
  target: string;
  actual: string;
  weight: string;
}

// Navigation types
export type RootStackParamList = {
  Workout: undefined;
  More: undefined;
};

export type ScreenName = keyof RootStackParamList;
