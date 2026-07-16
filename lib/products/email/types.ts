/**
 * Email Channel — Types
 *
 * Phase 1 data model for the standalone Email channel (demo/email-channel).
 *
 * Key modeling decision (matches Rachel's prototype + the Figma):
 * the email's From identity (`senderName`/`senderEmail`) is DISTINCT from the
 * auto-linked canonical guest profile (`linkedGuestId`). The thread list and
 * thread header show the SENDER; the message block inside the read pane shows
 * the LINKED GUEST name + loyalty tag. Auto-link is by sender address, so the
 * two identities may differ — this is deliberate, not a mock-data bug.
 */

export type EmailDirection = 'inbound' | 'outbound';
export type EmailView = 'inbox' | 'archived';
export type EmailStatus = 'inbox' | 'archived';

export interface EmailMessage {
  id: string;
  threadId: string;
  direction: EmailDirection;
  body: string; // plain text, \n\n paragraphs
  sentAt: Date;
  staffName?: string; // outbound only
}

/** A named email participant (used for the Info sidebar's CC row). */
export interface EmailParticipant {
  name: string;
  email: string;
}

export interface EmailThread {
  id: string;
  senderName: string; // From display name — what list + header show
  senderEmail: string;
  subject: string; // "Re: ..." inherited
  linkedGuestId?: string; // canonical guest auto-linked BY SENDER ADDRESS — may be undefined
  status: EmailStatus;
  isUnread: boolean;
  lastActivityAt: Date;
  preview: string; // one-line list preview (verbatim from Figma)
  /**
   * CC recipients on the thread, if any. Modeled at the THREAD level (not
   * per-message): the Email Info sidebar's Participants section is display-only
   * and a thread's participant set is stable across its messages, so a single
   * thread-level list is simpler than reconciling per-message CCs. Optional —
   * most threads have no CC; Nina Ashford's thread CCs her partner (guest-side)
   * so the Participants CC row has something to show.
   */
  cc?: EmailParticipant[];
}
