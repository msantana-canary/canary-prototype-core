'use client';

/**
 * AgentView — Slide-over detail/edit view for an existing deployed agent.
 *
 * 5 tabs: Overview, Agent Profile, Capabilities, Workflows, Connectors.
 * Right panel: persistent chat for agent interaction.
 * Slides in from right (same pattern as CheckInDetailPanel).
 * Matches Figma node 101-15204.
 */

import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiChatOutline } from '@mdi/js';
import {
  CanaryButton,
  CanaryTabs,
  ButtonType,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import type { AgentViewTab } from '@/lib/products/agents/types';
import OverviewTab from './OverviewTab';

const TABS: { id: AgentViewTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'profile', label: 'Agent Type' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'connectors', label: 'Connectors' },
];

export default function AgentView() {
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const agents = useAgentStore((s) => s.agents);
  const goBack = useAgentStore((s) => s.goBack);
  const editAgentTab = useAgentStore((s) => s.editAgentTab);
  const setEditAgentTab = useAgentStore((s) => s.setEditAgentTab);

  // Slide-over animation
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setShouldRender(true);
    const timer = setTimeout(() => setAnimateIn(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const agent = agents.find((a) => a.id === selectedAgentId);
  if (!agent) return null;

  const handleBack = () => {
    setAnimateIn(false);
    setTimeout(() => goBack(), 500);
  };

  const activeTabIdx = TABS.findIndex((t) => t.id === editAgentTab);

  const renderTabContent = () => {
    switch (editAgentTab) {
      case 'overview':
        return <OverviewTab />;
      case 'profile':
        return <div style={{ color: '#666', fontSize: 14 }}>Agent Profile editing — reuses AgentProfileStep in edit mode</div>;
      case 'capabilities':
        return <div style={{ color: '#666', fontSize: 14 }}>Capabilities editing — reuses CapabilitiesStep in edit mode</div>;
      case 'workflows':
        return <div style={{ color: '#666', fontSize: 14 }}>Workflows editing — reuses WorkflowsStep in edit mode</div>;
      case 'connectors':
        return <div style={{ color: '#666', fontSize: 14 }}>Connectors editing — reuses ConnectorsStep in edit mode</div>;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col bg-white overflow-hidden shadow-2xl transition-transform duration-500 ease-out"
      style={{
        transform: animateIn ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.colorBlack6}` }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.colorBlack3,
              fontSize: 14,
              padding: '4px 0',
            }}
          >
            <Icon path={mdiArrowLeft} size={0.7} />
            Back
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: colors.colorBlack1, margin: 0 }}>
            {agent.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <CanaryButton type={ButtonType.OUTLINED}>Save Draft</CanaryButton>
          <CanaryButton type={ButtonType.PRIMARY}>Next</CanaryButton>
        </div>
      </div>

      {/* Tabs + Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content with tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div style={{ padding: '0 24px', borderBottom: `1px solid ${colors.colorBlack6}` }}>
            <CanaryTabs
              variant="text"
              defaultTab={editAgentTab}
              key={editAgentTab}
              onChange={(tabId: string) => setEditAgentTab(tabId as AgentViewTab)}
              tabs={TABS.map((t) => ({
                id: t.id,
                label: t.label,
                content: null,
              }))}
            />
          </div>
          <div className="flex-1 overflow-y-auto" style={{ padding: '24px 32px' }}>
            {renderTabContent()}
          </div>
        </div>

        {/* Right chat panel */}
        <div
          className="shrink-0 flex flex-col overflow-hidden"
          style={{
            width: 320,
            borderLeft: `1px solid ${colors.colorBlack6}`,
            background: '#fafafa',
          }}
        >
          {/* Chat header */}
          <div
            style={{
              padding: '16px',
              borderBottom: `1px solid ${colors.colorBlack6}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: colors.colorBlack5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon path={mdiChatOutline} size={0.6} color={colors.colorBlack2} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: colors.colorBlack1 }}>
              Chat with {agent.name}
            </span>
          </div>

          {/* Chat body placeholder */}
          <div className="flex-1 overflow-y-auto" style={{ padding: 16 }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px 12px 12px 4px',
                backgroundColor: colors.colorBlueDark5,
                fontSize: 13,
                color: colors.colorBlack1,
                lineHeight: '18px',
              }}
            >
              Ask me anything about this agent — how it&apos;s performing, what to change, or check on specific inquiries.
            </div>
          </div>

          {/* Chat input */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.colorBlack6}` }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Ask about this agent..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${colors.colorBlack6}`,
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'var(--font-roboto), sans-serif',
                }}
              />
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  backgroundColor: colors.colorBlueDark1,
                  color: '#fff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
