/**
 * EmailSurface
 *
 * The Email page content: the search + New-message CTA row over a two-column
 * body (thread list | thread view). Search is functional (filters the list
 * via the store); New message is a no-op in Phase 1.
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { useEmailStore } from '@/lib/products/email/store';
import { EmailThreadList } from './EmailThreadList';
import { EmailThreadView } from './EmailThreadView';
import { EmailInfoSidebar } from './EmailInfoSidebar';
import { PrototypeVariantToggle } from './PrototypeVariantToggle';

export function EmailSurface() {
  const searchQuery = useEmailStore((s) => s.searchQuery);
  const setSearch = useEmailStore((s) => s.setSearch);

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ backgroundColor: colors.colorBlack8 }}>
      {/* Search + CTA row */}
      <div
        className="flex items-center gap-3 shrink-0"
        style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16 }}
      >
        {/* Search field */}
        <div
          className="flex-1 flex items-center gap-2 rounded-[6px]"
          style={{
            backgroundColor: colors.colorWhite,
            border: `1px solid ${colors.colorBlack5}`,
            paddingLeft: 8,
            paddingRight: 16,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          <Icon path={mdiMagnify} size={0.83} color={colors.colorBlack3} />
          <input
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="flex-1 border-0 outline-none bg-transparent font-['Roboto',sans-serif] text-[14px] placeholder:text-[#666666]"
            style={{ color: colors.colorBlack1 }}
          />
        </div>

        {/* New message compose is OUT of MVP (7/16 eng sync) — removed from this
            baseline branch entirely; it returns on the AI-features fork. */}
      </div>

      {/* Body */}
      <div className="flex flex-1 gap-4 min-h-0" style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 24 }}>
        <EmailThreadList />
        <EmailThreadView />
        {/* Info panel — always mounted; renders as a push column only while open,
            or as a fixed slide-in drawer (Messaging's mechanic — always in the
            tree so the translate-x slide animates). Style chosen in the panel. */}
        <EmailInfoSidebar />
      </div>

      {/* Decide-in-the-room control: Push column vs Messaging-style drawer. */}
      <PrototypeVariantToggle />
    </div>
  );
}
