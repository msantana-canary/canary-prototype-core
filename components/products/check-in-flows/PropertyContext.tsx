'use client';

/**
 * PropertyContext
 *
 * The header card that sits above the flow grid on the landing view.
 * Shows the property's brand, country, address, and currency — plus an
 * interactive feature-flag grid + brand override on Statler.
 *
 * Toggling a flag regenerates that property's flows in real time.
 */

import React from 'react';
import Icon from '@mdi/react';
import { mdiMapMarkerOutline, mdiDomain, mdiCurrencyUsd, mdiCurrencyEur, mdiCash, mdiChevronDown } from '@mdi/js';
import { colors, CanarySwitch } from '@canary-ui/components';
import { useCheckInFlowsStore, useCurrentProperty } from '@/lib/products/check-in-flows/store';
import type { Brand, PropertyFeatureFlags } from '@/lib/products/check-in-flows/types';

const BRAND_LABELS: Record<Brand, string> = {
  'wyndham': 'Wyndham',
  'best-western': 'Best Western',
  'ihg': 'IHG',
  'marriott': 'Marriott',
  'independent': 'Independent',
};

const CURRENCY_ICON: Record<string, string> = {
  USD: mdiCurrencyUsd,
  EUR: mdiCurrencyEur,
  SGD: mdiCash,
};

// Feature flag grouping for the UI
const FLAG_GROUPS: {
  title: string;
  flags: { key: keyof PropertyFeatureFlags; label: string; hint?: string }[];
}[] = [
  {
    title: 'Identity & Verification',
    flags: [
      { key: 'hasIdVerification', label: 'ID Verification' },
      { key: 'hasOcr', label: 'OCR (ID scan)' },
    ],
  },
  {
    title: 'Payment',
    flags: [
      { key: 'hasDepositCollection', label: 'Deposit Collection' },
    ],
  },
  {
    title: 'Guest Experience',
    flags: [
      { key: 'hasUpsells', label: 'Upsells' },
      { key: 'hasMobileKey', label: 'Mobile Key' },
      { key: 'hasLoyaltyProgram', label: 'Loyalty Program' },
    ],
  },
];

export function PropertyContext() {
  const property = useCurrentProperty();
  const togglePropertyFeature = useCheckInFlowsStore((s) => s.togglePropertyFeature);
  const setBrandOverride = useCheckInFlowsStore((s) => s.setBrandOverride);
  const isReadOnly = false;
  const currencyIcon = CURRENCY_ICON[property.currency] ?? mdiCash;

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5]">
      {/* Identity strip */}
      <div className="px-6 py-5 border-b border-[#E5E5E5] flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[20px] font-bold text-[#2B2B2B] mb-1 leading-tight">{property.name}</h2>
          <div className="flex items-center gap-4 text-[12px] text-[#666] flex-wrap">
            <span className="flex items-center gap-1">
              <Icon path={mdiMapMarkerOutline} size={0.6} color="#999" />
              {property.address}
            </span>
            <span className="flex items-center gap-1">
              <Icon path={mdiDomain} size={0.6} color="#999" />
              {property.brand ? BRAND_LABELS[property.brand] : 'Independent'}
            </span>
            <span className="flex items-center gap-1">
              <Icon path={currencyIcon} size={0.6} color="#999" />
              {property.currency}
            </span>
            <span className="text-[#999]">Languages: {property.defaultLanguages.join(', ').toUpperCase()}</span>
          </div>
        </div>

        {/* Brand override — only meaningful on properties with a brand assigned */}
        {property.brand && property.brand !== 'independent' && (
          <BrandSelector
            current={property.brand}
            onChange={(b) => setBrandOverride(property.id, b)}
            disabled={isReadOnly}
          />
        )}
      </div>

      {/* Feature flags */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#888]">
            Property Configuration
          </h3>
          <span className="text-[11px] text-[#AAA]">
            Feature flags drive default flows — toggle to see them regenerate live
          </span>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5">
          {FLAG_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#2B2B2B] mb-2">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.flags.map((flag) => {
                  const enabled = property.features[flag.key];
                  return (
                    <div
                      key={flag.key}
                      className={`flex items-start justify-between gap-3 ${
                        isReadOnly ? 'opacity-80' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className={`text-[13px] ${enabled ? 'text-[#2B2B2B]' : 'text-[#888]'}`}>
                          {flag.label}
                        </div>
                        {flag.hint && (
                          <div className="text-[11px] text-[#AAA]">{flag.hint}</div>
                        )}
                      </div>
                      <CanarySwitch
                        checked={enabled}
                        onChange={() => !isReadOnly && togglePropertyFeature(property.id, flag.key)}
                        isDisabled={isReadOnly}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandSelector({
  current,
  onChange,
  disabled,
}: {
  current: Brand;
  onChange: (brand: Brand) => void;
  disabled: boolean;
}) {
  const options: Brand[] = ['wyndham', 'best-western', 'ihg', 'marriott'];
  return (
    <div className="shrink-0 flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-[#999] font-semibold">Brand</label>
      <div className="relative">
        <select
          value={current}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as Brand)}
          className={`appearance-none h-9 pl-3 pr-9 rounded-md border border-[#E5E5E5] bg-white text-[13px] font-semibold text-[#2B2B2B] ${
            disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#999]'
          }`}
          style={{ minWidth: 160 }}
        >
          {options.map((b) => (
            <option key={b} value={b}>{BRAND_LABELS[b]}</option>
          ))}
        </select>
        <Icon
          path={mdiChevronDown}
          size={0.7}
          color="#999"
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>
    </div>
  );
}
