/**
 * Check-In Flow Engine
 *
 * Pure function: config → ordered step array.
 * Mirrors production's allWorkflowSteps pattern.
 * Steps always appear in the same order; toggling a parameter
 * adds/removes steps from the flow instantly.
 */

import {
  CheckInConfigState,
  CheckInStep,
  OptionalStep,
  StepDefinition,
} from './types';

/**
 * Given a config state, returns the full ordered step list
 * with isIncluded flags. Steps that are not included are still
 * in the array (for stable indexing) but marked isIncluded: false.
 */
export function resolveAllSteps(config: CheckInConfigState): StepDefinition[] {
  return [
    {
      step: CheckInStep.RESERVATION_LANDING,
      label: 'Welcome',
      isIncluded: true, // always included
      isCounted: false, // not counted in progress bar
    },
    {
      step: CheckInStep.REGISTRATION_CARD,
      label: 'Registration',
      isIncluded: true, // always included
      isCounted: true,
    },
    {
      step: CheckInStep.ADDONS,
      label: 'Add-ons',
      isIncluded: config.addonsEnabled,
      isCounted: true,
    },
    {
      step: CheckInStep.ID_PHOTOS,
      label: 'ID Photos',
      isIncluded: config.idMode !== OptionalStep.DISABLED && !config.idWithOCR,
      isCounted: true,
    },
    {
      step: CheckInStep.ID_VERIFICATION,
      label: 'ID Verification',
      isIncluded: config.idMode !== OptionalStep.DISABLED && config.idWithOCR,
      isCounted: true,
    },
    {
      step: CheckInStep.CREDIT_CARD,
      label: 'Payment',
      isIncluded: config.creditCardMode !== OptionalStep.DISABLED,
      isCounted: true,
    },
    {
      step: CheckInStep.CREDIT_CARD_PHOTOS,
      label: 'Card Photos',
      isIncluded:
        config.creditCardMode !== OptionalStep.DISABLED &&
        config.creditCardPhotosEnabled,
      isCounted: true,
    },
    {
      step: CheckInStep.ADDITIONAL_GUESTS,
      label: 'Additional Guests',
      isIncluded: config.additionalGuestsEnabled,
      isCounted: true,
    },
    {
      step: CheckInStep.SUBMITTING,
      label: 'Submitting',
      isIncluded: true, // always included
      isCounted: false,
    },
  ];
}

/**
 * Returns only the steps that are included in the flow.
 */
export function resolveIncludedSteps(config: CheckInConfigState): StepDefinition[] {
  return resolveAllSteps(config).filter((s) => s.isIncluded);
}

/**
 * Returns the number of progress segments (counted steps only).
 */
export function getProgressSegmentCount(config: CheckInConfigState): number {
  return resolveIncludedSteps(config).filter((s) => s.isCounted).length;
}

/**
 * Given a step index in the included list, returns how many
 * counted steps have been completed (for progress bar fill).
 */
export function getCompletedSegments(
  config: CheckInConfigState,
  currentStepIndex: number
): number {
  const included = resolveIncludedSteps(config);
  let completed = 0;
  for (let i = 0; i < currentStepIndex && i < included.length; i++) {
    if (included[i].isCounted) {
      completed++;
    }
  }
  return completed;
}

/**
 * Clamps a step index to valid bounds after config changes
 * may have removed the current step.
 */
export function clampStepIndex(
  config: CheckInConfigState,
  currentIndex: number
): number {
  const included = resolveIncludedSteps(config);
  if (included.length === 0) return 0;
  return Math.min(currentIndex, included.length - 1);
}
