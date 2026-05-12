'use client';

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { resolveIncludedSteps } from '@/lib/products/guest-preview/check-in-flow-engine';
import { CheckInStep } from '@/lib/products/guest-preview/types';
import Icon from '@mdi/react';
import {
  mdiHomeOutline,
  mdiFileDocumentEditOutline,
  mdiCartOutline,
  mdiCardAccountDetailsOutline,
  mdiCreditCardOutline,
  mdiCameraOutline,
  mdiAccountMultipleOutline,
  mdiDrawPen,
  mdiCheckCircleOutline,
  mdiViewDashboardOutline,
  mdiRestart,
} from '@mdi/js';

const STEP_ICONS: Record<CheckInStep, string> = {
  [CheckInStep.RESERVATION_LANDING]: mdiHomeOutline,
  [CheckInStep.REGISTRATION_CARD]: mdiFileDocumentEditOutline,
  [CheckInStep.ADDONS]: mdiCartOutline,
  [CheckInStep.ID_PHOTOS]: mdiCardAccountDetailsOutline,
  [CheckInStep.ID_VERIFICATION]: mdiCardAccountDetailsOutline,
  [CheckInStep.CREDIT_CARD]: mdiCreditCardOutline,
  [CheckInStep.CREDIT_CARD_PHOTOS]: mdiCameraOutline,
  [CheckInStep.ADDITIONAL_GUESTS]: mdiAccountMultipleOutline,
  [CheckInStep.SIGNATURE]: mdiDrawPen,
  [CheckInStep.SUBMITTING]: mdiCheckCircleOutline,
  [CheckInStep.COMPENDIUM]: mdiViewDashboardOutline,
};

const STEP_LABELS: Record<CheckInStep, string> = {
  [CheckInStep.RESERVATION_LANDING]: 'Welcome',
  [CheckInStep.REGISTRATION_CARD]: 'Registration',
  [CheckInStep.ADDONS]: 'Add-ons',
  [CheckInStep.ID_PHOTOS]: 'ID Verification',
  [CheckInStep.ID_VERIFICATION]: 'ID Verification',
  [CheckInStep.CREDIT_CARD]: 'Payment',
  [CheckInStep.CREDIT_CARD_PHOTOS]: 'Card Photos',
  [CheckInStep.ADDITIONAL_GUESTS]: 'Additional Guests',
  [CheckInStep.SIGNATURE]: 'Signature',
  [CheckInStep.SUBMITTING]: 'Confirmation',
  [CheckInStep.COMPENDIUM]: 'Compendium',
};

export function DemoStepNav() {
  const store = useCheckInConfigStore();
  const includedSteps = resolveIncludedSteps(store);
  const currentIndex = store.currentStepIndex;

  return (
    <div className="w-[220px] h-full flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-[13px] font-semibold text-[#8b8ba3] uppercase tracking-wider">
          Steps
        </h2>
      </div>

      {/* Step list */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="flex flex-col gap-1">
          {includedSteps.map((step, i) => {
            const isCurrent = i === currentIndex;
            const isPast = i < currentIndex;

            return (
              <button
                key={step.step}
                onClick={() => store.goToStep(i)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                  ${isCurrent
                    ? 'bg-[#2d2d44] text-white'
                    : isPast
                      ? 'text-[#6b6b85] hover:bg-[#22223a] hover:text-[#a0a0b8]'
                      : 'text-[#4a4a64] hover:bg-[#22223a] hover:text-[#8b8ba3]'
                  }
                `}
              >
                <Icon
                  path={STEP_ICONS[step.step]}
                  size={0.7}
                  color={isCurrent ? '#a78bfa' : isPast ? '#6b6b85' : '#4a4a64'}
                />
                <span className="text-[13px] font-medium leading-tight">
                  {STEP_LABELS[step.step]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer — Restart */}
      <div className="px-3 pb-6 pt-3">
        <button
          onClick={store.resetFlow}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[#6b6b85] hover:text-[#a0a0b8] hover:bg-[#22223a] transition-all w-full"
        >
          <Icon path={mdiRestart} size={0.6} />
          <span>Restart Flow</span>
        </button>
      </div>
    </div>
  );
}
