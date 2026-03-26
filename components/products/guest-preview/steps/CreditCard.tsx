'use client';

/**
 * CreditCard — Payment step using @canary-ui/components underline variants
 */

import React from 'react';
import {
  CanaryInputUnderline,
  CanaryInputCreditCardUnderline,
  InputSize,
} from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';

export function CreditCard() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const paymentOptions = useCheckInConfigStore((s) => s.paymentOptions);

  const depositText = paymentOptions.depositStrategy === 'charge'
    ? `We need your credit card to charge $${paymentOptions.depositAmount.toFixed(0)} for your stay.`
    : 'We need your credit card to authorize hotel charges and incidentals.';

  return (
    <div className="flex flex-col" style={{ padding: '32px 24px 24px', gap: 24 }}>
      {/* Instruction */}
      <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
        {depositText}
      </p>

      {/* Card fields */}
      <div className="flex flex-col" style={{ gap: 16 }}>
        <CanaryInputUnderline
          label="Name on card"
          size={InputSize.LARGE}
        />
        <CanaryInputCreditCardUnderline
          label="Credit card number"
          size={InputSize.LARGE}
        />
        <div className="flex" style={{ gap: 24 }}>
          <div className="flex-1">
            <CanaryInputUnderline
              label="Expiration date"
              size={InputSize.LARGE}
            />
          </div>
          <div className="flex-1">
            <CanaryInputUnderline
              label="CVV"
              size={InputSize.LARGE}
            />
          </div>
        </div>
        {paymentOptions.requirePostalCode && (
          <CanaryInputUnderline
            label="Billing postal code"
            size={InputSize.LARGE}
          />
        )}
      </div>

      {/* PCI compliance */}
      <p style={{ fontSize: 18, lineHeight: '28px', color: '#000' }}>
        We are <span className="font-medium underline">PCI-DSS Level-1 compliant</span>. Your information is safe and secure.
      </p>

      {paymentOptions.surchargeEnabled && (
        <p style={{ fontSize: 14, lineHeight: '22px', color: '#666' }}>
          A {paymentOptions.surchargePercent}% surcharge applies to credit card payments.
        </p>
      )}
    </div>
  );
}
