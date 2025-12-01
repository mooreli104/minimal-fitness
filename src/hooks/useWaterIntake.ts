/**
 * Water Intake Hook
 * Manages daily water intake tracking with automatic daily reset
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDateToKey } from '../utils/formatters';

const STORAGE_KEY = '@water_intake';
const DAILY_GOAL = 8; // glasses

interface WaterData {
  date: string;
  glasses: number;
}

export const useWaterIntake = () => {
  const [glasses, setGlasses] = useState(0);
  const [goal] = useState(DAILY_GOAL);
  const [isLoading, setIsLoading] = useState(true);

  // Get today's date key
  const getTodayKey = useCallback((): string => {
    return formatDateToKey(new Date()); // YYYY-MM-DD
  }, []);

  // Load water data
  const loadWaterData = useCallback(async () => {
    try {
      const todayKey = getTodayKey();
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedData) {
        const waterData: WaterData = JSON.parse(storedData);

        // Check if it's the same day
        if (waterData.date === todayKey) {
          setGlasses(waterData.glasses);
        } else {
          // New day - reset
          setGlasses(0);
          await saveWaterData(0);
        }
      } else {
        setGlasses(0);
      }
    } catch (error) {
      console.error('Failed to load water data:', error);
      setGlasses(0);
    } finally {
      setIsLoading(false);
    }
  }, [getTodayKey]);

  // Save water data
  const saveWaterData = useCallback(
    async (count: number) => {
      try {
        const todayKey = getTodayKey();
        const waterData: WaterData = {
          date: todayKey,
          glasses: count,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(waterData));
      } catch (error) {
        console.error('Failed to save water data:', error);
      }
    },
    [getTodayKey]
  );

  // Increment glasses
  const increment = useCallback(() => {
    setGlasses((prev) => {
      const newCount = prev + 1;
      saveWaterData(newCount);
      return newCount;
    });
  }, [saveWaterData]);

  // Decrement glasses
  const decrement = useCallback(() => {
    setGlasses((prev) => {
      const newCount = Math.max(0, prev - 1);
      saveWaterData(newCount);
      return newCount;
    });
  }, [saveWaterData]);

  // Load on mount
  useEffect(() => {
    loadWaterData();
  }, [loadWaterData]);

  return {
    glasses,
    goal,
    increment,
    decrement,
    isLoading,
  };
};
