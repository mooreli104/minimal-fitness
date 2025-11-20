/**
 * Analytics utility functions for workout and food tracking
 */

import { WorkoutDay, DailyFoodLog } from '../types';

/**
 * Parse exercise format "3x8" to extract sets and reps
 * @param actual - The actual format string (e.g., "3x8", "5x5")
 * @returns Object with sets and reps numbers
 */
export const parseExerciseFormat = (actual: string): { sets: number; reps: number } => {
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
export const calculateExerciseVolume = (actual: string, weight: string): number => {
  const { sets, reps } = parseExerciseFormat(actual);
  const weightNum = parseFloat(weight) || 0;
  return sets * reps * weightNum;
};

/**
 * Calculate total volume for a workout day
 */
export const calculateWorkoutVolume = (workout: WorkoutDay): number => {
  return workout.exercises.reduce((total, exercise) => {
    return total + calculateExerciseVolume(exercise.actual, exercise.weight);
  }, 0);
};

/**
 * Check if a workout is completed (all exercises have actual and weight filled)
 */
export const isWorkoutCompleted = (workout: WorkoutDay): boolean => {
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
export const hasFoodEntries = (log: DailyFoodLog): boolean => {
  return Object.values(log).some((meal) => meal.length > 0);
};
