'use client';

/**
 * StepEditorView — Phase 3 stub
 *
 * Renders when nav.level === 'step'. Replaced in Phase 3 with the actual
 * step editor shell (Configuration / Conditions / Preview tabs).
 */

import React from 'react';
import { useCheckInFlowsStore, useStepById } from '@/lib/products/check-in-flows/store';

export function StepEditorView() {
  const { flowId, stepId } = useCheckInFlowsStore((s) => s.nav);
  const step = useStepById(flowId, stepId);
  const goToLanding = useCheckInFlowsStore((s) => s.goToLanding);

  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <p className="text-[14px] text-[#888] mb-3">Step not found.</p>
          <button onClick={goToLanding} className="text-[13px] text-[#2B2B2B] font-semibold hover:underline">
            Back to landing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="max-w-[1200px] mx-auto px-8 py-6">
        <h1 className="text-[22px] font-bold text-[#2B2B2B]">{step.name}</h1>
        <p className="text-[13px] text-[#666] mt-1">{step.templateId} · {step.kind}</p>

        <div className="mt-6 p-10 rounded-lg border border-dashed border-[#C5C5C5] bg-white text-center">
          <p className="text-[14px] text-[#888]">
            Phase 3+ will replace this with: Configuration / Conditions / Preview tabs, schema-form field builder, preset editors.
          </p>
        </div>
      </div>
    </div>
  );
}
