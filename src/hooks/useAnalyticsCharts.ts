/**
 * Analytics Charts Hook
 * Provides time-series data for analytics charts with configurable time ranges
 */

import { useState, useEffect, useCallback } from 'react';
import { loadWorkoutLog } from '../services/workoutStorage.service';
import { loadFoodLog } from '../services/foodStorage.service';
import { getRecentWeightEntries } from '../services/weightStorage.service';
import { calculateNutritionTotals } from '../utils/calculations';
import { getDaysAgo, formatDateToKey } from '../utils/formatters';
import {
  calculateWorkoutVolume,
  isWorkoutCompleted,
  hasFoodEntries,
} from '../utils/analytics';

export type TimeRange = 'day' | 'week' | 'month' | '3months' | 'all';

export interface DailyDataPoint {
  date: string; // ISO date string
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  hasWorkout: boolean;
  hasFood: boolean;
  volume: number;
}

export interface AggregatedDataPoint {
  date: string; // Start date of the period
  label: string; // Display label (e.g., "Week 1", "Jan 1-7")
  calories: number; // Average
  protein: number; // Average
  carbs: number; // Average
  fat: number; // Average
  volume: number; // Total
  daysWithWorkout: number;
  daysWithFood: number;
}

export interface AnalyticsChartsData {
  timeRange: TimeRange;
  dailyData: DailyDataPoint[];
  aggregatedData: AggregatedDataPoint[]; // Aggregated for charts
  workoutsCount: number;
  totalVolume: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  currentStreak: number;
  isLoading: boolean;
}

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  day: 2, // Show today and yesterday for chart compatibility
  week: 7,
  month: 30,
  '3months': 90,
  all: 365, // Cap at 1 year for performance
};

// Aggregation periods for each time range
const AGGREGATION_DAYS: Record<TimeRange, number> = {
  day: 1, // Show hourly or daily
  week: 1, // Show daily
  month: 7, // Show weekly averages
  '3months': 7, // Show weekly averages
  all: 30, // Show monthly averages
};

/**
 * Aggregate daily data into weekly or monthly periods
 */
const aggregateData = (
  dailyData: DailyDataPoint[],
  timeRange: TimeRange
): AggregatedDataPoint[] => {
  const periodDays = AGGREGATION_DAYS[timeRange];

  if (periodDays === 1) {
    // No aggregation needed for day/week views
    return dailyData.map((d) => ({
      date: d.date,
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calories: d.calories,
      protein: d.protein,
      carbs: d.carbs,
      fat: d.fat,
      volume: d.volume,
      daysWithWorkout: d.hasWorkout ? 1 : 0,
      daysWithFood: d.hasFood ? 1 : 0,
    }));
  }

  const aggregated: AggregatedDataPoint[] = [];

  for (let i = 0; i < dailyData.length; i += periodDays) {
    const chunk = dailyData.slice(i, i + periodDays);
    if (chunk.length === 0) continue;

    const startDate = chunk[0].date;
    const endDate = chunk[chunk.length - 1].date;

    // Calculate averages
    const daysWithFood = chunk.filter((d) => d.hasFood).length;

    // Skip periods with no data to avoid cluttering charts with empty points
    if (daysWithFood === 0) continue;

    const totalCalories = chunk.reduce((sum, d) => sum + d.calories, 0);
    const totalProtein = chunk.reduce((sum, d) => sum + d.protein, 0);
    const totalCarbs = chunk.reduce((sum, d) => sum + d.carbs, 0);
    const totalFat = chunk.reduce((sum, d) => sum + d.fat, 0);
    const totalVolume = chunk.reduce((sum, d) => sum + d.volume, 0);
    const daysWithWorkout = chunk.filter((d) => d.hasWorkout).length;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const label =
      periodDays === 7
        ? `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : `${start.toLocaleDateString('en-US', { month: 'short' })}`;

    aggregated.push({
      date: startDate,
      label,
      calories: Math.round(totalCalories / daysWithFood),
      protein: Math.round(totalProtein / daysWithFood),
      carbs: Math.round(totalCarbs / daysWithFood),
      fat: Math.round(totalFat / daysWithFood),
      volume: totalVolume,
      daysWithWorkout,
      daysWithFood,
    });
  }

  // If aggregation resulted in too few data points, fall back to daily view
  if (aggregated.length < 2) {
    const daysWithData = dailyData.filter((d) => d.hasFood);
    return daysWithData.map((d) => ({
      date: d.date,
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calories: d.calories,
      protein: d.protein,
      carbs: d.carbs,
      fat: d.fat,
      volume: d.volume,
      daysWithWorkout: d.hasWorkout ? 1 : 0,
      daysWithFood: d.hasFood ? 1 : 0,
    }));
  }

  return aggregated;
};

export const useAnalyticsCharts = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [data, setData] = useState<AnalyticsChartsData>({
    timeRange: 'week',
    dailyData: [],
    aggregatedData: [],
    workoutsCount: 0,
    totalVolume: 0,
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFat: 0,
    currentStreak: 0,
    isLoading: true,
  });

  const calculateAnalytics = useCallback(
    async (range: TimeRange) => {
      // Only set loading state on initial load to prevent screen refresh
      if (isInitialLoad) {
        setData((prev) => ({ ...prev, isLoading: true }));
      }

      try {
        const daysToLoad = TIME_RANGE_DAYS[range];
        const today = new Date();

        // Generate dates for the range
        const dates: Date[] = [];
        for (let i = daysToLoad - 1; i >= 0; i--) {
          dates.push(getDaysAgo(i, today));
        }

        // Load all data in parallel
        const [workoutLogs, foodLogs] = await Promise.all([
          Promise.all(dates.map((date) => loadWorkoutLog(date))),
          Promise.all(dates.map((date) => loadFoodLog(date))),
        ]);

        // Build daily data points
        const dailyData: DailyDataPoint[] = dates.map((date, index) => {
          const workout = workoutLogs[index];
          const foodLog = foodLogs[index];

          const hasWorkout = workout ? isWorkoutCompleted(workout) : false;
          const hasFood = hasFoodEntries(foodLog);
          // Calculate volume for any workout, even if not fully completed
          const volume = workout ? calculateWorkoutVolume(workout) : 0;

          let calories = 0;
          let protein = 0;
          let carbs = 0;
          let fat = 0;

          if (hasFood) {
            const nutrition = calculateNutritionTotals(foodLog);
            calories = nutrition.calories;
            protein = nutrition.protein;
            carbs = nutrition.carbs;
            fat = nutrition.fat;
          }

          return {
            date: formatDateToKey(date),
            calories,
            protein,
            carbs,
            fat,
            hasWorkout,
            hasFood,
            volume,
          };
        });

        // Calculate aggregates
        const workoutsCount = dailyData.filter((d) => d.hasWorkout).length;
        const totalVolume = dailyData.reduce((sum, d) => sum + d.volume, 0);

        const daysWithFood = dailyData.filter((d) => d.hasFood).length;
        const avgCalories =
          daysWithFood > 0
            ? Math.round(dailyData.reduce((sum, d) => sum + d.calories, 0) / daysWithFood)
            : 0;
        const avgProtein =
          daysWithFood > 0
            ? Math.round(dailyData.reduce((sum, d) => sum + d.protein, 0) / daysWithFood)
            : 0;
        const avgCarbs =
          daysWithFood > 0
            ? Math.round(dailyData.reduce((sum, d) => sum + d.carbs, 0) / daysWithFood)
            : 0;
        const avgFat =
          daysWithFood > 0
            ? Math.round(dailyData.reduce((sum, d) => sum + d.fat, 0) / daysWithFood)
            : 0;

        // Calculate current streak (from yesterday backwards, excluding today)
        let currentStreak = 0;
        // Start from index length - 2 to skip today (which is at length - 1)
        for (let i = dailyData.length - 2; i >= 0; i--) {
          const day = dailyData[i];
          if (day.hasWorkout || day.hasFood) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Generate aggregated data for charts
        const aggregatedData = aggregateData(dailyData, range);

        setData({
          timeRange: range,
          dailyData,
          aggregatedData,
          workoutsCount,
          totalVolume: Math.round(totalVolume),
          avgCalories,
          avgProtein,
          avgCarbs,
          avgFat,
          currentStreak,
          isLoading: false,
        });
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } catch (error) {
        console.error('Analytics charts calculation error:', error);
        setData((prev) => ({ ...prev, isLoading: false }));
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    },
    [isInitialLoad]
  );

  useEffect(() => {
    calculateAnalytics(timeRange);
  }, [timeRange, calculateAnalytics]);

  const changeTimeRange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  return {
    ...data,
    changeTimeRange,
    refresh: () => calculateAnalytics(timeRange),
  };
};
