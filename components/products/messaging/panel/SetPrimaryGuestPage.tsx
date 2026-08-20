/**
 * SetPrimaryGuestPage — choose who the panel is about.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠ A SPOTLIGHT, NOT A LINK (decision log: "Primary Is a Spotlight, Not a Link")
 * ═══════════════════════════════════════════════════════════════════════════
 * Committing here writes ONE thing: a per-thread DISPLAY preference. It links
 * nothing, unlinks nothing, and touches no reservation. Every reservation on
 * this list is already attached to the thread — they auto-linked because their
 * guest's phone number IS this conversation's number.
 *
 * The problem it solves is that a phone number is not a person. When a family
 * books three rooms on one mobile, Canary can see three reservations and one
 * number, and it cannot know which of the three humans is holding the phone.
 * Nothing in the data will ever tell it. So the panel asks the one party who
 * does know — the person at the desk having the conversation — and remembers
 * the answer for this thread.
 *
 * Everything downstream re-indexes off that answer: the profile header, the
 * Current Reservation band, the "{First}'s Reservations" count and drill-in,
 * and the companion list (whoever is NOT the primary).
 *
 * Helper copy is the frame's, verbatim. Its register is on the fix-in-post list
 * — it explains the mechanism where it could just give the instruction — but
 * copy edits are Miguel's call, not the implementation's.
 */

'use client';

import React, { useState } from 'react';
import { colors } from '@canary-ui/components';
import { EmptyState, PanelFooterAction, PanelHeader, RowDivider, RowList, PANEL_PAD } from './panel-ui';
import { ReservationResultRow } from './ReservationResultRow';
import { LinkedReservation } from '@/lib/products/messaging/types';

export function SetPrimaryGuestPage({
  candidates,
  currentPrimaryId,
  onBack,
  onClose,
  onSetPrimary,
}: {
  candidates: LinkedReservation[];
  currentPrimaryId?: string;
  onBack: () => void;
  onClose: () => void;
  onSetPrimary: (reservationId: string) => void;
}) {
  // Opens ON the current spotlight, the way a select opens on its value.
  const [selectedId, setSelectedId] = useState<string | null>(currentPrimaryId ?? null);

  return (
    <div className="w-full h-full shrink-0 flex flex-col min-h-0">
      <PanelHeader title="Set primary guest" onBack={onBack} onClose={onClose} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
        <div style={{ padding: PANEL_PAD, borderBottom: `1px solid ${colors.colorBlack6}` }}>
          <p
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
            style={{ color: colors.colorBlack1 }}
          >
            Select a reservation from below to set as the primary person for this thread. All guests
            below carry the same phone number as this conversation so set the primary to whoever
            you&apos;re speaking to.
          </p>
        </div>

        <div style={{ padding: PANEL_PAD }}>
          {candidates.length === 0 ? (
            <EmptyState label="No reservations on this number" />
          ) : (
            <RowList>
              {candidates.map((lr, i) => (
                <React.Fragment key={lr.reservation.id}>
                  <RowDivider isFirst={i === 0} />
                  <ReservationResultRow
                    lr={lr}
                    isSelected={selectedId === lr.reservation.id}
                    onSelect={() => setSelectedId(lr.reservation.id)}
                  />
                </React.Fragment>
              ))}
            </RowList>
          )}
        </div>
      </div>

      <PanelFooterAction
        label="Set as primary"
        disabled={!selectedId}
        onClick={() => {
          if (selectedId) onSetPrimary(selectedId);
        }}
      />
    </div>
  );
}
