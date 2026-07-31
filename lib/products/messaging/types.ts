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
  isFlagged?: boolean;              // Priority flag (redesign) — flag replaces the unread dot in the row
  isEscalated?: boolean;            // Escalated conversation — the row's attention dot turns amber
                                    // (warning), mirroring production's `is_escalated` `.isEscalated`
                                    // variant. The dot shows for unread OR escalated.
  assignedTo?: ThreadAssignment;    // Undefined = unassigned
}

export type ThreadFilter = 'inbox' | 'archived' | 'blocked';

/**
 * Thread assignment — mirrors production exactly: a thread is assigned to a USER
 * XOR a DEPARTMENT, never both (production enforces the xor at write time, and
 * the server rejects setting more than one). A user carries their own
 * department, which is what makes department filtering transitive.
 */
export interface ThreadAssignment {
  type: 'user' | 'department';
  id: string;
  name: string;
  /** For users: the department they belong to. Drives transitive matching. */
  departmentId?: string;
}


/**
 * Resolved linked reservation — combines reservation + guest data
 * with auto-link status derived from phone matching.
 */
export interface LinkedReservation {
  reservation: import('@/lib/core/types/reservation').Reservation;
  guest: import('@/lib/core/types/guest').Guest;
  isAutoLinked: boolean;
}
