/**
 * Centralized AsyncStorage wrapper with error handling
 * Provides type-safe storage operations and consistent error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Error thrown when storage operations fail
 */
export class StorageError extends Error {
  constructor(operation: string, key: string, cause?: unknown) {
    super(`Storage ${operation} failed for key: ${key}`);
    this.name = 'StorageError';
    this.cause = cause;
  }
}

/**
 * Retrieves an item from AsyncStorage and parses it as JSON
 * @param key Storage key
 * @returns Parsed object or null if not found
 * @throws StorageError if operation fails
 */
export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    throw new StorageError('read', key, error);
  }
};

/**
 * Stores an item in AsyncStorage as JSON
 * @param key Storage key
 * @param value Value to store
 * @throws StorageError if operation fails
 */
export const setItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new StorageError('write', key, error);
  }
};

/**
 * Removes an item from AsyncStorage
 * @param key Storage key
 * @throws StorageError if operation fails
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    throw new StorageError('delete', key, error);
  }
};

/**
 * Retrieves a simple string value from AsyncStorage
 * @param key Storage key
 * @returns String value or null if not found
 * @throws StorageError if operation fails
 */
export const getString = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    throw new StorageError('read', key, error);
  }
};

/**
 * Stores a simple string value in AsyncStorage
 * @param key Storage key
 * @param value String value to store
 * @throws StorageError if operation fails
 */
export const setString = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    throw new StorageError('write', key, error);
  }
};

/**
 * Retrieves multiple items from AsyncStorage
 * @param keys Array of storage keys
 * @returns Map of key-value pairs
 * @throws StorageError if operation fails
 */
export const multiGet = async (keys: string[]): Promise<Map<string, any>> => {
  try {
    const items = await AsyncStorage.multiGet(keys);
    const result = new Map();

    items.forEach(([key, value]) => {
      if (value) {
        try {
          result.set(key, JSON.parse(value));
        } catch {
          result.set(key, value);
        }
      }
    });

    return result;
  } catch (error) {
    throw new StorageError('multiGet', keys.join(', '), error);
  }
};

/**
 * Checks if a key exists in AsyncStorage
 * @param key Storage key
 * @returns True if exists, false otherwise
 */
export const hasItem = async (key: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    throw new StorageError('check', key, error);
  }
};

/**
 * Clears all AsyncStorage data (use with caution)
 * @throws StorageError if operation fails
 */
export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    throw new StorageError('clear', 'all', error);
  }
};
