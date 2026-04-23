'use client';

/**
 * ConfiguratorShell
 *
 * Top-level container for the check-in flow configurator. Wraps the
 * TopBar (breadcrumb + property header) and swaps the body based on
 * nav.level (landing / flow / step).
 *
 * Routing is client-side (Zustand-driven) rather than Next.js
 * routes so drill-down feels instant and preserves nav state.
 */

import React from 'react';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { TopBar } from './TopBar';
import { LandingView } from './LandingView';
import { FlowView } from './FlowView';
import { StepEditorView } from './StepEditorView';

export function ConfiguratorShell() {
  const navLevel = useCheckInFlowsStore((s) => s.nav.level);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#FAFAFA' }}>
      <TopBar />
      {navLevel === 'landing' && <LandingView />}
      {navLevel === 'flow' && <FlowView />}
      {navLevel === 'step' && <StepEditorView />}
    </div>
  );
}
