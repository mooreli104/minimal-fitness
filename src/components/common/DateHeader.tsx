import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

interface DateHeaderProps {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onPressDate: () => void;
}

const DateHeader = ({ date, onPrev, onNext, onToday, onPressDate }: DateHeaderProps) => {
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

const styles = StyleSheet.create({
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
});

export default DateHeader;
