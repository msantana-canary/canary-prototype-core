/**
 * Broadcast Type Definitions
 *
 * Types for the broadcast messaging feature.
 * Broadcasts send messages to multiple guests at once.
 */

export type BuiltInGroupType = 'arrivals' | 'in-house' | 'departures';

/**
 * The guest's stay status — production's `CheckInStatus`, which is what drives
 * both the section buckets and the per-folder auto-select exclusions. It is NOT
 * a per-folder label: the same status buckets differently depending on which
 * folder you're looking at (see `bucketForFolder`).
 */
export type BroadcastCheckInStatus = 'expecting' | 'in-house' | 'checked-out';

/** Section buckets, production's three (`expecting` / `in` / `out`). */
export type BroadcastBucket = 'expecting' | 'in' | 'out';

export type LoyaltyTier = 'non-member' | 'club-member' | 'silver-elite' | 'gold-elite' | 'platinum-elite' | 'diamond-elite';

export type LengthOfStay = 'one-night' | 'multiple-nights';
export type GuestRecurrence = 'first-time' | 'recurring';

export interface BroadcastFilterCriteria {
  loyaltyTiers: LoyaltyTier[];
  rateCodes: string[];
  groupCodes: string[];
  roomNumbers: string[];
  lengthOfStay: LengthOfStay | null;
  guestRecurrence: GuestRecurrence | null;
}

export interface SavedFilter {
  id: string;
  name: string;
  criteria: BroadcastFilterCriteria;
}

export interface BroadcastMessageFilterSnapshot {
  type: 'ad-hoc' | 'saved';
  savedFilterName?: string;
  criteria: BroadcastFilterCriteria;
  attributeCount: number;
}

/**
 * The channels a hand-entered contact can be reached on.
 *
 * ⚠ NO EMAIL, and that is production's rule rather than a simplification: a
 * broadcast group is a list of PHONE numbers, and the channel picker chooses
 * which carrier rides that number. The prototype's old modal offered "Apple
 * Messages" as a third option, which was wrong twice over — Apple Messages is
 * negotiated per-device off the same number rather than picked by staff, and it
 * is not in production's list.
 */
export type BroadcastContactChannel = 'sms' | 'whatsapp';

/**
 * A contact typed straight into the New group modal.
 *
 * DELIBERATELY NOT A GUEST. `memberGuestIds` points at the canonical guest data
 * — people the PMS knows, with reservations, rooms and loyalty tiers. These are
 * a name and a number somebody typed, which is the whole point of a custom
 * group: it is the list you build for the wedding party, the conference block or
 * the ownership group, none of whom the PMS has a record for. Keeping them in a
 * separate field means nothing downstream ever has to guess whether a member id
 * will resolve to a guest.
 */
export interface BroadcastGroupContact {
  id: string;
  /** Optional in the form, so optional here. Falls back to the number. */
  name?: string;
  phone: string;
  channel: BroadcastContactChannel;
}

export interface BroadcastGroup {
  id: string;
  name: string;
  type: 'built-in' | 'custom';
  builtInType?: BuiltInGroupType;
  memberGuestIds?: string[];    // For custom groups - direct guest references
  /** Hand-entered contacts (New group modal). See BroadcastGroupContact. */
  contacts?: BroadcastGroupContact[];
  isArchived: boolean;
  lastBroadcastPreview?: string;
  memberCount?: number;         // Display count for custom groups
}

export interface BroadcastGuestEntry {
  guestId: string;
  reservationId: string;
  checkInStatus?: BroadcastCheckInStatus;
  /**
   * The date this guest belongs to the folder on — arrival date for Arrivals,
   * departure date for Departures (yyyy-MM-dd). In-house and custom groups have
   * no date dimension, so they omit it and ignore the strip's date token.
   */
  folderDate?: string;
  /**
   * Production's `messaging_opted_out`. Together with a missing phone this is
   * what makes a guest unmessageable (`canMessageGuest`).
   */
  messagingOptedOut?: boolean;
  // Filterable attributes (denormalized for prototype)
  loyaltyTier?: LoyaltyTier;
  rateCode?: string;
  groupCode?: string;
  room?: string;
  stayNights?: number;
  isReturningGuest?: boolean;
}

/**
 * Per-recipient delivery status.
 *
 * Mirrors production's `NotificationStatus` (shared/schemas/notifications/
 * NotificationStatus.ts) one-for-one, plus `pending-rtc`. Production does NOT
 * store that last one: it derives it from a FAILED WhatsApp message that has a
 * live Request-to-Contact behind it (`isRtcPending` in messageChannelLabel.ts).
 * The prototype has no per-channel status fields to derive from, so it's carried
 * as its own value.
 */
export type BroadcastRecipientStatus =
  | 'not-sent'
  | 'sending'
  | 'sent'
  | 'resent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'blocked-high-rate-country'
  | 'pending-rtc';

export interface BroadcastRecipientDelivery {
  guestId: string;
  status: BroadcastRecipientStatus;
}

export interface BroadcastMessage {
  id: string;
  groupId: string;
  content: string;
  senderName: string;
  sentAt: Date;
  recipientCount: number;
  filterSnapshot?: BroadcastMessageFilterSnapshot;
  /** Per-recipient delivery log, shown in the broadcast delivery panel. */
  recipients?: BroadcastRecipientDelivery[];
}

/**
 * A broadcast queued to go out later.
 *
 * Mirrors production's `ScheduledGroupBroadcast` (shared/schemas/chat), trimmed
 * to what the prototype models: production carries uuid/id pairs, a
 * `broadcast_group` uuid, a nullable `broadcast` id that gets populated once the
 * send happens, and `sent_at`/`deleted_at` tombstones. Here a scheduled
 * broadcast simply leaves the list when it is sent or deleted.
 *
 * Scheduling is CUSTOM-GROUP ONLY, matching production's gate — built-in
 * Arrivals / In-house / Departures never schedule.
 */
export interface ScheduledBroadcast {
  id: string;
  groupId: string;
  body: string;
  senderName: string;
  /** When it goes out. */
  sendAt: Date;
  createdAt: Date;
}

export type MainNavTab = 'conversations' | 'broadcast';
