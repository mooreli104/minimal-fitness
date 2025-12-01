/**
 * Personal Records Hook
 * Tracks personal records (PRs) for exercises
 */

import { useState, useEffect } from 'react';
import { loadWorkoutLog } from '../services/workoutStorage.service';
import { getDaysAgo, formatDateToKey } from '../utils/formatters';

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  oneRepMax: number; // Calculated 1RM using Epley formula
}

interface UsePersonalRecordsResult {
  personalRecords: Map<string, PersonalRecord>;
  isLoading: boolean;
  getExercisePR: (exerciseName: string) => PersonalRecord | undefined;
  checkIfPR: (exerciseName: string, weight: number, reps: number) => boolean;
}

/**
 * Calculate one-rep max using Epley formula
 */
const calculateOneRepMax = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

/**
 * Parse exercise actual to get max reps for a set
 */
const parseMaxReps = (actual: string): number => {
  // Try "3x8" format
  const standardMatch = actual.match(/(\d+)x(\d+)/);
  if (standardMatch) {
    return parseInt(standardMatch[2], 10);
  }

  // Try "10*10*10" format - return the max reps
  const repsArrayMatch = actual.match(/^(\d+)(?:\*(\d+))+$/);
  if (repsArrayMatch) {
    const repsArray = actual.split('*').map((n) => parseInt(n, 10));
    return Math.max(...repsArray);
  }

  return 0;
};

/**
 * Normalize exercise name for comparison
 */
const normalizeExerciseName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
};

export const usePersonalRecords = (daysToLoad: number = 365): UsePersonalRecordsResult => {
  const [personalRecords, setPersonalRecords] = useState<Map<string, PersonalRecord>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPersonalRecords = async () => {
      setIsLoading(true);

      try {
        const today = new Date();
        const dates: Date[] = [];

        // Generate date range
        for (let i = daysToLoad - 1; i >= 0; i--) {
          dates.push(getDaysAgo(i, today));
        }

        // Load all workout logs in parallel
        const workoutLogs = await Promise.all(dates.map((date) => loadWorkoutLog(date)));

        // Track PRs: exerciseName -> PR details
        const prs = new Map<string, PersonalRecord>();

        dates.forEach((date, index) => {
          const workout = workoutLogs[index];
          if (!workout || workout.isRest) return;

          const dateKey = formatDateToKey(date);

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
            const weight = parseFloat(exercise.weight) || 0;
            const maxReps = parseMaxReps(exercise.actual);

            if (weight === 0 || maxReps === 0) return;

            const oneRepMax = calculateOneRepMax(weight, maxReps);

            // Check if this is a new PR
            const existingPR = prs.get(exerciseName);
            if (!existingPR || oneRepMax > existingPR.oneRepMax) {
              prs.set(exerciseName, {
                exerciseName,
                weight,
                reps: maxReps,
                date: dateKey,
                oneRepMax,
              });
            }
          });
        });

        setPersonalRecords(prs);
      } catch (error) {
        console.error('Failed to load personal records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonalRecords();
  }, [daysToLoad]);

  const getExercisePR = (exerciseName: string): PersonalRecord | undefined => {
    return personalRecords.get(normalizeExerciseName(exerciseName));
  };

  const checkIfPR = (exerciseName: string, weight: number, reps: number): boolean => {
    const existingPR = getExercisePR(exerciseName);
    if (!existingPR) return true; // First time is always a PR

    const newOneRepMax = calculateOneRepMax(weight, reps);
    return newOneRepMax > existingPR.oneRepMax;
  };

  return {
    personalRecords,
    isLoading,
    getExercisePR,
    checkIfPR,
  };
};
