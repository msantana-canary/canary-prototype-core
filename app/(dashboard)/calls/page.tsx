'use client';

/**
 * Calls Dashboard Page
 *
 * Call history with filter tabs (Missed, Completed, Active) and detail modal.
 */

import { CallsNav } from '@/components/products/calls/CallsNav';
import { CallsView } from '@/components/products/calls/CallsView';

export default function CallsPage() {
  return (
    <div className="flex flex-col h-full">
      <CallsNav />
      <CallsView />
    </div>
  );
}
