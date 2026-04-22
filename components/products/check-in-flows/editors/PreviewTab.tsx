'use client';

/**
 * PreviewTab
 *
 * Live PhoneFrame render of a single step, reading config + preview
 * context from the store. Left side: context selector. Right side:
 * PhoneFrame with StepRenderer inside.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiCellphone, mdiMonitor } from '@mdi/js';
import { colors } from '@canary-ui/components';

import type { StepInstance, FlowDefinition } from '@/lib/products/check-in-flows/types';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';
import { PhoneFrame } from '@/components/core/PhoneFrame';
import { PreviewContextSelector } from '../preview/PreviewContextSelector';
import { StepRenderer } from '../preview/StepRenderer';

interface Props {
  step: StepInstance;
  flow: FlowDefinition;
}

export function PreviewTab({ step, flow }: Props) {
  const ctx = useCheckInFlowsStore((s) => s.previewContext);
  const previewSurface = useCheckInFlowsStore((s) => s.previewSurface);
  const setPreviewSurface = useCheckInFlowsStore((s) => s.setPreviewSurface);

  return (
    <div className="h-full grid grid-cols-[320px,1fr] overflow-hidden">
      {/* Left rail */}
      <aside className="bg-[#F4F4F5] border-r border-[#E5E5E5] overflow-auto p-4 space-y-4">
        <SurfaceSwitcher value={previewSurface} onChange={setPreviewSurface} />
        <PreviewContextSelector />
      </aside>

      {/* Right preview stage */}
      <div className="overflow-auto flex items-center justify-center p-6" style={{ backgroundColor: '#E8ECF4' }}>
        <div className="w-full max-w-[420px] h-full max-h-[820px]">
          <PhoneFrame showUrlBar={false}>
            <div className="w-full h-full flex flex-col bg-white">
              <StepRenderer step={step} ctx={ctx} />
            </div>
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}

// ── Surface switcher ─────────────────────────────────────

function SurfaceSwitcher({
  value,
  onChange,
}: {
  value: 'web' | 'mobile-web' | 'tablet-reg' | 'kiosk' | 'mobile-app';
  onChange: (v: any) => void;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#888] mb-2">
        Surface
      </h3>
      <div className="flex items-center gap-1 p-1 bg-white rounded-md border border-[#E5E5E5]">
        <SurfaceButton
          active={value === 'mobile-web'}
          onClick={() => onChange('mobile-web')}
          icon={mdiCellphone}
          label="Mobile"
        />
        <SurfaceButton
          active={value === 'web'}
          onClick={() => onChange('web')}
          icon={mdiMonitor}
          label="Web"
        />
      </div>
      <p className="mt-1.5 text-[11px] text-[#AAA]">
        Rendering on a mobile frame — web render variation coming later.
      </p>
    </div>
  );
}

function SurfaceButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-8 rounded flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-colors ${
        active ? 'bg-[#2B2B2B] text-white' : 'text-[#666] hover:text-[#2B2B2B]'
      }`}
      style={active ? { backgroundColor: colors.colorBlueDark1 } : undefined}
    >
      <Icon path={icon} size={0.55} />
      {label}
    </button>
  );
}
