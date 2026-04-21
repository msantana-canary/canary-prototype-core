/**
 * Step Template Catalog
 *
 * Engineering-provided step templates that CS assembles into flows.
 * Each template has metadata (icon, category, supported surfaces,
 * feature-flag dependency) used by the add-step picker and flow generator.
 */

import {
  mdiFileDocumentOutline,
  mdiTextBoxSearchOutline,
  mdiFileCheckOutline,
  mdiCardAccountDetailsOutline,
  mdiShieldCheckOutline,
  mdiCreditCardOutline,
  mdiSafeSquareOutline,
  mdiStarOutline,
  mdiAccountCheckOutline,
  mdiTagOutline,
  mdiKeyOutline,
  mdiAccountMultipleOutline,
  mdiAccountGroupOutline,
  mdiScaleBalance,
  mdiCheckCircleOutline,
} from '@mdi/js';

import type { StepTemplateId, StepKind, Surface, PropertyFeatureFlags } from './types';

export type TemplateCategory = 'identity' | 'payment' | 'preferences' | 'loyalty' | 'nested' | 'compliance' | 'other';

export interface StepTemplateMeta {
  id: StepTemplateId;
  displayName: string;
  description: string;
  kind: StepKind;
  icon: string;
  category: TemplateCategory;
  supportedSurfaces: Surface[];
  /** If set, the property must have this feature flag enabled. */
  featureFlag?: keyof PropertyFeatureFlags;
  /** If set, step only appears when this country code matches (e.g., Alloggiati for IT). */
  countryGate?: string;
}

export const STEP_TEMPLATES: StepTemplateMeta[] = [
  {
    id: 'reg-card',
    displayName: 'Registration Card',
    description: 'Collect guest contact info, address, and preferences',
    kind: 'schema-form',
    icon: mdiFileDocumentOutline,
    category: 'identity',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
  },
  {
    id: 'ocr',
    displayName: 'ID OCR',
    description: 'Auto-populate guest info by scanning ID',
    kind: 'schema-form',
    icon: mdiTextBoxSearchOutline,
    category: 'identity',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
    featureFlag: 'hasOcr',
  },
  {
    id: 'id-consent',
    displayName: 'ID Consent',
    description: 'Legal consent before capturing ID',
    kind: 'preset',
    icon: mdiFileCheckOutline,
    category: 'identity',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
    featureFlag: 'hasIdVerification',
  },
  {
    id: 'id-capture',
    displayName: 'ID Capture',
    description: 'Photo of government-issued ID',
    kind: 'preset',
    icon: mdiCardAccountDetailsOutline,
    category: 'identity',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
    featureFlag: 'hasIdVerification',
  },
  {
    id: 'id-verification',
    displayName: 'ID Verification',
    description: 'Selfie + front/back for biometric match',
    kind: 'preset',
    icon: mdiShieldCheckOutline,
    category: 'identity',
    supportedSurfaces: ['web', 'mobile-web', 'mobile-app'],
    featureFlag: 'hasIdVerification',
  },
  {
    id: 'credit-card',
    displayName: 'Credit Card',
    description: 'Collect payment card info',
    kind: 'preset',
    icon: mdiCreditCardOutline,
    category: 'payment',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
  },
  {
    id: 'deposit-collection',
    displayName: 'Deposit Collection',
    description: 'Authorize deposit hold on card',
    kind: 'preset',
    icon: mdiSafeSquareOutline,
    category: 'payment',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
    featureFlag: 'hasDepositCollection',
  },
  {
    id: 'loyalty-welcome',
    displayName: 'Loyalty Welcome',
    description: 'Greeting for recognized loyalty members',
    kind: 'preset',
    icon: mdiStarOutline,
    category: 'loyalty',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
    featureFlag: 'hasLoyaltyProgram',
  },
  {
    id: 'guest-profile',
    displayName: 'Guest Profile',
    description: 'Show returning guest profile if recognized',
    kind: 'nested-flow',
    icon: mdiAccountCheckOutline,
    category: 'loyalty',
    supportedSurfaces: ['web', 'mobile-web', 'mobile-app'],
    featureFlag: 'hasGuestProfile',
  },
  {
    id: 'upsells',
    displayName: 'Upsells',
    description: 'Offer room upgrades, add-ons, early check-in',
    kind: 'nested-flow',
    icon: mdiTagOutline,
    category: 'nested',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
    featureFlag: 'hasUpsells',
  },
  {
    id: 'mobile-key',
    displayName: 'Mobile Key',
    description: 'Send mobile key link',
    kind: 'nested-flow',
    icon: mdiKeyOutline,
    category: 'nested',
    supportedSurfaces: ['web', 'mobile-web', 'mobile-app'],
    featureFlag: 'hasMobileKey',
  },
  {
    id: 'accompanying-guest',
    displayName: 'Accompanying Guest',
    description: 'Collect info for additional guests (loops per guest)',
    kind: 'nested-flow',
    icon: mdiAccountMultipleOutline,
    category: 'nested',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
    featureFlag: 'hasAccompanyingGuests',
  },
  {
    id: 'group-assignment',
    displayName: 'Group Assignment',
    description: 'Assign individual reservations in a group booking',
    kind: 'preset',
    icon: mdiAccountGroupOutline,
    category: 'nested',
    supportedSurfaces: ['web', 'mobile-web'],
  },
  {
    id: 'stb-compliance',
    displayName: 'STB Compliance',
    description: 'Singapore Tourism Board disclosures',
    kind: 'preset',
    icon: mdiScaleBalance,
    category: 'compliance',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk'],
    featureFlag: 'hasStbCompliance',
    countryGate: 'SG',
  },
  {
    id: 'alloggiati-compliance',
    displayName: 'Alloggiati Compliance',
    description: 'Italian law required ID collection by nationality',
    kind: 'preset',
    icon: mdiScaleBalance,
    category: 'compliance',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk'],
    featureFlag: 'hasAlloggiatiCompliance',
    countryGate: 'IT',
  },
  {
    id: 'completion',
    displayName: 'Completion',
    description: 'Confirm and submit',
    kind: 'preset',
    icon: mdiCheckCircleOutline,
    category: 'other',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
  },
];

export const STEP_TEMPLATE_MAP: Record<StepTemplateId, StepTemplateMeta> = STEP_TEMPLATES.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<StepTemplateId, StepTemplateMeta>
);

export function getStepTemplateMeta(id: StepTemplateId): StepTemplateMeta {
  return STEP_TEMPLATE_MAP[id];
}

/** Step templates applicable to a property given its features + country + surface. */
export function getAvailableTemplates(
  features: PropertyFeatureFlags,
  countryCode: string,
  surface: Surface
): StepTemplateMeta[] {
  return STEP_TEMPLATES.filter((t) => {
    if (!t.supportedSurfaces.includes(surface)) return false;
    if (t.featureFlag && !features[t.featureFlag]) return false;
    if (t.countryGate && t.countryGate !== countryCode) return false;
    return true;
  });
}
