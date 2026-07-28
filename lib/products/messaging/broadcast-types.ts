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

/**
 * The channel a broadcast would actually go out on for a given guest.
 * Production derives this from the guest's contact record; the prototype
 * carries it on the broadcast guest entry so the row can show it.
 */
export type PreferredChannel = 'sms' | 'whatsapp' | 'email';

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
  /** Channel this guest would actually receive the broadcast on. Omitted for
   *  guests with no phone on file (they render as "No phone number"). */
  preferredChannel?: PreferredChannel;
  // Filterable attributes (denormalized for prototype)
  loyaltyTier?: LoyaltyTier;
  rateCode?: string;
  groupCode?: string;
  room?: string;
  stayNights?: number;
  isReturningGuest?: boolean;
}

export interface BroadcastMessage {
  id: string;
  groupId: string;
  content: string;
  senderName: string;
  sentAt: Date;
  recipientCount: number;
  filterSnapshot?: BroadcastMessageFilterSnapshot;
}

export type MainNavTab = 'conversations' | 'broadcast';
