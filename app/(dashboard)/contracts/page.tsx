'use client';

/**
 * Contracts — not built in this branch.
 *
 * A real route rather than an unmapped nav item, so the click lands inside the
 * app shell instead of on Next's chrome-less 404. See
 * `components/core/PrototypeSurfacePlaceholder` for why the honest answer is a
 * page and not a no-op.
 */

import { PrototypeSurfacePlaceholder } from '@/components/core/PrototypeSurfacePlaceholder';

export default function ContractsPage() {
  return <PrototypeSurfacePlaceholder title="Contracts" />;
}
