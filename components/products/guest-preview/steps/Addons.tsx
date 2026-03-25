'use client';

/**
 * Addons — Upsell cards matching Figma
 *
 * Room upgrades and add-ons with hotel images,
 * prices, and gold "Request" buttons.
 * "Skip" link at bottom.
 */

import React, { useState } from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import Image from 'next/image';

interface AddonItem {
  id: string;
  name: string;
  price: number;
  image: string;
  details?: string;
  isUpgrade?: boolean;
}

const ROOM_UPGRADES: AddonItem[] = [
  { id: 'upgrade-city', name: 'Deluxe City-View Room', price: 199, image: '/images/hotel-property.png', details: '2 · 1 KING, 1 CRIB · 438 SQ FT', isUpgrade: true },
  { id: 'upgrade-exec', name: 'Executive Suite', price: 399, image: '/images/hotel-property.png', details: '2 · 1 KING, 1 QUEEN · 640 SQ FT', isUpgrade: true },
  { id: 'upgrade-pres', name: 'Presidential Suite', price: 599, image: '/images/hotel-property.png', details: '4 · 1 KING, 1 QUEEN · 1,347 SQ FT', isUpgrade: true },
];

const ADD_ONS: AddonItem[] = [
  { id: 'addon-early', name: 'Early Check-in', price: 59, image: '/images/hotel-property.png' },
  { id: 'addon-late', name: 'Late Checkout', price: 59, image: '/images/hotel-property.png' },
  { id: 'addon-water', name: 'Bottle of water', price: 5, image: '/images/hotel-property.png' },
  { id: 'addon-shuttle', name: 'Airport shuttle', price: 99, image: '/images/hotel-property.png' },
];

export function Addons() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const [activeTab, setActiveTab] = useState<'upgrades' | 'addons'>('upgrades');
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const handleRequest = (id: string) => {
    setRequested((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const items = activeTab === 'upgrades' ? ROOM_UPGRADES : ADD_ONS;

  return (
    <div className="flex flex-col pb-6">
      {/* Instruction */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-[16px] text-[#666] leading-[24px]">
          Once approved, your room upgrade will be added to your reservation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 px-6 mb-4">
        <button
          onClick={() => setActiveTab('upgrades')}
          className="text-[14px] pb-1"
          style={{
            fontWeight: activeTab === 'upgrades' ? 500 : 400,
            color: activeTab === 'upgrades' ? theme.primaryColor : '#666',
            borderBottom: activeTab === 'upgrades' ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
          }}
        >
          Room upgrades
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className="text-[14px] pb-1"
          style={{
            fontWeight: activeTab === 'addons' ? 500 : 400,
            color: activeTab === 'addons' ? theme.primaryColor : '#666',
            borderBottom: activeTab === 'addons' ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
          }}
        >
          Add-ons
        </button>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-4 px-6">
        {items.map((item) => {
          const isRequested = requested.has(item.id);
          return (
            <div key={item.id} className="flex flex-col gap-2">
              {/* Image */}
              <div className="relative w-full h-[160px] rounded-lg overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              {/* Info row */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-medium text-black">{item.name}</h3>
                  {item.details && (
                    <p className="text-[12px] text-[#666] mt-0.5">{item.details}</p>
                  )}
                  <p className="text-[18px] font-semibold text-black mt-1">
                    {item.isUpgrade ? `+$${item.price}/night` : `$${item.price}`}
                  </p>
                </div>
                <button
                  onClick={() => handleRequest(item.id)}
                  className="flex-shrink-0 px-4 py-1.5 rounded text-[14px] font-medium ml-3"
                  style={{
                    backgroundColor: isRequested ? theme.primaryColor : `${theme.primaryColor}15`,
                    color: isRequested ? 'white' : theme.primaryColor,
                    border: `1px solid ${theme.primaryColor}`,
                  }}
                >
                  {isRequested ? 'Requested' : 'Request'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
