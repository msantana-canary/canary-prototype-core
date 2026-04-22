'use client';

/**
 * FlowView — Phase 2 stub
 *
 * Renders when nav.level === 'flow'. Currently shows a placeholder that
 * proves navigation works end-to-end. Phase 2 will replace this with the
 * ordered step list + add/remove/reorder/drill-in affordances.
 */

import React from 'react';
import { useCheckInFlowsStore, useFlowById } from '@/lib/products/check-in-flows/store';

export function FlowView() {
  const flowId = useCheckInFlowsStore((s) => s.nav.flowId);
  const flow = useFlowById(flowId);
  const goToLanding = useCheckInFlowsStore((s) => s.goToLanding);

  if (!flow) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <p className="text-[14px] text-[#888] mb-3">Flow not found.</p>
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
        <h1 className="text-[22px] font-bold text-[#2B2B2B]">{flow.name}</h1>
        <p className="text-[13px] text-[#666] mt-1">{flow.steps.length} steps · {flow.kind} flow</p>

        <div className="mt-6 p-10 rounded-lg border border-dashed border-[#C5C5C5] bg-white text-center">
          <p className="text-[14px] text-[#888]">
            Phase 2: flow view coming next. Will show ordered step list with drag-drop reorder, add/remove steps, and drill-in to per-step editor.
          </p>
        </div>
      </div>
    </div>
  );
}
