/**
 * Team Chat (SPIKE) — types
 *
 * This is a throwaway interaction spike for the Team Chat *container* question:
 * how a globally-accessible coordination panel should enter and coexist with a
 * product page that already has a list + detail layout at 1440px.
 *
 * It is NOT the final Team Chat product. The content (groups, messages, cards)
 * is realistic-but-static, just enough to make the container mechanics feel real.
 */

export type GroupId =
  | 'front-desk'
  | 'housekeeping'
  | 'maintenance'
  | 'valet'
  | 'announcements';

export interface ChatGroup {
  id: GroupId;
  name: string;
  /** Accent color for the group dot (department-flavored). */
  accent: string;
  unread: number;
  /** Announcements is a one-to-many broadcast lane, not a back-and-forth. */
  isBroadcast?: boolean;
}

export type ObjectCardKind = 'guest' | 'reservation' | 'ticket';

/**
 * An object card dropped into a message — Canary's differentiator.
 * References canonical data by id rather than duplicating it.
 */
export interface ObjectCardRef {
  kind: ObjectCardKind;
  guestId?: string;        // canonical guest id (lib/core/data/guests)
  reservationId?: string;  // canonical reservation id (lib/core/data/reservations)
  ticket?: {
    title: string;
    status: 'open' | 'in-progress' | 'resolved';
    room?: string;
  };
}

export interface ChatMessage {
  id: string;
  groupId: GroupId;
  authorName: string;
  authorInitials: string;
  authorAvatar?: string;
  time: string;            // display string, e.g. "9:42 AM"
  text?: string;
  card?: ObjectCardRef;    // optional embedded object card
  isAI?: boolean;          // AI / system auto-post (command-center gesture)
  seenBy?: number;         // passive read-receipt count
  needsAck?: boolean;      // requires an explicit "confirm you've seen this" (Deputy-style)
  ackConfirmed?: number;   // how many have confirmed so far
  ackTotal?: number;       // group size for the confirm tally
  self?: boolean;          // authored by the current user (Theresa Webb)
}
