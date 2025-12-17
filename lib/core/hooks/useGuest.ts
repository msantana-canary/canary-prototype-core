/**
 * useGuest Hook
 *
 * Access canonical guest data by ID.
 */

import { useMemo } from 'react';
import { Guest } from '../types/guest';
import { guests, guestList } from '../data/guests';

/**
 * Get a guest by ID
 */
export function useGuest(guestId: string): Guest | undefined {
  return useMemo(() => guests[guestId], [guestId]);
}

/**
 * Get all guests
 */
export function useGuests(): Guest[] {
  return guestList;
}

/**
 * Get multiple guests by IDs
 */
export function useGuestsByIds(guestIds: string[]): Guest[] {
  return useMemo(
    () => guestIds.map(id => guests[id]).filter(Boolean) as Guest[],
    [guestIds]
  );
}
