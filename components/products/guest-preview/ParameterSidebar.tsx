'use client';

/**
 * ParameterSidebar — Right-side 320px configuration panel
 *
 * 7 grouped sections with CanarySwitch/CanarySelect controls.
 * Wired to the check-in config Zustand store.
 */

import React from 'react';
import { CanarySwitch, CanarySelect, CanaryInput, InputSize, InputType } from '@canary-ui/components';
import { ParameterSection } from './ParameterSection';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { OptionalStep, DepositStrategy, BorderRadius } from '@/lib/products/guest-preview/types';

const OPTIONAL_STEP_OPTIONS = [
  { value: OptionalStep.REQUIRED, label: 'Required' },
  { value: OptionalStep.OPTIONAL, label: 'Optional' },
  { value: OptionalStep.DISABLED, label: 'Disabled' },
];

const DEPOSIT_STRATEGY_OPTIONS = [
  { value: DepositStrategy.CHARGE, label: 'Charge' },
  { value: DepositStrategy.AUTHORIZE, label: 'Authorize' },
];

const BORDER_RADIUS_OPTIONS = [
  { value: BorderRadius.SQUARE, label: 'Sharp (0px)' },
  { value: BorderRadius.ROUND, label: 'Rounded (4px)' },
  { value: BorderRadius.CIRCULAR, label: 'Pill (24px)' },
];

function SidebarRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] text-[#4b5563] leading-tight">{label}</span>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function ParameterSidebar() {
  const store = useCheckInConfigStore();

  return (
    <div className="w-[320px] h-full bg-white border-l border-[#e5e7eb] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e5e7eb] flex-shrink-0">
        <h2 className="text-[14px] font-semibold text-[#111827]">Check-In Parameters</h2>
        <p className="text-[11px] text-[#9ca3af] mt-0.5">Toggle settings to preview different guest experiences</p>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Group 1: Flow Steps */}
        <ParameterSection title="Flow Steps">
          <SidebarRow label="Add-ons / Upsells">
            <CanarySwitch
              checked={store.addonsEnabled}
              onChange={() => store.setAddonsEnabled(!store.addonsEnabled)}
            />
          </SidebarRow>
          <SidebarRow label="ID Verification">
            <CanarySelect
              value={store.idMode}
              onChange={(e) => store.setIdMode(e.target.value as OptionalStep)}
              size={InputSize.NORMAL}
              options={OPTIONAL_STEP_OPTIONS}
            />
          </SidebarRow>
          {store.idMode !== OptionalStep.DISABLED && (
            <SidebarRow label="OCR (ID field extraction)">
              <CanarySwitch
                checked={store.idWithOCR}
                onChange={() => store.setIdWithOCR(!store.idWithOCR)}
              />
            </SidebarRow>
          )}
          <SidebarRow label="Credit Card">
            <CanarySelect
              value={store.creditCardMode}
              onChange={(e) => store.setCreditCardMode(e.target.value as OptionalStep)}
              size={InputSize.NORMAL}
              options={OPTIONAL_STEP_OPTIONS}
            />
          </SidebarRow>
          {store.creditCardMode !== OptionalStep.DISABLED && (
            <SidebarRow label="Credit Card Photos">
              <CanarySwitch
                checked={store.creditCardPhotosEnabled}
                onChange={() => store.setCreditCardPhotosEnabled(!store.creditCardPhotosEnabled)}
              />
            </SidebarRow>
          )}
          <SidebarRow label="Additional Guests">
            <CanarySwitch
              checked={store.additionalGuestsEnabled}
              onChange={() => store.setAdditionalGuestsEnabled(!store.additionalGuestsEnabled)}
            />
          </SidebarRow>
        </ParameterSection>

        {/* Group 2: Registration Card Fields */}
        <ParameterSection title="Registration Card" defaultOpen={false}>
          <SidebarRow label="Contact Info">
            <CanarySwitch
              checked={store.regCardFields.contactInfo}
              onChange={() => store.setRegCardField('contactInfo', !store.regCardFields.contactInfo)}
            />
          </SidebarRow>
          <SidebarRow label="Address">
            <CanarySwitch
              checked={store.regCardFields.address}
              onChange={() => store.setRegCardField('address', !store.regCardFields.address)}
            />
          </SidebarRow>
          <SidebarRow label="Arrival Time">
            <CanarySwitch
              checked={store.regCardFields.arrivalTime}
              onChange={() => store.setRegCardField('arrivalTime', !store.regCardFields.arrivalTime)}
            />
          </SidebarRow>
          <SidebarRow label="Special Requests">
            <CanarySwitch
              checked={store.regCardFields.specialRequests}
              onChange={() => store.setRegCardField('specialRequests', !store.regCardFields.specialRequests)}
            />
          </SidebarRow>
          <SidebarRow label="Date of Birth">
            <CanarySwitch
              checked={store.regCardFields.dateOfBirth}
              onChange={() => store.setRegCardField('dateOfBirth', !store.regCardFields.dateOfBirth)}
            />
          </SidebarRow>
          <SidebarRow label="Gender">
            <CanarySwitch
              checked={store.regCardFields.gender}
              onChange={() => store.setRegCardField('gender', !store.regCardFields.gender)}
            />
          </SidebarRow>
          <SidebarRow label="Nationality">
            <CanarySwitch
              checked={store.regCardFields.nationality}
              onChange={() => store.setRegCardField('nationality', !store.regCardFields.nationality)}
            />
          </SidebarRow>
          <SidebarRow label="Passport / Travel Doc">
            <CanarySwitch
              checked={store.regCardFields.passportTravelDoc}
              onChange={() => store.setRegCardField('passportTravelDoc', !store.regCardFields.passportTravelDoc)}
            />
          </SidebarRow>
          <SidebarRow label="Vehicle Info">
            <CanarySwitch
              checked={store.regCardFields.vehicleInfo}
              onChange={() => store.setRegCardField('vehicleInfo', !store.regCardFields.vehicleInfo)}
            />
          </SidebarRow>
          <SidebarRow label="Loyalty Program">
            <CanarySwitch
              checked={store.regCardFields.loyaltyProgram}
              onChange={() => store.setRegCardField('loyaltyProgram', !store.regCardFields.loyaltyProgram)}
            />
          </SidebarRow>
          <SidebarRow label="Company Billing">
            <CanarySwitch
              checked={store.regCardFields.companyBilling}
              onChange={() => store.setRegCardField('companyBilling', !store.regCardFields.companyBilling)}
            />
          </SidebarRow>
          <SidebarRow label="Hotel Policy">
            <CanarySwitch
              checked={store.regCardFields.hotelPolicy}
              onChange={() => store.setRegCardField('hotelPolicy', !store.regCardFields.hotelPolicy)}
            />
          </SidebarRow>
          <SidebarRow label="Marketing Consent">
            <CanarySwitch
              checked={store.regCardFields.marketingConsent}
              onChange={() => store.setRegCardField('marketingConsent', !store.regCardFields.marketingConsent)}
            />
          </SidebarRow>
          <SidebarRow label="Signature">
            <CanarySwitch
              checked={store.regCardFields.signature}
              isDisabled
              onChange={() => {}}
            />
          </SidebarRow>
        </ParameterSection>

        {/* Group 3: ID Options */}
        <ParameterSection
          title="ID Options"
          defaultOpen={false}
          visible={store.idMode !== OptionalStep.DISABLED}
        >
          <div className="text-[12px] text-[#6b7280] font-medium mb-1">Accepted ID Types</div>
          <SidebarRow label="Passport">
            <CanarySwitch
              checked={store.idOptions.acceptedTypes.passport}
              onChange={() => store.setIdAcceptedType('passport', !store.idOptions.acceptedTypes.passport)}
            />
          </SidebarRow>
          <SidebarRow label="Driver&#39;s License">
            <CanarySwitch
              checked={store.idOptions.acceptedTypes.driversLicense}
              onChange={() => store.setIdAcceptedType('driversLicense', !store.idOptions.acceptedTypes.driversLicense)}
            />
          </SidebarRow>
          <SidebarRow label="National ID">
            <CanarySwitch
              checked={store.idOptions.acceptedTypes.nationalId}
              onChange={() => store.setIdAcceptedType('nationalId', !store.idOptions.acceptedTypes.nationalId)}
            />
          </SidebarRow>
          <SidebarRow label="Require Back Photo">
            <CanarySwitch
              checked={store.idOptions.requireBackPhoto}
              onChange={() => store.setRequireBackPhoto(!store.idOptions.requireBackPhoto)}
            />
          </SidebarRow>
          <SidebarRow label="Require Selfie">
            <CanarySwitch
              checked={store.idOptions.requireSelfie}
              onChange={() => store.setRequireSelfie(!store.idOptions.requireSelfie)}
            />
          </SidebarRow>
        </ParameterSection>

        {/* Group 4: Payment */}
        <ParameterSection
          title="Payment"
          defaultOpen={false}
          visible={store.creditCardMode !== OptionalStep.DISABLED}
        >
          <SidebarRow label="Deposit Strategy">
            <CanarySelect
              value={store.paymentOptions.depositStrategy}
              onChange={(e) => store.setDepositStrategy(e.target.value as DepositStrategy)}
              size={InputSize.NORMAL}
              options={DEPOSIT_STRATEGY_OPTIONS}
            />
          </SidebarRow>
          <SidebarRow label="Deposit Amount ($)">
            <CanaryInput
              type={InputType.NUMBER}
              value={String(store.paymentOptions.depositAmount)}
              onChange={(e) => store.setDepositAmount(Number(e.target.value) || 0)}
              size={InputSize.NORMAL}
            />
          </SidebarRow>
          <SidebarRow label="Surcharge">
            <CanarySwitch
              checked={store.paymentOptions.surchargeEnabled}
              onChange={() => store.setSurchargeEnabled(!store.paymentOptions.surchargeEnabled)}
            />
          </SidebarRow>
          {store.paymentOptions.surchargeEnabled && (
            <SidebarRow label="Surcharge (%)">
              <CanaryInput
                type={InputType.NUMBER}
                value={String(store.paymentOptions.surchargePercent)}
                onChange={(e) => store.setSurchargePercent(Number(e.target.value) || 0)}
                size={InputSize.NORMAL}
              />
            </SidebarRow>
          )}
          <SidebarRow label="Require Postal Code">
            <CanarySwitch
              checked={store.paymentOptions.requirePostalCode}
              onChange={() => store.setRequirePostalCode(!store.paymentOptions.requirePostalCode)}
            />
          </SidebarRow>
        </ParameterSection>

        {/* Group 5: Additional Guest Fields */}
        <ParameterSection
          title="Additional Guest Fields"
          defaultOpen={false}
          visible={store.additionalGuestsEnabled}
        >
          <SidebarRow label="Full Name">
            <CanarySwitch checked isDisabled onChange={() => {}} />
          </SidebarRow>
          <SidebarRow label="Date of Birth">
            <CanarySwitch
              checked={store.additionalGuestFields.dateOfBirth}
              onChange={() => store.setAdditionalGuestField('dateOfBirth', !store.additionalGuestFields.dateOfBirth)}
            />
          </SidebarRow>
          <SidebarRow label="Gender">
            <CanarySwitch
              checked={store.additionalGuestFields.gender}
              onChange={() => store.setAdditionalGuestField('gender', !store.additionalGuestFields.gender)}
            />
          </SidebarRow>
          <SidebarRow label="Nationality">
            <CanarySwitch
              checked={store.additionalGuestFields.nationality}
              onChange={() => store.setAdditionalGuestField('nationality', !store.additionalGuestFields.nationality)}
            />
          </SidebarRow>
          <SidebarRow label="ID Upload">
            <CanarySwitch
              checked={store.additionalGuestFields.idUpload}
              onChange={() => store.setAdditionalGuestField('idUpload', !store.additionalGuestFields.idUpload)}
            />
          </SidebarRow>
          <SidebarRow label="Email">
            <CanarySwitch
              checked={store.additionalGuestFields.email}
              onChange={() => store.setAdditionalGuestField('email', !store.additionalGuestFields.email)}
            />
          </SidebarRow>
          <SidebarRow label="Phone">
            <CanarySwitch
              checked={store.additionalGuestFields.phone}
              onChange={() => store.setAdditionalGuestField('phone', !store.additionalGuestFields.phone)}
            />
          </SidebarRow>
          <SidebarRow label="Address">
            <CanarySwitch
              checked={store.additionalGuestFields.address}
              onChange={() => store.setAdditionalGuestField('address', !store.additionalGuestFields.address)}
            />
          </SidebarRow>
        </ParameterSection>

        {/* Group 6: Reservation Header Display */}
        <ParameterSection title="Reservation Header" defaultOpen={false}>
          <SidebarRow label="Room Number">
            <CanarySwitch
              checked={store.reservationHeader.roomNumber}
              onChange={() => store.setReservationHeaderField('roomNumber', !store.reservationHeader.roomNumber)}
            />
          </SidebarRow>
          <SidebarRow label="Room Type">
            <CanarySwitch
              checked={store.reservationHeader.roomType}
              onChange={() => store.setReservationHeaderField('roomType', !store.reservationHeader.roomType)}
            />
          </SidebarRow>
          <SidebarRow label="Estimated Total">
            <CanarySwitch
              checked={store.reservationHeader.estimatedTotal}
              onChange={() => store.setReservationHeaderField('estimatedTotal', !store.reservationHeader.estimatedTotal)}
            />
          </SidebarRow>
        </ParameterSection>

        {/* Group 7: Theme */}
        <ParameterSection title="Theme" defaultOpen={false}>
          <SidebarRow label="Primary Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={store.theme.primaryColor}
                onChange={(e) => store.setThemeField('primaryColor', e.target.value)}
                className="w-7 h-7 rounded border border-[#d1d5db] cursor-pointer"
                style={{ padding: 1 }}
              />
            </div>
          </SidebarRow>
          <SidebarRow label="Background">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={store.theme.backgroundColor}
                onChange={(e) => store.setThemeField('backgroundColor', e.target.value)}
                className="w-7 h-7 rounded border border-[#d1d5db] cursor-pointer"
                style={{ padding: 1 }}
              />
            </div>
          </SidebarRow>
          <SidebarRow label="Border Radius">
            <CanarySelect
              value={store.theme.borderRadius}
              onChange={(e) => store.setThemeField('borderRadius', e.target.value as BorderRadius)}
              size={InputSize.NORMAL}
              options={BORDER_RADIUS_OPTIONS}
            />
          </SidebarRow>
        </ParameterSection>
      </div>

      {/* Footer — Reset */}
      <div className="px-4 py-3 border-t border-[#e5e7eb] flex-shrink-0">
        <button
          onClick={store.resetConfig}
          className="text-[12px] text-[#6b7280] hover:text-[#374151] transition-colors"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
