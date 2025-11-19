import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getItem, setItem } from '../utils/storage';
import { STORAGE_KEYS, TIME } from '../utils/constants';
import { formatTime } from '../utils/formatters';

/**
 * Timer state stored in AsyncStorage
 */
interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  startTime: number | null;
  targetEndTime: number | null;
}

/**
 * Hook for managing a countdown timer with persistence
 * Handles timer state, background execution, and haptic feedback
 */
export const useCountdownTimer = () => {
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);

  /**
   * Calculates remaining time based on target end time
   */
  const updateRemainingTime = () => {
    if (targetEndTimeRef.current !== null) {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / TIME.MILLISECONDS_PER_SECOND));

      setRemainingSeconds(remaining);

      if (remaining === 0) {
        setIsRunning(false);
        targetEndTimeRef.current = null;
        handleTimerComplete();
      }

      return remaining;
    }
    return remainingSeconds;
  };

  // Load persisted state on mount
  useEffect(() => {
    loadTimerState();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (targetEndTimeRef.current !== null) {
          updateRemainingTime();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (isRunning || remainingSeconds < totalSeconds) {
      saveTimerState();
    }
  }, [totalSeconds, remainingSeconds, isRunning]);

  // Handle timer countdown
  useEffect(() => {
    if (isRunning && targetEndTimeRef.current !== null) {
      intervalRef.current = setInterval(() => {
        updateRemainingTime();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  /**
   * Loads timer state from AsyncStorage
   */
  const loadTimerState = async () => {
    try {
      const state = await getItem<TimerState>(STORAGE_KEYS.TIMER_STATE);

      if (state) {
        setTotalSeconds(state.totalSeconds);

        // If timer was running, calculate remaining time
        if (state.isRunning && state.targetEndTime) {
          const now = Date.now();
          const newRemaining = Math.max(0, Math.ceil((state.targetEndTime - now) / TIME.MILLISECONDS_PER_SECOND));

          targetEndTimeRef.current = state.targetEndTime;
          setRemainingSeconds(newRemaining);

          if (newRemaining > 0) {
            setIsRunning(true);
          } else {
            setIsRunning(false);
            targetEndTimeRef.current = null;
            handleTimerComplete();
          }
        } else {
          setRemainingSeconds(state.remainingSeconds);
          setIsRunning(false);
          targetEndTimeRef.current = null;
        }
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
    }
  };

  /**
   * Saves timer state to AsyncStorage
   */
  const saveTimerState = async () => {
    try {
      const state: TimerState = {
        totalSeconds,
        remainingSeconds,
        isRunning,
        startTime: isRunning ? Date.now() - (totalSeconds - remainingSeconds) * TIME.MILLISECONDS_PER_SECOND : null,
        targetEndTime: targetEndTimeRef.current,
      };
      await setItem(STORAGE_KEYS.TIMER_STATE, state);
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  };

  /**
   * Handles timer completion with haptic feedback
   */
  const handleTimerComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
  };

  /**
   * Starts the timer
   */
  const start = () => {
    if (remainingSeconds > 0) {
      const now = Date.now();
      targetEndTimeRef.current = now + remainingSeconds * TIME.MILLISECONDS_PER_SECOND;
      setIsRunning(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  /**
   * Pauses the timer
   */
  const pause = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  /**
   * Resets the timer to total seconds
   */
  const reset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setRemainingSeconds(totalSeconds);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  /**
   * Sets a new time for the timer
   */
  const setTime = (seconds: number) => {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(false);
    targetEndTimeRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  /**
   * Calculates progress as a percentage
   */
  const getProgress = (): number => {
    if (totalSeconds === 0) return 1;
    return remainingSeconds / totalSeconds;
  };

  return {
    remainingSeconds,
    totalSeconds,
    isRunning,
    start,
    pause,
    reset,
    setTime,
    formatTime, // Exported from utils/formatters
    getProgress,
  };
};
