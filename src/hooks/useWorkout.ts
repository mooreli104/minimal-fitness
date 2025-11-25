import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Exercise, WorkoutDay } from '../types';
import { generateId } from '../utils/generators';
import { DEFAULTS } from '../utils/constants';
import { getYesterday } from '../utils/formatters';
import {
  loadWorkoutLog,
  saveWorkoutLog as saveWorkoutLogService,
  deleteWorkoutLog,
  findPreviousWorkoutByName,
  findLastExerciseOccurrence,
} from '../services/workoutStorage.service';
import { useWorkoutProgram } from './useWorkoutProgram';
import { useWorkoutTemplates } from './useWorkoutTemplates';

export const useWorkout = (selectedDate: Date) => {
  const [workoutLog, setWorkoutLog] = useState<WorkoutDay | null>(null);
  const [previousWorkout, setPreviousWorkout] = useState<WorkoutDay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [yesterdaysWorkoutName, setYesterdaysWorkoutName] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const isFocused = useIsFocused();

  const { program, ...programManager } = useWorkoutProgram();
  const { templates, ...templateManager } = useWorkoutTemplates(program);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const log = await loadWorkoutLog(selectedDate);
      setWorkoutLog(log);

      // Load previous workout with the same name for placeholders
      if (log && !log.isRest && log.name) {
        const prevWorkout = await findPreviousWorkoutByName(log.name, selectedDate);
        setPreviousWorkout(prevWorkout);
      } else {
        setPreviousWorkout(null);
      }

      const yesterdayLog = await loadWorkoutLog(getYesterday(selectedDate));
      if (yesterdayLog) {
        setYesterdaysWorkoutName(yesterdayLog.isRest ? 'REST_DAY' : yesterdayLog.name ?? null);
      } else {
        setYesterdaysWorkoutName(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load workout data.');
      console.error('Workout data load error:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
      setHasInitiallyLoaded(true);
    }
  }, [selectedDate]);

  const saveWorkoutLog = useCallback(async (log: WorkoutDay | null) => {
    try {
      if (log) {
        await saveWorkoutLogService(selectedDate, log);
      } else {
        await deleteWorkoutLog(selectedDate);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout log.');
      console.error('Workout log save error:', error);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  useEffect(() => {
    if (isFocused && hasInitiallyLoaded) {
      loadData(false);
    }
  }, [isFocused, hasInitiallyLoaded, loadData]);

  const addExerciseToLog = useCallback(() => {
    if (!workoutLog) {
      const newWorkout: WorkoutDay = {
        id: generateId(),
        name: 'Workout',
        exercises: [{ id: generateId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
      };
      setWorkoutLog(newWorkout);
      saveWorkoutLog(newWorkout);
      return;
    }

    const newExercise: Exercise = { id: generateId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE };
    const updatedLog = { ...workoutLog, exercises: [...workoutLog.exercises, newExercise] };
    setWorkoutLog(updatedLog);
    saveWorkoutLog(updatedLog);
  }, [workoutLog, saveWorkoutLog]);

  const updateExerciseInLog = useCallback((exerciseId: number, field: keyof Exercise, value: string) => {
    if (!workoutLog) return;

    const updatedExercises = workoutLog.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    );
    const updatedLog = { ...workoutLog, exercises: updatedExercises };
    setWorkoutLog(updatedLog);
    saveWorkoutLog(updatedLog);
  }, [workoutLog, saveWorkoutLog]);

  const deleteExerciseFromLog = useCallback((exerciseId: number) => {
    if (!workoutLog) return;

    const updatedExercises = workoutLog.exercises.filter((ex) => ex.id !== exerciseId);
    const updatedLog = { ...workoutLog, exercises: updatedExercises };
    setWorkoutLog(updatedLog);
    saveWorkoutLog(updatedLog);
  }, [workoutLog, saveWorkoutLog]);

  const selectDayToLog = useCallback(async (dayToLog: WorkoutDay) => {
    const newLog = JSON.parse(JSON.stringify(dayToLog));
    newLog.id = generateId();
    if (dayToLog.isRest) {
      newLog.exercises = [];
    }
    setWorkoutLog(newLog);
    await saveWorkoutLog(newLog);

    // Load previous workout for placeholders immediately
    if (!dayToLog.isRest && dayToLog.name) {
      const prevWorkout = await findPreviousWorkoutByName(dayToLog.name, selectedDate);
      setPreviousWorkout(prevWorkout);
    } else {
      setPreviousWorkout(null);
    }
  }, [saveWorkoutLog, selectedDate]);

  const loadTemplate = useCallback(async (template: any) => {
    const newProgram = template.days.map((day: any) => ({
      ...day,
      isRest: day.isRest ?? false,
    }));
    programManager.setProgram(newProgram);
    setWorkoutLog(null);
  }, [programManager]);

  return {
    workoutLog,
    previousWorkout,
    program,
    templates,
    isLoading,
    yesterdaysWorkoutName,
    addExerciseToLog,
    updateExerciseInLog,
    deleteExerciseFromLog,
    selectDayToLog,
    setWorkoutLog,
    saveWorkoutLog,
    loadTemplate,
    ...programManager,
    ...templateManager,
  };
};
