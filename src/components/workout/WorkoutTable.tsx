import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Exercise } from '../../types';
import ExerciseRow from './ExerciseRow';
import { getWorkoutStyles } from '../../styles/Workout.styles';
import { useTheme } from '../../context/ThemeContext';

interface WorkoutTableProps {
  exercises: Exercise[];
  onExerciseChange: (id: number, field: keyof Exercise, value: string) => void;
  onDeleteExercise: (id: number) => void;
  onAddExercise: () => void;
}

const WorkoutTable = ({
  exercises,
  onExerciseChange,
  onDeleteExercise,
  onAddExercise,
}: WorkoutTableProps) => {
  const { colors } = useTheme();
  const styles = getWorkoutStyles(colors);
  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableInner}>
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={[styles.headerText, styles.exerciseCol]}>Exercise</Text>
          <Text style={[styles.headerText, styles.targetActualCol]}>Target</Text>
          <Text style={[styles.headerText, styles.targetActualCol]}>Actual</Text>
          <Text style={[styles.headerText, styles.numberCol]}>Weight</Text>
        </View>
        {exercises.map((item) => (
          <ExerciseRow
            key={item.id}
            item={item}
            onExerciseChange={onExerciseChange}
            onDeleteExercise={onDeleteExercise}
          />
        ))}
        <TouchableOpacity style={styles.addButton} onPress={onAddExercise}>
          <Plus size={16} color={colors.textPrimary} strokeWidth={2} />
          <Text style={styles.addButtonText}>Add exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutTable;
