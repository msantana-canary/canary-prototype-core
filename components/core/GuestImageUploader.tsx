'use client';

/**
 * GuestImageUploader — Camera/file input with viewfinder UI
 *
 * Reusable for ID photos and credit card photos.
 * Shows a camera viewfinder mockup, tap to "capture", shows preview.
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiCameraOutline, mdiCheckCircleOutline, mdiRefresh } from '@mdi/js';

interface GuestImageUploaderProps {
  label?: string;
  description?: string;
  aspectRatio?: string; // e.g., "3/2" for ID cards
  primaryColor?: string;
  onCapture?: () => void;
}

export function GuestImageUploader({
  label = 'Take Photo',
  description,
  aspectRatio = '3/2',
  primaryColor = '#4481e6',
  onCapture,
}: GuestImageUploaderProps) {
  const [captured, setCaptured] = useState(false);

  const handleCapture = () => {
    setCaptured(true);
    onCapture?.();
  };

  const handleRetake = () => {
    setCaptured(false);
  };

  if (captured) {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* Captured state */}
        <div
          className="w-full rounded-lg border-2 flex items-center justify-center bg-[#f0fdf4]"
          style={{ aspectRatio, borderColor: '#22c55e' }}
        >
          <div className="flex flex-col items-center gap-2">
            <Icon path={mdiCheckCircleOutline} size={1.5} color="#22c55e" />
            <span className="text-[14px] font-medium text-[#166534]">Photo captured</span>
          </div>
        </div>
        <button
          onClick={handleRetake}
          className="flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: primaryColor }}
        >
          <Icon path={mdiRefresh} size={0.6} />
          Retake photo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <p className="text-[14px] font-medium text-[#374151] text-center">{label}</p>
      )}
      {description && (
        <p className="text-[13px] text-[#6b7280] text-center">{description}</p>
      )}
      {/* Viewfinder */}
      <button
        onClick={handleCapture}
        className="w-full rounded-lg border-2 border-dashed border-[#d1d5db] flex flex-col items-center justify-center gap-3 bg-[#fafafa] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
        style={{ aspectRatio }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Icon path={mdiCameraOutline} size={1.2} color={primaryColor} />
        </div>
        <span className="text-[13px] font-medium" style={{ color: primaryColor }}>
          Tap to capture
        </span>
      </button>
    </div>
  );
}
