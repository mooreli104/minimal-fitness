import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/Workout.styles';

interface WorkoutHeaderProps {
  onOpenTemplateManager: () => void;
}

const WorkoutHeader = ({ onOpenTemplateManager }: WorkoutHeaderProps) => {
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
