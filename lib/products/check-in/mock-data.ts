/**
 * Check-In Mock Data
 *
 * Sample check-in submissions and arrivals for the dashboard.
 */

import { CheckInSubmission, Arrival } from './types';

/**
 * Check-in submissions (left pane list)
 * These are guests who have submitted their check-in forms
 */
export const checkInSubmissions: CheckInSubmission[] = [
  // Completed submissions
  {
    id: 'sub-emily',
    reservationId: 'res-emily-jul',
    guestId: 'guest-emily',
    status: 'completed',
    arrivalTime: '3:00 PM',
    submittedAt: new Date('2024-10-31T10:30:00'),
    needsVerification: false,
    hasMobileKey: true,
  },
  {
    id: 'sub-brooklyn',
    reservationId: 'res-brooklyn-nov',
    guestId: 'guest-brooklyn',
    status: 'completed',
    arrivalTime: '2:00 PM',
    submittedAt: new Date('2024-10-31T09:15:00'),
    needsVerification: false,
    hasMobileKey: true,
  },
  {
    id: 'sub-olivia',
    reservationId: 'res-olivia-nov',
    guestId: 'guest-olivia',
    status: 'completed',
    arrivalTime: '4:30 PM',
    submittedAt: new Date('2024-10-31T11:00:00'),
    needsVerification: false,
    hasMobileKey: false,
  },
  {
    id: 'sub-noah',
    reservationId: 'res-noah-nov',
    guestId: 'guest-noah',
    status: 'completed',
    arrivalTime: '1:00 PM',
    submittedAt: new Date('2024-10-30T16:45:00'),
    needsVerification: false,
    hasMobileKey: true,
  },
  // Pending submissions (need verification)
  {
    id: 'sub-miguel',
    reservationId: 'res-miguel-nov',
    guestId: 'guest-miguel',
    status: 'pending',
    arrivalTime: '3:30 PM',
    submittedAt: new Date('2024-10-31T12:00:00'),
    needsVerification: true,
    hasMobileKey: false,
  },
  {
    id: 'sub-marco',
    reservationId: 'res-marco-nov',
    guestId: 'guest-marco',
    status: 'pending',
    arrivalTime: '5:00 PM',
    submittedAt: new Date('2024-10-31T14:30:00'),
    needsVerification: true,
    hasMobileKey: false,
  },
  {
    id: 'sub-kristin',
    reservationId: 'res-kristin-nov',
    guestId: 'guest-kristin',
    status: 'pending',
    arrivalTime: '2:30 PM',
    submittedAt: new Date('2024-10-31T08:00:00'),
    needsVerification: false,
    hasMobileKey: false,
  },
  {
    id: 'sub-liam',
    reservationId: 'res-liam-nov',
    guestId: 'guest-liam',
    status: 'pending',
    arrivalTime: '6:00 PM',
    submittedAt: new Date('2024-10-31T15:30:00'),
    needsVerification: true,
    hasMobileKey: false,
  },
];

/**
 * Arrivals (right pane grid)
 * These are guests expected to arrive today or in the future
 */
export const arrivals: Arrival[] = [
  // Expected today
  {
    id: 'arr-emily',
    reservationId: 'res-emily-jul',
    guestId: 'guest-emily',
    arrivalStatus: 'expected',
    arrivalTime: '3:00 PM',
  },
  {
    id: 'arr-brooklyn',
    reservationId: 'res-brooklyn-nov',
    guestId: 'guest-brooklyn',
    arrivalStatus: 'expected',
    arrivalTime: '2:00 PM',
  },
  {
    id: 'arr-miguel',
    reservationId: 'res-miguel-nov',
    guestId: 'guest-miguel',
    arrivalStatus: 'expected',
    arrivalTime: '3:30 PM',
  },
  {
    id: 'arr-kristin',
    reservationId: 'res-kristin-nov',
    guestId: 'guest-kristin',
    arrivalStatus: 'expected',
    arrivalTime: '2:30 PM',
  },
  // Future arrivals
  {
    id: 'arr-marco',
    reservationId: 'res-marco-nov',
    guestId: 'guest-marco',
    arrivalStatus: 'future',
    arrivalTime: '5:00 PM',
  },
  {
    id: 'arr-liam',
    reservationId: 'res-liam-nov',
    guestId: 'guest-liam',
    arrivalStatus: 'future',
    arrivalTime: '6:00 PM',
  },
  // Already checked in today
  {
    id: 'arr-olivia',
    reservationId: 'res-olivia-nov',
    guestId: 'guest-olivia',
    arrivalStatus: 'checked-in',
    arrivalTime: '4:30 PM',
    checkInTime: '4:15 PM',
  },
  {
    id: 'arr-noah',
    reservationId: 'res-noah-nov',
    guestId: 'guest-noah',
    arrivalStatus: 'checked-in',
    arrivalTime: '1:00 PM',
    checkInTime: '12:45 PM',
  },
  {
    id: 'arr-emma',
    reservationId: 'res-emma-nov',
    guestId: 'guest-emma',
    arrivalStatus: 'checked-in',
    arrivalTime: '11:00 AM',
    checkInTime: '11:30 AM',
  },
];

/**
 * Get submissions by status
 */
export function getSubmissionsByStatus(status: 'pending' | 'completed'): CheckInSubmission[] {
  return checkInSubmissions.filter(s => s.status === status);
}

/**
 * Get arrivals by status
 */
export function getArrivalsByStatus(status: 'expected' | 'future' | 'checked-in'): Arrival[] {
  return arrivals.filter(a => a.arrivalStatus === status);
}
