import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, WorkoutDay, WorkoutTemplate } from '../types';
import { useIsFocused } from '@react-navigation/native';

const WORKOUT_LOG_PREFIX = '@workoutlog_';
const WORKOUT_PROGRAM_KEY = '@workoutProgram';
const WORKOUT_TEMPLATES_KEY = '@workoutTemplates';

export const useWorkout = (selectedDate: Date) => {
  const [workoutLog, setWorkoutLog] = useState<WorkoutDay | null>(null);
  const [program, setProgram] = useState<WorkoutDay[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yesterdaysWorkoutName, setYesterdaysWorkoutName] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const dateKey = selectedDate.toISOString().split('T')[0];
  const storageKey = `${WORKOUT_LOG_PREFIX}${dateKey}`;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedLog = await AsyncStorage.getItem(storageKey);
      const storedProgram = await AsyncStorage.getItem(WORKOUT_PROGRAM_KEY);
      const storedTemplates = await AsyncStorage.getItem(WORKOUT_TEMPLATES_KEY);

      if (storedLog) {
        setWorkoutLog(JSON.parse(storedLog));
      } else {
        setWorkoutLog(null);
      }

      const yesterday = new Date(selectedDate);
      yesterday.setDate(selectedDate.getDate() - 1);
      const yesterdayStorageKey = `${WORKOUT_LOG_PREFIX}${yesterday.toISOString().split('T')[0]}`;
      const storedYesterdayLog = await AsyncStorage.getItem(yesterdayStorageKey);
      if (storedYesterdayLog) {
        const yLog: WorkoutDay = JSON.parse(storedYesterdayLog);

        if (yLog.isRest) {
          setYesterdaysWorkoutName("REST_DAY");
        } else {
          setYesterdaysWorkoutName(yLog.name ?? null);
        }
      } else {
        setYesterdaysWorkoutName(null);
      }

      if (storedProgram) {
        setProgram(JSON.parse(storedProgram));
      }

      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load workout data.');
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, selectedDate]);

  const saveWorkoutLog = useCallback(async (log: WorkoutDay | null) => {
    try {
      if (log) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(log));
      } else {
        await AsyncStorage.removeItem(storageKey);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save workout log.');
    }
  }, [storageKey]);

  const saveProgram = useCallback(async (newProgram: WorkoutDay[]) => {
    try {
      await AsyncStorage.setItem(WORKOUT_PROGRAM_KEY, JSON.stringify(newProgram));
    } catch (e) {
      Alert.alert('Error', 'Failed to save program.');
    }
  }, []);

  const saveTemplates = useCallback(async (newTemplates: WorkoutTemplate[]) => {
    try {
      await AsyncStorage.setItem(WORKOUT_TEMPLATES_KEY, JSON.stringify(newTemplates));
    } catch (e) {
      Alert.alert('Error', 'Failed to save templates.');
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  const addDayToProgram = (newDayName: string) => {
    const newDay: WorkoutDay = {
      id: Date.now(),
      name: newDayName,
      exercises: [{ id: Date.now() + 1, name: '', sets: '', reps: '', weight: '' }],
      isRest: false,
    };
    const newProgram = [...program, newDay];
    setProgram(newProgram);
    saveProgram(newProgram);
  };

  const renameProgramDay = (dayId: number, newName: string) => {
    const newProgram = program.map((day) => (day.id === dayId ? { ...day, name: newName } : day));
    setProgram(newProgram);
    saveProgram(newProgram);

    if (workoutLog && workoutLog.id === dayId) {
      const updatedLog = { ...workoutLog, name: newName };
      setWorkoutLog(updatedLog);
      saveWorkoutLog(updatedLog);
    }
  };

  const duplicateProgramDay = (dayId: number) => {
    const dayToDuplicate = program.find(d => d.id === dayId);
    if (!dayToDuplicate) return;
    const newDay: WorkoutDay = {
      ...dayToDuplicate,
      id: Date.now(),
      name: `${dayToDuplicate.name} (Copy)`,
      isRest: dayToDuplicate.isRest,
    };
    const dayIndex = program.findIndex((d) => d.id === dayId);
    const newProgram = [...program];
    newProgram.splice(dayIndex + 1, 0, newDay);
    setProgram(newProgram);
    saveProgram(newProgram);
  };

  const deleteProgramDay = (dayId: number) => {
    const newProgram = program.filter((day) => day.id !== dayId);
    setProgram(newProgram);
    saveProgram(newProgram);
  };

  const toggleRestDay = (dayId: number) => {
    const newProgram = program.map((day) => {
      if (day.id === dayId) {
        const isRest = !day.isRest;
        return {
          ...day,
          isRest,
          exercises: isRest ? [] : [{ id: Date.now(), name: '', sets: '', reps: '', weight: '' }],
        };
      }
      return day;
    });
    setProgram(newProgram);
    saveProgram(newProgram);
  };

  const addExerciseToLog = () => {
    if (!workoutLog) {
      const newWorkout: WorkoutDay = { id: Date.now(), name: 'Workout', exercises: [{ id: Date.now(), name: '', sets: '', reps: '', weight: '' }] };
      setWorkoutLog(newWorkout);
      saveWorkoutLog(newWorkout);
      return;
    }
    const newExercise: Exercise = { id: Date.now(), name: '', sets: '', reps: '', weight: '' };
    const updatedLog = { ...workoutLog, exercises: [...workoutLog.exercises, newExercise] };
    setWorkoutLog(updatedLog);
    saveWorkoutLog(updatedLog);
  };

  const updateExerciseInLog = (exerciseId: number, field: keyof Exercise, value: string) => {
    if (!workoutLog) return;
    const updatedExercises = workoutLog.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    );
    const updatedLog = { ...workoutLog, exercises: updatedExercises };
    setWorkoutLog(updatedLog);
    saveWorkoutLog(updatedLog);
  };

  const deleteExerciseFromLog = (exerciseId: number) => {
    if (!workoutLog) return;
    const updatedExercises = workoutLog.exercises.filter((ex) => ex.id !== exerciseId);
    const updatedLog = { ...workoutLog, exercises: updatedExercises };
    setWorkoutLog(updatedLog);
    saveWorkoutLog(updatedLog);
  };

  const selectDayToLog = (dayToLog: WorkoutDay) => {
    const newLog = JSON.parse(JSON.stringify(dayToLog));
    newLog.id = Date.now();
    if (dayToLog.isRest) {
      newLog.exercises = [];
    }
    setWorkoutLog(newLog);
    saveWorkoutLog(newLog);
  };

  const saveCurrentAsTemplate = (templateName: string) => {
    const newTemplate: WorkoutTemplate = {
      id: Date.now(),
      name: templateName,
      days: program,
    };
    const newTemplates = [...templates, newTemplate];
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
    Alert.alert('Success', `Template "${templateName}" saved.`);
  };

  const loadTemplate = (template: WorkoutTemplate) => {
    const newProgram = template.days.map(day => ({
      ...day,
      isRest: day.isRest ?? false,
    }));
    setProgram(newProgram);
    saveProgram(newProgram);
    setWorkoutLog(null);
  };

  const renameTemplate = (templateId: number, newName: string) => {
    const newTemplates = templates.map((t) => (t.id === templateId ? { ...t, name: newName } : t));
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  };

  const deleteTemplate = (templateId: number) => {
    const newTemplates = templates.filter((t) => t.id !== templateId);
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  };

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
