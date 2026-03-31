'use client';

/**
 * ConnectorsStep — Step 4 of the creation wizard.
 *
 * Shows connected external systems with status badges.
 * Left panel: active connectors grid. Right sidebar: additional connectors.
 * Matches Figma node 101-14807.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiLinkVariant,
  mdiPlusCircleOutline,
} from '@mdi/js';
import {
  CanaryCard,
  CanaryList,
  CanaryListItem,
  CanaryTag,
  TagColor,
  TagVariant,
  TagSize,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import type { ConnectorConfig, ConnectorStatus } from '@/lib/products/agents/types';

function statusTag(status: ConnectorStatus) {
  switch (status) {
    case 'connected':
      return <CanaryTag label="CONNECTED" color={TagColor.SUCCESS} size={TagSize.COMPACT} />;
    case 'setup-required':
      return <span style={{ fontSize: 13, color: colors.colorBlueDark1, fontWeight: 500 }}>Setup required</span>;
    case 'not-available':
      return <span style={{ fontSize: 13, color: colors.colorBlack4 }}>Not available</span>;
  }
}

export default function ConnectorsStep() {
  const connectors = useAgentStore((s) => s.wizardConnectors);

  // Split into "active" (connected or setup-required shown on left) and "additional" (sidebar)
  const primaryConnectors = connectors.slice(0, 5);
  const additionalConnectors = connectors.slice(5);

  return (
    <div>
      {/* Intro block */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
          padding: '20px 24px',
          background: '#f8f9fc',
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: colors.colorBlueDark5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon path={mdiLinkVariant} size={1} color={colors.colorBlueDark1} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 4px 0', color: colors.colorBlack1 }}>
            What does your agent need access to?
          </h2>
          <p style={{ fontSize: 14, color: colors.colorBlack3, margin: 0, lineHeight: '20px' }}>
            Based on your agent&apos;s capabilities, here are the systems it needs access to. We&apos;ve checked what&apos;s already connected to your property.
          </p>
        </div>
      </div>

      {/* Connectors grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}
      >
        {primaryConnectors.map((conn) => (
          <CanaryCard key={conn.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: colors.colorBlack1 }}>{conn.name}</span>
              {statusTag(conn.status)}
            </div>
          </CanaryCard>
        ))}

        {/* Add connector card */}
        <div
          style={{
            border: `2px dashed ${colors.colorBlack5}`,
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            color: colors.colorBlueDark1,
          }}
        >
          <Icon path={mdiPlusCircleOutline} size={0.8} color={colors.colorBlueDark1} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Add connector</span>
        </div>
      </div>
    </div>
  );
}

/** Sidebar content for additional connectors — rendered by WizardLayout */
export function ConnectorsSidebar() {
  const connectors = useAgentStore((s) => s.wizardConnectors);
  const additionalConnectors = connectors.slice(5);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Icon path={mdiLinkVariant} size={0.8} color={colors.colorBlueDark1} />
        <h3 style={{ fontSize: 15, fontWeight: 500, color: colors.colorBlack1, margin: 0 }}>Connectors</h3>
      </div>
      <CanaryList>
        {additionalConnectors.map((conn) => (
          <CanaryListItem
            key={conn.id}
            title={conn.name}
            padding="compact"
            rightContent={statusTag(conn.status)}
          />
        ))}
      </CanaryList>
    </div>
  );
}
