/**
 * Broadcast Type Definitions
 *
 * Types for the broadcast messaging feature.
 * Broadcasts send messages to multiple guests at once.
 */

export type BuiltInGroupType = 'arrivals' | 'in-house' | 'departures';

export type GuestSegment = 'expecting' | 'checked-in' | 'checked-out' | 'departing';

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

export interface BroadcastGroup {
  id: string;
  name: string;
  type: 'built-in' | 'custom';
  builtInType?: BuiltInGroupType;
  memberGuestIds?: string[];    // For custom groups - direct guest references
  isArchived: boolean;
  lastBroadcastPreview?: string;
  memberCount?: number;         // Display count for custom groups
}

export interface BroadcastGuestEntry {
  guestId: string;
  reservationId: string;
  segment?: GuestSegment;
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

export type MainNavTab = 'conversations' | 'broadcast';
