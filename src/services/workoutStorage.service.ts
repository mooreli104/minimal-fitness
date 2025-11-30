/**
 * Storage service for workout-related data
 * Handles all workout CRUD operations with AsyncStorage
 */

import { WorkoutDay, WorkoutTemplate, Exercise } from '../types';
import { setItem, removeItem, getItemWithMigration, getArrayWithMigration } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { formatDateToKey } from '../utils/formatters';
import { migrateWorkoutDay, migrateWorkoutTemplate } from '../utils/migrations';

/**
 * Generates storage key for a workout log by date
 */
const getWorkoutLogKey = (date: Date): string => {
  return `${STORAGE_KEYS.WORKOUT_LOG_PREFIX}${formatDateToKey(date)}`;
};

/**
 * Loads workout log for a specific date
 * @param date Date to load workout for
 * @returns Workout day or null if none exists
 */
export const loadWorkoutLog = async (date: Date): Promise<WorkoutDay | null> => {
  const key = getWorkoutLogKey(date);
  return await getItemWithMigration(key, migrateWorkoutDay);
};

/**
 * Saves workout log for a specific date
 * @param date Date to save workout for
 * @param log Workout day to save
 */
export const saveWorkoutLog = async (date: Date, log: WorkoutDay): Promise<void> => {
  const key = getWorkoutLogKey(date);
  await setItem(key, log);
};

/**
 * Deletes workout log for a specific date
 * @param date Date to delete workout for
 */
export const deleteWorkoutLog = async (date: Date): Promise<void> => {
  const key = getWorkoutLogKey(date);
  await removeItem(key);
};

/**
 * Loads the workout program (all workout days)
 * @returns Array of workout days
 */
export const loadWorkoutProgram = async (): Promise<WorkoutDay[]> => {
  return await getArrayWithMigration(STORAGE_KEYS.WORKOUT_PROGRAM, migrateWorkoutDay);
};

/**
 * Saves the workout program
 * @param program Array of workout days
 */
export const saveWorkoutProgram = async (program: WorkoutDay[]): Promise<void> => {
  await setItem(STORAGE_KEYS.WORKOUT_PROGRAM, program);
};

/**
 * Loads all workout templates
 * @returns Array of workout templates
 */
export const loadWorkoutTemplates = async (): Promise<WorkoutTemplate[]> => {
  return await getArrayWithMigration(STORAGE_KEYS.WORKOUT_TEMPLATES, migrateWorkoutTemplate);
};

/**
 * Saves workout templates
 * @param templates Array of workout templates
 */
export const saveWorkoutTemplates = async (templates: WorkoutTemplate[]): Promise<void> => {
  await setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, templates);
};

/**
 * Finds the most recent workout log with the specified name before the given date
 * @param workoutName Name of the workout to search for
 * @param beforeDate Search for workouts before this date
 * @param maxDaysBack Maximum number of days to search back (default 90)
 * @returns The most recent matching workout or null
 */
export const findPreviousWorkoutByName = async (
  workoutName: string,
  beforeDate: Date,
  maxDaysBack: number = 90
): Promise<WorkoutDay | null> => {
  try {
    const startDate = new Date(beforeDate);
    startDate.setDate(startDate.getDate() - maxDaysBack);

    for (let i = 1; i <= maxDaysBack; i++) {
      const checkDate = new Date(beforeDate);
      checkDate.setDate(checkDate.getDate() - i);

      if (checkDate < startDate) break;

      const log = await loadWorkoutLog(checkDate);
      if (log && !log.isRest && log.name === workoutName) {
        return log;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Finds the most recent occurrence of a specific exercise across all workouts
 * @param exerciseName Name of the exercise to search for
 * @param beforeDate Search for exercises before this date
 * @param maxDaysBack Maximum number of days to search back (default 90)
 * @returns The most recent exercise with values, or null
 */
export const findLastExerciseOccurrence = async (
  exerciseName: string,
  beforeDate: Date,
  maxDaysBack: number = 90
): Promise<Exercise | null> => {
  try {
    if (!exerciseName.trim()) return null;

    for (let i = 1; i <= maxDaysBack; i++) {
      const checkDate = new Date(beforeDate);
      checkDate.setDate(checkDate.getDate() - i);

      const log = await loadWorkoutLog(checkDate);
      if (log && !log.isRest && log.exercises) {
        const exercise = log.exercises.find(
          ex => ex.name.toLowerCase() === exerciseName.toLowerCase() &&
                (ex.target || ex.actual || ex.weight)
        );

        if (exercise) {
          return exercise;
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};
