import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomNav from "../components/BottomNav";
import CalorieChart from "../components/CalorieChart";
import { useDateManager } from "../hooks/useDateManager";
import DateHeader from "../components/common/DateHeader";
import CalendarModal from "../components/common/CalendarModal";
import { FoodEntry, DailyFoodLog } from "../types";
import { styles } from "../styles/Dashboard.styles";

const LOG_KEY_PREFIX = "@foodlog_";

export default function Dashboard() {
  const {
    selectedDate,
    isCalendarVisible,
    handleDateChange,
    handleDateSelectFromCalendar,
    openCalendar,
    closeCalendar,
    isToday,
  } = useDateManager();

  const [chartData, setChartData] = useState<any>({ today: [], week: [], month: [] });
  const [displayedEntries, setDisplayedEntries] = useState<FoodEntry[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const isFocused = useIsFocused();

  const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  }

  const loadDashboardData = useCallback(async () => {
    const weeklyData = [];
    let dayCalories = 0;
    let allDayEntries: FoodEntry[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      const storageKey = `${LOG_KEY_PREFIX}${dateKey}`;

      try {
        const storedLog = await AsyncStorage.getItem(storageKey);
        let dailyTotalCalories = 0;
        if (storedLog) {
          const parsedLog: DailyFoodLog = JSON.parse(storedLog);
          const allEntries = Object.values(parsedLog).flat();
          dailyTotalCalories = allEntries.reduce((sum, entry) => sum + entry.calories, 0);

          if (i === 0) {
            dayCalories = dailyTotalCalories;
            allDayEntries = allEntries;
          }
        }
        weeklyData.push({ label: getDayOfWeek(date), value: dailyTotalCalories });
      } catch (error) {
        console.error("Failed to load log for", dateKey, error);
        weeklyData.push({ label: getDayOfWeek(date), value: 0 });
      }
    }

    const dayChartData = [];
    if (allDayEntries.length > 0) {
      const sortedDayEntries = [...allDayEntries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      let cumulativeCalories = 0;
      for (const entry of sortedDayEntries) {
        cumulativeCalories += entry.calories;
        dayChartData.push({
          label: new Date(entry.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          value: cumulativeCalories,
        });
      }
      if (dayChartData.length === 1) {
        dayChartData.push({ ...dayChartData[0] });
      }
    }

    setTotalCalories(dayCalories);
    const topEntries = allDayEntries
      .sort((a, b) => b.calories - a.calories)
      .slice(0, 5);
    setDisplayedEntries(topEntries);
    setChartData({
      today: dayChartData,
      week: weeklyData,
      month: [],
    });
  }, [selectedDate]);

  useEffect(() => {
    if (isFocused) {
      loadDashboardData();
    }
  }, [isFocused, loadDashboardData]);

  return (
    <View style={styles.container}>
      <CalendarModal
        isVisible={isCalendarVisible}
        onClose={closeCalendar}
        onDateSelect={handleDateSelectFromCalendar}
        selectedDate={selectedDate}
      />

      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <DateHeader
            date={selectedDate}
            onPrev={() => handleDateChange('prev')}
            onNext={() => handleDateChange('next')}
            onToday={() => handleDateChange('today')}
            onPressDate={openCalendar}
          />
          <View style={styles.yesterdayIndicator}>
            {!isToday && (
            <TouchableOpacity onPress={() => handleDateChange('today')}>
              <Text style={styles.yesterdayText}>Jump to Today</Text>
            </TouchableOpacity>
            )}
          </View>
          <View style={styles.topSection}>
            <View style={styles.totalWrapper}>
              <Text style={styles.totalCalories}>
                {totalCalories.toLocaleString()}
              </Text>
              <Text style={styles.kcalText}>kcal</Text>
            </View>
            <CalorieChart data={chartData.today} />
          </View>

          <View style={styles.entriesWrapper}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Top Foods</Text>
              <View style={styles.sectionLine} />
            </View>

            {displayedEntries.length > 0 ? (
              displayedEntries.map((entry) => (
                <View key={entry.id} style={styles.entryRow}>
                  <Text style={styles.entryText}>{entry.name} — {entry.calories} calories</Text>
                </View>
              ))
            ) : (
              <Text style={styles.placeholderText}>No foods logged for this day.</Text>
            )}
          </View>
        </ScrollView>
      </View>

      <BottomNav />
    </View>
  );
}