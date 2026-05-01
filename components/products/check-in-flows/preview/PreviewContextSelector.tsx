'use client';

/**
 * PreviewContextSelector — small bar above the Flow preview that lets CS
 * simulate guest answers to atoms that are referenced by form-response
 * conditions in the current flow.
 *
 * Auto-detects gate atoms from:
 *   - step-level conditions on every step in the flow
 *   - atom-level conditions on every atom the flow's steps reference
 *
 * Filters to conditions where `parameter === 'form-response'` and collects
 * unique `formAtomId`s. Renders a control per gate atom (Yes/No toggle for
 * boolean-radio, select for dropdown/radio/country, number input for
 * numeric atoms). When CS changes a control, updates
 * `previewContext.formResponses[atomId]` so the runtime evaluator picks
 * up the simulated answer immediately.
 *
 * Renders nothing when no form-response conditions exist in the flow.
 */

import React from 'react';
import {
  CanarySelect,
  CanaryInput,
  InputSize,
  InputType,
  colors,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiTuneVariant } from '@mdi/js';

import type {
  Atom,
  Condition,
  ConditionParameter,
  FlowDefinition,
  InputAtom,
  PreviewContext,
  LoyaltyTier,
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import {
  COUNTRIES,
  LOYALTY_TIERS,
  RATE_CODES,
} from '@/lib/products/check-in-flows/condition-meta';

interface Props {
  flow: FlowDefinition;
}

export function PreviewContextSelector({ flow }: Props) {
  const allAtoms = useCheckInFlowsStore((s) => s.atoms);
  const previewContext = useCheckInFlowsStore((s) => s.previewContext);
  const setPreviewContext = useCheckInFlowsStore((s) => s.setPreviewContext);

  const gateAtoms = useGateAtoms(flow, allAtoms);
  const guestParams = useReferencedGuestParams(flow, allAtoms);
  if (gateAtoms.length === 0 && guestParams.length === 0) return null;

  const setResponse = (atomId: string, value: string | number | boolean | undefined) => {
    setPreviewContext({
      formResponses: { ...previewContext.formResponses, [atomId]: value },
    });
  };

  return (
    <div
      className="shrink-0 px-4 py-2.5 flex items-center gap-3 flex-wrap"
      style={{
        borderBottom: `1px solid ${colors.colorBlack7}`,
        backgroundColor: colors.colorBlack8,
      }}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <Icon path={mdiTuneVariant} size={0.55} color={colors.colorBlack4} />
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: colors.colorBlack4 }}
        >
          Simulate
        </span>
      </div>
      {guestParams.map((param) => (
        <GuestParamControl
          key={param}
          param={param}
          ctx={previewContext}
          onChange={(updates) => setPreviewContext(updates)}
        />
      ))}
      {gateAtoms.map((atom) => (
        <ControlForAtom
          key={atom.id}
          atom={atom}
          value={previewContext.formResponses[atom.id]}
          onChange={(v) => setResponse(atom.id, v)}
        />
      ))}
    </div>
  );
}

/** Guest-attribute parameters referenced by ANY condition (atom-level,
 *  variant-level, or step-level) in the previewed flow. */
function useReferencedGuestParams(flow: FlowDefinition, atoms: Atom[]): ConditionParameter[] {
  return React.useMemo(() => {
    const params = new Set<ConditionParameter>();
    const collect = (conds: Condition[] | undefined) => {
      if (!conds) return;
      for (const c of conds) {
        if (c.parameter && c.parameter !== 'form-response') {
          params.add(c.parameter);
        }
      }
    };
    for (const step of flow.steps) collect(step.conditions);
    const flowAtomIds = new Set<string>();
    for (const step of flow.steps) {
      for (const atomId of step.atomIds ?? []) flowAtomIds.add(atomId);
    }
    for (const atom of atoms) {
      if (!flowAtomIds.has(atom.id)) continue;
      collect(atom.conditions);
      // Variant-level conditions on selection InputAtoms
      if (atom.kind === 'input' && atom.optionVariants) {
        for (const variant of atom.optionVariants) collect(variant.conditions);
      }
    }
    return Array.from(params);
  }, [flow, atoms]);
}

function GuestParamControl({
  param,
  ctx,
  onChange,
}: {
  param: ConditionParameter;
  ctx: PreviewContext;
  onChange: (updates: Partial<PreviewContext>) => void;
}) {
  switch (param) {
    case 'nationality':
      return (
        <LabeledControl label="Nationality" minWidth={180}>
          <CanarySelect
            size={InputSize.NORMAL}
            value={ctx.guestNationalityCode}
            onChange={(e) => onChange({ guestNationalityCode: e.target.value })}
            options={COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` }))}
          />
        </LabeledControl>
      );
    case 'loyalty-tier':
      return (
        <LabeledControl label="Loyalty tier" minWidth={150}>
          <CanarySelect
            size={InputSize.NORMAL}
            value={ctx.loyaltyTier}
            onChange={(e) => onChange({ loyaltyTier: e.target.value as LoyaltyTier })}
            options={LOYALTY_TIERS.map((t) => ({ value: t.value, label: t.label }))}
          />
        </LabeledControl>
      );
    case 'loyalty-member':
      return (
        <LabeledControl label="Loyalty member" minWidth={120}>
          <CanarySelect
            size={InputSize.NORMAL}
            value={ctx.loyaltyTier === 'none' ? 'no' : 'yes'}
            onChange={(e) =>
              onChange({ loyaltyTier: e.target.value === 'yes' ? 'club-member' : 'none' })
            }
            options={[{ value: 'no', label: 'Non-member' }, { value: 'yes', label: 'Member' }]}
          />
        </LabeledControl>
      );
    case 'rate-code':
      return (
        <LabeledControl label="Rate code" minWidth={150}>
          <CanarySelect
            size={InputSize.NORMAL}
            value={ctx.rateCode}
            onChange={(e) => onChange({ rateCode: e.target.value })}
            options={RATE_CODES.map((r) => ({ value: r.value, label: r.label }))}
          />
        </LabeledControl>
      );
    case 'reservation-source':
      return (
        <LabeledControl label="Source" minWidth={120}>
          <CanarySelect
            size={InputSize.NORMAL}
            value={ctx.reservationSource}
            onChange={(e) => onChange({ reservationSource: e.target.value as PreviewContext['reservationSource'] })}
            options={[
              { value: 'direct', label: 'Direct' },
              { value: 'ota', label: 'OTA' },
              { value: 'corporate', label: 'Corporate' },
              { value: 'group', label: 'Group' },
            ]}
          />
        </LabeledControl>
      );
    case 'returning-guest':
      return (
        <LabeledControl label="Returning guest" minWidth={110}>
          <CanarySelect
            size={InputSize.NORMAL}
            value={ctx.isReturningGuest ? 'yes' : 'no'}
            onChange={(e) => onChange({ isReturningGuest: e.target.value === 'yes' })}
            options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]}
          />
        </LabeledControl>
      );
    case 'age':
      return (
        <LabeledControl label="Age" minWidth={80}>
          <CanaryInput
            type={InputType.NUMBER}
            size={InputSize.NORMAL}
            value={String(ctx.guestAge)}
            onChange={(e) => onChange({ guestAge: Number(e.target.value) || 0 })}
          />
        </LabeledControl>
      );
    case 'length-of-stay':
      return (
        <LabeledControl label="Nights" minWidth={80}>
          <CanaryInput
            type={InputType.NUMBER}
            size={InputSize.NORMAL}
            value={String(ctx.lengthOfStay)}
            onChange={(e) => onChange({ lengthOfStay: Number(e.target.value) || 1 })}
          />
        </LabeledControl>
      );
    default:
      return null;
  }
}

function LabeledControl({
  label,
  minWidth,
  children,
}: {
  label: string;
  minWidth: number;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-1.5 shrink-0">
      <span className="text-[11px]" style={{ color: colors.colorBlack4 }}>
        {label}:
      </span>
      <div style={{ minWidth }}>{children}</div>
    </label>
  );
}

/** Gate atoms are referenced by form-response conditions in the flow. */
function useGateAtoms(flow: FlowDefinition, atoms: Atom[]): InputAtom[] {
  return React.useMemo(() => {
    const ids = new Set<string>();

    // Step-level conditions
    for (const step of flow.steps) {
      collectFormAtomIds(step.conditions, ids);
    }

    // Atom-level conditions on atoms in this flow's steps
    const flowAtomIds = new Set<string>();
    for (const step of flow.steps) {
      for (const atomId of step.atomIds ?? []) flowAtomIds.add(atomId);
    }
    for (const atom of atoms) {
      if (!flowAtomIds.has(atom.id)) continue;
      collectFormAtomIds(atom.conditions, ids);
    }

    // Resolve gate atoms to InputAtoms
    return Array.from(ids)
      .map((id) => atoms.find((a) => a.id === id))
      .filter((a): a is InputAtom => a !== undefined && a.kind === 'input');
  }, [flow, atoms]);
}

function collectFormAtomIds(conditions: Condition[] | undefined, into: Set<string>) {
  if (!conditions) return;
  for (const c of conditions) {
    if (c.parameter === 'form-response' && c.formAtomId) {
      into.add(c.formAtomId);
    }
  }
}

function ControlForAtom({
  atom,
  value,
  onChange,
}: {
  atom: InputAtom;
  value: string | number | boolean | undefined;
  onChange: (v: string | number | boolean | undefined) => void;
}) {
  const label = resolveText(atom.label, 'en') || atom.id;

  const options = optionsForAtom(atom);

  return (
    <label className="flex items-center gap-1.5 shrink-0">
      <span className="text-[11px]" style={{ color: colors.colorBlack4 }}>
        {label}:
      </span>
      {atom.fieldType === 'number' ? (
        <div style={{ width: 80 }}>
          <CanaryInput
            type={InputType.NUMBER}
            size={InputSize.NORMAL}
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => {
              const raw = e.target.value;
              onChange(raw === '' ? undefined : Number(raw));
            }}
          />
        </div>
      ) : options.length > 0 ? (
        <div style={{ minWidth: 140 }}>
          <CanarySelect
            size={InputSize.NORMAL}
            value={value === undefined ? '' : String(value)}
            onChange={(e) =>
              onChange(e.target.value === '' ? undefined : e.target.value)
            }
            options={[
              { value: '', label: 'Not answered' },
              ...options,
            ]}
          />
        </div>
      ) : (
        <div style={{ width: 140 }}>
          <CanaryInput
            type={InputType.TEXT}
            size={InputSize.NORMAL}
            value={value === undefined ? '' : String(value)}
            onChange={(e) =>
              onChange(e.target.value === '' ? undefined : e.target.value)
            }
          />
        </div>
      )}
    </label>
  );
}

function optionsForAtom(atom: InputAtom): { value: string; label: string }[] {
  if (atom.fieldType === 'boolean-radio') {
    return [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ];
  }
  if (
    (atom.fieldType === 'dropdown' ||
      atom.fieldType === 'string-radio' ||
      atom.fieldType === 'checkbox-group') &&
    atom.optionVariants
  ) {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [];
    for (const variant of atom.optionVariants) {
      for (const opt of variant.options) {
        if (!seen.has(opt.value)) {
          seen.add(opt.value);
          opts.push({ value: opt.value, label: resolveText(opt.label, 'en') || opt.value });
        }
      }
    }
    return opts;
  }
  return [];
}
