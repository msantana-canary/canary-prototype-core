'use client';

/**
 * Team Chat (SPIKE) — CollapsedNavRail
 *
 * Variant C's real form: the main nav collapsed to a narrow icon rail (structure
 * lifted from the vaporware), so opening team chat reclaims the nav's width
 * instead of hiding it outright. Shown (with AppShell sidebar hidden) when C + open.
 */

import { useRouter, usePathname } from 'next/navigation';
import Icon from '@mdi/react';
import {
  mdiTagOutline,
  mdiBedOutline,
  mdiViewGridOutline,
  mdiMessageTextOutline,
  mdiPhoneOutline,
  mdiCogOutline,
} from '@mdi/js';

export const RAIL_WIDTH = 60;

const NAV = [
  { label: 'Upsells', route: '/upsells', icon: mdiTagOutline },
  { label: 'Check-in', route: '/check-in', icon: mdiBedOutline },
  { label: 'Checkout', route: '/checkout', icon: mdiViewGridOutline },
  { label: 'Messages', route: '/messages', icon: mdiMessageTextOutline },
  { label: 'Calls', route: '/calls', icon: mdiPhoneOutline },
];

export function CollapsedNavRail() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="absolute inset-y-0 left-0 z-40 flex flex-col items-center py-3"
      style={{ width: RAIL_WIDTH, backgroundColor: '#1E335A' }}
    >
      {/* Logo mark */}
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
        <span className="text-[15px] font-bold text-white">C</span>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1">
        {NAV.map((item) => {
          const active = pathname === item.route;
          return (
            <button
              key={item.route}
              onClick={() => router.push(item.route)}
              title={item.label}
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
              style={{ backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent' }}
            >
              <Icon path={item.icon} size={0.9} color={active ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
            </button>
          );
        })}
      </div>

      <button
        title="Settings"
        onClick={() => router.push('/settings')}
        className="flex h-10 w-10 items-center justify-center rounded-lg"
      >
        <Icon path={mdiCogOutline} size={0.9} color="rgba(255,255,255,0.7)" />
      </button>
    </div>
  );
}
