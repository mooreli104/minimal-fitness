import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Exercise } from '../../types';
import ExerciseRow from './ExerciseRow';
import { styles } from '../../styles/Workout.styles';

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
  return (
    <>
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
        <Plus size={16} color="#000" strokeWidth={2} />
        <Text style={styles.addButtonText}>Add exercise</Text>
      </TouchableOpacity>
    </>
  );
};

export default WorkoutTable;
