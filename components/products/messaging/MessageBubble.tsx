/**
 * MessageBubble Component — REDESIGN: flat blocks, not bubbles
 * (Figma "Messaging" frame 2038:57666, "Chatlog" nodes)
 *
 * Everyone is left-aligned (Slack register — the email surface's block anatomy
 * ported back to messaging): 32px rounded-8 avatar · title row (name +
 * right-aligned 10px uppercase time) · 14px body · 10px uppercase footer.
 *
 * Sender identity: guest → guest name (black); staff → staff name; AI →
 * "Canary" in the shared AI gradient (`.ai-gradient-text`) with the animated
 * orb tile for an avatar. Who-said-what reads from the name column, per the
 * redesign call ("Slack does this; it's clear").
 *
 * ── AI MESSAGE ANATOMY (the batch-2 addition) ─────────────────────────────
 * An AI message is not a staff message with a different name. It carries its
 * own work:
 *
 *   [orb]  Canary · Completed 6 Steps ⌄                            5:25 PM
 *          ┌──────────────────────────────────────────────────┐
 *          │ ✓ Search_for_reservation… · Found Emily Smith …   │  ← toggled
 *          │ ✓ Offer_upsells · Late Check-Out Is Available …   │
 *          └──────────────────────────────────────────────────┘
 *          Thanks for letting us know!
 *          DELIVERED  ( 3 SOURCES ⌄ )      ⓘ  👍  👎   ← on hover
 *
 * Steps are UNIVERSAL, not a hero-message garnish: every AI message in the mock
 * carries a trace, because the point is observability — a hotelier should be
 * able to ask "why did it say that?" of ANY answer, not just the interesting
 * one. The card is CLOSED BY DEFAULT everywhere; the caption is the toggle.
 *
 * Feedback (ⓘ / 👍 / 👎) appears on hover so a quiet feed stays quiet. Thumbs-up
 * is a local visual toggle only — there is no feedback pipeline behind it yet,
 * and ⓘ / 👎 / the sources chip are deliberate no-op stubs.
 *
 * ── FOOTER REGISTERS ──────────────────────────────────────────────────────
 * Three captions can sit under a message, all in the same 10px uppercase slot:
 *
 *   1. Delivery status (outbound) — production's ladder, unchanged.
 *   2. "AI CHOSE NOT TO RESPOND" (inbound, `aiDeclined`) — a blue underlined
 *      link after the channel caption. Silence from the agent is a decision,
 *      and an unexplained silence reads as a bug; naming it turns a gap into a
 *      fact. No-op stub for now (it will open the reason).
 *   3. "MESSAGE FAILED TO SEND" (outbound, status `failed`) — a RED underlined
 *      link. This REPLACES the old failed register (red row + alert icon +
 *      "Learn more"); the state logic is untouched, only its dress. Collapsing
 *      three elements into one link makes the failure sit in the same rhythm as
 *      every other caption instead of shouting a whole extra row.
 *
 * Loyalty/status tag: removed from message blocks (Miguel 2026-07-20) — it
 * repeated on every message and was too loud. The tier lives in the thread list
 * row and thread header only.
 */

'use client';

import React, { useState } from 'react';
import { Message, MessageStatus } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { format } from 'date-fns';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiCheck,
  mdiChevronDown,
  mdiChevronUp,
  mdiInformationOutline,
  mdiThumbUp,
  mdiThumbDown,
} from '@mdi/js';
import { Avatar } from './Avatar';

const STAFF_NAME = 'Theresa Webb';

// Failed-state red — $color-red-1 (@canary-ui doesn't expose this as a token yet).
const COLOR_RED_1 = '#E40046';

// Production (MessageAtomBubble.vue): status renders on every outbound message
// from carrier receipts; Read>Delivered>Sent>Sending. We map the prototype's
// MessageStatus to the production English labels. (The prototype has no 'read'
// state yet; 'delivered' is the top of the ladder here.)
const STATUS_LABELS: Record<MessageStatus, string> = {
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed to send',
};

const CAPTION_CLASS = "font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase";

/** The AI's animated avatar — an 18px orb in a 32px gradient-bordered tile. */
function AiOrbAvatar() {
  return (
    <span className="ai-orb-tile shrink-0" aria-hidden="true">
      <span className="ai-orb">
        <span className="ai-orb-base" />
        <span className="ai-orb-petal ai-orb-a" />
        <span className="ai-orb-petal ai-orb-b" />
        <span className="ai-orb-petal ai-orb-c" />
        <span className="ai-orb-petal ai-orb-d" />
        <span className="ai-orb-core" />
      </span>
    </span>
  );
}

/** An underlined caption link. The one interaction register for both footer
 *  links — only the color changes (blue for "declined", red for "failed"). */
function CaptionLink({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`${CAPTION_CLASS} underline cursor-pointer text-left`}
      style={{ color, textUnderlineOffset: 2 }}
    >
      {label}
    </button>
  );
}

/** A bare feedback icon — no box, neutral wash on hover. */
function FeedbackIcon({
  path,
  label,
  active,
  onClick,
}: {
  path: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="flex items-center justify-center rounded-[4px] cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.06)]"
      style={{ width: 20, height: 20, padding: 0 }}
    >
      <Icon path={path} size={0.6} color={active ? colors.colorBlueDark1 : colors.colorBlack4} />
    </button>
  );
}

interface MessageBubbleProps {
  message: Message;
  guest?: Guest | null;
}

export function MessageBubble({ message, guest }: MessageBubbleProps) {
  const isGuest = message.sender === 'guest';
  const isAI = message.sender === 'ai';
  const formattedTime = format(message.timestamp, 'h:mm a').toUpperCase();

  // Steps stay CLOSED on mount — every AI message has them, so defaulting open
  // would bury the conversation under its own audit trail.
  const [isStepsOpen, setIsStepsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);

  const displayName = isGuest ? guest?.name ?? 'Guest' : isAI ? 'Canary' : STAFF_NAME;

  const steps = isAI ? message.aiSteps ?? [] : [];
  const sourceCount = isAI ? message.sourceCount : undefined;

  // Footer: inbound (guest) shows the channel; outbound (staff/AI) shows the
  // real delivery status mapped to production labels. Undefined status falls
  // back to "Delivered" (the prior default behavior).
  const outboundStatus: MessageStatus = message.status ?? 'delivered';
  const isFailed = !isGuest && outboundStatus === 'failed';
  const deliveryCaption = isGuest ? message.channel : STATUS_LABELS[outboundStatus];

  // Feedback controls persist once used, so a rating doesn't vanish on mouse-out.
  const showFeedback = isAI && (isHovered || isHelpful);

  return (
    <div
      className="flex items-start gap-3"
      style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      {isAI ? (
        <AiOrbAvatar />
      ) : (
        <Avatar
          src={isGuest ? guest?.avatar : undefined}
          initials={isGuest ? guest?.initials ?? '' : 'TW'}
          size="small"
          className="shrink-0"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col pt-1">
        {/* Title row — name (+ the AI steps toggle) and a right-aligned time. */}
        <div className="flex items-center gap-2">
          <span
            className={`font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] truncate ${
              isAI ? 'ai-gradient-text' : ''
            }`}
            style={isAI ? undefined : { color: colors.colorBlack1 }}
          >
            {displayName}
          </span>

          {isAI && steps.length > 0 && (
            <>
              <span
                aria-hidden="true"
                className="font-['Roboto',sans-serif] text-[12px] leading-[18px] shrink-0"
                style={{ color: colors.colorBlack3 }}
              >
                ·
              </span>
              <button
                onClick={() => setIsStepsOpen((v) => !v)}
                aria-expanded={isStepsOpen}
                className="flex items-center gap-1 shrink-0 cursor-pointer rounded-[4px] transition-colors hover:bg-[rgba(0,0,0,0.05)]"
                style={{ padding: 0 }}
              >
                <span
                  className="font-['Roboto',sans-serif] text-[12px] leading-[18px] whitespace-nowrap"
                  style={{ color: colors.colorBlack3 }}
                >
                  Completed {steps.length} Steps
                </span>
                <Icon
                  path={isStepsOpen ? mdiChevronUp : mdiChevronDown}
                  size={0.6}
                  color={colors.colorBlack2}
                />
              </button>
            </>
          )}

          <span className="flex-1" />
          <span
            className={`${CAPTION_CLASS} whitespace-nowrap shrink-0`}
            style={{ color: colors.colorBlack3 }}
          >
            {formattedTime}
          </span>
        </div>

        {/* Steps card — sits ABOVE the answer, because it is what produced it. */}
        {isAI && isStepsOpen && steps.length > 0 && (
          <div
            className="rounded-[8px]"
            style={{
              border: `1px solid ${colors.colorBlack6}`,
              marginTop: 4,
              marginBottom: 8,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 6,
              paddingBottom: 6,
            }}
          >
            {steps.map((step, i) => (
              <div key={`${step.tool}-${i}`} className="flex items-start gap-2" style={{ paddingTop: 1, paddingBottom: 1 }}>
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
        )}

        {/* Body */}
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
          style={{ color: colors.colorBlack1 }}
        >
          {message.content}
        </p>

        {/* Footer row — caption(s), the sources chip, and hover feedback. */}
        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 6, minHeight: 20 }}>
          {isFailed ? (
            <CaptionLink label="Message failed to send" color={COLOR_RED_1} onClick={() => {}} />
          ) : (
            <>
              {deliveryCaption && (
                <span className={CAPTION_CLASS} style={{ color: colors.colorBlack3 }}>
                  {deliveryCaption}
                </span>
              )}
              {isGuest && message.aiDeclined && (
                <CaptionLink
                  label="AI chose not to respond"
                  color={colors.colorBlueDark1}
                  onClick={() => {}}
                />
              )}
            </>
          )}

          {/* Sources chip — a bordered pill, no fill, no shadow. */}
          {isAI && !!sourceCount && (
            <button
              onClick={() => {}}
              className={`${CAPTION_CLASS} flex items-center gap-1 rounded-full cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.04)]`}
              style={{
                color: colors.colorBlack3,
                border: `1px solid ${colors.colorBlack6}`,
                height: 20,
                paddingLeft: 8,
                paddingRight: 6,
              }}
            >
              {sourceCount} Sources
              <Icon path={mdiChevronDown} size={0.55} color={colors.colorBlack3} />
            </button>
          )}

          {showFeedback && (
            <div className="flex items-center gap-1">
              <FeedbackIcon path={mdiInformationOutline} label="About this answer" onClick={() => {}} />
              <FeedbackIcon
                path={mdiThumbUp}
                label="Helpful"
                active={isHelpful}
                onClick={() => setIsHelpful((v) => !v)}
              />
              <FeedbackIcon path={mdiThumbDown} label="Not helpful" onClick={() => {}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
