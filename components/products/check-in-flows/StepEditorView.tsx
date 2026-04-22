'use client';

/**
 * StepEditorView
 *
 * Drill-down page for editing a single step. Three-tab shell:
 * - Configuration — step-type-specific editor (Phase 4/5/6)
 * - Conditions — step-level show/hide logic (Phase 7)
 * - Preview — live PhoneFrame render (Phase 8)
 *
 * Tab content is dispatched to per-step-type components so each
 * template gets a tailored editor without bloating one big component.
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiDelete,
  mdiPencilOutline,
  mdiCheck,
  mdiClose,
  mdiTuneVariant,
  mdiGestureTapButton,
  mdiCellphone,
} from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonColor,
  ButtonSize,
  IconPosition,
  CanarySwitch,
  colors,
} from '@canary-ui/components';

import {
  useCheckInFlowsStore,
  useFlowById,
  useStepById,
} from '@/lib/products/check-in-flows/store';
import { getStepTemplateMeta } from '@/lib/products/check-in-flows/step-templates';
import { ConfigurationTab } from './editors/ConfigurationTab';
import { ConditionsTab } from './editors/ConditionsTab';
import { PreviewTab } from './editors/PreviewTab';

type EditorTab = 'configuration' | 'conditions' | 'preview';

export function StepEditorView() {
  const nav = useCheckInFlowsStore((s) => s.nav);
  const setEditorTab = useCheckInFlowsStore((s) => s.setEditorTab);
  const step = useStepById(nav.flowId, nav.stepId);
  const flow = useFlowById(nav.flowId);
  const goToFlow = useCheckInFlowsStore((s) => s.goToFlow);
  const goToLanding = useCheckInFlowsStore((s) => s.goToLanding);
  const removeStep = useCheckInFlowsStore((s) => s.removeStep);
  const updateStep = useCheckInFlowsStore((s) => s.updateStep);
  const role = useCheckInFlowsStore((s) => s.role);

  const isReadOnly = role === 'hotel';
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(step?.name ?? '');

  if (!step || !flow) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <p className="text-[14px] text-[#888] mb-3">Step not found.</p>
          <CanaryButton type={ButtonType.OUTLINED} size={ButtonSize.NORMAL} onClick={goToLanding}>
            Back to landing
          </CanaryButton>
        </div>
      </div>
    );
  }

  const template = getStepTemplateMeta(step.templateId);
  const activeTab = nav.editorTab;
  const conditionCount = step.conditions?.length ?? 0;

  const saveName = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== step.name) updateStep(flow.id, step.id, { name: trimmed });
    else setDraftName(step.name);
    setIsEditingName(false);
  };

  const handleDelete = () => {
    if (confirm(`Remove "${step.name}" from this flow?`)) {
      removeStep(flow.id, step.id);
      goToFlow(flow.id);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Step header */}
      <div className="bg-white border-b border-[#E5E5E5] px-8 pt-5 pb-0">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <button
                className="mt-1 w-9 h-9 rounded-md flex items-center justify-center hover:bg-[#F4F4F5] text-[#666] hover:text-[#2B2B2B] shrink-0"
                onClick={() => goToFlow(flow.id)}
                title="Back to flow"
              >
                <Icon path={mdiArrowLeft} size={0.8} />
              </button>

              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: colors.colorBlueDark5 }}
              >
                <Icon path={template.icon} size={1} color={colors.colorBlueDark1} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
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
                        className="text-[22px] font-bold text-[#2B2B2B] bg-white border-b-2 border-[#2858C4] px-1 py-0 outline-none"
                      />
                      <button onClick={saveName} className="p-1 rounded hover:bg-[#F4F4F5] text-[#2B2B2B]">
                        <Icon path={mdiCheck} size={0.7} />
                      </button>
                      <button onClick={() => { setDraftName(step.name); setIsEditingName(false); }} className="p-1 rounded hover:bg-[#F4F4F5] text-[#888]">
                        <Icon path={mdiClose} size={0.7} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-[22px] font-bold text-[#2B2B2B] leading-tight">{step.name}</h1>
                      {!isReadOnly && (
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#BBB] hover:text-[#666]"
                          onClick={() => setIsEditingName(true)}
                          title="Rename"
                        >
                          <Icon path={mdiPencilOutline} size={0.7} />
                        </button>
                      )}
                    </>
                  )}
                </div>
                <p className="text-[13px] text-[#666] mt-0.5">
                  {template.displayName} · {template.description}
                </p>
              </div>
            </div>

            {/* Right-side actions */}
            {!isReadOnly && (
              <div className="flex items-center gap-2 shrink-0">
                <label className="flex items-center gap-2 text-[12px] text-[#666] pr-2">
                  Skippable
                  <CanarySwitch
                    checked={step.isSkippable}
                    onChange={(val) => updateStep(flow.id, step.id, { isSkippable: val })}
                  />
                </label>
                <CanaryButton
                  type={ButtonType.OUTLINED}
                  size={ButtonSize.NORMAL}
                  color={ButtonColor.DANGER}
                  icon={<Icon path={mdiDelete} size={0.65} />}
                  iconPosition={IconPosition.LEFT}
                  onClick={handleDelete}
                >
                  Remove step
                </CanaryButton>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 -mb-px">
            <TabButton
              label="Configuration"
              icon={mdiTuneVariant}
              active={activeTab === 'configuration'}
              onClick={() => setEditorTab('configuration')}
            />
            <TabButton
              label="Conditions"
              icon={mdiGestureTapButton}
              badge={conditionCount > 0 ? String(conditionCount) : undefined}
              active={activeTab === 'conditions'}
              onClick={() => setEditorTab('conditions')}
            />
            <TabButton
              label="Live Preview"
              icon={mdiCellphone}
              active={activeTab === 'preview'}
              onClick={() => setEditorTab('preview')}
            />
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'configuration' && (
          <ConfigurationTab step={step} flow={flow} isReadOnly={isReadOnly} />
        )}
        {activeTab === 'conditions' && (
          <ConditionsTab step={step} flow={flow} isReadOnly={isReadOnly} />
        )}
        {activeTab === 'preview' && (
          <PreviewTab step={step} flow={flow} />
        )}
      </div>
    </div>
  );
}

// ── Internal tab button ──────────────────────────────────

function TabButton({
  label,
  icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold rounded-t-md border-b-2 transition-colors ${
        active
          ? 'text-[#2858C4] border-[#2858C4] bg-white'
          : 'text-[#666] border-transparent hover:text-[#2B2B2B] hover:bg-[#F4F4F5]'
      }`}
      style={active ? { color: colors.colorBlueDark1, borderBottomColor: colors.colorBlueDark1 } : undefined}
    >
      <Icon path={icon} size={0.65} />
      {label}
      {badge && (
        <span
          className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: colors.colorBlueDark1, color: '#FFF' }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
