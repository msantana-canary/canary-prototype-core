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
import { mdiClose } from '@mdi/js';
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
  FieldType,
  FieldOption,
  IdTypeOption,
  IdTypeSelectAtomConfig,
  IdConsentAtomConfig,
  IdPhotoAtomConfig,
  IdSelfieAtomConfig,
  LoyaltyWelcomeAtomConfig,
  CompletionAtomConfig,
  CreditCardAtomConfig,
  DepositCollectionAtomConfig,
  LocalizedText,
} from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import {
  getFieldTypeMeta,
  FIELD_TYPES_BY_CATEGORY,
  type FieldTypeCategory,
} from '@/lib/products/check-in-flows/field-types';
import {
  ELEMENT_TAGS_BY_CATEGORY,
  type TagCategory,
} from '@/lib/products/check-in-flows/element-tags';
import { ConditionRuleEditor } from '../editors/ConditionRuleEditor';
import { SettingsHandledElsewhere } from './SettingsHandledElsewhere';
import { describeAtom } from './AtomRow';
import { OptionsEditor } from './OptionsEditor';

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
    <div>
      {/* Header — sticky to the scrolling pane */}
      <div
        className="flex items-center gap-3 px-5 py-3 sticky top-0 z-10 bg-white"
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
      <div className="px-5 py-4 space-y-6">
        {/* Details */}
        <Section title="Details">
          {atom.kind === 'input' && (
            <InputAtomDetails atom={atom} onUpdate={onUpdate} />
          )}
          {atom.kind === 'copy-block' && (
            <CopyBlockAtomDetails atom={atom} onUpdate={onUpdate} />
          )}
          {atom.kind === 'preset' && (
            <PresetAtomEditor atom={atom} onUpdate={onUpdate} />
          )}
        </Section>

        {/* Options (selection-type InputAtoms or id-type-select preset) */}
        {atom.kind === 'input' &&
          getFieldTypeMeta(atom.fieldType).supportsOptions && (
            <Section title="Options">
              <OptionsEditor
                options={atom.options ?? []}
                onChange={(next) =>
                  onUpdate({ options: next } as Partial<Atom>)
                }
              />
            </Section>
          )}

        {atom.kind === 'preset' && atom.presetType === 'id-type-select' && (
          <Section title="ID types offered">
            <p
              className="text-[12px] mb-3"
              style={{ color: colors.colorBlack5 }}
            >
              ID types guests can choose from. Use per-option visibility to
              surface specific options only to certain guest segments (e.g.,
              show &ldquo;Carta d&rsquo;Identità&rdquo; only if nationality is Italy).
            </p>
            <OptionsEditor
              options={(atom.config as IdTypeSelectAtomConfig).options as FieldOption[]}
              onChange={(next) => {
                const cfg = atom.config as IdTypeSelectAtomConfig;
                onUpdate({
                  config: {
                    ...cfg,
                    options: next as IdTypeOption[],
                  },
                } as Partial<Atom>);
              }}
            />
          </Section>
        )}

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
  'udf': 'PMS UDFs (hotel-defined)',
};

const FIELD_TYPE_CATEGORY_LABELS: Record<FieldTypeCategory, string> = {
  input: 'Inputs',
  selection: 'Selection',
  specialized: 'Specialized',
  static: 'Static content',
};

function InputAtomDetails({
  atom,
  onUpdate,
}: {
  atom: InputAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const meta = getFieldTypeMeta(atom.fieldType);
  const isStatic = meta.isStatic;
  const supportsAutoSkip = !isStatic;

  const fieldTypeOptions: { value: string; label: string; disabled?: boolean }[] = [];
  (Object.keys(FIELD_TYPES_BY_CATEGORY) as FieldTypeCategory[]).forEach((cat) => {
    fieldTypeOptions.push({
      value: `__sep_${cat}`,
      label: `── ${FIELD_TYPE_CATEGORY_LABELS[cat]} ──`,
      disabled: true,
    });
    FIELD_TYPES_BY_CATEGORY[cat].forEach((m) => {
      fieldTypeOptions.push({ value: m.id, label: m.displayName });
    });
  });

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
      <div>
        <label
          className="text-[11px] font-semibold uppercase tracking-wider mb-1 block"
          style={{ color: colors.colorBlack5 }}
        >
          Field Type
        </label>
        <CanarySelect
          size={InputSize.NORMAL}
          value={atom.fieldType}
          onChange={(e) =>
            onUpdate({ fieldType: e.target.value as FieldType } as Partial<Atom>)
          }
          options={fieldTypeOptions}
        />
        <p className="text-[11px] mt-1" style={{ color: colors.colorBlack5 }}>
          {meta.description}
        </p>
      </div>

      <CanaryInput
        size={InputSize.NORMAL}
        label="Label (EN)"
        placeholder="Field label shown to guest"
        value={atom.label?.['en'] ?? ''}
        onChange={(e) =>
          onUpdate({ label: { ...atom.label, en: e.target.value } } as Partial<Atom>)
        }
      />
      {!isStatic && (
        <>
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
        </>
      )}

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

// ── Preset atom editor ───────────────────────────────────

function PresetAtomEditor({
  atom,
  onUpdate,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  switch (atom.presetType) {
    case 'id-type-select':
      return <IdTypeSelectEditor atom={atom} onUpdate={onUpdate} />;
    case 'id-consent':
      return <IdConsentEditor atom={atom} onUpdate={onUpdate} />;
    case 'id-photo-front':
    case 'id-photo-back':
      return <IdPhotoEditor atom={atom} onUpdate={onUpdate} />;
    case 'id-selfie':
      return <IdSelfieEditor atom={atom} onUpdate={onUpdate} />;
    case 'credit-card-form':
      return <CreditCardEditor atom={atom} onUpdate={onUpdate} />;
    case 'deposit-collection':
      return <DepositCollectionEditor atom={atom} onUpdate={onUpdate} />;
    case 'loyalty-welcome':
      return <LoyaltyWelcomeEditor atom={atom} onUpdate={onUpdate} />;
    case 'completion':
      return <CompletionEditor atom={atom} onUpdate={onUpdate} />;
    default:
      return <PresetAtomDetailsNotice />;
  }
}

// ── Shared helpers ───────────────────────────────────────

function AtomLabelField({
  atom,
  onUpdate,
  helper,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
  helper?: string;
}) {
  return (
    <div>
      <CanaryInput
        size={InputSize.NORMAL}
        label="Display label (EN)"
        placeholder="Internal name shown in editor"
        value={atom.label?.['en'] ?? ''}
        onChange={(e) =>
          onUpdate({ label: { ...atom.label, en: e.target.value } } as Partial<Atom>)
        }
      />
      {helper && (
        <p className="text-[11px] mt-1" style={{ color: colors.colorBlack5 }}>
          {helper}
        </p>
      )}
    </div>
  );
}

function LocalizedField({
  label,
  placeholder,
  value,
  multiline,
  rows,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: LocalizedText | undefined;
  multiline?: boolean;
  rows?: number;
  onChange: (next: LocalizedText) => void;
}) {
  const en = value?.['en'] ?? '';
  const handle = (raw: string) => onChange({ ...(value ?? {}), en: raw });
  if (multiline) {
    return (
      <CanaryTextArea
        size={InputSize.NORMAL}
        label={label}
        placeholder={placeholder}
        rows={rows ?? 4}
        value={en}
        onChange={(e) => handle(e.target.value)}
      />
    );
  }
  return (
    <CanaryInput
      size={InputSize.NORMAL}
      label={label}
      placeholder={placeholder}
      value={en}
      onChange={(e) => handle(e.target.value)}
    />
  );
}

// ── Per-preset editors ───────────────────────────────────

function IdTypeSelectEditor({
  atom,
  onUpdate,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const cfg = atom.config as IdTypeSelectAtomConfig;

  return (
    <>
      <AtomLabelField atom={atom} onUpdate={onUpdate} />

      <label
        className="flex items-center gap-2 text-[12px]"
        style={{ color: colors.colorBlack3 }}
      >
        <CanarySwitch
          checked={cfg.allowMultipleIds}
          onChange={(v) =>
            onUpdate({
              config: { ...cfg, allowMultipleIds: v },
            } as Partial<Atom>)
          }
        />
        Allow multiple IDs
        <span className="text-[11px]" style={{ color: colors.colorBlack5 }}>
          (guest can submit more than one ID document)
        </span>
      </label>
    </>
  );
}

function IdConsentEditor({
  atom,
  onUpdate,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const cfg = atom.config as IdConsentAtomConfig;
  const update = (patch: Partial<IdConsentAtomConfig>) =>
    onUpdate({ config: { ...cfg, ...patch } } as Partial<Atom>);

  return (
    <>
      <AtomLabelField atom={atom} onUpdate={onUpdate} />
      <LocalizedField
        label="Heading (EN)"
        placeholder="Identity verification"
        value={cfg.heading}
        onChange={(v) => update({ heading: v })}
      />
      <LocalizedField
        label="Body (EN)"
        placeholder="Explain why you collect ID and how it's handled"
        multiline
        rows={4}
        value={cfg.body}
        onChange={(v) => update({ body: v })}
      />
      <LocalizedField
        label="Acknowledgment (EN)"
        placeholder="What the guest is consenting to"
        multiline
        rows={2}
        value={cfg.acknowledgment}
        onChange={(v) => update({ acknowledgment: v })}
      />
      <LocalizedField
        label="CTA label (EN)"
        placeholder="Continue"
        value={cfg.ctaLabel}
        onChange={(v) => update({ ctaLabel: v })}
      />
    </>
  );
}

function IdPhotoEditor({
  atom,
  onUpdate,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const cfg = atom.config as IdPhotoAtomConfig;
  const isBack = cfg.presetType === 'id-photo-back';

  return (
    <>
      <AtomLabelField atom={atom} onUpdate={onUpdate} />
      <LocalizedField
        label="Instruction text (EN)"
        placeholder={isBack ? 'Take a photo of the back of your ID' : 'Take a photo of the front of your ID'}
        multiline
        rows={3}
        value={cfg.instructionText}
        onChange={(v) =>
          onUpdate({ config: { ...cfg, instructionText: v } } as Partial<Atom>)
        }
      />
    </>
  );
}

function IdSelfieEditor({
  atom,
  onUpdate,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const cfg = atom.config as IdSelfieAtomConfig;

  return (
    <>
      <AtomLabelField atom={atom} onUpdate={onUpdate} />
      <LocalizedField
        label="Instruction text (EN)"
        placeholder="Take a selfie to verify your ID"
        multiline
        rows={3}
        value={cfg.instructionText}
        onChange={(v) =>
          onUpdate({ config: { ...cfg, instructionText: v } } as Partial<Atom>)
        }
      />
    </>
  );
}

function LoyaltyWelcomeEditor({
  atom,
  onUpdate,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const cfg = atom.config as LoyaltyWelcomeAtomConfig;
  const update = (patch: Partial<LoyaltyWelcomeAtomConfig>) =>
    onUpdate({ config: { ...cfg, ...patch } } as Partial<Atom>);

  return (
    <>
      <AtomLabelField atom={atom} onUpdate={onUpdate} />
      <CanaryInput
        size={InputSize.NORMAL}
        label="Program name"
        placeholder="e.g., Statler Rewards"
        value={cfg.programName}
        onChange={(e) => update({ programName: e.target.value })}
      />
      <LocalizedField
        label="Heading (EN)"
        placeholder="Welcome back, [Name]"
        value={cfg.heading}
        onChange={(v) => update({ heading: v })}
      />
      <LocalizedField
        label="Body (EN)"
        placeholder="Recognition copy shown to loyalty members"
        multiline
        rows={4}
        value={cfg.body}
        onChange={(v) => update({ body: v })}
      />
    </>
  );
}

function CompletionEditor({
  atom,
  onUpdate,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const cfg = atom.config as CompletionAtomConfig;
  const update = (patch: Partial<CompletionAtomConfig>) =>
    onUpdate({ config: { ...cfg, ...patch } } as Partial<Atom>);

  return (
    <>
      <AtomLabelField atom={atom} onUpdate={onUpdate} />
      <LocalizedField
        label="Heading (EN)"
        placeholder="You're all set"
        value={cfg.heading}
        onChange={(v) => update({ heading: v })}
      />
      <LocalizedField
        label="Body (EN)"
        placeholder="Confirmation copy shown after check-in completes"
        multiline
        rows={4}
        value={cfg.body}
        onChange={(v) => update({ body: v })}
      />
      <LocalizedField
        label="CTA label (EN)"
        placeholder="View room key"
        value={cfg.ctaLabel}
        onChange={(v) => update({ ctaLabel: v })}
      />
    </>
  );
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
];

function CreditCardEditor({
  atom,
  onUpdate,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const cfg = atom.config as CreditCardAtomConfig;
  const update = (patch: Partial<CreditCardAtomConfig>) =>
    onUpdate({ config: { ...cfg, ...patch } } as Partial<Atom>);

  return (
    <>
      <AtomLabelField atom={atom} onUpdate={onUpdate} />

      <label
        className="flex items-center gap-2 text-[12px]"
        style={{ color: colors.colorBlack3 }}
      >
        <CanarySwitch
          checked={cfg.requireBillingAddress}
          onChange={(v) => update({ requireBillingAddress: v })}
        />
        Require billing address
        <span className="text-[11px]" style={{ color: colors.colorBlack5 }}>
          (collect address along with card)
        </span>
      </label>

      <label
        className="flex items-center gap-2 text-[12px]"
        style={{ color: colors.colorBlack3 }}
      >
        <CanarySwitch
          checked={cfg.requireCvc}
          onChange={(v) => update({ requireCvc: v })}
        />
        Require CVC
        <span className="text-[11px]" style={{ color: colors.colorBlack5 }}>
          (security code on card back)
        </span>
      </label>

      <label
        className="flex items-center gap-2 text-[12px]"
        style={{ color: colors.colorBlack3 }}
      >
        <CanarySwitch
          checked={cfg.linkedDeposit}
          onChange={(v) => update({ linkedDeposit: v })}
        />
        Use this card for deposit
        <span className="text-[11px]" style={{ color: colors.colorBlack5 }}>
          (skip a separate deposit step if a Deposit atom is in this flow)
        </span>
      </label>
    </>
  );
}

function DepositCollectionEditor({
  atom,
  onUpdate,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const cfg = atom.config as DepositCollectionAtomConfig;
  const update = (patch: Partial<DepositCollectionAtomConfig>) =>
    onUpdate({ config: { ...cfg, ...patch } } as Partial<Atom>);

  return (
    <>
      <AtomLabelField atom={atom} onUpdate={onUpdate} />

      <div className="grid grid-cols-2 gap-3">
        <CanaryInput
          size={InputSize.NORMAL}
          label="Amount"
          placeholder="0.00"
          value={String(cfg.amount ?? 0)}
          onChange={(e) => {
            const n = Number(e.target.value);
            update({ amount: Number.isFinite(n) ? n : 0 });
          }}
        />
        <div>
          <label
            className="text-[11px] font-semibold uppercase tracking-wider mb-1 block"
            style={{ color: colors.colorBlack5 }}
          >
            Currency
          </label>
          <CanarySelect
            size={InputSize.NORMAL}
            value={cfg.currency || 'USD'}
            onChange={(e) => update({ currency: e.target.value })}
            options={CURRENCY_OPTIONS}
          />
        </div>
      </div>

      <label
        className="flex items-center gap-2 text-[12px]"
        style={{ color: colors.colorBlack3 }}
      >
        <CanarySwitch
          checked={cfg.refundable}
          onChange={(v) => update({ refundable: v })}
        />
        Refundable
        <span className="text-[11px]" style={{ color: colors.colorBlack5 }}>
          (released after stay if no incidentals)
        </span>
      </label>

      <LocalizedField
        label="Description (EN)"
        placeholder="What this deposit covers (incidentals, security, etc.)"
        multiline
        rows={3}
        value={cfg.description}
        onChange={(v) => update({ description: v })}
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
      <strong>Preset configuration not yet wired.</strong> Type-specific
      editor for this preset is coming next. For now, you can edit
      visibility conditions below.
    </div>
  );
}
