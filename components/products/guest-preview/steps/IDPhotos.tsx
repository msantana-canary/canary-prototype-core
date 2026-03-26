'use client';

/**
 * IDPhotos — ID photo upload step using themed components
 */

import React, { useState } from 'react';
import { CanarySelectUnderline, InputSize } from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import Icon from '@mdi/react';
import { mdiCameraOutline, mdiCheckCircleOutline } from '@mdi/js';

export function IDPhotos() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const idOptions = useCheckInConfigStore((s) => s.idOptions);
  const [captured, setCaptured] = useState(false);
  const [backCaptured, setBackCaptured] = useState(false);

  const typeOptions = [
    ...(idOptions.acceptedTypes.driversLicense ? [{ value: 'dl', label: "Driver's License" }] : []),
    ...(idOptions.acceptedTypes.passport ? [{ value: 'passport', label: 'Passport' }] : []),
    ...(idOptions.acceptedTypes.nationalId ? [{ value: 'national', label: 'National ID' }] : []),
  ];

  return (
    <div className="flex flex-col" style={{ padding: '32px 24px 24px', gap: 24 }}>
      <p style={{ fontSize: 18, lineHeight: '28px', color: theme.fontColor }}>
        Please take a photo of your driver&apos;s license or government issued ID. Your ID is used to prevent fraud and verify your identity.
      </p>

      <CanarySelectUnderline
        label="ID type"
        options={typeOptions}
        size={InputSize.LARGE}
        defaultValue={typeOptions[0]?.value}
      />

      <CaptureBox
        captured={captured}
        onCapture={() => setCaptured(true)}
        onRetake={() => setCaptured(false)}
        label="Take photo of your ID"
        primaryColor={theme.primaryColor}
      />

      {idOptions.requireBackPhoto && (
        <CaptureBox
          captured={backCaptured}
          onCapture={() => setBackCaptured(true)}
          onRetake={() => setBackCaptured(false)}
          label="Take photo of ID back"
          primaryColor={theme.primaryColor}
        />
      )}

      {idOptions.requireSelfie && (
        <CaptureBox
          captured={false}
          onCapture={() => {}}
          onRetake={() => {}}
          label="Take a selfie"
          primaryColor={theme.primaryColor}
          aspectRatio="1/1"
        />
      )}
    </div>
  );
}

function CaptureBox({
  captured, onCapture, onRetake, label, primaryColor, aspectRatio = '382/248',
}: {
  captured: boolean; onCapture: () => void; onRetake: () => void;
  label: string; primaryColor: string; aspectRatio?: string;
}) {
  if (captured) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-full rounded-lg flex flex-col items-center justify-center gap-2"
          style={{ aspectRatio, backgroundColor: `${primaryColor}10`, border: `1px solid ${primaryColor}` }}
        >
          <Icon path={mdiCheckCircleOutline} size={1.5} color={primaryColor} />
          <span style={{ fontSize: 16, fontWeight: 500, color: primaryColor }}>Photo captured</span>
        </div>
        <button onClick={onRetake} style={{ fontSize: 14, fontWeight: 500, color: primaryColor }}>
          Retake
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onCapture}
      className="w-full rounded-lg flex flex-col items-center justify-center gap-8 cursor-pointer"
      style={{ aspectRatio, backgroundColor: `${primaryColor}1A`, border: `1px solid ${primaryColor}1A` }}
    >
      <Icon path={mdiCameraOutline} size={1.2} color={primaryColor} />
      <span style={{ fontSize: 18, fontWeight: 500, color: primaryColor }}>{label}</span>
    </button>
  );
}
