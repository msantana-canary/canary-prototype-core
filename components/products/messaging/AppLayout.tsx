/**
 * Messaging AppLayout Component
 *
 * Main application layout with sidebar navigation and header.
 * Wraps the messaging interface. Conditionally shows SubNav
 * only for the Conversations tab.
 */

'use client';

import React from 'react';
import { MainNav } from './MainNav';
import { SubNav } from './SubNav';
import { Thread } from '@/lib/products/messaging/types';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';
import { BroadcastSubNav } from './broadcast/BroadcastSubNav';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  currentView: 'inbox' | 'archived' | 'blocked';
  onViewChange: (view: 'inbox' | 'archived' | 'blocked') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
}

export function AppLayout({
  children,
  activeTab,
  onTabChange,
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onNewMessage,
}: AppLayoutProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Navigation */}
      <MainNav activeTab={activeTab} onTabChange={onTabChange} />

      {/* Sub Navigation */}
      {activeTab === 'conversations' && (
        <SubNav
          onNewMessage={onNewMessage}
          currentView={currentView}
          onViewChange={onViewChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      )}
      {activeTab === 'broadcast' && (
        <BroadcastSubNav />
      )}

      {/* Page Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
