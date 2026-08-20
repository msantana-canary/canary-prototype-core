/**
 * AiDraftCard — "RESPONSE DRAFTED BY AI".
 *
 * A reply the agent wrote and did not send, docked between the feed and the
 * composer. It is a CARD, not a band: it carries a whole message, wraps to
 * three lines, and is the only thing in the slot that will become part of the
 * conversation. The bands above the composer input are notices; this is a
 * sentence waiting for a human.
 *
 * ── EDIT PUTS IT IN THE COMPOSER ──────────────────────────────────────────
 * Not an inline editor, not a modal. The composer is where a hotelier writes
 * messages, it already has send, attachments, translate and the AI pill, and it
 * is four inches below the card. Edit hands the draft over and the card leaves —
 * one text at a time, in the one place text is written. An inline editor would
 * have been a second composer with none of the composer's tools.
 *
 * ── SEND ATTRIBUTES TO THE HUMAN ──────────────────────────────────────────
 * The message lands as the signed-in staff member's, not as Canary's. A person
 * read it and chose to send it; the property owns the words. (See `sendDraft`.)
 *
 * ── ⚠ DISMISS IS A DEVIATION FROM PRODUCTION, ON PURPOSE ──────────────────
 * Production asks WHY when a draft is thrown away — a rejected draft is the
 * cheapest training signal the loop will ever get, and that argument is a good
 * one. This card just dismisses.
 *
 * Miguel's call, and the reason is the batch as a whole: there are already two
 * feedback surfaces here (👎's modal and the explanation's drill-in). A third
 * mouth asking the same question at the exact moment someone is trying to clear
 * their screen turns the assistant into a form. If the loop needs the signal,
 * ask once, later — not as a toll on every dismissal.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import { AiDraft } from '@/lib/products/messaging/types';
import { BandButton, BandOverline } from './band-ui';

export function AiDraftCard({
  draft,
  onEdit,
  onSend,
  onDismiss,
}: {
  draft: AiDraft;
  onEdit: () => void;
  onSend: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="ai-gradient-band flex items-center w-full"
      style={{ gap: 12, paddingLeft: 14, paddingRight: 12, paddingTop: 10, paddingBottom: 10 }}
    >
      <div className="flex-1 min-w-0">
        <BandOverline label="Response drafted by AI" />
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
          style={{ color: colors.colorBlack1, marginTop: 2 }}
        >
          {draft.content}
        </p>
      </div>

      {/* Actions are vertically CENTRED against a body that may run to three
          lines — the frame's arrangement. Anchoring them to the top would leave
          them stranded beside a short draft. */}
      <div className="flex items-center shrink-0" style={{ gap: 8 }}>
        <BandButton label="Edit" variant="outline" onClick={onEdit} />
        <BandButton label="Send" variant="primary" onClick={onSend} />
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss draft"
        className="shrink-0 flex items-center justify-center rounded-[4px] transition-colors hover:bg-[rgba(0,0,0,0.06)] cursor-pointer"
        style={{ width: 24, height: 24, padding: 0 }}
      >
        <Icon path={mdiClose} size={0.7} color={colors.colorBlack4} />
      </button>
    </div>
  );
}
