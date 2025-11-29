import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native';
import type { FoodSearchResult } from '../types/food';

import { useDateManager } from "../hooks/useDateManager";
import { useFoodLog } from "../hooks/useFoodLog";
import { useDietTemplates } from "../hooks/useDietTemplates";
import { useMealCategories } from "../hooks/useMealCategories";
import BottomNav from "../components/BottomNav";
import DateHeader from "../components/common/DateHeader";
import FoodLogCalendarModal from "../components/food/FoodLogCalendarModal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import AddFoodModal from "../components/food/AddFoodModal";
import DietTemplateManager from "../components/DietTemplateManager";
import NutritionTargetsModal from "../components/food/NutritionTargetsModal";
import { MealCategoryManager } from "../components/food/MealCategoryManager";
import { BackgroundPattern } from "../components/common/BackgroundPattern";
import { useTheme } from "../context/ThemeContext";
import { useFoodModal } from "../hooks/useFoodModal";
import { useFoodLogModals } from "../hooks/useFoodLogModals";
import { FoodLogContent } from "../components/food/FoodLogContent";
import { getFoodLogStyles } from "../styles/FoodLog.styles";

export default function FoodLog() {
  const navigation = useNavigation();
  const [activeMealForSearch, setActiveMealForSearch] = useState<string | null>(null);
  const [isMealCategoryManagerVisible, setIsMealCategoryManagerVisible] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<any>(null);
  const { colors } = useTheme();
  const styles = getFoodLogStyles(colors);
  const modals = useFoodLogModals();

  const {
    selectedDate,
    isCalendarVisible,
    handleDateChange,
    handleDateSelectFromCalendar,
    openCalendar,
    closeCalendar,
    isToday,
  } = useDateManager();

  // Load meal categories
  const {
    mealCategories,
    addCategory,
    renameCategory,
    deleteCategory,
    addCategoriesFromTemplate,
  } = useMealCategories();

  const {
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
  } = useFoodLog(selectedDate, mealCategories);

  const {
    templates,
    saveCurrentAsTemplate,
    renameTemplate,
    deleteTemplate,
  } = useDietTemplates();

  const {
    isModalVisible,
    editingFood,
    handleAddFood: handleAddFoodOriginal,
    handleEditFood,
    handleSaveFood,
    closeModal,
  } = useFoodModal(addFood, updateFood);

  // Navigate to search screen instead of modal
  const handleAddFood = (meal: string) => {
    setActiveMealForSearch(meal);
    navigation.navigate('FoodSearch' as never, {
      mealType: meal,
      onSelectFood: (food: FoodSearchResult) => {
        // Convert search result to FoodEntry and add to log
        const foodEntry = {
          id: Date.now(),
          name: food.description,
          timestamp: new Date().toISOString(),
          calories: food.calories || 0,
          protein: food.protein_g || 0,
          carbs: food.carbs_g || 0,
          fat: food.fat_g || 0,
        };
        addFood(foodEntry, meal as any);
      },
    } as never);
  };

  const handleSaveAsTemplate = () => {
    if (isLogEmpty) {
      Alert.alert(
        'Empty Log',
        'Please add some foods before saving as a template.'
      );
      return;
    }

    Alert.prompt(
      'Save as Template',
      'Enter a name for this diet template:',
      (templateName) => {
        if (templateName && templateName.trim()) {
          saveCurrentAsTemplate(templateName.trim(), log);
          modals.templateManager.close();
        }
      }
    );
  };

  const handleLoadTemplate = (template: any) => {
    setPendingTemplate(template);
    modals.templateManager.close();

    // If log is empty, load immediately
    if (isLogEmpty) {
      // Add any missing meal categories from the template
      const templateCategories = Object.keys(template.meals);
      addCategoriesFromTemplate(templateCategories);

      // Load the template
      loadDietTemplate(template.meals);
    } else {
      // Show confirmation dialog if log has data
      modals.templateLoadConfirm.open();
    }
  };

  const confirmLoadTemplate = () => {
    if (pendingTemplate) {
      // Add any missing meal categories from the template
      const templateCategories = Object.keys(pendingTemplate.meals);
      addCategoriesFromTemplate(templateCategories);

      // Load the template
      loadDietTemplate(pendingTemplate.meals);
      setPendingTemplate(null);
    }
    modals.templateLoadConfirm.close();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <BackgroundPattern />
        <AddFoodModal
          isVisible={isModalVisible}
          onClose={closeModal}
          onSave={handleSaveFood}
          editingFood={editingFood}
        />
        <FoodLogCalendarModal
          isVisible={isCalendarVisible}
          onClose={closeCalendar}
          onDateSelect={handleDateSelectFromCalendar}
          selectedDate={selectedDate}
        />
        <ConfirmDialog
          isVisible={modals.copyConfirm.isVisible}
          onClose={modals.copyConfirm.close}
          onConfirm={copyYesterdayLog}
          title="Copy from Yesterday?"
          message="This will replace your current log with yesterday's entries. Are you sure?"
          confirmText="Copy"
          cancelText="Cancel"
        />
        <ConfirmDialog
          isVisible={modals.templateLoadConfirm.isVisible}
          onClose={modals.templateLoadConfirm.close}
          onConfirm={confirmLoadTemplate}
          title="Load Diet Template?"
          message="This will replace your current food log with the template. Are you sure?"
          confirmText="Load Template"
          cancelText="Cancel"
        />
        <DietTemplateManager
          isVisible={modals.templateManager.isVisible}
          templates={templates}
          onClose={modals.templateManager.close}
          onLoadTemplate={handleLoadTemplate}
          onSaveCurrent={handleSaveAsTemplate}
          onRenameTemplate={renameTemplate}
          onDeleteTemplate={deleteTemplate}
        />
        <NutritionTargetsModal
          isVisible={modals.nutritionTargets.isVisible}
          onClose={modals.nutritionTargets.close}
          onSave={handleSetNutritionTargets}
          currentTargets={{
            calories: calorieTarget,
            protein: proteinTarget,
            carbs: carbsTarget,
            fat: fatTarget,
          }}
        />
        <MealCategoryManager
          isVisible={isMealCategoryManagerVisible}
          onClose={() => setIsMealCategoryManagerVisible(false)}
          categories={mealCategories}
          onAdd={addCategory}
          onRename={renameCategory}
          onDelete={deleteCategory}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <DateHeader
            date={selectedDate}
            onPrev={() => handleDateChange("prev")}
            onNext={() => handleDateChange("next")}
            onToday={() => handleDateChange("today")}
            onPressDate={openCalendar}
          />

          <View style={styles.yesterdayIndicator}>
            {!isToday && (
              <TouchableOpacity onPress={() => handleDateChange("today")}>
                <Text style={styles.yesterdayText}>Jump to Today</Text>
              </TouchableOpacity>
            )}
          </View>

          <FoodLogContent
            log={log}
            isLoading={isLoading}
            mealCategories={mealCategories}
            totalCalories={totalCalories}
            totalProtein={totalProtein}
            totalCarbs={totalCarbs}
            totalFat={totalFat}
            calorieTarget={calorieTarget}
            proteinTarget={proteinTarget}
            carbsTarget={carbsTarget}
            fatTarget={fatTarget}
            onAddFood={handleAddFood}
            onEditFood={handleEditFood}
            onDeleteFood={deleteFood}
            onToggleConsumed={toggleConsumed}
            onSetCalorieTarget={modals.nutritionTargets.open}
            onCopyYesterday={modals.copyConfirm.open}
            onOpenTemplateManager={modals.templateManager.open}
            onManageMealCategories={() => setIsMealCategoryManagerVisible(true)}
          />
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}