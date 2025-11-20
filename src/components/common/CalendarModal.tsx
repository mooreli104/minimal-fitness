import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

interface CalendarModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const CalendarModal = ({ isVisible, onClose, onDateSelect, selectedDate: initialSelectedDate }: CalendarModalProps) => {
  const { colors } = useTheme();
  const [displayDate, setDisplayDate] = useState(new Date(initialSelectedDate));

  useEffect(() => {
    if (isVisible) {
      setDisplayDate(new Date(initialSelectedDate));
    }
  }, [isVisible, initialSelectedDate]);

  const changeMonth = (amount: number) => {
    const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth() + amount, 1);
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
          style={[styles.calendarDay, isSelected && { backgroundColor: colors.accent, borderRadius: 20 }]}
          onPress={() => handleSelectDate(day)}
          disabled={isFuture}
        >
          <Text style={[
            styles.calendarDayText,
            { color: colors.textPrimary },
            isToday && styles.calendarDayTextToday,
            isSelected && { color: colors.background, fontWeight: '600' },
            isFuture && { color: colors.textTertiary },
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
        <View style={[styles.calendarContainer, { backgroundColor: colors.cardBackground }]} onStartShouldSetResponder={() => true}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calendarNav}>
              <ChevronLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.calendarMonthText, { color: colors.textPrimary }]}>
              {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.calendarNav} disabled={isFutureMonth}>
              <ChevronRight size={20} color={isFutureMonth ? colors.textTertiary : colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarWeekDays}>
            {weekDays.map((day, index) => <Text key={index} style={[styles.calendarWeekDayText, { color: colors.textTertiary }]}>{day}</Text>)}
          </View>
          <View style={styles.calendarGrid}>{renderCalendar()}</View>
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
  },
  calendarDayText: { fontSize: 18, fontWeight: '500' },
  calendarDayTextToday: { fontWeight: 'bold', color: '#007AFF' },
});

export default CalendarModal;
