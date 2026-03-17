import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Exercise, WorkoutDay } from '../types';
import { generateUniqueId } from '../utils/generators';
import { DEFAULTS } from '../utils/constants';
import {
  loadWorkoutLog as loadWorkoutLogService,
  saveWorkoutLog as saveWorkoutLogService,
  deleteWorkoutLog,
  findLastLoggedExercises,
} from '../services/workoutStorage.service';
import { getYesterday } from '../utils/formatters';

export const useWorkoutLog = (selectedDate: Date) => {
  const [workoutLog, setWorkoutLog] = useState<WorkoutDay | null>(null);
  const [previousExercises, setPreviousExercises] = useState<Exercise[]>([]);
  const [yesterdaysWorkoutName, setYesterdaysWorkoutName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveLog = useCallback(async (log: WorkoutDay | null) => {
    try {
      if (log) {
        await saveWorkoutLogService(selectedDate, log);
      } else {
        await deleteWorkoutLog(selectedDate);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout log.');
    }
  }, [selectedDate]);

  /** Apply a transform to the current log and persist */
  const mutateLog = useCallback((transform: (log: WorkoutDay) => WorkoutDay) => {
    if (!workoutLog) return;
    const updated = transform(workoutLog);
    setWorkoutLog(updated);
    saveLog(updated);
  }, [workoutLog, saveLog]);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const log = await loadWorkoutLogService(selectedDate);
      setWorkoutLog(log);

      const prevExercises = await findLastLoggedExercises(selectedDate);
      setPreviousExercises(prevExercises);

      const yesterdayLog = await loadWorkoutLogService(getYesterday(selectedDate));
      setYesterdaysWorkoutName(
        yesterdayLog ? (yesterdayLog.isRest ? 'REST_DAY' : yesterdayLog.name ?? null) : null
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load workout data.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [selectedDate]);

  const addExercise = useCallback(() => {
    if (!workoutLog) {
      const newWorkout: WorkoutDay = {
        id: generateUniqueId(),
        name: 'Workout',
        exercises: [{ id: generateUniqueId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
      };
      setWorkoutLog(newWorkout);
      saveLog(newWorkout);
      return;
    }
    mutateLog(log => ({
      ...log,
      exercises: [...log.exercises, { id: generateUniqueId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
    }));
  }, [workoutLog, saveLog, mutateLog]);

  const updateExercise = useCallback((exerciseId: number, field: keyof Exercise, value: string) => {
    mutateLog(log => ({
      ...log,
      exercises: log.exercises.map(ex => ex.id === exerciseId ? { ...ex, [field]: value } : ex),
    }));
  }, [mutateLog]);

  const deleteExercise = useCallback((exerciseId: number) => {
    mutateLog(log => ({
      ...log,
      exercises: log.exercises.filter(ex => ex.id !== exerciseId),
    }));
  }, [mutateLog]);

  const reorderExercises = useCallback((newOrder: Exercise[]) => {
    mutateLog(log => ({ ...log, exercises: newOrder }));
  }, [mutateLog]);

  const selectDayToLog = useCallback(async (dayToLog: WorkoutDay) => {
    const newLog: WorkoutDay = {
      ...structuredClone(dayToLog),
      id: generateUniqueId(),
      exercises: dayToLog.isRest ? [] : dayToLog.exercises.map(ex => ({
        ...ex,
        id: generateUniqueId(),
        actual: '',
        weight: '',
      })),
    };
    setWorkoutLog(newLog);
    await saveLog(newLog);

    const prevExercises = await findLastLoggedExercises(selectedDate);
    setPreviousExercises(prevExercises);
  }, [saveLog, selectedDate]);

  const markRestDay = useCallback(() => {
    mutateLog(log => ({ ...log, isRest: true }));
  }, [mutateLog]);

  const renameLog = useCallback((newName: string) => {
    mutateLog(log => ({ ...log, name: newName }));
  }, [mutateLog]);

  return {
    workoutLog,
    previousExercises,
    yesterdaysWorkoutName,
    isLoading,
    setWorkoutLog,
    loadData,
    addExercise,
    updateExercise,
    deleteExercise,
    reorderExercises,
    selectDayToLog,
    markRestDay,
    renameLog,
    saveLog,
  };
};
