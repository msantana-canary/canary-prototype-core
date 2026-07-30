/**
 * BroadcastAudienceCard — the broadcast surface's left column.
 *
 * TEAM JAM CANON: two STACKED cards, not one card with an internal divider.
 * Card 1 is the status trio; card 2 is GROUPS. The recipients column is gone
 * entirely — addressing lives in the composer's To strip and the filter panel
 * behind it (the To-strip arm won the step-5 A/B).
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { BroadcastGroupList } from './BroadcastGroupList';

export function BroadcastAudienceCard() {
  return (
    <div className="h-full flex flex-col shrink-0 gap-4" style={{ width: 320 }}>
      {/* Card 1 — status trio */}
      <div
        className="shrink-0 overflow-clip rounded-[12px]"
        style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
      >
        <BroadcastGroupList section="states" showPopulation />
      </div>

      {/* Card 2 — GROUPS */}
      <div
        className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible rounded-[12px]"
        style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
      >
        <BroadcastGroupList section="groups" showPopulation />
      </div>
    </div>
  );
}
