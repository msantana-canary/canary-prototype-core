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
  const { variant, panelOpen, panelExpanded } = useSpikeStore();
  const isFloat = variant === 'A' || variant === 'D';
  const isLeft = variant === 'H'; // slides in from the left, right of the nav

  return (
    <div
      className={`absolute inset-y-0 z-[55] bg-white ${isLeft ? 'left-0' : 'right-0'}`}
      style={{
        // Expanded = fill the content canvas (right of the nav) as a two-pane.
        width: panelExpanded ? '100%' : PANEL_WIDTH,
        transform: panelOpen ? 'translateX(0)' : isLeft ? 'translateX(-100%)' : 'translateX(100%)',
        transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1), width 240ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isFloat && panelOpen && !panelExpanded ? '0 0 28px rgba(16,24,40,0.18)' : undefined,
        borderLeft: panelExpanded || isFloat || isLeft ? undefined : '1px solid #E5E7EB',
        borderRight: !panelExpanded && isLeft ? '1px solid #E5E7EB' : undefined,
      }}
    >
      <TeamChatPanel />
    </div>
  );
}
