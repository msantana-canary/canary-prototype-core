'use client';

/**
 * ReservationLanding — First step matching Figma (node 5:1545)
 *
 * Layout (Figma):
 * - Photo: 0 → 638px (with gradient at bottom fading to gold)
 * - Gold band: 638px → 798px (160px)
 * - White card: floating centered, bottom edge ~158px from page bottom
 * - Gold fills everything below the photo
 */

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { HOTEL_BRANDING, DEMO_GUEST } from '@/lib/products/guest-preview/mock-form-data';
import Image from 'next/image';

export function ReservationLanding() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const goToNextStep = useCheckInConfigStore((s) => s.goToNextStep);

  return (
    <div
      className="relative flex flex-col"
      style={{ minHeight: '100%', backgroundColor: theme.primaryColor }}
    >
      {/* Hero photo section */}
      <div className="relative w-full" style={{ height: 500 }}>
        <Image
          src={HOTEL_BRANDING.heroImage}
          alt={HOTEL_BRANDING.name}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient: transparent → gold at bottom of photo */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: 126,
            background: `linear-gradient(to bottom, transparent 0%, ${theme.primaryColor} 100%)`,
          }}
        />
      </div>

      {/* Spacer to push card down — gold bg shows through */}
      <div className="flex-1" />

      {/* White card */}
      <div
        className="mx-6 rounded-lg flex flex-col items-center relative z-10"
        style={{
          marginTop: -180,
          marginBottom: 16,
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

        <h1 className="text-[28px] font-medium text-black leading-[42px] mt-6 text-center">
          Welcome, {DEMO_GUEST.firstName}
        </h1>

        <p className="text-[16px] text-black leading-[24px] text-center mt-2">
          Review your reservation and check-in now. It only takes 3 minutes.
        </p>

        <button
          onClick={goToNextStep}
          className="w-full h-[48px] flex items-center justify-center text-[18px] font-medium text-white rounded mt-6"
          style={{ backgroundColor: theme.primaryColor }}
        >
          Check in now
        </button>

        <span className="text-[12px] font-medium text-[#333] mt-4">
          Privacy Policy • Terms & Conditions
        </span>
      </div>
    </div>
  );
}
