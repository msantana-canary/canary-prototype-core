'use client';

/**
 * ActivityTimeline — Rich chronological feed of agent activity for a single guest.
 *
 * Shows the full story: agent actions, guest messages, AI responses,
 * system events, expandable details. Two modes: completed and in-progress.
 * Replaces the step-trace view in ThreadDetailView.
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiMessageTextOutline,
  mdiSendOutline,
  mdiEyeOutline,
  mdiCheckCircleOutline,
  mdiTagOutline,
  mdiKeyVariant,
  mdiPhoneIncomingOutline,
  mdiLoginVariant,
  mdiChevronDown,
  mdiChevronUp,
  mdiStarFourPointsOutline,
  mdiClockOutline,
} from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
} from '@canary-ui/components';

// ---------------------------------------------------------------------------
// Timeline event types
// ---------------------------------------------------------------------------

export type TimelineEventType =
  | 'date-separator'
  | 'agent-activity'
  | 'guest-activity'
  | 'guest-message'
  | 'ai-response'
  | 'system-event'
  | 'processing';

export interface TimelineDetail {
  label: string;
  value: string;
  status?: 'success' | 'pending' | 'error';
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  time?: string;
  icon?: string;
  iconColor?: string;
  text: string;
  channel?: string;
  details?: TimelineDetail[];
  action?: { label: string; onClick?: () => void };
  isExpandable?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ActivityTimelineProps {
  events: TimelineEvent[];
  onBack: () => void;
  title: string;
  subtitle?: string;
}

export default function ActivityTimeline({ events, onBack, title, subtitle }: ActivityTimelineProps) {
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
          color: '#2858C4',
          fontSize: 14,
          fontWeight: 500,
          padding: '0 0 12px 0',
        }}
      >
        ← Back to Activity Feed
      </button>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: '0 0 4px 0' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 14, color: '#666', margin: 0 }}>{subtitle}</p>}
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '0 0 24px 0' }}>
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual timeline items
// ---------------------------------------------------------------------------

function TimelineItem({ event }: { event: TimelineEvent }) {
  const [expanded, setExpanded] = useState(false);

  switch (event.type) {
    case 'date-separator':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
          <span style={{ fontSize: 10, lineHeight: '16px', color: '#999', textTransform: 'uppercase' }}>
            {event.text}
          </span>
        </div>
      );

    case 'agent-activity':
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
          <TimeStamp time={event.time} />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '70%' }}>
            <div
              style={{
                width: '100%',
                borderRadius: '16px 16px 0 16px',
                overflow: 'hidden',
                backgroundColor: '#fff',
                border: '1px solid #C6D4F0',
              }}
            >
              <div
                style={{ padding: '10px 16px', cursor: event.isExpandable ? 'pointer' : 'default' }}
                onClick={() => event.isExpandable && setExpanded(!expanded)}
              >
                <p style={{ fontSize: 10, lineHeight: '16px', color: '#999', textTransform: 'uppercase', textAlign: 'right', marginBottom: 4 }}>
                  ACTIVITY
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Icon path={event.icon || mdiStarFourPointsOutline} size={0.6} color={event.iconColor || '#6B7280'} />
                  <p style={{ flex: 1, fontSize: 14, lineHeight: '22px', color: '#000', margin: 0 }}>{event.text}</p>
                  {event.isExpandable && (
                    <Icon path={expanded ? mdiChevronUp : mdiChevronDown} size={0.6} color="#999" />
                  )}
                </div>
              </div>
              {expanded && event.details && (
                <ExpandedDetails details={event.details} action={event.action} />
              )}
            </div>
          </div>
          <AgentAvatar />
        </div>
      );

    case 'guest-activity':
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
          <TimeStamp time={event.time} />
          <AgentAvatar />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '70%' }}>
            <div
              style={{
                width: '100%',
                borderRadius: '16px 16px 16px 0',
                overflow: 'hidden',
                backgroundColor: '#fff',
                border: '1px solid #C6D4F0',
              }}
            >
              <div
                style={{ padding: '10px 16px', cursor: event.isExpandable ? 'pointer' : 'default' }}
                onClick={() => event.isExpandable && setExpanded(!expanded)}
              >
                <p style={{ fontSize: 10, lineHeight: '16px', color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>
                  ACTIVITY
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Icon path={event.icon || mdiStarFourPointsOutline} size={0.6} color={event.iconColor || '#6B7280'} />
                  <p style={{ flex: 1, fontSize: 14, lineHeight: '22px', color: '#000', margin: 0 }}>{event.text}</p>
                  {event.isExpandable && (
                    <Icon path={expanded ? mdiChevronUp : mdiChevronDown} size={0.6} color="#999" />
                  )}
                </div>
              </div>
              {expanded && event.details && (
                <ExpandedDetails details={event.details} action={event.action} />
              )}
            </div>
          </div>
        </div>
      );

    case 'guest-message':
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
          <TimeStamp time={event.time} />
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '0 16px 16px 16px',
              backgroundColor: '#F0F0F0',
              maxWidth: '70%',
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <p style={{ flex: 1, fontSize: 14, lineHeight: '22px', color: '#000', margin: 0, whiteSpace: 'pre-wrap' }}>
                {event.text}
              </p>
              {event.channel && (
                <span style={{ fontSize: 10, lineHeight: '16px', color: '#666', textTransform: 'uppercase', flexShrink: 0 }}>
                  {event.channel}
                </span>
              )}
            </div>
          </div>
        </div>
      );

    case 'ai-response':
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
          <TimeStamp time={event.time} />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '70%', gap: 8 }}>
            <div
              style={{
                width: '100%',
                padding: '8px 16px',
                borderRadius: '16px 16px 0 16px',
                backgroundColor: '#EAEEF9',
              }}
            >
              <p style={{ fontSize: 10, lineHeight: '16px', color: '#666', textTransform: 'uppercase', textAlign: 'right', marginBottom: 4 }}>
                CANARY
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <p style={{ flex: 1, fontSize: 14, lineHeight: '22px', color: '#000', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {event.text}
                </p>
                {event.channel && (
                  <span style={{ fontSize: 10, lineHeight: '16px', color: '#666', textTransform: 'uppercase', flexShrink: 0 }}>
                    {event.channel}
                  </span>
                )}
              </div>
            </div>
            <span style={{ fontSize: 10, lineHeight: '16px', color: '#666', textTransform: 'uppercase' }}>
              DELIVERED
            </span>
          </div>
          <AgentAvatar />
        </div>
      );

    case 'system-event':
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
          <TimeStamp time={event.time} />
          <AgentAvatar />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '70%' }}>
            <div
              style={{
                width: '100%',
                borderRadius: '16px 16px 16px 0',
                overflow: 'hidden',
                backgroundColor: '#fff',
                border: '1px solid #C6D4F0',
              }}
            >
              <div style={{ padding: '10px 16px' }}>
                <p style={{ fontSize: 10, lineHeight: '16px', color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>
                  ACTIVITY
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Icon path={event.icon || mdiCheckCircleOutline} size={0.6} color={event.iconColor || '#16A34A'} />
                  <p style={{ flex: 1, fontSize: 14, lineHeight: '22px', color: '#000', margin: 0 }}>{event.text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'processing':
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
          <TimeStamp time={event.time} />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '70%' }}>
            <div
              style={{
                width: '100%',
                borderRadius: '16px 16px 0 16px',
                overflow: 'hidden',
                backgroundColor: '#fff',
                border: '1px solid #2858C4',
              }}
            >
              <div style={{ padding: '10px 16px' }}>
                <p style={{ fontSize: 10, lineHeight: '16px', color: '#2858C4', textTransform: 'uppercase', textAlign: 'right', marginBottom: 4 }}>
                  IN PROGRESS
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon path={mdiClockOutline} size={0.6} color="#2858C4" style={{ animation: 'spin 2s linear infinite' }} />
                  </div>
                  <p style={{ flex: 1, fontSize: 14, lineHeight: '22px', color: '#2858C4', fontWeight: 500, margin: 0 }}>{event.text}</p>
                </div>
              </div>
              <div style={{ height: 3, backgroundColor: '#E5E5E5', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#2858C4',
                  width: '60%',
                  animationName: 'processingBar',
                  animationDuration: '2s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                }} />
              </div>
            </div>
          </div>
          <AgentAvatar />
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes processingBar {
              0% { width: 0%; margin-left: 0%; }
              50% { width: 60%; margin-left: 20%; }
              100% { width: 0%; margin-left: 100%; }
            }
          `}</style>
        </div>
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TimeStamp({ time }: { time?: string }) {
  if (!time) return <div style={{ width: 48, flexShrink: 0 }} />;
  return (
    <p style={{ fontSize: 10, lineHeight: '16px', color: '#999', textTransform: 'uppercase', width: 48, flexShrink: 0 }}>
      {time}
    </p>
  );
}

function AgentAvatar() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EAEEF9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon path={mdiStarFourPointsOutline} size={0.6} color="#2858C4" />
    </div>
  );
}

function ExpandedDetails({ details, action }: { details: TimelineDetail[]; action?: { label: string; onClick?: () => void } }) {
  return (
    <div style={{ padding: '0 16px 12px 16px' }}>
      <div style={{ height: 1, backgroundColor: '#E5EAF5', marginBottom: 10 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {details.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <span style={{ fontSize: 12, lineHeight: '18px', color: '#666' }}>{d.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {d.status === 'success' && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16A34A' }} />}
              {d.status === 'pending' && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F59E0B' }} />}
              {d.status === 'error' && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444' }} />}
              <span style={{ fontSize: 12, lineHeight: '18px', fontWeight: 500, color: '#000' }}>{d.value}</span>
            </div>
          </div>
        ))}
      </div>
      {action && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, paddingTop: 8, borderTop: '1px solid #E5EAF5' }}>
          <CanaryButton type={ButtonType.TEXT} size={ButtonSize.COMPACT} onClick={action.onClick}>
            {action.label}
          </CanaryButton>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock data — completed check-in guest journey
// ---------------------------------------------------------------------------

export const MOCK_COMPLETED_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Mar. 16' },
  { id: 'e-1', type: 'agent-activity', time: '10:00 AM', icon: mdiMessageTextOutline, text: 'Pre-arrival message sent via SMS' },
  { id: 'e-2', type: 'agent-activity', time: '2:00 PM', icon: mdiSendOutline, text: 'Check-in link sent via SMS' },
  { id: 'e-3', type: 'guest-activity', time: '4:45 PM', icon: mdiEyeOutline, text: 'Guest viewed check-in link' },
  {
    id: 'e-4', type: 'guest-activity', time: '5:05 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Guest completed check-in',
    isExpandable: true,
    details: [
      { label: 'ID Verification', value: 'Verified', status: 'success' },
      { label: 'Credit Card', value: 'Visa ****4821', status: 'success' },
      { label: 'Registration Card', value: 'Signed', status: 'success' },
      { label: 'Estimated Arrival', value: '9:00 PM' },
    ],
    action: { label: 'View Check-in' },
  },
  {
    id: 'e-5', type: 'guest-activity', time: '5:06 PM', icon: mdiTagOutline, iconColor: '#D97706', text: 'Guest requested Late Checkout — $50.00',
    isExpandable: true,
    details: [
      { label: 'Upsell', value: 'Late Checkout (2:00 PM)' },
      { label: 'Price', value: '$50.00' },
      { label: 'Status', value: 'Approved', status: 'success' },
    ],
  },
  { id: 'e-6', type: 'agent-activity', time: '5:08 PM', icon: mdiKeyVariant, text: 'Mobile key issued — Room 412' },
  { id: 'e-7', type: 'guest-message', time: '5:10 PM', text: 'Hi! I just completed my check-in online. I will arrive late today though — my flight is delayed.', channel: 'SMS' },
  { id: 'e-8', type: 'ai-response', time: '5:12 PM', text: "Thanks for letting us know, Emily! No worries about the late arrival — your room will be ready whenever you get here. We see your check-in is all set.", channel: 'SMS' },
  { id: 'e-9', type: 'guest-message', time: '5:15 PM', text: 'Great! Also, is late checkout available? I have a late flight on my departure day.', channel: 'SMS' },
  { id: 'e-10', type: 'ai-response', time: '5:16 PM', text: "Yes! We offer late checkout until 2:00 PM for $50. I see you've already added it from the check-in form — our team will review and approve shortly.", channel: 'SMS' },
  { id: 'e-11', type: 'guest-message', time: '6:30 PM', text: 'Give me a list of nearby restaurants', channel: 'SMS' },
  { id: 'e-12', type: 'ai-response', time: '6:32 PM', text: 'Here are some nearby restaurant recommendations: Ithaca Ale House, Komonz Grill, MIX, Red\'s Place, and Chili\'s Grill & Bar. The hotel also recommends Il Ristorante Alga, Coltivare, Moosewood Restaurant, and Gola Osteria. Let me know if you need more assistance!', channel: 'SMS' },
  {
    id: 'e-13', type: 'guest-activity', time: '7:45 PM', icon: mdiPhoneIncomingOutline, iconColor: '#2858C4', text: 'Incoming call — Handled by AI',
    isExpandable: true,
    details: [
      { label: 'Duration', value: '1m 12s' },
      { label: 'Topic', value: 'Parking directions' },
      { label: 'Resolution', value: 'Provided parking garage directions' },
      { label: 'Outcome', value: 'Handled by AI', status: 'success' },
    ],
    action: { label: 'View Transcript' },
  },
  { id: 'e-14', type: 'system-event', time: '9:15 PM', icon: mdiLoginVariant, iconColor: '#16A34A', text: 'Guest checked in' },
  { id: 'ds-2', type: 'date-separator', text: 'Today' },
  {
    id: 'e-15', type: 'agent-activity', time: '12:24 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Late Checkout approved — $50.00',
    isExpandable: true,
    details: [
      { label: 'Upsell', value: 'Late Checkout (2:00 PM)' },
      { label: 'Charged', value: '$50.00' },
      { label: 'Status', value: 'Approved', status: 'success' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Mock data — in-progress sales inquiry
// ---------------------------------------------------------------------------

export const MOCK_INPROGRESS_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },
  { id: 'e-1', type: 'agent-activity', time: '9:15 AM', icon: mdiMessageTextOutline, text: 'Sales inquiry received — sarah@meridiancorp.com' },
  {
    id: 'e-2', type: 'agent-activity', time: '9:15 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Parsed inquiry details',
    isExpandable: true,
    details: [
      { label: 'Event Type', value: 'Corporate Retreat' },
      { label: 'Dates', value: 'April 15-17, 2026' },
      { label: 'Headcount', value: '45 guests' },
      { label: 'Budget', value: '$35,000' },
      { label: 'Urgency', value: 'Standard (30+ days out)' },
    ],
  },
  {
    id: 'e-3', type: 'agent-activity', time: '9:15 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Availability confirmed',
    isExpandable: true,
    details: [
      { label: 'Grand Ballroom', value: 'Available', status: 'success' },
      { label: 'Breakout Room A', value: 'Available', status: 'success' },
      { label: 'Breakout Room B', value: 'Available', status: 'success' },
      { label: 'Room Block (45)', value: 'Available at $289/night', status: 'success' },
    ],
  },
  { id: 'e-4', type: 'processing', time: '9:16 AM', text: 'Drafting personalized proposal...' },
];
