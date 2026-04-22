'use client';

/**
 * FlowView
 *
 * Main flow-detail page. Shows ordered step list with drag-drop reorder,
 * inline name edit, per-step actions (remove, duplicate), add-step modal,
 * and a "Reset to default" action for customized flows.
 */

import React, { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiPlusCircleOutline, mdiRefresh, mdiInformationOutline } from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonColor,
  ButtonSize,
  IconPosition,
  colors,
} from '@canary-ui/components';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  useCheckInFlowsStore,
  useFlowById,
  useCurrentProperty,
} from '@/lib/products/check-in-flows/store';
import { SURFACE_LABELS } from '@/lib/products/check-in-flows/types';
import { generateDefaultFlow } from '@/lib/products/check-in-flows/default-flow-generator';
import { StepListItem } from './StepListItem';
import { AddStepModal } from './AddStepModal';
import {
  mdiWeb,
  mdiCellphone,
  mdiTabletCellphone,
  mdiMonitor,
  mdiApplicationOutline,
} from '@mdi/js';

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
  const reorderSteps = useCheckInFlowsStore((s) => s.reorderSteps);
  const role = useCheckInFlowsStore((s) => s.role);
  const regenerateFlowsForProperty = useCheckInFlowsStore((s) => s.regenerateFlowsForProperty);
  const goToLanding = useCheckInFlowsStore((s) => s.goToLanding);

  const [isAddStepOpen, setIsAddStepOpen] = useState(false);

  const isReadOnly = role === 'hotel';
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const stepIds = useMemo(() => flow?.steps.map((s) => s.id) ?? [], [flow]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !flow) return;

    const oldIndex = flow.steps.findIndex((s) => s.id === active.id);
    const newIndex = flow.steps.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...flow.steps];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderSteps(flow.id, reordered.map((s) => s.id));
  };

  const handleResetToDefault = () => {
    if (!confirm('Reset this flow to the default for your property configuration? All customizations will be lost.')) return;
    // Replace the flow in the store with a freshly-generated default
    regenerateFlowsForProperty(property.id);
    goToLanding();  // Nav away since the flow ID may change
  };

  const surfaceIcon = SURFACE_ICON[flow.surface];

  return (
    <>
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="max-w-[1000px] mx-auto px-8 py-6">
          {/* Flow header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: colors.colorBlueDark5 }}
              >
                <Icon path={surfaceIcon} size={1.1} color={colors.colorBlueDark1} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[24px] font-bold text-[#2B2B2B] leading-tight">{flow.name}</h1>
                  {flow.isCustomized && (
                    <span
                      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded font-semibold"
                      style={{ backgroundColor: colors.colorBlueDark5, color: colors.colorBlueDark1 }}
                    >
                      Customized
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#666] mt-1">
                  {SURFACE_LABELS[flow.surface]} · {flow.steps.length} steps · {flow.kind === 'nested' ? 'Nested flow' : 'Main flow'}
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
                  Add step
                </CanaryButton>
              </div>
            )}
          </div>

          {/* Hotel role notice */}
          {isReadOnly && (
            <div
              className="mb-4 flex items-start gap-2 px-4 py-3 rounded-md border"
              style={{ borderColor: colors.colorBlueDark4, backgroundColor: colors.colorBlueDark5 }}
            >
              <Icon path={mdiInformationOutline} size={0.7} color={colors.colorBlueDark1} className="mt-0.5 shrink-0" />
              <p className="text-[12px]" style={{ color: colors.colorBlueDark1 }}>
                You're viewing this flow as a hotel user. To change the configuration, contact Canary Support.
              </p>
            </div>
          )}

          {/* Steps */}
          {flow.steps.length === 0 ? (
            <div className="p-10 rounded-lg border border-dashed border-[#C5C5C5] bg-white text-center">
              <p className="text-[14px] text-[#888] mb-3">This flow has no steps yet.</p>
              {!isReadOnly && (
                <CanaryButton type={ButtonType.PRIMARY} size={ButtonSize.NORMAL} onClick={() => setIsAddStepOpen(true)}>
                  Add first step
                </CanaryButton>
              )}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
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
              </SortableContext>
            </DndContext>
          )}

          {/* Bottom add-step action */}
          {!isReadOnly && flow.steps.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setIsAddStepOpen(true)}
                className="w-full py-3 rounded-lg border border-dashed border-[#C5C5C5] text-[13px] font-semibold text-[#888] hover:border-[#2858C4] hover:text-[#2858C4] transition-colors flex items-center justify-center gap-2"
              >
                <Icon path={mdiPlusCircleOutline} size={0.7} />
                Add another step
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
