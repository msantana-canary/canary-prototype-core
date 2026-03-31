'use client';

/**
 * CapabilityCard — Reusable card for displaying a Canary product capability.
 * Uses CanaryCard from the component library.
 * Used in the active capabilities grid.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiCogOutline, mdiDeleteOutline } from '@mdi/js';
import { CanaryCard, colors } from '@canary-ui/components';

interface CapabilityCardProps {
  icon: string;
  name: string;
  description: string;
  onConfigure?: () => void;
  onRemove?: () => void;
}

export default function CapabilityCard({ icon, name, description, onConfigure, onRemove }: CapabilityCardProps) {
  return (
    <CanaryCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon path={icon} size={0.85} color={colors.colorBlack2} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {onConfigure && (
            <button
              onClick={onConfigure}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: colors.colorBlack3 }}
            >
              <Icon path={mdiCogOutline} size={0.7} />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: colors.colorBlueDark1 }}
            >
              <Icon path={mdiDeleteOutline} size={0.7} />
            </button>
          )}
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, color: colors.colorBlack1, margin: 0 }}>{name}</p>
      <p style={{ fontSize: 13, color: colors.colorBlack3, margin: '4px 0 0 0', lineHeight: '18px' }}>{description}</p>
    </CanaryCard>
  );
}
