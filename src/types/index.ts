// Type definitions for the entire app

export interface ChartDataPoint {
  label: string;
  value: number;
}

// Food Logging
export interface FoodEntry {
  id: number;
  name: string;
  timestamp: string; // ISO 8601 format
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export type MealCategory = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

export type DailyFoodLog = {
  [key in MealCategory]: FoodEntry[];
};

export interface DietTemplate {
  id: number;
  name: string;
  meals: DailyFoodLog;
}

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

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Dashboard: undefined;
  Heart: undefined;
  FoodLog: undefined;
  Workout: undefined;
  More: undefined;
};

export type ScreenName = keyof RootStackParamList;
