'use client';

/**
 * FlowView
 *
 * Per-modality flow viewer. Shows the sequence of data-collection steps
 * Canary generates for this surface, based on the property's requirements.
 *
 * CS can add, remove, rename, and configure steps — but NOT reorder them.
 * Step ordering is Canary's responsibility (A/B testing, conversion
 * optimization). The capability exists in the architecture but is not
 * exposed here.
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlusCircleOutline,
  mdiRefresh,
  mdiInformationOutline,
  mdiWeb,
  mdiCellphone,
  mdiTabletCellphone,
  mdiMonitor,
  mdiApplicationOutline,
} from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
  IconPosition,
  colors,
} from '@canary-ui/components';

import {
  useCheckInFlowsStore,
  useFlowById,
  useCurrentProperty,
} from '@/lib/products/check-in-flows/store';
import { SURFACE_LABELS } from '@/lib/products/check-in-flows/types';
import { StepListItem } from './StepListItem';
import { AddStepModal } from './AddStepModal';

const SURFACE_ICON = {
  'web': mdiWeb,
  'mobile-web': mdiCellphone,
  'tablet-reg': mdiTabletCellphone,
  'kiosk': mdiMonitor,
  'mobile-app': mdiApplicationOutline,
} as const;

export function FlowView() {
  const flowId = useCheckInFlowsStore((s) => s.nav.flowId);
  const flow = useFlowById(flowId);
  const property = useCurrentProperty();
  const regenerateFlowsForProperty = useCheckInFlowsStore((s) => s.regenerateFlowsForProperty);
  const goToLanding = useCheckInFlowsStore((s) => s.goToLanding);

  const [isAddStepOpen, setIsAddStepOpen] = useState(false);

  const isReadOnly = false;

  if (!flow) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <p className="text-[14px] text-[#888] mb-3">Flow not found.</p>
          <CanaryButton type={ButtonType.OUTLINED} size={ButtonSize.NORMAL} onClick={goToLanding}>
            Back to landing
          </CanaryButton>
        </div>
      </div>
    );
  }

  const handleResetToDefault = () => {
    if (!confirm('Reset this flow to the default for your property configuration? All customizations will be lost.')) return;
    regenerateFlowsForProperty(property.id);
    goToLanding();
  };

  const surfaceIcon = SURFACE_ICON[flow.surface];

  return (
    <>
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="max-w-[1000px] mx-auto px-8 py-6">
          {/* Flow header */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: colors.colorBlueDark5 }}
              >
                <Icon path={surfaceIcon} size={1.1} color={colors.colorBlueDark1} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-[#888] font-semibold">
                    Generated for
                  </span>
                  <span
                    className="text-[11px] uppercase tracking-wider font-semibold"
                    style={{ color: colors.colorBlueDark1 }}
                  >
                    {SURFACE_LABELS[flow.surface]}
                  </span>
                  {flow.isCustomized && (
                    <span
                      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded font-semibold"
                      style={{ backgroundColor: colors.colorBlueDark5, color: colors.colorBlueDark1 }}
                    >
                      Customized
                    </span>
                  )}
                </div>
                <h1 className="text-[24px] font-bold text-[#2B2B2B] leading-tight mt-1">
                  {flow.name}
                </h1>
                <p className="text-[12px] text-[#666] mt-1">
                  {flow.steps.length} steps · {flow.kind === 'nested' ? 'Nested flow' : 'Main flow'}
                </p>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex items-center gap-2 shrink-0">
                {flow.isCustomized && (
                  <CanaryButton
                    type={ButtonType.OUTLINED}
                    size={ButtonSize.NORMAL}
                    icon={<Icon path={mdiRefresh} size={0.7} />}
                    iconPosition={IconPosition.LEFT}
                    onClick={handleResetToDefault}
                  >
                    Reset to default
                  </CanaryButton>
                )}
                <CanaryButton
                  type={ButtonType.PRIMARY}
                  size={ButtonSize.NORMAL}
                  icon={<Icon path={mdiPlusCircleOutline} size={0.75} />}
                  iconPosition={IconPosition.LEFT}
                  onClick={() => setIsAddStepOpen(true)}
                >
                  Add requirement
                </CanaryButton>
              </div>
            )}
          </div>

          {/* Framing notice: sequencing is Canary's job */}
          <div
            className="mb-4 flex items-start gap-2 px-4 py-2.5 rounded-md border"
            style={{ borderColor: colors.colorBlueDark4, backgroundColor: colors.colorBlueDark5 }}
          >
            <Icon path={mdiInformationOutline} size={0.7} color={colors.colorBlueDark1} className="mt-0.5 shrink-0" />
            <p className="text-[12px]" style={{ color: colors.colorBlueDark1 }}>
              <strong>Canary sequences these steps for you.</strong> Ordering gets tuned per modality
              for optimal conversion. Configure <em>what</em> to collect and under <em>what conditions</em>;
              Canary handles <em>when</em> and <em>how</em>.
            </p>
          </div>

          {/* Steps */}
          {flow.steps.length === 0 ? (
            <div className="p-10 rounded-lg border border-dashed border-[#C5C5C5] bg-white text-center">
              <p className="text-[14px] text-[#888] mb-3">No requirements configured yet.</p>
              {!isReadOnly && (
                <CanaryButton type={ButtonType.PRIMARY} size={ButtonSize.NORMAL} onClick={() => setIsAddStepOpen(true)}>
                  Add first requirement
                </CanaryButton>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {flow.steps.map((step) => (
                <StepListItem
                  key={step.id}
                  flow={flow}
                  step={step}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          )}

          {/* Bottom add action */}
          {!isReadOnly && flow.steps.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setIsAddStepOpen(true)}
                className="w-full py-3 rounded-lg border border-dashed border-[#C5C5C5] text-[13px] font-semibold text-[#888] hover:border-[#2858C4] hover:text-[#2858C4] transition-colors flex items-center justify-center gap-2"
              >
                <Icon path={mdiPlusCircleOutline} size={0.7} />
                Add another requirement
              </button>
            </div>
          )}
        </div>
      </div>

      <AddStepModal
        isOpen={isAddStepOpen}
        onClose={() => setIsAddStepOpen(false)}
        flow={flow}
        property={property}
      />
    </>
  );
}
