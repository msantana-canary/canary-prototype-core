'use client';

/**
 * Guest Journey Page
 *
 * Settings page for Guest Journey messaging. Shows a visual timeline
 * of automated guest messages across 5 lifecycle stages.
 * When a message is selected, the full-page editor slides in.
 */

import { GuestJourneyHeader } from '@/components/products/guest-journey/GuestJourneyHeader';
import { GuestJourneyTabs } from '@/components/products/guest-journey/GuestJourneyTabs';
import { Timeline } from '@/components/products/guest-journey/Timeline';
import { MessageEditor } from '@/components/products/guest-journey/MessageEditor';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';

export default function GuestJourneyPage() {
  const {
    messages,
    activeTab,
    selectedMessageId,
    isEditorOpen,
    setActiveTab,
    openEditor,
    toggleMessageEnabled,
    startCreatingMessage,
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
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Scheduled campaigns coming soon
        </div>
      )}

      {/* Full-page editor overlay */}
      {isEditorOpen && <MessageEditor />}
    </div>
  );
}
