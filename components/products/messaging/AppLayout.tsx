/**
 * Messaging AppLayout Component
 *
 * Content layout for the messaging product.
 * Provides MainNav and SubNav specific to messaging.
 *
 * Note: Sidebar and PageHeader are now handled by the shared dashboard layout.
 */

'use client';

import React from 'react';
import { MainNav } from './MainNav';
import { SubNav } from './SubNav';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: 'inbox' | 'archived' | 'blocked';
  onViewChange: (view: 'inbox' | 'archived' | 'blocked') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
}

export function AppLayout({
  children,
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onNewMessage,
}: AppLayoutProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
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
  );
}
