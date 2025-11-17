import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Copy } from "lucide-react-native";

import { useDateManager } from "../hooks/useDateManager";
import { useFoodLog } from "../hooks/useFoodLog";
import BottomNav from "../components/BottomNav";
import { FoodEntry, MealCategory } from "../types";
import DateHeader from "../components/common/DateHeader";
import CalendarModal from "../components/common/CalendarModal";
import FoodSection from "../components/food/FoodSection";
import AddFoodModal from "../components/food/AddFoodModal";
import CalorieSummaryBar from "../components/food/CalorieSummaryBar";
import MacroSummary from "../components/food/MacroSummary";
import { styles } from "../styles/FoodLog.styles";

export default function FoodLog() {
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
  } = useFoodLog(selectedDate);

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <AddFoodModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveFood}
          editingFood={editingFood}
        />
        <CalendarModal
          isVisible={isCalendarVisible}
          onClose={closeCalendar}
          onDateSelect={handleDateSelectFromCalendar}
          selectedDate={selectedDate}
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

          <TouchableOpacity style={styles.copyButton} onPress={copyYesterdayLog}>
            <Copy size={16} color="#999" />
            <Text style={styles.copyButtonText}>Copy foods from yesterday</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}