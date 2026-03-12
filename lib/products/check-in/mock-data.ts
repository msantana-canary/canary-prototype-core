/**
 * Check-In Mock Data
 *
 * ~20 submissions across 5 statuses, unified data model.
 * Each guest appears exactly ONCE — no duplicates across statuses.
 *
 * Left pane: pending, partially_submitted, submitted
 * Right pane: verified, checked_in
 */

import { CheckInSubmission, UpsellItem, GuestNote, DEMO_TODAY } from './types';

/**
 * All check-in submissions — single source of truth for both panes.
 *
 * Status distribution:
 *   submitted (4)           → Left pane: "Completed submissions"
 *   partially_submitted (1) → Left pane: "Partial submissions"
 *   pending (6)             → Left pane: "Pending"
 *   verified (5)            → Right pane: "Expected today" (4) + "Future" (1)
 *   checked_in (4)          → Right pane: "Checked-in today"
 */
export const checkInSubmissions: CheckInSubmission[] = [
  // ── Submitted (completed form, awaiting verification) ──────────────
  {
    id: 'sub-emily',
    reservationId: 'res-emily-jul',
    guestId: 'guest-emily',
    status: 'submitted',
    arrivalTime: '3:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2024-11-17T10:30:00'),
    hasMobileKey: true,
  },
  {
    id: 'sub-brooklyn',
    reservationId: 'res-brooklyn-nov',
    guestId: 'guest-brooklyn',
    status: 'submitted',
    arrivalTime: '2:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2024-11-17T09:15:00'),
    hasMobileKey: true,
  },
  {
    id: 'sub-sarah',
    reservationId: 'res-sarah-checkin',
    guestId: 'guest-sarah',
    status: 'submitted',
    arrivalTime: '4:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2024-11-17T14:00:00'),
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
    submittedAt: new Date('2024-11-17T16:45:00'),
    hasMobileKey: false,
  },

  // ── Partially submitted ────────────────────────────────────────────
  {
    id: 'sub-miguel',
    reservationId: 'res-miguel-nov',
    guestId: 'guest-miguel',
    status: 'partially_submitted',
    arrivalTime: '3:30 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2024-11-17T12:00:00'),
    hasMobileKey: false,
  },

  // ── Pending (form not yet started — no avatars, no IDs) ────────────
  {
    id: 'sub-marco',
    reservationId: 'res-marco-nov',
    guestId: 'guest-marco',
    status: 'pending',
    arrivalDate: '2024-11-22',
  },
  {
    id: 'sub-kristin',
    reservationId: 'res-kristin-nov',
    guestId: 'guest-kristin',
    status: 'pending',
    arrivalDate: '2024-11-19',
  },
  {
    id: 'sub-liam',
    reservationId: 'res-liam-nov',
    guestId: 'guest-liam',
    status: 'pending',
    arrivalDate: '2024-11-19',
  },
  {
    id: 'sub-maria',
    reservationId: 'res-maria-checkin',
    guestId: 'guest-maria',
    status: 'pending',
    arrivalDate: '2024-11-19',
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
    reservationId: 'res-emma-nov',
    guestId: 'guest-emma',
    status: 'pending',
    arrivalDate: '2024-11-19',
  },

  // ── Verified (right pane — expected today / future) ────────────────
  {
    id: 'sub-olivia',
    reservationId: 'res-olivia-nov',
    guestId: 'guest-olivia',
    status: 'verified',
    arrivalTime: '4:30 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2024-11-16T11:00:00'),
    hasMobileKey: true,
  },
  {
    id: 'sub-noah',
    reservationId: 'res-noah-nov',
    guestId: 'guest-noah',
    status: 'verified',
    arrivalTime: '1:00 PM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2024-11-16T16:45:00'),
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
    submittedAt: new Date('2024-11-17T15:30:00'),
    hasMobileKey: false,
  },
  {
    id: 'sub-daniel',
    reservationId: 'res-daniel-nov',
    guestId: 'guest-daniel',
    status: 'verified',
    arrivalTime: '11:00 AM',
    arrivalDate: DEMO_TODAY,
    submittedAt: new Date('2024-11-17T09:00:00'),
    hasMobileKey: false,
    isFlagged: true,
  },
  {
    id: 'sub-isabella',
    reservationId: 'res-isabella-nov',
    guestId: 'guest-isabella',
    status: 'verified',
    arrivalTime: '2:00 PM',
    arrivalDate: '2024-11-19',
    submittedAt: new Date('2024-11-17T10:00:00'),
    hasMobileKey: false,
  },

  // ── Checked in ─────────────────────────────────────────────────────
  {
    id: 'sub-hannah',
    reservationId: 'res-hannah-nov',
    guestId: 'guest-hannah',
    status: 'checked_in',
    arrivalTime: '3:00 PM',
    arrivalDate: DEMO_TODAY,
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
};

/**
 * Notes per submission.
 * Mix of staff notes and guest special requests.
 */
export const submissionNotes: Record<string, GuestNote[]> = {
  'sub-emily': [
    { id: 'note-1', text: 'Guest is celebrating anniversary, comp champagne if available', type: 'staff', author: 'Theresa Webb', createdAt: new Date('2024-11-18T09:15:00') },
    { id: 'note-2', text: 'I\'d like a slice of pie hot and ready upon my arrival', type: 'guest_request', author: 'Emily Smith', createdAt: new Date('2024-11-17T14:30:00') },
  ],
  'sub-brooklyn': [
    { id: 'note-3', text: 'Returning guest — prefers high floor, noted in profile', type: 'staff', author: 'Theresa Webb', createdAt: new Date('2024-11-18T08:00:00') },
  ],
  'sub-olivia': [
    { id: 'note-4', text: 'Would love extra pillows and a quiet room away from the elevator please', type: 'guest_request', author: 'Olivia Brown-Henderson', createdAt: new Date('2024-11-17T11:00:00') },
    { id: 'note-5', text: 'Assigned room 412 per request — corner suite, away from elevator', type: 'staff', author: 'Theresa Webb', createdAt: new Date('2024-11-18T10:30:00') },
  ],
  'sub-noah': [
    { id: 'note-6', text: 'Guest has mobility concerns, ground floor preferred', type: 'staff', author: 'James Rodriguez', createdAt: new Date('2024-11-17T16:00:00') },
  ],
  'sub-sarah': [
    { id: 'note-7', text: 'Can we have a late checkout on Sunday? Our flight is at 8pm', type: 'guest_request', author: 'Sarah Martinez', createdAt: new Date('2024-11-17T15:00:00') },
  ],
};
