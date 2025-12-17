/**
 * Canonical Room Type
 *
 * Represents a room in the hotel inventory.
 */

export type RoomStatus =
  | 'available'     // Ready for check-in
  | 'occupied'      // Currently has a guest
  | 'dirty'         // Needs cleaning
  | 'maintenance'   // Out of order
  | 'reserved';     // Reserved for upcoming arrival

export type RoomType =
  | 'standard-king'
  | 'standard-queen'
  | 'double-queen'
  | 'king-suite'
  | 'executive-suite'
  | 'penthouse';

export interface Room {
  id: string;           // e.g., "room-153"
  number: string;       // e.g., "153"
  floor: number;        // e.g., 1
  type: RoomType;
  status: RoomStatus;
  maxOccupancy: number;
  amenities?: string[]; // e.g., ["wifi", "minibar", "balcony"]
}
