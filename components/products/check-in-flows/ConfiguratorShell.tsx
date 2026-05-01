'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronRight,
  mdiArrowLeft,
  mdiWeb,
  mdiCellphone,
  mdiTabletCellphone,
  mdiMonitor,
  mdiApplicationOutline,
  mdiPencilOutline,
  mdiPlus,
  mdiDelete,
  mdiCheck,
  mdiClose,
} from '@mdi/js';
import {
  colors,
  CanaryTabs,
  CanaryCard,
  CanarySwitch,
  CanaryTextArea,
  InputSize,
} from '@canary-ui/components';

import {
  useCheckInFlowsStore,
  useFlowById,
  useStepById,
  useGeneratedFlows,
} from '@/lib/products/check-in-flows/store';
import type {
  FlowDefinition,
  StepInstance,
  Condition,
  SchemaFormConfig,
} from '@/lib/products/check-in-flows/types';
import { getStepTemplateMeta } from '@/lib/products/check-in-flows/step-templates';
import { CheckInConfigPage } from './CheckInConfigPage';
import { PhoneFrame } from '@/components/core/PhoneFrame';
import { StepRenderer } from './preview/StepRenderer';
import { PreviewContextSelector } from './preview/PreviewContextSelector';
import { ConditionRuleEditor } from './editors/ConditionRuleEditor';
import { SchemaFormEditor } from './editors/SchemaFormEditor';
import { NestedFlowEditor } from './editors/NestedFlowEditor';

const SURFACE_ICON: Record<string, string> = {
  'mobile-web': mdiCellphone,
  'mobile-app': mdiApplicationOutline,
  'tablet-reg': mdiTabletCellphone,
  'kiosk': mdiMonitor,
};

const SHELL_TABS = [
  { id: 'configuration', label: 'Configuration', content: <></> },
  { id: 'flows', label: 'Flows', content: <></> },
];

// ── Shell ───────────────────────────────────────────────

export function ConfiguratorShell() {
  const nav = useCheckInFlowsStore((s) => s.nav);
  const setTab = useCheckInFlowsStore((s) => s.setTab);
  const deselectFlow = useCheckInFlowsStore((s) => s.deselectFlow);
  const stopEditingStep = useCheckInFlowsStore((s) => s.stopEditingStep);
  const flow = useFlowById(nav.flowId);
  const step = useStepById(nav.flowId, nav.stepId);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="bg-white shrink-0">
        <div
          className="flex items-center justify-between"
          style={{ padding: '16px 24px 16px 32px', borderBottom: `1px solid ${colors.colorBlack7}` }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 500, color: colors.colorBlack1, margin: 0 }}>
            Check-In Flows
          </h1>
          <a
            href="/check-in-configurator-spec.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-medium transition-colors"
            style={{ color: colors.colorBlack4 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.colorBlueDark1; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.colorBlack4; }}
            title="Open architecture spec in new tab"
          >
            Architecture spec ↗
          </a>
        </div>

        <div style={{ padding: '0 24px' }}>
          <CanaryTabs
            tabs={SHELL_TABS}
            variant="text"
            defaultTab={nav.tab}
            onChange={(tabId) => setTab(tabId as 'configuration' | 'flows')}
          />
        </div>

        {nav.tab === 'flows' && flow && (
          <div className="px-6 py-2" style={{ borderTop: `1px solid ${colors.colorBlack7}`, backgroundColor: colors.colorBlack8 }}>
            <nav className="flex items-center gap-1.5 text-[13px]">
              <button
                className="transition-colors"
                style={{ color: colors.colorBlack5 }}
                onClick={deselectFlow}
              >
                Flows
              </button>
              <Icon path={mdiChevronRight} size={0.55} color={colors.colorBlack6} />
              {nav.isEditingStep && step ? (
                <>
                  <button
                    className="transition-colors"
                    style={{ color: colors.colorBlack5 }}
                    onClick={stopEditingStep}
                  >
                    {flow.name}
                  </button>
                  <Icon path={mdiChevronRight} size={0.55} color={colors.colorBlack6} />
                  <span className="font-semibold" style={{ color: colors.colorBlack2 }}>
                    {step.name}
                  </span>
                </>
              ) : (
                <span className="font-semibold" style={{ color: colors.colorBlack2 }}>
                  {flow.name}
                </span>
              )}
            </nav>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {nav.tab === 'configuration' ? (
          <div className="flex-1 overflow-hidden">
            <CheckInConfigPage />
          </div>
        ) : (
          <FlowsContent />
        )}
      </div>
    </div>
  );
}

// ── Flows content routing ───────────────────────────────

function FlowsContent() {
  const nav = useCheckInFlowsStore((s) => s.nav);
  if (nav.flowId) return <FlowEditorView />;
  return <FlowBrowseView />;
}

// ── Flow browse view (Compendium-style list + preview) ─

function FlowBrowseView() {
  const flows = useGeneratedFlows();
  const selectFlow = useCheckInFlowsStore((s) => s.selectFlow);
  const ctx = useCheckInFlowsStore((s) => s.previewContext);
  const [previewFlowId, setPreviewFlowId] = useState<string>(flows[0]?.id ?? '');

  const previewFlow = flows.find((f) => f.id === previewFlowId);
  const firstStep = previewFlow?.steps[0];

  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: colors.colorBlack8 }}>
      <div
        className="absolute left-0 top-0 bottom-0 overflow-y-auto"
        style={{ width: '50%', padding: 24 }}
      >
        <CanaryCard padding="none" hasBorder>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${colors.colorBlack7}` }}>
            <h3 className="text-[16px] font-medium" style={{ color: colors.colorBlack1 }}>
              Flows
            </h3>
          </div>

          <div>
            {flows.map((flow, idx) => {
              const icon = SURFACE_ICON[flow.surface] ?? mdiWeb;
              const isActive = flow.id === previewFlowId;
              return (
                <div
                  key={flow.id}
                  onClick={() => setPreviewFlowId(flow.id)}
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isActive ? colors.colorBlueDark5 : undefined,
                    borderBottom: idx < flows.length - 1 ? `1px solid ${colors.colorBlack7}` : undefined,
                  }}
                >
                  <Icon path={icon} size={0.65} color={isActive ? colors.colorBlueDark1 : colors.colorBlack4} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] font-medium block" style={{ color: colors.colorBlack2 }}>
                      {flow.name}
                    </span>
                    <span className="text-[12px]" style={{ color: colors.colorBlack5 }}>
                      {flow.steps.length} steps
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); selectFlow(flow.id); }}
                    className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                    style={{ color: colors.colorBlack4 }}
                    title="Edit flow"
                  >
                    <Icon path={mdiPencilOutline} size={0.6} />
                  </button>
                </div>
              );
            })}
          </div>
        </CanaryCard>
      </div>

      <div
        className="absolute right-0 top-0 bottom-0 flex flex-col overflow-hidden"
        style={{
          width: '50%',
          backgroundColor: colors.colorBlack7,
          borderLeft: `1px solid ${colors.colorBlack7}`,
        }}
      >
        {previewFlow && <PreviewContextSelector flow={previewFlow} />}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {firstStep ? (
            <PhoneFrame showUrlBar={false}>
              <div className="w-full h-full flex flex-col bg-white">
                <StepRenderer step={firstStep} ctx={ctx} flow={previewFlow} />
              </div>
            </PhoneFrame>
          ) : (
            <p className="text-[14px]" style={{ color: colors.colorBlack5 }}>Select a flow to preview</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Flow editor view: left pane swaps (list ↔ editor), right pane is always live ──

function FlowEditorView() {
  const nav = useCheckInFlowsStore((s) => s.nav);
  const flow = useFlowById(nav.flowId);
  const step = useStepById(nav.flowId, nav.stepId);
  const ctx = useCheckInFlowsStore((s) => s.previewContext);
  const selectStep = useCheckInFlowsStore((s) => s.selectStep);
  const editStep = useCheckInFlowsStore((s) => s.editStep);

  if (!flow) return null;

  const isEditing = nav.isEditingStep && !!step;

  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: colors.colorBlack8 }}>
      <div
        className="absolute left-0 top-0 bottom-0 overflow-y-auto bg-white"
        style={{ width: '50%' }}
      >
        {isEditing ? (
          <StepEditorPane flow={flow} step={step!} />
        ) : (
          <div style={{ padding: 24 }}>
            <StepListPanel
              flow={flow}
              activeStepId={nav.stepId}
              onSelectStep={selectStep}
              onEditStep={editStep}
            />
          </div>
        )}
      </div>

      <div
        className="absolute right-0 top-0 bottom-0 flex flex-col overflow-hidden"
        style={{
          width: '50%',
          backgroundColor: colors.colorBlack7,
          borderLeft: `1px solid ${colors.colorBlack7}`,
        }}
      >
        <PreviewContextSelector flow={flow} />
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {step ? (
            <PhoneFrame showUrlBar={false}>
              <div className="w-full h-full flex flex-col bg-white">
                <StepRenderer step={step} ctx={ctx} flow={flow} />
              </div>
            </PhoneFrame>
          ) : (
            <p className="text-[14px]" style={{ color: colors.colorBlack5 }}>Select a step to preview</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step list panel (left pane content when not editing) ─────────────

let customStepCounter = 0;
function newCustomStepId(): string {
  return `step-custom-${Date.now()}-${++customStepCounter}`;
}

function StepListPanel({
  flow,
  activeStepId,
  onSelectStep,
  onEditStep,
}: {
  flow: FlowDefinition;
  activeStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onEditStep: (stepId: string) => void;
}) {
  const addStep = useCheckInFlowsStore((s) => s.addStep);
  const reorderSteps = useCheckInFlowsStore((s) => s.reorderSteps);

  const handleAddCustomStep = () => {
    const newStep: StepInstance = {
      id: newCustomStepId(),
      templateId: 'custom',
      name: 'New step',
      kind: 'schema-form',
      isSkippable: false,
      order: flow.steps.length,
      atomIds: [],
      config: { kind: 'schema-form', fields: [] } as SchemaFormConfig,
    };
    addStep(flow.id, newStep);
    onEditStep(newStep.id);
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= flow.steps.length) return;
    const orderedIds = flow.steps.map((s) => s.id);
    [orderedIds[idx], orderedIds[target]] = [orderedIds[target], orderedIds[idx]];
    reorderSteps(flow.id, orderedIds);
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-[16px] font-medium" style={{ color: colors.colorBlack1 }}>
          {flow.name}
        </h3>
        <p className="text-[13px] mt-0.5" style={{ color: colors.colorBlack4 }}>
          {flow.steps.length} steps · Click to preview, edit to configure
        </p>
      </div>

      <CanaryCard padding="none" hasBorder>
        {flow.steps.map((step, idx) => (
          <StepRow
            key={step.id}
            step={step}
            index={idx}
            isLast={idx === flow.steps.length - 1}
            isFirst={idx === 0}
            isActive={step.id === activeStepId}
            onSelect={() => onSelectStep(step.id)}
            onEdit={() => onEditStep(step.id)}
            onMoveUp={() => moveStep(idx, -1)}
            onMoveDown={() => moveStep(idx, 1)}
          />
        ))}
      </CanaryCard>

      <button
        onClick={handleAddCustomStep}
        className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 h-10 rounded-md text-[13px] font-semibold transition-colors"
        style={{
          color: colors.colorBlueDark1,
          border: `1px dashed ${colors.colorBlueDark4}`,
          backgroundColor: '#FFF',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.colorBlueDark5;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFF';
        }}
        title="Add a custom step composed from Global atoms"
      >
        <Icon path={mdiPlus} size={0.65} />
        Add custom step
      </button>
      <p
        className="text-[11px] mt-1.5 px-1"
        style={{ color: colors.colorBlack5 }}
      >
        Custom steps host atoms you compose from Global Config — useful for
        hotel-specific pages like Pet Policy or Marketing Consent.
      </p>
    </div>
  );
}

function StepRow({
  step,
  index,
  isLast,
  isFirst,
  isActive,
  onSelect,
  onEdit,
  onMoveUp,
  onMoveDown,
}: {
  step: StepInstance;
  index: number;
  isLast: boolean;
  isFirst: boolean;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const template = getStepTemplateMeta(step.templateId);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group"
      style={{
        backgroundColor: isActive ? colors.colorBlueDark5 : undefined,
        borderBottom: !isLast ? `1px solid ${colors.colorBlack7}` : undefined,
      }}
    >
      <span
        className="text-[12px] font-bold w-5 text-center shrink-0"
        style={{ color: isActive ? colors.colorBlueDark1 : colors.colorBlack5 }}
      >
        {index + 1}
      </span>

      <Icon path={template.icon} size={0.65} color={isActive ? colors.colorBlueDark1 : colors.colorBlack4} />

      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-medium block truncate" style={{ color: colors.colorBlack2 }}>
          {step.name}
        </span>
      </div>

      {/* Reorder up/down — appear on hover or when row is active */}
      <div
        onClick={stop}
        className="flex flex-col shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: colors.colorBlack5 }}
      >
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="w-5 h-3 flex items-center justify-center disabled:opacity-30"
          title="Move step up"
        >
          <span style={{ fontSize: 9, lineHeight: 1 }}>▲</span>
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="w-5 h-3 flex items-center justify-center disabled:opacity-30"
          title="Move step down"
        >
          <span style={{ fontSize: 9, lineHeight: 1 }}>▼</span>
        </button>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="w-8 h-8 rounded flex items-center justify-center shrink-0"
        style={{ color: colors.colorBlack4 }}
        title="Edit step"
      >
        <Icon path={mdiPencilOutline} size={0.6} />
      </button>
    </div>
  );
}

// ── Step editor pane (left pane content when editing) ──

function StepEditorPane({ flow, step }: { flow: FlowDefinition; step: StepInstance }) {
  const stopEditingStep = useCheckInFlowsStore((s) => s.stopEditingStep);
  const removeStep = useCheckInFlowsStore((s) => s.removeStep);
  const updateStep = useCheckInFlowsStore((s) => s.updateStep);
  const updateStepConditions = useCheckInFlowsStore((s) => s.updateStepConditions);
  const isReadOnly = false;

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(step.name);

  const template = getStepTemplateMeta(step.templateId);
  const showTemplateSubtitle = step.name.trim() !== template.displayName;

  // Reset draft when step changes
  useEffect(() => {
    setDraftName(step.name);
    setIsEditingName(false);
  }, [step.id]);

  const saveName = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== step.name) updateStep(flow.id, step.id, { name: trimmed });
    else setDraftName(step.name);
    setIsEditingName(false);
  };

  const handleDelete = () => {
    if (confirm(`Remove "${step.name}" from this flow?`)) {
      removeStep(flow.id, step.id);
      stopEditingStep();
    }
  };

  const handleConditionsChange = (next: Condition[]) => {
    if (isReadOnly) return;
    updateStepConditions(flow.id, step.id, next);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 pt-4 pb-4" style={{ borderBottom: `1px solid ${colors.colorBlack7}` }}>
        <button
          onClick={() => stopEditingStep()}
          className="text-[12px] font-medium flex items-center gap-1 mb-3"
          style={{ color: colors.colorBlack4 }}
        >
          <Icon path={mdiArrowLeft} size={0.55} />
          Back to steps
        </button>

        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: colors.colorBlueDark5 }}
          >
            <Icon path={template.icon} size={0.95} color={colors.colorBlueDark1} />
          </div>

          <div className="min-w-0 flex-1 group">
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
                    className="text-[18px] font-bold bg-white border-b-2 px-1 py-0 outline-none"
                    style={{ color: colors.colorBlack1, borderBottomColor: colors.colorBlueDark1 }}
                  />
                  <button onClick={saveName} className="p-1 rounded" style={{ color: colors.colorBlack2 }}>
                    <Icon path={mdiCheck} size={0.65} />
                  </button>
                  <button
                    onClick={() => { setDraftName(step.name); setIsEditingName(false); }}
                    className="p-1 rounded"
                    style={{ color: colors.colorBlack5 }}
                  >
                    <Icon path={mdiClose} size={0.65} />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-[18px] font-bold leading-tight" style={{ color: colors.colorBlack1 }}>
                    {step.name}
                  </h2>
                  {!isReadOnly && (
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: colors.colorBlack5 }}
                      onClick={() => setIsEditingName(true)}
                      title="Rename"
                    >
                      <Icon path={mdiPencilOutline} size={0.6} />
                    </button>
                  )}
                </>
              )}
            </div>
            {showTemplateSubtitle && (
              <p className="mt-1 text-[12px]" style={{ color: colors.colorBlack4 }}>
                {template.displayName} template
              </p>
            )}
          </div>

          {!isReadOnly && (
            <div className="flex items-center gap-3 shrink-0">
              <label
                className="flex items-center gap-1.5 text-[12px]"
                style={{ color: colors.colorBlack4 }}
              >
                <CanarySwitch
                  checked={step.isSkippable}
                  onChange={(val) => updateStep(flow.id, step.id, { isSkippable: val })}
                />
                Skippable
              </label>
              <button
                onClick={handleDelete}
                className="text-[12px] font-medium inline-flex items-center gap-1 transition-colors"
                style={{ color: colors.colorBlack5 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = colors.danger; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = colors.colorBlack5; }}
                title="Remove step"
              >
                <Icon path={mdiDelete} size={0.6} />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step visibility — page-level gating layered above atom-level
          conditions. Step gate fires first; if it fails the whole step
          skips. If it renders, atom-level conditions then filter inside.
          Both can be guest-attribute or form-response based. */}
      <div className="px-6 pt-4 pb-3" style={{ borderBottom: `1px solid ${colors.colorBlack7}` }}>
        <h4
          className="text-[11px] font-semibold uppercase tracking-wider mb-1"
          style={{ color: colors.colorBlack5 }}
        >
          Step visibility
        </h4>
        <p
          className="text-[11px] mb-2"
          style={{ color: colors.colorBlack5 }}
        >
          Skip this step entirely when conditions don&rsquo;t match. Atom
          conditions inside the step still apply on top — e.g., gate the
          whole Pet Policy page on <code>pet = yes</code>.
        </p>
        <ConditionRuleEditor
          conditions={step.conditions ?? []}
          onChange={handleConditionsChange}
          scope="step"
          disabled={isReadOnly}
          emptyLabel="Step is always shown"
          emptyHint="Add a condition to skip this step under specific circumstances (e.g., 'no additional guests' → skip Additional Guests page)."
        />
      </div>

      {/* Custom step intro copy — only for custom-template steps; preset
          atoms own their own copy via the preset config. */}
      {step.templateId === 'custom' && (
        <div className="px-6 pt-4 pb-3" style={{ borderBottom: `1px solid ${colors.colorBlack7}` }}>
          <h4
            className="text-[11px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: colors.colorBlack5 }}
          >
            Page intro copy
          </h4>
          <p
            className="text-[11px] mb-2"
            style={{ color: colors.colorBlack4 }}
          >
            Optional paragraph rendered above the atoms in this step. Use it
            to set context for the guest (e.g., explain the pet policy).
          </p>
          <CanaryTextArea
            size={InputSize.NORMAL}
            placeholder="Optional intro text shown to the guest"
            rows={3}
            value={step.introText?.['en'] ?? ''}
            onChange={(e) =>
              updateStep(flow.id, step.id, {
                introText: { ...(step.introText ?? {}), en: e.target.value },
              })
            }
          />
        </div>
      )}

      {/* Type-specific editor */}
      <div>
        <StepConfigEditor step={step} flow={flow} isReadOnly={isReadOnly} />
      </div>
    </div>
  );
}

// ── Step config editor dispatcher ──────────────────────

function StepConfigEditor({
  step,
  flow,
  isReadOnly,
}: {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}) {
  const cfg = step.config;

  // Phase 5 made atomIds the source of truth — every step with renderable
  // content has atomIds populated. SchemaFormEditor handles atom-slot
  // composition for both schema-form steps (custom + reg-card) and
  // atom-decomposed presets (id-consent / id-capture / etc.).
  const hasAtomSlots = (step.atomIds?.length ?? 0) > 0;

  if (hasAtomSlots) {
    return <SchemaFormEditor step={step} flow={flow} isReadOnly={isReadOnly} />;
  }

  if (cfg.kind === 'nested-flow') {
    return <NestedFlowEditor step={step} flow={flow} isReadOnly={isReadOnly} />;
  }

  return (
    <div className="p-10 text-center text-[14px]" style={{ color: colors.colorBlack5 }}>
      No editor available for this step type.
    </div>
  );
}
