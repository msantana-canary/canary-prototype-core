'use client';

/**
 * StepListItem
 *
 * Single step row in the flow's list. Order is determined by Canary
 * (for A/B testing / conversion optimization), not CS — no drag-handle.
 * Handles:
 * - Inline name edit
 * - Condition count indicator
 * - Skippable toggle
 * - Actions menu (delete, duplicate)
 * - Drill-in: schema-form/preset steps → StepEditorView,
 *   nested-flow steps → navigate to the referenced flow
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiArrowRight,
  mdiDelete,
  mdiContentCopy,
  mdiDotsHorizontal,
  mdiPencilOutline,
  mdiCheck,
  mdiClose,
  mdiLinkVariant,
} from '@mdi/js';
import {
  colors,
  CanaryButton,
  ButtonType,
  ButtonColor,
  ButtonSize,
  CanarySwitch,
} from '@canary-ui/components';

import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';
import { getStepTemplateMeta } from '@/lib/products/check-in-flows/step-templates';
import { useCheckInFlowsStore, useFlowById } from '@/lib/products/check-in-flows/store';

interface StepListItemProps {
  flow: FlowDefinition;
  step: StepInstance;
  isReadOnly: boolean;
}

export function StepListItem({ flow, step, isReadOnly }: StepListItemProps) {
  const template = getStepTemplateMeta(step.templateId);
  const removeStep = useCheckInFlowsStore((s) => s.removeStep);
  const updateStep = useCheckInFlowsStore((s) => s.updateStep);
  const goToStep = useCheckInFlowsStore((s) => s.goToStep);
  const goToFlow = useCheckInFlowsStore((s) => s.goToFlow);
  const nestedFlow = useFlowById(
    step.config.kind === 'nested-flow' ? step.config.nestedFlowId : null
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(step.name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const conditionCount = step.conditions?.length ?? 0;
  const isNestedFlow = step.kind === 'nested-flow';

  const handleOpenStep = () => {
    if (isNestedFlow && nestedFlow) {
      goToFlow(nestedFlow.id);
    } else {
      goToStep(flow.id, step.id);
    }
  };

  const saveName = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== step.name) {
      updateStep(flow.id, step.id, { name: trimmed });
    } else {
      setDraftName(step.name);
    }
    setIsEditingName(false);
  };

  return (
    <div
      className="group bg-white rounded-lg border border-[#E5E5E5] hover:border-[#BBB] transition-colors"
    >
      <div className="flex items-stretch">

        {/* Order number */}
        <div className="flex-shrink-0 w-10 flex items-center justify-center">
          <span className="text-[13px] font-bold text-[#888]">{step.order + 1}</span>
        </div>

        {/* Template icon */}
        <div className="flex-shrink-0 flex items-center pr-3">
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center ${
              isNestedFlow ? 'bg-[#F4F4F5]' : ''
            }`}
            style={
              !isNestedFlow
                ? { backgroundColor: colors.colorBlueDark5 }
                : undefined
            }
          >
            <Icon
              path={template.icon}
              size={0.8}
              color={isNestedFlow ? '#666' : colors.colorBlueDark1}
            />
          </div>
        </div>

        {/* Name + metadata */}
        <div
          className="flex-1 min-w-0 py-3 pr-3 cursor-pointer"
          onClick={() => {
            if (!isEditingName) handleOpenStep();
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveName();
                    if (e.key === 'Escape') { setDraftName(step.name); setIsEditingName(false); }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[14px] font-semibold text-[#2B2B2B] bg-white border border-[#BBB] rounded px-2 py-0.5 outline-none focus:border-[#2858C4]"
                />
                <button
                  className="text-[#2B2B2B] hover:bg-[#F4F4F5] p-1 rounded"
                  onClick={(e) => { e.stopPropagation(); saveName(); }}
                  title="Save"
                >
                  <Icon path={mdiCheck} size={0.7} />
                </button>
                <button
                  className="text-[#888] hover:bg-[#F4F4F5] p-1 rounded"
                  onClick={(e) => { e.stopPropagation(); setDraftName(step.name); setIsEditingName(false); }}
                  title="Cancel"
                >
                  <Icon path={mdiClose} size={0.7} />
                </button>
              </div>
            ) : (
              <>
                <span className="text-[14px] font-semibold text-[#2B2B2B]">{step.name}</span>
                {!isReadOnly && (
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#BBB] hover:text-[#666]"
                    onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }}
                    title="Rename"
                  >
                    <Icon path={mdiPencilOutline} size={0.65} />
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#888]">
            <span className="uppercase tracking-wider font-semibold">
              {template.displayName}
            </span>
            <span className="text-[#CCC]">·</span>
            <span className="capitalize">{step.kind.replace('-', ' ')}</span>
            {conditionCount > 0 && (
              <>
                <span className="text-[#CCC]">·</span>
                <span
                  className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: colors.colorBlueDark5, color: colors.colorBlueDark1 }}
                >
                  {conditionCount} condition{conditionCount === 1 ? '' : 's'}
                </span>
              </>
            )}
            {isNestedFlow && nestedFlow && (
              <>
                <span className="text-[#CCC]">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#555]">
                  <Icon path={mdiLinkVariant} size={0.55} />
                  {nestedFlow.name}
                </span>
              </>
            )}
            {step.isSkippable && (
              <>
                <span className="text-[#CCC]">·</span>
                <span className="text-[#888] italic">skippable</span>
              </>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex-shrink-0 flex items-center gap-2 pr-3">
          {/* Skippable toggle */}
          <div className="flex items-center gap-2 pr-2 border-r border-[#EEE] h-9">
            <label
              className={`text-[11px] text-[#666] ${isReadOnly ? 'opacity-50' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              Skippable
            </label>
            <div onClick={(e) => e.stopPropagation()}>
              <CanarySwitch
                checked={step.isSkippable}
                onChange={(val) => !isReadOnly && updateStep(flow.id, step.id, { isSkippable: val })}
                isDisabled={isReadOnly}
              />
            </div>
          </div>

          {/* Actions menu */}
          {!isReadOnly && (
            <div className="relative">
              <button
                className="w-8 h-8 rounded hover:bg-[#F4F4F5] flex items-center justify-center text-[#888] hover:text-[#2B2B2B]"
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen((o) => !o); }}
                title="More actions"
              >
                <Icon path={mdiDotsHorizontal} size={0.75} />
              </button>
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-[#E5E5E5] shadow-md z-30 min-w-[160px] py-1">
                    <button
                      className="w-full px-3 py-1.5 text-[13px] text-left text-[#666] hover:bg-[#F4F4F5] flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
                        // TODO: duplicate handler in phase 12
                      }}
                    >
                      <Icon path={mdiContentCopy} size={0.6} />
                      Duplicate
                    </button>
                    <button
                      className="w-full px-3 py-1.5 text-[13px] text-left text-[#D00] hover:bg-[#FDECEF] flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
                        removeStep(flow.id, step.id);
                      }}
                    >
                      <Icon path={mdiDelete} size={0.6} />
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Open arrow */}
          <button
            className="w-8 h-8 rounded hover:bg-[#F4F4F5] flex items-center justify-center text-[#888] hover:text-[#2B2B2B]"
            onClick={(e) => { e.stopPropagation(); handleOpenStep(); }}
            title={isNestedFlow ? 'Open nested flow' : 'Edit step'}
          >
            <Icon path={mdiArrowRight} size={0.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
