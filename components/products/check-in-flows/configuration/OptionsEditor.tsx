'use client';

/**
 * OptionsEditor — segment-grouped option editor for selection-type
 * InputAtoms (dropdown / string-radio / checkbox-group).
 *
 * Models the architecture's headline use case: "Italian guests get
 * National ID; everyone else gets Passport + Driver's License."
 *
 * Structure:
 *   Default variant (no conditions, always there)
 *     • option rows
 *
 *   + Variant: Italian guests           [edit segment ↗]  [delete]
 *     • option rows
 *
 *   [+ Add segment variant]
 *
 * Runtime: first variant whose segment conditions match the guest wins;
 * otherwise the default variant. CS reasons in segments, not per-option.
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

import type {
  Condition,
  FieldOption,
  OptionVariant,
} from '@/lib/products/check-in-flows/types';
import { ConditionRuleEditor } from '../editors/ConditionRuleEditor';

interface Props {
  variants: OptionVariant[];
  onChange: (next: OptionVariant[]) => void;
}

let idCounter = 0;
function newOptionId(): string {
  return `opt-${Date.now()}-${++idCounter}`;
}
function newVariantId(): string {
  return `var-${Date.now()}-${++idCounter}`;
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

// ── Top-level editor ─────────────────────────────────────

export function OptionsEditor({ variants, onChange }: Props) {
  // Ensure there's always exactly one default variant (no conditions).
  const ensureDefault = (list: OptionVariant[]): OptionVariant[] => {
    const hasDefault = list.some(
      (v) => !v.conditions || v.conditions.length === 0
    );
    if (hasDefault) return list;
    return [
      {
        id: newVariantId(),
        options: [],
      },
      ...list,
    ];
  };

  const normalized = ensureDefault(variants);

  // Default variant first; named variants in the order CS adds them.
  const defaultVariant = normalized.find(
    (v) => !v.conditions || v.conditions.length === 0
  )!;
  const namedVariants = normalized.filter(
    (v) => v.conditions && v.conditions.length > 0
  );

  const updateVariant = (id: string, patch: Partial<OptionVariant>) => {
    onChange(
      normalized.map((v) => (v.id === id ? { ...v, ...patch } : v))
    );
  };

  const removeVariant = (id: string) => {
    onChange(normalized.filter((v) => v.id !== id));
  };

  const addVariant = () => {
    const next: OptionVariant = {
      id: newVariantId(),
      name: 'New segment',
      conditions: [],
      options: [],
    };
    onChange([...normalized, next]);
  };

  return (
    <div className="space-y-4">
      <VariantBlock
        variant={defaultVariant}
        isDefault
        onUpdate={(patch) => updateVariant(defaultVariant.id, patch)}
      />

      {namedVariants.map((v) => (
        <VariantBlock
          key={v.id}
          variant={v}
          isDefault={false}
          onUpdate={(patch) => updateVariant(v.id, patch)}
          onRemove={() => removeVariant(v.id)}
        />
      ))}

      <button
        onClick={addVariant}
        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[12px] font-semibold transition-colors"
        style={{ color: colors.colorBlueDark1 }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.colorBlueDark5;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Add a segment variant — alternate option list shown to a specific guest segment"
      >
        <Icon path={mdiPlus} size={0.6} />
        Add segment variant
      </button>
    </div>
  );
}

// ── Variant block ────────────────────────────────────────

function VariantBlock({
  variant,
  isDefault,
  onUpdate,
  onRemove,
}: {
  variant: OptionVariant;
  isDefault: boolean;
  onUpdate: (patch: Partial<OptionVariant>) => void;
  onRemove?: () => void;
}) {
  const [conditionsOpen, setConditionsOpen] = useState(false);

  const summary = isDefault
    ? 'Everyone else'
    : summarizeConditions(variant.conditions);

  const updateOptions = (next: FieldOption[]) =>
    onUpdate({ options: next });

  const addOption = () => {
    const next: FieldOption = {
      id: newOptionId(),
      value: '',
      label: { en: '' },
      order: variant.options.length,
    };
    updateOptions([...variant.options, next]);
  };

  const moveOption = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= variant.options.length) return;
    const next = [...variant.options];
    [next[idx], next[target]] = [next[target], next[idx]];
    updateOptions(next.map((o, i) => ({ ...o, order: i })));
  };

  return (
    <div
      className="rounded-md"
      style={{
        border: `1px solid ${isDefault ? colors.colorBlack7 : colors.colorBlueDark4}`,
        backgroundColor: isDefault ? '#FFF' : '#F8FBFF',
      }}
    >
      {/* Variant header */}
      <div
        className="flex items-center gap-2 px-3 py-2 relative"
        style={{ borderBottom: `1px solid ${colors.colorBlack7}` }}
      >
        {isDefault ? (
          <div className="flex-1 min-w-0">
            <span
              className="text-[12px] font-bold uppercase tracking-wider"
              style={{ color: colors.colorBlack3 }}
            >
              Default
            </span>
            <span className="text-[11px] ml-2" style={{ color: colors.colorBlack5 }}>
              Shown to guests not matched by any segment variant below.
            </span>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <CanaryInput
                size={InputSize.NORMAL}
                placeholder="Segment name (e.g., Italian guests)"
                value={variant.name ?? ''}
                onChange={(e) => onUpdate({ name: e.target.value })}
              />
              <button
                onClick={() => setConditionsOpen(true)}
                className="inline-flex items-center gap-1 mt-1.5 px-2 h-6 rounded text-[11px] font-semibold transition-colors"
                style={{
                  backgroundColor: colors.colorBlueDark5,
                  color: colors.colorBlueDark1,
                  border: `1px solid ${colors.colorBlueDark4}`,
                }}
                title="Edit segment conditions"
              >
                <Icon path={mdiTuneVariant} size={0.5} color={colors.colorBlueDark1} />
                Visible to: {summary}
              </button>
            </div>
            {onRemove && (
              <button
                onClick={onRemove}
                className="w-7 h-7 rounded flex items-center justify-center transition-colors shrink-0"
                style={{ color: colors.colorBlack5 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.danger;
                  e.currentTarget.style.backgroundColor = '#FDECEF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.colorBlack5;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Remove variant"
              >
                <Icon path={mdiDelete} size={0.6} />
              </button>
            )}
            {conditionsOpen && (
              <ConditionsPopover
                conditions={variant.conditions ?? []}
                onChange={(next) =>
                  onUpdate({ conditions: next.length > 0 ? next : undefined })
                }
                onClose={() => setConditionsOpen(false)}
              />
            )}
          </>
        )}
      </div>

      {/* Options list */}
      <div className="p-3 space-y-1.5">
        {variant.options.length === 0 ? (
          <div
            className="rounded-md border border-dashed py-3 text-center"
            style={{ borderColor: colors.colorBlack6 }}
          >
            <p className="text-[12px]" style={{ color: colors.colorBlack5 }}>
              No options yet.
            </p>
          </div>
        ) : (
          variant.options.map((opt, idx) => (
            <OptionRow
              key={opt.id}
              option={opt}
              isFirst={idx === 0}
              isLast={idx === variant.options.length - 1}
              onUpdate={(patch) =>
                updateOptions(
                  variant.options.map((o) =>
                    o.id === opt.id ? { ...o, ...patch } : o
                  )
                )
              }
              onRemove={() =>
                updateOptions(
                  variant.options
                    .filter((o) => o.id !== opt.id)
                    .map((o, i) => ({ ...o, order: i }))
                )
              }
              onMoveUp={() => moveOption(idx, -1)}
              onMoveDown={() => moveOption(idx, 1)}
            />
          ))
        )}

        <button
          onClick={addOption}
          className="inline-flex items-center gap-1.5 mt-1 px-2 h-7 rounded text-[12px] font-semibold transition-colors"
          style={{ color: colors.colorBlueDark1 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.colorBlueDark5;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Icon path={mdiPlus} size={0.55} />
          Add option
        </button>
      </div>
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
  const handleLabelChange = (raw: string) => {
    const wasAutoValue =
      option.value === '' || option.value === slugify(option.label?.['en'] ?? '');
    const patch: Partial<FieldOption> = {
      label: { ...option.label, en: raw },
    };
    if (wasAutoValue) patch.value = slugify(raw);
    onUpdate(patch);
  };

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

// ── Conditions popover ───────────────────────────────────

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
        className="absolute left-3 top-full mt-1 bg-white rounded-lg shadow-md z-40"
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
            <h4 className="text-[12px] font-bold" style={{ color: colors.colorBlack1 }}>
              Segment conditions
            </h4>
            <p className="text-[11px] mt-0.5" style={{ color: colors.colorBlack5 }}>
              Show this variant&rsquo;s options when guest matches all of the following.
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
            scope="field"
            emptyLabel="No conditions yet"
            emptyHint="Add a condition to define which guests see this variant."
          />
        </div>
      </div>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────

function summarizeConditions(conditions: Condition[] | undefined): string {
  if (!conditions || conditions.length === 0) return 'No conditions set';
  if (conditions.length === 1) {
    const c = conditions[0];
    if (c.parameter === 'nationality' && c.operator === 'equals' && c.value === 'IT') {
      return 'Italian guests';
    }
    if (c.parameter && c.operator && c.value !== undefined) {
      return `${c.parameter} ${c.operator}`;
    }
  }
  return `${conditions.length} conditions`;
}
