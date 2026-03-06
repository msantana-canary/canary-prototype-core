/**
 * PaymentCardSection Component
 *
 * Production layout: header row (title + pending tag), then two-column
 * content with verification checks LEFT and card visualization RIGHT.
 * Auto-verified checks use green checkmark icons. Manual check uses CanaryCheckbox.
 * Report Dispute button below card.
 */

'use client';

import React, { useState } from 'react';
import { CanaryButton, CanaryCheckbox, CanaryTag, ButtonType, ButtonSize, ButtonColor, TagColor, TagSize, colors } from '@canary-ui/components';
import { Reservation } from '@/lib/core/types/reservation';

/** Green checkmark icon matching production's _successIcon */
function GreenCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 15 15" fill="none" className="shrink-0">
      <rect x="1.08333" y="0.583333" width="12.8333" height="12.8333" rx="6.41667" fill="#008040" stroke="#008040" strokeWidth="1.16667" />
      <path d="M6.44563 9.00375L4.62125 7.17937L4 7.79625L6.44563 10.2419L11.6956 4.99187L11.0788 4.375L6.44563 9.00375Z" fill="white" />
    </svg>
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
      <div className="flex-1 min-w-[420px]">
        <div className="flex items-center gap-2 mb-3">
          <h4
            className="text-[13px] font-medium"
            style={{ color: colors.colorBlack2 }}
          >
            Payment card
          </h4>
        </div>
        <div className="h-[200px] flex items-center justify-center">
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
    <div className="flex-1 min-w-[420px]">
      {/* Sub-section header */}
      <div className="flex items-center gap-2 mb-3">
        <h4
          className="text-[13px] font-medium"
          style={{ color: colors.colorBlack2 }}
        >
          Payment card
        </h4>
        {pendingCount > 0 && (
          <CanaryTag
            label={`${pendingCount} Pending`}
            color={TagColor.DEFAULT}
            size={TagSize.COMPACT}
          />
        )}
      </div>

      {/* flex-wrap-reverse: when wide enough → checks left, card right.
          When narrow → card wraps to top row, checks below. */}
      <div className="flex flex-wrap-reverse gap-4">
        {/* Checks — appears left when horizontal, below when stacked */}
        <div className="flex flex-col gap-2.5">
          {/* Auto-verified — green checkmark icons */}
          <div className="flex items-center gap-2">
            <GreenCheck />
            <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
              Billing zip code verified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GreenCheck />
            <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
              CVC verified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GreenCheck />
            <span className="text-[13px]" style={{ color: colors.colorBlack2 }}>
              Card not expired
            </span>
          </div>

          {/* Manual check */}
          <CanaryCheckbox
            label="Verify name matches ID"
            checked={nameConfirmed}
            onChange={() => !isReadOnly && setNameConfirmed(!nameConfirmed)}
            isDisabled={isReadOnly}
            size="normal"
          />
        </div>

        {/* Card + Report Dispute — fixed width, appears right when horizontal, on top when stacked */}
        <div className="w-[340px]">
          <div className="w-full rounded-xl p-5 mb-3 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a2744 0%, #2a3f6e 100%)' }}
          >
            {/* Brand */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-white/90 text-[15px] font-bold tracking-wider">
                {brandLogo}
              </span>
              <CanaryButton
                type={ButtonType.TEXT}
                size={ButtonSize.COMPACT}
                color={ButtonColor.WHITE}
              >
                Show number
              </CanaryButton>
            </div>

            {/* Masked number */}
            <p className="text-white text-[18px] tracking-[3px] font-mono mb-5">
              {'•••• •••• •••• '}{card.last4}
            </p>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">
                  Cardholder
                </p>
                <p className="text-white text-[12px] font-medium">
                  {card.cardholderName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">
                  Expiration
                </p>
                <p className="text-white text-[12px] font-medium">
                  {expiryStr}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">
                  Postal code
                </p>
                <p className="text-white text-[12px] font-medium">
                  {card.postalCode}
                </p>
              </div>
            </div>
          </div>

          {/* Report Dispute */}
          <CanaryButton
            type={ButtonType.OUTLINED}
            size={ButtonSize.COMPACT}
            isExpanded
          >
            Report Dispute
          </CanaryButton>
        </div>
      </div>
    </div>
  );
}
