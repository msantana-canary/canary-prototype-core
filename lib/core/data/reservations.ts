/**
 * Canonical Reservation Data
 *
 * Links guests to rooms for specific stays.
 * Used across Check-in, Checkout, Messaging, Upsells, etc.
 */

import { Reservation } from '../types/reservation';

export const reservations: Record<string, Reservation> = {
  'res-emily-jul': {
    id: 'res-emily-jul',
    guestId: 'guest-emily',
    room: '153',
    checkInDate: 'Jul. 13, 2024',
    checkOutDate: 'Jul. 15, 2024',
    confirmationCode: 'ECzSBOwbMRyyYPY',
    status: 'checked-in',
    checkInStatus: 'Submitted',
    checkOutStatus: 'Submitted',
    requestCount: 1,
  },
  'res-miguel-nov': {
    id: 'res-miguel-nov',
    guestId: 'guest-miguel',
    room: '206',
    checkInDate: 'Nov. 18, 2024',
    checkOutDate: 'Nov. 20, 2024',
    confirmationCode: 'MS8K3NPRWX',
    status: 'checked-in',
    checkInStatus: 'Completed',
    checkOutStatus: 'Not Started',
  },
  'res-brooklyn-nov': {
    id: 'res-brooklyn-nov',
    guestId: 'guest-brooklyn',
    room: '130',
    checkInDate: 'Nov. 17, 2024',
    checkOutDate: 'Nov. 21, 2024',
    confirmationCode: 'BS4L7MQRST',
    status: 'checked-in',
    checkInStatus: 'Completed',
    checkOutStatus: 'Not Started',
  },
  'res-marco-nov': {
    id: 'res-marco-nov',
    guestId: 'guest-marco',
    room: '112 (reserved)',
    checkInDate: 'Nov. 22, 2024',
    checkOutDate: 'Nov. 25, 2024',
    confirmationCode: 'MB2P9KLMNO',
    status: 'upcoming',
    checkInStatus: 'Not Started',
    checkOutStatus: 'Not Started',
    requestCount: 1,
  },
  'res-kristin-nov': {
    id: 'res-kristin-nov',
    guestId: 'guest-kristin',
    room: '130',
    checkInDate: 'Nov. 19, 2024',
    checkOutDate: 'Nov. 22, 2024',
    confirmationCode: 'KW6H3NPQRS',
    status: 'checked-in',
    checkInStatus: 'Completed',
    checkOutStatus: 'Not Started',
    requestCount: 1,
  },
  'res-liam-nov': {
    id: 'res-liam-nov',
    guestId: 'guest-liam',
    checkInDate: 'Nov. 19, 2024',
    checkOutDate: 'Nov. 21, 2024',
    confirmationCode: 'LJ5D8WXYZ',
    status: 'checked-in',
    checkInStatus: 'In Progress',
    checkOutStatus: 'Not Started',
  },
  'res-olivia-nov': {
    id: 'res-olivia-nov',
    guestId: 'guest-olivia',
    room: '204',
    checkInDate: 'Nov. 18, 2024',
    checkOutDate: 'Nov. 23, 2024',
    confirmationCode: 'OB7K4MNPQR',
    status: 'checked-in',
    checkInStatus: 'Completed',
    checkOutStatus: 'Not Started',
    requestCount: 1,
  },
  'res-noah-nov': {
    id: 'res-noah-nov',
    guestId: 'guest-noah',
    room: '415',
    checkInDate: 'Nov. 17, 2024',
    checkOutDate: 'Nov. 20, 2024',
    confirmationCode: 'ND3B9STUV',
    status: 'checked-in',
    checkInStatus: 'Completed',
    checkOutStatus: 'Not Started',
  },
  'res-emma-nov': {
    id: 'res-emma-nov',
    guestId: 'guest-emma',
    checkInDate: 'Nov. 19, 2024',
    checkOutDate: 'Nov. 22, 2024',
    confirmationCode: 'EW4C6KLMN',
    status: 'checked-in',
    checkInStatus: 'In Progress',
    checkOutStatus: 'Not Started',
  },
  // Completed stays (for archived conversations)
  'res-sarah-nov': {
    id: 'res-sarah-nov',
    guestId: 'guest-sarah',
    room: '302',
    checkInDate: 'Nov. 12, 2024',
    checkOutDate: 'Nov. 15, 2024',
    confirmationCode: 'SMX9K2LPQR',
    status: 'checked-out',
    checkInStatus: 'Completed',
    checkOutStatus: 'Completed',
  },
  'res-james-nov': {
    id: 'res-james-nov',
    guestId: 'guest-james',
    room: '418',
    checkInDate: 'Nov. 13, 2024',
    checkOutDate: 'Nov. 14, 2024',
    confirmationCode: 'JC7H4MNPST',
    status: 'checked-out',
    checkInStatus: 'Completed',
    checkOutStatus: 'Completed',
  },
  'res-maria-nov': {
    id: 'res-maria-nov',
    guestId: 'guest-maria',
    room: '225',
    checkInDate: 'Nov. 10, 2024',
    checkOutDate: 'Nov. 13, 2024',
    confirmationCode: 'MG3B8WXYZ',
    status: 'checked-out',
    checkInStatus: 'Completed',
    checkOutStatus: 'Completed',
  },
  'res-robert-nov': {
    id: 'res-robert-nov',
    guestId: 'guest-robert',
    room: '512',
    checkInDate: 'Nov. 8, 2024',
    checkOutDate: 'Nov. 12, 2024',
    confirmationCode: 'RT5D9KLMNO',
    status: 'checked-out',
    checkInStatus: 'Completed',
    checkOutStatus: 'Completed',
    requestCount: 2,
  },
};

/**
 * Get all reservations as an array
 */
export const reservationList = Object.values(reservations);

/**
 * Get a reservation by ID
 */
export function getReservation(id: string): Reservation | undefined {
  return reservations[id];
}

/**
 * Get all reservations for a guest
 */
export function getGuestReservations(guestId: string): Reservation[] {
  return reservationList.filter(res => res.guestId === guestId);
}
