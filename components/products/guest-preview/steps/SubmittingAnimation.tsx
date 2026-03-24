'use client';

/**
 * SubmittingAnimation — Animated checklist + completion celebration
 *
 * Shows an animated checklist of completed steps, then a success state.
 * Adapts to which steps were enabled in the flow.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CanaryButton, ButtonType, ButtonSize } from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { resolveIncludedSteps } from '@/lib/products/guest-preview/check-in-flow-engine';
import { CheckInStep } from '@/lib/products/guest-preview/types';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiCircleOutline, mdiPartyPopper } from '@mdi/js';

const STEP_LABELS: Partial<Record<CheckInStep, string>> = {
  [CheckInStep.REGISTRATION_CARD]: 'Registration card submitted',
  [CheckInStep.ADDONS]: 'Add-ons selected',
  [CheckInStep.ID_PHOTOS]: 'ID photos uploaded',
  [CheckInStep.ID_VERIFICATION]: 'Identity verified',
  [CheckInStep.CREDIT_CARD]: 'Payment processed',
  [CheckInStep.CREDIT_CARD_PHOTOS]: 'Card photos uploaded',
  [CheckInStep.ADDITIONAL_GUESTS]: 'Additional guests registered',
};

export function SubmittingAnimation() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const store = useCheckInConfigStore();
  const resetFlow = useCheckInConfigStore((s) => s.resetFlow);

  // Get steps that were included (excluding landing and submitting)
  const includedSteps = resolveIncludedSteps(store).filter(
    (s) =>
      s.step !== CheckInStep.RESERVATION_LANDING &&
      s.step !== CheckInStep.SUBMITTING &&
      s.isCounted
  );

  const [completedCount, setCompletedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = includedSteps.length;

  // Animate through steps
  useEffect(() => {
    if (completedCount >= totalSteps) {
      const timer = setTimeout(() => setIsComplete(true), 600);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setCompletedCount((c) => c + 1);
    }, 400 + Math.random() * 300);
    return () => clearTimeout(timer);
  }, [completedCount, totalSteps]);

  const handleStartOver = useCallback(() => {
    setCompletedCount(0);
    setIsComplete(false);
    resetFlow();
  }, [resetFlow]);

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-8 animate-fade-in">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${theme.primaryColor}15` }}
        >
          <Icon path={mdiPartyPopper} size={2.2} color={theme.primaryColor} />
        </div>
        <div>
          <h2 className="text-[22px] font-bold" style={{ color: theme.fontColor }}>
            Check-In Complete!
          </h2>
          <p className="text-[14px] text-[#6b7280] mt-2 max-w-[300px]">
            You're all set. Your room will be ready for you upon arrival. We look forward to welcoming you!
          </p>
        </div>

        <div className="w-full mt-4 px-4">
          <CanaryButton
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            isExpanded
            onClick={handleStartOver}
          >
            Start Over (Demo)
          </CanaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full py-8">
      <h2 className="text-[18px] font-semibold mb-2" style={{ color: theme.fontColor }}>
        Submitting Check-In...
      </h2>
      <p className="text-[13px] text-[#6b7280] mb-8">
        Please wait while we process your information.
      </p>

      {/* Animated checklist */}
      <div className="w-full flex flex-col gap-3">
        {includedSteps.map((step, index) => {
          const isChecked = index < completedCount;
          const label = STEP_LABELS[step.step] ?? step.label;
          return (
            <div
              key={step.step}
              className="flex items-center gap-3 transition-all duration-300"
              style={{ opacity: isChecked ? 1 : 0.4 }}
            >
              <div className="transition-transform duration-300" style={{ transform: isChecked ? 'scale(1)' : 'scale(0.8)' }}>
                <Icon
                  path={isChecked ? mdiCheckCircle : mdiCircleOutline}
                  size={0.85}
                  color={isChecked ? '#22c55e' : '#d1d5db'}
                />
              </div>
              <span className={`text-[14px] ${isChecked ? 'text-[#111827]' : 'text-[#9ca3af]'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-8 w-full">
        <div className="w-full h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0}%`,
              backgroundColor: theme.primaryColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}
