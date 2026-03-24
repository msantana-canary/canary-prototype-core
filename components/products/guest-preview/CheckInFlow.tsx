'use client';

/**
 * CheckInFlow — Step orchestrator
 *
 * Renders the current step based on config store state.
 * Layout matches Figma: gold header with title + progress bar,
 * scrollable content, Submit button, page footer.
 */

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { resolveIncludedSteps, getProgressSegmentCount, getCompletedSegments } from '@/lib/products/guest-preview/check-in-flow-engine';
import { CheckInStep, OptionalStep } from '@/lib/products/guest-preview/types';
import { ReservationLanding } from './steps/ReservationLanding';
import { RegistrationCard } from './steps/RegistrationCard';
import { CreditCard } from './steps/CreditCard';
import { CreditCardPhotos } from './steps/CreditCardPhotos';
import { IDPhotos } from './steps/IDPhotos';
import { IDVerification } from './steps/IDVerification';
import { Addons } from './steps/Addons';
import { AdditionalGuests } from './steps/AdditionalGuests';
import { SubmittingAnimation } from './steps/SubmittingAnimation';

/** Step title labels matching Figma exactly */
const STEP_TITLES: Partial<Record<CheckInStep, string>> = {
  [CheckInStep.REGISTRATION_CARD]: 'Registration',
  [CheckInStep.ADDONS]: 'Add-ons',
  [CheckInStep.ID_PHOTOS]: 'ID verification',
  [CheckInStep.ID_VERIFICATION]: 'ID verification',
  [CheckInStep.CREDIT_CARD]: 'Credit card',
  [CheckInStep.CREDIT_CARD_PHOTOS]: 'Card photos',
  [CheckInStep.ADDITIONAL_GUESTS]: 'Additional guests',
};

export function CheckInFlow() {
  const store = useCheckInConfigStore();
  const includedSteps = resolveIncludedSteps(store);
  const currentStep = includedSteps[store.currentStepIndex];
  const totalSegments = getProgressSegmentCount(store);
  const completedSegments = getCompletedSegments(store, store.currentStepIndex);

  const isFirstStep = store.currentStepIndex === 0;
  const isLanding = currentStep?.step === CheckInStep.RESERVATION_LANDING;
  const isSubmitting = currentStep?.step === CheckInStep.SUBMITTING;
  const showHeader = !isLanding && !isSubmitting;

  // Determine if current step is skippable (optional mode)
  const isSkippable = (() => {
    if (!currentStep) return false;
    const step = currentStep.step;
    if (step === CheckInStep.ID_PHOTOS || step === CheckInStep.ID_VERIFICATION) {
      return store.idMode === OptionalStep.OPTIONAL;
    }
    if (step === CheckInStep.CREDIT_CARD || step === CheckInStep.CREDIT_CARD_PHOTOS) {
      return store.creditCardMode === OptionalStep.OPTIONAL;
    }
    return false;
  })();

  const headerTitle = currentStep ? STEP_TITLES[currentStep.step] ?? currentStep.label : '';

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: store.theme.backgroundColor,
        color: store.theme.fontColor,
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {/* ── Gold header with title + progress bar (Figma pattern) ── */}
      {showHeader && (
        <div
          className="flex-shrink-0 flex flex-col items-start justify-end px-6 pb-6"
          style={{ backgroundColor: store.theme.primaryColor }}
        >
          {/* Title */}
          <h1 className="text-[24px] font-semibold text-white leading-[36px]">
            {headerTitle}
          </h1>
          {/* Progress bar — white pills on gold */}
          <div className="flex gap-2 mt-2" style={{ width: 124 }}>
            {Array.from({ length: totalSegments }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-[3px] rounded-lg"
                style={{
                  backgroundColor: i < completedSegments
                    ? 'rgba(255,255,255,1)'
                    : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">
        <StepContent step={currentStep?.step} />

        {/* ── Submit button + footer (inside scroll area, matching Figma) ── */}
        {showHeader && (
          <div className="px-6 pt-4 pb-4">
            {/* Submit / Continue button */}
            <button
              onClick={store.goToNextStep}
              className="w-full h-[48px] flex items-center justify-center text-[18px] font-medium text-white"
              style={{ backgroundColor: store.theme.primaryColor }}
            >
              Submit
            </button>

            {/* Skip button (for optional steps) */}
            {isSkippable && (
              <button
                onClick={store.goToNextStep}
                className="w-full mt-2 py-3 text-[16px] font-medium text-center"
                style={{ color: store.theme.primaryColor }}
              >
                Skip
              </button>
            )}
          </div>
        )}

        {/* Landing CTA */}
        {isLanding && (
          <div className="px-6 pt-4 pb-4">
            <button
              onClick={store.goToNextStep}
              className="w-full h-[48px] flex items-center justify-center text-[18px] font-medium text-white"
              style={{ backgroundColor: store.theme.primaryColor }}
            >
              Check In
            </button>
          </div>
        )}

        {/* ── Page footer (every step except submitting) ── */}
        {!isSubmitting && <PageFooter />}
      </div>
    </div>
  );
}

/**
 * Page footer matching Figma: language selector + privacy + powered by
 */
function PageFooter() {
  return (
    <div className="flex flex-col items-center gap-6 px-4 py-4 mt-2">
      {/* Language selector */}
      <div className="flex items-center gap-1 border-b border-[#999] pb-1">
        <span className="text-[14px] text-black">English</span>
        <span className="text-[14px] text-[#999]">⇅</span>
      </div>
      {/* Links + Canary branding */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[12px] font-medium text-[#414141]">
          Privacy Policy • Terms & Conditions
        </span>
        <span className="text-[12px] text-[#9f9f9f]">
          Powered by Canary Technologies
        </span>
      </div>
    </div>
  );
}

/**
 * Renders the appropriate step component.
 */
function StepContent({ step }: { step?: CheckInStep }) {
  switch (step) {
    case CheckInStep.RESERVATION_LANDING:
      return <ReservationLanding />;
    case CheckInStep.REGISTRATION_CARD:
      return <RegistrationCard />;
    case CheckInStep.ADDONS:
      return <Addons />;
    case CheckInStep.ID_PHOTOS:
      return <IDPhotos />;
    case CheckInStep.ID_VERIFICATION:
      return <IDVerification />;
    case CheckInStep.CREDIT_CARD:
      return <CreditCard />;
    case CheckInStep.CREDIT_CARD_PHOTOS:
      return <CreditCardPhotos />;
    case CheckInStep.ADDITIONAL_GUESTS:
      return <AdditionalGuests />;
    case CheckInStep.SUBMITTING:
      return <SubmittingAnimation />;
    default:
      return null;
  }
}
