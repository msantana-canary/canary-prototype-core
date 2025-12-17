/**
 * MessageFeed Component
 *
 * Scrollable container displaying all messages in a conversation.
 * Auto-scrolls to bottom when new messages arrive.
 * Groups messages by date with separator labels.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { Message } from '@/lib/products/messaging/types';
import { formatDateSeparator, isSameCalendarDay } from '@/lib/utils/date-helpers';

interface MessageFeedProps {
  messages: Message[];
}

export function MessageFeed({ messages }: MessageFeedProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400 text-center">
          No messages yet.<br />
          Start a conversation with this guest.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.map((message, index) => {
        // Check if we need a date separator before this message
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
            <MessageBubble message={message} />
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
