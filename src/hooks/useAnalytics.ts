/**
 * Analytics Hook
 * Calculates real-time fitness metrics from workout and food logs
 */

import { useState, useEffect, useCallback } from 'react';
import { loadWorkoutLog } from '../services/workoutStorage.service';
import { loadFoodLog } from '../services/foodStorage.service';
import { getRecentWeightEntries } from '../services/weightStorage.service';
import { calculateNutritionTotals } from '../utils/calculations';
import { formatDateToKey } from '../utils/formatters';
import { WorkoutDay, DailyFoodLog } from '../types';

export interface AnalyticsData {
  workoutsThisWeek: number;
  weeklyVolume: number;
  volumeChange: number;
  avgCalories: number;
  avgProtein: number;
  currentStreak: number;
  bodyweightData: number[];
  isLoading: boolean;
}

/**
 * Parse exercise format "3x8" to extract sets and reps
 * @param actual - The actual format string (e.g., "3x8", "5x5")
 * @returns Object with sets and reps numbers
 */
const parseExerciseFormat = (actual: string): { sets: number; reps: number } => {
  const match = actual.match(/(\d+)x(\d+)/);
  if (match) {
    return {
      sets: parseInt(match[1], 10),
      reps: parseInt(match[2], 10),
    };
  }
  return { sets: 0, reps: 0 };
};

/**
 * Calculate total volume (sets × reps × weight) for a single exercise
 */
const calculateExerciseVolume = (actual: string, weight: string): number => {
  const { sets, reps } = parseExerciseFormat(actual);
  const weightNum = parseFloat(weight) || 0;
  return sets * reps * weightNum;
};

/**
 * Calculate total volume for a workout day
 */
const calculateWorkoutVolume = (workout: WorkoutDay): number => {
  return workout.exercises.reduce((total, exercise) => {
    return total + calculateExerciseVolume(exercise.actual, exercise.weight);
  }, 0);
};

/**
 * Get date N days ago
 */
const getDaysAgo = (days: number, fromDate: Date = new Date()): Date => {
  const date = new Date(fromDate);
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Get start of current week (Sunday)
 */
const getStartOfWeek = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day; // Days since Sunday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Check if a workout is completed (all exercises have actual and weight filled)
 */
const isWorkoutCompleted = (workout: WorkoutDay): boolean => {
  if (workout.isRest || workout.exercises.length === 0) {
    return false;
  }

  return workout.exercises.every(
    (exercise) =>
      exercise.actual &&
      exercise.actual.trim() !== '' &&
      exercise.weight &&
      exercise.weight.trim() !== ''
  );
};

/**
 * Check if a food log has any entries
 */
const hasFoodEntries = (log: DailyFoodLog): boolean => {
  return Object.values(log).some((meal) => meal.length > 0);
};

/**
 * Main analytics hook
 */
export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    workoutsThisWeek: 0,
    weeklyVolume: 0,
    volumeChange: 0,
    avgCalories: 0,
    avgProtein: 0,
    currentStreak: 0,
    bodyweightData: [],
    isLoading: true,
  });

  const calculateAnalytics = useCallback(async () => {
    try {
      const today = new Date();
      const startOfWeek = getStartOfWeek(today);

      // Load past 14 days of data (current week + previous week)
      const dates: Date[] = [];
      for (let i = 0; i < 14; i++) {
        dates.push(getDaysAgo(i, today));
      }

      // Load all workout and food logs in parallel
      const [workoutLogs, foodLogs] = await Promise.all([
        Promise.all(dates.map((date) => loadWorkoutLog(date))),
        Promise.all(dates.map((date) => loadFoodLog(date))),
      ]);

      // Split into current week and previous week
      const currentWeekWorkouts = workoutLogs.slice(0, 7);
      const previousWeekWorkouts = workoutLogs.slice(7, 14);
      const currentWeekFoodLogs = foodLogs.slice(0, 7);

      // Calculate workouts this week
      const workoutsThisWeek = currentWeekWorkouts.filter(
        (workout) => workout && isWorkoutCompleted(workout)
      ).length;

      // Calculate weekly volume (current week)
      const weeklyVolume = currentWeekWorkouts.reduce((total, workout) => {
        if (workout && isWorkoutCompleted(workout)) {
          return total + calculateWorkoutVolume(workout);
        }
        return total;
      }, 0);

      // Calculate previous week volume for comparison
      const previousWeekVolume = previousWeekWorkouts.reduce((total, workout) => {
        if (workout && isWorkoutCompleted(workout)) {
          return total + calculateWorkoutVolume(workout);
        }
        return total;
      }, 0);

      // Calculate volume change percentage
      let volumeChange = 0;
      if (previousWeekVolume > 0) {
        volumeChange = ((weeklyVolume - previousWeekVolume) / previousWeekVolume) * 100;
      } else if (weeklyVolume > 0) {
        volumeChange = 100; // First week with volume
      }

      // Calculate average calories and protein (past 7 days)
      let totalCalories = 0;
      let totalProtein = 0;
      let daysWithFood = 0;

      currentWeekFoodLogs.forEach((log) => {
        if (hasFoodEntries(log)) {
          const { calories, protein } = calculateNutritionTotals(log);
          totalCalories += calories;
          totalProtein += protein;
          daysWithFood++;
        }
      });

      const avgCalories = daysWithFood > 0 ? Math.round(totalCalories / daysWithFood) : 0;
      const avgProtein = daysWithFood > 0 ? Math.round(totalProtein / daysWithFood) : 0;

      // Calculate streak (consecutive days with workout OR food logged)
      let currentStreak = 0;
      for (let i = 0; i < dates.length; i++) {
        const workout = workoutLogs[i];
        const foodLog = foodLogs[i];

        const hasWorkout = workout && isWorkoutCompleted(workout);
        const hasFood = hasFoodEntries(foodLog);

        if (hasWorkout || hasFood) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }

      // Load recent weight entries (last 7 entries)
      const recentWeights = await getRecentWeightEntries(7);
      // Reverse to show oldest to newest (left to right on chart)
      const bodyweightData = recentWeights.reverse().map((entry) => entry.weight);

      setData({
        workoutsThisWeek,
        weeklyVolume: Math.round(weeklyVolume),
        volumeChange: Math.round(volumeChange * 10) / 10, // Round to 1 decimal
        avgCalories,
        avgProtein,
        currentStreak,
        bodyweightData,
        isLoading: false,
      });
    } catch (error) {
      console.error('Analytics calculation error:', error);
      setData((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  return {
    ...data,
    refresh: calculateAnalytics,
  };
};
