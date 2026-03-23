'use client';

/**
 * CallTranscriptBubble
 *
 * Simplified message bubble for call transcripts.
 * No delivered status, no thumbs up/down, no avatar.
 * Guest = left-aligned gray bubble, AI = right-aligned blue bubble with CANARY label.
 */

import { Message } from '@/lib/products/messaging/types';
import { format } from 'date-fns';

interface CallTranscriptBubbleProps {
  message: Message;
}

export function CallTranscriptBubble({ message }: CallTranscriptBubbleProps) {
  const isGuest = message.sender === 'guest';
  const formattedTime = format(message.timestamp, 'h:mm a').toUpperCase();

  if (isGuest) {
    return (
      <div className="flex gap-2 items-start mb-4">
        <p
          className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase w-[48px] shrink-0"
          style={{ color: '#999' }}
        >
          {formattedTime}
        </p>
        <div
          className="px-4 py-2 rounded-bl-2xl rounded-br-2xl rounded-tr-2xl max-w-[70%]"
          style={{ backgroundColor: '#F0F0F0' }}
        >
          <p
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
            style={{ color: '#000' }}
          >
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // AI/Staff message — right-aligned
  return (
    <div className="flex gap-2 items-start mb-4">
      <p
        className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase w-[48px] shrink-0"
        style={{ color: '#999' }}
      >
        {formattedTime}
      </p>
      <div className="flex-1" />
      <div
        className="px-4 py-2 rounded-bl-2xl rounded-br-2xl rounded-tl-2xl max-w-[70%]"
        style={{ backgroundColor: '#EAEEF9' }}
      >
        <p
          className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase text-right mb-1"
          style={{ color: '#666' }}
        >
          CANARY
        </p>
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
          style={{ color: '#000' }}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}
