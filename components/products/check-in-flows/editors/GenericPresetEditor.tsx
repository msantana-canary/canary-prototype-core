'use client';

/**
 * GenericPresetEditor
 *
 * Fallback editor for preset step types that don't have a dedicated
 * component yet (credit-card, deposit, loyalty-welcome, completion,
 * STB/Alloggiati compliance, id-verification).
 *
 * Phase 3: simple read-out of the config JSON with a "coming soon"
 * copy. Later phases can replace this with focused editors per preset
 * type, but many of these are view-only even for CS so this may be
 * all that's needed.
 */

import React from 'react';
import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

export function GenericPresetEditor({ step }: Props) {
  const cfg = step.config;
  if (cfg.kind !== 'preset') {
    return <div className="p-8 text-center text-[#888]">Not a preset step.</div>;
  }

  return (
    <div className="p-8 max-w-[800px] mx-auto">
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#888] mb-3">
          Preset Configuration
        </h3>
        <dl className="space-y-3">
          {'heading' in cfg && cfg.heading && (
            <Row label="Heading" value={resolveText(cfg.heading)} />
          )}
          {'body' in cfg && cfg.body && (
            <Row label="Body" value={resolveText(cfg.body)} />
          )}
          {'ctaLabel' in cfg && cfg.ctaLabel && (
            <Row label="CTA" value={resolveText(cfg.ctaLabel)} />
          )}
          {'amount' in cfg && (
            <Row label="Amount" value={`${cfg.currency} ${cfg.amount}`} />
          )}
          {'refundable' in cfg && (
            <Row label="Refundable" value={cfg.refundable ? 'Yes' : 'No'} />
          )}
          {'provider' in cfg && (
            <Row label="Provider" value={cfg.provider} />
          )}
          {'programName' in cfg && (
            <Row label="Program" value={cfg.programName} />
          )}
          {'regulationRef' in cfg && (
            <Row label="Regulation" value={cfg.regulationRef} />
          )}
          {'requireBillingAddress' in cfg && (
            <Row label="Require billing address" value={cfg.requireBillingAddress ? 'Yes' : 'No'} />
          )}
          {'requireCvc' in cfg && (
            <Row label="Require CVC" value={cfg.requireCvc ? 'Yes' : 'No'} />
          )}
          {'linkedDeposit' in cfg && (
            <Row label="Linked to deposit" value={cfg.linkedDeposit ? 'Yes' : 'No'} />
          )}
          {'requireSelfie' in cfg && (
            <Row label="Require selfie" value={cfg.requireSelfie ? 'Yes' : 'No'} />
          )}
          {'requireFront' in cfg && (
            <Row label="Require front of ID" value={cfg.requireFront ? 'Yes' : 'No'} />
          )}
          {'requireBack' in cfg && (
            <Row label="Require back of ID" value={cfg.requireBack ? 'Yes' : 'No'} />
          )}
        </dl>
        <p className="mt-6 text-[11px] text-[#AAA] italic">
          This preset&apos;s editor will expand in a future phase. For now, configuration is read-only
          on these fields.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[#F4F4F5] last:border-b-0">
      <dt className="text-[12px] font-semibold text-[#666] shrink-0 w-44">{label}</dt>
      <dd className="text-[13px] text-[#2B2B2B] text-right">{value}</dd>
    </div>
  );
}
