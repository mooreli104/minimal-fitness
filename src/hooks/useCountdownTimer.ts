import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const TIMER_STORAGE_KEY = '@countdown_timer_state';

interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  lastUpdateTime: number | null;
}

export const useCountdownTimer = () => {
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    loadTimerState();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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
    if (isRunning) {
      lastUpdateTimeRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          const newValue = prev - 1;

          if (newValue <= 0) {
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }

          return newValue;
        });
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

  // Handle background recovery
  useEffect(() => {
    const handleAppStateChange = () => {
      if (isRunning && lastUpdateTimeRef.current) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastUpdateTimeRef.current) / 1000);

        setRemainingSeconds((prev) => {
          const newValue = prev - elapsedSeconds;
          if (newValue <= 0) {
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return newValue;
        });

        lastUpdateTimeRef.current = now;
      }
    };

    // This will be called when the component regains focus
    handleAppStateChange();
  }, [isRunning]);

  const loadTimerState = async () => {
    try {
      const stateJson = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (stateJson) {
        const state: TimerState = JSON.parse(stateJson);

        // If timer was running, calculate elapsed time
        if (state.isRunning && state.lastUpdateTime) {
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - state.lastUpdateTime) / 1000);
          const newRemaining = Math.max(0, state.remainingSeconds - elapsedSeconds);

          setTotalSeconds(state.totalSeconds);
          setRemainingSeconds(newRemaining);

          if (newRemaining > 0) {
            setIsRunning(true);
          } else {
            setIsRunning(false);
            handleTimerComplete();
          }
        } else {
          setTotalSeconds(state.totalSeconds);
          setRemainingSeconds(state.remainingSeconds);
          setIsRunning(false);
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
        lastUpdateTime: isRunning ? Date.now() : null,
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
      setIsRunning(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pause = () => {
    setIsRunning(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const reset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const setTime = (seconds: number) => {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(false);
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
