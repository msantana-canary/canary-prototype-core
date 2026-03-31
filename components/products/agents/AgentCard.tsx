'use client';

/**
 * AgentCard — Individual agent card for the dashboard grid.
 *
 * Shows agent avatar, name, role, active status dot, current activity / first trigger,
 * and one key metric. v2: "View Activity" link for agents with sales inquiry data.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';
import { colors } from '@canary-ui/components';
import type { Agent, AgentStatus } from '@/lib/products/agents/types';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  onViewActivity?: () => void;
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

// Agents whose role matches Sales get the activity link
const SALES_ROLES = ['Sales & Events Coordinator', 'Sales & Events Agent'];

export default function AgentCard({ agent, onClick, onViewActivity }: AgentCardProps) {
  const avatarBg = AVATAR_COLORS[agent.status];
  const statusDot = STATUS_DOT[agent.status];
  const latestActivity = agent.recentActivity[0];
  const firstTrigger = agent.triggers[0];
  const conversationsToday = agent.metrics.totalConversations > 0
    ? Math.round(agent.metrics.totalConversations / 30)
    : 0;

  const hasSalesActivity = agent.status === 'active' && (
    SALES_ROLES.includes(agent.role) ||
    agent.rules.length > 0
  );

  return (
    <div
      onClick={onClick}
      style={{
        padding: 16,
        cursor: 'pointer',
        backgroundColor: colors.colorWhite,
        border: `1px solid ${colors.colorBlack6}`,
        borderRadius: 8,
        transition: 'box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top row: avatar + name/role + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
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
            fontSize: '0.8125rem',
            flexShrink: 0,
          }}
        >
          {agent.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: colors.colorBlack2, lineHeight: 1.3 }}>
            {agent.name}
          </div>
          <div style={{ fontSize: '0.8125rem', color: colors.colorBlack3, lineHeight: 1.3 }}>
            {agent.role}
          </div>
        </div>
        {/* Status dot + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: statusDot.color,
            }}
          />
          <span style={{ fontSize: '0.75rem', color: colors.colorBlack3, fontWeight: 500 }}>
            {statusDot.label}
          </span>
        </div>
      </div>

      {/* Current activity or first trigger as hint */}
      {(latestActivity || firstTrigger) && (
        <div
          style={{
            fontSize: '0.8125rem',
            color: colors.colorBlack3,
            lineHeight: 1.45,
            marginBottom: 10,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {latestActivity ? (
            <>
              {latestActivity.description}
              <span style={{ color: colors.colorBlack4, marginLeft: 4 }}>
                {latestActivity.time}
              </span>
            </>
          ) : (
            <span style={{ color: colors.colorBlack4, fontStyle: 'italic' }}>
              Trigger: {firstTrigger.intent}
            </span>
          )}
        </div>
      )}

      {/* Bottom row: metric + optional activity link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${colors.colorBlack7}`,
          paddingTop: 8,
        }}
      >
        <div style={{ fontSize: '0.75rem', color: colors.colorBlack4 }}>
          {conversationsToday > 0
            ? `~${conversationsToday} conversations/day  \u00B7  ${agent.metrics.resolutionRate}% resolved`
            : 'No conversations yet'}
        </div>

        {/* View Activity link for sales agents */}
        {hasSalesActivity && onViewActivity && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewActivity();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontSize: '0.75rem',
              fontWeight: 500,
              color: colors.colorBlueDark1,
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            View Activity
            <Icon path={mdiChevronRight} size={0.55} color={colors.colorBlueDark1} />
          </button>
        )}
      </div>
    </div>
  );
}
