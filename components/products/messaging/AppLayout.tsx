/**
 * Messaging AppLayout Component — REDESIGN (Figma "Messaging" frame 29:2099)
 *
 * MainNav (tabs + online status) → page content on a colorBlack8 canvas. The
 * Inbox/Archived/Blocked scoping lives inside the Filters popover on the search
 * row. Broadcast has no sub nav — its control band collapsed into the audience
 * card (step 1 baseline).
 *
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { MainNav } from './MainNav';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';
import { ConversationControls, CategoryFilter } from './ConversationControls';

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
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: colors.colorBlack8 }}>
      {/* Main Navigation */}
      <MainNav activeTab={activeTab} onTabChange={onTabChange} />

      {/* Search + CTA row — Conversations only, full width above both columns. */}
      {activeTab === 'conversations' && (
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

      {/* Broadcast has NO control band — Active is the default state, Archived
          lives in the audience card's GROUPS kebab, and "Manage segments" is
          reachable from the filter modal's Guest Segments mode. */}

      {/* Page Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
