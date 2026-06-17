'use client';

/**
 * ActivityEventItem — a reservation lifecycle event rendered INLINE and CENTERED
 * in the chat thread. Matches the Messaging-Events Figma (node 1:12087):
 *
 *   [ line · flex-1 ]  [ white card · 1px #2858C4 border ]  [ line · flex-1 ]
 *                       icon 24px blue + ( label / time )
 *
 * v0 is STATIC. When `expandable` is true (a separate, future option) the card
 * becomes interactive: hover lift, a rotating chevron, and a smooth height+fade
 * expand into detail rows (status dots + a CTA) — ported from the agent-builder
 * ActivityTimeline ExpandedDetails. Width stays fixed; only height animates.
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown } from '@mdi/js';
import { format } from 'date-fns';
import { colors, CanaryButton, ButtonType, ButtonSize } from '@canary-ui/components';
import { ActivityEvent, ACTIVITY_DEFS, ActivityStatus } from '@/lib/products/messaging/activity-events';

interface ActivityEventItemProps {
  event: ActivityEvent;
  /** Future option — when true, the card hovers, shows a chevron, and expands to details. v0 = false. */
  expandable?: boolean;
}

const BLUE = colors.colorBlueDark1; // #2858C4 — border + icon
const LINE = colors.colorBlack6;    // #E5E5E5 — hairlines
const LABEL = colors.colorBlack1;   // #000    — label
const SUB = colors.colorBlack4;     // #999    — time / secondary

const STATUS_COLOR: Record<ActivityStatus, string> = {
  success: colors.ok,      // #008040
  pending: colors.warning, // #FAB541
  error: colors.danger,    // #E40046
};

export function ActivityEventItem({ event, expandable = false }: ActivityEventItemProps) {
  const def = ACTIVITY_DEFS[event.kind];
  const label = event.label ?? def.label;
  const time = format(event.timestamp, 'h:mm a').toLowerCase();
  const hasDetails = !!event.details && event.details.length > 0;
  const canExpand = expandable && hasDetails;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',
        marginTop: 20, marginBottom: 20, animation: 'aeFadeIn 0.25s ease-out',
      }}
    >
      <style>{`
        @keyframes aeFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .ae-card { transition: background-color .15s ease, box-shadow .18s ease, border-color .15s ease; }
        .ae-card.ae-hoverable:hover { background-color: #F7F9FE; box-shadow: 0 2px 12px rgba(40,88,196,0.12); }
      `}</style>

      <div style={{ flex: '1 0 0', minWidth: 1, height: 1, backgroundColor: LINE }} />

      <div
        className={`ae-card${canExpand ? ' ae-hoverable' : ''}`}
        style={{
          flex: '1 0 0', minWidth: 1, maxWidth: 800,
          display: 'flex', flexDirection: 'column',
          backgroundColor: colors.colorWhite, border: `1px solid ${BLUE}`, borderRadius: 8, overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() => canExpand && setExpanded(!expanded)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', width: '100%',
            background: 'none', border: 'none', textAlign: 'left', cursor: canExpand ? 'pointer' : 'default',
          }}
        >
          <div style={{ flexShrink: 0, width: 24, height: 24 }}>
            <Icon path={def.icon} size={1} color={BLUE} />
          </div>
          <div style={{ flex: '1 0 0', minWidth: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, lineHeight: '18px', fontWeight: 500, color: LABEL }}>{label}</span>
            <span style={{ fontSize: 12, lineHeight: '18px', fontWeight: 400, color: SUB }}>{time}</span>
          </div>
          {event.beyondV1 && (
            <span
              style={{
                flexShrink: 0, fontSize: 9, lineHeight: '14px', textTransform: 'uppercase', color: SUB,
                border: `1px solid ${LINE}`, borderRadius: 4, padding: '0 4px',
              }}
            >
              beyond V1
            </span>
          )}
          {canExpand && (
            <Icon
              path={mdiChevronDown}
              size={0.7}
              color={SUB}
              style={{ flexShrink: 0, transition: 'transform .2s ease', transform: expanded ? 'rotate(180deg)' : 'none' }}
            />
          )}
        </button>

        {canExpand && (
          <div style={{ display: 'grid', gridTemplateRows: expanded ? '1fr' : '0fr', transition: 'grid-template-rows .22s ease' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '0 16px 12px 16px', opacity: expanded ? 1 : 0, transition: 'opacity .2s ease' }}>
                <div style={{ height: 1, backgroundColor: '#E5EAF5', marginBottom: 10 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {event.details!.map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                      <span style={{ fontSize: 12, lineHeight: '18px', color: colors.colorBlack3 }}>{row.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {row.status && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: STATUS_COLOR[row.status], flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: 12, lineHeight: '18px', fontWeight: 500, color: LABEL }}>{row.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {event.action && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, paddingTop: 8, borderTop: '1px solid #E5EAF5' }}>
                    <CanaryButton type={ButtonType.TEXT} size={ButtonSize.COMPACT} onClick={() => {}}>
                      {event.action.label}
                    </CanaryButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: '1 0 0', minWidth: 1, height: 1, backgroundColor: LINE }} />
    </div>
  );
}
