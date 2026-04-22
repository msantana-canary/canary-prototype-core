'use client';

/**
 * FlowCard
 *
 * Card representing a single flow in the grid. Shows surface, step count,
 * step-type chips, customized/default status. Click drills into the flow.
 *
 * Two variants:
 * - 'main' — featured cards for top-level flows (Web, Mobile, Tablet, Kiosk)
 * - 'nested' — compact cards for sub-flows (Upsells, Mobile Key, etc.)
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiArrowRight, mdiCogOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';
import type { FlowDefinition, Surface } from '@/lib/products/check-in-flows/types';
import { SURFACE_LABELS } from '@/lib/products/check-in-flows/types';
import { getStepTemplateMeta } from '@/lib/products/check-in-flows/step-templates';
import {
  mdiWeb,
  mdiCellphone,
  mdiTabletCellphone,
  mdiMonitor,
  mdiApplicationOutline,
} from '@mdi/js';

const SURFACE_ICON: Record<Surface, string> = {
  'web': mdiWeb,
  'mobile-web': mdiCellphone,
  'tablet-reg': mdiTabletCellphone,
  'kiosk': mdiMonitor,
  'mobile-app': mdiApplicationOutline,
};

interface FlowCardProps {
  flow: FlowDefinition;
  variant?: 'main' | 'nested';
  onClick?: () => void;
}

export function FlowCard({ flow, variant = 'main', onClick }: FlowCardProps) {
  if (variant === 'nested') {
    return <NestedFlowCard flow={flow} onClick={onClick} />;
  }
  return <MainFlowCard flow={flow} onClick={onClick} />;
}

function MainFlowCard({ flow, onClick }: { flow: FlowDefinition; onClick?: () => void }) {
  const surfaceIcon = SURFACE_ICON[flow.surface];
  const previewSteps = flow.steps.slice(0, 8);
  const remainingSteps = flow.steps.length - previewSteps.length;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-lg border border-[#E5E5E5] hover:border-[#999] hover:shadow-sm transition-all overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-[#EEE]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: colors.colorBlueDark5 }}
            >
              <Icon path={surfaceIcon} size={0.85} color={colors.colorBlueDark1} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#2B2B2B] leading-tight">{flow.name}</h3>
              <p className="text-[11px] text-[#888] mt-0.5">{SURFACE_LABELS[flow.surface]}</p>
            </div>
          </div>
          <StatusBadge flow={flow} />
        </div>

        <div className="flex items-center justify-between text-[12px] text-[#666]">
          <span>
            <span className="font-semibold text-[#2B2B2B]">{flow.steps.length}</span> steps
          </span>
          <span className="flex items-center gap-1 text-[12px] font-semibold text-[#888] group-hover:text-[#2B2B2B] transition-colors">
            Configure <Icon path={mdiArrowRight} size={0.55} />
          </span>
        </div>
      </div>

      {/* Step chips */}
      <div className="px-5 py-3 flex flex-wrap gap-1" style={{ backgroundColor: '#FAFAFA' }}>
        {previewSteps.map((step, idx) => {
          const template = getStepTemplateMeta(step.templateId);
          const hasCondition = (step.conditions && step.conditions.length > 0);
          return (
            <span
              key={step.id}
              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-white border border-[#E5E5E5] text-[#555]"
              title={step.name}
            >
              <Icon path={template.icon} size={0.48} color="#888" />
              <span className="max-w-[110px] truncate">{step.name}</span>
              {hasCondition && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: colors.colorBlueDark1 }}
                  title="Has conditions"
                />
              )}
            </span>
          );
        })}
        {remainingSteps > 0 && (
          <span className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded bg-white border border-[#E5E5E5] text-[#888]">
            +{remainingSteps} more
          </span>
        )}
      </div>
    </button>
  );
}

function NestedFlowCard({ flow, onClick }: { flow: FlowDefinition; onClick?: () => void }) {
  // Use the flow.name to derive an icon — map to the nested template equivalent
  const iconMap: Record<string, string> = {
    'Upsells': 'tag-outline',
    'Mobile Key': 'key-outline',
    'Accompanying Guest': 'account-multiple-outline',
    'Guest Profile': 'account-check-outline',
  };
  // Fall back to first step's template icon
  const firstStep = flow.steps[0];
  const template = firstStep ? getStepTemplateMeta(firstStep.templateId) : null;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-lg border border-[#E5E5E5] hover:border-[#999] hover:shadow-sm transition-all overflow-hidden"
    >
      <div className="px-4 py-3 flex items-start gap-3">
        {template && (
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#F4F4F5' }}
          >
            <Icon path={template.icon} size={0.85} color="#666" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-[13px] font-semibold text-[#2B2B2B] truncate">{flow.name}</h4>
            <span
              className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold shrink-0"
              style={{ backgroundColor: colors.colorBlueDark5, color: colors.colorBlueDark1 }}
            >
              Nested
            </span>
          </div>
          {flow.description && (
            <p className="text-[11px] text-[#888] mt-0.5 line-clamp-2">{flow.description}</p>
          )}
          <p className="text-[10px] text-[#AAA] mt-1">
            {flow.steps.length} step{flow.steps.length === 1 ? '' : 's'}
          </p>
        </div>
        <Icon
          path={mdiArrowRight}
          size={0.6}
          color="#BBB"
          className="group-hover:text-[#666] transition-colors mt-1"
        />
      </div>
    </button>
  );
}

function StatusBadge({ flow }: { flow: FlowDefinition }) {
  if (flow.isCustomized) {
    return (
      <span
        className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-semibold shrink-0"
        style={{ backgroundColor: colors.colorBlueDark5, color: colors.colorBlueDark1 }}
      >
        Customized
      </span>
    );
  }
  return (
    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-semibold bg-[#F4F4F5] text-[#888] shrink-0">
      Default
    </span>
  );
}
