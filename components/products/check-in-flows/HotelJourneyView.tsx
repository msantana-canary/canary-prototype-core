'use client';

/**
 * HotelJourneyView — WYSIWYG hotel-facing view of the check-in flow.
 *
 * Lives in the regular settings sidebar at /settings/check-in-journey.
 * Hotels see the actual guest experience rendered step by step inside
 * phone frames. Editable text (labels, intro copy, copy-block content)
 * can be edited inline by clicking directly on the rendered screen.
 * Everything else is visible but read-only.
 *
 * Per Design Workshop (May 11) + EJ Review (May 13):
 * - "Keep it visual and inline"
 * - "Show exactly what the guest experience will be"
 * - "Simple visual configurability like changing images = wow factor"
 * - Platform tabs to switch between Mobile / Tablet / Kiosk
 * - Language dropdown to preview in any supported language
 * - Start conservative — edit copy only, no adding fields/steps
 */

import React, { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import {
  mdiCellphone,
  mdiTabletCellphone,
  mdiMonitor,
  mdiChevronLeft,
  mdiChevronRight,
  mdiPencilOutline,
  mdiLockOutline,
} from '@mdi/js';
import { colors } from '@canary-ui/components';

import {
  useCheckInFlowsStore,
  useGeneratedFlows,
} from '@/lib/products/check-in-flows/store';
import type {
  FlowDefinition,
  StepInstance,
  Atom,
  InputAtom,
  CopyBlockAtom,
  Surface,
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { getStepTemplateMeta } from '@/lib/products/check-in-flows/step-templates';
import { PhoneFrame } from '@/components/core/PhoneFrame';
import { StepRenderer } from './preview/StepRenderer';

const SURFACE_TABS: { key: Surface; label: string; icon: string }[] = [
  { key: 'mobile-web', label: 'Mobile', icon: mdiCellphone },
  { key: 'tablet-reg', label: 'Tablet', icon: mdiTabletCellphone },
  { key: 'kiosk', label: 'Kiosk', icon: mdiMonitor },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Espanol' },
  { value: 'it', label: 'Italiano' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ms', label: 'Malay' },
];

export function HotelJourneyView() {
  const flows = useGeneratedFlows();
  const previewContext = useCheckInFlowsStore((s) => s.previewContext);
  const setPreviewContext = useCheckInFlowsStore((s) => s.setPreviewContext);

  const [activeSurface, setActiveSurface] = useState<Surface>('mobile-web');
  const [lang, setLang] = useState('en');

  const flow = useMemo(
    () => flows.find((f) => f.surface === activeSurface),
    [flows, activeSurface]
  );

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const step = flow?.steps[activeStepIdx];
  const total = flow?.steps.length ?? 0;

  const ctx = useMemo(
    () => ({ ...previewContext, language: lang }),
    [previewContext, lang]
  );

  const canPrev = activeStepIdx > 0;
  const canNext = activeStepIdx < total - 1;

  return (
    <div className="h-full flex flex-col">
      {/* Header: title + platform tabs + language */}
      <div
        className="shrink-0 px-8 pt-6 pb-4"
        style={{ borderBottom: `1px solid ${colors.colorBlack7}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-[18px] font-bold"
              style={{ color: colors.colorBlack1 }}
            >
              Check-In Journey
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: colors.colorBlack4 }}>
              Preview what your guests see. Click text to edit copy.
            </p>
          </div>
          <div className="flex items-center gap-1">
            {LANGUAGES.map((l) => {
              const isActive = l.value === lang;
              return (
                <button
                  key={l.value}
                  onClick={() => setLang(l.value)}
                  className="text-[12px] font-semibold px-2.5 h-7 rounded-md transition-colors"
                  style={{
                    backgroundColor: isActive ? colors.colorBlueDark5 : 'transparent',
                    color: isActive ? colors.colorBlueDark1 : colors.colorBlack4,
                    border: `1px solid ${isActive ? colors.colorBlueDark4 : 'transparent'}`,
                  }}
                >
                  {l.value.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Platform tabs */}
        <div className="flex gap-1">
          {SURFACE_TABS.map((tab) => {
            const isActive = tab.key === activeSurface;
            const hasFlow = flows.some((f) => f.surface === tab.key);
            return (
              <button
                key={tab.key}
                disabled={!hasFlow}
                onClick={() => {
                  setActiveSurface(tab.key);
                  setActiveStepIdx(0);
                }}
                className="flex items-center gap-1.5 px-4 h-9 rounded-md text-[13px] font-semibold transition-colors disabled:opacity-40"
                style={{
                  backgroundColor: isActive ? colors.colorBlueDark5 : 'transparent',
                  color: isActive ? colors.colorBlueDark1 : colors.colorBlack4,
                  border: `1px solid ${isActive ? colors.colorBlueDark4 : colors.colorBlack7}`,
                }}
              >
                <Icon
                  path={tab.icon}
                  size={0.55}
                  color={isActive ? colors.colorBlueDark1 : colors.colorBlack4}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body: step list + phone preview */}
      {flow && step ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: step list */}
          <div
            className="w-[260px] shrink-0 overflow-y-auto py-4 px-4"
            style={{ borderRight: `1px solid ${colors.colorBlack7}` }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-wider mb-3 px-2"
              style={{ color: colors.colorBlack5 }}
            >
              Steps in {flow.name}
            </p>
            {flow.steps.map((s, idx) => {
              const tmpl = getStepTemplateMeta(s.templateId);
              const isActive = idx === activeStepIdx;
              const hasConditions = (s.conditions?.length ?? 0) > 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStepIdx(idx)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md mb-1 transition-colors"
                  style={{
                    backgroundColor: isActive ? colors.colorBlueDark5 : 'transparent',
                    color: isActive ? colors.colorBlueDark1 : colors.colorBlack3,
                  }}
                >
                  <span
                    className="text-[11px] font-bold w-5 text-center shrink-0"
                    style={{ color: isActive ? colors.colorBlueDark1 : colors.colorBlack5 }}
                  >
                    {hasConditions ? 'if' : idx + 1}
                  </span>
                  <Icon path={tmpl.icon} size={0.55} color={isActive ? colors.colorBlueDark1 : colors.colorBlack4} />
                  <span className="text-[13px] truncate">{s.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right: phone preview */}
          <div
            className="flex-1 flex flex-col items-center overflow-hidden"
            style={{ backgroundColor: colors.colorBlack8 }}
          >
            {/* Step nav bar */}
            <div className="flex items-center gap-4 py-4">
              <button
                disabled={!canPrev}
                onClick={() => setActiveStepIdx((i) => i - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                style={{
                  backgroundColor: '#FFF',
                  border: `1px solid ${colors.colorBlack6}`,
                }}
              >
                <Icon path={mdiChevronLeft} size={0.6} color={colors.colorBlack3} />
              </button>
              <span className="text-[13px] font-semibold" style={{ color: colors.colorBlack2 }}>
                {step.name}
              </span>
              <span className="text-[12px]" style={{ color: colors.colorBlack5 }}>
                {activeStepIdx + 1} of {total}
              </span>
              <button
                disabled={!canNext}
                onClick={() => setActiveStepIdx((i) => i + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                style={{
                  backgroundColor: '#FFF',
                  border: `1px solid ${colors.colorBlack6}`,
                }}
              >
                <Icon path={mdiChevronRight} size={0.6} color={colors.colorBlack3} />
              </button>
            </div>

            {/* Phone frame — fills available space; PhoneFrame's
                ResizeObserver auto-scales the device to fit. */}
            <div className="flex-1 w-full flex items-center justify-center p-4 overflow-hidden">
              <div className="h-full w-full max-w-[520px] relative">
                <PhoneFrame showUrlBar={false}>
                  <div className="w-full h-full flex flex-col bg-white">
                    <StepRenderer step={step} ctx={ctx} flow={flow} />
                  </div>
                </PhoneFrame>

                {/* Inline edit overlay — floating beside the phone */}
                <InlineEditPanel
                  step={step}
                  flowId={flow.id}
                  lang={lang}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[14px]" style={{ color: colors.colorBlack4 }}>
              No flow configured for {SURFACE_TABS.find((t) => t.key === activeSurface)?.label ?? activeSurface}.
            </p>
            <p className="text-[12px] mt-1" style={{ color: colors.colorBlack5 }}>
              Contact your Canary team to enable this product.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline edit panel — shows beside the phone for the active step ──

function InlineEditPanel({
  step,
  flowId,
  lang,
}: {
  step: StepInstance;
  flowId: string;
  lang: string;
}) {
  const allAtoms = useCheckInFlowsStore((s) => s.atoms);
  const updateAtom = useCheckInFlowsStore((s) => s.updateAtom);
  const updateStep = useCheckInFlowsStore((s) => s.updateStep);

  const atoms = (step.atomIds ?? [])
    .map((id) => allAtoms.find((a) => a.id === id))
    .filter(Boolean) as Atom[];

  const editableAtoms = atoms.filter(
    (a) => a.kind === 'input' || a.kind === 'copy-block'
  );

  const hasIntro = step.templateId === 'custom' || step.templateId === 'reg-card' || step.templateId === 'ocr';
  const template = getStepTemplateMeta(step.templateId);

  if (editableAtoms.length === 0 && !hasIntro) {
    return (
      <div
        className="absolute -right-[220px] top-12 w-[200px] p-3 rounded-lg"
        style={{
          backgroundColor: '#FFF',
          border: `1px solid ${colors.colorBlack7}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Icon path={mdiLockOutline} size={0.5} color={colors.colorBlack5} />
          <span className="text-[11px] font-semibold" style={{ color: colors.colorBlack3 }}>
            {template.displayName}
          </span>
        </div>
        <p className="text-[11px]" style={{ color: colors.colorBlack5 }}>
          This step is managed by your Canary team. Contact support to make changes.
        </p>
      </div>
    );
  }

  return (
    <div
      className="absolute -right-[280px] top-12 w-[260px] rounded-lg overflow-hidden"
      style={{
        backgroundColor: '#FFF',
        border: `1px solid ${colors.colorBlack7}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <div
        className="px-3 py-2 flex items-center gap-1.5"
        style={{
          borderBottom: `1px solid ${colors.colorBlack7}`,
          backgroundColor: colors.colorBlack8,
        }}
      >
        <Icon path={mdiPencilOutline} size={0.5} color={colors.colorBlack4} />
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: colors.colorBlack4 }}
        >
          Edit content
        </span>
      </div>

      <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto">
        {/* Intro copy */}
        {hasIntro && (
          <LiveField
            label="Intro copy"
            value={step.introText?.[lang] ?? ''}
            enValue={lang !== 'en' ? (step.introText?.['en'] ?? '') : undefined}
            multiline
            onChange={(v) =>
              updateStep(flowId, step.id, {
                introText: { ...(step.introText ?? {}), [lang]: v },
              })
            }
          />
        )}

        {/* Editable atoms */}
        {editableAtoms.map((atom) => {
          if (atom.kind === 'input') {
            const input = atom as InputAtom;
            return (
              <LiveField
                key={atom.id}
                label={resolveText(input.label, 'en') || 'Field label'}
                value={input.label?.[lang] ?? ''}
                enValue={lang !== 'en' ? (input.label?.['en'] ?? '') : undefined}
                onChange={(v) =>
                  updateAtom(atom.id, { label: { ...input.label, [lang]: v } })
                }
              />
            );
          }
          if (atom.kind === 'copy-block') {
            const cb = atom as CopyBlockAtom;
            return (
              <LiveField
                key={atom.id}
                label={cb.name}
                value={cb.content?.[lang] ?? ''}
                enValue={lang !== 'en' ? (cb.content?.['en'] ?? '') : undefined}
                multiline
                onChange={(v) =>
                  updateAtom(atom.id, { content: { ...cb.content, [lang]: v } })
                }
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

// ── Live-editing field — writes to store on every keystroke so the
//    phone preview updates in real time. No Save/Cancel per field. ──

function LiveField({
  label,
  value,
  enValue,
  multiline,
  onChange,
}: {
  label: string;
  value: string;
  enValue?: string;
  multiline?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        className="text-[10px] font-semibold uppercase tracking-wider block mb-1"
        style={{ color: colors.colorBlack4 }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          className="w-full text-[12px] bg-white border rounded-md px-2 py-1.5 outline-none resize-none transition-colors focus:border-[#5B8DEF]"
          style={{ color: colors.colorBlack1, borderColor: colors.colorBlack6 }}
          value={value}
          rows={3}
          placeholder="Type here..."
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full text-[12px] bg-white border rounded-md px-2 py-1.5 outline-none transition-colors focus:border-[#5B8DEF]"
          style={{ color: colors.colorBlack1, borderColor: colors.colorBlack6 }}
          value={value}
          placeholder="Type here..."
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {enValue && (
        <p className="text-[10px] mt-1 italic" style={{ color: colors.colorBlack5 }}>
          EN: {enValue}
        </p>
      )}
    </div>
  );
}
