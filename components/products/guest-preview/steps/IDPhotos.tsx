'use client';

/**
 * IDPhotos — ID photo upload step matching Figma
 *
 * Instruction text, underline ID type select,
 * tan capture area with camera icon and gold text.
 */

import React, { useState } from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import Icon from '@mdi/react';
import { mdiCameraOutline, mdiCheckCircleOutline } from '@mdi/js';

export function IDPhotos() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const idOptions = useCheckInConfigStore((s) => s.idOptions);
  const [captured, setCaptured] = useState(false);
  const [backCaptured, setBackCaptured] = useState(false);

  // Build accepted types list for the dropdown
  const typeOptions = [
    ...(idOptions.acceptedTypes.driversLicense ? [{ value: 'dl', label: "Driver's License" }] : []),
    ...(idOptions.acceptedTypes.passport ? [{ value: 'passport', label: 'Passport' }] : []),
    ...(idOptions.acceptedTypes.nationalId ? [{ value: 'national', label: 'National ID' }] : []),
  ];

  return (
    <div className="flex flex-col gap-6 px-6 pt-8 pb-6">
      {/* Instruction */}
      <p className="text-[18px] text-black leading-[28px]">
        Please take a photo of your driver&apos;s license or government issued ID. Your ID is used to prevent fraud and verify your identity.
      </p>

      {/* ID type select — underline style */}
      <div className="flex flex-col gap-1">
        <label className="text-[14px] text-[#666] leading-[22px]">ID type</label>
        <div className="relative">
          <select
            defaultValue={typeOptions[0]?.value}
            className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-3 text-[20px] leading-[30px] text-black outline-none appearance-none pr-8"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[20px] text-[#666]">⇅</span>
        </div>
      </div>

      {/* Photo capture area — tan bg matching Figma */}
      <CaptureBox
        captured={captured}
        onCapture={() => setCaptured(true)}
        onRetake={() => setCaptured(false)}
        label="Take photo of your ID"
        primaryColor={theme.primaryColor}
      />

      {/* Back photo (if required) */}
      {idOptions.requireBackPhoto && (
        <CaptureBox
          captured={backCaptured}
          onCapture={() => setBackCaptured(true)}
          onRetake={() => setBackCaptured(false)}
          label="Take photo of ID back"
          primaryColor={theme.primaryColor}
        />
      )}

      {/* Selfie (if required) */}
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
  captured,
  onCapture,
  onRetake,
  label,
  primaryColor,
  aspectRatio = '382/248',
}: {
  captured: boolean;
  onCapture: () => void;
  onRetake: () => void;
  label: string;
  primaryColor: string;
  aspectRatio?: string;
}) {
  if (captured) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-full rounded-lg flex flex-col items-center justify-center gap-2"
          style={{
            aspectRatio,
            backgroundColor: '#f0fdf4',
            border: '1px solid #22c55e',
          }}
        >
          <Icon path={mdiCheckCircleOutline} size={1.5} color="#22c55e" />
          <span className="text-[16px] font-medium text-[#166534]">Photo captured</span>
        </div>
        <button
          onClick={onRetake}
          className="text-[14px] font-medium"
          style={{ color: primaryColor }}
        >
          Retake
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onCapture}
      className="w-full rounded-lg flex flex-col items-center justify-center gap-8 cursor-pointer"
      style={{
        aspectRatio,
        backgroundColor: `${primaryColor}1A`,
        border: `1px solid ${primaryColor}1A`,
      }}
    >
      <Icon path={mdiCameraOutline} size={1.2} color={primaryColor} />
      <span className="text-[18px] font-medium" style={{ color: primaryColor }}>
        {label}
      </span>
    </button>
  );
}
