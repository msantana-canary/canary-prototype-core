'use client';

/**
 * PreviewContextSelector
 *
 * Inputs for simulating guest state on the Live Preview tab. Changing
 * these values drives condition evaluation → the preview updates in
 * real time.
 *
 * Scoped narrow for MVP: nationality + loyalty status. Engineering
 * adds more parameters (age, rate code, length of stay, etc.) as CS
 * needs them.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiEarth,
  mdiStarOutline,
  mdiTranslate,
} from '@mdi/js';

import { useCheckInFlowsStore, useCurrentProperty } from '@/lib/products/check-in-flows/store';
import {
  COUNTRIES,
  LOYALTY_TIERS,
} from '@/lib/products/check-in-flows/condition-meta';

export function PreviewContextSelector() {
  const ctx = useCheckInFlowsStore((s) => s.previewContext);
  const setCtx = useCheckInFlowsStore((s) => s.setPreviewContext);
  const setLang = useCheckInFlowsStore((s) => s.setPreviewLanguage);
  const property = useCurrentProperty();

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 space-y-4">
      <div>
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#888] mb-1">
          Simulate Guest
        </h3>
        <p className="text-[11px] text-[#AAA]">
          Conditions in your flow evaluate against these values live
        </p>
      </div>

      {property.defaultLanguages.length > 1 && (
        <Row icon={mdiTranslate} label="Language">
          <select
            value={ctx.language}
            onChange={(e) => setLang(e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-[#E5E5E5] bg-white text-[12px]"
          >
            {property.defaultLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </Row>
      )}

      <Row icon={mdiEarth} label="Nationality">
        <select
          value={ctx.guestNationalityCode}
          onChange={(e) => setCtx({ guestNationalityCode: e.target.value })}
          className="w-full h-8 px-2 rounded-md border border-[#E5E5E5] bg-white text-[12px]"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </Row>

      <Row icon={mdiStarOutline} label="Loyalty">
        <select
          value={ctx.loyaltyTier}
          onChange={(e) => setCtx({ loyaltyTier: e.target.value as any })}
          className="w-full h-8 px-2 rounded-md border border-[#E5E5E5] bg-white text-[12px]"
        >
          {LOYALTY_TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Row>

      <div className="pt-3 border-t border-[#F4F4F5]">
        <p className="text-[11px] text-[#888] leading-relaxed">
          Rendering for <strong>{property.name}</strong>.
        </p>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#F4F4F5' }}
      >
        <Icon path={icon} size={0.6} color="#666" />
      </div>
      <label className="text-[12px] text-[#666] w-20 shrink-0">{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
