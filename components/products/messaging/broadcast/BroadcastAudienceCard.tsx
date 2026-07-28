/**
 * BroadcastAudienceCard — REDESIGN (broadcast step 1 baseline)
 *
 * The old left rail (groups) and middle column (guest list) are now ONE card:
 * they're closely associated — you pick an audience, then you narrow it down to
 * the recipients. Same white rounded-12 card register as the Conversations
 * thread-list card.
 *
 * The two old panes keep their SIDE-BY-SIDE relationship inside the card, at
 * EQUAL widths:
 *
 *   [ audience selector | recipients ]
 *
 * Both columns are 212px, so the card is CONTENT-SIZED (212 + 1px divider + 212
 * + borders) rather than a share of the canvas — the thread card takes all the
 * remaining width.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { BroadcastGroupList } from './BroadcastGroupList';
import { BroadcastGuestList } from './BroadcastGuestList';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';

/** Both internal columns are the same width (the old rail was 240px). */
export const BROADCAST_COLUMN_WIDTH = 212;

export function BroadcastAudienceCard() {
  const leftPanelVariant = useBroadcastStore(s => s.leftPanelVariant);

  /**
   * VARIANT B ("To-strip"): the card is a pure audience list. The recipients
   * column is gone — its job moved into the composer's To strip and the
   * Recipients panel behind it.
   */
  if (leftPanelVariant === 'to-strip') {
    return (
      <div
        className="h-full flex shrink-0 overflow-clip rounded-[12px]"
        style={{
          width: 320,
          backgroundColor: colors.colorWhite,
          border: `1px solid ${colors.colorBlack6}`,
        }}
      >
        <div className="w-full h-full overflow-y-auto scrollbar-invisible">
          <BroadcastGroupList showPopulation />
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex shrink-0 overflow-clip rounded-[12px]"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Audience selector column */}
      <div
        className="shrink-0 h-full overflow-y-auto scrollbar-invisible"
        style={{ width: BROADCAST_COLUMN_WIDTH }}
      >
        <BroadcastGroupList />
      </div>

      {/* Divider between "who" and "which of them" */}
      <div className="h-full shrink-0" style={{ width: 1, backgroundColor: colors.colorBlack6 }} />

      {/* Recipients column — same width as the audience column */}
      <div className="shrink-0 h-full" style={{ width: BROADCAST_COLUMN_WIDTH }}>
        <BroadcastGuestList />
      </div>
    </div>
  );
}
