/**
 * Formatting utilities for dates, times, and other display values
 */

import { TIME } from './constants';

/**
 * Formats a Date object to ISO date string (YYYY-MM-DD) in local timezone
 * @param date Date to format
 * @returns ISO date string
 */
export const formatDateToKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
 * Get date N days ago from a reference date
 * @param days Number of days ago
 * @param fromDate Reference date (defaults to today)
 * @returns Date N days ago
 */
export const getDaysAgo = (days: number, fromDate: Date = new Date()): Date => {
  const date = new Date(fromDate);
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Get start of current week (Sunday)
 * @param date Reference date (defaults to today)
 * @returns Start of week date
 */
export const getStartOfWeek = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day; // Days since Sunday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Formats a number with thousands separators
 * @param value Number to format
 * @returns Formatted string
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};
