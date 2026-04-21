/**
 * Property Fixtures
 *
 * Three demo properties that showcase how feature flags + brand + country
 * drive different default check-in flows:
 *
 * - Statler NYC (US, Wyndham by default): full-feature North American hotel
 * - Hotel Milano (IT, independent): Alloggiati compliance, no mobile key
 * - Marina Bay (SG, IHG): STB compliance, kiosks enabled
 */

import type { Property } from './types';

export const PROPERTIES: Property[] = [
  {
    id: 'statler-nyc',
    name: 'Statler New York',
    brand: 'wyndham',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    currency: 'USD',
    address: '151 West 54th St, New York, NY 10019',
    defaultLanguages: ['en', 'es'],
    features: {
      hasCheckIn: true,
      hasTabletReg: true,
      hasKiosk: false,
      hasMobileApp: false,
      hasIdVerification: true,
      hasOcr: true,
      hasIdEncodeIntegration: true,    // Wyndham perk
      hasDepositCollection: true,
      hasUpsells: true,
      hasMobileKey: true,
      hasAccompanyingGuests: true,
      hasGuestProfile: true,
      hasLoyaltyProgram: true,
      hasStbCompliance: false,
      hasAlloggiatiCompliance: false,
    },
  },
  {
    id: 'hotel-milano',
    name: 'Hotel Milano Centrale',
    brand: 'independent',
    country: 'Italy',
    countryCode: 'IT',
    region: 'Europe',
    currency: 'EUR',
    address: 'Piazza Duca d\'Aosta 1, 20124 Milan, Italy',
    defaultLanguages: ['it', 'en', 'fr'],
    features: {
      hasCheckIn: true,
      hasTabletReg: true,
      hasKiosk: false,
      hasMobileApp: false,
      hasIdVerification: true,
      hasOcr: true,
      hasIdEncodeIntegration: false,
      hasDepositCollection: true,
      hasUpsells: true,
      hasMobileKey: false,             // not purchased
      hasAccompanyingGuests: true,
      hasGuestProfile: false,
      hasLoyaltyProgram: false,
      hasStbCompliance: false,
      hasAlloggiatiCompliance: true,   // Italian legal requirement
    },
  },
  {
    id: 'marina-bay-sg',
    name: 'Marina Bay Hotel Singapore',
    brand: 'ihg',
    country: 'Singapore',
    countryCode: 'SG',
    region: 'Asia Pacific',
    currency: 'SGD',
    address: '7 Raffles Ave, Singapore 039799',
    defaultLanguages: ['en', 'zh', 'ms'],
    features: {
      hasCheckIn: true,
      hasTabletReg: true,
      hasKiosk: true,                  // kiosks deployed
      hasMobileApp: true,
      hasIdVerification: true,
      hasOcr: true,
      hasIdEncodeIntegration: false,
      hasDepositCollection: true,
      hasUpsells: true,
      hasMobileKey: true,
      hasAccompanyingGuests: true,
      hasGuestProfile: true,
      hasLoyaltyProgram: true,
      hasStbCompliance: true,          // Singapore Tourism Board
      hasAlloggiatiCompliance: false,
    },
  },
];

export const PROPERTY_MAP: Record<string, Property> = PROPERTIES.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<string, Property>
);

export function getProperty(id: string): Property | undefined {
  return PROPERTY_MAP[id];
}
