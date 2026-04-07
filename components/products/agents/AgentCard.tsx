'use client';

/**
 * AgentCard — Individual agent card for the dashboard grid.
 *
 * Shows agent name, status, hero stat (the value proposition),
 * and proof of life (last active time or volume metric).
 */

import React from 'react';
import { colors } from '@canary-ui/components';
import type { Agent, AgentStatus } from '@/lib/products/agents/types';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

const AVATAR_COLORS: Record<AgentStatus, string> = {
  active: colors.colorBlueDark1,
  paused: colors.colorWheat1,
  draft: colors.colorBlack4,
};

const STATUS_DOT: Record<AgentStatus, { color: string; label: string }> = {
  active: { color: '#22C55E', label: 'Active' },
  paused: { color: colors.colorWheat1, label: 'Paused' },
  draft: { color: colors.colorBlack4, label: 'Draft' },
};

export default function AgentCard({ agent, onClick }: AgentCardProps) {
  const avatarBg = AVATAR_COLORS[agent.status];
  const statusDot = STATUS_DOT[agent.status];
  const heroStat = agent.metrics.heroStat;
  const hasMetrics = agent.metrics.totalConversations > 0;
  const latestActivity = agent.recentActivity[0];

  // Show role only when it differs from name
  const showRole = agent.role && agent.role !== agent.name;

  return (
    <div
      onClick={onClick}
      style={{
        padding: 20,
        cursor: 'pointer',
        backgroundColor: colors.colorWhite,
        border: `1px solid ${colors.colorBlack6}`,
        borderRadius: 8,
        transition: 'box-shadow 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top row: avatar + name + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.colorWhite,
            fontWeight: 600,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {agent.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: colors.colorBlack1, lineHeight: 1.3 }}>
            {agent.name}
          </div>
          {showRole && (
            <div style={{ fontSize: 13, color: colors.colorBlack3, lineHeight: 1.3 }}>
              {agent.role}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: statusDot.color }} />
          <span style={{ fontSize: 12, color: colors.colorBlack3, fontWeight: 500 }}>
            {statusDot.label}
          </span>
        </div>
      </div>

      {/* Hero stat — the value proposition */}
      {hasMetrics && heroStat ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: colors.colorBlack1, lineHeight: 1.2 }}>
            {heroStat.value}
          </div>
          <div style={{ fontSize: 13, color: colors.colorBlack3, marginTop: 2 }}>
            {heroStat.label}
          </div>
          {heroStat.subtitle && (
            <div style={{ fontSize: 12, color: colors.colorBlack4, marginTop: 2 }}>
              {heroStat.subtitle}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: colors.colorBlack4, fontStyle: 'italic' }}>
            {agent.status === 'draft' ? 'Draft — not yet deployed' : 'Just deployed — awaiting first interaction'}
          </div>
        </div>
      )}

      {/* Bottom: volume + last active */}
      <div
        style={{
          borderTop: `1px solid ${colors.colorBlack7}`,
          paddingTop: 10,
          fontSize: 12,
          color: colors.colorBlack4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
        }}
      >
        {hasMetrics ? (
          <>
            <span>{agent.metrics.cards?.[0]?.value ?? `${agent.metrics.totalConversations}`} {agent.metrics.cards?.[0]?.subtitle ?? 'total'}</span>
            {latestActivity && (
              <span>Last active {latestActivity.time}</span>
            )}
          </>
        ) : (
          <span>0 conversations</span>
        )}
      </div>
    </div>
  );
}
