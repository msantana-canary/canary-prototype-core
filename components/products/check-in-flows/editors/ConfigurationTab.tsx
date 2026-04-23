'use client';

/**
 * ConfigurationTab
 *
 * Dispatches to the appropriate per-step-type editor based on
 * step.config.kind and presetType.
 */

import React from 'react';
import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';
import { SchemaFormEditor } from './SchemaFormEditor';
import { IdConsentEditor } from './IdConsentEditor';
import { IdCaptureEditor } from './IdCaptureEditor';
import { GenericPresetEditor } from './GenericPresetEditor';
import { NestedFlowEditor } from './NestedFlowEditor';

interface ConfigurationTabProps {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

export function ConfigurationTab({ step, flow, isReadOnly }: ConfigurationTabProps) {
  const cfg = step.config;

  if (cfg.kind === 'schema-form') {
    return <SchemaFormEditor step={step} flow={flow} isReadOnly={isReadOnly} />;
  }
  if (cfg.kind === 'nested-flow') {
    return <NestedFlowEditor step={step} flow={flow} isReadOnly={isReadOnly} />;
  }
  if (cfg.kind === 'preset') {
    switch (cfg.presetType) {
      case 'id-consent':
        return <IdConsentEditor step={step} flow={flow} isReadOnly={isReadOnly} />;
      case 'id-capture':
        return <IdCaptureEditor step={step} flow={flow} isReadOnly={isReadOnly} />;
      default:
        return <GenericPresetEditor step={step} flow={flow} isReadOnly={isReadOnly} />;
    }
  }

  return (
    <div className="p-10 text-center text-[14px] text-[#888]">
      No editor available for this step type.
    </div>
  );
}
