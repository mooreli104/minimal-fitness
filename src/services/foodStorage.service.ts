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

/**
 * Loads the user's macro targets
 * @returns Macro targets object or default values
 */
export const loadMacroTargets = async (): Promise<{ protein: number; carbs: number; fat: number }> => {
  const proteinStored = await getString(STORAGE_KEYS.PROTEIN_TARGET);
  const carbsStored = await getString(STORAGE_KEYS.CARBS_TARGET);
  const fatStored = await getString(STORAGE_KEYS.FAT_TARGET);

  const protein = proteinStored ? parseInt(proteinStored, 10) : DEFAULTS.PROTEIN_TARGET;
  const carbs = carbsStored ? parseInt(carbsStored, 10) : DEFAULTS.CARBS_TARGET;
  const fat = fatStored ? parseInt(fatStored, 10) : DEFAULTS.FAT_TARGET;

  return {
    protein: isNaN(protein) ? DEFAULTS.PROTEIN_TARGET : protein,
    carbs: isNaN(carbs) ? DEFAULTS.CARBS_TARGET : carbs,
    fat: isNaN(fat) ? DEFAULTS.FAT_TARGET : fat,
  };
};

/**
 * Saves the user's macro targets
 * @param protein Protein target in grams
 * @param carbs Carbs target in grams
 * @param fat Fat target in grams
 */
export const saveMacroTargets = async (protein: number, carbs: number, fat: number): Promise<void> => {
  await Promise.all([
    setString(STORAGE_KEYS.PROTEIN_TARGET, String(protein)),
    setString(STORAGE_KEYS.CARBS_TARGET, String(carbs)),
    setString(STORAGE_KEYS.FAT_TARGET, String(fat)),
  ]);
};
