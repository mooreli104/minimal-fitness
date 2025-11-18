import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Copy, BookOpen } from "lucide-react-native";

import { useDateManager } from "../hooks/useDateManager";
import { useFoodLog } from "../hooks/useFoodLog";
import { useDietTemplates } from "../hooks/useDietTemplates";
import BottomNav from "../components/BottomNav";
import { MealCategory } from "../types";
import DateHeader from "../components/common/DateHeader";
import CalendarModal from "../components/common/CalendarModal";
import FoodSection from "../components/food/FoodSection";
import AddFoodModal from "../components/food/AddFoodModal";
import CalorieSummaryBar from "../components/food/CalorieSummaryBar";
import MacroSummary from "../components/food/MacroSummary";
import DietTemplateManager from "../components/DietTemplateManager";
import { BackgroundPattern } from "../components/common/BackgroundPattern";
import { useTheme } from "../context/ThemeContext";

import { useFoodModal } from "../hooks/useFoodModal";

export default function FoodLog() {
  const { colors } = useTheme();
  const [isTemplateManagerVisible, setTemplateManagerVisible] = useState(false);

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
    addFood,
    updateFood,
    deleteFood,
    handleSetCalorieTarget,
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
          setTemplateManagerVisible(false);
        }
      }
    );
  };

  const handleLoadTemplate = (template: any) => {
    loadDietTemplate(template.meals);
    setTemplateManagerVisible(false);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 120, gap: 24 },
    yesterdayIndicator: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 32,
      marginTop: -30,
      marginBottom: -10,
    },
    yesterdayText: {
      fontSize: 13,
      color: colors.textTertiary,
      fontStyle: 'italic',
    },
    actionButtons: {
      gap: 12,
    },
    copyButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      borderStyle: "dashed",
    },
    copyButtonText: { fontSize: 16, color: colors.textSecondary, fontWeight: "500" },
    templateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      borderStyle: "dashed",
    },
    templateButtonText: { fontSize: 16, color: colors.textSecondary, fontWeight: "500" },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      height: 200,
    },
  });

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
        <DietTemplateManager
          isVisible={isTemplateManagerVisible}
          templates={templates}
          onClose={() => setTemplateManagerVisible(false)}
          onLoadTemplate={handleLoadTemplate}
          onSaveCurrent={handleSaveAsTemplate}
          onRenameTemplate={renameTemplate}
          onDeleteTemplate={deleteTemplate}
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

          <CalorieSummaryBar
            consumed={totalCalories}
            target={calorieTarget}
            onPressTarget={handleSetCalorieTarget}
          />
          <MacroSummary
            protein={totalProtein}
            carbs={totalCarbs}
            fat={totalFat}
          />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading...</Text>
            </View>
          ) : (
            <>
              {(Object.keys(log) as MealCategory[]).map((meal) => (
                <FoodSection
                  key={meal}
                  title={meal}
                  foods={log[meal]}
                  onAdd={() => handleAddFood(meal)}
                  onEdit={(food) => handleEditFood(food, meal)}
                  onDelete={(id) => deleteFood(id, meal)}
                />
              ))}
            </>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.copyButton} onPress={copyYesterdayLog}>
              <Copy size={16} color={colors.textSecondary} />
              <Text style={styles.copyButtonText}>Copy from yesterday</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.templateButton}
              onPress={() => setTemplateManagerVisible(true)}
            >
              <BookOpen size={16} color={colors.textSecondary} />
              <Text style={styles.templateButtonText}>Diet Templates</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}