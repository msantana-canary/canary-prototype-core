/**
 * Messaging Type Definitions
 *
 * Messaging-specific types that build on the canonical data layer.
 */

export type MessageSender = 'guest' | 'staff' | 'ai';
export type MessageChannel = 'SMS' | 'WhatsApp' | 'Email' | 'Web';
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
