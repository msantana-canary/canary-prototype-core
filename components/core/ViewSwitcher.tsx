'use client';

/**
 * ViewSwitcher — Floating pill widget for hotel ↔ guest navigation
 *
 * Renders on ALL pages via root layout.
 * Shows at bottom-right, fixed z-[9999].
 * Indicates which view you're on and navigates to the other.
 */

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@mdi/react';
import { mdiMonitorDashboard, mdiCellphoneLink } from '@mdi/js';

const HOTEL_ROUTES = ['/messages', '/check-in', '/checkout', '/calls', '/settings'];
const GUEST_ROUTES = ['/guest/check-in'];

export function ViewSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const isGuestView = GUEST_ROUTES.some((r) => pathname.startsWith(r));
  const isHotelView = HOTEL_ROUTES.some((r) => pathname.startsWith(r));

  // Only show in development — never on deployed Vercel site
  if (process.env.NODE_ENV !== 'development') return null;

  // Only show on hotel-facing or guest-facing pages (not on root /)
  if (!isGuestView && !isHotelView) return null;

  const handleToggle = () => {
    if (isGuestView) {
      router.push('/check-in');
    } else {
      router.push('/guest/check-in');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border transition-all hover:scale-105 active:scale-95"
      style={{
        backgroundColor: isGuestView ? '#1a1a2e' : 'white',
        borderColor: isGuestView ? '#2d2d44' : '#e5e7eb',
        color: isGuestView ? 'white' : '#374151',
      }}
    >
      <Icon
        path={isGuestView ? mdiMonitorDashboard : mdiCellphoneLink}
        size={0.7}
        color={isGuestView ? '#8b8ba3' : '#6b7280'}
      />
      <span className="text-[13px] font-medium">
        {isGuestView ? 'Hotel Dashboard' : 'Guest Preview'}
      </span>
    </button>
  );
}
