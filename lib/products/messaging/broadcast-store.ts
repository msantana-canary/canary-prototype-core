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
  BroadcastGroupContact,
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
  BROADCAST_TODAY,
} from './broadcast-mock-data';
import { registerGroupContacts, resolveBroadcastGuest } from './broadcast-contacts';
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
  filters: BroadcastFilterCriteria,
  date: string
): BroadcastGuestEntry[] {
  const entries = getGuestEntriesForGroup(groupId, allGroups, date);
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
  /** Add a set of guests to the selection without clearing anything else. */
  addGuestsToSelection: (guestIds: string[]) => void;
  sendBroadcast: (content: string) => void;
  openCreateGroupModal: () => void;
  closeCreateGroupModal: () => void;
  createGroup: (name: string, contacts?: BroadcastGroupContact[]) => void;

  // Filter actions
  openFilterModal: () => void;
  closeFilterModal: () => void;
  applyFilters: (criteria: BroadcastFilterCriteria, segmentId?: string) => void;
  clearAllFilters: () => void;

  // Delivery panel
  openDeliveryPanel: (messageId: string) => void;
  closeDeliveryPanel: () => void;


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

/**
 * Get guest entries for a given group.
 *
 * Arrivals and Departures are DATE-SCOPED: the To strip's date token is a real
 * filter, so only guests arriving/departing on the selected day are in the
 * audience. In-house and custom groups have no date dimension and ignore it.
 *
 * ⚠ `date` is an EXPLICIT PARAMETER, deliberately. It used to be read as
 * `useBroadcastStore.getState().selectedDate` at call time, which made this
 * function depend on the store it lives above — and the store's INITIAL STATE
 * calls it (via `getSelectableGuestIds`) during `create()`, i.e. before the
 * `useBroadcastStore` binding exists. That is a temporal dead zone: cold module
 * evaluation threw `Cannot access 'useBroadcastStore' before initialization`
 * and every route importing the broadcast surface 500'd. HMR masked it because
 * the binding was already initialised on a warm reload. Nothing in this file
 * below the store may read the store back. Callers pass `selectedDate`;
 * initial state passes `INITIAL_SELECTED_DATE`, the same constant it seeds
 * `selectedDate` with, so the two cannot drift.
 */
export function getGuestEntriesForGroup(
  groupId: string,
  allGroups: BroadcastGroup[],
  date: string
): BroadcastGuestEntry[] {
  // Check built-in groups first
  if (builtInGroupGuests[groupId]) {
    const entries = builtInGroupGuests[groupId];
    const dated = entries.some(e => e.folderDate);
    if (!dated) return entries;
    return entries.filter(e => !e.folderDate || e.folderDate === date);
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
  return !!resolveBroadcastGuest(entry.guestId)?.phone && !entry.messagingOptedOut;
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
function getSelectableGuestIds(
  groupId: string,
  allGroups: BroadcastGroup[],
  date: string
): string[] {
  const entries = getGuestEntriesForGroup(groupId, allGroups, date);
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
    status: !resolveBroadcastGuest(guestId)?.phone ? 'not-sent' : i % 5 === 3 ? 'sent' : 'delivered',
  }));
}

/** Messageable ids among the guest entries currently on screen for a filter. */
function getVisibleSelectableIds(
  groupId: string,
  allGroups: BroadcastGroup[],
  filters: BroadcastFilterCriteria,
  date: string
): string[] {
  const entries = isFilterEmpty(filters)
    ? getGuestEntriesForGroup(groupId, allGroups, date)
    : getFilteredGuestEntries(groupId, allGroups, filters, date);
  return entries.filter(canMessageGuest).map(entry => entry.guestId);
}

/**
 * The day the broadcast surface opens on. Seeds `selectedDate` AND the
 * date-scoped initial selection below — one constant so the audience the store
 * boots with always matches the date it boots on.
 */
const INITIAL_SELECTED_DATE = BROADCAST_TODAY;

export const useBroadcastStore = create<BroadcastState>((set, get) => ({
  // Initial state
  allGroups: [...builtInGroups, ...customGroups],
  selectedGroupId: 'group-arrivals',
  activeGroupTab: 'active',
  selectedDate: INITIAL_SELECTED_DATE,
  selectedGuestIds: getSelectableGuestIds(
    'group-arrivals',
    [...builtInGroups, ...customGroups],
    INITIAL_SELECTED_DATE
  ),
  messages: { ...mockBroadcastMessages },
  isCreateGroupModalOpen: false,

  // Filter state
  activeFilters: { ...emptyFilterCriteria },
  isFilterModalOpen: false,
  loadedSegmentId: null,

  segmentSavedToast: null,
  deliveryPanelMessageId: null,
  scheduledBroadcasts: [...mockScheduledBroadcasts],
  scheduledPanelId: null,

  // Select a group — auto-selects all messageable guests and clears filters.
  // Production does the same on folder change (BroadcastV2BuiltInGroupGuestList
  // watches `folder` → clearFilters() → getGuestData() → selectGuestsForFolder).
  selectGroup: (groupId: string) => {
    const { allGroups, selectedDate } = get();
    const selectableIds = getSelectableGuestIds(groupId, allGroups, selectedDate);
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

  /**
   * Changing the date changes WHO is in the folder, so it re-selects exactly
   * like switching audience — a stale selection from another day would send to
   * guests who are no longer on screen.
   */
  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    const { selectedGroupId, allGroups } = get();
    set({
      selectedGuestIds: getSelectableGuestIds(selectedGroupId, allGroups, date),
      activeFilters: { ...emptyFilterCriteria },
      loadedSegmentId: null,
    });
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
    const { selectedGroupId, allGroups, activeFilters, selectedDate } = get();
    set({
      selectedGuestIds: getVisibleSelectableIds(
        selectedGroupId,
        allGroups,
        activeFilters,
        selectedDate
      ),
    });
  },

  deselectAllGuests: () => {
    set({ selectedGuestIds: [] });
  },

  addGuestsToSelection: (guestIds: string[]) => {
    set(state => {
      const next = new Set(state.selectedGuestIds);
      for (const id of guestIds) next.add(id);
      return { selectedGuestIds: Array.from(next) };
    });
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

  /**
   * A new custom group, with whatever contacts the modal collected.
   *
   * `memberCount` is DERIVED from the contact list rather than passed —
   * every number on the broadcast surface is a `.length`, and a stored count
   * that can disagree with the list it counts is a bug waiting for its first
   * edit.
   *
   * ⚠ AND THE CONTACTS BECOME RECIPIENTS (QA-3, 2026-08-25). `memberGuestIds`
   * used to stay empty on the reasoning that hand-entered contacts are not
   * canonical PMS guests. That is true about where the record came from and
   * false about whether you can text it, and the whole audience pipeline
   * resolves recipients from `memberGuestIds` — so every group this flow could
   * produce (the modal refuses to save without a contact) landed with "1 guest"
   * on its rail row, "no one to send to" in the To strip and a permanently
   * disabled "Send to 0 guests". The demo's create-a-group-and-blast-it path
   * dead-ended by construction.
   *
   * `registerGroupContacts` admits them as ordinary entries under synthetic
   * ids; `broadcast-contacts.ts` carries the whole argument.
   */
  createGroup: (name: string, contacts: BroadcastGroupContact[] = []) => {
    if (!name.trim()) return;

    const memberGuestIds = registerGroupContacts(contacts);

    const newGroup: BroadcastGroup = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      type: 'custom',
      memberGuestIds,
      contacts,
      isArchived: false,
      memberCount: contacts.length,
    };

    set(state => ({
      allGroups: [...state.allGroups, newGroup],
      isCreateGroupModalOpen: false,
      /**
       * Land the user IN the group they just made — creating a group and then
       * having to go and find it is the flow admitting it did nothing.
       *
       * The three fields under it are `selectGroup`'s own resets, restated
       * because that action reads `allGroups` from `get()` and the new group is
       * not in it until this `set` lands — which is also why the selection is
       * computed here from the ids we just minted rather than by calling
       * `getSelectableGuestIds` on a list it cannot see yet.
       *
       * Everyone the modal collected starts SELECTED, matching `selectGroup`'s
       * own "auto-select all messageable guests": the hotelier just typed these
       * numbers in one at a time, so asking them to tick each one again is the
       * flow doubting work it watched them do.
       */
      selectedGroupId: newGroup.id,
      selectedGuestIds: memberGuestIds.filter((guestId) =>
        canMessageGuest({ guestId, reservationId: '' })
      ),
      activeFilters: { ...emptyFilterCriteria },
      loadedSegmentId: null,
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
    const { selectedGroupId, allGroups, activeFilters, selectedGuestIds, selectedDate } = get();

    // Snapshot the unchecked rows currently on screen.
    const selectedSet = new Set(selectedGuestIds);
    const deselected = new Set(
      getVisibleSelectableIds(selectedGroupId, allGroups, activeFilters, selectedDate).filter(
        id => !selectedSet.has(id)
      )
    );

    // Rebuild from the new result, minus that snapshot.
    const nextVisible = getVisibleSelectableIds(
      selectedGroupId,
      allGroups,
      criteria,
      selectedDate
    );

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
    const { selectedGroupId, allGroups, selectedDate } = get();
    set({
      activeFilters: { ...emptyFilterCriteria },
      loadedSegmentId: null,
      selectedGuestIds: getSelectableGuestIds(selectedGroupId, allGroups, selectedDate),
    });
  },

  openDeliveryPanel: (messageId: string) => {
    set({ deliveryPanelMessageId: messageId });
  },

  closeDeliveryPanel: () => {
    set({ deliveryPanelMessageId: null });
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
    const { scheduledBroadcasts, allGroups, selectedDate } = get();
    const scheduled = scheduledBroadcasts.find(s => s.id === id);
    if (!scheduled) return;

    const recipientIds = getSelectableGuestIds(scheduled.groupId, allGroups, selectedDate);
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
