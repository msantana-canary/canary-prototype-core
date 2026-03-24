'use client';

/**
 * CheckInFlow — Step orchestrator
 *
 * Renders the current step based on config store state.
 * Handles Next/Back/Skip navigation and step transitions.
 */

import React from 'react';
import { CanaryButton, ButtonType, ButtonSize } from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { resolveIncludedSteps, getProgressSegmentCount, getCompletedSegments } from '@/lib/products/guest-preview/check-in-flow-engine';
import { CheckInStep, OptionalStep, BorderRadius } from '@/lib/products/guest-preview/types';
import { GuestProgressBar } from '@/components/core/GuestProgressBar';
import { HOTEL_BRANDING } from '@/lib/products/guest-preview/mock-form-data';
import { ReservationLanding } from './steps/ReservationLanding';
import { RegistrationCard } from './steps/RegistrationCard';
import { CreditCard } from './steps/CreditCard';
import { CreditCardPhotos } from './steps/CreditCardPhotos';
import { IDPhotos } from './steps/IDPhotos';
import { IDVerification } from './steps/IDVerification';
import { Addons } from './steps/Addons';
import { AdditionalGuests } from './steps/AdditionalGuests';
import { SubmittingAnimation } from './steps/SubmittingAnimation';

function getBorderRadiusValue(br: BorderRadius): string {
  switch (br) {
    case BorderRadius.SQUARE: return '0px';
    case BorderRadius.ROUND: return '4px';
    case BorderRadius.CIRCULAR: return '24px';
  }
}

export function CheckInFlow() {
  const store = useCheckInConfigStore();
  const includedSteps = resolveIncludedSteps(store);
  const currentStep = includedSteps[store.currentStepIndex];
  const totalSegments = getProgressSegmentCount(store);
  const completedSegments = getCompletedSegments(store, store.currentStepIndex);

  const isFirstStep = store.currentStepIndex === 0;
  const isLastStep = store.currentStepIndex === includedSteps.length - 1;
  const isLanding = currentStep?.step === CheckInStep.RESERVATION_LANDING;
  const isSubmitting = currentStep?.step === CheckInStep.SUBMITTING;

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

  // Theme CSS variables
  const themeVars: React.CSSProperties = {
    '--canaryThemeButtonColor': store.theme.primaryColor,
    '--canaryThemeHeaderColor': store.theme.primaryColor,
    '--canaryThemeBackgroundColor': store.theme.backgroundColor,
    '--canaryThemeFontColor': store.theme.fontColor,
    '--canaryThemeBorderRadius': getBorderRadiusValue(store.theme.borderRadius),
  } as React.CSSProperties;

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: store.theme.backgroundColor,
        color: store.theme.fontColor,
        fontFamily: 'Roboto, sans-serif',
        ...themeVars,
      }}
    >
      {/* Header with progress bar (not shown on landing or submitting) */}
      {!isLanding && !isSubmitting && (
        <div
          className="flex-shrink-0 px-6 pt-4 pb-3"
          style={{ backgroundColor: store.theme.backgroundColor }}
        >
          {/* Hotel name */}
          <div className="text-[14px] font-medium mb-3 text-center" style={{ color: store.theme.fontColor }}>
            {HOTEL_BRANDING.name}
          </div>
          {/* Progress bar */}
          <GuestProgressBar
            totalSegments={totalSegments}
            completedSegments={completedSegments}
            primaryColor={store.theme.primaryColor}
          />
        </div>
      )}

      {/* Step content */}
      <div className={`flex-1 overflow-y-auto ${isLanding ? '' : 'px-6 py-4'}`}>
        <StepContent step={currentStep?.step} label={currentStep?.label ?? 'Unknown'} />
      </div>

      {/* Navigation footer (not shown on landing or submitting) */}
      {!isLanding && !isSubmitting && (
        <div className="flex-shrink-0 px-6 py-4 flex flex-col gap-2" style={{ backgroundColor: store.theme.backgroundColor }}>
          {/* Next / Continue button */}
          <CanaryButton
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            isExpanded
            onClick={store.goToNextStep}
          >
            {isLastStep ? 'Submit' : 'Continue'}
          </CanaryButton>

          {/* Skip button (for optional steps) */}
          {isSkippable && (
            <CanaryButton
              type={ButtonType.TEXT}
              size={ButtonSize.NORMAL}
              isExpanded
              onClick={store.goToNextStep}
            >
              Skip this step
            </CanaryButton>
          )}

          {/* Back button */}
          {!isFirstStep && (
            <CanaryButton
              type={ButtonType.TEXT}
              size={ButtonSize.NORMAL}
              isExpanded
              onClick={store.goToPrevStep}
            >
              Back
            </CanaryButton>
          )}
        </div>
      )}

      {/* Landing CTA */}
      {isLanding && (
        <div className="flex-shrink-0 px-6 py-4">
          <CanaryButton
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            isExpanded
            onClick={store.goToNextStep}
          >
            Check In
          </CanaryButton>
        </div>
      )}
    </div>
  );
}

/**
 * Renders the appropriate step component.
 */
function StepContent({ step }: { step?: CheckInStep; label: string }) {
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
