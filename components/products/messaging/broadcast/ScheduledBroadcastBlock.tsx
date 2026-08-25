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

import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 4, paddingBottom: 4 }}>
      {/**
       * ⚠ THE DEAD HOVER, fourth instance. `hover:bg-[#f0f0f0]` as a class and
       * `backgroundColor: colorBlack8` inline on the same element: the inline
       * style wins the cascade outright, so the wash on this launcher had never
       * painted. Same bug as the thread row, the broadcast group row and the
       * panel's expander pill — four of one kind is a pattern, and the pattern
       * is that a background stated inline can never answer a pointer.
       *
       * Stated in state instead, so it can. The two colours are the ones the
       * component already declared: `colorBlack8` (#FAFAFA) at rest, one step
       * down to `colorBlack7` (#F0F0F0) on hover, which is what the class had
       * been asking for all along.
       */}
      {/* ⚠ `role="button"` + `tabIndex` WITHOUT `onKeyDown` was a promise the
          launcher did not keep (QA-2): it took focus, announced itself as a
          button, and then ignored Enter and Space — the same shape the thread
          row's `useRowKeyActivation` exists to fix, minus a base component to
          blame. Two keys, stated where the role is. */}
      <div
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          onOpen();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label="View scheduled broadcast"
        className="flex items-start gap-3 rounded-[8px] cursor-pointer transition-colors"
        style={{
          backgroundColor: isHovered ? colors.colorBlack7 : colors.colorBlack8,
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
