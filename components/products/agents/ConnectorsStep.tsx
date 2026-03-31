'use client';

/**
 * ConnectorsStep — Step 4 of the creation wizard.
 *
 * Shows connected external systems with status badges.
 * Left panel: 2-column grid of connector cards + "Add connector" + standalone rows.
 * Right sidebar: additional connectors with varied statuses.
 * Matches Figma node 101-14883.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiLinkVariant,
  mdiPlusCircleOutline,
  mdiLinkPlus,
} from '@mdi/js';
import {
  CanaryButton,
  CanaryTag,
  ButtonType,
  ButtonSize,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import type { ConnectorStatus } from '@/lib/products/agents/types';

function ConnectorStatus({ status }: { status: ConnectorStatus }) {
  switch (status) {
    case 'connected':
      return <CanaryTag label="CONNECTED" color={TagColor.SUCCESS} size={TagSize.COMPACT} />;
    case 'setup-required':
      return (
        <CanaryButton type={ButtonType.TEXT} size={ButtonSize.COMPACT}>
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

  // Show all non-"not-available" connectors in main grid
  const mainConnectors = connectors.filter((c) => c.status !== 'not-available');

  // Sort: connected first, then setup-required
  const sorted = [...mainConnectors].sort((a, b) => {
    const order: Record<string, number> = { connected: 0, 'setup-required': 1, 'not-available': 2 };
    return (order[a.status] ?? 2) - (order[b.status] ?? 2);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
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
        @keyframes connAdded {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
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

      {/* 2-column grid: all connectors + add card at the end */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}
      >
        {sorted.map((conn) => (
          <div
            key={conn.id}
            className="conn-card"
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
            <ConnectorStatus status={conn.status} />
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
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#2858C4' }}>
            Add connector
          </span>
          <Icon path={mdiPlusCircleOutline} size={0.83} color="#2858C4" />
        </div>
      </div>
    </div>
  );
}

/** Sidebar: additional connectors — rendered by WizardLayout */
export function ConnectorsSidebar() {
  const connectors = useAgentStore((s) => s.wizardConnectors);
  const setConnectors = useAgentStore((s) => s.setWizardConnectors);
  // Sidebar shows connectors not in the main grid (setup-required, not-available, extras)
  const sidebarOnlyIds = new Set(['cnx-square', 'cnx-hotsos']);
  const sidebarConnectors = connectors.filter(
    (c) => sidebarOnlyIds.has(c.id) || c.status === 'not-available'
  );

  const handleAdd = (id: string) => {
    // Move to main grid by changing status to connected and removing from sidebar-only
    setConnectors(connectors.map((c) =>
      c.id === id ? { ...c, status: 'connected' as const } : c
    ));
  };

  return (
    <div>
      {/* Sticky header */}
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
          borderBottom: '1px solid #E5E5E5',
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
            className={conn.status !== 'not-available' ? 'conn-sidebar-card' : 'conn-card'}
            onClick={() => conn.status !== 'not-available' && handleAdd(conn.id)}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: 4,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: conn.status !== 'not-available' ? 'pointer' : 'default',
              opacity: conn.status === 'not-available' ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: '22px', color: '#000' }}>
              {conn.name}
            </span>
            <ConnectorStatus status={conn.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
