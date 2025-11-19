import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useDateManager } from "../hooks/useDateManager";
import { useFoodLog } from "../hooks/useFoodLog";
import { useDietTemplates } from "../hooks/useDietTemplates";
import BottomNav from "../components/BottomNav";
import DateHeader from "../components/common/DateHeader";
import CalendarModal from "../components/common/CalendarModal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import AddFoodModal from "../components/food/AddFoodModal";
import DietTemplateManager from "../components/DietTemplateManager";
import NutritionTargetsModal from "../components/food/NutritionTargetsModal";
import { BackgroundPattern } from "../components/common/BackgroundPattern";
import { useTheme } from "../context/ThemeContext";
import { useFoodModal } from "../hooks/useFoodModal";
import { useFoodLogModals } from "../hooks/useFoodLogModals";
import { FoodLogContent } from "../components/food/FoodLogContent";
import { getFoodLogStyles } from "../styles/FoodLog.styles";

export default function FoodLog() {
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
    addFood,
    updateFood,
    deleteFood,
    handleSetNutritionTargets,
    copyYesterdayLog,
    loadDietTemplate,
  } = useFoodLog(selectedDate);

  const {
    templates,
    saveCurrentAsTemplate,
    renameTemplate,
    deleteTemplate,
  } = useDietTemplates();

  const {
    isModalVisible,
    editingFood,
    handleAddFood,
    handleEditFood,
    handleSaveFood,
    closeModal,
  } = useFoodModal(addFood, updateFood);

  const handleSaveAsTemplate = () => {
    const isLogEmpty = Object.values(log).every(meal => meal.length === 0);

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
    loadDietTemplate(template.meals);
    modals.templateManager.close();
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
        <CalendarModal
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
            onSetCalorieTarget={modals.nutritionTargets.open}
            onCopyYesterday={modals.copyConfirm.open}
            onOpenTemplateManager={modals.templateManager.open}
          />
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}