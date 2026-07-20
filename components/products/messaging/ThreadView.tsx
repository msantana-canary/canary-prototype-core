/**
 * ThreadView Component — REDESIGN (Figma "Messaging" frame 29:2099, node 29:2230)
 *
 * The conversation card: white rounded-12 bordered container holding the
 * thread header (guest identity · Archive / info / kebab), the flat-block
 * message feed, and the composer. The guest info panel is NO LONGER rendered
 * inside this component — it's a sibling column (push) or overlay (drawer)
 * composed at the page level.
 *
 * Header changes vs old build: Archive is the tonal blue button; the info
 * button carries a pressed state while the panel is open; the kebab uses
 * more_horiz (Figma) and keeps Block/Unblock + Mark as Unread; the standalone
 * "Link reservation" text button is gone (linking lives in the info panel).
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from './Avatar';
import { MessageFeed } from './MessageFeed';
import { MessageComposer } from './MessageComposer';
import { Thread, Message } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { colors, CanaryTag, TagSize, TagVariant } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline, mdiCalendarOutline, mdiInformationOutline, mdiDotsHorizontal } from '@mdi/js';

interface ThreadViewProps {
  thread: Thread;
  guest: Guest | null;
  reservation: Reservation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  aiEnabled: boolean;
  onAiToggle: () => void;
  isGuestInfoOpen: boolean;
  onToggleGuestInfo: () => void;
  onArchive: () => void;
  onBlock: () => void;
  onUnblock: () => void;
  onMarkUnread: () => void;
  typingThreadId: string | null;
}

export function ThreadView({
  thread,
  guest,
  reservation,
  messages,
  onSendMessage,
  aiEnabled,
  onAiToggle,
  isGuestInfoOpen,
  onToggleGuestInfo,
  onArchive,
  onBlock,
  onUnblock,
  onMarkUnread,
  typingThreadId,
}: ThreadViewProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isGuestTyping = typingThreadId === thread.id;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuAction = (action: 'block' | 'unblock' | 'markUnread') => {
    setIsMenuOpen(false);

    switch (action) {
      case 'block':
        onBlock();
        break;
      case 'unblock':
        onUnblock();
        break;
      case 'markUnread':
        onMarkUnread();
        break;
    }
  };

  return (
    <div
      className="flex-1 min-w-0 flex flex-col h-full overflow-clip rounded-[12px]"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Thread Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ minHeight: 70, borderBottom: `1px solid ${colors.colorBlack6}`, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}
      >
        {/* Guest Info / Contact Number */}
        <div className="flex items-center min-w-0">
          <Avatar src={guest?.avatar} initials={guest?.initials || ''} size="medium" />
          <div className="min-w-0" style={{ paddingLeft: 8 }}>
            <div className="flex items-center gap-2">
              <h2 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] truncate" style={{ color: colors.colorBlack1 }}>
                {guest?.name || thread.contactNumber}
              </h2>
              {/* Loyalty tier — moved here from message blocks (Miguel 2026-07-20).
                  Renders in the thread list row and thread header only. */}
              {guest?.statusTag && (
                <CanaryTag
                  label={guest.statusTag.label}
                  size={TagSize.COMPACT}
                  variant={TagVariant.FILLED}
                  uppercase
                  customColor={{
                    backgroundColor: guest.statusTag.color,
                    fontColor: guest.statusTag.textColor || 'white',
                  }}
                />
              )}
              {thread.status === 'archived' && (
                <CanaryTag
                  label="Archived"
                  size={TagSize.COMPACT}
                  variant={TagVariant.FILLED}
                  customColor={{ backgroundColor: '#e5e5e5', fontColor: '#666666' }}
                />
              )}
              {thread.status === 'blocked' && (
                <CanaryTag
                  label="Blocked"
                  size={TagSize.COMPACT}
                  variant={TagVariant.FILLED}
                  customColor={{ backgroundColor: '#FCE6ED', fontColor: '#E40046' }}
                />
              )}
            </div>
            <div className="flex items-center gap-3">
              {reservation?.room && (
                <div className="flex items-center gap-1">
                  <Icon path={mdiBedOutline} size={0.67} color={colors.colorBlack3} />
                  <span className="font-['Roboto',sans-serif] text-[14px] leading-[22px]" style={{ color: colors.colorBlack3 }}>
                    {reservation.room}
                  </span>
                </div>
              )}
              {reservation?.checkInDate && reservation?.checkOutDate && (
                <div className="flex items-center gap-1">
                  <Icon path={mdiCalendarOutline} size={0.67} color={colors.colorBlack3} />
                  <span className="font-['Roboto',sans-serif] text-[14px] leading-[22px]" style={{ color: colors.colorBlack3 }}>
                    {reservation.checkInDate} - {reservation.checkOutDate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Archive (tonal) — only for inbox threads */}
          {thread.status === 'inbox' && (
            <button
              onClick={onArchive}
              className="flex items-center justify-center rounded-[6px] font-['Roboto',sans-serif] font-medium text-[14px] transition-opacity hover:opacity-80 cursor-pointer"
              style={{ height: 40, paddingLeft: 16, paddingRight: 16, backgroundColor: 'rgba(40,88,196,0.1)', color: colors.colorBlueDark1 }}
            >
              Archive
            </button>
          )}

          {/* Info button (pressed while the panel is open) */}
          <button
            onClick={onToggleGuestInfo}
            aria-label="Conversation details"
            aria-pressed={isGuestInfoOpen}
            className={`rounded-[4px] transition-colors cursor-pointer ${isGuestInfoOpen ? '' : 'hover:bg-[#f0f0f0]'}`}
            style={{
              padding: 10,
              // Only set an inline bg when pressed (open); leave it unset when
              // closed so the hover class can paint.
              ...(isGuestInfoOpen ? { backgroundColor: colors.colorBlueDark5 } : {}),
            }}
          >
            <Icon
              path={mdiInformationOutline}
              size={0.83}
              color={isGuestInfoOpen ? colors.colorBlueDark1 : colors.colorBlack3}
            />
          </button>

          {/* Kebab menu */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="More actions"
              className="rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
              style={{ padding: 10 }}
            >
              <Icon path={mdiDotsHorizontal} size={0.83} color={colors.colorBlack3} />
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                {thread.status === 'blocked' ? (
                  <>
                    <button
                      onClick={() => handleMenuAction('unblock')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: '#2858C4' }}
                    >
                      Unblock
                    </button>
                    <button
                      onClick={() => handleMenuAction('markUnread')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: '#000000' }}
                    >
                      Mark as Unread
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleMenuAction('block')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: '#E40046' }}
                    >
                      Block
                    </button>
                    <button
                      onClick={() => handleMenuAction('markUnread')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: '#000000' }}
                    >
                      Mark as Unread
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageFeed messages={messages} guest={guest} />

      {/* Typing Indicator */}
      {isGuestTyping && (
        <div className="px-4 pb-1">
          <p className="font-['Roboto',sans-serif] text-[10px] leading-[16px]" style={{ color: colors.colorBlack4 }}>
            Guest is typing
          </p>
        </div>
      )}

      {/* Composer */}
      <div className="shrink-0">
        <MessageComposer
          onSend={onSendMessage}
          placeholder="Type SMS message..."
          aiEnabled={aiEnabled}
          onAiToggle={onAiToggle}
        />
      </div>
    </div>
  );
}
