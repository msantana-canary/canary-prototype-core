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
 *  - Selection semantics on filter apply / change / clear mirror production
 *    (BroadcastV2BuiltInGroupGuestList.vue + ChatService.getGuestsForFolder) —
 *    see the comments on `applyFilters` and `clearAllFilters`.
 */

import { create } from 'zustand';
import {
  BroadcastGroup,
  BroadcastMessage,
  BroadcastGuestEntry,
  BroadcastFilterCriteria,
  BroadcastRecipientDelivery,
  ScheduledBroadcast,
  BroadcastCheckInStatus,
  BroadcastBucket,
  BuiltInGroupType,
} from './broadcast-types';
import {
  builtInGroups,
  customGroups,
  builtInGroupGuests,
  customGroupGuests,
  mockBroadcastMessages,
  mockScheduledBroadcasts,
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

  /** Broadcast whose per-recipient delivery panel is open, if any. */
  deliveryPanelMessageId: string | null;

  /**
   * Live A/B on the filter modal: 'classic' is the shipped modal, 'builder' the
   * step-3 redesign. Presentation only — both write the SAME criteria through
   * the SAME applyFilters, so selection semantics are identical either way.
   */
  filterModalVariant: 'classic' | 'builder';

  /** Queued sends. Custom groups only — production gates the affordance the same way. */
  scheduledBroadcasts: ScheduledBroadcast[];
  /** Scheduled broadcast whose detail panel is open, if any. */
  scheduledPanelId: string | null;

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

  // Delivery panel
  openDeliveryPanel: (messageId: string) => void;
  closeDeliveryPanel: () => void;

  setFilterModalVariant: (variant: 'classic' | 'builder') => void;

  // Scheduled broadcasts
  scheduleBroadcast: (content: string, sendAt: Date) => void;
  openScheduledPanel: (id: string) => void;
  closeScheduledPanel: () => void;
  rescheduleBroadcast: (id: string, sendAt: Date) => void;
  editScheduledBroadcastText: (id: string, body: string) => void;
  sendScheduledBroadcastNow: (id: string) => void;
  deleteScheduledBroadcast: (id: string) => void;

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

/**
 * Production's `canMessageGuest`:
 *   `!!g?.client_phone && !g.messaging_opted_out`
 * A guest with no phone OR who has opted out of messaging is unreachable, and
 * is never selectable anywhere in the flow.
 */
export function canMessageGuest(entry: BroadcastGuestEntry): boolean {
  return !!guests[entry.guestId]?.phone && !entry.messagingOptedOut;
}

/**
 * Which section a guest falls into for a given folder — production's
 * `guestsByBucket`. The same status buckets differently per folder:
 *   In-house   → one bucket, no section headers
 *   Departures → checked-out to "out", everyone else to "expecting"
 *   Arrivals   → in-house to "in", checked-out to "out", rest to "expecting"
 */
export function bucketForFolder(
  builtInType: BuiltInGroupType,
  status: BroadcastCheckInStatus | undefined
): BroadcastBucket {
  if (builtInType === 'in-house') return 'in';
  if (status === 'checked-out') return 'out';
  if (builtInType === 'arrivals' && status === 'in-house') return 'in';
  return 'expecting';
}

/**
 * The INITIAL auto-selection when you enter a folder — production's
 * `selectGuestsForFolder`. Beyond canMessageGuest it excludes guests by status,
 * per folder:
 *   custom / in-house → everyone messageable
 *   departures        → everyone except CHECKED_OUT
 *   arrivals          → everyone except IN_HOUSE and CHECKED_OUT
 * i.e. only the "expecting" bucket pre-selects on Arrivals and Departures.
 *
 * This exclusion applies ONLY here (folder entry and filter-clear). Select-all
 * and the filter-apply rebuild select everything messageable that is visible —
 * production does not re-apply the status rule in those paths.
 */
function getSelectableGuestIds(groupId: string, allGroups: BroadcastGroup[]): string[] {
  const entries = getGuestEntriesForGroup(groupId, allGroups);
  const builtInType = allGroups.find(g => g.id === groupId)?.builtInType;

  return entries
    .filter(entry => {
      if (!canMessageGuest(entry)) return false;
      if (builtInType === 'departures') return entry.checkInStatus !== 'checked-out';
      if (builtInType === 'arrivals') {
        return entry.checkInStatus !== 'in-house' && entry.checkInStatus !== 'checked-out';
      }
      return true;
    })
    .map(entry => entry.guestId);
}

/**
 * Delivery log for a freshly sent broadcast. A real send lands mostly
 * "Delivered" with a few still "Sent" (carrier accepted, no delivery receipt
 * yet); anyone without a phone who slipped through is "Not sent", mirroring
 * production's canMessageGuest gate. Deterministic by index so a demo replays
 * identically.
 */
function buildRecipientDeliveries(guestIds: string[]): BroadcastRecipientDelivery[] {
  return guestIds.map((guestId, i) => ({
    guestId,
    status: !guests[guestId]?.phone ? 'not-sent' : i % 5 === 3 ? 'sent' : 'delivered',
  }));
}

/** Messageable ids among the guest entries currently on screen for a filter. */
function getVisibleSelectableIds(
  groupId: string,
  allGroups: BroadcastGroup[],
  filters: BroadcastFilterCriteria
): string[] {
  const entries = isFilterEmpty(filters)
    ? getGuestEntriesForGroup(groupId, allGroups)
    : getFilteredGuestEntries(groupId, allGroups, filters);
  return entries.filter(canMessageGuest).map(entry => entry.guestId);
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
  loadedSegmentId: null,

  segmentSavedToast: null,
  deliveryPanelMessageId: null,
  filterModalVariant: 'classic',
  scheduledBroadcasts: [...mockScheduledBroadcasts],
  scheduledPanelId: null,

  // Select a group — auto-selects all messageable guests and clears filters.
  // Production does the same on folder change (BroadcastV2BuiltInGroupGuestList
  // watches `folder` → clearFilters() → getGuestData() → selectGuestsForFolder).
  selectGroup: (groupId: string) => {
    const selectableIds = getSelectableGuestIds(groupId, get().allGroups);
    set({
      selectedGroupId: groupId,
      selectedGuestIds: selectableIds,
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

  // Plain add/remove — production's addRemoveSelectedGuest keeps no per-row
  // bookkeeping; the "was this unchecked" fact is derived at filter-apply time.
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

  // Production's onSelectAllChanged: select all accessible guests, or none.
  selectAllGuests: () => {
    const { selectedGroupId, allGroups, activeFilters } = get();
    set({ selectedGuestIds: getVisibleSelectableIds(selectedGroupId, allGroups, activeFilters) });
  },

  deselectAllGuests: () => {
    set({ selectedGuestIds: [] });
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
      recipients: buildRecipientDeliveries(selectedGuestIds),
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

  /**
   * STICKY SELECTION — mirrors production exactly
   * (BroadcastV2BuiltInGroupGuestList.fetchFilteredGuests):
   *
   *   const selectedSlugs = new Set(selectedGuests.map(s => s.slug));
   *   const deselectedSlugs = new Set(
   *     accessibleGuests.filter(g => !selectedSlugs.has(g.slug)).map(g => g.slug));
   *   ...
   *   selectedGuests = result.guests.filter(
   *     g => canMessageGuest(g) && !deselectedSlugs.has(g.slug));
   *
   * The deselected set is derived FRESH from the list on screen at apply time —
   * it is NOT a persistent history. So: a manual uncheck survives an apply while
   * the guest is visible, but is forgotten once a filter hides them. And a
   * manually-checked guest who falls outside the new result is dropped, because
   * the selection is rebuilt purely from the result.
   */
  applyFilters: (criteria: BroadcastFilterCriteria, segmentId?: string) => {
    const { selectedGroupId, allGroups, activeFilters, selectedGuestIds } = get();

    // Snapshot the unchecked rows currently on screen.
    const selectedSet = new Set(selectedGuestIds);
    const deselected = new Set(
      getVisibleSelectableIds(selectedGroupId, allGroups, activeFilters).filter(
        id => !selectedSet.has(id)
      )
    );

    // Rebuild from the new result, minus that snapshot.
    const nextVisible = getVisibleSelectableIds(selectedGroupId, allGroups, criteria);

    set({
      activeFilters: { ...criteria },
      loadedSegmentId: segmentId || null,
      selectedGuestIds: nextVisible.filter(id => !deselected.has(id)),
      isFilterModalOpen: false,
    });
  },

  /**
   * Clearing is a FULL RESET in production — clearFilters() calls getGuestData(),
   * which refetches the folder and runs selectGuestsForFolder(), re-selecting
   * every messageable guest (ChatService.getGuestsForFolder empties the
   * selection first). Manual unchecks do NOT survive a clear.
   */
  clearAllFilters: () => {
    const { selectedGroupId, allGroups } = get();
    set({
      activeFilters: { ...emptyFilterCriteria },
      loadedSegmentId: null,
      selectedGuestIds: getSelectableGuestIds(selectedGroupId, allGroups),
    });
  },

  openDeliveryPanel: (messageId: string) => {
    set({ deliveryPanelMessageId: messageId });
  },

  closeDeliveryPanel: () => {
    set({ deliveryPanelMessageId: null });
  },

  setFilterModalVariant: (variant: 'classic' | 'builder') => {
    set({ filterModalVariant: variant });
  },

  // ── Scheduled broadcasts ───────────────────────────────────────────────────

  scheduleBroadcast: (content: string, sendAt: Date) => {
    const { selectedGroupId } = get();
    if (!content.trim()) return;

    const scheduled: ScheduledBroadcast = {
      id: `sgb-${Date.now()}`,
      groupId: selectedGroupId,
      body: content.trim(),
      senderName: 'THERESA WEBB',
      sendAt,
      createdAt: new Date(),
    };

    set(state => ({ scheduledBroadcasts: [...state.scheduledBroadcasts, scheduled] }));
  },

  openScheduledPanel: (id: string) => {
    set({ scheduledPanelId: id });
  },

  closeScheduledPanel: () => {
    set({ scheduledPanelId: null });
  },

  rescheduleBroadcast: (id: string, sendAt: Date) => {
    set(state => ({
      scheduledBroadcasts: state.scheduledBroadcasts.map(s =>
        s.id === id ? { ...s, sendAt } : s
      ),
    }));
  },

  editScheduledBroadcastText: (id: string, body: string) => {
    if (!body.trim()) return;
    set(state => ({
      scheduledBroadcasts: state.scheduledBroadcasts.map(s =>
        s.id === id ? { ...s, body: body.trim() } : s
      ),
    }));
  },

  /**
   * Send now — production posts to `/send`, then removes the record from the
   * scheduled list; the resulting broadcast reappears in the normal feed. Same
   * here: the scheduled entry becomes a sent BroadcastMessage (with delivery
   * statuses) and leaves the queue.
   */
  sendScheduledBroadcastNow: (id: string) => {
    const { scheduledBroadcasts, allGroups } = get();
    const scheduled = scheduledBroadcasts.find(s => s.id === id);
    if (!scheduled) return;

    const recipientIds = getSelectableGuestIds(scheduled.groupId, allGroups);
    const newMessage: BroadcastMessage = {
      id: `bm-${Date.now()}`,
      groupId: scheduled.groupId,
      content: scheduled.body,
      senderName: scheduled.senderName,
      sentAt: new Date(),
      recipientCount: recipientIds.length,
      recipients: buildRecipientDeliveries(recipientIds),
    };

    set(state => ({
      messages: {
        ...state.messages,
        [scheduled.groupId]: [...(state.messages[scheduled.groupId] || []), newMessage],
      },
      scheduledBroadcasts: state.scheduledBroadcasts.filter(s => s.id !== id),
      scheduledPanelId: null,
    }));
  },

  deleteScheduledBroadcast: (id: string) => {
    set(state => ({
      scheduledBroadcasts: state.scheduledBroadcasts.filter(s => s.id !== id),
      scheduledPanelId: null,
    }));
  },

  showSegmentSavedToast: (name: string) => {
    set({ segmentSavedToast: name });
  },

  dismissSegmentSavedToast: () => {
    set({ segmentSavedToast: null });
  },
}));
