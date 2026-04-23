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
import { mdiChevronRight } from '@mdi/js';
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
  const goToLanding = useCheckInFlowsStore((s) => s.goToLanding);
  const goToFlow = useCheckInFlowsStore((s) => s.goToFlow);

  const property = useCurrentProperty();
  const flow = useFlowById(nav.flowId);
  const step = useStepById(nav.flowId, nav.stepId);

  return (
    <div className="border-b border-[#E5E5E5] bg-white">
      {/* Breadcrumb + property identity on a single line */}
      <div className="h-12 px-8 flex items-center justify-between gap-6">
        <nav className="flex items-center gap-1.5 text-[13px] text-[#666] min-w-0">
          <button
            className="hover:text-[#2B2B2B] transition-colors shrink-0"
            onClick={goToLanding}
          >
            Check-In Flows
          </button>
          {flow && (
            <>
              <Icon path={mdiChevronRight} size={0.6} color="#999" />
              <button
                className={`truncate ${nav.level === 'flow' ? 'text-[#2B2B2B] font-semibold' : 'hover:text-[#2B2B2B] transition-colors'}`}
                onClick={() => goToFlow(flow.id)}
              >
                {flow.name}
              </button>
            </>
          )}
          {step && (
            <>
              <Icon path={mdiChevronRight} size={0.6} color="#999" />
              <span className="text-[#2B2B2B] font-semibold truncate">{step.name}</span>
            </>
          )}
        </nav>

        <div
          className="flex items-center gap-2 text-[12px] font-semibold shrink-0"
          style={{ color: colors.colorBlueDark1 }}
        >
          <span className="text-[14px] leading-none" aria-hidden>
            {countryFlag(property.countryCode)}
          </span>
          <span>{property.name}</span>
        </div>
      </div>
    </div>
  );
}
