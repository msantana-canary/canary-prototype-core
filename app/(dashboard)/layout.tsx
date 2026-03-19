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
    <CanaryAppShell
      // Sidebar config
      selectedSidebarItemId={selectedItemId}
      onSidebarItemClick={handleSidebarItemClick}
      sidebarSections={sectionsWithBadge}
      // Header config
      propertyName="Statler New York"
      userProfile={{
        name: 'Theresa Webb',
        role: 'Front desk',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      }}
      reservationStatus={{
        label: 'Reservations',
        isConnected: true,
      }}
      // Content config
      contentPadding="none"
      contentBackground="#FFFFFF"
    >
      {children}
    </CanaryAppShell>
  );
}
