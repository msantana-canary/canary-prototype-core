'use client';

/**
 * IdConsentEditor — Phase 5 stub
 *
 * Placeholder for the multi-language ID-consent editor.
 */

import React from 'react';
import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

export function IdConsentEditor({ step }: Props) {
  return (
    <div className="p-8 max-w-[1000px] mx-auto">
      <div className="rounded-lg border border-dashed border-[#C5C5C5] bg-white p-10 text-center">
        <h3 className="text-[14px] font-semibold text-[#2B2B2B] mb-2">ID Consent Editor</h3>
        <p className="text-[13px] text-[#888]">
          Phase 5 will build the multi-language consent editor here (heading, body, CTA, acknowledgment).
        </p>
      </div>
    </div>
  );
}
