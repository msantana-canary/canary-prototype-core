'use client';

/**
 * PreviewTab — Phase 8 stub
 *
 * Placeholder for the live PhoneFrame preview with context selector.
 */

import React from 'react';
import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';

interface PreviewTabProps {
  step: StepInstance;
  flow: FlowDefinition;
}

export function PreviewTab({ step }: PreviewTabProps) {
  return (
    <div className="p-8 max-w-[800px] mx-auto">
      <div className="rounded-lg border border-dashed border-[#C5C5C5] bg-white p-10 text-center">
        <h3 className="text-[14px] font-semibold text-[#2B2B2B] mb-2">Live Preview</h3>
        <p className="text-[13px] text-[#888]">
          Phase 8 will render this step inside PhoneFrame — with a context selector (guest nationality, loyalty, age) so conditions drive the preview.
        </p>
        <p className="text-[12px] text-[#AAA] mt-3">Step: {step.name}</p>
      </div>
    </div>
  );
}
