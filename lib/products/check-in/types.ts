/**
 * Check-In Types
 *
 * Types specific to the check-in product dashboard.
 * 5 submission statuses matching production.
 */

export type SubmissionStatus =
  | 'pending'
  | 'partially_submitted'
  | 'submitted'        // "Completed submissions" in left pane
  | 'verified'         // Moves to right pane ("Expected today" / "Future")
  | 'checked_in';

export interface CheckInSubmission {
  id: string;
  reservationId: string;
  guestId: string;
  status: SubmissionStatus;
  arrivalTime?: string;        // e.g., "2:30 PM"
  arrivalDate: string;         // ISO: "2024-11-18"
  submittedAt?: Date;
  hasMobileKey?: boolean;
  isFlagged?: boolean;         // Red flag icon next to room
  isArchived?: boolean;        // Goes to "Other" section
  checkInTime?: string;        // For checked-in: "4:15 PM"
  additionalGuests?: AdditionalGuest[];
  // Tabled fields (keep for future):
  isWalkIn?: boolean;
  isTabletRegistration?: boolean;
  isNewRegistration?: boolean;
}

/**
 * Demo date constant — all date comparisons use this
 * so the prototype looks correct regardless of when it runs.
 */
export const DEMO_TODAY = '2026-03-16';

export interface UpsellItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  status: 'pending' | 'approved' | 'denied';
}

export interface AdditionalGuest {
  id: string;
  name: string;
  isAdult: boolean;
  verificationStatus: 'verified' | 'pending';
}

export interface GuestNote {
  id: string;
  text: string;
  type: 'staff' | 'guest_request';
  author: string;              // Staff name or guest name
  createdAt: Date;
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
