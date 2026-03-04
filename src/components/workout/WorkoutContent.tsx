import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Exercise, WorkoutDay } from '../../types';
import WorkoutTable from './WorkoutTable';
import WorkoutEmptyState from './WorkoutEmptyState';
import { getWorkoutStyles } from '../../styles/Workout.styles';

interface WorkoutContentProps {
  workoutLog: WorkoutDay | null;
  previousExercises: Exercise[];
  isLoading: boolean;
  onOpenRenameModal: () => void;
  onToggleRestDay: () => void;
  onUpdateExercise: (exerciseId: number, field: keyof Exercise, value: string) => void;
  onDeleteExercise: (exerciseId: number) => void;
  onAddExercise: () => void;
  onShowHistory?: (exerciseName: string) => void;
}

export const WorkoutContent: React.FC<WorkoutContentProps> = ({
  workoutLog,
  previousExercises,
  isLoading,
  onOpenRenameModal,
  onToggleRestDay,
  onUpdateExercise,
  onDeleteExercise,
  onAddExercise,
  onShowHistory,
}) => {
  const { colors } = useTheme();
  const styles = getWorkoutStyles(colors);

  if (isLoading) {
    return <Text style={styles.loadingText}>Loading workouts...</Text>;
  }

  if (!workoutLog) {
    return <WorkoutEmptyState text="Select a workout day above to start logging." />;
  }
  if (workoutLog.isRest) {
    return <WorkoutEmptyState text="Rest day." />;
  }

  return (
    <>
      <View style={styles.workoutDayHeader}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity onLongPress={onOpenRenameModal}>
            <Text style={styles.workoutDayHeaderText}>{workoutLog.name}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.restToggle} onPress={onToggleRestDay}>
          <Text style={styles.restToggleText}>Rest Day</Text>
        </TouchableOpacity>
      </View>
      <WorkoutTable
        exercises={workoutLog.exercises}
        previousExercises={previousExercises}
        onExerciseChange={onUpdateExercise}
        onDeleteExercise={onDeleteExercise}
        onAddExercise={onAddExercise}
        onShowHistory={onShowHistory}
      />
    </>
  );
};
