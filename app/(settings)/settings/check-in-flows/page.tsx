'use client';

/**
 * Check-In Flows Page
 *
 * Settings page for configuring check-in flows. Delegates entirely to
 * ConfiguratorShell — the page file is a thin route wrapper.
 */

import { ConfiguratorShell } from '@/components/products/check-in-flows/ConfiguratorShell';

export default function CheckInFlowsPage() {
  return <ConfiguratorShell />;
}
