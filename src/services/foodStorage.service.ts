/**
 * Storage service for food log data
 * Handles all food log CRUD operations with AsyncStorage
 */

import { DailyFoodLog } from '../types';
import { getItem, setItem, getString, setString } from '../utils/storage';
import { STORAGE_KEYS, DEFAULTS } from '../utils/constants';
import { formatDateToKey } from '../utils/formatters';
import { normalizeFoodLog } from '../utils/migrations';

/**
 * Generates storage key for a food log by date
 */
const getFoodLogKey = (date: Date): string => {
  return `${STORAGE_KEYS.FOOD_LOG_PREFIX}${formatDateToKey(date)}`;
};

/**
 * Loads food log for a specific date
 * @param date Date to load food log for
 * @returns Daily food log with all meals
 */
export const loadFoodLog = async (date: Date): Promise<DailyFoodLog> => {
  const key = getFoodLogKey(date);
  const log = await getItem<Partial<DailyFoodLog>>(key);

  if (!log) {
    return {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snacks: [],
    };
  }

  // Normalize and ensure timestamps
  return normalizeFoodLog(log, date);
};

/**
 * Saves food log for a specific date
 * @param date Date to save food log for
 * @param log Daily food log to save
 */
export const saveFoodLog = async (date: Date, log: DailyFoodLog): Promise<void> => {
  const key = getFoodLogKey(date);
  await setItem(key, log);
};

/**
 * Loads the user's calorie target
 * @returns Calorie target or default value
 */
export const loadCalorieTarget = async (): Promise<number> => {
  const stored = await getString(STORAGE_KEYS.CALORIE_TARGET);

  if (!stored) return DEFAULTS.CALORIE_TARGET;

  const parsed = parseInt(stored, 10);
  return isNaN(parsed) ? DEFAULTS.CALORIE_TARGET : parsed;
};

/**
 * Saves the user's calorie target
 * @param target Calorie target to save
 */
export const saveCalorieTarget = async (target: number): Promise<void> => {
  await setString(STORAGE_KEYS.CALORIE_TARGET, String(target));
};
