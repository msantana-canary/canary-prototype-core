'use client';

/**
 * CreditCard — Payment step matching Figma
 *
 * Underline inputs, instruction text, PCI compliance note.
 * Button is rendered by parent CheckInFlow.
 */

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';

export function CreditCard() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const paymentOptions = useCheckInConfigStore((s) => s.paymentOptions);

  const depositText = paymentOptions.depositStrategy === 'charge'
    ? `We need your credit card to charge $${paymentOptions.depositAmount.toFixed(0)} for your stay.`
    : 'We need your credit card to authorize hotel charges and incidentals.';

  return (
    <div className="flex flex-col gap-8 px-6 pt-8 pb-6">
      {/* Instruction */}
      <p className="text-[18px] text-black leading-[28px]">
        {depositText}
      </p>

      {/* Card fields — underline style matching Figma */}
      <div className="flex flex-col gap-4">
        <input
          placeholder="Name on card"
          className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-3 text-[20px] leading-[30px] text-black placeholder:text-[#666] outline-none"
        />
        <input
          placeholder="Credit card number"
          className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-3 text-[20px] leading-[30px] text-black placeholder:text-[#666] outline-none"
        />
        <div className="flex gap-6">
          <input
            placeholder="Expiration date"
            className="flex-1 border-b border-[rgba(0,0,0,0.5)] bg-transparent py-3 text-[20px] leading-[30px] text-black placeholder:text-[#666] outline-none"
          />
          <input
            placeholder="CVV"
            className="flex-1 border-b border-[rgba(0,0,0,0.5)] bg-transparent py-3 text-[20px] leading-[30px] text-black placeholder:text-[#666] outline-none"
          />
        </div>
        {paymentOptions.requirePostalCode && (
          <input
            placeholder="Billing postal code"
            className="w-full border-b border-[rgba(0,0,0,0.5)] bg-transparent py-3 text-[20px] leading-[30px] text-black placeholder:text-[#666] outline-none"
          />
        )}
      </div>

      {/* PCI compliance note */}
      <p className="text-[18px] text-black leading-[28px]">
        We are <span className="font-medium underline">PCI-DSS Level-1 compliant</span>. Your information is safe and secure.
      </p>

      {/* Surcharge notice */}
      {paymentOptions.surchargeEnabled && (
        <p className="text-[14px] text-[#666] leading-[22px]">
          A {paymentOptions.surchargePercent}% surcharge applies to credit card payments.
        </p>
      )}
    </div>
  );
}
