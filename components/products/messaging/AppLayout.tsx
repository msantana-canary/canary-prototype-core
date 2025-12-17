/**
 * AppLayout Component
 *
 * Main application layout with sidebar navigation and header.
 * Wraps the messaging interface.
 */

'use client';

import React, { useMemo } from 'react';
import {
  CanarySidebar,
  SidebarVariant,
  standardMainSidebarSections,
} from '@canary-ui/components';
import { PageHeader } from './PageHeader';
import { MainNav } from './MainNav';
import { SubNav } from './SubNav';
import { Thread } from '@/lib/products/messaging/types';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: 'inbox' | 'archived' | 'blocked';
  onViewChange: (view: 'inbox' | 'archived' | 'blocked') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  threads: Thread[];
}

function Logo() {
  return (
    <img
      src="/canary-logo.svg"
      alt="Canary Technologies"
      width={140}
      height={24}
    />
  );
}

export function AppLayout({
  children,
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onNewMessage,
  threads,
}: AppLayoutProps) {
  // Count unread messages in inbox
  const unreadCount = useMemo(() => {
    return threads.filter(thread => thread.isUnread && thread.status === 'inbox').length;
  }, [threads]);

  // Add badge to messages item
  const sectionsWithBadge = useMemo(() => {
    return standardMainSidebarSections.map(section => ({
      ...section,
      items: section.items.map(item => {
        if (item.id === 'messages') {
          return {
            ...item,
            badge: unreadCount > 0 ? unreadCount : undefined,
          };
        }
        return item;
      }),
    }));
  }, [unreadCount]);

  return (
    <div className="h-screen flex">
      {/* Sidebar - Full Height on Left */}
      <CanarySidebar
        variant={SidebarVariant.MAIN}
        sections={sectionsWithBadge}
        logo={<Logo />}
        selectedItemId="messages"
        width={180}
      />

      {/* Main Content Area on Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <PageHeader />

        {/* Main Navigation */}
        <MainNav />

        {/* Sub Navigation */}
        <SubNav
          onNewMessage={onNewMessage}
          currentView={currentView}
          onViewChange={onViewChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
