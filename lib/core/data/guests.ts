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
    avatar: '/avatars/ID Avatar-12.png',
    idImage: '/id-scans/emily-id.png',
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
    avatar: '/avatars/ID Avatar-9.png',
    idImage: '/id-scans/brooklyn-id.png',
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
    avatar: '/avatars/ID Avatar-10.png',
    idImage: '/id-scans/olivia-id.png',
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
    avatar: '/avatars/ID Avatar-5.png',
    idImage: '/id-scans/noah-id.png',
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
    avatar: '/avatars/ID Avatar-7.png',
    idImage: '/id-scans/sarah-id.png',
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
    avatar: '/avatars/ID Avatar-4.png',
    idImage: '/id-scans/james-id.png',
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
  // ── Right-pane guests (verified / checked_in) ──────────────────────
  'guest-sophia': {
    id: 'guest-sophia',
    name: 'Sophia Anderson',
    initials: 'SA',
    avatar: '/avatars/ID Avatar-8.png',
    idImage: '/id-scans/kristin-id.png',
    phone: '+15005550025',
    email: 'sophia.anderson@gmail.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'GOLD ELITE',
      color: '#C8B263',
      textColor: 'white',
    },
  },
  'guest-daniel': {
    id: 'guest-daniel',
    name: 'Daniel Park',
    initials: 'DP',
    avatar: '/avatars/ID Avatar-3.png',
    idImage: '/id-scans/robert-id.png',
    phone: '+15005550026',
    email: 'daniel.park@techcorp.com',
    preferredLanguage: 'English',
  },
  'guest-hannah': {
    id: 'guest-hannah',
    name: 'Hannah Kim',
    initials: 'HK',
    avatar: '/avatars/ID Avatar-13.png',
    idImage: '/id-scans/maria-id.png',
    phone: '+15005550027',
    email: 'hannah.kim@email.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'PLATINUM ELITE',
      color: '#E2E7EA',
      textColor: '#3C5D71',
    },
  },
  'guest-tyler': {
    id: 'guest-tyler',
    name: 'Tyler Morrison',
    initials: 'TM',
    avatar: '/avatars/ID Avatar-1.png',
    phone: '+15005550028',
    email: 'tyler.morrison@example.com',
    preferredLanguage: 'English',
  },
  'guest-aisha': {
    id: 'guest-aisha',
    name: 'Aisha Patel',
    initials: 'AP',
    avatar: '/avatars/ID Avatar-6.png',
    phone: '+15005550029',
    email: 'aisha.patel@email.com',
    preferredLanguage: 'English',
    statusTag: {
      label: 'DIAMOND',
      color: '#e6f0ff',
      textColor: '#2858c4',
    },
  },
  'guest-william': {
    id: 'guest-william',
    name: 'William Foster',
    initials: 'WF',
    avatar: '/avatars/ID Avatar-2.png',
    phone: '+15005550030',
    email: 'w.foster@business.com',
    preferredLanguage: 'English',
  },
  'guest-isabella': {
    id: 'guest-isabella',
    name: 'Isabella Reyes',
    initials: 'IR',
    avatar: '/avatars/ID Avatar-11.png',
    phone: '+15005550031',
    email: 'isabella.reyes@gmail.com',
    preferredLanguage: 'Spanish',
    statusTag: {
      label: 'CLUB MEMBER',
      color: '#607985',
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
