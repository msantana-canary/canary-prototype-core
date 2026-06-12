/**
 * EmailView Component
 *
 * Top-level Email surface (own tab beside Conversations/Broadcast).
 * Two panes, thread-organized like Gmail — NOT by guest:
 *  - Left: compact header (Inbox/Sent dropdown + search placeholder) + thread rows
 *  - Right: the selected thread (EmailThreadRead)
 *
 * Direction split, not triage: Inbox = threads with at least one inbound
 * email; Sent = outbound-only (GJ machine output + unanswered staff sends).
 * A guest reply promotes a thread from Sent to Inbox.
 */

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CanarySelect, CanaryInputSearch, InputSize, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiMagnify, mdiClose, mdiBedOutline } from '@mdi/js';
import { format } from 'date-fns';
import { EmailThread, Message } from '@/lib/products/messaging/types';
import { mockEmailThreads } from '@/lib/products/messaging/mock-data';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { EmailThreadRead } from './EmailThreadRead';

type Mailbox = 'inbox' | 'sent';

export interface EmailRow {
  thread: EmailThread;
  messages: Message[];
  lastMessage: Message | null;
  hasInbound: boolean;
  isUnread: boolean;
  guest: Guest | null;
  reservation: Reservation | null;
}

interface EmailViewProps {
  simulateUnreadEmail: boolean;
  onOpenConversation: (messagingThreadId: string) => void;
}

export function EmailView({ simulateUnreadEmail, onOpenConversation }: EmailViewProps) {
  const { messages, threads, addMessage } = useMessagingStore();
  const [mailbox, setMailbox] = useState<Mailbox>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Color tokens
  const colorBlack1 = '#000000';
  const colorBlack3 = '#666666';
  const colorBlack4 = '#999999';
  const colorPink = '#E40046';

  const rows: EmailRow[] = useMemo(() => {
    const derived = mockEmailThreads.map((thread) => {
      // Messages may live under the parent messaging thread (legacy linked
      // threads) or under the email thread's own key (standalone/GJ sends)
      const msgs = [
        ...(thread.parentThreadId ? messages[thread.parentThreadId] || [] : []),
        ...(messages[thread.id] || []),
      ]
        .filter((m) => m.channel === 'Email' && m.emailThreadId === thread.id)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const lastMessage = msgs[msgs.length - 1] || null;
      const hasInbound = msgs.some((m) => m.sender === 'guest');
      const isUnread = !!lastMessage && lastMessage.sender === 'guest';

      // Auto-link: resolve guest through the messaging thread's reservations
      let guest: Guest | null = null;
      let reservation: Reservation | null = null;
      if (thread.parentThreadId) {
        const parent = threads.find((t) => t.id === thread.parentThreadId);
        for (const rid of parent?.linkedReservationIds || []) {
          const r = reservations[rid];
          const g = r ? guests[r.guestId] : undefined;
          if (g) {
            guest = g;
            reservation = r!;
            break;
          }
        }
      }

      return { thread, messages: msgs, lastMessage, hasInbound, isUnread, guest, reservation };
    });

    return derived.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp.getTime() || 0;
      const bTime = b.lastMessage?.timestamp.getTime() || 0;
      return bTime - aTime;
    });
  }, [messages, threads]);

  const inboxRows = useMemo(() => {
    const list = rows.filter((r) => r.hasInbound);
    // Demo control: render the latest inbox thread as unread
    if (simulateUnreadEmail && list.length > 0) {
      return [{ ...list[0], isUnread: true }, ...list.slice(1)];
    }
    return list;
  }, [rows, simulateUnreadEmail]);

  const sentRows = useMemo(() => rows.filter((r) => !r.hasInbound), [rows]);

  // Search both ways — content AND guest/sender (6/11 review: "search by
  // content, not by guests, because emails can be broad. Both.")
  const visibleRows = useMemo(() => {
    const base = mailbox === 'inbox' ? inboxRows : sentRows;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (r) =>
        r.thread.subject.toLowerCase().includes(q) ||
        r.guest?.name.toLowerCase().includes(q) ||
        r.thread.senderName?.toLowerCase().includes(q) ||
        r.thread.senderEmail?.toLowerCase().includes(q) ||
        r.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [mailbox, inboxRows, sentRows, searchQuery]);

  // Keep a valid selection: first row of the active mailbox
  useEffect(() => {
    if (!visibleRows.some((r) => r.thread.id === selectedId)) {
      setSelectedId(visibleRows[0]?.thread.id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mailbox, visibleRows.length]);

  const selectedRow = visibleRows.find((r) => r.thread.id === selectedId) || null;

  const handleSend = (content: string) => {
    if (!selectedRow) return;
    const key = selectedRow.thread.parentThreadId ?? selectedRow.thread.id;
    addMessage(key, {
      id: `m${Date.now()}`,
      threadId: key,
      sender: 'staff',
      content,
      timestamp: new Date(),
      channel: 'Email',
      emailThreadId: selectedRow.thread.id,
      status: 'delivered',
    });
  };

  const senderLabel = (row: EmailRow) => {
    if (mailbox === 'sent') return `To: ${row.guest?.name || row.thread.senderName || row.thread.senderEmail}`;
    return row.guest?.name || row.thread.senderName || row.thread.senderEmail || 'Unknown sender';
  };

  return (
    <div className="flex h-full">
      {/* Left — thread list */}
      <div className="w-[320px] border-r border-gray-200 flex flex-col">
        {/* Compact header — same anatomy + metrics as Conversations' CompactInboxHeader */}
        <div className="border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center justify-between px-4 pb-3 pt-4">
            <div className="flex-1 max-w-[140px]">
              <CanarySelect
                options={[
                  { label: `Inbox (${inboxRows.length})`, value: 'inbox' },
                  { label: `Sent (${sentRows.length})`, value: 'sent' },
                ]}
                value={mailbox}
                onChange={(e) => setMailbox(e.target.value as Mailbox)}
                size={InputSize.COMPACT}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search emails"
                className="flex h-8 w-8 items-center justify-center rounded transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#EAEEF9' }}
              >
                <Icon path={mdiMagnify} size={0.75} color={colors.colorBlueDark1} />
              </button>
            </div>
          </div>

          {/* Slide-down search — content + guest/sender */}
          {isSearchOpen && (
            <div className="px-4 pb-3 flex items-center gap-2">
              <div className="flex-1">
                <CanaryInputSearch
                  ref={searchInputRef}
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size={InputSize.COMPACT}
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
                className="flex h-6 w-6 items-center justify-center rounded transition-opacity hover:opacity-80"
              >
                <Icon path={mdiClose} size={0.6} color={colorBlack3} />
              </button>
            </div>
          )}
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto">
          {visibleRows.map((row) => {
            const isSelected = row.thread.id === selectedId;
            return (
              <button
                key={row.thread.id}
                onClick={() => setSelectedId(row.thread.id)}
                className="w-full text-left px-4 py-3 border-b border-gray-100 transition-colors flex items-start gap-2 hover:bg-gray-50"
                style={{ backgroundColor: isSelected ? '#eaeef9' : undefined }}
              >
                {/* Unread dot */}
                <div className="w-2 shrink-0 pt-1.5">
                  {row.isUnread && mailbox === 'inbox' && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorPink }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className="flex-1 min-w-0 font-['Roboto',sans-serif] text-[13px] leading-[20px] truncate"
                      style={{ color: colorBlack1, fontWeight: row.isUnread ? 600 : 500 }}
                    >
                      {senderLabel(row)}
                    </p>
                    {/* Reservation-connected signal: bed + room */}
                    {row.reservation?.room && (
                      <span className="flex items-center gap-0.5 shrink-0 self-center">
                        <Icon path={mdiBedOutline} size={0.5} color={colorBlack3} />
                        <span
                          className="font-['Roboto',sans-serif] text-[11px] leading-[16px]"
                          style={{ color: colorBlack3 }}
                        >
                          {row.reservation.room.split(' ')[0]}
                        </span>
                      </span>
                    )}
                    {row.lastMessage && (
                      <span
                        className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase shrink-0"
                        style={{ color: colorBlack4 }}
                      >
                        {format(row.lastMessage.timestamp, 'MMM d')}
                      </span>
                    )}
                  </div>
                  <p
                    className="font-['Roboto',sans-serif] text-[13px] leading-[20px] truncate"
                    style={{ color: '#333333', fontWeight: row.isUnread ? 500 : 400 }}
                  >
                    {row.thread.subject}
                  </p>
                  {row.lastMessage && (
                    <p
                      className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
                      style={{ color: colorBlack3 }}
                    >
                      {row.lastMessage.content.replace(/\n+/g, ' ')}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
          {visibleRows.length === 0 && (
            <div className="p-8 text-center">
              <p className="font-['Roboto',sans-serif] text-sm" style={{ color: colorBlack4 }}>
                {mailbox === 'inbox' ? 'No inbound email yet.' : 'No sent email yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right — thread read view */}
      <div className="flex-1 min-w-0">
        {selectedRow ? (
          <EmailThreadRead
            key={selectedRow.thread.id}
            row={selectedRow}
            onOpenConversation={onOpenConversation}
            onSend={handleSend}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select an email
          </div>
        )}
      </div>
    </div>
  );
}
