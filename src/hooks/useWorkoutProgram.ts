import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { WorkoutDay } from '../types';
import { generateId } from '../utils/generators';
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
      id: generateId(),
      name: newDayName,
      exercises: [{ id: generateId() + 1, ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
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
      id: generateId(),
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
          exercises: isRest ? [] : [{ id: generateId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
        };
      }
      return day;
    });

    await saveProgram(newProgram);
  }, [program]);

  return {
    program,
    addDayToProgram,
    renameProgramDay,
    duplicateProgramDay,
    deleteProgramDay,
    toggleRestDay,
    setProgram: saveProgram, // Use saveProgram to persist changes
  };
};
