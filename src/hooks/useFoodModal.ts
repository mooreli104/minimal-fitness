import { useState } from 'react';
import { FoodEntry, MealCategory } from '../types';

export const useFoodModal = (
  addFood: (food: FoodEntry, meal: MealCategory) => void,
  updateFood: (food: FoodEntry, meal: MealCategory) => void
) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodEntry | null>(null);
  const [activeMeal, setActiveMeal] = useState<MealCategory | null>(null);

  const handleAddFood = (meal: MealCategory) => {
    setActiveMeal(meal);
    setEditingFood(null);
    setModalVisible(true);
  };

  const handleEditFood = (food: FoodEntry, meal: MealCategory) => {
    setActiveMeal(meal);
    setEditingFood(food);
    setModalVisible(true);
  };

  const handleSaveFood = (food: FoodEntry) => {
    if (!activeMeal) return;

    if (editingFood) {
      updateFood(food, activeMeal);
    } else {
      addFood(food, activeMeal);
    }
    setModalVisible(false);
    setEditingFood(null);
    setActiveMeal(null);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingFood(null);
    setActiveMeal(null);
  };

  return {
    isModalVisible,
    editingFood,
    activeMeal,
    handleAddFood,
    handleEditFood,
    handleSaveFood,
    closeModal,
  };
};
