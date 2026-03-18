'use client';

/**
 * GuestJourneyToast
 *
 * Shared toast for all GJ save/delete actions.
 * Fixed bottom-center, blue bg, slide-up animation.
 * Same pattern as check-in and broadcast toasts.
 */

import { createPortal } from 'react-dom';
import { colors } from '@canary-ui/components';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';

export function GuestJourneyToast() {
  const toastMessage = useGuestJourneyStore((s) => s.toastMessage);

  if (!toastMessage || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed bottom-4 left-1/2 px-6 py-3 rounded-lg shadow-lg text-[14px] font-medium text-white z-[9999]"
      style={{
        backgroundColor: colors.colorBlueDark1,
        transform: 'translateX(-50%)',
        animation: 'toast-in 300ms ease-out',
      }}
    >
      {toastMessage}
    </div>,
    document.body
  );
}
