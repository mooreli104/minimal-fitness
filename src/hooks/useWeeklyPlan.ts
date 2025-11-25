import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { WeeklyPlan, DayOfWeek } from '../types';
import { loadWeeklyPlan, saveWeeklyPlan } from '../services/weeklyPlanStorage.service';

export const useWeeklyPlan = () => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    Sunday: null,
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const plan = await loadWeeklyPlan();
        setWeeklyPlan(plan);
      } catch (error) {
        Alert.alert('Error', 'Failed to load weekly plan.');
        console.error('Weekly plan load error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPlan();
  }, []);

  const updateDayPlan = useCallback(async (dayOfWeek: DayOfWeek, workoutDayId: number | null) => {
    try {
      const updatedPlan = { ...weeklyPlan, [dayOfWeek]: workoutDayId };
      await saveWeeklyPlan(updatedPlan);
      setWeeklyPlan(updatedPlan);
    } catch (error) {
      Alert.alert('Error', 'Failed to update weekly plan.');
      console.error('Weekly plan update error:', error);
    }
  }, [weeklyPlan]);

  const clearWeeklyPlan = useCallback(async () => {
    try {
      const emptyPlan: WeeklyPlan = {
        Sunday: null,
        Monday: null,
        Tuesday: null,
        Wednesday: null,
        Thursday: null,
        Friday: null,
        Saturday: null,
      };
      await saveWeeklyPlan(emptyPlan);
      setWeeklyPlan(emptyPlan);
    } catch (error) {
      Alert.alert('Error', 'Failed to clear weekly plan.');
      console.error('Weekly plan clear error:', error);
    }
  }, []);

  const getWorkoutForDay = useCallback((dayOfWeek: DayOfWeek): number | null => {
    return weeklyPlan[dayOfWeek];
  }, [weeklyPlan]);

  return {
    weeklyPlan,
    isLoading,
    updateDayPlan,
    clearWeeklyPlan,
    getWorkoutForDay,
  };
};
