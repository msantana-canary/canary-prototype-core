/**
 * AiStepsCard — the AI tool-call trace, as one shared component.
 *
 * Extracted verbatim from `MessageBubble`'s inline steps card (batch 2) because
 * the SAME trace has two homes: the message feed and the Conversation Details
 * panel's call transcript, which renders the voice agent's tool calls inline
 * between utterances. The trace is the AI's work, and the AI's work should look
 * the same wherever it is shown — one register, one component, not two drifting
 * copies.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE BOX IS GONE (design review 2026-08-21, frame 2090:37167)
 * ═══════════════════════════════════════════════════════════════════════════
 * The trace used to have two dresses: a rounded-8 `colorBlack6` BOX in the feed,
 * and a 2px gradient left rail (`accent`) in the transcript. The review settled
 * the open "white box" question against the box, everywhere.
 *
 * A message in this feed has no container of its own — the name, the body and
 * the delivery caption all sit directly on the thread's ground. Dropping a
 * bordered card in the middle of that stack made the audit trail the most
 * ENCLOSED thing in the conversation, which is backwards: the trace is
 * secondary reading, and the box gave it a frame the answer it explains never
 * gets. It also boxed the AI's own work away from the AI's own name.
 *
 * So the trace is bare rows on the message ground, marked by the same gradient
 * rail the transcript already used — the AI gradient bleeding DOWN from the
 * "Canary" name, which is what ties the block to the speaker instead of to a
 * border. One dress now, not two, and `accent` is gone as a prop with nothing
 * left to distinguish.
 *
 * Anatomy (unchanged): each row is a small check glyph + "{tool} · {note}" in
 * 12px `colorBlack3`. The tool name renders as the trace records it (snake_case,
 * occasionally a proper noun) — we never normalise it.
 *
 * The two callers differ only in INSET, which is why `style` exists: the
 * transcript sits in a column that already speaks in speaker bars and pays the
 * column's 12px/4px padding, while the feed's copy is flush under the name with
 * the rail's own extent as its only edge (see `MessageBubble`).
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiCheck } from '@mdi/js';
import { AiStep } from '@/lib/products/messaging/types';

interface AiStepsCardProps {
  steps: AiStep[];
  className?: string;
  /** Per-caller inset. The rail's height follows whatever this leaves. */
  style?: React.CSSProperties;
}

export function AiStepsCard({ steps, className = '', style }: AiStepsCardProps) {
  if (steps.length === 0) return null;

  return (
    /* No base under this one: it is a gradient strip and a column of text, and
       the strip is painted as a BACKGROUND rather than a `border-image` because
       a one-sided gradient border needs every side's width declared to slice
       and silently renders as nothing otherwise. See `.ai-gradient-bar`. */
    <div
      className={`ai-gradient-bar ${className}`}
      style={{ paddingLeft: 12, paddingRight: 10, paddingTop: 4, paddingBottom: 4, ...style }}
    >
      {steps.map((step, i) => (
        <div
          key={`${step.tool}-${i}`}
          className="flex items-start gap-2"
          style={{ paddingTop: 1, paddingBottom: 1 }}
        >
          <span className="shrink-0 flex items-center" style={{ height: 20 }}>
            <Icon path={mdiCheck} size={0.58} color={colors.colorBlack3} />
          </span>
          <span
            className="font-['Roboto',sans-serif] text-[12px] leading-[20px] min-w-0"
            style={{ color: colors.colorBlack3 }}
          >
            {step.tool} · {step.note}
          </span>
        </div>
      ))}
    </div>
  );
}
