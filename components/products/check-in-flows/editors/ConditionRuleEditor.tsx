'use client';

/**
 * ConditionRuleEditor
 *
 * Reusable editor for Condition[] used at step-level, field-level, and
 * option-level. Each condition is rendered as a rule card: parameter,
 * operator, value, action. UI adjusts to the parameter's valueType —
 * country picker for nationality, tier dropdown for loyalty, boolean
 * for is-member, etc.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiDelete } from '@mdi/js';
import { colors } from '@canary-ui/components';

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
  OPERATOR_LABELS,
  PARAMETER_MAP,
  getAllowedActions,
  type ParameterMeta,
} from '@/lib/products/check-in-flows/condition-meta';

interface Props {
  conditions: Condition[];
  onChange: (next: Condition[]) => void;
  scope: 'step' | 'field' | 'option';
  disabled?: boolean;
  /** Optional label override for the empty state. */
  emptyLabel?: string;
  /** Helpful hint string shown when there are no conditions. */
  emptyHint?: string;
}

let condIdCounter = 0;
function newConditionId(): string {
  return `cond-${Date.now()}-${++condIdCounter}`;
}

function defaultConditionFor(scope: 'step' | 'field' | 'option'): Condition {
  const action: ConditionAction =
    scope === 'option' ? 'show-option' : 'show';
  return {
    id: newConditionId(),
    parameter: 'nationality',
    operator: 'equals',
    value: 'IT',
    action,
  };
}

export function ConditionRuleEditor({
  conditions,
  onChange,
  scope,
  disabled = false,
  emptyLabel = 'No conditions',
  emptyHint = 'This always shows by default.',
}: Props) {
  const allowedActions = getAllowedActions(scope);

  const updateCondition = (id: string, patch: Partial<Condition>) => {
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };

  const addCondition = () => {
    onChange([...conditions, defaultConditionFor(scope)]);
  };

  return (
    <div>
      {conditions.length === 0 ? (
        <div className="text-center py-5 rounded-md border border-dashed border-[#E5E5E5] bg-[#FAFAFA]">
          <p className="text-[13px] text-[#666] font-medium">{emptyLabel}</p>
          <p className="text-[11px] text-[#888] mt-1">{emptyHint}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conditions.map((cond) => (
            <ConditionCard
              key={cond.id}
              condition={cond}
              allowedActions={allowedActions}
              disabled={disabled}
              onUpdate={(patch) => updateCondition(cond.id, patch)}
              onRemove={() => removeCondition(cond.id)}
            />
          ))}
        </div>
      )}

      {!disabled && (
        <button
          onClick={addCondition}
          className="mt-3 w-full py-2 rounded-md border border-dashed border-[#C5C5C5] text-[12px] font-semibold text-[#888] hover:border-[#2858C4] hover:text-[#2858C4] transition-colors flex items-center justify-center gap-1.5"
        >
          <Icon path={mdiPlus} size={0.6} />
          Add condition
        </button>
      )}
    </div>
  );
}

// ── Single condition card ─────────────────────────────────

function ConditionCard({
  condition,
  allowedActions,
  disabled,
  onUpdate,
  onRemove,
}: {
  condition: Condition;
  allowedActions: { id: ConditionAction; label: string; description: string }[];
  disabled: boolean;
  onUpdate: (patch: Partial<Condition>) => void;
  onRemove: () => void;
}) {
  const paramMeta = PARAMETER_MAP[condition.parameter];
  const allowedOperators = paramMeta.allowedOperators;
  const isMultiValue = condition.operator === 'in' || condition.operator === 'not-in';

  const handleParameterChange = (param: ConditionParameter) => {
    const meta = PARAMETER_MAP[param];
    const firstOp = meta.allowedOperators[0];
    // Reset value based on new param's valueType
    const defaultValue = getDefaultValue(meta.valueType);
    onUpdate({ parameter: param, operator: firstOp, value: defaultValue });
  };

  const handleOperatorChange = (op: ConditionOperator) => {
    const goingMulti = op === 'in' || op === 'not-in';
    const wasMulti = condition.operator === 'in' || condition.operator === 'not-in';
    let value = condition.value;
    if (goingMulti && !wasMulti) value = condition.value != null ? [String(condition.value)] : [];
    if (!goingMulti && wasMulti) value = Array.isArray(condition.value) ? condition.value[0] ?? '' : condition.value;
    if (op === 'is-true' || op === 'is-false') value = undefined as any;
    onUpdate({ operator: op, value });
  };

  return (
    <div
      className="rounded-md border p-3"
      style={{ backgroundColor: colors.colorBlueDark5, borderColor: colors.colorBlueDark4 }}
    >
      <div className="grid grid-cols-[minmax(150px,1fr),minmax(130px,auto),2fr,auto] gap-2 items-start">
        {/* Parameter */}
        <Select
          value={condition.parameter}
          disabled={disabled}
          onChange={(v) => handleParameterChange(v as ConditionParameter)}
          options={CONDITION_PARAMETERS.map((p) => ({ value: p.id, label: p.displayName }))}
        />

        {/* Operator */}
        <Select
          value={condition.operator}
          disabled={disabled}
          onChange={(v) => handleOperatorChange(v as ConditionOperator)}
          options={allowedOperators.map((op) => ({ value: op, label: OPERATOR_LABELS[op] }))}
        />

        {/* Value input */}
        <ValueInput
          paramMeta={paramMeta}
          operator={condition.operator}
          value={condition.value}
          onChange={(v) => onUpdate({ value: v })}
          isMultiValue={isMultiValue}
          disabled={disabled}
        />

        {/* Remove */}
        {!disabled && (
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded hover:bg-white/60 flex items-center justify-center text-[#888] hover:text-[#D00]"
            aria-label="Remove condition"
          >
            <Icon path={mdiDelete} size={0.65} />
          </button>
        )}
      </div>

      {/* Action */}
      <div className="mt-2 flex items-center gap-1.5 text-[12px]">
        <span className="text-[#666]">Then</span>
        <Select
          value={condition.action}
          disabled={disabled}
          onChange={(v) => onUpdate({ action: v as ConditionAction })}
          options={allowedActions.map((a) => ({ value: a.id, label: a.label.toLowerCase() }))}
          size="small"
        />
        <span className="text-[#888] italic">
          {allowedActions.find((a) => a.id === condition.action)?.description}
        </span>
      </div>
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
    return <span className="text-[12px] text-[#888] italic py-1.5">no value needed</span>;
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
        <Select
          value={String(value ?? 'US')}
          disabled={disabled}
          onChange={onChange}
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
        <Select
          value={String(value ?? 'club-member') as LoyaltyTier}
          disabled={disabled}
          onChange={onChange}
          options={LOYALTY_TIERS.map((t) => ({ value: t.value, label: t.label }))}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          value={value == null ? '' : Number(value)}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          className="h-8 px-2 rounded-md border border-[#E5E5E5] bg-white text-[13px] text-[#2B2B2B] outline-none focus:border-[#2858C4] disabled:opacity-60"
        />
      );
    default:
      return (
        <input
          type="text"
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 px-2 rounded-md border border-[#E5E5E5] bg-white text-[13px] text-[#2B2B2B] outline-none focus:border-[#2858C4] disabled:opacity-60"
        />
      );
  }
}

function getDefaultValue(valueType: string): any {
  switch (valueType) {
    case 'country-code': return 'US';
    case 'loyalty-tier': return 'club-member';
    case 'number': return 0;
    case 'boolean': return undefined;
    default: return '';
  }
}

// ── Reusable form primitives ──────────────────────────────

function Select({
  value,
  onChange,
  options,
  disabled,
  size = 'normal',
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  size?: 'normal' | 'small';
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-md border border-[#E5E5E5] bg-white text-[#2B2B2B] outline-none focus:border-[#2858C4] disabled:opacity-60 ${
        size === 'small' ? 'h-7 px-1.5 text-[11px]' : 'h-8 px-2 text-[13px]'
      }`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
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
        className="w-full min-h-[32px] px-2 py-1 rounded-md border border-[#E5E5E5] bg-white text-[13px] text-left hover:border-[#999] disabled:opacity-60 flex flex-wrap items-center gap-1"
      >
        {value.length === 0 ? (
          <span className="text-[#888]">{placeholder}</span>
        ) : value.length <= 3 ? (
          value.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <span
                key={v}
                className="text-[11px] px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#555]"
              >
                {opt?.label ?? v}
              </span>
            );
          })
        ) : (
          <span className="text-[12px] text-[#2B2B2B] font-semibold">
            {value.length} selected
          </span>
        )}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-[260px] max-h-[300px] overflow-auto bg-white rounded-md border border-[#E5E5E5] shadow-md z-40 py-1">
            {options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 hover:bg-[#F4F4F5] ${
                    selected ? 'bg-[#F4F4F5]' : ''
                  }`}
                >
                  <span className={`w-4 h-4 rounded-sm border flex items-center justify-center ${selected ? 'bg-[#2858C4] border-[#2858C4]' : 'border-[#CCC]'}`}>
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
