/**
 * Guest-Facing Check-In Configurator Types
 *
 * Types for the check-in flow engine, configurator sidebar,
 * and theming system. Mirrors production enums where applicable.
 */

// ── Step Enums ──────────────────────────────────────────────────────────

export enum OptionalStep {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  DISABLED = 'disabled',
}

export enum CheckInStep {
  RESERVATION_LANDING = 'reservation_landing',
  REGISTRATION_CARD = 'registration_card',
  ADDONS = 'addons',
  ID_PHOTOS = 'id_photos',
  ID_VERIFICATION = 'id_verification',
  CREDIT_CARD = 'credit_card',
  CREDIT_CARD_PHOTOS = 'credit_card_photos',
  ADDITIONAL_GUESTS = 'additional_guests',
  SUBMITTING = 'submitting',
}

export interface StepDefinition {
  step: CheckInStep;
  label: string;
  isIncluded: boolean;
  isCounted: boolean; // counts toward progress bar segments
}

// ── Theme ───────────────────────────────────────────────────────────────

export enum BorderRadius {
  SQUARE = 'square',   // 0px
  ROUND = 'round',     // 4px (default)
  CIRCULAR = 'circular', // 24px
}

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  fontColor: string;
  borderRadius: BorderRadius;
}

// ── Registration Card Field Groups ──────────────────────────────────────

export interface RegCardFieldGroups {
  contactInfo: boolean;       // Email, Phone
  address: boolean;           // Street, City, State, Postal Code, Country
  arrivalTime: boolean;       // Estimated arrival time dropdown
  specialRequests: boolean;   // Free text textarea
  dateOfBirth: boolean;       // Date picker
  gender: boolean;            // Dropdown (M/F/O)
  nationality: boolean;       // Country picker
  passportTravelDoc: boolean; // Document type, number, country/place of issue, dates
  vehicleInfo: boolean;       // License plate, make, model, color
  loyaltyProgram: boolean;    // Loyalty number, tier, enrollment checkbox
  companyBilling: boolean;    // Company name, VAT, address
  hotelPolicy: boolean;       // Markdown policy text + agreement checkbox
  marketingConsent: boolean;  // Consent checkbox
  signature: boolean;         // Signature pad (locked ON)
}

// ── ID Options ──────────────────────────────────────────────────────────

export interface IdOptions {
  acceptedTypes: {
    passport: boolean;
    driversLicense: boolean;
    nationalId: boolean;
  };
  requireBackPhoto: boolean;
  requireSelfie: boolean;
}

// ── Payment Options ─────────────────────────────────────────────────────

export enum DepositStrategy {
  CHARGE = 'charge',
  AUTHORIZE = 'authorize',
}

export interface PaymentOptions {
  depositStrategy: DepositStrategy;
  depositAmount: number;
  surchargeEnabled: boolean;
  surchargePercent: number;
  requirePostalCode: boolean;
}

// ── Additional Guest Fields ─────────────────────────────────────────────

export interface AdditionalGuestFields {
  fullName: boolean;     // locked ON
  dateOfBirth: boolean;
  gender: boolean;
  nationality: boolean;
  idUpload: boolean;
  email: boolean;
  phone: boolean;
  address: boolean;
}

// ── Reservation Header Display ──────────────────────────────────────────

export interface ReservationHeaderDisplay {
  roomNumber: boolean;
  roomType: boolean;
  estimatedTotal: boolean;
}

// ── Full Config State ───────────────────────────────────────────────────

export interface CheckInConfigState {
  // Group 1: Flow Steps
  addonsEnabled: boolean;
  idMode: OptionalStep;
  idWithOCR: boolean;
  creditCardMode: OptionalStep;
  creditCardPhotosEnabled: boolean;
  additionalGuestsEnabled: boolean;

  // Group 2: Registration Card Fields
  regCardFields: RegCardFieldGroups;

  // Group 3: ID Options
  idOptions: IdOptions;

  // Group 4: Payment
  paymentOptions: PaymentOptions;

  // Group 5: Additional Guest Fields
  additionalGuestFields: AdditionalGuestFields;

  // Group 6: Reservation Header Display
  reservationHeader: ReservationHeaderDisplay;

  // Group 7: Theme
  theme: ThemeConfig;
}

// ── Flow Navigation ─────────────────────────────────────────────────────

export type FlowDirection = 'forward' | 'backward';

// ── View Mode ───────────────────────────────────────────────────────────

export enum ViewMode {
  PHONE = 'phone',
  FULLSCREEN = 'fullscreen',
}
