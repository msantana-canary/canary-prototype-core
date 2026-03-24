'use client';

/**
 * IDVerification — OCR consent + scanning mockup
 *
 * Simplified to match the overall Figma visual style.
 * Shows consent screen, then simulated scanning, then complete.
 */

import React, { useState } from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import Icon from '@mdi/react';
import { mdiShieldCheckOutline, mdiCheckCircleOutline, mdiCameraOutline } from '@mdi/js';

type VerificationState = 'consent' | 'scanning' | 'complete';

export function IDVerification() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const [state, setState] = useState<VerificationState>('consent');

  if (state === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 gap-4 text-center">
        <Icon path={mdiCheckCircleOutline} size={2.5} color="#22c55e" />
        <h2 className="text-[24px] font-medium" style={{ color: theme.primaryColor }}>
          Verification complete
        </h2>
        <p className="text-[18px] text-[#666] leading-[28px]">
          Your identity has been verified successfully.
        </p>
      </div>
    );
  }

  if (state === 'scanning') {
    return (
      <div className="flex flex-col items-center gap-6 px-6 pt-8 pb-6">
        <p className="text-[18px] text-black leading-[28px] text-center">
          Position your ID within the frame
        </p>
        {/* Viewfinder */}
        <div
          className="w-full rounded-lg flex flex-col items-center justify-center gap-8"
          style={{
            aspectRatio: '3/4',
            backgroundColor: `${theme.primaryColor}1A`,
            border: `1px solid ${theme.primaryColor}1A`,
          }}
        >
          {/* Frame corners */}
          <div className="relative w-48 h-32">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 rounded-tl" style={{ borderColor: theme.primaryColor }} />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 rounded-tr" style={{ borderColor: theme.primaryColor }} />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 rounded-bl" style={{ borderColor: theme.primaryColor }} />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 rounded-br" style={{ borderColor: theme.primaryColor }} />
          </div>
          <Icon path={mdiCameraOutline} size={1.2} color={theme.primaryColor} />
        </div>
        <button
          onClick={() => setState('complete')}
          className="w-full h-[48px] flex items-center justify-center text-[18px] font-medium text-white"
          style={{ backgroundColor: theme.primaryColor }}
        >
          Capture
        </button>
      </div>
    );
  }

  // Consent
  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Icon path={mdiShieldCheckOutline} size={2} color={theme.primaryColor} />
        <h2 className="text-[24px] font-semibold text-black leading-[36px]">
          Identity Verification
        </h2>
        <p className="text-[18px] text-black leading-[28px]">
          For your security, we use advanced OCR technology to verify your identity from your government-issued ID.
        </p>
      </div>

      <div className="flex flex-col gap-3 text-[18px] text-black leading-[28px]">
        <p>What to expect:</p>
        <ul className="list-disc pl-6 space-y-1 text-[16px] text-[#666]">
          <li>Take a photo of your ID</li>
          <li>Details extracted automatically</li>
          <li>Quick selfie for face matching</li>
          <li>~30 seconds total</li>
        </ul>
      </div>

      <p className="text-[14px] text-[#666] leading-[22px]">
        By continuing, you consent to the collection and processing of your biometric data for identity verification.
      </p>

      <button
        onClick={() => setState('scanning')}
        className="w-full h-[48px] flex items-center justify-center text-[18px] font-medium text-white"
        style={{ backgroundColor: theme.primaryColor }}
      >
        Begin Verification
      </button>
    </div>
  );
}
