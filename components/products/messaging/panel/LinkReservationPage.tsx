/**
 * LinkReservationPage — search the property, attach a stay to this conversation.
 *
 * This used to be a MODAL over the whole app. It is a page inside the panel now,
 * and that is not just a relocation: a modal said "stop what you're doing", but
 * linking a reservation is a step INSIDE reading a conversation — you're looking
 * at the guest's details, you notice the stay is missing, you add it, you carry
 * on. Same back arrow, same X, same panel.
 *
 * LIVE RESULTS at ≥2 characters. No search button: with a bounded property-sized
 * dataset there is nothing to wait for, and a button would add a step to a task
 * whose whole point is speed at the desk.
 *
 * ⚠ ARRIVAL DATE is drawn but inert — it filters nothing. The frame gives it a
 * calendar field; wiring a real date filter to a mock of ~120 reservations would
 * mostly demonstrate empty results. Logged as a stub, not forgotten.
 *
 * It is a REAL `CanaryInput` now, held inert with `isReadonly`, rather than a
 * div that copied an input's geometry by hand. A stub is still a control, and a
 * hand-drawn one is a control that can silently stop matching the real field
 * beside it — which is exactly what had happened: this div drew a `colorBlack5`
 * border where the Guest Name input beside it draws the library's `colorBlack3`.
 * Both fields now come from the same component and cannot disagree again.
 *
 * TWO OVERRIDES, and the second is a library BUG rather than a Figma delta.
 * `!bg-white` is the delta: `isReadonly` paints the field `colorBlack8`
 * (#FAFAFA) where the frame draws it white. `!pl-10` is the bug — `CanaryInput`
 * insets its text for a `leftAddon` by putting a `pl-10` class on the input,
 * but `pl-10` is not in the library's compiled `dist/styles.css` and nothing in
 * our source emits it, so the rule simply does not exist and the size ramp's
 * own `px-2` (8px) stands: the addon glyph lands ON TOP of the placeholder.
 * Writing `!pl-10` here makes our own Tailwind build emit the utility. Logged
 * as a library ask — ship `pl-10` / `pr-10` with the component that needs them.
 *
 * COMPANIONS, NOT SELF. A committed link becomes a companion row in Linked
 * Reservations, which is where the flow returns you.
 */

'use client';

import React, { useMemo, useState } from 'react';
import { colors, CanaryInput, InputSize, InputType } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiCalendarBlankOutline } from '@mdi/js';
import { EmptyState, PanelFooterAction, PanelHeader, RowList, PANEL_PAD } from './panel-ui';
import { ReservationResultRow } from './ReservationResultRow';
import { reservationList } from '@/lib/core/data/reservations';
import { guests } from '@/lib/core/data/guests';
import { LinkedReservation } from '@/lib/products/messaging/types';

const MIN_QUERY = 2;

export function LinkReservationPage({
  contactNumber,
  alreadyLinkedIds,
  onBack,
  onClose,
  onLink,
}: {
  contactNumber: string;
  alreadyLinkedIds: string[];
  onBack: () => void;
  onClose: () => void;
  onLink: (reservationId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results: LinkedReservation[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < MIN_QUERY) return [];
    return reservationList
      .filter((res) => {
        if (alreadyLinkedIds.includes(res.id)) return false;
        if (res.status === 'cancelled' || res.status === 'no-show') return false;
        const guest = guests[res.guestId];
        return !!guest && guest.name.toLowerCase().includes(q);
      })
      .slice(0, 12)
      .map((res) => ({
        reservation: res,
        guest: guests[res.guestId]!,
        isAutoLinked: guests[res.guestId]?.phone === contactNumber,
      }));
  }, [query, alreadyLinkedIds, contactNumber]);

  const hasSearched = query.trim().length >= MIN_QUERY;

  return (
    <div className="w-full h-full shrink-0 flex flex-col min-h-0">
      <PanelHeader title="Link reservation" onBack={onBack} onClose={onClose} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
        <div style={{ padding: PANEL_PAD, borderBottom: `1px solid ${colors.colorBlack6}` }}>
          <p
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
            style={{ color: colors.colorBlack1, marginBottom: 16 }}
          >
            Link a reservation to this conversation for additional context. Messages will continue
            going to the contact number.
          </p>

          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <CanaryInput
                label="Guest Name"
                type={InputType.TEXT}
                size={InputSize.NORMAL}
                placeholder="Search Guest"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedId(null);
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              {/* Drawn, inert — see the header note. `isReadonly` is what keeps
                  it inert while leaving it looking like the live field beside
                  it; `aria-label` rides the rest-prop spread onto the input,
                  since the library's `label` element carries no `htmlFor`. */}
              <CanaryInput
                label="Arrival Date"
                type={InputType.TEXT}
                size={InputSize.NORMAL}
                isReadonly
                placeholder="MM/DD/YYYY"
                aria-label="Arrival Date"
                className="!bg-white !pl-10"
                leftAddon={
                  <Icon path={mdiCalendarBlankOutline} size={0.75} color={colors.colorBlack3} />
                }
              />
            </div>
          </div>
        </div>

        {hasSearched && (
          <div style={{ padding: PANEL_PAD }}>
            {results.length === 0 ? (
              <EmptyState label="No reservations found" />
            ) : (
              <RowList>
                {results.map((lr) => (
                  <ReservationResultRow
                    key={lr.reservation.id}
                    lr={lr}
                    isSelected={selectedId === lr.reservation.id}
                    onSelect={() => setSelectedId(lr.reservation.id)}
                  />
                ))}
              </RowList>
            )}
          </div>
        )}
      </div>

      <PanelFooterAction
        label="Link Reservation"
        disabled={!selectedId}
        onClick={() => {
          if (selectedId) onLink(selectedId);
        }}
      />
    </div>
  );
}
