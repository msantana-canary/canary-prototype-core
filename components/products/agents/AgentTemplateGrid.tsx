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
  ButtonSize,
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
  const startFromScratch = useAgentStore((s) => s.startFromScratch);
  const startAdvancedBuild = useAgentStore((s) => s.startAdvancedBuild);

  const handleTemplateClick = (template: AgentTemplate) => {
    if (template.isLocked) return;
    startFromTemplate(template);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{`
        @keyframes templateGridFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scratch-card {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .scratch-card:hover {
          border-color: #2858C4 !important;
          box-shadow: 0 2px 12px rgba(40, 88, 196, 0.12);
        }
      `}</style>
      {/* Header bar — matches wizard/agent view pattern */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 24px',
          borderBottom: '1px solid #E5E5E5',
          flexShrink: 0,
        }}
      >
        <CanaryButton type={ButtonType.ICON_SECONDARY} onClick={goBack} icon={<Icon path={mdiArrowLeft} size={0.83} />} />
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: 0 }}>
            Create a new agent
          </h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: '18px' }}>
            Choose a template to get started, or build from scratch.
          </p>
        </div>
      </div>

      {/* Template grid */}
      <div style={{ padding: 24, flex: 1, overflowY: 'auto', backgroundColor: colors.colorBlack8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {/* Start from Scratch card — two modes */}
        <div
          className="scratch-card"
          style={{
            border: '2px dashed #93ABE1',
            borderRadius: 8,
            padding: 16,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: 0,
            animationName: 'templateGridFadeIn',
            animationDuration: '0.35s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#EAEEF9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon path={mdiStarOutline} size={0.75} color="#2858C4" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#000', margin: '0 0 4px 0' }}>
              Build from Scratch
            </p>
            <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>
              Build a custom agent with your own configuration
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            <div className="w-full [&_button]:w-full">
              <CanaryButton type={ButtonType.PRIMARY} size={ButtonSize.COMPACT} onClick={startFromScratch}>
                Guided Setup
              </CanaryButton>
            </div>
            <div className="w-full [&_button]:w-full">
              <CanaryButton type={ButtonType.SHADED} size={ButtonSize.COMPACT} onClick={startAdvancedBuild}>
                Advanced Builder
              </CanaryButton>
            </div>
          </div>
        </div>

        {agentTemplates.map((template, idx) => (
          <div
            key={template.id}
            className="template-card-wrapper"
            style={{
              opacity: 0,
              animationName: 'templateGridFadeIn',
              animationDuration: '0.35s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'forwards',
              animationDelay: `${(idx + 1) * 0.05}s`,
            }}
          >
            <TemplateCard
              template={template}
              onClick={() => handleTemplateClick(template)}
            />
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, onClick }: { template: AgentTemplate; onClick: () => void }) {
  const iconPath = ICON_MAP[template.icon] || mdiStarOutline;
  const tierCfg = TIER_CONFIG[template.tier];

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <CanaryCard hasBorder onClick={template.isLocked ? undefined : onClick} className="h-full">
        <div
          style={{
            opacity: template.isLocked ? 0.5 : 1,
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
          {template.isLocked && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: colors.colorBlack3,
                marginTop: 12,
              }}
            >
              <Icon path={mdiLockOutline} size={0.55} color={colors.colorBlack3} />
              <span>{template.lockMessage ?? 'Upgrade to unlock'}</span>
            </div>
          )}
        </div>
      </CanaryCard>
    </div>
  );
}
