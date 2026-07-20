/**
 * MessageBubble Component — REDESIGN: flat blocks, not bubbles
 * (Figma "Messaging" frame 29:2099, "Chatlog" nodes)
 *
 * Everyone is left-aligned (Slack register — the email surface's block anatomy
 * ported back to messaging): 32px rounded-8 avatar · title row (name + status
 * tag + right-aligned 10px uppercase time) · 14px body · 10px uppercase footer
 * (channel "SMS" for guest messages, "DELIVERED" for outbound).
 *
 * Sender identity: guest → guest name (black) + loyalty/status tag; staff →
 * staff name; AI → "Canary" in colorBlueDark1 with the blue tile avatar.
 * The old right-alignment + bubble fills are gone; who-said-what reads from
 * the name column, per the redesign call ("Slack does this; it's clear").
 */

import React from 'react';
import { Message } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { format } from 'date-fns';
import { colors, CanaryTag, TagSize, TagVariant } from '@canary-ui/components';
import { Avatar } from './Avatar';

const STAFF_NAME = 'Theresa Webb';

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
  const statusTag = isGuest ? guest?.statusTag : undefined;

  // Footer: inbound shows the channel; outbound shows delivery status.
  const footer = isGuest ? message.channel : (message.status ?? 'delivered');

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
        {/* Title row */}
        <div className="flex items-center gap-2">
          <span
            className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] truncate"
            style={{ color: nameColor }}
          >
            {displayName}
          </span>
          {statusTag && (
            <CanaryTag
              label={statusTag.label}
              size={TagSize.COMPACT}
              variant={TagVariant.FILLED}
              uppercase
              customColor={{
                backgroundColor: statusTag.color,
                fontColor: statusTag.textColor || 'white',
              }}
            />
          )}
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

        {/* Footer: channel (inbound) / delivery status (outbound) */}
        {footer && (
          <span
            className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
            style={{ color: colors.colorBlack3 }}
          >
            {footer}
          </span>
        )}
      </div>
    </div>
  );
}
