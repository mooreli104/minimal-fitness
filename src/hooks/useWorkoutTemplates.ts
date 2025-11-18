import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { WorkoutTemplate, WorkoutDay } from '../types';
import { generateId } from '../utils/generators';
import { loadWorkoutTemplates, saveWorkoutTemplates } from '../services/workoutStorage.service';

export const useWorkoutTemplates = (program: WorkoutDay[]) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await loadWorkoutTemplates();
        setTemplates(loadedTemplates);
      } catch (error) {
        Alert.alert('Error', 'Failed to load workout templates.');
        console.error('Workout templates load error:', error);
      }
    };
    loadTemplates();
  }, []);

  const saveTemplates = async (newTemplates: WorkoutTemplate[]) => {
    try {
      await saveWorkoutTemplates(newTemplates);
      setTemplates(newTemplates);
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout templates.');
      console.error('Workout templates save error:', error);
    }
  };

  const saveCurrentAsTemplate = useCallback(async (templateName: string) => {
    const newTemplate: WorkoutTemplate = {
      id: generateId(),
      name: templateName,
      days: program,
    };
    const newTemplates = [...templates, newTemplate];
    await saveTemplates(newTemplates);
    Alert.alert('Success', `Template "${templateName}" saved.`);
  }, [program, templates]);

  const renameTemplate = useCallback(async (templateId: number, newName: string) => {
    const newTemplates = templates.map((t) =>
      t.id === templateId ? { ...t, name: newName } : t
    );
    await saveTemplates(newTemplates);
  }, [templates]);

  const deleteTemplate = useCallback(async (templateId: number) => {
    const newTemplates = templates.filter((t) => t.id !== templateId);
    await saveTemplates(newTemplates);
  }, [templates]);

  return {
    templates,
    saveCurrentAsTemplate,
    renameTemplate,
    deleteTemplate,
  };
};
