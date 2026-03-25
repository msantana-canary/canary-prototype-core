/**
 * Mock Form Data for Guest Check-In Preview
 *
 * Pre-filled guest data for the demo flow.
 * Uses Emily Smith (guest-emily) as the demo guest — she has
 * avatar, ID image, payment card, and a rich reservation.
 */

import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';

// ── Demo Guest ──────────────────────────────────────────────────────────

const demoGuest = guests['guest-emily']!;
const demoReservation = reservations['res-emily-mar']!;

export const DEMO_GUEST = {
  firstName: 'Emily',
  lastName: 'Smith',
  email: demoGuest.email ?? '',
  phone: demoGuest.phone ?? '',
  preferredLanguage: demoGuest.preferredLanguage ?? 'English',
  avatar: demoGuest.avatar,
  loyaltyTier: demoGuest.statusTag?.label ?? '',
};

export const DEMO_RESERVATION = {
  confirmationCode: demoReservation.confirmationCode,
  roomNumber: demoReservation.room ?? '153',
  roomType: demoReservation.roomType ?? 'King Suite',
  roomTypeCode: demoReservation.roomTypeCode ?? 'KST',
  checkInDate: 'March 16, 2026',
  checkOutDate: 'March 18, 2026',
  nights: 2,
  estimatedTotal: 478.00,
  rateCode: demoReservation.rateCode ?? 'CORP',
};

// ── Pre-filled Registration Card Data ───────────────────────────────────

export const DEMO_REG_CARD = {
  // Name (always shown)
  firstName: 'Emily',
  lastName: 'Smith',

  // Contact Info
  email: 'emily.smith@gmail.com',
  phone: '+1 (500) 555-0012',

  // Address
  address: '142 West 57th Street',
  city: 'New York',
  state: 'NY',
  postalCode: '10019',
  country: 'United States',

  // Arrival
  arrivalTime: '3:00 PM',

  // Special Requests
  specialRequests: 'High floor room away from elevator, extra pillows please.',

  // Optional fields (pre-filled for when toggled on)
  dateOfBirth: '1988-06-15',
  gender: 'F',
  nationality: 'United States',

  // Passport / Travel Doc
  travelDocType: 'Passport',
  travelDocNumber: '543216789',
  travelDocCountry: 'United States',
  travelDocIssueDate: '2022-03-10',
  travelDocExpiryDate: '2032-03-09',
  travelDocPlaceOfIssue: 'New York, NY',

  // Vehicle
  licensePlate: 'NYS-4821',
  vehicleMake: 'Tesla',
  vehicleModel: 'Model 3',
  vehicleColor: 'White',

  // Loyalty
  loyaltyNumber: 'DIA-9284756',
  loyaltyTier: 'Diamond Elite',

  // Company Billing
  companyName: 'Meridian Capital Group',
  companyVat: 'US-84-2957631',
  companyAddress: '1 Battery Park Plaza, New York, NY 10004',
};

// ── Demo Payment Card ───────────────────────────────────────────────────

export const DEMO_PAYMENT = {
  cardNumber: '•••• •••• •••• 6789',
  cardBrand: 'Visa',
  cardholderName: 'Emily Smith',
  expiryMonth: '03',
  expiryYear: '2028',
  postalCode: '10019',
};

// ── Demo Addon Items ────────────────────────────────────────────────────

export interface AddonItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'early-checkin' | 'late-checkout' | 'room-upgrade' | 'amenity';
}

export const DEMO_ADDONS: AddonItem[] = [
  {
    id: 'addon-early-checkin',
    name: 'Early Check-In (1:00 PM)',
    description: 'Check in 2 hours early and get settled before your day begins.',
    price: 30,
    image: '/images/hotel-property.png',
    category: 'early-checkin',
  },
  {
    id: 'addon-late-checkout',
    name: 'Late Checkout (2:00 PM)',
    description: 'Enjoy a leisurely departure with an extra 2 hours in your room.',
    price: 50,
    image: '/images/hotel-property.png',
    category: 'late-checkout',
  },
  {
    id: 'addon-room-upgrade',
    name: 'Premium Suite Upgrade',
    description: 'Upgrade to a spacious corner suite with Central Park views.',
    price: 125,
    image: '/images/hotel-property.png',
    category: 'room-upgrade',
  },
  {
    id: 'addon-champagne',
    name: 'Champagne & Strawberries',
    description: 'A bottle of Moët & Chandon with fresh strawberries in your room.',
    price: 65,
    image: '/images/hotel-property.png',
    category: 'amenity',
  },
];

// ── Demo Additional Guests ──────────────────────────────────────────────

export const DEMO_ADDITIONAL_GUESTS = [
  {
    id: 'addl-1',
    firstName: 'David',
    lastName: 'Smith',
    dateOfBirth: '1986-09-22',
    gender: 'M',
    nationality: 'United States',
    email: 'david.smith@gmail.com',
    phone: '+1 (500) 555-0099',
  },
];

// ── Hotel Branding ──────────────────────────────────────────────────────

export const HOTEL_BRANDING = {
  name: 'Statler New York',
  logo: '/images/hotel-logo.png',
  heroImage: '/images/hotel-property.png',
  address: '151 West 54th Street, New York, NY 10019',
  phone: '+1 (212) 555-0100',
};

// ── Hotel Policy Text ───────────────────────────────────────────────────

export const HOTEL_POLICY_TEXT = `By completing this registration, I agree to the hotel's terms and conditions, including the cancellation policy, check-in/check-out times, and property rules. I acknowledge that I am financially responsible for all charges incurred during my stay, including room charges, incidentals, and any damages to hotel property. A valid government-issued photo ID is required at check-in. The hotel reserves the right to pre-authorize or charge the credit card on file for the estimated total stay amount plus incidentals.`;
