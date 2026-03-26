'use client';

/**
 * AdditionalGuests — Per-guest form using @canary-ui/components
 */

import React, { useState } from 'react';
import {
  CanaryInputUnderline,
  CanarySelectUnderline,
  InputSize,
  InputType,
} from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { DEMO_ADDITIONAL_GUESTS } from '@/lib/products/guest-preview/mock-form-data';
import Icon from '@mdi/react';
import { mdiAccountPlusOutline, mdiDeleteOutline, mdiCameraOutline, mdiCheckCircleOutline } from '@mdi/js';

const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

interface GuestFormData {
  id: string;
  firstName: string;
  lastName: string;
}

export function AdditionalGuests() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const fields = useCheckInConfigStore((s) => s.additionalGuestFields);

  const [guests, setGuests] = useState<GuestFormData[]>(
    DEMO_ADDITIONAL_GUESTS.map((g) => ({
      id: g.id, firstName: g.firstName, lastName: g.lastName,
    }))
  );

  const addGuest = () => {
    setGuests((prev) => [...prev, { id: `addl-${Date.now()}`, firstName: '', lastName: '' }]);
  };

  const removeGuest = (id: string) => setGuests((prev) => prev.filter((g) => g.id !== id));

  return (
    <div className="flex flex-col" style={{ padding: '24px', gap: 16 }}>
      <p style={{ fontSize: 18, lineHeight: '28px', color: theme.fontColor }}>
        Add information for other guests staying in your room.
      </p>

      {guests.map((guest, index) => (
        <div
          key={guest.id}
          className="rounded-lg"
          style={{ border: '1px solid rgba(0,0,0,0.15)', padding: 16, backgroundColor: theme.cardBackgroundColor }}
        >
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 16, fontWeight: 500, color: theme.fontColor }}>
              Guest {index + 1}
            </span>
            <button onClick={() => removeGuest(guest.id)} className="p-1">
              <Icon path={mdiDeleteOutline} size={0.65} color="#ef4444" />
            </button>
          </div>

          <div className="flex flex-col guest-form" style={{ gap: 12 }}>
            <div className="flex gap-3">
              <div className="flex-1">
                <CanaryInputUnderline label="First name" size={InputSize.LARGE} defaultValue={guest.firstName} />
              </div>
              <div className="flex-1">
                <CanaryInputUnderline label="Last name" size={InputSize.LARGE} defaultValue={guest.lastName} />
              </div>
            </div>

            {fields.dateOfBirth && (
              <CanaryInputUnderline label="Date of birth" type={InputType.DATE} size={InputSize.LARGE} />
            )}
            {fields.gender && (
              <CanarySelectUnderline label="Gender" options={GENDER_OPTIONS} size={InputSize.LARGE} />
            )}
            {fields.nationality && (
              <CanaryInputUnderline label="Nationality" size={InputSize.LARGE} />
            )}
            {fields.email && (
              <CanaryInputUnderline label="Email" type={InputType.EMAIL} size={InputSize.LARGE} />
            )}
            {fields.phone && (
              <CanaryInputUnderline label="Phone" type={InputType.TEL} size={InputSize.LARGE} />
            )}
            {fields.idUpload && (
              <IDCapture primaryColor={theme.primaryColor} />
            )}
          </div>
        </div>
      ))}

      <button
        onClick={addGuest}
        className="w-full flex items-center justify-center gap-2 py-3 rounded"
        style={{ border: '1px solid rgba(0,0,0,0.25)', color: theme.primaryColor, fontSize: 16, fontWeight: 500 }}
      >
        <Icon path={mdiAccountPlusOutline} size={0.7} color={theme.primaryColor} />
        Add another guest
      </button>
    </div>
  );
}

function IDCapture({ primaryColor }: { primaryColor: string }) {
  const [captured, setCaptured] = useState(false);
  if (captured) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Icon path={mdiCheckCircleOutline} size={0.7} color={primaryColor} />
        <span style={{ fontSize: 14, color: primaryColor }}>ID uploaded</span>
        <button onClick={() => setCaptured(false)} className="ml-auto" style={{ fontSize: 14, color: primaryColor }}>Retake</button>
      </div>
    );
  }
  return (
    <button
      onClick={() => setCaptured(true)}
      className="w-full rounded-lg flex items-center justify-center gap-2 py-6 cursor-pointer"
      style={{ backgroundColor: `${primaryColor}1A` }}
    >
      <Icon path={mdiCameraOutline} size={0.7} color={primaryColor} />
      <span style={{ fontSize: 14, fontWeight: 500, color: primaryColor }}>Upload guest ID</span>
    </button>
  );
}
