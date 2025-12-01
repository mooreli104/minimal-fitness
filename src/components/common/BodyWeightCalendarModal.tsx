/**
 * Body Weight Calendar Modal
 * Shows weight logging status indicators:
 * - Green highlight: Weight logged
 * - Red highlight: No weight logged
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { loadWeightEntries } from '../../services/weightTracking.service';
import { formatDateToKey } from '../../utils/formatters';

interface BodyWeightCalendarModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

interface DayStatus {
  [key: string]: boolean; // true if weight logged, false if not
}

const BodyWeightCalendarModal = ({
  isVisible,
  onClose,
  onDateSelect,
  selectedDate: initialSelectedDate,
}: BodyWeightCalendarModalProps) => {
  const { colors } = useTheme();
  const [displayDate, setDisplayDate] = useState(new Date(initialSelectedDate));
  const [dayStatuses, setDayStatuses] = useState<DayStatus>({});

  // Memoize styles based on colors to prevent recreation on every render
  const styles = useMemo(() => getStyles(colors), [colors]);

  /**
   * Load weight entry statuses for all days in the current month
   * Memoized to prevent unnecessary re-creation
   */
  const loadMonthStatuses = useCallback(async (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const statuses: DayStatus = {};

    // Load all weight entries
    const entries = await loadWeightEntries();

    // Create a set of dates with weight entries for quick lookup
    const entryDates = new Set(entries.map((entry) => entry.date));

    // Check each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateToCheck = new Date(year, month, day);
      const dateKey = formatDateToKey(dateToCheck);
      const statusKey = `${year}-${month}-${day}`;
      statuses[statusKey] = entryDates.has(dateKey);
    }

    setDayStatuses(statuses);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setDisplayDate(new Date(initialSelectedDate));
      loadMonthStatuses(new Date(initialSelectedDate));
    }
  }, [isVisible, initialSelectedDate, loadMonthStatuses]);

  const changeMonth = useCallback(
    (amount: number) => {
      const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth() + amount, 1);
      setDisplayDate(newDate);
      loadMonthStatuses(newDate);
    },
    [displayDate, loadMonthStatuses]
  );

  const handleSelectDate = useCallback(
    (day: number) => {
      const newSelectedDate = new Date(
        displayDate.getFullYear(),
        displayDate.getMonth(),
        day
      );
      onDateSelect(newSelectedDate);
    },
    [displayDate, onDateSelect]
  );

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
      const hasWeightEntry = dayStatuses[statusKey];

      // Determine background color based on status
      let backgroundColor = null;
      let textColor = colors.textPrimary;

      if (isSelected) {
        // Selected day always uses accent color
        backgroundColor = colors.accent;
        textColor = colors.background;
      } else if (!isFuture) {
        // Status highlighting
        if (hasWeightEntry) {
          backgroundColor = `${colors.green}40`; // Green with 25% opacity
          textColor = colors.textPrimary;
        } else {
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

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: `${colors.green}40` }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Logged</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: `${colors.red}40` }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Not Logged</Text>
            </View>
          </View>

          <View style={styles.calendarWeekDays}>
            {weekDays.map((day, index) => (
              <Text
                key={index}
                style={[styles.calendarWeekDayText, { color: colors.textTertiary }]}
              >
                {day}
              </Text>
            ))}
          </View>
          <View
            style={styles.calendarGrid}
            key={`${displayDate.getFullYear()}-${displayDate.getMonth()}`}
          >
            {renderCalendar()}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

/**
 * Get styles function - memoized by component for performance
 * Following RN best practices: styles are created once and reused
 */
const getStyles = (colors: any) =>
  StyleSheet.create({
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
      marginBottom: 12,
    },
    calendarNav: {
      padding: 8,
    },
    calendarMonthText: {
      fontSize: 18,
      fontWeight: '600',
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    legendText: {
      fontSize: 12,
      fontWeight: '500',
    },
    calendarWeekDays: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    calendarWeekDayText: {
      fontSize: 12,
      fontWeight: '500',
      width: 40, // Match calendar day width for proper alignment
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
    calendarDayTextToday: {
      fontWeight: 'bold',
      color: '#007AFF',
    },
  });

export default BodyWeightCalendarModal;
