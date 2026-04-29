'use client';

/**
 * CheckInConfigPage — Configuration tab content (Phase 2 of architecture).
 *
 * After Phase 1c rebuild: domain-grouped atom layout.
 * - Top: read-only "Generated flows" indicator (which flows are enabled per Django).
 * - Middle: collapsible sections per AtomDomain, each rendering atoms via <AtomRow>.
 * - Bottom: "Settings handled outside Manage app" collapsible (added in Phase 1e).
 *
 * Old feature-panel layout (Identity / Payment / Deposits / etc.) lives in
 * git history (commit before this one). We replaced it because that layout
 * mirrored Django's structure. The new architecture is data-domain-shaped.
 *
 * See:
 * - docs/CHECK_IN_CONFIGURATOR_ARCHITECTURE.md
 * - docs/CHECK_IN_CONFIGURATOR_PHASE1_PLAN.md
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiWeb,
  mdiCellphone,
  mdiTabletCellphone,
  mdiMonitor,
  mdiApplicationOutline,
} from '@mdi/js';
import {
  CanaryCard,
  CanaryTag,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';

import { useGeneratedFlows } from '@/lib/products/check-in-flows/store';
import { DomainSection } from './configuration/DomainSection';
import { AtomDetailPane } from './configuration/AtomDetailPane';

const SURFACE_ICON: Record<string, string> = {
  'web': mdiWeb,
  'mobile-web': mdiCellphone,
  'tablet-reg': mdiTabletCellphone,
  'kiosk': mdiMonitor,
  'mobile-app': mdiApplicationOutline,
};

export function CheckInConfigPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Top: full-width banner */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <PageIntro />
        <div className="mt-3">
          <FlowsActive />
        </div>
      </div>

      {/* Split pane: domain sections (left) + AtomDetailPane (right) */}
      <div
        className="flex-1 flex overflow-hidden"
        style={{ borderTop: `1px solid ${colors.colorBlack7}` }}
      >
        {/* Left: scrollable atom list */}
        <div
          className="overflow-y-auto px-6 py-5 space-y-4"
          style={{ width: '50%', borderRight: `1px solid ${colors.colorBlack7}` }}
        >
          <DomainSection
            domain="guest-info"
            description="Guest profile data — name, contact, address, stay preferences."
          />
          <DomainSection
            domain="id-documents"
            description="ID consent, ID type, ID photo capture, OCR-extracted field editability."
          />
          <DomainSection
            domain="payment"
            description="Credit card, deposit, surcharge configuration (CS-tunable subset only)."
          />
          <DomainSection
            domain="additional-guests"
            description="Multi-guest check-in field requirements."
          />
          <DomainSection
            domain="auto-check-in"
            description="Auto check-in enablement and pre-conditions."
            defaultExpanded={false}
          />
          <DomainSection
            domain="copy-blocks"
            description="Compliance and policy text — hotel policies, marketing consent, waivers."
          />
          <DomainSection
            domain="custom"
            description="Hotel-defined custom inputs (UDFs)."
            defaultExpanded={false}
          />
        </div>

        {/* Right: atom detail editor (or empty state) */}
        <div className="flex-1 overflow-hidden bg-white">
          <AtomDetailPane />
        </div>
      </div>
    </div>
  );
}

// ── Top intro ──────────────────────────────────────────

function PageIntro() {
  return (
    <div className="pb-2">
      <h2
        className="text-[16px] font-bold mb-1"
        style={{ color: colors.colorBlack1 }}
      >
        Configuration
      </h2>
      <p className="text-[13px]" style={{ color: colors.colorBlack4 }}>
        Define what data check-in collects, how each datapoint routes to PMS,
        and per-surface visibility. Flows compose these atoms into steps —
        edit the Flows tab to arrange how each surface presents this data.
      </p>
    </div>
  );
}

// ── Read-only "active flows" summary ───────────────────

function FlowsActive() {
  const flows = useGeneratedFlows();
  const mainFlows = flows.filter((f) => f.kind === 'main');
  const [expanded, setExpanded] = useState(false);

  return (
    <CanaryCard padding="none" hasBorder>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[13px] font-semibold"
            style={{ color: colors.colorBlack2 }}
          >
            Active flows
          </span>
          <span
            className="text-[11px]"
            style={{ color: colors.colorBlack5 }}
          >
            (set in Django, shown here for transparency)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mainFlows.map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded"
              style={{
                backgroundColor: colors.colorBlack8,
                color: colors.colorBlack3,
                border: `1px solid ${colors.colorBlack7}`,
              }}
            >
              <Icon
                path={SURFACE_ICON[f.surface] ?? mdiWeb}
                size={0.5}
                color={colors.colorBlack4}
              />
              {f.name}
            </span>
          ))}
          <Icon
            path={expanded ? mdiChevronUp : mdiChevronDown}
            size={0.7}
            color={colors.colorBlack4}
          />
        </div>
      </button>
      {expanded && (
        <div
          className="px-5 pb-4 pt-2"
          style={{ borderTop: `1px solid ${colors.colorBlack7}` }}
        >
          <p className="text-[12px] mb-3" style={{ color: colors.colorBlack4 }}>
            These four surfaces are enabled for this hotel. Step composition
            per surface lives in the Flows tab. Whether a surface is enabled
            at all is controlled in Django and is read-only here.
          </p>
          <div className="grid grid-cols-4 gap-3">
            {mainFlows.map((f) => (
              <div
                key={f.id}
                className="rounded-md border p-3"
                style={{ borderColor: colors.colorBlack7 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    path={SURFACE_ICON[f.surface] ?? mdiWeb}
                    size={0.6}
                    color={colors.colorBlack4}
                  />
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: colors.colorBlack2 }}
                  >
                    {f.name}
                  </span>
                </div>
                <p className="text-[11px]" style={{ color: colors.colorBlack5 }}>
                  {f.steps.length} steps
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </CanaryCard>
  );
}
