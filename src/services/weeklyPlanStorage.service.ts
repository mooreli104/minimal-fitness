/**
 * Storage service for weekly plan data
 * Handles saving and loading the weekly workout plan
 */

import { WeeklyPlan } from '../types';
import { getItem, setItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Loads the weekly workout plan
 * @returns WeeklyPlan object mapping days to workout IDs
 */
export const loadWeeklyPlan = async (): Promise<WeeklyPlan> => {
  const plan = await getItem<WeeklyPlan>(STORAGE_KEYS.WEEKLY_PLAN);

  if (!plan) {
    return {
      Sunday: null,
      Monday: null,
      Tuesday: null,
      Wednesday: null,
      Thursday: null,
      Friday: null,
      Saturday: null,
    };
  }

  return plan;
};

/**
 * Saves the weekly workout plan
 * @param plan WeeklyPlan object to save
 */
export const saveWeeklyPlan = async (plan: WeeklyPlan): Promise<void> => {
  await setItem(STORAGE_KEYS.WEEKLY_PLAN, plan);
};
