'use client';

/**
 * IdConsentEditor
 *
 * Edits a preset-type 'id-consent' step. Four localizable text blocks:
 * - heading, body, CTA label, acknowledgment
 *
 * A thumbnail preview at the top shows how the composed consent screen
 * will look. Full-fidelity preview lives on the Preview tab (Phase 8).
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiShieldCheckOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';

import type { StepInstance, FlowDefinition, IdConsentConfig } from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
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
    <div className="h-full overflow-auto">
      <div className="max-w-[1200px] mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6">
        {/* Editors column */}
        <div className="space-y-6">
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

        {/* Thumbnail preview */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#888] mb-2">
            Preview
          </h3>
          <ConsentThumbnail cfg={cfg} lang={languages[0]} />
          <p className="mt-3 text-[11px] text-[#AAA]">
            Full-fidelity render with guest context is on the <strong>Live Preview</strong> tab.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Thumbnail preview ────────────────────────────────────

function ConsentThumbnail({ cfg, lang }: { cfg: IdConsentConfig; lang: string }) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
      {/* Mock phone chrome */}
      <div className="px-4 py-3 border-b border-[#EEE] bg-[#FAFAFA] flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[#888] font-semibold">
          {lang.toUpperCase()} Preview
        </span>
        <span className="text-[10px] text-[#BBB]">mock</span>
      </div>

      <div className="px-5 pt-6 pb-5 flex flex-col items-start gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colors.colorBlueDark5 }}
        >
          <Icon path={mdiShieldCheckOutline} size={1.2} color={colors.colorBlueDark1} />
        </div>

        <h4 className="text-[18px] font-bold text-[#2B2B2B] leading-tight">
          {resolveText(cfg.heading, lang) || 'Heading goes here'}
        </h4>

        <p className="text-[13px] text-[#666] leading-snug whitespace-pre-wrap">
          {resolveText(cfg.body, lang) || 'Body text explaining the consent.'}
        </p>

        <div className="w-full mt-2 flex items-start gap-2 py-2 px-3 rounded bg-[#FAFAFA] border border-[#EEE]">
          <div className="w-4 h-4 rounded border-2 border-[#AAA] mt-0.5 shrink-0" />
          <p className="text-[11px] text-[#555] leading-snug">
            {resolveText(cfg.acknowledgment, lang) || 'Acknowledgment text.'}
          </p>
        </div>

        <button
          className="mt-2 w-full h-10 rounded-md text-[13px] font-semibold text-white"
          style={{ backgroundColor: colors.colorBlueDark1 }}
          disabled
        >
          {resolveText(cfg.ctaLabel, lang) || 'Continue'}
        </button>
      </div>
    </div>
  );
}
