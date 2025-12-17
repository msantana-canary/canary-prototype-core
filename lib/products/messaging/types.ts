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
 * Links to canonical guest and reservation data.
 */
export interface Thread {
  id: string;
  guestId: string;           // Links to canonical Guest
  reservationId: string;     // Links to canonical Reservation
  lastMessage: string;
  lastMessageAt: Date;
  isUnread: boolean;
  status: ThreadStatus;
}

export type ThreadFilter = 'inbox' | 'archived' | 'blocked';
