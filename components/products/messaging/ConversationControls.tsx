/**
 * ConversationControls — the Conversations search band.
 *
 * Search input (flexible) + the "New message" primary button to its right. The
 * Filters button is GONE — scoping moved into the thread-list card header's two
 * selects, which is where the list it scopes actually lives.
 *
 * ⚠ RE-HOUSED (Miguel 2026-08-20, node `searchbar-node`). This band used to be
 * a full-width row rendered by `AppLayout` ABOVE both columns, spanning the
 * thread list AND the thread view. That was a lie about its reach: the search
 * filters the thread list and "New message" opens a thread — neither one
 * touches the 65% column it was hanging over, and stretching the input to
 * ~1000px made a control that returns a 350px list look like a global search.
 *
 * It now lives INSIDE the Conversations card, between the two scope selects and
 * the rows: header selects → search band → rows. Every control that narrows the
 * list is inside the thing it narrows, in top-to-bottom order of coarseness
 * (which folder → which assignment → which words). The component itself is
 * unchanged apart from the doc — the parent supplies the padding.
 */

'use client';

import React from 'react';
import {
  ButtonSize,
  ButtonType,
  CanaryButton,
  CanaryInputSearch,
  InputSize,
} from '@canary-ui/components';

export type CategoryFilter = 'inbox' | 'archived' | 'blocked';

interface ConversationControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
}

export function ConversationControls({
  searchQuery,
  onSearchChange,
  onNewMessage,
}: ConversationControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* The field is `CanaryInputSearch` — it already draws the magnifier, the
          40px height and the 14px type, so the hand-rolled div + mdiMagnify +
          bare input is gone entirely.

          Every delta rides ONE wrapper class. `.input-search-quiet` has to be a
          WRAPPER rather than the component's own `className` because two of the
          four deltas land on the glyph, which the base renders as a SIBLING of
          the input: the 6px radius and the `colorBlack5` quiet border go on the
          input, while re-sizing the base's fixed 24px black magnifier to a 20px
          `colorBlack3` one (and moving the text inset from 40px to 36px to
          match) can only be reached from above. It also hides the WebKit clear
          ×, which exists only because the base renders `type="search"`. */}
      <div className="flex-1 min-w-0 input-search-quiet">
        <CanaryInputSearch
          size={InputSize.NORMAL}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
        />
      </div>
      <CanaryButton type={ButtonType.PRIMARY} size={ButtonSize.NORMAL} onClick={onNewMessage}>
        New message
      </CanaryButton>
    </div>
  );
}
