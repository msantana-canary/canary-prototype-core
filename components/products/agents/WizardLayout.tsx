'use client';

/**
 * WizardLayout — Slide-over container for the 4-step agent creation wizard.
 *
 * Handles the slide-in/out animation (same pattern as CheckInDetailPanel),
 * step indicator, Save Draft / Next buttons, and right sidebar slot.
 * Renders on top of the dashboard as an absolute overlay.
 */

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  IconPosition,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import { WIZARD_STEPS } from '@/lib/products/agents/types';
import WizardStepIndicator from './WizardStepIndicator';

interface WizardLayoutProps {
  children: React.ReactNode;
  /** Optional right sidebar content (used by Capabilities, Workflows, Connectors steps) */
  sidebar?: React.ReactNode;
  /** Title shown at top left — defaults to current step label */
  title?: string;
}

const STEP_ORDER = WIZARD_STEPS.map((s) => s.id);

export default function WizardLayout({ children, sidebar, title }: WizardLayoutProps) {
  const wizardCurrentStep = useAgentStore((s) => s.wizardCurrentStep);
  const nextWizardStep = useAgentStore((s) => s.nextWizardStep);
  const prevWizardStep = useAgentStore((s) => s.prevWizardStep);
  const goBack = useAgentStore((s) => s.goBack);
  const setShowDeployModal = useAgentStore((s) => s.setShowDeployModal);

  // Slide-over animation lifecycle (same pattern as CheckInDetailPanel)
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Track step transitions for directional animation
  const prevStepRef = useRef(wizardCurrentStep);
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [stepFadeKey, setStepFadeKey] = useState(0);

  useEffect(() => {
    if (wizardCurrentStep !== prevStepRef.current) {
      const prevIdx = STEP_ORDER.indexOf(prevStepRef.current);
      const nextIdx = STEP_ORDER.indexOf(wizardCurrentStep);
      setStepDirection(nextIdx > prevIdx ? 'forward' : 'backward');
      setStepFadeKey((k) => k + 1);
      prevStepRef.current = wizardCurrentStep;
    }
  }, [wizardCurrentStep]);

  useEffect(() => {
    setShouldRender(true);
    const timer = setTimeout(() => setAnimateIn(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const currentStepIdx = STEP_ORDER.indexOf(wizardCurrentStep);
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === STEP_ORDER.length - 1;
  const stepLabel = title || WIZARD_STEPS.find((s) => s.id === wizardCurrentStep)?.label || '';

  const handleBack = () => {
    if (isFirstStep) {
      // Animate out, then go back to dashboard
      setAnimateIn(false);
      setTimeout(() => goBack(), 500);
    } else {
      prevWizardStep();
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      setShowDeployModal(true);
    } else {
      nextWizardStep();
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col bg-white overflow-hidden shadow-2xl transition-transform duration-500 ease-out"
      style={{
        transform: animateIn ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      {/* Header — matches Figma node 101-15786 */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ padding: '16px 24px', borderBottom: '1px solid #E5E5E5' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Icon-only back button */}
          <CanaryButton type={ButtonType.TEXT} onClick={handleBack}>
            <Icon path={mdiArrowLeft} size={0.83} />
          </CanaryButton>
          {/* Title + progress bar stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: 0, fontFamily: 'var(--font-roboto), sans-serif' }}>
              {stepLabel}
            </h1>
            <WizardStepIndicator currentStep={wizardCurrentStep} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CanaryButton type={ButtonType.SHADED} onClick={() => {/* Save draft */}}>
            Save Draft
          </CanaryButton>
          <CanaryButton type={ButtonType.PRIMARY} onClick={handleNext}>
            {isLastStep ? 'Deploy' : 'Next'}
          </CanaryButton>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content — #FAFAFA bg per Figma */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: 24, background: '#FAFAFA' }}
        >
          <style>{`
            @keyframes wizardStepForward {
              from { opacity: 0; transform: translateX(20px); }
              to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes wizardStepBackward {
              from { opacity: 0; transform: translateX(-20px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>
          <div
            key={stepFadeKey}
            style={{
              opacity: 0,
              animationName: stepDirection === 'forward' ? 'wizardStepForward' : 'wizardStepBackward',
              animationDuration: '0.35s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'forwards',
            }}
          >
            {children}
          </div>
        </div>

        {/* Optional right sidebar — 400px, white bg, per Figma */}
        {sidebar && (
          <div
            className="shrink-0 flex flex-col overflow-hidden"
            style={{
              width: 400,
              borderLeft: '1px solid #E5E5E5',
              background: '#fff',
            }}
          >
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
}
