'use client';

/**
 * Settings Layout
 *
 * Shared layout for all settings pages using CanaryAppShell
 * with SidebarVariant.SETTINGS and standardSettingsSidebarSections.
 * "Guest Journey" is already included in the standard settings sidebar.
 */

import { useRouter, usePathname } from 'next/navigation';
import { useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';
import {
  CanaryAppShell,
  CanaryButton,
  ButtonType,
  ButtonColor,
  IconPosition,
  SidebarVariant,
  standardSettingsSidebarSections,
} from '@canary-ui/components';

// Map settings sidebar item IDs to routes
const settingsRouteMap: Record<string, string> = {
  'guest-journey': '/settings/guest-journey',
};

// Map routes back to sidebar item IDs
const routeItemMap: Record<string, string> = Object.fromEntries(
  Object.entries(settingsRouteMap).map(([key, value]) => [value, key])
);

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const selectedItemId = useMemo(() => {
    return routeItemMap[pathname] || 'guest-journey';
  }, [pathname]);

  const handleSidebarItemClick = (itemId: string) => {
    const route = settingsRouteMap[itemId];
    if (route) {
      router.push(route);
    }
  };

  return (
    <CanaryAppShell
      sidebarVariant={SidebarVariant.SETTINGS}
      sidebarSections={standardSettingsSidebarSections}
      sidebarTitle="Settings"
      sidebarBackButton={
        <CanaryButton
          type={ButtonType.TEXT}
          color={ButtonColor.WHITE}
          icon={<Icon path={mdiArrowLeft} size={1} />}
          iconPosition={IconPosition.LEFT}
          onClick={() => router.push('/messages')}
        >
          Back
        </CanaryButton>
      }
      selectedSidebarItemId={selectedItemId}
      onSidebarItemClick={handleSidebarItemClick}
      propertyName="The Grand Hotel"
      userProfile={{
        name: 'Theresa Webb',
        role: 'Front desk',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      }}
      reservationStatus={{
        label: 'Reservations',
        isConnected: true,
      }}
      contentPadding="none"
      contentBackground="#FAFAFA"
    >
      {children}
    </CanaryAppShell>
  );
}
