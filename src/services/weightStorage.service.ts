/**
 * Storage service for weight tracking data
 * Handles all weight entry CRUD operations with AsyncStorage
 */

import { WeightEntry } from '../types';
import { getItem, setItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Loads all weight entries from storage
 * @returns Array of weight entries, sorted by date (newest first)
 */
export const loadWeightEntries = async (): Promise<WeightEntry[]> => {
  const entries = await getItem<WeightEntry[]>(STORAGE_KEYS.WEIGHT_ENTRIES);

  if (!entries || !Array.isArray(entries)) {
    return [];
  }

  // Sort by date descending (newest first)
  return entries.sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Saves a new weight entry or updates existing entry for the same date
 * @param date - Date string in YYYY-MM-DD format
 * @param weight - Weight in lbs
 */
export const saveWeightEntry = async (date: string, weight: number): Promise<void> => {
  const entries = await loadWeightEntries();

  // Check if entry for this date already exists
  const existingIndex = entries.findIndex((entry) => entry.date === date);

  const newEntry: WeightEntry = {
    date,
    weight,
    timestamp: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    // Update existing entry
    entries[existingIndex] = newEntry;
  } else {
    // Add new entry
    entries.push(newEntry);
  }

  // Sort and save
  const sortedEntries = entries.sort((a, b) => b.date.localeCompare(a.date));
  await setItem(STORAGE_KEYS.WEIGHT_ENTRIES, sortedEntries);
};

/**
 * Deletes a weight entry for a specific date
 * @param date - Date string in YYYY-MM-DD format
 */
export const deleteWeightEntry = async (date: string): Promise<void> => {
  const entries = await loadWeightEntries();
  const filtered = entries.filter((entry) => entry.date !== date);
  await setItem(STORAGE_KEYS.WEIGHT_ENTRIES, filtered);
};

/**
 * Gets weight entry for a specific date
 * @param date - Date string in YYYY-MM-DD format
 * @returns Weight entry or null if not found
 */
export const getWeightForDate = async (date: string): Promise<WeightEntry | null> => {
  const entries = await loadWeightEntries();
  return entries.find((entry) => entry.date === date) || null;
};

/**
 * Gets the most recent N weight entries
 * @param count - Number of entries to retrieve
 * @returns Array of weight entries (newest first)
 */
export const getRecentWeightEntries = async (count: number): Promise<WeightEntry[]> => {
  const entries = await loadWeightEntries();
  return entries.slice(0, count);
};
