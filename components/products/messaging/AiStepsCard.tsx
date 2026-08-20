/**
 * AiStepsCard — the AI tool-call trace, as one shared component.
 *
 * Extracted verbatim from `MessageBubble`'s inline steps card (batch 2) because
 * the SAME trace now has a second home: the Conversation Details panel's call
 * transcript renders the voice agent's tool calls inline between utterances.
 * The trace is the AI's work, and the AI's work should look the same wherever it
 * is shown — one register, one component, not two drifting copies.
 *
 * Anatomy (unchanged from the message feed): a rounded-8, colorBlack6-bordered
 * box of rows; each row is a small check glyph + "{tool} · {note}" in 12px
 * colorBlack3. The tool name is rendered as the trace records it (snake_case,
 * occasionally a proper noun) — we never normalise it.
 *
 * `accent` adds a 2px left bar in the shared AI gradient and drops the box
 * border. That is the CALL TRANSCRIPT dress (frames 2042:37462): in a transcript
 * every utterance already carries a left speaker bar, so a bordered box would
 * read as a foreign object dropped into a column of bars — the trace takes the
 * column's own idiom and marks itself with the AI gradient instead.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiCheck } from '@mdi/js';
import { AiStep } from '@/lib/products/messaging/types';

interface AiStepsCardProps {
  steps: AiStep[];
  /** Transcript dress: gradient left bar instead of the bordered box. */
  accent?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AiStepsCard({ steps, accent = false, className = '', style }: AiStepsCardProps) {
  if (steps.length === 0) return null;

  return (
    <div
      className={`${accent ? 'ai-gradient-bar' : 'rounded-[8px]'} ${className}`}
      style={{
        ...(accent
          ? { paddingLeft: 12, paddingRight: 10, paddingTop: 4, paddingBottom: 4 }
          : {
              border: `1px solid ${colors.colorBlack6}`,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 6,
              paddingBottom: 6,
            }),
        ...style,
      }}
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
