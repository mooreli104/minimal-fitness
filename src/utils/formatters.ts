/**
 * Formatting utilities for dates, times, and other display values
 */

import { TIME } from './constants';

/**
 * Formats a Date object to ISO date string (YYYY-MM-DD)
 * @param date Date to format
 * @returns ISO date string
 */
export const formatDateToKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Gets the day of week abbreviation (lowercase)
 * @param date Date object
 * @returns Day of week (e.g., 'mon', 'tue')
 */
export const getDayOfWeek = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
};

/**
 * Formats seconds into MM:SS or H:MM:SS format
 * @param seconds Total seconds
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / TIME.SECONDS_PER_HOUR);
  const mins = Math.floor((seconds % TIME.SECONDS_PER_HOUR) / TIME.SECONDS_PER_MINUTE);
  const secs = seconds % TIME.SECONDS_PER_MINUTE;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats a timestamp to time string (e.g., "2:30 PM")
 * @param timestamp ISO timestamp string
 * @returns Formatted time string
 */
export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
};

/**
 * Gets yesterday's date from a given date
 * @param date Reference date
 * @returns Yesterday's date
 */
export const getYesterday = (date: Date): Date => {
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  return yesterday;
};

/**
 * Gets a date offset by a number of days
 * @param date Reference date
 * @param daysOffset Number of days to offset (negative for past)
 * @returns Offset date
 */
export const getDateOffset = (date: Date, daysOffset: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + daysOffset);
  return newDate;
};

/**
 * Formats a number with thousands separators
 * @param value Number to format
 * @returns Formatted string
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};
