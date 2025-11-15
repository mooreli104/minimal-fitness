import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface DateSelectorProps {
  selectedDate: number;
  onDateChange: (day: number) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const dates = [
    { day: 12, label: "mon" },
    { day: 13, label: "tue" },
    { day: 14, label: "wed" },
    { day: 15, label: "thu" },
    { day: 16, label: "fri" },
  ];

  return (
    <View style={styles.container}>
      {dates.map((date) => {
        const isSelected = selectedDate === date.day;

        return (
          <TouchableOpacity
            key={date.day}
            onPress={() => onDateChange(date.day)}
            activeOpacity={0.7}
            style={[
              styles.dateButton,
              isSelected ? styles.selected : styles.unselected,
            ]}
          >
            <Text
              style={[
                styles.dayNumber,
                { color: isSelected ? "white" : "black" },
              ]}
            >
              {date.day}
            </Text>

            <Text
              style={[
                styles.dayLabel,
                { color: isSelected ? "white" : "black" },
              ]}
            >
              {date.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  dateButton: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  selected: {
    backgroundColor: "black",
  },
  unselected: {
    backgroundColor: "white",
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: "700",
  },
  dayLabel: {
    fontSize: 12,
    textTransform: "uppercase",
  },
});
