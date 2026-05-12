'use client';

import React from 'react';
import { PhoneFrame } from '@/components/core/PhoneFrame';
import { CheckInFlow } from '@/components/products/guest-preview/CheckInFlow';
import { DemoStepNav } from '@/components/products/guest-preview/DemoStepNav';

export default function DemoCheckInPage() {
  return (
    <>
      {/* Phone frame stage */}
      <div className="flex-1 flex items-center justify-center p-8 min-w-0">
        <PhoneFrame>
          <CheckInFlow />
        </PhoneFrame>
      </div>

      {/* Step navigator */}
      <DemoStepNav />
    </>
  );
}
