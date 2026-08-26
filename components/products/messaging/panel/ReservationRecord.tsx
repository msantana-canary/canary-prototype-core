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
import { CopyIcon, DetailRow, DetailRows, OpenRecordIcon } from './panel-ui';
import { formatStayRangeRecord } from './panel-format';
import { getGjRowStatus } from '@/lib/products/messaging/guest-journey-link';
import { Reservation } from '@/lib/core/types/reservation';
import { Guest } from '@/lib/core/types/guest';
import { formatPhoneForDisplay } from '@/lib/products/messaging/phone';

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
    // One phone register across the panel (QA-2) — see `phone.ts`.
    { label: 'Phone', value: guest.phone ? formatPhoneForDisplay(guest.phone) : 'No number assigned' },
    { label: 'Email', value: guest.email ?? 'No email assigned' },
    { label: 'Room', value: reservation.room ?? '—' },
    {
      label: 'Confirmation number',
      value: reservation.confirmationCode,
      trailing: <CopyIcon value={reservation.confirmationCode} label="Copy confirmation number" />,
    },
    {
      label: 'Pre-arrival Check-in',
      // Production's plain register (2026-08-26 ruling): the status word is a
      // plain non-interactive value, in the same visual register as
      // Confirmation number's — never a link. The only click is the trailing
      // open icon, and only when a record actually exists to open.
      value: reservation.checkInStatus ?? 'Not Started',
      trailing:
        reservation.checkInStatus === 'Submitted' || reservation.checkInStatus === 'Completed'
          ? <OpenRecordIcon label="Open check-in record" />
          : undefined,
    },
    {
      label: 'Checkout',
      value: reservation.checkOutStatus ?? '—',
      trailing:
        reservation.checkOutStatus === 'Submitted' || reservation.checkOutStatus === 'Completed'
          ? <OpenRecordIcon label="Open checkout record" />
          : undefined,
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
