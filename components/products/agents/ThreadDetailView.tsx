'use client';

/**
 * ThreadDetailView — Detailed view of an individual agent-handled inquiry.
 *
 * Shows: agent trace (step progress), conditions triggered, response preview,
 * and operator actions. Accessed from the Activity Feed in OverviewTab.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiCheckCircleOutline,
  mdiClockOutline,
  mdiEmailOutline,
  mdiAccountSwitchOutline,
  mdiCheckboxMarkedCircleOutline,
} from '@mdi/js';
import {
  CanaryButton,
  CanaryCard,
  CanaryTag,
  ButtonType,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';
import { mockSalesInquiries } from '@/lib/products/agents/mock-data';
import type { SalesInquiry } from '@/lib/products/agents/types';

interface ThreadDetailViewProps {
  inquiryId: string;
  onBack: () => void;
}

function inquiryStatusTag(status: string) {
  switch (status) {
    case 'responded':
      return <CanaryTag label="Responded" color={TagColor.SUCCESS} size={TagSize.COMPACT} />;
    case 'meeting-scheduled':
      return <CanaryTag label="Meeting Scheduled" color={TagColor.INFO} size={TagSize.COMPACT} />;
    case 'follow-up':
      return <CanaryTag label="Follow-up" color={TagColor.WARNING} size={TagSize.COMPACT} />;
    case 'processing':
      return <CanaryTag label="Processing" color={TagColor.DEFAULT} size={TagSize.COMPACT} />;
    default:
      return <CanaryTag label={status} color={TagColor.DEFAULT} size={TagSize.COMPACT} />;
  }
}

// Simulated agent trace steps
const TRACE_STEPS = [
  { label: 'Receive Inquiry', detail: null },
  { label: 'Parse Details', detail: null },
  { label: 'Check Availability', detail: null },
  { label: 'Draft Response', detail: null },
  { label: 'Send Response', detail: null },
  { label: 'Follow Up', detail: null },
];

function getCompletedSteps(inquiry: SalesInquiry): number {
  if (inquiry.status === 'processing') return 2;
  if (inquiry.status === 'responded') return 5;
  if (inquiry.status === 'meeting-scheduled') return 5;
  if (inquiry.status === 'follow-up') return 6;
  return 1;
}

function getTraceDetail(stepIdx: number, inquiry: SalesInquiry): string | null {
  switch (stepIdx) {
    case 0: return `Detected email from ${inquiry.email}`;
    case 1: return `${inquiry.eventType}, ${inquiry.dates}, ${inquiry.headcount} guests${inquiry.budget ? `, ${inquiry.budget} budget` : ''}`;
    case 2: return inquiry.status === 'processing' ? null : 'Availability confirmed';
    case 3: return inquiry.agentResponse ? 'Proposal generated' : null;
    case 4: return inquiry.responseTime ? `Delivered in ${inquiry.responseTime}` : null;
    case 5: return inquiry.status === 'follow-up' ? 'Scheduled: 48 hours if no reply' : 'Pending';
    default: return null;
  }
}

export default function ThreadDetailView({ inquiryId, onBack }: ThreadDetailViewProps) {
  const inquiry = mockSalesInquiries.find((i) => i.id === inquiryId);
  if (!inquiry) return null;

  const completedSteps = getCompletedSteps(inquiry);

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: colors.colorBlueDark1,
          fontSize: 14,
          padding: '0 0 16px 0',
          fontWeight: 500,
        }}
      >
        <Icon path={mdiArrowLeft} size={0.7} />
        Back to Activity Feed
      </button>

      {/* Header */}
      <CanaryCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 4px 0', color: colors.colorBlack1 }}>
              {inquiry.from}
            </h2>
            <p style={{ fontSize: 14, color: colors.colorBlack3, margin: '0 0 4px 0' }}>
              {inquiry.subject}
            </p>
            <p style={{ fontSize: 13, color: colors.colorBlack4, margin: 0 }}>
              Received: {inquiry.receivedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {inquiry.responseTime && ` — ${inquiry.responseTime}`}
            </p>
          </div>
          {inquiryStatusTag(inquiry.status)}
        </div>
      </CanaryCard>

      <div style={{ height: 20 }} />

      {/* Agent Trace */}
      <h3 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 12px 0', color: colors.colorBlack1 }}>
        Agent Trace
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {TRACE_STEPS.map((step, idx) => {
          const isCompleted = idx < completedSteps;
          const isCurrent = idx === completedSteps;
          const detail = isCompleted ? getTraceDetail(idx, inquiry) : null;

          return (
            <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* Step indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCompleted ? '#e8f5e9' : isCurrent ? colors.colorBlueDark5 : '#f5f5f5',
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? (
                    <Icon path={mdiCheckCircleOutline} size={0.55} color="#4caf50" />
                  ) : isCurrent ? (
                    <Icon path={mdiClockOutline} size={0.55} color={colors.colorBlueDark1} />
                  ) : (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.colorBlack5 }} />
                  )}
                </div>
                {idx < TRACE_STEPS.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      height: 28,
                      backgroundColor: isCompleted ? '#c8e6c9' : colors.colorBlack6,
                    }}
                  />
                )}
              </div>

              {/* Step content */}
              <div style={{ paddingBottom: 12 }}>
                <p style={{
                  fontSize: 14,
                  fontWeight: 500,
                  margin: '0 0 2px 0',
                  color: isCompleted ? colors.colorBlack1 : colors.colorBlack4,
                }}>
                  Step {idx + 1}: {step.label}
                </p>
                {detail && (
                  <p style={{ fontSize: 13, color: colors.colorBlack3, margin: 0 }}>{detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Response Preview */}
      {inquiry.agentResponse && (
        <>
          <div style={{ height: 20 }} />
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 12px 0', color: colors.colorBlack1 }}>
            Response Preview
          </h3>
          <CanaryCard>
            <pre style={{
              fontSize: 13,
              lineHeight: '20px',
              color: colors.colorBlack2,
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-roboto), sans-serif',
            }}>
              {inquiry.agentResponse}
            </pre>
          </CanaryCard>
        </>
      )}

      {/* Operator Actions */}
      <div style={{ height: 20 }} />
      <div style={{ display: 'flex', gap: 12 }}>
        <CanaryButton type={ButtonType.OUTLINED}>
          Edit & Resend
        </CanaryButton>
        <CanaryButton type={ButtonType.OUTLINED}>
          Hand off to sales team
        </CanaryButton>
        <CanaryButton type={ButtonType.OUTLINED}>
          Mark as resolved
        </CanaryButton>
      </div>
    </div>
  );
}
