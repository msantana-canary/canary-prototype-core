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

import React, { useState } from 'react';
import { format } from 'date-fns';
import { colors } from '@canary-ui/components';
import { BroadcastGroupList } from './BroadcastGroupList';
import { BroadcastGuestList } from './BroadcastGuestList';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';
import { getAudienceFacts } from '@/lib/products/messaging/broadcast-audience-facts';
import { BroadcastLedgerHeader, LedgerReason } from './BroadcastLedgerHeader';
import { BroadcastRoster } from './BroadcastRoster';

/** Both internal columns are the same width (the old rail was 240px). */
export const BROADCAST_COLUMN_WIDTH = 212;

export function BroadcastAudienceCard() {
  const {
    leftPanelVariant,
    allGroups,
    selectedGroupId,
    activeFilters,
    selectedGuestIds,
  } = useBroadcastStore();
  const [jumpTarget, setJumpTarget] = useState<LedgerReason | null>(null);

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

  /**
   * VARIANT C ("Ledger-roster"): a card-spanning result header over a narrow
   * rail and a wide roster. 623px = 220 rail + 1 hairline + 400 roster + borders.
   */
  if (leftPanelVariant === 'ledger') {
    const group = allGroups.find(g => g.id === selectedGroupId);
    const facts = getAudienceFacts(selectedGroupId, allGroups, activeFilters, selectedGuestIds);

    return (
      <div
        className="h-full flex flex-col shrink-0 overflow-clip rounded-[12px]"
        style={{
          width: 623,
          backgroundColor: colors.colorWhite,
          border: `1px solid ${colors.colorBlack6}`,
        }}
      >
        <BroadcastLedgerHeader
          audienceName={group?.name ?? 'Broadcast'}
          dateLabel={format(new Date(), 'MMM d')}
          facts={facts}
          onJumpToReason={setJumpTarget}
        />
        <div className="flex-1 min-h-0 flex">
          <div
            className="shrink-0 h-full overflow-y-auto scrollbar-invisible"
            style={{ width: 220 }}
          >
            <BroadcastGroupList showPopulation />
          </div>
          <div className="h-full shrink-0" style={{ width: 1, backgroundColor: colors.colorBlack6 }} />
          <div className="flex-1 min-w-0 h-full">
            <BroadcastRoster jumpTarget={jumpTarget} onJumpHandled={() => setJumpTarget(null)} />
          </div>
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
