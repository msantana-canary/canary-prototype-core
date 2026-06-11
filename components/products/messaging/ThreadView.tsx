/**
 * ThreadView Component
 *
 * Main conversation view showing messages and composer.
 * Right panel of the messaging interface.
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Avatar } from './Avatar';
import { MessageFeed } from './MessageFeed';
import { MessageComposer } from './MessageComposer';
import { GuestInfoSidebar } from './GuestInfoSidebar';
import { EmailThreadSelector } from './EmailThreadSelector';
import { EmailThreadDropdown } from './EmailThreadDropdown';
import { EmailThreadList } from './EmailThreadList';
import { UnifiedEmailFeed } from './UnifiedEmailFeed';
import { Thread, Message, LinkedReservation, MessageChannel, ChannelSelectorVariant, EmailComposerVariant, EmailThread, ChannelSelectorPosition, EmailViewVariant, ChannelTabMode } from '@/lib/products/messaging/types';
import { CanaryTabs } from '@canary-ui/components';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { CanaryButton, ButtonType, ButtonSize, CanaryTag, TagSize, TagVariant } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline, mdiCalendarOutline, mdiInformationOutline, mdiDotsVertical, mdiArrowLeft } from '@mdi/js';

// Unread = guest messages on a channel with no later staff/AI reply on that same channel
function unreadCountFor(messages: Message[], channels: MessageChannel[]): number {
  return channels.reduce(
    (total, ch) =>
      total +
      messages.filter(
        (m) =>
          m.channel === ch &&
          m.sender === 'guest' &&
          !messages.some(
            (s) => (s.sender === 'staff' || s.sender === 'ai') && s.channel === ch && s.timestamp > m.timestamp
          )
      ).length,
    0
  );
}

interface ThreadViewProps {
  thread: Thread;
  guest: Guest | null;
  reservation: Reservation | null;
  linkedReservations: LinkedReservation[];
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
  onOpenLinkModal: () => void;
  onUnlinkReservation: (reservationId: string) => void;
  typingThreadId: string | null;
  selectedChannel: MessageChannel | 'all';
  onChannelChange: (channel: MessageChannel | 'all') => void;
  channelSelectorVariant: ChannelSelectorVariant;
  emailComposerVariant: EmailComposerVariant;
  emailThreads: EmailThread[];
  selectedEmailThreadId: string | null;
  onEmailThreadChange: (id: string | null) => void;
  channelSelectorPosition: ChannelSelectorPosition;
  emailViewVariant: EmailViewVariant;
  channelTabMode: ChannelTabMode;
  simulateUnreadEmail: boolean;
}

export function ThreadView({
  thread,
  guest,
  reservation,
  linkedReservations,
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
  onOpenLinkModal,
  onUnlinkReservation,
  typingThreadId,
  selectedChannel,
  onChannelChange,
  channelSelectorVariant,
  emailComposerVariant,
  emailThreads,
  selectedEmailThreadId,
  onEmailThreadChange,
  channelSelectorPosition,
  emailViewVariant,
  channelTabMode,
  simulateUnreadEmail,
}: ThreadViewProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isGuestTyping = typingThreadId === thread.id;

  const availableChannels: MessageChannel[] = ['SMS', 'WhatsApp', 'Email', 'OTA'];

  // Two-tab mode: Email | Messages — everything that isn't email lives in one
  // merged chronological feed. The composer still sends via a single concrete
  // channel; clicking any bubble switches the send channel to that bubble's.
  const isTwoTabMessages = channelTabMode === 'two-tab' && selectedChannel !== 'Email';

  const lastNonEmailChannel: MessageChannel = useMemo(() => {
    const nonEmail = messages.filter((m) => m.channel && m.channel !== 'Email');
    return nonEmail[nonEmail.length - 1]?.channel || 'SMS';
  }, [messages]);

  // On entering a thread in two-tab mode, default the send channel to wherever
  // the conversation last happened instead of a flat SMS default.
  useEffect(() => {
    if (channelTabMode === 'two-tab' && selectedChannel !== 'Email' && selectedChannel !== lastNonEmailChannel) {
      onChannelChange(lastNonEmailChannel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id, channelTabMode]);

  // Multi-thread email modes only kick in when there's more than one email thread.
  // ≤1 email thread → every variant just shows the conversation normally.
  const isMultiEmail = selectedChannel === 'Email' && emailThreads.length > 1;
  const emailMode: EmailViewVariant | null = isMultiEmail ? emailViewVariant : null;

  // selectedEmailThreadId interpretation is per-variant:
  // dropdown / dropdown-rich = active filter (defaults to first thread)
  // list     = null means list-mode, set means drilled into a thread
  // unified  = reply target (null until staff picks one)
  const effectiveEmailThreadId =
    emailMode === 'dropdown' || emailMode === 'dropdown-rich'
      ? selectedEmailThreadId || emailThreads[0]?.id || null
      : selectedEmailThreadId;

  const selectedEmailSubject = effectiveEmailThreadId
    ? emailThreads.find((t) => t.id === effectiveEmailThreadId)?.subject
    : undefined;

  const filteredMessages = useMemo(() => {
    if (isTwoTabMessages) return messages.filter((m) => m.channel !== 'Email');
    if (selectedChannel === 'all') return messages;
    let filtered = messages.filter((m) => m.channel === selectedChannel);
    if (isMultiEmail && emailMode !== 'unified' && effectiveEmailThreadId) {
      filtered = filtered.filter((m) => m.emailThreadId === effectiveEmailThreadId);
    }
    return filtered;
  }, [messages, selectedChannel, effectiveEmailThreadId, isMultiEmail, emailMode, isTwoTabMessages]);

  // list mode shows no composer until a thread is picked;
  // unified mode shows an inert composer until a reply target is picked
  const showComposer = !(emailMode === 'list' && !selectedEmailThreadId);
  const composerDisabled = emailMode === 'unified' && !selectedEmailThreadId;
  const composerReplyContext =
    emailMode === 'unified' && selectedEmailThreadId ? selectedEmailSubject : undefined;

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
      <div className="bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Guest Info / Contact Number */}
          <div className="flex items-center gap-4">
            <Avatar
              src={guest?.avatar}
              initials={guest?.initials || ''}
              size="medium"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Roboto',sans-serif] font-medium text-base leading-[24px] text-black">
                  {guest?.name || thread.contactNumber}
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
                {guest?.statusTag && (
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

          {/* Actions */}
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

            {/* Link Reservation Button (when no reservations linked) */}
            {linkedReservations.length === 0 && (
              <CanaryButton
                type={ButtonType.TEXT}
                size={ButtonSize.NORMAL}
                onClick={onOpenLinkModal}
              >
                Link reservation
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

      {/* Channel Tabs — text underline style, part of the header unit */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6">
          <CanaryTabs
            key={`${thread.id}-${channelTabMode}`}
            tabs={
              channelTabMode === 'two-tab'
                ? [
                    {
                      id: 'messages',
                      label: 'Messages',
                      content: null,
                      badge: unreadCountFor(messages, ['SMS', 'WhatsApp', 'OTA']) || undefined,
                    },
                    {
                      id: 'Email',
                      label: 'Email',
                      content: null,
                      badge:
                        (unreadCountFor(messages, ['Email']) + (simulateUnreadEmail ? 1 : 0)) || undefined,
                    },
                  ]
                : availableChannels.map((ch) => ({
                    id: ch,
                    label: ch,
                    content: null,
                    badge:
                      (unreadCountFor(messages, [ch]) + (simulateUnreadEmail && ch === 'Email' ? 1 : 0)) ||
                      undefined,
                  }))
            }
            variant="text"
            size="compact"
            defaultTab={
              channelTabMode === 'two-tab'
                ? selectedChannel === 'Email'
                  ? 'Email'
                  : 'messages'
                : selectedChannel === 'all'
                  ? 'SMS'
                  : selectedChannel
            }
            onChange={(tabId) => {
              if (tabId === 'messages') {
                onChannelChange(lastNonEmailChannel);
              } else {
                onChannelChange(tabId as MessageChannel);
              }
            }}
          />
        </div>
        {emailMode === 'dropdown' && (
          <div className="px-6 pt-2 pb-2">
            <EmailThreadSelector
              emailThreads={emailThreads}
              selectedEmailThreadId={effectiveEmailThreadId}
              onSelect={onEmailThreadChange}
            />
          </div>
        )}
        {emailMode === 'dropdown-rich' && (
          <EmailThreadDropdown
            emailThreads={emailThreads}
            messages={messages}
            selectedEmailThreadId={effectiveEmailThreadId}
            onSelect={onEmailThreadChange}
            forceUnreadLatest={simulateUnreadEmail}
          />
        )}
      </div>

      {/* Back to email list — list mode, drilled into a thread */}
      {emailMode === 'list' && selectedEmailThreadId && (
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 min-w-0">
          <button
            onClick={() => onEmailThreadChange(null)}
            className="flex items-center gap-1 shrink-0 hover:opacity-70 transition-opacity"
          >
            <Icon path={mdiArrowLeft} size={0.67} color="#2858c4" />
            <span
              className="font-['Roboto',sans-serif] text-[12px] leading-[18px] font-medium"
              style={{ color: '#2858c4' }}
            >
              All emails
            </span>
          </button>
          {selectedEmailSubject && (
            <span
              className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
              style={{ color: '#666666' }}
            >
              {selectedEmailSubject}
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      {emailMode === 'list' && !selectedEmailThreadId ? (
        <EmailThreadList
          emailThreads={emailThreads}
          messages={messages}
          onSelect={onEmailThreadChange}
          forceUnreadLatest={simulateUnreadEmail}
        />
      ) : emailMode === 'unified' ? (
        <UnifiedEmailFeed
          messages={messages}
          emailThreads={emailThreads}
          selectedReplyTargetId={selectedEmailThreadId}
          onSelectReplyTarget={onEmailThreadChange}
        />
      ) : (
        <MessageFeed
          messages={filteredMessages}
          onMessageClick={
            isTwoTabMessages
              ? (m) => {
                  if (m.channel && m.channel !== selectedChannel) onChannelChange(m.channel);
                }
              : undefined
          }
        />
      )}

      {/* Typing Indicator */}
      {isGuestTyping && (
        <div className="px-6 pb-1">
          <p className="font-['Roboto',sans-serif] text-[10px] leading-[16px] text-[#999999]">
            Guest is typing
          </p>
        </div>
      )}

      {/* Composer */}
      {showComposer && (
        <div className="-mt-5">
          <MessageComposer
            onSend={onSendMessage}
            aiEnabled={aiEnabled}
            onAiToggle={onAiToggle}
            channel={selectedChannel}
            emailComposerVariant={emailComposerVariant}
            disabled={composerDisabled}
            replyContext={composerReplyContext}
          />
        </div>
      )}

      {/* Guest Info Sidebar */}
      <GuestInfoSidebar
        contactNumber={thread.contactNumber}
        linkedReservations={linkedReservations}
        isOpen={isGuestInfoOpen}
        onClose={onCloseGuestInfo}
        onOpenLinkModal={onOpenLinkModal}
        onUnlinkReservation={onUnlinkReservation}
      />
    </div>
  );
}
