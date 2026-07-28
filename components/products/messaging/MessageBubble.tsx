/**
 * MessageBubble Component — REDESIGN: flat blocks, not bubbles
 * (Figma "Messaging" frame 29:2099, "Chatlog" nodes)
 *
 * Everyone is left-aligned (Slack register — the email surface's block anatomy
 * ported back to messaging): 32px rounded-8 avatar · title row (name +
 * right-aligned 10px uppercase time) · 14px body · 10px uppercase footer
 * (channel "SMS" for guest messages; real delivery status for outbound).
 *
 * Sender identity: guest → guest name (black); staff → staff name; AI →
 * "Canary" in colorBlueDark1 with the blue tile avatar. The old
 * right-alignment + bubble fills are gone; who-said-what reads from the name
 * column, per the redesign call ("Slack does this; it's clear").
 *
 * Loyalty/status tag: removed from message blocks (Miguel 2026-07-20 — it
 * repeated on every message and was too loud). The tier now renders in the
 * thread list row and thread header only.
 *
 * Delivery status follows the PRODUCTION rule: status renders under every
 * outbound message (staff AND AI) whenever a carrier receipt exists, mapped to
 * "Sending" / "Sent" / "Delivered" / "Failed to send". Failed = red row + alert
 * icon + "Learn more" (into a carrier-error modal; modal itself out of scope).
 */

import React from 'react';
import { Message, MessageStatus } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { format } from 'date-fns';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiAlertCircleOutline } from '@mdi/js';
import { Avatar } from './Avatar';

const STAFF_NAME = 'Theresa Webb';

// Failed-state red — $color-red-1 (@canary-ui doesn't expose this as a token yet).
const COLOR_RED_1 = '#E40046';

// Production (MessageAtomBubble.vue): status renders on every outbound message
// from carrier receipts; Read>Delivered>Sent>Sending; failed = alert + Learn more.
// We map the prototype's MessageStatus to the production English labels. (The
// prototype has no 'read' state yet; 'delivered' is the top of the ladder here.)
const STATUS_LABELS: Record<MessageStatus, string> = {
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed to send',
};

interface MessageBubbleProps {
  message: Message;
  guest?: Guest | null;
}

export function MessageBubble({ message, guest }: MessageBubbleProps) {
  const isGuest = message.sender === 'guest';
  const isAI = message.sender === 'ai';
  const formattedTime = format(message.timestamp, 'h:mm a').toUpperCase();

  const displayName = isGuest ? guest?.name ?? 'Guest' : isAI ? 'Canary' : STAFF_NAME;
  const nameColor = isAI ? colors.colorBlueDark1 : colors.colorBlack1;

  // Footer: inbound (guest) shows the channel; outbound (staff/AI) shows the real
  // delivery status mapped to production labels. Undefined status falls back to
  // "Delivered" (the prior default behavior).
  const outboundStatus: MessageStatus = message.status ?? 'delivered';
  const isFailed = !isGuest && outboundStatus === 'failed';
  const footer = isGuest
    ? message.channel
    : STATUS_LABELS[outboundStatus];

  return (
    <div className="flex items-start gap-3" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}>
      {/* Avatar */}
      {isAI ? (
        <div
          className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: colors.colorBlueDark5 }}
        >
          <span className="material-symbols-outlined" style={{ color: colors.colorBlueDark1, fontSize: '16px' }}>
            graphic_eq
          </span>
        </div>
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
        {/* Title row — name + timestamp only. The loyalty/status tag was removed
            from message blocks (Miguel 2026-07-20); it now lives in the thread
            list row and thread header, not on every message. */}
        <div className="flex items-center gap-2">
          <span
            className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] truncate"
            style={{ color: nameColor }}
          >
            {displayName}
          </span>
          <span className="flex-1" />
          <span
            className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase whitespace-nowrap shrink-0"
            style={{ color: colors.colorBlack3 }}
          >
            {formattedTime}
          </span>
        </div>

        {/* Body */}
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
          style={{ color: colors.colorBlack1 }}
        >
          {message.content}
        </p>

        {/* Footer: channel (inbound) / real delivery status (outbound).
            Failed outbound gets the production treatment: red row + alert icon +
            a "Learn more" affordance (opens a carrier-error modal in prod; the
            modal itself is out of scope here). */}
        {isFailed ? (
          <div className="flex items-center gap-1" style={{ color: COLOR_RED_1, marginTop: 6 }}>
            <Icon path={mdiAlertCircleOutline} size="14px" color={COLOR_RED_1} />
            <span className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase">
              {footer}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={() => {}}
              className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase underline cursor-pointer"
            >
              Learn more
            </span>
          </div>
        ) : (
          footer && (
            <span
              className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
              style={{ color: colors.colorBlack3, marginTop: 6 }}
            >
              {footer}
            </span>
          )
        )}
      </div>
    </div>
  );
}
