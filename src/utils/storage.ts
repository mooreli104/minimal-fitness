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
 * Utility to load data with automatic migration and save-back
 * @param key Storage key
 * @param migrateFn Migration function to apply
 * @returns Migrated data or null
 */
export const getItemWithMigration = async <T>(
  key: string,
  migrateFn: (data: T) => T
): Promise<T | null> => {
  const data = await getItem<T>(key);
  if (!data) return null;

  const migrated = migrateFn(data);

  if (JSON.stringify(data) !== JSON.stringify(migrated)) {
    await setItem(key, migrated);
  }

  return migrated;
};

/**
 * Utility to load array data with automatic migration and save-back
 * @param key Storage key
 * @param migrateFn Migration function to apply to each item
 * @returns Migrated array or empty array
 */
export const getArrayWithMigration = async <T>(
  key: string,
  migrateFn: (item: T) => T
): Promise<T[]> => {
  const data = await getItem<T[]>(key);
  if (!data) return [];

  const migrated = data.map(migrateFn);

  if (JSON.stringify(data) !== JSON.stringify(migrated)) {
    await setItem(key, migrated);
  }

  return migrated;
};
