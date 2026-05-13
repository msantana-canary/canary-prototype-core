'use client';

import React from 'react';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import Icon from '@mdi/react';
import {
  mdiAccountOutline,
  mdiOfficeBuilding,
  mdiMessageTextOutline,
  mdiCurrencyUsd,
  mdiRoomServiceOutline,
  mdiChevronRight,
} from '@mdi/js';
import Image from 'next/image';

const CTA_ITEMS = [
  { icon: mdiAccountOutline, label: 'My Reservation' },
  { icon: mdiOfficeBuilding, label: 'Property Info' },
  { icon: mdiMessageTextOutline, label: 'Message Us' },
  { icon: mdiCurrencyUsd, label: 'Tip Staff' },
  { icon: mdiRoomServiceOutline, label: 'Service Requests' },
];

const UPSELL_CARDS = [
  { name: 'Early Check-in', description: '1:00 PM arrival', price: '$59', image: '/images/hotel-property.png' },
  { name: 'Late Checkout', description: 'Depart by 2:00 PM', price: '$49', image: '/images/hotel-property.png' },
  { name: 'Premium Suite Upgrade', description: 'Corner suite, park view', price: '$125', image: '/images/hotel-property.png' },
];

const AMENITY_CARDS = [
  { name: 'Orla by Michael Mina', keywords: 'Fine Dining · Mediterranean', image: '/images/hotel-property.png' },
  { name: 'Orla Bar', keywords: 'Cocktails · Lounge', image: '/images/hotel-property.png' },
  { name: 'Sweet July Café', keywords: 'Coffee · Pastries · Breakfast', image: '/images/hotel-property.png' },
  { name: 'Azure Bar', keywords: 'Rooftop · Drinks · Views', image: '/images/hotel-property.png' },
  { name: 'The Spa at Statler', keywords: 'Wellness · Massage · Sauna', image: '/images/hotel-property.png' },
];

export function Compendium() {
  const theme = useCheckInConfigStore((s) => s.theme);
  const resetFlow = useCheckInConfigStore((s) => s.resetFlow);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: theme.backgroundColor, color: theme.fontColor }}
    >
      <div className="flex-1 overflow-y-auto">
        {/* Hero image — production: CanaryHeroImage, max-height 224px */}
        <div className="relative w-full" style={{ height: 224 }}>
          <Image
            src="/images/hotel-property.png"
            alt="The Statler New York"
            fill
            className="object-cover"
            priority
          />
          {/* iOS status bar overlay */}
          <img
            src="/images/ios-status-bar.png"
            alt=""
            className="absolute top-0 left-0 right-0 z-10 w-full"
            draggable={false}
          />
          {/* Gradient fade at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 80,
              background: `linear-gradient(to bottom, transparent 0%, ${theme.backgroundColor} 100%)`,
            }}
          />
        </div>

        {/* Hotel logo — production: max-height 64px, max-width 180px */}
        <div className="flex justify-center" style={{ marginTop: -32 }}>
          <div
            className="relative z-10 rounded-lg overflow-hidden px-4 py-2"
            style={{ backgroundColor: theme.cardBackgroundColor, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
          >
            <div className="relative" style={{ width: 140, height: 52 }}>
              <Image
                src="/images/hotel-logo.png"
                alt="The Statler New York"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Reservation action — production: PostCheckIn with custom message */}
        <div className="px-6 pt-5 pb-3">
          <p
            className="text-[18px] leading-[28px]"
            style={{ color: theme.fontColor }}
          >
            Thank you for completing your check-in. We look forward to providing you with a wonderful and luxurious stay.
          </p>
        </div>

        {/* CTA grid — production: 3-col flex grid, SHADED buttons with icon-position TOP */}
        <div className="px-6 pb-5">
          <div className="flex flex-wrap gap-2">
            {CTA_ITEMS.map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center justify-center gap-1 py-4 rounded"
                style={{
                  backgroundColor: `${theme.primaryColor}12`,
                  flex: '1 1 calc(33.333% - 6px)',
                  minWidth: 0,
                }}
              >
                <Icon path={item.icon} size={0.85} color={theme.primaryColor} />
                <span
                  className="text-[12px] font-medium text-center leading-tight px-1"
                  style={{ color: theme.fontColor }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Add-ons / Upsells carousel — production: AddonsCarousel + RoomUpgradesCarousel */}
        <CarouselSection title="Add-ons" theme={theme}>
          {UPSELL_CARDS.map((card) => (
            <div
              key={card.name}
              className="rounded-lg overflow-hidden flex-shrink-0"
              style={{
                width: 200,
                backgroundColor: theme.cardBackgroundColor,
                boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
              }}
            >
              <div className="relative" style={{ height: 120 }}>
                <Image src={card.image} alt={card.name} fill className="object-cover" />
              </div>
              <div className="p-3">
                <p className="text-[15px] font-semibold leading-[22px]" style={{ color: theme.fontColor }}>
                  {card.name}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>
                  {card.description}
                </p>
                <p className="text-[16px] font-semibold mt-2" style={{ color: theme.primaryColor }}>
                  {card.price}
                </p>
              </div>
            </div>
          ))}
        </CarouselSection>

        {/* Amenities carousel — production: SectionCarousel for each GuestSection */}
        <CarouselSection title="Dining & Amenities" theme={theme}>
          {AMENITY_CARDS.map((card) => (
            <div
              key={card.name}
              className="rounded-lg overflow-hidden flex-shrink-0"
              style={{
                width: 200,
                backgroundColor: theme.cardBackgroundColor,
                boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
              }}
            >
              <div className="relative" style={{ height: 140 }}>
                <Image src={card.image} alt={card.name} fill className="object-cover" />
              </div>
              <div className="p-3">
                <p className="text-[15px] font-semibold leading-[22px]" style={{ color: theme.fontColor }}>
                  {card.name}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>
                  {card.keywords}
                </p>
              </div>
            </div>
          ))}
        </CarouselSection>

        {/* Demo restart */}
        <div className="flex justify-center py-6">
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

function CarouselSection({
  title,
  theme,
  children,
}: {
  title: string;
  theme: { primaryColor: string; fontColor: string };
  children: React.ReactNode;
}) {
  return (
    <div className="pb-5">
      {/* Section header — production: TitleTypography + "View All" link */}
      <div className="flex items-center justify-between px-6 pb-3">
        <h3 className="text-[18px] font-semibold" style={{ color: theme.fontColor }}>
          {title}
        </h3>
        <button className="flex items-center text-[13px] font-medium" style={{ color: theme.primaryColor }}>
          View All
          <Icon path={mdiChevronRight} size={0.6} color={theme.primaryColor} />
        </button>
      </div>
      {/* Horizontal scroll — production: CanaryCarousel */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 px-6" style={{ width: 'max-content' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
