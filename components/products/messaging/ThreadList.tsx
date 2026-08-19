/**
 * ThreadList Component — REDESIGN (Figma "Messaging" frame 29:2099, node 29:2137)
 *
 * The left column (35% of the content row, set by the page): a single guest-list
 * card of scrolling thread rows. Scoping lives in the card header as TWO selects
 * (assignment on the left, folder on the right) — see ThreadScopeMenu. The
 * segmented control, the in-card Filters row and the search-row Filters popover
 * were all removed on the way here.
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
   * The card's own header zone — "Conversations" plus the scope control. A
   * shrink-0 sibling of the scroll container, so it holds position while the
   * rows scroll under it; no position:sticky needed.
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
        {/* Card header zone */}
        {header && (
          <div
            className="shrink-0"
            style={{
              // 8px here + the selects' own 8px trigger padding lands both
              // labels on the card's 16px text margin, while the hover wash
              // still reads as a control rather than a flush-left block.
              paddingLeft: 8,
              paddingRight: 8,
              paddingTop: 10,
              paddingBottom: 10,
              borderBottom: `1px solid ${colors.colorBlack6}`,
            }}
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
