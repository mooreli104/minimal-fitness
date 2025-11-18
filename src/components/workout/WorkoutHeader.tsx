import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getWorkoutStyles } from '../../styles/Workout.styles';
import { useTheme } from '../../context/ThemeContext';

interface WorkoutHeaderProps {
  onOpenTemplateManager: () => void;
}

const WorkoutHeader = ({ onOpenTemplateManager }: WorkoutHeaderProps) => {
  const { colors } = useTheme();
  const styles = getWorkoutStyles(colors);
  return (
    <View style={styles.headerRow}>
      <Text style={styles.header}>Log Workout</Text>
      <TouchableOpacity onPress={onOpenTemplateManager}>
        <Text style={styles.templateButton}>Templates</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WorkoutHeader;
