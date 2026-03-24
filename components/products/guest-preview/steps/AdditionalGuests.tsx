'use client';

/**
 * AdditionalGuests — Per-guest form with toggleable fields
 *
 * Shows pre-filled additional guest data.
 * Fields toggled by sidebar "Additional Guest Fields" config.
 */

import React, { useState } from 'react';
import { CanaryInput, CanarySelect, InputType, InputSize, CanaryButton, ButtonType, ButtonSize } from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { DEMO_ADDITIONAL_GUESTS } from '@/lib/products/guest-preview/mock-form-data';
import { GuestImageUploader } from '@/components/core/GuestImageUploader';
import Icon from '@mdi/react';
import { mdiAccountPlusOutline, mdiDeleteOutline } from '@mdi/js';

const GENDER_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

interface GuestFormData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  email: string;
  phone: string;
}

export function AdditionalGuests() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const fields = useCheckInConfigStore((s) => s.additionalGuestFields);

  const [guests, setGuests] = useState<GuestFormData[]>(
    DEMO_ADDITIONAL_GUESTS.map((g) => ({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      dateOfBirth: g.dateOfBirth,
      gender: g.gender,
      nationality: g.nationality,
      email: g.email,
      phone: g.phone,
    }))
  );

  const addGuest = () => {
    setGuests((prev) => [
      ...prev,
      {
        id: `addl-${Date.now()}`,
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        email: '',
        phone: '',
      },
    ]);
  };

  const removeGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGuest = (id: string, field: string, value: string) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  return (
    <div className="flex flex-col gap-0">
      <div className="mb-4">
        <h2 className="text-[18px] font-semibold" style={{ color: theme.fontColor }}>
          Additional Guests
        </h2>
        <p className="text-[13px] text-[#6b7280] mt-1">
          Add information for other guests staying in your room.
        </p>
      </div>

      {/* Guest forms */}
      <div className="flex flex-col gap-4">
        {guests.map((guest, index) => (
          <div
            key={guest.id}
            className="rounded-lg border border-[#e5e7eb] p-4"
            style={{ backgroundColor: theme.cardBackgroundColor }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-medium text-[#374151]">
                Guest {index + 1}
              </h3>
              {guests.length > 0 && (
                <button
                  onClick={() => removeGuest(guest.id)}
                  className="p-1 rounded hover:bg-[#fef2f2] transition-colors"
                >
                  <Icon path={mdiDeleteOutline} size={0.65} color="#ef4444" />
                </button>
              )}
            </div>

            {/* Full Name — always shown */}
            <div className="flex gap-3">
              <div className="flex-1">
                <CanaryInput
                  label="First Name"
                  value={guest.firstName}
                  onChange={(e) => updateGuest(guest.id, 'firstName', e.target.value)}
                  size={InputSize.NORMAL}
                  isRequired
                />
              </div>
              <div className="flex-1">
                <CanaryInput
                  label="Last Name"
                  value={guest.lastName}
                  onChange={(e) => updateGuest(guest.id, 'lastName', e.target.value)}
                  size={InputSize.NORMAL}
                  isRequired
                />
              </div>
            </div>

            {fields.dateOfBirth && (
              <div className="mt-3">
                <CanaryInput
                  label="Date of Birth"
                  type={InputType.DATE}
                  value={guest.dateOfBirth}
                  onChange={(e) => updateGuest(guest.id, 'dateOfBirth', e.target.value)}
                  size={InputSize.NORMAL}
                />
              </div>
            )}

            {fields.gender && (
              <div className="mt-3">
                <CanarySelect
                  label="Gender"
                  value={guest.gender}
                  onChange={(e) => updateGuest(guest.id, 'gender', e.target.value)}
                  size={InputSize.NORMAL}
                  options={GENDER_OPTIONS}
                />
              </div>
            )}

            {fields.nationality && (
              <div className="mt-3">
                <CanaryInput
                  label="Nationality"
                  value={guest.nationality}
                  onChange={(e) => updateGuest(guest.id, 'nationality', e.target.value)}
                  size={InputSize.NORMAL}
                />
              </div>
            )}

            {fields.email && (
              <div className="mt-3">
                <CanaryInput
                  label="Email"
                  type={InputType.EMAIL}
                  value={guest.email}
                  onChange={(e) => updateGuest(guest.id, 'email', e.target.value)}
                  size={InputSize.NORMAL}
                />
              </div>
            )}

            {fields.phone && (
              <div className="mt-3">
                <CanaryInput
                  label="Phone"
                  type={InputType.TEL}
                  value={guest.phone}
                  onChange={(e) => updateGuest(guest.id, 'phone', e.target.value)}
                  size={InputSize.NORMAL}
                />
              </div>
            )}

            {fields.idUpload && (
              <div className="mt-3">
                <GuestImageUploader
                  label="Guest ID"
                  description="Upload a photo of this guest's ID"
                  aspectRatio="3/2"
                  primaryColor={theme.primaryColor}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add guest button */}
      <div className="mt-3">
        <CanaryButton
          type={ButtonType.OUTLINED}
          size={ButtonSize.NORMAL}
          isExpanded
          onClick={addGuest}
          icon={<Icon path={mdiAccountPlusOutline} size={0.7} />}
        >
          Add Another Guest
        </CanaryButton>
      </div>
    </div>
  );
}
