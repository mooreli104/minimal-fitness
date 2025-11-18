import { useState, useCallback } from 'react';
import { FoodEntry, ChartDataPoint } from '../types';
import { loadFoodLog } from '../services/foodStorage.service';
import { getDateOffset, getDayOfWeek, formatTimestamp } from '../utils/formatters';
import { calculateTotalCalories, getTopCalorieFoods, sortByTimestamp } from '../utils/calculations';
import { UI } from '../utils/constants';

/**
 * Dashboard data structure
 */
export interface DashboardData {
  chartData: {
    today: ChartDataPoint[];
    week: ChartDataPoint[];
    month: ChartDataPoint[];
  };
  displayedEntries: FoodEntry[];
  totalCalories: number;
}

/**
 * Hook for loading and managing dashboard data
 * Fetches food logs and calculates chart data and top foods
 */
export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    chartData: { today: [], week: [], month: [] },
    displayedEntries: [],
    totalCalories: 0,
  });

  /**
   * Loads dashboard data for a specific date
   * Includes weekly chart data and top foods for the selected day
   */
  const loadDashboardData = useCallback(async (selectedDate: Date) => {
    const weeklyData: ChartDataPoint[] = [];
    let dayCalories = 0;
    let allDayEntries: FoodEntry[] = [];

    // Load last 7 days of data
    for (let i = UI.DAYS_IN_WEEK - 1; i >= 0; i--) {
      const date = getDateOffset(selectedDate, -i);

      try {
        const log = await loadFoodLog(date);
        const allEntries = Object.values(log).flat();
        const dailyTotal = calculateTotalCalories(allEntries);

        if (i === 0) {
          dayCalories = dailyTotal;
          allDayEntries = allEntries;
        }

        weeklyData.push({
          label: getDayOfWeek(date),
          value: dailyTotal,
        });
      } catch (error) {
        console.error('Failed to load log for date:', date, error);
        weeklyData.push({
          label: getDayOfWeek(date),
          value: 0,
        });
      }
    }

    // Generate cumulative calorie chart for today
    const dayChartData: ChartDataPoint[] = [];
    if (allDayEntries.length > 0) {
      const sortedEntries = sortByTimestamp(allDayEntries);
      let cumulativeCalories = 0;

      for (const entry of sortedEntries) {
        cumulativeCalories += entry.calories;
        dayChartData.push({
          label: formatTimestamp(entry.timestamp),
          value: cumulativeCalories,
        });
      }

      // Ensure at least 2 points for chart rendering
      if (dayChartData.length === 1) {
        dayChartData.push({ ...dayChartData[0] });
      }
    }

    // Get top calorie foods
    const topEntries = getTopCalorieFoods(allDayEntries, UI.TOP_FOODS_LIMIT);

    setData({
      chartData: {
        today: dayChartData,
        week: weeklyData,
        month: [], // Placeholder for future month view
      },
      displayedEntries: topEntries,
      totalCalories: dayCalories,
    });
  }, []);

  return {
    data,
    loadDashboardData,
  };
};
