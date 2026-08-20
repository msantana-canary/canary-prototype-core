/**
 * ReservationResultRow — the pick-a-reservation row.
 *
 * ONE row, TWO pages: "Link reservation" (search the property, attach a stay to
 * this conversation) and "Set primary guest" (choose which of the people on this
 * phone number the panel puts in the spotlight). The two pages ask a hotelier to
 * do the same physical thing — read five facts about a stay and pick the right
 * one — so they get the same row rather than two that differ by accident.
 *
 * THE FIVE FACTS, in this order: name + lifecycle · phone · confirmation code ·
 * dates · room. Name first because that's what you were told; dates and room
 * last because those are what you confirm against once you think you've found
 * it. Selection is a blue tint plus a check — the tint alone is easy to miss on
 * a light row, and the check alone is easy to miss in a list of five.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiBedOutline, mdiCalendarBlankOutline, mdiPhoneOutline, mdiPound } from '@mdi/js';
import { LifecycleTag, SelectedCheck } from './panel-ui';
import { formatStayRangeCompact } from './panel-format';
import { LinkedReservation } from '@/lib/products/messaging/types';

function Fact({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 min-w-0">
      <Icon path={path} size={0.6} color={colors.colorBlack3} />
      <span
        className="truncate font-['Roboto',sans-serif] text-[13px] leading-[20px]"
        style={{ color: colors.colorBlack3 }}
      >
        {children}
      </span>
    </span>
  );
}

export function ReservationResultRow({
  lr,
  isSelected,
  onSelect,
}: {
  lr: LinkedReservation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { reservation, guest } = lr;
  return (
    <button
      onClick={onSelect}
      aria-pressed={isSelected}
      className="w-full flex items-center gap-2 text-left transition-colors"
      style={{
        padding: '12px 16px',
        backgroundColor: isSelected ? colors.colorBlueDark5 : 'transparent',
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="truncate font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
            style={{ color: colors.colorBlack1 }}
          >
            {guest.name}
          </span>
          <LifecycleTag status={reservation.status} />
        </div>
        <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 2 }}>
          {guest.phone && <Fact path={mdiPhoneOutline}>{guest.phone}</Fact>}
          <Fact path={mdiPound}>{reservation.confirmationCode}</Fact>
          <Fact path={mdiCalendarBlankOutline}>
            {formatStayRangeCompact(reservation.checkInDate, reservation.checkOutDate)}
          </Fact>
          {reservation.room && <Fact path={mdiBedOutline}>{reservation.room}</Fact>}
        </div>
      </div>
      {isSelected && <SelectedCheck />}
    </button>
  );
}
