/**
 * ThreadView Component
 *
 * Main conversation view showing messages and composer.
 * Right panel of the messaging interface.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from './Avatar';
import { MessageFeed } from './MessageFeed';
import { MessageComposer } from './MessageComposer';
import { GuestInfoSidebar } from './GuestInfoSidebar';
import { Thread, Message } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { CanaryButton, ButtonType, ButtonSize, CanaryTag, TagSize, TagVariant } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline, mdiCalendarOutline, mdiInformationOutline, mdiDotsVertical } from '@mdi/js';

interface ThreadViewProps {
  thread: Thread;
  guest: Guest;
  reservation: Reservation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  aiEnabled: boolean;
  onAiToggle: () => void;
  isGuestInfoOpen: boolean;
  onToggleGuestInfo: () => void;
  onCloseGuestInfo: () => void;
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
  onCloseGuestInfo,
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
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Thread Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Guest Info */}
          <div className="flex items-center gap-4">
            <Avatar
              src={guest.avatar}
              initials={guest.initials}
              size="medium"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Roboto',sans-serif] font-medium text-base leading-[24px] text-black">
                  {guest.name}
                </h2>
                {/* Archived Tag */}
                {thread.status === 'archived' && (
                  <CanaryTag
                    label="Archived"
                    size={TagSize.COMPACT}
                    variant={TagVariant.FILLED}
                    customColor={{
                      backgroundColor: '#e5e5e5',
                      fontColor: '#666666',
                    }}
                  />
                )}
                {/* Blocked Tag */}
                {thread.status === 'blocked' && (
                  <CanaryTag
                    label="Blocked"
                    size={TagSize.COMPACT}
                    variant={TagVariant.FILLED}
                    customColor={{
                      backgroundColor: '#FCE6ED',
                      fontColor: '#E40046',
                    }}
                  />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                {/* Status Tag */}
                {guest.statusTag && (
                  <CanaryTag
                    label={guest.statusTag.label}
                    size={TagSize.COMPACT}
                    variant={TagVariant.FILLED}
                    customColor={{
                      backgroundColor: guest.statusTag.color,
                      fontColor: guest.statusTag.textColor || 'white',
                    }}
                  />
                )}

                {/* Room Number with Icon */}
                {reservation?.room && (
                  <div className="flex items-center gap-1">
                    <Icon
                      path={mdiBedOutline}
                      size={0.67}
                      color="#000000"
                    />
                    <span className="font-['Roboto',sans-serif] text-[14px] leading-[22px] text-black">
                      {reservation.room}
                    </span>
                  </div>
                )}

                {/* Dates with Icon */}
                {reservation?.checkInDate && reservation?.checkOutDate && (
                  <div className="flex items-center gap-1">
                    <Icon
                      path={mdiCalendarOutline}
                      size={0.67}
                      color="#000000"
                    />
                    <span className="font-['Roboto',sans-serif] text-[14px] leading-[22px] text-black">
                      {reservation.checkInDate} - {reservation.checkOutDate}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Archive Button (only for inbox threads) */}
            {thread.status === 'inbox' && (
              <CanaryButton
                type={ButtonType.SHADED}
                size={ButtonSize.NORMAL}
                onClick={onArchive}
              >
                Archive
              </CanaryButton>
            )}

            {/* Info Button */}
            <button
              onClick={onToggleGuestInfo}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon path={mdiInformationOutline} size={1} color="#666666" />
            </button>

            {/* Menu Button */}
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon path={mdiDotsVertical} size={1} color="#666666" />
              </button>

              {/* Dropdown Menu */}
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
      </div>

      {/* Messages */}
      <MessageFeed messages={messages} />

      {/* Typing Indicator */}
      {isGuestTyping && (
        <div className="px-6 pb-1">
          <p className="font-['Roboto',sans-serif] text-[10px] leading-[16px] text-[#999999]">
            Guest is typing
          </p>
        </div>
      )}

      {/* Composer */}
      <div className="-mt-5">
        <MessageComposer
          onSend={onSendMessage}
          placeholder="Type SMS message..."
          aiEnabled={aiEnabled}
          onAiToggle={onAiToggle}
        />
      </div>

      {/* Guest Info Sidebar */}
      <GuestInfoSidebar
        guest={guest}
        reservation={reservation}
        isOpen={isGuestInfoOpen}
        onClose={onCloseGuestInfo}
      />
    </div>
  );
}
