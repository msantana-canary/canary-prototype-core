'use client';

/**
 * RegistrationCard — Registration form using @canary-ui/components underline variants
 *
 * Uses CanaryInputUnderline, CanarySelectUnderline, CanaryCheckbox
 * matching the production guest-facing check-in form.
 */

import React, { useState } from 'react';
import {
  CanaryInputUnderline,
  CanarySelectUnderline,
  CanaryCheckbox,
  InputSize,
  InputType,
} from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { HOTEL_POLICY_TEXT, DEMO_RESERVATION } from '@/lib/products/guest-preview/mock-form-data';
import { GuestSignaturePad } from '@/components/core/GuestSignaturePad';
import { GuestBottomSheet } from '@/components/core/GuestBottomSheet';
import Icon from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';

const ARRIVAL_OPTIONS = [
  { value: '12pm', label: '12:00 PM' },
  { value: '1pm', label: '1:00 PM' },
  { value: '2pm', label: '2:00 PM' },
  { value: '3pm', label: '3:00 PM' },
  { value: '4pm', label: '4:00 PM' },
  { value: '5pm', label: '5:00 PM' },
  { value: '6pm', label: '6:00 PM' },
  { value: 'after7', label: 'After 7:00 PM' },
];

const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

const DOC_TYPE_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'national', label: 'National ID' },
  { value: 'visa', label: 'Visa' },
];

/** Bordered clickable row — Reservation info / Hotel policies (Figma FormSection) */
function FormSection({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between overflow-hidden"
      style={{
        border: '1px solid rgba(0,0,0,0.25)',
        borderRadius: 4,
        padding: '12px 16px',
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000' }}>
        {label}
      </span>
      <div className="p-3 -mr-3">
        <Icon path={mdiChevronRight} size={1} color="#000" />
      </div>
    </button>
  );
}

export function RegistrationCard() {
  const regCardFields = useCheckInConfigStore((s) => s.regCardFields);
  const theme = useCheckInConfigStore((s) => s.theme);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [reservationInfoOpen, setReservationInfoOpen] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  return (
    <>
      {/* Form — p-24, gap-16 matching Figma */}
      <div className="flex flex-col guest-form" style={{ padding: 24, gap: 16 }}>
        <FormSection label="Reservation info" onClick={() => setReservationInfoOpen(true)} />

        {regCardFields.contactInfo && (
          <>
            <CanaryInputUnderline
              label="Phone number (required)"
              type={InputType.TEL}
              size={InputSize.LARGE}
            />
            <CanaryInputUnderline
              label="Email address (required)"
              type={InputType.EMAIL}
              size={InputSize.LARGE}
            />
          </>
        )}

        {regCardFields.arrivalTime && (
          <CanarySelectUnderline
            label="Estimated arrival time (required)"
            options={ARRIVAL_OPTIONS}
            size={InputSize.LARGE}
          />
        )}

        {regCardFields.dateOfBirth && (
          <CanaryInputUnderline
            placeholder="Date of birth"
            type={InputType.DATE}
            size={InputSize.LARGE}
          />
        )}

        {regCardFields.gender && (
          <CanarySelectUnderline
            placeholder="Gender"
            options={GENDER_OPTIONS}
            size={InputSize.LARGE}
          />
        )}

        {regCardFields.nationality && (
          <CanaryInputUnderline label="Nationality" size={InputSize.LARGE} />
        )}

        {regCardFields.address && (
          <>
            <CanaryInputUnderline label="Street address" size={InputSize.LARGE} />
            <div className="flex gap-4">
              <div className="flex-1">
                <CanaryInputUnderline label="City" size={InputSize.LARGE} />
              </div>
              <div className="w-20">
                <CanaryInputUnderline label="State" size={InputSize.LARGE} />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CanaryInputUnderline label="Postal code" size={InputSize.LARGE} />
              </div>
              <div className="flex-1">
                <CanaryInputUnderline label="Country" size={InputSize.LARGE} />
              </div>
            </div>
          </>
        )}

        {regCardFields.passportTravelDoc && (
          <>
            <CanarySelectUnderline label="Document type" options={DOC_TYPE_OPTIONS} size={InputSize.LARGE} />
            <CanaryInputUnderline label="Document number" size={InputSize.LARGE} />
            <CanaryInputUnderline label="Country of issue" size={InputSize.LARGE} />
            <CanaryInputUnderline label="Place of issue" size={InputSize.LARGE} />
          </>
        )}

        {regCardFields.vehicleInfo && (
          <>
            <CanaryInputUnderline label="Vehicle make/model/car" size={InputSize.LARGE} />
            <CanaryInputUnderline label="License plate number" size={InputSize.LARGE} />
          </>
        )}

        {regCardFields.loyaltyProgram && (
          <>
            <CanaryInputUnderline label="Loyalty number" size={InputSize.LARGE} />
            <CanaryInputUnderline label="Loyalty tier" size={InputSize.LARGE} />
          </>
        )}

        {regCardFields.companyBilling && (
          <>
            <CanaryInputUnderline label="Company name" size={InputSize.LARGE} />
            <CanaryInputUnderline label="VAT / Tax ID" size={InputSize.LARGE} />
            <CanaryInputUnderline label="Company address" size={InputSize.LARGE} />
          </>
        )}

        {regCardFields.specialRequests && (
          <CanaryInputUnderline label="Special requests" size={InputSize.LARGE} />
        )}
      </div>

      {/* Policies + consent section */}
      <div className="flex flex-col" style={{ padding: '8px 24px', gap: 8 }}>
        {regCardFields.hotelPolicy && (
          <>
            <FormSection label="Hotel policies" onClick={() => setPolicyOpen(true)} />
            <div style={{ padding: '16px 4px' }}>
              <CanaryCheckbox
                checked={policyAgreed}
                onChange={() => setPolicyAgreed(!policyAgreed)}
                label="I have read and agree to the hotel policies"
              />
            </div>
          </>
        )}

        {regCardFields.marketingConsent && (
          <div style={{ padding: '16px 4px' }}>
            <CanaryCheckbox
              checked={marketingConsent}
              onChange={() => setMarketingConsent(!marketingConsent)}
              label="I consent to receive texts and emails related to both my stay and future marketing materials."
            />
          </div>
        )}
      </div>

      {/* Signature */}
      {regCardFields.signature && (
        <div style={{ padding: '16px 24px' }}>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', marginBottom: 8 }}>Signature</p>
          <GuestSignaturePad borderRadius="8px" />
        </div>
      )}

      {/* Bottom Sheets */}
      <GuestBottomSheet isOpen={policyOpen} onClose={() => setPolicyOpen(false)} title="Hotel Policies">
        <p className="text-[16px] text-[#374151] leading-relaxed">{HOTEL_POLICY_TEXT}</p>
      </GuestBottomSheet>

      <GuestBottomSheet isOpen={reservationInfoOpen} onClose={() => setReservationInfoOpen(false)} title="Reservation Info">
        <div className="space-y-3">
          {[
            ['Confirmation', DEMO_RESERVATION.confirmationCode],
            ['Check-in', DEMO_RESERVATION.checkInDate],
            ['Check-out', DEMO_RESERVATION.checkOutDate],
            ['Room', `${DEMO_RESERVATION.roomNumber} — ${DEMO_RESERVATION.roomType}`],
            ['Estimated Total', `$${DEMO_RESERVATION.estimatedTotal.toFixed(2)}`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-[14px] text-[#666]">{label}</span>
              <span className="text-[14px] font-medium text-black">{value}</span>
            </div>
          ))}
        </div>
      </GuestBottomSheet>
    </>
  );
}
