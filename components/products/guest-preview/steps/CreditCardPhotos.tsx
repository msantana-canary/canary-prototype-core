'use client';

/**
 * CreditCardPhotos — Card photo capture matching Figma style
 */

import React, { useState } from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import Icon from '@mdi/react';
import { mdiCameraOutline, mdiCheckCircleOutline } from '@mdi/js';

export function CreditCardPhotos() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const [captured, setCaptured] = useState(false);

  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-6">
      <p className="text-[18px] text-black leading-[28px]">
        Please take a photo of the front of your credit card for verification.
      </p>

      {captured ? (
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-full rounded-lg flex flex-col items-center justify-center gap-2"
            style={{ aspectRatio: '16/10', backgroundColor: '#f0fdf4', border: '1px solid #22c55e' }}
          >
            <Icon path={mdiCheckCircleOutline} size={1.5} color="#22c55e" />
            <span className="text-[16px] font-medium text-[#166534]">Photo captured</span>
          </div>
          <button
            onClick={() => setCaptured(false)}
            className="text-[14px] font-medium"
            style={{ color: theme.primaryColor }}
          >
            Retake
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCaptured(true)}
          className="w-full rounded-lg flex flex-col items-center justify-center gap-8 cursor-pointer"
          style={{
            aspectRatio: '16/10',
            backgroundColor: `${theme.primaryColor}1A`,
            border: `1px solid ${theme.primaryColor}1A`,
          }}
        >
          <Icon path={mdiCameraOutline} size={1.2} color={theme.primaryColor} />
          <span className="text-[18px] font-medium" style={{ color: theme.primaryColor }}>
            Take photo of your card
          </span>
        </button>
      )}

      <p className="text-[14px] text-[#666] leading-[22px]">
        Your card photo is used only for verification and is securely encrypted.
      </p>
    </div>
  );
}
