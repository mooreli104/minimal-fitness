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
 * Finds the most recent logged data for each unique exercise across all past workouts.
 * Returns an Exercise[] where each entry is the last time that exercise had actual/weight data.
 * This searches across ALL workout types, not just workouts with the same name.
 */
export const findLastLoggedExercises = async (
  beforeDate: Date,
): Promise<Exercise[]> => {
  const beforeKey = formatDateToKey(beforeDate);
  const allLogs = await getAllWorkoutLogs();
  const found = new Map<string, Exercise>();

  for (const { date, log } of allLogs) {
    if (date >= beforeKey) continue;
    for (const ex of log.exercises ?? []) {
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
 * @returns Array of exercise history entries, newest first
 */
export const findExerciseHistory = async (
  exerciseName: string,
  beforeDate: Date,
): Promise<ExerciseHistoryEntry[]> => {
  if (!exerciseName.trim()) return [];
  const nameLower = exerciseName.trim().toLowerCase();
  const beforeKey = formatDateToKey(beforeDate);

  const allLogs = await getAllWorkoutLogs();
  const results: ExerciseHistoryEntry[] = [];

  for (const { date, log } of allLogs) {
    if (date >= beforeKey) continue;
    const match = log.exercises?.find(
      ex => ex.name.trim().toLowerCase() === nameLower && (ex.actual || ex.weight)
    );
    if (match) {
      results.push({
        date,
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
 * Finds all occurrences of a specific exercise for a specific workout day name.
 * Falls back to searching across all workout days if no results found for the specific day.
 * @param exerciseName Name of the exercise to search for
 * @param workoutDayName Name of the workout day to filter by (e.g. "Upper A")
 * @param beforeDate Search for exercises before this date
 * @returns Array of exercise history entries, newest first
 */
export const findExerciseHistoryForDay = async (
  exerciseName: string,
  workoutDayName: string,
  beforeDate: Date,
): Promise<ExerciseHistoryEntry[]> => {
  if (!exerciseName.trim() || !workoutDayName.trim()) return [];
  const nameLower = exerciseName.trim().toLowerCase();
  const dayLower = workoutDayName.trim().toLowerCase();
  const beforeKey = formatDateToKey(beforeDate);

  const allLogs = await getAllWorkoutLogs();
  const dayResults: ExerciseHistoryEntry[] = [];
  const allResults: ExerciseHistoryEntry[] = [];

  for (const { date, log } of allLogs) {
    if (date >= beforeKey) continue;
    const match = log.exercises?.find(
      ex => ex.name.trim().toLowerCase() === nameLower && (ex.actual || ex.weight)
    );
    if (match) {
      const entry: ExerciseHistoryEntry = {
        date,
        workoutName: log.name,
        target: match.target,
        actual: match.actual,
        weight: match.weight,
      };
      allResults.push(entry);
      if (log.name && log.name.trim().toLowerCase() === dayLower) {
        dayResults.push(entry);
      }
    }
  }
  // Fall back to all days if no results for the specific day
  return dayResults.length > 0 ? dayResults : allResults;
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
        const raw: WorkoutDay = JSON.parse(value);
        const log = migrateWorkoutDay(raw);
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

export const deleteExerciseFromAllLogs = async (exerciseName: string): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const logKeys = allKeys.filter(k => k.startsWith(STORAGE_KEYS.WORKOUT_LOG_PREFIX));
    const pairs = await AsyncStorage.multiGet(logKeys);
    const nameLower = exerciseName.trim().toLowerCase();

    for (const [key, value] of pairs) {
      if (!value) continue;
      try {
        const log: WorkoutDay = JSON.parse(value);
        const hadExercise = log.exercises.some(ex => ex.name.trim().toLowerCase() === nameLower);
        if (hadExercise) {
          log.exercises = log.exercises.filter(ex => ex.name.trim().toLowerCase() !== nameLower);
          await AsyncStorage.setItem(key, JSON.stringify(log));
        }
      } catch {
        // skip malformed entries
      }
    }
  } catch (error) {
    // Silent failure - exercise deletion is non-critical
  }
};
