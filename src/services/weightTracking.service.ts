/**
 * Storage service for body weight tracking
 * Handles CRUD operations for weight entries
 */

import { getItem, setItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

export interface WeightEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  weight: number; // in user's preferred unit (lbs or kg)
  timestamp: number; // Unix timestamp
}

/**
 * Loads all weight entries
 */
export const loadWeightEntries = async (): Promise<WeightEntry[]> => {
  const entries = await getItem<WeightEntry[]>(STORAGE_KEYS.WEIGHT_ENTRIES);
  return entries || [];
};

/**
 * Saves a new weight entry
 */
export const saveWeightEntry = async (weight: number): Promise<void> => {
  const entries = await loadWeightEntries();
  const date = new Date().toISOString().split('T')[0];
  const timestamp = Date.now();

  const newEntry: WeightEntry = { date, weight, timestamp };

  // Check if there's already an entry for today
  const existingIndex = entries.findIndex((e) => e.date === date);

  if (existingIndex !== -1) {
    // Update existing entry
    entries[existingIndex] = newEntry;
  } else {
    // Add new entry
    entries.push(newEntry);
  }

  // Sort by date (newest first)
  entries.sort((a, b) => b.timestamp - a.timestamp);

  await setItem(STORAGE_KEYS.WEIGHT_ENTRIES, entries);
};

/**
 * Gets the most recent weight entry
 */
export const getLatestWeightEntry = async (): Promise<WeightEntry | null> => {
  const entries = await loadWeightEntries();
  return entries.length > 0 ? entries[0] : null;
};

/**
 * Gets weight entries within a date range
 */
export const getWeightEntriesInRange = async (
  startDate: Date,
  endDate: Date
): Promise<WeightEntry[]> => {
  const entries = await loadWeightEntries();
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  return entries.filter((entry) => entry.date >= start && entry.date <= end);
};
