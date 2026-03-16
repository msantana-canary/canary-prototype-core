/**
 * BroadcastMessageFeed Component
 *
 * Scrollable container for broadcast messages.
 * Groups by date with separators, auto-scrolls to bottom.
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll within the feed container only — not ancestor scroll contexts
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400 text-center">
          No broadcasts sent to this group yet.<br />
          Type a message below to send a broadcast.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-6">
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
      <div ref={messagesEndRef} />
    </div>
  );
}
