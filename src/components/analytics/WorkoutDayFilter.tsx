/**
 * Workout Day Filter
 * Horizontal scrollable filter for selecting workout day
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface WorkoutDayFilterProps {
  workoutDays: string[];
  selected: string | null;
  onSelect: (workoutDay: string | null) => void;
}

export const WorkoutDayFilter: React.FC<WorkoutDayFilterProps> = ({
  workoutDays,
  selected,
  onSelect,
}) => {
  const { colors } = useTheme();

  if (workoutDays.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.container}
    >
      <TouchableOpacity
        style={[
          styles.chip,
          { backgroundColor: colors.surface, borderColor: colors.border },
          selected === null && { backgroundColor: colors.accent, borderColor: colors.accent },
        ]}
        onPress={() => onSelect(null)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.chipText,
            { color: selected === null ? colors.background : colors.textSecondary },
            selected === null && styles.chipTextSelected,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {workoutDays.map((day) => {
        const isSelected = selected === day;
        return (
          <TouchableOpacity
            key={day}
            style={[
              styles.chip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isSelected && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
            onPress={() => onSelect(day)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? colors.background : colors.textSecondary },
                isSelected && styles.chipTextSelected,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    fontWeight: '600',
  },
});
