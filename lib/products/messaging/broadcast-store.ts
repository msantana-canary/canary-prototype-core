/**
 * Broadcast Store (Zustand)
 *
 * State management for the broadcast messaging feature.
 * Manages group selection, guest selection, and broadcast messages.
 */

import { create } from 'zustand';
import { BroadcastGroup, BroadcastMessage, BroadcastGuestEntry } from './broadcast-types';
import {
  builtInGroups,
  customGroups,
  builtInGroupGuests,
  customGroupGuests,
  mockBroadcastMessages,
} from './broadcast-mock-data';
import { guests } from '@/lib/core/data/guests';

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

  // Select a group — auto-selects all messageable guests
  selectGroup: (groupId: string) => {
    const selectableIds = getSelectableGuestIds(groupId, get().allGroups);
    set({
      selectedGroupId: groupId,
      selectedGuestIds: selectableIds,
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
    const selectableIds = getSelectableGuestIds(get().selectedGroupId, get().allGroups);
    set({ selectedGuestIds: selectableIds });
  },

  deselectAllGuests: () => {
    set({ selectedGuestIds: [] });
  },

  sendBroadcast: (content: string) => {
    const { selectedGroupId, selectedGuestIds } = get();
    if (!content.trim() || selectedGuestIds.length === 0) return;

    const newMessage: BroadcastMessage = {
      id: `bm-${Date.now()}`,
      groupId: selectedGroupId,
      content: content.trim(),
      senderName: 'THERESA WEBB',
      sentAt: new Date(),
      recipientCount: selectedGuestIds.length,
    };

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
}));
