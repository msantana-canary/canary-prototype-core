/**
 * Property Fixtures
 *
 * Single demo property. Property variation (regional compliance,
 * brand-specific perks) is a future slide — this prototype stays
 * focused on the core configurator flow on one property.
 */

import type { Property } from './types';

export const PROPERTIES: Property[] = [
  {
    id: 'statler-nyc',
    name: 'Statler New York',
    brand: 'independent',
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    currency: 'USD',
    address: '151 West 54th St, New York, NY 10019',
    defaultLanguages: ['en'],
    features: {
      hasCheckIn: true,
      hasTabletReg: true,
      hasKiosk: true,
      hasMobileApp: true,
      hasIdVerification: true,
      hasOcr: true,
      hasIdEncodeIntegration: false,
      hasDepositCollection: true,
      hasUpsells: true,
      hasMobileKey: true,
      hasAccompanyingGuests: false,
      hasGuestProfile: false,
      hasLoyaltyProgram: true,
      hasStbCompliance: false,
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
