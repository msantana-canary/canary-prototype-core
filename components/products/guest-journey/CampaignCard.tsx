'use client';

/**
 * CampaignCard
 *
 * Campaign card for the Scheduled Campaigns tab.
 * Wider than timeline cards (full container width), no timeline dots/labels.
 * Shows: title + toggle, cadence + end date, next send + audience,
 * then content preview (channel tabs + subject + body).
 *
 * Matches Figma: node 809:6883
 */

import { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiClockOutline,
  mdiRefresh,
  mdiAccountGroupOutline,
  mdiAccountOutline,
} from '@mdi/js';
import {
  CanarySwitch,
  CanaryTabs,
  CanarySelect,
  InputSize,
  TagSize,
} from '@canary-ui/components';
import {
  ScheduledCampaign,
  Channel,
  CHANNEL_LABELS,
} from '@/lib/products/guest-journey/types';
import { campaignCadenceLabel, campaignEndLabel } from '@/lib/products/guest-journey/utils';

interface CampaignCardProps {
  campaign: ScheduledCampaign;
  onSelect: () => void;
  onToggleEnabled: () => void;
}

const LANG_MAP: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

export function CampaignCard({ campaign, onSelect, onToggleEnabled }: CampaignCardProps) {
  const enabledChannels = campaign.channels.filter((c) => c.isEnabled);
  const [activeChannel, setActiveChannel] = useState<Channel>(
    enabledChannels[0]?.channel || 'email'
  );

  const activeContent = campaign.channels.find((c) => c.channel === activeChannel);
  const cadence = campaignCadenceLabel(campaign);
  const endLabel = campaignEndLabel(campaign);
  const segmentLabel = campaign.segmentTarget === 'ALL_GUESTS' ? 'All Guests' : 'Loyalty: Platinum Elite, Diamond Elite';
  const segmentIcon = campaign.segmentTarget === 'ALL_GUESTS' ? mdiAccountGroupOutline : mdiAccountOutline;

  const channelTabs = enabledChannels.map((ch) => ({
    id: ch.channel,
    label: CHANNEL_LABELS[ch.channel],
    content: <></>,
  }));

  return (
    <div
      onClick={onSelect}
      className="cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: '#FFF',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        padding: 24,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Title + toggle */}
      <div className="flex items-center justify-between">
        <h4 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
          {campaign.title}
        </h4>
        <div onClick={(e) => e.stopPropagation()}>
          <CanarySwitch
            checked={campaign.isEnabled}
            onChange={onToggleEnabled}
          />
        </div>
      </div>

      {/* Info row 1: cadence + end condition */}
      <div className="flex items-center" style={{ gap: 4, marginTop: 8, color: '#666', fontSize: 14 }}>
        <Icon path={mdiClockOutline} size={0.75} color="#666" />
        <span>{cadence}</span>
        {endLabel && (
          <>
            <span style={{ margin: '0 4px' }}>·</span>
            <span>{endLabel}</span>
          </>
        )}
      </div>

      {/* Info row 2: next send + audience */}
      <div className="flex items-center" style={{ gap: 16, marginTop: 4, color: '#666', fontSize: 14 }}>
        {campaign.nextSendDate && (
          <div className="flex items-center" style={{ gap: 4 }}>
            <Icon path={mdiRefresh} size={0.75} color="#666" />
            <span>Next send date: {campaign.nextSendDate}</span>
          </div>
        )}
        <div className="flex items-center" style={{ gap: 4 }}>
          <Icon path={segmentIcon} size={0.75} color="#666" />
          <span>{segmentLabel}</span>
        </div>
      </div>

      {/* Content preview */}
      {campaign.isEnabled && enabledChannels.length > 0 && (
        <div
          className="mt-4"
          style={{
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            padding: '16px 16px 8px 16px',
          }}
        >
          {/* Channel tabs + language */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CanaryTabs
              tabs={channelTabs}
              variant="text"
              size="compact"
              defaultTab={activeChannel}
              onChange={(tabId) => setActiveChannel(tabId as Channel)}
            />
            <div style={{ width: 120, flexShrink: 0 }}>
              <CanarySelect
                value="en"
                size={InputSize.COMPACT}
                options={campaign.supportedLanguages.map((lang) => ({
                  value: lang,
                  label: LANG_MAP[lang] || lang,
                }))}
                onChange={() => {}}
              />
            </div>
          </div>

          {/* Content */}
          {activeContent && (
            <div>
              {activeContent.subject && (
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 12, lineHeight: '18px', color: '#666', margin: '0 0 4px 0' }}>
                    Subject (English)
                  </p>
                  <div style={{ fontSize: 14, lineHeight: '18px', color: '#000' }}>
                    {activeContent.subject}
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 12, lineHeight: '18px', color: '#666', margin: '0 0 4px 0' }}>
                  {activeContent.channel === 'email' ? 'Body content (English)' : 'Content (English)'}
                </p>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: '18px',
                    color: '#000',
                    whiteSpace: 'pre-wrap',
                    display: '-webkit-box',
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxHeight: 90,
                  }}
                >
                  {activeContent.body}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
