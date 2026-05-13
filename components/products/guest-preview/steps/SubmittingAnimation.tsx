'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { resolveIncludedSteps } from '@/lib/products/guest-preview/check-in-flow-engine';
import { CheckInStep } from '@/lib/products/guest-preview/types';
import Icon from '@mdi/react';
import { mdiCheck } from '@mdi/js';

const STEP_LABELS: Partial<Record<CheckInStep, string>> = {
  [CheckInStep.REGISTRATION_CARD]: 'Registration',
  [CheckInStep.ADDONS]: 'Add-ons',
  [CheckInStep.ID_PHOTOS]: 'ID verification',
  [CheckInStep.ID_VERIFICATION]: 'ID verification',
  [CheckInStep.CREDIT_CARD]: 'Credit card info',
  [CheckInStep.CREDIT_CARD_PHOTOS]: 'Card photos',
  [CheckInStep.ADDITIONAL_GUESTS]: 'Additional guests',
  [CheckInStep.SIGNATURE]: 'Signature',
};

const TRANSITION_DELAY_SECONDS = 1;

function DoorHangerV2({ color }: { color: string }) {
  return (
    <svg width="49" height="99" viewBox="0 0 49 99" fill={color} style={{ width: 90, height: 100 }}>
      <path d="M26.1234 0.552455C11.8504 -0.366374 -0.00292969 10.905 -0.00292969 24.9941V30.936C-0.00292969 34.2857 2.70804 37.0006 6.06167 37.0006C9.4001 37.0006 12.0954 34.3053 12.0954 30.936V25.3005C12.0954 17.0394 17.526 12.5589 24.4082 12.5589C37.701 12.5589 41.3764 30.4461 30.0745 36.97L3.21323 51.6717C1.22228 52.7437 -0.00292969 54.8264 -0.00292969 57.0624V95.44C-0.00292969 97.1246 1.37539 98.5029 3.05994 98.5029H45.9401C47.6553 98.5029 49.0029 97.1246 49.0029 95.44V25.8211C49.0029 12.7733 39.1406 1.37949 26.1234 0.552455ZM24.5 89.1305C19.4464 89.1305 15.3114 85.0264 15.3114 79.9419C15.3114 74.8577 19.4464 70.7533 24.5 70.7533C29.5845 70.7533 33.6886 74.8577 33.6886 79.9419C33.6886 85.0264 29.5845 89.1305 24.5 89.1305Z" />
    </svg>
  );
}

export function SubmittingAnimation() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const store = useCheckInConfigStore();
  const goToNextStep = useCheckInConfigStore((s) => s.goToNextStep);
  const resetFlow = useCheckInConfigStore((s) => s.resetFlow);

  const includedSteps = resolveIncludedSteps(store).filter(
    (s) =>
      s.step !== CheckInStep.RESERVATION_LANDING &&
      s.step !== CheckInStep.SUBMITTING &&
      s.step !== CheckInStep.COMPENDIUM &&
      s.isCounted
  );

  const [visibleCount, setVisibleCount] = useState(0);
  const [showLookForward, setShowLookForward] = useState(false);
  const totalSteps = includedSteps.length;

  useEffect(() => {
    if (visibleCount < totalSteps) {
      const timer = setTimeout(
        () => setVisibleCount((c) => c + 1),
        TRANSITION_DELAY_SECONDS * 1000
      );
      return () => clearTimeout(timer);
    }

    const lookForwardTimer = setTimeout(() => {
      setShowLookForward(true);
    }, TRANSITION_DELAY_SECONDS * 1000);

    const redirectTimer = setTimeout(() => {
      goToNextStep();
    }, (TRANSITION_DELAY_SECONDS + 2) * 1000);

    return () => {
      clearTimeout(lookForwardTimer);
      clearTimeout(redirectTimer);
    };
  }, [visibleCount, totalSteps, goToNextStep]);

  return (
    <div
      className="flex flex-col items-center h-full"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Progress section — centered vertically in the phone frame */}
      <div className="flex flex-col items-center justify-center flex-1 gap-10 px-10">
        {/* Door hanger icon — production: 90x100 */}
        <DoorHangerV2 color={theme.primaryColor} />

        {/* Title — production: $title-lg, headerColor, centered */}
        <h1
          className="text-[24px] font-semibold text-center leading-[36px]"
          style={{ color: theme.primaryColor }}
        >
          Thanks for submitting your check-in!
        </h1>

        {/* Checklist — production: 16px, 20px margin-bottom, staggered fade */}
        <div className="flex flex-col items-start">
          {includedSteps.map((step, i) => {
            const label = STEP_LABELS[step.step] ?? step.label;
            const isVisible = i < visibleCount;
            return (
              <div
                key={step.step}
                className="flex items-center mb-5 last:mb-0 transition-opacity duration-500"
                style={{ opacity: isVisible ? 1 : 0 }}
              >
                <div className="flex-shrink-0 mr-2.5" style={{ width: 18, height: 18 }}>
                  <Icon path={mdiCheck} size="18px" color={theme.primaryColor} />
                </div>
                <span
                  className="text-[16px] font-light leading-[24px]"
                  style={{ color: theme.fontColor }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Look forward text — appears after all checklist items */}
        <p
          className="text-[16px] font-light text-center leading-[24px] transition-opacity duration-500"
          style={{
            color: theme.fontColor,
            opacity: showLookForward ? 1 : 0,
          }}
        >
          We look forward to seeing you!
        </p>
      </div>
    </div>
  );
}
