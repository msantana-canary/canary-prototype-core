/**
 * ThreadList Component — REDESIGN (Figma "Messaging" frame 29:2099, node 29:2137)
 *
 * The left column (35% of the content row, set by the page): a single guest-list
 * card of scrolling thread rows.
 *
 * The card stacks THREE zones (node `searchbar-node`):
 *
 *   1. `header`  — the two scope selects. Since the 8/21 design review (frame
 *                  2112:26219) that is FOLDER left, in the card-title register,
 *                  and ASSIGNMENT right, in blue; see ThreadScopeMenu for why
 *                  they swapped. Hairline under it.
 *   2. `search`  — the search input + "New message" button, both at COMPACT.
 *                  Moved in here from the full-width band `AppLayout` used to
 *                  draw above both columns; see ConversationControls for why.
 *                  NO hairline under it — the band and the rows are one list
 *                  surface, and a second divider would cut a 350px card into
 *                  three boxes.
 *   3. rows      — the only scrolling zone. Both zones above are `shrink-0`
 *                  siblings of the scroll container, so they hold position
 *                  while the rows scroll under them; no position:sticky needed.
 *
 * The segmented control, the in-card Filters row and the search-row Filters
 * popover were all removed on the way here.
 */

'use client';

import React from 'react';
import { colors, CanaryCard, CardPadding } from '@canary-ui/components';
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
   * The card's own header zone — the two scope selects (folder left, assignment
   * right). A shrink-0 sibling of the scroll container, so it holds position
   * while the rows scroll under it; no position:sticky needed.
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
  // Rows scroll under the search band with only 4px of air, so scrolled rows
  // used to slice mid-glyph against it (Miguel 8/26: "either increase the
  // padding … or add a fade"). The fade: a top scrim over the scroll zone,
  // present only once the list is actually scrolled.
  const [isScrolled, setIsScrolled] = React.useState(false);

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Guest list card. `CanaryCard` already IS white / bordered /
          `colorBlack6`; only the 12px radius is this surface's own (the base
          bakes `rounded-lg` = 8px).

          ⚠ The base nests its children in a SECOND div, so the whole height
          chain — `flex-1 min-h-0 flex flex-col`, which is what keeps the rows
          scrolling under the two fixed zones instead of stretching the card —
          has to be restated on that child through `[&>div]:`. */}
      <CanaryCard
        cardPadding={CardPadding.NONE}
        hasBorder
        className="flex-1 min-h-0 flex flex-col overflow-clip !rounded-[12px] [&>div]:flex-1 [&>div]:min-h-0 [&>div]:flex [&>div]:flex-col"
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

        {/* Rows.
            A real `<ul>`, not a div: the rows are `CanaryListItem`s and the base
            renders each one as an `<li>`. They are NOT wrapped in `CanaryList` —
            that component draws its own `colorBlack6` hairline between children
            and fades each row in on mount, and these rows are 6px-radius cards
            separated by a 6px gap with no dividers at all. So the list element
            is ours and only the ITEM comes from the library.
            `list-none m-0` cancels the UA's marker and block margins; the
            horizontal padding is set inline below, which also cancels the UA's
            40px `padding-inline-start`. */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          {/* Top scrim — rows dissolve under the search band instead of slicing
              against its 4px pad. Overlay, not a mask, so the band itself stays
              crisp; pointer-events-none keeps the first row clickable through
              it; hidden at rest so the top row reads full-strength. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-10 transition-opacity duration-150"
            style={{
              height: 24,
              background: `linear-gradient(to bottom, ${colors.colorWhite}, transparent)`,
              opacity: isScrolled ? 1 : 0,
            }}
          />
          <ul
            className="flex-1 overflow-y-auto scrollbar-invisible flex flex-col gap-2 list-none m-0"
            style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 16 }}
            onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)}
          >
          {threads.length === 0 ? (
            <li className="list-none p-8 text-center font-['Roboto',sans-serif] text-[14px]" style={{ color: colors.colorBlack4 }}>
              No conversations
            </li>
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
          </ul>
        </div>
      </CanaryCard>
    </div>
  );
}
