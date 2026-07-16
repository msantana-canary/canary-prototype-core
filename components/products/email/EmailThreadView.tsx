/**
 * EmailThreadView
 *
 * Right column of the Email surface — the read pane. Gmail register: flat
 * full-width message blocks (NOT chat bubbles), a TODAY date divider, and a
 * header that shows the SENDER identity with a hover-revealed action group
 * (Archive / info / more). Each message block shows the LINKED GUEST name +
 * loyalty tag for inbound mail, or the staff name for outbound replies.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import Icon from '@mdi/react';
import { mdiInformationOutline, mdiDotsHorizontal } from '@mdi/js';
import { colors, CanaryTag, TagSize } from '@canary-ui/components';
import { getGuest } from '@/lib/core/data';
import { useEmailStore } from '@/lib/products/email/store';
import { EmailMessage, EmailThread } from '@/lib/products/email/types';
import { EmailComposer } from './EmailComposer';

const STAFF_NAME = 'Theresa Webb';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function MessageBlock({ message, thread }: { message: EmailMessage; thread: EmailThread }) {
  const isInbound = message.direction === 'inbound';
  const guest = isInbound && thread.linkedGuestId ? getGuest(thread.linkedGuestId) : undefined;

  // Inbound → linked guest name (falls back to sender name if unlinked). Outbound → staff name.
  const displayName = isInbound ? guest?.name ?? thread.senderName : message.staffName ?? STAFF_NAME;
  const loyalty = isInbound ? guest?.statusTag?.label : undefined;
  const timestamp = format(message.sentAt, 'MMM d, h:mm a').toUpperCase();

  return (
    <div className="flex items-start gap-3" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}>
      {/* Avatar */}
      <div
        className="flex items-center justify-center rounded-[8px] shrink-0"
        style={{ width: 32, height: 32, backgroundColor: colors.colorBlack6 }}
      >
        <span className="font-['Roboto',sans-serif] font-bold text-[12px]" style={{ color: colors.colorBlack3 }}>
          {initialsOf(displayName)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <span className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]" style={{ color: colors.colorBlack1 }}>
            {displayName}
          </span>
          {loyalty && (
            <CanaryTag
              label={loyalty}
              size={TagSize.COMPACT}
              uppercase
              customColor={{
                backgroundColor: colors.colorBlack6,
                borderColor: colors.colorBlack5,
                fontColor: colors.colorBlack2,
              }}
            />
          )}
          <span className="flex-1" />
          <span
            className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase whitespace-nowrap shrink-0"
            style={{ color: colors.colorBlack3 }}
          >
            {timestamp}
          </span>
        </div>

        {/* Body */}
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap mt-1"
          style={{ color: colors.colorBlack1 }}
        >
          {message.body}
        </p>
      </div>
    </div>
  );
}

export function EmailThreadView() {
  const threads = useEmailStore((s) => s.threads);
  const messagesByThread = useEmailStore((s) => s.messages);
  const selectedThreadId = useEmailStore((s) => s.selectedThreadId);
  const archiveThread = useEmailStore((s) => s.archiveThread);
  const sendReply = useEmailStore((s) => s.sendReply);

  const thread = threads.find((t) => t.id === selectedThreadId);
  const messages = selectedThreadId ? messagesByThread[selectedThreadId] ?? [] : [];

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedThreadId]);

  if (!thread) {
    return (
      <div
        className="flex-1 flex items-center justify-center rounded-[12px]"
        style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
      >
        <p className="font-['Roboto',sans-serif] text-[14px]" style={{ color: colors.colorBlack4 }}>
          Select an email to read.
        </p>
      </div>
    );
  }

  return (
    <div
      className="group flex-1 flex flex-col h-full overflow-clip rounded-[12px]"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: 70, borderBottom: `1px solid ${colors.colorBlack6}`, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}
      >
        {/* Left: sender identity */}
        <div className="flex items-center min-w-0">
          <div
            className="flex items-center justify-center rounded-[8px] shrink-0"
            style={{ width: 40, height: 40, backgroundColor: colors.colorBlack6 }}
          >
            <span className="font-['Roboto',sans-serif] font-medium text-[14px]" style={{ color: colors.colorBlack3 }}>
              {initialsOf(thread.senderName)}
            </span>
          </div>
          <div className="flex flex-col min-w-0" style={{ paddingLeft: 8 }}>
            <span className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] truncate" style={{ color: colors.colorBlack1 }}>
              {thread.senderName} - {thread.senderEmail}
            </span>
            <span className="font-['Roboto',sans-serif] text-[16px] leading-[24px] truncate" style={{ color: colors.colorBlack1 }}>
              {thread.subject}
            </span>
          </div>
        </div>

        {/* Right: action group — hidden by default, revealed on thread-view hover */}
        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => archiveThread(thread.id)}
            className="flex items-center justify-center rounded-[6px] font-['Roboto',sans-serif] font-medium text-[14px] transition-opacity hover:opacity-80"
            style={{ height: 40, paddingLeft: 16, paddingRight: 16, backgroundColor: 'rgba(40,88,196,0.1)', color: colors.colorBlueDark1, cursor: 'pointer' }}
          >
            Archive
          </button>
          <button className="rounded-[4px] hover:bg-[#f0f0f0] transition-colors" style={{ padding: 10 }} aria-label="Info">
            <Icon path={mdiInformationOutline} size={0.83} color={colors.colorBlack3} />
          </button>
          <button className="rounded-[4px] hover:bg-[#f0f0f0] transition-colors" style={{ padding: 10 }} aria-label="More">
            <Icon path={mdiDotsHorizontal} size={0.83} color={colors.colorBlack3} />
          </button>
        </div>
      </div>

      {/* Message feed — bottom-anchored */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-end" style={{ paddingTop: 16 }}>
        <div className="flex flex-col">
          {/* TODAY divider */}
          <div className="flex items-center justify-center" style={{ height: 30 }}>
            <span className="font-['Roboto',sans-serif] font-medium text-[10px] leading-[16px] uppercase" style={{ color: colors.colorBlack1 }}>
              Today
            </span>
          </div>
          {messages.map((m) => (
            <MessageBlock key={m.id} message={m} thread={thread} />
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0">
        <EmailComposer onSend={(content) => sendReply(thread.id, content)} />
      </div>
    </div>
  );
}
