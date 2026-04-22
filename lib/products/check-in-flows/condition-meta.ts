/**
 * Condition metadata
 *
 * Defines which parameters are available, their valid operators, how to
 * render the value input, and the labeled allowed-actions per scope
 * (step / field / option).
 */

import type {
  ConditionParameter,
  ConditionOperator,
  ConditionAction,
  LoyaltyTier,
} from './types';

export interface ParameterMeta {
  id: ConditionParameter;
  displayName: string;
  valueType: 'country-code' | 'number' | 'loyalty-tier' | 'reservation-source' | 'rate-code' | 'boolean' | 'text';
  allowedOperators: ConditionOperator[];
  description: string;
}

export const CONDITION_PARAMETERS: ParameterMeta[] = [
  {
    id: 'nationality',
    displayName: 'Nationality',
    valueType: 'country-code',
    allowedOperators: ['equals', 'not-equals', 'in', 'not-in'],
    description: 'Guest\'s country of citizenship',
  },
  {
    id: 'age',
    displayName: 'Age',
    valueType: 'number',
    allowedOperators: ['equals', 'greater-than', 'less-than'],
    description: 'Guest\'s age in years',
  },
  {
    id: 'loyalty-tier',
    displayName: 'Loyalty Tier',
    valueType: 'loyalty-tier',
    allowedOperators: ['equals', 'not-equals', 'in', 'not-in'],
    description: 'Loyalty status (Club, Silver, Gold, Platinum, Diamond)',
  },
  {
    id: 'loyalty-member',
    displayName: 'Is Loyalty Member',
    valueType: 'boolean',
    allowedOperators: ['is-true', 'is-false'],
    description: 'True if guest is any loyalty-program member',
  },
  {
    id: 'returning-guest',
    displayName: 'Returning Guest',
    valueType: 'boolean',
    allowedOperators: ['is-true', 'is-false'],
    description: 'True if guest has a prior reservation at this property',
  },
  {
    id: 'reservation-source',
    displayName: 'Reservation Source',
    valueType: 'reservation-source',
    allowedOperators: ['equals', 'not-equals', 'in'],
    description: 'How the booking was made (direct, OTA, corporate, group)',
  },
  {
    id: 'rate-code',
    displayName: 'Rate Code',
    valueType: 'rate-code',
    allowedOperators: ['equals', 'not-equals', 'in'],
    description: 'Rate plan on the reservation (BAR, CORP, AAA, etc.)',
  },
  {
    id: 'length-of-stay',
    displayName: 'Length of Stay',
    valueType: 'number',
    allowedOperators: ['equals', 'greater-than', 'less-than'],
    description: 'Number of nights reserved',
  },
];

export const PARAMETER_MAP: Record<ConditionParameter, ParameterMeta> = CONDITION_PARAMETERS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<ConditionParameter, ParameterMeta>
);

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  'equals': 'is',
  'not-equals': 'is not',
  'in': 'is any of',
  'not-in': 'is not any of',
  'greater-than': 'is greater than',
  'less-than': 'is less than',
  'is-true': 'is true',
  'is-false': 'is false',
};

/** Which actions are allowed depending on the condition scope. */
export function getAllowedActions(scope: 'step' | 'field' | 'option'): { id: ConditionAction; label: string; description: string }[] {
  if (scope === 'option') {
    return [
      { id: 'show-option', label: 'Show this option', description: 'Option visible when condition is met' },
      { id: 'hide-option', label: 'Hide this option', description: 'Option hidden when condition is met' },
    ];
  }
  const actions = [
    { id: 'show' as ConditionAction, label: 'Show', description: 'Visible when condition is met' },
    { id: 'hide' as ConditionAction, label: 'Hide', description: 'Hidden when condition is met' },
  ];
  if (scope === 'field') {
    actions.push({
      id: 'require' as ConditionAction,
      label: 'Require',
      description: 'Mark required when condition is met',
    });
  }
  return actions;
}

// ── Common value-picker data ──────────────────────────────

export interface CountryMeta {
  code: string;
  name: string;
  region: string;
}

export const COUNTRIES: CountryMeta[] = [
  // Europe
  { code: 'IT', name: 'Italy', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'ES', name: 'Spain', region: 'Europe' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'NL', name: 'Netherlands', region: 'Europe' },
  { code: 'BE', name: 'Belgium', region: 'Europe' },
  { code: 'AT', name: 'Austria', region: 'Europe' },
  { code: 'PT', name: 'Portugal', region: 'Europe' },
  { code: 'IE', name: 'Ireland', region: 'Europe' },
  { code: 'FI', name: 'Finland', region: 'Europe' },
  { code: 'SE', name: 'Sweden', region: 'Europe' },
  { code: 'DK', name: 'Denmark', region: 'Europe' },
  { code: 'NO', name: 'Norway', region: 'Europe' },
  { code: 'PL', name: 'Poland', region: 'Europe' },
  { code: 'CZ', name: 'Czech Republic', region: 'Europe' },
  { code: 'CH', name: 'Switzerland', region: 'Europe' },
  { code: 'GR', name: 'Greece', region: 'Europe' },

  // North America
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'MX', name: 'Mexico', region: 'North America' },

  // Asia Pacific
  { code: 'JP', name: 'Japan', region: 'Asia Pacific' },
  { code: 'CN', name: 'China', region: 'Asia Pacific' },
  { code: 'KR', name: 'South Korea', region: 'Asia Pacific' },
  { code: 'SG', name: 'Singapore', region: 'Asia Pacific' },
  { code: 'MY', name: 'Malaysia', region: 'Asia Pacific' },
  { code: 'TH', name: 'Thailand', region: 'Asia Pacific' },
  { code: 'IN', name: 'India', region: 'Asia Pacific' },
  { code: 'AU', name: 'Australia', region: 'Asia Pacific' },
  { code: 'NZ', name: 'New Zealand', region: 'Asia Pacific' },

  // Latin America
  { code: 'BR', name: 'Brazil', region: 'Latin America' },
  { code: 'AR', name: 'Argentina', region: 'Latin America' },
  { code: 'CL', name: 'Chile', region: 'Latin America' },

  // Middle East
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East' },
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East' },
  { code: 'IL', name: 'Israel', region: 'Middle East' },
];

export const COUNTRY_MAP: Record<string, CountryMeta> = COUNTRIES.reduce(
  (acc, c) => ({ ...acc, [c.code]: c }),
  {} as Record<string, CountryMeta>
);

export const LOYALTY_TIERS: { value: LoyaltyTier; label: string }[] = [
  { value: 'none', label: 'Non-member' },
  { value: 'club-member', label: 'Club Member' },
  { value: 'silver-elite', label: 'Silver Elite' },
  { value: 'gold-elite', label: 'Gold Elite' },
  { value: 'platinum-elite', label: 'Platinum Elite' },
  { value: 'diamond-elite', label: 'Diamond Elite' },
];

export const RATE_CODES: { value: string; label: string }[] = [
  { value: 'BAR', label: 'BAR (Best Available)' },
  { value: 'CORP', label: 'CORP (Corporate)' },
  { value: 'AAA', label: 'AAA' },
  { value: 'GOV', label: 'GOV (Government)' },
  { value: 'LEISURE', label: 'LEISURE' },
  { value: 'WEEKEND', label: 'WEEKEND' },
  { value: 'PKG', label: 'PKG (Package)' },
  { value: 'RACK', label: 'RACK' },
];

export const RESERVATION_SOURCES: { value: string; label: string }[] = [
  { value: 'direct', label: 'Direct booking' },
  { value: 'ota', label: 'OTA (Booking, Expedia, etc.)' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'group', label: 'Group booking' },
];
