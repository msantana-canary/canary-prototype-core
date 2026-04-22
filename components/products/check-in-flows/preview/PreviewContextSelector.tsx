'use client';

/**
 * PreviewContextSelector
 *
 * Inputs for simulating guest state on the Live Preview tab. Changing
 * these values drives condition evaluation → the preview updates in
 * real time.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiEarth,
  mdiStarOutline,
  mdiRepeat,
  mdiAccountCheckOutline,
  mdiBriefcaseOutline,
  mdiCalendarOutline,
  mdiTranslate,
} from '@mdi/js';
import { colors } from '@canary-ui/components';

import { useCheckInFlowsStore, useCurrentProperty } from '@/lib/products/check-in-flows/store';
import {
  COUNTRIES,
  LOYALTY_TIERS,
  RATE_CODES,
  RESERVATION_SOURCES,
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

      {/* Language */}
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

      {/* Nationality */}
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

      {/* Loyalty tier */}
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

      {/* Age */}
      <Row icon={mdiAccountCheckOutline} label="Age">
        <input
          type="number"
          value={ctx.guestAge}
          onChange={(e) => setCtx({ guestAge: Number(e.target.value) || 0 })}
          className="w-full h-8 px-2 rounded-md border border-[#E5E5E5] bg-white text-[12px]"
        />
      </Row>

      {/* Returning guest */}
      <Row icon={mdiRepeat} label="Returning">
        <select
          value={ctx.isReturningGuest ? 'yes' : 'no'}
          onChange={(e) => setCtx({ isReturningGuest: e.target.value === 'yes' })}
          className="w-full h-8 px-2 rounded-md border border-[#E5E5E5] bg-white text-[12px]"
        >
          <option value="no">First-time guest</option>
          <option value="yes">Returning guest</option>
        </select>
      </Row>

      {/* Reservation source */}
      <Row icon={mdiBriefcaseOutline} label="Source">
        <select
          value={ctx.reservationSource}
          onChange={(e) => setCtx({ reservationSource: e.target.value as any })}
          className="w-full h-8 px-2 rounded-md border border-[#E5E5E5] bg-white text-[12px]"
        >
          {RESERVATION_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Row>

      {/* Rate code */}
      <Row icon={mdiBriefcaseOutline} label="Rate code">
        <select
          value={ctx.rateCode}
          onChange={(e) => setCtx({ rateCode: e.target.value })}
          className="w-full h-8 px-2 rounded-md border border-[#E5E5E5] bg-white text-[12px]"
        >
          {RATE_CODES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </Row>

      {/* Length of stay */}
      <Row icon={mdiCalendarOutline} label="Nights">
        <input
          type="number"
          min={1}
          value={ctx.lengthOfStay}
          onChange={(e) => setCtx({ lengthOfStay: Math.max(1, Number(e.target.value) || 1) })}
          className="w-full h-8 px-2 rounded-md border border-[#E5E5E5] bg-white text-[12px]"
        />
      </Row>

      {/* Property quick-context readout */}
      <div className="pt-3 border-t border-[#F4F4F5]">
        <p className="text-[11px] text-[#888] leading-relaxed">
          Rendering for <strong>{property.name}</strong> in{' '}
          <strong>{property.country}</strong>. Preview content is localized to{' '}
          <strong>{ctx.language.toUpperCase()}</strong>.
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
