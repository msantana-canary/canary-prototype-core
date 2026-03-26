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
  InputSize,
  InputType,
} from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { HOTEL_POLICY_TEXT, DEMO_RESERVATION } from '@/lib/products/guest-preview/mock-form-data';
import { GuestSignaturePad } from '@/components/core/GuestSignaturePad';
import { GuestBottomSheet } from '@/components/core/GuestBottomSheet';
import Icon from '@mdi/react';
import { mdiChevronRight, mdiCheckboxBlankOutline, mdiCheckboxMarked } from '@mdi/js';

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
/** Themed checkbox — no layout shift, gold-colored, matches Figma */
function ThemedCheckbox({
  checked,
  onChange,
  primaryColor,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  primaryColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-2 cursor-pointer"
      style={{ padding: '16px 4px' }}
      onClick={onChange}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon
          path={checked ? mdiCheckboxMarked : mdiCheckboxBlankOutline}
          size={1}
          color={checked ? primaryColor : '#999'}
        />
      </div>
      <span style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
        {children}
      </span>
    </div>
  );
}

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
            placeholder="Estimated arrival time (required)"
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
            label="Gender"
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
              <div className="flex-1">
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
            <CanarySelectUnderline label="Document type" placeholder="Document type" options={DOC_TYPE_OPTIONS} size={InputSize.LARGE} />
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
      <div className="flex flex-col" style={{ padding: '8px 24px', gap: 0 }}>
        {regCardFields.hotelPolicy && (
          <>
            <FormSection label="Hotel policies" onClick={() => setPolicyOpen(true)} />
            <ThemedCheckbox
              checked={policyAgreed}
              onChange={() => setPolicyAgreed(!policyAgreed)}
              primaryColor={theme.primaryColor}
            >
              I have read and agree to the{' '}
              <button onClick={(e) => { e.stopPropagation(); setPolicyOpen(true); }} className="underline">
                hotel policies
              </button>
            </ThemedCheckbox>
          </>
        )}

        {regCardFields.marketingConsent && (
          <ThemedCheckbox
            checked={marketingConsent}
            onChange={() => setMarketingConsent(!marketingConsent)}
            primaryColor={theme.primaryColor}
          >
            I consent to receive texts and emails related to both my stay and future marketing materials.
          </ThemedCheckbox>
        )}
      </div>

      {/* Signature */}
      {regCardFields.signature && (
        <div style={{ padding: '16px 24px' }}>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', marginBottom: 8 }}>Signature</p>
          <GuestSignaturePad borderRadius="8px" />
        </div>
      )}

      {/* Bottom Sheet: Policies (Figma 5:2433) */}
      <GuestBottomSheet isOpen={policyOpen} onClose={() => setPolicyOpen(false)} title="Policies">
        <div className="flex flex-col" style={{ gap: 24 }}>
          <PolicySection
            title="Smoking"
            body="Statler New York maintains a smoke-free environment, ensuring the comfort and well-being of all guests. Smoking is prohibited throughout the property, including public areas, guestrooms, suites and patios. If this policy is violated, a fee will be applied with a minimum charge of $500."
          />
          <PolicySection
            title="Photography & Drones"
            body="For reasons of safety and privacy, the use of drones or any other remote-controlled aircraft is strictly forbidden at Statler New York. If you wish to capture professional photography during your stay, please contact our management team in advance."
          />
          <PolicySection
            title="Rate & Taxes"
            body="Rates are in U.S. dollars (USD) and are subject to availability and change. Additionally, rates are subject to a nightly 14.75% occupancy tax, a 5.875% state sales tax, and a $2.00 daily City Tourism Assessment Fee. Rooms can be guaranteed using Amex, Visa, Mastercard, or Discover."
          />
          <PolicySection
            title="Cancellation"
            body="Reservations may be cancelled up to 48 hours prior to the scheduled arrival date without penalty. Cancellations made within 48 hours of arrival will be charged one night's room rate plus applicable taxes. No-shows will be charged the full reservation amount."
          />
          <PolicySection
            title="Check-In & Check-Out"
            body="Check-in time is 3:00 PM. Check-out time is 11:00 AM. Early check-in and late check-out are available upon request and subject to availability. An additional fee may apply for late check-out requests after 2:00 PM."
          />
          <PolicySection
            title="Pet Policy"
            body="Statler New York welcomes well-behaved dogs weighing 50 lbs or less. A non-refundable pet fee of $150 per stay applies. Pets must be leashed in all public areas and may not be left unattended in guest rooms. Service animals are welcome at no additional charge."
          />
          <PolicySection
            title="Parking"
            body="Valet parking is available at $75 per night with in-and-out privileges. Self-parking is not available at this location. Electric vehicle charging stations are available on a first-come, first-served basis at no additional charge for hotel guests."
          />
        </div>
      </GuestBottomSheet>

      {/* Bottom Sheet: Reservation Info (Figma 5:2527) */}
      <GuestBottomSheet isOpen={reservationInfoOpen} onClose={() => setReservationInfoOpen(false)} title="Reservation info">
        <div className="flex flex-col" style={{ gap: 24 }}>
          {/* Hotel info */}
          <div>
            <p style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000' }}>Statler New York</p>
            <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>151 West 54th Street, New York, NY 10019</p>
            <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>United States of America</p>
            <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>+1 (212) 555-0100</p>
          </div>
          {/* Reservation table */}
          <div style={{ border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '12px 16px' }}>
            <div className="flex justify-between" style={{ padding: '8px 0' }}>
              <span style={{ fontSize: 16, color: '#000' }}>Guest</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#000' }}>Emily Smith</span>
            </div>
            <div className="flex justify-between" style={{ padding: '8px 0' }}>
              <span style={{ fontSize: 16, color: '#000' }}>Check-in</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#000' }}>{DEMO_RESERVATION.checkInDate}</span>
            </div>
            <div className="flex justify-between" style={{ padding: '8px 0' }}>
              <span style={{ fontSize: 16, color: '#000' }}>Checkout</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#000' }}>{DEMO_RESERVATION.checkOutDate}</span>
            </div>
          </div>
        </div>
      </GuestBottomSheet>
    </>
  );
}

/** Policy section matching Figma 5:2438 — title 20px Medium + body 18px Regular */
function PolicySection({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p style={{ fontSize: 20, fontWeight: 500, lineHeight: '30px', color: '#000' }}>{title}</p>
      <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>{body}</p>
    </div>
  );
}
