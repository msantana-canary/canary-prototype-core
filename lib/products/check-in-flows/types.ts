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

// ── Option variants (segment-based dropdown options) ──────
//
// For selection-type InputAtoms (dropdown, string-radio, checkbox-group),
// options are grouped into VARIANTS. Each variant has segment conditions;
// the variant whose conditions match the guest is the active one. The
// default variant has no conditions and is the fallback.
//
// This models the "Italian guests get different ID types" use case as
// segment-based wholesale replacement of the option list, not per-option
// additive show/hide.

export interface OptionVariant {
  id: string;
  /** CS-facing label for the variant, e.g. "Italian guests". Optional —
   *  the default variant typically has no name. */
  name?: string;
  /** Segment-matching rules. Omitted on the default variant; first variant
   *  whose conditions match wins. */
  conditions?: Condition[];
  options: FieldOption[];
}

export type StepTemplateId =
  | 'reg-card'
  | 'ocr'
  | 'id-consent'
  | 'id-capture'
  | 'credit-card'
  | 'deposit-collection'
  | 'loyalty-welcome'
  | 'upsells'
  | 'completion'
  | 'custom';

export type StepKind = 'schema-form' | 'preset' | 'nested-flow';

// A step instance within a flow
//
// Phase 5: `atomIds` is the new source of truth — references atoms in
// Global Config. Edits to those atoms propagate live to the Flow preview.
//
// `config` is the LEGACY inline data shape (FieldDef[] for schema-form,
// preset configs for preset steps). Kept during Phase 5 migration so the
// old code paths don't break; will be phased out as preview / editor are
// migrated to consume `atomIds` exclusively.
export interface StepInstance {
  id: string;
  templateId: StepTemplateId;
  name: string;                 // CS-customizable name
  kind: StepKind;
  isSkippable: boolean;
  order: number;
  conditions?: Condition[];      // step-level show/hide (Phase 2c stripped UI; data kept)

  /** Phase 5: atom references — ordered list of atom IDs from Global Config.
   *  Source of truth for what this step renders. */
  atomIds: string[];

  /** Legacy preset / nested-flow inline config. Schema-form steps derive
   *  rendering from atomIds; preset and nested-flow steps still use this
   *  for type-specific configuration (Phase 3 will decompose presets). */
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
  | 'country'
  | 'dropdown'
  | 'boolean-radio'
  | 'string-radio'
  | 'checkbox'
  | 'checkbox-group'
  | 'signature';
// Static content (paragraphs, headers, lists) lives in CopyBlock atoms,
// not as InputAtom field types. Time/date pickers consolidate to dropdowns
// with hotel-provided answers (matches production). Credit card handling
// is the credit-card-form preset, not a generic field type.

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
  | 'signature'
  // PMS UDFs (hotel-defined fields) — surfaced in the configurator so atoms
  // can map to UDFs the hotel has set up in their PMS. Demo set; in production
  // these would be discovered from the connected PMS.
  | 'udf-special-occasion'
  | 'udf-company-account'
  | 'udf-loyalty-referral'
  | 'udf-room-preferences'
  | 'udf-dietary-restrictions'
  | 'udf-marketing-source';

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

// ═══════════════════════════════════════════════════════════
// PHASE 1 — Atomic data model for Global Config
//
// New architecture (resolved 2026-04-28): Global Config holds
// ATOMS only. Flows compose atoms into steps. See:
// - docs/CHECK_IN_CONFIGURATOR_ARCHITECTURE.md (long-form spec)
// - docs/CHECK_IN_CONFIGURATOR_PHASE1_PLAN.md (build plan)
//
// ⚠️ DO NOT introduce a "Custom Forms registry" here. Bundling
// is Flow-only. This was tried and rejected.
// ⚠️ DO NOT add `device` as a condition parameter. Per-device
// visibility lives in DeviceVisibility (4 toggles) per atom.
// ═══════════════════════════════════════════════════════════

// Every input is fundamentally custom; presets are pre-labeled inputs that
// live in their feature domain (id-documents / payment / etc.). No separate
// "custom" bucket — fields belong to the domain that describes their data.
export type AtomDomain =
  | 'guest-info'         // name, contact, address, stay preferences
  | 'id-documents'       // ID consent, ID type, ID photo capture, OCR field config
  | 'payment'            // CC config, deposits, surcharge (CS-tunable subset only)
  | 'additional-guests'  // multi-guest fields
  | 'auto-check-in'      // auto-checkin config
  | 'copy-blocks';       // legal/policy text (hotel policies, marketing consent, etc.)

export const ATOM_DOMAIN_LABELS: Record<AtomDomain, string> = {
  'guest-info': 'Guest Info',
  'id-documents': 'ID Documents',
  'payment': 'Payment',
  'additional-guests': 'Additional Guests',
  'auto-check-in': 'Auto Check-In',
  'copy-blocks': 'Copy Blocks',
};

export interface DeviceVisibility {
  'web': boolean;
  'mobile-web': boolean;
  'tablet-reg': boolean;
  'kiosk': boolean;
  'mobile-app': boolean;
}

export const DEFAULT_VISIBLE_ALL: DeviceVisibility = {
  'web': true,
  'mobile-web': true,
  'tablet-reg': true,
  'kiosk': true,
  'mobile-app': true,
};

export type AtomKind = 'input' | 'preset' | 'copy-block';

interface AtomBase {
  id: string;
  domain: AtomDomain;
  deviceVisibility: DeviceVisibility;
  conditions?: Condition[];   // guest-attribute rules only — NOT device
}

/** Atomic input — a single data point collected from the guest. */
export interface InputAtom extends AtomBase {
  kind: 'input';
  fieldType: FieldType;
  label: LocalizedText;
  placeholder?: LocalizedText;
  helperText?: LocalizedText;
  pmsTag?: ElementTag;
  required: boolean;
  autoSkipIfFilled?: boolean;
  /** Segment-grouped options for selection field types (dropdown / radio /
   *  checkbox-group). First variant is the default (no conditions); subsequent
   *  variants are segment overrides. Resolved at render time via
   *  resolveOptionsForGuest. */
  optionVariants?: OptionVariant[];
}

/** Atomic preset — a single-purpose feature unit with specialized non-generic
 *  rendering (consent screens, camera capture, payment forms). Generic
 *  inputs like dropdowns are InputAtoms, not presets. */
export type PresetAtomType =
  | 'id-consent'
  | 'id-photo-front'
  | 'id-photo-back'
  | 'id-selfie'
  | 'credit-card-form'
  | 'deposit-collection'
  | 'loyalty-welcome'
  | 'completion';

export interface PresetAtom extends AtomBase {
  kind: 'preset';
  presetType: PresetAtomType;
  label: LocalizedText;             // CS-facing display label, e.g. "ID Consent"
  config: PresetAtomConfig;
}

/** Discriminated union for preset-specific config. */
export type PresetAtomConfig =
  | IdConsentAtomConfig
  | IdPhotoAtomConfig
  | IdSelfieAtomConfig
  | CreditCardAtomConfig
  | DepositCollectionAtomConfig
  | LoyaltyWelcomeAtomConfig
  | CompletionAtomConfig;

export interface IdConsentAtomConfig {
  presetType: 'id-consent';
  heading: LocalizedText;
  body: LocalizedText;
  acknowledgment: LocalizedText;
  ctaLabel: LocalizedText;
}

export interface IdPhotoAtomConfig {
  presetType: 'id-photo-front' | 'id-photo-back';
  instructionText?: LocalizedText;
}

export interface IdSelfieAtomConfig {
  presetType: 'id-selfie';
  instructionText?: LocalizedText;
}

export interface CreditCardAtomConfig {
  presetType: 'credit-card-form';
  requireBillingAddress: boolean;
  requireCvc: boolean;
  linkedDeposit: boolean;
}

export interface DepositCollectionAtomConfig {
  presetType: 'deposit-collection';
  amount: number;
  currency: string;
  refundable: boolean;
  description: LocalizedText;
}

export interface LoyaltyWelcomeAtomConfig {
  presetType: 'loyalty-welcome';
  heading: LocalizedText;
  body: LocalizedText;
  programName: string;
}

export interface CompletionAtomConfig {
  presetType: 'completion';
  heading: LocalizedText;
  body: LocalizedText;
  ctaLabel: LocalizedText;
}

/** Atomic copy block — compliance/legal/policy text not tied to a single input. */
export interface CopyBlockAtom extends AtomBase {
  kind: 'copy-block';
  name: string;             // CS-facing identifier, e.g. "Hotel Policies"
  content: LocalizedText;   // the actual text body (rich text via markdown allowed)
}

/** Discriminated union — Global Config holds Atom[]. */
export type Atom = InputAtom | PresetAtom | CopyBlockAtom;

// ── Resolver helpers ──────────────────────────────────────

/**
 * Resolve atom IDs against Global Config to get the full Atom objects, in order.
 * Skips IDs that don't match any atom (e.g., after an atom is removed from Global).
 */
export function resolveAtoms(atomIds: string[], allAtoms: Atom[]): Atom[] {
  const byId = new Map<string, Atom>(allAtoms.map((a) => [a.id, a]));
  const out: Atom[] = [];
  for (const id of atomIds) {
    const atom = byId.get(id);
    if (atom) out.push(atom);
  }
  return out;
}

/**
 * Resolve atoms for a step + filter by surface visibility.
 * Atom-level conditions (guest-attribute rules) are evaluated separately
 * at render time via condition-evaluator.
 */
export function resolveStepAtoms(
  step: StepInstance,
  allAtoms: Atom[],
  surface?: Surface
): Atom[] {
  const atoms = resolveAtoms(step.atomIds, allAtoms);
  if (!surface) return atoms;
  return atoms.filter((a) => a.deviceVisibility[surface]);
}

/**
 * Pick the active option variant for a guest. First variant whose conditions
 * match wins; otherwise the default variant (no conditions) is the fallback.
 * Returns the matching variant's options, or empty array if no variants exist.
 *
 * The condition-matching logic is provided by the caller via the matcher
 * argument so this helper stays free of evaluator imports.
 */
export function resolveOptionsForGuest(
  variants: OptionVariant[] | undefined,
  matcher: (conditions: Condition[] | undefined) => boolean
): FieldOption[] {
  if (!variants || variants.length === 0) return [];
  // Prefer the first variant with conditions that match the guest.
  const matched = variants.find(
    (v) => v.conditions && v.conditions.length > 0 && matcher(v.conditions)
  );
  if (matched) return matched.options;
  // Fall back to the first variant without conditions (the default).
  const defaultVariant = variants.find(
    (v) => !v.conditions || v.conditions.length === 0
  );
  return defaultVariant?.options ?? [];
}
