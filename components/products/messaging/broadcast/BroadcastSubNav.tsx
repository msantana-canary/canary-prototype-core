/**
 * BroadcastSubNav Component
 *
 * Sub-navigation bar for the Broadcast tab.
 * Active/Archived pill tabs, matching the Conversations SubNav pattern.
 */

'use client';

import React from 'react';
import { CanaryTabs } from '@canary-ui/components';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';

export function BroadcastSubNav() {
  const { activeGroupTab, setActiveGroupTab } = useBroadcastStore();

  const tabs = [
    {
      id: 'active',
      label: 'Active',
      content: <></>,
    },
    {
      id: 'archived',
      label: 'Archived',
      content: <></>,
    },
  ];

  return (
    <div className="bg-white border-t border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Pill Tabs */}
      <CanaryTabs
        tabs={tabs}
        variant="rounded"
        defaultTab={activeGroupTab}
        onChange={(tabId) => setActiveGroupTab(tabId as 'active' | 'archived')}
        className="mb-0"
      />
    </div>
  );
}
