/**
 * Canonical Reservation Type
 *
 * Links a guest to a room for a specific stay.
 * Used across Check-in, Checkout, Messaging, Upsells, etc.
 */

export type ReservationStatus =
  | 'upcoming'      // Future reservation
  | 'checked-in'    // Currently staying
  | 'checked-out'   // Completed stay
  | 'cancelled'     // Cancelled reservation
  | 'no-show';      // Guest didn't arrive

export type CheckInStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Completed';
export type CheckOutStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Completed';

export interface Reservation {
  id: string;                    // Unique identifier, e.g., "res-emily-jul"
  guestId: string;               // Links to Guest.id
  room?: string;                 // Room number, e.g., "153"
  roomType?: string;             // e.g., "King Suite", "Double Queen"
  roomTypeCode?: string;         // Short code, e.g., "KNG", "DBO" — used in detail panel header
  checkInDate: string;           // e.g., "Jul. 13, 2024"
  checkOutDate: string;          // e.g., "Jul. 15, 2024"
  confirmationCode: string;      // e.g., "ECzSBOwbMRyyYPY"
  status: ReservationStatus;
  checkInStatus?: CheckInStatus;
  checkOutStatus?: CheckOutStatus;
  notes?: string;                // Internal notes
  requestCount?: number;         // Number of service requests
  paymentCard?: {
    brand: string;               // "Visa", "Mastercard", "Amex"
    last4: string;               // "6789"
    expiryMonth: number;         // 3
    expiryYear: number;          // 2025
    cardholderName: string;
    postalCode: string;          // "11234"
  };
  rateCode?: string;             // "CORP", "BAR", "AAA"
}
