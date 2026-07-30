/**
 * ConversationControls — the Conversations search band.
 *
 * TEAM JAM CANON: full-width search with the "New message" primary button to its
 * right, above both columns. The Filters button is GONE — scoping moved into the
 * thread-list card header's Inbox control, which is where the list it scopes
 * actually lives.
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
