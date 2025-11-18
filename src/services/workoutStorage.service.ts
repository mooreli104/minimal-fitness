/**
 * Storage service for workout-related data
 * Handles all workout CRUD operations with AsyncStorage
 */

import { WorkoutDay, WorkoutTemplate } from '../types';
import { getItem, setItem, removeItem } from '../utils/storage';
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
  const log = await getItem<WorkoutDay>(key);

  if (!log) return null;

  // Migrate old format if needed
  const migrated = migrateWorkoutDay(log);

  // Save back if migration occurred
  if (JSON.stringify(log) !== JSON.stringify(migrated)) {
    await setItem(key, migrated);
  }

  return migrated;
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
  const program = await getItem<WorkoutDay[]>(STORAGE_KEYS.WORKOUT_PROGRAM);

  if (!program) return [];

  // Migrate old format if needed
  const migrated = program.map(migrateWorkoutDay);

  // Save back if migration occurred
  if (JSON.stringify(program) !== JSON.stringify(migrated)) {
    await setItem(STORAGE_KEYS.WORKOUT_PROGRAM, migrated);
  }

  return migrated;
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
  const templates = await getItem<WorkoutTemplate[]>(STORAGE_KEYS.WORKOUT_TEMPLATES);

  if (!templates) return [];

  // Migrate old format if needed
  const migrated = templates.map(migrateWorkoutTemplate);

  // Save back if migration occurred
  if (JSON.stringify(templates) !== JSON.stringify(migrated)) {
    await setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, migrated);
  }

  return migrated;
};

/**
 * Saves workout templates
 * @param templates Array of workout templates
 */
export const saveWorkoutTemplates = async (templates: WorkoutTemplate[]): Promise<void> => {
  await setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, templates);
};
