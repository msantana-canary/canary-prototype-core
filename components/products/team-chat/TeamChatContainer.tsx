'use client';

/**
 * Team Chat (SPIKE) — variant-aware container
 *
 * A right-anchored panel mounted as an absolutely-positioned sibling INSIDE the
 * dashboard content region (below header, right of sidebar). Same panel for both
 * variants; only the coexistence behavior differs:
 *   A — overlay : floats over the page (page untouched), drop shadow.
 *   B — gutter  : sits flush in the gutter SpikeRoot reserves; border-left, no shadow.
 */

import { useSpikeStore, PANEL_WIDTH } from '@/lib/products/team-chat/spike-store';
import { TeamChatPanel } from './TeamChatPanel';

export function TeamChatContainer() {
  const { variant, panelOpen } = useSpikeStore();
  const isFloat = variant === 'A' || variant === 'D';

  return (
    <div
      className="absolute inset-y-0 right-0 z-40 bg-white"
      style={{
        width: PANEL_WIDTH,
        transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isFloat && panelOpen ? '0 0 28px rgba(16,24,40,0.18)' : undefined,
        borderLeft: isFloat ? undefined : '1px solid #E5E7EB',
      }}
    >
      <TeamChatPanel />
    </div>
  );
}
