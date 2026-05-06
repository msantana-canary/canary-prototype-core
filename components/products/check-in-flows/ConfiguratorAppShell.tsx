'use client';

/**
 * ConfiguratorAppShell — the "bubble" the Flow Builder lives in.
 *
 * Replaces the standard settings sidebar with a dedicated dark sidebar
 * matching the kiosk admin app pattern. The sidebar IS the navigation:
 * it lists each Flow under a "Form Builder" section, plus a "Library"
 * sub-item for the atom registry. Clicking a flow selects it; clicking
 * Library switches to the atom registry tab.
 *
 * The mock items (Issues, Onboarding, Tipping, etc.) are intentionally
 * inert — they convey "you're inside one section of a larger admin app"
 * without us having to build those sections.
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiCellphone,
  mdiApplicationOutline,
  mdiTabletCellphone,
  mdiMonitor,
  mdiBookOpenVariant,
  mdiNoteEditOutline,
  mdiTicketOutline,
  mdiSchoolOutline,
  mdiOfficeBuildingMarker,
  mdiCashRegister,
  mdiCreditCardOutline,
  mdiMonitorDashboard,
  mdiShieldCheckOutline,
  mdiBrain,
  mdiLinkVariant,
  mdiCogOutline,
  mdiChevronDown,
} from '@mdi/js';

import {
  useCheckInFlowsStore,
  useGeneratedFlows,
} from '@/lib/products/check-in-flows/store';
import type { FlowDefinition } from '@/lib/products/check-in-flows/types';

const SIDEBAR_BG = '#0E0F14';
const SIDEBAR_BG_HOVER = '#1A1C24';
const SIDEBAR_BG_ACTIVE = '#1F232C';
const SIDEBAR_TEXT = '#C9CDD6';
const SIDEBAR_TEXT_MUTED = '#5C6273';
const SIDEBAR_TEXT_ACTIVE = '#FFFFFF';
const SIDEBAR_SECTION_LABEL = '#7A8194';
const SIDEBAR_DIVIDER = '#1F232C';
const SIDEBAR_ACCENT = '#5B8DEF';

const SURFACE_ICON: Record<string, string> = {
  'mobile-web': mdiCellphone,
  'mobile-app': mdiApplicationOutline,
  'tablet-reg': mdiTabletCellphone,
  'kiosk': mdiMonitor,
};

// ── Mock sections (visually conveys "this is a bigger admin app") ─

interface MockItem {
  id: string;
  label: string;
  icon: string;
}

const MOCK_TOP: MockItem[] = [
  { id: 'issues', label: 'New issue', icon: mdiTicketOutline },
  { id: 'onboarding', label: 'Onboarding', icon: mdiSchoolOutline },
  { id: 'properties', label: 'Properties', icon: mdiOfficeBuildingMarker },
];

const MOCK_BOTTOM: MockItem[] = [
  { id: 'tipping', label: 'Tipping orders', icon: mdiCashRegister },
  { id: 'payments', label: 'Payments', icon: mdiCreditCardOutline },
  { id: 'kiosk-mock', label: 'Kiosk', icon: mdiMonitorDashboard },
  { id: 'auths', label: 'Authorizations', icon: mdiShieldCheckOutline },
  { id: 'runbook', label: 'Runbook generator', icon: mdiBookOpenVariant },
  { id: 'ai-playground', label: 'AI Playground', icon: mdiBrain },
  { id: 'linear', label: 'Linear agent', icon: mdiLinkVariant },
];

export function ConfiguratorAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const flows = useGeneratedFlows();
  const nav = useCheckInFlowsStore((s) => s.nav);
  const selectFlow = useCheckInFlowsStore((s) => s.selectFlow);
  const setTab = useCheckInFlowsStore((s) => s.setTab);

  // Auto-select the first flow on mount if none is selected — the
  // sidebar is the nav, so "no flow selected" is no longer a valid
  // landing state.
  useEffect(() => {
    if (nav.tab === 'flows' && !nav.flowId && flows.length > 0) {
      selectFlow(flows[0].id);
    }
  }, [nav.tab, nav.flowId, flows, selectFlow]);

  const isLibrary = nav.tab === 'configuration';
  const activeFlowId = !isLibrary ? nav.flowId : null;

  const handleFlowClick = (flowId: string) => {
    setTab('flows');
    selectFlow(flowId);
  };

  const handleLibraryClick = () => {
    setTab('configuration');
  };

  return (
    <div className="h-screen w-screen flex" style={{ backgroundColor: SIDEBAR_BG }}>
      {/* Left: dark sidebar */}
      <aside
        className="shrink-0 flex flex-col"
        style={{
          width: 180,
          backgroundColor: SIDEBAR_BG,
          color: SIDEBAR_TEXT,
        }}
      >
        {/* Logo / brand */}
        <div className="px-3 pt-4 pb-3 flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #5B8DEF 0%, #3A6BD4 100%)',
              boxShadow: '0 2px 6px rgba(91, 141, 239, 0.3)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
              C
            </span>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: SIDEBAR_TEXT_ACTIVE,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            Canary
          </span>
        </div>

        {/* Back-to-settings escape hatch */}
        <button
          onClick={() => router.push('/settings')}
          className="mx-2 mb-1.5 px-2 py-1 rounded flex items-center gap-1.5 text-left transition-colors"
          style={{ color: SIDEBAR_TEXT_MUTED, fontSize: 11 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = SIDEBAR_BG_HOVER;
            e.currentTarget.style.color = SIDEBAR_TEXT;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = SIDEBAR_TEXT_MUTED;
          }}
          title="Back to settings"
        >
          <Icon path={mdiArrowLeft} size={0.5} />
          Settings
        </button>

        <div style={{ height: 1, backgroundColor: SIDEBAR_DIVIDER, margin: '4px 10px 6px' }} />

        {/* Scroll region — top mock items, Form Builder, bottom mock items */}
        <div className="flex-1 overflow-y-auto px-1.5 pb-3 sidebar-scroll">
          {/* Top mock items */}
          {MOCK_TOP.map((item) => (
            <MockRow key={item.id} item={item} />
          ))}

          {/* Form Builder section header + nested sub-items */}
          <div className="mt-3 mb-1 px-2 flex items-center gap-1">
            <Icon path={mdiNoteEditOutline} size={0.5} color={SIDEBAR_SECTION_LABEL} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: SIDEBAR_SECTION_LABEL,
              }}
            >
              Form Builder
            </span>
            <Icon path={mdiChevronDown} size={0.4} color={SIDEBAR_SECTION_LABEL} />
          </div>

          {flows.map((flow) => (
            <FlowRow
              key={flow.id}
              flow={flow}
              isActive={flow.id === activeFlowId}
              onClick={() => handleFlowClick(flow.id)}
            />
          ))}

          <LibraryRow isActive={isLibrary} onClick={handleLibraryClick} />

          {/* Bottom mock items */}
          <div style={{ height: 1, backgroundColor: SIDEBAR_DIVIDER, margin: '10px 4px' }} />
          {MOCK_BOTTOM.map((item) => (
            <MockRow key={item.id} item={item} />
          ))}
        </div>

        {/* User profile pinned to bottom */}
        <div
          className="px-2.5 py-2.5 flex items-center gap-2"
          style={{ borderTop: `1px solid ${SIDEBAR_DIVIDER}` }}
        >
          <img
            src="https://i.pravatar.cc/150?img=5"
            alt="Theresa Webb"
            className="w-6 h-6 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: SIDEBAR_TEXT_ACTIVE,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Theresa Webb
            </div>
            <div
              style={{
                fontSize: 10,
                color: SIDEBAR_TEXT_MUTED,
                lineHeight: 1.2,
                marginTop: 1,
              }}
            >
              Front desk
            </div>
          </div>
          <Icon path={mdiCogOutline} size={0.55} color={SIDEBAR_TEXT_MUTED} />
        </div>

        <style jsx>{`
          .sidebar-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: ${SIDEBAR_DIVIDER};
            border-radius: 3px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: ${SIDEBAR_TEXT_MUTED};
          }
        `}</style>
      </aside>

      {/* Right: configurator content area, on a light surface */}
      <main
        className="flex-1 overflow-hidden"
        style={{ backgroundColor: '#FAFAFA' }}
      >
        {children}
      </main>
    </div>
  );
}

// ── Sidebar rows ────────────────────────────────────────

function MockRow({ item }: { item: MockItem }) {
  return (
    <div
      className="px-2 py-1 flex items-center gap-2 rounded-md cursor-default select-none"
      style={{ color: SIDEBAR_TEXT_MUTED, fontSize: 12 }}
      title="Inactive in Flow Builder demo"
    >
      <Icon path={item.icon} size={0.55} color={SIDEBAR_TEXT_MUTED} />
      <span style={{ fontWeight: 400 }} className="truncate">{item.label}</span>
    </div>
  );
}

function FlowRow({
  flow,
  isActive,
  onClick,
}: {
  flow: FlowDefinition;
  isActive: boolean;
  onClick: () => void;
}) {
  const icon = SURFACE_ICON[flow.surface] ?? mdiCellphone;
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-2 rounded-md transition-colors relative"
      style={{
        padding: '6px 8px 6px 12px',
        marginLeft: 8,
        width: 'calc(100% - 8px)',
        backgroundColor: isActive ? SIDEBAR_BG_ACTIVE : 'transparent',
        color: isActive ? SIDEBAR_TEXT_ACTIVE : SIDEBAR_TEXT,
        fontSize: 12,
        fontWeight: isActive ? 600 : 400,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = SIDEBAR_BG_HOVER;
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {isActive && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 4,
            bottom: 4,
            width: 3,
            borderRadius: 2,
            backgroundColor: SIDEBAR_ACCENT,
          }}
        />
      )}
      <Icon
        path={icon}
        size={0.55}
        color={isActive ? SIDEBAR_ACCENT : SIDEBAR_TEXT_MUTED}
      />
      <span className="truncate">{flow.name}</span>
    </button>
  );
}

function LibraryRow({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left flex items-center gap-2 rounded-md transition-colors relative mt-0.5"
      style={{
        padding: '6px 8px 6px 12px',
        marginLeft: 8,
        width: 'calc(100% - 8px)',
        backgroundColor: isActive ? SIDEBAR_BG_ACTIVE : 'transparent',
        color: isActive ? SIDEBAR_TEXT_ACTIVE : SIDEBAR_TEXT,
        fontSize: 12,
        fontWeight: isActive ? 600 : 400,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = SIDEBAR_BG_HOVER;
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
      title="Browse the atom registry — every component available across flows"
    >
      {isActive && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 4,
            bottom: 4,
            width: 3,
            borderRadius: 2,
            backgroundColor: SIDEBAR_ACCENT,
          }}
        />
      )}
      <Icon
        path={mdiBookOpenVariant}
        size={0.55}
        color={isActive ? SIDEBAR_ACCENT : SIDEBAR_TEXT_MUTED}
      />
      <span>Library</span>
    </button>
  );
}
