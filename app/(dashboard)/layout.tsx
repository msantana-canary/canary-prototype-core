'use client';

/**
 * Dashboard Layout — CanaryAppShellV2 (library v0.6.0)
 *
 * The V2 shell owns all app chrome: the 240px sidebar (property switcher,
 * product nav, Team Chat, account footer) and the top bar (page title, insight
 * link, Reservations and Copilot pills). Products render only their own surface
 * inside it.
 *
 * Notes on the V2 API:
 *  - The top bar title is DERIVED from `selectedSidebarItemId`, so we never
 *    pass `pageTitle` — the nav label and the title can't drift apart.
 *  - `contentPadding="none"` because messaging renders its own full-bleed tab
 *    strip and split panes directly under the top bar.
 *  - Settings is no longer a nav item; it's a footer button (`onSettingsClick`).
 *  - `className="canary-shell-dvh"` re-applies the dvh height clamp the V2
 *    shell's inline `height: 100vh` would otherwise block. See globals.css.
 */

import { useRouter, usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {
  CanaryAppShellV2,
  standardMainSidebarSectionsV2,
  addBadge,
} from '@canary-ui/components';
import { useMessagingStore } from '@/lib/products/messaging/store';

// Map V2 sidebar item IDs to routes. Only ids that exist in
// standardMainSidebarSectionsV2 belong here; unmapped clicks are a no-op.
const itemRouteMap: Record<string, string> = {
  'messages': '/messages',
  'calls': '/calls',
  'upsells': '/upsells',
  'check-in': '/check-in',
  'checkout': '/checkout',
  'digital-tips': '/digital-tips',
  'authorizations': '/authorizations',
  'contracts': '/contracts',
  'clients-on-file': '/clients-on-file',
};

// Map routes back to sidebar item IDs
const routeItemMap: Record<string, string> = Object.fromEntries(
  Object.entries(itemRouteMap).map(([key, value]) => [value, key])
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Get messaging store for unread badge
  const { threads } = useMessagingStore();

  // Count unread messages in inbox
  const unreadCount = useMemo(() => {
    return threads.filter(thread => thread.isUnread && thread.status === 'inbox').length;
  }, [threads]);

  // Badge the Messages nav item. `addBadge` is section-shape generic, so it
  // works on the V2 groupings, and CanarySidebarV2 renders `item.badge`.
  const sectionsWithBadge = useMemo(() => {
    if (unreadCount > 0) {
      return addBadge(standardMainSidebarSectionsV2, 'messages', unreadCount);
    }
    return standardMainSidebarSectionsV2;
  }, [unreadCount]);

  // Determine selected item from pathname
  const selectedItemId = useMemo(() => {
    return routeItemMap[pathname] || 'check-in';
  }, [pathname]);

  // Handle sidebar navigation
  const handleSidebarItemClick = (itemId: string) => {
    const route = itemRouteMap[itemId];
    if (route) {
      if (route === pathname) {
        window.dispatchEvent(new CustomEvent('sidebar-nav-reset'));
      }
      router.push(route);
    }
  };

  return (
    <CanaryAppShellV2
      className="canary-shell-dvh"
      // Sidebar
      property={{ name: 'Days Inn & Suites by Wyndham Wausau', code: '38653' }}
      selectedSidebarItemId={selectedItemId}
      onSidebarItemClick={handleSidebarItemClick}
      sidebarSections={sectionsWithBadge}
      teamChat={{ badge: 2 }}
      user={{ name: 'Theresa' }}
      onSettingsClick={() => router.push('/settings')}
      // Top bar
      insight={{ label: 'Insights' }}
      reservationStatus={{ isConnected: true }}
      copilot={{ message: '2 items need attention' }}
      // Content
      contentPadding="none"
      contentBackground="#FFFFFF"
    >
      {children}
    </CanaryAppShellV2>
  );
}
