'use client';

/**
 * AtomRow — reusable row for one Global Config atom.
 *
 * Renders a single Atom (input / preset / copy-block) with:
 * - icon + display label
 * - PMS tag chip (input atoms only) or kind chip (preset/copy)
 * - required toggle (input atoms only)
 * - 4 device-visibility toggle pills (Web / Mobile / Tablet / Kiosk)
 * - conditions count + edit affordance
 * - delete affordance
 *
 * Architecture: this component is presentational. Data + handlers come
 * via props. Used by DomainSection (Phase 1c).
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiWeb,
  mdiCellphone,
  mdiTabletCellphone,
  mdiMonitor,
  mdiTextBoxOutline,
  mdiPuzzleOutline,
  mdiTagOutline,
  mdiTuneVariant,
  mdiPencilOutline,
  mdiDelete,
  mdiAlertOutline,
  mdiShieldCheckOutline,
  mdiCardAccountDetailsOutline,
  mdiCameraOutline,
  mdiCreditCardOutline,
  mdiSafeSquareOutline,
  mdiStarOutline,
  mdiCheckCircleOutline,
} from '@mdi/js';
import {
  CanarySwitch,
  CanaryTag,
  TagSize,
  TagColor,
  CanaryInput,
  CanarySelect,
  CanaryTextArea,
  InputSize,
  colors,
} from '@canary-ui/components';

import type {
  Atom,
  InputAtom,
  PresetAtom,
  CopyBlockAtom,
  PresetAtomType,
  DeviceVisibility,
  Surface,
  Condition,
  ElementTag,
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { getFieldTypeMeta } from '@/lib/products/check-in-flows/field-types';
import {
  ELEMENT_TAGS,
  ELEMENT_TAGS_BY_CATEGORY,
  type TagCategory,
} from '@/lib/products/check-in-flows/element-tags';
import { ConditionRuleEditor } from '../editors/ConditionRuleEditor';

interface Props {
  atom: Atom;
  onUpdate: (updates: Partial<Atom>) => void;
  onRemove?: () => void;
}

/**
 * Atom-level condition editor scope.
 *
 * Conditions on an atom are guest-attribute-based gates (nationality, age, loyalty,
 * etc.) — NOT device. Per-device visibility is handled by the 4-toggle row above.
 *
 * The action defaults to 'show' since atom-level conditions are gating *whether
 * this atom collects data for this guest*. The runtime evaluates the conditions
 * and renders the atom only when they all match.
 */

export function AtomRow({ atom, onUpdate, onRemove }: Props) {
  const [conditionsExpanded, setConditionsExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const handleConditionsChange = (next: Condition[]) => {
    onUpdate({ conditions: next.length > 0 ? next : undefined } as Partial<Atom>);
  };

  const handleEditConditions = () => setConditionsExpanded((v) => !v);
  const handleEditDetails = () => setDetailsExpanded((v) => !v);

  const headerProps = {
    onUpdate,
    onEditConditions: handleEditConditions,
    onEditDetails: handleEditDetails,
    detailsOpen: detailsExpanded,
    onRemove,
  };

  let header: React.ReactNode;
  if (atom.kind === 'input') {
    header = <InputAtomRow atom={atom} {...headerProps} />;
  } else if (atom.kind === 'preset') {
    header = <PresetAtomRow atom={atom} {...headerProps} />;
  } else {
    header = <CopyBlockAtomRow atom={atom} {...headerProps} />;
  }

  // Phase 4: warn if required input atom isn't visible on any surface —
  // misconfiguration that prevents the requirement from ever being satisfied.
  const hiddenRequired =
    atom.kind === 'input' &&
    atom.required &&
    !Object.values(atom.deviceVisibility).some((v) => v);

  return (
    <div>
      {header}
      {hiddenRequired && (
        <div
          className="px-3 py-1.5 -mt-1 flex items-center gap-2 rounded-b-md text-[11px]"
          style={{
            backgroundColor: '#FEF3C7',
            border: `1px solid #FCD34D`,
            borderTop: 'none',
            color: '#92400E',
          }}
        >
          <Icon path={mdiAlertOutline} size={0.55} color="#92400E" />
          Required, but hidden on all surfaces — guests can't satisfy this.
          Either un-require it or enable on at least one surface.
        </div>
      )}
      {detailsExpanded && (
        <div
          className="rounded-b-md px-3 py-3 -mt-1"
          style={{
            border: `1px solid ${colors.colorBlack7}`,
            borderTop: 'none',
            backgroundColor: '#FAFAFA',
          }}
        >
          <AtomDetailsEditor atom={atom} onUpdate={onUpdate} />
        </div>
      )}
      {conditionsExpanded && (
        <div
          className="rounded-b-md px-3 py-3 -mt-1"
          style={{
            border: `1px solid ${colors.colorBlack7}`,
            borderTop: 'none',
            backgroundColor: colors.colorBlack8,
          }}
        >
          <ConditionRuleEditor
            conditions={atom.conditions ?? []}
            onChange={handleConditionsChange}
            scope="field"
            emptyLabel="No visibility conditions"
            emptyHint="Add a condition to gate this atom on guest attributes (nationality, age, loyalty, rate code)."
          />
        </div>
      )}
    </div>
  );
}

// ── Input variant ─────────────────────────────────────

function InputAtomRow({
  atom,
  onUpdate,
  onEditConditions,
  onEditDetails,
  detailsOpen,
  onRemove,
}: {
  atom: InputAtom;
  onUpdate: (updates: Partial<Atom>) => void;
  onEditConditions?: () => void;
  onEditDetails?: () => void;
  detailsOpen?: boolean;
  onRemove?: () => void;
}) {
  const typeMeta = getFieldTypeMeta(atom.fieldType);
  const tagMeta = atom.pmsTag ? ELEMENT_TAGS.find((t) => t.id === atom.pmsTag) : null;
  const conditionCount = atom.conditions?.length ?? 0;

  return (
    <RowShell>
      <RowHeader
        icon={typeMeta.icon}
        title={resolveText(atom.label)}
        rightSlot={
          tagMeta ? (
            <TagChip
              label={tagMeta.pmsField}
              tooltip={`PMS tag: ${tagMeta.displayName}`}
            />
          ) : null
        }
        onEditDetails={onEditDetails}
        detailsOpen={detailsOpen}
        onRemove={onRemove}
      />
      <RowControls
        leftSlot={
          <RequiredToggle
            checked={atom.required}
            onChange={(v) => onUpdate({ required: v } as Partial<Atom>)}
          />
        }
        deviceVisibility={atom.deviceVisibility}
        onDeviceToggle={(surface) =>
          onUpdate({
            deviceVisibility: {
              ...atom.deviceVisibility,
              [surface]: !atom.deviceVisibility[surface],
            },
          } as Partial<Atom>)
        }
        conditionCount={conditionCount}
        onEditConditions={onEditConditions}
      />
    </RowShell>
  );
}

// ── Preset variant ────────────────────────────────────

function PresetAtomRow({
  atom,
  onUpdate,
  onEditConditions,
  onEditDetails,
  detailsOpen,
  onRemove,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
  onEditConditions?: () => void;
  onEditDetails?: () => void;
  detailsOpen?: boolean;
  onRemove?: () => void;
}) {
  const conditionCount = atom.conditions?.length ?? 0;

  return (
    <RowShell>
      <RowHeader
        icon={getPresetIcon(atom.presetType)}
        title={resolveText(atom.label)}
        rightSlot={<TagChip label="PRESET" />}
        onEditDetails={onEditDetails}
        detailsOpen={detailsOpen}
        onRemove={onRemove}
      />
      <RowControls
        deviceVisibility={atom.deviceVisibility}
        onDeviceToggle={(surface) =>
          onUpdate({
            deviceVisibility: {
              ...atom.deviceVisibility,
              [surface]: !atom.deviceVisibility[surface],
            },
          } as Partial<Atom>)
        }
        conditionCount={conditionCount}
        onEditConditions={onEditConditions}
      />
    </RowShell>
  );
}

// ── Copy-block variant ────────────────────────────────

function CopyBlockAtomRow({
  atom,
  onUpdate,
  onEditConditions,
  onEditDetails,
  detailsOpen,
  onRemove,
}: {
  atom: CopyBlockAtom;
  onUpdate: (updates: Partial<Atom>) => void;
  onEditConditions?: () => void;
  onEditDetails?: () => void;
  detailsOpen?: boolean;
  onRemove?: () => void;
}) {
  const conditionCount = atom.conditions?.length ?? 0;
  const preview = resolveText(atom.content);
  const truncated = preview.length > 100 ? preview.slice(0, 100) + '…' : preview;

  return (
    <RowShell>
      <RowHeader
        icon={mdiTextBoxOutline}
        title={atom.name}
        rightSlot={<TagChip label="COPY" />}
        onEditDetails={onEditDetails}
        detailsOpen={detailsOpen}
        onRemove={onRemove}
      />
      {preview && (
        <p
          className="px-3 pb-2 text-[12px] italic"
          style={{ color: colors.colorBlack5, marginTop: -4 }}
        >
          “{truncated}”
        </p>
      )}
      <RowControls
        deviceVisibility={atom.deviceVisibility}
        onDeviceToggle={(surface) =>
          onUpdate({
            deviceVisibility: {
              ...atom.deviceVisibility,
              [surface]: !atom.deviceVisibility[surface],
            },
          } as Partial<Atom>)
        }
        conditionCount={conditionCount}
        onEditConditions={onEditConditions}
      />
    </RowShell>
  );
}

// ── Building blocks ───────────────────────────────────

function RowShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-md bg-white"
      style={{ border: `1px solid ${colors.colorBlack7}` }}
    >
      {children}
    </div>
  );
}

function RowHeader({
  icon,
  title,
  rightSlot,
  onEditDetails,
  detailsOpen,
  onRemove,
}: {
  icon: string;
  title: string;
  rightSlot?: React.ReactNode;
  onEditDetails?: () => void;
  detailsOpen?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{ borderBottom: `1px solid ${colors.colorBlack8}` }}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#F4F4F5' }}
      >
        <Icon path={icon} size={0.75} color="#555" />
      </div>
      <span
        className="flex-1 truncate text-[13px] font-semibold"
        style={{ color: colors.colorBlack2 }}
      >
        {title}
      </span>
      {rightSlot}
      {onEditDetails && (
        <button
          onClick={onEditDetails}
          className="w-7 h-7 rounded flex items-center justify-center transition-colors"
          style={{
            color: detailsOpen ? colors.colorBlueDark1 : colors.colorBlack5,
            backgroundColor: detailsOpen ? colors.colorBlueDark5 : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!detailsOpen) e.currentTarget.style.backgroundColor = colors.colorBlack8;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = detailsOpen ? colors.colorBlueDark5 : 'transparent';
          }}
          title={detailsOpen ? 'Close details' : 'Edit details'}
        >
          <Icon path={mdiPencilOutline} size={0.6} />
        </button>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded flex items-center justify-center transition-colors"
          style={{ color: colors.colorBlack5 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.danger;
            e.currentTarget.style.backgroundColor = '#FDECEF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.colorBlack5;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Remove atom"
        >
          <Icon path={mdiDelete} size={0.6} />
        </button>
      )}
    </div>
  );
}

function RowControls({
  leftSlot,
  deviceVisibility,
  onDeviceToggle,
  conditionCount,
  onEditConditions,
}: {
  leftSlot?: React.ReactNode;
  deviceVisibility: DeviceVisibility;
  onDeviceToggle: (surface: Surface) => void;
  conditionCount: number;
  onEditConditions?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 flex-wrap">
      {leftSlot && <div className="shrink-0">{leftSlot}</div>}
      <DeviceToggleRow visibility={deviceVisibility} onToggle={onDeviceToggle} />
      <div className="flex-1" />
      <ConditionsButton count={conditionCount} onClick={onEditConditions} />
    </div>
  );
}

function RequiredToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className="flex items-center gap-1.5 text-[12px]"
      style={{ color: colors.colorBlack4 }}
    >
      <CanarySwitch checked={checked} onChange={onChange} />
      Required
    </label>
  );
}

const SURFACE_PILLS: { surface: Surface; icon: string; label: string }[] = [
  { surface: 'web', icon: mdiWeb, label: 'Web' },
  { surface: 'mobile-web', icon: mdiCellphone, label: 'Mobile' },
  { surface: 'tablet-reg', icon: mdiTabletCellphone, label: 'Tablet' },
  { surface: 'kiosk', icon: mdiMonitor, label: 'Kiosk' },
];

function DeviceToggleRow({
  visibility,
  onToggle,
}: {
  visibility: DeviceVisibility;
  onToggle: (surface: Surface) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {SURFACE_PILLS.map(({ surface, icon, label }) => {
        const on = visibility[surface];
        return (
          <button
            key={surface}
            onClick={() => onToggle(surface)}
            className="inline-flex items-center gap-1 px-2 h-7 rounded-full text-[11px] font-medium transition-colors"
            style={{
              backgroundColor: on ? colors.colorBlueDark5 : 'transparent',
              color: on ? colors.colorBlueDark1 : colors.colorBlack5,
              border: `1px solid ${on ? colors.colorBlueDark4 : colors.colorBlack7}`,
            }}
            title={`${label}: ${on ? 'visible' : 'hidden'}`}
          >
            <Icon
              path={icon}
              size={0.55}
              color={on ? colors.colorBlueDark1 : colors.colorBlack5}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function ConditionsButton({
  count,
  onClick,
}: {
  count: number;
  onClick?: () => void;
}) {
  if (count === 0) {
    return (
      <button
        onClick={onClick}
        disabled={!onClick}
        className="inline-flex items-center gap-1 px-2 h-7 rounded text-[11px] font-medium transition-colors"
        style={{
          color: onClick ? colors.colorBlueDark1 : colors.colorBlack5,
          opacity: onClick ? 1 : 0.6,
        }}
        onMouseEnter={(e) => {
          if (onClick) e.currentTarget.style.backgroundColor = colors.colorBlueDark5;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title={onClick ? 'Add a visibility condition' : 'No conditions'}
      >
        <Icon path={mdiTuneVariant} size={0.55} />
        Add condition
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 h-7 rounded text-[11px] font-semibold transition-colors"
      style={{
        backgroundColor: colors.colorBlueDark5,
        color: colors.colorBlueDark1,
      }}
      title={`${count} visibility condition${count === 1 ? '' : 's'} — click to edit`}
    >
      <Icon path={mdiTuneVariant} size={0.55} />
      {count} condition{count === 1 ? '' : 's'}
      <Icon path={mdiPencilOutline} size={0.5} />
    </button>
  );
}

function TagChip({ label, tooltip }: { label: string; tooltip?: string }) {
  return (
    <span
      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
      style={{
        backgroundColor: colors.colorBlack8,
        color: colors.colorBlack4,
        border: `1px solid ${colors.colorBlack7}`,
      }}
      title={tooltip}
    >
      {label}
    </span>
  );
}

function getPresetIcon(presetType: PresetAtomType): string {
  switch (presetType) {
    case 'id-consent': return mdiShieldCheckOutline;
    case 'id-type-select': return mdiCardAccountDetailsOutline;
    case 'id-photo-front':
    case 'id-photo-back':
    case 'id-selfie':
      return mdiCameraOutline;
    case 'credit-card-form': return mdiCreditCardOutline;
    case 'deposit-collection': return mdiSafeSquareOutline;
    case 'loyalty-welcome': return mdiStarOutline;
    case 'completion': return mdiCheckCircleOutline;
    default: return mdiPuzzleOutline;
  }
}

// ── Details editor (Phase 2a) ─────────────────────────

const TAG_CATEGORY_LABELS: Record<TagCategory, string> = {
  'guest-info': 'Guest Info',
  'contact': 'Contact',
  'address': 'Address',
  'stay': 'Stay',
  'identification': 'Identification',
  'loyalty': 'Loyalty',
  'other': 'Other',
};

function AtomDetailsEditor({
  atom,
  onUpdate,
}: {
  atom: Atom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  if (atom.kind === 'input') {
    return <InputAtomDetailsEditor atom={atom} onUpdate={onUpdate} />;
  }
  if (atom.kind === 'copy-block') {
    return <CopyBlockAtomDetailsEditor atom={atom} onUpdate={onUpdate} />;
  }
  return <PresetAtomDetailsNotice />;
}

function InputAtomDetailsEditor({
  atom,
  onUpdate,
}: {
  atom: InputAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  const supportsAutoSkip = !getFieldTypeMeta(atom.fieldType).isStatic;

  // Build PMS tag options with disabled separator rows by category
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
    <div className="space-y-3">
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
            onChange={(v) =>
              onUpdate({ autoSkipIfFilled: v } as Partial<Atom>)
            }
          />
          Auto-skip if already filled
          <span className="text-[11px]" style={{ color: colors.colorBlack5 }}>
            (skips on subsequent flows when prior surface captured the data)
          </span>
        </label>
      )}
    </div>
  );
}

function CopyBlockAtomDetailsEditor({
  atom,
  onUpdate,
}: {
  atom: CopyBlockAtom;
  onUpdate: (updates: Partial<Atom>) => void;
}) {
  return (
    <div className="space-y-3">
      <CanaryInput
        size={InputSize.NORMAL}
        label="Name"
        placeholder="CS-facing identifier (e.g., Hotel Policies)"
        value={atom.name}
        onChange={(e) =>
          onUpdate({ name: e.target.value } as Partial<Atom>)
        }
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
    </div>
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
      <strong>Preset configuration is currently fixed in code.</strong> Phase 3
      will decompose multi-stage presets and expose their per-stage
      configuration here. For now, edit conditions and device visibility above.
    </div>
  );
}
