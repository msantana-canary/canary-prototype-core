'use client';

/**
 * IdCaptureEditor — Phase 6 stub
 *
 * Placeholder for the ID-type options editor with per-option
 * nationality conditions.
 */

import React from 'react';
import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

export function IdCaptureEditor({ step }: Props) {
  const optionCount =
    step.config.kind === 'preset' && step.config.presetType === 'id-capture'
      ? step.config.idTypeOptions.length
      : 0;
  return (
    <div className="p-8 max-w-[1000px] mx-auto">
      <div className="rounded-lg border border-dashed border-[#C5C5C5] bg-white p-10 text-center">
        <h3 className="text-[14px] font-semibold text-[#2B2B2B] mb-2">ID Capture Editor</h3>
        <p className="text-[13px] text-[#888]">
          Phase 6 will build the ID-type options editor here with per-option nationality conditions. Currently {optionCount} options configured.
        </p>
      </div>
    </div>
  );
}
