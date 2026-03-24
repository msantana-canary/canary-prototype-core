'use client';

/**
 * AdditionalGuests — Per-guest form with underline inputs
 *
 * Uses underline input style matching Figma.
 * Fields toggled by sidebar config.
 */

import React, { useState } from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { DEMO_ADDITIONAL_GUESTS } from '@/lib/products/guest-preview/mock-form-data';
import Icon from '@mdi/react';
import { mdiAccountPlusOutline, mdiDeleteOutline, mdiCameraOutline, mdiCheckCircleOutline } from '@mdi/js';

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
      id: g.id, firstName: g.firstName, lastName: g.lastName,
      dateOfBirth: g.dateOfBirth, gender: g.gender,
      nationality: g.nationality, email: g.email, phone: g.phone,
    }))
  );

  const addGuest = () => {
    setGuests((prev) => [...prev, {
      id: `addl-${Date.now()}`, firstName: '', lastName: '',
      dateOfBirth: '', gender: '', nationality: '',
      email: '', phone: '',
    }]);
  };

  const removeGuest = (id: string) => setGuests((prev) => prev.filter((g) => g.id !== id));
  const updateGuest = (id: string, field: string, value: string) => {
    setGuests((prev) => prev.map((g) => g.id === id ? { ...g, [field]: value } : g));
  };

  return (
    <div className="flex flex-col gap-4 px-6 pt-6 pb-6">
      <p className="text-[18px] text-black leading-[28px]">
        Add information for other guests staying in your room.
      </p>

      {guests.map((guest, index) => (
        <div key={guest.id} className="border border-[rgba(0,0,0,0.15)] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[16px] font-medium text-black">Guest {index + 1}</span>
            <button onClick={() => removeGuest(guest.id)} className="p-1">
              <Icon path={mdiDeleteOutline} size={0.7} color="#ef4444" />
            </button>
          </div>

          {/* Name — always shown */}
          <div className="flex gap-3 mb-3">
            <input value={guest.firstName} onChange={(e) => updateGuest(guest.id, 'firstName', e.target.value)} placeholder="First name" className="flex-1 border-b border-[rgba(0,0,0,0.5)] bg-transparent py-2 text-[18px] text-black placeholder:text-[#666] outline-none" />
            <input value={guest.lastName} onChange={(e) => updateGuest(guest.id, 'lastName', e.target.value)} placeholder="Last name" className="flex-1 border-b border-[rgba(0,0,0,0.5)] bg-transparent py-2 text-[18px] text-black placeholder:text-[#666] outline-none" />
          </div>

          {fields.dateOfBirth && (
            <div className="mb-3">
              <label className="text-[14px] text-[#666]">Date of birth</label>
              <input type="date" value={guest.dateOfBirth} onChange={(e) => updateGuest(guest.id, 'dateOfBirth', e.target.value)} className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-2 text-[18px] text-black outline-none" />
            </div>
          )}
          {fields.gender && (
            <div className="mb-3">
              <label className="text-[14px] text-[#666]">Gender</label>
              <select value={guest.gender} onChange={(e) => updateGuest(guest.id, 'gender', e.target.value)} className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-2 text-[18px] text-black outline-none appearance-none">
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          )}
          {fields.nationality && (
            <input value={guest.nationality} onChange={(e) => updateGuest(guest.id, 'nationality', e.target.value)} placeholder="Nationality" className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-2 text-[18px] text-black placeholder:text-[#666] outline-none mb-3" />
          )}
          {fields.email && (
            <input type="email" value={guest.email} onChange={(e) => updateGuest(guest.id, 'email', e.target.value)} placeholder="Email" className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-2 text-[18px] text-black placeholder:text-[#666] outline-none mb-3" />
          )}
          {fields.phone && (
            <input type="tel" value={guest.phone} onChange={(e) => updateGuest(guest.id, 'phone', e.target.value)} placeholder="Phone" className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-2 text-[18px] text-black placeholder:text-[#666] outline-none mb-3" />
          )}
          {fields.idUpload && (
            <IDCapture primaryColor={theme.primaryColor} />
          )}
        </div>
      ))}

      <button
        onClick={addGuest}
        className="w-full flex items-center justify-center gap-2 py-3 border border-[rgba(0,0,0,0.25)] rounded text-[16px] font-medium"
        style={{ color: theme.primaryColor }}
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
        <Icon path={mdiCheckCircleOutline} size={0.7} color="#22c55e" />
        <span className="text-[14px] text-[#166534]">ID uploaded</span>
        <button onClick={() => setCaptured(false)} className="text-[14px] ml-auto" style={{ color: primaryColor }}>Retake</button>
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
      <span className="text-[14px] font-medium" style={{ color: primaryColor }}>Upload guest ID</span>
    </button>
  );
}
