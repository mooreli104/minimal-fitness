import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { updateTimerOngoingNotification } from './timerNotifications';
import { getItem } from '../utils/storage';
import { STORAGE_KEYS, TIME } from '../utils/constants';

const BACKGROUND_TIMER_TASK = 'background-timer-update';

interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  startTime: number | null;
  targetEndTime: number | null;
}

/**
 * Background task that updates the notification every minute
 * This runs even when the app is backgrounded or killed
 */
TaskManager.defineTask(BACKGROUND_TIMER_TASK, async () => {
  try {
    const state = await getItem<TimerState>(STORAGE_KEYS.TIMER_STATE);

    if (!state || !state.isRunning || !state.targetEndTime) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((state.targetEndTime - now) / TIME.MILLISECONDS_PER_SECOND));

    if (remaining > 0) {
      await updateTimerOngoingNotification('timer-ongoing', remaining);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background timer task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register the background task
 * This will update notifications even when app is in background
 */
export async function registerBackgroundTimerTask(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TIMER_TASK);

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TIMER_TASK, {
        minimumInterval: 15, // Update every 15 seconds (minimum allowed by iOS)
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (error) {
    console.error('Error registering background task:', error);
  }
}

/**
 * Unregister the background task when timer is stopped
 */
export async function unregisterBackgroundTimerTask(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TIMER_TASK);

    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TIMER_TASK);
    }
  } catch (error) {
    console.error('Error unregistering background task:', error);
  }
}
