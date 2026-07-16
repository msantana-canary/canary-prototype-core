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
}
