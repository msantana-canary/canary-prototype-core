'use client';

/**
 * ConditionsTab
 *
 * Step-level condition rules — when this step shows/hides based on
 * guest context. Delegates to the shared ConditionRuleEditor (scope: 'step').
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiInformationOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';

import type { StepInstance, FlowDefinition, Condition } from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { ConditionRuleEditor } from './ConditionRuleEditor';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

export function ConditionsTab({ step, flow, isReadOnly }: Props) {
  const updateStepConditions = useCheckInFlowsStore((s) => s.updateStepConditions);

  const onChange = (next: Condition[]) => {
    if (isReadOnly) return;
    updateStepConditions(flow.id, step.id, next);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-[900px] mx-auto px-8 py-6 space-y-4">
        <div>
          <h2 className="text-[14px] font-bold text-[#2B2B2B] mb-1">Step Visibility</h2>
          <p className="text-[12px] text-[#666]">
            Control when this step appears in the flow. Without any conditions, the step always
            shows.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E5E5] p-5">
          <ConditionRuleEditor
            conditions={step.conditions ?? []}
            onChange={onChange}
            scope="step"
            disabled={isReadOnly}
            emptyLabel="Always visible"
            emptyHint="Add a condition to hide or show this step based on guest context."
          />
        </div>

        {/* Guidance */}
        <div
          className="flex items-start gap-2 px-4 py-3 rounded-md border"
          style={{ borderColor: colors.colorBlueDark4, backgroundColor: colors.colorBlueDark5 }}
        >
          <Icon path={mdiInformationOutline} size={0.7} color={colors.colorBlueDark1} className="mt-0.5 shrink-0" />
          <div className="text-[12px]" style={{ color: colors.colorBlueDark1 }}>
            <p className="mb-1.5 font-semibold">Common use cases</p>
            <ul className="list-disc ml-4 space-y-0.5">
              <li>
                <strong>Loyalty Welcome</strong> — show only when the guest is a loyalty member
              </li>
              <li>
                <strong>Italian Driver&apos;s License</strong> — hide unless nationality = IT
              </li>
              <li>
                <strong>Corporate</strong> — show special requests only when rate-code = CORP
              </li>
              <li>
                <strong>Group</strong> — show accompanying-guest only when stay has more than one
                reservation
              </li>
            </ul>
          </div>
        </div>

        {step.kind === 'nested-flow' && (
          <p className="text-[11px] text-[#888] italic">
            Note: conditions on nested-flow references gate whether the sub-flow is entered at
            all.
          </p>
        )}
      </div>
    </div>
  );
}
