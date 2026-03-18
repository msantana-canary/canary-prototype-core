/**
 * Segment Evaluator
 *
 * Evaluates segment rules against real canonical guest + reservation data.
 * Returns matching guests and count for a given segment.
 */

import { guestList } from '@/lib/core/data/guests';
import { getGuestReservations } from '@/lib/core/data/reservations';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import { Segment, SegmentRule } from './types';

interface GuestWithReservation {
  guest: Guest;
  reservation?: Reservation;
}

/**
 * Get all guests with their most recent reservation.
 */
function getAllGuestsWithReservations(): GuestWithReservation[] {
  return guestList.map((guest) => {
    const reservations = getGuestReservations(guest.id);
    // Pick most recent reservation
    const reservation = reservations.length > 0 ? reservations[0] : undefined;
    return { guest, reservation };
  });
}

/**
 * Normalize loyalty tier label for comparison.
 * Guest data uses "DIAMOND ELITE", segments might use "Diamond" or "Diamond Elite".
 */
function normalizeLoyalty(label: string): string {
  return label.toUpperCase().replace(/\s+/g, ' ').trim();
}

/**
 * Evaluate a single rule against a guest+reservation.
 */
function evaluateRule(rule: SegmentRule, entry: GuestWithReservation): boolean {
  const { guest, reservation } = entry;
  const isIncludes = rule.condition === 'includes';
  const isExcludes = rule.condition === 'excludes';
  const isEqualTo = rule.condition === 'is equal to';
  const isNotEqualTo = rule.condition === 'is not equal to';

  switch (rule.guestProperty) {
    case 'Loyalty Status': {
      const guestLoyalty = guest.statusTag?.label
        ? normalizeLoyalty(guest.statusTag.label)
        : '';
      const targetValues = rule.values.map(normalizeLoyalty);

      if (isIncludes) {
        return guestLoyalty !== '' && targetValues.some((v) => guestLoyalty.includes(v));
      }
      if (isExcludes) {
        return guestLoyalty === '' || !targetValues.some((v) => guestLoyalty.includes(v));
      }
      return false;
    }

    case 'Rate Code': {
      const guestRate = reservation?.rateCode?.toUpperCase() || '';
      const targetValues = rule.values.map((v) => v.toUpperCase());

      if (isIncludes) {
        return guestRate !== '' && targetValues.includes(guestRate);
      }
      if (isExcludes) {
        return guestRate === '' || !targetValues.includes(guestRate);
      }
      return false;
    }

    case 'Room Type': {
      const guestRoomType = (reservation?.roomType || reservation?.roomTypeCode || '').toUpperCase();
      const targetValues = rule.values.map((v) => v.toUpperCase());

      if (isIncludes) {
        return guestRoomType !== '' && targetValues.some((v) => guestRoomType.includes(v));
      }
      if (isExcludes) {
        return guestRoomType === '' || !targetValues.some((v) => guestRoomType.includes(v));
      }
      return false;
    }

    case 'Room Number': {
      const guestRoom = reservation?.room || '';
      const targetValues = rule.values;

      if (isIncludes) {
        return guestRoom !== '' && targetValues.includes(guestRoom);
      }
      if (isExcludes) {
        return guestRoom === '' || !targetValues.includes(guestRoom);
      }
      return false;
    }

    case 'Number of Nights Staying': {
      // Calculate nights from dates (simplified — count days between check-in and check-out)
      const isMultiNight = reservation
        ? reservation.checkInDate !== reservation.checkOutDate
        : false;
      const targetValue = rule.dropdownValue;

      if (isEqualTo) {
        return targetValue === 'Multiple Nights' ? isMultiNight : !isMultiNight;
      }
      if (isNotEqualTo) {
        return targetValue === 'Multiple Nights' ? !isMultiNight : isMultiNight;
      }
      return false;
    }

    case 'Guest Recurrence': {
      // Check if guest has more than one reservation (returning) or just one (first stay)
      const allReservations = getGuestReservations(guest.id);
      const isReturning = allReservations.length > 1;
      const targetValue = rule.dropdownValue;

      if (isEqualTo) {
        return targetValue === 'Return Guest' ? isReturning : !isReturning;
      }
      if (isNotEqualTo) {
        return targetValue === 'Return Guest' ? !isReturning : isReturning;
      }
      return false;
    }

    default:
      return true;
  }
}

/**
 * Evaluate a full segment against all guests.
 * Returns matching guests.
 */
export function evaluateSegment(segment: Segment): Guest[] {
  const allEntries = getAllGuestsWithReservations();

  return allEntries
    .filter((entry) => {
      if (segment.rules.length === 0) return true;

      let result = evaluateRule(segment.rules[0], entry);

      for (let i = 1; i < segment.rules.length; i++) {
        const rule = segment.rules[i];
        const ruleResult = evaluateRule(rule, entry);

        if (rule.operator === 'Or') {
          result = result || ruleResult;
        } else {
          // Default to AND
          result = result && ruleResult;
        }
      }

      return result;
    })
    .map((entry) => entry.guest);
}

/**
 * Count guests matching a segment.
 */
export function countSegmentGuests(segment: Segment): number {
  return evaluateSegment(segment).length;
}

/**
 * Get all unique values for a guest property across the dataset.
 * Useful for populating filter suggestions.
 */
export function getPropertyValues(property: string): string[] {
  const entries = getAllGuestsWithReservations();
  const values = new Set<string>();

  for (const { guest, reservation } of entries) {
    switch (property) {
      case 'Loyalty Status':
        if (guest.statusTag?.label) values.add(guest.statusTag.label);
        break;
      case 'Rate Code':
        if (reservation?.rateCode) values.add(reservation.rateCode);
        break;
      case 'Room Type':
        if (reservation?.roomType) values.add(reservation.roomType);
        else if (reservation?.roomTypeCode) values.add(reservation.roomTypeCode);
        break;
      case 'Room Number':
        if (reservation?.room) values.add(reservation.room);
        break;
    }
  }

  return Array.from(values).sort();
}
