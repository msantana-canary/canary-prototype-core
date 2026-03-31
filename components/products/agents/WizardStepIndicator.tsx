'use client';

/**
 * WizardStepIndicator — Horizontal progress bar for the 4-step creation wizard.
 * Current/completed steps are solid blue, future steps are 40% opacity blue.
 * Matches Figma node 101-15791.
 */

import React from 'react';
import { WizardStep, WIZARD_STEPS } from '@/lib/products/agents/types';

interface WizardStepIndicatorProps {
  currentStep: WizardStep;
}

const STEP_ORDER: WizardStep[] = WIZARD_STEPS.map((s) => s.id);

export default function WizardStepIndicator({ currentStep }: WizardStepIndicatorProps) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  return (
    <div style={{ display: 'flex', gap: 8, width: 124, borderRadius: 8 }}>
      {WIZARD_STEPS.map((step, idx) => (
        <div
          key={step.id}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 8,
            backgroundColor: idx <= currentIdx ? '#2858C4' : 'rgba(40, 88, 196, 0.4)',
            transition: 'background-color 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}
