/**
 * ThreadList Component — REDESIGN (Figma "Messaging" frame 29:2099, node 29:2137)
 *
 * The left column (434px, set by the page): an Inbox/Archived/Blocked
 * segmented-control card over the guest-list card. The list card carries a
 * Filters row ("Filters" ghost button + "2 applied" — visual-only for now;
 * it replaces the old All/My/Unassigned dropdown, and assignment scoping will
 * live inside Filters when that feature is designed).
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import { mdiFilterVariant } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { ThreadListItem } from './ThreadListItem';
import { Thread } from '@/lib/products/messaging/types';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';

type CategoryFilter = 'inbox' | 'archived' | 'blocked';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  typingThreadId?: string | null;
  currentView: CategoryFilter;
  onViewChange: (view: CategoryFilter) => void;
}

const VIEWS: { id: CategoryFilter; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'archived', label: 'Archived' },
  { id: 'blocked', label: 'Blocked' },
];

export function ThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  typingThreadId,
  currentView,
  onViewChange,
}: ThreadListProps) {
  return (
    <div className="w-full h-full flex flex-col gap-4 min-h-0">
      {/* Inbox / Archived / Blocked segmented control */}
      <div
        className="flex gap-1 shrink-0 rounded-[6px]"
        style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}`, padding: 4 }}
      >
        {VIEWS.map((view) => {
          const isActive = currentView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className="flex-1 flex items-center justify-center rounded-[6px] cursor-pointer transition-colors"
              style={{
                paddingTop: 8,
                paddingBottom: 8,
                backgroundColor: isActive ? colors.colorBlueDark1 : 'transparent',
              }}
            >
              <span
                className="font-['Roboto',sans-serif] font-medium"
                style={{ fontSize: 14, lineHeight: '22px', color: isActive ? colors.colorWhite : colors.colorBlack3 }}
              >
                {view.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Guest list card */}
      <div
        className="flex-1 min-h-0 flex flex-col overflow-clip rounded-[12px]"
        style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
      >
        {/* Filters row */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${colors.colorBlack6}`, paddingLeft: 16, paddingRight: 16, paddingTop: 4, paddingBottom: 4 }}
        >
          <button
            className="flex items-center gap-2 rounded-[4px] cursor-pointer transition-colors hover:bg-[#f0f0f0]"
            style={{ height: 40, paddingLeft: 8, paddingRight: 8 }}
          >
            <Icon path={mdiFilterVariant} size={0.83} color={colors.colorBlack1} />
            <span className="font-['Roboto',sans-serif]" style={{ fontSize: 14, lineHeight: '22px', color: colors.colorBlack1 }}>
              Filters
            </span>
          </button>
          <span
            className="font-['Roboto',sans-serif] font-medium"
            style={{ fontSize: 14, lineHeight: '22px', color: colors.colorBlueDark1 }}
          >
            2 applied
          </span>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 16 }}>
          {threads.length === 0 ? (
            <div className="p-8 text-center font-['Roboto',sans-serif] text-[14px]" style={{ color: colors.colorBlack4 }}>
              No conversations
            </div>
          ) : (
            threads.map((thread) => {
              // Derive primary guest/reservation from first linked reservation
              const primaryResId = thread.linkedReservationIds[0];
              const primaryRes = primaryResId ? reservations[primaryResId] : undefined;
              const primaryGuest = primaryRes ? guests[primaryRes.guestId] : undefined;

              return (
                <ThreadListItem
                  key={thread.id}
                  thread={thread}
                  guest={primaryGuest}
                  reservation={primaryRes}
                  isSelected={thread.id === selectedThreadId}
                  onClick={() => onSelectThread(thread.id)}
                  isTyping={thread.id === typingThreadId}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
