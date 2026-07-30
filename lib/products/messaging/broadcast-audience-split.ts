/**
 * Audience split — who is receiving, who isn't, and why.
 *
 * Extracted from the Ledger variant's roster before that arm was deleted. The
 * ledger LAYOUT lost the A/B, but its reason-grouping was the useful part and
 * survives here for the filter panel's NOT SENDING section.
 *
 * Filter-EXCLUDED guests deliberately never appear: they are outside the
 * audience entirely, and the filter chips on the To strip already account for
 * them. NOT SENDING is only about people inside the audience who aren't
 * receiving.
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
import { guests } from '@/lib/core/data/guests';

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
  const name = guests[guestId]?.name ?? '';
  return (name.split(' ').pop() ?? name).toLowerCase();
}

const byLastName = (a: BroadcastGuestEntry, b: BroadcastGuestEntry) =>
  lastNameOf(a.guestId).localeCompare(lastNameOf(b.guestId));

export function getAudienceSplit(
  groupId: string,
  allGroups: BroadcastGroup[],
  activeFilters: BroadcastFilterCriteria,
  selectedGuestIds: string[]
): AudienceSplit {
  const builtInType = allGroups.find((g) => g.id === groupId)?.builtInType;
  const visible = isFilterEmpty(activeFilters)
    ? getGuestEntriesForGroup(groupId, allGroups)
    : getFilteredGuestEntries(groupId, allGroups, activeFilters);

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

/** "2 unreachable · 3 already checked in" — the NOT SENDING bar's summary. */
export function summariseNotSending(split: AudienceSplit): string {
  const parts: string[] = [];
  if (split.unreachable.length) parts.push(`${split.unreachable.length} unreachable`);
  if (split.statusHeld.length) {
    const out = split.statusHeld.filter((e) => e.checkInStatus === 'checked-out').length;
    parts.push(
      `${split.statusHeld.length} already checked ${out > split.statusHeld.length / 2 ? 'out' : 'in'}`
    );
  }
  if (split.userRemoved.length) parts.push(`${split.userRemoved.length} you unchecked`);
  return parts.join(' · ');
}

export function notSendingCount(split: AudienceSplit): number {
  return split.unreachable.length + split.statusHeld.length + split.userRemoved.length;
}

/** Production's row subtitle, verbatim — opted-out takes precedence. */
export function guestRoomMethod(entry: BroadcastGuestEntry, room: string): string {
  if (entry.messagingOptedOut) return `${room} • Opted out from messaging`;
  if (!guests[entry.guestId]?.phone) return `${room} • No phone number`;
  return room;
}
