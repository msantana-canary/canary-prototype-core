'use client';

/**
 * OptionsEditor — selection-options editor for InputAtoms (dropdown,
 * string-radio, checkbox-group) and for the id-type-select preset atom.
 *
 * Each row: drag handle / label / value / visibility chip / remove.
 * The visibility chip opens a popover containing the existing
 * ConditionRuleEditor (scope='option'). Empty conditions = "Always";
 * with conditions = "Conditional (N)" — click to inspect / edit.
 *
 * Per-option conditions are the architecture's headline use case:
 * "show 'Carta d'Identità' option only if nationality = IT".
 */

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiDelete,
  mdiTuneVariant,
  mdiClose,
} from '@mdi/js';
import { CanaryInput, InputSize, colors } from '@canary-ui/components';

import type { FieldOption, Condition } from '@/lib/products/check-in-flows/types';
import { ConditionRuleEditor } from '../editors/ConditionRuleEditor';

interface Props {
  options: FieldOption[];
  onChange: (next: FieldOption[]) => void;
}

let optIdCounter = 0;
function newOptionId(): string {
  return `opt-${Date.now()}-${++optIdCounter}`;
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export function OptionsEditor({ options, onChange }: Props) {
  const sorted = [...options].sort((a, b) => a.order - b.order);

  const reindex = (list: FieldOption[]): FieldOption[] =>
    list.map((opt, i) => ({ ...opt, order: i }));

  const updateOption = (id: string, patch: Partial<FieldOption>) => {
    onChange(
      reindex(
        sorted.map((o) => (o.id === id ? { ...o, ...patch } : o))
      )
    );
  };

  const removeOption = (id: string) => {
    onChange(reindex(sorted.filter((o) => o.id !== id)));
  };

  const addOption = () => {
    const next: FieldOption = {
      id: newOptionId(),
      value: '',
      label: { en: '' },
      order: sorted.length,
    };
    onChange(reindex([...sorted, next]));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...sorted];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(reindex(next));
  };

  const moveDown = (idx: number) => {
    if (idx === sorted.length - 1) return;
    const next = [...sorted];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(reindex(next));
  };

  return (
    <div>
      {sorted.length === 0 ? (
        <div
          className="rounded-md border border-dashed py-4 px-3 text-center"
          style={{ borderColor: colors.colorBlack6 }}
        >
          <p className="text-[12px]" style={{ color: colors.colorBlack5 }}>
            No options yet. Add one to define what guests can choose from.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sorted.map((opt, idx) => (
            <OptionRow
              key={opt.id}
              option={opt}
              isFirst={idx === 0}
              isLast={idx === sorted.length - 1}
              onUpdate={(patch) => updateOption(opt.id, patch)}
              onRemove={() => removeOption(opt.id)}
              onMoveUp={() => moveUp(idx)}
              onMoveDown={() => moveDown(idx)}
            />
          ))}
        </div>
      )}

      <button
        onClick={addOption}
        className="mt-2 inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[12px] font-semibold transition-colors"
        style={{ color: colors.colorBlueDark1 }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.colorBlueDark5;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Icon path={mdiPlus} size={0.6} />
        Add option
      </button>
    </div>
  );
}

// ── Single option row ─────────────────────────────────────

function OptionRow({
  option,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  option: FieldOption;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<FieldOption>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleLabelChange = (raw: string) => {
    const wasAutoValue =
      option.value === '' || option.value === slugify(option.label?.['en'] ?? '');
    const patch: Partial<FieldOption> = {
      label: { ...option.label, en: raw },
    };
    if (wasAutoValue) patch.value = slugify(raw);
    onUpdate(patch);
  };

  const conditionCount = option.conditions?.length ?? 0;
  const chipLabel = conditionCount === 0
    ? 'Always'
    : conditionCount === 1
      ? 'Conditional'
      : `Conditional (${conditionCount})`;
  const chipActive = conditionCount > 0;

  return (
    <div
      className="rounded-md px-2 py-2 flex items-center gap-2"
      style={{ border: `1px solid ${colors.colorBlack7}`, backgroundColor: '#FFF' }}
    >
      {/* Reorder handle */}
      <div className="flex flex-col shrink-0" style={{ color: colors.colorBlack6 }}>
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="w-5 h-3 flex items-center justify-center disabled:opacity-30"
          title="Move up"
        >
          <span style={{ fontSize: 9, lineHeight: 1 }}>▲</span>
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="w-5 h-3 flex items-center justify-center disabled:opacity-30"
          title="Move down"
        >
          <span style={{ fontSize: 9, lineHeight: 1 }}>▼</span>
        </button>
      </div>

      {/* Label input */}
      <div className="flex-1 min-w-0">
        <CanaryInput
          size={InputSize.NORMAL}
          placeholder="Option label (shown to guest)"
          value={option.label?.['en'] ?? ''}
          onChange={(e) => handleLabelChange(e.target.value)}
        />
      </div>

      {/* Value input */}
      <div className="w-32 shrink-0">
        <CanaryInput
          size={InputSize.NORMAL}
          placeholder="value"
          value={option.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
        />
      </div>

      {/* Visibility chip + popover */}
      <div className="relative shrink-0">
        <button
          onClick={() => setPopoverOpen(!popoverOpen)}
          className="inline-flex items-center gap-1 h-8 px-2 rounded text-[11px] font-semibold transition-colors"
          style={{
            backgroundColor: chipActive ? colors.colorBlueDark5 : colors.colorBlack8,
            color: chipActive ? colors.colorBlueDark1 : colors.colorBlack4,
            border: `1px solid ${chipActive ? colors.colorBlueDark4 : colors.colorBlack7}`,
          }}
          title={chipActive ? 'Edit visibility conditions' : 'Add visibility conditions'}
        >
          <Icon
            path={mdiTuneVariant}
            size={0.5}
            color={chipActive ? colors.colorBlueDark1 : colors.colorBlack5}
          />
          {chipLabel}
        </button>

        {popoverOpen && (
          <ConditionsPopover
            conditions={option.conditions ?? []}
            onChange={(next) =>
              onUpdate({ conditions: next.length > 0 ? next : undefined })
            }
            onClose={() => setPopoverOpen(false)}
          />
        )}
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="w-8 h-8 rounded flex items-center justify-center transition-colors shrink-0"
        style={{ color: colors.colorBlack5 }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = colors.danger;
          e.currentTarget.style.backgroundColor = '#FDECEF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = colors.colorBlack5;
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Remove option"
      >
        <Icon path={mdiDelete} size={0.6} />
      </button>
    </div>
  );
}

// ── Per-option conditions popover ────────────────────────

function ConditionsPopover({
  conditions,
  onChange,
  onClose,
}: {
  conditions: Condition[];
  onChange: (next: Condition[]) => void;
  onClose: () => void;
}) {
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        ref={popRef}
        className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-md z-40"
        style={{
          border: `1px solid ${colors.colorBlack6}`,
          width: 620,
          maxWidth: 'calc(100vw - 80px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: `1px solid ${colors.colorBlack7}` }}
        >
          <div>
            <h4
              className="text-[12px] font-bold"
              style={{ color: colors.colorBlack1 }}
            >
              Visibility conditions
            </h4>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: colors.colorBlack5 }}
            >
              Show this option only when guest matches all of the following.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ color: colors.colorBlack5 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.colorBlack8;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Close"
          >
            <Icon path={mdiClose} size={0.6} />
          </button>
        </div>
        <div className="px-4 py-3">
          <ConditionRuleEditor
            conditions={conditions}
            onChange={onChange}
            scope="option"
            emptyLabel="No conditions"
            emptyHint="Without conditions, this option is always shown."
          />
        </div>
      </div>
    </>
  );
}
