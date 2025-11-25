import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTimer } from '../../context/TimerContext';
import { useTheme } from '../../context/ThemeContext';
import { Exercise, WorkoutDay } from '../../types';
import WorkoutTable from './WorkoutTable';
import WorkoutEmptyState from './WorkoutEmptyState';
import { getWorkoutStyles } from '../../styles/Workout.styles';

interface WorkoutContentProps {
  workoutLog: WorkoutDay | null;
  previousWorkout: WorkoutDay | null;
  isLoading: boolean;
  onOpenTimer: () => void;
  onOpenChangeDayModal: () => void;
  onOpenRenameModal: () => void;
  onToggleRestDay: () => void;
  onUpdateExercise: (exerciseId: number, field: keyof Exercise, value: string) => void;
  onDeleteExercise: (exerciseId: number) => void;
  onAddExercise: () => void;
}

export const WorkoutContent: React.FC<WorkoutContentProps> = ({
  workoutLog,
  previousWorkout,
  isLoading,
  onOpenTimer,
  onOpenChangeDayModal,
  onOpenRenameModal,
  onToggleRestDay,
  onUpdateExercise,
  onDeleteExercise,
  onAddExercise,
}) => {
  const { colors } = useTheme();
  const styles = getWorkoutStyles(colors);
  const { remainingSeconds, isRunning, formatTime } = useTimer();

  if (isLoading) {
    return <Text style={styles.loadingText}>Loading workouts...</Text>;
  }

  if (!workoutLog || workoutLog.isRest) {
    return <WorkoutEmptyState text="Today is a rest day." />;
  }

  return (
    <>
      <View style={styles.workoutDayHeader}>
        <TouchableOpacity style={styles.timerToggle} onPress={onOpenTimer}>
          <Text style={styles.timerToggleText}>
            {isRunning ? formatTime(remainingSeconds) : 'Start Timer'}
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity onPress={onOpenChangeDayModal} onLongPress={onOpenRenameModal}>
            <Text style={styles.workoutDayHeaderText}>{workoutLog.name}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.restToggle} onPress={onToggleRestDay}>
          <Text style={styles.restToggleText}>Rest Day</Text>
        </TouchableOpacity>
      </View>
      <WorkoutTable
        exercises={workoutLog.exercises}
        previousExercises={previousWorkout?.exercises || []}
        onExerciseChange={onUpdateExercise}
        onDeleteExercise={onDeleteExercise}
        onAddExercise={onAddExercise}
      />
    </>
  );
};
