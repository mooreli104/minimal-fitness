/**
 * Utility functions for generating unique identifiers
 */

/**
 * Generates a unique numeric ID based on current timestamp
 * @returns Unique numeric ID
 */
export const generateId = (): number => {
  return Date.now();
};

/**
 * Generates a unique ID with additional randomness
 * Useful when multiple IDs might be generated in the same millisecond
 * @returns Unique number with random component
 */
export const generateUniqueId = (): number => {
  return Date.now() + Math.random();
};

/**
 * Generates multiple unique IDs in sequence
 * @param count Number of IDs to generate
 * @returns Array of unique IDs
 */
export const generateSequentialIds = (count: number): number[] => {
  const baseId = Date.now();
  return Array.from({ length: count }, (_, index) => baseId + index);
};
