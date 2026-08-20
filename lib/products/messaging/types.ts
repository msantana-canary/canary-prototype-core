/**
 * Messaging Type Definitions
 *
 * Messaging-specific types that build on the canonical data layer.
 */

export type MessageSender = 'guest' | 'staff' | 'ai';
export type MessageChannel = 'SMS' | 'WhatsApp' | 'Email' | 'Web';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed';
export type ThreadStatus = 'inbox' | 'archived' | 'blocked';

/**
 * One tool call in an AI message's trace. `tool` is the tool name as the trace
 * records it (snake_case, occasionally a proper noun like "Guest Profile" /
 * "Decision" — we render whatever the trace says, we don't normalise it);
 * `note` is the one-line, hotelier-readable result of that call.
 */
export interface AiStep {
  tool: string;
  note: string;
}

export interface Message {
  id: string;
  threadId: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  channel?: MessageChannel;
  status?: MessageStatus;
  /**
   * OBSERVABILITY — universal AI-message anatomy, not a special case. Every AI
   * message carries the tool-by-tool trace that produced it; the message header
   * summarises it ("Completed N Steps") and the caption toggles the card open.
   * Closed by default everywhere.
   */
  aiSteps?: AiStep[];
  /** Knowledge-base sources the answer drew on — the "N SOURCES" footer chip. */
  sourceCount?: number;
  /**
   * Inbound message the AI deliberately left alone (low confidence, policy, or
   * a human already owned the thread). Renders "AI CHOSE NOT TO RESPOND" after
   * the channel caption — the absence of an AI reply is itself a fact worth
   * showing, otherwise silence reads as a bug.
   */
  aiDeclined?: boolean;
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

/* ═══════════════════════════════════════════════════════════════════════════
   CONVERSATION DETAILS PANEL (redesign, 2026-08-20)

   The panel is guest-profile-first: one PRIMARY person in the spotlight, their
   own stays behind a count, and four tabs of things attached to them. These
   types are the tabs' data.
   ═══════════════════════════════════════════════════════════════════════════ */

export type UpsellStatus = 'requested' | 'approved' | 'denied';

/**
 * One upsell attached to a guest. `quantity` is absent for a room upgrade —
 * you don't buy two of a King Suite, and the frames print the upgrade's name
 * bare where an add-on prints "1x {name}".
 */
export interface Upsell {
  id: string;
  name: string;
  quantity?: number;
  /** "Add-on" / "Room Upgrade" — the caption under the name. */
  category: string;
  status: UpsellStatus;
}

/**
 * Service-task status. `waiting` carries the elapsed minutes production prints
 * INSIDE the tag ("WAITING 1652M") — the number is the point, so it lives on
 * the status rather than beside it.
 */
export type ServiceTaskStatus = 'open' | 'waiting' | 'closed';

export interface ServiceTask {
  id: string;
  title: string;
  status: ServiceTaskStatus;
  waitingMinutes?: number;
  room?: string;
  /** Locally created tasks (the Create service task page) carry a quantity. */
  quantity?: number;
}

/**
 * One utterance in a call transcript. `steps` is the AI's tool-call trace for
 * the turn it produced — the SAME `AiStep` shape a chat message carries, so the
 * shared <AiStepsCard> renders both.
 */
export interface CallTranscriptTurn {
  /** Rendered verbatim: a phone number for the guest, "Canary AI" for the agent. */
  speaker: string;
  isAi?: boolean;
  /** Pre-formatted, "2:45 PM". */
  time: string;
  text: string;
  steps?: AiStep[];
}

/** Whether the AI held the call or handed it to a human. */
export type CallHandleStatus = 'Contained' | 'Transferred';

export interface CallRecord {
  id: string;
  /** Row line 1 — "May 12th at 10:02 AM". */
  startedAtLabel: string;
  /** Row line 2 — "1 min 3 sec". */
  durationLabel: string;
  /** Detail meta grid. */
  guestName: string;
  timeOfCall: string;
  /** mm:ss. The scrubber's fill is elapsed/duration, so these must agree. */
  durationClock: string;
  elapsedClock: string;
  handleStatus: CallHandleStatus;
  /** The trace id, truncated on screen with a copy affordance. */
  externalId: string;
  /** Summary tab — one string per paragraph. */
  summary: string[];
  /** "Call Begins • 2:45 PM". */
  beginsLabel: string;
  transcript: CallTranscriptTurn[];
}
