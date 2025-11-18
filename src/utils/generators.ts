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
