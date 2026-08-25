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

/**
 * THE DATE BOUNDARY.
 *
 * `CanaryInputDate` is a three-field MM / DD / YYYY control. It EMITS
 * `MM/DD/YYYY` (`notifyChange` builds `${m}/${d}/${y}`) and it PARSES its
 * `value` by splitting on "/" and taking three parts — anything else is
 * silently discarded. Everything crossing that boundary is normalised here, so
 * no caller has to remember the shape.
 *
 * Note this is NOT the same shape as a native `<input type="date">`, which
 * speaks `yyyy-MM-dd` — the compact date control in the recipients column is a
 * native input and deliberately keeps that format.
 */
export function toDateInputValue(date: Date): string {
  return format(date, 'MM/dd/yyyy');
}

/**
 * Parse whatever the date field hands back into a local-midnight Date.
 * Accepts CanaryInputDate's `MM/DD/YYYY`, and tolerates `yyyy-MM-dd` so a
 * native-input value (or a persisted one) can't silently produce Invalid Date.
 * Returns null when the value isn't a complete, real date.
 */
export function parseDateInputValue(value: string): Date | null {
  if (!value) return null;

  let year: number;
  let month: number;
  let day: number;

  if (value.includes('/')) {
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    [month, day, year] = parts.map(Number);
  } else if (value.includes('-')) {
    const parts = value.split('-');
    if (parts.length !== 3) return null;
    [year, month, day] = parts.map(Number);
  } else {
    return null;
  }

  if (!year || !month || !day) return null;
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;

  // Local midnight, so a date can never slip a day across timezones.
  const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);
  // Reject impossible dates (e.g. 02/31) — the Date constructor rolls them over.
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
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
  const day = parseDateInputValue(dateValue);
  if (!day) return [];

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

/**
 * The slot list, guaranteed to CONTAIN a send time that already exists.
 *
 * ⚠ Why this is needed. `buildTimeOptions` emits quarter-hour values with the
 * seconds zeroed, and a `<select>` whose React value matches none of its
 * options silently falls back to displaying the first one. A seeded schedule
 * ("send in 3 hours", carrying live seconds) is never quarter-aligned, so the
 * Reschedule modal opened saying 9:45 AM while the panel one click away said
 * 12:42 PM — and confirming without touching the field kept 12:42, because the
 * untouched state was still the real ISO. The field contradicted both the panel
 * and itself.
 *
 * SNAPPING to the nearest quarter hour was the other option and it is worse: it
 * would silently move a hotelier's send by up to 15 minutes just for opening a
 * modal. So the exact time is INJECTED as its own option, in chronological
 * order, labelled in the same register. The modal then opens reading the time
 * the broadcast is actually going out, and every other option is a real slot.
 */
export function withExactOption(
  options: { value: string; label: string }[],
  isoValue: string
): { value: string; label: string }[] {
  if (!isoValue) return options;
  if (options.some((o) => o.value === isoValue)) return options;
  const exact = new Date(isoValue);
  if (Number.isNaN(exact.getTime())) return options;

  const injected = { value: isoValue, label: format(exact, 'h:mm a') };
  const at = options.findIndex((o) => new Date(o.value).getTime() > exact.getTime());
  if (at === -1) return [...options, injected];
  return [...options.slice(0, at), injected, ...options.slice(at)];
}

/** Production's `isBeforeDate` — date-granularity past check. */
export function isBeforeToday(dateValue: string, now: Date = new Date()): boolean {
  const day = parseDateInputValue(dateValue);
  if (!day) return false;
  return day.getTime() < startOfDay(now).getTime();
}
