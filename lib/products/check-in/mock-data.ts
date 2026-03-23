/**
 * Check-In Mock Data
 *
 * ~20 submissions across 5 statuses, unified data model.
 * Each guest appears exactly ONCE — no duplicates across statuses.
 *
 * Left pane: pending, partially_submitted, submitted
 * Right pane: verified, checked_in
 */

import { CheckInSubmission, UpsellItem, GuestNote, AdditionalGuest, DEMO_TODAY } from './types';

/**
 * All check-in submissions — single source of truth for both panes.
 *
 * Status distribution:
 *   submitted (7)           → Left pane: "Completed submissions"
 *   partially_submitted (3) → Left pane: "Partial submissions"
 *   pending (9)             → Left pane: "Pending"
 *   verified (7)            → Right pane: "Expected today" (6) + "Future" (1)
 *   checked_in (7)          → Right pane: "Checked-in today"
 */
export const checkInSubmissions: CheckInSubmission[] = [
  // ── Submitted (completed form, awaiting verification) ──────────────
  {
    id: 'sub-emily',
    reservationId: 'res-emily-mar',
    guestId: 'guest-emily',
    status: 'submitted',
    arrivalTime: '3:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T10:30:00'),
    hasMobileKey: true,
    additionalGuests: [
      { id: 'addl-emily-1', name: 'David Smith', isAdult: true, verificationStatus: 'verified' },
    ],
  },
  {
    id: 'sub-brooklyn',
    reservationId: 'res-brooklyn-mar',
    guestId: 'guest-brooklyn',
    status: 'submitted',
    arrivalTime: '2:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T09:15:00'),
    hasMobileKey: true,
  },
  {
    id: 'sub-sarah',
    reservationId: 'res-sarah-checkin',
    guestId: 'guest-sarah',
    status: 'submitted',
    arrivalTime: '4:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T14:00:00'),
    hasMobileKey: false,
    isFlagged: true,
  },
  {
    id: 'sub-james',
    reservationId: 'res-james-checkin',
    guestId: 'guest-james',
    status: 'submitted',
    arrivalTime: '1:30 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T16:45:00'),
    hasMobileKey: false,
  },

  {
    id: 'sub-carlos',
    reservationId: 'res-carlos-mar',
    guestId: 'guest-carlos',
    status: 'submitted',
    arrivalTime: '2:30 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T11:00:00'),
    hasMobileKey: true,
    additionalGuests: [
      { id: 'addl-carlos-1', name: 'Maria Rivera', isAdult: true, verificationStatus: 'verified' },
      { id: 'addl-carlos-2', name: 'Lucas Rivera', isAdult: false, verificationStatus: 'pending' },
      { id: 'addl-carlos-3', name: 'Sofia Rivera', isAdult: false, verificationStatus: 'pending' },
    ],
  },
  {
    id: 'sub-nina',
    reservationId: 'res-nina-mar',
    guestId: 'guest-nina',
    status: 'submitted',
    arrivalTime: '5:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T13:30:00'),
    hasMobileKey: false,
  },
  {
    id: 'sub-chloe',
    reservationId: 'res-chloe-nov',
    guestId: 'guest-chloe',
    status: 'submitted',
    arrivalTime: '11:00 AM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T08:45:00'),
    hasMobileKey: true,
    isFlagged: true,
  },

  // ── Partially submitted ────────────────────────────────────────────
  {
    id: 'sub-miguel',
    reservationId: 'res-miguel-nov',
    guestId: 'guest-miguel',
    status: 'partially_submitted',
    arrivalTime: '3:30 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T12:00:00'),
    hasMobileKey: false,
  },
  {
    id: 'sub-mei',
    reservationId: 'res-mei-mar',
    guestId: 'guest-mei',
    status: 'partially_submitted',
    arrivalTime: '4:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T14:15:00'),
    hasMobileKey: false,
  },
  {
    id: 'sub-rachel',
    reservationId: 'res-rachel-nov',
    guestId: 'guest-rachel',
    status: 'partially_submitted',
    arrivalTime: '1:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T10:00:00'),
    hasMobileKey: true,
  },

  // ── Pending (form not yet started — no avatars, no IDs) ────────────
  {
    id: 'sub-marco',
    reservationId: 'res-marco-mar',
    guestId: 'guest-marco',
    status: 'pending',
    arrivalDate: '2026-03-20',
  },
  {
    id: 'sub-kristin',
    reservationId: 'res-kristin-mar',
    guestId: 'guest-kristin',
    status: 'pending',
    arrivalDate: '2026-03-17',
  },
  {
    id: 'sub-liam',
    reservationId: 'res-liam-mar',
    guestId: 'guest-liam',
    status: 'pending',
    arrivalDate: '2026-03-17',
  },
  {
    id: 'sub-maria',
    reservationId: 'res-maria-checkin',
    guestId: 'guest-maria',
    status: 'pending',
    arrivalDate: '2026-03-17',
  },
  {
    id: 'sub-robert',
    reservationId: 'res-robert-checkin',
    guestId: 'guest-robert',
    status: 'pending',
    arrivalDate: DEMO_TODAY,
  },
  {
    id: 'sub-emma',
    reservationId: 'res-emma-mar',
    guestId: 'guest-emma',
    status: 'pending',
    arrivalDate: '2026-03-17',
  },
  {
    id: 'sub-omar',
    reservationId: 'res-omar-nov',
    guestId: 'guest-omar',
    status: 'pending',
    arrivalDate: '2026-03-17',
  },
  {
    id: 'sub-thomas-k',
    reservationId: 'res-thomas-k-nov',
    guestId: 'guest-thomas-k',
    status: 'pending',
    arrivalDate: '2026-03-17',
  },
  {
    id: 'sub-fatima',
    reservationId: 'res-fatima-mar',
    guestId: 'guest-fatima',
    status: 'pending',
    arrivalDate: DEMO_TODAY,
  },

  // ── Verified (right pane — expected today / future) ────────────────
  {
    id: 'sub-olivia',
    reservationId: 'res-olivia-mar',
    guestId: 'guest-olivia',
    status: 'verified',
    arrivalTime: '4:30 PM',
    arrivalDate: DEMO_TODAY,
    additionalGuests: [
      { id: 'addl-olivia-1', name: 'Marcus Brown', isAdult: true, verificationStatus: 'verified' },
      { id: 'addl-olivia-2', name: 'Ava Brown', isAdult: false, verificationStatus: 'verified' },
    ],
    submittedAt: new Date('2026-03-14T11:00:00'),
    hasMobileKey: true,
  },
  {
    id: 'sub-noah',
    reservationId: 'res-noah-mar',
    guestId: 'guest-noah',
    status: 'verified',
    arrivalTime: '1:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-14T16:45:00'),
    hasMobileKey: true,
    isFlagged: true,
  },
  {
    id: 'sub-sophia',
    reservationId: 'res-sophia-nov',
    guestId: 'guest-sophia',
    status: 'verified',
    arrivalTime: '6:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T15:30:00'),
    hasMobileKey: false,
  },
  {
    id: 'sub-daniel',
    reservationId: 'res-daniel-nov',
    guestId: 'guest-daniel',
    status: 'verified',
    arrivalTime: '11:00 AM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T09:00:00'),
    hasMobileKey: false,
    isFlagged: true,
  },
  {
    id: 'sub-isabella',
    reservationId: 'res-isabella-nov',
    guestId: 'guest-isabella',
    status: 'verified',
    arrivalTime: '2:00 PM',
    arrivalDate: '2026-03-17',
    submittedAt: new Date('2026-03-15T10:00:00'),
    hasMobileKey: false,
  },
  {
    id: 'sub-zara',
    reservationId: 'res-zara-nov',
    guestId: 'guest-zara',
    status: 'verified',
    arrivalTime: '3:30 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T11:30:00'),
    hasMobileKey: true,
  },
  {
    id: 'sub-amara',
    reservationId: 'res-amara-nov',
    guestId: 'guest-amara',
    status: 'verified',
    arrivalTime: '5:30 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2026-03-15T13:00:00'),
    hasMobileKey: false,
    isFlagged: true,
  },

  // ── Checked in ─────────────────────────────────────────────────────
  {
    id: 'sub-hannah',
    reservationId: 'res-hannah-nov',
    guestId: 'guest-hannah',
    status: 'checked_in',
    arrivalTime: '3:00 PM',
    arrivalDate: DEMO_TODAY,
    additionalGuests: [
      { id: 'addl-hannah-1', name: 'Ethan Park', isAdult: true, verificationStatus: 'verified' },
    ],
    checkInTime: '2:45 PM',
    hasMobileKey: true,
  },
  {
    id: 'sub-tyler',
    reservationId: 'res-tyler-nov',
    guestId: 'guest-tyler',
    status: 'checked_in',
    arrivalTime: '2:00 PM',
    arrivalDate: DEMO_TODAY,
    checkInTime: '1:50 PM',
    hasMobileKey: true,
  },
  {
    id: 'sub-aisha',
    reservationId: 'res-aisha-nov',
    guestId: 'guest-aisha',
    status: 'checked_in',
    arrivalTime: '1:30 PM',
    arrivalDate: DEMO_TODAY,
    checkInTime: '1:15 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-william',
    reservationId: 'res-william-nov',
    guestId: 'guest-william',
    status: 'checked_in',
    arrivalTime: '2:30 PM',
    arrivalDate: DEMO_TODAY,
    checkInTime: '2:20 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-priya',
    reservationId: 'res-priya-mar',
    guestId: 'guest-priya',
    status: 'checked_in',
    arrivalTime: '12:00 PM',
    arrivalDate: DEMO_TODAY,
    checkInTime: '11:50 AM',
    hasMobileKey: true,
  },
  {
    id: 'sub-yuki',
    reservationId: 'res-yuki-mar',
    guestId: 'guest-yuki',
    status: 'checked_in',
    arrivalTime: '1:00 PM',
    arrivalDate: DEMO_TODAY,
    checkInTime: '12:55 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-victor',
    reservationId: 'res-victor-mar',
    guestId: 'guest-victor',
    status: 'checked_in',
    arrivalTime: '3:00 PM',
    arrivalDate: DEMO_TODAY,
    checkInTime: '2:50 PM',
    hasMobileKey: true,
  },

  // ── Checked-in entries for checkout guests (must check in before checking out) ──

  // Pending checkout guests (9)
  {
    id: 'sub-raj',
    reservationId: 'res-raj-mar',
    guestId: 'guest-raj',
    status: 'checked_in',
    arrivalTime: '3:00 PM',
    arrivalDate: '2026-03-09',
    checkInTime: '2:55 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-nook',
    reservationId: 'res-nook-mar',
    guestId: 'guest-nook',
    status: 'checked_in',
    arrivalTime: '2:00 PM',
    arrivalDate: '2026-03-11',
    checkInTime: '1:50 PM',
    hasMobileKey: true,
  },
  {
    id: 'sub-anya',
    reservationId: 'res-anya-mar',
    guestId: 'guest-anya',
    status: 'checked_in',
    arrivalTime: '4:00 PM',
    arrivalDate: '2026-03-09',
    checkInTime: '3:45 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-sophie-t',
    reservationId: 'res-sophie-t-mar',
    guestId: 'guest-sophie-t',
    status: 'checked_in',
    arrivalTime: '1:30 PM',
    arrivalDate: '2026-03-10',
    checkInTime: '1:25 PM',
    hasMobileKey: true,
  },
  {
    id: 'sub-ines',
    reservationId: 'res-ines-mar',
    guestId: 'guest-ines',
    status: 'checked_in',
    arrivalTime: '3:30 PM',
    arrivalDate: '2026-03-11',
    checkInTime: '3:20 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-leila',
    reservationId: 'res-leila-mar',
    guestId: 'guest-leila',
    status: 'checked_in',
    arrivalTime: '2:30 PM',
    arrivalDate: '2026-03-08',
    checkInTime: '2:25 PM',
    hasMobileKey: true,
  },
  {
    id: 'sub-lucas',
    reservationId: 'res-lucas-mar',
    guestId: 'guest-lucas',
    status: 'checked_in',
    arrivalTime: '5:00 PM',
    arrivalDate: '2026-03-11',
    checkInTime: '4:50 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-kofi',
    reservationId: 'res-kofi-mar',
    guestId: 'guest-kofi',
    status: 'checked_in',
    arrivalTime: '1:00 PM',
    arrivalDate: '2026-03-09',
    checkInTime: '12:55 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-dmitri',
    reservationId: 'res-dmitri-mar',
    guestId: 'guest-dmitri',
    status: 'checked_in',
    arrivalTime: '4:30 PM',
    arrivalDate: '2026-03-08',
    checkInTime: '4:20 PM',
    hasMobileKey: false,
  },

  // Processed checkout guests (5)
  {
    id: 'sub-diana',
    reservationId: 'res-diana-mar',
    guestId: 'guest-diana',
    status: 'checked_in',
    arrivalTime: '2:00 PM',
    arrivalDate: '2026-03-08',
    checkInTime: '1:55 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-chen',
    reservationId: 'res-chen-mar',
    guestId: 'guest-chen',
    status: 'checked_in',
    arrivalTime: '3:00 PM',
    arrivalDate: '2026-03-08',
    checkInTime: '2:50 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-rafael',
    reservationId: 'res-rafael-mar',
    guestId: 'guest-rafael',
    status: 'checked_in',
    arrivalTime: '1:30 PM',
    arrivalDate: '2026-03-07',
    checkInTime: '1:20 PM',
    hasMobileKey: true,
  },
  {
    id: 'sub-javier',
    reservationId: 'res-javier-mar',
    guestId: 'guest-javier',
    status: 'checked_in',
    arrivalTime: '4:00 PM',
    arrivalDate: '2026-03-09',
    checkInTime: '3:55 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-kenji',
    reservationId: 'res-kenji-mar',
    guestId: 'guest-kenji',
    status: 'checked_in',
    arrivalTime: '2:30 PM',
    arrivalDate: '2026-03-08',
    checkInTime: '2:20 PM',
    hasMobileKey: true,
  },

  // Archived checkout guests (2)
  {
    id: 'sub-kwame',
    reservationId: 'res-kwame-mar',
    guestId: 'guest-kwame',
    status: 'checked_in',
    arrivalTime: '3:00 PM',
    arrivalDate: '2026-03-08',
    checkInTime: '2:55 PM',
    hasMobileKey: false,
  },
  {
    id: 'sub-carmen',
    reservationId: 'res-carmen-mar',
    guestId: 'guest-carmen',
    status: 'checked_in',
    arrivalTime: '1:00 PM',
    arrivalDate: '2026-03-08',
    checkInTime: '12:50 PM',
    hasMobileKey: true,
  },
];

/**
 * Upsell requests per submission.
 * Most submissions have no upsells — only a few do.
 */
export const submissionUpsells: Record<string, UpsellItem[]> = {
  'sub-emily': [
    { id: 'up-1', name: 'Early check-in (1PM)', quantity: 1, unitPrice: 30, status: 'pending' },
    { id: 'up-2', name: 'Jacuzzi Pinot Noir 2015', quantity: 1, unitPrice: 40, status: 'pending' },
  ],
  'sub-brooklyn': [
    { id: 'up-3', name: 'Late checkout (2PM)', quantity: 1, unitPrice: 50, status: 'pending' },
    { id: 'up-4', name: 'Champagne & Strawberries', quantity: 1, unitPrice: 65, status: 'pending' },
  ],
  'sub-olivia': [
    { id: 'up-5', name: 'Late checkout (2PM)', quantity: 1, unitPrice: 50, status: 'approved' },
    { id: 'up-7', name: 'Champagne & Strawberries', quantity: 1, unitPrice: 65, status: 'approved' },
  ],
  'sub-james': [
    { id: 'up-6', name: 'Airport shuttle', quantity: 1, unitPrice: 45, status: 'pending' },
    { id: 'up-8', name: 'Early check-in (1PM)', quantity: 1, unitPrice: 30, status: 'pending' },
  ],
  'sub-robert': [
    { id: 'up-9', name: 'Late checkout (2PM)', quantity: 1, unitPrice: 50, status: 'pending' },
  ],
  'sub-kristin': [
    { id: 'up-10', name: 'Champagne & Strawberries', quantity: 1, unitPrice: 65, status: 'pending' },
    { id: 'up-11', name: 'Early check-in (1PM)', quantity: 1, unitPrice: 30, status: 'pending' },
  ],
  'sub-carlos': [
    { id: 'up-12', name: 'Airport shuttle', quantity: 2, unitPrice: 45, status: 'pending' },
  ],
  'sub-zara': [
    { id: 'up-13', name: 'Late checkout (2PM)', quantity: 1, unitPrice: 50, status: 'approved' },
    { id: 'up-14', name: 'Spa access', quantity: 2, unitPrice: 75, status: 'pending' },
  ],
  'sub-nina': [
    { id: 'up-15', name: 'Early check-in (1PM)', quantity: 1, unitPrice: 30, status: 'pending' },
  ],
};

/**
 * Notes per submission.
 * Mix of staff notes and guest special requests.
 */
export const submissionNotes: Record<string, GuestNote[]> = {
  'sub-emily': [
    { id: 'note-1', text: 'Guest is celebrating anniversary, comp champagne if available', type: 'staff', author: 'Theresa Webb', createdAt: new Date('2026-03-15T09:15:00') },
    { id: 'note-2', text: 'I\'d like a slice of pie hot and ready upon my arrival', type: 'guest_request', author: 'Emily Smith', createdAt: new Date('2026-03-14T14:30:00') },
  ],
  'sub-brooklyn': [
    { id: 'note-3', text: 'Returning guest — prefers high floor, noted in profile', type: 'staff', author: 'Theresa Webb', createdAt: new Date('2026-03-15T08:00:00') },
  ],
  'sub-olivia': [
    { id: 'note-4', text: 'Would love extra pillows and a quiet room away from the elevator please', type: 'guest_request', author: 'Olivia Brown-Henderson', createdAt: new Date('2026-03-14T11:00:00') },
    { id: 'note-5', text: 'Assigned room 412 per request — corner suite, away from elevator', type: 'staff', author: 'Theresa Webb', createdAt: new Date('2026-03-15T10:30:00') },
  ],
  'sub-noah': [
    { id: 'note-6', text: 'Guest has mobility concerns, ground floor preferred', type: 'staff', author: 'James Rodriguez', createdAt: new Date('2026-03-14T16:00:00') },
  ],
  'sub-sarah': [
    { id: 'note-7', text: 'Can we have a late checkout on Sunday? Our flight is at 8pm', type: 'guest_request', author: 'Sarah Martinez', createdAt: new Date('2026-03-14T15:00:00') },
  ],
  'sub-carlos': [
    { id: 'note-8', text: 'Traveling with two children, connecting rooms if possible', type: 'guest_request', author: 'Carlos Rivera', createdAt: new Date('2026-03-14T11:30:00') },
  ],
  'sub-zara': [
    { id: 'note-9', text: 'VIP guest — CEO of partner company, ensure premium experience', type: 'staff', author: 'James Rodriguez', createdAt: new Date('2026-03-15T07:45:00') },
    { id: 'note-10', text: 'Would appreciate fresh flowers in the room', type: 'guest_request', author: 'Zara Khan', createdAt: new Date('2026-03-14T12:00:00') },
  ],
  'sub-amara': [
    { id: 'note-11', text: 'Guest mentioned dietary restrictions — gluten-free options needed for breakfast', type: 'staff', author: 'Theresa Webb', createdAt: new Date('2026-03-15T09:00:00') },
  ],
};
