'use client';

/**
 * ConnectionsChecklist — Shows connection status for an agent's integrations.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiCheckCircleOutline,
  mdiAlertCircleOutline,
  mdiMinusCircleOutline,
  mdiDesktopClassic,
  mdiEmailOutline,
  mdiCreditCardOutline,
  mdiBookOpenPageVariantOutline,
  mdiCalendarOutline,
  mdiAccountGroupOutline,
  mdiAccessPointNetwork,
} from '@mdi/js';
import { CanaryTag, TagColor, TagSize, colors } from '@canary-ui/components';
import type { Connection, ConnectionStatus } from '@/lib/products/agents/types';

interface ConnectionsChecklistProps {
  connections: Connection[];
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: TagColor; icon: string }> = {
  connected: { label: 'Connected', color: TagColor.SUCCESS, icon: mdiCheckCircleOutline },
  needed: { label: 'Setup Required', color: TagColor.WARNING, icon: mdiAlertCircleOutline },
  optional: { label: 'Optional', color: TagColor.DEFAULT, icon: mdiMinusCircleOutline },
};

const TYPE_ICON: Record<string, string> = {
  pms: mdiDesktopClassic,
  crm: mdiAccountGroupOutline,
  pos: mdiAccessPointNetwork,
  payment: mdiCreditCardOutline,
  'knowledge-base': mdiBookOpenPageVariantOutline,
  calendar: mdiCalendarOutline,
};

export default function ConnectionsChecklist({ connections }: ConnectionsChecklistProps) {
  return (
    <div>
      <h3
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: colors.colorBlack2,
          marginBottom: 12,
          marginTop: 0,
        }}
      >
        Connections
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {connections.map((conn) => {
          const statusCfg = STATUS_CONFIG[conn.status];
          const iconPath = TYPE_ICON[conn.type] || mdiAccessPointNetwork;

          return (
            <div
              key={conn.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 6,
                backgroundColor: colors.colorBlack8,
                border: `1px solid ${colors.colorBlack6}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon path={iconPath} size={0.8} color={colors.colorBlack3} />
                <span style={{ fontSize: '0.8125rem', color: colors.colorBlack2, fontWeight: 500 }}>
                  {conn.name}
                </span>
              </div>
              <CanaryTag label={statusCfg.label} color={statusCfg.color} size={TagSize.COMPACT} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
