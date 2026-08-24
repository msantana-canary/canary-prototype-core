/**
 * ReservationRecord — production's COMPLETE reservation-details block.
 *
 * One anatomy, THREE homes: the root's "Current Reservation" band (behind the
 * Show/Hide expander), each expanded row of the Reservations drill-in, and —
 * since the 2026-08-21 review — each expanded companion row in Linked
 * Reservations. They are the same seven facts about the same object, so they are
 * the same component; the panel is a verification aid, and a verification aid
 * whose fields move between screens makes you check twice.
 *
 * `onOpenScheduledMessages` adds the eighth row, "Guest Scheduled Messages",
 * which the root band does not carry: at root there is exactly one reservation
 * in view and its journey lives one level down, while everywhere the record is
 * PER-STAY the row is the only place a failed send is attributable to a
 * particular stay — a companion's included, which is new. That row goes RED —
 * the panel's loudest state, because "something didn't reach the guest" is the
 * #1 triage signal.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';
import { CopyIcon, DetailRow, DetailRows } from './panel-ui';
import { formatStayRangeRecord } from './panel-format';
import { getGjRowStatus } from '@/lib/products/messaging/guest-journey-link';
import { Reservation } from '@/lib/core/types/reservation';
import { Guest } from '@/lib/core/types/guest';

export function ReservationRecord({
  reservation,
  guest,
  onOpenScheduledMessages,
}: {
  reservation: Reservation;
  guest: Guest;
  onOpenScheduledMessages?: () => void;
}) {
  const rows: DetailRow[] = [
    { label: 'Dates', value: formatStayRangeRecord(reservation.checkInDate, reservation.checkOutDate) },
    { label: 'Phone', value: guest.phone ?? 'No number assigned' },
    { label: 'Email', value: guest.email ?? 'No email assigned' },
    { label: 'Room', value: reservation.room ?? '—' },
    {
      label: 'Confirmation number',
      value: reservation.confirmationCode,
      trailing: <CopyIcon value={reservation.confirmationCode} label="Copy confirmation number" />,
    },
    {
      label: 'Pre-arrival Check-in',
      value: reservation.checkInStatus ?? 'Not Started',
      // "Submitted" reads as a jump — it's a record you can go and look at.
      isLink: reservation.checkInStatus === 'Submitted' || reservation.checkInStatus === 'Completed',
    },
    {
      label: 'Checkout',
      value: reservation.checkOutStatus ?? '—',
      isLink: reservation.checkOutStatus === 'Submitted' || reservation.checkOutStatus === 'Completed',
    },
  ];

  if (onOpenScheduledMessages) {
    const gj = getGjRowStatus(reservation.id);
    rows.push({
      label: 'Guest Scheduled Messages',
      value: gj.label,
      isError: gj.isError,
      isLink: !gj.isError,
      onClick: onOpenScheduledMessages,
      trailing: (
        <Icon
          path={mdiChevronRight}
          size={0.7}
          color={gj.isError ? colors.colorRed1 : colors.colorBlueDark1}
        />
      ),
    });
  }

  return <DetailRows rows={rows} />;
}
