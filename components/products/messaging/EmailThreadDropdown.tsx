/**
 * EmailThreadDropdown Component
 *
 * "Dropdown rich" email-view variant — Jake's pretty-and-simple hybrid.
 * Collapsed it reads like a compact CanarySelect; open, it shows the same
 * rich rows as the List view (subject + last-message preview + timestamp +
 * unread dot), so thread inventory and unread state are visible the moment
 * it opens.
 */

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EmailThread, Message } from '@/lib/products/messaging/types';
import { deriveEmailThreadRows } from './EmailThreadList';
import { format } from 'date-fns';
import Icon from '@mdi/react';
import { mdiChevronDown } from '@mdi/js';

interface EmailThreadDropdownProps {
  emailThreads: EmailThread[];
  messages: Message[];
  selectedEmailThreadId: string | null;
  onSelect: (emailThreadId: string | null) => void;
}

export function EmailThreadDropdown({
  emailThreads,
  messages,
  selectedEmailThreadId,
  onSelect,
}: EmailThreadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Color tokens
  const colorBlack1 = '#000000';
  const colorBlack3 = '#666666';
  const colorBlack4 = '#999999';
  const colorBlack6 = '#e5e5e5';
  const colorPink = '#E40046';

  const rows = useMemo(
    () => deriveEmailThreadRows(emailThreads, messages),
    [emailThreads, messages]
  );

  const selected = emailThreads.find((t) => t.id === selectedEmailThreadId) || emailThreads[0];
  const unreadCount = rows.filter((r) => r.isUnread).length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (emailThreads.length <= 1) return null;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger — reads like a compact CanarySelect */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 h-8 rounded bg-white text-left"
        style={{ border: `1px solid ${isOpen ? '#2858c4' : colorBlack6}` }}
      >
        <span
          className="flex-1 font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
          style={{ color: colorBlack1 }}
        >
          {selected?.subject}
        </span>
        {unreadCount > 0 && !isOpen && (
          <span
            className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-['Roboto',sans-serif] text-[10px] font-medium text-white"
            style={{ backgroundColor: colorPink }}
          >
            {unreadCount}
          </span>
        )}
        <Icon path={mdiChevronDown} size={0.67} color={colorBlack3} className="shrink-0" />
      </button>

      {/* Popover — List-view row anatomy */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-[320px] overflow-y-auto">
          {rows.map(({ thread, lastMessage, isUnread }) => (
            <button
              key={thread.id}
              onClick={() => {
                onSelect(thread.id);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-start gap-2"
              style={{
                backgroundColor: thread.id === selected?.id ? '#eaeef9' : undefined,
              }}
            >
              {/* Unread dot */}
              <div className="w-2 shrink-0 pt-2">
                {isUnread && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorPink }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className="font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
                    style={{ color: colorBlack1, fontWeight: isUnread ? 500 : 400 }}
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
      )}
    </div>
  );
}
