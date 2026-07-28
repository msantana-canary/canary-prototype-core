/**
 * MessageFeed Component — REDESIGN
 *
 * Scrollable container displaying flat message blocks grouped by day.
 * Bottom-anchored via mt-auto on the inner column (NOT justify-end on the
 * scroll container — that breaks scrolling for overflowing content).
 *
 * Auto-scrolls by setting this container's own scrollTop. Deliberately NOT
 * scrollIntoView: that walks every scrollable ancestor up to the document, so
 * whenever the document has any scrollable overflow it drags the whole app
 * shell upward and paints white below it.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { Message } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { formatDateSeparator, isSameCalendarDay } from '@/lib/utils/date-helpers';

interface MessageFeedProps {
  messages: Message[];
  guest?: Guest | null;
}

export function MessageFeed({ messages, guest }: MessageFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change — container-scoped.
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400 text-center font-['Roboto',sans-serif] text-[14px]">
          No messages yet.<br />
          Start a conversation with this guest.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto flex flex-col" style={{ paddingTop: 16 }}>
      <div className="flex flex-col mt-auto">
        {messages.map((message, index) => {
          const showDateSeparator =
            index === 0 ||
            !isSameCalendarDay(
              new Date(message.timestamp),
              new Date(messages[index - 1].timestamp)
            );

          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                <DateSeparator label={formatDateSeparator(new Date(message.timestamp))} />
              )}
              <MessageBubble message={message} guest={guest} />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
