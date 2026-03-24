'use client';

/**
 * CreditCardPhotos — Physical card photo capture step
 */

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { GuestImageUploader } from '@/components/core/GuestImageUploader';

export function CreditCardPhotos() {
  const theme = useCheckInConfigStore((s) => s.theme);

  return (
    <div className="flex flex-col gap-0">
      <div className="mb-4">
        <h2 className="text-[18px] font-semibold" style={{ color: theme.fontColor }}>
          Credit Card Photo
        </h2>
        <p className="text-[13px] text-[#6b7280] mt-1">
          Please take a photo of the front of your credit card for verification.
        </p>
      </div>

      <GuestImageUploader
        label="Front of Credit Card"
        description="Ensure the card number and name are clearly visible"
        aspectRatio="16/10"
        primaryColor={theme.primaryColor}
      />

      <div className="mt-4 p-3 bg-[#eff6ff] border border-[#dbeafe] rounded text-[12px] text-[#1e40af]">
        Your card photo is used only for identity verification and is securely encrypted.
      </div>
    </div>
  );
}
