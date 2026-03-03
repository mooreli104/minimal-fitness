import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { WorkoutTemplate } from '../types';
import { useWorkoutLog } from './useWorkoutLog';
import { useWorkoutProgram } from './useWorkoutProgram';
import { useWorkoutTemplates } from './useWorkoutTemplates';

export const useWorkout = (selectedDate: Date) => {
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const isFocused = useIsFocused();

  const log = useWorkoutLog(selectedDate);
  const programManager = useWorkoutProgram();
  const templateManager = useWorkoutTemplates(programManager.program);

  useEffect(() => {
    log.loadData(true).then(() => setHasInitiallyLoaded(true));
  }, [log.loadData]);

  useEffect(() => {
    if (isFocused && hasInitiallyLoaded) {
      log.loadData(false);
    }
  }, [isFocused, hasInitiallyLoaded, log.loadData]);

  const loadTemplate = (template: WorkoutTemplate) => {
    programManager.setProgram(template.days.map(day => ({
      ...day,
      isRest: day.isRest ?? false,
    })));
    log.setWorkoutLog(null);
  };

  return {
    ...log,
    program: programManager.program,
    ...programManager,
    templates: templateManager.templates,
    ...templateManager,
    loadTemplate,
  };
};
