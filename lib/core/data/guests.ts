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
  // Guests for link-reservation demo (multi-reservation threads)
  'guest-john-s': {
    id: 'guest-john-s',
    name: 'John Smith',
    initials: 'JS',
    phone: '+16507665555',
    email: 'johnsmith@gmail.com',
    preferredLanguage: 'English',
  },
  'guest-james-b': {
    id: 'guest-james-b',
    name: 'James Brady',
    initials: 'JB',
    phone: '+14155554444',
    email: 'james.brady@email.com',
    preferredLanguage: 'English',
  },
  'guest-ethan-p': {
    id: 'guest-ethan-p',
    name: 'Ethan Parker',
    initials: 'EP',
    phone: '+14155552671',
    email: 'ethan.parker@email.com',
    preferredLanguage: 'English',
  },
  'guest-liam-c': {
    id: 'guest-liam-c',
    name: 'Liam Carter',
    initials: 'LC',
    phone: '+14155551234',
    email: 'liam.carter@email.com',
    preferredLanguage: 'English',
  },
  'guest-emerson-s': {
    id: 'guest-emerson-s',
    name: 'Emerson Smith',
    initials: 'ES',
    phone: '+13305551234',
    email: 'emerson.smith@email.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'GOLD ELITE',
      color: '#C8B263',
      textColor: 'white',
    },
  },
  // Broadcast-era guests
  'guest-gel': {
    id: 'guest-gel',
    name: 'Gel Asuncion',
    initials: 'GA',
    phone: '+15005550030',
    email: 'gel.asuncion@example.com',
    preferredLanguage: 'English',
  },
  'guest-jack': {
    id: 'guest-jack',
    name: 'Jack Elks',
    initials: 'JE',
    phone: '+15005550031',
    email: 'jack.elks@example.com',
    preferredLanguage: 'English',
  },
  'guest-angela': {
    id: 'guest-angela',
    name: 'Angela Wu',
    initials: 'AW',
    email: 'angela.wu@example.com',
    preferredLanguage: 'English',
    // No phone — will appear grayed out in broadcast
  },
  'guest-nook': {
    id: 'guest-nook',
    name: 'Nook Patel',
    initials: 'NP',
    phone: '+15005550032',
    email: 'nook.patel@example.com',
    preferredLanguage: 'English',
  },
  'guest-diana': {
    id: 'guest-diana',
    name: 'Diana Reyes',
    initials: 'DR',
    phone: '+15005550033',
    email: 'diana.reyes@example.com',
    preferredLanguage: 'Spanish',
  },
  'guest-chen': {
    id: 'guest-chen',
    name: 'Wei Chen',
    initials: 'WC',
    email: 'wei.chen@example.com',
    preferredLanguage: 'Mandarin',
    // No phone — will appear grayed out in broadcast
  },
  'guest-sofia': {
    id: 'guest-sofia',
    name: 'Sofia Andersson',
    initials: 'SA',
    phone: '+15005550034',
    email: 'sofia.andersson@example.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'GOLD ELITE',
      color: '#C8B263',
      textColor: 'white',
    },
  },
  'guest-raj': {
    id: 'guest-raj',
    name: 'Raj Kapoor',
    initials: 'RK',
    phone: '+15005550035',
    email: 'raj.kapoor@example.com',
    preferredLanguage: 'English',
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
