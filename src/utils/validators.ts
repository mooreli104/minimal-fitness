/**
 * Validation utilities for input data
 */

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
 * Validates a calorie target value
 * @param value Calorie target to validate
 * @returns True if valid (positive number), false otherwise
 */
export const isValidCalorieTarget = (value: number): boolean => {
  return isPositiveNumber(value) && value <= 10000;
};
