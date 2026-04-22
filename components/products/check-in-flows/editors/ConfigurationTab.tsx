'use client';

/**
 * ConfigurationTab
 *
 * Dispatches to the appropriate per-step-type editor based on step.config.kind
 * and presetType. Shell for Phase 3 — each editor component is filled in on
 * its own phase.
 */

import React from 'react';
import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { effectiveReadOnly } from '@/lib/products/check-in-flows/permissions';
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
  const role = useCheckInFlowsStore((s) => s.role);
  const cfg = step.config;

  // Content-editable templates override read-only for the editor body.
  // Structural edits (field CRUD, conditions) remain CS-only.
  const contentReadOnly = effectiveReadOnly({ role, templateId: step.templateId, scope: 'content' });
  const structureReadOnly = isReadOnly || role === 'hotel';

  if (cfg.kind === 'schema-form') {
    // Schema-form is always structural — never hotel-editable
    return <SchemaFormEditor step={step} flow={flow} isReadOnly={structureReadOnly} />;
  }

  if (cfg.kind === 'nested-flow') {
    return <NestedFlowEditor step={step} flow={flow} isReadOnly={structureReadOnly} />;
  }

  if (cfg.kind === 'preset') {
    switch (cfg.presetType) {
      case 'id-consent':
        // Hotels may edit consent language; CS has full access
        return <IdConsentEditor step={step} flow={flow} isReadOnly={contentReadOnly} />;
      case 'id-capture':
        // Options + conditions — structure-level. CS only.
        return <IdCaptureEditor step={step} flow={flow} isReadOnly={structureReadOnly} />;
      default:
        // Generic preset: content-only edits; hotel may edit if the template allows
        return <GenericPresetEditor step={step} flow={flow} isReadOnly={contentReadOnly} />;
    }
  }

  return (
    <div className="p-10 text-center text-[14px] text-[#888]">
      No editor available for this step type.
    </div>
  );
}
