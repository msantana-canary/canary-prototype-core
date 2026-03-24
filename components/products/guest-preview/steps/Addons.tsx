'use client';

/**
 * Addons — Upsell cards step
 *
 * Shows addon items with images, descriptions, prices, and quantity selectors.
 */

import React, { useState } from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { DEMO_ADDONS } from '@/lib/products/guest-preview/mock-form-data';
import { GuestCounter } from '@/components/core/GuestCounter';
import Image from 'next/image';

export function Addons() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const totalSelected = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = DEMO_ADDONS.reduce(
    (sum, addon) => sum + addon.price * (quantities[addon.id] || 0),
    0
  );

  return (
    <div className="flex flex-col gap-0">
      <div className="mb-4">
        <h2 className="text-[18px] font-semibold" style={{ color: theme.fontColor }}>
          Enhance Your Stay
        </h2>
        <p className="text-[13px] text-[#6b7280] mt-1">
          Add extras to make your visit even more special.
        </p>
      </div>

      {/* Addon cards */}
      <div className="flex flex-col gap-3">
        {DEMO_ADDONS.map((addon) => {
          const qty = quantities[addon.id] || 0;
          return (
            <div
              key={addon.id}
              className="rounded-lg border overflow-hidden transition-colors"
              style={{
                borderColor: qty > 0 ? theme.primaryColor : '#e5e7eb',
                backgroundColor: theme.cardBackgroundColor,
              }}
            >
              {/* Image */}
              <div className="relative w-full h-[120px]">
                <Image
                  src={addon.image}
                  alt={addon.name}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Content */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-[#111827]">{addon.name}</h3>
                    <p className="text-[12px] text-[#6b7280] mt-0.5 line-clamp-2">{addon.description}</p>
                  </div>
                  <span className="text-[16px] font-semibold flex-shrink-0" style={{ color: theme.primaryColor }}>
                    ${addon.price}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <GuestCounter
                    value={qty}
                    onChange={(v) => setQuantities((prev) => ({ ...prev, [addon.id]: v }))}
                    max={5}
                    primaryColor={theme.primaryColor}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {totalSelected > 0 && (
        <div className="mt-4 p-3 rounded-lg border border-[#e5e7eb]" style={{ backgroundColor: theme.cardBackgroundColor }}>
          <div className="flex justify-between text-[14px]">
            <span className="text-[#6b7280]">{totalSelected} add-on{totalSelected > 1 ? 's' : ''} selected</span>
            <span className="font-semibold" style={{ color: theme.primaryColor }}>+${totalPrice}</span>
          </div>
        </div>
      )}
    </div>
  );
}
