'use client';

/**
 * TopBar
 *
 * Sits above the content in the configurator. Handles:
 * - Breadcrumb (Landing > Flow > Step)
 * - Property switcher (pill tabs)
 * - Role toggle (CS / Hotel)
 *
 * No back-button — breadcrumb links handle navigation.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiChevronRight, mdiEye, mdiTune } from '@mdi/js';
import { colors } from '@canary-ui/components';
import {
  useCheckInFlowsStore,
  useCurrentProperty,
  useFlowById,
  useStepById,
} from '@/lib/products/check-in-flows/store';

/** ISO country code → unicode flag emoji. */
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return '🏳️';
  const base = 127397; // regional indicator offset
  return String.fromCodePoint(...code.toUpperCase().split('').map((c) => c.charCodeAt(0) + base));
}

export function TopBar() {
  const nav = useCheckInFlowsStore((s) => s.nav);
  const properties = useCheckInFlowsStore((s) => s.properties);
  const currentPropertyId = useCheckInFlowsStore((s) => s.currentPropertyId);
  const setCurrentProperty = useCheckInFlowsStore((s) => s.setCurrentProperty);
  const role = useCheckInFlowsStore((s) => s.role);
  const setRole = useCheckInFlowsStore((s) => s.setRole);
  const goToLanding = useCheckInFlowsStore((s) => s.goToLanding);
  const goToFlow = useCheckInFlowsStore((s) => s.goToFlow);

  const property = useCurrentProperty();
  const flow = useFlowById(nav.flowId);
  const step = useStepById(nav.flowId, nav.stepId);

  return (
    <div className="border-b border-[#E5E5E5] bg-white">
      {/* Row 1: breadcrumb + role toggle */}
      <div className="h-11 px-8 flex items-center justify-between">
        <nav className="flex items-center gap-1.5 text-[13px] text-[#666]">
          <button
            className="hover:text-[#2B2B2B] transition-colors"
            onClick={goToLanding}
          >
            Check-In Flows
          </button>
          {flow && (
            <>
              <Icon path={mdiChevronRight} size={0.6} color="#999" />
              <button
                className={nav.level === 'flow' ? 'text-[#2B2B2B] font-semibold' : 'hover:text-[#2B2B2B] transition-colors'}
                onClick={() => goToFlow(flow.id)}
              >
                {flow.name}
              </button>
            </>
          )}
          {step && (
            <>
              <Icon path={mdiChevronRight} size={0.6} color="#999" />
              <span className="text-[#2B2B2B] font-semibold">{step.name}</span>
            </>
          )}
        </nav>

        {/* Role toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#F4F4F5] border border-[#E5E5E5]">
          <button
            className={`flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] font-semibold transition-all ${
              role === 'cs' ? 'bg-white text-[#2B2B2B] shadow-sm' : 'text-[#888] hover:text-[#555]'
            }`}
            onClick={() => setRole('cs')}
            title="View as Canary Support — fully editable"
          >
            <Icon path={mdiTune} size={0.55} />
            CS
          </button>
          <button
            className={`flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] font-semibold transition-all ${
              role === 'hotel' ? 'bg-white text-[#2B2B2B] shadow-sm' : 'text-[#888] hover:text-[#555]'
            }`}
            onClick={() => setRole('hotel')}
            title="View as Hotel staff — mostly read-only"
          >
            <Icon path={mdiEye} size={0.55} />
            Hotel
          </button>
        </div>
      </div>

      {/* Row 2: property switcher pills */}
      <div className="px-8 pb-3 pt-1 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] uppercase tracking-wider text-[#999] font-semibold shrink-0 mr-1">
          Property
        </span>
        {properties.map((p) => {
          const isActive = p.id === currentPropertyId;
          return (
            <button
              key={p.id}
              onClick={() => setCurrentProperty(p.id)}
              className={`shrink-0 h-8 px-3 rounded-full text-[12px] font-semibold transition-all border flex items-center gap-1.5 ${
                isActive
                  ? 'text-white'
                  : 'bg-white text-[#555] border-[#E5E5E5] hover:border-[#999]'
              }`}
              style={isActive ? { backgroundColor: colors.colorBlueDark1, borderColor: colors.colorBlueDark1 } : undefined}
            >
              <span className="text-[13px] leading-none" aria-hidden>
                {countryFlag(p.countryCode)}
              </span>
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
