'use client';

/**
 * Team Chat (SPIKE) — content-region root
 *
 * Owns the shell-level PUSH for variants B/C/E: pads the product by the panel width
 * so the product reflows into the narrower viewport by its OWN responsive rules
 * (SpikeRoot never knows which product is inside). Variants A/D are overlay → no push.
 *
 * The variant-C nav collapse (full-height icon rail + shell offset) is handled one
 * level up, in the dashboard layout — the rail must live in the sidebar's full-height
 * slot beside the header, not inside this content region.
 */

import { useSpikeStore, PANEL_WIDTH } from '@/lib/products/team-chat/spike-store';
import { TeamChatContainer } from './TeamChatContainer';
import { TeamChatDock } from './TeamChatDock';
import { TeamChatFullWorkspace } from './TeamChatFullWorkspace';
import { VariantSwitcher } from './VariantSwitcher';

export function TeamChatSpikeRoot({ children }: { children: React.ReactNode }) {
  const { variant, panelOpen } = useSpikeStore();
  const pushes = panelOpen && (variant === 'B' || variant === 'C' || variant === 'E');
  const isFloaty = variant === 'F'; // docked launcher + popups
  const isFull = variant === 'G'; // docked launcher + full-takeover workspace
  const pushesLeft = panelOpen && variant === 'H'; // left gutter, right of the nav

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="h-full w-full"
        style={{
          paddingLeft: pushesLeft ? PANEL_WIDTH : 0,
          paddingRight: pushes ? PANEL_WIDTH : 0,
          transition: 'padding 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {children}
      </div>

      {!isFloaty && !isFull && <TeamChatContainer />}
      {isFloaty && <TeamChatDock />}
      {isFull && <TeamChatFullWorkspace />}
      <VariantSwitcher />
    </div>
  );
}
