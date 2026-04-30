/**
 * Default atoms for Global Config (Phase 1a seed).
 *
 * Initial set of atoms covering Guest Info, ID Documents, Payment,
 * Additional Guests, Auto Check-In, and Copy Blocks. Used to populate
 * the Configuration tab on first load.
 *
 * Future phases extend this:
 * - Phase 3: decompose ID Capture into atomic stages
 * - Phase 4: support hotel-defined custom inputs (UDFs)
 *
 * Architecture rules (from project_checkin_configurator_architecture.md):
 * - All bundling lives in Flow, not here
 * - Conditions use guest-attribute parameters only (not device)
 * - Per-device visibility via DeviceVisibility, not conditions
 */

import type {
  Atom,
  DeviceVisibility,
  InputAtom,
  PresetAtom,
  CopyBlockAtom,
} from './types';
import { DEFAULT_VISIBLE_ALL } from './types';

const visibleAll: DeviceVisibility = { ...DEFAULT_VISIBLE_ALL };

const visibleExceptKiosk: DeviceVisibility = {
  ...DEFAULT_VISIBLE_ALL,
  'kiosk': false,
  'tablet-reg': false,
};

// ── Guest Info inputs ───────────────────────────────────

const guestInfo: InputAtom[] = [
  {
    id: 'atom-first-name',
    kind: 'input',
    domain: 'guest-info',
    fieldType: 'text-input',
    label: { en: 'First name' },
    pmsTag: 'guest-first-name',
    required: true,
    autoSkipIfFilled: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-last-name',
    kind: 'input',
    domain: 'guest-info',
    fieldType: 'text-input',
    label: { en: 'Last name' },
    pmsTag: 'guest-last-name',
    required: true,
    autoSkipIfFilled: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-email',
    kind: 'input',
    domain: 'guest-info',
    fieldType: 'email',
    label: { en: 'Email' },
    pmsTag: 'guest-email',
    required: true,
    autoSkipIfFilled: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-phone',
    kind: 'input',
    domain: 'guest-info',
    fieldType: 'phone',
    label: { en: 'Phone' },
    pmsTag: 'guest-phone',
    required: true,
    autoSkipIfFilled: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-address',
    kind: 'input',
    domain: 'guest-info',
    fieldType: 'text-input',
    label: { en: 'Address' },
    pmsTag: 'address-line-1',
    required: true,
    autoSkipIfFilled: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-city',
    kind: 'input',
    domain: 'guest-info',
    fieldType: 'text-input',
    label: { en: 'City' },
    pmsTag: 'city',
    required: true,
    autoSkipIfFilled: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-country',
    kind: 'input',
    domain: 'guest-info',
    fieldType: 'country',
    label: { en: 'Country' },
    pmsTag: 'country',
    required: true,
    autoSkipIfFilled: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-estimated-arrival',
    kind: 'input',
    domain: 'guest-info',
    fieldType: 'dropdown',
    label: { en: 'Estimated arrival time' },
    pmsTag: 'estimated-arrival-time',
    required: true,
    autoSkipIfFilled: true,
    deviceVisibility: visibleExceptKiosk,
    optionVariants: [
      {
        id: 'var-eta-default',
        options: [
          { id: 'opt-eta-noon',    value: 'before-noon', label: { en: 'Before noon' },     order: 0 },
          { id: 'opt-eta-12-3',    value: '12-3pm',      label: { en: '12pm – 3pm' },      order: 1 },
          { id: 'opt-eta-3-6',     value: '3-6pm',       label: { en: '3pm – 6pm' },       order: 2 },
          { id: 'opt-eta-after-6', value: 'after-6pm',   label: { en: 'After 6pm' },       order: 3 },
        ],
      },
    ],
  },
  {
    id: 'atom-special-requests',
    kind: 'input',
    domain: 'guest-info',
    fieldType: 'text-area',
    label: { en: 'Special requests' },
    pmsTag: 'special-requests',
    required: false,
    autoSkipIfFilled: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-signature',
    kind: 'input',
    domain: 'guest-info',
    fieldType: 'signature',
    label: { en: 'Signature' },
    pmsTag: 'signature',
    required: true,
    autoSkipIfFilled: false,
    deviceVisibility: visibleAll,
  },
];

// ── ID Documents presets + inputs ───────────────────────

const idDocuments: Atom[] = [
  {
    id: 'atom-id-consent',
    kind: 'preset',
    domain: 'id-documents',
    presetType: 'id-consent',
    label: { en: 'ID Consent' },
    deviceVisibility: visibleAll,
    config: {
      presetType: 'id-consent',
      heading: { en: 'Identity verification' },
      body: { en: 'To complete check-in securely, we need to verify your identity using a government-issued ID.' },
      acknowledgment: { en: 'I consent to identity verification and the collection of my ID document.' },
      ctaLabel: { en: 'Continue' },
    },
  },
  {
    id: 'atom-id-type-select',
    kind: 'input',
    domain: 'id-documents',
    fieldType: 'dropdown',
    label: { en: 'ID Type' },
    pmsTag: 'id-type',
    required: true,
    deviceVisibility: visibleAll,
    optionVariants: [
      // Default — everyone except matched segment variants.
      {
        id: 'var-id-type-default',
        options: [
          { id: 'opt-passport', value: 'passport', label: { en: 'Passport' }, order: 0 },
          { id: 'opt-dl', value: 'drivers-license', label: { en: "Driver's License" }, order: 1 },
        ],
      },
      // Italian guests — show only National ID per local law.
      {
        id: 'var-id-type-italian',
        name: 'Italian guests',
        conditions: [
          {
            id: 'cond-id-type-italian',
            parameter: 'nationality',
            operator: 'equals',
            value: 'IT',
            action: 'show',
          },
        ],
        options: [
          { id: 'opt-national-it', value: 'national-id', label: { en: 'National ID' }, order: 0 },
        ],
      },
    ],
  },
  {
    id: 'atom-id-photo-front',
    kind: 'preset',
    domain: 'id-documents',
    presetType: 'id-photo-front',
    label: { en: 'ID Photo (front)' },
    deviceVisibility: visibleAll,
    config: {
      presetType: 'id-photo-front',
      instructionText: { en: 'Take a photo of the front of your ID' },
    },
  },
  {
    id: 'atom-id-photo-back',
    kind: 'preset',
    domain: 'id-documents',
    presetType: 'id-photo-back',
    label: { en: 'ID Photo (back)' },
    deviceVisibility: visibleAll,
    config: {
      presetType: 'id-photo-back',
      instructionText: { en: 'Take a photo of the back of your ID' },
    },
  },
  {
    id: 'atom-id-selfie',
    kind: 'preset',
    domain: 'id-documents',
    presetType: 'id-selfie',
    label: { en: 'ID Selfie' },
    deviceVisibility: visibleAll,
    config: {
      presetType: 'id-selfie',
      instructionText: { en: 'Take a selfie to verify your ID' },
    },
  },
  // ID-extracted field editability — InputAtoms tagged from id-documents domain
  {
    id: 'atom-id-doc-first-name',
    kind: 'input',
    domain: 'id-documents',
    fieldType: 'text-input',
    label: { en: 'ID first name' },
    pmsTag: 'guest-first-name',
    required: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-id-doc-last-name',
    kind: 'input',
    domain: 'id-documents',
    fieldType: 'text-input',
    label: { en: 'ID last name' },
    pmsTag: 'guest-last-name',
    required: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-id-doc-date-of-birth',
    kind: 'input',
    domain: 'id-documents',
    fieldType: 'date',
    label: { en: 'Date of birth' },
    pmsTag: 'guest-date-of-birth',
    required: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-id-doc-nationality',
    kind: 'input',
    domain: 'id-documents',
    fieldType: 'country',
    label: { en: 'Nationality' },
    pmsTag: 'guest-nationality',
    required: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-id-doc-document-number',
    kind: 'input',
    domain: 'id-documents',
    fieldType: 'text-input',
    label: { en: 'Document number' },
    pmsTag: 'id-number',
    required: true,
    deviceVisibility: visibleAll,
  },
];

// ── Payment presets ─────────────────────────────────────

const payment: PresetAtom[] = [
  {
    id: 'atom-credit-card',
    kind: 'preset',
    domain: 'payment',
    presetType: 'credit-card-form',
    label: { en: 'Credit Card' },
    deviceVisibility: visibleAll,
    config: {
      presetType: 'credit-card-form',
      requireBillingAddress: true,
      requireCvc: true,
      linkedDeposit: true,
    },
  },
  {
    id: 'atom-deposit',
    kind: 'preset',
    domain: 'payment',
    presetType: 'deposit-collection',
    label: { en: 'Deposit Collection' },
    deviceVisibility: visibleAll,
    config: {
      presetType: 'deposit-collection',
      amount: 250,
      currency: 'USD',
      refundable: true,
      description: { en: 'A deposit hold will be authorized on your card and released at checkout.' },
    },
  },
];

// ── Additional Guests inputs ────────────────────────────

const additionalGuests: InputAtom[] = [
  {
    id: 'atom-addl-full-name',
    kind: 'input',
    domain: 'additional-guests',
    fieldType: 'text-input',
    label: { en: 'Full name' },
    required: true,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-addl-date-of-birth',
    kind: 'input',
    domain: 'additional-guests',
    fieldType: 'date',
    label: { en: 'Date of birth' },
    required: false,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-addl-nationality',
    kind: 'input',
    domain: 'additional-guests',
    fieldType: 'country',
    label: { en: 'Nationality' },
    required: false,
    deviceVisibility: visibleAll,
  },
  {
    id: 'atom-addl-id-type',
    kind: 'input',
    domain: 'additional-guests',
    fieldType: 'dropdown',
    label: { en: 'ID type' },
    required: false,
    deviceVisibility: visibleAll,
    optionVariants: [
      {
        id: 'var-addl-id-type-default',
        options: [
          { id: 'addl-id-passport', value: 'passport', label: { en: 'Passport' }, order: 0 },
          { id: 'addl-id-national', value: 'national-id', label: { en: 'National ID' }, order: 1 },
        ],
      },
    ],
  },
];

// ── Copy blocks (compliance text) ───────────────────────

const copyBlocks: CopyBlockAtom[] = [
  {
    id: 'atom-copy-hotel-policies',
    kind: 'copy-block',
    domain: 'copy-blocks',
    name: 'Hotel Policies',
    deviceVisibility: visibleAll,
    content: {
      en: 'Smoking: Statler New York maintains a smoke-free environment. Cancellation: Reservations may be cancelled up to 48 hours prior to arrival. Pets: Well-behaved dogs weighing 50 lbs or less welcome with a $150 fee.',
    },
  },
  {
    id: 'atom-copy-marketing-consent',
    kind: 'copy-block',
    domain: 'copy-blocks',
    name: 'Marketing Consent',
    deviceVisibility: visibleAll,
    content: {
      en: 'I consent to receive texts and emails related to both my stay and future marketing materials.',
    },
  },
];

// ── Aggregate ──────────────────────────────────────────

export const DEFAULT_ATOMS: Atom[] = [
  ...guestInfo,
  ...idDocuments,
  ...payment,
  ...additionalGuests,
  ...copyBlocks,
];
