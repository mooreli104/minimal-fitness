/**
 * Data migration utilities for handling legacy data formats
 */

import { Exercise, WorkoutDay, WorkoutTemplate, FoodEntry, DailyFoodLog, MealCategory } from '../types';

/**
 * Migrates an exercise from old format (sets/reps) to new format (target/actual)
 * @param exercise Exercise to migrate
 * @returns Migrated exercise
 */
export const migrateExercise = (exercise: Exercise): Exercise => {
  // If already has target/actual, return as-is
  if (exercise.target !== undefined && exercise.actual !== undefined) {
    return exercise;
  }

  // Migrate from old sets/reps format to new target/actual format
  const sets = exercise.sets || '';
  const reps = exercise.reps || '';
  const targetActual = sets && reps ? `${sets}x${reps}` : '';

  return {
    ...exercise,
    target: targetActual,
    actual: targetActual,
  };
};

/**
 * Migrates all exercises in a workout day
 * @param day Workout day to migrate
 * @returns Migrated workout day
 */
export const migrateWorkoutDay = (day: WorkoutDay): WorkoutDay => {
  return {
    ...day,
    exercises: day.exercises.map(migrateExercise),
  };
};

/**
 * Migrates all days in a workout template
 * @param template Workout template to migrate
 * @returns Migrated template
 */
export const migrateWorkoutTemplate = (template: WorkoutTemplate): WorkoutTemplate => {
  return {
    ...template,
    days: template.days.map(migrateWorkoutDay),
  };
};

/**
 * Ensures a food entry has a valid timestamp
 * @param entry Food entry to fix
 * @param defaultDate Date to use if timestamp is missing
 * @returns Food entry with valid timestamp
 */
export const ensureFoodTimestamp = (entry: FoodEntry, defaultDate: Date): FoodEntry => {
  if (!entry.timestamp) {
    return {
      ...entry,
      timestamp: defaultDate.toISOString(),
    };
  }
  return entry;
};

/**
 * Ensures all meals exist in a food log with default empty arrays
 * @param log Potentially incomplete food log
 * @param defaultDate Date for default timestamps
 * @returns Complete food log with all meals
 */
export const normalizeFoodLog = (log: Partial<DailyFoodLog>, defaultDate: Date): DailyFoodLog => {
  const normalized: DailyFoodLog = {
    Breakfast: log.Breakfast ?? [],
    Lunch: log.Lunch ?? [],
    Dinner: log.Dinner ?? [],
    Snacks: log.Snacks ?? [],
  };

  // Ensure all entries have timestamps
  for (const meal of Object.keys(normalized) as MealCategory[]) {
    normalized[meal] = normalized[meal].map(entry =>
      ensureFoodTimestamp(entry, defaultDate)
    );
  }

  return normalized;
};
