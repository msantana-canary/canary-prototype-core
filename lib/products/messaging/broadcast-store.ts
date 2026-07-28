/**
 * Broadcast Store (Zustand)
 *
 * State management for the broadcast messaging feature.
 * Manages group selection, guest selection, and broadcast messages.
 *
 * Step-1 baseline notes:
 *  - Saved filters no longer live here. Guest Segments are the single source
 *    (`useGuestJourneyStore.segments`); the broadcast-local `savedFilters` list
 *    and its save/update/delete actions were removed along with the
 *    Manage-filters modal.
 *  - Manual row checks/unchecks are STICKY: they survive applying and clearing a
 *    filter (see `manualSelectionOverrides`).
 */

import { create } from 'zustand';
import {
  BroadcastGroup,
  BroadcastMessage,
  BroadcastGuestEntry,
  BroadcastFilterCriteria,
} from './broadcast-types';
import {
  builtInGroups,
  customGroups,
  builtInGroupGuests,
  customGroupGuests,
  mockBroadcastMessages,
} from './broadcast-mock-data';
import { guests } from '@/lib/core/data/guests';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';

export const emptyFilterCriteria: BroadcastFilterCriteria = {
  loyaltyTiers: [],
  rateCodes: [],
  groupCodes: [],
  roomNumbers: [],
  lengthOfStay: null,
  guestRecurrence: null,
};

export function isFilterEmpty(filters: BroadcastFilterCriteria): boolean {
  return (
    filters.loyaltyTiers.length === 0 &&
    filters.rateCodes.length === 0 &&
    filters.groupCodes.length === 0 &&
    filters.roomNumbers.length === 0 &&
    filters.lengthOfStay === null &&
    filters.guestRecurrence === null
  );
}

export function getActiveFilterCount(filters: BroadcastFilterCriteria): number {
  let count = 0;
  if (filters.loyaltyTiers.length > 0) count++;
  if (filters.rateCodes.length > 0) count++;
  if (filters.groupCodes.length > 0) count++;
  if (filters.roomNumbers.length > 0) count++;
  if (filters.lengthOfStay !== null) count++;
  if (filters.guestRecurrence !== null) count++;
  return count;
}

/** Filter guest entries by criteria (AND across attributes, OR within) */
export function getFilteredGuestEntries(
  groupId: string,
  allGroups: BroadcastGroup[],
  filters: BroadcastFilterCriteria
): BroadcastGuestEntry[] {
  const entries = getGuestEntriesForGroup(groupId, allGroups);
  if (isFilterEmpty(filters)) return entries;

  return entries.filter(entry => {
    if (filters.loyaltyTiers.length > 0) {
      if (!entry.loyaltyTier || !filters.loyaltyTiers.includes(entry.loyaltyTier)) return false;
    }
    if (filters.rateCodes.length > 0) {
      if (!entry.rateCode || !filters.rateCodes.includes(entry.rateCode)) return false;
    }
    if (filters.groupCodes.length > 0) {
      if (!entry.groupCode || !filters.groupCodes.includes(entry.groupCode)) return false;
    }
    if (filters.roomNumbers.length > 0) {
      if (!entry.room || !filters.roomNumbers.includes(entry.room)) return false;
    }
    if (filters.lengthOfStay !== null) {
      if (entry.stayNights == null) return false;
      if (filters.lengthOfStay === 'one-night' && entry.stayNights !== 1) return false;
      if (filters.lengthOfStay === 'multiple-nights' && entry.stayNights <= 1) return false;
    }
    if (filters.guestRecurrence !== null) {
      if (entry.isReturningGuest == null) return false;
      if (filters.guestRecurrence === 'first-time' && entry.isReturningGuest) return false;
      if (filters.guestRecurrence === 'recurring' && !entry.isReturningGuest) return false;
    }
    return true;
  });
}

interface BroadcastState {
  // Groups
  allGroups: BroadcastGroup[];
  selectedGroupId: string;
  /** 'archived' is reached from the GROUPS kebab (the Active/Archived pill row is gone). */
  activeGroupTab: 'active' | 'archived';

  // Date filter (for arrivals/departures)
  selectedDate: string; // YYYY-MM-DD format

  // Guest selection
  selectedGuestIds: string[];
  /**
   * STICKY SELECTION (production rule: "manual picks survive a subsequently
   * applied filter"). Every explicit row toggle records its resulting state
   * here; applying or clearing a filter rebuilds the selection from the newly
   * visible guests MINUS anyone the user manually unchecked. Bulk Select-all /
   * Deselect-all and switching group clear the map (a blanket intent supersedes
   * per-row history).
   */
  manualSelectionOverrides: Record<string, boolean>;

  // Messages
  messages: Record<string, BroadcastMessage[]>;

  // Create group modal
  isCreateGroupModalOpen: boolean;

  // Filters
  activeFilters: BroadcastFilterCriteria;
  isFilterModalOpen: boolean;
  /** Guest Segment id (`seg-*`) currently loaded into activeFilters, if any. */
  loadedSegmentId: string | null;

  /** Name of the just-saved guest segment, drives the in-register toast. */
  segmentSavedToast: string | null;

  // Actions
  selectGroup: (groupId: string) => void;
  setActiveGroupTab: (tab: 'active' | 'archived') => void;
  setSelectedDate: (date: string) => void;
  toggleGuestSelection: (guestId: string) => void;
  selectAllGuests: () => void;
  deselectAllGuests: () => void;
  sendBroadcast: (content: string) => void;
  openCreateGroupModal: () => void;
  closeCreateGroupModal: () => void;
  createGroup: (name: string) => void;

  // Filter actions
  openFilterModal: () => void;
  closeFilterModal: () => void;
  applyFilters: (criteria: BroadcastFilterCriteria, segmentId?: string) => void;
  clearAllFilters: () => void;

  // Toast
  showSegmentSavedToast: (name: string) => void;
  dismissSegmentSavedToast: () => void;
}

/** Get guest entries for a given group */
export function getGuestEntriesForGroup(groupId: string, allGroups: BroadcastGroup[]): BroadcastGuestEntry[] {
  // Check built-in groups first
  if (builtInGroupGuests[groupId]) {
    return builtInGroupGuests[groupId];
  }
  // Check custom groups
  if (customGroupGuests[groupId]) {
    return customGroupGuests[groupId];
  }
  // For dynamically created groups, build entries from memberGuestIds
  const group = allGroups.find(g => g.id === groupId);
  if (group?.memberGuestIds) {
    return group.memberGuestIds.map(guestId => ({
      guestId,
      reservationId: '', // No specific reservation for dynamic groups
    }));
  }
  return [];
}

/** Get selectable (has phone) guest IDs for a group */
function getSelectableGuestIds(groupId: string, allGroups: BroadcastGroup[]): string[] {
  const entries = getGuestEntriesForGroup(groupId, allGroups);
  return entries
    .filter(entry => {
      const guest = guests[entry.guestId];
      return guest?.phone;
    })
    .map(entry => entry.guestId);
}

/**
 * Re-apply sticky manual decisions to a freshly computed candidate set.
 * Manual UNCHECKS are honored (the guest stays off); manual CHECKS are already
 * covered because the candidate set is "everything currently visible and
 * messageable". Deliberately never re-adds a guest who is NOT in the candidate
 * set — an invisible recipient inflating the send count is the surprising case.
 */
function applyManualOverrides(candidateIds: string[], overrides: Record<string, boolean>): string[] {
  return candidateIds.filter(id => overrides[id] !== false);
}

export const useBroadcastStore = create<BroadcastState>((set, get) => ({
  // Initial state
  allGroups: [...builtInGroups, ...customGroups],
  selectedGroupId: 'group-arrivals',
  activeGroupTab: 'active',
  selectedDate: '2026-03-11',
  selectedGuestIds: getSelectableGuestIds('group-arrivals', [...builtInGroups, ...customGroups]),
  manualSelectionOverrides: {},
  messages: { ...mockBroadcastMessages },
  isCreateGroupModalOpen: false,

  // Filter state
  activeFilters: { ...emptyFilterCriteria },
  isFilterModalOpen: false,
  loadedSegmentId: null,

  segmentSavedToast: null,

  // Select a group — auto-selects all messageable guests, clears filters and
  // any sticky per-row decisions (they belonged to the previous audience).
  selectGroup: (groupId: string) => {
    const selectableIds = getSelectableGuestIds(groupId, get().allGroups);
    set({
      selectedGroupId: groupId,
      selectedGuestIds: selectableIds,
      manualSelectionOverrides: {},
      activeFilters: { ...emptyFilterCriteria },
      loadedSegmentId: null,
    });
  },

  setActiveGroupTab: (tab: 'active' | 'archived') => {
    set({ activeGroupTab: tab });
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },

  toggleGuestSelection: (guestId: string) => {
    set(state => {
      const isSelected = state.selectedGuestIds.includes(guestId);
      return {
        selectedGuestIds: isSelected
          ? state.selectedGuestIds.filter(id => id !== guestId)
          : [...state.selectedGuestIds, guestId],
        // Record the explicit decision so it survives the next filter apply/clear.
        manualSelectionOverrides: {
          ...state.manualSelectionOverrides,
          [guestId]: !isSelected,
        },
      };
    });
  },

  selectAllGuests: () => {
    const { selectedGroupId, allGroups, activeFilters } = get();
    const entries = isFilterEmpty(activeFilters)
      ? getGuestEntriesForGroup(selectedGroupId, allGroups)
      : getFilteredGuestEntries(selectedGroupId, allGroups, activeFilters);
    const selectableIds = entries
      .filter(entry => guests[entry.guestId]?.phone)
      .map(entry => entry.guestId);
    set({ selectedGuestIds: selectableIds, manualSelectionOverrides: {} });
  },

  deselectAllGuests: () => {
    set({ selectedGuestIds: [], manualSelectionOverrides: {} });
  },

  sendBroadcast: (content: string) => {
    const { selectedGroupId, selectedGuestIds, activeFilters, loadedSegmentId } = get();
    if (!content.trim() || selectedGuestIds.length === 0) return;

    const newMessage: BroadcastMessage = {
      id: `bm-${Date.now()}`,
      groupId: selectedGroupId,
      content: content.trim(),
      senderName: 'THERESA WEBB',
      sentAt: new Date(),
      recipientCount: selectedGuestIds.length,
    };

    // Attach filter snapshot if filters are active. A loaded Guest Segment
    // resolves against the guest-journey segment store (the single source) —
    // looking `seg-*` ids up against a broadcast-local list is what used to make
    // segment sends render "N FILTERS APPLIED" instead of the segment name.
    if (!isFilterEmpty(activeFilters)) {
      const segment = loadedSegmentId
        ? useGuestJourneyStore.getState().segments.find(s => s.id === loadedSegmentId)
        : null;
      newMessage.filterSnapshot = {
        type: segment ? 'saved' : 'ad-hoc',
        savedFilterName: segment?.name,
        criteria: { ...activeFilters },
        attributeCount: getActiveFilterCount(activeFilters),
      };
    }

    set(state => ({
      messages: {
        ...state.messages,
        [selectedGroupId]: [
          ...(state.messages[selectedGroupId] || []),
          newMessage,
        ],
      },
    }));
  },

  openCreateGroupModal: () => {
    set({ isCreateGroupModalOpen: true });
  },

  closeCreateGroupModal: () => {
    set({ isCreateGroupModalOpen: false });
  },

  createGroup: (name: string) => {
    if (!name.trim()) return;

    const newGroup: BroadcastGroup = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      type: 'custom',
      memberGuestIds: [],
      isArchived: false,
      memberCount: 0,
    };

    set(state => ({
      allGroups: [...state.allGroups, newGroup],
      isCreateGroupModalOpen: false,
    }));
  },

  // Filter actions
  openFilterModal: () => {
    set({ isFilterModalOpen: true });
  },

  closeFilterModal: () => {
    set({ isFilterModalOpen: false });
  },

  applyFilters: (criteria: BroadcastFilterCriteria, segmentId?: string) => {
    const { selectedGroupId, allGroups, manualSelectionOverrides } = get();
    // Candidates = every messageable guest the filter leaves visible…
    const visible = isFilterEmpty(criteria)
      ? getGuestEntriesForGroup(selectedGroupId, allGroups)
      : getFilteredGuestEntries(selectedGroupId, allGroups, criteria);
    const selectableIds = visible
      .filter(entry => guests[entry.guestId]?.phone)
      .map(entry => entry.guestId);

    set({
      activeFilters: { ...criteria },
      loadedSegmentId: segmentId || null,
      // …minus anyone the user has manually unchecked (sticky selection).
      selectedGuestIds: applyManualOverrides(selectableIds, manualSelectionOverrides),
      isFilterModalOpen: false,
    });
  },

  clearAllFilters: () => {
    const { selectedGroupId, allGroups, manualSelectionOverrides } = get();
    const selectableIds = getSelectableGuestIds(selectedGroupId, allGroups);
    set({
      activeFilters: { ...emptyFilterCriteria },
      loadedSegmentId: null,
      // Clearing a filter restores the full audience, but manual unchecks stick.
      selectedGuestIds: applyManualOverrides(selectableIds, manualSelectionOverrides),
    });
  },

  showSegmentSavedToast: (name: string) => {
    set({ segmentSavedToast: name });
  },

  dismissSegmentSavedToast: () => {
    set({ segmentSavedToast: null });
  },
}));
