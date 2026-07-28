/**
 * ScheduledBroadcastBlock — a queued broadcast in the feed.
 *
 * Production draws this as an OUTLINED bubble with a clock icon beside it
 * (ScheduledGroupBroadcastAtom.vue), deliberately distinct from a filled sent
 * message. Our surface has no bubbles, so the same "this is not sent yet" signal
 * is carried in the flat-block register instead: a clock tile where a sender
 * avatar would be, a soft colorBlack8 card, and the blue "Scheduled for …" line.
 *
 * Like production's atom this carries NO actions — it is a launcher. Clicking it
 * opens the scheduled-broadcast panel, which owns edit / send now / delete.
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import { mdiClockOutline, mdiAccountMultipleOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { ScheduledBroadcast } from '@/lib/products/messaging/broadcast-types';
import { formatScheduledMessageTime } from '@/lib/products/messaging/broadcast-schedule';

function toTitleCase(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function ScheduledBroadcastBlock({
  scheduled,
  memberCount,
  onOpen,
}: {
  scheduled: ScheduledBroadcast;
  memberCount: number;
  onOpen: () => void;
}) {
  return (
    <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 4, paddingBottom: 4 }}>
      <div
        onClick={onOpen}
        role="button"
        tabIndex={0}
        aria-label="View scheduled broadcast"
        className="flex items-start gap-3 rounded-[8px] cursor-pointer transition-colors hover:bg-[#f0f0f0]"
        style={{
          backgroundColor: colors.colorBlack8,
          border: `1px solid ${colors.colorBlack6}`,
          padding: 12,
        }}
      >
        {/* Clock tile stands in for the sender avatar — the "not sent yet" tell */}
        <div
          className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: colors.colorBlack7 }}
        >
          <Icon path={mdiClockOutline} size={0.72} color={colors.colorBlack3} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] truncate"
              style={{ color: colors.colorBlack1 }}
            >
              {toTitleCase(scheduled.senderName)}
            </span>
            <span className="flex-1" />
            <span
              className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase whitespace-nowrap shrink-0"
              style={{ color: colors.colorBlack3 }}
            >
              Scheduled
            </span>
          </div>

          <p
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
            style={{ color: colors.colorBlack1 }}
          >
            {scheduled.body}
          </p>

          <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 6 }}>
            <div className="flex items-center gap-1">
              <Icon path={mdiClockOutline} size={0.58} color={colors.colorBlueDark1} />
              <span
                className="font-['Roboto',sans-serif] font-medium text-[10px] leading-[16px] uppercase"
                style={{ color: colors.colorBlueDark1 }}
              >
                {formatScheduledMessageTime(scheduled.sendAt)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Icon path={mdiAccountMultipleOutline} size={0.58} color={colors.colorBlack3} />
              <span
                className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
                style={{ color: colors.colorBlack3 }}
              >
                {memberCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
