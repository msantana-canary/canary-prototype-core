'use client';

/**
 * SchemaFormEditor — Phase 4 stub
 *
 * Placeholder for the drag-drop field builder (reg-card, OCR).
 */

import React from 'react';
import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

export function SchemaFormEditor({ step }: Props) {
  const fieldCount = step.config.kind === 'schema-form' ? step.config.fields.length : 0;
  return (
    <div className="p-8 max-w-[1000px] mx-auto">
      <div className="rounded-lg border border-dashed border-[#C5C5C5] bg-white p-10 text-center">
        <h3 className="text-[14px] font-semibold text-[#2B2B2B] mb-2">Schema Form Editor</h3>
        <p className="text-[13px] text-[#888]">
          Phase 4 will build the drag-drop field builder here. Currently {fieldCount} fields configured.
        </p>
      </div>
    </div>
  );
}
