/**
 * Checkout Types
 *
 * Types specific to the checkout product dashboard.
 * 4 folders matching production: pending, submitted, processed, archived.
 */

// Re-export GuestNote from check-in so checkout consumers can import from one place
export type { GuestNote } from '../check-in/types';

export type CheckOutFolder = 'pending' | 'submitted' | 'processed' | 'archived';

export type FolioStatus = 'pending' | 'signed_on_tablet' | 'emailed';

export interface FolioLineItem {
  id: string;
  date: string;        // "Mar 16, 2026" format
  description: string;
  amount: number;      // negative for credits/payments (shown in parentheses)
}

export type AutoCheckoutStatus = 'completed' | 'scheduled' | 'failed';

export interface CheckOutSubmission {
  id: string;
  reservationId: string;
  guestId: string;
  folder: CheckOutFolder;
  departureTime?: string;     // "10:00 AM" format
  departureDate: string;      // ISO date or DEMO_TODAY
  folioStatus?: FolioStatus;
  folioSignedAt?: Date;
  guestRating?: number;       // 1-5, undefined = no review
  guestReview?: string;
  efolioAccepted?: boolean;
  autoCheckoutStatus?: AutoCheckoutStatus;
  submittedAt?: Date;
  processedAt?: Date;
}

/**
 * Demo date constant — all date comparisons use this
 * so the prototype looks correct regardless of when it runs.
 * Aligned with March 2026 broadcast-era reservations.
 */
export const DEMO_TODAY = '2026-03-16';

export const CHECKOUT_TIME = '10:00 AM';

/**
 * Loyalty tier colors — shared with check-in for consistent styling
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
