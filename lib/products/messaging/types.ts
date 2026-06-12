/**
 * Messaging Type Definitions
 *
 * Messaging-specific types that build on the canonical data layer.
 */

export type MessageSender = 'guest' | 'staff' | 'ai';
export type MessageChannel = 'SMS' | 'WhatsApp' | 'Email' | 'OTA' | 'Web';

export interface EmailThread {
  id: string;
  subject: string;
  /** Messaging thread this email thread is linked to (auto-link by sender address).
   *  Absent = unlinked external sender (vendor, inquiry, spam). */
  parentThreadId?: string;
  /** Sender identity for unlinked threads */
  senderEmail?: string;
  senderName?: string;
}

export type ChannelSelectorVariant = 'pills' | 'dropdown' | 'icon-tabs';
export type EmailComposerVariant = 'inline' | 'full';
export type ChannelSelectorPosition = 'below-header' | 'above-composer';
export type InboxLayout = 'standard' | 'compact';
export type EmailViewVariant = 'dropdown' | 'dropdown-rich' | 'list' | 'unified';
export type ChannelTabMode = 'channels' | 'two-tab';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed';
export type ThreadStatus = 'inbox' | 'archived' | 'blocked';

export interface Message {
  id: string;
  threadId: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  channel?: MessageChannel;
  status?: MessageStatus;
  emailThreadId?: string;
  isGuestJourney?: boolean;
  /** Display-only CC line (guest-side CC — hotel never CCs in V1) */
  cc?: string;
}

/**
 * Thread represents a messaging conversation.
 * A thread is 1:1 with a contact number (phone/channel session)
 * but 1:many with reservations. Reservations are cosmetically linked
 * for context — linking never changes message routing.
 *
 * Auto-linked: reservation's guest phone matches contactNumber (cannot unlink)
 * Manually linked: guest phone differs from contactNumber (can unlink)
 */
export interface Thread {
  id: string;
  contactNumber: string;           // The phone number being messaged (always present)
  linkedReservationIds: string[];   // Reservation IDs linked to this thread (empty = unlinked)
  lastMessage: string;
  lastMessageAt: Date;
  isUnread: boolean;
  status: ThreadStatus;
}

export type ThreadFilter = 'inbox' | 'archived' | 'blocked';

/**
 * Resolved linked reservation — combines reservation + guest data
 * with auto-link status derived from phone matching.
 */
export interface LinkedReservation {
  reservation: import('@/lib/core/types/reservation').Reservation;
  guest: import('@/lib/core/types/guest').Guest;
  isAutoLinked: boolean;
}
