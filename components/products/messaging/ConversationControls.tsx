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
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import { colors, CanaryButton, ButtonType, ButtonSize } from '@canary-ui/components';

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
      <div className="flex-1 min-w-0">
        <div
          className="flex items-center gap-2 rounded-[6px]"
          style={{
            backgroundColor: colors.colorWhite,
            border: `1px solid ${colors.colorBlack5}`,
            height: 40,
            paddingLeft: 8,
            paddingRight: 16,
          }}
        >
          <Icon path={mdiMagnify} size={0.83} color={colors.colorBlack3} />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="flex-1 min-w-0 border-0 outline-none bg-transparent font-['Roboto',sans-serif] text-[14px] leading-[22px] placeholder:text-[#666666]"
            style={{ color: colors.colorBlack1 }}
          />
        </div>
      </div>
      <CanaryButton type={ButtonType.PRIMARY} size={ButtonSize.NORMAL} onClick={onNewMessage}>
        New message
      </CanaryButton>
    </div>
  );
}
