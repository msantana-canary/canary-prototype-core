/**
 * Messaging AppLayout Component — REDESIGN (Figma "Messaging" frame 29:2099)
 *
 * MainNav (tabs + online status) → page content on a colorBlack8 canvas. That
 * is now the WHOLE shell.
 *
 * ⚠ The Conversations search + "New message" band used to live here, full width
 * above both columns. It moved INTO the thread-list card (`ThreadList`'s
 * `search` slot) — see ConversationControls for the reasoning. AppLayout no
 * longer takes `searchQuery` / `onSearchChange` / `onNewMessage`: nothing
 * layout-level needs them, and threading them through a shell that only
 * forwarded them was the reason the band ended up spanning columns it does not
 * scope in the first place.
 *
 * Broadcast has no sub nav either — its control band collapsed into the
 * audience card (step 1 baseline). Both tabs now hand the shell one child and
 * own everything inside it.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { MainNav } from './MainNav';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
}

export function AppLayout({ children, activeTab, onTabChange }: AppLayoutProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: colors.colorBlack8 }}>
      {/* Main Navigation */}
      <MainNav activeTab={activeTab} onTabChange={onTabChange} />

      {/* Page Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
