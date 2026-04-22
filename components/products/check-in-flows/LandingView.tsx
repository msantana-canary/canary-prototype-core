'use client';

/**
 * LandingView
 *
 * Entry point for a property's flow configuration. Shows:
 * - Property header (name, brand, country, currency)
 * - Interactive feature-flag grid (toggles regenerate flows live)
 * - Main flow cards (Web Check-In, Mobile Check-In, etc.)
 * - Nested flow cards (Upsells, Mobile Key, Accompanying Guest, etc.)
 */

import React from 'react';
import { useFlowsForCurrentProperty, useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { PropertyContext } from './PropertyContext';
import { FlowCard } from './FlowCard';

export function LandingView() {
  const flows = useFlowsForCurrentProperty();
  const goToFlow = useCheckInFlowsStore((s) => s.goToFlow);

  const mainFlows = flows.filter((f) => f.kind === 'main');
  const nestedFlows = flows.filter((f) => f.kind === 'nested');

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        {/* Property + flags */}
        <PropertyContext />

        {/* Main flows */}
        <div className="mt-8">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#888]">
              Check-In Flows
              <span className="ml-2 font-normal text-[#AAA] normal-case tracking-normal">
                One flow per surface — click to configure
              </span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {mainFlows.map((flow) => (
              <FlowCard
                key={flow.id}
                flow={flow}
                variant="main"
                onClick={() => goToFlow(flow.id)}
              />
            ))}
          </div>
        </div>

        {/* Nested flows */}
        {nestedFlows.length > 0 && (
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#888]">
                Reusable Sub-Flows
                <span className="ml-2 font-normal text-[#AAA] normal-case tracking-normal">
                  Slotted into main flows as nested steps
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {nestedFlows.map((flow) => (
                <FlowCard
                  key={flow.id}
                  flow={flow}
                  variant="nested"
                  onClick={() => goToFlow(flow.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state fallback */}
        {mainFlows.length === 0 && (
          <div className="mt-16 p-10 rounded-lg border border-dashed border-[#C5C5C5] bg-white text-center">
            <p className="text-[14px] text-[#888]">No check-in flows configured for this property yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
