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
  mdiCheckCircleOutline,
  mdiChevronDown,
  mdiChevronUp,
  mdiStarFourPointsOutline,
  mdiClockOutline,
  mdiArrowLeft,
  mdiFlashOutline,
  mdiAccountOutline,
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
  /** When true, the internal header is hidden (parent handles it) */
  hideHeader?: boolean;
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

export default function ActivityTimeline({ events, onBack, title, subtitle, agentName, onAction, animated, hideHeader }: ActivityTimelineProps) {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: hideHeader ? undefined : '-24px', overflow: 'hidden' }}>
      {/* Header bar — hidden when parent handles it */}
      {!hideHeader && (
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
      )}

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
          <GuestAvatar />
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

function GuestAvatar() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon path={mdiAccountOutline} size={0.6} color="#999" />
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

// Timeline mock data lives in lib/products/agents/timeline-data.ts
