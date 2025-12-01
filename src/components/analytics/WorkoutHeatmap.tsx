/**
 * Workout Calendar
 * Calendar-style view showing workout consistency
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatDateToKey } from '../../utils/formatters';

interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number; // Number of exercises logged
  isWorkout: boolean; // Whether user worked out this day
}

type CalendarView = 'week' | 'month';

interface WorkoutHeatmapProps {
  data: HeatmapDay[];
}

const CELL_SIZE = 40;
const CELL_GAP = 6;

export const WorkoutHeatmap: React.FC<WorkoutHeatmapProps> = ({ data }) => {
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Create a map for quick lookup
  const dataMap = new Map(data.map((d) => [d.date, d]));

  // Generate calendar days based on view
  const getDaysForView = (): HeatmapDay[] => {
    const days: HeatmapDay[] = [];

    if (view === 'week') {
      // Show current week (Sunday to Saturday)
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateKey = formatDateToKey(date);

        days.push(
          dataMap.get(dateKey) || {
            date: dateKey,
            count: 0,
            isWorkout: false,
          }
        );
      }
    } else {
      // Show current month in calendar grid
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // First day of month
      const firstDay = new Date(year, month, 1);
      // Start from Sunday of week containing first day
      const startDate = new Date(firstDay);
      startDate.setDate(1 - firstDay.getDay());

      // Generate up to 6 weeks to ensure full month coverage
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateKey = formatDateToKey(date);

        days.push(
          dataMap.get(dateKey) || {
            date: dateKey,
            count: 0,
            isWorkout: false,
          }
        );
      }
    }

    return days;
  };

  const calendarDays = getDaysForView();

  // Binary color - either worked out (green) or didn't (border)
  const getColor = (day: HeatmapDay): string => {
    return day.isWorkout ? colors.green : colors.border;
  };

  const isCurrentMonth = (dateString: string): boolean => {
    const date = new Date(dateString);
    return (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  };

  const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const getMonthYearLabel = (): string => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getWeekLabel = (): string => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
      return `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}`;
    }
    return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}`;
  };

  const formatTooltipDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header with Navigation */}
      <View style={styles.header}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              { borderColor: colors.border },
              view === 'week' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setView('week')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.viewButtonText,
                { color: view === 'week' ? colors.background : colors.textSecondary },
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewButton,
              { borderColor: colors.border },
              view === 'month' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setView('month')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.viewButtonText,
                { color: view === 'month' ? colors.background : colors.textSecondary },
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Controls */}
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={() => (view === 'week' ? navigateWeek('prev') : navigateMonth('prev'))}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButton, { color: colors.textPrimary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.periodLabel, { color: colors.textPrimary }]}>
            {view === 'week' ? getWeekLabel() : getMonthYearLabel()}
          </Text>
          <TouchableOpacity
            onPress={() => (view === 'week' ? navigateWeek('next') : navigateMonth('next'))}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButton, { color: colors.textPrimary }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Grid */}
      {view === 'week' ? (
        // Week View - Show day labels
        <View>
          <View style={styles.weekDayLabels}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayLabel, idx) => (
              <Text key={idx} style={[styles.weekDayLabel, { color: colors.textSecondary }]}>
                {dayLabel}
              </Text>
            ))}
          </View>
          <View style={styles.weekRow}>
            {calendarDays.map((day, index) => {
              const today = isToday(day.date);
              return (
                <TouchableOpacity
                  key={day.date}
                  style={[
                    styles.weekDayCell,
                    {
                      backgroundColor: getColor(day),
                      borderColor: today ? colors.accent : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedDay(day.date === selectedDay?.date ? null : day)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.weekDayNumber,
                      { color: colors.textPrimary },
                      day.isWorkout && styles.dayNumberActive,
                    ]}
                  >
                    {new Date(day.date).getDate()}
                  </Text>
                  {selectedDay?.date === day.date && (
                    <View style={styles.selectedIndicator}>
                      <Text style={[styles.selectedText, { color: colors.background }]}>
                        {day.isWorkout ? `${day.count}` : 'R'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : (
        // Month View - Calendar Grid
        <View style={styles.calendar}>
          {calendarDays.map((day, index) => {
            const date = new Date(day.date);
            const dayNum = date.getDate();
            const inCurrentMonth = isCurrentMonth(day.date);
            const today = isToday(day.date);

            return (
              <TouchableOpacity
                key={day.date}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: getColor(day),
                    borderColor: today ? colors.accent : 'transparent',
                  },
                  !inCurrentMonth && styles.dayCellOutOfMonth,
                ]}
                onPress={() => setSelectedDay(day.date === selectedDay?.date ? null : day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    { color: inCurrentMonth ? colors.textPrimary : colors.textTertiary },
                    day.isWorkout && styles.dayNumberActive,
                  ]}
                >
                  {dayNum}
                </Text>
                {selectedDay?.date === day.date && (
                  <View style={styles.selectedIndicator}>
                    <Text style={[styles.selectedText, { color: colors.background }]}>
                      {day.isWorkout ? `${day.count} ex` : 'Rest'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  viewButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    fontSize: 28,
    fontWeight: '300',
    paddingHorizontal: 12,
  },
  periodLabel: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 140,
    textAlign: 'center',
  },
  weekDayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: CELL_GAP,
  },
  weekDayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CELL_GAP,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  dayCellOutOfMonth: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayNumberActive: {
    color: '#fff',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedText: {
    fontSize: 9,
    fontWeight: '600',
  },
});
