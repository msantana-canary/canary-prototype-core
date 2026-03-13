/**
 * PaymentCardSection Component
 *
 * Translated from production: CheckInPaymentVerificationCard.vue +
 * CheckInDetailsPaymentCardPreview.vue
 *
 * Border/radius handled by parent wrapper in CheckInDetailPanel.
 * Internal padding: 16px (production .defaultLoading).
 *
 * Responsive internal layout (production .documentVerificationCardContainer):
 *   >= 1681px (side-by-side with ID): vertical — card → button → checks
 *   < 1681px (stacked with ID): 2-col grid — checks left, card+button right
 *
 * Card: CR80 ratio (250px × 396px) with gray gradient (fixed dimensions).
 * Auto-verified checks use green checkmark icons. Manual check uses CanaryCheckbox.
 * Report Dispute button constrained to card width.
 */

'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiCheck } from '@mdi/js';
import { CanaryButton, CanaryCheckbox, CanaryTag, ButtonType, ButtonSize, ButtonColor, TagColor, TagSize, colors } from '@canary-ui/components';
import { Reservation } from '@/lib/core/types/reservation';

// CR80 card dimensions (from production SCSS)
const CARD_WIDTH = 396;
const CARD_HEIGHT = 250;
const CARD_BORDER_RADIUS = Math.round(CARD_HEIGHT * (0.125 / 2.125));

/** Green checkmark icon matching production's .successIcon (fill: $success-color) */
function GreenCheck() {
  return (
    <Icon path={mdiCheck} size={0.67} color="#008040" className="shrink-0" />
  );
}

interface PaymentCardSectionProps {
  reservation?: Reservation;
  isVerified: boolean;
  isReadOnly: boolean;
}

export function PaymentCardSection({
  reservation,
  isVerified,
  isReadOnly,
}: PaymentCardSectionProps) {
  const card = reservation?.paymentCard;
  const [nameConfirmed, setNameConfirmed] = useState(isVerified);

  if (!card) {
    return (
      <div
        className="flex-1 flex flex-col gap-4"
        style={{
          padding: 16,
          minWidth: 0,
        }}
      >
        <div className="flex items-center gap-4">
          <span
            className="text-[14px] font-medium"
            style={{ color: colors.colorBlack1 }}
          >
            Payment card
          </span>
        </div>
        <div className="h-[250px] flex items-center justify-center">
          <span className="text-[13px]" style={{ color: colors.colorBlack4 }}>
            Guest payment info is not submitted.
          </span>
        </div>
      </div>
    );
  }

  const brandLogo = card.brand === 'Amex' ? 'AMEX' : card.brand.toUpperCase();
  const expiryStr = `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}`;
  const pendingCount = nameConfirmed ? 0 : 1;

  return (
    <div style={{ padding: 16, minWidth: 0 }}>
      <style>{`
        .payment-section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .payment-section-content {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: start;
        }
        .payment-section-checks label {
          padding: 4px 0 !important;
        }

        @media (min-width: 1681px) {
          .payment-section-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .payment-section-card { order: 1; }
          .payment-section-checks { order: 2; }
        }
      `}</style>

      {/* Sub-section header — matches production .cardHeader */}
      <div className="payment-section-header">
        <span
          className="text-[14px] font-medium"
          style={{ color: colors.colorBlack1 }}
        >
          Payment card
        </span>
        {pendingCount > 0 ? (
          <CanaryTag
            label={`${pendingCount} Pending`}
            color={TagColor.DEFAULT}
            size={TagSize.COMPACT}
          />
        ) : (
          <CanaryTag label="Completed" size={TagSize.COMPACT} />
        )}
      </div>

      {/* Content: checks + card — grid switches between 2-col (stacked) and vertical (side-by-side) */}
      <div className="payment-section-content">
        {/* Verification checks */}
        <div className="payment-section-checks">
          <div className="flex flex-col gap-1">
            {/* Auto-verified — production: .successIcon + label (non-editable, value=true) */}
            <div className="flex items-center gap-2 h-8">
              <GreenCheck />
              <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
                Billing zip code verified
              </span>
            </div>
            <div className="flex items-center gap-2 h-8">
              <GreenCheck />
              <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
                CVC verified
              </span>
            </div>
            <div className="flex items-center gap-2 h-8">
              <GreenCheck />
              <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
                Card not expired
              </span>
            </div>

            {/* Manual check — production: CanaryCheckbox (editable) */}
            <CanaryCheckbox
              label="Verify ID and Credit Card name match"
              checked={nameConfirmed}
              onChange={() => !isReadOnly && setNameConfirmed(!nameConfirmed)}
              isDisabled={isReadOnly}
              size="normal"
            />
          </div>

          {/* Report Dispute */}
          <div style={{ marginTop: 12 }}>
            <CanaryButton
              type={ButtonType.OUTLINED}
              size={ButtonSize.COMPACT}
            >
              Report Dispute
            </CanaryButton>
          </div>
        </div>

        {/* Card visual + Report Dispute */}
        <div className="payment-section-card">
          {/* Card preview — production: .paymentCard with grid layout */}
          <div
            className="overflow-hidden shrink-0"
            style={{
              background: 'linear-gradient(to right, #535a6a, #31353f)',
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              borderRadius: CARD_BORDER_RADIUS,
              padding: 25,
              display: 'grid',
              gridTemplateColumns: 'auto auto',
              gridTemplateRows: '1fr 1fr 1fr',
              fontFamily: '"Roboto Mono", monospace',
            }}
          >
            {/* Row 1, Col 1: Brand logo */}
            <span className="text-white/90 text-[15px] font-bold tracking-wider self-start">
              {brandLogo}
            </span>

            {/* Row 1, Col 2: Show number button */}
            <div className="flex justify-end">
              <CanaryButton
                type={ButtonType.OUTLINED}
                size={ButtonSize.COMPACT}
                color={ButtonColor.WHITE}
              >
                Show number
              </CanaryButton>
            </div>

            {/* Row 2: Card number (spans both columns) */}
            <div className="flex justify-between items-center" style={{ gridColumn: '1 / span 2' }}>
              <span className="text-white text-[20px] font-medium tracking-[3px]">
                {'•••• •••• •••• '}{card.last4}
              </span>
            </div>

            {/* Row 3: Bottom info (spans both columns) */}
            <div className="flex justify-between items-end gap-2" style={{ gridColumn: '1 / span 2', margin: '8px 0' }}>
              <div>
                <p className="text-white/50 text-[10px] uppercase whitespace-nowrap">
                  Cardholder
                </p>
                <p className="text-white text-[13px] font-medium">
                  {card.cardholderName}
                </p>
              </div>
              <div>
                <p className="text-white/50 text-[10px] uppercase whitespace-nowrap">
                  Expiration
                </p>
                <p className="text-white text-[13px] font-medium">
                  {expiryStr}
                </p>
              </div>
              <div>
                <p className="text-white/50 text-[10px] uppercase whitespace-nowrap">
                  Postal code
                </p>
                <p className="text-white text-[13px] font-medium">
                  {card.postalCode}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
