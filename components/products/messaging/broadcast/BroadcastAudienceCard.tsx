/**
 * BroadcastAudienceCard — REDESIGN (broadcast step 1 baseline)
 *
 * The old left rail (groups) and middle column (guest list) are now ONE card:
 * they're closely associated — you pick an audience, then you narrow it down to
 * the recipients. Same white rounded-12 card register as the Conversations
 * thread-list card.
 *
 * The two old panes keep their SIDE-BY-SIDE relationship inside the card:
 *
 *   [ audience selector | recipients ]
 *
 * Left column  = 212px fixed (the old 240px rail, minus the borders it used to
 *                carry), scrolling on its own: the status trio + GROUPS section.
 * Vertical hairline divider.
 * Right column = flex-1: Filters row, date picker, Select all, guest list.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { BroadcastGroupList } from './BroadcastGroupList';
import { BroadcastGuestList } from './BroadcastGuestList';

/** Fixed width of the audience-selector column (the old rail was 240px). */
const AUDIENCE_COLUMN_WIDTH = 212;

export function BroadcastAudienceCard() {
  return (
    <div
      className="w-full h-full flex overflow-clip rounded-[12px]"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Audience selector column */}
      <div
        className="shrink-0 h-full overflow-y-auto scrollbar-invisible"
        style={{ width: AUDIENCE_COLUMN_WIDTH }}
      >
        <BroadcastGroupList />
      </div>

      {/* Divider between "who" and "which of them" */}
      <div className="h-full shrink-0" style={{ width: 1, backgroundColor: colors.colorBlack6 }} />

      {/* Recipients column */}
      <div className="flex-1 min-w-0 h-full">
        <BroadcastGuestList />
      </div>
    </div>
  );
}
