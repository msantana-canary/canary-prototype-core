'use client';

/**
 * WorkflowOverview — Grid view of all workflows for an agent.
 * 2-column grid with workflow tiles showing name, description, step count.
 * Clicking a tile drills into the workflow detail (WorkflowsStep).
 * Matches Figma node 112-20341.
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiSwapHorizontal,
  mdiDotsHorizontal,
  mdiPlusCircleOutline,
  mdiBookmarkOutline,
  mdiPlayCircleOutline,
} from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import type { AgentWorkflow } from '@/lib/products/agents/types';
import WorkflowTemplateLibrary from './WorkflowTemplateLibrary';

interface WorkflowGroup {
  primary: AgentWorkflow;
  subs: AgentWorkflow[];
}

function groupWorkflows(workflows: AgentWorkflow[]): { groups: WorkflowGroup[]; ungrouped: AgentWorkflow[] } {
  const primaryMap = new Map<string, AgentWorkflow>();
  const subsByParent = new Map<string, AgentWorkflow[]>();
  const ungrouped: AgentWorkflow[] = [];

  for (const wf of workflows) {
    if (wf.role === 'primary' && wf.id) {
      primaryMap.set(wf.id, wf);
    }
  }

  for (const wf of workflows) {
    if (wf.role === 'sub' && wf.parentWorkflowId && primaryMap.has(wf.parentWorkflowId)) {
      const subs = subsByParent.get(wf.parentWorkflowId) || [];
      subs.push(wf);
      subsByParent.set(wf.parentWorkflowId, subs);
    } else if (wf.role !== 'primary') {
      ungrouped.push(wf);
    }
  }

  const groups: WorkflowGroup[] = [];
  for (const [id, primary] of primaryMap) {
    groups.push({ primary, subs: subsByParent.get(id) || [] });
  }

  return { groups, ungrouped };
}

function WorkflowMenu({ workflowId }: { workflowId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const saveAsTemplate = useAgentStore((s) => s.saveWorkflowAsTeamTemplate);
  const startTestMode = useAgentStore((s) => s.startTestMode);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <CanaryButton
        type={ButtonType.ICON_SECONDARY}
        size={ButtonSize.COMPACT}
        icon={<Icon path={mdiDotsHorizontal} size={0.83} />}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setOpen(!open); }}
      />
      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 10,
            backgroundColor: '#fff', border: '1px solid #E5E5E5', borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 200, padding: '4px 0',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); startTestMode(workflowId); setOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 14px', fontSize: 13, color: '#333', textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Icon path={mdiPlayCircleOutline} size={0.7} color="#666" />
            Test Workflow
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); saveAsTemplate(workflowId); setOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 14px', fontSize: 13, color: '#333', textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Icon path={mdiBookmarkOutline} size={0.7} color="#666" />
            Save as Team Template
          </button>
        </div>
      )}
    </div>
  );
}

function WorkflowTile({ wf, index, onClick }: { wf: AgentWorkflow; index: number; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
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
        animationDelay: `${index * 0.06}s`,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000', margin: 0 }}>
            {wf.name || 'Untitled Workflow'}
          </p>
          {wf.id && <WorkflowMenu workflowId={wf.id} />}
        </div>
        <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#000', margin: 0 }}>
          {wf.description || 'No description'}
        </p>
      </div>
      <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#999', margin: '8px 0 0 0' }}>
        {wf.steps.length} Steps
      </p>
    </div>
  );
}

export default function WorkflowOverview() {
  const workflows = useAgentStore((s) => s.wizardWorkflows);
  const selectWorkflow = useAgentStore((s) => s.selectWorkflow);
  const showTemplateLibrary = useAgentStore((s) => s.showWorkflowTemplateLibrary);
  const setShowTemplateLibrary = useAgentStore((s) => s.setShowWorkflowTemplateLibrary);

  const { groups, ungrouped } = useMemo(() => groupWorkflows(workflows), [workflows]);
  const hasHierarchy = groups.length > 0;

  if (showTemplateLibrary) {
    return <WorkflowTemplateLibrary />;
  }

  let animIdx = 0;

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
            width: 40, height: 40, borderRadius: 8,
            backgroundColor: '#EAEEF9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 8,
          }}
        >
          <Icon path={mdiSwapHorizontal} size={1} color="#2858C4" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: '0 0 4px 0' }}>
            Your agent&apos;s playbook
          </p>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '24px', color: '#000', margin: 0 }}>
            {hasHierarchy
              ? 'Workflows are organized by hierarchy — primary workflows orchestrate sub-workflows that handle specific tasks.'
              : 'Each workflow handles a specific guest intent. Expand any workflow to see how it handles different scenarios.'}
          </p>
        </div>
      </div>

      {/* Hierarchical groups */}
      {groups.map((group) => {
        const primaryIdx = animIdx++;
        return (
          <div key={group.primary.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Primary tile — full-width with blue accent */}
            <div
              onClick={() => selectWorkflow(group.primary.id || null)}
              className="wf-tile"
              style={{
                backgroundColor: '#fff',
                border: '1px solid #E5E5E5',
                borderLeft: '4px solid #2858C4',
                borderRadius: 4,
                padding: '20px 24px',
                cursor: 'pointer',
                minHeight: 100,
                opacity: 0,
                animationName: 'wfTileFadeIn',
                animationDuration: '0.35s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'forwards',
                animationDelay: `${primaryIdx * 0.06}s`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 600, lineHeight: '16px',
                        color: '#2858C4', backgroundColor: '#EAEEF9',
                        borderRadius: 3, padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '0.02em',
                      }}
                    >
                      Primary
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 500, lineHeight: '22px', color: '#000', margin: '0 0 4px 0' }}>
                    {group.primary.name || 'Untitled Workflow'}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#000', margin: 0 }}>
                    {group.primary.description || 'No description'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 13, color: '#999' }}>{group.primary.steps.length} Steps</span>
                    {group.subs.length > 0 && (
                      <>
                        <span style={{ fontSize: 13, color: '#D5D5D5' }}>|</span>
                        <span style={{ fontSize: 13, color: '#2858C4', fontWeight: 500 }}>
                          Calls {group.subs.length} sub-workflow{group.subs.length !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {group.primary.id && <WorkflowMenu workflowId={group.primary.id} />}
              </div>
            </div>

            {/* Sub-workflow tiles — indented with left border */}
            {group.subs.length > 0 && (
              <div style={{ paddingLeft: 28, borderLeft: '2px solid #E5E5E5', marginLeft: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {group.subs.map((sub) => {
                    const subIdx = animIdx++;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => selectWorkflow(sub.id || null)}
                        className="wf-tile"
                        style={{
                          backgroundColor: '#fff',
                          border: '1px solid #E5E5E5',
                          borderRadius: 4,
                          padding: '16px 20px',
                          cursor: 'pointer',
                          minHeight: 100,
                          opacity: 0,
                          animationName: 'wfTileFadeIn',
                          animationDuration: '0.35s',
                          animationTimingFunction: 'ease-out',
                          animationFillMode: 'forwards',
                          animationDelay: `${subIdx * 0.06}s`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span
                            style={{
                              display: 'inline-block', fontSize: 11, fontWeight: 600, lineHeight: '16px',
                              color: '#666', backgroundColor: '#F5F5F5',
                              borderRadius: 3, padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '0.02em',
                            }}
                          >
                            Sub-workflow
                          </span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000', margin: '0 0 4px 0' }}>
                          {sub.name || 'Untitled Workflow'}
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: '#666', margin: 0 }}>
                          {sub.description || 'No description'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <span style={{ fontSize: 13, color: '#999' }}>{sub.steps.length} Steps</span>
                          <span style={{ fontSize: 13, color: '#D5D5D5' }}>|</span>
                          <span style={{ fontSize: 12, color: '#999' }}>Called by {group.primary.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Ungrouped workflows — standard 2-column grid */}
      {ungrouped.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {ungrouped.map((wf) => {
            const idx = animIdx++;
            return <WorkflowTile key={wf.id || wf.name} wf={wf} index={idx} onClick={() => selectWorkflow(wf.id || null)} />;
          })}
        </div>
      )}

      {/* Add Workflow card */}
      <div
        className="cap-add-card"
        onClick={() => setShowTemplateLibrary(true)}
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
          minHeight: 80,
          opacity: 0,
          animationName: 'wfTileFadeIn',
          animationDuration: '0.35s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
          animationDelay: `${animIdx * 0.06}s`,
        }}
      >
        <Icon path={mdiPlusCircleOutline} size={1} color="#2858C4" />
        <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#2858C4', margin: 0, textAlign: 'center' }}>
          Add Workflow
        </p>
      </div>
    </div>
  );
}
