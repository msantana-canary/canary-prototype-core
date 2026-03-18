'use client';

/**
 * Guest Journey Page
 *
 * Settings page for Guest Journey messaging.
 * Two tabs: Reservation Messages (timeline) and Scheduled Campaigns (flat list).
 * Both tabs can open the full-page editor overlay.
 */

import { GuestJourneyHeader } from '@/components/products/guest-journey/GuestJourneyHeader';
import { GuestJourneyTabs } from '@/components/products/guest-journey/GuestJourneyTabs';
import { Timeline } from '@/components/products/guest-journey/Timeline';
import { CampaignList } from '@/components/products/guest-journey/CampaignList';
import { MessageEditor } from '@/components/products/guest-journey/MessageEditor';
import { CampaignEditor } from '@/components/products/guest-journey/CampaignEditor';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';

export default function GuestJourneyPage() {
  const {
    messages,
    campaigns,
    activeTab,
    selectedMessageId,
    selectedCampaignId,
    isEditorOpen,
    isCampaignEditorOpen,
    setActiveTab,
    openEditor,
    toggleMessageEnabled,
    startCreatingMessage,
    openCampaignEditor,
    toggleCampaignEnabled,
  } = useGuestJourneyStore();

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <GuestJourneyHeader />
      <GuestJourneyTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'reservation-messages' && (
        <div className="flex-1 overflow-hidden">
          <Timeline
            messages={messages}
            selectedMessageId={selectedMessageId}
            onSelectMessage={openEditor}
            onToggleEnabled={toggleMessageEnabled}
            onNewMessage={startCreatingMessage}
          />
        </div>
      )}

      {activeTab === 'scheduled-campaigns' && (
        <div className="flex-1 overflow-auto" style={{ backgroundColor: '#FAFAFA' }}>
          <CampaignList
            campaigns={campaigns}
            onSelectCampaign={(id) => openCampaignEditor(id)}
            onToggleEnabled={toggleCampaignEnabled}
            onNewCampaign={() => openCampaignEditor()}
          />
        </div>
      )}

      {/* Full-page editor overlays — always rendered for slide animation */}
      <MessageEditor isOpen={isEditorOpen} />
      <CampaignEditor isOpen={isCampaignEditorOpen} />
    </div>
  );
}
