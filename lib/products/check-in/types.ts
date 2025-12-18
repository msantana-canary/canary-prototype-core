/**
 * Check-In Types
 *
 * Types specific to the check-in product dashboard.
 */

export type SubmissionStatus = 'pending' | 'completed';

export type ArrivalStatus = 'expected' | 'future' | 'checked-in';

/**
 * Check-in submission record for the left pane list
 */
export interface CheckInSubmission {
  id: string;
  reservationId: string;
  guestId: string;
  status: SubmissionStatus;
  arrivalTime?: string;      // e.g., "2:00 PM"
  submittedAt?: Date;        // When form was submitted
  needsVerification?: boolean;
  hasMobileKey?: boolean;
}

/**
 * Arrival record for the right pane grid
 */
export interface Arrival {
  id: string;
  reservationId: string;
  guestId: string;
  arrivalStatus: ArrivalStatus;
  arrivalTime?: string;
  checkInTime?: string;      // Time when checked in
}

/**
 * Loyalty tier colors
 */
export const loyaltyColors: Record<string, { background: string; border: string; text: string }> = {
  'GOLD': { background: '#ffe4b3', border: '#d4a500', text: '#8B6914' },
  'GOLD ELITE': { background: '#ffe4b3', border: '#d4a500', text: '#8B6914' },
  'DIAMOND': { background: '#e6f0ff', border: '#2858c4', text: '#2858c4' },
  'DIAMOND ELITE': { background: '#000000', border: '#000000', text: '#FFFFFF' },
  'SILVER': { background: '#e6e6e6', border: '#8c8c8c', text: '#666666' },
  'SILVER ELITE': { background: '#e6e6e6', border: '#8c8c8c', text: '#666666' },
  'PLATINUM': { background: '#E2E7EA', border: '#3C5D71', text: '#3C5D71' },
  'PLATINUM ELITE': { background: '#E2E7EA', border: '#3C5D71', text: '#3C5D71' },
  'CLUB MEMBER': { background: '#e8f0f3', border: '#607985', text: '#607985' },
};
