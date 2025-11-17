import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

interface CalendarModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const CalendarModal = ({ isVisible, onClose, onDateSelect, selectedDate: initialSelectedDate }: CalendarModalProps) => {
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
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDay = new Date(initialSelectedDate);
    selectedDay.setHours(0, 0, 0, 0);

    // Add empty views for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);

      const isToday = currentDate.getTime() === today.getTime();
      const isSelected = currentDate.getTime() === selectedDay.getTime();
      const isFuture = currentDate > today;

      calendarDays.push(
        <TouchableOpacity
          key={currentDate.toISOString()}
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

    // Add empty views for days after the last day of the month to fill the grid
    const remainingDays = 42 - (startingDayOfWeek + daysInMonth);
    for (let i = 0; i < remainingDays; i++) {
      calendarDays.push(<View key={`empty-end-${i}`} style={styles.calendarDay} />);
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

const styles = StyleSheet.create({
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

export default CalendarModal;
