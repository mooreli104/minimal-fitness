/**
 * Analytics utility functions for workout and food tracking
 */

import { WorkoutDay, DailyFoodLog } from '../types';

/**
 * Parse exercise format to extract sets and reps
 * Supports multiple formats:
 * - "3x8" = 3 sets of 8 reps
 * - "10*10*10" = 3 sets with 10 reps each (count(reps) format)
 * - "8*8*8*8" = 4 sets with 8 reps each
 *
 * @param actual - The actual format string (e.g., "3x8", "10*10*10")
 * @returns Object with sets and reps numbers
 */
export const parseExerciseFormat = (actual: string): { sets: number; reps: number } => {
  // First try the standard "3x8" format
  const standardMatch = actual.match(/(\d+)x(\d+)/);
  if (standardMatch) {
    return {
      sets: parseInt(standardMatch[1], 10),
      reps: parseInt(standardMatch[2], 10),
    };
  }

  // Try the "reps*reps*reps" format (e.g., "10*10*10")
  const repsArrayMatch = actual.match(/^(\d+)(?:\*(\d+))+$/);
  if (repsArrayMatch) {
    // Split by * and count how many numbers we have
    const repsArray = actual.split('*').map(n => parseInt(n, 10));
    const sets = repsArray.length;
    // Calculate average reps (in case they're not all the same)
    const totalReps = repsArray.reduce((sum, r) => sum + r, 0);
    const avgReps = Math.round(totalReps / sets);
    return { sets, reps: avgReps };
  }

  return { sets: 0, reps: 0 };
};

/**
 * Calculate total volume (sets × reps × weight) for a single exercise
 * Handles both "3x8" and "10*10*10" formats
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
 * Rest days are considered completed for streak purposes
 */
export const isWorkoutCompleted = (workout: WorkoutDay): boolean => {
  // Rest days count as completed
  if (workout.isRest) {
    return true;
  }

  // Empty workout days are not completed
  if (workout.exercises.length === 0) {
    return false;
  }

  // All exercises must have actual and weight filled
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
