/**
 * ThreadView Component — REDESIGN (Figma "Messaging" frame 2038:57666)
 *
 * The conversation card: white rounded-12 bordered container holding the
 * thread header (guest identity · archive / info / kebab), the flat-block
 * message feed, and the composer. The guest info panel is NO LONGER rendered
 * inside this component — it's a sibling column (push) or overlay (drawer)
 * composed at the page level.
 *
 * Header: avatar · name + loyalty tag on line 1; line 2 is bed-icon room +
 * calendar-icon stay dates. Right actions are three BARE icons in order —
 * archive, ⓘ, kebab. Archive was a TEXT button in the previous canon and the
 * info button carried a blue tonal pressed fill; both are gone (see IconAction
 * below). The kebab keeps Block/Unblock + Mark as Unread; the standalone "Link
 * reservation" text button is gone (linking lives in the info panel).
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from './Avatar';
import { MessageFeed } from './MessageFeed';
import { MessageComposer } from './MessageComposer';
import { ThreadAiSlot } from './ai/ThreadAiSlot';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { Thread, Message } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { colors, CanaryTag, TagSize, TagVariant } from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiBedOutline,
  mdiCalendarOutline,
  mdiInformationOutline,
  mdiDotsHorizontal,
  mdiArchiveArrowDownOutline,
} from '@mdi/js';

/**
 * A bare header icon button: a 28px square with ZERO padding, transparent at
 * rest, neutral 8%-black wash on hover and while pressed. Deliberately NOT a
 * blue tonal fill — the surface already spends blue on selection and on links.
 */
function IconAction({
  path,
  label,
  onClick,
  isPressed = false,
  buttonRef,
}: {
  path: string;
  label: string;
  onClick: () => void;
  isPressed?: boolean;
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isPressed}
      className="flex items-center justify-center rounded-[6px] transition-colors cursor-pointer hover:bg-[rgba(0,0,0,0.08)]"
      style={{
        width: 28,
        height: 28,
        padding: 0,
        ...(isPressed ? { backgroundColor: 'rgba(0,0,0,0.08)' } : {}),
      }}
    >
      <Icon path={path} size={0.83} color={colors.colorBlack3} />
    </button>
  );
}

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

  // The draft card's hand-over to the composer. Scoped to THIS thread — a draft
  // edited on one conversation must not land in another one's box.
  const injection = useMessagingStore((s) => s.composerInjection);
  const clearComposerInjection = useMessagingStore((s) => s.clearComposerInjection);

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

        {/* Action Buttons — archive · ⓘ · kebab (frame 2038:57666).
            All three are BARE icons: zero padding, no background box at rest, a
            neutral 8%-black wash on hover, and no blue pressed tint (the info
            button's tonal-blue pressed fill is gone — it read as a fourth
            selection register on a surface that already has two). */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Archive — an icon in the landed frame; it was a text button before. */}
          {thread.status === 'inbox' && (
            <IconAction onClick={onArchive} label="Archive conversation" path={mdiArchiveArrowDownOutline} />
          )}

          <IconAction
            onClick={onToggleGuestInfo}
            label="Conversation details"
            path={mdiInformationOutline}
            isPressed={isGuestInfoOpen}
          />

          {/* Kebab menu */}
          <div className="relative">
            <IconAction
              buttonRef={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              label="More actions"
              path={mdiDotsHorizontal}
              isPressed={isMenuOpen}
            />

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-1 w-48 bg-white rounded-[8px] py-1 z-50"
                style={{ border: `1px solid ${colors.colorBlack6}` }}
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

      {/* Composer — plus the AI's top slot (drafted response, then the band
          stack). The slot is handed to the composer rather than rendered here
          so it inherits the composer's own padding and edges. */}
      <div className="shrink-0">
        <MessageComposer
          /* KEYED BY THREAD. The composer holds its text in local state, so
             without this the box carries its contents from one conversation to
             the next. That was survivable when the only way to fill it was to
             type; it stopped being survivable the moment the draft card could
             put an AI's reply to Chloe into Lucia's composer.
             (Real per-thread drafts — kept, not cleared — are a separate
             feature; this at least never shows one guest's text to another.) */
          key={thread.id}
          onSend={onSendMessage}
          placeholder="Type SMS message..."
          aiEnabled={aiEnabled}
          onAiToggle={onAiToggle}
          topSlot={<ThreadAiSlot threadId={thread.id} />}
          injection={injection?.threadId === thread.id ? injection : null}
          onInjectionConsumed={clearComposerInjection}
        />
      </div>
    </div>
  );
}
