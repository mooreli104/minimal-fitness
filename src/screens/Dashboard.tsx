import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { ChevronDown } from "lucide-react-native";

import BottomNav from "../components/BottonNav";
import CalorieChart from "../components/CalorieChart";
import EntryItem from "../components/EntryItem";

export default function Dashboard() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");

  const chartData = {
    today: [
      { label: "6am", value: 0 },
      { label: "9am", value: 350 },
      { label: "12pm", value: 850 },
      { label: "3pm", value: 1200 },
      { label: "6pm", value: 1845 },
      { label: "9pm", value: 1845 },
    ],
    week: [
      { label: "mon", value: 1850 },
      { label: "tue", value: 2100 },
      { label: "wed", value: 1750 },
      { label: "thu", value: 2200 },
      { label: "fri", value: 1900 },
      { label: "sat", value: 2400 },
      { label: "sun", value: 1845 },
    ],
    month: [
      { label: "wk1", value: 12500 },
      { label: "wk2", value: 14200 },
      { label: "wk3", value: 13800 },
      { label: "wk4", value: 15100 },
    ],
  };

  const entries = [
    { id: 1, icon: "🍗", name: "Chicken bowl", category: "meal", source: "home cooked", calories: 520, type: "meal" },
    { id: 2, icon: "🏃‍♂️", name: "Evening run", category: "workout", source: "outdoor", calories: 200, type: "workout" },
    { id: 3, icon: "🥗", name: "Greek salad", category: "meal", source: "restaurant", calories: 380, type: "meal" },
    { id: 4, icon: "☕", name: "Latte", category: "drink", source: "cafe", calories: 150, type: "meal" },
  ];

  const totalCalories =
    period === "today" ? 1845 : period === "week" ? 13545 : 55600;

  return (
    <View style={styles.container}>

      {/* Main content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Top Section */}
          <View style={styles.topSection}>
            {/* Period selector */}
            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodText}>{period}</Text>
              <ChevronDown size={16} strokeWidth={2} />
            </TouchableOpacity>

            {/* Total Calories */}
            <View style={styles.totalWrapper}>
              <Text style={styles.totalCalories}>
                {totalCalories.toLocaleString()}
              </Text>
              <Text style={styles.kcalText}>kcal</Text>
            </View>

            {/* Chart */}
            <CalorieChart data={chartData[period]} />
          </View>

          {/* Today's Entries */}
          <View style={styles.entriesWrapper}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>today</Text>
              <View style={styles.sectionLine} />
            </View>

            {entries.map((entry) => (
              <EntryItem key={entry.id} entry={entry} />
            ))}
          </View>
        </ScrollView>
      </View>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 24,
  },
  content: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  periodButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 16,
  },
  periodText: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  totalWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  totalCalories: {
    fontSize: 48,
    fontWeight: "700",
  },
  kcalText: {
    color: "#999",
    fontSize: 14,
    marginTop: 4,
  },
  entriesWrapper: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e5e5",
    marginLeft: 12,
  },
});
