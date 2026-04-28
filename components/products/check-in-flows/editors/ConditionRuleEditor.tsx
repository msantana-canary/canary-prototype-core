'use client';

/**
 * ConditionRuleEditor
 *
 * Reusable editor for Condition[] used at step-level, field-level, and
 * option-level. Visual shape mirrors a standard rule builder:
 *   "Matches ALL of the conditions below"
 *   [Parameter] [Operator] [Value]   [×]
 *   [Parameter] [Operator] [Value]   [×]
 *   + Add condition
 *
 * The action ('show' / 'show-option') is implicit per scope — when all
 * conditions match, the gated thing shows. To express "hide for X",
 * flip the operator (e.g., "Nationality is not US").
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiDelete } from '@mdi/js';
import {
  CanarySelect,
  CanaryInput,
  InputSize,
  InputType,
  colors,
} from '@canary-ui/components';

import type {
  Condition,
  ConditionParameter,
  ConditionOperator,
  ConditionAction,
  LoyaltyTier,
} from '@/lib/products/check-in-flows/types';
import {
  CONDITION_PARAMETERS,
  COUNTRIES,
  LOYALTY_TIERS,
  RATE_CODES,
  OPERATOR_LABELS,
  PARAMETER_MAP,
  type ParameterMeta,
} from '@/lib/products/check-in-flows/condition-meta';

interface Props {
  conditions: Condition[];
  onChange: (next: Condition[]) => void;
  scope: 'step' | 'field' | 'option';
  disabled?: boolean;
  emptyLabel?: string;
  emptyHint?: string;
}

let condIdCounter = 0;
function newConditionId(): string {
  return `cond-${Date.now()}-${++condIdCounter}`;
}

function emptyCondition(scope: 'step' | 'field' | 'option'): Condition {
  const action: ConditionAction = scope === 'option' ? 'show-option' : 'show';
  return {
    id: newConditionId(),
    parameter: undefined,
    operator: undefined,
    value: undefined,
    action,
  };
}

export function ConditionRuleEditor({
  conditions,
  onChange,
  scope,
  disabled = false,
  emptyLabel = 'Always visible',
  emptyHint = 'Add a condition to gate visibility on guest context.',
}: Props) {
  const updateCondition = (id: string, patch: Partial<Condition>) => {
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };

  const addCondition = () => {
    onChange([...conditions, emptyCondition(scope)]);
  };

  return (
    <div>
      {conditions.length === 0 ? (
        <div
          className="px-4 py-3 rounded-md"
          style={{ backgroundColor: colors.colorBlack8, border: `1px solid ${colors.colorBlack7}` }}
        >
          <p className="text-[12px] font-medium" style={{ color: colors.colorBlack3 }}>
            {emptyLabel}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: colors.colorBlack5 }}>
            {emptyHint}
          </p>
        </div>
      ) : (
        <div
          className="rounded-md p-3"
          style={{ border: `1px solid ${colors.colorBlack7}`, backgroundColor: '#FFF' }}
        >
          {/* Match header */}
          <div className="flex items-center gap-1.5 text-[12px] mb-2.5">
            <span style={{ color: colors.colorBlack4 }}>Matches</span>
            <span
              className="px-2 py-0.5 rounded text-[11px] font-bold"
              style={{ backgroundColor: colors.colorBlueDark5, color: colors.colorBlueDark1 }}
              title="Multiple conditions are joined with AND"
            >
              ALL
            </span>
            <span style={{ color: colors.colorBlack4 }}>of the conditions below</span>
          </div>

          <div className="space-y-1.5">
            {conditions.map((cond) => (
              <ConditionRow
                key={cond.id}
                condition={cond}
                disabled={disabled}
                onUpdate={(patch) => updateCondition(cond.id, patch)}
                onRemove={() => removeCondition(cond.id)}
              />
            ))}
          </div>
        </div>
      )}

      {!disabled && (
        <button
          onClick={addCondition}
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
          Add condition
        </button>
      )}
    </div>
  );
}

// ── Single condition row ─────────────────────────────────

function ConditionRow({
  condition,
  disabled,
  onUpdate,
  onRemove,
}: {
  condition: Condition;
  disabled: boolean;
  onUpdate: (patch: Partial<Condition>) => void;
  onRemove: () => void;
}) {
  const paramMeta: ParameterMeta | null = condition.parameter
    ? PARAMETER_MAP[condition.parameter]
    : null;

  const isParamSet = !!paramMeta;
  const isMultiValue = condition.operator === 'in' || condition.operator === 'not-in';
  const operatorLabels = paramMeta?.allowedOperators ?? [];

  const handleParameterChange = (raw: string) => {
    if (!raw) {
      onUpdate({ parameter: undefined, operator: undefined, value: undefined });
      return;
    }
    const param = raw as ConditionParameter;
    const meta = PARAMETER_MAP[param];
    const firstOp = meta.allowedOperators[0];
    const defaultValue = getDefaultValue(meta.valueType);
    onUpdate({ parameter: param, operator: firstOp, value: defaultValue });
  };

  const handleOperatorChange = (op: ConditionOperator) => {
    if (!paramMeta) return;
    const goingMulti = op === 'in' || op === 'not-in';
    const wasMulti = condition.operator === 'in' || condition.operator === 'not-in';
    let value = condition.value;
    if (goingMulti && !wasMulti) value = condition.value != null ? [String(condition.value)] : [];
    if (!goingMulti && wasMulti) value = Array.isArray(condition.value) ? condition.value[0] ?? '' : condition.value;
    if (op === 'is-true' || op === 'is-false') value = undefined as any;
    onUpdate({ operator: op, value });
  };

  return (
    <div className="grid grid-cols-[minmax(160px,1.2fr)_minmax(110px,auto)_2fr_auto] gap-2 items-start">
      {/* Parameter */}
      <CanarySelect
        size={InputSize.NORMAL}
        value={condition.parameter ?? ''}
        disabled={disabled}
        onChange={(e) => handleParameterChange(e.target.value)}
        options={[
          { value: '', label: 'Choose parameter…' },
          ...CONDITION_PARAMETERS.map((p) => ({ value: p.id, label: p.displayName })),
        ]}
      />

      {/* Operator */}
      <CanarySelect
        size={InputSize.NORMAL}
        value={condition.operator ?? ''}
        disabled={disabled || !isParamSet}
        onChange={(e) => handleOperatorChange(e.target.value as ConditionOperator)}
        options={
          isParamSet
            ? operatorLabels.map((op) => ({ value: op, label: OPERATOR_LABELS[op] }))
            : [{ value: '', label: '—' }]
        }
      />

      {/* Value */}
      {isParamSet ? (
        <ValueInput
          paramMeta={paramMeta!}
          operator={condition.operator!}
          value={condition.value}
          onChange={(v) => onUpdate({ value: v })}
          isMultiValue={isMultiValue}
          disabled={disabled}
        />
      ) : (
        <div
          className="h-9 rounded-md flex items-center px-3 text-[12px]"
          style={{ border: `1px solid ${colors.colorBlack7}`, color: colors.colorBlack6, backgroundColor: colors.colorBlack8 }}
        >
          —
        </div>
      )}

      {/* Remove */}
      {!disabled ? (
        <button
          onClick={onRemove}
          className="w-9 h-9 rounded flex items-center justify-center transition-colors"
          style={{ color: colors.colorBlack5 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.colorBlack8;
            e.currentTarget.style.color = colors.danger;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.colorBlack5;
          }}
          aria-label="Remove condition"
        >
          <Icon path={mdiDelete} size={0.65} />
        </button>
      ) : (
        <div className="w-9 h-9" />
      )}
    </div>
  );
}

// ── Value input dispatcher ────────────────────────────────

function ValueInput({
  paramMeta,
  operator,
  value,
  onChange,
  isMultiValue,
  disabled,
}: {
  paramMeta: ParameterMeta;
  operator: ConditionOperator;
  value: any;
  onChange: (v: any) => void;
  isMultiValue: boolean;
  disabled: boolean;
}) {
  if (operator === 'is-true' || operator === 'is-false') {
    return (
      <div
        className="h-9 rounded-md flex items-center px-3 text-[12px] italic"
        style={{ border: `1px solid ${colors.colorBlack7}`, color: colors.colorBlack5, backgroundColor: colors.colorBlack8 }}
      >
        no value needed
      </div>
    );
  }

  switch (paramMeta.valueType) {
    case 'country-code':
      return isMultiValue ? (
        <MultiSelect
          value={(value as string[]) ?? []}
          options={COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` }))}
          onChange={onChange}
          disabled={disabled}
          placeholder="Select countries…"
        />
      ) : (
        <CanarySelect
          size={InputSize.NORMAL}
          value={String(value ?? 'US')}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          options={COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` }))}
        />
      );
    case 'loyalty-tier':
      return isMultiValue ? (
        <MultiSelect
          value={(value as string[]) ?? []}
          options={LOYALTY_TIERS.map((t) => ({ value: t.value, label: t.label }))}
          onChange={onChange}
          disabled={disabled}
          placeholder="Select tiers…"
        />
      ) : (
        <CanarySelect
          size={InputSize.NORMAL}
          value={String(value ?? 'club-member') as LoyaltyTier}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          options={LOYALTY_TIERS.map((t) => ({ value: t.value, label: t.label }))}
        />
      );
    case 'rate-code':
      return isMultiValue ? (
        <MultiSelect
          value={(value as string[]) ?? []}
          options={RATE_CODES.map((r) => ({ value: r.value, label: r.label }))}
          onChange={onChange}
          disabled={disabled}
          placeholder="Select rate codes…"
        />
      ) : (
        <CanarySelect
          size={InputSize.NORMAL}
          value={String(value ?? 'CORP')}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          options={RATE_CODES.map((r) => ({ value: r.value, label: r.label }))}
        />
      );
    case 'number':
      return (
        <CanaryInput
          type={InputType.NUMBER}
          size={InputSize.NORMAL}
          value={value == null ? '' : String(Number(value))}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
      );
    default:
      return (
        <CanaryInput
          type={InputType.TEXT}
          size={InputSize.NORMAL}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function getDefaultValue(valueType: string): any {
  switch (valueType) {
    case 'country-code': return 'US';
    case 'loyalty-tier': return 'club-member';
    case 'rate-code': return 'CORP';
    case 'number': return 0;
    case 'boolean': return undefined;
    default: return '';
  }
}

function MultiSelect({
  value,
  options,
  onChange,
  disabled,
  placeholder = 'Select…',
}: {
  value: string[];
  options: { value: string; label: string }[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full min-h-[36px] px-2.5 py-1 rounded-md border bg-white text-[13px] text-left disabled:opacity-60 flex flex-wrap items-center gap-1"
        style={{ borderColor: colors.colorBlack6 }}
      >
        {value.length === 0 ? (
          <span style={{ color: colors.colorBlack5 }}>{placeholder}</span>
        ) : value.length <= 3 ? (
          value.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <span
                key={v}
                className="text-[11px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: colors.colorBlueDark5, color: colors.colorBlueDark1 }}
              >
                {opt?.label ?? v}
              </span>
            );
          })
        ) : (
          <span className="text-[12px] font-semibold" style={{ color: colors.colorBlack2 }}>
            {value.length} selected
          </span>
        )}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1 w-[260px] max-h-[300px] overflow-auto bg-white rounded-md border shadow-md z-40 py-1"
            style={{ borderColor: colors.colorBlack6 }}
          >
            {options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className="w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 hover:bg-[#F4F4F5]"
                  style={selected ? { backgroundColor: colors.colorBlueDark5 } : undefined}
                >
                  <span
                    className="w-4 h-4 rounded-sm border flex items-center justify-center"
                    style={selected
                      ? { backgroundColor: colors.colorBlueDark1, borderColor: colors.colorBlueDark1 }
                      : { borderColor: colors.colorBlack6 }
                    }
                  >
                    {selected && <span className="text-white text-[10px]">✓</span>}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
