'use client';

/**
 * RegistrationCard — Pre-filled registration form
 *
 * All 14 field groups toggled by sidebar parameters.
 * Includes signature pad and bottom sheets for policy/reservation info.
 */

import React, { useState } from 'react';
import {
  CanaryInput,
  CanarySelect,
  CanaryTextArea,
  CanaryCheckbox,
  InputType,
  InputSize,
} from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { DEMO_REG_CARD, HOTEL_POLICY_TEXT, DEMO_RESERVATION } from '@/lib/products/guest-preview/mock-form-data';
import { GuestSignaturePad } from '@/components/core/GuestSignaturePad';
import { GuestBottomSheet } from '@/components/core/GuestBottomSheet';
import { BorderRadius } from '@/lib/products/guest-preview/types';

const ARRIVAL_TIME_OPTIONS = [
  { value: '', label: 'Select arrival time' },
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

const TRAVEL_DOC_TYPE_OPTIONS = [
  { value: '', label: 'Select document type' },
  { value: 'Passport', label: 'Passport' },
  { value: 'National ID', label: 'National ID' },
  { value: 'Visa', label: 'Visa' },
  { value: 'Other', label: 'Other' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[14px] font-semibold text-[#374151] mt-4 mb-2 first:mt-0">
      {children}
    </h3>
  );
}

function FieldGroup({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  if (!visible) return null;
  return <>{children}</>;
}

export function RegistrationCard() {
  const regCardFields = useCheckInConfigStore((s) => s.regCardFields);
  const theme = useCheckInConfigStore((s) => s.theme);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [reservationInfoOpen, setReservationInfoOpen] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Form state (pre-filled)
  const [formData, setFormData] = useState(DEMO_REG_CARD);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const borderRadius = theme.borderRadius === BorderRadius.SQUARE ? '0px' :
    theme.borderRadius === BorderRadius.CIRCULAR ? '24px' : '4px';

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-[18px] font-semibold" style={{ color: theme.fontColor }}>
          Registration Card
        </h2>
        <p className="text-[13px] text-[#6b7280] mt-0.5">
          Please review and update your information.
        </p>
        <button
          onClick={() => setReservationInfoOpen(true)}
          className="text-[13px] mt-1 font-medium"
          style={{ color: theme.primaryColor }}
        >
          View reservation details
        </button>
      </div>

      {/* Name fields — always shown */}
      <SectionTitle>Guest Information</SectionTitle>
      <div className="flex gap-3">
        <div className="flex-1">
          <CanaryInput
            label="First Name"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            size={InputSize.NORMAL}
            isRequired
          />
        </div>
        <div className="flex-1">
          <CanaryInput
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            size={InputSize.NORMAL}
            isRequired
          />
        </div>
      </div>

      {/* Contact Info */}
      <FieldGroup visible={regCardFields.contactInfo}>
        <div className="mt-3">
          <CanaryInput
            label="Email"
            type={InputType.EMAIL}
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
        <div className="mt-3">
          <CanaryInput
            label="Phone"
            type={InputType.TEL}
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
      </FieldGroup>

      {/* Date of Birth */}
      <FieldGroup visible={regCardFields.dateOfBirth}>
        <div className="mt-3">
          <CanaryInput
            label="Date of Birth"
            type={InputType.DATE}
            value={formData.dateOfBirth}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
      </FieldGroup>

      {/* Gender */}
      <FieldGroup visible={regCardFields.gender}>
        <div className="mt-3">
          <CanarySelect
            label="Gender"
            value={formData.gender}
            onChange={(e) => updateField('gender', e.target.value)}
            size={InputSize.NORMAL}
            options={GENDER_OPTIONS}
          />
        </div>
      </FieldGroup>

      {/* Nationality */}
      <FieldGroup visible={regCardFields.nationality}>
        <div className="mt-3">
          <CanaryInput
            label="Nationality"
            value={formData.nationality}
            onChange={(e) => updateField('nationality', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
      </FieldGroup>

      {/* Address */}
      <FieldGroup visible={regCardFields.address}>
        <SectionTitle>Address</SectionTitle>
        <CanaryInput
          label="Street Address"
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          size={InputSize.NORMAL}
        />
        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <CanaryInput
              label="City"
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
          <div className="w-20">
            <CanaryInput
              label="State"
              value={formData.state}
              onChange={(e) => updateField('state', e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
        </div>
        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <CanaryInput
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => updateField('postalCode', e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
          <div className="flex-1">
            <CanaryInput
              label="Country"
              value={formData.country}
              onChange={(e) => updateField('country', e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
        </div>
      </FieldGroup>

      {/* Passport / Travel Doc */}
      <FieldGroup visible={regCardFields.passportTravelDoc}>
        <SectionTitle>Travel Document</SectionTitle>
        <CanarySelect
          label="Document Type"
          value={formData.travelDocType}
          onChange={(e) => updateField('travelDocType', e.target.value)}
          size={InputSize.NORMAL}
          options={TRAVEL_DOC_TYPE_OPTIONS}
        />
        <div className="mt-3">
          <CanaryInput
            label="Document Number"
            value={formData.travelDocNumber}
            onChange={(e) => updateField('travelDocNumber', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
        <div className="mt-3">
          <CanaryInput
            label="Country of Issue"
            value={formData.travelDocCountry}
            onChange={(e) => updateField('travelDocCountry', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <CanaryInput
              label="Issue Date"
              type={InputType.DATE}
              value={formData.travelDocIssueDate}
              onChange={(e) => updateField('travelDocIssueDate', e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
          <div className="flex-1">
            <CanaryInput
              label="Expiry Date"
              type={InputType.DATE}
              value={formData.travelDocExpiryDate}
              onChange={(e) => updateField('travelDocExpiryDate', e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
        </div>
        <div className="mt-3">
          <CanaryInput
            label="Place of Issue"
            value={formData.travelDocPlaceOfIssue}
            onChange={(e) => updateField('travelDocPlaceOfIssue', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
      </FieldGroup>

      {/* Vehicle Info */}
      <FieldGroup visible={regCardFields.vehicleInfo}>
        <SectionTitle>Vehicle Information</SectionTitle>
        <CanaryInput
          label="License Plate"
          value={formData.licensePlate}
          onChange={(e) => updateField('licensePlate', e.target.value)}
          size={InputSize.NORMAL}
        />
        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <CanaryInput
              label="Make"
              value={formData.vehicleMake}
              onChange={(e) => updateField('vehicleMake', e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
          <div className="flex-1">
            <CanaryInput
              label="Model"
              value={formData.vehicleModel}
              onChange={(e) => updateField('vehicleModel', e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>
        </div>
        <div className="mt-3">
          <CanaryInput
            label="Color"
            value={formData.vehicleColor}
            onChange={(e) => updateField('vehicleColor', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
      </FieldGroup>

      {/* Loyalty Program */}
      <FieldGroup visible={regCardFields.loyaltyProgram}>
        <SectionTitle>Loyalty Program</SectionTitle>
        <CanaryInput
          label="Loyalty Number"
          value={formData.loyaltyNumber}
          onChange={(e) => updateField('loyaltyNumber', e.target.value)}
          size={InputSize.NORMAL}
        />
        <div className="mt-3">
          <CanaryInput
            label="Loyalty Tier"
            value={formData.loyaltyTier}
            onChange={(e) => updateField('loyaltyTier', e.target.value)}
            size={InputSize.NORMAL}
            isReadonly
          />
        </div>
      </FieldGroup>

      {/* Company Billing */}
      <FieldGroup visible={regCardFields.companyBilling}>
        <SectionTitle>Company Billing</SectionTitle>
        <CanaryInput
          label="Company Name"
          value={formData.companyName}
          onChange={(e) => updateField('companyName', e.target.value)}
          size={InputSize.NORMAL}
        />
        <div className="mt-3">
          <CanaryInput
            label="VAT / Tax ID"
            value={formData.companyVat}
            onChange={(e) => updateField('companyVat', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
        <div className="mt-3">
          <CanaryInput
            label="Company Address"
            value={formData.companyAddress}
            onChange={(e) => updateField('companyAddress', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
      </FieldGroup>

      {/* Arrival Time */}
      <FieldGroup visible={regCardFields.arrivalTime}>
        <SectionTitle>Arrival</SectionTitle>
        <CanarySelect
          label="Estimated Arrival Time"
          value={formData.arrivalTime}
          onChange={(e) => updateField('arrivalTime', e.target.value)}
          size={InputSize.NORMAL}
          options={ARRIVAL_TIME_OPTIONS}
        />
      </FieldGroup>

      {/* Special Requests */}
      <FieldGroup visible={regCardFields.specialRequests}>
        <div className="mt-3">
          <CanaryTextArea
            label="Special Requests"
            value={formData.specialRequests}
            onChange={(e) => updateField('specialRequests', e.target.value)}
            size={InputSize.NORMAL}
          />
        </div>
      </FieldGroup>

      {/* Hotel Policy */}
      <FieldGroup visible={regCardFields.hotelPolicy}>
        <div className="mt-4 p-3 bg-[#f9fafb] rounded border border-[#e5e7eb]" style={{ borderRadius }}>
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <CanaryCheckbox
                checked={policyAgreed}
                onChange={() => setPolicyAgreed(!policyAgreed)}
              />
            </div>
            <div>
              <span className="text-[13px] text-[#374151]">
                I agree to the{' '}
                <button
                  onClick={() => setPolicyOpen(true)}
                  className="font-medium underline"
                  style={{ color: theme.primaryColor }}
                >
                  hotel terms and conditions
                </button>
              </span>
            </div>
          </div>
        </div>
      </FieldGroup>

      {/* Marketing Consent */}
      <FieldGroup visible={regCardFields.marketingConsent}>
        <div className="mt-3 flex items-start gap-2">
          <div className="mt-0.5">
            <CanaryCheckbox
              checked={marketingConsent}
              onChange={() => setMarketingConsent(!marketingConsent)}
            />
          </div>
          <span className="text-[13px] text-[#6b7280]">
            I would like to receive promotional offers and updates from {DEMO_RESERVATION.roomType === 'King Suite' ? 'Statler New York' : 'the hotel'}.
          </span>
        </div>
      </FieldGroup>

      {/* Signature */}
      <FieldGroup visible={regCardFields.signature}>
        <SectionTitle>Signature</SectionTitle>
        <GuestSignaturePad
          borderRadius={borderRadius}
        />
      </FieldGroup>

      {/* Bottom Sheets */}
      <GuestBottomSheet
        isOpen={policyOpen}
        onClose={() => setPolicyOpen(false)}
        title="Hotel Terms & Conditions"
      >
        <p className="text-[13px] text-[#374151] leading-relaxed whitespace-pre-wrap">
          {HOTEL_POLICY_TEXT}
        </p>
      </GuestBottomSheet>

      <GuestBottomSheet
        isOpen={reservationInfoOpen}
        onClose={() => setReservationInfoOpen(false)}
        title="Reservation Details"
      >
        <div className="space-y-3">
          <InfoRow label="Confirmation" value={DEMO_RESERVATION.confirmationCode} />
          <InfoRow label="Check-in" value={DEMO_RESERVATION.checkInDate} />
          <InfoRow label="Check-out" value={DEMO_RESERVATION.checkOutDate} />
          <InfoRow label="Room" value={`${DEMO_RESERVATION.roomNumber} — ${DEMO_RESERVATION.roomType}`} />
          <InfoRow label="Rate" value={DEMO_RESERVATION.rateCode} />
          <InfoRow label="Estimated Total" value={`$${DEMO_RESERVATION.estimatedTotal.toFixed(2)}`} />
        </div>
      </GuestBottomSheet>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[13px] text-[#6b7280]">{label}</span>
      <span className="text-[13px] font-medium text-[#111827]">{value}</span>
    </div>
  );
}
