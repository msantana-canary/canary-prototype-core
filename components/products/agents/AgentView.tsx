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
import { mdiArrowLeft, mdiClose } from '@mdi/js';
import {
  CanaryButton,
  CanaryTabs,
  ButtonType,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import { agentActivityFeeds, mockConnectors } from '@/lib/products/agents/mock-data';
import type { AgentViewTab } from '@/lib/products/agents/types';
import OverviewTab from './OverviewTab';
import AgentProfileStep from './AgentProfileStep';
import CapabilitiesStep, { CapabilitiesSidebar } from './CapabilitiesStep';
import WorkflowsStep from './WorkflowsStep';
import ConnectorsStep, { ConnectorsSidebar } from './ConnectorsStep';
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
  const selectedThreadId = useAgentStore((s) => s.selectedThreadId);
  const setSelectedThread = useAgentStore((s) => s.setSelectedThread);

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
  const selectWorkflow = useAgentStore((s) => s.selectWorkflow);
  const selectedWorkflowId = useAgentStore((s) => s.selectedWorkflowId);
  const wizardWorkflows = useAgentStore((s) => s.wizardWorkflows);
  const currentWorkflow = useAgentStore((s) => s.currentWorkflow);

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
    setWizardWorkflows(agent.workflows && agent.workflows.length > 0 ? agent.workflows : [agent.workflow]);
    selectWorkflow(null); // Reset workflow selection when switching agents
    // Profile fields — populated from agent data
    setWizardResponsibilities(agent.responsibilities || []);
    setWizardBehavioralGuidelines(agent.behavioralGuidelines || '');
    setWizardAvoidedTopics(agent.avoidedTopics || []);
    // Agent's connectors + remaining property catalog as 'unassigned' (available to add)
    const agentConnIds = new Set(agent.connections.map((c) => c.id));
    const agentConns = agent.connections.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status === 'connected' ? 'connected' as const : c.status === 'not-available' ? 'not-available' as const : 'setup-required' as const,
    }));
    const remainingConns = mockConnectors
      .filter((c) => !agentConnIds.has(c.id))
      .map((c) => ({
        ...c,
        status: c.status === 'not-available' ? 'not-available' as const : 'unassigned' as const,
      }));
    setWizardConnectors([...agentConns, ...remainingConns]);
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

  // Tabs that need a sidebar render as a flex row: [content | sidebar]
  const renderTabContent = () => {
    switch (editAgentTab) {
      case 'overview':
        return <OverviewTab />;
      case 'profile':
        return <AgentProfileStep />;
      case 'capabilities':
        return (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}><CapabilitiesStep /></div>
            <div style={{ width: 340, borderLeft: '1px solid #E5E5E5', overflowY: 'auto', background: '#fff', flexShrink: 0 }}><CapabilitiesSidebar /></div>
          </div>
        );
      case 'workflows':
        if (selectedWorkflowId) {
          return (
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{ flex: 1, overflow: 'hidden' }}><WorkflowsStep hideHeader /></div>
              <div style={{ width: 400, borderLeft: '1px solid #E5E5E5', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
                <AgentChat existingAgent={agent} sidebar />
              </div>
            </div>
          );
        }
        return <WorkflowsStep hideHeader />;
      case 'connectors':
        return (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}><ConnectorsStep /></div>
            <div style={{ width: 340, borderLeft: '1px solid #E5E5E5', overflowY: 'auto', background: '#fff', flexShrink: 0 }}><ConnectorsSidebar /></div>
          </div>
        );
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
          <CanaryButton type={ButtonType.ICON_SECONDARY} onClick={handleBack} icon={<Icon path={mdiClose} size={0.83} />} />
          <h1 style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: 0 }}>
            {agent.name}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CanaryButton type={ButtonType.PRIMARY}>Save</CanaryButton>
        </div>
      </div>

      {/* Tabs + Content — full width */}
      <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar — swaps to detail header when viewing an activity thread */}
          <style>{`
            @keyframes threadHeaderSlideIn {
              from { opacity: 0; transform: translateX(-12px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>
          {(() => {
            const showDetailHeader = selectedThreadId || (editAgentTab === 'workflows' && selectedWorkflowId);
            const detailHeader = (() => {
              if (selectedThreadId) {
                const threadItem = Object.values(agentActivityFeeds).flat().find((item) => item.inquiryId === selectedThreadId);
                return {
                  title: threadItem?.title || 'Activity Detail',
                  subtitle: threadItem?.description,
                  onBack: () => setSelectedThread(null),
                };
              }
              if (editAgentTab === 'workflows' && selectedWorkflowId) {
                const wf = wizardWorkflows.find((w) => w.id === selectedWorkflowId);
                const isNewWorkflow = !wf || wf.steps.length === 0;
                return {
                  title: isNewWorkflow ? 'New Workflow' : 'Edit Workflow',
                  subtitle: undefined,
                  onBack: () => selectWorkflow(null),
                };
              }
              return null;
            })();

            return (
              <div style={{ borderBottom: '1px solid #E5E5E5', backgroundColor: '#fff', height: 57, display: 'flex', alignItems: showDetailHeader ? 'center' : 'flex-end', justifyContent: 'space-between', overflow: 'hidden' }}>
                {showDetailHeader && detailHeader ? (
                  <>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px',
                      animationName: 'threadHeaderSlideIn',
                      animationDuration: '0.25s',
                      animationTimingFunction: 'ease-out',
                      animationFillMode: 'forwards',
                    }}>
                      <CanaryButton type={ButtonType.ICON_SECONDARY} onClick={detailHeader.onBack} icon={<Icon path={mdiArrowLeft} size={0.83} />} />
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: '24px', color: '#000', margin: 0 }}>
                          {detailHeader.title}
                        </p>
                        {detailHeader.subtitle && (
                          <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: '18px' }}>
                            {detailHeader.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {editAgentTab === 'workflows' && selectedWorkflowId && (
                      <div style={{ padding: '0 24px' }}>
                        <CanaryButton
                          type={ButtonType.SHADED}
                          onClick={async () => {
                            if (currentWorkflow && selectedWorkflowId) {
                              const { generateWorkflowDescription } = await import('@/lib/products/agents/services/agent-builder-api');
                              let description = currentWorkflow.description || '';
                              if (!description && currentWorkflow.steps.length > 0) {
                                description = await generateWorkflowDescription(currentWorkflow);
                              }
                              const updated = wizardWorkflows.map((wf) =>
                                wf.id === selectedWorkflowId ? { ...currentWorkflow, description } : wf
                              );
                              setWizardWorkflows(updated);
                            }
                            selectWorkflow(null);
                          }}
                        >
                          {(() => {
                            const wf = wizardWorkflows.find((w) => w.id === selectedWorkflowId);
                            return (!wf || wf.steps.length === 0) ? 'Save workflow' : 'Save edits';
                          })()}
                        </CanaryButton>
                      </div>
                    )}
                  </>
                ) : (
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
                )}
              </div>
            );
          })()}
          {/* Tab content — #FAFAFA bg. Tabs with sidebars manage their own scroll. */}
          <div className="flex-1" style={{
            padding: (editAgentTab === 'capabilities' || editAgentTab === 'connectors' || (editAgentTab === 'workflows' && selectedWorkflowId)) ? 0 : 24,
            background: '#FAFAFA',
            overflow: (editAgentTab === 'capabilities' || editAgentTab === 'connectors' || (editAgentTab === 'workflows' && selectedWorkflowId)) ? 'hidden' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}>
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
                flex: 1,
                minHeight: 0,
              }}
            >
              {renderTabContent()}
            </div>
          </div>
      </div>
    </div>
  );
}
