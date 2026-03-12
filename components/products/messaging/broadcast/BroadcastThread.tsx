/**
 * BroadcastThread Component
 *
 * Right column of the broadcast view.
 * Shows header with guest count, message feed, and composer.
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import { mdiAccountGroupOutline, mdiInformationOutline } from '@mdi/js';
import { BroadcastMessageFeed } from './BroadcastMessageFeed';
import { BroadcastComposer } from './BroadcastComposer';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';

export function BroadcastThread() {
  const {
    selectedGroupId,
    selectedGuestIds,
    messages,
    sendBroadcast,
  } = useBroadcastStore();

  const groupMessages = messages[selectedGroupId] || [];
  const recipientCount = selectedGuestIds.length;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="h-[60px] px-6 flex items-center justify-between border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          {/* Group Icon */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#eaeef9' }}
          >
            <Icon path={mdiAccountGroupOutline} size={0.83} color="#2858c4" />
          </div>
          {/* Guest Count */}
          <span
            className="font-['Roboto',sans-serif] text-[16px] leading-[24px] font-medium"
            style={{ color: '#333333' }}
          >
            {recipientCount} guest{recipientCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Info Button */}
        <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
          <Icon path={mdiInformationOutline} size={0.83} color="#666666" />
        </button>
      </div>

      {/* Message Feed */}
      <BroadcastMessageFeed messages={groupMessages} />

      {/* Composer */}
      <BroadcastComposer
        onSend={sendBroadcast}
        recipientCount={recipientCount}
      />
    </div>
  );
}
