'use client';

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import Icon from '@mdi/react';
import {
  mdiClockOutline,
  mdiMapMarkerOutline,
  mdiMessageTextOutline,
  mdiCurrencyUsd,
  mdiInformationOutline,
} from '@mdi/js';
import Image from 'next/image';

const ACTION_ITEMS = [
  { icon: mdiClockOutline, label: 'Early Check-in', sublabel: 'Available from 1:00 PM', price: '$59' },
  { icon: mdiClockOutline, label: 'Late Checkout', sublabel: 'Extend until 2:00 PM', price: '$49' },
];

const NAV_ITEMS = [
  { icon: mdiInformationOutline, label: 'Property Info' },
  { icon: mdiMessageTextOutline, label: 'Message Us' },
  { icon: mdiCurrencyUsd, label: 'Tip Staff' },
  { icon: mdiMapMarkerOutline, label: 'Explore Area' },
];

const AMENITY_CARDS = [
  { name: 'The Statler Lounge', description: 'Craft cocktails in an Art Deco setting', image: '/images/hotel-property.png' },
  { name: 'Statler Grill', description: 'Modern American cuisine', image: '/images/hotel-property.png' },
  { name: 'The Library Bar', description: 'Intimate wine & spirits', image: '/images/hotel-property.png' },
  { name: 'Rooftop Terrace', description: 'Skyline views & light fare', image: '/images/hotel-property.png' },
];

export function Compendium() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const resetFlow = useCheckInConfigStore((s) => s.resetFlow);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: theme.backgroundColor, color: theme.fontColor }}
    >
      {/* iOS Status Bar */}
      <img
        src="/images/ios-status-bar.png"
        alt=""
        className="w-full flex-shrink-0"
        draggable={false}
        style={{ filter: 'invert(1)' }}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Hotel logo + welcome */}
        <div className="flex flex-col items-center px-6 pt-4 pb-2">
          <div className="relative" style={{ width: 120, height: 56 }}>
            <Image
              src="/images/hotel-logo.png"
              alt="The Statler New York"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Welcome message */}
        <div className="px-6 py-4">
          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: theme.cardBackgroundColor }}
          >
            <p className="text-[18px] leading-[28px]" style={{ color: theme.fontColor }}>
              Thank you for completing your check-in. We look forward to providing you with a wonderful and luxurious stay.
            </p>
          </div>
        </div>

        {/* Action cards (Early Check-in, Late Checkout) */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            {ACTION_ITEMS.map((item) => (
              <button
                key={item.label}
                className="flex-1 flex flex-col items-center justify-center p-4 rounded"
                style={{ backgroundColor: `${theme.primaryColor}15` }}
              >
                <Icon path={item.icon} size={0.85} color={theme.primaryColor} />
                <span
                  className="text-[13px] font-medium mt-1 text-center"
                  style={{ color: theme.fontColor }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[16px] font-semibold mt-0.5"
                  style={{ color: theme.primaryColor }}
                >
                  {item.price}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation grid */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-3 p-4 rounded"
                style={{ backgroundColor: theme.cardBackgroundColor, border: '1px solid rgba(0,0,0,0.08)' }}
              >
                <Icon path={item.icon} size={0.8} color={theme.primaryColor} />
                <span className="text-[14px] font-medium" style={{ color: theme.fontColor }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Amenities section */}
        <div className="px-6 pt-2 pb-2">
          <h3
            className="text-[20px] font-semibold leading-[30px]"
            style={{ color: theme.fontColor }}
          >
            Explore The Statler
          </h3>
        </div>

        {/* Horizontal scrolling amenity cards */}
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-3 px-6" style={{ width: 'max-content' }}>
            {AMENITY_CARDS.map((card) => (
              <div
                key={card.name}
                className="rounded-lg overflow-hidden flex-shrink-0"
                style={{
                  width: 240,
                  backgroundColor: theme.cardBackgroundColor,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div className="relative" style={{ height: 140 }}>
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[16px] font-semibold leading-[24px]" style={{ color: theme.fontColor }}>
                    {card.name}
                  </p>
                  <p className="text-[13px] mt-1" style={{ color: 'rgba(0,0,0,0.5)' }}>
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo restart */}
        <div className="flex justify-center pb-6">
          <button
            onClick={resetFlow}
            className="text-[14px] font-medium underline"
            style={{ color: theme.primaryColor }}
          >
            Start over (demo)
          </button>
        </div>
      </div>
    </div>
  );
}
