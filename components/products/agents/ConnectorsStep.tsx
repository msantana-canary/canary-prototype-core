'use client';

/**
 * ConnectorsStep — Step 4 of the creation wizard.
 *
 * Template flow: pre-populated connectors, some connected, some need setup.
 * From scratch: all connectors as setup-required.
 * Clicking "Setup required" triggers a mock connecting modal.
 * Sidebar shows additional connectors that can be added to the grid.
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@mdi/react';
import {
  mdiLinkVariant,
  mdiPlusCircleOutline,
  mdiLinkPlus,
  mdiDeleteOutline,
  mdiLanConnect,
} from '@mdi/js';
import {
  CanaryButton,
  CanaryModal,
  CanaryTag,
  ButtonType,
  ButtonSize,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import type { ConnectorConfig, ConnectorStatus as ConnectorStatusType } from '@/lib/products/agents/types';

function ConnectorStatusBadge({ status, onSetup }: { status: ConnectorStatusType; onSetup?: () => void }) {
  switch (status) {
    case 'connected':
      return <CanaryTag label="CONNECTED" color={TagColor.SUCCESS} size={TagSize.COMPACT} />;
    case 'setup-required':
      return (
        <CanaryButton type={ButtonType.TEXT} size={ButtonSize.COMPACT} onClick={onSetup}>
          Setup required
        </CanaryButton>
      );
    case 'not-available':
      return (
        <span style={{ fontSize: 14, fontWeight: 400, color: '#999', lineHeight: '22px' }}>
          Not available
        </span>
      );
  }
}

export default function ConnectorsStep() {
  const connectors = useAgentStore((s) => s.wizardConnectors);
  const setConnectors = useAgentStore((s) => s.setWizardConnectors);

  // Setup modal state
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectPhase, setConnectPhase] = useState<'confirm' | 'connecting' | 'done'>('confirm');

  // Recently added tracking for animation
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());
  const [recentlyConnected, setRecentlyConnected] = useState<Set<string>>(new Set());

  // Main grid: non-"not-available" connectors
  const mainConnectors = connectors.filter((c) => c.status !== 'not-available');
  const sorted = [...mainConnectors].sort((a, b) => {
    const order: Record<string, number> = { connected: 0, 'setup-required': 1, 'not-available': 2 };
    return (order[a.status] ?? 2) - (order[b.status] ?? 2);
  });

  const handleRemove = (id: string) => {
    setConnectors(connectors.map((c) => c.id === id ? { ...c, status: 'not-available' as const } : c));
  };

  const handleSetup = (id: string) => {
    setConnectingId(id);
    setConnectPhase('confirm');
  };

  const handleConfirmSetup = () => {
    setConnectPhase('connecting');
    setTimeout(() => {
      setConnectPhase('done');
      if (connectingId) {
        setConnectors(connectors.map((c) =>
          c.id === connectingId ? { ...c, status: 'connected' as const } : c
        ));
        setRecentlyConnected((prev) => new Set(prev).add(connectingId));
        setTimeout(() => {
          setRecentlyConnected((prev) => { const next = new Set(prev); next.delete(connectingId!); return next; });
        }, 2000);
      }
      setTimeout(() => {
        setConnectingId(null);
        setConnectPhase('confirm');
      }, 1000);
    }, 2000);
  };

  const connectingConnector = connectors.find((c) => c.id === connectingId);

  // Listen for sidebar adds
  React.useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      setRecentlyAdded((prev) => new Set(prev).add(e.detail));
      setTimeout(() => {
        setRecentlyAdded((prev) => { const next = new Set(prev); next.delete(e.detail); return next; });
      }, 1500);
    };
    window.addEventListener('connector-added' as string, handler as EventListener);
    return () => window.removeEventListener('connector-added' as string, handler as EventListener);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        @keyframes connCardFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .conn-card {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .conn-card:hover {
          border-color: #C9D5F0 !important;
          box-shadow: 0 2px 8px rgba(40, 88, 196, 0.08);
        }
        .conn-card-added {
          animation: connAdded 0.5s ease-out;
          border-color: #2858C4 !important;
          box-shadow: 0 0 12px rgba(40, 88, 196, 0.35) !important;
        }
        .conn-card-connected {
          animation: connConnected 2s ease-out;
        }
        @keyframes connAdded {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes connConnected {
          0% { box-shadow: 0 0 12px rgba(0, 128, 64, 0.4); }
          70% { box-shadow: 0 0 12px rgba(0, 128, 64, 0.4); }
          100% { box-shadow: none; }
        }
        .conn-sidebar-card {
          transition: border-color 0.2s ease, background-color 0.2s ease;
          cursor: pointer;
        }
        .conn-sidebar-card:hover {
          border-color: #2858C4 !important;
          background-color: #F8F9FC;
        }
        .conn-sidebar-card:active {
          background-color: #EAEEF9;
        }
        .conn-add-card {
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .conn-add-card:hover {
          border-color: #2858C4 !important;
          background-color: #F8F9FC;
        }
        @keyframes connProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      {/* Intro block */}
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
          <Icon path={mdiLinkVariant} size={1} color="#2858C4" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: '0 0 4px 0' }}>
            What does your agent need access to?
          </p>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '24px', color: '#000', margin: 0 }}>
            Based on your agent&apos;s capabilities, here are the systems it needs access to. We&apos;ve checked what&apos;s already connected to your property.
          </p>
        </div>
      </div>

      {/* 2-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}
      >
        {sorted.map((conn, idx) => (
          <div
            key={conn.id}
            className={`conn-card ${recentlyAdded.has(conn.id) ? 'conn-card-added' : ''} ${recentlyConnected.has(conn.id) ? 'conn-card-connected' : ''}`}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: 4,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: 0,
              animationName: 'connCardFadeIn',
              animationDuration: '0.35s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'forwards',
              animationDelay: `${idx * 0.05}s`,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000' }}>
              {conn.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ConnectorStatusBadge
                status={conn.status}
                onSetup={() => handleSetup(conn.id)}
              />
              <CanaryButton
                type={ButtonType.ICON_SECONDARY}
                size={ButtonSize.COMPACT}
                icon={<Icon path={mdiDeleteOutline} size={0.7} />}
                onClick={() => handleRemove(conn.id)}
              />
            </div>
          </div>
        ))}

        {/* Add connector — always last */}
        <div
          className="conn-add-card"
          style={{
            border: '1px dashed #93ABE1',
            borderRadius: 4,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            opacity: 0,
            animationName: 'connCardFadeIn',
            animationDuration: '0.35s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationDelay: `${sorted.length * 0.05}s`,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#2858C4' }}>
            Select a connector from the right panel to add
          </span>
          <Icon path={mdiPlusCircleOutline} size={0.83} color="#2858C4" />
        </div>
      </div>

      {/* Setup/Connecting Modal — portaled to body so overlay covers full page */}
      {connectPhase === 'confirm' && connectingId && createPortal(
        <CanaryModal
          isOpen={!!connectingId}
          onClose={() => setConnectingId(null)}
          title={`Connect ${connectingConnector?.name || ''}?`}
          size="small"
          closeOnOverlayClick
          footer={
            <div className="flex items-center justify-end gap-2">
              <CanaryButton type={ButtonType.TEXT} onClick={() => setConnectingId(null)}>
                Cancel
              </CanaryButton>
              <CanaryButton type={ButtonType.PRIMARY} onClick={handleConfirmSetup}>
                Connect
              </CanaryButton>
            </div>
          }
        >
          <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: '22px' }}>
            This will establish a connection to {connectingConnector?.name}. In production, you&apos;d be redirected to authenticate with the provider.
          </p>
        </CanaryModal>,
        document.body,
      )}

      {(connectPhase === 'connecting' || connectPhase === 'done') && connectingId && createPortal(
        <CanaryModal
          isOpen={!!connectingId}
          onClose={() => {}}
          size="small"
          showCloseButton={false}
        >
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: connectPhase === 'done' ? '#CCE6D9' : '#EAEEF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                transition: 'background-color 0.5s ease',
              }}
            >
              <Icon
                path={mdiLanConnect}
                size={1.5}
                color={connectPhase === 'done' ? '#008040' : '#2858C4'}
                style={{
                  animation: connectPhase === 'connecting' ? 'deployPulse 0.8s ease-in-out infinite' : undefined,
                }}
              />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: '0 0 8px 0' }}>
              {connectPhase === 'done'
                ? `${connectingConnector?.name} connected!`
                : `Connecting to ${connectingConnector?.name}...`}
            </h2>
            <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: '22px' }}>
              {connectPhase === 'done'
                ? 'Your agent now has access to this system.'
                : 'Authenticating and establishing connection...'}
            </p>
            {connectPhase === 'connecting' && (
              <div
                style={{
                  width: 120,
                  height: 4,
                  backgroundColor: '#E5E5E5',
                  borderRadius: 2,
                  margin: '20px auto 0',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#2858C4',
                    borderRadius: 2,
                    animationName: 'connProgress',
                    animationDuration: '2s',
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards',
                  }}
                />
              </div>
            )}
            <style>{`
              @keyframes deployPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.15); }
              }
            `}</style>
          </div>
        </CanaryModal>,
        document.body,
      )}
    </div>
  );
}

/** Sidebar: additional connectors */
export function ConnectorsSidebar() {
  const connectors = useAgentStore((s) => s.wizardConnectors);
  const setConnectors = useAgentStore((s) => s.setWizardConnectors);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current?.parentElement;
    if (!el) return;
    const handleScroll = () => setIsScrolled(el.scrollTop > 0);
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Sidebar shows not-available connectors + any that were removed from grid
  const sidebarConnectors = connectors.filter((c) => c.status === 'not-available');

  const handleAdd = (id: string) => {
    setConnectors(connectors.map((c) =>
      c.id === id ? { ...c, status: 'setup-required' as const } : c
    ));
    window.dispatchEvent(new CustomEvent('connector-added', { detail: id }));
  };

  return (
    <div ref={scrollRef}>
      {/* Sticky header with scroll shadow */}
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
          <Icon path={mdiLinkPlus} size={1} color="#000" />
        </div>
        <span style={{ fontSize: 16, fontWeight: 500, lineHeight: '24px', color: '#000' }}>
          Connectors
        </span>
      </div>

      {/* Connector cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
        {sidebarConnectors.length === 0 && (
          <p style={{ fontSize: 14, color: '#666', textAlign: 'center', padding: '24px 0' }}>
            All connectors are configured.
          </p>
        )}
        {sidebarConnectors.map((conn) => (
          <div
            key={conn.id}
            className="conn-sidebar-card"
            onClick={() => handleAdd(conn.id)}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: 4,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000' }}>
              {conn.name}
            </span>
            <ConnectorStatusBadge status={conn.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
