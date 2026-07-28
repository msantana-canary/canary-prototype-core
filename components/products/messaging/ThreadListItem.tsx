/**
 * ThreadListItem Component — REDESIGN (Figma "Messaging" frame 29:2099, "Guest" rows)
 *
 * Row anatomy: 32px rounded-8 avatar · name (14 Medium) + time (10 uppercase) ·
 * room line (bed icon + number, "(RESERVED)"-style status as plain text, and a
 * concierge request-count chip) · preview (14 Regular colorBlack3) with two
 * independent trailing indicators — the red anger flag (flagged threads) AND
 * the attention dot. They are siblings, not alternatives: neither replaces the
 * other, and when both apply the flag renders first, then the dot. The flag means
 * AI-detected guest frustration (AI paused). The dot shows for unread OR escalated
 * (production parity): plain unread = pink, escalated = amber (warning), the
 * `.isEscalated` variant — the ONLY difference is the dot color.
 *
 * Selection = soft colorBlueDark5 fill + colorBlueDark3 border + rounded-6
 * (was: solid blue with white text). Unread = dot only — the row background
 * no longer tints (the old unread tint is now the SELECTED treatment, and the
 * pink dot was already the settled unread signal).
 */

import React from 'react';
import { Avatar } from './Avatar';
import { Thread } from '@/lib/products/messaging/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { format } from 'date-fns';
import { colors, CanaryTag, TagSize, TagVariant } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline, mdiRoomServiceOutline, mdiFlag } from '@mdi/js';

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

  // For phone-only threads, display the contact number
  const guestName = guest?.name || thread.contactNumber;
  const firstName = guest ? guestName.split(' ')[0] : thread.contactNumber;
  const initials = guest?.initials || '';

  // Note: canonical room strings already carry reservation status where
  // relevant ("112 (RESERVED)") — the Figma's plain-text status treatment.
  // guest.statusTag is the LOYALTY tier — shown as a tag beside the name.
  const room = reservation?.room;
  const loyalty = guest?.statusTag;
  const requestCount = reservation?.requestCount;

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 cursor-pointer rounded-[6px] transition-colors shrink-0 ${
        isSelected ? '' : 'hover:bg-[#f9fafb]'
      }`}
      style={{
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: isSelected ? colors.colorBlueDark5 : 'transparent',
        border: `1px solid ${isSelected ? colors.colorBlueDark3 : 'transparent'}`,
      }}
    >
      {/* Avatar */}
      <div className="pt-1 shrink-0">
        <Avatar src={guest?.avatar} initials={initials} size="small" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Name + loyalty tier + Timestamp */}
        <div className="flex items-center gap-2">
          <p
            className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] truncate min-w-0 shrink"
            style={{ color: colors.colorBlack1 }}
          >
            {guestName}
          </p>
          {loyalty && (
            <span className="shrink-0">
              <CanaryTag
                label={loyalty.label}
                size={TagSize.COMPACT}
                variant={TagVariant.FILLED}
                uppercase
                customColor={{
                  backgroundColor: loyalty.color,
                  fontColor: loyalty.textColor || 'white',
                }}
              />
            </span>
          )}
          <span className="flex-1" />
          <span
            className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase whitespace-nowrap shrink-0"
            style={{ color: colors.colorBlack3 }}
          >
            {formattedTime}
          </span>
        </div>

        {/* Room + status (plain text, not a tag) + request count */}
        {(room || (requestCount && requestCount > 0)) && (
          <div className="flex items-center gap-3">
            {room && (
              <div className="flex items-center gap-1">
                <Icon path={mdiBedOutline} size={0.67} color={colors.colorBlack3} />
                <span
                  className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
                  style={{ color: colors.colorBlack3 }}
                >
                  {room}
                </span>
              </div>
            )}
            {requestCount && requestCount > 0 ? (
              <div className="flex items-center gap-1">
                <Icon path={mdiRoomServiceOutline} size={0.67} color={colors.colorBlack3} />
                <span
                  className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase"
                  style={{ color: colors.colorBlack3 }}
                >
                  {requestCount}
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Preview + independent flag & unread indicators (siblings, not alternatives) */}
        <div className="flex items-center gap-2">
          <p
            className={`flex-1 min-w-0 font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate ${isTyping ? 'italic' : ''}`}
            style={{ color: colors.colorBlack3 }}
          >
            {isTyping ? `${firstName} is typing...` : thread.lastMessage}
          </p>
          {/* Tooltip lives on a wrapping span, NOT on @mdi/react's `title` prop:
              that prop auto-generates an `aria-labelledby` id from a module-level
              counter, which differs between the server and client renders and
              trips React hydration. Same pattern as the auto-link icon in
              GuestInfoSidebar. */}
          {thread.isFlagged && (
            <span
              className="flex items-center shrink-0 cursor-help"
              role="img"
              aria-label="Potential guest frustration detected. AI paused to avoid escalation."
              title="Potential guest frustration detected. AI paused to avoid escalation."
            >
              <Icon path={mdiFlag} size={0.83} color="#E40046" />
            </span>
          )}
          {/* Attention dot — shows for unread OR escalated (production parity:
              `unread_count > 0 || is_escalated`). Escalated turns amber (warning),
              matching production's `.isEscalated` variant; plain unread stays pink.
              The 10px slot is always reserved (transparent when neither) so the
              row layout never shifts. */}
          <div
            className="w-[10px] h-[10px] rounded-full shrink-0"
            style={{
              backgroundColor: thread.isEscalated
                ? colors.warning
                : thread.isUnread
                ? colors.colorPink1
                : 'transparent',
            }}
          />
        </div>
      </div>
    </div>
  );
}
