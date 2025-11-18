import React from 'react';
import { View, Text } from 'react-native';
import { getWorkoutStyles } from '../../styles/Workout.styles';
import { useTheme } from '../../context/ThemeContext';

interface WorkoutEmptyStateProps {
  text: string;
}

const WorkoutEmptyState = ({ text }: WorkoutEmptyStateProps) => {
  const { colors } = useTheme();
  const styles = getWorkoutStyles(colors);

  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
};

export default WorkoutEmptyState;
