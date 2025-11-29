import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { DailyFoodLog, FoodEntry, MealCategory } from '../types';
import { generateUniqueId } from '../utils/generators';
import { isValidCalorieTarget, parsePositiveInt } from '../utils/validators';
import { calculateNutritionTotals } from '../utils/calculations';
import { getYesterday } from '../utils/formatters';
import {
  loadFoodLog,
  saveFoodLog as saveFoodLogService,
  loadCalorieTarget,
  saveCalorieTarget as saveCalorieTargetService,
  loadMacroTargets,
  saveMacroTargets,
} from '../services/foodStorage.service';

/**
 * Hook for managing food logs and calorie targets
 * Handles all food logging state and AsyncStorage operations
 */
export const useFoodLog = (date: Date, mealCategories: string[]) => {
  // Initialize log with empty arrays for all meal categories
  const createEmptyLog = useCallback((): DailyFoodLog => {
    const emptyLog: DailyFoodLog = {};
    mealCategories.forEach(category => {
      emptyLog[category] = [];
    });
    return emptyLog;
  }, [mealCategories]);

  const [log, setLog] = useState<DailyFoodLog>(createEmptyLog());
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [proteinTarget, setProteinTarget] = useState(150);
  const [carbsTarget, setCarbsTarget] = useState(200);
  const [fatTarget, setFatTarget] = useState(65);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Loads food log and nutrition targets from storage
   * Filters out categories that no longer exist
   */
  const loadLog = useCallback(async () => {
    setIsLoading(true);

    try {
      const [loadedLog, loadedCalorieTarget, loadedMacroTargets] = await Promise.all([
        loadFoodLog(date),
        loadCalorieTarget(),
        loadMacroTargets(),
      ]);

      // Create new log with current categories
      const filteredLog = createEmptyLog();

      // Copy over foods from loaded log that match current categories
      Object.keys(loadedLog).forEach(category => {
        if (mealCategories.includes(category)) {
          filteredLog[category] = loadedLog[category];
        }
      });

      setLog(filteredLog);
      setCalorieTarget(loadedCalorieTarget);
      setProteinTarget(loadedMacroTargets.protein);
      setCarbsTarget(loadedMacroTargets.carbs);
      setFatTarget(loadedMacroTargets.fat);
    } catch (error) {
      Alert.alert('Error', 'Failed to load food log');
      console.error('Food log load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [date, mealCategories, createEmptyLog]);

  /**
   * Saves food log to storage
   */
  const saveLog = useCallback(async (newLog: DailyFoodLog) => {
    try {
      await saveFoodLogService(date, newLog);
    } catch (error) {
      console.error('Food log save error:', error);
    }
  }, [date]);

  // Load data when date changes
  useEffect(() => {
    loadLog();
  }, [loadLog]);

  // Calculate nutrition totals using utility function
  const { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat } = useMemo(
    () => calculateNutritionTotals(log),
    [log]
  );

  const isLogEmpty = useMemo(() => {
    return Object.values(log).every((meal) => meal.length === 0);
  }, [log]);

  // ========== Food Operations ==========

  const addFood = useCallback((food: FoodEntry, meal: MealCategory) => {
    const newLog = { ...log };
    newLog[meal].push(food);
    setLog(newLog);
    saveLog(newLog);
  }, [log, saveLog]);

  const updateFood = useCallback((food: FoodEntry, meal: MealCategory) => {
    const newLog = { ...log };
    const list = [...newLog[meal]];
    const index = list.findIndex((f) => f.id === food.id);

    if (index >= 0) {
      list[index] = food;
      newLog[meal] = list;
      setLog(newLog);
      saveLog(newLog);
    }
  }, [log, saveLog]);

  const deleteFood = useCallback((id: number, meal: MealCategory) => {
    const newLog = { ...log };
    newLog[meal] = newLog[meal].filter((f) => f.id !== id);
    setLog(newLog);
    saveLog(newLog);
  }, [log, saveLog]);

  const toggleConsumed = useCallback((id: number, meal: MealCategory) => {
    const newLog = { ...log };
    const list = [...newLog[meal]];
    const index = list.findIndex((f) => f.id === id);

    if (index >= 0) {
      list[index] = {
        ...list[index],
        consumed: !list[index].consumed,
      };
      newLog[meal] = list;
      setLog(newLog);
      saveLog(newLog);
    }
  }, [log, saveLog]);

  // ========== Nutrition Targets ==========

  const handleSetNutritionTargets = useCallback(async (targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => {
    setCalorieTarget(targets.calories);
    setProteinTarget(targets.protein);
    setCarbsTarget(targets.carbs);
    setFatTarget(targets.fat);

    await Promise.all([
      saveCalorieTargetService(targets.calories),
      saveMacroTargets(targets.protein, targets.carbs, targets.fat),
    ]);
  }, []);

  // ========== Copy Yesterday's Log ==========

  const copyYesterdayLog = useCallback(async () => {
    try {
      const yesterdayLog = await loadFoodLog(getYesterday(date));

      // Check if yesterday's log is empty
      if (Object.values(yesterdayLog).every((meal) => meal.length === 0)) {
        Alert.alert('Not Found', 'No log found for yesterday.');
        return;
      }

      // Create new log with new IDs and current timestamp
      const currentTimestamp = new Date(date).toISOString();
      const newLog = createEmptyLog();

      // Copy foods that match current meal categories
      for (const meal of Object.keys(yesterdayLog)) {
        if (mealCategories.includes(meal)) {
          newLog[meal] = yesterdayLog[meal].map((entry) => ({
            ...entry,
            id: generateUniqueId(),
            timestamp: currentTimestamp,
          }));
        }
      }

      setLog(newLog);
      await saveLog(newLog);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy data.');
      console.error('Copy yesterday log error:', error);
    }
  }, [date, mealCategories, createEmptyLog, saveLog]);

  // ========== Load Diet Template ==========

  const loadDietTemplate = useCallback((templateMeals: DailyFoodLog) => {
    const currentTimestamp = new Date(date).toISOString();
    const newLog = createEmptyLog();

    // Copy foods that match current meal categories
    for (const meal of Object.keys(templateMeals)) {
      if (mealCategories.includes(meal)) {
        newLog[meal] = templateMeals[meal].map((food) => ({
          ...food,
          id: generateUniqueId(),
          timestamp: currentTimestamp,
        }));
      }
    }

    setLog(newLog);
    saveLog(newLog);
  }, [date, mealCategories, createEmptyLog, saveLog]);

  return {
    log,
    isLoading,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    calorieTarget,
    proteinTarget,
    carbsTarget,
    fatTarget,
    isLogEmpty,
    addFood,
    updateFood,
    deleteFood,
    toggleConsumed,
    handleSetNutritionTargets,
    copyYesterdayLog,
    loadDietTemplate,
  };
};
