/**
 * Step Template Catalog
 *
 * Engineering-provided step templates that CS assembles into flows.
 * Each template has metadata (icon, category, supported surfaces,
 * feature-flag dependency) used by the add-step picker and flow generator.
 *
 * Scoped intentionally narrow for MVP — compliance, id-verification,
 * group-assignment, guest-profile, mobile-key, accompanying-guest are
 * all known patterns we'll model later. Catalog is additive.
 */

import {
  mdiFileDocumentOutline,
  mdiTextBoxSearchOutline,
  mdiFileCheckOutline,
  mdiCardAccountDetailsOutline,
  mdiCreditCardOutline,
  mdiSafeSquareOutline,
  mdiStarOutline,
  mdiTagOutline,
  mdiCheckCircleOutline,
  mdiPuzzleOutline,
} from '@mdi/js';

import type { StepTemplateId, StepKind, Surface, PropertyFeatureFlags } from './types';

export type TemplateCategory = 'identity' | 'payment' | 'loyalty' | 'nested' | 'other';

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
    description: 'Photo of government-issued ID with optional nationality-gated options',
    kind: 'preset',
    icon: mdiCardAccountDetailsOutline,
    category: 'identity',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
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
    id: 'completion',
    displayName: 'Completion',
    description: 'Confirm and submit',
    kind: 'preset',
    icon: mdiCheckCircleOutline,
    category: 'other',
    supportedSurfaces: ['web', 'mobile-web', 'tablet-reg', 'kiosk', 'mobile-app'],
  },
  {
    id: 'custom',
    displayName: 'Custom Step',
    description: 'Hotel-defined step composed of Global atoms (e.g., Pet Policy, Marketing Consent)',
    kind: 'schema-form',
    icon: mdiPuzzleOutline,
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

const FLAG_LABELS: Partial<Record<keyof PropertyFeatureFlags, string>> = {
  hasIdVerification: 'ID Verification',
  hasOcr: 'OCR',
  hasDepositCollection: 'Deposit Collection',
  hasUpsells: 'Upsells',
  hasLoyaltyProgram: 'Loyalty Program',
};

export type AttributionCategory = 'core' | 'identity' | 'payment' | 'experience';

export interface AttributionInfo {
  label: string;
  category: AttributionCategory;
  featureFlag?: keyof PropertyFeatureFlags;
}

const CATEGORY_TO_ATTRIBUTION: Record<TemplateCategory, AttributionCategory> = {
  identity: 'identity',
  payment: 'payment',
  loyalty: 'experience',
  nested: 'experience',
  other: 'core',
};

export function getAttributionInfo(templateId: StepTemplateId): AttributionInfo {
  const template = getStepTemplateMeta(templateId);
  if (!template.featureFlag) return { label: 'Core', category: 'core' };
  return {
    label: FLAG_LABELS[template.featureFlag] ?? template.featureFlag,
    category: CATEGORY_TO_ATTRIBUTION[template.category],
    featureFlag: template.featureFlag,
  };
}

/** Step templates applicable to a property given its features + surface. */
export function getAvailableTemplates(
  features: PropertyFeatureFlags,
  _countryCode: string,
  surface: Surface
): StepTemplateMeta[] {
  return STEP_TEMPLATES.filter((t) => {
    if (!t.supportedSurfaces.includes(surface)) return false;
    if (t.featureFlag && !features[t.featureFlag]) return false;
    return true;
  });
}
