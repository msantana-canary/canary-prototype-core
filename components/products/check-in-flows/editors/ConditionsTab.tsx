'use client';

/**
 * ConditionsTab — Phase 7 stub
 *
 * Placeholder for the step-level condition builder.
 */

import React from 'react';
import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';

interface ConditionsTabProps {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

export function ConditionsTab({ step }: ConditionsTabProps) {
  return (
    <div className="p-8 max-w-[800px] mx-auto">
      <div className="rounded-lg border border-dashed border-[#C5C5C5] bg-white p-10 text-center">
        <h3 className="text-[14px] font-semibold text-[#2B2B2B] mb-2">Conditions</h3>
        <p className="text-[13px] text-[#888]">
          Phase 7 will build the condition expression builder here (parameter → operator → value → action).
        </p>
        {step.conditions && step.conditions.length > 0 && (
          <div className="mt-4 text-left inline-block">
            <p className="text-[12px] text-[#666] mb-1">Existing conditions:</p>
            <ul className="text-[12px] text-[#2B2B2B]">
              {step.conditions.map((c) => (
                <li key={c.id}>
                  <code>{c.parameter} {c.operator} {String(c.value)}</code> → {c.action}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
