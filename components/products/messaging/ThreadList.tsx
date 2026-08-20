/**
 * ThreadList Component — REDESIGN (Figma "Messaging" frame 29:2099, node 29:2137)
 *
 * The left column (35% of the content row, set by the page): a single guest-list
 * card of scrolling thread rows.
 *
 * The card stacks THREE zones (node `searchbar-node`):
 *
 *   1. `header`  — the two scope selects (assignment left, folder right), see
 *                  ThreadScopeMenu. Hairline under it.
 *   2. `search`  — the search input + "New message" button. Moved in here from
 *                  the full-width band `AppLayout` used to draw above both
 *                  columns; see ConversationControls for why. NO hairline under
 *                  it — the band and the rows are one list surface, and a second
 *                  divider would cut a 350px card into three boxes.
 *   3. rows      — the only scrolling zone. Both zones above are `shrink-0`
 *                  siblings of the scroll container, so they hold position
 *                  while the rows scroll under them; no position:sticky needed.
 *
 * The segmented control, the in-card Filters row and the search-row Filters
 * popover were all removed on the way here.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { ThreadListItem } from './ThreadListItem';
import { Thread } from '@/lib/products/messaging/types';
import { panelIdentity } from '@/lib/products/messaging/panel-selectors';
import { useMessagingStore } from '@/lib/products/messaging/store';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  typingThreadId?: string | null;
  /**
   * The card's own header zone — the two scope selects. A shrink-0 sibling of
   * the scroll container, so it holds position while the rows scroll under it;
   * no position:sticky needed.
   */
  header?: React.ReactNode;
  /** The search + "New message" band, directly under the header. Same deal. */
  search?: React.ReactNode;
}

export function ThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  typingThreadId,
  header,
  search,
}: ThreadListProps) {
  const threadPrimaryReservationId = useMessagingStore((s) => s.threadPrimaryReservationId);

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

        {/* Search band — sits between the header hairline and the rows, with no
            divider of its own (see the file header). The 8px horizontal padding
            is the ROWS' padding, not the header's, so the search field's edges
            line up with the row cards' hover/selected rectangles below it
            rather than with the select triggers above it. */}
        {search && (
          <div
            className="shrink-0"
            style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 12, paddingBottom: 4 }}
          >
            {search}
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
              /**
               * The row names the thread's PRIMARY person — the same spotlight
               * the Conversation Details panel uses, so a thread cannot be
               * "Emily Smith" in the list and "Nathan Reyes" in the panel. It
               * used to take the first linked reservation, which ignored both
               * the auto-link fact and the per-thread display preference.
               */
              const primary = panelIdentity(thread, threadPrimaryReservationId[thread.id]).primary;
              const primaryRes = primary?.reservation;
              const primaryGuest = primary?.guest;

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
