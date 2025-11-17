// Type definitions for the entire app

export type EntryType = "meal" | "workout";

export interface Entry {
  id: number;
  icon: string;
  name: string;
  category: string;
  source: string;
  calories: number;
  type: EntryType;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export type Period = "today" | "week" | "month";

export type Mode = "calories" | "workout";

export interface DateItem {
  day: number;
  label:string;
}

export interface NavItem {
  name: string;
  path: string;
  icon: string;
  isCenter?: boolean;
}

export interface Stat {
  label: string;
  value: string;
  icon: string;
  color: string;
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

// Workouts
export interface Exercise {
  id: number;
  name: string;
  sets: string;
  reps: string;
  weight: string;
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
