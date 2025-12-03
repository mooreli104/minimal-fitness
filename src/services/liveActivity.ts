import { Platform } from 'react-native';

// Import expo-live-activity only on iOS
let LiveActivities: any = null;
if (Platform.OS === 'ios') {
  try {
    LiveActivities = require('expo-live-activity');
  } catch (e) {
    console.log('Live Activities not available');
  }
}

let currentActivityId: string | null = null;

/**
 * Starts a Live Activity for the timer (iOS only - shows in Dynamic Island)
 */
export async function startTimerLiveActivity(remainingSeconds: number): Promise<string | null> {
  if (Platform.OS !== 'ios' || !LiveActivities) {
    return null;
  }

  try {
    // Check if startActivity method exists (won't in Expo Go)
    if (typeof LiveActivities?.startActivity !== 'function') {
      // Silently return - this is expected in Expo Go
      return null;
    }

    // End any existing activity first
    if (currentActivityId) {
      await endTimerLiveActivity();
    }

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const timeString = hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const targetEndTime = Date.now() + remainingSeconds * 1000;

    const activityId = await LiveActivities.startActivity({
      timerName: 'Workout Timer',
      remainingTime: timeString,
      targetEndTime,
      isRunning: true,
    });

    currentActivityId = activityId;
    return activityId;
  } catch (error) {
    // Silently fail - Live Activities require native build
    return null;
  }
}

/**
 * Updates the Live Activity with new remaining time
 */
export async function updateTimerLiveActivity(remainingSeconds: number): Promise<void> {
  if (Platform.OS !== 'ios' || !LiveActivities || !currentActivityId) {
    return;
  }

  try {
    // Check if updateActivity method exists (won't in Expo Go)
    if (typeof LiveActivities?.updateActivity !== 'function') {
      return;
    }

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const timeString = hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const targetEndTime = Date.now() + remainingSeconds * 1000;

    await LiveActivities.updateActivity(currentActivityId, {
      remainingTime: timeString,
      targetEndTime,
      isRunning: true,
    });
  } catch (error) {
    // Silently fail - Live Activities require native build
  }
}

/**
 * Ends the Live Activity
 */
export async function endTimerLiveActivity(showCompletionState: boolean = false): Promise<void> {
  if (Platform.OS !== 'ios' || !LiveActivities || !currentActivityId) {
    return;
  }

  try {
    // Check if methods exist (won't in Expo Go)
    if (typeof LiveActivities?.stopActivity !== 'function') {
      currentActivityId = null;
      return;
    }

    if (showCompletionState && typeof LiveActivities.updateActivity === 'function') {
      // Show completion state briefly before ending
      await LiveActivities.updateActivity(currentActivityId, {
        remainingTime: '0:00',
        targetEndTime: Date.now(),
        isRunning: false,
      });

      // Wait 2 seconds then end
      setTimeout(async () => {
        if (currentActivityId && LiveActivities && typeof LiveActivities.stopActivity === 'function') {
          await LiveActivities.stopActivity(currentActivityId, {
            remainingTime: '0:00',
            targetEndTime: Date.now(),
            isRunning: false,
          });
          currentActivityId = null;
        }
      }, 2000);
    } else {
      await LiveActivities.stopActivity(currentActivityId, {
        remainingTime: '0:00',
        targetEndTime: Date.now(),
        isRunning: false,
      });
      currentActivityId = null;
    }
  } catch (error) {
    // Silently fail - Live Activities require native build
    currentActivityId = null;
  }
}

/**
 * Checks if Live Activities are supported and enabled
 */
export async function areLiveActivitiesEnabled(): Promise<boolean> {
  if (Platform.OS !== 'ios' || !LiveActivities) {
    return false;
  }

  try {
    // expo-live-activity doesn't have an areActivitiesEnabled method
    // Check if startActivity exists as a proxy for availability
    return typeof LiveActivities?.startActivity === 'function';
  } catch (error) {
    console.error('Error checking Live Activities support:', error);
    return false;
  }
}
