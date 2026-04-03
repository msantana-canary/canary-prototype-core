'use client';

/**
 * ActivityTimeline — Rich chronological feed of agent workflow execution.
 *
 * Three interleaved layers:
 * 1. Workflow progression — trigger card + step dividers
 * 2. Capability executions — activity cards tagged by capability (tool calls)
 * 3. Conversation — guest messages + AI responses
 *
 * Two tracks: completed (full audit trail) and in-progress (live execution).
 */

import React, { useState, useEffect, useRef } from 'react';
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
  mdiArrowLeft,
  mdiFlashOutline,
  mdiDatabaseOutline,
  mdiFileDocumentOutline,
  mdiBookOpenPageVariantOutline,
  mdiShieldCheckOutline,
  mdiCheckAll,
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
  | 'trigger'
  | 'workflow-step'
  | 'agent-activity'
  | 'guest-activity'
  | 'guest-message'
  | 'ai-response'
  | 'system-event'
  | 'processing';

export type CapabilityLabel =
  | 'CHECK-IN'
  | 'MESSAGING'
  | 'CALLS'
  | 'UPSELLS'
  | 'KNOWLEDGE BASE'
  | 'CONTRACTS'
  | 'AUTHORIZATIONS'
  | 'SERVICE TICKETS'
  | 'PMS';

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
  /** For trigger events: the trigger description */
  triggerDescription?: string;
  /** For workflow-step events: step number (1-based) */
  stepNumber?: number;
  /** Capability label shown instead of "ACTIVITY" */
  capability?: CapabilityLabel;
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
  agentName?: string;
  /** Called when an action CTA is clicked — receives the action label (e.g. "View Check-in") */
  onAction?: (label: string) => void;
  /** When true, events are revealed progressively to simulate live execution */
  animated?: boolean;
}

// Delay (ms) per event type when animated — longer pauses for meaty steps
const ANIMATION_DELAYS: Partial<Record<TimelineEventType, number>> = {
  'date-separator': 300,
  'guest-message': 800,
  'trigger': 1000,
  'workflow-step': 600,
  'agent-activity': 1200,
  'ai-response': 1000,
  'system-event': 800,
  'processing': 2500,
};
const DEFAULT_DELAY = 800;

export default function ActivityTimeline({ events, onBack, title, subtitle, agentName, onAction, animated }: ActivityTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(animated ? 0 : events.length);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animated) {
      setVisibleCount(events.length);
      return;
    }

    setVisibleCount(0);
    let idx = 0;

    const showNext = () => {
      if (idx >= events.length) return;
      idx++;
      setVisibleCount(idx);

      // Schedule next event based on what just appeared
      if (idx < events.length) {
        const nextEvent = events[idx];
        const delay = ANIMATION_DELAYS[nextEvent.type] ?? DEFAULT_DELAY;
        setTimeout(showNext, delay);
      }
    };

    // Start after a brief initial pause
    const timer = setTimeout(showNext, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  // Auto-scroll to bottom as events appear
  useEffect(() => {
    if (animated && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount, animated]);

  const visibleEvents = events.slice(0, visibleCount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: '-24px', overflow: 'hidden' }}>
      {/* Header bar — sticky, same pattern as Edit Workflow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: '8px 24px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #E5E5E5',
          flexShrink: 0,
          minHeight: 56,
          zIndex: 1,
        }}
      >
        <CanaryButton type={ButtonType.ICON_SECONDARY} onClick={onBack} icon={<Icon path={mdiArrowLeft} size={0.83} />} />
        <div style={{ marginLeft: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 500, lineHeight: '24px', color: '#000' }}>
            {title}
          </span>
          {subtitle && (
            <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: '18px' }}>{subtitle}</p>
          )}
        </div>
      </div>

      {/* Timeline — scrollable */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <style>{`
          @keyframes timelineEventFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {visibleEvents.map((event, i) => (
            <div
              key={event.id}
              style={animated ? {
                animationName: 'timelineEventFadeIn',
                animationDuration: '0.35s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'forwards',
                opacity: 0,
              } : undefined}
            >
              <TimelineItem event={event} agentName={agentName} onAction={onAction} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual timeline items
// ---------------------------------------------------------------------------

function TimelineItem({ event, agentName, onAction }: { event: TimelineEvent; agentName?: string; onAction?: (label: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const capabilityLabel = event.capability || 'ACTIVITY';

  switch (event.type) {
    case 'date-separator':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
          <span style={{ fontSize: 10, lineHeight: '16px', color: '#999', textTransform: 'uppercase' }}>
            {event.text}
          </span>
        </div>
      );

    case 'trigger':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              backgroundColor: '#EAEEF9',
              border: '1px solid #93ABE1',
              maxWidth: '85%',
            }}
          >
            <Icon path={mdiFlashOutline} size={0.6} color="#2858C4" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 500, lineHeight: '18px', color: '#2858C4', textTransform: 'uppercase' }}>
                Trigger: {event.text}
              </span>
              {event.triggerDescription && (
                <span style={{ fontSize: 11, lineHeight: '16px', color: '#5A7ABF' }}>
                  {event.triggerDescription}
                </span>
              )}
            </div>
            {event.time && (
              <span style={{ fontSize: 10, lineHeight: '16px', color: '#93ABE1', textTransform: 'uppercase', marginLeft: 8, flexShrink: 0 }}>
                {event.time}
              </span>
            )}
          </div>
        </div>
      );

    case 'workflow-step': {
      const isPending = !event.icon && !event.iconColor;
      const isActive = event.text === event.text && !event.icon && event.stepNumber != null; // no checkmark = current or pending
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0 12px', opacity: isPending ? 0.45 : 1 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E5E5E5' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              borderRadius: 4,
              backgroundColor: '#fff',
              border: `1px solid ${isPending ? '#E5E5E5' : '#E5E5E5'}`,
            }}
          >
            {event.icon ? (
              <Icon path={event.icon} size={0.5} color={event.iconColor || '#16A34A'} />
            ) : (
              <Icon path={mdiClockOutline} size={0.5} color="#999" />
            )}
            <span style={{ fontSize: 11, fontWeight: 500, lineHeight: '18px', color: isPending ? '#999' : '#333' }}>
              {event.stepNumber != null ? `Step ${event.stepNumber}: ` : ''}{event.text}
            </span>
          </div>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E5E5E5' }} />
        </div>
      );
    }

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
                  {capabilityLabel}
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
                <ExpandedDetails details={event.details} action={event.action} onAction={onAction} />
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
                  {capabilityLabel}
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
                <ExpandedDetails details={event.details} action={event.action} onAction={onAction} />
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
            <p style={{ flex: 1, fontSize: 14, lineHeight: '22px', color: '#000', margin: 0, whiteSpace: 'pre-wrap' }}>
              {event.text}
            </p>
          </div>
        </div>
      );

    case 'ai-response':
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
          <TimeStamp time={event.time} />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '70%' }}>
            <div
              style={{
                width: '100%',
                padding: '8px 16px',
                borderRadius: '16px 0 16px 16px',
                backgroundColor: '#EAEEF9',
              }}
            >
              <p style={{ fontSize: 10, lineHeight: '16px', color: '#666', textTransform: 'uppercase', textAlign: 'right', marginBottom: 4 }}>
                {agentName || 'CANARY'}
              </p>
              <p style={{ fontSize: 14, lineHeight: '22px', color: '#000', margin: 0, whiteSpace: 'pre-wrap' }}>
                {event.text}
              </p>
            </div>
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
                  {capabilityLabel}
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
                  {event.capability ? `${event.capability} — IN PROGRESS` : 'IN PROGRESS'}
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

function ExpandedDetails({ details, action, onAction }: { details: TimelineDetail[]; action?: { label: string; onClick?: () => void }; onAction?: (label: string) => void }) {
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
          <CanaryButton type={ButtonType.TEXT} size={ButtonSize.COMPACT} onClick={() => { action.onClick?.(); onAction?.(action.label); }}>
            {action.label}
          </CanaryButton>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock data — completed check-in guest journey
// Workflow: Check-in Processing Agent → Process Submission
// ---------------------------------------------------------------------------

export const MOCK_COMPLETED_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Mar. 16' },

  // Pre-check-in messaging (before the workflow triggers)
  { id: 'e-1', type: 'agent-activity', time: '10:00 AM', icon: mdiMessageTextOutline, text: 'Pre-arrival message sent via SMS', capability: 'MESSAGING' },
  { id: 'e-2', type: 'agent-activity', time: '2:00 PM', icon: mdiSendOutline, text: 'Check-in link sent via SMS', capability: 'MESSAGING' },
  { id: 'e-3', type: 'guest-activity', time: '4:45 PM', icon: mdiEyeOutline, text: 'Guest viewed check-in link', capability: 'CHECK-IN' },

  // Workflow triggered
  { id: 'tr-1', type: 'trigger', time: '5:05 PM', text: 'Check-in Submitted', triggerDescription: 'Guest completed and submitted pre-arrival check-in form.' },

  // Step 1: Validate Completeness
  { id: 'ws-1', type: 'workflow-step', text: 'Validate Completeness', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'guest-activity', time: '5:05 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Guest completed check-in',
    capability: 'CHECK-IN',
    isExpandable: true,
    details: [
      { label: 'ID Verification', value: 'Verified', status: 'success' },
      { label: 'Credit Card', value: 'Visa ****4821', status: 'success' },
      { label: 'Registration Card', value: 'Signed', status: 'success' },
      { label: 'Estimated Arrival', value: '9:00 PM' },
    ],
    action: { label: 'View Check-in' },
  },

  // Step 2: Sync to PMS
  { id: 'ws-2', type: 'workflow-step', text: 'Sync to PMS', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-4b', type: 'agent-activity', time: '5:06 PM', icon: mdiDatabaseOutline, text: 'Registration data synced to Oracle Opera PMS', capability: 'PMS' },
  {
    id: 'e-5', type: 'guest-activity', time: '5:06 PM', icon: mdiTagOutline, iconColor: '#D97706', text: 'Guest requested Late Checkout — $50.00',
    capability: 'UPSELLS',
    isExpandable: true,
    details: [
      { label: 'Upsell', value: 'Late Checkout (2:00 PM)' },
      { label: 'Price', value: '$50.00' },
      { label: 'Status', value: 'Approved', status: 'success' },
    ],
  },

  // Step 3: Auto-verify Eligibility
  { id: 'ws-3', type: 'workflow-step', text: 'Auto-verify Eligibility', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-5b', type: 'agent-activity', time: '5:07 PM', icon: mdiShieldCheckOutline, iconColor: '#16A34A', text: 'All verifications passed — auto-verified', capability: 'CHECK-IN' },
  { id: 'e-6', type: 'agent-activity', time: '5:08 PM', icon: mdiKeyVariant, text: 'Mobile key issued — Room 412', capability: 'CHECK-IN' },

  // Step 4: Notify Staff
  { id: 'ws-4', type: 'workflow-step', text: 'Notify Staff', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-6b', type: 'agent-activity', time: '5:08 PM', icon: mdiMessageTextOutline, text: 'Confirmation sent to guest + staff notified', capability: 'MESSAGING' },

  // Conversation continues alongside
  { id: 'e-7', type: 'guest-message', time: '5:10 PM', text: 'Hi! I just completed my check-in online. I will arrive late today though — my flight is delayed.' },
  { id: 'e-8', type: 'ai-response', time: '5:12 PM', text: "Thanks for letting us know, Emily! No worries about the late arrival — your room will be ready whenever you get here. We see your check-in is all set." },
  { id: 'e-9', type: 'guest-message', time: '5:15 PM', text: 'Great! Also, is late checkout available? I have a late flight on my departure day.' },
  { id: 'e-10', type: 'ai-response', time: '5:16 PM', text: "Yes! We offer late checkout until 2:00 PM for $50. I see you've already added it from the check-in form — our team will review and approve shortly." },
  { id: 'e-11', type: 'guest-message', time: '6:30 PM', text: 'Give me a list of nearby restaurants' },

  // KB tool call — then AI response
  { id: 'e-11b', type: 'agent-activity', time: '6:32 PM', icon: mdiBookOpenPageVariantOutline, text: 'Searched knowledge base — 9 results', capability: 'KNOWLEDGE BASE' },
  { id: 'e-12', type: 'ai-response', time: '6:32 PM', text: 'Here are some nearby restaurant recommendations: Ithaca Ale House, Komonz Grill, MIX, Red\'s Place, and Chili\'s Grill & Bar. The hotel also recommends Il Ristorante Alga, Coltivare, Moosewood Restaurant, and Gola Osteria. Let me know if you need more assistance!' },

  // Call handled by voice AI
  {
    id: 'e-13', type: 'guest-activity', time: '7:45 PM', icon: mdiPhoneIncomingOutline, iconColor: '#2858C4', text: 'Incoming call — Handled by AI',
    capability: 'CALLS',
    isExpandable: true,
    details: [
      { label: 'Duration', value: '1m 12s' },
      { label: 'Topic', value: 'Parking directions' },
      { label: 'Resolution', value: 'Provided parking garage directions' },
      { label: 'Outcome', value: 'Handled by AI', status: 'success' },
    ],
    action: { label: 'View Transcript' },
  },

  // Physical check-in
  { id: 'e-14', type: 'system-event', time: '9:15 PM', icon: mdiLoginVariant, iconColor: '#16A34A', text: 'Guest checked in', capability: 'CHECK-IN' },

  { id: 'ds-2', type: 'date-separator', text: 'Today' },
  {
    id: 'e-15', type: 'agent-activity', time: '12:24 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Late Checkout approved — $50.00',
    capability: 'UPSELLS',
    isExpandable: true,
    details: [
      { label: 'Upsell', value: 'Late Checkout (2:00 PM)' },
      { label: 'Charged', value: '$50.00' },
      { label: 'Approved By', value: 'Theresa Webb' },
      { label: 'Status', value: 'Confirmed', status: 'success' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Mock data — completed sales inquiry (Sarah Chen)
// Workflow: Sales & Events Agent → Sales Inquiry Response (all 5 steps)
// ---------------------------------------------------------------------------

export const MOCK_COMPLETED_SALES_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Mar. 29' },

  // Inbound email from Sarah
  { id: 'e-0', type: 'guest-message', time: '9:15 AM', text: 'Hi there,\n\nI\'m looking to book a corporate retreat for our team — 45 people, ideally April 15-17. We\'d need a large meeting space, two breakout rooms, and a room block. Budget is around $35K. Could you send over availability and pricing?\n\nThanks,\nSarah Chen\nChen & Associates' },

  // Trigger fires
  { id: 'tr-1', type: 'trigger', time: '9:15 AM', text: 'Receive Inquiry', triggerDescription: 'Incoming email detected in sales inbox — sarah@chenassociates.com' },

  // Step 1: Parse Details
  { id: 'ws-1', type: 'workflow-step', text: 'Parse Details', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '9:15 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Parsed inquiry details',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Event Type', value: 'Corporate Retreat' },
      { label: 'Dates', value: 'April 15-17, 2026' },
      { label: 'Headcount', value: '45 guests' },
      { label: 'Budget', value: '$35,000' },
      { label: 'Urgency', value: 'Standard (30+ days out)' },
    ],
  },

  // Step 2: Check Availability
  { id: 'ws-2', type: 'workflow-step', text: 'Check Availability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '9:15 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Availability confirmed via Oracle Opera PMS',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Grand Ballroom', value: 'Available', status: 'success' },
      { label: 'Breakout Room A', value: 'Available', status: 'success' },
      { label: 'Breakout Room B', value: 'Available', status: 'success' },
      { label: 'Room Block (45)', value: 'Available at $289/night', status: 'success' },
    ],
  },

  // Step 3: Draft Response
  { id: 'ws-3', type: 'workflow-step', text: 'Draft Response', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-3', type: 'agent-activity', time: '9:16 AM', icon: mdiFileDocumentOutline, iconColor: '#16A34A', text: 'Proposal drafted — Standard Event template',
    capability: 'CONTRACTS',
    isExpandable: true,
    details: [
      { label: 'Template', value: 'Standard Event Contract' },
      { label: 'Venue Package', value: 'Grand Ballroom + 2 Breakout Rooms' },
      { label: 'Room Block', value: '45 rooms × 2 nights × $289' },
      { label: 'F&B Estimate', value: '$8,500 (continental breakfast + lunch)' },
      { label: 'Total Estimate', value: '$34,510' },
    ],
  },

  // Step 4: Send Response
  { id: 'ws-4', type: 'workflow-step', text: 'Send Response', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '9:17 AM', icon: mdiSendOutline, iconColor: '#16A34A', text: 'Proposal sent to sarah@chenassociates.com',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'Subject', value: 'Your Corporate Retreat at The Statler — April 15-17' },
      { label: 'Includes', value: 'Venue details, pricing, property highlights' },
      { label: 'CTA', value: 'Schedule a site visit' },
      { label: 'Response Time', value: '2.1 minutes', status: 'success' },
    ],
  },

  // Step 5: Follow Up
  { id: 'ws-5', type: 'workflow-step', text: 'Follow Up', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-5', type: 'agent-activity', time: '9:17 AM', icon: mdiClockOutline, text: 'Follow-up scheduled — 48 hours (corporate event cadence)',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'Cadence', value: 'Corporate event — 48hr, then weekly' },
      { label: 'Next Follow-up', value: 'March 31, 2026' },
      { label: 'Escalation', value: 'After 2nd follow-up if no response' },
    ],
  },

  // Completion
  { id: 'e-6', type: 'system-event', time: '9:17 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Inquiry Response workflow completed — 2.1 min total', capability: 'MESSAGING' },
];

// ---------------------------------------------------------------------------
// Mock data — in-progress sales inquiry (Lisa Park)
// Workflow: Sales & Events Agent → Sales Inquiry Response
// ---------------------------------------------------------------------------

export const MOCK_INPROGRESS_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  // Inbound email from Lisa
  { id: 'e-0', type: 'guest-message', time: '11:45 AM', text: 'Hello,\n\nWe\'re planning a team offsite for 25 people, May 8-10. Need meeting space and a room block for 2 nights. What do you have available?\n\nLisa Park\nTechForward Inc' },

  // Trigger fires
  { id: 'tr-1', type: 'trigger', time: '11:45 AM', text: 'Receive Inquiry', triggerDescription: 'Incoming email detected in sales inbox — lpark@techforward.io' },

  // Step 1: Parse Details
  { id: 'ws-1', type: 'workflow-step', text: 'Parse Details', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '11:45 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Parsed inquiry details',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Event Type', value: 'Team Offsite' },
      { label: 'Dates', value: 'May 8-10, 2026' },
      { label: 'Headcount', value: '25 people' },
      { label: 'Budget', value: 'Not specified' },
      { label: 'Urgency', value: 'Standard (30+ days out)' },
    ],
  },

  // Step 2: Check Availability
  { id: 'ws-2', type: 'workflow-step', text: 'Check Availability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '11:45 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Availability confirmed via Oracle Opera PMS',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Breakout Room A', value: 'Available', status: 'success' },
      { label: 'Breakout Room B', value: 'Available', status: 'success' },
      { label: 'Room Block (25)', value: 'Available at $259/night', status: 'success' },
    ],
  },

  // Step 3: Draft Response
  { id: 'ws-3', type: 'workflow-step', text: 'Draft Response', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-3', type: 'agent-activity', time: '11:46 AM', icon: mdiFileDocumentOutline, iconColor: '#16A34A', text: 'Proposal drafted — Team Offsite package',
    capability: 'CONTRACTS',
    isExpandable: true,
    details: [
      { label: 'Template', value: 'Standard Event Contract' },
      { label: 'Venue Package', value: '2 Breakout Rooms (full day)' },
      { label: 'Room Block', value: '25 rooms × 2 nights × $259' },
      { label: 'Total Estimate', value: '$15,450' },
    ],
  },

  // Step 4: Send Response
  { id: 'ws-4', type: 'workflow-step', text: 'Send Response', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '11:47 AM', icon: mdiSendOutline, iconColor: '#16A34A', text: 'Proposal sent to lpark@techforward.io',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'Subject', value: 'Your Team Offsite at The Statler — May 8-10' },
      { label: 'Includes', value: 'Venue details, pricing, property highlights' },
      { label: 'CTA', value: 'Schedule a site visit' },
      { label: 'Response Time', value: '1.8 minutes', status: 'success' },
    ],
  },

  // Step 5: Follow Up
  { id: 'ws-5', type: 'workflow-step', text: 'Follow Up', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-5', type: 'agent-activity', time: '11:47 AM', icon: mdiClockOutline, text: 'Follow-up scheduled — 48 hours (corporate event cadence)',
    capability: 'MESSAGING',
  },

  // Completion
  { id: 'e-6', type: 'system-event', time: '11:47 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Inquiry Response workflow completed — 1.8 min total', capability: 'MESSAGING' },
];
