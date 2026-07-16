/**
 * Email Channel — Date helpers
 *
 * All mock timestamps are rebased relative to `new Date()` at module load
 * (see mock-data.ts), so these labels are always truthful: the newest activity
 * is today and the dividers read TODAY / YESTERDAY / JUL 14.
 */

import { isToday, isYesterday, isSameDay, startOfDay, format } from 'date-fns';

export { isSameDay, startOfDay };

/**
 * Thread-list row date label (derived from lastActivityAt):
 * today → time like "9:20 AM" (uppercase), yesterday → "YESTERDAY",
 * else the date like "JUL 14".
 */
export function formatThreadListDate(date: Date): string {
  if (isToday(date)) return format(date, 'h:mm a').toUpperCase();
  if (isYesterday(date)) return 'YESTERDAY';
  return format(date, 'MMM d').toUpperCase();
}

/**
 * Message-feed day-divider label: "TODAY", "YESTERDAY", else "JUL 14".
 */
export function formatDayDivider(date: Date): string {
  if (isToday(date)) return 'TODAY';
  if (isYesterday(date)) return 'YESTERDAY';
  return format(date, 'MMM d').toUpperCase();
}
