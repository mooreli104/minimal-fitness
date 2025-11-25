/**
 * Weight Progression Hook
 * Tracks weight progression for specific exercises over time
 */

import { useState, useEffect } from 'react';
import { loadWorkoutLog } from '../services/workoutStorage.service';
import { getDaysAgo, formatDateToKey } from '../utils/formatters';
import type { ExerciseProgressionPoint } from '../components/analytics/WeightProgressionChart';

interface UseWeightProgressionResult {
  progressionData: Map<string, ExerciseProgressionPoint[]>;
  topExercises: string[]; // Top 3-5 exercises by frequency
  exerciseToWorkoutDay: Map<string, Set<string>>; // Maps exercise name to workout day names
  allWorkoutDays: string[]; // All unique workout day names
  isLoading: boolean;
  getExercisesByWorkoutDay: (workoutDay: string | null) => string[];
}

/**
 * Extract exercise name from a string (handles variations)
 */
const normalizeExerciseName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' '); // Normalize whitespace
};

/**
 * Parse exercise actual and weight to calculate max weight for that day
 */
const parseMaxWeight = (actual: string, weight: string): number => {
  // Parse weight (could be "135", "135 lbs", etc.)
  const weightNum = parseFloat(weight) || 0;
  return weightNum;
};

/**
 * Calculate volume for an exercise
 */
const calculateVolume = (actual: string, weight: string): number => {
  const weightNum = parseFloat(weight) || 0;

  // Try "3x8" format
  const standardMatch = actual.match(/(\d+)x(\d+)/);
  if (standardMatch) {
    const sets = parseInt(standardMatch[1], 10);
    const reps = parseInt(standardMatch[2], 10);
    return sets * reps * weightNum;
  }

  // Try "10*10*10" format
  const repsArrayMatch = actual.match(/^(\d+)(?:\*(\d+))+$/);
  if (repsArrayMatch) {
    const repsArray = actual.split('*').map((n) => parseInt(n, 10));
    const totalReps = repsArray.reduce((sum, r) => sum + r, 0);
    return totalReps * weightNum;
  }

  return 0;
};

export const useWeightProgression = (
  daysToLoad: number = 90
): UseWeightProgressionResult => {
  const [progressionData, setProgressionData] = useState<
    Map<string, ExerciseProgressionPoint[]>
  >(new Map());
  const [topExercises, setTopExercises] = useState<string[]>([]);
  const [exerciseToWorkoutDay, setExerciseToWorkoutDay] = useState<
    Map<string, Set<string>>
  >(new Map());
  const [allWorkoutDays, setAllWorkoutDays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgressionData = async () => {
      setIsLoading(true);

      try {
        const today = new Date();
        const dates: Date[] = [];

        // Generate date range
        for (let i = daysToLoad - 1; i >= 0; i--) {
          dates.push(getDaysAgo(i, today));
        }

        // Load all workout logs in parallel
        const workoutLogs = await Promise.all(
          dates.map((date) => loadWorkoutLog(date))
        );

        // Build progression map: exerciseName -> array of points
        const progressionMap = new Map<string, ExerciseProgressionPoint[]>();
        const exerciseFrequency = new Map<string, number>();
        const exerciseWorkoutDayMap = new Map<string, Set<string>>();
        const workoutDaySet = new Set<string>();

        dates.forEach((date, index) => {
          const workout = workoutLogs[index];
          if (!workout || workout.isRest) return;

          const dateKey = formatDateToKey(date);
          const workoutDayName = workout.name;

          // Track unique workout days
          if (workoutDayName) {
            workoutDaySet.add(workoutDayName);
          }

          workout.exercises.forEach((exercise) => {
            // Skip if no actual or weight logged
            if (
              !exercise.actual ||
              !exercise.weight ||
              exercise.actual.trim() === '' ||
              exercise.weight.trim() === ''
            ) {
              return;
            }

            const exerciseName = normalizeExerciseName(exercise.name);
            const maxWeight = parseMaxWeight(exercise.actual, exercise.weight);
            const volume = calculateVolume(exercise.actual, exercise.weight);

            // Skip if no valid weight
            if (maxWeight === 0) return;

            // Add to progression data
            if (!progressionMap.has(exerciseName)) {
              progressionMap.set(exerciseName, []);
            }

            progressionMap.get(exerciseName)!.push({
              date: dateKey,
              exerciseName,
              weight: maxWeight,
              volume,
            });

            // Track frequency
            exerciseFrequency.set(
              exerciseName,
              (exerciseFrequency.get(exerciseName) || 0) + 1
            );

            // Map exercise to workout day
            if (workoutDayName) {
              if (!exerciseWorkoutDayMap.has(exerciseName)) {
                exerciseWorkoutDayMap.set(exerciseName, new Set());
              }
              exerciseWorkoutDayMap.get(exerciseName)!.add(workoutDayName);
            }
          });
        });

        // Sort each exercise's progression by date
        progressionMap.forEach((points, exerciseName) => {
          points.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        });

        // Find top exercises by frequency (with at least 3 data points)
        const topExercisesList = Array.from(exerciseFrequency.entries())
          .filter(([name, freq]) => {
            const points = progressionMap.get(name) || [];
            return points.length >= 3; // Need at least 3 data points for meaningful chart
          })
          .sort((a, b) => b[1] - a[1]) // Sort by frequency descending
          .slice(0, 5) // Top 5 exercises
          .map(([name]) => name);

        setProgressionData(progressionMap);
        setTopExercises(topExercisesList);
        setExerciseToWorkoutDay(exerciseWorkoutDayMap);
        setAllWorkoutDays(Array.from(workoutDaySet).sort());
      } catch (error) {
        console.error('Failed to load weight progression data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgressionData();
  }, [daysToLoad]);

  const getExercisesByWorkoutDay = (workoutDay: string | null): string[] => {
    if (!workoutDay) {
      return topExercises; // Return all top exercises if no filter
    }

    // Filter top exercises by workout day
    return topExercises.filter((exerciseName) => {
      const workoutDays = exerciseToWorkoutDay.get(exerciseName);
      return workoutDays && workoutDays.has(workoutDay);
    });
  };

  return {
    progressionData,
    topExercises,
    exerciseToWorkoutDay,
    allWorkoutDays,
    isLoading,
    getExercisesByWorkoutDay,
  };
};
