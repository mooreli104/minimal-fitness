import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../styles/Workout.styles';

interface WorkoutEmptyStateProps {
  text: string;
}

const WorkoutEmptyState = ({ text }: WorkoutEmptyStateProps) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
};

export default WorkoutEmptyState;
