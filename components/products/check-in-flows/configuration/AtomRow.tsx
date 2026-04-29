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

import React from 'react';
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
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { getFieldTypeMeta } from '@/lib/products/check-in-flows/field-types';
import { ELEMENT_TAGS } from '@/lib/products/check-in-flows/element-tags';

interface Props {
  atom: Atom;
  onUpdate: (updates: Partial<Atom>) => void;
  onEditConditions?: () => void;
  onRemove?: () => void;
}

export function AtomRow({ atom, onUpdate, onEditConditions, onRemove }: Props) {
  if (atom.kind === 'input') {
    return <InputAtomRow atom={atom} onUpdate={onUpdate} onEditConditions={onEditConditions} onRemove={onRemove} />;
  }
  if (atom.kind === 'preset') {
    return <PresetAtomRow atom={atom} onUpdate={onUpdate} onEditConditions={onEditConditions} onRemove={onRemove} />;
  }
  return <CopyBlockAtomRow atom={atom} onUpdate={onUpdate} onEditConditions={onEditConditions} onRemove={onRemove} />;
}

// ── Input variant ─────────────────────────────────────

function InputAtomRow({
  atom,
  onUpdate,
  onEditConditions,
  onRemove,
}: {
  atom: InputAtom;
  onUpdate: (updates: Partial<Atom>) => void;
  onEditConditions?: () => void;
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
  onRemove,
}: {
  atom: PresetAtom;
  onUpdate: (updates: Partial<Atom>) => void;
  onEditConditions?: () => void;
  onRemove?: () => void;
}) {
  const conditionCount = atom.conditions?.length ?? 0;

  return (
    <RowShell>
      <RowHeader
        icon={getPresetIcon(atom.presetType)}
        title={resolveText(atom.label)}
        rightSlot={<TagChip label="PRESET" />}
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
  onRemove,
}: {
  atom: CopyBlockAtom;
  onUpdate: (updates: Partial<Atom>) => void;
  onEditConditions?: () => void;
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
  onRemove,
}: {
  icon: string;
  title: string;
  rightSlot?: React.ReactNode;
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
