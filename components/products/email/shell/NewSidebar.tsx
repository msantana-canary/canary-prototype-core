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
  mdiMessageProcessingOutline,
  mdiEmailOutline,
  mdiPhoneOutline,
  mdiSilverwareForkKnife,
  mdiLogin,
  mdiLogout,
  mdiCashMultiple,
  mdiCurrencyUsd,
  mdiShieldCheckOutline,
  mdiFileSign,
  mdiAccountBoxOutline,
  mdiAccountMultipleOutline,
  mdiCogOutline,
  mdiHelpCircleOutline,
  mdiUnfoldMoreHorizontal,
} from '@mdi/js';
import { shellTokens } from './shell-tokens';
import { useEmailStore } from '@/lib/products/email/store';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  onClick?: () => void;
  active?: boolean;
}

/**
 * Interaction affordances mirror the library's CanarySidebar item state machine
 * (hover/focus = white 5% overlay, press = white 15%, 200ms transition, real
 * <button> semantics with keyboard focus). Values are adapted from the dark
 * navy rail rather than the library's overlay divs — see shellTokens.
 */
function SidebarNavItem({ item }: { item: NavItem }) {
  const isActive = !!item.active;

  return (
    <button
      type="button"
      onClick={isActive ? undefined : item.onClick}
      aria-current={isActive ? 'page' : undefined}
      className={[
        "flex items-center gap-2 rounded-[6px] text-left appearance-none border-0",
        "transition-colors duration-200 focus:outline-none",
        isActive
          ? ''
          : 'hover:bg-[rgba(255,255,255,0.05)] focus-visible:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.15)] focus-visible:ring-1 focus-visible:ring-white/30',
      ].join(' ')}
      style={{
        width: 216,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        // Only the active (white pill) item gets an inline background. Inactive
        // items intentionally get NO inline background so the Tailwind
        // hover/active/focus-visible classes above actually paint — an inline
        // `backgroundColor: transparent` was overriding them (the dead-hover bug).
        ...(isActive ? { backgroundColor: colors.colorWhite } : {}),
        cursor: isActive ? 'default' : 'pointer',
      }}
    >
      {/* Library CanarySidebar parity: 20×20 icons (size 0.83 — Figma-measured;
          24px puffed rows to 40px), inactive at 50% opacity, active icon + label
          in the rail navy (#375492) on the white pill, label always font-normal
          — only color changes with state. */}
      <span style={{ opacity: isActive ? 1 : 0.5 }} className="shrink-0 flex items-center">
        <Icon
          path={item.icon}
          size={0.83}
          color={isActive ? shellTokens.sidebarBg : colors.colorWhite}
        />
      </span>
      <span
        className="flex-1 font-['Roboto',sans-serif] text-[14px] leading-[22px] font-normal truncate"
        style={{
          color: isActive ? shellTokens.sidebarBg : colors.colorWhite,
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
    </button>
  );
}

export function NewSidebar() {
  const router = useRouter();

  // Derive the Email nav badge from the store's unread inbox count (mirrors the
  // legacy dashboard's addBadge idiom in app/(dashboard)/layout.tsx). Undefined
  // when zero so the badge disappears — no more hardcoded `4`.
  const unreadInboxCount = useEmailStore(
    (s) => s.threads.filter((t) => t.isUnread && t.status === 'inbox').length
  );

  const groups: NavItem[][] = [
    // Communications — icon set matches the REAL product sidebarTabs (library dist),
    // not AI_REFERENCE.md (stale) and not the Figma's placeholder assets.
    [
      { id: 'messages', label: 'Messages', icon: mdiMessageProcessingOutline, onClick: () => router.push('/messages') },
      { id: 'email', label: 'Email', icon: mdiEmailOutline, badge: unreadInboxCount > 0 ? unreadInboxCount : undefined, active: true },
      { id: 'calls', label: 'Calls', icon: mdiPhoneOutline, onClick: () => router.push('/calls') },
    ],
    // Guest Management
    [
      { id: 'upsells', label: 'Upsells', icon: mdiCashMultiple },
      { id: 'fnb', label: 'F&B', icon: mdiSilverwareForkKnife },
      { id: 'checkin', label: 'Check-in', icon: mdiLogin, onClick: () => router.push('/check-in') },
      { id: 'checkout', label: 'Checkout', icon: mdiLogout, onClick: () => router.push('/checkout') },
      { id: 'tips', label: 'Digital Tips', icon: mdiCurrencyUsd },
    ],
    // Records
    [
      { id: 'authorizations', label: 'Authorizations', icon: mdiShieldCheckOutline },
      { id: 'contracts', label: 'Contracts', icon: mdiFileSign },
      { id: 'clients', label: 'Clients on File', icon: mdiAccountBoxOutline },
    ],
  ];

  return (
    <div
      className="flex flex-col shrink-0 h-full"
      style={{ width: 240, backgroundColor: shellTokens.sidebarBg }}
    >
      {/* Hotel selector — fixed 52px total height (Figma-measured), px-12 */}
      <div
        className="flex items-center gap-2 shrink-0"
        style={{ height: 52, paddingLeft: 12, paddingRight: 12 }}
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

        {/* Team Chat pill — no route, but full interaction affordance */}
        <div style={{ width: 216 }}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-[6px] w-full text-left appearance-none border-0 cursor-pointer transition-opacity duration-200 hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
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
          </button>
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
          {/* Settings cell — no route, but full interaction affordance */}
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 appearance-none border-0 bg-transparent cursor-pointer transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.15)] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-inset"
            style={{ width: 72, paddingTop: 12, paddingBottom: 12 }}
          >
            <Icon path={mdiCogOutline} size={0.83} color={colors.colorWhite} />
            <span
              className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Settings
            </span>
          </button>
          {/* Support cell — no route, but full interaction affordance */}
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 appearance-none border-0 bg-transparent cursor-pointer transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.15)] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-inset"
            style={{ width: 72, paddingTop: 12, paddingBottom: 12 }}
          >
            <Icon path={mdiHelpCircleOutline} size={0.83} color={colors.colorWhite} />
            <span
              className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Support
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
