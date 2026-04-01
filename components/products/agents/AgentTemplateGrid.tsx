'use client';

/**
 * AgentTemplateGrid — Template selection view.
 *
 * First screen of the creation flow. User picks a template, then the
 * conversational wizard opens to configure it.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiLockOutline,
  mdiDeskLamp,
  mdiCalendarCheckOutline,
  mdiMapMarkerOutline,
  mdiMessageTextOutline,
  mdiPhoneOutline,
  mdiHandshakeOutline,
  mdiBroom,
  mdiWrenchOutline,
  mdiAccountAlertOutline,
  mdiTrendingUp,
  mdiCreditCardOutline,
  mdiStarOutline,
  mdiEmailOutline,
} from '@mdi/js';
import {
  CanaryButton,
  CanaryCard,
  CanaryTag,
  ButtonType,
  IconPosition,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import { agentTemplates } from '@/lib/products/agents/mock-data';
import type { AgentTemplate } from '@/lib/products/agents/types';

const ICON_MAP: Record<string, string> = {
  mdiDeskLampOn: mdiDeskLamp,
  mdiCalendarCheckOutline,
  mdiMapMarkerOutline,
  mdiMessageTextOutline,
  mdiPhoneOutline,
  mdiHandshakeOutline,
  mdiBroomOutline: mdiBroom,
  mdiWrenchOutline,
  mdiAccountAlertOutline,
  mdiTrendingUp,
  mdiCreditCardOutline,
  mdiStarOutline,
  mdiEmailOutline,
};

type TierKey = 'included' | 'core' | 'premium';

const TIER_CONFIG: Record<TierKey, { label: string; tagColor?: TagColor; customColor?: { backgroundColor: string; fontColor: string } }> = {
  included: { label: 'Included', tagColor: TagColor.SUCCESS },
  core: {
    label: 'Core',
    customColor: { backgroundColor: colors.colorBlueDark5, fontColor: colors.colorBlueDark1 },
  },
  premium: {
    label: 'Premium',
    customColor: { backgroundColor: '#F0E6FF', fontColor: '#6B21A8' },
  },
};

export default function AgentTemplateGrid() {
  const goBack = useAgentStore((s) => s.goBack);
  const startFromTemplate = useAgentStore((s) => s.startFromTemplate);

  const handleTemplateClick = (template: AgentTemplate) => {
    if (template.isLocked) return;
    startFromTemplate(template);
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <CanaryButton
          type={ButtonType.TEXT}
          icon={<Icon path={mdiArrowLeft} size={0.8} />}
          iconPosition={IconPosition.LEFT}
          onClick={goBack}
        >
          Back
        </CanaryButton>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.colorBlack2, margin: '12px 0 4px' }}>
          Create a new agent
        </h1>
        <p style={{ fontSize: '0.875rem', color: colors.colorBlack3, margin: 0 }}>
          Choose a template to get started
        </p>
      </div>

      {/* Template grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {agentTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => handleTemplateClick(template)}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({ template, onClick }: { template: AgentTemplate; onClick: () => void }) {
  const iconPath = ICON_MAP[template.icon] || mdiStarOutline;
  const tierCfg = TIER_CONFIG[template.tier];

  return (
    <div style={{ position: 'relative' }}>
      <CanaryCard hasBorder onClick={template.isLocked ? undefined : onClick}>
        <div
          style={{
            padding: 24,
            cursor: template.isLocked ? 'not-allowed' : 'pointer',
            minHeight: 200,
            opacity: template.isLocked ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {/* Icon + tier badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: colors.colorBlueDark5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon path={iconPath} size={0.9} color={colors.colorBlueDark1} />
            </div>
            <CanaryTag
              label={tierCfg.label}
              color={tierCfg.tagColor}
              customColor={tierCfg.customColor}
              size={TagSize.COMPACT}
            />
          </div>

          {/* Name + description */}
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: colors.colorBlack2, marginBottom: 6 }}>
            {template.name}
          </div>
          <div style={{ fontSize: '0.8125rem', color: colors.colorBlack3, lineHeight: 1.5 }}>
            {template.description}
          </div>
        </div>
      </CanaryCard>

      {template.isLocked && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: colors.colorBlack3,
          }}
        >
          <Icon path={mdiLockOutline} size={0.55} color={colors.colorBlack3} />
          <span>{template.lockMessage ?? 'Upgrade to unlock'}</span>
        </div>
      )}
    </div>
  );
}
