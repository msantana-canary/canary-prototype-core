'use client';

/**
 * Check-In Flows Page
 *
 * Settings page for configuring check-in flows per property.
 * Phase 0: scaffolding placeholder that verifies the data layer loads.
 * Future phases will build: landing → flow view → step editor → live preview.
 */

import {
  useCheckInFlowsStore,
  useCurrentProperty,
  useFlowsForCurrentProperty,
} from '@/lib/products/check-in-flows/store';
import { SURFACE_LABELS } from '@/lib/products/check-in-flows/types';

export default function CheckInFlowsPage() {
  const property = useCurrentProperty();
  const flows = useFlowsForCurrentProperty();
  const setCurrentProperty = useCheckInFlowsStore((s) => s.setCurrentProperty);
  const properties = useCheckInFlowsStore((s) => s.properties);
  const currentPropertyId = useCheckInFlowsStore((s) => s.currentPropertyId);

  const mainFlows = flows.filter((f) => f.kind === 'main');
  const nestedFlows = flows.filter((f) => f.kind === 'nested');

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Scaffolding header */}
      <div className="px-10 pt-8 pb-4 border-b border-[#E5E5E5] bg-white">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-bold leading-tight" style={{ color: '#2B2B2B' }}>
              Check-In Flows
            </h1>
            <p className="text-[14px] text-[#666] mt-1">
              Configure how guests check in across web, mobile, tablet, and kiosk.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[13px] text-[#666]">Property</label>
            <select
              value={currentPropertyId}
              onChange={(e) => setCurrentProperty(e.target.value)}
              className="px-3 py-2 rounded-md border border-[#E5E5E5] bg-white text-[14px]"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Phase 0 placeholder content */}
      <div className="flex-1 overflow-auto px-10 py-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Property context */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6 mb-6">
            <h2 className="text-[16px] font-bold text-[#2B2B2B] mb-1">{property.name}</h2>
            <p className="text-[13px] text-[#666] mb-4">
              {property.address} · {property.country} · Brand: {property.brand ?? 'independent'} · {property.currency}
            </p>

            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#888] mb-2">Feature flags</h3>
            <div className="grid grid-cols-3 gap-y-1 gap-x-4 text-[13px]">
              {Object.entries(property.features).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={value ? 'text-[#2B2B2B]' : 'text-[#999]'}>{key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main flows */}
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#888] mb-2">
            Main flows ({mainFlows.length})
          </h3>
          <div className="space-y-2 mb-6">
            {mainFlows.map((flow) => (
              <div key={flow.id} className="bg-white rounded-lg border border-[#E5E5E5] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[15px] font-semibold text-[#2B2B2B]">{flow.name}</h4>
                    <p className="text-[12px] text-[#666]">{SURFACE_LABELS[flow.surface]} · {flow.steps.length} steps</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {flow.isDefault && !flow.isCustomized && (
                      <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded bg-gray-100 text-gray-600">Default</span>
                    )}
                    {flow.isCustomized && (
                      <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded bg-blue-100 text-blue-700">Customized</span>
                    )}
                  </div>
                </div>
                {/* Step preview */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {flow.steps.map((step, idx) => (
                    <span
                      key={step.id}
                      className="text-[11px] px-2 py-0.5 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#555]"
                      title={step.name}
                    >
                      {idx + 1}. {step.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Nested flows */}
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[#888] mb-2">
            Nested flows ({nestedFlows.length})
          </h3>
          <div className="space-y-2">
            {nestedFlows.map((flow) => (
              <div key={flow.id} className="bg-white rounded-lg border border-[#E5E5E5] p-4">
                <h4 className="text-[15px] font-semibold text-[#2B2B2B]">{flow.name}</h4>
                {flow.description && (
                  <p className="text-[12px] text-[#666] mt-0.5">{flow.description}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-lg border border-dashed border-[#C5C5C5] bg-white text-center text-[13px] text-[#888]">
            Phase 0 scaffold — data layer verified. Phase 1+ will replace this with the real UI.
          </div>
        </div>
      </div>
    </div>
  );
}
