/**
 * Calls Settings Mock Data
 *
 * Constants and mock data for the Transfer Rules settings feature.
 */

import type { VoiceOption, DepartmentOption } from '@/lib/products/calls/types';

export const voiceOptions: VoiceOption[] = [
  {
    label: 'Lyra - Warm and welcoming; perfect for friendly service.',
    value: 'lyra',
  },
  { label: 'Nova - Professional and clear', value: 'nova' },
  { label: 'Atlas - Confident and reassuring', value: 'atlas' },
];

export const departmentOptions: DepartmentOption[] = [
  { label: 'Reservations', value: 'reservations' },
  { label: 'Reservation Modification', value: 'reservation-modification' },
  { label: 'Front Desk', value: 'front-desk' },
  { label: 'Bar', value: 'bar' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Market', value: 'market' },
  { label: 'Sales', value: 'sales' },
  { label: 'Shuttle', value: 'shuttle' },
  { label: 'Accounting', value: 'accounting' },
  { label: 'General Manager', value: 'general-manager' },
  { label: 'Operations', value: 'operations' },
  { label: 'Human Resources', value: 'human-resources' },
  { label: 'Maintenance', value: 'maintenance' },
];

export const departmentDescriptions: Record<string, string> = {
  reservations:
    'Calls will route to this department when guest asks about making a new booking, checking room availability, rates and pricing, special offers, cancellation policies, or general reservation inquiries',
  'reservation-modification':
    'Calls will route to this department when guest needs to modify an existing reservation, change dates, upgrade room type, add extra nights, adjust guest count, or make any changes to their confirmed booking',
  'front-desk':
    'Calls will route to this department when guest has questions about check-in/check-out times, room keys, luggage storage, lost and found items, noise complaints, security concerns, local directions, or general hotel information',
  bar: 'Calls will route to this department when guest asks about bar hours, drink menu, happy hour specials, cocktail recommendations, private bar events, or wants to place an order for bar service',
  restaurant:
    'Calls will route to this department when guest wants to make a dining reservation, ask about restaurant hours, menu options, dietary accommodations, breakfast service, room service, or special dining events',
  market:
    'Calls will route to this department when guest inquires about gift shop hours, available merchandise, souvenirs, convenience items, snacks, beverages, or wants to purchase hotel-branded items',
  sales:
    'Calls will route to this department when guest asks about group bookings, corporate rates, event spaces, meeting rooms, wedding packages, conference facilities, bulk reservations, or partnership opportunities',
  shuttle:
    'Calls will route to this department when guest needs airport transportation, shuttle schedule, pickup arrangements, drop-off locations, transportation to local attractions, or taxi/ride-share assistance',
  accounting:
    'Calls will route to this department when guest has questions about their bill, invoice requests, payment methods, credit card charges, refund status, deposit information, or billing disputes',
  'general-manager':
    'Calls will route to this department when guest wants to escalate a serious complaint, provide important feedback, discuss exceptional circumstances, make special VIP requests, or address urgent matters requiring executive attention',
  operations:
    'Calls will route to this department when guest reports facility issues, pool/gym access problems, parking concerns, equipment malfunctions, or operational matters that don\'t fall under maintenance or front desk',
  'human-resources':
    'Calls will route to this department when caller inquires about employment opportunities, job applications, staff verification, or HR-related matters (not for guest services)',
  maintenance:
    'Calls will route to this department when guest reports room maintenance issues, broken appliances, plumbing problems, heating/cooling issues, electrical problems, or any technical repairs needed in guest rooms or facilities',
};

// Helper to get department label from value
export const getDepartmentLabel = (value: string): string => {
  const dept = departmentOptions.find((d) => d.value === value);
  return dept?.label || value;
};

// Helper to get department description from value
export const getDepartmentDescription = (value: string): string => {
  return departmentDescriptions[value] || '';
};
