/**
 * Weight Tracking Hook
 * Manages weight entries and provides data for analytics
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { WeightEntry } from '../types';
import {
  loadWeightEntries,
  saveWeightEntry,
  deleteWeightEntry,
  getWeightForDate,
  getRecentWeightEntries,
} from '../services/weightStorage.service';

export const useWeightTracking = () => {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load all weight entries from storage
   */
  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedEntries = await loadWeightEntries();
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Failed to load weight entries:', error);
      Alert.alert('Error', 'Failed to load weight data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  /**
   * Add or update a weight entry
   * @param date - Date string in YYYY-MM-DD format
   * @param weight - Weight in lbs
   */
  const saveWeight = useCallback(async (date: string, weight: number) => {
    try {
      await saveWeightEntry(date, weight);
      await loadEntries(); // Reload to get updated list
    } catch (error) {
      console.error('Failed to save weight entry:', error);
      Alert.alert('Error', 'Failed to save weight');
    }
  }, [loadEntries]);

  /**
   * Delete a weight entry
   * @param date - Date string in YYYY-MM-DD format
   */
  const deleteWeight = useCallback(async (date: string) => {
    try {
      await deleteWeightEntry(date);
      await loadEntries(); // Reload to get updated list
    } catch (error) {
      console.error('Failed to delete weight entry:', error);
      Alert.alert('Error', 'Failed to delete weight');
    }
  }, [loadEntries]);

  /**
   * Get the most recent weight entries for sparkline
   * @param count - Number of entries to retrieve
   */
  const getRecentWeights = useCallback(async (count: number): Promise<number[]> => {
    try {
      const recentEntries = await getRecentWeightEntries(count);
      // Reverse to show oldest to newest (for sparkline left to right)
      return recentEntries.reverse().map((entry) => entry.weight);
    } catch (error) {
      console.error('Failed to get recent weights:', error);
      return [];
    }
  }, []);

  /**
   * Get latest weight value
   */
  const getLatestWeight = useCallback((): number | null => {
    if (entries.length === 0) return null;
    return entries[0].weight;
  }, [entries]);

  return {
    entries,
    isLoading,
    saveWeight,
    deleteWeight,
    getRecentWeights,
    getLatestWeight,
    refresh: loadEntries,
  };
};
