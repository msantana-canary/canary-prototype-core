/**
 * Scheduled-broadcast time helpers.
 *
 * Mirrors production's `useFormatScheduledMessageTime` composable and the
 * 15-minute slot generation in EditScheduledGroupBroadcastTimeModal.vue.
 */

import { format, isSameDay, addDays, startOfDay } from 'date-fns';

/** Production's TIME_BLOCK_MINUTES. */
export const TIME_BLOCK_MINUTES = 15;

/**
 * "Scheduled for Today, 1:00 PM".
 *
 * Production's day-part cascade, verbatim:
 *   same day → "Today"
 *   tomorrow → "Tomorrow"
 *   within the next 6 days → weekday name ("Wednesday")
 *   otherwise → "August 14, 2026"
 * Time part is always "h:mm A".
 */
export function formatScheduledMessageTime(date: Date, now: Date = new Date()): string {
  return `Scheduled for ${formatScheduledDayPart(date, now)}, ${format(date, 'h:mm a')}`;
}

export function formatScheduledDayPart(date: Date, now: Date = new Date()): string {
  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, addDays(now, 1))) return 'Tomorrow';
  if (addDays(now, 6).getTime() > date.getTime()) return format(date, 'EEEE');
  return format(date, 'MMMM d, yyyy');
}

/** YYYY-MM-DD, the value shape CanaryInputDate speaks. */
export function toDateInputValue(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * The selectable 15-minute slots for a given date.
 *
 * Production snaps forward to the next quarter hour and, when the chosen date is
 * TODAY, starts from now rather than midnight — so a past time is never offered.
 * Values are ISO strings; labels are "h:mm A".
 */
export function buildTimeOptions(
  dateValue: string,
  now: Date = new Date()
): { value: string; label: string }[] {
  if (!dateValue) return [];

  const day = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(day.getTime())) return [];

  const isToday = isSameDay(day, now);
  const cursor = isToday ? new Date(now) : startOfDay(day);

  // Snap forward to the next quarter hour.
  const snap = (TIME_BLOCK_MINUTES - (cursor.getMinutes() % TIME_BLOCK_MINUTES)) % TIME_BLOCK_MINUTES;
  cursor.setMinutes(cursor.getMinutes() + snap, 0, 0);

  const options: { value: string; label: string }[] = [];
  const endOfDay = startOfDay(day).getTime() + 24 * 60 * 60 * 1000;
  while (cursor.getTime() < endOfDay) {
    options.push({ value: cursor.toISOString(), label: format(cursor, 'h:mm a') });
    cursor.setMinutes(cursor.getMinutes() + TIME_BLOCK_MINUTES);
  }
  return options;
}

/** Production's `isBeforeDate` — date-granularity past check. */
export function isBeforeToday(dateValue: string, now: Date = new Date()): boolean {
  if (!dateValue) return false;
  const day = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(day.getTime())) return false;
  return day.getTime() < startOfDay(now).getTime();
}
