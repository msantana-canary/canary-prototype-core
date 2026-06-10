'use client';

import { useState } from 'react';
import {
  CanaryAppShell,
  SidebarVariant,
  sidebarTabs,
  colors,
} from '@canary-ui/components';

const options = [
  { key: 'a', label: 'A. Current Design', description: 'Two-line name wrap + ID below' },
  { key: 'b', label: 'B. ID-Led', description: 'Site ID badge + location as hero' },
  { key: 'c', label: 'C. Location-First', description: 'Location as hero, brand secondary' },
  { key: 'd', label: 'D. Adaptive (88%)', description: 'Quiet label, no dropdown for single-property' },
];

// Custom sidebar sections matching the Figma
const mainSections = [
  {
    id: 'main',
    items: [
      sidebarTabs.messages,
      { ...sidebarTabs.checkIn, badge: 5 },
      { ...sidebarTabs.checkOut, badge: 13 },
      sidebarTabs.upsells,
      sidebarTabs.digitalTips,
    ],
  },
  {
    id: 'secondary',
    items: [
      sidebarTabs.authorizations,
      sidebarTabs.contracts,
      sidebarTabs.clientsOnFile,
      sidebarTabs.amenities,
    ],
  },
  {
    id: 'bottom',
    items: [sidebarTabs.settings],
  },
];

function HotelSelectorA() {
  return (
    <div
      style={{
        margin: '0 8px 4px',
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '4px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', lineHeight: 1.3, fontFamily: 'Roboto, sans-serif' }}>
          Days Inn & Suites By Wyndham Wausau
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Roboto, sans-serif' }}>10201</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }}>
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
      </svg>
    </div>
  );
}

function HotelSelectorB() {
  return (
    <div
      style={{
        margin: '0 8px 4px',
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '4px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.1)',
              padding: '1px 6px',
              borderRadius: '3px',
              fontWeight: 500,
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            10201
          </span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontFamily: 'Roboto, sans-serif' }}>
            Wausau
          </span>
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.4)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Days Inn & Suites by Wyndham
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }}>
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
      </svg>
    </div>
  );
}

function HotelSelectorC() {
  return (
    <div
      title="Days Inn & Suites by Wyndham Wausau · 10201"
      style={{
        margin: '0 8px 4px',
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '4px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontFamily: 'Roboto, sans-serif' }}>
          Wausau
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            Days Inn & Suites
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>·</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', flexShrink: 0, fontFamily: 'Roboto, sans-serif' }}>10201</span>
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }}>
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
      </svg>
    </div>
  );
}

function HotelSelectorD() {
  return (
    <div style={{ margin: '0 8px 4px', padding: '8px 12px' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, fontFamily: 'Roboto, sans-serif' }}>
        Days Inn & Suites By Wyndham Wausau
      </div>
    </div>
  );
}

const selectorMap: Record<string, React.ReactNode> = {
  a: <HotelSelectorA />,
  b: <HotelSelectorB />,
  c: <HotelSelectorC />,
  d: <HotelSelectorD />,
};

const annotationMap: Record<string, { summary: string; pros: string[]; cons: string[] }> = {
  a: {
    summary: 'Full name wraps to 2 lines with numeric ID below.',
    pros: ['Shows complete hotel name', 'ID visible for corporate users'],
    cons: ['Selector takes up vertical space', 'Brand prefix still dominates'],
  },
  b: {
    summary: 'ID badge + location name as primary. Brand as secondary.',
    pros: ['Wyndham users identify by ID first', '"Wausau" instantly visible', 'Compact'],
    cons: ['Non-enterprise users don\'t think in IDs'],
  },
  c: {
    summary: '"Wausau" is the hero, brand + ID as secondary. Full name on hover.',
    pros: ['Instant recognition for any user', 'Most compact option', 'Works for all brands'],
    cons: ['Requires parsing hotel name to extract location'],
  },
  d: {
    summary: '88% of users manage one property. No dropdown, just a quiet label.',
    pros: ['Cleanest for the majority', 'No wasted interaction affordance', 'Data-backed (Snowflake: 88%)'],
    cons: ['Two different UI states to maintain'],
  },
};

export default function SidebarComparisonPage() {
  const [selected, setSelected] = useState('a');
  const annotation = annotationMap[selected];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Main content area with CanaryAppShell */}
      <div style={{ flex: 1, position: 'relative' }}>
        <CanaryAppShell
          sidebarVariant={SidebarVariant.CUSTOM}
          sidebarSections={mainSections}
          selectedSidebarItemId="check-in"
          propertyName=""
          userProfile={{ name: 'Theresa Webb', role: 'Front Desk' }}
          sidebarTopContent={selectorMap[selected]}
          pageTitle="Check-in"
        >
          <div style={{ padding: '24px' }}>
            {/* Annotation card */}
            <div
              style={{
                maxWidth: '480px',
                padding: '20px',
                background: '#fff',
                borderRadius: '8px',
                border: `1px solid ${colors.colorBlack6}`,
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 500, color: colors.colorBlack1, marginBottom: '4px' }}>
                {options.find(o => o.key === selected)?.label}
              </div>
              <div style={{ fontSize: '13px', color: colors.colorBlack3, marginBottom: '16px' }}>
                {options.find(o => o.key === selected)?.description}
              </div>
              <div style={{ fontSize: '14px', color: colors.colorBlack2, marginBottom: '12px', lineHeight: 1.5 }}>
                {annotation.summary}
              </div>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  {annotation.pros.map((p, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#008040', marginBottom: '4px' }}>+ {p}</div>
                  ))}
                </div>
                <div>
                  {annotation.cons.map((c, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#E40046', marginBottom: '4px' }}>- {c}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CanaryAppShell>
      </div>

      {/* Bottom option bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: '#fff',
          borderTop: `1px solid ${colors.colorBlack6}`,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          zIndex: 100,
        }}
      >
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelected(opt.key)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: selected === opt.key ? `2px solid ${colors.colorBlueDark1}` : `1px solid ${colors.colorBlack5}`,
              background: selected === opt.key ? colors.colorBlueDark5 : '#fff',
              cursor: 'pointer',
              fontFamily: 'Roboto, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              minWidth: '160px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: selected === opt.key ? colors.colorBlueDark1 : colors.colorBlack2 }}>
              {opt.label}
            </span>
            <span style={{ fontSize: '11px', color: colors.colorBlack4 }}>
              {opt.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
