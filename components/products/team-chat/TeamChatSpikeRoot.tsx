'use client';

/**
 * Team Chat (SPIKE) — content-region root
 *
 * Owns the shell-level PUSH for variant B: pads the product by the panel width so
 * the product reflows into the narrower viewport by its OWN responsive rules
 * (SpikeRoot never knows which product is inside). Variant A is overlay → no push.
 */

import { useSpikeStore, PANEL_WIDTH } from '@/lib/products/team-chat/spike-store';
import { TeamChatContainer } from './TeamChatContainer';
import { VariantSwitcher } from './VariantSwitcher';
import { CollapsedNavRail, RAIL_WIDTH } from './CollapsedNavRail';

export function TeamChatSpikeRoot({ children }: { children: React.ReactNode }) {
  const { variant, panelOpen } = useSpikeStore();
  const pushes = panelOpen && (variant === 'B' || variant === 'C' || variant === 'E');
  const leftRail = panelOpen && variant === 'C'; // C: collapse nav to an icon rail

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="h-full w-full"
        style={{
          paddingRight: pushes ? PANEL_WIDTH : 0,
          paddingLeft: leftRail ? RAIL_WIDTH : 0,
          transition: 'padding 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {children}
      </div>

      {leftRail && <CollapsedNavRail />}
      <TeamChatContainer />
      <VariantSwitcher />
    </div>
  );
}
