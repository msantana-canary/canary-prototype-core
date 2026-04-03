'use client';

/**
 * OverviewTab — Performance metrics, activity feed, and hero stat for an active agent.
 * Replaces the old AgentInAction view. Matches Figma node 101-15204.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiTrendingDown } from '@mdi/js';
import {
  CanaryCard,
  CanaryList,
  CanaryListItem,
  CanaryTag,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import { mockActivityFeed } from '@/lib/products/agents/mock-data';
import type { ActivityStatus } from '@/lib/products/agents/types';
import ThreadDetailView from './ThreadDetailView';

function activityStatusTag(status: ActivityStatus) {
  switch (status) {
    case 'responded':
      return <CanaryTag label="Responded" color={TagColor.SUCCESS} size={TagSize.COMPACT} />;
    case 'meeting-scheduled':
      return <CanaryTag label="Meeting Scheduled" color={TagColor.INFO} size={TagSize.COMPACT} />;
    case 'follow-up-sent':
      return <CanaryTag label="Follow-up Sent" color={TagColor.WARNING} size={TagSize.COMPACT} />;
    case 'handed-off':
      return <CanaryTag label="Handed Off" color={TagColor.DEFAULT} size={TagSize.COMPACT} />;
    case 'processing':
      return <CanaryTag label="Processing" color={TagColor.DEFAULT} size={TagSize.COMPACT} />;
  }
}

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
}

function MetricCard({ label, value, subtitle }: MetricCardProps) {
  return (
    <CanaryCard>
      <p style={{ fontSize: 13, color: colors.colorBlack3, margin: '0 0 4px 0' }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 600, color: colors.colorBlack1, margin: '0 0 2px 0' }}>{value}</p>
      {subtitle && (
        <p style={{ fontSize: 12, color: colors.colorBlack4, margin: 0 }}>{subtitle}</p>
      )}
    </CanaryCard>
  );
}

// Fallback metrics if agent doesn't have custom ones
const DEFAULT_HERO = { label: 'Total Actions', value: '—', subtitle: 'No data yet' };
const DEFAULT_CARDS = [
  { label: 'Total', value: '—', subtitle: 'this month' },
  { label: 'Resolution Rate', value: '—', subtitle: '' },
  { label: 'Avg. Time', value: '—', subtitle: '' },
  { label: 'Score', value: '—', subtitle: '' },
];

export default function OverviewTab() {
  const selectedThreadId = useAgentStore((s) => s.selectedThreadId);
  const setSelectedThread = useAgentStore((s) => s.setSelectedThread);
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const agents = useAgentStore((s) => s.agents);

  const agent = agents.find((a) => a.id === selectedAgentId);

  // If a thread is selected, show the detail view
  if (selectedThreadId) {
    return (
      <ThreadDetailView
        inquiryId={selectedThreadId}
        onBack={() => setSelectedThread(null)}
        agentName={agent?.name}
      />
    );
  }

  const heroStat = agent?.metrics.heroStat || DEFAULT_HERO;
  const metricCards = agent?.metrics.cards || DEFAULT_CARDS;

  return (
    <div>
      <style>{`
        @keyframes overviewFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes activityItemFadeIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      {/* Section header */}
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 4px 0', color: colors.colorBlack1 }}>
        Performance/Activity
      </h2>
      <p style={{ fontSize: 14, color: colors.colorBlack3, margin: '0 0 20px 0' }}>
        Here&apos;s how your agent has performed over the last 30 days.
      </p>

      {/* Hero stat */}
      <div
        style={{
          opacity: 0,
          animationName: 'overviewFadeIn',
          animationDuration: '0.4s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
          animationDelay: '0.05s',
        }}
      >
        <CanaryCard>
          <p style={{ fontSize: 13, color: colors.colorBlack3, margin: '0 0 4px 0' }}>{heroStat.label}</p>
          <p style={{ fontSize: 32, fontWeight: 600, color: colors.colorBlack1, margin: '0 0 4px 0' }}>
            {heroStat.value}
          </p>
          {heroStat.subtitle && (
            <p style={{ fontSize: 13, color: colors.colorBlack4, margin: 0 }}>{heroStat.subtitle}</p>
          )}
        </CanaryCard>
      </div>

      <div style={{ height: 16 }} />

      {/* Metric cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {metricCards.map((mc, idx) => (
          <div
            key={mc.label}
            style={{
              opacity: 0,
              animationName: 'overviewFadeIn',
              animationDuration: '0.35s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'forwards',
              animationDelay: `${0.1 + idx * 0.06}s`,
            }}
          >
            <MetricCard label={mc.label} value={mc.value} subtitle={mc.subtitle} />
          </div>
        ))}
      </div>

      <div style={{ height: 24 }} />

      {/* Activity Feed */}
      <h3 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 12px 0', color: colors.colorBlack1 }}>
        Activity Feed
      </h3>
      <CanaryList hasOuterBorder>
        {mockActivityFeed.map((item, idx) => (
          <div
            key={item.id}
            style={{
              opacity: 0,
              animationName: 'activityItemFadeIn',
              animationDuration: '0.3s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'forwards',
              animationDelay: `${0.15 + idx * 0.04}s`,
            }}
          >
            <CanaryListItem
              title={item.title}
              subtitle={item.description}
              isClickable
              onClick={() => item.inquiryId && setSelectedThread(item.inquiryId)}
              rightContent={activityStatusTag(item.status)}
              padding="normal"
            />
          </div>
        ))}
      </CanaryList>
    </div>
  );
}
