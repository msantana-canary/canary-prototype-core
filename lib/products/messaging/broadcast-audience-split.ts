/**
 * Audience split — who is receiving, who isn't, and why.
 *
 * Extracted from the Ledger variant's roster before that arm was deleted. The
 * ledger LAYOUT lost the A/B, but its reason-grouping was the useful part.
 *
 * As of 2026-08-26 the filter modal no longer has a NOT SENDING roll-up —
 * `BroadcastFilterPanel` renders unreachable guests inline instead — so
 * `getAudienceSplit`'s only remaining consumer there reads `.visible` (via
 * `sortGuestsByLastName`) and reachability per row, not the `sending` /
 * `statusHeld` / `userRemoved` buckets. Those stay computed and exported: the
 * split itself is still a reasonable general-purpose utility, and trimming it
 * down to only what one call site currently paints would be a bigger change
 * than this batch asked for. `guestRoomMethod` is this file's other export
 * still in use, now also covering the inline reason on an unreachable row's
 * sub-line rather than a NOT SENDING group header.
 *
 * Filter-EXCLUDED guests deliberately never appear: they are outside the
 * audience entirely, and the filter chips on the To strip already account for
 * them.
 */

import {
  BroadcastGroup,
  BroadcastGuestEntry,
  BroadcastFilterCriteria,
} from './broadcast-types';
import {
  getGuestEntriesForGroup,
  getFilteredGuestEntries,
  isFilterEmpty,
  canMessageGuest,
} from './broadcast-store';
import { isStatusExcluded } from './broadcast-audience-facts';
import { resolveBroadcastGuest } from './broadcast-contacts';

export interface AudienceSplit {
  /** Selected and messageable — the actual send list. */
  sending: BroadcastGuestEntry[];
  /** No phone on file or opted out — cannot be overridden. */
  unreachable: BroadcastGuestEntry[];
  /** Held back by the folder's status rule; can be added back. */
  statusHeld: BroadcastGuestEntry[];
  /** Messageable, eligible, but unchecked by the user. */
  userRemoved: BroadcastGuestEntry[];
  /** Everything visible after the active filter. */
  visible: BroadcastGuestEntry[];
}

function lastNameOf(guestId: string): string {
  const name = resolveBroadcastGuest(guestId)?.name ?? '';
  return (name.split(' ').pop() ?? name).toLowerCase();
}

const byLastName = (a: BroadcastGuestEntry, b: BroadcastGuestEntry) =>
  lastNameOf(a.guestId).localeCompare(lastNameOf(b.guestId));

/**
 * The filter modal's ONE merged roster (2026-08-26) — reachable and
 * unreachable guests interleaved in "normal sort position" rather than split
 * into a matched list plus a separate NOT SENDING roll-up. Same comparator
 * `getAudienceSplit`'s buckets already sorted by, just applied across the
 * combined `visible` set instead of within each bucket.
 */
export function sortGuestsByLastName(entries: BroadcastGuestEntry[]): BroadcastGuestEntry[] {
  return [...entries].sort(byLastName);
}

export function getAudienceSplit(
  groupId: string,
  allGroups: BroadcastGroup[],
  activeFilters: BroadcastFilterCriteria,
  selectedGuestIds: string[],
  /** The store's `selectedDate` — Arrivals/Departures are date-scoped. */
  date: string
): AudienceSplit {
  const builtInType = allGroups.find((g) => g.id === groupId)?.builtInType;
  const visible = isFilterEmpty(activeFilters)
    ? getGuestEntriesForGroup(groupId, allGroups, date)
    : getFilteredGuestEntries(groupId, allGroups, activeFilters, date);

  const selected = new Set(selectedGuestIds);
  const sending: BroadcastGuestEntry[] = [];
  const unreachable: BroadcastGuestEntry[] = [];
  const statusHeld: BroadcastGuestEntry[] = [];
  const userRemoved: BroadcastGuestEntry[] = [];

  for (const entry of visible) {
    if (!canMessageGuest(entry)) unreachable.push(entry);
    else if (selected.has(entry.guestId)) sending.push(entry);
    else if (isStatusExcluded(entry, builtInType)) statusHeld.push(entry);
    else userRemoved.push(entry);
  }

  return {
    sending: sending.sort(byLastName),
    unreachable: unreachable.sort(byLastName),
    statusHeld: statusHeld.sort(byLastName),
    userRemoved: userRemoved.sort(byLastName),
    visible,
  };
}

/**
 * The row subtitle. Reachable guests get the bare room; unreachable guests
 * (opted out or no phone on file) get the room plus a humanized inline reason
 * — the filter modal's ONLY surface for that fact as of 2026-08-26, now that
 * the NOT SENDING roll-up (collapsed bar + reason groups) is gone from this
 * modal and rows render inline instead. Separator and wording match Figma
 * 1435-17906's Lucas Fernandes row ("118 STD · No phone number") rather than
 * production's longer "Opted out from messaging".
 */
export function guestRoomMethod(entry: BroadcastGuestEntry, room: string): string {
  if (entry.messagingOptedOut) return room ? `${room} · Opted out` : 'Opted out';
  if (!resolveBroadcastGuest(entry.guestId)?.phone) {
    return room ? `${room} · No phone number` : 'No phone number';
  }
  return room;
}
