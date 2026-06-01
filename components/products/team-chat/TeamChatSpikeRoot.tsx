'use client';

/**
 * Team Chat (SPIKE) — content-region root
 *
 * Wraps the product page (children) inside the dashboard content area and owns
 * the PUSH behavior: for variants B/C it pads the page by the panel width so the
 * page reflows into the remaining space; the panel itself sits in that gutter.
 * For A (overlay) and D (footer) the page is untouched and the panel floats.
 */

import { useSpikeStore } from '@/lib/products/team-chat/spike-store';
import { TeamChatContainer } from './TeamChatContainer';
import { VariantSwitcher } from './VariantSwitcher';

export function TeamChatSpikeRoot({ children }: { children: React.ReactNode }) {
  const { variant, panelOpen, panelWidth } = useSpikeStore();
  const pushes = panelOpen && (variant === 'B' || variant === 'C');

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="h-full w-full"
        style={{
          paddingRight: pushes ? panelWidth : 0,
          transition: 'padding-right 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {children}
      </div>

      <TeamChatContainer />
      <VariantSwitcher />
    </div>
  );
}
