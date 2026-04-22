'use client';

/**
 * ConfiguratorShell
 *
 * Top-level container for the check-in flow configurator. Wraps the
 * TopBar (breadcrumb + property switcher + role toggle) and swaps the
 * body based on nav.level (landing / flow / step).
 *
 * The routing is client-side (Zustand-driven) rather than Next.js
 * routes so drill-down feels instant and preserves nav state.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiEyeOutline, mdiShieldAccountOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { TopBar } from './TopBar';
import { LandingView } from './LandingView';
import { FlowView } from './FlowView';
import { StepEditorView } from './StepEditorView';

export function ConfiguratorShell() {
  const navLevel = useCheckInFlowsStore((s) => s.nav.level);
  const role = useCheckInFlowsStore((s) => s.role);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#FAFAFA' }}>
      {role === 'hotel' && <HotelModeBanner />}
      <TopBar />
      {navLevel === 'landing' && <LandingView />}
      {navLevel === 'flow' && <FlowView />}
      {navLevel === 'step' && <StepEditorView />}
    </div>
  );
}

function HotelModeBanner() {
  const setRole = useCheckInFlowsStore((s) => s.setRole);
  return (
    <div
      className="h-9 px-8 flex items-center justify-between gap-3 border-b"
      style={{ backgroundColor: '#FFF8E6', borderColor: '#F4CC66' }}
    >
      <div className="flex items-center gap-2 text-[12px]" style={{ color: '#8B6914' }}>
        <Icon path={mdiEyeOutline} size={0.6} color="#8B6914" />
        <span>
          <strong>Hotel view</strong> — structural changes are locked. Only consent language,
          loyalty welcome, and completion messages are editable by hotel users.
        </span>
      </div>
      <button
        onClick={() => setRole('cs')}
        className="flex items-center gap-1 text-[11px] font-semibold hover:underline"
        style={{ color: '#8B6914' }}
      >
        <Icon path={mdiShieldAccountOutline} size={0.55} />
        Switch back to CS view
      </button>
    </div>
  );
}
