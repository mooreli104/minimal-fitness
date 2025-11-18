import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";

import BottomNav from "../components/BottomNav";
import CalorieChart from "../components/CalorieChart";
import { useDateManager } from "../hooks/useDateManager";
import { useDashboardData } from "../hooks/useDashboardData";
import DateHeader from "../components/common/DateHeader";
import CalendarModal from "../components/common/CalendarModal";
import { useTheme } from "../context/ThemeContext";
import { formatNumber } from "../utils/formatters";

export default function Dashboard() {
  const { colors } = useTheme();
  const isFocused = useIsFocused();

  const {
    selectedDate,
    isCalendarVisible,
    handleDateChange,
    handleDateSelectFromCalendar,
    openCalendar,
    closeCalendar,
    isToday,
  } = useDateManager();

  const { data, loadDashboardData } = useDashboardData();

  useEffect(() => {
    if (isFocused) {
      loadDashboardData(selectedDate);
    }
  }, [isFocused, selectedDate, loadDashboardData]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 24, paddingTop: 59, paddingBottom: 120, gap: 24 },
    topSection: {
      paddingTop: 24,
    },
    totalWrapper: {
      alignItems: "center",
      marginBottom: 16,
    },
    totalCalories: {
      fontSize: 48,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    kcalText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    entriesWrapper: {
      marginTop: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    sectionLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 12,
    },
    entryRow: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    entryText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    placeholderText: {
      textAlign: "center",
      color: colors.textSecondary,
      marginTop: 20,
      fontSize: 16,
    },
    yesterdayIndicator: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 32,
      marginBottom: -16,
    },
    yesterdayText: {
      fontSize: 13,
      color: colors.textTertiary,
      fontStyle: 'italic',
    },
  });

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
                {formatNumber(data.totalCalories)}
              </Text>
              <Text style={styles.kcalText}>kcal</Text>
            </View>
            <CalorieChart data={data.chartData.today} />
          </View>

          <View style={styles.entriesWrapper}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Top Foods</Text>
              <View style={styles.sectionLine} />
            </View>

            {data.displayedEntries.length > 0 ? (
              data.displayedEntries.map((entry) => (
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
