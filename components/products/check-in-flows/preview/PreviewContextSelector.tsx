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
  FlowDefinition,
  InputAtom,
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';

interface Props {
  flow: FlowDefinition;
}

export function PreviewContextSelector({ flow }: Props) {
  const allAtoms = useCheckInFlowsStore((s) => s.atoms);
  const previewContext = useCheckInFlowsStore((s) => s.previewContext);
  const setPreviewContext = useCheckInFlowsStore((s) => s.setPreviewContext);

  const gateAtoms = useGateAtoms(flow, allAtoms);
  if (gateAtoms.length === 0) return null;

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
