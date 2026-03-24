'use client';

/**
 * IDPhotos — ID document photo upload step
 *
 * ID type selector, front photo, conditional back photo.
 * Adapts to accepted ID types from config.
 */

import React, { useState } from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { GuestImageUploader } from '@/components/core/GuestImageUploader';
import Icon from '@mdi/react';
import { mdiPassport, mdiCardAccountDetailsOutline, mdiBadgeAccountOutline } from '@mdi/js';

type IdType = 'passport' | 'driversLicense' | 'nationalId';

const ID_TYPE_META: Record<IdType, { label: string; icon: string }> = {
  passport: { label: 'Passport', icon: mdiPassport },
  driversLicense: { label: "Driver's License", icon: mdiCardAccountDetailsOutline },
  nationalId: { label: 'National ID', icon: mdiBadgeAccountOutline },
};

export function IDPhotos() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const idOptions = useCheckInConfigStore((s) => s.idOptions);

  const acceptedTypes = Object.entries(idOptions.acceptedTypes)
    .filter(([, accepted]) => accepted)
    .map(([type]) => type as IdType);

  const [selectedType, setSelectedType] = useState<IdType | null>(
    acceptedTypes.length === 1 ? acceptedTypes[0] : null
  );

  return (
    <div className="flex flex-col gap-0">
      <div className="mb-4">
        <h2 className="text-[18px] font-semibold" style={{ color: theme.fontColor }}>
          ID Verification
        </h2>
        <p className="text-[13px] text-[#6b7280] mt-1">
          Please provide a photo of your government-issued ID.
        </p>
      </div>

      {/* ID type selector */}
      {acceptedTypes.length > 1 && (
        <div className="mb-4">
          <p className="text-[13px] font-medium text-[#374151] mb-2">Select ID type</p>
          <div className="flex gap-2">
            {acceptedTypes.map((type) => {
              const meta = ID_TYPE_META[type];
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className="flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-lg border-2 transition-colors"
                  style={{
                    borderColor: isSelected ? theme.primaryColor : '#e5e7eb',
                    backgroundColor: isSelected ? `${theme.primaryColor}08` : 'transparent',
                  }}
                >
                  <Icon
                    path={meta.icon}
                    size={0.9}
                    color={isSelected ? theme.primaryColor : '#9ca3af'}
                  />
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: isSelected ? theme.primaryColor : '#6b7280' }}
                  >
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Photo upload areas */}
      {selectedType && (
        <div className="flex flex-col gap-4">
          <GuestImageUploader
            label="Front of ID"
            description="Ensure all text is clear and readable"
            aspectRatio="3/2"
            primaryColor={theme.primaryColor}
          />

          {idOptions.requireBackPhoto && (
            <GuestImageUploader
              label="Back of ID"
              description="Take a photo of the back side"
              aspectRatio="3/2"
              primaryColor={theme.primaryColor}
            />
          )}

          {idOptions.requireSelfie && (
            <GuestImageUploader
              label="Selfie"
              description="Take a photo of your face for identity verification"
              aspectRatio="1/1"
              primaryColor={theme.primaryColor}
            />
          )}
        </div>
      )}

      {!selectedType && acceptedTypes.length > 1 && (
        <div className="text-center text-[13px] text-[#9ca3af] py-8">
          Please select an ID type above to continue
        </div>
      )}
    </div>
  );
}
