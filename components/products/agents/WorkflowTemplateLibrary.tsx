'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiSwapHorizontal,
  mdiChevronDown,
  mdiChevronUp,
  mdiPlusCircleOutline,
  mdiBookOpenVariant,
  mdiStarOutline,
} from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import { workflowTemplates, WORKFLOW_TEMPLATE_CATEGORIES } from '@/lib/products/agents/workflow-templates';
import type { WorkflowTemplate, TeamWorkflowTemplate, WorkflowTemplateCategory } from '@/lib/products/agents/types';

const CATEGORY_COLORS: Record<WorkflowTemplateCategory, string> = {
  'sales-events': '#7C3AED',
  'guest-engagement': '#0891B2',
  'front-desk': '#2858C4',
  'check-in-checkout': '#059669',
  'operations': '#D97706',
};

const CATEGORY_LABELS: Record<WorkflowTemplateCategory, string> = {
  'sales-events': 'Sales & Events',
  'guest-engagement': 'Guest Engagement',
  'front-desk': 'Front Desk',
  'check-in-checkout': 'Check-in & Checkout',
  'operations': 'Operations',
};

function TemplateCard({ template, index }: { template: WorkflowTemplate | TeamWorkflowTemplate; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const addWorkflowFromTemplate = useAgentStore((s) => s.addWorkflowFromTemplate);
  const team = isTeamTemplate(template);
  const catColor = CATEGORY_COLORS[template.category];

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #E5E5E5',
        borderRadius: 4,
        overflow: 'hidden',
        opacity: 0,
        animationName: 'wftCardFadeIn',
        animationDuration: '0.3s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards',
        animationDelay: `${index * 0.04}s`,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#C9D5F0';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(40, 88, 196, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E5E5';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ padding: '16px 20px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badge — team attribution or category */}
            {team ? (
              <span
                style={{
                  display: 'inline-block', fontSize: 11, fontWeight: 600, lineHeight: '16px',
                  color: '#6D28D9', backgroundColor: '#F3EAFF',
                  borderRadius: 3, padding: '1px 6px', marginBottom: 6, letterSpacing: '0.02em',
                }}
              >
                Shared by {template.sharedBy}
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-block', fontSize: 11, fontWeight: 600, lineHeight: '16px',
                  color: catColor, backgroundColor: `${catColor}14`,
                  borderRadius: 3, padding: '1px 6px', marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: '0.02em',
                }}
              >
                {CATEGORY_LABELS[template.category]}
              </span>
            )}
            <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000', margin: 0 }}>
              {template.name}
            </p>
            <p style={{ fontSize: 13, fontWeight: 400, lineHeight: '20px', color: '#666', margin: '4px 0 0 0' }}>
              {template.description}
            </p>
          </div>
          <CanaryButton
            type={ButtonType.PRIMARY}
            size={ButtonSize.COMPACT}
            onClick={() => addWorkflowFromTemplate(template)}
          >
            Use
          </CanaryButton>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <span style={{ fontSize: 12, color: '#999' }}>
            {template.steps.length} steps
          </span>
          <span style={{ fontSize: 12, color: '#D5D5D5' }}>|</span>
          <span style={{ fontSize: 12, color: '#999' }}>
            {template.guardrails.length} guardrails
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 500,
              color: colors.colorBlueDark1,
              padding: 0,
            }}
          >
            {expanded ? 'Hide' : 'Preview'}
            <Icon path={expanded ? mdiChevronUp : mdiChevronDown} size={0.6} color={colors.colorBlueDark1} />
          </button>
        </div>
      </div>

      {/* Expandable preview */}
      {expanded && (
        <div style={{ borderTop: '1px solid #F0F0F0', padding: '12px 20px 16px', backgroundColor: '#FAFAFA' }}>
          {/* Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: colors.colorBlueDark1, flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.colorBlueDark1 }}>
              Trigger:
            </span>
            <span style={{ fontSize: 12, color: '#333' }}>
              {template.trigger}
            </span>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 3 }}>
            {template.steps.map((step, i) => (
              <div key={step.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 14 }}>
                  {i > 0 && (
                    <div style={{ width: 1, height: 6, backgroundColor: '#D5D5D5' }} />
                  )}
                  <div
                    style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: step.type === 'handoff' ? '#D97706' : step.type === 'response' ? '#059669' : '#666',
                      marginTop: i === 0 ? 5 : 0,
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>
                    {step.label}
                  </span>
                  {step.conditions && step.conditions.length > 0 && (
                    <span style={{ fontSize: 11, color: '#999', marginLeft: 6 }}>
                      ({step.conditions.length} condition{step.conditions.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Guardrails */}
          {template.guardrails.length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #EBEBEB' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Guardrails
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                {template.guardrails.map((g, i) => (
                  <p key={i} style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: '18px' }}>
                    {g}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function isTeamTemplate(t: WorkflowTemplate | TeamWorkflowTemplate): t is TeamWorkflowTemplate {
  return 'source' in t && t.source === 'team';
}

export default function WorkflowTemplateLibrary() {
  const filter = useAgentStore((s) => s.workflowTemplateFilter);
  const setFilter = useAgentStore((s) => s.setWorkflowTemplateFilter);
  const setShowLibrary = useAgentStore((s) => s.setShowWorkflowTemplateLibrary);
  const createNewWorkflow = useAgentStore((s) => s.createNewWorkflow);
  const teamTemplates = useAgentStore((s) => s.teamTemplates);
  const agents = useAgentStore((s) => s.agents);
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const agent = selectedAgentId ? agents.find((a) => a.id === selectedAgentId) : null;
  const isManualMode = agent && !agent.templateId;

  const handleStartFromScratch = () => {
    if (isManualMode) {
      const wfId = `wf-${Date.now()}`;
      const newWf = {
        id: wfId,
        name: '',
        description: '',
        trigger: '',
        steps: [{ id: `step-${Date.now()}`, type: 'action' as const, label: '', description: '' }],
        guardrails: [],
      };
      useAgentStore.getState().addWorkflow(newWf);
      useAgentStore.getState().selectWorkflow(wfId);
    } else {
      createNewWorkflow();
    }
    setShowLibrary(false);
  };

  const allBuiltIn = workflowTemplates;
  const allTeam = teamTemplates;

  const filtered: (WorkflowTemplate | TeamWorkflowTemplate)[] = filter === 'all'
    ? [...allBuiltIn, ...allTeam]
    : filter === 'team'
      ? allTeam
      : allBuiltIn.filter((t) => t.category === filter);

  const sorted = [...filtered].sort((a, b) => b.popularity - a.popularity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes wftCardFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wft-tab { transition: color 0.15s ease, border-color 0.15s ease; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <CanaryButton
          type={ButtonType.ICON_SECONDARY}
          size={ButtonSize.COMPACT}
          onClick={() => setShowLibrary(false)}
          icon={<Icon path={mdiArrowLeft} size={0.75} />}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 8,
                backgroundColor: '#EAEEF9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Icon path={mdiBookOpenVariant} size={0.85} color={colors.colorBlueDark1} />
            </div>
            <p style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: 0 }}>
              Workflow Template Library
            </p>
          </div>
          <p style={{ fontSize: 14, fontWeight: 400, lineHeight: '22px', color: '#666', margin: 0 }}>
            Pre-built workflows you can add to your agent and customize. Pick a template or start from scratch.
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E5E5' }}>
        {WORKFLOW_TEMPLATE_CATEGORIES.map((cat) => {
          const isActive = filter === cat.id;
          const count = cat.id === 'all'
            ? allBuiltIn.length + allTeam.length
            : cat.id === 'team'
              ? allTeam.length
              : allBuiltIn.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              className="wft-tab"
              onClick={() => setFilter(cat.id as WorkflowTemplateCategory | 'all' | 'team')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: isActive ? `2px solid ${colors.colorBlueDark1}` : '2px solid transparent',
                cursor: 'pointer',
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? colors.colorBlueDark1 : '#666',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
              <span style={{ marginLeft: 4, fontSize: 11, color: isActive ? colors.colorBlueDark1 : '#999' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Template list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Start from scratch card */}
        <div
          onClick={handleStartFromScratch}
          style={{
            border: '1px dashed #93ABE1',
            borderRadius: 4,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8F9FD'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Icon path={mdiPlusCircleOutline} size={0.85} color={colors.colorBlueDark1} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: colors.colorBlueDark1, margin: 0 }}>
              Start from Scratch
            </p>
            <p style={{ fontSize: 12, color: '#999', margin: '2px 0 0 0' }}>
              Build a custom workflow with a blank canvas
            </p>
          </div>
        </div>

        {/* Template cards */}
        {sorted.map((template, i) => (
          <TemplateCard key={template.id} template={template} index={i} />
        ))}
      </div>
    </div>
  );
}
