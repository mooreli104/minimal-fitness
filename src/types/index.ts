// Type definitions for the entire app

export interface ChartDataPoint {
  label: string;
  value: number;
}

// Weight Tracking
export interface WeightEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  weight: number; // in lbs
  timestamp: string; // ISO 8601 format
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
  consumed?: boolean; // Whether the food has been eaten (marked via swipe)
}

// Meal category is now dynamic - can be any string
export type MealCategory = string;

// DailyFoodLog uses Record to support dynamic meal categories
export type DailyFoodLog = Record<string, FoodEntry[]>;

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

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface WeeklyPlan {
  [key: string]: number | null; // Maps day of week to WorkoutDay id, or null for rest/no plan
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
