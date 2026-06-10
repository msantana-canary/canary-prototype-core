/**
 * UnifiedEmailFeed Component
 *
 * "Unified" email-view variant: every email (regardless of subject) in one
 * chronological stream. Consecutive same-subject emails are grouped under a
 * subject header. Automated Guest Journey sends get a muted GUEST JOURNEY
 * label. Clicking any bubble selects that email's thread as the reply target.
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { EmailThread, Message } from '@/lib/products/messaging/types';
import { format } from 'date-fns';

interface UnifiedEmailFeedProps {
  messages: Message[];
  emailThreads: EmailThread[];
  selectedReplyTargetId: string | null;
  onSelectReplyTarget: (emailThreadId: string) => void;
}

export function UnifiedEmailFeed({
  messages,
  emailThreads,
  selectedReplyTargetId,
  onSelectReplyTarget,
}: UnifiedEmailFeedProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emailMessages = useMemo(
    () =>
      messages
        .filter((m) => m.channel === 'Email')
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [messages]
  );

  const subjectById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of emailThreads) map[t.id] = t.subject;
    return map;
  }, [emailThreads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [emailMessages]);

  if (emailMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400 text-center">No emails yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {emailMessages.map((message, index) => {
        const prev = index > 0 ? emailMessages[index - 1] : null;
        const startsNewGroup = !prev || prev.emailThreadId !== message.emailThreadId;
        const subject = (message.emailThreadId && subjectById[message.emailThreadId]) || 'No subject';

        return (
          <React.Fragment key={message.id}>
            {startsNewGroup && (
              <div className={`flex items-center gap-3 ${index === 0 ? 'pb-3' : 'pt-4 pb-3'}`}>
                <p
                  className="font-['Roboto',sans-serif] text-[12px] leading-[18px] font-medium truncate"
                  style={{ color: '#666666' }}
                >
                  {subject}
                </p>
                <div className="flex-1 h-[1px]" style={{ backgroundColor: '#e5e5e5' }} />
                <span
                  className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase shrink-0"
                  style={{ color: '#999999' }}
                >
                  {format(message.timestamp, 'MMM d')}
                </span>
              </div>
            )}
            <MessageBubble
              message={message}
              journeyLabel={message.isGuestJourney ? 'Guest Journey' : undefined}
              isSelected={!!message.emailThreadId && message.emailThreadId === selectedReplyTargetId}
              onClick={
                message.emailThreadId
                  ? () => onSelectReplyTarget(message.emailThreadId!)
                  : undefined
              }
            />
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
