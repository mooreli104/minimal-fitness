import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { Plus } from 'lucide-react-native';
import { Exercise } from '../../types';
import ExerciseRow from './ExerciseRow';
import { getWorkoutStyles } from '../../styles/Workout.styles';
import { useTheme } from '../../context/ThemeContext';

interface WorkoutTableProps {
  exercises: Exercise[];
  previousExercises: Exercise[];
  onExerciseChange: (id: number, field: keyof Exercise, value: string) => void;
  onDeleteExercise: (id: number) => void;
  onAddExercise: () => void;
  onReorderExercises: (newOrder: Exercise[]) => void;
  onShowHistory?: (exerciseName: string) => void;
}

const WorkoutTable = ({
  exercises,
  previousExercises,
  onExerciseChange,
  onDeleteExercise,
  onAddExercise,
  onReorderExercises,
  onShowHistory,
}: WorkoutTableProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getWorkoutStyles(colors), [colors]);

  // Find matching exercise from previous workout by name
  const findPreviousExercise = useCallback((exerciseName: string): Exercise | undefined => {
    if (!exerciseName) return undefined;
    return previousExercises.find(ex => ex.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
  }, [previousExercises]);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Exercise>) => (
    <ScaleDecorator>
      <ExerciseRow
        item={item}
        previousExercise={findPreviousExercise(item.name)}
        onExerciseChange={onExerciseChange}
        onDeleteExercise={onDeleteExercise}
        onShowHistory={onShowHistory}
        drag={drag}
        isActive={isActive}
      />
    </ScaleDecorator>
  ), [findPreviousExercise, onExerciseChange, onDeleteExercise, onShowHistory]);

  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableInner}>
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={[styles.headerText, styles.exerciseCol]}>Exercise</Text>
          <Text style={[styles.headerText, styles.targetActualCol]}>Target</Text>
          <Text style={[styles.headerText, styles.targetActualCol]}>Actual</Text>
          <Text style={[styles.headerText, styles.numberCol]}>Weight</Text>
        </View>
        <DraggableFlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          onDragEnd={({ data }) => onReorderExercises(data)}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.addButton} onPress={onAddExercise}>
          <Plus size={16} color={colors.textPrimary} strokeWidth={2} />
          <Text style={styles.addButtonText}>Add exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutTable;
