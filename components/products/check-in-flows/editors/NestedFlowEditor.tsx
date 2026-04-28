'use client';

/**
 * NestedFlowEditor
 *
 * Shown when the step points to another flow (upsells, mobile-key,
 * accompanying-guest, guest-profile). Explains the reference and
 * offers a "Go to flow" CTA so the user can edit the nested flow
 * itself.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiLinkVariant, mdiArrowRight } from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
  IconPosition,
  colors,
} from '@canary-ui/components';

import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore, useFlowById } from '@/lib/products/check-in-flows/store';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
  isReadOnly: boolean;
}

export function NestedFlowEditor({ step }: Props) {
  const selectFlow = useCheckInFlowsStore((s) => s.selectFlow);
  const nestedId = step.config.kind === 'nested-flow' ? step.config.nestedFlowId : null;
  const nested = useFlowById(nestedId);

  if (!nestedId || step.config.kind !== 'nested-flow') {
    return <div className="p-8 text-center text-[#888]">Not a nested-flow step.</div>;
  }

  const loopUntilComplete = step.config.loopUntilComplete;

  return (
    <div className="p-8 max-w-[800px] mx-auto">
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
        <div className="flex items-start gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: colors.colorBlueDark5 }}
          >
            <Icon path={mdiLinkVariant} size={0.9} color={colors.colorBlueDark1} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#2B2B2B]">
              This step references another flow
            </h3>
            <p className="text-[13px] text-[#666] mt-1">
              Edits made on the nested flow apply wherever it&apos;s referenced — one source of truth.
            </p>
          </div>
        </div>

        {nested ? (
          <div className="bg-[#FAFAFA] rounded-md border border-[#EEE] p-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-[14px] font-semibold text-[#2B2B2B]">{nested.name}</h4>
                {nested.description && (
                  <p className="text-[12px] text-[#888] mt-0.5">{nested.description}</p>
                )}
                <p className="text-[11px] text-[#AAA] mt-1">
                  {nested.steps.length} step{nested.steps.length === 1 ? '' : 's'} · {nested.kind} flow
                </p>
              </div>
              <CanaryButton
                type={ButtonType.PRIMARY}
                size={ButtonSize.NORMAL}
                icon={<Icon path={mdiArrowRight} size={0.7} />}
                iconPosition={IconPosition.RIGHT}
                onClick={() => selectFlow(nested.id)}
              >
                Go to flow
              </CanaryButton>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFF4F4] rounded-md border border-[#FDD] p-4 text-[13px] text-[#900]">
            The referenced flow ({nestedId}) could not be found. This may happen if the underlying feature is disabled for this property.
          </div>
        )}

        {loopUntilComplete && (
          <div className="flex items-start gap-2 text-[12px] text-[#666]">
            <Icon path={mdiLinkVariant} size={0.55} color="#888" className="mt-0.5 shrink-0" />
            <span>
              <span className="font-semibold">Loops until complete</span> — this flow runs once per
              item (e.g. one iteration per accompanying guest).
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
