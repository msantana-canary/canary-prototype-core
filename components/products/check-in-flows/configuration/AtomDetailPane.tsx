'use client';

/**
 * AtomDetailPane — right pane of split-pane Configuration tab.
 *
 * Empty state (no atom selected): renders SettingsHandledElsewhere
 * (relocated from bottom of page).
 *
 * Selected state: renders Details + Visibility sections stacked.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiPencilOutline } from '@mdi/js';
import {
  CanaryInput,
  CanarySelect,
  CanaryTextArea,
  CanarySwitch,
  InputSize,
  colors,
} from '@canary-ui/components';

import type {
  Atom,
  InputAtom,
  PresetAtom,
  CopyBlockAtom,
  Condition,
  ElementTag,
} from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { getFieldTypeMeta } from '@/lib/products/check-in-flows/field-types';
import {
  ELEMENT_TAGS_BY_CATEGORY,
  type TagCategory,
} from '@/lib/products/check-in-flows/element-tags';
import { ConditionRuleEditor } from '../editors/ConditionRuleEditor';
import { SettingsHandledElsewhere } from './SettingsHandledElsewhere';
import { describeAtom } from './AtomRow';

export function AtomDetailPane() {
  const selectedAtomId = useCheckInFlowsStore((s) => s.selectedAtomId);
  const allAtoms = useCheckInFlowsStore((s) => s.atoms);
  const updateAtom = useCheckInFlowsStore((s) => s.updateAtom);
  const deselectAtom = useCheckInFlowsStore((s) => s.deselectAtom);

  const atom = selectedAtomId
    ? allAtoms.find((a) => a.id === selectedAtomId)
    : null;

  if (!atom) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <p className="text-[12px]" style={{ color: colors.colorBlack5 }}>
            Select a component from the left to edit its details and visibility.
          </p>
        </div>
        <SettingsHandledElsewhere />
      </div>
    );
  }

  const display = describeAtom(atom);
  const onUpdate = (updates: Partial<Atom>) => updateAtom(atom.id, updates);
  const onConditionsChange = (next: Condition[]) =>
    onUpdate({ conditions: next.length > 0 ? next : undefined } as Partial<Atom>);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${colors.colorBlack7}` }}
      >
        <div
          className="w-9 h-9 rounded flex items-center justify-center shrink-0"
          style={{ backgroundColor: colors.colorBlueDark5 }}
        >
          <Icon path={display.icon} size={0.85} color={colors.colorBlueDark1} />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="text-[14px] font-bold truncate"
            style={{ color: colors.colorBlack1 }}
          >
            {display.title}
          </h3>
          <p className="text-[11px]" style={{ color: colors.colorBlack5 }}>
            Editing component — changes propagate live to all flows that reference it.
          </p>
        </div>
        <button
          onClick={deselectAtom}
          className="w-7 h-7 rounded flex items-center justify-center transition-colors"
          style={{ color: colors.colorBlack5 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.colorBlack8;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Close editor"
        >
          <Icon path={mdiClose} size={0.65} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Details */}
        <Section title="Details">
          {atom.kind === 'input' && (
            <InputAtomDetails atom={atom} onUpdate={onUpdate} />
          )}
          {atom.kind === 'copy-block' && (
            <CopyBlockAtomDetails atom={atom} onUpdate={onUpdate} />
          )}
          {atom.kind === 'preset' && <PresetAtomDetailsNotice />}
        </Section>

        {/* Visibility */}
        <Section title="Visibility">
          <ConditionRuleEditor
            conditions={atom.conditions ?? []}
            onChange={onConditionsChange}
            scope="field"
            emptyLabel="No visibility conditions"
            emptyHint="Add a condition to gate this component on guest attributes (nationality, age, loyalty, rate code)."
          />
        </Section>
      </div>
    </div>
  );
}

// ── Section ──────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4
        className="text-[11px] font-semibold uppercase tracking-wider mb-2"
        style={{ color: colors.colorBlack5 }}
      >
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

// ── Input atom editor ────────────────────────────────

const TAG_CATEGORY_LABELS: Record<TagCategory, string> = {
  'guest-info': 'Guest Info',
  'contact': 'Contact',
  'address': 'Address',
  'stay': 'Stay',
  'identification': 'Identification',
  'loyalty': 'Loyalty',
  'other': 'Other',
};

function InputAtomDetails({
  atom,
  onUpdate,
}: {
  atom: InputAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const supportsAutoSkip = !getFieldTypeMeta(atom.fieldType).isStatic;

  const tagOptions: { value: string; label: string; disabled?: boolean }[] = [
    { value: '', label: 'No semantic tag' },
  ];
  (Object.keys(ELEMENT_TAGS_BY_CATEGORY) as TagCategory[]).forEach((cat) => {
    tagOptions.push({
      value: `__sep_${cat}`,
      label: `── ${TAG_CATEGORY_LABELS[cat]} ──`,
      disabled: true,
    });
    ELEMENT_TAGS_BY_CATEGORY[cat].forEach((t) => {
      tagOptions.push({ value: t.id, label: t.displayName });
    });
  });

  return (
    <>
      <CanaryInput
        size={InputSize.NORMAL}
        label="Label (EN)"
        placeholder="Field label shown to guest"
        value={atom.label?.['en'] ?? ''}
        onChange={(e) =>
          onUpdate({ label: { ...atom.label, en: e.target.value } } as Partial<Atom>)
        }
      />
      <CanaryInput
        size={InputSize.NORMAL}
        label="Helper text (EN)"
        placeholder="Optional hint shown under the field"
        value={atom.helperText?.['en'] ?? ''}
        onChange={(e) =>
          onUpdate({
            helperText: { ...(atom.helperText ?? {}), en: e.target.value },
          } as Partial<Atom>)
        }
      />
      <CanaryInput
        size={InputSize.NORMAL}
        label="Placeholder (EN)"
        placeholder="Optional placeholder text"
        value={atom.placeholder?.['en'] ?? ''}
        onChange={(e) =>
          onUpdate({
            placeholder: { ...(atom.placeholder ?? {}), en: e.target.value },
          } as Partial<Atom>)
        }
      />

      <div>
        <label
          className="text-[11px] font-semibold uppercase tracking-wider mb-1 block"
          style={{ color: colors.colorBlack5 }}
        >
          PMS Mapping
        </label>
        <CanarySelect
          size={InputSize.NORMAL}
          value={atom.pmsTag ?? ''}
          onChange={(e) =>
            onUpdate({
              pmsTag: (e.target.value as ElementTag) || undefined,
            } as Partial<Atom>)
          }
          options={tagOptions}
        />
      </div>

      {supportsAutoSkip && (
        <label
          className="flex items-center gap-2 text-[12px]"
          style={{ color: colors.colorBlack3 }}
        >
          <CanarySwitch
            checked={atom.autoSkipIfFilled ?? false}
            onChange={(v) => onUpdate({ autoSkipIfFilled: v } as Partial<Atom>)}
          />
          Auto-skip if already filled
          <span
            className="text-[11px]"
            style={{ color: colors.colorBlack5 }}
          >
            (skips on subsequent flows when prior surface captured the data)
          </span>
        </label>
      )}
    </>
  );
}

function CopyBlockAtomDetails({
  atom,
  onUpdate,
}: {
  atom: CopyBlockAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  return (
    <>
      <CanaryInput
        size={InputSize.NORMAL}
        label="Name"
        placeholder="CS-facing identifier (e.g., Hotel Policies)"
        value={atom.name}
        onChange={(e) => onUpdate({ name: e.target.value } as Partial<Atom>)}
      />
      <CanaryTextArea
        size={InputSize.NORMAL}
        label="Content (EN)"
        placeholder="Compliance / policy text shown to guest"
        value={atom.content?.['en'] ?? ''}
        rows={6}
        onChange={(e) =>
          onUpdate({
            content: { ...atom.content, en: e.target.value },
          } as Partial<Atom>)
        }
      />
    </>
  );
}

function PresetAtomDetailsNotice() {
  return (
    <div
      className="px-3 py-3 rounded text-[12px]"
      style={{
        backgroundColor: '#FFFBEB',
        border: `1px solid #FCD34D`,
        color: '#92400E',
      }}
    >
      <strong>Preset configuration is currently fixed in code.</strong> Phase
      3+ decomposes multi-stage presets to expose their per-stage
      configuration here. For now, edit visibility conditions below.
    </div>
  );
}
