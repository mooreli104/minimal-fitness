import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should behave when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // Don't show banner when app is in foreground
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      // Ongoing timer channel
      await Notifications.setNotificationChannelAsync('timer_ongoing', {
        name: 'Timer - Running',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0],
        sound: null,
        enableLights: false,
        enableVibrate: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        showBadge: false,
      });

      // Completion notification channel
      await Notifications.setNotificationChannelAsync('timer_complete', {
        name: 'Timer - Complete',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250, 250, 250],
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        showBadge: true,
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a notification for when the timer completes
 */
export async function scheduleTimerCompleteNotification(seconds: number): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Timer Complete!',
        body: 'Your workout timer has finished.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250, 250, 250],
        sticky: false,
        autoDismiss: false,
      },
      trigger: {
        seconds: seconds,
        channelId: 'timer_complete',
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling timer notification:', error);
    return null;
  }
}

/**
 * Show an ongoing notification with the remaining time
 */
export async function showTimerOngoingNotification(remainingSeconds: number): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    let timeString: string;
    if (hours > 0) {
      timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏱️ Timer',
        body: timeString,
        sound: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: true,
        autoDismiss: false,
        categoryIdentifier: 'timer_ongoing',
        data: {
          type: 'timer_running',
          remainingSeconds,
        },
        badge: 0,
      },
      trigger: null, // Show immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Error showing ongoing notification:', error);
    return null;
  }
}

/**
 * Update the ongoing notification with new remaining time
 */
export async function updateTimerOngoingNotification(
  notificationId: string,
  remainingSeconds: number
): Promise<void> {
  try {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    let timeString: string;
    if (hours > 0) {
      timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    await Notifications.dismissNotificationAsync(notificationId);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏱️ Timer',
        body: timeString,
        sound: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: true,
        autoDismiss: false,
        categoryIdentifier: 'timer_ongoing',
        data: {
          type: 'timer_running',
          remainingSeconds,
        },
        badge: 0,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error updating ongoing notification:', error);
  }
}

/**
 * Cancel a specific notification
 */
export async function cancelTimerNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    await Notifications.dismissNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling timer notification:', error);
  }
}

/**
 * Cancel all timer notifications
 */
export async function cancelAllTimerNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all timer notifications:', error);
  }
}
