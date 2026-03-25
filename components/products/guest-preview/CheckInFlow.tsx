'use client';

/**
 * CheckInFlow — Step orchestrator
 *
 * Layout per Figma:
 * - Landing: no header, custom hero layout (handled by ReservationLanding)
 * - Check-in steps: gold header (status bar area + title + progress bar),
 *   scrollable content, Submit button, page footer
 * - Submitting: no header, completion animation
 *
 * Header spec (Figma 5:2353):
 *   bg: primaryColor (#926e27)
 *   Status bar area: 54px (transparent, handled by PhoneFrame overlay)
 *   Container: px-24, pb-24, flex-col, gap-8
 *     Title: 24px Roboto SemiBold, white, leading-36
 *     Progress bar: 124px wide, flex, gap-8, 3px pills, rounded-8
 *       Filled: white / Unfilled: rgba(255,255,255,0.4)
 */

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import {
  resolveIncludedSteps,
  getProgressSegmentCount,
  getCompletedSegments,
} from '@/lib/products/guest-preview/check-in-flow-engine';
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
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';

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
  const isSecondStep = store.currentStepIndex === 1;
  const isLanding = currentStep?.step === CheckInStep.RESERVATION_LANDING;
  const isSubmitting = currentStep?.step === CheckInStep.SUBMITTING;
  const showHeader = !isLanding && !isSubmitting;

  // Show back arrow on steps after registration (step index > 1, since 0 = landing, 1 = registration)
  const showBackButton = showHeader && !isSecondStep;

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

  const headerTitle =
    currentStep ? STEP_TITLES[currentStep.step] ?? currentStep.label : '';

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: isLanding ? 'transparent' : store.theme.backgroundColor,
        color: store.theme.fontColor,
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {/* ── Gold header matching Figma 5:2353 ── */}
      {showHeader && (
        <div
          className="flex-shrink-0 flex flex-col items-start"
          style={{ backgroundColor: store.theme.primaryColor }}
        >
          {/* Status bar spacer (54px — PhoneFrame overlays its status bar on top of this) */}
          <div style={{ height: 54 }} />

          {/* Container: title + progress bar (or back button + title) */}
          <div className="flex flex-col gap-2 px-6 pb-6">
            {showBackButton ? (
              /* Back button variant (Figma 71:33547) */
              <div className="flex items-center gap-2">
                <button
                  onClick={store.goToPrevStep}
                  className="flex items-center justify-center p-[10px] -ml-[10px]"
                >
                  <Icon path={mdiArrowLeft} size={0.8} color="white" />
                </button>
                <span className="text-[24px] font-medium text-white leading-[36px]">
                  {headerTitle}
                </span>
              </div>
            ) : (
              /* Progress bar variant (Figma 5:2353) */
              <>
                <h1 className="text-[24px] font-semibold text-white leading-[36px]">
                  {headerTitle}
                </h1>
                <div className="flex gap-2" style={{ width: 124 }}>
                  {Array.from({ length: totalSegments }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-lg"
                      style={{
                        height: 3,
                        backgroundColor:
                          i < completedSegments
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(255,255,255,0.4)',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">
        <StepContent step={currentStep?.step} />

        {/* Submit button + skip (inside scroll, below content) */}
        {showHeader && (
          <div className="px-6 pt-4 pb-2">
            <button
              onClick={store.goToNextStep}
              className="w-full h-[48px] flex items-center justify-center text-[18px] font-medium text-white opacity-50"
              style={{ backgroundColor: store.theme.primaryColor }}
            >
              Submit
            </button>

            {isSkippable && (
              <button
                onClick={store.goToNextStep}
                className="w-full mt-3 py-2 text-[16px] font-medium text-center"
                style={{ color: store.theme.primaryColor }}
              >
                Skip
              </button>
            )}
          </div>
        )}

        {/* Page footer (every step except submitting — landing has its own) */}
        {showHeader && <PageFooter />}
      </div>
    </div>
  );
}

/**
 * Page footer matching Figma: language selector + privacy + powered by Canary
 */
function PageFooter() {
  return (
    <div className="flex flex-col items-center gap-6 px-4 py-4">
      {/* Language selector — underline select */}
      <div className="flex items-center gap-1 border-b border-[#999] pb-1 px-2">
        <span className="text-[14px] text-black">English</span>
        <span className="text-[14px] text-[#999] ml-1">⇅</span>
      </div>
      {/* Links + Canary branding */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[12px] font-medium text-[#414141]">
          Privacy Policy • Terms & Conditions
        </span>
        <div className="flex items-center gap-2">
          <svg width="22" height="13" viewBox="0 0 22 13" fill="none">
            <path d="M11 0C6.5 0 2.7 2.7 1 6.5 2.7 10.3 6.5 13 11 13s8.3-2.7 10-6.5C19.3 2.7 15.5 0 11 0zm0 10.8c-2.4 0-4.3-1.9-4.3-4.3S8.6 2.2 11 2.2s4.3 1.9 4.3 4.3-1.9 4.3-4.3 4.3z" fill="#9f9f9f" />
          </svg>
          <span className="text-[12px] text-[#9f9f9f]">
            Powered by Canary Technologies
          </span>
        </div>
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
