/**
 * BroadcastAudienceCard — REDESIGN (broadcast step 1 baseline)
 *
 * The old left rail (groups) and middle column (guest list) are now ONE card:
 * they're closely associated — you pick an audience, then you narrow it down to
 * the recipients. Same white rounded-12 card register as the Conversations
 * thread-list card.
 *
 * Top zone  = audience selector (Arrivals / In-house / Departures + GROUPS)
 * Divider
 * Lower zone = recipients (Filters row, date picker, Select all, guest list)
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { BroadcastGroupList } from './BroadcastGroupList';
import { BroadcastGuestList } from './BroadcastGuestList';

export function BroadcastAudienceCard() {
  return (
    <div
      className="w-full h-full flex flex-col overflow-clip rounded-[12px]"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Audience selector — capped so a long GROUPS list can't eat the card */}
      <div
        className="shrink-0 overflow-y-auto scrollbar-invisible"
        style={{ maxHeight: '45%' }}
      >
        <BroadcastGroupList />
      </div>

      {/* Divider between "who" and "which of them" */}
      <div className="w-full shrink-0" style={{ height: 1, backgroundColor: colors.colorBlack6 }} />

      {/* Recipients */}
      <div className="flex-1 min-h-0">
        <BroadcastGuestList />
      </div>
    </div>
  );
}
