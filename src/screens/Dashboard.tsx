import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomNav from "../components/BottonNav";
import CalorieChart from "../components/CalorieChart";
import { useDate } from "../context/DateContext";

// ==== Types ====
interface FoodEntry {
  id: number;
  name: string;
  timestamp: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

type DailyFoodLog = { [key: string]: FoodEntry[] };

const DateHeader = ({ date, onPrev, onNext, onToday, onPressDate }: { date: Date, onPrev: () => void, onNext: () => void, onToday: () => void, onPressDate: () => void }) => {
  const today = new Date(); // Current date and time
  today.setHours(0, 0, 0, 0); // Set to the beginning of today
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0); // Set to the beginning of the given date
  const isToday = today.getTime() === compareDate.getTime();

  const formattedDate = isToday
    ? 'Today'
    : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

  return (
    <View style={styles.dateHeaderContainer}>
      <TouchableOpacity onPress={onPrev} style={styles.dateArrow}>
        <ChevronLeft size={24} color="#000" />
      </TouchableOpacity>
      <View>
        <TouchableOpacity onPress={onPressDate} style={{ alignItems: 'center' }}>
          <Text style={styles.dateHeaderText}>{formattedDate}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onNext} disabled={isToday} style={styles.dateArrow}>
        <ChevronRight size={24} color={isToday ? "#ccc" : "#000"} />
      </TouchableOpacity>
    </View>
  );
};

const CalendarModal = ({ isVisible, onClose, onDateSelect, selectedDate: initialSelectedDate }: { isVisible: boolean, onClose: () => void, onDateSelect: (date: Date) => void, selectedDate: Date }) => {
  const [displayDate, setDisplayDate] = useState(new Date(initialSelectedDate));

  useEffect(() => {
    if (isVisible) {
      setDisplayDate(new Date(initialSelectedDate));
    }
  }, [isVisible, initialSelectedDate]);

  const changeMonth = (amount: number) => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + amount);
    setDisplayDate(newDate);
  };

  const handleSelectDate = (day: number) => {
    const newSelectedDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    onDateSelect(newSelectedDate);
  };

  const renderCalendar = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<View key={`blank-${i}`} style={styles.calendarDay} />);
    }

    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const selectedDay = initialSelectedDate.getDate();
    const selectedMonth = initialSelectedDate.getMonth();
    const selectedYear = initialSelectedDate.getFullYear();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === todayDate && month === todayMonth && year === todayYear;
      const isSelected = day === selectedDay && month === selectedMonth && year === selectedYear;
      const isFuture = new Date(year, month, day) > todayStart;

      calendarDays.push(
        <TouchableOpacity
          key={day}
          style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
          onPress={() => handleSelectDate(day)}
          disabled={isFuture}
        >
          <Text style={[
            styles.calendarDayText,
            isToday && styles.calendarDayTextToday,
            isSelected && styles.calendarDayTextSelected,
            isFuture && styles.calendarDayTextFuture,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    return calendarDays;
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const isFutureMonth =
    displayDate.getFullYear() > new Date().getFullYear() ||
    (displayDate.getFullYear() === new Date().getFullYear() &&
      displayDate.getMonth() > new Date().getMonth());

  return (
    <Modal visible={isVisible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.calendarBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.calendarContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calendarNav}>
              <ChevronLeft size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.calendarMonthText}>
              {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.calendarNav} disabled={isFutureMonth}>
              <ChevronRight size={20} color={isFutureMonth ? "#ccc" : "#000"} />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarWeekDays}>
            {weekDays.map((day, index) => <Text key={index} style={styles.calendarWeekDayText}>{day}</Text>)}
          </View>
          <View style={styles.calendarGrid}>{renderCalendar()}</View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function Dashboard() {
  const { selectedDate, setSelectedDate } = useDate();

  const [chartData, setChartData] = useState<any>({ today: [], week: [], month: [] });
  const [displayedEntries, setDisplayedEntries] = useState<FoodEntry[]>([]);
  const [totalCalories, setTotalCalories] = useState(0); // For the selected day
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const isFocused = useIsFocused();

  const LOG_KEY_PREFIX = "@foodlog_";
  const dateKey = useMemo(() => selectedDate.toISOString().split("T")[0], [selectedDate]);

  const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  }

  const loadDashboardData = useCallback(async () => {
    const weeklyData = [];
    let dayCalories = 0;
    let allDayEntries: FoodEntry[] = [];

    // Fetch data for the last 7 days for the weekly chart
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

          if (i === 0) { // Today's data
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

    // Process data for "today" chart with cumulative calories
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
      // Handle edge case where there is only one entry, which can cause chart rendering issues.
      // Duplicate the single entry to create a valid path.
      if (dayChartData.length === 1) {
        dayChartData.push({ ...dayChartData[0] });
      }
    }

    // Set state for today's view
    setTotalCalories(dayCalories);
    const topEntries = allDayEntries
      .sort((a, b) => b.calories - a.calories)
      .slice(0, 5);
    setDisplayedEntries(topEntries);
    setChartData({
      today: dayChartData,
      week: weeklyData,
      month: [], // Placeholder
    });
  }, [selectedDate]);

  useEffect(() => {
    if (isFocused) {
      loadDashboardData();
    }
  }, [isFocused, loadDashboardData]);

  const handleDateChange = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (direction === 'next') {
      if (newDate.toDateString() === new Date().toDateString()) return; // Don't go to future
      newDate.setDate(newDate.getDate() + 1);
    } else {
      setSelectedDate(new Date());
      return;
    }
    setSelectedDate(newDate);
  };

  const handleDateSelectFromCalendar = (date: Date) => {
    setSelectedDate(date);
    setCalendarVisible(false);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <View style={styles.container}>
      <CalendarModal
        isVisible={isCalendarVisible}
        onClose={() => setCalendarVisible(false)}
        onDateSelect={handleDateSelectFromCalendar}
        selectedDate={selectedDate}
      />

      {/* Main content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <DateHeader date={selectedDate} onPrev={() => handleDateChange('prev')} onNext={() => handleDateChange('next')} onToday={() => handleDateChange('today')}
            onPressDate={() => setCalendarVisible(true)}
          />
          <View style={styles.yesterdayIndicator}>
            {!isToday && (
            <TouchableOpacity onPress={() => handleDateChange('today')}>
              <Text style={styles.yesterdayText}>Jump to Today</Text>
            </TouchableOpacity>
            )}
          </View>
          {/* Top Section */}
          <View style={styles.topSection}>

            {/* Total Calories */}
            <View style={styles.totalWrapper}>
              <Text style={styles.totalCalories}>
                {totalCalories.toLocaleString()}
              </Text>
              <Text style={styles.kcalText}>kcal</Text>
            </View>

            {/* Chart */}
            <CalorieChart data={chartData.today} />
          </View>

          {/* Today's Entries */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  content: { paddingHorizontal: 24, paddingTop: 59, paddingBottom: 120, gap: 24 },
  dateHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 0,
    paddingTop: 0,
  },
  dateArrow: {
    padding: 8,
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  topSection: {
    paddingTop: 24, // Added padding to compensate for removed button
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
  entryRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  entryText: {
    fontSize: 16,
  },
  placeholderText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 16,
  },
  yesterdayIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32, // Fixed height to prevent layout shift
    marginBottom: -16, // Adjust to maintain visual balance
  },
  yesterdayText: {
    fontSize: 13,
    color: '#aaa',
    fontStyle: 'italic',
  },
  // Calendar Modal Styles
  calendarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNav: {
    padding: 8,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarWeekDayText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDaySelected: {
    backgroundColor: '#000',
    borderRadius: 20,
  },
  calendarDayText: { fontSize: 16 },
  calendarDayTextToday: { fontWeight: 'bold', color: '#007AFF' },
  calendarDayTextSelected: { color: '#fff', fontWeight: '600' },
  calendarDayTextFuture: { color: '#ccc' },
});
