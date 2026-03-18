'use client';

/**
 * GuestJourneyTabs
 *
 * Tab bar: "Reservation messages" | "Scheduled campaigns"
 * Uses CanaryTabs with text variant.
 */

import { CanaryTabs } from '@canary-ui/components';
import { GuestJourneyTab } from '@/lib/products/guest-journey/types';

interface GuestJourneyTabsProps {
  activeTab: GuestJourneyTab;
  onTabChange: (tab: GuestJourneyTab) => void;
}

const tabs = [
  { id: 'reservation-messages', label: 'Reservation messages', content: <></> },
  { id: 'scheduled-campaigns', label: 'Scheduled campaigns', content: <></> },
];

export function GuestJourneyTabs({ activeTab, onTabChange }: GuestJourneyTabsProps) {
  return (
    <div style={{ padding: '24px 24px 0 24px' }}>
      <CanaryTabs
        tabs={tabs}
        variant="text"
        defaultTab={activeTab}
        onChange={(tabId) => onTabChange(tabId as GuestJourneyTab)}
      />
    </div>
  );
}
