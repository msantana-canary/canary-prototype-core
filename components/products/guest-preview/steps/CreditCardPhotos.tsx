'use client';

/**
 * CreditCardPhotos — Card photo capture, fully themed
 */

import React, { useState } from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import Icon from '@mdi/react';
import { mdiCameraOutline, mdiCheckCircleOutline } from '@mdi/js';

export function CreditCardPhotos() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const [captured, setCaptured] = useState(false);

  return (
    <div className="flex flex-col" style={{ padding: '32px 24px 24px', gap: 24 }}>
      <p style={{ fontSize: 18, lineHeight: '28px', color: theme.fontColor }}>
        Please take a photo of the front of your credit card for verification.
      </p>

      {captured ? (
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-full rounded-lg flex flex-col items-center justify-center gap-2"
            style={{ aspectRatio: '16/10', backgroundColor: `${theme.primaryColor}10`, border: `1px solid ${theme.primaryColor}` }}
          >
            <Icon path={mdiCheckCircleOutline} size={1.5} color={theme.primaryColor} />
            <span style={{ fontSize: 16, fontWeight: 500, color: theme.primaryColor }}>Photo captured</span>
          </div>
          <button onClick={() => setCaptured(false)} style={{ fontSize: 14, fontWeight: 500, color: theme.primaryColor }}>
            Retake
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCaptured(true)}
          className="w-full rounded-lg flex flex-col items-center justify-center gap-8 cursor-pointer"
          style={{ aspectRatio: '16/10', backgroundColor: `${theme.primaryColor}1A`, border: `1px solid ${theme.primaryColor}1A` }}
        >
          <Icon path={mdiCameraOutline} size={1.2} color={theme.primaryColor} />
          <span style={{ fontSize: 18, fontWeight: 500, color: theme.primaryColor }}>
            Take photo of your card
          </span>
        </button>
      )}

      <p style={{ fontSize: 14, lineHeight: '22px', color: '#666' }}>
        Your card photo is used only for verification and is securely encrypted.
      </p>
    </div>
  );
}
