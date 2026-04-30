/**
 * Element Tag Registry
 *
 * Semantic tags that map form fields to PMS data. Attaching a tag to a
 * field tells the engine "this field represents guest.email" regardless
 * of the label. Models production's ElementTag enum.
 */

import type { ElementTag, FieldType } from './types';

export type TagCategory = 'guest-info' | 'contact' | 'address' | 'stay' | 'identification' | 'loyalty' | 'other' | 'udf';

export interface ElementTagMeta {
  id: ElementTag;
  displayName: string;
  pmsField: string;
  category: TagCategory;
  defaultFieldType: FieldType;
}

export const ELEMENT_TAGS: ElementTagMeta[] = [
  // Guest info
  { id: 'guest-name', displayName: 'Guest Name', pmsField: 'guest.full_name', category: 'guest-info', defaultFieldType: 'text-input' },
  { id: 'guest-first-name', displayName: 'First Name', pmsField: 'guest.first_name', category: 'guest-info', defaultFieldType: 'text-input' },
  { id: 'guest-last-name', displayName: 'Last Name', pmsField: 'guest.last_name', category: 'guest-info', defaultFieldType: 'text-input' },
  { id: 'guest-date-of-birth', displayName: 'Date of Birth', pmsField: 'guest.dob', category: 'guest-info', defaultFieldType: 'date' },
  { id: 'guest-nationality', displayName: 'Nationality', pmsField: 'guest.nationality', category: 'guest-info', defaultFieldType: 'country' },

  // Contact
  { id: 'guest-email', displayName: 'Email', pmsField: 'guest.email', category: 'contact', defaultFieldType: 'email' },
  { id: 'guest-phone', displayName: 'Phone', pmsField: 'guest.phone', category: 'contact', defaultFieldType: 'phone' },

  // Address
  { id: 'address-line-1', displayName: 'Address Line 1', pmsField: 'guest.address.line1', category: 'address', defaultFieldType: 'text-input' },
  { id: 'address-line-2', displayName: 'Address Line 2', pmsField: 'guest.address.line2', category: 'address', defaultFieldType: 'text-input' },
  { id: 'city', displayName: 'City', pmsField: 'guest.address.city', category: 'address', defaultFieldType: 'text-input' },
  { id: 'state', displayName: 'State / Province', pmsField: 'guest.address.state', category: 'address', defaultFieldType: 'text-input' },
  { id: 'country', displayName: 'Country', pmsField: 'guest.address.country', category: 'address', defaultFieldType: 'country' },
  { id: 'postal-code', displayName: 'Postal Code', pmsField: 'guest.address.postal_code', category: 'address', defaultFieldType: 'text-input' },

  // Stay
  { id: 'estimated-arrival-time', displayName: 'Estimated Arrival Time', pmsField: 'reservation.estimated_arrival', category: 'stay', defaultFieldType: 'time-select' },
  { id: 'special-requests', displayName: 'Special Requests', pmsField: 'reservation.special_requests', category: 'stay', defaultFieldType: 'text-area' },

  // Loyalty
  { id: 'loyalty-program-id', displayName: 'Loyalty Program ID', pmsField: 'guest.loyalty.member_id', category: 'loyalty', defaultFieldType: 'text-input' },
  { id: 'loyalty-tier', displayName: 'Loyalty Tier', pmsField: 'guest.loyalty.tier', category: 'loyalty', defaultFieldType: 'dropdown' },

  // Identification
  { id: 'id-type', displayName: 'ID Type', pmsField: 'guest.id.type', category: 'identification', defaultFieldType: 'dropdown' },
  { id: 'id-number', displayName: 'ID Number', pmsField: 'guest.id.number', category: 'identification', defaultFieldType: 'text-input' },
  { id: 'id-issue-date', displayName: 'ID Issue Date', pmsField: 'guest.id.issue_date', category: 'identification', defaultFieldType: 'date' },
  { id: 'id-expiry-date', displayName: 'ID Expiry Date', pmsField: 'guest.id.expiry_date', category: 'identification', defaultFieldType: 'date' },
  { id: 'id-issuing-country', displayName: 'ID Issuing Country', pmsField: 'guest.id.issuing_country', category: 'identification', defaultFieldType: 'country' },

  // Other
  { id: 'signature', displayName: 'Signature', pmsField: 'reservation.signature', category: 'other', defaultFieldType: 'signature' },

  // PMS UDFs — hotel-defined fields the configurator can route data into.
  // pmsField path uses udf.* convention; production discovers these from the PMS.
  { id: 'udf-special-occasion', displayName: 'Special Occasion', pmsField: 'udf.special_occasion', category: 'udf', defaultFieldType: 'dropdown' },
  { id: 'udf-company-account', displayName: 'Company Account', pmsField: 'udf.company_account', category: 'udf', defaultFieldType: 'text-input' },
  { id: 'udf-loyalty-referral', displayName: 'Loyalty Referral Source', pmsField: 'udf.loyalty_referral', category: 'udf', defaultFieldType: 'text-input' },
  { id: 'udf-room-preferences', displayName: 'Room Preferences', pmsField: 'udf.room_preferences', category: 'udf', defaultFieldType: 'checkbox-group' },
  { id: 'udf-dietary-restrictions', displayName: 'Dietary Restrictions', pmsField: 'udf.dietary_restrictions', category: 'udf', defaultFieldType: 'checkbox-group' },
  { id: 'udf-marketing-source', displayName: 'How did you hear about us?', pmsField: 'udf.marketing_source', category: 'udf', defaultFieldType: 'dropdown' },
];

export const ELEMENT_TAG_MAP: Record<ElementTag, ElementTagMeta> = ELEMENT_TAGS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<ElementTag, ElementTagMeta>
);

export function getElementTagMeta(id: ElementTag): ElementTagMeta {
  return ELEMENT_TAG_MAP[id];
}

export const ELEMENT_TAGS_BY_CATEGORY: Record<TagCategory, ElementTagMeta[]> = {
  'guest-info': ELEMENT_TAGS.filter((t) => t.category === 'guest-info'),
  'contact': ELEMENT_TAGS.filter((t) => t.category === 'contact'),
  'address': ELEMENT_TAGS.filter((t) => t.category === 'address'),
  'stay': ELEMENT_TAGS.filter((t) => t.category === 'stay'),
  'identification': ELEMENT_TAGS.filter((t) => t.category === 'identification'),
  'loyalty': ELEMENT_TAGS.filter((t) => t.category === 'loyalty'),
  'other': ELEMENT_TAGS.filter((t) => t.category === 'other'),
  'udf': ELEMENT_TAGS.filter((t) => t.category === 'udf'),
};
