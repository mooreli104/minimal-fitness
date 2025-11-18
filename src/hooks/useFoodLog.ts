import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyFoodLog, FoodEntry, MealCategory } from '../types';

const LOG_KEY_PREFIX = '@foodlog_';
const CALORIE_TARGET_KEY = '@calorieTarget';

const initialLog: DailyFoodLog = {
  Breakfast: [],
  Lunch: [],
  Dinner: [],
  Snacks: [],
};

export const useFoodLog = (date: Date) => {
  const [log, setLog] = useState<DailyFoodLog>(initialLog);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [isLoading, setIsLoading] = useState(true);

  const dateKey = useMemo(() => date.toISOString().split('T')[0], [date]);
  const storageKey = `${LOG_KEY_PREFIX}${dateKey}`;

  const loadLog = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedTarget = await AsyncStorage.getItem(CALORIE_TARGET_KEY);
      if (storedTarget) {
        const parsedTarget = parseInt(storedTarget, 10);
        if (!isNaN(parsedTarget)) {
          setCalorieTarget(parsedTarget);
        }
      }

      const storedLog = await AsyncStorage.getItem(storageKey);
      setLog(initialLog);

      if (storedLog) {
        const parsed = JSON.parse(storedLog);
        const fixed: DailyFoodLog = {
          Breakfast: parsed.Breakfast ?? [],
          Lunch: parsed.Lunch ?? [],
          Dinner: parsed.Dinner ?? [],
          Snacks: parsed.Snacks ?? [],
        };
        const defaultTimestamp = new Date(`${dateKey}T12:00:00`).toISOString();
        for (const meal of Object.keys(fixed) as MealCategory[]) {
          fixed[meal] = fixed[meal].map(entry => ({
            ...entry,
            timestamp: entry.timestamp || defaultTimestamp,
          }));
        }
        setLog(fixed);
      }
    } catch {
      Alert.alert('Error', 'Failed to load food log');
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, dateKey]);

  const saveLog = useCallback(
    async (newLog: DailyFoodLog) => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(newLog));
      } catch {}
    },
    [storageKey]
  );

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  const { totalCalories, totalProtein, totalCarbs, totalFat } = useMemo(() => {
    let c = 0, p = 0, crb = 0, f = 0;
    Object.values(log).forEach((meal) => {
      meal.forEach((food) => {
        c += food.calories;
        p += food.protein ?? 0;
        crb += food.carbs ?? 0;
        f += food.fat ?? 0;
      });
    });
    return { totalCalories: c, totalProtein: p, totalCarbs: crb, totalFat: f };
  }, [log]);

  const isLogEmpty = useMemo(() => {
    return Object.values(log).every(meal => meal.length === 0);
  }, [log]);

  const addFood = (food: FoodEntry, meal: MealCategory) => {
    const newLog = { ...log };
    newLog[meal].push(food);
    setLog(newLog);
    saveLog(newLog);
  };

  const updateFood = (food: FoodEntry, meal: MealCategory) => {
    const newLog = { ...log };
    const list = [...newLog[meal]];
    const ix = list.findIndex((f) => f.id === food.id);
    if (ix >= 0) {
      list[ix] = food;
      newLog[meal] = list;
      setLog(newLog);
      saveLog(newLog);
    }
  };

  const deleteFood = (id: number, meal: MealCategory) => {
    const newLog = { ...log };
    newLog[meal] = newLog[meal].filter((f) => f.id !== id);
    setLog(newLog);
    saveLog(newLog);
  };

  const handleSetCalorieTarget = () => {
    Alert.prompt(
      'Set Calorie Target',
      'Enter your daily calorie goal:',
      async (text) => {
        const newTarget = parseInt(text, 10);
        if (!isNaN(newTarget) && newTarget > 0) {
          setCalorieTarget(newTarget);
          await AsyncStorage.setItem(CALORIE_TARGET_KEY, String(newTarget));
        }
      },
      'plain-text',
      String(calorieTarget),
      'number-pad'
    );
  };

  const copyYesterdayLog = async () => {
    const yesterday = new Date(date);
    yesterday.setDate(date.getDate() - 1);
    const key = `${LOG_KEY_PREFIX}${yesterday.toISOString().split('T')[0]}`;
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return Alert.alert('Not Found', 'No log found for yesterday.');
      const parsed: DailyFoodLog = JSON.parse(stored);
      const fixed: DailyFoodLog = {
        Breakfast: parsed.Breakfast ?? [],
        Lunch: parsed.Lunch ?? [],
        Dinner: parsed.Dinner ?? [],
        Snacks: parsed.Snacks ?? [],
      };
      for (const meal of Object.keys(fixed) as MealCategory[]) {
        fixed[meal] = fixed[meal].map(entry => ({
          ...entry,
          id: Date.now() + Math.random(), // new id
          timestamp: new Date(date).toISOString(),
        }));
      }
      setLog(fixed);
      saveLog(fixed);
    } catch {
      Alert.alert('Error', 'Failed to copy data.');
    }
  };

  const loadDietTemplate = useCallback((templateMeals: DailyFoodLog) => {
    const newLog: DailyFoodLog = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snacks: [],
    };

    const currentTimestamp = new Date(date).toISOString();

    for (const meal of Object.keys(templateMeals) as MealCategory[]) {
      newLog[meal] = templateMeals[meal].map(food => ({
        ...food,
        id: Date.now() + Math.random(), // Generate new unique ID
        timestamp: currentTimestamp, // Set to current date
      }));
    }

    setLog(newLog);
    saveLog(newLog);
  }, [date, saveLog]);

  return {
    log,
    isLoading,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    calorieTarget,
    isLogEmpty,
    addFood,
    updateFood,
    deleteFood,
    handleSetCalorieTarget,
    copyYesterdayLog,
    loadDietTemplate,
  };
};
