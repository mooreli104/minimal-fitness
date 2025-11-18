import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DietTemplate, DailyFoodLog, MealCategory } from '../types';

const DIET_TEMPLATES_KEY = '@dietTemplates';

export const useDietTemplates = () => {
  const [templates, setTemplates] = useState<DietTemplate[]>([]);

  const loadTemplates = useCallback(async () => {
    try {
      const storedTemplates = await AsyncStorage.getItem(DIET_TEMPLATES_KEY);
      if (storedTemplates) {
        const parsed = JSON.parse(storedTemplates);
        setTemplates(parsed);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load diet templates.');
    }
  }, []);

  const saveTemplates = useCallback(async (newTemplates: DietTemplate[]) => {
    try {
      await AsyncStorage.setItem(DIET_TEMPLATES_KEY, JSON.stringify(newTemplates));
    } catch (e) {
      Alert.alert('Error', 'Failed to save diet templates.');
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const saveCurrentAsTemplate = useCallback((templateName: string, currentLog: DailyFoodLog) => {
    // Remove IDs and timestamps from the template
    const cleanedMeals: DailyFoodLog = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snacks: [],
    };

    for (const meal of Object.keys(currentLog) as MealCategory[]) {
      cleanedMeals[meal] = currentLog[meal].map(food => ({
        ...food,
        id: 0, // Will be replaced when loading template
        timestamp: '', // Will be replaced when loading template
      }));
    }

    const newTemplate: DietTemplate = {
      id: Date.now(),
      name: templateName,
      meals: cleanedMeals,
    };

    const newTemplates = [...templates, newTemplate];
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
    Alert.alert('Success', `Diet template "${templateName}" saved.`);
  }, [templates, saveTemplates]);

  const renameTemplate = useCallback((templateId: number, newName: string) => {
    const newTemplates = templates.map((t) => (t.id === templateId ? { ...t, name: newName } : t));
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  const deleteTemplate = useCallback((templateId: number) => {
    const newTemplates = templates.filter((t) => t.id !== templateId);
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  return {
    templates,
    saveCurrentAsTemplate,
    renameTemplate,
    deleteTemplate,
  };
};
