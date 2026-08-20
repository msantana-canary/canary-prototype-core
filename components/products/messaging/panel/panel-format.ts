/**
 * Date formatting for the Conversation Details panel.
 *
 * Canonical reservation dates are strings ("Jul. 13, 2026"), and the panel
 * prints them three ways depending on how much room the register has:
 *
 *   RECORD  — verbatim, both ends: "Jul. 13, 2026 - Jul. 15, 2026". The
 *             reservation-details band, where the field is being VERIFIED and
 *             collapsing it would make the reader reconstruct it.
 *   LONG    — the accordion header: "July 13 - 15, 2026". A stay is one span,
 *             so the month and year print once when they're shared.
 *   COMPACT — result rows: "Aug 18 - 21, 2026". Same rule, short months,
 *             because the row already carries a phone, a code and a room.
 *
 * ⚠ The Reservations frame prints its first accordion header as "July 13, 2026 -
 * Jul. 15, 2026" — a long month on one end, a short month and a repeated year on
 * the other. That is Figma drift, not a third register; the collapsed LONG form
 * is what the frame's other two rows draw.
 */

const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Parts {
  month: number;
  day: number;
  year: number;
}

function parse(value?: string): Parts | null {
  if (!value) return null;
  const d = new Date(value.replace(/\./g, ''));
  if (Number.isNaN(d.getTime())) return null;
  return { month: d.getMonth(), day: d.getDate(), year: d.getFullYear() };
}

function range(checkIn: string | undefined, checkOut: string | undefined, months: string[]): string {
  const a = parse(checkIn);
  const b = parse(checkOut);
  if (!a || !b) return checkIn || checkOut || 'No dates';
  if (a.year === b.year && a.month === b.month) {
    return `${months[a.month]} ${a.day} - ${b.day}, ${b.year}`;
  }
  if (a.year === b.year) {
    return `${months[a.month]} ${a.day} - ${months[b.month]} ${b.day}, ${b.year}`;
  }
  return `${months[a.month]} ${a.day}, ${a.year} - ${months[b.month]} ${b.day}, ${b.year}`;
}

/** "July 13 - 15, 2026" — the Reservations accordion header. */
export function formatStayRangeLong(checkIn?: string, checkOut?: string): string {
  return range(checkIn, checkOut, MONTHS_LONG);
}

/** "Aug 18 - 21, 2026" — result rows in the link flow and the primary picker. */
export function formatStayRangeCompact(checkIn?: string, checkOut?: string): string {
  return range(checkIn, checkOut, MONTHS_SHORT);
}

/** "Jul. 13, 2026 - Jul. 15, 2026" — the reservation record's Dates row, verbatim. */
export function formatStayRangeRecord(checkIn?: string, checkOut?: string): string {
  if (!checkIn || !checkOut) return checkIn || checkOut || '—';
  return `${checkIn} - ${checkOut}`;
}

/** Truncate a trace id the way the frame does: head + ellipsis. */
export function truncateId(id: string, head = 14): string {
  return id.length <= head ? id : `${id.slice(0, head)}…`;
}
