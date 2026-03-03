import { useCallback } from 'react';
import { Alert } from 'react-native';
import { WorkoutDay, DayOfWeek, WeeklyPlan } from '../types';
import { getStartOfWeek } from '../utils/formatters';
import { generateId, generateUniqueId } from '../utils/generators';
import {
  loadWorkoutLog,
  saveWorkoutLog as saveWorkoutLogService,
} from '../services/workoutStorage.service';

interface UseWeekPopulatorParams {
  program: WorkoutDay[];
  weeklyPlan: WeeklyPlan;
  selectedDate: Date;
  updateDayPlan: (day: DayOfWeek, dayId: number | null) => void;
  setWorkoutLog: (log: WorkoutDay | null) => void;
}

export const useWeekPopulator = ({
  program,
  weeklyPlan,
  selectedDate,
  updateDayPlan,
  setWorkoutLog,
}: UseWeekPopulatorParams) => {

  const populateWeek = useCallback(async (hasWeeklyPlan: boolean, shouldOverride: boolean) => {
    try {
      const daysOfWeek: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const workoutDays = program.filter(day => !day.isRest);

      // If no weekly plan exists, create a default repeating pattern
      if (!hasWeeklyPlan) {
        daysOfWeek.forEach((day, index) => {
          const workoutIndex = index % workoutDays.length;
          updateDayPlan(day, workoutDays[workoutIndex].id);
        });
        // Wait a bit for the weekly plan to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create actual workout logs for the current week based on weekly plan
      const startOfWeek = getStartOfWeek(selectedDate);
      let logsCreated = 0;
      let logsOverwritten = 0;
      let logsSkipped = 0;

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dayOfWeek = daysOfWeek[i];

        // Get the workout ID from the weekly plan for this day
        const workoutDayId = weeklyPlan[dayOfWeek];

        // Skip if no workout assigned for this day
        if (workoutDayId === null) {
          continue;
        }

        // Check if there's already a workout log for this date
        const existingLog = await loadWorkoutLog(date);
        if (existingLog && !shouldOverride) {
          logsSkipped++;
          continue;
        }

        // Find the workout day template
        const workoutDay = program.find(day => day.id === workoutDayId);

        if (!workoutDay) {
          continue;
        }

        // Create a fresh workout log from the template (without copying exercise logs)
        const newLog: WorkoutDay = {
          id: generateId(),
          name: workoutDay.name,
          isRest: workoutDay.isRest,
          exercises: workoutDay.exercises.map(exercise => ({
            id: generateUniqueId(),
            name: exercise.name,
            target: exercise.target,
            actual: '',
            weight: '',
            sets: exercise.sets,
          })),
        };

        await saveWorkoutLogService(date, newLog);

        if (existingLog) {
          logsOverwritten++;
        } else {
          logsCreated++;
        }
      }

      // Reload current day's data if it was in the populated range
      const currentLog = await loadWorkoutLog(selectedDate);
      if (currentLog) {
        setWorkoutLog(currentLog);
      }

      // Show appropriate success message
      const total = logsCreated + logsOverwritten;
      if (total > 0) {
        let message = '';
        if (logsOverwritten > 0 && logsCreated > 0) {
          message = `Created ${logsCreated} new log${logsCreated > 1 ? 's' : ''} and overwritten ${logsOverwritten} existing log${logsOverwritten > 1 ? 's' : ''}.`;
        } else if (logsOverwritten > 0) {
          message = `Overwritten ${logsOverwritten} workout log${logsOverwritten > 1 ? 's' : ''}.`;
        } else {
          message = `Created ${logsCreated} workout log${logsCreated > 1 ? 's' : ''} for the week!`;
        }

        if (logsSkipped > 0) {
          message += ` Skipped ${logsSkipped} existing log${logsSkipped > 1 ? 's' : ''}.`;
        }

        Alert.alert('Success', message);
      } else {
        Alert.alert('Info', 'All days in the week already have workout logs.');
      }
    } catch (error) {
      console.error('Error populating week:', error);
      Alert.alert('Error', 'Failed to populate the week. Please try again.');
    }
  }, [program, weeklyPlan, selectedDate, updateDayPlan, setWorkoutLog]);

  const handlePopulateWeek = useCallback(async () => {
    const workoutDays = program.filter(day => !day.isRest);

    if (workoutDays.length === 0) {
      Alert.alert('No Workouts', 'Please add workout days to your program first.');
      return;
    }

    // Check if user has set up a weekly plan
    const hasWeeklyPlan = Object.values(weeklyPlan).some(dayId => dayId !== null);

    // Check for existing logs in the current week
    const startOfWeek = getStartOfWeek(selectedDate);
    let existingLogsCount = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const existingLog = await loadWorkoutLog(date);
      if (existingLog) {
        existingLogsCount++;
      }
    }

    const message = hasWeeklyPlan
      ? 'This will create workout logs for the current week based on your weekly plan.'
      : `This will set up a default weekly plan and create workout logs with your ${workoutDays.length} workout day${workoutDays.length > 1 ? 's' : ''} in a repeating pattern.`;

    // If there are existing logs, ask about override behavior
    if (existingLogsCount > 0) {
      Alert.alert(
        'Auto-Populate Week',
        `${message}\n\nFound ${existingLogsCount} existing workout log${existingLogsCount > 1 ? 's' : ''} in the current week. What would you like to do?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Skip Existing',
            onPress: () => populateWeek(hasWeeklyPlan, false),
          },
          {
            text: 'Override All',
            style: 'destructive',
            onPress: () => populateWeek(hasWeeklyPlan, true),
          },
        ]
      );
    } else {
      // No existing logs, just populate
      Alert.alert(
        'Auto-Populate Week',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Populate',
            onPress: () => populateWeek(hasWeeklyPlan, false),
          },
        ]
      );
    }
  }, [program, weeklyPlan, selectedDate, populateWeek]);

  return { handlePopulateWeek };
};
