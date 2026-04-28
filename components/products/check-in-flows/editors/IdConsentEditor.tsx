'use client';

/**
 * IdConsentEditor
 *
 * Edits a preset-type 'id-consent' step. Four localizable text blocks:
 * heading, body, CTA label, acknowledgment. The right-pane phone
 * preview in FlowEditorView renders the live result.
 */

import React from 'react';

import type { StepInstance, FlowDefinition, IdConsentConfig } from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore, useCurrentProperty } from '@/lib/products/check-in-flows/store';
import { LocalizedTextEditor } from './LocalizedTextEditor';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

export function IdConsentEditor({ step, flow, isReadOnly }: Props) {
  const property = useCurrentProperty();
  const updateStepConfig = useCheckInFlowsStore((s) => s.updateStepConfig);

  if (step.config.kind !== 'preset' || step.config.presetType !== 'id-consent') {
    return <div className="p-8 text-center text-[#888]">Not an ID Consent step.</div>;
  }

  const cfg = step.config as IdConsentConfig;
  const languages = property.defaultLanguages;

  const update = (patch: Partial<IdConsentConfig>) => {
    if (isReadOnly) return;
    updateStepConfig(flow.id, step.id, (current) => ({ ...current, ...patch }) as IdConsentConfig);
  };

  return (
    <div>
      <div className="px-6 py-6">
        <section className="bg-white rounded-lg border border-[#E5E5E5] p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#888]">
              Consent Copy
            </h3>
            <span className="text-[11px] text-[#AAA]">
              Translate into each language your property supports
            </span>
          </div>
          <div className="space-y-5">
            <LocalizedTextEditor
              label="Heading"
              hint="Shown prominently at the top"
              value={cfg.heading}
              onChange={(v) => update({ heading: v })}
              languages={languages}
              disabled={isReadOnly}
              placeholder="e.g. Identity verification"
            />

            <LocalizedTextEditor
              label="Body"
              hint="Explains why ID is being collected"
              value={cfg.body}
              onChange={(v) => update({ body: v })}
              languages={languages}
              multiline
              rows={4}
              disabled={isReadOnly}
              placeholder="Explain to the guest why you need their ID and how it will be handled."
            />

            <LocalizedTextEditor
              label="CTA label"
              hint="Primary button text"
              value={cfg.ctaLabel}
              onChange={(v) => update({ ctaLabel: v })}
              languages={languages}
              disabled={isReadOnly}
              placeholder="e.g. Continue"
            />

            <LocalizedTextEditor
              label="Acknowledgment"
              hint="Legal consent text shown by the checkbox"
              value={cfg.acknowledgment}
              onChange={(v) => update({ acknowledgment: v })}
              languages={languages}
              multiline
              rows={3}
              disabled={isReadOnly}
              placeholder="I consent to the collection of my ID document."
            />
          </div>
        </section>
      </div>
    </div>
  );
}
