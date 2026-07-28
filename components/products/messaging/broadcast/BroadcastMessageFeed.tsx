/**
 * BroadcastMessageFeed Component — REDESIGN (broadcast step 1 baseline)
 *
 * Scrollable container for broadcast blocks, grouped by day. Bottom-anchored via
 * mt-auto on the inner column (matching the Conversations MessageFeed); scrolls
 * within the feed container only, never an ancestor scroll context.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { colors } from '@canary-ui/components';
import { BroadcastMessageBubble } from './BroadcastMessageBubble';
import { ScheduledBroadcastBlock } from './ScheduledBroadcastBlock';
import { DateSeparator } from '../DateSeparator';
import { BroadcastMessage, ScheduledBroadcast } from '@/lib/products/messaging/broadcast-types';
import { formatDateSeparator, isSameCalendarDay } from '@/lib/utils/date-helpers';

interface BroadcastMessageFeedProps {
  messages: BroadcastMessage[];
  /** Queued sends for this audience — rendered as a pinned section at the end. */
  scheduled?: ScheduledBroadcast[];
  memberCount?: number;
  onOpenScheduled?: (id: string) => void;
}

export function BroadcastMessageFeed({
  messages,
  scheduled = [],
  memberCount = 0,
  onOpenScheduled,
}: BroadcastMessageFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll within the feed container only — not ancestor scroll contexts
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, scheduled]);

  /**
   * Scheduled sends are NOT interleaved chronologically. Production pins them
   * in their own block below everything sent, behind a divider and a centered
   * "Scheduled to send later" header (MessageList.vue) — we mirror that.
   */
  const scheduledSection = scheduled.length > 0 && (
    <div style={{ paddingTop: 8 }}>
      <div className="w-full" style={{ height: 1, backgroundColor: colors.colorBlack6 }} />
      <p
        className="font-['Roboto',sans-serif] text-[12px] leading-[18px] text-center"
        style={{ color: colors.colorBlack4, marginTop: 16, marginBottom: 16 }}
      >
        Scheduled to send later
      </p>
      <div className="flex flex-col gap-2" style={{ paddingBottom: 8 }}>
        {scheduled.map((s) => (
          <ScheduledBroadcastBlock
            key={s.id}
            scheduled={s}
            memberCount={memberCount}
            onOpen={() => onOpenScheduled?.(s.id)}
          />
        ))}
      </div>
    </div>
  );

  if (messages.length === 0) {
    return (
      <div ref={containerRef} className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-gray-400 text-center font-['Roboto',sans-serif] text-[14px]">
            No broadcasts sent to this group yet.<br />
            Type a message below to send a broadcast.
          </p>
        </div>
        {scheduledSection}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto flex flex-col"
      style={{ paddingTop: 16 }}
    >
      <div className="flex flex-col mt-auto">
        {messages.map((message, index) => {
          const showDateSeparator =
            index === 0 ||
            !isSameCalendarDay(
              new Date(message.sentAt),
              new Date(messages[index - 1].sentAt)
            );

          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                <DateSeparator label={formatDateSeparator(new Date(message.sentAt))} />
              )}
              <BroadcastMessageBubble message={message} />
            </React.Fragment>
          );
        })}
        {scheduledSection}
      </div>
    </div>
  );
}
