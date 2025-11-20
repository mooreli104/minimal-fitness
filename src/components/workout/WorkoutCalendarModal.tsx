/**
 * Workout Calendar Modal
 * Shows workout status indicators:
 * - Gray dot: Rest day
 * - Red dot: Incomplete workout (missing weights or actual sets)
 * - Green dot: Complete workout (all exercises logged)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { loadWorkoutLog } from '../../services/workoutStorage.service';
import { isWorkoutCompleted } from '../../utils/analytics';

interface WorkoutCalendarModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

interface DayStatus {
  [key: string]: 'rest' | 'complete' | 'incomplete' | null;
}

const WorkoutCalendarModal = ({
  isVisible,
  onClose,
  onDateSelect,
  selectedDate: initialSelectedDate,
}: WorkoutCalendarModalProps) => {
  const { colors } = useTheme();
  const [displayDate, setDisplayDate] = useState(new Date(initialSelectedDate));
  const [dayStatuses, setDayStatuses] = useState<DayStatus>({});

  useEffect(() => {
    if (isVisible) {
      setDisplayDate(new Date(initialSelectedDate));
      loadMonthStatuses(new Date(initialSelectedDate));
    }
  }, [isVisible, initialSelectedDate]);

  /**
   * Load workout statuses for all days in the current month
   */
  const loadMonthStatuses = async (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const statuses: DayStatus = {};

    // Load all workouts for the month in parallel
    const promises = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateToCheck = new Date(year, month, day);
      promises.push(
        loadWorkoutLog(dateToCheck).then((workout) => {
          const key = `${year}-${month}-${day}`;
          if (workout) {
            if (workout.isRest) {
              statuses[key] = 'rest';
            } else if (isWorkoutCompleted(workout)) {
              statuses[key] = 'complete';
            } else {
              statuses[key] = 'incomplete';
            }
          } else {
            statuses[key] = null;
          }
        })
      );
    }

    await Promise.all(promises);
    setDayStatuses(statuses);
  };

  const changeMonth = (amount: number) => {
    const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth() + amount, 1);
    setDisplayDate(newDate);
    loadMonthStatuses(newDate);
  };

  const handleSelectDate = (day: number) => {
    const newSelectedDate = new Date(
      displayDate.getFullYear(),
      displayDate.getMonth(),
      day
    );
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

      // Get status for this day
      const statusKey = `${year}-${month}-${day}`;
      const status = dayStatuses[statusKey];

      // Determine background color based on status
      let backgroundColor = null;
      let textColor = colors.textPrimary;

      if (isSelected) {
        // Selected day always uses accent color
        backgroundColor = colors.accent;
        textColor = colors.background;
      } else if (status && !isFuture) {
        // Status highlighting (slightly smaller than selected)
        if (status === 'rest') {
          backgroundColor = `${colors.textTertiary}40`; // Gray with 25% opacity
          textColor = colors.textPrimary;
        } else if (status === 'complete') {
          backgroundColor = `${colors.green}40`; // Green with 25% opacity
          textColor = colors.textPrimary;
        } else if (status === 'incomplete') {
          backgroundColor = `${colors.red}40`; // Red with 25% opacity
          textColor = colors.textPrimary;
        }
      }

      calendarDays.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            backgroundColor && {
              backgroundColor,
              borderRadius: isSelected ? 20 : 16, // Selected is larger
            },
          ]}
          onPress={() => handleSelectDate(day)}
          disabled={isFuture}
        >
          <Text
            style={[
              styles.calendarDayText,
              { color: textColor },
              isToday && !isSelected && styles.calendarDayTextToday,
              isSelected && { fontWeight: '600' },
              isFuture && { color: colors.textTertiary },
            ]}
          >
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
        <View
          style={[styles.calendarContainer, { backgroundColor: colors.cardBackground }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calendarNav}>
              <ChevronLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.calendarMonthText, { color: colors.textPrimary }]}>
              {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity
              onPress={() => changeMonth(1)}
              style={styles.calendarNav}
              disabled={isFutureMonth}
            >
              <ChevronRight
                size={20}
                color={isFutureMonth ? colors.textTertiary : colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarWeekDays}>
            {weekDays.map((day, index) => (
              <Text key={index} style={[styles.calendarWeekDayText, { color: colors.textTertiary }]}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.calendarGrid} key={`${displayDate.getFullYear()}-${displayDate.getMonth()}`}>
            {renderCalendar()}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  calendarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  calendarContainer: {
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
    fontWeight: '500',
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
 calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  calendarDayText: {
    fontSize: 18,
    fontWeight: '500',
  },
  calendarDayTextToday: { fontWeight: 'bold', color: '#007AFF' },
});

export default WorkoutCalendarModal;
