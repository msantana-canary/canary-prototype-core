/**
 * Canonical Guest Data
 *
 * These are the master guest records used across all products.
 * One guest, consistent everywhere.
 */

import { Guest } from '../types/guest';

export const guests: Record<string, Guest> = {
  'guest-emily': {
    id: 'guest-emily',
    name: 'Emily Smith',
    initials: 'ES',
    phone: '+15005550012',
    email: 'emily.smith@gmail.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'DIAMOND ELITE',
      color: '#000000',
      textColor: 'white',
    },
  },
  'guest-miguel': {
    id: 'guest-miguel',
    name: 'Miguel Andre Briones Santana Rodriguez',
    initials: 'MS',
    phone: '+15005550013',
    email: 'miguel.santana@example.com',
    preferredLanguage: 'English',
  },
  'guest-brooklyn': {
    id: 'guest-brooklyn',
    name: 'Brooklyn Simmons',
    initials: 'BS',
    phone: '+15005550014',
    email: 'brooklyn.simmons@example.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'GOLD ELITE',
      color: '#C8B263',
      textColor: 'white',
    },
  },
  'guest-marco': {
    id: 'guest-marco',
    name: 'Marco Bitanga-Sevilla',
    initials: 'MS',
    phone: '+15005550015',
    email: 'marco.bitanga@example.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'CLUB MEMBER',
      color: '#607985',
      textColor: 'white',
    },
  },
  'guest-kristin': {
    id: 'guest-kristin',
    name: 'Kristin Watson',
    initials: 'KW',
    phone: '+15005550016',
    email: 'kristin.watson@example.com',
    preferredLanguage: 'English',
  },
  'guest-liam': {
    id: 'guest-liam',
    name: 'Liam Johnson',
    initials: 'LJ',
    phone: '+15005550017',
    email: 'liam.johnson@example.com',
    preferredLanguage: 'English',
  },
  'guest-olivia': {
    id: 'guest-olivia',
    name: 'Olivia Katherine Elizabeth Brown-Henderson',
    initials: 'OB',
    phone: '+15005550018',
    email: 'olivia.brown@example.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'PLATINUM ELITE',
      color: '#E2E7EA',
      textColor: '#3C5D71',
    },
  },
  'guest-noah': {
    id: 'guest-noah',
    name: 'Noah Davis',
    initials: 'ND',
    phone: '+15005550019',
    email: 'noah.davis@example.com',
    preferredLanguage: 'English',
  },
  'guest-emma': {
    id: 'guest-emma',
    name: 'Emma Charlotte Wilson-Rodriguez',
    initials: 'EW',
    phone: '+15005550024',
    email: 'emma.wilson@example.com',
    preferredLanguage: 'English',
  },
  'guest-sarah': {
    id: 'guest-sarah',
    name: 'Sarah Martinez',
    initials: 'SM',
    phone: '+15005550020',
    email: 'sarah.martinez@example.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'PLATINUM ELITE',
      color: '#E2E7EA',
      textColor: '#3C5D71',
    },
  },
  'guest-james': {
    id: 'guest-james',
    name: 'James Chen',
    initials: 'JC',
    phone: '+15005550021',
    email: 'james.chen@techcorp.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'GOLD ELITE',
      color: '#C8B263',
      textColor: 'white',
    },
  },
  'guest-maria': {
    id: 'guest-maria',
    name: 'Maria Garcia',
    initials: 'MG',
    phone: '+15005550022',
    email: 'maria.garcia@email.com',
    preferredLanguage: 'Spanish',
  },
  'guest-robert': {
    id: 'guest-robert',
    name: 'Robert Thompson',
    initials: 'RT',
    phone: '+15005550023',
    email: 'r.thompson@business.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'DIAMOND ELITE',
      color: '#000000',
      textColor: 'white',
    },
  },
};

/**
 * Get all guests as an array
 */
export const guestList = Object.values(guests);

/**
 * Get a guest by ID
 */
export function getGuest(id: string): Guest | undefined {
  return guests[id];
}
