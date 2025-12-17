/**
 * useReservation Hook
 *
 * Access canonical reservation data.
 */

import { useMemo } from 'react';
import { Reservation } from '../types/reservation';
import { reservations, reservationList } from '../data/reservations';

/**
 * Get a reservation by ID
 */
export function useReservation(reservationId: string): Reservation | undefined {
  return useMemo(() => reservations[reservationId], [reservationId]);
}

/**
 * Get all reservations
 */
export function useReservations(): Reservation[] {
  return reservationList;
}

/**
 * Get all reservations for a specific guest
 */
export function useGuestReservations(guestId: string): Reservation[] {
  return useMemo(
    () => reservationList.filter(res => res.guestId === guestId),
    [guestId]
  );
}

/**
 * Get the active (checked-in) reservation for a guest
 */
export function useActiveReservation(guestId: string): Reservation | undefined {
  return useMemo(
    () => reservationList.find(
      res => res.guestId === guestId && res.status === 'checked-in'
    ),
    [guestId]
  );
}
