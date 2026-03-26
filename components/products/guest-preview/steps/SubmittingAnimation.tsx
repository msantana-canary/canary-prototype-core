'use client';

/**
 * SubmittingAnimation — Completion screen matching Figma
 *
 * Door hanger icon, "Thanks for submitting your check-in!",
 * green checkmarks for completed steps.
 */

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
};

export function SubmittingAnimation() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const store = useCheckInConfigStore();
  const resetFlow = useCheckInConfigStore((s) => s.resetFlow);

  const includedSteps = resolveIncludedSteps(store).filter(
    (s) =>
      s.step !== CheckInStep.RESERVATION_LANDING &&
      s.step !== CheckInStep.SUBMITTING &&
      s.isCounted
  );

  const [completedCount, setCompletedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const totalSteps = includedSteps.length;

  useEffect(() => {
    if (completedCount >= totalSteps) {
      const timer = setTimeout(() => setIsComplete(true), 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCompletedCount((c) => c + 1), 350);
    return () => clearTimeout(timer);
  }, [completedCount, totalSteps]);

  const handleStartOver = useCallback(() => {
    setCompletedCount(0);
    setIsComplete(false);
    resetFlow();
  }, [resetFlow]);

  if (!isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-6 py-12">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center animate-spin"
          style={{ borderWidth: 3, borderColor: `${theme.primaryColor}30`, borderTopColor: theme.primaryColor }}
        />
        <p className="text-[18px] text-[#666]">Submitting your check-in...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 py-12" style={{ backgroundColor: theme.backgroundColor }}>
      {/* Door hanger icon (Canary branded — gold) */}
      <div className="mb-6">
        <svg width="64" height="80" viewBox="0 0 64 80" fill="none">
          <path d="M48 0H16C7.16 0 0 7.16 0 16v48c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V16C64 7.16 56.84 0 48 0z" fill={theme.primaryColor} />
          <circle cx="32" cy="28" r="12" fill="none" stroke="white" strokeWidth="3" />
          <rect x="28" y="44" width="8" height="20" rx="4" fill="white" />
        </svg>
      </div>

      {/* Title */}
      <h2
        className="text-[24px] font-medium text-center leading-[36px] mb-8"
        style={{ color: theme.primaryColor }}
      >
        Thanks for submitting your check-in!
      </h2>

      {/* Checkmarks */}
      <div className="flex flex-col gap-4 w-full max-w-[280px]">
        {includedSteps.map((step, i) => {
          const label = STEP_LABELS[step.step] ?? step.label;
          const isChecked = i < completedCount;
          return (
            <div key={step.step} className="flex items-center gap-3">
              <div
                className="w-6 h-6 flex items-center justify-center transition-all duration-300"
                style={{ opacity: isChecked ? 1 : 0.3 }}
              >
                <Icon path={mdiCheck} size={0.85} color={isChecked ? theme.primaryColor : '#ccc'} />
              </div>
              <span className="text-[18px] text-black">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Start over (demo only) */}
      <button
        onClick={handleStartOver}
        className="mt-12 text-[14px] font-medium underline"
        style={{ color: theme.primaryColor }}
      >
        Start over (demo)
      </button>
    </div>
  );
}
