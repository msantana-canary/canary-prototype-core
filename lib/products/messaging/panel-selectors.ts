/**
 * Conversation Details panel — derivations.
 *
 * Everything the panel shows about "who is this thread" is COMPUTED here from
 * the thread's linked reservations plus one display preference. Nothing is
 * hand-typed: the reservation count, the Upsells badge, the companion list and
 * the primary-guest candidates all fall out of the same partition, so they
 * cannot drift apart.
 *
 * THE PARTITION (the whole guest-profile-first idea in one rule):
 *
 *      PRIMARY  = one reservation, the spotlight. Its guest is "the person".
 *      OWN      = every OTHER reservation belonging to that same guest.
 *                 → the "{First}'s Reservations → N" card + drill-in.
 *      COMPANIONS = every reservation belonging to ANYONE ELSE.
 *                 → the Linked Reservations tab.
 *
 * SELF IS EXCLUDED FROM COMPANIONS. Miguel: "linked rez are companions to this
 * reservation — Emily's family that has a separate room but is connected to
 * her." A guest listed as her own companion is a tautology, and the frame that
 * shows Emily inside Emily's linked list is a stale iteration.
 */

import { Thread, LinkedReservation } from './types';
import { reservations } from '@/lib/core/data/reservations';
import { guests } from '@/lib/core/data/guests';
import { Reservation } from '@/lib/core/types/reservation';

/* ─────────────────────────────────────────────────────────────────────────
   Stay ordering
   ───────────────────────────────────────────────────────────────────────── */

export type StayState = 'in-house' | 'upcoming' | 'past';

/** TEMPORAL state, used for SORT ORDER only — the visible label is the tag. */
export function deriveStayState(res: Reservation): StayState {
  if (res.status === 'checked-in') return 'in-house';
  if (res.status === 'checked-out' || res.status === 'cancelled' || res.status === 'no-show') return 'past';
  return 'upcoming';
}

const STATE_ORDER: Record<StayState, number> = { 'in-house': 0, upcoming: 1, past: 2 };

/** Parse a canonical date string ("Jul. 13, 2026") into a comparable number. */
export function parseResDate(s?: string): number {
  if (!s) return 0;
  const t = new Date(s.replace(/\./g, '')).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Current stay first, then upcoming soonest-first, then past most-recent-first. */
export function sortStays(list: LinkedReservation[]): LinkedReservation[] {
  return [...list].sort((a, b) => {
    const sa = deriveStayState(a.reservation);
    const sb = deriveStayState(b.reservation);
    if (STATE_ORDER[sa] !== STATE_ORDER[sb]) return STATE_ORDER[sa] - STATE_ORDER[sb];
    const da = parseResDate(a.reservation.checkInDate);
    const db = parseResDate(b.reservation.checkInDate);
    return sa === 'upcoming' ? da - db : db - da;
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   Resolution
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Resolve a thread's linked reservation ids into reservation + guest + the
 * auto-link FACT (the guest's phone equals the thread's number). Cancelled and
 * no-show stays are filtered out entirely, matching production.
 */
export function resolveLinked(thread: Thread | null): LinkedReservation[] {
  if (!thread) return [];
  return thread.linkedReservationIds
    .map((id) => {
      const reservation = reservations[id];
      if (!reservation) return null;
      const guest = guests[reservation.guestId];
      if (!guest) return null;
      return { reservation, guest, isAutoLinked: guest.phone === thread.contactNumber };
    })
    .filter((lr): lr is LinkedReservation => lr !== null)
    .filter((lr) => lr.reservation.status !== 'cancelled' && lr.reservation.status !== 'no-show');
}

export interface PanelIdentity {
  /** The spotlight reservation, or null on an anonymous thread. */
  primary: LinkedReservation | null;
  /** The primary guest's OWN stays, spotlight first, in stay order. */
  ownStays: LinkedReservation[];
  /** Everyone else linked to the thread — the Linked Reservations tab. */
  companions: LinkedReservation[];
  /** Every linked reservation sharing the thread's phone — the picker's list. */
  samePhone: LinkedReservation[];
  /** No linked reservations at all ⇒ the phone number IS the conversation. */
  isAnonymous: boolean;
}

/**
 * The default spotlight when nobody has chosen one: the in-house auto-linked
 * stay, else any auto-linked stay, else the first link of any kind. In other
 * words "whoever is standing in the building on this number, and if nobody is,
 * whoever the number belongs to."
 */
function defaultPrimary(linked: LinkedReservation[]): LinkedReservation | null {
  const auto = sortStays(linked.filter((lr) => lr.isAutoLinked));
  const inHouse = auto.find((lr) => deriveStayState(lr.reservation) === 'in-house');
  return inHouse ?? auto[0] ?? sortStays(linked)[0] ?? null;
}

/**
 * The panel's whole identity model for one thread.
 *
 * `preferredReservationId` is the per-thread DISPLAY primary from the store —
 * a spotlight, never a link. An id that is no longer linked is ignored rather
 * than trusted, so unlinking can't leave the panel pointing at a ghost.
 */
export function panelIdentity(
  thread: Thread | null,
  preferredReservationId?: string
): PanelIdentity {
  const linked = resolveLinked(thread);
  if (linked.length === 0) {
    return { primary: null, ownStays: [], companions: [], samePhone: [], isAnonymous: true };
  }

  const preferred = preferredReservationId
    ? linked.find((lr) => lr.reservation.id === preferredReservationId)
    : undefined;
  const primary = preferred ?? defaultPrimary(linked);
  const primaryGuestId = primary?.guest.id;

  const ownStays = sortStays(linked.filter((lr) => lr.guest.id === primaryGuestId));
  const companions = sortStays(linked.filter((lr) => lr.guest.id !== primaryGuestId));
  const samePhone = sortStays(linked.filter((lr) => lr.isAutoLinked));

  return { primary, ownStays, companions, samePhone, isAnonymous: false };
}

/** First name for the "{First}'s Reservations" card. Falls back to the full name. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}
