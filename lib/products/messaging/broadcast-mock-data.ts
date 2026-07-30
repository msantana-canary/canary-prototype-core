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
  ScheduledBroadcast,
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


// ===== Folder dates =====
// Arrivals/Departures are date-scoped: the To strip's date token filters them.
// Seeded relative to "today" so the demo always has a populated default day and
// changing the date visibly changes the count.
function dayOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
export const BROADCAST_TODAY = dayOffset(0);

// ===== Guest Mappings per Built-in Group =====

export const builtInGroupGuests: Record<string, BroadcastGuestEntry[]> = {
  'group-arrivals': [
    { guestId: 'guest-gel', reservationId: 'res-gel-mar', folderDate: dayOffset(0), checkInStatus: 'expecting', loyaltyTier: 'non-member', rateCode: 'BAR', room: '101', stayNights: 2, isReturningGuest: false },
    { guestId: 'guest-jack', reservationId: 'res-jack-mar', folderDate: dayOffset(0), checkInStatus: 'expecting', loyaltyTier: 'non-member', rateCode: 'CORP', groupCode: 'GROUP2026', room: '215', stayNights: 3, isReturningGuest: false },
    { guestId: 'guest-angela', reservationId: 'res-angela-mar', folderDate: dayOffset(0), checkInStatus: 'expecting', loyaltyTier: 'non-member', rateCode: 'AAA', room: '104', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-nook', reservationId: 'res-nook-mar', folderDate: dayOffset(1), checkInStatus: 'in-house', loyaltyTier: 'non-member', rateCode: 'CORP', groupCode: 'GROUP2026', room: '208', stayNights: 4, isReturningGuest: true },
    { guestId: 'guest-sofia', reservationId: 'res-sofia-mar', folderDate: dayOffset(1), checkInStatus: 'expecting', loyaltyTier: 'gold-elite', rateCode: 'RACK', room: '312', stayNights: 2, isReturningGuest: true },
    { guestId: 'guest-carlos', reservationId: 'res-carlos-mar', folderDate: dayOffset(2), checkInStatus: 'expecting', loyaltyTier: 'non-member', rateCode: 'BAR', room: '103', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-david-w', reservationId: 'res-david-w-mar', folderDate: dayOffset(0), checkInStatus: 'expecting', loyaltyTier: 'non-member', rateCode: 'CORP', groupCode: 'CONF2026', room: '205', stayNights: 3, isReturningGuest: false },
    { guestId: 'guest-nina', reservationId: 'res-nina-mar', folderDate: dayOffset(0), checkInStatus: 'expecting', loyaltyTier: 'gold-elite', rateCode: 'CORP', room: '306', stayNights: 5, isReturningGuest: true },
    { guestId: 'guest-grace', reservationId: 'res-grace-mar', folderDate: dayOffset(0), checkInStatus: 'expecting', loyaltyTier: 'non-member', rateCode: 'AAA', room: '110', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-mei', reservationId: 'res-mei-mar', folderDate: dayOffset(1), checkInStatus: 'expecting', loyaltyTier: 'gold-elite', rateCode: 'CORP', groupCode: 'GROUP2026', room: '407', stayNights: 4, isReturningGuest: true },
    { guestId: 'guest-tariq', reservationId: 'res-tariq-mar', messagingOptedOut: true, folderDate: dayOffset(1), checkInStatus: 'expecting', loyaltyTier: 'non-member', rateCode: 'RACK', room: '212', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-elena', reservationId: 'res-elena-mar', folderDate: dayOffset(2), checkInStatus: 'expecting', loyaltyTier: 'club-member', rateCode: 'BAR', room: '314', stayNights: 2, isReturningGuest: true },
    { guestId: 'guest-astrid', reservationId: 'res-astrid-mar', folderDate: dayOffset(0), checkInStatus: 'expecting', loyaltyTier: 'non-member', rateCode: 'BAR', room: '107', stayNights: 1, isReturningGuest: false },
  ],
  'group-in-house': [
    { guestId: 'guest-emily', reservationId: 'res-emily-mar', loyaltyTier: 'diamond-elite', rateCode: 'CORP', groupCode: 'CONF2026', room: '153', stayNights: 5, isReturningGuest: true },
    { guestId: 'guest-brooklyn', reservationId: 'res-brooklyn-mar', loyaltyTier: 'gold-elite', rateCode: 'BAR', room: '130', stayNights: 3, isReturningGuest: true },
    { guestId: 'guest-kristin', reservationId: 'res-kristin-mar', loyaltyTier: 'non-member', rateCode: 'GOV', groupCode: 'GRP1027', room: '220', stayNights: 2, isReturningGuest: false },
    { guestId: 'guest-olivia', reservationId: 'res-olivia-mar', loyaltyTier: 'platinum-elite', rateCode: 'CORP', groupCode: 'CONF2026', room: '204', stayNights: 4, isReturningGuest: true },
    { guestId: 'guest-liam', reservationId: 'res-liam-mar', loyaltyTier: 'silver-elite', rateCode: 'BAR', room: '318', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-raj', reservationId: 'res-raj-mar', loyaltyTier: 'non-member', rateCode: 'RACK', groupCode: 'GROUP2026', room: '507', stayNights: 2, isReturningGuest: false },
    { guestId: 'guest-noah', reservationId: 'res-noah-mar', loyaltyTier: 'non-member', rateCode: 'AAA', room: '415', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-emma', reservationId: 'res-emma-mar', loyaltyTier: 'non-member', rateCode: 'GOV', groupCode: 'GRP1027', room: '409', stayNights: 3, isReturningGuest: false },
    { guestId: 'guest-nook', reservationId: 'res-nook-mar', loyaltyTier: 'non-member', rateCode: 'CORP', groupCode: 'GROUP2026', room: '208', stayNights: 4, isReturningGuest: true },
    { guestId: 'guest-priya', reservationId: 'res-priya-mar', loyaltyTier: 'gold-elite', rateCode: 'CORP', groupCode: 'CONF2026', room: '405', stayNights: 3, isReturningGuest: true },
    { guestId: 'guest-yuki', reservationId: 'res-yuki-mar', loyaltyTier: 'platinum-elite', rateCode: 'BAR', room: '510', stayNights: 2, isReturningGuest: true },
    { guestId: 'guest-fatima', reservationId: 'res-fatima-mar', loyaltyTier: 'diamond-elite', rateCode: 'CORP', room: '601', stayNights: 7, isReturningGuest: true },
    { guestId: 'guest-lucia', reservationId: 'res-lucia-mar', messagingOptedOut: true, loyaltyTier: 'silver-elite', rateCode: 'AAA', room: '225', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-ahmed', reservationId: 'res-ahmed-mar', loyaltyTier: 'non-member', rateCode: 'RACK', groupCode: 'GROUP2026', room: '108', stayNights: 2, isReturningGuest: false },
    { guestId: 'guest-hiroshi', reservationId: 'res-hiroshi-mar', loyaltyTier: 'platinum-elite', rateCode: 'CORP', room: '503', stayNights: 4, isReturningGuest: true },
    { guestId: 'guest-sven', reservationId: 'res-sven-mar', loyaltyTier: 'non-member', rateCode: 'GOV', room: '320', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-anya', reservationId: 'res-anya-mar', loyaltyTier: 'silver-elite', rateCode: 'BAR', groupCode: 'GRP1027', room: '217', stayNights: 3, isReturningGuest: true },
    { guestId: 'guest-sophie-t', reservationId: 'res-sophie-t-mar', loyaltyTier: 'non-member', rateCode: 'RACK', room: '115', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-victor', reservationId: 'res-victor-mar', loyaltyTier: 'platinum-elite', rateCode: 'CORP', groupCode: 'CONF2026', room: '605', stayNights: 5, isReturningGuest: true },
    { guestId: 'guest-ines', reservationId: 'res-ines-mar', loyaltyTier: 'silver-elite', rateCode: 'AAA', room: '309', stayNights: 2, isReturningGuest: false },
    { guestId: 'guest-leila', reservationId: 'res-leila-mar', loyaltyTier: 'gold-elite', rateCode: 'CORP', room: '411', stayNights: 3, isReturningGuest: true },
    { guestId: 'guest-lucas', reservationId: 'res-lucas-mar', loyaltyTier: 'non-member', rateCode: 'BAR', room: '118', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-kofi', reservationId: 'res-kofi-mar', loyaltyTier: 'non-member', rateCode: 'AAA', room: '116', stayNights: 2, isReturningGuest: false },
    { guestId: 'guest-dmitri', reservationId: 'res-dmitri-mar', loyaltyTier: 'non-member', rateCode: 'GOV', room: '222', stayNights: 1, isReturningGuest: false },
  ],
  'group-departures': [
    { guestId: 'guest-diana', reservationId: 'res-diana-mar', folderDate: dayOffset(0), checkInStatus: 'in-house', loyaltyTier: 'non-member', rateCode: 'BAR', room: '303', stayNights: 2, isReturningGuest: false },
    { guestId: 'guest-chen', reservationId: 'res-chen-mar', folderDate: dayOffset(0), checkInStatus: 'checked-out', loyaltyTier: 'non-member', rateCode: 'CORP', groupCode: 'CONF2026', room: '410', stayNights: 3, isReturningGuest: false },
    { guestId: 'guest-marco', reservationId: 'res-marco-mar', folderDate: dayOffset(0), checkInStatus: 'in-house', loyaltyTier: 'club-member', rateCode: 'RACK', room: '112', stayNights: 1, isReturningGuest: true },
    { guestId: 'guest-kwame', reservationId: 'res-kwame-mar', folderDate: dayOffset(1), checkInStatus: 'in-house', loyaltyTier: 'non-member', rateCode: 'CORP', groupCode: 'GROUP2026', room: '201', stayNights: 4, isReturningGuest: false },
    { guestId: 'guest-carmen', reservationId: 'res-carmen-mar', folderDate: dayOffset(1), checkInStatus: 'in-house', loyaltyTier: 'club-member', rateCode: 'CORP', room: '309', stayNights: 2, isReturningGuest: true },
    { guestId: 'guest-rafael', reservationId: 'res-rafael-mar', folderDate: dayOffset(2), checkInStatus: 'checked-out', loyaltyTier: 'non-member', rateCode: 'BAR', room: '412', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-javier', reservationId: 'res-javier-mar', messagingOptedOut: true, folderDate: dayOffset(0), checkInStatus: 'in-house', loyaltyTier: 'non-member', rateCode: 'AAA', room: '316', stayNights: 3, isReturningGuest: false },
    { guestId: 'guest-kenji', reservationId: 'res-kenji-mar', folderDate: dayOffset(0), checkInStatus: 'checked-out', loyaltyTier: 'non-member', rateCode: 'RACK', room: '408', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-raj', reservationId: 'res-raj-mar', folderDate: dayOffset(0), checkInStatus: 'in-house', loyaltyTier: 'non-member', rateCode: 'RACK', groupCode: 'GROUP2026', room: '507', stayNights: 2, isReturningGuest: false },
    { guestId: 'guest-nook', reservationId: 'res-nook-mar', folderDate: dayOffset(1), checkInStatus: 'in-house', loyaltyTier: 'non-member', rateCode: 'CORP', groupCode: 'GROUP2026', room: '208', stayNights: 4, isReturningGuest: true },
    { guestId: 'guest-anya', reservationId: 'res-anya-mar', folderDate: dayOffset(1), checkInStatus: 'in-house', loyaltyTier: 'silver-elite', rateCode: 'BAR', groupCode: 'GRP1027', room: '217', stayNights: 3, isReturningGuest: true },
    { guestId: 'guest-sophie-t', reservationId: 'res-sophie-t-mar', folderDate: dayOffset(2), checkInStatus: 'in-house', loyaltyTier: 'non-member', rateCode: 'RACK', room: '115', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-ines', reservationId: 'res-ines-mar', folderDate: dayOffset(0), checkInStatus: 'in-house', loyaltyTier: 'silver-elite', rateCode: 'AAA', room: '309', stayNights: 2, isReturningGuest: false },
    { guestId: 'guest-leila', reservationId: 'res-leila-mar', folderDate: dayOffset(0), checkInStatus: 'in-house', loyaltyTier: 'gold-elite', rateCode: 'CORP', room: '411', stayNights: 3, isReturningGuest: true },
    { guestId: 'guest-lucas', reservationId: 'res-lucas-mar', folderDate: dayOffset(0), checkInStatus: 'in-house', loyaltyTier: 'non-member', rateCode: 'BAR', room: '118', stayNights: 1, isReturningGuest: false },
    { guestId: 'guest-kofi', reservationId: 'res-kofi-mar', folderDate: dayOffset(1), checkInStatus: 'in-house', loyaltyTier: 'non-member', rateCode: 'AAA', room: '116', stayNights: 2, isReturningGuest: false },
    { guestId: 'guest-dmitri', reservationId: 'res-dmitri-mar', folderDate: dayOffset(1), checkInStatus: 'in-house', loyaltyTier: 'non-member', rateCode: 'GOV', room: '222', stayNights: 1, isReturningGuest: false },
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
      recipientCount: 5,
      recipients: [
        { guestId: 'guest-gel', status: 'delivered' },
        { guestId: 'guest-jack', status: 'delivered' },
        { guestId: 'guest-sofia', status: 'read' },
        { guestId: 'guest-carlos', status: 'delivered' },
        { guestId: 'guest-nina', status: 'delivered' },
      ],
    },
    {
      id: 'bm-arr-2',
      groupId: 'group-arrivals',
      content: 'Lift D is down for maintenance, we apologize for the inconvenience caused.',
      senderName: 'SARAH SIM',
      sentAt: new Date('2026-02-02T03:44:00'),
      recipientCount: 3,
      recipients: [
        { guestId: 'guest-gel', status: 'delivered' },
        { guestId: 'guest-jack', status: 'failed' },
        { guestId: 'guest-nook', status: 'delivered' },
      ],
    },
  ],
  'group-in-house': [
    {
      id: 'bm-ih-1',
      groupId: 'group-in-house',
      content: 'Good morning! Breakfast is being served in the Grand Ballroom until 10:30 AM. Enjoy!',
      senderName: 'THERESA WEBB',
      sentAt: new Date('2026-03-10T07:00:00'),
      recipientCount: 18,
      recipients: [
        { guestId: 'guest-emily', status: 'read' },
        { guestId: 'guest-brooklyn', status: 'delivered' },
        { guestId: 'guest-kristin', status: 'delivered' },
        { guestId: 'guest-olivia', status: 'read' },
        { guestId: 'guest-liam', status: 'delivered' },
        { guestId: 'guest-raj', status: 'delivered' },
        { guestId: 'guest-noah', status: 'delivered' },
        { guestId: 'guest-emma', status: 'delivered' },
        { guestId: 'guest-nook', status: 'delivered' },
        { guestId: 'guest-priya', status: 'delivered' },
        { guestId: 'guest-yuki', status: 'read' },
        { guestId: 'guest-fatima', status: 'delivered' },
        { guestId: 'guest-lucia', status: 'delivered' },
        { guestId: 'guest-ahmed', status: 'sent' },
        { guestId: 'guest-hiroshi', status: 'delivered' },
        { guestId: 'guest-sven', status: 'delivered' },
        { guestId: 'guest-anya', status: 'delivered' },
        { guestId: 'guest-sophie-t', status: 'delivered' },
      ],
    },
    {
      id: 'bm-ih-2',
      groupId: 'group-in-house',
      content: 'Please note that the pool area will be closed for cleaning between 2:00 PM and 4:00 PM today.',
      senderName: 'SARAH SIM',
      sentAt: new Date('2026-03-10T12:30:00'),
      recipientCount: 7,
      recipients: [
        { guestId: 'guest-emily', status: 'delivered' },
        { guestId: 'guest-olivia', status: 'failed' },
        { guestId: 'guest-priya', status: 'pending-rtc' },
        { guestId: 'guest-fatima', status: 'delivered' },
        { guestId: 'guest-hiroshi', status: 'read' },
        { guestId: 'guest-victor', status: 'blocked-high-rate-country' },
        { guestId: 'guest-leila', status: 'sent' },
      ],
      filterSnapshot: {
        type: 'saved',
        savedFilterName: 'Corporate Guests',
        criteria: {
          loyaltyTiers: [],
          rateCodes: ['CORP'],
          groupCodes: [],
          roomNumbers: [],
          lengthOfStay: null,
          guestRecurrence: null,
        },
        attributeCount: 1,
      },
    },
  ],
  'group-departures': [
    {
      id: 'bm-dep-1',
      groupId: 'group-departures',
      content: 'We hope you enjoyed your stay! Please remember to check out by 11:00 AM. If you need a late checkout, please contact the front desk.',
      senderName: 'THERESA WEBB',
      sentAt: new Date('2026-03-11T07:30:00'),
      recipientCount: 12,
      recipients: [
        { guestId: 'guest-diana', status: 'delivered' },
        { guestId: 'guest-marco', status: 'delivered' },
        { guestId: 'guest-kwame', status: 'failed' },
        { guestId: 'guest-carmen', status: 'delivered' },
        { guestId: 'guest-rafael', status: 'delivered' },
        { guestId: 'guest-javier', status: 'delivered' },
        { guestId: 'guest-kenji', status: 'not-sent' },
        { guestId: 'guest-raj', status: 'delivered' },
        { guestId: 'guest-nook', status: 'read' },
        { guestId: 'guest-anya', status: 'delivered' },
        { guestId: 'guest-sophie-t', status: 'delivered' },
        { guestId: 'guest-ines', status: 'delivered' },
      ],
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
      recipients: [
        { guestId: 'guest-emily', status: 'read' },
        { guestId: 'guest-brooklyn', status: 'delivered' },
        { guestId: 'guest-raj', status: 'delivered' },
      ],
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
      recipients: [
        { guestId: 'guest-olivia', status: 'delivered' },
        { guestId: 'guest-liam', status: 'read' },
      ],
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
      recipients: [
        { guestId: 'guest-gel', status: 'delivered' },
        { guestId: 'guest-jack', status: 'delivered' },
        { guestId: 'guest-nook', status: 'sent' },
        { guestId: 'guest-noah', status: 'delivered' },
      ],
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
      recipients: [
        { guestId: 'guest-kristin', status: 'delivered' },
      ],
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
      recipients: [
        { guestId: 'guest-sofia', status: 'delivered' },
      ],
    },
  ],
};

// ===== Scheduled Broadcasts =====
// Queued sends live only on CUSTOM groups (production gates the whole affordance
// on `!isBuiltInBroadcastFolder`). Seeded relative to "now" so the demo always
// reads as a future send ("Scheduled for Today, ...") rather than a stale date.

const inHours = (h: number): Date => new Date(Date.now() + h * 60 * 60 * 1000);

export const mockScheduledBroadcasts: ScheduledBroadcast[] = [
  {
    id: 'sgb-corp-1',
    groupId: 'group-corporate',
    body: 'Reminder: the closing dinner starts at 7 PM in the Terrace Room. Dress code is smart casual.',
    senderName: 'THERESA WEBB',
    sendAt: inHours(3),
    createdAt: new Date(),
  },
];
