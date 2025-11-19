import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getItem, setItem } from '../utils/storage';
import { STORAGE_KEYS, TIME } from '../utils/constants';
import { formatTime } from '../utils/formatters';
import {
  scheduleTimerCompleteNotification,
  showTimerOngoingNotification,
  cancelAllTimerNotifications,
  updateTimerOngoingNotification,
} from '../services/timerNotifications';
import {
  startTimerLiveActivity,
  updateTimerLiveActivity,
  endTimerLiveActivity,
} from '../services/liveActivity';

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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const ongoingNotificationIdRef = useRef<string | null>(null);
  const notificationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (notificationUpdateIntervalRef.current) {
        clearInterval(notificationUpdateIntervalRef.current);
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
            // Restart ongoing notification
            const notificationId = await showTimerOngoingNotification(newRemaining);
            if (notificationId) {
              ongoingNotificationIdRef.current = notificationId;
            }
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
   * Handles timer completion with haptic feedback and notification cleanup
   */
  const handleTimerComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);

    // Stop notification updates
    if (notificationUpdateIntervalRef.current) {
      clearInterval(notificationUpdateIntervalRef.current);
      notificationUpdateIntervalRef.current = null;
    }

    // Dismiss only the ongoing notification, let the completion notification fire
    if (ongoingNotificationIdRef.current) {
      try {
        const Notifications = await import('expo-notifications');
        // Only dismiss the ongoing notification, not all notifications
        await Notifications.dismissNotificationAsync('timer-ongoing');
      } catch (error) {
        console.error('Error dismissing ongoing notification:', error);
      }
      ongoingNotificationIdRef.current = null;
    }

    // End Live Activity with completion state on iOS
    if (Platform.OS === 'ios') {
      await endTimerLiveActivity(true);
    }

    // Reset timer back to total seconds
    setRemainingSeconds(totalSeconds);

    // Show completion modal
    setShowCompleteModal(true);
  };

  /**
   * Closes the completion modal
   */
  const closeCompleteModal = () => {
    setShowCompleteModal(false);
  };

  /**
   * Restarts the timer from the completion modal
   */
  const restartFromComplete = async () => {
    setShowCompleteModal(false);
    await start();
  };

  /**
   * Starts the timer
   */
  const start = async () => {
    if (remainingSeconds > 0) {
      const now = Date.now();
      targetEndTimeRef.current = now + remainingSeconds * TIME.MILLISECONDS_PER_SECOND;
      setIsRunning(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Schedule completion notification
      await scheduleTimerCompleteNotification(remainingSeconds);

      // Start Live Activity for iOS (Dynamic Island)
      if (Platform.OS === 'ios') {
        await startTimerLiveActivity(remainingSeconds);
      }

      // Show ongoing notification
      const notificationId = await showTimerOngoingNotification(remainingSeconds);
      if (notificationId) {
        ongoingNotificationIdRef.current = notificationId;

        // Update notification every second for live countdown
        notificationUpdateIntervalRef.current = setInterval(async () => {
          if (targetEndTimeRef.current !== null) {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / TIME.MILLISECONDS_PER_SECOND));

            if (remaining > 0 && ongoingNotificationIdRef.current) {
              await updateTimerOngoingNotification(ongoingNotificationIdRef.current, remaining);

              // Update Live Activity on iOS
              if (Platform.OS === 'ios') {
                await updateTimerLiveActivity(remaining);
              }
            }
          }
        }, 1000);
      }
    }
  };

  /**
   * Pauses the timer
   */
  const pause = async () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Cancel notifications when paused
    if (notificationUpdateIntervalRef.current) {
      clearInterval(notificationUpdateIntervalRef.current);
      notificationUpdateIntervalRef.current = null;
    }
    await cancelAllTimerNotifications();
    ongoingNotificationIdRef.current = null;

    // End Live Activity on iOS
    if (Platform.OS === 'ios') {
      await endTimerLiveActivity(false);
    }
  };

  /**
   * Resets the timer to total seconds
   */
  const reset = async () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setRemainingSeconds(totalSeconds);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Cancel notifications when reset
    if (notificationUpdateIntervalRef.current) {
      clearInterval(notificationUpdateIntervalRef.current);
      notificationUpdateIntervalRef.current = null;
    }
    await cancelAllTimerNotifications();
    ongoingNotificationIdRef.current = null;

    // End Live Activity on iOS
    if (Platform.OS === 'ios') {
      await endTimerLiveActivity(false);
    }
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
    showCompleteModal,
    start,
    pause,
    reset,
    setTime,
    formatTime, // Exported from utils/formatters
    getProgress,
    closeCompleteModal,
    restartFromComplete,
  };
};
