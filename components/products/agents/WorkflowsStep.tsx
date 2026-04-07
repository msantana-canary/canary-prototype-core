'use client';

/**
 * WorkflowsStep — Step 3 of the creation wizard.
 *
 * Two levels:
 * 1. Overview — grid of workflow tiles (WorkflowOverview)
 * 2. Detail — step list + chat sidebar when a workflow is selected
 *
 * Detail view replaces the intro block with an editable workflow name input.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiChatOutline } from '@mdi/js';
import {
  CanaryButton,
  CanaryInput,
  ButtonType,
  InputSize,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import type { AgentViewTab } from '@/lib/products/agents/types';
import WorkflowVisualizer from './WorkflowVisualizer';
import WorkflowOverview from './WorkflowOverview';
import AgentChat from './AgentChat';
import { generateWorkflowDescription } from '@/lib/products/agents/services/agent-builder-api';

export default function WorkflowsStep({ hideHeader }: { hideHeader?: boolean } = {}) {
  const selectedWorkflowId = useAgentStore((s) => s.selectedWorkflowId);
  const currentWorkflow = useAgentStore((s) => s.currentWorkflow);
  const selectWorkflow = useAgentStore((s) => s.selectWorkflow);
  const wizardWorkflows = useAgentStore((s) => s.wizardWorkflows);
  const setWizardWorkflows = useAgentStore((s) => s.setWizardWorkflows);
  const setBuilderWorkflow = useAgentStore((s) => s.setBuilderWorkflow);

  // No workflow selected — show overview grid
  if (!selectedWorkflowId) {
    return <WorkflowOverview />;
  }

  // Detail view renders below with slide-in animation

  // Workflow selected — show detail with header + editable name + steps
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const updated = wizardWorkflows.map((wf) =>
      wf.id === selectedWorkflowId ? { ...wf, name: newName } : wf
    );
    setWizardWorkflows(updated);
    // Also update currentWorkflow so the input reflects the change
    if (currentWorkflow) {
      setBuilderWorkflow({ ...currentWorkflow, name: newName });
    }
  };

  const workflowName = currentWorkflow?.name || '';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', margin: hideHeader ? undefined : '-24px', overflow: 'hidden',
      animationName: 'workflowDetailSlideIn',
      animationDuration: '0.3s',
      animationTimingFunction: 'ease-out',
      animationFillMode: 'forwards',
    }}>
      <style>{`
        @keyframes workflowDetailSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      {/* Header bar — hidden when parent (AgentView) handles it in the tab bar */}
      {!hideHeader && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 24px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #E5E5E5',
            flexShrink: 0,
            minHeight: 56,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <CanaryButton type={ButtonType.ICON_SECONDARY} onClick={() => selectWorkflow(null)} icon={<Icon path={mdiArrowLeft} size={0.83} />} />
            <span style={{ fontSize: 16, fontWeight: 500, lineHeight: '24px', color: '#000', padding: '4px' }}>
              {currentWorkflow && currentWorkflow.steps.length > 0 ? 'Edit Workflow' : 'Create New Workflow'}
            </span>
          </div>
          <CanaryButton
            type={ButtonType.PRIMARY}
            onClick={async () => {
              if (currentWorkflow && selectedWorkflowId) {
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
            Save
          </CanaryButton>
        </div>
      )}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Workflow name input — its own section */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #E5E5E5',
            borderRadius: 4,
            padding: 16,
          }}
        >
          <CanaryInput
            size={InputSize.NORMAL}
            value={workflowName}
            onChange={handleNameChange}
            placeholder="Workflow name"
            label="Workflow name"
          />
        </div>

        {/* Workflow steps */}
        <WorkflowVisualizer workflow={currentWorkflow} />
      </div>
    </div>
  );
}

/** Sidebar: Live AgentChat — only shown when a workflow is selected */
export function WorkflowsSidebar() {
  const selectedWorkflowId = useAgentStore((s) => s.selectedWorkflowId);

  // No sidebar when on overview
  if (!selectedWorkflowId) return null;

  const handleTabSwitch = (_tab: AgentViewTab) => {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sticky header — minHeight matches left panel header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 24px',
          borderBottom: '1px solid #E5E5E5',
          minHeight: 56,
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
          Canary Workflow Builder
        </span>
      </div>

      {/* AgentChat in sidebar mode */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AgentChat onTabSwitch={handleTabSwitch} sidebar />
      </div>
    </div>
  );
}
