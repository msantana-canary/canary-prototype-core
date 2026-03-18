'use client';

/**
 * CampaignList
 *
 * Flat list of campaign cards in a gray section box (like timeline stages
 * but no blue hover, and "New message" always visible).
 * Cards capped at 700px width.
 */

import { CanaryButton, ButtonType } from '@canary-ui/components';
import { ScheduledCampaign } from '@/lib/products/guest-journey/types';
import { CampaignCard } from './CampaignCard';

interface CampaignListProps {
  campaigns: ScheduledCampaign[];
  onSelectCampaign: (campaignId: string) => void;
  onToggleEnabled: (campaignId: string) => void;
  onNewCampaign: () => void;
}

export function CampaignList({
  campaigns,
  onSelectCampaign,
  onToggleEnabled,
  onNewCampaign,
}: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <div
          className="flex items-center justify-center"
          style={{
            backgroundColor: '#F0F0F0',
            borderRadius: 4,
            minHeight: 200,
          }}
        >
          <p style={{ fontSize: 14, color: '#999' }}>No scheduled campaigns yet</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Gray section box — like timeline stage sections */}
      <div
        style={{
          backgroundColor: '#F0F0F0',
          borderRadius: 4,
          padding: 24,
        }}
      >
        {/* Cards + button side by side, button pinned right */}
        <div className="flex items-start justify-between">
        {/* Campaign cards — capped at 700px, staggered entry */}
        <div className="flex flex-col" style={{ gap: 8, maxWidth: 700 }}>
          {campaigns.map((campaign, idx) => (
            <div
              key={campaign.id}
              className="campaign-item-animate"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CampaignCard
                campaign={campaign}
                onSelect={() => onSelectCampaign(campaign.id)}
                onToggleEnabled={() => onToggleEnabled(campaign.id)}
              />
            </div>
          ))}
        </div>
        {/* New message button — top-aligned with first card */}
        <div className="shrink-0">
          <CanaryButton
            type={ButtonType.PRIMARY}
            onClick={onNewCampaign}
          >
            New message
          </CanaryButton>
        </div>
        </div>
      </div>

      <style>{`
        @keyframes campaignFadeInSlide {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .campaign-item-animate {
          opacity: 0;
          animation: campaignFadeInSlide 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
