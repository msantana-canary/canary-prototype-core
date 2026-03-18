'use client';

/**
 * CampaignEditor
 *
 * Full-page overlay editor for Scheduled Campaigns.
 * Same two-panel layout as MessageEditor but with EditorScheduledTimeCard
 * instead of EditorSendTimeCard, and no Reminders section.
 */

import { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiLoading } from '@mdi/js';
import {
  CanaryButton,
  CanaryModal,
  ButtonType,
  ButtonColor,
} from '@canary-ui/components';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';
import { Channel, ScheduledCampaign } from '@/lib/products/guest-journey/types';
import { PhonePreview } from './PhonePreview';
import { EditorTitleCard } from './EditorTitleCard';
import { EditorScheduledTimeCard } from './EditorScheduledTimeCard';
import { EditorTranslationsCard } from './EditorTranslationsCard';
import { EditorMessageCard } from './EditorMessageCard';

interface CampaignEditorProps {
  isOpen: boolean;
}

export function CampaignEditor({ isOpen }: CampaignEditorProps) {
  const {
    campaigns,
    selectedCampaignId,
    closeCampaignEditor,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  } = useGuestJourneyStore();

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [activePreviewChannel, setActivePreviewChannel] = useState<Channel>('email');
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Outer slide animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else if (shouldRender) {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        // Clean up empty campaigns (created but never filled in)
        const store = useGuestJourneyStore.getState();
        if (store.selectedCampaignId) {
          const campaign = store.campaigns.find((c) => c.id === store.selectedCampaignId);
          if (campaign && !campaign.title.trim()) {
            store.deleteCampaign(campaign.id);
          }
        }
        useGuestJourneyStore.setState({ selectedCampaignId: null });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Create mode: when opened with no selectedCampaignId, create a blank campaign in the store
  useEffect(() => {
    if (isOpen && !selectedCampaignId) {
      const newId = `camp-${Date.now()}`;
      createCampaign({
        id: newId,
        title: '',
        sendTime: '9:00 AM',
        repeatEvery: 1,
        cadence: 'weekly',
        weeklyDay: 'Monday',
        endCondition: 'never',
        channels: [
          { channel: 'email', isEnabled: true, subject: '', body: '', language: 'en' },
          { channel: 'sms', isEnabled: false, body: '', language: 'en' },
        ],
        isEnabled: true,
        supportedLanguages: ['en'],
        segmentTarget: 'ALL_GUESTS',
      });
      useGuestJourneyStore.setState({ selectedCampaignId: newId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const campaign = selectedCampaignId
    ? campaigns.find((c) => c.id === selectedCampaignId)
    : null;

  if (!shouldRender) return null;
  if (!campaign) return null;

  // Adapt campaign to look like a GuestJourneyMessage for shared components
  const messageAdapter = {
    id: campaign.id,
    title: campaign.title,
    type: 'CUSTOM' as const,
    stage: 'PRE_ARRIVAL' as const,
    timing: { delta: 'SAME_DAY' as const, direction: 'BEFORE' as const, anchor: 'ARRIVAL' as const },
    channels: campaign.channels,
    isEnabled: campaign.isEnabled,
    supportedLanguages: campaign.supportedLanguages,
    segmentTarget: campaign.segmentTarget,
  };

  return (
    <div
      className={`absolute inset-0 flex flex-col bg-white shadow-2xl
        transition-transform duration-500 ease-out
        ${animateIn ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ zIndex: 20 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between bg-white shrink-0"
        style={{ padding: '16px 24px', borderBottom: '1px solid #E5E5E5' }}
      >
        <div className="flex items-center" style={{ gap: 16 }}>
          <CanaryButton
            type={ButtonType.ICON_SECONDARY}
            icon={<Icon path={mdiArrowLeft} size={0.85} />}
            onClick={closeCampaignEditor}
          />
          <h1 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
            {campaign.title}
          </h1>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          {campaign && (
            <CanaryButton
              type={ButtonType.PRIMARY}
              color={ButtonColor.DANGER}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </CanaryButton>
          )}
          <CanaryButton
            type={ButtonType.PRIMARY}
            onClick={() => {
              useGuestJourneyStore.getState().showToast('Campaign saved');
              closeCampaignEditor();
            }}
          >
            Save
          </CanaryButton>
        </div>
      </div>

      {/* Two-panel content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div
          ref={leftPanelRef}
          className="flex-1 overflow-auto"
          style={{ backgroundColor: '#FAFAFA', padding: 24 }}
        >
          <div className="flex flex-col" style={{ gap: 16, maxWidth: 662 }}>
            <EditorTitleCard
              message={messageAdapter}
              onChange={(title) => updateCampaign(campaign.id, { title })}
            />
            <EditorScheduledTimeCard
              campaign={campaign}
              onChange={(updates) => updateCampaign(campaign.id, updates)}
            />
            <EditorTranslationsCard message={messageAdapter} />
            <EditorMessageCard
              message={messageAdapter}
              onActiveChannelChange={setActivePreviewChannel}
              onChannelContentChange={(channel, updates) => {
                const exists = campaign.channels.some((c) => c.channel === channel);
                const updatedChannels = exists
                  ? campaign.channels.map((c) => c.channel === channel ? { ...c, ...updates } : c)
                  : [...campaign.channels, { channel, isEnabled: false, body: '', language: 'en', ...updates }];
                updateCampaign(campaign.id, { channels: updatedChannels });
              }}
              onChannelToggle={(channel, enabled) => {
                const exists = campaign.channels.some((c) => c.channel === channel);
                const updatedChannels = exists
                  ? campaign.channels.map((c) => c.channel === channel ? { ...c, isEnabled: enabled } : c)
                  : [...campaign.channels, { channel, isEnabled: enabled, body: '', language: 'en' }];
                updateCampaign(campaign.id, { channels: updatedChannels });
              }}
            />
          </div>
        </div>

        {/* Right panel — preview */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#F0F0F0', borderLeft: '1px solid #E5E5E5' }}
        >
          <PhonePreview message={messageAdapter} activeChannel={activePreviewChannel} />
        </div>
      </div>

      {/* Delete confirmation */}
      <CanaryModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete campaign"
        size="small"
      >
        <p style={{ fontSize: 14, color: '#333', margin: '0 0 24px', lineHeight: '1.5' }}>
          Are you sure you want to delete this campaign? This action cannot be undone. You can always create a new one later.
        </p>
        <div className="flex justify-end" style={{ gap: 8 }}>
          <CanaryButton
            type={ButtonType.OUTLINED}
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </CanaryButton>
          <CanaryButton
            type={ButtonType.PRIMARY}
            color={ButtonColor.DANGER}
            onClick={() => {
              deleteCampaign(campaign.id);
              useGuestJourneyStore.getState().showToast('Campaign deleted');
              setShowDeleteConfirm(false);
              closeCampaignEditor();
            }}
          >
            Delete
          </CanaryButton>
        </div>
      </CanaryModal>
    </div>
  );
}
