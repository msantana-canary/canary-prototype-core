'use client';

/**
 * IDVerification — OCR consent + Incode iframe mockup + selfie
 *
 * This step appears when OCR is enabled (idWithOCR = true).
 * Shows a consent screen, then a simulated verification iframe.
 */

import React, { useState } from 'react';
import { CanaryButton, ButtonType, ButtonSize } from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import Icon from '@mdi/react';
import { mdiShieldCheckOutline, mdiAccountCheckOutline, mdiCameraOutline } from '@mdi/js';

type VerificationState = 'consent' | 'scanning' | 'complete';

export function IDVerification() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const [state, setState] = useState<VerificationState>('consent');

  if (state === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#f0fdf4' }}
        >
          <Icon path={mdiAccountCheckOutline} size={1.8} color="#22c55e" />
        </div>
        <h2 className="text-[18px] font-semibold" style={{ color: theme.fontColor }}>
          Verification Complete
        </h2>
        <p className="text-[13px] text-[#6b7280] max-w-[280px]">
          Your identity has been verified successfully. You can proceed to the next step.
        </p>
      </div>
    );
  }

  if (state === 'scanning') {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <h2 className="text-[18px] font-semibold" style={{ color: theme.fontColor }}>
          Scan Your ID
        </h2>
        {/* Simulated Incode iframe */}
        <div className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-[#d1d5db] bg-[#fafafa] flex flex-col items-center justify-center gap-4">
          <div className="relative">
            {/* Viewfinder frame */}
            <div className="w-48 h-32 border-2 rounded-lg relative" style={{ borderColor: theme.primaryColor }}>
              {/* Corner markers */}
              <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 rounded-tl" style={{ borderColor: theme.primaryColor }} />
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 rounded-tr" style={{ borderColor: theme.primaryColor }} />
              <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 rounded-bl" style={{ borderColor: theme.primaryColor }} />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 rounded-br" style={{ borderColor: theme.primaryColor }} />
            </div>
          </div>
          <p className="text-[13px] text-[#6b7280]">
            Position your ID within the frame
          </p>
          <Icon path={mdiCameraOutline} size={1} color="#9ca3af" />
        </div>
        <CanaryButton
          type={ButtonType.PRIMARY}
          size={ButtonSize.LARGE}
          isExpanded
          onClick={() => setState('complete')}
        >
          Simulate Capture
        </CanaryButton>
      </div>
    );
  }

  // Consent state
  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${theme.primaryColor}15` }}
        >
          <Icon path={mdiShieldCheckOutline} size={1.4} color={theme.primaryColor} />
        </div>
        <h2 className="text-[18px] font-semibold" style={{ color: theme.fontColor }}>
          Identity Verification
        </h2>
        <p className="text-[13px] text-[#6b7280] max-w-[300px]">
          For your security, we need to verify your identity using your government-issued ID. This process uses advanced OCR technology to extract and validate your information.
        </p>
      </div>

      <div className="rounded-lg border border-[#e5e7eb] p-4 mb-4" style={{ backgroundColor: theme.cardBackgroundColor }}>
        <h3 className="text-[14px] font-medium text-[#374151] mb-3">What to expect:</h3>
        <ul className="space-y-2">
          <ConsentItem text="Take a photo of your government ID" />
          <ConsentItem text="We'll extract your details automatically" />
          <ConsentItem text="Take a quick selfie for face matching" />
          <ConsentItem text="Verification takes about 30 seconds" />
        </ul>
      </div>

      <div className="p-3 bg-[#f9fafb] rounded border border-[#e5e7eb] text-[12px] text-[#6b7280]">
        By continuing, you consent to the collection and processing of your biometric data for identity verification purposes. Your data will be securely processed and deleted after verification.
      </div>

      <div className="mt-4">
        <CanaryButton
          type={ButtonType.PRIMARY}
          size={ButtonSize.LARGE}
          isExpanded
          onClick={() => setState('scanning')}
        >
          Begin Verification
        </CanaryButton>
      </div>
    </div>
  );
}

function ConsentItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <div className="w-5 h-5 rounded-full bg-[#eff6ff] flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[10px] font-bold text-[#3b82f6]">✓</span>
      </div>
      <span className="text-[13px] text-[#4b5563]">{text}</span>
    </li>
  );
}
