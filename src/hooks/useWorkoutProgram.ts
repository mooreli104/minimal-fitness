import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { WorkoutDay } from '../types';
import { generateUniqueId } from '../utils/generators';
import { DEFAULTS } from '../utils/constants';
import { loadWorkoutProgram, saveWorkoutProgram } from '../services/workoutStorage.service';

export const useWorkoutProgram = () => {
  const [program, setProgram] = useState<WorkoutDay[]>([]);

  useEffect(() => {
    const loadProgram = async () => {
      try {
        const loadedProgram = await loadWorkoutProgram();
        setProgram(loadedProgram);
      } catch (error) {
        Alert.alert('Error', 'Failed to load workout program.');
        console.error('Workout program load error:', error);
      }
    };
    loadProgram();
  }, []);

  const saveProgram = async (newProgram: WorkoutDay[]) => {
    try {
      await saveWorkoutProgram(newProgram);
      setProgram(newProgram);
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout program.');
      console.error('Workout program save error:', error);
    }
  };

  const addDayToProgram = useCallback(async (newDayName: string) => {
    const newDay: WorkoutDay = {
      id: generateUniqueId(),
      name: newDayName,
      exercises: [{ id: generateUniqueId() + 1, ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
      isRest: false,
    };
    const newProgram = [...program, newDay];
    await saveProgram(newProgram);
  }, [program]);

  const renameProgramDay = useCallback(async (dayId: number, newName: string) => {
    const newProgram = program.map((day) =>
      day.id === dayId ? { ...day, name: newName } : day
    );
    await saveProgram(newProgram);
  }, [program]);

  const duplicateProgramDay = useCallback(async (dayId: number) => {
    const dayToDuplicate = program.find((d) => d.id === dayId);
    if (!dayToDuplicate) return;

    const newDay: WorkoutDay = {
      ...dayToDuplicate,
      id: generateUniqueId(),
      name: `${dayToDuplicate.name} (Copy)`,
      isRest: dayToDuplicate.isRest,
    };

    const dayIndex = program.findIndex((d) => d.id === dayId);
    const newProgram = [...program];
    newProgram.splice(dayIndex + 1, 0, newDay);

    await saveProgram(newProgram);
  }, [program]);

  const deleteProgramDay = useCallback(async (dayId: number) => {
    const newProgram = program.filter((day) => day.id !== dayId);
    await saveProgram(newProgram);
  }, [program]);

  const toggleRestDay = useCallback(async (dayId: number) => {
    const newProgram = program.map((day) => {
      if (day.id === dayId) {
        const isRest = !day.isRest;
        return {
          ...day,
          isRest,
          exercises: isRest ? [] : [{ id: generateUniqueId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
        };
      }
      return day;
    });

    await saveProgram(newProgram);
  }, [program]);

  const addExerciseToDay = useCallback(async (dayId: number) => {
    const newProgram = program.map(day => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        exercises: [...day.exercises, { id: generateUniqueId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
      };
    });
    await saveProgram(newProgram);
  }, [program]);

  const updateExerciseInDay = useCallback(async (
    dayId: number, exerciseId: number, field: 'name' | 'target', value: string
  ) => {
    const newProgram = program.map(day => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        exercises: day.exercises.map(ex =>
          ex.id === exerciseId ? { ...ex, [field]: value } : ex
        ),
      };
    });
    await saveProgram(newProgram);
  }, [program]);

  const removeExerciseFromDay = useCallback(async (dayId: number, exerciseId: number) => {
    const newProgram = program.map(day => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        exercises: day.exercises.filter(ex => ex.id !== exerciseId),
      };
    });
    await saveProgram(newProgram);
  }, [program]);

  const reorderDays = useCallback(async (newOrder: WorkoutDay[]) => {
    await saveProgram(newOrder);
  }, []);

  return {
    program,
    addDayToProgram,
    renameProgramDay,
    duplicateProgramDay,
    deleteProgramDay,
    toggleRestDay,
    addExerciseToDay,
    updateExerciseInDay,
    removeExerciseFromDay,
    reorderDays,
    setProgram: saveProgram, // Use saveProgram to persist changes
  };
};
