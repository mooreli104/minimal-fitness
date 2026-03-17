/**
 * Storage service for workout-related data
 * Handles all workout CRUD operations with AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutDay, WorkoutTemplate, ExerciseHistoryEntry, Exercise } from '../types';
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
 * Finds the most recent logged data for each unique exercise across all past workouts.
 * Returns an Exercise[] where each entry is the last time that exercise had actual/weight data.
 * This searches across ALL workout types, not just workouts with the same name.
 */
export const findLastLoggedExercises = async (
  beforeDate: Date,
  maxDaysBack: number = 90
): Promise<Exercise[]> => {
  const found = new Map<string, Exercise>();

  for (let i = 1; i <= maxDaysBack; i++) {
    const checkDate = new Date(beforeDate);
    checkDate.setDate(checkDate.getDate() - i);

    const log = await loadWorkoutLog(checkDate);
    if (!log || log.isRest || !log.exercises) continue;

    for (const ex of log.exercises) {
      const key = ex.name.trim().toLowerCase();
      if (key && !found.has(key) && (ex.actual || ex.weight)) {
        found.set(key, ex);
      }
    }
  }
  return Array.from(found.values());
};

/**
 * Finds all occurrences of a specific exercise across past workouts
 * @param exerciseName Name of the exercise to search for
 * @param beforeDate Search for exercises before this date
 * @param maxDaysBack Maximum number of days to search back (default 90)
 * @returns Array of exercise history entries
 */
export const findExerciseHistory = async (
  exerciseName: string,
  beforeDate: Date,
  maxDaysBack: number = 90
): Promise<ExerciseHistoryEntry[]> => {
  const results: ExerciseHistoryEntry[] = [];
  if (!exerciseName.trim()) return results;

  for (let i = 1; i <= maxDaysBack; i++) {
    const checkDate = new Date(beforeDate);
    checkDate.setDate(checkDate.getDate() - i);

    const log = await loadWorkoutLog(checkDate);
    if (!log || log.isRest || !log.exercises) continue;

    const match = log.exercises.find(
      ex => ex.name.toLowerCase() === exerciseName.toLowerCase() &&
            (ex.actual || ex.weight)
    );

    if (match) {
      results.push({
        date: formatDateToKey(checkDate),
        workoutName: log.name,
        target: match.target,
        actual: match.actual,
        weight: match.weight,
      });
    }
  }
  return results;
};

/**
 * Finds all occurrences of a specific exercise for a specific workout day name
 * @param exerciseName Name of the exercise to search for
 * @param workoutDayName Name of the workout day to filter by (e.g. "Upper A")
 * @param maxDaysBack Maximum number of days to search back (default 365)
 * @returns Array of exercise history entries, newest first
 */
export const findExerciseHistoryForDay = async (
  exerciseName: string,
  workoutDayName: string,
  beforeDate: Date,
  maxDaysBack: number = 365
): Promise<ExerciseHistoryEntry[]> => {
  const results: ExerciseHistoryEntry[] = [];
  if (!exerciseName.trim() || !workoutDayName.trim()) return results;

  for (let i = 1; i <= maxDaysBack; i++) {
    const checkDate = new Date(beforeDate);
    checkDate.setDate(checkDate.getDate() - i);

    const log = await loadWorkoutLog(checkDate);
    if (!log || log.isRest || !log.exercises) continue;
    if (log.name.toLowerCase() !== workoutDayName.toLowerCase()) continue;

    const match = log.exercises.find(
      ex => ex.name.toLowerCase() === exerciseName.toLowerCase() &&
            (ex.actual || ex.weight)
    );

    if (match) {
      results.push({
        date: formatDateToKey(checkDate),
        workoutName: log.name,
        target: match.target,
        actual: match.actual,
        weight: match.weight,
      });
    }
  }
  return results;
};

/**
 * Returns all workout log entries across all stored dates, newest first.
 * Used for building stats/charts.
 */
export const getAllWorkoutLogs = async (): Promise<Array<{ date: string; log: WorkoutDay }>> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const logKeys = allKeys.filter(k => k.startsWith(STORAGE_KEYS.WORKOUT_LOG_PREFIX));

    const pairs = await AsyncStorage.multiGet(logKeys);
    const results: Array<{ date: string; log: WorkoutDay }> = [];

    for (const [key, value] of pairs) {
      if (!value) continue;
      try {
        const log: WorkoutDay = JSON.parse(value);
        const date = key.replace(STORAGE_KEYS.WORKOUT_LOG_PREFIX, '');
        if (!log.isRest) results.push({ date, log });
      } catch {
        // skip malformed entries
      }
    }

    return results.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
};
