/**
 * Broadcast Mock Data
 *
 * Static mock data for the broadcast feature.
 * Groups, guest mappings, and message history.
 */

import {
  BroadcastGroup,
  BroadcastGuestEntry,
  BroadcastMessage,
} from './broadcast-types';

// ===== Built-in Groups =====

export const builtInGroups: BroadcastGroup[] = [
  {
    id: 'group-arrivals',
    name: 'Arrivals',
    type: 'built-in',
    builtInType: 'arrivals',
    isArchived: false,
  },
  {
    id: 'group-in-house',
    name: 'In-house',
    type: 'built-in',
    builtInType: 'in-house',
    isArchived: false,
  },
  {
    id: 'group-departures',
    name: 'Departures',
    type: 'built-in',
    builtInType: 'departures',
    isArchived: false,
  },
];

// ===== Custom Groups =====

export const customGroups: BroadcastGroup[] = [
  {
    id: 'group-corporate',
    name: 'Corporate retreat',
    type: 'custom',
    memberGuestIds: ['guest-emily', 'guest-brooklyn', 'guest-raj'],
    isArchived: false,
    lastBroadcastPreview: 'Welcome to the annual corporate retreat!',
    memberCount: 3,
  },
  {
    id: 'group-conference',
    name: 'Conference',
    type: 'custom',
    memberGuestIds: ['guest-olivia', 'guest-liam'],
    isArchived: false,
    lastBroadcastPreview: 'The keynote speaker will be presenting...',
    memberCount: 2,
  },
  {
    id: 'group-soccer',
    name: 'Soccer Tournament',
    type: 'custom',
    memberGuestIds: ['guest-gel', 'guest-jack', 'guest-nook', 'guest-noah'],
    isArchived: false,
    lastBroadcastPreview: 'Game schedules have been posted in the lobby.',
    memberCount: 4,
  },
  {
    id: 'group-test',
    name: 'New Test Group',
    type: 'custom',
    memberGuestIds: ['guest-kristin'],
    isArchived: false,
    lastBroadcastPreview: 'Hello Platinum Members,...',
    memberCount: 1,
  },
  {
    id: 'group-test2',
    name: 'Test 10-22',
    type: 'custom',
    memberGuestIds: ['guest-sofia'],
    isArchived: false,
    lastBroadcastPreview: 'Testing',
    memberCount: 1,
  },
];

// ===== Guest Mappings per Built-in Group =====

export const builtInGroupGuests: Record<string, BroadcastGuestEntry[]> = {
  'group-arrivals': [
    { guestId: 'guest-gel', reservationId: 'res-gel-mar', segment: 'expecting' },
    { guestId: 'guest-jack', reservationId: 'res-jack-mar', segment: 'expecting' },
    { guestId: 'guest-angela', reservationId: 'res-angela-mar', segment: 'expecting' },
    { guestId: 'guest-nook', reservationId: 'res-nook-mar', segment: 'checked-in' },
    { guestId: 'guest-sofia', reservationId: 'res-sofia-mar', segment: 'expecting' },
  ],
  'group-in-house': [
    { guestId: 'guest-emily', reservationId: 'res-emily-mar' },
    { guestId: 'guest-brooklyn', reservationId: 'res-brooklyn-mar' },
    { guestId: 'guest-kristin', reservationId: 'res-kristin-mar' },
    { guestId: 'guest-olivia', reservationId: 'res-olivia-mar' },
    { guestId: 'guest-liam', reservationId: 'res-liam-mar' },
    { guestId: 'guest-raj', reservationId: 'res-raj-mar' },
    { guestId: 'guest-noah', reservationId: 'res-noah-mar' },
    { guestId: 'guest-emma', reservationId: 'res-emma-mar' },
    { guestId: 'guest-nook', reservationId: 'res-nook-mar' },
  ],
  'group-departures': [
    { guestId: 'guest-diana', reservationId: 'res-diana-mar', segment: 'departing' },
    { guestId: 'guest-chen', reservationId: 'res-chen-mar', segment: 'checked-out' },
    { guestId: 'guest-marco', reservationId: 'res-marco-mar', segment: 'departing' },
  ],
};

// Custom group guest entries (derived from memberGuestIds + their Mar reservations)
export const customGroupGuests: Record<string, BroadcastGuestEntry[]> = {
  'group-corporate': [
    { guestId: 'guest-emily', reservationId: 'res-emily-mar' },
    { guestId: 'guest-brooklyn', reservationId: 'res-brooklyn-mar' },
    { guestId: 'guest-raj', reservationId: 'res-raj-mar' },
  ],
  'group-conference': [
    { guestId: 'guest-olivia', reservationId: 'res-olivia-mar' },
    { guestId: 'guest-liam', reservationId: 'res-liam-mar' },
  ],
  'group-soccer': [
    { guestId: 'guest-gel', reservationId: 'res-gel-mar' },
    { guestId: 'guest-jack', reservationId: 'res-jack-mar' },
    { guestId: 'guest-nook', reservationId: 'res-nook-mar' },
    { guestId: 'guest-noah', reservationId: 'res-noah-mar' },
  ],
  'group-test': [
    { guestId: 'guest-kristin', reservationId: 'res-kristin-mar' },
  ],
  'group-test2': [
    { guestId: 'guest-sofia', reservationId: 'res-sofia-mar' },
  ],
};

// ===== Mock Broadcast Messages =====

export const mockBroadcastMessages: Record<string, BroadcastMessage[]> = {
  'group-arrivals': [
    {
      id: 'bm-arr-1',
      groupId: 'group-arrivals',
      content: 'Hi {{ guest_first_name }}! Thank you for choosing to stay with us at {{ hotel_name }}.\nIf you need anything during your visit, please don\'t hesitate to contact us. You can reach out to the front desk at any time by responding to this message.',
      senderName: 'MARTA ZIAEI',
      sentAt: new Date('2026-01-16T13:02:00'),
      recipientCount: 2,
    },
    {
      id: 'bm-arr-2',
      groupId: 'group-arrivals',
      content: 'Lift D is down for maintenance, we apologize for the inconvenience caused.',
      senderName: 'SARAH SIM',
      sentAt: new Date('2026-02-02T03:44:00'),
      recipientCount: 1,
    },
  ],
  'group-in-house': [
    {
      id: 'bm-ih-1',
      groupId: 'group-in-house',
      content: 'Good morning! Breakfast is being served in the Grand Ballroom until 10:30 AM. Enjoy!',
      senderName: 'THERESA WEBB',
      sentAt: new Date('2026-03-10T07:00:00'),
      recipientCount: 8,
    },
    {
      id: 'bm-ih-2',
      groupId: 'group-in-house',
      content: 'Please note that the pool area will be closed for cleaning between 2:00 PM and 4:00 PM today.',
      senderName: 'SARAH SIM',
      sentAt: new Date('2026-03-10T12:30:00'),
      recipientCount: 8,
    },
  ],
  'group-departures': [
    {
      id: 'bm-dep-1',
      groupId: 'group-departures',
      content: 'We hope you enjoyed your stay! Please remember to check out by 11:00 AM. If you need a late checkout, please contact the front desk.',
      senderName: 'THERESA WEBB',
      sentAt: new Date('2026-03-11T07:30:00'),
      recipientCount: 3,
    },
  ],
  'group-corporate': [
    {
      id: 'bm-corp-1',
      groupId: 'group-corporate',
      content: 'Welcome to the annual corporate retreat! The opening session starts at 3 PM in Conference Room A. See you there!',
      senderName: 'MARTA ZIAEI',
      sentAt: new Date('2026-03-10T09:00:00'),
      recipientCount: 3,
    },
  ],
  'group-conference': [
    {
      id: 'bm-conf-1',
      groupId: 'group-conference',
      content: 'The keynote speaker will be presenting in the main auditorium at 9 AM tomorrow. Doors open at 8:30 AM.',
      senderName: 'THERESA WEBB',
      sentAt: new Date('2026-03-10T18:00:00'),
      recipientCount: 2,
    },
  ],
  'group-soccer': [
    {
      id: 'bm-soc-1',
      groupId: 'group-soccer',
      content: 'Game schedules have been posted in the lobby. Good luck to all teams! First match kicks off at 10 AM on Field B.',
      senderName: 'SARAH SIM',
      sentAt: new Date('2026-03-10T20:00:00'),
      recipientCount: 4,
    },
  ],
  'group-test': [
    {
      id: 'bm-test-1',
      groupId: 'group-test',
      content: 'Hello Platinum Members, we have an exclusive offer for you this weekend.',
      senderName: 'THERESA WEBB',
      sentAt: new Date('2026-03-09T14:00:00'),
      recipientCount: 1,
    },
  ],
  'group-test2': [
    {
      id: 'bm-test2-1',
      groupId: 'group-test2',
      content: 'Testing',
      senderName: 'THERESA WEBB',
      sentAt: new Date('2026-03-08T10:00:00'),
      recipientCount: 1,
    },
  ],
};
