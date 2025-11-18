import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Exercise, WorkoutDay, WorkoutTemplate } from '../types';
import { generateId } from '../utils/generators';
import { DEFAULTS } from '../utils/constants';
import { getYesterday } from '../utils/formatters';
import {
  loadWorkoutLog,
  saveWorkoutLog as saveWorkoutLogService,
  deleteWorkoutLog,
  loadWorkoutProgram,
  saveWorkoutProgram,
  loadWorkoutTemplates,
  saveWorkoutTemplates,
} from '../services/workoutStorage.service';

/**
 * Hook for managing workout logs, programs, and templates
 * Handles all workout-related state and AsyncStorage operations
 */
export const useWorkout = (selectedDate: Date) => {
  const [workoutLog, setWorkoutLog] = useState<WorkoutDay | null>(null);
  const [program, setProgram] = useState<WorkoutDay[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yesterdaysWorkoutName, setYesterdaysWorkoutName] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const isFocused = useIsFocused();

  /**
   * Loads all workout data (log, program, templates)
   */
  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      // Load current day's workout log
      const log = await loadWorkoutLog(selectedDate);
      setWorkoutLog(log);

      // Load yesterday's workout name
      const yesterdayLog = await loadWorkoutLog(getYesterday(selectedDate));
      if (yesterdayLog) {
        setYesterdaysWorkoutName(yesterdayLog.isRest ? 'REST_DAY' : yesterdayLog.name ?? null);
      } else {
        setYesterdaysWorkoutName(null);
      }

      // Load program and templates
      const [loadedProgram, loadedTemplates] = await Promise.all([
        loadWorkoutProgram(),
        loadWorkoutTemplates(),
      ]);

      setProgram(loadedProgram);
      setTemplates(loadedTemplates);
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

  /**
   * Saves the current workout log
   */
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

  // Initial load on mount
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Reload data when screen regains focus (without loading state)
  useEffect(() => {
    if (isFocused && hasInitiallyLoaded) {
      loadData(false);
    }
  }, [isFocused, hasInitiallyLoaded, loadData]);

  // ========== Program Management ==========

  const addDayToProgram = useCallback(async (newDayName: string) => {
    const newDay: WorkoutDay = {
      id: generateId(),
      name: newDayName,
      exercises: [{ id: generateId() + 1, ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
      isRest: false,
    };
    const newProgram = [...program, newDay];
    setProgram(newProgram);
    await saveWorkoutProgram(newProgram);
  }, [program]);

  const renameProgramDay = useCallback(async (dayId: number, newName: string) => {
    const newProgram = program.map((day) =>
      day.id === dayId ? { ...day, name: newName } : day
    );
    setProgram(newProgram);
    await saveWorkoutProgram(newProgram);

    // Update current log if it matches
    if (workoutLog && workoutLog.id === dayId) {
      const updatedLog = { ...workoutLog, name: newName };
      setWorkoutLog(updatedLog);
      await saveWorkoutLog(updatedLog);
    }
  }, [program, workoutLog, saveWorkoutLog]);

  const duplicateProgramDay = useCallback(async (dayId: number) => {
    const dayToDuplicate = program.find((d) => d.id === dayId);
    if (!dayToDuplicate) return;

    const newDay: WorkoutDay = {
      ...dayToDuplicate,
      id: generateId(),
      name: `${dayToDuplicate.name} (Copy)`,
      isRest: dayToDuplicate.isRest,
    };

    const dayIndex = program.findIndex((d) => d.id === dayId);
    const newProgram = [...program];
    newProgram.splice(dayIndex + 1, 0, newDay);

    setProgram(newProgram);
    await saveWorkoutProgram(newProgram);
  }, [program]);

  const deleteProgramDay = useCallback(async (dayId: number) => {
    const newProgram = program.filter((day) => day.id !== dayId);
    setProgram(newProgram);
    await saveWorkoutProgram(newProgram);
  }, [program]);

  const toggleRestDay = useCallback(async (dayId: number) => {
    const newProgram = program.map((day) => {
      if (day.id === dayId) {
        const isRest = !day.isRest;
        return {
          ...day,
          isRest,
          exercises: isRest ? [] : [{ id: generateId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
        };
      }
      return day;
    });

    setProgram(newProgram);
    await saveWorkoutProgram(newProgram);
  }, [program]);

  // ========== Exercise Management ==========

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

  const selectDayToLog = useCallback((dayToLog: WorkoutDay) => {
    const newLog = JSON.parse(JSON.stringify(dayToLog));
    newLog.id = generateId();
    if (dayToLog.isRest) {
      newLog.exercises = [];
    }
    setWorkoutLog(newLog);
    saveWorkoutLog(newLog);
  }, [saveWorkoutLog]);

  // ========== Template Management ==========

  const saveCurrentAsTemplate = useCallback(async (templateName: string) => {
    const newTemplate: WorkoutTemplate = {
      id: generateId(),
      name: templateName,
      days: program,
    };
    const newTemplates = [...templates, newTemplate];
    setTemplates(newTemplates);
    await saveWorkoutTemplates(newTemplates);
    Alert.alert('Success', `Template "${templateName}" saved.`);
  }, [program, templates]);

  const loadTemplate = useCallback(async (template: WorkoutTemplate) => {
    const newProgram = template.days.map((day) => ({
      ...day,
      isRest: day.isRest ?? false,
    }));
    setProgram(newProgram);
    await saveWorkoutProgram(newProgram);
    setWorkoutLog(null);
  }, []);

  const renameTemplate = useCallback(async (templateId: number, newName: string) => {
    const newTemplates = templates.map((t) =>
      t.id === templateId ? { ...t, name: newName } : t
    );
    setTemplates(newTemplates);
    await saveWorkoutTemplates(newTemplates);
  }, [templates]);

  const deleteTemplate = useCallback(async (templateId: number) => {
    const newTemplates = templates.filter((t) => t.id !== templateId);
    setTemplates(newTemplates);
    await saveWorkoutTemplates(newTemplates);
  }, [templates]);

  return {
    workoutLog,
    program,
    templates,
    isLoading,
    yesterdaysWorkoutName,
    addDayToProgram,
    renameProgramDay,
    duplicateProgramDay,
    deleteProgramDay,
    toggleRestDay,
    addExerciseToLog,
    updateExerciseInLog,
    deleteExerciseFromLog,
    selectDayToLog,
    saveCurrentAsTemplate,
    loadTemplate,
    renameTemplate,
    deleteTemplate,
    setWorkoutLog,
    saveWorkoutLog,
  };
};
