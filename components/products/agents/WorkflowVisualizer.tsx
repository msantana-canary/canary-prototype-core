'use client';

/**
 * WorkflowVisualizer — Linear step list matching Figma node 101-14005.
 *
 * Cards with 16px padding, dashed connectors between them.
 * Conditions box: #FAFAFA bg, #93ABE1 border, 8px radius, "Conditions" as plain 12px text.
 *
 * Change detection: compares current workflow against previous to highlight
 * new/modified steps and conditions with a blue glow + typing effect.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { AgentWorkflow, WorkflowStep, StepCondition } from '@/lib/products/agents/types';

interface WorkflowVisualizerProps {
  workflow: AgentWorkflow | null;
  isAnimating?: boolean;
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
      // Entirely new step
      newStepIds.add(step.id);
      step.conditions?.forEach((c) => newConditionIds.add(c.id));
    } else {
      // Check if step was modified
      const descChanged = prevStep.description !== step.description;
      const labelChanged = prevStep.label !== step.label;

      // Check conditions
      const prevCondIds = new Set(prevStep.conditions?.map((c) => c.id) || []);
      const newConds = step.conditions?.filter((c) => !prevCondIds.has(c.id)) || [];
      newConds.forEach((c) => newConditionIds.add(c.id));

      // Check if existing conditions were modified
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

export default function WorkflowVisualizer({ workflow, isAnimating }: WorkflowVisualizerProps) {
  const prevWorkflowRef = useRef<AgentWorkflow | null>(null);
  const [changes, setChanges] = useState<ChangeSet>({ newStepIds: new Set(), modifiedStepIds: new Set(), newConditionIds: new Set() });
  const [typingIds, setTypingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!workflow || !prevWorkflowRef.current) {
      prevWorkflowRef.current = workflow;
      return;
    }

    const detected = detectChanges(prevWorkflowRef.current, workflow);
    const hasChanges = detected.newStepIds.size > 0 || detected.modifiedStepIds.size > 0 || detected.newConditionIds.size > 0;

    if (hasChanges) {
      setChanges(detected);
      // Set typing state for new/modified items
      const allTyping = new Set([...detected.newStepIds, ...detected.modifiedStepIds, ...detected.newConditionIds]);
      setTypingIds(allTyping);

      // Clear highlight after 3 seconds
      setTimeout(() => {
        setChanges({ newStepIds: new Set(), modifiedStepIds: new Set(), newConditionIds: new Set() });
      }, 3000);

      // Clear typing after text would have finished
      setTimeout(() => {
        setTypingIds(new Set());
      }, 2000);
    }

    prevWorkflowRef.current = workflow;
  }, [workflow]);

  if (!workflow || (!workflow.trigger && workflow.steps.length === 0)) {
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
      `}</style>

      {workflow.steps.map((step, i) => {
        const stepHighlighted = isStepHighlighted(step.id);
        const isNewStep = changes.newStepIds.has(step.id);

        return (
          <React.Fragment key={step.id}>
            {/* Step card */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#fff',
                border: stepHighlighted ? '1px solid #2858C4' : '1px solid #E5E5E5',
                borderRadius: 4,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: step.conditions && step.conditions.length > 0 ? 8 : 0,
                opacity: isAnimating ? 0 : 1,
                animation: isAnimating
                  ? 'wfFadeIn 0.4s ease-out forwards'
                  : isNewStep
                    ? 'wfFadeIn 0.4s ease-out, wfHighlight 3s ease-out'
                    : stepHighlighted
                      ? 'wfHighlight 3s ease-out'
                      : undefined,
                animationDelay: isAnimating ? `${i * 0.12}s` : undefined,
                transition: 'border-color 0.3s ease',
              }}
            >
              {/* Title + description */}
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000', margin: 0 }}>
                  Step {i + 1}: {step.label}
                </p>
                <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#000', margin: 0 }}>
                  {step.description}
                </p>
              </div>

              {/* Conditions box */}
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
                    animation: hasChangedConds ? 'wfHighlight 3s ease-out' : undefined,
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
            </div>

            {/* Dashed connector between cards */}
            {i < workflow.steps.length - 1 && (
              <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    width: 0,
                    height: 24,
                    borderLeft: '1px dashed #93ABE1',
                  }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
