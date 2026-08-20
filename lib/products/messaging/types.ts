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

/**
 * WHY THE AI ANSWERED THE WAY IT DID — the sidebar behind the ⓘ, the sources
 * chip and the "AI chose not to respond" link.
 *
 * ⚠ ONE explanation, TWO states, and the state is read off the MESSAGE it hangs
 * on rather than off a discriminator field:
 *
 *   SUCCESS  (an `ai` message)              → the sidebar opens with a band
 *            recapping what was sent; no intro paragraph, no Action Taken.
 *   NON-RESPONSE (a `guest` message with    → there is no sent message to recap,
 *            `aiDeclined`)                     so the `intro` paragraph carries
 *                                              the framing and `actionTaken`
 *                                              names what happened instead.
 *
 * The shape is deliberately not a union: every field that only one state uses is
 * optional, so a message can gain a section without a type migration. What it
 * cannot do is disagree with the message it explains — `sources.length` IS the
 * "N SOURCES" chip's number (see `sourceCountOf`), because the chip and the
 * sidebar are two views of one list.
 *
 * ── RESULT VARIANTS ───────────────────────────────────────────────────────
 * Two are DRAWN and built: "AI successfully responded to the guest's message"
 * and "AI chose not to respond". Three more exist in production's decision
 * space and are deliberately NOT built here — they need their own frames before
 * they are worth faking:
 *   • DIDN'T KNOW      — no KB match at all; Sources Used would be empty, which
 *                        is a different section state, not different copy.
 *   • GUARDRAIL BLOCKED — a policy/safety rule stopped a drafted answer. Needs a
 *                        "Blocked by" section naming the rule.
 *   • ESCALATED        — handed to a human with an assignment. Action Taken
 *                        would have to name the person or department.
 */
export interface AiExplanation {
  /** Non-response only. The success state opens on the message band instead. */
  intro?: string;
  understood: string;
  /** Knowledge-base statements, verbatim. Length drives the sources chip. */
  sources: string[];
  /** Non-response only. */
  actionTaken?: string;
  result: string;
}

/**
 * One carrier receipt on a failed send. `channel` is rendered VERBATIM —
 * "WhatsApp" is brand-cased and "SMS" is an initialism; the modal's overline
 * must never `text-transform` them into agreement.
 *
 * `code` is the only underlined run in the error line (it reads as the link out
 * to the carrier's documentation); `detail` is the curated, hotelier-readable
 * sentence that replaces the carrier's own wording.
 */
export interface CarrierError {
  channel: string;
  code: string;
  detail: string;
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
   * Why this answer, or why this SILENCE. Present on AI messages and on the
   * inbound messages the AI declined — the two places a hotelier can ask "why?"
   */
  aiExplanation?: AiExplanation;
  /** Per-channel carrier receipts, on `status: 'failed'` messages only. */
  carrierErrors?: CarrierError[];
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

/* ═══════════════════════════════════════════════════════════════════════════
   THE AI LOOP AROUND THE THREAD (batch 4, 2026-08-20)

   Four things the AI can put in front of a hotelier without sending anything:
   a DRAFT it wants approved, a FACT it wants to learn, a TICKET it thinks
   should exist, and a NUDGE that a guest has been left waiting. All four live
   between the feed and the composer, and all four are per-thread.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * A reply the AI wrote but did not send. It carries its own trace and source
 * count even though the card draws neither — the draft is an AI artefact, and
 * an artefact without provenance is one that can never be explained later.
 */
export interface AiDraft {
  id: string;
  content: string;
  aiSteps: AiStep[];
  sourceCount: number;
}

/**
 * A statement the AI overheard a human make and would like to remember.
 * The queue is SEQUENTIAL and PERSISTENT: one band at a time, the rest behind a
 * "+N more" hint, and nothing auto-hides — dismissing is the only way out, so a
 * fact can never quietly expire unanswered.
 */
export interface SuggestedFact {
  id: string;
  text: string;
}

/**
 * A service ticket the AI thinks this conversation implies. Deliberately two
 * fields and no more: they are exactly what the Create-service-task form needs
 * prefilled, so "Review" is a hand-off and not a re-typing exercise.
 */
export interface TicketSuggestion {
  room: string;
  issueType: string;
}

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
