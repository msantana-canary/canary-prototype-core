/**
 * Check-In Flow Configuration — Types
 *
 * Core type definitions for the flow configurator. Models:
 * - Properties with feature-flag configuration (Django-admin level)
 * - Flows per surface (web, mobile, tablet, kiosk)
 * - Steps within flows (schema-form, preset, or nested-flow references)
 * - Fields within schema-form steps
 * - Conditions at step, field, and option levels
 * - Preview context for simulating guest state
 */

// ── Surfaces ──────────────────────────────────────────────

export type Surface = 'web' | 'mobile-web' | 'tablet-reg' | 'kiosk' | 'mobile-app';

export const SURFACE_LABELS: Record<Surface, string> = {
  'web': 'Web Check-In',
  'mobile-web': 'Mobile Check-In',
  'tablet-reg': 'Tablet Registration',
  'kiosk': 'Kiosk',
  'mobile-app': 'Mobile App',
};

// ── Property ──────────────────────────────────────────────

export type Brand = 'wyndham' | 'best-western' | 'ihg' | 'marriott' | 'independent';

export interface PropertyFeatureFlags {
  hasCheckIn: boolean;
  hasTabletReg: boolean;
  hasKiosk: boolean;
  hasMobileApp: boolean;
  hasIdVerification: boolean;
  hasOcr: boolean;
  hasIdEncodeIntegration: boolean;    // Brand-specific (Wyndham perk)
  hasDepositCollection: boolean;
  hasUpsells: boolean;
  hasMobileKey: boolean;
  hasAccompanyingGuests: boolean;
  hasGuestProfile: boolean;
  hasLoyaltyProgram: boolean;
  hasStbCompliance: boolean;          // Singapore
  hasAlloggiatiCompliance: boolean;   // Italy
}

export interface Property {
  id: string;
  name: string;
  brand?: Brand;
  country: string;
  countryCode: string;     // ISO 3166-1 alpha-2
  region: string;
  currency: string;
  address: string;
  defaultLanguages: string[];  // ISO 639-1 codes
  features: PropertyFeatureFlags;
}

// ── Flow ──────────────────────────────────────────────────

export interface FlowDefinition {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  surface: Surface;
  kind: 'main' | 'nested';        // main = top-level; nested = referenced by other flows
  steps: StepInstance[];
  isDefault: boolean;              // system-provided default
  isCustomized: boolean;           // has CS edits beyond default
  updatedAt: Date;
}

// ── Step templates (engineering-provided catalog) ─────────

export type StepTemplateId =
  | 'reg-card'
  | 'ocr'
  | 'id-consent'
  | 'id-capture'
  | 'credit-card'
  | 'deposit-collection'
  | 'loyalty-welcome'
  | 'upsells'
  | 'completion';

export type StepKind = 'schema-form' | 'preset' | 'nested-flow';

// A step instance within a flow
export interface StepInstance {
  id: string;
  templateId: StepTemplateId;
  name: string;                 // CS-customizable name
  kind: StepKind;
  isSkippable: boolean;
  order: number;
  conditions?: Condition[];      // step-level show/hide
  config: StepConfig;
}

// ── Step configs (discriminated union) ────────────────────

export type StepConfig =
  | SchemaFormConfig
  | IdConsentConfig
  | IdCaptureConfig
  | CreditCardConfig
  | DepositCollectionConfig
  | LoyaltyWelcomeConfig
  | NestedFlowConfig
  | CompletionConfig;

export interface SchemaFormConfig {
  kind: 'schema-form';
  fields: FieldDef[];
}

export interface IdConsentConfig {
  kind: 'preset';
  presetType: 'id-consent';
  heading: LocalizedText;
  body: LocalizedText;
  ctaLabel: LocalizedText;
  acknowledgment: LocalizedText;
}

export interface IdCaptureConfig {
  kind: 'preset';
  presetType: 'id-capture';
  idTypeOptions: IdTypeOption[];
  allowMultipleIds: boolean;
}

export interface IdTypeOption {
  id: string;
  value: 'passport' | 'drivers-license' | 'national-id' | 'residence-permit' | 'other';
  label: LocalizedText;
  conditions?: Condition[];    // option-level visibility
  order: number;
}

export interface CreditCardConfig {
  kind: 'preset';
  presetType: 'credit-card';
  requireBillingAddress: boolean;
  requireCvc: boolean;
  linkedDeposit: boolean;
}

export interface DepositCollectionConfig {
  kind: 'preset';
  presetType: 'deposit-collection';
  amount: number;
  currency: string;
  refundable: boolean;
  description: LocalizedText;
}

export interface LoyaltyWelcomeConfig {
  kind: 'preset';
  presetType: 'loyalty-welcome';
  heading: LocalizedText;
  body: LocalizedText;
  programName: string;
}

export interface NestedFlowConfig {
  kind: 'nested-flow';
  nestedFlowId: string;
  loopUntilComplete?: boolean;   // for accompanying-guest
  triggerLabel?: LocalizedText;
}

export interface CompletionConfig {
  kind: 'preset';
  presetType: 'completion';
  heading: LocalizedText;
  body: LocalizedText;
  ctaLabel: LocalizedText;
}

// ── Fields (inside schema-form steps) ─────────────────────

export type FieldType =
  | 'text-input'
  | 'text-area'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'time-select'
  | 'country'
  | 'dropdown'
  | 'boolean-radio'
  | 'string-radio'
  | 'checkbox'
  | 'checkbox-group'
  | 'signature'
  | 'credit-card'
  | 'paragraph'    // static
  | 'header'       // static
  | 'list';        // static

export interface FieldDef {
  id: string;
  type: FieldType;
  semanticTag?: ElementTag;           // maps to PMS field
  label: LocalizedText;
  placeholder?: LocalizedText;
  helperText?: LocalizedText;
  required: boolean;
  autoSkipIfFilled: boolean;          // checkpoint: skip if prior flow collected
  options?: FieldOption[];            // for dropdown, checkbox-group, string-radio
  conditions?: Condition[];           // field-level show/hide
  order: number;
  // Static content (paragraph/header/list)
  staticContent?: LocalizedText;
}

export interface FieldOption {
  id: string;
  value: string;
  label: LocalizedText;
  conditions?: Condition[];           // per-option visibility (e.g., Italian only)
  order: number;
}

// ── Semantic element tags (→ PMS fields) ──────────────────

export type ElementTag =
  | 'guest-name'
  | 'guest-first-name'
  | 'guest-last-name'
  | 'guest-email'
  | 'guest-phone'
  | 'guest-date-of-birth'
  | 'guest-nationality'
  | 'address-line-1'
  | 'address-line-2'
  | 'city'
  | 'state'
  | 'country'
  | 'postal-code'
  | 'estimated-arrival-time'
  | 'special-requests'
  | 'loyalty-program-id'
  | 'loyalty-tier'
  | 'id-type'
  | 'id-number'
  | 'id-issue-date'
  | 'id-expiry-date'
  | 'id-issuing-country'
  | 'signature';

// ── Conditions ────────────────────────────────────────────

export type ConditionParameter =
  | 'nationality'
  | 'age'
  | 'loyalty-tier'
  | 'loyalty-member'
  | 'reservation-source'
  | 'returning-guest'
  | 'rate-code'
  | 'length-of-stay';

export type ConditionOperator =
  | 'equals'
  | 'not-equals'
  | 'in'
  | 'not-in'
  | 'greater-than'
  | 'less-than'
  | 'is-true'
  | 'is-false';

export type ConditionAction = 'show' | 'hide' | 'require' | 'show-option' | 'hide-option';

export interface Condition {
  id: string;
  parameter?: ConditionParameter;
  operator?: ConditionOperator;
  value?: string | string[] | number | boolean;
  action: ConditionAction;
}

// ── Preview context (simulated guest) ─────────────────────

export type LoyaltyTier = 'none' | 'club-member' | 'silver-elite' | 'gold-elite' | 'platinum-elite' | 'diamond-elite';

export interface PreviewContext {
  guestNationalityCode: string;    // e.g., 'IT', 'US', 'JP'
  guestAge: number;
  loyaltyTier: LoyaltyTier;
  isReturningGuest: boolean;
  reservationSource: 'direct' | 'ota' | 'corporate' | 'group';
  rateCode: string;
  lengthOfStay: number;            // nights
  language: string;                // ISO 639-1
}

// ── Helpers ───────────────────────────────────────────────

export type LocalizedText = Record<string, string>;   // { 'en': '...', 'it': '...', ... }

/** Resolve a LocalizedText for a language, falling back to English then first available. */
export function resolveText(text: LocalizedText | undefined, lang: string = 'en'): string {
  if (!text) return '';
  return text[lang] ?? text['en'] ?? Object.values(text)[0] ?? '';
}

// ── Check-In Configuration (mirrors Django check_in.Configuration) ──

export type IdStepMode = 'REQUIRED' | 'REQUIRED_WITH_OCR' | 'OPTIONAL' | 'OPTIONAL_WITH_OCR' | 'DISABLED';
export type CreditCardStepMode = 'REQUIRED' | 'OPTIONAL' | 'DISABLED';
export type CreditCardUploadPolicy = 'ALWAYS' | 'OPTIONAL' | 'NEVER' | 'HIGH_RISK';
export type DepositStrategy = 'AUTHORIZE' | 'CHARGE';
export type GuestStepMode = 'REQUIRED' | 'OPTIONAL' | 'DISABLED';
export type FieldVisibility = 'REQUIRED' | 'OPTIONAL' | 'READONLY' | 'HIDDEN';
export type CutoffDay = 'SAME_DAY' | 'NEXT_DAY';

export interface CheckInConfig {
  idStepWithOcr: IdStepMode;
  requireIdCardBack: boolean;
  idOptions: string[];
  showIdConsent: boolean;
  idConsentText: string;
  idRetentionDays: number;
  ocrFields: Record<string, FieldVisibility>;

  creditCardStep: CreditCardStepMode;
  creditCardUploadPolicy: CreditCardUploadPolicy;
  requireCreditCardPostalCode: boolean;
  blockedCardTypes: string[];
  blockedCardNetworks: string[];
  disableViewFullCardInfo: boolean;

  depositStrategy: DepositStrategy;
  isCanaryProcessingDeposits: boolean;
  showDepositSurchargeDetail: boolean;
  shouldSkipDepositIfRoutingRulesExist: boolean;
  surchargeCredit: number;
  surchargeDebit: number;
  surchargePrepaid: number;
  surchargeUnknown: number;

  additionalGuestsStep: GuestStepMode;
  additionalGuestsFields: Record<string, FieldVisibility>;

  hasSequentialSubmissionStamp: boolean;
  sequentialSubmissionStampPrefix: string;

  autoCheckInEnabled: boolean;
  autoCheckInTime: string;
  autoCheckInWindow: number;
  autoCheckInRequirePreReg: boolean;
  autoCheckInRequireIdVerification: boolean;
  autoCheckInRequireIdNameMatch: boolean;

  hasAppleWallet: boolean;
  hasGoogleWallet: boolean;

  hasCheckInMobile: boolean;
  hasTabletReg: boolean;
  hasKiosk: boolean;
  checkInCutOffHour: number;
  checkInCutoffDay: CutoffDay;

  notificationEmails: string;
  messageAfterSuccessfulCheckIn: string;
}
