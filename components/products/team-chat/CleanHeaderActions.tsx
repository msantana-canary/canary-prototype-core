'use client';

/**
 * Team Chat (SPIKE) — clean-header right cluster  [header-treatment toggle]
 *
 * The "after" for SJ's pill-treatment objection, independent of the A–E container
 * variants. Reorders the header's right cluster to **Reservations → Team Chat → avatar**
 * (Team differentiated and to the right of Reservations) and shrinks the account button
 * to just the avatar. Rendered through the AppShell's `headerActions` slot with the
 * library's own Reservations/account slots suppressed (see the dashboard layout), so the
 * lib's `flex items-center gap-2` header wrapper spaces these three for us.
 *
 * The Reservations pill mirrors CanaryPageHeader's own markup + tokens exactly.
 * (Our spike header has no $500 referral pill, so the order is the 3 items Miguel called.)
 */

import Icon from '@mdi/react';
import { mdiCheckCircleOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { TeamChatPill } from './TeamChatPill';

const AVATAR_URL = 'https://i.pravatar.cc/150?img=5'; // matches the layout's userProfile (Theresa Webb)

export function CleanHeaderActions() {
  return (
    <>
      {/* Reservations — same treatment as CanaryPageHeader's reservationStatus pill */}
      <button
        className="flex items-center gap-2 rounded-full pl-2 pr-4 py-1 transition-opacity hover:opacity-80"
        style={{ backgroundColor: colors.colorLightGreen5, cursor: 'default' }}
      >
        <Icon path={mdiCheckCircleOutline} size={1} color={colors.colorLightGreen1} style={{ opacity: 0.5 }} />
        <span className="text-[14px]" style={{ color: colors.colorBlack1 }}>
          Reservations
        </span>
      </button>

      {/* Team Chat — the approved pill, now to the right of Reservations */}
      <TeamChatPill />

      {/* Account — reduced to just the avatar */}
      <button
        className="overflow-hidden rounded-full transition-opacity hover:opacity-80"
        style={{ cursor: 'default' }}
        title="Theresa Webb"
      >
        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
          <img src={AVATAR_URL} alt="Theresa Webb" className="h-full w-full object-cover" />
        </div>
      </button>
    </>
  );
}
