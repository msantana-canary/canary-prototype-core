/**
 * EmailThreadRead Component
 *
 * The read pane of the Email surface. Gmail-register rendering: stacked
 * full-width email blocks delineated by hairlines (per the team-chat
 * FlatMessage anatomy) — deliberately NOT chat bubbles. Email should feel
 * slower than Conversations on sight.
 *
 * Header carries the linked-guest strip (auto-link by sender address) with
 * a jump into Conversations; unlinked threads show the raw sender identity.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiBedOutline, mdiCalendarOutline, mdiOpenInNew } from '@mdi/js';
import { format } from 'date-fns';
import { Message } from '@/lib/products/messaging/types';
import { MessageComposer } from '../MessageComposer';
import { Avatar } from '../Avatar';
import { EmailRow } from './EmailView';

interface EmailThreadReadProps {
  row: EmailRow;
  onOpenConversation: (messagingThreadId: string) => void;
  onSend: (content: string) => void;
}

export function EmailThreadRead({ row, onOpenConversation, onSend }: EmailThreadReadProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const { thread, messages, guest, reservation } = row;

  // Color tokens
  const colorBlack1 = '#000000';
  const colorBlack3 = '#666666';
  const colorBlack4 = '#999999';
  const colorBlueDark1 = '#2858c4';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const senderDisplay = (m: Message): { name: string; initials: string; detail?: string } => {
    if (m.sender === 'guest') {
      const name = guest?.name || thread.senderName || thread.senderEmail || 'Guest';
      return {
        name,
        initials: initialsOf(name),
        detail: thread.senderEmail,
      };
    }
    if (m.isGuestJourney) {
      return { name: 'The Grand Ithaca Hotel', initials: 'GI' };
    }
    return { name: 'Theresa Webb', initials: 'TW' };
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Thread header — subject + linked guest strip */}
      <div className="px-6 py-4 border-b border-gray-200 shrink-0">
        <h2 className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]" style={{ color: colorBlack1 }}>
          {thread.subject}
        </h2>
        <div className="flex items-center gap-3 mt-1.5 min-w-0">
          {guest ? (
            <>
              <span className="font-['Roboto',sans-serif] text-[13px] leading-[20px] font-medium shrink-0" style={{ color: colorBlack1 }}>
                {guest.name}
              </span>
              {reservation?.room && (
                <span className="flex items-center gap-1 shrink-0">
                  <Icon path={mdiBedOutline} size={0.58} color={colorBlack3} />
                  <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colorBlack3 }}>
                    {reservation.room}
                  </span>
                </span>
              )}
              {reservation?.checkInDate && reservation?.checkOutDate && (
                <span className="flex items-center gap-1 shrink-0">
                  <Icon path={mdiCalendarOutline} size={0.58} color={colorBlack3} />
                  <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]" style={{ color: colorBlack3 }}>
                    {reservation.checkInDate} - {reservation.checkOutDate}
                  </span>
                </span>
              )}
              {thread.parentThreadId && (
                <button
                  onClick={() => onOpenConversation(thread.parentThreadId!)}
                  className="flex items-center gap-1 shrink-0 hover:opacity-70 transition-opacity"
                >
                  <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px] font-medium" style={{ color: colorBlueDark1 }}>
                    Open conversation
                  </span>
                  <Icon path={mdiOpenInNew} size={0.5} color={colorBlueDark1} />
                </button>
              )}
            </>
          ) : (
            <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate" style={{ color: colorBlack3 }}>
              {thread.senderName} &lt;{thread.senderEmail}&gt; · No guest linked
            </span>
          )}
        </div>
      </div>

      {/* Email blocks — flat, hairline-delineated, full width */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {messages.map((m) => {
          const s = senderDisplay(m);
          return (
            <div key={m.id} className="px-6 py-4">
              <div className="flex gap-2.5">
                <div className="mt-0.5 shrink-0">
                  <Avatar initials={s.initials} size="small" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-['Roboto',sans-serif] text-[13px] font-semibold" style={{ color: colorBlack1 }}>
                      {s.name}
                    </span>
                    {m.isGuestJourney && (
                      <span
                        className="font-['Roboto',sans-serif] text-[9px] font-bold uppercase tracking-wide"
                        style={{ color: colorBlack4 }}
                      >
                        Guest Journey
                      </span>
                    )}
                    <span className="flex-1" />
                    <span className="font-['Roboto',sans-serif] text-[10px] uppercase shrink-0" style={{ color: colorBlack4 }}>
                      {format(m.timestamp, 'MMM d, h:mm a')}
                    </span>
                  </div>
                  {m.cc && (
                    <p className="font-['Roboto',sans-serif] text-[11px] leading-[16px] mt-0.5" style={{ color: colorBlack4 }}>
                      CC: {m.cc}
                    </p>
                  )}
                  <p
                    className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap mt-1.5"
                    style={{ color: colorBlack1 }}
                  >
                    {m.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Reply-only composer, simple toolbar: attachments yes, messaging tooling no */}
      <div className="shrink-0 -mt-5">
        <MessageComposer onSend={onSend} channel="Email" simpleToolbar />
      </div>
    </div>
  );
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
