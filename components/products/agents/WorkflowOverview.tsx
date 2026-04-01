'use client';

/**
 * WorkflowOverview — Grid view of all workflows for an agent.
 * 2-column grid with workflow tiles showing name, description, step count.
 * Clicking a tile drills into the workflow detail (WorkflowsStep).
 * Matches Figma node 112-20341.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiSwapHorizontal,
  mdiDotsHorizontal,
  mdiPlusCircleOutline,
} from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';

export default function WorkflowOverview() {
  const workflows = useAgentStore((s) => s.wizardWorkflows);
  const selectWorkflow = useAgentStore((s) => s.selectWorkflow);
  const createNewWorkflow = useAgentStore((s) => s.createNewWorkflow);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        @keyframes wfTileFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wf-tile {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .wf-tile:hover {
          border-color: #C9D5F0 !important;
          box-shadow: 0 2px 8px rgba(40, 88, 196, 0.08);
        }
      `}</style>
      {/* Intro block */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: '#EAEEF9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 8,
          }}
        >
          <Icon path={mdiSwapHorizontal} size={1} color="#2858C4" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: '0 0 4px 0' }}>
            Your agent&apos;s playbook
          </p>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '24px', color: '#000', margin: 0 }}>
            Here&apos;s the recommended workflow for a Sales & Events Agent. Each step runs in order — expand any step to see how it handles different scenarios.
          </p>
        </div>
      </div>

      {/* Workflow tiles grid — 2 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}
      >
        {workflows.map((wf, i) => (
          <div
            key={wf.id || wf.name || `wf-${i}`}
            onClick={() => selectWorkflow(wf.id || null)}
            className="wf-tile"
            style={{
              backgroundColor: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: 4,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              minHeight: 120,
              opacity: 0,
              animationName: 'wfTileFadeIn',
              animationDuration: '0.35s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'forwards',
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <div>
              {/* Header: name + more menu */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000', margin: 0 }}>
                  {wf.name || 'Untitled Workflow'}
                </p>
                <CanaryButton
                  type={ButtonType.ICON_SECONDARY}
                  size={ButtonSize.COMPACT}
                  icon={<Icon path={mdiDotsHorizontal} size={0.83} />}
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}
                />
              </div>
              {/* Description */}
              <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#000', margin: 0 }}>
                {wf.description || 'No description'}
              </p>
            </div>
            {/* Step count */}
            <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#999', margin: '8px 0 0 0' }}>
              {wf.steps.length} Steps
            </p>
          </div>
        ))}

        {/* Create new Workflow card */}
        <div
          className="cap-add-card"
          onClick={createNewWorkflow}
          style={{
            border: '1px dashed #93ABE1',
            borderRadius: 4,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            minHeight: 120,
            opacity: 0,
            animationName: 'wfTileFadeIn',
            animationDuration: '0.35s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationDelay: `${workflows.length * 0.06}s`,
          }}
        >
          <Icon path={mdiPlusCircleOutline} size={1} color="#2858C4" />
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#2858C4', margin: 0, textAlign: 'center' }}>
            Create new Workflow
          </p>
        </div>
      </div>
    </div>
  );
}
