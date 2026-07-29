/**
 * ThreadList Component — REDESIGN (Figma "Messaging" frame 29:2099, node 29:2137)
 *
 * The left column (35% of the content row, set by the page): a single guest-list
 * card of scrolling thread rows. The Inbox/Archived/Blocked scoping and the
 * Filters affordance now live in the Filters popover on the search row (the
 * segmented control + in-card Filters row were removed — <1% of usage is on the
 * Archived/Blocked views, so they collapse behind Filters).
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { ThreadListItem } from './ThreadListItem';
import { Thread } from '@/lib/products/messaging/types';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  typingThreadId?: string | null;
  /**
   * IN-CARD variant only: content for the card's own header zone, inside the
   * card border with a hairline beneath it. It is a shrink-0 sibling of the
   * scroll container, so it holds position while the rows scroll under it —
   * no position:sticky needed. Omitted by Full and Compact, which render the
   * card exactly as before.
   */
  header?: React.ReactNode;
}

export function ThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  typingThreadId,
  header,
}: ThreadListProps) {
  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Guest list card */}
      <div
        className="flex-1 min-h-0 flex flex-col overflow-clip rounded-[12px]"
        style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
      >
        {/* Card header zone (in-card variant) */}
        {header && (
          <div
            className="shrink-0"
            style={{ padding: 12, borderBottom: `1px solid ${colors.colorBlack6}` }}
          >
            {header}
          </div>
        )}

        {/* Rows */}
        <div className="flex-1 overflow-y-auto scrollbar-invisible flex flex-col gap-2" style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 16 }}>
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
