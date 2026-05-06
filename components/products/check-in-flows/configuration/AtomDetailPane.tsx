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
import {
  mdiClose,
  mdiCellphone,
  mdiApplicationOutline,
  mdiTabletCellphone,
  mdiMonitor,
  mdiInformationOutline,
} from '@mdi/js';
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
  Surface,
  OptionVariant,
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
import { AtomPreview } from './AtomPreview';

export function AtomDetailPane() {
  const selectedAtomId = useCheckInFlowsStore((s) => s.selectedAtomId);
  const allAtoms = useCheckInFlowsStore((s) => s.atoms);
  const updateAtom = useCheckInFlowsStore((s) => s.updateAtom);
  const deselectAtom = useCheckInFlowsStore((s) => s.deselectAtom);
  const allFlows = useCheckInFlowsStore((s) => s.flows);
  const recentlyCreatedAtomId = useCheckInFlowsStore((s) => s.recentlyCreatedAtomId);
  const clearNewlyCreatedAtom = useCheckInFlowsStore((s) => s.clearNewlyCreatedAtom);
  const pendingCloseAtomEditor = useCheckInFlowsStore((s) => s.pendingCloseAtomEditor);

  const [savedToast, setSavedToast] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<Atom | null>(null);
  const [confirmCloseOpen, setConfirmCloseOpen] = React.useState(false);

  const storedAtom = selectedAtomId
    ? allAtoms.find((a) => a.id === selectedAtomId)
    : null;

  // Reset draft whenever the selected atom changes — picking a different
  // component discards any in-progress edits on the previous one (which
  // is fine because the close-confirmation flow already gave the user
  // a chance to save before they got here).
  React.useEffect(() => {
    setDraft(storedAtom ?? null);
    setConfirmCloseOpen(false);
  }, [selectedAtomId, storedAtom?.id]);

  React.useEffect(() => {
    if (savedToast === null) return;
    const t = setTimeout(() => setSavedToast(null), 3500);
    return () => clearTimeout(t);
  }, [savedToast]);

  // Dirty check via shallow JSON. Good enough for a prototype — atoms
  // are small. If draft is null, we treat it as clean.
  const isDirty = React.useMemo(() => {
    if (!draft || !storedAtom) return false;
    return JSON.stringify(draft) !== JSON.stringify(storedAtom);
  }, [draft, storedAtom]);

  // Modal backdrop / Escape / X button all funnel through
  // pendingCloseAtomEditor. Decide here whether to close or prompt.
  const lastCloseRequestRef = React.useRef(pendingCloseAtomEditor);
  React.useEffect(() => {
    if (pendingCloseAtomEditor === lastCloseRequestRef.current) return;
    lastCloseRequestRef.current = pendingCloseAtomEditor;
    if (!storedAtom) {
      deselectAtom();
      return;
    }
    if (isDirty) {
      setConfirmCloseOpen(true);
    } else {
      deselectAtom();
    }
  }, [pendingCloseAtomEditor, isDirty, storedAtom, deselectAtom]);

  if (!storedAtom || !draft) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="mb-4">
          <p className="text-[12px]" style={{ color: colors.colorBlack3 }}>
            Select a component from the left to edit its details and visibility.
          </p>
        </div>
        <SettingsHandledElsewhere />
      </div>
    );
  }

  const atom = draft;
  const display = describeAtom(atom);

  const onUpdate = (updates: Partial<Atom>) => {
    setDraft((prev) => (prev ? ({ ...prev, ...updates } as Atom) : prev));
  };
  const onConditionsChange = (next: Condition[]) =>
    onUpdate({ conditions: next.length > 0 ? next : undefined } as Partial<Atom>);

  const handleSave = () => {
    if (!draft || !storedAtom) return;
    updateAtom(storedAtom.id, draft);
    setSavedToast(Date.now());
  };

  const handleSaveAndClose = () => {
    handleSave();
    setConfirmCloseOpen(false);
    deselectAtom();
  };

  const handleDiscardAndClose = () => {
    setConfirmCloseOpen(false);
    deselectAtom();
  };

  const handleDiscard = () => {
    if (storedAtom) setDraft(storedAtom);
  };

  // Flows that reference this atom — surface to CS so they know edits
  // propagate everywhere it's used.
  const usedInFlowNames = allFlows
    .filter((f) => f.steps.some((step) => (step.atomIds ?? []).includes(atom.id)))
    .map((f) => f.name);
  const notYetInFlowNames = allFlows
    .filter((f) => f.kind === 'main' && !f.steps.some((step) => (step.atomIds ?? []).includes(atom.id)))
    .map((f) => f.name);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header — fixed at top of pane via flex layout (no sticky) */}
      <div
        className="flex items-center gap-3 px-5 py-3 shrink-0 bg-white"
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
          <p className="text-[11px]" style={{ color: colors.colorBlack4 }}>
            {usedInFlowNames.length > 0
              ? `Used in: ${usedInFlowNames.join(', ')}. Edits apply everywhere.`
              : 'Not yet used in any flow.'}
            {notYetInFlowNames.length > 0 && (
              <span style={{ color: colors.colorBlack5 }}>
                {' '}Not in: {notYetInFlowNames.join(', ')} — add manually if needed.
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            if (isDirty) setConfirmCloseOpen(true);
            else deselectAtom();
          }}
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

      {/* Newly-created banner — shown when a fresh component was just
          added (e.g., via "Create new component" in the flow editor).
          The component is now in the Library and applies anywhere it's
          referenced, but other flows won't pick it up automatically.
          This banner is loud on purpose — Vibhor flagged the previous
          subtle subtitle as easy to miss. */}
      {recentlyCreatedAtomId === atom.id && (
        <div
          className="shrink-0 px-4 py-3 flex items-start gap-3"
          style={{
            borderBottom: `1px solid ${colors.colorBlueDark4}`,
            backgroundColor: colors.colorBlueDark5,
          }}
        >
          <Icon
            path={mdiInformationOutline}
            size={0.8}
            color={colors.colorBlueDark1}
          />
          <div className="flex-1 min-w-0">
            <div
              className="text-[13px] font-bold mb-1"
              style={{ color: colors.colorBlueDark1 }}
            >
              New component added to your Library
            </div>
            <div
              className="text-[12px] leading-relaxed"
              style={{ color: colors.colorBlack2 }}
            >
              It&rsquo;s available across every flow now, but only added to
              the step you created it from.
              {notYetInFlowNames.length > 0 && (
                <>
                  {' '}To use it on{' '}
                  <span className="font-semibold">
                    {notYetInFlowNames.join(', ')}
                  </span>
                  , open that flow and add it to a step manually.
                </>
              )}
            </div>
          </div>
          <button
            onClick={clearNewlyCreatedAtom}
            className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded transition-colors"
            style={{
              color: colors.colorBlueDark1,
              border: `1px solid ${colors.colorBlueDark4}`,
              backgroundColor: '#FFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.colorBlueDark5;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF';
            }}
          >
            Got it
          </button>
        </div>
      )}

      {/* Saved toast — appears for ~3.5s after any edit. Lists which
          flows the change just propagated to + which surfaces still
          need the atom added manually. */}
      {savedToast !== null && (
        <div
          className="shrink-0 px-4 py-2.5 flex items-start gap-2.5 animate-fade-in"
          style={{
            borderBottom: `1px solid ${colors.colorBlack7}`,
            backgroundColor: '#E7F5EC',
          }}
        >
          <span style={{ color: '#1B5E20', fontSize: 13, lineHeight: 1, marginTop: 1 }}>✓</span>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold" style={{ color: '#1B5E20' }}>
              Saved.{' '}
              {usedInFlowNames.length > 0
                ? `Applied to: ${usedInFlowNames.join(', ')}.`
                : 'Component updated in Library.'}
            </div>
            {notYetInFlowNames.length > 0 && (
              <div className="text-[11px] mt-0.5" style={{ color: colors.colorBlack4 }}>
                Add manually to: {notYetInFlowNames.join(', ')} if needed.
              </div>
            )}
          </div>
          <button
            onClick={() => setSavedToast(null)}
            className="text-[11px] shrink-0"
            style={{ color: colors.colorBlack5 }}
          >
            <Icon path={mdiClose} size={0.5} />
          </button>
        </div>
      )}

      {/* Body — owns the scroll within the bounded pane */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Preview (InputAtom only — preset + copy block previews TBD) */}
        {atom.kind === 'input' && <AtomPreview atom={atom} />}

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

        {/* Surface coverage removed in flow-first pivot — which surfaces
            collect an atom is now controlled by which flows include it
            via atomIds, not a per-atom 4-toggle editor. */}

        {/* Options (selection-type InputAtoms — variant model) */}
        {atom.kind === 'input' &&
          getFieldTypeMeta(atom.fieldType).supportsOptions && (
            <Section title="Options">
              <OptionsEditor
                variants={atom.optionVariants ?? []}
                onChange={(next) =>
                  onUpdate({ optionVariants: next } as Partial<Atom>)
                }
              />
            </Section>
          )}

        {/* Field visibility — gates the whole component (separate from
            variant conditions inside Options, which switch the option set). */}
        <Section title="Field visibility">
          <p
            className="text-[11px] mb-2"
            style={{ color: colors.colorBlack4 }}
          >
            When the entire component shows. Use this to gate on guest
            attributes (e.g., show only to Diamond members). Variant
            conditions inside Options are separate — those switch which
            option list applies, not whether the field appears.
          </p>
          <ConditionRuleEditor
            conditions={atom.conditions ?? []}
            onChange={onConditionsChange}
            scope="field"
            emptyLabel="Field is always shown"
            emptyHint="Add a condition to show this field only to specific guests."
          />
        </Section>
      </div>

      {/* Save bar — pinned to the bottom of the pane. Only shows when
          there are unsaved changes; clean state hides the bar entirely
          so it doesn't add chrome. */}
      {isDirty && (
        <div
          className="shrink-0 flex items-center justify-end gap-2 px-5 py-3"
          style={{
            borderTop: `1px solid ${colors.colorBlack7}`,
            backgroundColor: '#FAFAFA',
          }}
        >
          <span
            className="mr-auto text-[11px]"
            style={{ color: colors.colorBlack4 }}
          >
            Unsaved changes
          </span>
          <button
            onClick={handleDiscard}
            className="text-[12px] font-semibold px-3 h-8 rounded-md transition-colors"
            style={{
              color: colors.colorBlack3,
              border: `1px solid ${colors.colorBlack6}`,
              backgroundColor: '#FFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.colorBlack8;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF';
            }}
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="text-[12px] font-semibold px-3 h-8 rounded-md transition-colors text-white"
            style={{ backgroundColor: colors.colorBlueDark1 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.colorBlueDark2;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.colorBlueDark1;
            }}
          >
            Save changes
          </button>
        </div>
      )}

      {/* Unsaved-changes confirm modal. Triggered by the X button or the
          parent modal's backdrop/Escape when isDirty. Three options:
          continue editing, save and close, or discard changes. */}
      {confirmCloseOpen && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(15, 15, 20, 0.55)' }}
        >
          <div
            className="w-[360px] max-w-[92%] bg-white rounded-lg p-5"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
          >
            <h4
              className="text-[15px] font-bold mb-1"
              style={{ color: colors.colorBlack1 }}
            >
              Unsaved changes
            </h4>
            <p
              className="text-[12px] mb-4 leading-relaxed"
              style={{ color: colors.colorBlack3 }}
            >
              You have unsaved edits to this component. What would you like
              to do?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveAndClose}
                className="text-[13px] font-semibold px-3 h-9 rounded-md text-white transition-colors"
                style={{ backgroundColor: colors.colorBlueDark1 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.colorBlueDark2;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.colorBlueDark1;
                }}
              >
                Save changes and close
              </button>
              <button
                onClick={() => setConfirmCloseOpen(false)}
                className="text-[13px] font-semibold px-3 h-9 rounded-md transition-colors"
                style={{
                  color: colors.colorBlack2,
                  border: `1px solid ${colors.colorBlack6}`,
                  backgroundColor: '#FFF',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.colorBlack8;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFF';
                }}
              >
                Continue editing
              </button>
              <button
                onClick={handleDiscardAndClose}
                className="text-[12px] font-medium px-3 h-8 rounded-md transition-colors"
                style={{ color: colors.danger }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FBE9E9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Discard changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section ──────────────────────────────────────────

const SURFACE_TOGGLES: Array<{ key: Surface; label: string; icon: string }> = [
  { key: 'mobile-web', label: 'Mobile Check-In', icon: mdiCellphone },
  { key: 'mobile-app', label: 'Mobile SDK', icon: mdiApplicationOutline },
  { key: 'tablet-reg', label: 'Tablet Registration', icon: mdiTabletCellphone },
  { key: 'kiosk', label: 'Kiosk', icon: mdiMonitor },
];

function DeviceVisibilityEditor({
  atom,
  onUpdate,
}: {
  atom: Atom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  return (
    <div className="space-y-1">
      {SURFACE_TOGGLES.map(({ key, label, icon }) => {
        const checked = atom.deviceVisibility[key] ?? false;
        const setVal = (v: boolean) =>
          onUpdate({
            deviceVisibility: { ...atom.deviceVisibility, [key]: v },
          } as Partial<Atom>);
        return (
          <div
            key={key}
            className="flex items-center gap-3 py-1.5 cursor-pointer select-none"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setVal(!checked)}
          >
            <Icon
              path={icon}
              size={0.65}
              color={checked ? colors.colorBlueDark1 : colors.colorBlack5}
            />
            <span
              className="flex-1 text-[12px]"
              style={{ color: colors.colorBlack3 }}
            >
              {label}
            </span>
            <span style={{ pointerEvents: 'none' }}>
              <CanarySwitch checked={checked} onChange={() => {}} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  // CanarySwitch internally has a sr-only <input type="checkbox"> for a11y.
  // When the click lands on that input the browser scrolls it into view,
  // which on this page collapses the split-pane perception. Solution:
  // make the switch purely visual via pointer-events: none and let the
  // outer div own the click.
  return (
    <div
      className="flex items-start gap-3 cursor-pointer select-none"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onChange(!checked)}
    >
      <div className="shrink-0 mt-0.5" style={{ pointerEvents: 'none' }}>
        <CanarySwitch checked={checked} onChange={() => {}} />
      </div>
      <div className="min-w-0">
        <div className="text-[13px]" style={{ color: colors.colorBlack2 }}>
          {label}
        </div>
        {description && (
          <div className="text-[11px] mt-0.5" style={{ color: colors.colorBlack4 }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

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
};

function InputAtomDetails({
  atom,
  onUpdate,
}: {
  atom: InputAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const meta = getFieldTypeMeta(atom.fieldType);

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
      <CanarySelect
        size={InputSize.NORMAL}
        label="Field type"
        helperText={meta.description}
        value={atom.fieldType}
        onChange={(e) =>
          onUpdate({ fieldType: e.target.value as FieldType } as Partial<Atom>)
        }
        options={fieldTypeOptions}
      />

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
        label="Placeholder (EN)"
        placeholder="Optional placeholder text"
        value={atom.placeholder?.['en'] ?? ''}
        onChange={(e) =>
          onUpdate({
            placeholder: { ...(atom.placeholder ?? {}), en: e.target.value },
          } as Partial<Atom>)
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

      <CanarySelect
        size={InputSize.NORMAL}
        label="PMS mapping"
        value={atom.pmsTag ?? ''}
        onChange={(e) =>
          onUpdate({
            pmsTag: (e.target.value as ElementTag) || undefined,
          } as Partial<Atom>)
        }
        options={tagOptions}
      />

      <ToggleRow
        checked={atom.required}
        onChange={(v) => onUpdate({ required: v } as Partial<Atom>)}
        label="Required"
        description="Guest must answer to continue."
      />

      {/* Auto-skip-if-filled removed in flow-first pivot — now default-on
          runtime behavior (autofill from PMS / prior flow). No CS toggle. */}
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

      <ToggleRow
        checked={cfg.requireBillingAddress}
        onChange={(v) => update({ requireBillingAddress: v })}
        label="Require billing address"
        description="Collect address along with card."
      />

      <ToggleRow
        checked={cfg.requireCvc}
        onChange={(v) => update({ requireCvc: v })}
        label="Require CVC"
        description="Security code on card back."
      />

      <ToggleRow
        checked={cfg.linkedDeposit}
        onChange={(v) => update({ linkedDeposit: v })}
        label="Use this card for deposit"
        description="Skip a separate deposit step if a Deposit component is in this flow."
      />
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
        <CanarySelect
          size={InputSize.NORMAL}
          label="Currency"
          value={cfg.currency || 'USD'}
          onChange={(e) => update({ currency: e.target.value })}
          options={CURRENCY_OPTIONS}
        />
      </div>

      <ToggleRow
        checked={cfg.refundable}
        onChange={(v) => update({ refundable: v })}
        label="Refundable"
        description="Released after stay if no incidentals."
      />

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
