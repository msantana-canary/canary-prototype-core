'use client';

/**
 * RegistrationCard — Pre-filled registration form
 *
 * Matches Figma: underline inputs (bottom-border-only),
 * "Reservation info" / "Hotel policies" as bordered clickable rows,
 * signature pad, checkboxes for consent.
 */

import React, { useState } from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { DEMO_REG_CARD, HOTEL_POLICY_TEXT, DEMO_RESERVATION } from '@/lib/products/guest-preview/mock-form-data';
import { GuestSignaturePad } from '@/components/core/GuestSignaturePad';
import { GuestBottomSheet } from '@/components/core/GuestBottomSheet';
import Icon from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';

// ── Underline input matching Figma CanaryInput (bottom-border-only) ──

function UnderlineInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-[14px] text-[#666] leading-[22px]">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-3 text-[20px] leading-[30px] text-black placeholder:text-[#666] outline-none"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      />
    </div>
  );
}

function UnderlineSelect({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-[14px] text-[#666] leading-[22px]">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-3 text-[20px] leading-[30px] text-black outline-none appearance-none pr-8"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[#666] text-[20px]">⇅</span>
      </div>
    </div>
  );
}

function UnderlineTextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-[14px] text-[#666] leading-[22px]">{label}</label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-3 text-[20px] leading-[30px] text-black placeholder:text-[#666] outline-none resize-none"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      />
    </div>
  );
}

/** Bordered clickable row (Reservation info / Hotel policies) */
function SectionRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 border border-[rgba(0,0,0,0.25)] rounded"
    >
      <span className="text-[18px] font-medium text-black leading-[28px]">{label}</span>
      <Icon path={mdiChevronRight} size={1} color="#000" />
    </button>
  );
}

const ARRIVAL_TIME_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: '12:00 PM', label: '12:00 PM' },
  { value: '1:00 PM', label: '1:00 PM' },
  { value: '2:00 PM', label: '2:00 PM' },
  { value: '3:00 PM', label: '3:00 PM' },
  { value: '4:00 PM', label: '4:00 PM' },
  { value: '5:00 PM', label: '5:00 PM' },
  { value: '6:00 PM', label: '6:00 PM' },
  { value: 'After 7:00 PM', label: 'After 7:00 PM' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

const TRAVEL_DOC_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'Passport', label: 'Passport' },
  { value: 'National ID', label: 'National ID' },
  { value: 'Visa', label: 'Visa' },
];

export function RegistrationCard() {
  const regCardFields = useCheckInConfigStore((s) => s.regCardFields);
  const theme = useCheckInConfigStore((s) => s.theme);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [reservationInfoOpen, setReservationInfoOpen] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [formData, setFormData] = useState(DEMO_REG_CARD);

  const u = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Reservation info row */}
      <SectionRow label="Reservation info" onClick={() => setReservationInfoOpen(true)} />

      {/* ── Contact fields ── */}
      {regCardFields.contactInfo && (
        <>
          <UnderlineInput
            value={formData.phone}
            onChange={(v) => u('phone', v)}
            placeholder="Phone number (required)"
          />
          <UnderlineInput
            value={formData.email}
            onChange={(v) => u('email', v)}
            placeholder="Email address (required)"
          />
        </>
      )}

      {/* Arrival time */}
      {regCardFields.arrivalTime && (
        <UnderlineSelect
          value={formData.arrivalTime}
          onChange={(v) => u('arrivalTime', v)}
          options={ARRIVAL_TIME_OPTIONS}
          label=""
        />
      )}

      {/* Date of Birth */}
      {regCardFields.dateOfBirth && (
        <UnderlineInput
          label="Date of birth"
          value={formData.dateOfBirth}
          onChange={(v) => u('dateOfBirth', v)}
          type="date"
        />
      )}

      {/* Gender */}
      {regCardFields.gender && (
        <UnderlineSelect
          label="Gender"
          value={formData.gender}
          onChange={(v) => u('gender', v)}
          options={GENDER_OPTIONS}
        />
      )}

      {/* Nationality */}
      {regCardFields.nationality && (
        <UnderlineInput
          value={formData.nationality}
          onChange={(v) => u('nationality', v)}
          placeholder="Nationality"
        />
      )}

      {/* Address */}
      {regCardFields.address && (
        <>
          <UnderlineInput value={formData.address} onChange={(v) => u('address', v)} placeholder="Street address" />
          <div className="flex gap-4">
            <div className="flex-1"><UnderlineInput value={formData.city} onChange={(v) => u('city', v)} placeholder="City" /></div>
            <div className="w-20"><UnderlineInput value={formData.state} onChange={(v) => u('state', v)} placeholder="State" /></div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1"><UnderlineInput value={formData.postalCode} onChange={(v) => u('postalCode', v)} placeholder="Postal code" /></div>
            <div className="flex-1"><UnderlineInput value={formData.country} onChange={(v) => u('country', v)} placeholder="Country" /></div>
          </div>
        </>
      )}

      {/* Passport / Travel Doc */}
      {regCardFields.passportTravelDoc && (
        <>
          <UnderlineSelect label="Document type" value={formData.travelDocType} onChange={(v) => u('travelDocType', v)} options={TRAVEL_DOC_OPTIONS} />
          <UnderlineInput value={formData.travelDocNumber} onChange={(v) => u('travelDocNumber', v)} placeholder="Document number" />
          <UnderlineInput value={formData.travelDocCountry} onChange={(v) => u('travelDocCountry', v)} placeholder="Country of issue" />
          <div className="flex gap-4">
            <div className="flex-1"><UnderlineInput value={formData.travelDocIssueDate} onChange={(v) => u('travelDocIssueDate', v)} type="date" label="Issue date" /></div>
            <div className="flex-1"><UnderlineInput value={formData.travelDocExpiryDate} onChange={(v) => u('travelDocExpiryDate', v)} type="date" label="Expiry date" /></div>
          </div>
        </>
      )}

      {/* Vehicle Info */}
      {regCardFields.vehicleInfo && (
        <>
          <UnderlineInput value={`${formData.vehicleMake} ${formData.vehicleModel}`} onChange={() => {}} placeholder="Vehicle make/model/car" />
          <UnderlineInput value={formData.licensePlate} onChange={(v) => u('licensePlate', v)} placeholder="License plate number" />
        </>
      )}

      {/* Loyalty */}
      {regCardFields.loyaltyProgram && (
        <>
          <UnderlineInput value={formData.loyaltyNumber} onChange={(v) => u('loyaltyNumber', v)} placeholder="Loyalty number" />
          <UnderlineInput value={formData.loyaltyTier} onChange={() => {}} placeholder="Loyalty tier" />
        </>
      )}

      {/* Company Billing */}
      {regCardFields.companyBilling && (
        <>
          <UnderlineInput value={formData.companyName} onChange={(v) => u('companyName', v)} placeholder="Company name" />
          <UnderlineInput value={formData.companyVat} onChange={(v) => u('companyVat', v)} placeholder="VAT / Tax ID" />
          <UnderlineInput value={formData.companyAddress} onChange={(v) => u('companyAddress', v)} placeholder="Company address" />
        </>
      )}

      {/* Special Requests */}
      {regCardFields.specialRequests && (
        <UnderlineTextArea
          value={formData.specialRequests}
          onChange={(v) => u('specialRequests', v)}
          placeholder="Special requests"
        />
      )}

      {/* Hotel policies row */}
      {regCardFields.hotelPolicy && (
        <>
          <SectionRow label="Hotel policies" onClick={() => setPolicyOpen(true)} />
          <label className="flex items-start gap-2 px-1 py-4 cursor-pointer">
            <input
              type="checkbox"
              checked={policyAgreed}
              onChange={() => setPolicyAgreed(!policyAgreed)}
              className="mt-1 w-[18px] h-[18px] accent-current flex-shrink-0"
              style={{ accentColor: theme.primaryColor }}
            />
            <span className="text-[18px] text-black leading-[28px]">
              I have read and agree to the{' '}
              <button onClick={() => setPolicyOpen(true)} className="underline">hotel policies</button>
            </span>
          </label>
        </>
      )}

      {/* Marketing Consent */}
      {regCardFields.marketingConsent && (
        <label className="flex items-start gap-2 px-1 py-4 cursor-pointer">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={() => setMarketingConsent(!marketingConsent)}
            className="mt-1 w-[18px] h-[18px] flex-shrink-0"
            style={{ accentColor: theme.primaryColor }}
          />
          <span className="text-[18px] text-black leading-[28px]">
            I consent to receive texts and emails related to both my stay and future marketing materials.
          </span>
        </label>
      )}

      {/* Signature */}
      {regCardFields.signature && (
        <div className="mt-2">
          <p className="text-[14px] text-[rgba(0,0,0,0.5)] mb-2">Signature</p>
          <GuestSignaturePad borderRadius="8px" />
        </div>
      )}

      {/* Bottom Sheets */}
      <GuestBottomSheet
        isOpen={policyOpen}
        onClose={() => setPolicyOpen(false)}
        title="Hotel Policies"
      >
        <p className="text-[16px] text-[#374151] leading-relaxed whitespace-pre-wrap">
          {HOTEL_POLICY_TEXT}
        </p>
      </GuestBottomSheet>

      <GuestBottomSheet
        isOpen={reservationInfoOpen}
        onClose={() => setReservationInfoOpen(false)}
        title="Reservation Info"
      >
        <div className="space-y-3">
          <InfoRow label="Confirmation" value={DEMO_RESERVATION.confirmationCode} />
          <InfoRow label="Check-in" value={DEMO_RESERVATION.checkInDate} />
          <InfoRow label="Check-out" value={DEMO_RESERVATION.checkOutDate} />
          <InfoRow label="Room" value={`${DEMO_RESERVATION.roomNumber} — ${DEMO_RESERVATION.roomType}`} />
          <InfoRow label="Estimated Total" value={`$${DEMO_RESERVATION.estimatedTotal.toFixed(2)}`} />
        </div>
      </GuestBottomSheet>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[14px] text-[#666]">{label}</span>
      <span className="text-[14px] font-medium text-black">{value}</span>
    </div>
  );
}
