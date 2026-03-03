/**
 * Application-wide constants
 * Centralizes all magic strings, storage keys, and configuration values
 */

// AsyncStorage Keys
export const STORAGE_KEYS = {
  WORKOUT_LOG_PREFIX: '@workoutlog_',
  WORKOUT_PROGRAM: '@workoutProgram',
  WORKOUT_TEMPLATES: '@workoutTemplates',
  WEEKLY_PLAN: '@weeklyPlan',
  TIMER_STATE: '@countdown_timer_state',
  LOOPING_TIMER_STATE: '@looping_timer_state',
  THEME: '@app_theme',
} as const;

// Default Values
export const DEFAULTS = {
  TIMER_DURATION: 60,
  NEW_EXERCISE_TEMPLATE: {
    name: '',
    target: '',
    actual: '',
    weight: '',
  },
} as const;

// UI Constants
export const UI = {
  SWIPE_THRESHOLD_PERCENTAGE: 0.2,
  MAX_SWIPE_DISTANCE: 100,
  DAYS_IN_WEEK: 7,
  WEEK_DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const,
} as const;

// Time Constants
export const TIME = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 3600,
} as const;
