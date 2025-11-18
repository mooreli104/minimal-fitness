/**
 * Calculation utilities for nutrition and fitness metrics
 */

import { DailyFoodLog, FoodEntry } from '../types';

/**
 * Nutrition totals from a food log
 */
export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Calculates total nutrition values from a daily food log
 * @param log Daily food log
 * @returns Totals for calories, protein, carbs, and fat
 */
export const calculateNutritionTotals = (log: DailyFoodLog): NutritionTotals => {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  Object.values(log).forEach((meal) => {
    meal.forEach((food) => {
      calories += food.calories;
      protein += food.protein ?? 0;
      carbs += food.carbs ?? 0;
      fat += food.fat ?? 0;
    });
  });

  return { calories, protein, carbs, fat };
};

/**
 * Calculates total calories from a list of food entries
 * @param entries Array of food entries
 * @returns Total calories
 */
export const calculateTotalCalories = (entries: FoodEntry[]): number => {
  return entries.reduce((sum, entry) => sum + entry.calories, 0);
};

/**
 * Sorts food entries by calories in descending order
 * @param entries Array of food entries
 * @param limit Optional limit on number of results
 * @returns Sorted array of top calorie foods
 */
export const getTopCalorieFoods = (entries: FoodEntry[], limit?: number): FoodEntry[] => {
  const sorted = [...entries].sort((a, b) => b.calories - a.calories);
  return limit ? sorted.slice(0, limit) : sorted;
};

/**
 * Sorts food entries by timestamp in ascending order
 * @param entries Array of food entries
 * @returns Chronologically sorted array
 */
export const sortByTimestamp = (entries: FoodEntry[]): FoodEntry[] => {
  return [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};
