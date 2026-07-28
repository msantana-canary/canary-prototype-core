/**
 * BroadcastMessageFeed Component — REDESIGN (broadcast step 1 baseline)
 *
 * Scrollable container for broadcast blocks, grouped by day. Bottom-anchored via
 * mt-auto on the inner column (matching the Conversations MessageFeed); scrolls
 * within the feed container only, never an ancestor scroll context.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { BroadcastMessageBubble } from './BroadcastMessageBubble';
import { DateSeparator } from '../DateSeparator';
import { BroadcastMessage } from '@/lib/products/messaging/broadcast-types';
import { formatDateSeparator, isSameCalendarDay } from '@/lib/utils/date-helpers';

interface BroadcastMessageFeedProps {
  messages: BroadcastMessage[];
}

export function BroadcastMessageFeed({ messages }: BroadcastMessageFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll within the feed container only — not ancestor scroll contexts
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400 text-center font-['Roboto',sans-serif] text-[14px]">
          No broadcasts sent to this group yet.<br />
          Type a message below to send a broadcast.
        </p>
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
      </div>
    </div>
  );
}
