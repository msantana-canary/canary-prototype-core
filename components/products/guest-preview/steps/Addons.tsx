'use client';

/**
 * Addons — Full production-matching add-ons page
 *
 * Combines both Figma references:
 * - Statler (5:1584): full-width cards for room upgrades, tab bar
 * - IHG themed (1:13185): 2-col grid upgrades, list add-ons, + buttons, skip footer
 *
 * Features:
 * - Room Upgrades: 2-column grid, compact cards with + button overlay
 * - Add-ons: list with 64px thumbnails, title/price, + button
 * - Room upgrade detail bottom sheet (image, specs, description, request button)
 * - Cart state: tracks selected items, computes total
 * - Skip vs Purchase footer: "Skip" when empty, "Purchase $X" when items selected
 * - Tab switching with fade transition
 * - Quantity support for add-ons (counter after first add)
 */

import React, { useState } from 'react';
import { CanaryTabs } from '@canary-ui/components';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
const useGoToNextStep = () => useCheckInConfigStore((s) => s.goToNextStep);
import { GuestBottomSheet } from '@/components/core/GuestBottomSheet';
import { GuestCounter } from '@/components/core/GuestCounter';
import Image from 'next/image';
import Icon from '@mdi/react';
import { mdiPlus, mdiCheck, mdiAccountOutline, mdiBedOutline, mdiRuler } from '@mdi/js';

// ── Data ──

interface RoomUpgrade {
  id: string;
  name: string;
  pricePerNight: number;
  image: string;
  guests: number;
  beds: string;
  sqft: string;
  description: string;
}

interface AddonItem {
  id: string;
  name: string;
  price: number;
  priceUnit?: string; // "/night", etc.
  image: string;
  description?: string;
  tag?: string; // e.g. "DIAMOND ELITE BENEFIT"
  isFree?: boolean;
}

const ROOM_UPGRADES: RoomUpgrade[] = [
  { id: 'up-deluxe', name: 'Deluxe City-View', pricePerNight: 199, image: '/images/hotel-property.png', guests: 2, beds: '1 KING, 1 CRIB', sqft: '438', description: 'Enjoy sweeping views of Midtown Manhattan from this elegantly appointed room featuring a king bed, premium linens, and a spacious work area. The marble bathroom includes a deep soaking tub and rain shower.' },
  { id: 'up-exec', name: 'Executive Suite', pricePerNight: 399, image: '/images/hotel-property.png', guests: 3, beds: '1 KING, 1 QUEEN', sqft: '948', description: 'A sophisticated suite with separate living area, dining space for four, and panoramic city views. Features include a walk-in closet, dual vanity bathroom, and exclusive access to the Executive Lounge.' },
  { id: 'up-junior', name: 'Junior Suite', pricePerNight: 299, image: '/images/hotel-property.png', guests: 2, beds: '1 KING', sqft: '620', description: 'An oversized room with a distinct sitting area and work desk. Floor-to-ceiling windows offer abundant natural light and views of the city skyline.' },
  { id: 'up-pres', name: 'Presidential Suite', pricePerNight: 599, image: '/images/hotel-property.png', guests: 4, beds: '1 KING, 1 QUEEN', sqft: '1,367', description: 'The crown jewel of the Statler featuring a grand living room, formal dining room, master bedroom with Central Park views, and a luxurious marble bathroom with separate shower and soaking tub.' },
];

const ADDON_ITEMS: AddonItem[] = [
  { id: 'addon-welcome', name: 'Welcome Amenity', price: 0, image: '/images/hotel-property.png', isFree: true, tag: 'DIAMOND ELITE BENEFIT', description: 'A curated selection of local artisan treats and refreshments delivered to your room upon arrival.' },
  { id: 'addon-late-3', name: 'Late Checkout \u2022 3 PM', price: 20, image: '/images/hotel-property.png', description: 'Extend your checkout by 4 hours for a leisurely departure.' },
  { id: 'addon-late-4', name: 'Late Checkout \u2022 4 PM', price: 55, image: '/images/hotel-property.png', description: 'Extend your checkout by 5 hours. Perfect for late afternoon flights.' },
  { id: 'addon-early', name: 'Early Check-in', price: 59, image: '/images/hotel-property.png', description: 'Check in as early as 12 PM and get settled before your afternoon.' },
  { id: 'addon-wine', name: 'Bottle Wine', price: 45, image: '/images/hotel-property.png', description: 'A hand-selected bottle of wine from our sommelier delivered to your room.' },
  { id: 'addon-cocktails', name: 'Two Cocktails', price: 45, image: '/images/hotel-property.png', description: 'Two craft cocktails of your choice from our bar menu, delivered to your room.' },
  { id: 'addon-champagne', name: 'Bottle of Champagne', price: 59, image: '/images/hotel-property.png', description: 'Celebrate with a bottle of Veuve Clicquot delivered to your room on ice.' },
  { id: 'addon-breakfast', name: 'Breakfast', price: 40, priceUnit: '/night', image: '/images/hotel-property.png', description: 'Full breakfast for two at Orla by Michael Mina, our award-winning restaurant.' },
  { id: 'addon-charger', name: 'Phone Charger', price: 19, image: '/images/hotel-property.png', description: 'Universal multi-device charger delivered to your room.' },
  { id: 'addon-hygiene', name: 'Hygiene Safety Kit', price: 10, image: '/images/hotel-property.png', description: 'Masks, sanitizer, and disinfecting wipes for your peace of mind.' },
];

// ── Component ──

export function Addons() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const goToNextStep = useGoToNextStep();
  const [activeTab, setActiveTab] = useState('upgrades');
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  const [detailItem, setDetailItem] = useState<RoomUpgrade | null>(null);

  // Cart logic
  const upgradeTotal = selectedUpgrade
    ? (ROOM_UPGRADES.find((u) => u.id === selectedUpgrade)?.pricePerNight ?? 0) * 2 // 2 nights
    : 0;
  const addonTotal = ADDON_ITEMS.reduce(
    (sum, item) => sum + item.price * (addonQuantities[item.id] || 0), 0
  );
  const cartTotal = upgradeTotal + addonTotal;
  const hasItems = selectedUpgrade || Object.values(addonQuantities).some((q) => q > 0);

  const toggleAddon = (id: string) => {
    setAddonQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) === 0 ? 1 : prev[id],
    }));
  };

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.backgroundColor }}>
        <CanaryTabs
          variant="text"
          defaultTab="upgrades"
          onChange={(tabId) => setActiveTab(tabId)}
          tabs={[
            { id: 'upgrades', label: 'Room Upgrades', content: null },
            { id: 'addons', label: 'Add-ons', content: null },
          ]}
        />
      </div>

      {/* Content */}
      <div key={activeTab} className="animate-fade-in">
        {/* ── Room Upgrades section ── */}
        {(activeTab === 'upgrades' || activeTab === 'addons') && (
          <div style={{ padding: '32px 24px 24px' }}>
            <h2 style={{ fontSize: 22, lineHeight: '1.2', color: theme.fontColor, marginBottom: 16 }}>
              Room Upgrades
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_UPGRADES.map((upgrade) => {
                const isSelected = selectedUpgrade === upgrade.id;
                return (
                  <div
                    key={upgrade.id}
                    className="flex flex-col cursor-pointer"
                    style={{ gap: 4 }}
                    onClick={() => setDetailItem(upgrade)}
                  >
                    {/* Image with + button overlay */}
                    <div className="relative rounded-lg overflow-hidden" style={{ height: 124, border: '1px solid #e5e5e5' }}>
                      <Image src={upgrade.image} alt={upgrade.name} fill className="object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUpgrade(isSelected ? null : upgrade.id);
                        }}
                        className="absolute flex items-center justify-center rounded"
                        style={{
                          right: 8, top: 84, width: 32, height: 32,
                          backgroundColor: isSelected ? 'transparent' : theme.primaryColor,
                          border: isSelected ? `2px solid ${theme.primaryColor}` : 'none',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        }}
                      >
                        <Icon
                          path={isSelected ? mdiCheck : mdiPlus}
                          size={0.7}
                          color={isSelected ? theme.primaryColor : '#fff'}
                        />
                      </button>
                    </div>
                    {/* Info */}
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, lineHeight: '1.4', color: theme.fontColor }}>{upgrade.name}</p>
                      <div className="flex flex-wrap items-center" style={{ gap: '3px 8px' }}>
                        <span className="flex items-center gap-[3px]">
                          <Icon path={mdiAccountOutline} size={0.45} color="#000" />
                          <span style={{ fontSize: 11, fontWeight: 500, color: '#000' }}>{upgrade.guests}</span>
                        </span>
                        <span className="flex items-center gap-[3px]">
                          <Icon path={mdiBedOutline} size={0.45} color="#000" />
                          <span style={{ fontSize: 11, fontWeight: 500, color: '#000' }}>{upgrade.beds}</span>
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: '#555' }}>+${upgrade.pricePerNight}/night</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Add-ons section ── */}
        {(activeTab === 'upgrades' || activeTab === 'addons') && (
          <div style={{ padding: '32px 24px 24px' }}>
            <h2 style={{ fontSize: 22, lineHeight: '1.2', color: theme.fontColor, marginBottom: 16 }}>
              Add-ons
            </h2>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e5e5e5' }}>
              {ADDON_ITEMS.map((item, index) => {
                const qty = addonQuantities[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center"
                    style={{
                      padding: 12, gap: 16,
                      borderBottom: index < ADDON_ITEMS.length - 1 ? '1px solid rgba(0,0,0,0.12)' : undefined,
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 rounded-[5px] overflow-hidden" style={{ width: 64, height: 64 }}>
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 15, fontWeight: 700, lineHeight: '1.4', color: theme.fontColor }}>{item.name}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#555', lineHeight: '1.4' }}>
                        {item.isFree ? 'Complimentary' : `$${item.price}${item.priceUnit || ''}`}
                      </p>
                      {item.tag && (
                        <div
                          className="inline-flex items-center gap-1 mt-1 px-1 py-[2px] rounded-sm"
                          style={{ backgroundColor: '#000' }}
                        >
                          <span style={{ fontSize: 10, fontWeight: 500, color: '#fff', textTransform: 'uppercase' }}>
                            {item.tag}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* + button or counter */}
                    {qty === 0 ? (
                      <button
                        onClick={() => toggleAddon(item.id)}
                        className="flex-shrink-0 flex items-center justify-center rounded"
                        style={{
                          width: 32, height: 32,
                          backgroundColor: theme.primaryColor,
                        }}
                      >
                        <Icon path={mdiPlus} size={0.7} color="#fff" />
                      </button>
                    ) : (
                      <div className="flex-shrink-0">
                        <GuestCounter
                          value={qty}
                          onChange={(v) => setAddonQuantities((prev) => ({ ...prev, [item.id]: v }))}
                          min={0}
                          max={10}
                          primaryColor={theme.primaryColor}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky footer: Skip or Purchase ── */}
      <div
        className="sticky bottom-0"
        style={{
          padding: '16px',
          backgroundColor: theme.backgroundColor,
          boxShadow: '0 0 32px rgba(0,0,0,0.12)',
        }}
      >
        {hasItems ? (
          <button
            onClick={goToNextStep}
            className="w-full h-[48px] flex items-center justify-center rounded text-[17px] font-bold text-white"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Purchase ${cartTotal}
          </button>
        ) : (
          <button
            onClick={goToNextStep}
            className="w-full h-[48px] flex items-center justify-center rounded text-[17px] font-bold"
            style={{ border: `1px solid ${theme.primaryColor}`, color: theme.primaryColor }}
          >
            Skip
          </button>
        )}
      </div>

      {/* ── Room upgrade detail bottom sheet ── */}
      <GuestBottomSheet
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={detailItem?.name ?? ''}
      >
        {detailItem && (
          <div className="flex flex-col" style={{ gap: 24 }}>
            {/* Hero image */}
            <div className="relative w-full rounded-lg overflow-hidden" style={{ height: 200 }}>
              <Image src={detailItem.image} alt={detailItem.name} fill className="object-cover" />
            </div>

            {/* Specs */}
            <div className="flex flex-wrap items-center" style={{ gap: '8px 16px' }}>
              <span className="flex items-center gap-1.5">
                <Icon path={mdiAccountOutline} size={0.6} color="#666" />
                <span style={{ fontSize: 14, color: '#666' }}>{detailItem.guests} guests</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Icon path={mdiBedOutline} size={0.6} color="#666" />
                <span style={{ fontSize: 14, color: '#666' }}>{detailItem.beds}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Icon path={mdiRuler} size={0.6} color="#666" />
                <span style={{ fontSize: 14, color: '#666' }}>{detailItem.sqft} sq ft</span>
              </span>
            </div>

            {/* Price */}
            <p style={{ fontSize: 24, fontWeight: 600, color: theme.fontColor }}>
              +${detailItem.pricePerNight}/night
            </p>

            {/* Description */}
            <p style={{ fontSize: 16, lineHeight: '24px', color: '#555' }}>
              {detailItem.description}
            </p>

            {/* Request button */}
            <button
              onClick={() => {
                setSelectedUpgrade(
                  selectedUpgrade === detailItem.id ? null : detailItem.id
                );
                setDetailItem(null);
              }}
              className="w-full h-[48px] flex items-center justify-center rounded text-[16px] font-medium text-white"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {selectedUpgrade === detailItem.id ? 'Remove' : 'Request'}
            </button>
          </div>
        )}
      </GuestBottomSheet>
    </div>
  );
}
