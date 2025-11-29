/**
 * Time Range Selector
 * Segmented control for selecting analytics time range
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TimeRange } from '../../hooks/useAnalyticsCharts';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: '1M' },
  { value: '3months', label: '3M' },
  { value: 'all', label: 'All' },
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {TIME_RANGES.map((range) => {
        const isSelected = selected === range.value;
        return (
          <TouchableOpacity
            key={range.value}
            style={[
              styles.button,
              isSelected && {
                backgroundColor: colors.accent,
              },
            ]}
            onPress={() => onSelect(range.value)}
            activeOpacity={0.7}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.buttonText,
                {
                  color: isSelected ? colors.background : colors.textSecondary,
                },
                isSelected && styles.buttonTextSelected,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonTextSelected: {
    fontWeight: '600',
  },
});
