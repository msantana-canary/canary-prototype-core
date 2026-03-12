/**
 * Broadcast Type Definitions
 *
 * Types for the broadcast messaging feature.
 * Broadcasts send messages to multiple guests at once.
 */

export type BuiltInGroupType = 'arrivals' | 'in-house' | 'departures';

export type GuestSegment = 'expecting' | 'checked-in' | 'checked-out' | 'departing';

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
}

export interface BroadcastMessage {
  id: string;
  groupId: string;
  content: string;
  senderName: string;
  sentAt: Date;
  recipientCount: number;
}

export type MainNavTab = 'conversations' | 'broadcast' | 'ai-answers';
