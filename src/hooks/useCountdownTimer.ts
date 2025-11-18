import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const TIMER_STORAGE_KEY = '@countdown_timer_state';

interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  startTime: number | null; // When the timer was started
  targetEndTime: number | null; // When the timer should end
}

export const useCountdownTimer = () => {
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Calculate remaining time based on target end time
  const updateRemainingTime = () => {
    if (targetEndTimeRef.current !== null) {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));

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

  const loadTimerState = async () => {
    try {
      const stateJson = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (stateJson) {
        const state: TimerState = JSON.parse(stateJson);

        setTotalSeconds(state.totalSeconds);

        // If timer was running, calculate remaining time from target end time
        if (state.isRunning && state.targetEndTime) {
          const now = Date.now();
          const newRemaining = Math.max(0, Math.ceil((state.targetEndTime - now) / 1000));

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

  const saveTimerState = async () => {
    try {
      const state: TimerState = {
        totalSeconds,
        remainingSeconds,
        isRunning,
        startTime: isRunning ? Date.now() - (totalSeconds - remainingSeconds) * 1000 : null,
        targetEndTime: targetEndTimeRef.current,
      };
      await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  };

  const handleTimerComplete = () => {
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Additional vibration pattern
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
  };

  const start = () => {
    if (remainingSeconds > 0) {
      const now = Date.now();
      targetEndTimeRef.current = now + remainingSeconds * 1000;
      setIsRunning(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pause = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const reset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setRemainingSeconds(totalSeconds);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const setTime = (seconds: number) => {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(false);
    targetEndTimeRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (totalSeconds === 0) return 0;
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
    formatTime,
    getProgress,
  };
};
