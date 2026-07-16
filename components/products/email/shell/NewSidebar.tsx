/**
 * NewSidebar — Email Channel (new app-shell paradigm)
 *
 * Custom-built 240px nav rail for Wenjun's redesigned shell. The library's
 * CanarySidebar renders the OLD design, so this is bespoke — but it uses
 * library color tokens + @mdi outline icons per convention.
 *
 * Nav behavior: Email is the ACTIVE item (no-op). Messages routes to the
 * legacy /messages shell. Everything else is inert (no pointer affordance).
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@mdi/react';
import { colors } from '@canary-ui/components';
import {
  mdiMessageOutline,
  mdiEmailOutline,
  mdiPhoneOutline,
  mdiTagOutline,
  mdiSilverwareForkKnife,
  mdiLoginVariant,
  mdiLogoutVariant,
  mdiCashMultiple,
  mdiCreditCardOutline,
  mdiFileDocumentOutline,
  mdiAccountGroupOutline,
  mdiAccountMultipleOutline,
  mdiCogOutline,
  mdiHelpCircleOutline,
  mdiUnfoldMoreHorizontal,
} from '@mdi/js';
import { shellTokens } from './shell-tokens';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  onClick?: () => void;
  active?: boolean;
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const interactive = item.active || !!item.onClick;

  return (
    <div
      onClick={item.active ? undefined : item.onClick}
      className="flex items-center gap-2 rounded-[6px] transition-colors"
      style={{
        width: 216,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: item.active ? colors.colorWhite : 'transparent',
        cursor: interactive && !item.active ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (!item.active && item.onClick) {
          e.currentTarget.style.backgroundColor = shellTokens.navHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!item.active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <Icon
        path={item.icon}
        size={0.83}
        color={item.active ? colors.colorBlack1 : colors.colorWhite}
      />
      <span
        className="flex-1 font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
        style={{
          color: item.active ? colors.colorBlack1 : colors.colorWhite,
          fontWeight: item.active ? 500 : 400,
        }}
      >
        {item.label}
      </span>
      {item.badge !== undefined && (
        <span
          className="flex items-center justify-center rounded-full shrink-0 font-['Roboto',sans-serif] font-bold text-[12px]"
          style={{
            width: 16,
            height: 16,
            backgroundColor: colors.colorPink1,
            color: colors.colorWhite,
          }}
        >
          {item.badge}
        </span>
      )}
    </div>
  );
}

export function NewSidebar() {
  const router = useRouter();

  const groups: NavItem[][] = [
    // Communications
    [
      { id: 'messages', label: 'Messages', icon: mdiMessageOutline, onClick: () => router.push('/messages') },
      { id: 'email', label: 'Email', icon: mdiEmailOutline, badge: 4, active: true },
      { id: 'calls', label: 'Calls', icon: mdiPhoneOutline },
    ],
    // Guest Management
    [
      { id: 'upsells', label: 'Upsells', icon: mdiTagOutline },
      { id: 'fnb', label: 'F&B', icon: mdiSilverwareForkKnife },
      { id: 'checkin', label: 'Check-in', icon: mdiLoginVariant },
      { id: 'checkout', label: 'Checkout', icon: mdiLogoutVariant },
      { id: 'tips', label: 'Digital Tips', icon: mdiCashMultiple },
    ],
    // Records
    [
      { id: 'authorizations', label: 'Authorizations', icon: mdiCreditCardOutline },
      { id: 'contracts', label: 'Contracts', icon: mdiFileDocumentOutline },
      { id: 'clients', label: 'Clients on File', icon: mdiAccountGroupOutline },
    ],
  ];

  return (
    <div
      className="flex flex-col shrink-0 h-full"
      style={{ width: 240, backgroundColor: shellTokens.sidebarBg }}
    >
      {/* Hotel selector */}
      <div
        className="flex items-center gap-2"
        style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 16, paddingBottom: 16 }}
      >
        <div className="flex-1 min-w-0 truncate whitespace-nowrap">
          <span
            className="font-['Roboto',sans-serif] font-bold text-[12px] leading-[18px]"
            style={{ color: colors.colorWhite, letterSpacing: '0.24px' }}
          >
            38653
          </span>{' '}
          <span
            className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
            style={{ color: colors.colorWhite }}
          >
            Days Inn &amp; Suites by Wyndham Wausau
          </span>
        </div>
        <Icon path={mdiUnfoldMoreHorizontal} size={0.83} color={colors.colorWhite} />
      </div>
      <div style={{ height: 1, backgroundColor: shellTokens.sidebarDivider }} />

      {/* Nav groups */}
      <div className="flex flex-col" style={{ paddingTop: 12, gap: 8 }}>
        {groups.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && (
              <div style={{ height: 1, backgroundColor: shellTokens.sidebarDivider }} />
            )}
            <div
              className="flex flex-col"
              style={{ gap: 4, paddingLeft: 12, paddingRight: 12 }}
            >
              {group.map((item) => (
                <SidebarNavItem key={item.id} item={item} />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Bottom sticky */}
      <div
        className="flex-1 flex flex-col justify-end items-center"
        style={{ gap: 8, paddingLeft: 12, paddingRight: 12, paddingBottom: 12 }}
      >
        {/* Canary logo, 20% opacity */}
        <img
          src="/canary-logo.svg"
          alt="Canary"
          style={{ width: 135, height: 34, opacity: 0.2, objectFit: 'contain' }}
        />

        {/* Team Chat pill */}
        <div style={{ width: 216 }}>
          <div
            className="flex items-center gap-2 rounded-[6px]"
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              backgroundColor: shellTokens.teamChatPill,
            }}
          >
            <Icon path={mdiAccountMultipleOutline} size={0.83} color={colors.colorWhite} />
            <span
              className="flex-1 font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
              style={{ color: colors.colorWhite }}
            >
              Team Chat
            </span>
            <span
              className="flex items-center justify-center rounded-full shrink-0 font-['Roboto',sans-serif] font-bold text-[12px]"
              style={{ width: 16, height: 16, backgroundColor: colors.colorPink1, color: colors.colorWhite }}
            >
              4
            </span>
          </div>
        </div>

        {/* User row */}
        <div
          className="flex rounded-[6px] overflow-hidden"
          style={{ width: 216, backgroundColor: shellTokens.userRowBg }}
        >
          {/* User cell */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1" style={{ paddingTop: 12, paddingBottom: 12 }}>
            <div
              className="flex items-center justify-center rounded-[4px]"
              style={{ width: 20, height: 20, backgroundColor: colors.colorBlueDark4 }}
            >
              <span
                className="font-['Roboto',sans-serif] font-bold text-[10px] uppercase"
                style={{ color: colors.colorBlueDark1 }}
              >
                TS
              </span>
            </div>
            <span
              className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Theresa
            </span>
          </div>
          {/* Settings cell */}
          <div className="flex flex-col items-center justify-center gap-1" style={{ width: 72, paddingTop: 12, paddingBottom: 12 }}>
            <Icon path={mdiCogOutline} size={0.83} color={colors.colorWhite} />
            <span
              className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Settings
            </span>
          </div>
          {/* Support cell */}
          <div className="flex flex-col items-center justify-center gap-1" style={{ width: 72, paddingTop: 12, paddingBottom: 12 }}>
            <Icon path={mdiHelpCircleOutline} size={0.83} color={colors.colorWhite} />
            <span
              className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
