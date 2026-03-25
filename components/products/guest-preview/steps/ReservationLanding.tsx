'use client';

/**
 * ReservationLanding — First step matching Figma (node 5:1545)
 *
 * Layout:
 * - Full-bleed hotel photo (~65% height) with gradient to gold at bottom
 * - Gold band below
 * - White floating card overlapping both: Statler logo, "Welcome, Emily",
 *   description, "Check in now" button, Privacy Policy link
 *
 * The CTA button and footer are rendered HERE (not by parent CheckInFlow)
 * because the landing has a unique layout.
 */

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { HOTEL_BRANDING, DEMO_GUEST } from '@/lib/products/guest-preview/mock-form-data';
import Image from 'next/image';

export function ReservationLanding() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const goToNextStep = useCheckInConfigStore((s) => s.goToNextStep);

  return (
    <div className="relative flex flex-col" style={{ minHeight: '100%' }}>
      {/* Hero photo — takes ~65% of viewport */}
      <div className="relative w-full" style={{ height: '65%', minHeight: 400 }}>
        <Image
          src={HOTEL_BRANDING.heroImage}
          alt={HOTEL_BRANDING.name}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay: transparent → gold at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: 126,
            background: `linear-gradient(to bottom, rgba(146,110,39,0) 0%, ${theme.primaryColor} 100%)`,
          }}
        />
      </div>

      {/* Gold band */}
      <div className="w-full" style={{ height: 160, backgroundColor: theme.primaryColor }} />

      {/* Floating white card — positioned to overlap photo and gold band */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center rounded-lg"
        style={{
          width: 382,
          bottom: 24,
          padding: 24,
          backgroundColor: '#fafafa',
          boxShadow: '0px 12px 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Hotel logo */}
        <div className="relative" style={{ width: 150, height: 70 }}>
          <Image
            src={HOTEL_BRANDING.logo}
            alt={`${HOTEL_BRANDING.name} logo`}
            fill
            className="object-contain"
          />
        </div>

        {/* Welcome text */}
        <h1 className="text-[28px] font-medium text-black leading-[42px] mt-6 text-center">
          Welcome, {DEMO_GUEST.firstName}
        </h1>

        <p className="text-[16px] text-black leading-[24px] text-center mt-2">
          Review your reservation and check-in now. It only takes 3 minutes.
        </p>

        {/* CTA button */}
        <button
          onClick={goToNextStep}
          className="w-full h-[48px] flex items-center justify-center text-[18px] font-medium text-white rounded mt-6"
          style={{ backgroundColor: theme.primaryColor }}
        >
          Check in now
        </button>

        {/* Privacy */}
        <span className="text-[12px] font-medium text-[#333] mt-4">
          Privacy Policy • Terms & Conditions
        </span>
      </div>
    </div>
  );
}
