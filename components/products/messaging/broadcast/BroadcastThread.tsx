/**
 * BroadcastThread — REDESIGN (broadcast step 1 baseline)
 *
 * The right card: white rounded-12 bordered container holding the audience
 * header, the flat-block broadcast feed, and the composer — the same anatomy as
 * the Conversations thread card.
 *
 * Header now names the audience ("In-house") with the recipient count beneath
 * it, matching the Conversations thread-header register. The dead info button is
 * gone.
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import { mdiAccountGroupOutline, mdiAccountMultipleOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { BroadcastMessageFeed } from './BroadcastMessageFeed';
import { BroadcastComposer } from './BroadcastComposer';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';

export function BroadcastThread() {
  const {
    allGroups,
    selectedGroupId,
    selectedGuestIds,
    messages,
    sendBroadcast,
  } = useBroadcastStore();

  const groupMessages = messages[selectedGroupId] || [];
  const recipientCount = selectedGuestIds.length;
  const groupName = allGroups.find(g => g.id === selectedGroupId)?.name ?? 'Broadcast';

  return (
    <div
      className="flex-1 min-w-0 flex flex-col h-full overflow-clip rounded-[12px]"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Header */}
      <div
        className="flex items-center shrink-0"
        style={{
          minHeight: 70,
          borderBottom: `1px solid ${colors.colorBlack6}`,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <div className="flex items-center min-w-0">
          {/* Audience tile — rounded-8 square, redesign avatar register */}
          <div
            className="w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: colors.colorBlueDark5 }}
          >
            <Icon path={mdiAccountGroupOutline} size={0.83} color={colors.colorBlueDark1} />
          </div>

          <div className="min-w-0" style={{ paddingLeft: 8 }}>
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] truncate"
              style={{ color: colors.colorBlack1 }}
            >
              {groupName}
            </h2>
            <div className="flex items-center gap-1">
              <Icon path={mdiAccountMultipleOutline} size={0.67} color={colors.colorBlack3} />
              <span
                className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                style={{ color: colors.colorBlack3 }}
              >
                {recipientCount} guest{recipientCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <BroadcastMessageFeed messages={groupMessages} />

      {/* Composer */}
      <div className="shrink-0">
        <BroadcastComposer
          onSend={sendBroadcast}
          recipientCount={recipientCount}
        />
      </div>
    </div>
  );
}
