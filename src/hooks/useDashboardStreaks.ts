/**
 * Dashboard Streaks Hook
 * Calculates workout and food logging streaks
 */

import { useState, useEffect, useCallback } from 'react';
import { loadWorkoutLog } from '../services/workoutStorage.service';
import { loadFoodLog } from '../services/foodStorage.service';
import { getDaysAgo, formatDateToKey } from '../utils/formatters';
import { isWorkoutCompleted, hasFoodEntries } from '../utils/analytics';

interface StreakData {
  workoutStreak: number;
  foodStreak: number;
}

export const useDashboardStreaks = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    workoutStreak: 0,
    foodStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStreaks = useCallback(async () => {
    setIsLoading(true);

    try {
      // Load last 90 days of data
      const daysToCheck = 90;
      const today = new Date();
      const dates: Date[] = [];

      // Generate dates from yesterday backwards (exclude today)
      for (let i = 1; i <= daysToCheck; i++) {
        dates.push(getDaysAgo(i, today));
      }

      // Load all workout and food logs in parallel
      const [workoutLogs, foodLogs] = await Promise.all([
        Promise.all(dates.map((date) => loadWorkoutLog(date))),
        Promise.all(dates.map((date) => loadFoodLog(date))),
      ]);

      // Calculate workout streak (from yesterday backwards)
      let workoutStreak = 0;
      for (let i = 0; i < workoutLogs.length; i++) {
        const workout = workoutLogs[i];
        if (workout && isWorkoutCompleted(workout)) {
          workoutStreak++;
        } else {
          break;
        }
      }

      // Calculate food logging streak (from yesterday backwards)
      let foodStreak = 0;
      for (let i = 0; i < foodLogs.length; i++) {
        const foodLog = foodLogs[i];
        if (hasFoodEntries(foodLog)) {
          foodStreak++;
        } else {
          break;
        }
      }

      setStreakData({
        workoutStreak,
        foodStreak,
      });
    } catch (error) {
      console.error('Failed to calculate streaks:', error);
      setStreakData({
        workoutStreak: 0,
        foodStreak: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateStreaks();
  }, [calculateStreaks]);

  return {
    ...streakData,
    isLoading,
    refresh: calculateStreaks,
  };
};
