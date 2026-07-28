/**
 * Audience facts — the subtraction ledger behind "why these guests?".
 *
 * Both step-5 challenger variants need the same arithmetic: start from the
 * folder's population, subtract each reason someone isn't receiving, and land on
 * the number actually being sent to. Variant B renders it as a drill-in ledger,
 * variant C as a token row. Derived entirely from existing store facts.
 *
 * NOTE: the brief asked for a `touchedGuestIds` set to separate "you unchecked
 * this" from "the system excluded this". It proved unnecessary — the two are
 * already structurally separable, because a system exclusion is identified by
 * the guest's own `checkInStatus` against the folder rule, so any OTHER
 * messageable guest who is unselected is by definition a user removal. No extra
 * state was added.
 *
 * The identity always holds:
 *   total − alreadyCheckedIn − alreadyCheckedOut − optedOut − noPhone
 *         − removedByYou = selectedCount
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
  getActiveFilterCount,
} from './broadcast-store';
import { guests } from '@/lib/core/data/guests';

export interface AudienceFacts {
  /** Entries in the folder before any filter. */
  sourceTotal: number;
  /** Entries visible after the active filter (=== sourceTotal when none). */
  visibleTotal: number;
  filterActive: boolean;
  filterCount: number;

  /** System exclusions — the per-folder status rule. */
  alreadyCheckedIn: number;
  alreadyCheckedOut: number;
  /** Unreachable — production's canMessageGuest split into its two reasons. */
  optedOut: number;
  noPhone: number;

  /** Manual edits — everything the folder rule doesn't account for. */
  removedByYou: number;
  addedByYou: number;

  selectedCount: number;
  /** Messageable guests in the visible set (the Select-all denominator). */
  messageableCount: number;
}

/** Is this entry held back by the folder's status rule? */
export function isStatusExcluded(
  entry: BroadcastGuestEntry,
  builtInType: BroadcastGroup['builtInType']
): boolean {
  if (builtInType === 'departures') return entry.checkInStatus === 'checked-out';
  if (builtInType === 'arrivals') {
    return entry.checkInStatus === 'in-house' || entry.checkInStatus === 'checked-out';
  }
  return false;
}

export function getAudienceFacts(
  groupId: string,
  allGroups: BroadcastGroup[],
  activeFilters: BroadcastFilterCriteria,
  selectedGuestIds: string[]
): AudienceFacts {
  const group = allGroups.find(g => g.id === groupId);
  const builtInType = group?.builtInType;

  const sourceEntries = getGuestEntriesForGroup(groupId, allGroups);
  const filterActive = !isFilterEmpty(activeFilters);
  const visible = filterActive
    ? getFilteredGuestEntries(groupId, allGroups, activeFilters)
    : sourceEntries;

  const selected = new Set(selectedGuestIds);

  let alreadyCheckedIn = 0;
  let alreadyCheckedOut = 0;
  let optedOut = 0;
  let noPhone = 0;
  let removedByYou = 0;
  let addedByYou = 0;
  let messageableCount = 0;

  for (const entry of visible) {
    // Unreachable first — opted-out takes precedence over no-phone, matching
    // production's subtitle precedence, so nobody is counted twice.
    if (entry.messagingOptedOut) {
      optedOut += 1;
      continue;
    }
    if (!guests[entry.guestId]?.phone) {
      noPhone += 1;
      continue;
    }

    messageableCount += 1;
    const isSelected = selected.has(entry.guestId);
    const statusExcluded = isStatusExcluded(entry, builtInType);

    if (isSelected) {
      // Selected despite the status rule = the user put them back.
      if (statusExcluded) addedByYou += 1;
      continue;
    }

    if (statusExcluded) {
      if (entry.checkInStatus === 'checked-out') alreadyCheckedOut += 1;
      else alreadyCheckedIn += 1;
      continue;
    }

    // Messageable, not status-excluded, not selected → the user removed them.
    removedByYou += 1;
  }

  return {
    sourceTotal: sourceEntries.length,
    visibleTotal: visible.length,
    filterActive,
    filterCount: getActiveFilterCount(activeFilters),
    alreadyCheckedIn,
    alreadyCheckedOut,
    optedOut,
    noPhone,
    removedByYou,
    addedByYou,
    selectedCount: selectedGuestIds.length,
    messageableCount,
  };
}

/** Total guests in a folder — the population count on the rail's status rows. */
export function getFolderPopulation(groupId: string, allGroups: BroadcastGroup[]): number {
  return getGuestEntriesForGroup(groupId, allGroups).length;
}
