/**
 * Date Helper Utilities
 *
 * Functions for formatting dates in the messaging interface
 */

import { format, isToday, isYesterday, isThisWeek, isSameDay } from 'date-fns';

/**
 * Format a date for use in message date separators
 * Returns:
 * - "Today" for today
 * - "Yesterday" for yesterday
 * - Day name ("Monday", "Tuesday", etc.) for dates within this week
 * - "Mon. Day" format ("Nov. 14") for older dates
 */
export function formatDateSeparator(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  if (isThisWeek(date, { weekStartsOn: 0 })) {
    // Return day name (e.g., "Monday")
    return format(date, 'EEEE');
  }

  // Return "Mon. Day" format (e.g., "Nov. 14")
  return format(date, 'MMM. d');
}

/**
 * Check if two dates are on the same calendar day
 */
export function isSameCalendarDay(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}
