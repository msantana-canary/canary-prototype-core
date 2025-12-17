/**
 * MessageBubble Component
 *
 * Displays a single message in the conversation feed.
 * Styled differently for guest vs staff/AI messages.
 */

import React from 'react';
import { Message } from '@/lib/products/messaging/types';
import { format } from 'date-fns';
import Icon from '@mdi/react';
import { mdiInformationOutline, mdiThumbUp, mdiThumbDown } from '@mdi/js';
import { Avatar } from './Avatar';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isGuest = message.sender === 'guest';
  const isAI = message.sender === 'ai';
  const formattedTime = format(message.timestamp, 'h:mm a').toUpperCase();

  // Color tokens from library
  const colorBlack1 = '#000000'; // Black text
  const colorBlack3 = '#666666'; // Gray text
  const colorBlack4 = '#999999'; // Light gray (timestamp)
  const colorBlack5 = '#cccccc'; // Very light gray (icons)
  const colorBlack7 = '#f0f0f0'; // Light gray background (guest)
  const colorBlueDark1 = '#2858c4'; // Blue
  const colorBlueDark5 = '#eaeef9'; // Light blue background (staff/AI)

  if (isGuest) {
    // Guest message: left-aligned
    return (
      <div className="flex gap-2 items-start mb-4">
        {/* Timestamp */}
        <p
          className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase w-[48px] shrink-0"
          style={{ color: colorBlack4 }}
        >
          {formattedTime}
        </p>

        {/* Message Bubble */}
        <div
          className="px-4 py-2 rounded-bl-2xl rounded-br-2xl rounded-tr-2xl max-w-[70%]"
          style={{ backgroundColor: colorBlack7 }}
        >
          <div className="flex gap-2 items-end justify-start">
            <p
              className="flex-1 font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
              style={{ color: colorBlack1 }}
            >
              {message.content}
            </p>
            {message.channel === 'SMS' && (
              <span
                className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase shrink-0"
                style={{ color: colorBlack3 }}
              >
                SMS
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Staff/AI message: right-aligned
  return (
    <div className="flex gap-2 items-start mb-4">
      {/* Timestamp */}
      <p
        className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase w-[48px] shrink-0"
        style={{ color: colorBlack4 }}
      >
        {formattedTime}
      </p>

      {/* Spacer to push content right */}
      <div className="flex-1" />

      {/* Message Container */}
      <div className="flex flex-col gap-2 items-end max-w-[70%]">
        {/* Message Bubble */}
        <div
          className="w-full px-4 py-2 rounded-bl-2xl rounded-br-2xl rounded-tl-2xl"
          style={{ backgroundColor: colorBlueDark5 }}
        >
          {/* CANARY label for AI messages */}
          {isAI && (
            <p
              className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase text-right mb-1"
              style={{ color: colorBlack3 }}
            >
              CANARY
            </p>
          )}

          {/* Message content */}
          <div className="flex gap-2 items-end justify-end">
            <p
              className="flex-1 font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
              style={{ color: colorBlack1 }}
            >
              {message.content}
            </p>
            {message.channel === 'SMS' && (
              <span
                className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase shrink-0"
                style={{ color: colorBlack3 }}
              >
                SMS
              </span>
            )}
          </div>
        </div>

        {/* Status Row - Only for AI messages */}
        {isAI && (
          <div className="flex gap-2 items-center">
            {/* Info Icon */}
            <button className="p-0 hover:opacity-70 transition-opacity">
              <Icon path={mdiInformationOutline} size={0.83} color={colorBlack5} />
            </button>

            {/* Thumbs Up */}
            <button className="p-0 hover:opacity-70 transition-opacity">
              <Icon path={mdiThumbUp} size={0.83} color={colorBlack5} />
            </button>

            {/* Thumbs Down */}
            <button className="p-0 hover:opacity-70 transition-opacity">
              <Icon path={mdiThumbDown} size={0.83} color={colorBlack5} />
            </button>

            {/* Delivered Status */}
            <span
              className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
              style={{ color: colorBlack3 }}
            >
              DELIVERED
            </span>
          </div>
        )}
      </div>

      {/* Avatar for staff/AI messages */}
      {isAI ? (
        // AI message - show graphic_eq icon
        <div
          className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: colorBlueDark5 }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: colorBlueDark1, fontSize: '16px' }}
          >
            graphic_eq
          </span>
        </div>
      ) : (
        // Staff message - show Theresa Webb avatar
        <Avatar
          initials="TW"
          size="small"
        />
      )}
    </div>
  );
}
