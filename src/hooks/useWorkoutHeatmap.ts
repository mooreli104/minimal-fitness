/**
 * Workout Heatmap Hook
 * Loads workout data for heatmap calendar visualization
 */

import { useState, useEffect } from 'react';
import { loadWorkoutLog } from '../services/workoutStorage.service';
import { getDaysAgo } from '../utils/formatters';

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number; // Number of exercises logged
  isWorkout: boolean; // Whether user worked out this day
}

interface UseWorkoutHeatmapResult {
  heatmapData: HeatmapDay[];
  isLoading: boolean;
  totalWorkoutDays: number;
  currentStreak: number;
  longestStreak: number;
}

export const useWorkoutHeatmap = (daysToLoad: number = 182): UseWorkoutHeatmapResult => {
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalWorkoutDays, setTotalWorkoutDays] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const loadHeatmapData = async () => {
      setIsLoading(true);

      try {
        const today = new Date();
        const dates: Date[] = [];

        // Generate date range
        for (let i = daysToLoad - 1; i >= 0; i--) {
          dates.push(getDaysAgo(i, today));
        }

        // Load all workout logs in parallel
        const workoutLogs = await Promise.all(dates.map((date) => loadWorkoutLog(date)));

        // Build heatmap data
        const heatmap: HeatmapDay[] = dates.map((date, index) => {
          const workout = workoutLogs[index];
          const dateKey = date.toISOString().split('T')[0];

          if (!workout || workout.isRest) {
            return {
              date: dateKey,
              count: 0,
              isWorkout: false,
            };
          }

          const exerciseCount = workout.exercises.filter(
            (ex) => ex.actual && ex.actual.trim() !== ''
          ).length;

          return {
            date: dateKey,
            count: exerciseCount,
            isWorkout: exerciseCount > 0,
          };
        });

        // Calculate stats
        const workoutDaysCount = heatmap.filter((d) => d.isWorkout).length;

        // Calculate current streak (from most recent backwards)
        let streak = 0;
        for (let i = heatmap.length - 1; i >= 0; i--) {
          if (heatmap[i].isWorkout) {
            streak++;
          } else {
            break;
          }
        }

        // Calculate longest streak
        let maxStreak = 0;
        let tempStreak = 0;
        heatmap.forEach((day) => {
          if (day.isWorkout) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        });

        setHeatmapData(heatmap);
        setTotalWorkoutDays(workoutDaysCount);
        setCurrentStreak(streak);
        setLongestStreak(maxStreak);
      } catch (error) {
        console.error('Failed to load workout heatmap data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHeatmapData();
  }, [daysToLoad]);

  return {
    heatmapData,
    isLoading,
    totalWorkoutDays,
    currentStreak,
    longestStreak,
  };
};
