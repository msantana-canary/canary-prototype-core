'use client';

/**
 * Addons — Matching Figma (5:1584)
 *
 * Room upgrades tab with cards (image, title 24px SemiBold, tags, price + Request button)
 * Add-ons tab with simpler cards (image, title, price + Request)
 * Full-width tab bar with gold underline, "Your room" dropdown, section headers
 */

import React, { useState } from 'react';
import { CanarySelectUnderline, CanaryTabs, InputSize } from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import Image from 'next/image';

interface UpgradeItem {
  id: string;
  name: string;
  price: number;
  image: string;
  guests: number;
  beds: string;
  sqft: string;
}

interface AddonItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

const ROOM_UPGRADES: UpgradeItem[] = [
  { id: 'upgrade-city', name: 'Deluxe City-View Room', price: 199, image: '/images/hotel-property.png', guests: 2, beds: '1 KING, 1 CRIB', sqft: '438 SQ FT' },
  { id: 'upgrade-exec', name: 'Executive Suite', price: 399, image: '/images/hotel-property.png', guests: 3, beds: '1 KING, 1 QUEEN', sqft: '948 SQ FT' },
  { id: 'upgrade-pres', name: 'Presidential Suite', price: 599, image: '/images/hotel-property.png', guests: 4, beds: '1 KING, 1 QUEEN', sqft: '1,367 SQ FT' },
];

const ADD_ONS: AddonItem[] = [
  { id: 'addon-early', name: 'Early Check-in', price: 59, image: '/images/hotel-property.png' },
  { id: 'addon-late', name: 'Late Checkout', price: 59, image: '/images/hotel-property.png' },
  { id: 'addon-water', name: 'Bottle of water', price: 5, image: '/images/hotel-property.png' },
  { id: 'addon-shuttle', name: 'Airport shuttle', price: 99, image: '/images/hotel-property.png' },
];

const ROOM_OPTIONS = [
  { value: 'current', label: 'Standard King - Room 153' },
];

export function Addons() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const [activeTab, setActiveTab] = useState<'upgrades' | 'addons'>('upgrades');
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const handleRequest = (id: string) => {
    setRequested((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  return (
    <div className="flex flex-col">
      {/* Instruction */}
      <div style={{ padding: 24 }}>
        <p style={{ fontSize: 18, lineHeight: '28px', color: theme.fontColor }}>
          Once approved, your room upgrade will be added to your reservation.
        </p>
      </div>

      {/* Tab bar — CanaryTabs text variant with bottom border */}
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.15)' }}>
        <CanaryTabs
          variant="text"
          defaultTab="upgrades"
          onChange={(tabId) => setActiveTab(tabId as 'upgrades' | 'addons')}
          tabs={[
            { id: 'upgrades', label: 'Room upgrades', content: null },
            { id: 'addons', label: 'Add-ons', content: null },
          ]}
        />
      </div>

      {/* Your room dropdown + subtitle (upgrades tab only) */}
      {activeTab === 'upgrades' && (
        <div style={{ padding: 24, gap: 8 }} className="flex flex-col">
          <p style={{ fontSize: 18, lineHeight: '28px', color: theme.fontColor }}>
            Take the opportunity to request a room upgrade
          </p>
          <CanarySelectUnderline
            label="Your room"
            placeholder="Your room"
            options={ROOM_OPTIONS}
            size={InputSize.LARGE}
            defaultValue="current"
          />
        </div>
      )}

      {/* Cards — keyed on tab for fade transition */}
      <div key={activeTab} className="flex flex-col animate-fade-in" style={{ padding: '32px 24px 40px', gap: 24 }}>
        {activeTab === 'upgrades' ? (
          ROOM_UPGRADES.map((item) => (
            <UpgradeCard key={item.id} item={item} requested={requested.has(item.id)} onRequest={() => handleRequest(item.id)} primaryColor={theme.primaryColor} />
          ))
        ) : (
          <>
            {/* Add Ons section header */}
            <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: '36px', color: theme.fontColor }}>Add Ons</h2>
            {ADD_ONS.map((item) => (
              <AddonCard key={item.id} item={item} requested={requested.has(item.id)} onRequest={() => handleRequest(item.id)} primaryColor={theme.primaryColor} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function UpgradeCard({ item, requested, onRequest, primaryColor }: { item: UpgradeItem; requested: boolean; onRequest: () => void; primaryColor: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-sm" style={{ backgroundColor: '#fcf9f4', boxShadow: '0px 12px 32px rgba(0,0,0,0.12)' }}>
      {/* Image */}
      <div className="relative w-full" style={{ height: 200 }}>
        <Image src={item.image} alt={item.name} fill className="object-cover" />
        {/* Carousel dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 items-center">
          <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <div className="rounded-full" style={{ width: 8, height: 8, backgroundColor: '#fff' }} />
          <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>
      {/* Body */}
      <div className="flex flex-col" style={{ padding: 16, gap: 16 }}>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <h3 style={{ fontSize: 24, fontWeight: 600, lineHeight: '36px', color: '#000' }}>{item.name}</h3>
          {/* Tags */}
          <div className="flex flex-wrap items-center" style={{ gap: '4px 16px' }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#666', textTransform: 'uppercase' }}>👤 {item.guests}</span>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#666', textTransform: 'uppercase' }}>🛏 {item.beds}</span>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#666', textTransform: 'uppercase' }}>📐 {item.sqft}</span>
          </div>
        </div>
        {/* Price + Request */}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 24, fontWeight: 600, lineHeight: '36px', color: '#000' }}>+${item.price}/night</span>
          <button
            onClick={onRequest}
            className="flex items-center justify-center"
            style={{
              height: 48, padding: '0 16px', borderRadius: 4, fontSize: 16, fontWeight: 500,
              backgroundColor: requested ? 'transparent' : primaryColor,
              color: requested ? primaryColor : '#fff',
              border: requested ? `1px solid ${primaryColor}` : 'none',
            }}
          >
            {requested ? 'Requested' : 'Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddonCard({ item, requested, onRequest, primaryColor }: { item: AddonItem; requested: boolean; onRequest: () => void; primaryColor: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-sm" style={{ backgroundColor: '#fcf9f4', boxShadow: '0px 12px 32px rgba(0,0,0,0.12)' }}>
      <div className="relative w-full" style={{ height: 200 }}>
        <Image src={item.image} alt={item.name} fill className="object-cover" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 items-center">
          <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <div className="rounded-full" style={{ width: 8, height: 8, backgroundColor: '#fff' }} />
          <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>
      <div className="flex flex-col" style={{ padding: 16, gap: 16 }}>
        <h3 style={{ fontSize: 24, fontWeight: 600, lineHeight: '36px', color: '#000' }}>{item.name}</h3>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 24, fontWeight: 600, lineHeight: '36px', color: '#000' }}>${item.price}</span>
          <button
            onClick={onRequest}
            className="flex items-center justify-center"
            style={{
              height: 48, padding: '0 16px', borderRadius: 4, fontSize: 16, fontWeight: 500,
              backgroundColor: requested ? 'transparent' : primaryColor,
              color: requested ? primaryColor : '#fff',
              border: requested ? `1px solid ${primaryColor}` : 'none',
            }}
          >
            {requested ? 'Requested' : 'Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
