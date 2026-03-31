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

export default function WorkflowsStep() {
  const selectedWorkflowId = useAgentStore((s) => s.selectedWorkflowId);
  const currentWorkflow = useAgentStore((s) => s.currentWorkflow);
  const selectWorkflow = useAgentStore((s) => s.selectWorkflow);
  const wizardWorkflows = useAgentStore((s) => s.wizardWorkflows);
  const setWizardWorkflows = useAgentStore((s) => s.setWizardWorkflows);

  // No workflow selected — show overview grid
  if (!selectedWorkflowId) {
    return <WorkflowOverview />;
  }

  // Workflow selected — show detail with header + editable name + steps
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = wizardWorkflows.map((wf) =>
      wf.id === selectedWorkflowId ? { ...wf, name: e.target.value } : wf
    );
    setWizardWorkflows(updated);
  };

  const workflowName = currentWorkflow?.name || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: '-24px' }}>
      {/* Header bar — back arrow + title, white bg, border-bottom */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: '8px 24px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #E5E5E5',
          flexShrink: 0,
        }}
      >
        <CanaryButton type={ButtonType.TEXT} onClick={() => selectWorkflow(null)}>
          <Icon path={mdiArrowLeft} size={0.83} />
        </CanaryButton>
        <span style={{ fontSize: 16, fontWeight: 500, lineHeight: '24px', color: '#000', padding: '4px' }}>
          {workflowName ? 'Edit Workflow' : 'Create New Workflow'}
        </span>
      </div>

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
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '16px 24px',
          borderBottom: '1px solid #E5E5E5',
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
