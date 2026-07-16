/**
 * EmailThreadListItem
 *
 * A single row in the Email thread list. Shows the SENDER identity (not the
 * linked guest) per the sender ≠ linked-guest model — sender name, date,
 * subject, and one-line preview. Keeps the ThreadListItem prop idioms
 * (thread / isSelected / onClick).
 */

'use client';

import React from 'react';
import { format } from 'date-fns';
import { colors } from '@canary-ui/components';
import { EmailThread } from '@/lib/products/email/types';

interface EmailThreadListItemProps {
  thread: EmailThread;
  isSelected?: boolean;
  onClick?: () => void;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function EmailThreadListItem({ thread, isSelected = false, onClick }: EmailThreadListItemProps) {
  const date = format(thread.lastActivityAt, 'MMM d').toUpperCase();

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 rounded-[6px] cursor-pointer transition-colors"
      style={{
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: isSelected ? colors.colorBlueDark5 : 'transparent',
        border: `1px solid ${isSelected ? colors.colorBlueDark3 : 'transparent'}`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = colors.colorBlack8;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Avatar */}
      <div
        className="flex items-center justify-center rounded-[8px] shrink-0"
        style={{ width: 32, height: 32, backgroundColor: colors.colorBlack6 }}
      >
        <span
          className="font-['Roboto',sans-serif] font-bold text-[12px]"
          style={{ color: colors.colorBlack3 }}
        >
          {initialsOf(thread.senderName)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Name + date */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
            style={{ color: colors.colorBlack1, fontWeight: thread.isUnread ? 700 : 500 }}
          >
            {thread.senderName}
          </span>
          <span
            className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase whitespace-nowrap shrink-0"
            style={{ color: colors.colorBlack3 }}
          >
            {date}
          </span>
        </div>

        {/* Subject */}
        <span
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
          style={{ color: colors.colorBlack1, fontWeight: thread.isUnread ? 500 : 400 }}
        >
          {thread.subject}
        </span>

        {/* Preview */}
        <span
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
          style={{ color: colors.colorBlack3 }}
        >
          {thread.preview}
        </span>
      </div>
    </div>
  );
}
