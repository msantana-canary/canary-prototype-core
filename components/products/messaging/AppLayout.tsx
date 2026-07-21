/**
 * Messaging AppLayout Component — REDESIGN (Figma "Messaging" frame 29:2099)
 *
 * MainNav (tabs + online status) → page content on a colorBlack8 canvas. The
 * Inbox/Archived/Blocked scoping lives inside the Filters popover on the search
 * row. Broadcast keeps its sub nav.
 *
 * Top-row placement is a prototype experiment (`topRowStyle`):
 *  - FULL: AppLayout renders the search + Filters + New-message row as a
 *    full-width band above the content.
 *  - COMPACT: AppLayout renders NO top row — the controls move INTO the left
 *    (thread-list) column in the page (column-scoped), and the conversation thread
 *    column runs full height from the top of the content area.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { MainNav } from './MainNav';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';
import { BroadcastSubNav } from './broadcast/BroadcastSubNav';
import { ConversationControls, CategoryFilter } from './ConversationControls';
import { useMessagingStore } from '@/lib/products/messaging/store';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  currentView: CategoryFilter;
  onViewChange: (view: CategoryFilter) => void;
}

export function AppLayout({
  children,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onNewMessage,
  currentView,
  onViewChange,
}: AppLayoutProps) {
  // Prototype control: top-row layout experiment (full vs compact).
  const topRowStyle = useMessagingStore((s) => s.topRowStyle);
  const isCompact = topRowStyle === 'compact';

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: colors.colorBlack8 }}>
      {/* Main Navigation */}
      <MainNav activeTab={activeTab} onTabChange={onTabChange} />

      {/* Search + CTA row (Conversations only) — FULL mode only. In compact mode
          the controls move into the left column (rendered by the page). */}
      {activeTab === 'conversations' && !isCompact && (
        <div
          className="shrink-0"
          style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16 }}
        >
          <ConversationControls
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onNewMessage={onNewMessage}
            currentView={currentView}
            onViewChange={onViewChange}
          />
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
