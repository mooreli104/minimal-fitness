import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { WorkoutDay } from '../../types';
import { getWorkoutStyles } from '../../styles/Workout.styles';
import { useTheme } from '../../context/ThemeContext';

interface DaySelectorProps {
  program: WorkoutDay[];
  onSelectDay: (day: WorkoutDay) => void;
  onLongPressDay: (day: WorkoutDay) => void;
  onAddDay: () => void;
}

const DaySelector = ({
  program,
  onSelectDay,
  onLongPressDay,
  onAddDay,
}: DaySelectorProps) => {
  const { colors } = useTheme();
  const styles = getWorkoutStyles(colors);
  return (
    <View style={styles.daySelectorContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 4 }}
        style={{ overflow: 'visible' }}
      >
        {program.map((day) => (
          <TouchableOpacity
            key={day.id}
            style={[styles.dayButton, day.isRest && styles.restDayButton]}
            onPress={() => !day.isRest && onSelectDay(day)}
            onLongPress={() => onLongPressDay(day)}
          >
            <Text style={[styles.dayButtonText, day.isRest && styles.restDayButtonText]}>{day.name}</Text>
            {day.isRest && <Text style={styles.restDayBadge}>REST</Text>}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addDayButton} onPress={onAddDay}>
          <Plus size={16} color={colors.textSecondary} />
          <Text style={styles.addDayButtonText}>Add Day</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default DaySelector;