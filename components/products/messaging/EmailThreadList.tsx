/**
 * EmailThreadList Component
 *
 * List of email threads for the "list" email-view variant.
 * The Email tab opens to this list; clicking a row drills into
 * that thread's conversation. Replaces the message-feed area.
 */

'use client';

import React, { useMemo } from 'react';
import { EmailThread, Message } from '@/lib/products/messaging/types';
import { format } from 'date-fns';

interface EmailThreadListProps {
  emailThreads: EmailThread[];
  messages: Message[];
  onSelect: (emailThreadId: string) => void;
}

interface ThreadRow {
  thread: EmailThread;
  lastMessage: Message | null;
  isUnread: boolean;
}

export function EmailThreadList({ emailThreads, messages, onSelect }: EmailThreadListProps) {
  // Color tokens
  const colorBlack1 = '#000000';
  const colorBlack3 = '#666666';
  const colorBlack4 = '#999999';
  const colorPink = '#E40046';

  const rows: ThreadRow[] = useMemo(() => {
    const emailMessages = messages.filter((m) => m.channel === 'Email');

    return emailThreads
      .map((thread) => {
        const threadMessages = emailMessages.filter((m) => m.emailThreadId === thread.id);
        const lastMessage = threadMessages[threadMessages.length - 1] || null;
        // Unread = last message in the thread is from the guest with no later staff/AI reply
        const isUnread = !!lastMessage && lastMessage.sender === 'guest';
        return { thread, lastMessage, isUnread };
      })
      .sort((a, b) => {
        const aTime = a.lastMessage?.timestamp.getTime() || 0;
        const bTime = b.lastMessage?.timestamp.getTime() || 0;
        return bTime - aTime;
      });
  }, [emailThreads, messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {rows.map(({ thread, lastMessage, isUnread }) => (
        <button
          key={thread.id}
          onClick={() => onSelect(thread.id)}
          className="w-full text-left px-6 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-start gap-3"
        >
          {/* Unread dot */}
          <div className="w-2 shrink-0 pt-2">
            {isUnread && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colorPink }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-3">
              <p
                className="font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
                style={{
                  color: colorBlack1,
                  fontWeight: isUnread ? 500 : 400,
                }}
              >
                {thread.subject}
              </p>
              {lastMessage && (
                <span
                  className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase shrink-0"
                  style={{ color: colorBlack4 }}
                >
                  {format(lastMessage.timestamp, 'MMM d')}
                </span>
              )}
            </div>
            {lastMessage && (
              <p
                className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
                style={{ color: colorBlack3 }}
              >
                {lastMessage.content.replace(/\n+/g, ' ')}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
