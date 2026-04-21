'use client';

/**
 * WorkflowVisualizer — Linear step list matching Figma node 101-14005.
 *
 * Two modes controlled by the `editable` prop:
 * - Read-only (default): Cards with dashed connectors, change detection highlights.
 * - Editable (Advanced Builder): Inline inputs for trigger/step fields,
 *   conditions textarea, delete buttons, "+ Add Step" at bottom.
 *
 * The trigger card is always present and NOT deletable (immutable first step).
 * Step renumbering is automatic from array index.
 */

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiFlashOutline, mdiDeleteOutline, mdiPlusCircleOutline } from '@mdi/js';
import { CanaryButton, CanaryInput, CanaryTextArea, ButtonType, ButtonSize, InputSize } from '@canary-ui/components';
import type { AgentWorkflow, WorkflowStep, StepCondition } from '@/lib/products/agents/types';

interface WorkflowVisualizerProps {
  workflow: AgentWorkflow | null;
  isAnimating?: boolean;
  /** Enable inline editing (Advanced Builder mode) */
  editable?: boolean;
  /** Called on every change when editable */
  onChange?: (workflow: AgentWorkflow) => void;
}

interface ChangeSet {
  newStepIds: Set<string>;
  modifiedStepIds: Set<string>;
  newConditionIds: Set<string>;
}

function detectChanges(prev: AgentWorkflow | null, next: AgentWorkflow | null): ChangeSet {
  const newStepIds = new Set<string>();
  const modifiedStepIds = new Set<string>();
  const newConditionIds = new Set<string>();

  if (!prev || !next) return { newStepIds, modifiedStepIds, newConditionIds };

  const prevStepMap = new Map(prev.steps.map((s) => [s.id, s]));

  for (const step of next.steps) {
    const prevStep = prevStepMap.get(step.id);
    if (!prevStep) {
      newStepIds.add(step.id);
      step.conditions?.forEach((c) => newConditionIds.add(c.id));
    } else {
      const descChanged = prevStep.description !== step.description;
      const labelChanged = prevStep.label !== step.label;

      const prevCondIds = new Set(prevStep.conditions?.map((c) => c.id) || []);
      const newConds = step.conditions?.filter((c) => !prevCondIds.has(c.id)) || [];
      newConds.forEach((c) => newConditionIds.add(c.id));

      const prevCondMap = new Map((prevStep.conditions || []).map((c) => [c.id, c]));
      const modifiedConds = (step.conditions || []).filter((c) => {
        const pc = prevCondMap.get(c.id);
        return pc && (pc.condition !== c.condition || pc.action !== c.action);
      });
      modifiedConds.forEach((c) => newConditionIds.add(c.id));

      if (descChanged || labelChanged || newConds.length > 0 || modifiedConds.length > 0) {
        modifiedStepIds.add(step.id);
      }
    }
  }

  return { newStepIds, modifiedStepIds, newConditionIds };
}

// ---------------------------------------------------------------------------
// Helpers for conditions ↔ textarea conversion
// ---------------------------------------------------------------------------

function conditionsToText(conditions?: StepCondition[]): string {
  if (!conditions || conditions.length === 0) return '';
  return conditions
    .map((c) => (c.action ? `${c.condition} \u2192 ${c.action}` : c.condition))
    .join('\n');
}

function textToConditions(text: string): StepCondition[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const arrowIdx = line.indexOf('\u2192');
      if (arrowIdx !== -1) {
        return {
          id: `cond-m-${Date.now()}-${i}`,
          condition: line.slice(0, arrowIdx).trim(),
          action: line.slice(arrowIdx + 1).trim(),
        };
      }
      return { id: `cond-m-${Date.now()}-${i}`, condition: line, action: '' };
    });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WorkflowVisualizer({
  workflow,
  isAnimating,
  editable,
  onChange,
}: WorkflowVisualizerProps) {
  const prevWorkflowRef = useRef<AgentWorkflow | null>(null);
  const [changes, setChanges] = useState<ChangeSet>({
    newStepIds: new Set(),
    modifiedStepIds: new Set(),
    newConditionIds: new Set(),
  });
  const [typingIds, setTypingIds] = useState<Set<string>>(new Set());
  // Track which step is pending delete confirmation (deployed agents only)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!workflow || !prevWorkflowRef.current || editable) {
      prevWorkflowRef.current = workflow;
      return;
    }

    const detected = detectChanges(prevWorkflowRef.current, workflow);
    const hasChanges =
      detected.newStepIds.size > 0 ||
      detected.modifiedStepIds.size > 0 ||
      detected.newConditionIds.size > 0;

    if (hasChanges) {
      setChanges(detected);
      const allTyping = new Set([
        ...detected.newStepIds,
        ...detected.modifiedStepIds,
        ...detected.newConditionIds,
      ]);
      setTypingIds(allTyping);
      setTimeout(() => {
        setChanges({ newStepIds: new Set(), modifiedStepIds: new Set(), newConditionIds: new Set() });
      }, 3000);
      setTimeout(() => setTypingIds(new Set()), 2000);
    }

    prevWorkflowRef.current = workflow;
  }, [workflow, editable]);

  // ---------- Mutation helpers (only used in editable mode) ----------

  const emit = (patch: Partial<AgentWorkflow>) => {
    if (!workflow || !onChange) return;
    onChange({ ...workflow, ...patch });
  };

  const updateStep = (stepId: string, patch: Partial<WorkflowStep>) => {
    if (!workflow) return;
    emit({
      steps: workflow.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
    });
  };

  const deleteStep = (stepId: string) => {
    if (!workflow) return;
    emit({ steps: workflow.steps.filter((s) => s.id !== stepId) });
    setConfirmDeleteId(null);
  };

  const addStep = () => {
    if (!workflow) return;
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: 'action',
      label: '',
      description: '',
    };
    emit({ steps: [...workflow.steps, newStep] });
  };

  // ---------- Empty state ----------

  if (!editable && (!workflow || (!workflow.trigger && workflow.steps.length === 0))) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          padding: 32,
          border: '2px dashed #93ABE1',
          borderRadius: 4,
          color: '#666',
          fontSize: 14,
        }}
      >
        Describe what your agent should do and the workflow will appear here.
      </div>
    );
  }

  // For editable mode with no workflow, create a shell
  const wf: AgentWorkflow = workflow ?? {
    id: `wf-${Date.now()}`,
    trigger: '',
    steps: [],
    guardrails: [],
  };

  const isStepHighlighted = (id: string) => changes.newStepIds.has(id) || changes.modifiedStepIds.has(id);
  const isCondHighlighted = (id: string) => changes.newConditionIds.has(id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        @keyframes wfFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wfHighlight {
          0% { box-shadow: 0 0 12px rgba(40, 88, 196, 0.35); }
          70% { box-shadow: 0 0 12px rgba(40, 88, 196, 0.35); }
          100% { box-shadow: 0 0 0px rgba(40, 88, 196, 0); }
        }
        @keyframes wfTypeIn {
          from { max-height: 0; opacity: 0; }
          to { max-height: 200px; opacity: 1; }
        }
        .wf-step-card {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>

      {/* ===================== TRIGGER CARD ===================== */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#EAEEF9',
          border: '1px solid #2858C4',
          borderRadius: 4,
          padding: 16,
          display: 'flex',
          alignItems: editable ? 'flex-start' : 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 8,
          }}
        >
          <Icon path={mdiFlashOutline} size={1} color="#2858C4" />
        </div>

        {editable ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CanaryInput
              size={InputSize.NORMAL}
              value={wf.trigger}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => emit({ trigger: e.target.value })}
              placeholder="Trigger name (e.g. Inbound Call Received)"
              label="Trigger"
            />
            <CanaryInput
              size={InputSize.NORMAL}
              value={wf.triggerDescription || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => emit({ triggerDescription: e.target.value })}
              placeholder="Trigger description (optional)"
            />
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#2858C4', margin: 0 }}>
              Trigger: {wf.trigger}
            </p>
            {wf.triggerDescription && (
              <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#2858C4', margin: 0 }}>
                {wf.triggerDescription}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Connector: trigger → first step */}
      {(wf.steps.length > 0 || editable) && (
        <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 24, borderLeft: '1px dashed #93ABE1' }} />
        </div>
      )}

      {/* ===================== STEP CARDS ===================== */}
      {wf.steps.map((step, i) => {
        const stepHighlighted = isStepHighlighted(step.id);
        const isNewStep = changes.newStepIds.has(step.id);
        const isPendingDelete = confirmDeleteId === step.id;

        return (
          <React.Fragment key={step.id}>
            <div
              className="wf-step-card"
              style={{
                width: '100%',
                backgroundColor: '#fff',
                border: stepHighlighted ? '1px solid #2858C4' : '1px solid #E5E5E5',
                borderRadius: 4,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative',
                opacity: isAnimating ? 0 : 1,
                animationName: isAnimating
                  ? 'wfFadeIn'
                  : isNewStep
                    ? 'wfFadeIn, wfHighlight'
                    : stepHighlighted
                      ? 'wfHighlight'
                      : undefined,
                animationDuration: isAnimating
                  ? '0.4s'
                  : isNewStep
                    ? '0.4s, 3s'
                    : stepHighlighted
                      ? '3s'
                      : undefined,
                animationTimingFunction: 'ease-out',
                animationFillMode: isAnimating ? 'forwards' : undefined,
                animationDelay: isAnimating ? `${i * 0.12}s` : undefined,
                transition: 'border-color 0.3s ease',
              }}
            >
              {/* ---------- Editable mode ---------- */}
              {editable ? (
                <>
                  {/* Header: "Step N" title + trash button (KBSection pattern) */}
                  <div className="flex items-start justify-between">
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 500, color: '#000', margin: 0 }}>
                        Step {i + 1}
                      </h4>
                    </div>
                    <CanaryButton
                      type={ButtonType.ICON_SECONDARY}
                      size={ButtonSize.COMPACT}
                      icon={<Icon path={mdiDeleteOutline} size={0.75} color="#2858C4" />}
                      onClick={() => {
                        if (isPendingDelete) {
                          deleteStep(step.id);
                        } else {
                          setConfirmDeleteId(step.id);
                        }
                      }}
                    />
                  </div>

                  {/* Step name */}
                  <CanaryInput
                    size={InputSize.NORMAL}
                    value={step.label}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(step.id, { label: e.target.value })}
                    placeholder="Step name"
                    label="Step name"
                  />

                  {/* Delete confirmation (for deployed agents) */}
                  {isPendingDelete && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        backgroundColor: '#FFF5F5',
                        border: '1px solid #FECACA',
                        borderRadius: 4,
                        fontSize: 13,
                        color: '#CC3340',
                      }}
                    >
                      <span style={{ flex: 1 }}>Delete this step?</span>
                      <button
                        onClick={() => deleteStep(step.id)}
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#CC3340',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 8px',
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#666',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 8px',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Description */}
                  <CanaryInput
                    size={InputSize.NORMAL}
                    value={step.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(step.id, { description: e.target.value })}
                    placeholder="Describe what happens in this step..."
                    label="Description"
                  />

                  {/* Conditions */}
                  <div
                    style={{
                      backgroundColor: '#FAFAFA',
                      border: '1px solid #E5E5E5',
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <CanaryTextArea
                      label="Conditions (optional)"
                      value={conditionsToText(step.conditions)}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const conditions = e.target.value.trim()
                          ? textToConditions(e.target.value)
                          : undefined;
                        updateStep(step.id, { conditions });
                      }}
                      placeholder="One condition per line (e.g. If guest identified → Use personalized greeting)"
                      rows={2}
                    />
                  </div>
                </>
              ) : (
                /* ---------- Read-only mode ---------- */
                <>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000', margin: 0 }}>
                      Step {i + 1}: {step.label}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#000', margin: 0 }}>
                      {step.description}
                    </p>
                  </div>

                  {/* Conditions box (read-only) */}
                  {step.conditions && step.conditions.length > 0 && (() => {
                    const hasChangedConds = step.conditions.some((c) => isCondHighlighted(c.id));
                    return (
                      <div
                        style={{
                          backgroundColor: '#FAFAFA',
                          border: hasChangedConds ? '1px solid #2858C4' : '1px solid #93ABE1',
                          borderRadius: 8,
                          padding: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          overflow: 'hidden',
                          animationName: hasChangedConds ? 'wfHighlight' : undefined,
                          animationDuration: hasChangedConds ? '3s' : undefined,
                          animationTimingFunction: 'ease-out',
                          transition: 'border-color 0.3s ease',
                        }}
                      >
                        <p style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.5, color: '#000', margin: 0 }}>
                          Conditions
                        </p>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'disc' }}>
                          {step.conditions.map((cond) => (
                            <li
                              key={cond.id}
                              style={{
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: 1.5,
                                color: '#000',
                                marginLeft: 21,
                                marginBottom: 0,
                              }}
                            >
                              {cond.condition} → {cond.action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Dashed connector between cards */}
            {i < wf.steps.length - 1 && (
              <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 0, height: 24, borderLeft: '1px dashed #93ABE1' }} />
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* ===================== ADD STEP BUTTON ===================== */}
      {editable && (
        <>
          {wf.steps.length > 0 && (
            <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 24, borderLeft: '1px dashed #93ABE1' }} />
            </div>
          )}
          <button
            onClick={addStep}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 16,
              border: '1px dashed #93ABE1',
              borderRadius: 4,
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              color: '#2858C4',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EAEEF9';
              e.currentTarget.style.borderColor = '#2858C4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#93ABE1';
            }}
          >
            <Icon path={mdiPlusCircleOutline} size={0.83} color="#2858C4" />
            Add Step
          </button>
        </>
      )}
    </div>
  );
}
