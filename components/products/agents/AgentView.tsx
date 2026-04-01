'use client';

/**
 * AgentView — Slide-over detail/edit view for an existing deployed agent.
 *
 * 5 tabs: Overview, Agent Profile, Capabilities, Workflows, Connectors.
 * Right panel: persistent AgentChat for agent interaction.
 * Slides in from right (same pattern as CheckInDetailPanel).
 * Matches Figma node 101-15204.
 */

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiChatOutline } from '@mdi/js';
import {
  CanaryButton,
  CanaryTabs,
  ButtonType,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import type { AgentViewTab } from '@/lib/products/agents/types';
import OverviewTab from './OverviewTab';
import AgentProfileStep from './AgentProfileStep';
import CapabilitiesStep from './CapabilitiesStep';
import WorkflowsStep from './WorkflowsStep';
import ConnectorsStep from './ConnectorsStep';
import AgentChat from './AgentChat';

const TABS: { id: AgentViewTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'profile', label: 'Agent Profile' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'connectors', label: 'Connectors' },
  { id: 'workflows', label: 'Workflows' },
];

export default function AgentView() {
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const agents = useAgentStore((s) => s.agents);
  const goBack = useAgentStore((s) => s.goBack);
  const editAgentTab = useAgentStore((s) => s.editAgentTab);
  const setEditAgentTab = useAgentStore((s) => s.setEditAgentTab);

  const setAgentName = useAgentStore((s) => s.setAgentName);
  const setAgentDescription = useAgentStore((s) => s.setAgentDescription);
  const setWizardCapabilities = useAgentStore((s) => s.setWizardCapabilities);
  const setWizardConnectors = useAgentStore((s) => s.setWizardConnectors);
  const setWizardWorkflows = useAgentStore((s) => s.setWizardWorkflows);
  const setWizardResponsibilities = useAgentStore((s) => s.setWizardResponsibilities);
  const setWizardBehavioralGuidelines = useAgentStore((s) => s.setWizardBehavioralGuidelines);
  const setWizardGuardrailsText = useAgentStore((s) => s.setWizardGuardrailsText);
  const setWizardAvoidedTopics = useAgentStore((s) => s.setWizardAvoidedTopics);
  const setWizardCommunicationStyle = useAgentStore((s) => s.setWizardCommunicationStyle);
  const setBuilderWorkflow = useAgentStore((s) => s.setBuilderWorkflow);

  // Slide-over animation
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setShouldRender(true);
    const timer = setTimeout(() => setAnimateIn(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Hydrate wizard state from agent data so step components can render
  const agent = agents.find((a) => a.id === selectedAgentId);
  useEffect(() => {
    if (!agent) return;
    setAgentName(agent.name);
    setAgentDescription(agent.description);
    setWizardCapabilities(agent.capabilities);
    setWizardCommunicationStyle(agent.tone || '');
    setWizardGuardrailsText(agent.workflow.guardrails.map((g) => `• ${g}`).join('\n'));
    setBuilderWorkflow(agent.workflow);
    setWizardWorkflows([agent.workflow]);
    // Agent-specific fields we can derive
    setWizardResponsibilities([]);
    setWizardBehavioralGuidelines('');
    setWizardAvoidedTopics([]);
    setWizardConnectors(
      agent.connections.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status === 'connected' ? 'connected' as const : c.status === 'needed' ? 'setup-required' as const : 'not-available' as const,
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent?.id]);

  if (!agent) return null;

  const handleBack = () => {
    setAnimateIn(false);
    setTimeout(() => goBack(), 500);
  };

  // Tab content fade transition
  const [tabFadeKey, setTabFadeKey] = useState(0);
  const prevTabRef = useRef(editAgentTab);

  const handleTabSwitch = (tab: AgentViewTab) => {
    setEditAgentTab(tab);
  };

  useEffect(() => {
    if (editAgentTab !== prevTabRef.current) {
      setTabFadeKey((k) => k + 1);
      prevTabRef.current = editAgentTab;
    }
  }, [editAgentTab]);

  const renderTabContent = () => {
    switch (editAgentTab) {
      case 'overview':
        return <OverviewTab />;
      case 'profile':
        return <AgentProfileStep />;
      case 'capabilities':
        return <CapabilitiesStep />;
      case 'workflows':
        return <WorkflowsStep />;
      case 'connectors':
        return <ConnectorsStep />;
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
      {/* Header — matches wizard header pattern */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #E5E5E5',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CanaryButton type={ButtonType.TEXT} onClick={handleBack}>
            <Icon path={mdiArrowLeft} size={0.83} />
          </CanaryButton>
          <h1 style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: 0 }}>
            {agent.name}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CanaryButton type={ButtonType.SHADED}>Save Draft</CanaryButton>
          <CanaryButton type={ButtonType.PRIMARY}>Next</CanaryButton>
        </div>
      </div>

      {/* Tabs + Content + Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content with tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div style={{ padding: '0 24px', borderBottom: '1px solid #E5E5E5', backgroundColor: '#fff' }}>
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
          {/* Tab content — #FAFAFA bg */}
          <div className="flex-1 overflow-y-auto" style={{ padding: 24, background: '#FAFAFA' }}>
            <style>{`
              @keyframes tabContentFade {
                from { opacity: 0; }
                to   { opacity: 1; }
              }
            `}</style>
            <div
              key={tabFadeKey}
              style={{
                opacity: 0,
                animationName: 'tabContentFade',
                animationDuration: '0.3s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'forwards',
              }}
            >
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Right chat panel — 400px, white bg */}
        <div
          className="shrink-0 flex flex-col overflow-hidden"
          style={{
            width: 400,
            borderLeft: '1px solid #E5E5E5',
            background: '#fff',
          }}
        >
          {/* Chat header — sticky */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 24px',
              borderBottom: '1px solid #E5E5E5',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#E5E5E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon path={mdiChatOutline} size={1} color="#000" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 500, lineHeight: '24px', color: '#000' }}>
              Chat with {agent.name}
            </span>
          </div>

          {/* AgentChat — real, wired to Claude API */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <AgentChat
              onTabSwitch={handleTabSwitch}
              existingAgent={agent}
              sidebar
            />
          </div>
        </div>
      </div>
    </div>
  );
}
