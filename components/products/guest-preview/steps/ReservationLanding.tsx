'use client';

/**
 * ReservationLanding — First step of check-in flow
 *
 * Hotel hero image, Statler logo, welcome message,
 * reservation summary details.
 */

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { HOTEL_BRANDING, DEMO_GUEST, DEMO_RESERVATION } from '@/lib/products/guest-preview/mock-form-data';
import Image from 'next/image';

export function ReservationLanding() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const reservationHeader = useCheckInConfigStore((s) => s.reservationHeader);

  return (
    <div className="flex flex-col h-full">
      {/* Hero image */}
      <div className="relative w-full" style={{ height: 200 }}>
        <Image
          src={HOTEL_BRANDING.heroImage}
          alt={HOTEL_BRANDING.name}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Hotel logo overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <h1 className="text-white text-[22px] font-bold leading-tight">
              {HOTEL_BRANDING.name}
            </h1>
            <p className="text-white/80 text-[12px] mt-0.5">
              {HOTEL_BRANDING.address}
            </p>
          </div>
        </div>
      </div>

      {/* Welcome section */}
      <div className="px-6 pt-5 pb-4">
        <h2 className="text-[20px] font-semibold" style={{ color: theme.fontColor }}>
          Welcome, {DEMO_GUEST.firstName}!
        </h2>
        <p className="text-[14px] text-[#6b7280] mt-1">
          Complete your check-in to make your arrival seamless.
        </p>
      </div>

      {/* Reservation summary card */}
      <div className="mx-6 rounded-lg border border-[#e5e7eb] overflow-hidden" style={{ backgroundColor: theme.cardBackgroundColor }}>
        <div
          className="px-4 py-2.5 text-[12px] font-semibold text-white tracking-wide"
          style={{ backgroundColor: theme.primaryColor }}
        >
          RESERVATION DETAILS
        </div>
        <div className="px-4 py-3 space-y-2.5">
          <ReservationRow label="Confirmation" value={DEMO_RESERVATION.confirmationCode} />
          <ReservationRow label="Check-in" value={DEMO_RESERVATION.checkInDate} />
          <ReservationRow label="Check-out" value={DEMO_RESERVATION.checkOutDate} />
          <ReservationRow label="Duration" value={`${DEMO_RESERVATION.nights} night${DEMO_RESERVATION.nights > 1 ? 's' : ''}`} />
          {reservationHeader.roomNumber && DEMO_RESERVATION.roomNumber && (
            <ReservationRow label="Room" value={DEMO_RESERVATION.roomNumber} />
          )}
          {reservationHeader.roomType && DEMO_RESERVATION.roomType && (
            <ReservationRow label="Room Type" value={DEMO_RESERVATION.roomType} />
          )}
          {reservationHeader.estimatedTotal && (
            <ReservationRow
              label="Estimated Total"
              value={`$${DEMO_RESERVATION.estimatedTotal.toFixed(2)}`}
              isBold
            />
          )}
        </div>
      </div>

      {/* Spacer to push CTA down */}
      <div className="flex-1 min-h-4" />
    </div>
  );
}

function ReservationRow({
  label,
  value,
  isBold = false,
}: {
  label: string;
  value: string;
  isBold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[13px] text-[#6b7280]">{label}</span>
      <span className={`text-[13px] ${isBold ? 'font-semibold' : 'font-medium'} text-[#111827]`}>
        {value}
      </span>
    </div>
  );
}
