/**
 * ThreadListItem Component
 *
 * Displays a single thread preview in the conversation list.
 * Shows guest info, last message, timestamp, and indicators.
 */

import React from 'react';
import { Avatar } from './Avatar';
import { Thread } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { format } from 'date-fns';
import { CanaryTag, TagSize, TagVariant } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline, mdiRoomServiceOutline } from '@mdi/js';

interface ThreadListItemProps {
  thread: Thread;
  guest?: Guest;
  reservation?: Reservation;
  isSelected?: boolean;
  onClick?: () => void;
  isTyping?: boolean;
}

export function ThreadListItem({
  thread,
  guest,
  reservation,
  isSelected = false,
  onClick,
  isTyping = false,
}: ThreadListItemProps) {
  const formattedTime = format(thread.lastMessageAt, 'h:mm a').toUpperCase();

  // Get guest name and extract first name
  const guestName = guest?.name || 'Unknown Guest';
  const firstName = guestName.split(' ')[0];
  const initials = guest?.initials || '';

  // Get room from reservation
  const room = reservation?.room;

  // Get status tag from guest
  const statusTag = guest?.statusTag;

  // Get request count from reservation
  const requestCount = reservation?.requestCount;

  // Color tokens from library
  const selectedBg = '#2858c4'; // colorBlueDark1
  const unreadBg = '#eaeef9'; // colorBlueDark5
  const readBg = '#f9fafb'; // neutral-50
  const unreadDot = '#f16682'; // colorPink1
  const selectedTextLight = '#93abe1'; // colorBlueDark3

  return (
    <div
      onClick={onClick}
      className={`
        px-6 py-4 cursor-pointer border-b border-neutral-200 transition-colors
        ${isSelected ? '' : 'hover:bg-neutral-100'}
      `}
      style={{
        backgroundColor: isSelected ? selectedBg : thread.isUnread ? unreadBg : readBg,
      }}
    >
      <div className="flex gap-2">
        {/* Avatar */}
        <div className="pt-1">
          <Avatar
            src={guest?.avatar}
            initials={initials}
            size="medium"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Name + Timestamp */}
          <div className="flex items-center justify-between gap-2">
            <p
              className="font-['Roboto',sans-serif] font-medium text-sm leading-[22px] truncate flex-1 min-w-0"
              style={{ color: isSelected ? '#FFFFFF' : '#000000' }}
            >
              {guestName}
            </p>
            <span
              className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase whitespace-nowrap shrink-0"
              style={{ color: isSelected ? selectedTextLight : '#666666' }}
            >
              {formattedTime}
            </span>
          </div>

          {/* Status Tag + Room + Request Count */}
          {(statusTag || room || (requestCount && requestCount > 0)) && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Tag */}
              {statusTag && (
                <CanaryTag
                  label={statusTag.label}
                  size={TagSize.COMPACT}
                  variant={TagVariant.FILLED}
                  customColor={{
                    backgroundColor: statusTag.color,
                    fontColor: statusTag.textColor || 'white',
                  }}
                />
              )}

              {/* Room Number */}
              {room && (
                <div className="flex items-center gap-1">
                  <Icon
                    path={mdiBedOutline}
                    size={0.67}
                    color={isSelected ? '#FFFFFF' : '#000000'}
                  />
                  <span
                    className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
                    style={{ color: isSelected ? '#FFFFFF' : '#000000' }}
                  >
                    {room}
                  </span>
                </div>
              )}

              {/* Request Count */}
              {requestCount && requestCount > 0 && (
                <div className="flex items-center gap-1">
                  <Icon
                    path={mdiRoomServiceOutline}
                    size={0.67}
                    color={isSelected ? '#FFFFFF' : '#000000'}
                  />
                  <span
                    className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
                    style={{ color: isSelected ? '#FFFFFF' : '#000000' }}
                  >
                    {requestCount}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Message Preview + Unread Indicator */}
          <div className="flex items-center gap-2">
            <p
              className={`flex-1 font-['Roboto',sans-serif] text-xs leading-[18px] truncate ${
                isTyping ? 'italic' : thread.isUnread && !isSelected ? 'font-medium' : 'font-normal'
              }`}
              style={{
                color: isSelected
                  ? '#FFFFFF'
                  : thread.isUnread
                  ? '#000000'
                  : '#666666',
              }}
            >
              {isTyping ? `${firstName} is typing...` : thread.lastMessage}
            </p>
            {/* Unread Dot */}
            <div
              className="w-[10px] h-[10px] rounded-full shrink-0"
              style={{
                backgroundColor: thread.isUnread ? unreadDot : 'transparent',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
