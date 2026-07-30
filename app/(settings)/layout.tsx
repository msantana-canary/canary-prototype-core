'use client';

/**
 * Settings Layout — CanaryAppShellV2 (library v0.6.0)
 *
 * Same component as the dashboard, different skin: `SidebarVariant.SETTINGS`
 * swaps the navy rail for the dark one, hides Team Chat and the account footer,
 * and renders a back row driven by `sidebarBackLabel` + `onSidebarBack` (the V1
 * `sidebarTitle` + `sidebarBackButton` slot pair is gone — V2 owns that row).
 *
 * Sections come from `standardSettingsSidebarSectionsV2`, which already carries
 * Guest Journey / Messages / Calls under a titled "Product settings" group. We
 * add the two this prototype owns: Guest Segments and Knowledge Base.
 */

import { useRouter, usePathname } from 'next/navigation';
import { useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiAccountMultipleOutline, mdiCreation } from '@mdi/js';
import {
  CanaryAppShellV2,
  SidebarVariant,
  standardSettingsSidebarSectionsV2,
  addProduct,
  createSidebarTab,
} from '@canary-ui/components';

// Add "Guest Segments" to the property-level group
const withSegments = addProduct(
  standardSettingsSidebarSectionsV2,
  createSidebarTab('segments', 'Guest Segments', <Icon path={mdiAccountMultipleOutline} size={1} />),
  { sectionId: 'property-settings' }
);
// Add "Knowledge Base" to Product settings, next to Messages
const settingsSections = addProduct(
  withSegments,
  createSidebarTab('knowledge-base', 'Knowledge Base', <Icon path={mdiCreation} size={1} />),
  { sectionId: 'product-settings', insertAfter: 'messages' }
);

// Map settings sidebar item IDs to routes
const settingsRouteMap: Record<string, string> = {
  'guest-journey': '/settings/guest-journey',
  'segments': '/settings/segments',
  'knowledge-base': '/settings/knowledge-base',
  'calls': '/settings/calls',
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
    return routeItemMap[pathname] || '';
  }, [pathname]);

  const handleSidebarItemClick = (itemId: string) => {
    const route = settingsRouteMap[itemId];
    if (route) {
      router.push(route);
    }
  };

  return (
    <CanaryAppShellV2
      className="canary-shell-dvh"
      sidebarVariant={SidebarVariant.SETTINGS}
      sidebarSections={settingsSections}
      sidebarBackLabel="Back"
      onSidebarBack={() => router.push('/messages')}
      selectedSidebarItemId={selectedItemId}
      onSidebarItemClick={handleSidebarItemClick}
      property={{ name: 'Days Inn & Suites by Wyndham Wausau', code: '38653' }}
      // No pageTitle: the derived title is the nav label ("Guest Journey",
      // "Knowledge Base", …), which is exactly right. /settings redirects to
      // /settings/guest-journey, so the selection is never empty.
      reservationStatus={{ isConnected: true }}
      contentPadding="none"
      contentBackground="#FAFAFA"
    >
      {children}
    </CanaryAppShellV2>
  );
}
