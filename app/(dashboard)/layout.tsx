'use client';

/**
 * Dashboard Layout
 *
 * Shared layout for all product pages using CanaryAppShell.
 * Provides consistent sidebar navigation and page header across products.
 */

import { useRouter, usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {
  CanaryAppShell,
  standardMainSidebarSections,
  addBadge,
} from '@canary-ui/components';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { TeamChatPill } from '@/components/products/team-chat/TeamChatPill';
import { TeamChatSpikeRoot } from '@/components/products/team-chat/TeamChatSpikeRoot';
import { CollapsedNavRail } from '@/components/products/team-chat/CollapsedNavRail';
import { CleanHeaderActions } from '@/components/products/team-chat/CleanHeaderActions';
import { useSpikeStore } from '@/lib/products/team-chat/spike-store';

// Map sidebar item IDs to routes
const itemRouteMap: Record<string, string> = {
  'upsells': '/upsells',
  'check-in': '/check-in',
  'checkout': '/checkout',
  'messages': '/messages',
  'calls': '/calls',
  'digital-tips': '/digital-tips',
  'authorizations': '/authorizations',
  'contracts': '/contracts',
  'id-verification': '/id-verification',
  'clients-on-file': '/clients-on-file',
  'amenities': '/amenities',
  'payment-links': '/payment-links',
  'settings': '/settings',
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
  // SPIKE: variant C reclaims the nav's width by hiding it while team chat is open.
  // cleanHeader is the orthogonal header-treatment toggle (Reservations → Team → avatar).
  const { variant, panelOpen, cleanHeader } = useSpikeStore();
  const hideNav = variant === 'C' && panelOpen;

  // Get messaging store for unread badge
  const { threads } = useMessagingStore();

  // Count unread messages in inbox
  const unreadCount = useMemo(() => {
    return threads.filter(thread => thread.isUnread && thread.status === 'inbox').length;
  }, [threads]);

  // Add badge to messages item in sidebar
  const sectionsWithBadge = useMemo(() => {
    if (unreadCount > 0) {
      return addBadge(standardMainSidebarSections, 'messages', unreadCount);
    }
    return standardMainSidebarSections;
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
    <>
      {/* SPIKE variant C: full-height collapsed rail in the sidebar's own slot. */}
      {hideNav && (
        <CollapsedNavRail
          sections={sectionsWithBadge}
          selectedItemId={selectedItemId}
          onItemClick={handleSidebarItemClick}
        />
      )}
      <CanaryAppShell
        // Variant C: with the AppShell sidebar hidden, offset the whole shell
        // (header + content) right by the rail width so the rail occupies the
        // sidebar's full-height slot — not underneath the header. Must equal RAIL_WIDTH (64).
        className={`transition-[padding] duration-200 ease-out ${hideNav ? 'pl-[64px]' : ''}`}
        // Sidebar config
        selectedSidebarItemId={selectedItemId}
        onSidebarItemClick={handleSidebarItemClick}
        sidebarSections={sectionsWithBadge}
        hideSidebar={hideNav}
        // Header config — header-treatment toggle: clean = Reservations → Team → avatar-only,
        // built in headerActions with the lib's reservation/account slots suppressed.
        propertyName="Statler New York"
        userProfile={
          cleanHeader
            ? undefined
            : {
                name: 'Theresa Webb',
                role: 'Front desk',
                avatarUrl: 'https://i.pravatar.cc/150?img=5',
              }
        }
        reservationStatus={cleanHeader ? undefined : { label: 'Reservations', isConnected: true }}
        headerActions={cleanHeader ? <CleanHeaderActions /> : <TeamChatPill />}
        // Content config
        contentPadding="none"
        contentBackground="#FFFFFF"
      >
        <TeamChatSpikeRoot>{children}</TeamChatSpikeRoot>
      </CanaryAppShell>
    </>
  );
}
