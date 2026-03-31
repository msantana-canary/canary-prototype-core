// @ts-nocheck — This file will be deleted in Phase 8 (replaced by OverviewTab)
'use client';

/**
 * AgentInAction — "Act 2" showing the sales agent actually working.
 *
 * Layout:
 * - Header with agent name + status badge
 * - Hero stat: average response time vs industry
 * - Metrics bar: 4 cards
 * - Pipeline/Inbox: clickable inquiry rows with status badges
 * - Inquiry detail: inline expansion with original inquiry, response, timeline
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiClockOutline,
  mdiEmailOutline,
  mdiCalendarCheckOutline,
  mdiChartLineVariant,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import {
  CanaryButton,
  CanaryTag,
  ButtonType,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import { mockSalesInquiries } from '@/lib/products/agents/mock-data';
import type { SalesInquiry, InquiryStatus } from '@/lib/products/agents/types';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<InquiryStatus, { label: string; tagColor: TagColor; indicator: string }> = {
  'new': { label: 'New', tagColor: TagColor.INFO, indicator: '\u25CF' },
  'processing': { label: 'Processing', tagColor: TagColor.WARNING, indicator: '\u25CF' },
  'responded': { label: 'Responded', tagColor: TagColor.SUCCESS, indicator: '\u2713' },
  'meeting-scheduled': { label: 'Meeting Scheduled', tagColor: TagColor.INFO, indicator: '\u2713' },
  'follow-up': { label: 'Follow-up', tagColor: TagColor.WARNING, indicator: '\u21BB' },
};

export default function AgentInAction() {
  const goBack = useAgentStore((s) => s.goBack);
  const actionAgentId = useAgentStore((s) => s.actionAgentId);
  const agents = useAgentStore((s) => s.agents);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const agent = agents.find((a) => a.id === actionAgentId);
  const inquiries = mockSalesInquiries;

  // Compute metrics
  const respondedInquiries = inquiries.filter((i) => i.responseTime);
  const avgResponseTime = respondedInquiries.length > 0
    ? (respondedInquiries.reduce((sum, i) => sum + parseFloat(i.responseTime || '0'), 0) / respondedInquiries.length).toFixed(1)
    : '0';
  const inquiriesToday = inquiries.filter((i) => {
    const today = new Date('2026-03-29');
    return i.receivedAt.toDateString() === today.toDateString();
  }).length;
  const meetingsScheduled = inquiries.filter((i) => i.status === 'meeting-scheduled').length;
  const responseRate = inquiries.length > 0
    ? Math.round((respondedInquiries.length / inquiries.length) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: `1px solid ${colors.colorBlack6}`,
          backgroundColor: colors.colorWhite,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CanaryButton
            type={ButtonType.TEXT}
            icon={<Icon path={mdiArrowLeft} size={0.8} />}
            onClick={goBack}
          >
            Back
          </CanaryButton>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: colors.colorBlack1 }}>
              {agent?.name || 'Sales & Events'} Agent — Live Activity
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.colorBlack4, marginTop: 1 }}>
              Real-time inquiry pipeline and response monitoring
            </div>
          </div>
        </div>
        <CanaryTag
          label="Active"
          color={TagColor.SUCCESS}
          size={TagSize.COMPACT}
        />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, backgroundColor: colors.colorBlack7 }}>
        {/* Hero stat */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 24px',
            backgroundColor: colors.colorWhite,
            border: `1px solid ${colors.colorBlack6}`,
            borderRadius: 12,
            marginBottom: 20,
            gap: 32,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: colors.colorBlueDark1, lineHeight: 1 }}>
              {avgResponseTime} min
            </div>
            <div style={{ fontSize: '0.875rem', color: colors.colorBlack3, marginTop: 6 }}>
              Average response time
            </div>
          </div>
          <div
            style={{
              width: 1,
              height: 48,
              backgroundColor: colors.colorBlack6,
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: colors.colorBlack3, lineHeight: 1 }}>
              4.2 hours
            </div>
            <div style={{ fontSize: '0.8125rem', color: colors.colorBlack4, marginTop: 6 }}>
              Industry average
            </div>
          </div>
        </div>

        {/* Metrics bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <MetricCard
            icon={mdiClockOutline}
            label="Avg Response"
            value={`${avgResponseTime} min`}
            iconColor={colors.colorBlueDark1}
          />
          <MetricCard
            icon={mdiEmailOutline}
            label="Inquiries Today"
            value={String(inquiriesToday)}
            iconColor={colors.colorBlueDark1}
          />
          <MetricCard
            icon={mdiCalendarCheckOutline}
            label="Meetings Scheduled"
            value={String(meetingsScheduled)}
            iconColor={colors.colorLightGreen1}
          />
          <MetricCard
            icon={mdiChartLineVariant}
            label="Response Rate"
            value={`${responseRate}%`}
            iconColor={colors.colorLightGreen1}
          />
        </div>

        {/* Pipeline header */}
        <div
          style={{
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: colors.colorBlack2,
            marginBottom: 12,
          }}
        >
          Inquiry Pipeline
        </div>

        {/* Inquiry rows */}
        <div
          style={{
            borderRadius: 8,
            border: `1px solid ${colors.colorBlack6}`,
            backgroundColor: colors.colorWhite,
            overflow: 'hidden',
          }}
        >
          {inquiries.map((inquiry, index) => (
            <InquiryRow
              key={inquiry.id}
              inquiry={inquiry}
              isExpanded={expandedId === inquiry.id}
              onToggle={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
              hasBorder={index > 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MetricCard
// ---------------------------------------------------------------------------

function MetricCard({
  icon,
  label,
  value,
  iconColor,
}: {
  icon: string;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        backgroundColor: colors.colorWhite,
        border: `1px solid ${colors.colorBlack6}`,
        borderRadius: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Icon path={icon} size={0.7} color={iconColor} />
        <span style={{ fontSize: '0.75rem', color: colors.colorBlack4 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.colorBlack1 }}>
        {value}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InquiryRow — single inquiry in the pipeline
// ---------------------------------------------------------------------------

function InquiryRow({
  inquiry,
  isExpanded,
  onToggle,
  hasBorder,
}: {
  inquiry: SalesInquiry;
  isExpanded: boolean;
  onToggle: () => void;
  hasBorder: boolean;
}) {
  const statusCfg = STATUS_CONFIG[inquiry.status];

  // Format received time
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div>
      {/* Main row */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 16px',
          cursor: 'pointer',
          borderTop: hasBorder ? `1px solid ${colors.colorBlack6}` : 'none',
          transition: 'background-color 0.1s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.colorBlack7; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {/* Sender + event */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: colors.colorBlack2 }}>
              {inquiry.from.split(',')[0]}
            </span>
            <CanaryTag
              label={inquiry.eventType}
              size={TagSize.COMPACT}
              color={TagColor.DEFAULT}
            />
          </div>
          <div style={{ fontSize: '0.8125rem', color: colors.colorBlack3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {inquiry.subject}
          </div>
        </div>

        {/* Dates + headcount */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.8125rem', color: colors.colorBlack3 }}>
            {inquiry.dates}
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.colorBlack4 }}>
            {inquiry.headcount} guests{inquiry.budget ? ` \u00B7 ${inquiry.budget}` : ''}
          </div>
        </div>

        {/* Status badge */}
        <div style={{ flexShrink: 0 }}>
          <CanaryTag
            label={statusCfg.label}
            size={TagSize.COMPACT}
            color={statusCfg.tagColor}
          />
        </div>

        {/* Response time */}
        <div style={{ width: 70, textAlign: 'right', flexShrink: 0 }}>
          {inquiry.responseTime ? (
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: colors.colorLightGreen1 }}>
              {inquiry.responseTime}
            </span>
          ) : (
            <span style={{ fontSize: '0.8125rem', color: colors.colorBlack4 }}>
              {inquiry.status === 'processing' ? 'Working...' : '\u2014'}
            </span>
          )}
        </div>

        {/* Expand chevron */}
        <Icon
          path={isExpanded ? mdiChevronUp : mdiChevronDown}
          size={0.7}
          color={colors.colorBlack4}
          style={{ flexShrink: 0 }}
        />
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div
          style={{
            padding: '0 16px 16px',
            borderTop: `1px solid ${colors.colorBlack6}`,
            backgroundColor: colors.colorBlack7,
          }}
        >
          {/* Timeline */}
          <div style={{ padding: '14px 0 10px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: colors.colorBlack2, marginBottom: 10 }}>
              Processing Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4 }}>
              <TimelineEntry
                time={formatTime(inquiry.receivedAt)}
                label="Inquiry received"
                done
              />
              <TimelineEntry
                time={inquiry.responseTime ? formatTime(new Date(inquiry.receivedAt.getTime() + 5000)) : undefined}
                label="Parsed inquiry details"
                done={!!inquiry.agentResponse}
              />
              <TimelineEntry
                time={inquiry.responseTime ? formatTime(new Date(inquiry.receivedAt.getTime() + 30000)) : undefined}
                label="Checked availability"
                done={!!inquiry.agentResponse}
              />
              <TimelineEntry
                time={inquiry.responseTime ? formatTime(new Date(inquiry.receivedAt.getTime() + 60000)) : undefined}
                label="Response drafted"
                done={!!inquiry.agentResponse}
              />
              <TimelineEntry
                time={inquiry.responseTime ? formatTime(new Date(inquiry.receivedAt.getTime() + parseFloat(inquiry.responseTime || '0') * 60000)) : undefined}
                label={inquiry.agentResponse ? 'Response sent' : 'Pending...'}
                done={!!inquiry.agentResponse}
                isLast
              />
            </div>
          </div>

          {/* Agent response */}
          {inquiry.agentResponse && (
            <div
              style={{
                marginTop: 8,
                padding: 14,
                backgroundColor: colors.colorWhite,
                borderRadius: 8,
                border: `1px solid ${colors.colorBlack6}`,
              }}
            >
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: colors.colorBlack2, marginBottom: 8 }}>
                Agent Response
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: colors.colorBlack3,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                }}
              >
                {inquiry.agentResponse}
              </div>
            </div>
          )}

          {/* No response yet */}
          {!inquiry.agentResponse && (
            <div
              style={{
                marginTop: 8,
                padding: 14,
                backgroundColor: colors.colorWhite,
                borderRadius: 8,
                border: `1px dashed ${colors.colorBlack5}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.8125rem', color: colors.colorBlack4 }}>
                {inquiry.status === 'processing'
                  ? 'Agent is currently drafting a response...'
                  : 'Response pending'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TimelineEntry — single entry in the processing timeline
// ---------------------------------------------------------------------------

function TimelineEntry({
  time,
  label,
  done,
  isLast,
}: {
  time?: string;
  label: string;
  done: boolean;
  isLast?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      {/* Dot + line */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: done ? colors.colorLightGreen1 : colors.colorBlack5,
            marginTop: 4,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: 1,
              height: 14,
              backgroundColor: colors.colorBlack5,
            }}
          />
        )}
      </div>

      {/* Time */}
      <div style={{ width: 60, fontSize: '0.75rem', color: colors.colorBlack4, flexShrink: 0 }}>
        {time || ''}
      </div>

      {/* Label */}
      <div style={{ fontSize: '0.8125rem', color: done ? colors.colorBlack2 : colors.colorBlack4 }}>
        {label}
      </div>
    </div>
  );
}
