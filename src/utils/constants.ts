/**
 * Application-wide constants
 * Centralizes all magic strings, storage keys, and configuration values
 */

// AsyncStorage Keys
export const STORAGE_KEYS = {
  WORKOUT_LOG_PREFIX: '@workoutlog_',
  WORKOUT_PROGRAM: '@workoutProgram',
  WORKOUT_TEMPLATES: '@workoutTemplates',
  FOOD_LOG_PREFIX: '@foodlog_',
  CALORIE_TARGET: '@calorieTarget',
  PROTEIN_TARGET: '@proteinTarget',
  CARBS_TARGET: '@carbsTarget',
  FAT_TARGET: '@fatTarget',
  TIMER_STATE: '@countdown_timer_state',
  THEME: '@app_theme',
} as const;

// Default Values
export const DEFAULTS = {
  CALORIE_TARGET: 2000,
  PROTEIN_TARGET: 150,
  CARBS_TARGET: 200,
  FAT_TARGET: 65,
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
  TOP_FOODS_LIMIT: 5,
  DAYS_IN_WEEK: 7,
} as const;

// Time Constants
export const TIME = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 3600,
} as const;
