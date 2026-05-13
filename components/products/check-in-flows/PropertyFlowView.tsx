'use client';

/**
 * PropertyFlowView — simplified hotel-facing view of a check-in flow.
 *
 * Renders each step as a visual card showing what the guest sees, with
 * inline editing for allowed fields (copy, labels, intro text) and a
 * language switcher. No PMS mapping, no conditionals, no adding/removing
 * fields or steps — those are CS-only.
 *
 * Per the Design Workshop (May 11): "Keep it visual and inline. Start
 * conservative with what can be edited, then open gates as needed."
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiPencilOutline,
  mdiCheck,
  mdiClose,
  mdiTranslate,
  mdiLockOutline,
  mdiChevronDown,
} from '@mdi/js';
import {
  colors,
  CanaryInput,
  CanaryTextArea,
  CanarySelect,
  InputSize,
} from '@canary-ui/components';

import {
  useCheckInFlowsStore,
  useFlowById,
} from '@/lib/products/check-in-flows/store';
import type {
  FlowDefinition,
  StepInstance,
  Atom,
  InputAtom,
  CopyBlockAtom,
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { getStepTemplateMeta } from '@/lib/products/check-in-flows/step-templates';
import { getFieldTypeMeta } from '@/lib/products/check-in-flows/field-types';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Espanol' },
  { value: 'it', label: 'Italiano' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ms', label: 'Malay' },
];

export function PropertyFlowView() {
  const nav = useCheckInFlowsStore((s) => s.nav);
  const flow = useFlowById(nav.flowId);
  const allAtoms = useCheckInFlowsStore((s) => s.atoms);
  const [lang, setLang] = useState('en');

  if (!flow) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[14px]" style={{ color: colors.colorBlack5 }}>
          Select a flow from the sidebar.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{
          padding: '14px 28px',
          borderBottom: `1px solid ${colors.colorBlack7}`,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: colors.colorBlack1,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {flow.name}
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: colors.colorBlack4 }}>
            {flow.steps.length} steps &middot; Hotel view &middot; Edit copy and content inline
          </p>
        </div>

        {/* Language switcher */}
        <div className="flex items-center gap-2">
          <Icon path={mdiTranslate} size={0.6} color={colors.colorBlack4} />
          <CanarySelect
            size={InputSize.NORMAL}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            options={LANGUAGES}
          />
        </div>
      </div>

      {/* Scrollable step cards */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: '#F5F5F7', padding: '24px 32px' }}
      >
        <div className="max-w-[720px] mx-auto space-y-5">
          {flow.steps.map((step, idx) => (
            <StepCard
              key={step.id}
              step={step}
              index={idx}
              lang={lang}
              allAtoms={allAtoms}
              flowId={flow.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step card ────────────────────────────────────────

function StepCard({
  step,
  index,
  lang,
  allAtoms,
  flowId,
}: {
  step: StepInstance;
  index: number;
  lang: string;
  allAtoms: Atom[];
  flowId: string;
}) {
  const template = getStepTemplateMeta(step.templateId);
  const updateStep = useCheckInFlowsStore((s) => s.updateStep);

  const [editingIntro, setEditingIntro] = useState(false);
  const [draftIntro, setDraftIntro] = useState('');

  const atoms = (step.atomIds ?? [])
    .map((id) => allAtoms.find((a) => a.id === id))
    .filter(Boolean) as Atom[];

  const introText = resolveText(step.introText, lang);
  const hasConditions = (step.conditions?.length ?? 0) > 0;

  const startEditIntro = () => {
    setDraftIntro(step.introText?.[lang] ?? '');
    setEditingIntro(true);
  };

  const saveIntro = () => {
    updateStep(flowId, step.id, {
      introText: { ...(step.introText ?? {}), [lang]: draftIntro },
    });
    setEditingIntro(false);
  };

  return (
    <div
      className="rounded-xl bg-white overflow-hidden"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        border: `1px solid ${colors.colorBlack7}`,
      }}
    >
      {/* Step header */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{
          borderBottom: `1px solid ${colors.colorBlack7}`,
          backgroundColor: '#FAFAFA',
        }}
      >
        <span
          className="text-[12px] font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: hasConditions ? colors.colorBlueDark5 : colors.colorBlack8,
            color: hasConditions ? colors.colorBlueDark1 : colors.colorBlack4,
          }}
        >
          {hasConditions ? 'if' : index + 1}
        </span>
        <Icon path={template.icon} size={0.6} color={colors.colorBlack3} />
        <span
          className="text-[14px] font-semibold flex-1"
          style={{ color: colors.colorBlack1 }}
        >
          {step.name}
        </span>
        {template.lockedPosition && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: colors.colorBlack5 }}>
            <Icon path={mdiLockOutline} size={0.4} />
            {template.lockedPosition === 'first' ? 'First' : 'Last'}
          </span>
        )}
      </div>

      {/* Intro copy — editable inline */}
      {(introText || step.templateId === 'custom' || step.templateId === 'reg-card') && (
        <div
          className="px-5 py-3 group"
          style={{ borderBottom: `1px solid ${colors.colorBlack8}` }}
        >
          {editingIntro ? (
            <div className="space-y-2">
              <CanaryTextArea
                size={InputSize.NORMAL}
                value={draftIntro}
                onChange={(e) => setDraftIntro(e.target.value)}
                rows={3}
                placeholder="Intro copy shown above the form"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={saveIntro}
                  className="text-[11px] font-semibold px-2.5 h-7 rounded-md text-white"
                  style={{ backgroundColor: colors.colorBlueDark1 }}
                >
                  <Icon path={mdiCheck} size={0.5} /> Save
                </button>
                <button
                  onClick={() => setEditingIntro(false)}
                  className="text-[11px] font-semibold px-2.5 h-7 rounded-md"
                  style={{ color: colors.colorBlack4, border: `1px solid ${colors.colorBlack6}` }}
                >
                  Cancel
                </button>
              </div>
              {lang !== 'en' && step.introText?.['en'] && (
                <p className="text-[11px] italic" style={{ color: colors.colorBlack5 }}>
                  EN: {step.introText['en']}
                </p>
              )}
            </div>
          ) : (
            <div
              className="flex items-start gap-2 cursor-pointer"
              onClick={startEditIntro}
            >
              <p
                className="flex-1 text-[13px] leading-relaxed"
                style={{ color: colors.colorBlack3 }}
              >
                {introText || (
                  <span className="italic" style={{ color: colors.colorBlack5 }}>
                    No intro copy — click to add
                  </span>
                )}
              </p>
              <Icon
                path={mdiPencilOutline}
                size={0.5}
                color={colors.colorBlack5}
                className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>
      )}

      {/* Atom list — visual rendering of each field */}
      {atoms.length > 0 && (
        <div className="px-5 py-3 space-y-3">
          {atoms.map((atom) => (
            <PropertyAtomRow
              key={atom.id}
              atom={atom}
              lang={lang}
            />
          ))}
        </div>
      )}

      {/* Preset step body — simplified view */}
      {atoms.length === 0 && step.kind === 'preset' && (
        <div className="px-5 py-6 text-center">
          <Icon
            path={template.icon}
            size={1.5}
            color={colors.colorBlack6}
          />
          <p className="text-[13px] mt-2" style={{ color: colors.colorBlack4 }}>
            {template.displayName}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: colors.colorBlack5 }}>
            {template.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Property atom row — inline-editable label ────────

function PropertyAtomRow({
  atom,
  lang,
}: {
  atom: Atom;
  lang: string;
}) {
  const updateAtom = useCheckInFlowsStore((s) => s.updateAtom);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  if (atom.kind === 'copy-block') {
    return (
      <CopyBlockRow atom={atom} lang={lang} />
    );
  }

  if (atom.kind === 'preset') {
    return (
      <div
        className="flex items-center gap-3 py-2 px-3 rounded-lg"
        style={{ backgroundColor: '#F9FAFB', border: `1px solid ${colors.colorBlack8}` }}
      >
        <Icon path={mdiLockOutline} size={0.5} color={colors.colorBlack5} />
        <span className="text-[13px]" style={{ color: colors.colorBlack3 }}>
          {resolveText(atom.label, lang)}
        </span>
        <span className="text-[10px] ml-auto px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.colorBlack8, color: colors.colorBlack5 }}>
          PRESET
        </span>
      </div>
    );
  }

  // InputAtom
  const inputAtom = atom as InputAtom;
  const label = resolveText(inputAtom.label, lang);
  const meta = getFieldTypeMeta(inputAtom.fieldType);

  const startEdit = () => {
    setDraft(inputAtom.label?.[lang] ?? '');
    setEditing(true);
  };

  const save = () => {
    updateAtom(atom.id, {
      label: { ...inputAtom.label, [lang]: draft },
    });
    setEditing(false);
  };

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-lg group cursor-pointer"
      style={{
        backgroundColor: '#F9FAFB',
        border: `1px solid ${colors.colorBlack8}`,
      }}
      onClick={() => !editing && startEdit()}
    >
      <div
        className="w-6 h-6 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: colors.colorBlack8 }}
      >
        <Icon path={meta.icon} size={0.5} color={colors.colorBlack4} />
      </div>

      {editing ? (
        <div className="flex-1 flex items-center gap-1.5">
          <input
            autoFocus
            className="flex-1 text-[13px] bg-white border rounded px-2 py-1 outline-none"
            style={{
              color: colors.colorBlack1,
              borderColor: colors.colorBlueDark3,
            }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
          <button onClick={save} style={{ color: colors.colorBlueDark1 }}>
            <Icon path={mdiCheck} size={0.55} />
          </button>
          <button onClick={() => setEditing(false)} style={{ color: colors.colorBlack5 }}>
            <Icon path={mdiClose} size={0.55} />
          </button>
        </div>
      ) : (
        <>
          <span
            className="flex-1 text-[13px]"
            style={{ color: colors.colorBlack2 }}
          >
            {label || 'Untitled field'}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: colors.colorBlack8,
              color: colors.colorBlack5,
            }}
          >
            {meta.displayName}
          </span>
          {inputAtom.required && (
            <span className="text-[10px] font-semibold" style={{ color: colors.danger }}>
              Required
            </span>
          )}
          <Icon
            path={mdiPencilOutline}
            size={0.45}
            color={colors.colorBlack5}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </>
      )}

      {editing && lang !== 'en' && inputAtom.label?.['en'] && (
        <p className="text-[11px] italic mt-1" style={{ color: colors.colorBlack5 }}>
          EN: {inputAtom.label['en']}
        </p>
      )}
    </div>
  );
}

// ── Copy block — inline content editing ──────────────

function CopyBlockRow({
  atom,
  lang,
}: {
  atom: CopyBlockAtom;
  lang: string;
}) {
  const updateAtom = useCheckInFlowsStore((s) => s.updateAtom);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const content = resolveText(atom.content, lang);

  const startEdit = () => {
    setDraft(atom.content?.[lang] ?? '');
    setEditing(true);
  };

  const save = () => {
    updateAtom(atom.id, {
      content: { ...atom.content, [lang]: draft },
    });
    setEditing(false);
  };

  return (
    <div
      className="py-2 px-3 rounded-lg group"
      style={{
        backgroundColor: '#FFFBEB',
        border: `1px solid #FDE68A`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#92400E' }}>
          {atom.name}
        </span>
        {!editing && (
          <button
            onClick={startEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon path={mdiPencilOutline} size={0.45} color="#92400E" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <CanaryTextArea
            size={InputSize.NORMAL}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
          />
          <div className="flex gap-1.5">
            <button
              onClick={save}
              className="text-[11px] font-semibold px-2.5 h-7 rounded-md text-white"
              style={{ backgroundColor: colors.colorBlueDark1 }}
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-[11px] font-semibold px-2.5 h-7 rounded-md"
              style={{ color: colors.colorBlack4, border: `1px solid ${colors.colorBlack6}` }}
            >
              Cancel
            </button>
          </div>
          {lang !== 'en' && atom.content?.['en'] && (
            <p className="text-[11px] italic" style={{ color: colors.colorBlack5 }}>
              EN: {atom.content['en']}
            </p>
          )}
        </div>
      ) : (
        <p
          className="text-[12px] leading-relaxed cursor-pointer"
          style={{ color: '#78350F' }}
          onClick={startEdit}
        >
          {content || <span className="italic">No content — click to add</span>}
        </p>
      )}
    </div>
  );
}
