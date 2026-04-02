/**
 * Broadcast Store (Zustand)
 *
 * State management for the broadcast messaging feature.
 * Manages group selection, guest selection, and broadcast messages.
 */

import { create } from 'zustand';
import {
  BroadcastGroup,
  BroadcastMessage,
  BroadcastGuestEntry,
  BroadcastFilterCriteria,
  SavedFilter,
} from './broadcast-types';
import {
  builtInGroups,
  customGroups,
  builtInGroupGuests,
  customGroupGuests,
  mockBroadcastMessages,
  mockSavedFilters,
} from './broadcast-mock-data';
import { guests } from '@/lib/core/data/guests';

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
  activeGroupTab: 'active' | 'archived';

  // Date filter (for arrivals/departures)
  selectedDate: string; // YYYY-MM-DD format

  // Guest selection
  selectedGuestIds: string[];

  // Messages
  messages: Record<string, BroadcastMessage[]>;

  // Create group modal
  isCreateGroupModalOpen: boolean;

  // Filters
  activeFilters: BroadcastFilterCriteria;
  isFilterModalOpen: boolean;
  savedFilters: SavedFilter[];
  loadedSavedFilterId: string | null;

  // Manage filters modal
  isManageFiltersModalOpen: boolean;

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
  applyFilters: (criteria: BroadcastFilterCriteria, savedFilterId?: string) => void;
  clearAllFilters: () => void;
  saveFilter: (name: string, criteria: BroadcastFilterCriteria) => void;
  updateFilter: (id: string, name: string, criteria: BroadcastFilterCriteria) => void;
  deleteFilter: (id: string) => void;
  openManageFiltersModal: () => void;
  closeManageFiltersModal: () => void;
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

export const useBroadcastStore = create<BroadcastState>((set, get) => ({
  // Initial state
  allGroups: [...builtInGroups, ...customGroups],
  selectedGroupId: 'group-arrivals',
  activeGroupTab: 'active',
  selectedDate: '2026-03-11',
  selectedGuestIds: getSelectableGuestIds('group-arrivals', [...builtInGroups, ...customGroups]),
  messages: { ...mockBroadcastMessages },
  isCreateGroupModalOpen: false,

  // Filter state
  activeFilters: { ...emptyFilterCriteria },
  isFilterModalOpen: false,
  savedFilters: [...mockSavedFilters],
  loadedSavedFilterId: null,
  isManageFiltersModalOpen: false,

  // Select a group — auto-selects all messageable guests, clears filters
  selectGroup: (groupId: string) => {
    const selectableIds = getSelectableGuestIds(groupId, get().allGroups);
    set({
      selectedGroupId: groupId,
      selectedGuestIds: selectableIds,
      activeFilters: { ...emptyFilterCriteria },
      loadedSavedFilterId: null,
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
    set({ selectedGuestIds: selectableIds });
  },

  deselectAllGuests: () => {
    set({ selectedGuestIds: [] });
  },

  sendBroadcast: (content: string) => {
    const { selectedGroupId, selectedGuestIds, activeFilters, loadedSavedFilterId, savedFilters } = get();
    if (!content.trim() || selectedGuestIds.length === 0) return;

    const newMessage: BroadcastMessage = {
      id: `bm-${Date.now()}`,
      groupId: selectedGroupId,
      content: content.trim(),
      senderName: 'THERESA WEBB',
      sentAt: new Date(),
      recipientCount: selectedGuestIds.length,
    };

    // Attach filter snapshot if filters are active
    if (!isFilterEmpty(activeFilters)) {
      const savedFilter = loadedSavedFilterId
        ? savedFilters.find(f => f.id === loadedSavedFilterId)
        : null;
      newMessage.filterSnapshot = {
        type: savedFilter ? 'saved' : 'ad-hoc',
        savedFilterName: savedFilter?.name,
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

  applyFilters: (criteria: BroadcastFilterCriteria, savedFilterId?: string) => {
    const { selectedGroupId, allGroups } = get();
    // Auto-select all matching guests that have a phone
    const filtered = getFilteredGuestEntries(selectedGroupId, allGroups, criteria);
    const selectableIds = filtered
      .filter(entry => guests[entry.guestId]?.phone)
      .map(entry => entry.guestId);

    set({
      activeFilters: { ...criteria },
      loadedSavedFilterId: savedFilterId || null,
      selectedGuestIds: selectableIds,
      isFilterModalOpen: false,
    });
  },

  clearAllFilters: () => {
    const { selectedGroupId, allGroups } = get();
    const selectableIds = getSelectableGuestIds(selectedGroupId, allGroups);
    set({
      activeFilters: { ...emptyFilterCriteria },
      loadedSavedFilterId: null,
      selectedGuestIds: selectableIds,
    });
  },

  saveFilter: (name: string, criteria: BroadcastFilterCriteria) => {
    const newFilter: SavedFilter = {
      id: `sf-${Date.now()}`,
      name: name.trim(),
      criteria: { ...criteria },
    };
    set(state => ({
      savedFilters: [...state.savedFilters, newFilter],
    }));
  },

  updateFilter: (id: string, name: string, criteria: BroadcastFilterCriteria) => {
    set(state => ({
      savedFilters: state.savedFilters.map(f =>
        f.id === id ? { ...f, name: name.trim(), criteria: { ...criteria } } : f
      ),
    }));
  },

  deleteFilter: (id: string) => {
    set(state => ({
      savedFilters: state.savedFilters.filter(f => f.id !== id),
      loadedSavedFilterId: state.loadedSavedFilterId === id ? null : state.loadedSavedFilterId,
    }));
  },

  openManageFiltersModal: () => {
    set({ isManageFiltersModalOpen: true });
  },

  closeManageFiltersModal: () => {
    set({ isManageFiltersModalOpen: false });
  },
}));
