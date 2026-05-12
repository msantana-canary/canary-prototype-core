'use client';

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { GuestSignaturePad } from '@/components/core/GuestSignaturePad';

export function Signature() {
  const theme = useCheckInConfigStore((s) => s.theme);

  return (
    <div className="flex flex-col" style={{ padding: '32px 24px 24px', gap: 24 }}>
      <p style={{ fontSize: 18, lineHeight: '28px', color: theme.fontColor }}>
        Please sign below to confirm you have read and agree to the hotel policies and terms of your stay.
      </p>

      <div>
        <label
          className="block mb-2"
          style={{ fontSize: 14, fontWeight: 500, color: theme.fontColor }}
        >
          Guest signature
        </label>
        <GuestSignaturePad
          width={382}
          height={160}
          borderRadius="4px"
        />
      </div>

      <p style={{ fontSize: 14, lineHeight: '22px', color: '#666' }}>
        By signing, I acknowledge that the information provided is accurate and I accept the terms and conditions of my reservation.
      </p>
    </div>
  );
}
