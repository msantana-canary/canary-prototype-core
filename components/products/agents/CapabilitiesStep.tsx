'use client';

/**
 * CapabilitiesStep — Step 2 of the creation wizard.
 *
 * Shows Canary products the agent can use. Active capabilities in a 3-column grid
 * on the left, available capabilities in a sidebar on the right.
 * Matches Figma node 101-14347.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiMessageTextOutline,
  mdiPhoneOutline,
  mdiLoginVariant,
  mdiLogoutVariant,
  mdiCashMultiple,
  mdiFileSign,
  mdiShieldCheckOutline,
  mdiCurrencyUsd,
  mdiCreditCardOutline,
  mdiBookOpenOutline,
  mdiCogOutline,
  mdiDeleteOutline,
  mdiPlusCircleOutline,
  mdiPuzzleOutline,
  mdiWrenchOutline,
} from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';

const CAPABILITY_ICON_MAP: Record<string, string> = {
  mdiMessageTextOutline,
  mdiPhoneOutline,
  mdiLoginVariant,
  mdiLogoutVariant,
  mdiCashMultiple,
  mdiFileSignOutline: mdiFileSign,
  mdiShieldCheckOutline,
  mdiCurrencyUsd,
  mdiCreditCardOutline,
  mdiBookOpenOutline,
};

function getIcon(iconName: string): string {
  return CAPABILITY_ICON_MAP[iconName] || mdiPuzzleOutline;
}

export default function CapabilitiesStep() {
  const capabilities = useAgentStore((s) => s.wizardCapabilities);
  const setCapabilities = useAgentStore((s) => s.setWizardCapabilities);
  const [recentlyAdded, setRecentlyAdded] = React.useState<Set<string>>(new Set());

  const activeCapabilities = capabilities.filter((c) => c.enabled);

  const handleRemove = (id: string) => {
    // Keep in place but disable
    setCapabilities(capabilities.map((c) => c.id === id ? { ...c, enabled: false } : c));
    setRecentlyAdded((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleAddToGrid = (id: string) => {
    // Move to end of array so it fills the next grid slot
    const cap = capabilities.find((c) => c.id === id);
    if (!cap) return;
    const without = capabilities.filter((c) => c.id !== id);
    setCapabilities([...without, { ...cap, enabled: true }]);
  };

  // Called from sidebar when adding
  React.useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      setRecentlyAdded((prev) => new Set(prev).add(e.detail));
      setTimeout(() => {
        setRecentlyAdded((prev) => { const next = new Set(prev); next.delete(e.detail); return next; });
      }, 1500);
    };
    window.addEventListener('capability-added' as string, handler as EventListener);
    return () => window.removeEventListener('capability-added' as string, handler as EventListener);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        .cap-card {
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .cap-card:hover {
          border-color: #C9D5F0 !important;
          box-shadow: 0 2px 8px rgba(40, 88, 196, 0.08);
        }
        .cap-card-added {
          animation: capAdded 0.5s ease-out;
          border-color: #2858C4 !important;
          box-shadow: 0 0 0 1px #2858C4, 0 4px 12px rgba(40, 88, 196, 0.15) !important;
        }
        @keyframes capAdded {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        .cap-sidebar-card {
          transition: border-color 0.2s ease, background-color 0.2s ease;
          cursor: pointer;
        }
        .cap-sidebar-card:hover {
          border-color: #2858C4 !important;
          background-color: #F8F9FC;
        }
        .cap-sidebar-card:active {
          background-color: #EAEEF9;
        }
        .cap-add-card {
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .cap-add-card:hover {
          border-color: #2858C4;
          background-color: #F8F9FC;
        }
      `}</style>
      {/* Intro block — no card, sits on #FAFAFA */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: '#EAEEF9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 8,
          }}
        >
          <Icon path={mdiPuzzleOutline} size={1} color="#2858C4" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: '0 0 4px 0' }}>
            What can your agent do?
          </p>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '24px', color: '#000', margin: 0 }}>
            Based on your Sales & Events Agent, we recommend these capabilities. Add or remove capabilities to match how your team works.
          </p>
        </div>
      </div>

      {/* Capabilities grid — 3 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        {activeCapabilities.map((cap) => (
          <div
            key={cap.id}
            className={`cap-card ${recentlyAdded.has(cap.id) ? 'cap-card-added' : ''}`}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: 4,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Header: icon left, gear+delete right */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Icon path={getIcon(cap.icon)} size={1} color="#000" />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CanaryButton
                  type={ButtonType.ICON_SECONDARY}
                  size={ButtonSize.COMPACT}
                  icon={<Icon path={mdiCogOutline} size={0.83} />}
                />
                <CanaryButton
                  type={ButtonType.ICON_SECONDARY}
                  size={ButtonSize.COMPACT}
                  icon={<Icon path={mdiDeleteOutline} size={0.83} />}
                  onClick={() => handleRemove(cap.id)}
                />
              </div>
            </div>
            {/* Name + description */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000', margin: 0 }}>
                {cap.name}
              </p>
              <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#000', margin: 0 }}>
                {cap.description}
              </p>
            </div>
          </div>
        ))}

        {/* Add capability card */}
        <div
          className="cap-add-card"
          style={{
            border: '1px dashed #93ABE1',
            borderRadius: 4,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <Icon path={mdiPlusCircleOutline} size={1} color="#2858C4" />
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#2858C4', margin: 0, textAlign: 'center' }}>
            Select a capability from the right panel to add
          </p>
        </div>
      </div>
    </div>
  );
}

/** Sidebar content for available capabilities — matches Figma right panel */
export function CapabilitiesSidebar() {
  const capabilities = useAgentStore((s) => s.wizardCapabilities);
  const setCapabilities = useAgentStore((s) => s.setWizardCapabilities);
  const availableCapabilities = capabilities.filter((c) => !c.enabled);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current?.parentElement;
    if (!el) return;
    const handleScroll = () => setIsScrolled(el.scrollTop > 0);
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAdd = (id: string) => {
    // Move to end so it appears at the next grid slot
    const cap = capabilities.find((c) => c.id === id);
    if (!cap) return;
    const without = capabilities.filter((c) => c.id !== id);
    setCapabilities([...without, { ...cap, enabled: true }]);
    window.dispatchEvent(new CustomEvent('capability-added', { detail: id }));
  };

  return (
    <div ref={scrollRef}>
      {/* Sidebar header — sticky at top of scroll container */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '16px 24px',
          boxShadow: isScrolled ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#E5E5E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon path={mdiWrenchOutline} size={1} color="#000" />
        </div>
        <span style={{ fontSize: 16, fontWeight: 500, lineHeight: '24px', color: '#000' }}>
          Capabilities
        </span>
      </div>

      {/* Available capability cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
        {availableCapabilities.length === 0 && (
          <p style={{ fontSize: 14, color: '#666', textAlign: 'center', padding: '24px 0' }}>
            All capabilities are in use.
          </p>
        )}
        {availableCapabilities.map((cap) => (
          <div
            key={cap.id}
            className="cap-sidebar-card"
            onClick={() => handleAdd(cap.id)}
            style={{
              border: '1px solid #E5E5E5',
              borderRadius: 4,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Icon + gear on same row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Icon path={getIcon(cap.icon)} size={1} color="#000" />
              <CanaryButton
                type={ButtonType.ICON_SECONDARY}
                size={ButtonSize.COMPACT}
                icon={<Icon path={mdiCogOutline} size={0.83} />}
              />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000', margin: 0 }}>
                {cap.name}
              </p>
              <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#000', margin: 0 }}>
                {cap.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
