/**
 * RegistrationCardSection Component
 *
 * Translated from production: CheckInDetailsDocumentRegCardCard.vue
 *
 * Shows "Registration Card" header with SIGNED/NOT SIGNED tag and Print button.
 * When signed, renders a simulated registration card form on a gray background
 * with hotel logo, guest details, policy agreement checkbox, and signature.
 *
 * CanaryCard parent provides border + 24px padding.
 */

'use client';

import React from 'react';
import {
  CanaryButton,
  CanaryTag,
  CanaryCheckbox,
  ButtonType,
  ButtonSize,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';

interface RegistrationCardSectionProps {
  guest: Guest;
  reservation?: Reservation;
  isSubmitted: boolean;
}

export function RegistrationCardSection({
  guest,
  reservation,
  isSubmitted,
}: RegistrationCardSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="text-[18px] font-medium"
          style={{ color: colors.colorBlack1 }}
        >
          Registration Card
        </span>
        {isSubmitted ? (
          <CanaryTag
            label="SIGNED"
            color={TagColor.SUCCESS}
            size={TagSize.COMPACT}
          />
        ) : (
          <CanaryTag
            label="NOT SIGNED"
            color={TagColor.DEFAULT}
            size={TagSize.COMPACT}
          />
        )}
        {isSubmitted && (
          <CanaryButton
            type={ButtonType.TEXT}
            size={ButtonSize.COMPACT}
            className="ml-auto"
          >
            Print
          </CanaryButton>
        )}
      </div>

      {/* Content */}
      {!isSubmitted ? (
        <div
          className="flex items-center justify-center"
          style={{ height: 80, color: colors.colorBlack4 }}
        >
          <span className="text-[13px]">Not signed yet</span>
        </div>
      ) : (
        /* Simulated registration card on gray background */
        <div
          className="flex flex-col items-center overflow-hidden"
          style={{
            backgroundColor: colors.colorBlack7,
            borderRadius: 8,
          }}
        >
          {/* Hotel logo */}
          <div
            className="flex items-center justify-center"
            style={{ paddingTop: 24, paddingBottom: 8 }}
          >
            <span
              className="text-[22px] font-semibold italic"
              style={{ color: colors.colorBlack2 }}
            >
              The Grand Hotel
            </span>
          </div>

          {/* Registration form */}
          <div
            className="w-full"
            style={{ padding: '12px 24px 24px', maxWidth: 600 }}
          >
            {/* Guest details grid */}
            <div
              style={{
                border: `1px solid ${colors.colorBlack6}`,
                borderRadius: 4,
                marginBottom: 16,
              }}
            >
              <DetailRow label="Guest" value={guest.name} />
              <DetailRow
                label="Check-in"
                value={reservation?.checkInDate || '—'}
              />
              <DetailRow
                label="Check-out"
                value={reservation?.checkOutDate || '—'}
              />
              <DetailRow
                label="Loyalty Program"
                value={guest.statusTag?.label || 'Non-Member'}
                isLast
              />
            </div>

            {/* Email field */}
            <FormField label="Email" value={guest.email || '—'} />

            {/* Phone + Estimated Arrival */}
            <div className="flex gap-4">
              <div className="flex-1">
                <FormField label="Phone" value={guest.phone || '—'} />
              </div>
              <div className="flex-1">
                <FormField label="Estimated Arrival Time" value="—" />
              </div>
            </div>

            {/* Special Requests */}
            <div style={{ marginBottom: 16 }}>
              <span
                className="text-[12px]"
                style={{ color: colors.colorBlack3, display: 'block', marginBottom: 4 }}
              >
                Special Requests:
              </span>
              <div
                style={{
                  border: `1px solid ${colors.colorBlack6}`,
                  borderRadius: 4,
                  backgroundColor: 'white',
                  padding: '8px 12px',
                  minHeight: 48,
                  color: colors.colorBlack4,
                  fontSize: 13,
                }}
              />
            </div>

            {/* Hotel policies */}
            <div style={{ marginBottom: 12 }}>
              <p
                className="text-[12px] font-medium"
                style={{ color: colors.colorBlack1, marginBottom: 4 }}
              >
                Please review the following hotel policies:
              </p>
              <ul
                className="text-[12px] list-disc pl-5"
                style={{ color: colors.colorBlack2 }}
              >
                <li>Your hotel policies go here.</li>
                <li>
                  For example: This hotel is a 100% non-smoking property.
                  Violation of this policy will result in a $250 fee.
                </li>
              </ul>
            </div>

            {/* Policy agreement checkbox */}
            <div style={{ marginBottom: 16 }}>
              <CanaryCheckbox
                label="I have read and agree to the above Hotel Policies. (required)"
                checked={true}
                isDisabled={true}
                size="normal"
              />
            </div>

            {/* Signature */}
            <div
              style={{
                border: `1px solid ${colors.colorBlack6}`,
                borderRadius: 4,
                backgroundColor: 'white',
                padding: 16,
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="italic"
                style={{
                  fontFamily: '"Dancing Script", "Brush Script MT", cursive',
                  fontSize: 32,
                  color: colors.colorBlack2,
                }}
              >
                {guest.name}
              </span>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-center"
              style={{ marginTop: 12 }}
            >
              <span
                className="text-[10px]"
                style={{ color: colors.colorBlack4 }}
              >
                Created by Canary &middot; SMKOUTMPUT
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helper components ─── */

function DetailRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '6px 12px',
        borderBottom: isLast ? undefined : `1px solid ${colors.colorBlack6}`,
      }}
    >
      <span className="text-[12px]" style={{ color: colors.colorBlack3 }}>
        {label}
      </span>
      <span className="text-[12px]" style={{ color: colors.colorBlack1 }}>
        {value}
      </span>
    </div>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <span
        className="text-[12px]"
        style={{ color: colors.colorBlack3, display: 'block', marginBottom: 4 }}
      >
        {label}
      </span>
      <div
        style={{
          border: `1px solid ${colors.colorBlack6}`,
          borderRadius: 4,
          backgroundColor: 'white',
          padding: '6px 12px',
          fontSize: 13,
          color: colors.colorBlack1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
