'use client';

/**
 * CreditCard — Payment step
 *
 * Card form with deposit info, surcharge notice.
 * Adapts based on payment config parameters.
 */

import React, { useState } from 'react';
import { CanaryInput, CanaryCheckbox, InputType, InputSize } from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { DEMO_PAYMENT, DEMO_RESERVATION } from '@/lib/products/guest-preview/mock-form-data';
import { DepositStrategy } from '@/lib/products/guest-preview/types';
import Icon from '@mdi/react';
import { mdiCreditCardOutline, mdiLockOutline } from '@mdi/js';

export function CreditCard() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const paymentOptions = useCheckInConfigStore((s) => s.paymentOptions);
  const [saveCard, setSaveCard] = useState(true);

  const isCharge = paymentOptions.depositStrategy === DepositStrategy.CHARGE;
  const depositLabel = isCharge ? 'charged' : 'authorized';

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[18px] font-semibold" style={{ color: theme.fontColor }}>
          Payment Information
        </h2>
        <p className="text-[13px] text-[#6b7280] mt-1">
          A deposit of <strong>${paymentOptions.depositAmount.toFixed(2)}</strong> will be {depositLabel} on your card.
        </p>
      </div>

      {/* Deposit summary card */}
      <div className="rounded-lg border border-[#e5e7eb] p-4 mb-4" style={{ backgroundColor: theme.cardBackgroundColor }}>
        <div className="flex justify-between text-[13px] mb-2">
          <span className="text-[#6b7280]">Room Rate ({DEMO_RESERVATION.nights} nights)</span>
          <span className="font-medium text-[#111827]">${DEMO_RESERVATION.estimatedTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[13px] mb-2">
          <span className="text-[#6b7280]">Deposit ({isCharge ? 'Charge' : 'Auth hold'})</span>
          <span className="font-medium text-[#111827]">${paymentOptions.depositAmount.toFixed(2)}</span>
        </div>
        {paymentOptions.surchargeEnabled && (
          <div className="flex justify-between text-[13px] mb-2">
            <span className="text-[#6b7280]">Card surcharge ({paymentOptions.surchargePercent}%)</span>
            <span className="font-medium text-[#111827]">
              ${(paymentOptions.depositAmount * paymentOptions.surchargePercent / 100).toFixed(2)}
            </span>
          </div>
        )}
        <div className="border-t border-[#e5e7eb] pt-2 mt-2 flex justify-between text-[14px]">
          <span className="font-semibold text-[#374151]">Total {depositLabel}</span>
          <span className="font-semibold" style={{ color: theme.primaryColor }}>
            ${(paymentOptions.depositAmount * (1 + (paymentOptions.surchargeEnabled ? paymentOptions.surchargePercent / 100 : 0))).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Card form */}
      <div className="flex items-center gap-2 mb-3">
        <Icon path={mdiCreditCardOutline} size={0.7} color="#6b7280" />
        <span className="text-[14px] font-medium text-[#374151]">Card Details</span>
      </div>

      <CanaryInput
        label="Cardholder Name"
        value={DEMO_PAYMENT.cardholderName}
        onChange={() => {}}
        size={InputSize.NORMAL}
      />
      <div className="mt-3">
        <CanaryInput
          label="Card Number"
          value={DEMO_PAYMENT.cardNumber}
          onChange={() => {}}
          size={InputSize.NORMAL}
          rightAddon={
            <span className="text-[12px] text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded">
              {DEMO_PAYMENT.cardBrand}
            </span>
          }
        />
      </div>
      <div className="mt-3 flex gap-3">
        <div className="flex-1">
          <CanaryInput
            label="Expiry"
            value={`${DEMO_PAYMENT.expiryMonth}/${DEMO_PAYMENT.expiryYear}`}
            onChange={() => {}}
            size={InputSize.NORMAL}
          />
        </div>
        <div className="w-24">
          <CanaryInput
            label="CVV"
            value="•••"
            onChange={() => {}}
            size={InputSize.NORMAL}
            type={InputType.PASSWORD}
          />
        </div>
      </div>

      {/* Postal code (conditional) */}
      {paymentOptions.requirePostalCode && (
        <div className="mt-3">
          <CanaryInput
            label="Billing Postal Code"
            value={DEMO_PAYMENT.postalCode}
            onChange={() => {}}
            size={InputSize.NORMAL}
          />
        </div>
      )}

      {/* Save card checkbox */}
      <div className="mt-4 flex items-start gap-2">
        <div className="mt-0.5">
          <CanaryCheckbox
            checked={saveCard}
            onChange={() => setSaveCard(!saveCard)}
          />
        </div>
        <span className="text-[13px] text-[#6b7280]">
          Save this card for future stays
        </span>
      </div>

      {/* Security notice */}
      <div className="mt-4 flex items-center gap-2 text-[12px] text-[#9ca3af]">
        <Icon path={mdiLockOutline} size={0.5} />
        <span>Your payment information is encrypted and secure.</span>
      </div>

      {/* Surcharge notice */}
      {paymentOptions.surchargeEnabled && (
        <div className="mt-3 p-3 bg-[#fffbeb] border border-[#fef3c7] rounded text-[12px] text-[#92400e]">
          A {paymentOptions.surchargePercent}% surcharge applies to credit card payments. This covers processing fees.
        </div>
      )}
    </div>
  );
}
