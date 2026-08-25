/**
 * HAND-ENTERED CONTACTS ARE RECIPIENTS (QA-3, 2026-08-25).
 *
 * ── WHAT WAS BROKEN ───────────────────────────────────────────────────────
 * "New group" collects a name, a phone and a channel, and refuses to save
 * without at least one contact — so EVERY group the flow can produce had at
 * least one person in it. It then stored those contacts in `contacts` and left
 * `memberGuestIds` empty, and the entire audience pipeline resolves recipients
 * from `memberGuestIds`. The result was a group that said "1 guest" on its rail
 * row and "no one to send to" in the To strip, in the same screenshot, with
 * "Send to 0 guests" permanently disabled. Create-a-group-and-blast-it
 * dead-ended at a greyed button every single time.
 *
 * The old comment called the empty selection deliberate — hand-entered contacts
 * are not canonical PMS guests, which is TRUE and worth keeping. But "not a PMS
 * guest" is a statement about where the record came from, not about whether you
 * can text it. A number and a channel is all an SMS needs. Modelling them as
 * un-sendable made the product contradict itself on screen.
 *
 * ── THE SHAPE ─────────────────────────────────────────────────────────────
 * A contact is admitted to the pipeline as an ordinary guest entry with a
 * SYNTHETIC id, and this module is the one place that knows such ids exist.
 * Everything downstream — `canMessageGuest`, the audience split, the recipient
 * rows, the delivery list — goes through `resolveBroadcastGuest` instead of
 * indexing the canonical `guests` map directly, so a contact reads as a person
 * everywhere without a single call site having to care which kind it is.
 *
 * ⚠ THE CANONICAL MAP IS NEVER MUTATED. `lib/core/data/guests` is shared with
 * every other product; writing prototype-session records into it would leak a
 * demo's typing into Check-in and Checkout. The ad-hoc records live here, and
 * the resolver checks canonical FIRST so a synthetic id can never shadow a real
 * guest.
 */

import { guests } from '@/lib/core/data/guests';
import { Guest } from '@/lib/core/types/guest';
import { BroadcastGroupContact } from './broadcast-types';

/** Session-lived, like every other piece of prototype state on this surface. */
const adHocGuests: Record<string, Guest> = {};

const AD_HOC_PREFIX = 'contact-';

/** Initials the same way the fixtures draw them: first letter of each word. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Turn the New-group modal's contacts into recipient ids.
 *
 * The name is optional in the form, so it falls back to the number — the same
 * fallback `BroadcastGroupContact` documents, applied once here rather than at
 * each of the places that print a name.
 */
export function registerGroupContacts(contacts: BroadcastGroupContact[]): string[] {
  return contacts.map((contact) => {
    const id = `${AD_HOC_PREFIX}${contact.id}`;
    const name = contact.name?.trim() || contact.phone;
    adHocGuests[id] = {
      id,
      name,
      initials: initialsOf(name),
      phone: contact.phone,
    };
    return id;
  });
}

/**
 * A guest record for any id the broadcast surface can hold — canonical or
 * hand-entered. `undefined` still means "nobody", so the `if (!guest) return
 * null` guards at the call sites keep working unchanged.
 */
export function resolveBroadcastGuest(guestId: string): Guest | undefined {
  return guests[guestId] ?? adHocGuests[guestId];
}

/** Was this id typed into the New-group modal rather than read from the PMS? */
export function isAdHocContact(guestId: string): boolean {
  return guestId.startsWith(AD_HOC_PREFIX);
}
