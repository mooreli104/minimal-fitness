/**
 * Hook for managing custom meal categories
 * Allows users to add, rename, and delete meal cards
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEAL_CATEGORIES_KEY = '@mealCategories';
const DEFAULT_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export const useMealCategories = () => {
  const [mealCategories, setMealCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load meal categories from storage
   */
  const loadCategories = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(MEAL_CATEGORIES_KEY);
      if (stored) {
        const categories = JSON.parse(stored);
        setMealCategories(categories);
      } else {
        // First time - set defaults
        setMealCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.error('Error loading meal categories:', error);
      Alert.alert('Error', 'Failed to load meal categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save meal categories to storage
   */
  const saveCategories = useCallback(async (categories: string[]) => {
    try {
      await AsyncStorage.setItem(MEAL_CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving meal categories:', error);
      Alert.alert('Error', 'Failed to save meal categories');
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /**
   * Add a new meal category
   */
  const addCategory = useCallback((categoryName: string) => {
    const trimmed = categoryName.trim();

    if (!trimmed) {
      Alert.alert('Invalid Name', 'Please enter a valid category name');
      return false;
    }

    if (mealCategories.includes(trimmed)) {
      Alert.alert('Duplicate', 'This meal category already exists');
      return false;
    }

    const newCategories = [...mealCategories, trimmed];
    setMealCategories(newCategories);
    saveCategories(newCategories);
    return true;
  }, [mealCategories, saveCategories]);

  /**
   * Rename an existing meal category
   */
  const renameCategory = useCallback((oldName: string, newName: string) => {
    const trimmed = newName.trim();

    if (!trimmed) {
      Alert.alert('Invalid Name', 'Please enter a valid category name');
      return false;
    }

    if (trimmed !== oldName && mealCategories.includes(trimmed)) {
      Alert.alert('Duplicate', 'This meal category already exists');
      return false;
    }

    const newCategories = mealCategories.map(cat => cat === oldName ? trimmed : cat);
    setMealCategories(newCategories);
    saveCategories(newCategories);
    return true;
  }, [mealCategories, saveCategories]);

  /**
   * Delete a meal category
   */
  const deleteCategory = useCallback((categoryName: string) => {
    if (mealCategories.length === 1) {
      Alert.alert('Cannot Delete', 'You must have at least one meal category');
      return false;
    }

    const newCategories = mealCategories.filter(cat => cat !== categoryName);
    setMealCategories(newCategories);
    saveCategories(newCategories);
    return true;
  }, [mealCategories, saveCategories]);

  /**
   * Reorder meal categories
   */
  const reorderCategories = useCallback((newOrder: string[]) => {
    setMealCategories(newOrder);
    saveCategories(newOrder);
  }, [saveCategories]);

  /**
   * Add multiple categories silently (used when loading templates)
   * Doesn't show alerts, just adds categories that don't already exist
   */
  const addCategoriesFromTemplate = useCallback((categoriesToAdd: string[]) => {
    const newCategories = [...mealCategories];
    let added = false;

    categoriesToAdd.forEach(category => {
      const trimmed = category.trim();
      if (trimmed && !newCategories.includes(trimmed)) {
        newCategories.push(trimmed);
        added = true;
      }
    });

    if (added) {
      setMealCategories(newCategories);
      saveCategories(newCategories);
    }
  }, [mealCategories, saveCategories]);

  return {
    mealCategories,
    isLoading,
    addCategory,
    renameCategory,
    deleteCategory,
    reorderCategories,
    addCategoriesFromTemplate,
  };
};
