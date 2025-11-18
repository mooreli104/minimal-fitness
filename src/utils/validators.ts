/**
 * Validation utilities for input data
 */

import { DailyFoodLog } from '../types';

/**
 * Validates that a string is not empty or only whitespace
 * @param value String to validate
 * @returns True if valid, false otherwise
 */
export const isValidName = (value: string): boolean => {
  return value != null && value.trim().length > 0;
};

/**
 * Validates that a number is positive
 * @param value Number to validate
 * @returns True if positive, false otherwise
 */
export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/**
 * Parses a string to an integer and validates it's positive
 * @param value String to parse
 * @returns Parsed number if valid, null otherwise
 */
export const parsePositiveInt = (value: string): number | null => {
  const parsed = parseInt(value, 10);
  return isPositiveNumber(parsed) ? parsed : null;
};

/**
 * Checks if a food log is empty (no foods in any meal)
 * @param log Daily food log object
 * @returns True if empty, false otherwise
 */
export const isFoodLogEmpty = (log: DailyFoodLog): boolean => {
  return Object.values(log).every(meal => meal.length === 0);
};

/**
 * Validates a calorie target value
 * @param value Calorie target to validate
 * @returns True if valid (positive number), false otherwise
 */
export const isValidCalorieTarget = (value: number): boolean => {
  return isPositiveNumber(value) && value <= 10000;
};
