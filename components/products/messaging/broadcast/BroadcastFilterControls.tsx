/**
 * BroadcastFilterControls — the attribute controls for the filter surface.
 *
 * Extracted from the Builder modal before it was deleted. The team jam settled
 * on a PANEL rather than a modal, but the Builder's control anatomy and its
 * live-match logic won, so they survive here as primitives the panel composes.
 *
 * Sized for a panel column rather than a 760px modal: the loyalty chips are
 * smaller, and the type-to-chip inputs carry their chips INSIDE the field.
 */

'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiCloseCircle } from '@mdi/js';
import { colors, CanaryInput, InputSize } from '@canary-ui/components';
import {
  BroadcastFilterCriteria,
  LoyaltyTier,
} from '@/lib/products/messaging/broadcast-types';

export const LOYALTY_TIERS: { value: LoyaltyTier; label: string }[] = [
  { value: 'non-member', label: 'Non-member' },
  { value: 'club-member', label: 'Club Member' },
  { value: 'silver-elite', label: 'Silver Elite' },
  { value: 'gold-elite', label: 'Gold Elite' },
  { value: 'platinum-elite', label: 'Platinum Elite' },
  { value: 'diamond-elite', label: 'Diamond Elite' },
];

/** Section label above each attribute group. */
export function FilterSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px]"
      style={{ color: colors.colorBlack1, marginBottom: 8 }}
    >
      {children}
    </p>
  );
}

/**
 * Small selectable chip — loyalty tiers and the binary attributes both use it.
 * Deliberately smaller than the modal's 40px pills: the panel is one narrow
 * column, and six tiers have to sit in it without becoming the whole view.
 */
export function FilterChip({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[6px] font-['Roboto',sans-serif] text-[12px] font-medium leading-[18px] transition-colors cursor-pointer"
      style={{
        height: 28,
        paddingLeft: 10,
        paddingRight: 10,
        ...(isSelected
          ? { backgroundColor: colors.colorBlueDark1, color: colors.colorWhite, border: '1px solid transparent' }
          : {
              backgroundColor: colors.colorWhite,
              color: colors.colorBlack2,
              border: `1px solid ${colors.colorBlack5}`,
            }),
      }}
    >
      {label}
    </button>
  );
}

/** A committed value inside a type-to-chip field. */
function ValueChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[4px] shrink-0"
      style={{
        height: 22,
        paddingLeft: 8,
        paddingRight: 4,
        backgroundColor: colors.colorBlack7,
        color: colors.colorBlack1,
      }}
    >
      <span className="font-['Roboto',sans-serif] text-[12px] leading-[18px]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="shrink-0 cursor-pointer flex items-center"
      >
        <Icon path={mdiCloseCircle} size={0.55} color={colors.colorBlack3} />
      </button>
    </span>
  );
}

/**
 * Type-to-chip field. Committed values render INSIDE the field above the input,
 * so the control reads as one object rather than an input with detached chips
 * beneath it. Enter commits, matching the old modal's mechanic and helper text.
 */
export function TypeToChipInput({
  placeholder,
  chips,
  onAdd,
  onRemove,
}: {
  placeholder: string;
  chips: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [value, setValue] = useState('');

  return (
    <div className="flex flex-col gap-1.5">
      {chips.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5 rounded-[6px]"
          style={{ padding: 8, border: `1px solid ${colors.colorBlack6}` }}
        >
          {chips.map((c) => (
            <ValueChip key={c} label={c} onRemove={() => onRemove(c)} />
          ))}
        </div>
      )}
      <CanaryInput
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            e.preventDefault();
            const v = value.trim().toUpperCase();
            if (!chips.includes(v)) onAdd(v);
            setValue('');
          }
        }}
        size={InputSize.NORMAL}
        helperText="Press Enter to add"
      />
    </div>
  );
}

/**
 * Binary attribute as a chip pair — the jam replaced the modal's radios with
 * chips so every attribute in the stack reads the same way. Re-clicking the
 * selected chip clears it, preserving the old deselectable-radio behaviour.
 */
export function BinaryChipRow<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: [T, string][];
  selected: T | null;
  onChange: (value: T | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([value, label]) => (
        <FilterChip
          key={value}
          label={label}
          isSelected={selected === value}
          onClick={() => onChange(selected === value ? null : value)}
        />
      ))}
    </div>
  );
}

/** Which attributes a criteria object actually uses. */
export function isCriteriaEmptyFor(
  criteria: BroadcastFilterCriteria,
  key: keyof BroadcastFilterCriteria
): boolean {
  const v = criteria[key];
  return Array.isArray(v) ? v.length === 0 : v === null;
}
