import { useState, useEffect, useCallback } from 'react';
import {
  loadWeightEntries,
  saveWeightEntry,
  getLatestWeightEntry,
  WeightEntry,
} from '../services/weightTracking.service';

export const useBodyWeight = () => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [latestWeight, setLatestWeight] = useState<WeightEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entries, latest] = await Promise.all([
        loadWeightEntries(),
        getLatestWeightEntry(),
      ]);
      setWeightEntries(entries);
      setLatestWeight(latest);
    } catch (error) {
      console.error('Error loading weight data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const logWeight = useCallback(async (weight: number) => {
    try {
      await saveWeightEntry(weight);
      await loadData();
    } catch (error) {
      console.error('Error logging weight:', error);
      throw error;
    }
  }, [loadData]);

  return {
    weightEntries,
    latestWeight,
    isLoading,
    logWeight,
    refreshData: loadData,
  };
};
