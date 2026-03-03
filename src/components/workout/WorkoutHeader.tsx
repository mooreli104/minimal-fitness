import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getWorkoutStyles } from '../../styles/Workout.styles';
import { useTheme } from '../../context/ThemeContext';

interface WorkoutHeaderProps {
  onOpenTemplateManager: () => void;
  onOpenProgramEditor: () => void;
}

const WorkoutHeader = ({ onOpenTemplateManager, onOpenProgramEditor }: WorkoutHeaderProps) => {
  const { colors } = useTheme();
  const styles = getWorkoutStyles(colors);
  return (
    <View style={styles.headerRow}>
      <Text style={styles.header}>Log Workout</Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity onPress={onOpenProgramEditor}>
          <Text style={styles.templateButton}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenTemplateManager}>
          <Text style={styles.templateButton}>Templates</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutHeader;
