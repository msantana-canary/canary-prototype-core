/**
 * Messaging AppLayout Component — REDESIGN (Figma "Messaging" frame 29:2099)
 *
 * MainNav (tabs + online status) → full-width Search + New-message row →
 * page content on a colorBlack8 canvas. The Inbox/Archived/Blocked scoping
 * moved INTO the thread-list column (its own segmented-control card), so the
 * old SubNav bar is gone for Conversations. Broadcast keeps its sub nav.
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import { colors, CanaryButton, ButtonType, ButtonSize } from '@canary-ui/components';
import { MainNav } from './MainNav';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';
import { BroadcastSubNav } from './broadcast/BroadcastSubNav';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
}

export function AppLayout({
  children,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onNewMessage,
}: AppLayoutProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: colors.colorBlack8 }}>
      {/* Main Navigation */}
      <MainNav activeTab={activeTab} onTabChange={onTabChange} />

      {/* Search + CTA row (Conversations only) */}
      {activeTab === 'conversations' && (
        <div
          className="flex items-center gap-3 shrink-0"
          style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16 }}
        >
          <div
            className="flex-1 flex items-center gap-2 rounded-[6px]"
            style={{
              backgroundColor: colors.colorWhite,
              border: `1px solid ${colors.colorBlack5}`,
              height: 40,
              paddingLeft: 8,
              paddingRight: 16,
            }}
          >
            <Icon path={mdiMagnify} size={0.83} color={colors.colorBlack3} />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search"
              className="flex-1 border-0 outline-none bg-transparent font-['Roboto',sans-serif] text-[14px] leading-[22px] placeholder:text-[#666666]"
              style={{ color: colors.colorBlack1 }}
            />
          </div>

          <CanaryButton type={ButtonType.PRIMARY} size={ButtonSize.NORMAL} onClick={onNewMessage}>
            New message
          </CanaryButton>
        </div>
      )}

      {activeTab === 'broadcast' && <BroadcastSubNav />}

      {/* Page Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
