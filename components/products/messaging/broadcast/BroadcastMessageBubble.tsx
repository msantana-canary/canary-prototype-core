/**
 * BroadcastMessageBubble Component
 *
 * Displays a broadcast message in the thread.
 * Right-aligned with antenna icon, sender name, and recipient count.
 */

import React from 'react';
import { BroadcastMessage } from '@/lib/products/messaging/broadcast-types';
import { format } from 'date-fns';
import Icon from '@mdi/react';
import { mdiVideoInputAntenna, mdiAccountMultipleOutline } from '@mdi/js';

interface BroadcastMessageBubbleProps {
  message: BroadcastMessage;
}

export function BroadcastMessageBubble({ message }: BroadcastMessageBubbleProps) {
  const formattedTime = format(message.sentAt, 'h:mm a').toUpperCase();

  return (
    <div className="flex gap-2 items-start mb-4">
      {/* Timestamp */}
      <p
        className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase w-[48px] shrink-0"
        style={{ color: '#999999' }}
      >
        {formattedTime}
      </p>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Message Container */}
      <div className="flex flex-col items-end max-w-[70%]">
        {/* Message Bubble */}
        <div
          className="w-full px-4 py-2 rounded-bl-2xl rounded-br-2xl rounded-tl-2xl"
          style={{ backgroundColor: '#eaeef9' }}
        >
          {/* Sender Name */}
          <p
            className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase mb-1 text-right"
            style={{ color: '#666666' }}
          >
            {message.senderName}
          </p>

          <p
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
            style={{ color: '#000000' }}
          >
            {message.content}
          </p>

          {/* Recipient count */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <Icon path={mdiAccountMultipleOutline} size={0.5} color="#666666" />
            <span
              className="font-['Roboto',sans-serif] text-[11px] leading-[16px]"
              style={{ color: '#666666' }}
            >
              {message.recipientCount}
            </span>
            <span
              className="font-['Roboto',sans-serif] text-[11px] leading-[16px] ml-0.5"
              style={{ color: '#999999' }}
            >
              &middot;
            </span>
          </div>
        </div>
      </div>

      {/* Broadcast Icon (instead of avatar) */}
      <div
        className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#eaeef9' }}
      >
        <Icon path={mdiVideoInputAntenna} size={0.67} color="#2858c4" />
      </div>
    </div>
  );
}
