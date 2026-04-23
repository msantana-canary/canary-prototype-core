'use client';

/**
 * AddStepModal
 *
 * Picker for available step templates, filtered by:
 * - The property's feature flags
 * - The property's country (gates compliance steps)
 * - The flow's surface (some templates don't support every surface)
 *
 * Categories group templates; click a template to add a fresh instance
 * to the flow.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiCloseCircle } from '@mdi/js';
import {
  CanaryModal,
  CanaryButton,
  ButtonType,
  ButtonColor,
  colors,
} from '@canary-ui/components';

import type { FlowDefinition, StepInstance, Property } from '@/lib/products/check-in-flows/types';
import type { TemplateCategory, StepTemplateMeta } from '@/lib/products/check-in-flows/step-templates';
import { getAvailableTemplates, STEP_TEMPLATE_MAP } from '@/lib/products/check-in-flows/step-templates';
import { createBlankStepFromTemplate } from '@/lib/products/check-in-flows/step-factory';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';

interface AddStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: FlowDefinition;
  property: Property;
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  identity: 'Identity',
  payment: 'Payment',
  loyalty: 'Loyalty',
  nested: 'Nested Flows',
  other: 'Other',
};

export function AddStepModal({ isOpen, onClose, flow, property }: AddStepModalProps) {
  const addStep = useCheckInFlowsStore((s) => s.addStep);

  if (!isOpen) return null;

  const templates = getAvailableTemplates(property.features, property.countryCode, flow.surface);

  // Group by category
  const byCategory = templates.reduce<Record<TemplateCategory, StepTemplateMeta[]>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {} as Record<TemplateCategory, StepTemplateMeta[]>);

  // Already-added template IDs (so we can disable them visually)
  const existingTemplateIds = new Set(flow.steps.map((s) => s.templateId));

  const handleAdd = (template: StepTemplateMeta) => {
    const step = createBlankStepFromTemplate(template.id, flow.id, property);
    addStep(flow.id, step);
    onClose();
  };

  return (
    <CanaryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add a step"
      size="large"
      showCloseButton
    >
      <div className="space-y-6 max-h-[560px] overflow-y-auto pr-2">
        {Object.entries(byCategory).map(([category, categoryTemplates]) => (
          <div key={category}>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#888] mb-2">
              {CATEGORY_LABELS[category as TemplateCategory]}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {categoryTemplates.map((template) => {
                const alreadyAdded = existingTemplateIds.has(template.id);
                return (
                  <button
                    key={template.id}
                    onClick={() => handleAdd(template)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      alreadyAdded
                        ? 'border-[#E5E5E5] bg-[#FAFAFA]'
                        : 'border-[#E5E5E5] bg-white hover:border-[#2858C4] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: alreadyAdded ? '#F4F4F5' : colors.colorBlueDark5,
                        }}
                      >
                        <Icon
                          path={template.icon}
                          size={0.8}
                          color={alreadyAdded ? '#AAA' : colors.colorBlueDark1}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[13px] font-semibold text-[#2B2B2B]">
                            {template.displayName}
                          </h4>
                          {alreadyAdded && (
                            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#888] font-semibold">
                              Added
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#666] mt-0.5 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="text-center py-10 text-[14px] text-[#888]">
            No step templates available for this surface and property configuration.
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[#E5E5E5]">
        <CanaryButton type={ButtonType.OUTLINED} onClick={onClose}>
          Close
        </CanaryButton>
      </div>
    </CanaryModal>
  );
}
