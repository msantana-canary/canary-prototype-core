/**
 * Guest-Journey link — the messaging panel's scheduled-message timeline,
 * DERIVED from the guest-journey product's own campaigns.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY THIS FILE EXISTS (Miguel's ruling, 2026-08-20)
 * ═══════════════════════════════════════════════════════════════════════════
 * The panel's "Guest Scheduled Messages" timeline used to be a hand-typed
 * literal in `mock-data.ts` with its own invented touchpoint names
 * ("Pre-Arrival", "Mid-Stay Check", "Post-Stay Thank You"). None of those names
 * exist in the product that actually sends these messages. A hotelier who
 * configures "Mid-Stay" in Guest Journey and then reads "Mid-Stay Check" in
 * Messaging is looking at two different products describing one send.
 *
 * So the timeline is no longer authored — it is COMPILED from
 * `lib/products/guest-journey/mock-data.ts`:
 *
 *   • TITLES come from the campaigns verbatim — "Check In", "Post check-in",
 *     "Welcome to the Hotel", "Upsell", "Mid-Stay", "Checkout",
 *     "Post checkout", "Review Request".
 *   • ORDER comes from the campaign's `stage` (PRE_ARRIVAL → ARRIVAL →
 *     IN_HOUSE → DEPARTURE → POST_DEPARTURE), then its computed send time.
 *   • SEND TIMES are computed from the campaign's own `timing`
 *     (delta / direction / anchor / sendTime) against the RESERVATION's dates,
 *     so a stay's timeline is a real projection of that stay, not a copy of
 *     another guest's.
 *   • CHANNELS are the campaign's enabled channels, intersected with what this
 *     reservation can actually be reached on (see `reachableChannels`).
 *
 * The import is STRICTLY READ-ONLY — this module never mutates the guest-journey
 * product's data, and guest-journey knows nothing about messaging.
 *
 * Two things are NOT campaign-derived, deliberately:
 *
 *   1. **Booking Confirmation** — a SYSTEM touchpoint. It is not a guest-journey
 *      campaign (it fires off the booking, not off the journey), but it is the
 *      first thing in every real timeline and the only place the OTA channel
 *      shows up. It is prepended.
 *   2. **Failures** — a small authored override map (`gjFailures`). Failure is
 *      the state the panel exists to surface, and it has to be seeded to be
 *      demoable. Curated Twilio copy (30006 / 63016) is reused verbatim from the
 *      canon so the error register does not fork.
 *
 * ONE CARD PER CAMPAIGN: reminder children (`parentId`) are filtered out. They
 * are real sends, but rendering "Check In" twice with two timestamps reads as
 * duplicated mock data rather than as a reminder — and the reminder's own
 * anatomy (parent/child) has no home in this timeline.
 */

import { mockMessages as guestJourneyCampaigns } from '@/lib/products/guest-journey/mock-data';
import { JourneyStage, TimingAnchor, TimingDelta } from '@/lib/products/guest-journey/types';
import { reservations } from '@/lib/core/data/reservations';
import { guests } from '@/lib/core/data/guests';
import { Reservation } from '@/lib/core/types/reservation';
// The demo's one calendar day, already declared once for Check-in and Checkout.
// Imported rather than restated: a second copy of "today" is exactly the kind
// of drift this file is being fixed for.
import { DEMO_TODAY } from '@/lib/products/checkout/types';

/* ─────────────────────────────────────────────────────────────────────────
   Shape (unchanged from the canon so the error register keeps its contract)
   ───────────────────────────────────────────────────────────────────────── */

export type GjChannelType = 'email' | 'sms' | 'whatsapp' | 'booking' | 'expedia';
export type GjChannelStatus = 'sent' | 'failed' | 'scheduled';

export interface GjChannelEntry {
  type: GjChannelType;
  status: GjChannelStatus;
  /**
   * A `failed` channel carries production's error register: the raw carrier
   * `errorCode` (a real Twilio code) + a curated, hotelier-readable `errorNote`.
   * Hotels can't fix a carrier failure, but surfacing the code on-screen saves
   * Canary support the investigation.
   */
  errorCode?: string;
  errorNote?: string;
}

export interface GjMessageEntry {
  /** The guest-journey campaign title, verbatim. */
  title: string;
  /** Pre-formatted display string, "Jul 13 · 9:00 AM". */
  sentAt?: string;
  scheduledFor?: string;
  channels: GjChannelEntry[];
}

/* ─────────────────────────────────────────────────────────────────────────
   Authored bits: reachability + failures
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Guests we know are reachable on WhatsApp. Campaigns enable five channels each
 * in the guest-journey mock (email/sms/whatsapp/booking/expedia); firing all
 * five at every guest is not what happens in production and it turns every card
 * into a five-icon row. Email + SMS are the baseline; WhatsApp is opt-in per
 * guest; the OTA channels only ever appear on Booking Confirmation.
 */
const WHATSAPP_GUESTS = new Set<string>([
  'guest-emily',
  'guest-olivia',
  'guest-lucia',
  'guest-fatima',
  'guest-sarah-s',
]);

/** Which OTA (if any) the booking came through — drives the confirmation chip. */
const OTA_BY_RESERVATION: Record<string, 'booking' | 'expedia'> = {
  'res-emily-jul': 'booking',
  'res-emily-sep': 'expedia',
  'res-james-jul': 'expedia',
  'res-nathan-jul': 'booking',
  'res-john-jul': 'booking',
  'res-john-sep': 'expedia',
  'res-sarah-s-nov': 'booking',
};

/**
 * Seeded failures, keyed reservation → campaign title → the channels that blew
 * up. Copy is the canon's, verbatim (30006 / 63016).
 *
 * `res-emily-jul` is the exemplar: the CURRENT stay on the demo thread, so the
 * red state is one click from the panel's opening frame. Its "Check In" send
 * lost SMS and WhatsApp but landed by email — a PARTIAL failure, which is the
 * interesting case (the card still reads "Sent"; the damage is per-channel).
 *
 * `res-emily-feb-past` carries the other case: "Mid-Stay" is an SMS-ONLY
 * campaign in Guest Journey, so when SMS fails NOTHING was delivered and the
 * card reads a red "Failed".
 */
const SMS_30006 =
  "This guest's number can't receive texts right now. Consider another way to contact them.";
const WHATSAPP_63016 =
  "WhatsApp couldn't deliver this message — the guest hasn't opted in or the 24-hour window closed. Try SMS or email instead.";

export const gjFailures: Record<string, Record<string, GjChannelEntry[]>> = {
  'res-emily-jul': {
    'Check In': [
      { type: 'sms', status: 'failed', errorCode: '30006', errorNote: SMS_30006 },
      { type: 'whatsapp', status: 'failed', errorCode: '63016', errorNote: WHATSAPP_63016 },
    ],
  },
  'res-emily-feb-past': {
    'Mid-Stay': [
      { type: 'sms', status: 'failed', errorCode: '30006', errorNote: SMS_30006 },
    ],
  },
  'res-john-jul': {
    'Check In': [
      { type: 'sms', status: 'failed', errorCode: '30006', errorNote: SMS_30006 },
      { type: 'whatsapp', status: 'failed', errorCode: '63016', errorNote: WHATSAPP_63016 },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   Date arithmetic
   ───────────────────────────────────────────────────────────────────────── */

const DELTA_DAYS: Record<TimingDelta, number> = {
  ASAP: 0,
  SAME_DAY: 0,
  '1_DAY': 1,
  '2_DAYS': 2,
  '3_DAYS': 3,
  '4_DAYS': 4,
  '5_DAYS': 5,
  '6_DAYS': 6,
  '1_WEEK': 7,
  '2_WEEKS': 14,
  '3_WEEKS': 21,
  '4_WEEKS': 28,
  '2_MONTHS': 60,
  '3_MONTHS': 90,
};

const STAGE_ORDER: Record<JourneyStage, number> = {
  PRE_ARRIVAL: 0,
  ARRIVAL: 1,
  IN_HOUSE: 2,
  DEPARTURE: 3,
  POST_DEPARTURE: 4,
};

/** Wall-clock the anchor EVENT happens at, when the campaign names no sendTime. */
const ANCHOR_HOUR: Record<TimingAnchor, number> = {
  ARRIVAL: 15,
  CHECK_IN: 15,
  DEPARTURE: 11,
  CHECK_OUT: 11,
};

/**
 * "ASAP" means "right after the event" — but two campaigns can hang off two
 * different anchors at the same hour, and printing the same timestamp twice
 * reads as duplicated mock. Each anchor gets its own trailing offset.
 */
const ASAP_MINUTES: Record<TimingAnchor, number> = {
  CHECK_IN: 30,
  ARRIVAL: 45,
  CHECK_OUT: 60,
  DEPARTURE: 60,
};

/** Parse a canonical reservation date string ("Jul. 13, 2026") to a Date. */
export function parseReservationDate(value?: string): Date | null {
  if (!value) return null;
  const t = new Date(value.replace(/\./g, ''));
  return Number.isNaN(t.getTime()) ? null : t;
}

/** Parse "9:00 AM" into {hour, minute} on a 24h clock. */
function parseSendTime(value?: string): { hour: number; minute: number } | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hour = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') hour += 12;
  return { hour, minute: Number(m[2]) };
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Jul 13 · 9:00 AM" — the timeline's one timestamp register. */
export function formatTouchpointTime(d: Date): string {
  const hours24 = d.getHours();
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hour = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()} · ${hour}:${minute} ${suffix}`;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + days);
  return out;
}

function atTime(d: Date, hour: number, minute: number): Date {
  const out = new Date(d.getTime());
  out.setHours(hour, minute, 0, 0);
  return out;
}

/**
 * The demo's evening on the demo's day — the latest moment anything on this
 * surface may claim to have already happened.
 *
 * `DEMO_TODAY` is a date, and the inbox's own last message lands at 6:32 PM on
 * it, so the ceiling is that evening rather than midnight: everything the
 * fixtures print as sent stays sent.
 */
const DEMO_NOW = (() => {
  const [y, m, d] = DEMO_TODAY.split('-').map(Number);
  return new Date(y, m - 1, d, 18, 30, 0, 0);
})();

/**
 * The moment this reservation is "at" — what separates a sent touchpoint from a
 * scheduled one. Derived from the stay's lifecycle rather than from the real
 * clock, because the prototype's reservation dates are scattered across 2025–26
 * and a real `Date.now()` would make half the mock incoherent.
 *
 * ⚠ AND CAPPED AT THE DEMO CLOCK (QA-3, 2026-08-25). The lifecycle derivation
 * is a per-reservation "now", and for the hero stay — Emily, checked in, Mar 16
 * to 18 — arrival + 1 day put it at Mar 17, 6:00 PM. So the Upsell scheduled for
 * Mar 17 at 2:00 PM rendered "Sent Mar 17 · 2:00 PM", two clicks from a thread
 * whose day separator says MAR. 16. A message sent tomorrow.
 *
 * The cap is not a special case for that stay; it is the rule the surface
 * already runs on everywhere else. There is ONE today here, and nothing may be
 * reported as done after it. A stay's own lifecycle can still put its clock
 * EARLIER — an upcoming booking is still 30 days out — it just cannot put it
 * in the future.
 */
function reservationNow(res: Reservation, arrival: Date, departure: Date): Date {
  const derived = (() => {
    if (res.status === 'checked-out' || res.status === 'cancelled' || res.status === 'no-show') {
      return addDays(departure, 3);
    }
    if (res.status === 'checked-in') {
      // Mid-stay: arrival + 1 day, early evening.
      return atTime(addDays(arrival, 1), 18, 0);
    }
    // Reserved / upcoming — far enough out that only the booking has fired.
    return addDays(arrival, -30);
  })();
  return derived.getTime() > DEMO_NOW.getTime() ? DEMO_NOW : derived;
}

/** Email + SMS baseline, WhatsApp where the guest is reachable on it. */
function reachableChannels(guestId: string): GjChannelType[] {
  return WHATSAPP_GUESTS.has(guestId)
    ? ['email', 'sms', 'whatsapp']
    : ['email', 'sms'];
}

/* ─────────────────────────────────────────────────────────────────────────
   The compiler
   ───────────────────────────────────────────────────────────────────────── */

interface CompiledTouchpoint {
  title: string;
  at: Date;
  order: number;
  channels: GjChannelType[];
}

/**
 * Build one reservation's scheduled-message timeline from the guest-journey
 * campaigns. Returns [] when the reservation is unknown or has no dates.
 */
export function buildJourneyTimeline(reservationId: string): GjMessageEntry[] {
  const res = reservations[reservationId];
  if (!res) return [];
  const arrival = parseReservationDate(res.checkInDate);
  const departure = parseReservationDate(res.checkOutDate);
  if (!arrival || !departure) return [];

  const reachable = reachableChannels(res.guestId);
  const now = reservationNow(res, arrival, departure);
  const failures = gjFailures[reservationId] ?? {};

  const touchpoints: CompiledTouchpoint[] = [];

  // 1. Booking Confirmation — the SYSTEM touchpoint, not a campaign. Fires well
  //    before arrival and is the only card that carries the OTA chip.
  const ota = OTA_BY_RESERVATION[reservationId];
  touchpoints.push({
    title: 'Booking Confirmation',
    at: atTime(addDays(arrival, -23), 14, 14),
    order: -1,
    channels: ota ? ['email', ota] : ['email'],
  });

  // 2. Every ENABLED, PARENT-LEVEL guest-journey campaign, projected onto this
  //    stay's dates.
  for (const campaign of guestJourneyCampaigns) {
    if (!campaign.isEnabled) continue;
    if (campaign.parentId) continue; // reminders — one card per campaign

    const { delta, direction, anchor, sendTime } = campaign.timing;
    const anchorDay = anchor === 'DEPARTURE' || anchor === 'CHECK_OUT' ? departure : arrival;
    const days = DELTA_DAYS[delta] ?? 0;
    const day = addDays(anchorDay, direction === 'BEFORE' ? -days : days);

    const explicit = parseSendTime(sendTime);
    let at: Date;
    if (explicit) {
      at = atTime(day, explicit.hour, explicit.minute);
    } else if (delta === 'ASAP') {
      at = new Date(atTime(day, ANCHOR_HOUR[anchor], 0).getTime() + ASAP_MINUTES[anchor] * 60_000);
    } else {
      at = atTime(day, ANCHOR_HOUR[anchor], 0);
    }

    const enabled = campaign.channels
      .filter((c) => c.isEnabled)
      .map((c) => c.channel as GjChannelType);
    const channels = reachable.filter((c) => enabled.includes(c));
    if (channels.length === 0) continue;

    touchpoints.push({
      title: campaign.title,
      at,
      order: STAGE_ORDER[campaign.stage],
      channels,
    });
  }

  /**
   * ⚠ CLOCK FIRST, STAGE AS THE TIE-BREAK (QA-2, 2026-08-25). This used to sort
   * by `STAGE_ORDER` first, which put Mid-Stay "Jul 15 · 10:00 AM" directly
   * ABOVE Checkout "Jul 15 · 8:00 AM" on a vertical rail whose whole grammar is
   * "later is further down" — the printed times contradicting the order they
   * were printed in, on the hero guest's timeline.
   *
   * A rail is a SEQUENCE, so the timestamp is the sort. Stage order survives
   * only where two touchpoints land on the same minute and something has to
   * break the tie deterministically. Nothing else moves: across days the
   * journey stages already run in chronological order, so the visible change is
   * exactly the same-day inversions.
   */
  touchpoints.sort((a, b) =>
    a.at.getTime() !== b.at.getTime() ? a.at.getTime() - b.at.getTime() : a.order - b.order
  );

  // 3. Resolve each touchpoint's channel statuses against the stay's clock and
  //    the seeded failures.
  return touchpoints.map((tp) => {
    const isSent = tp.at.getTime() <= now.getTime();
    const failed = failures[tp.title] ?? [];
    const failedTypes = new Set(failed.map((f) => f.type));

    // A failure implies the send was attempted, so a failed touchpoint always
    // renders as sent-with-damage even if the clock says otherwise.
    const attempted = isSent || failed.length > 0;

    const channels: GjChannelEntry[] = tp.channels.map((type) => {
      const failure = failed.find((f) => f.type === type);
      if (failure) return failure;
      return { type, status: attempted ? 'sent' : 'scheduled' };
    });

    // A seeded failure on a channel the campaign doesn't reach here is still
    // worth showing — it happened.
    for (const f of failed) {
      if (!tp.channels.includes(f.type)) channels.push(f);
    }
    void failedTypes;

    return attempted
      ? { title: tp.title, sentAt: formatTouchpointTime(tp.at), channels }
      : { title: tp.title, scheduledFor: formatTouchpointTime(tp.at), channels };
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   Derived summaries — every count in the panel comes from here
   ───────────────────────────────────────────────────────────────────────── */

export interface GjSummary {
  delivered: number;
  failed: number;
  scheduled: number;
}

/**
 * Message-level counts for one reservation, DERIVED from the built timeline so
 * a count and the list it summarises can never disagree. A sent message with any
 * failed channel counts as failed; otherwise sent ⇒ delivered, else ⇒ scheduled.
 */
export function getGjSummary(reservationId: string): GjSummary {
  const msgs = buildJourneyTimeline(reservationId);
  let delivered = 0;
  let failed = 0;
  let scheduled = 0;
  for (const m of msgs) {
    if (m.channels.some((c) => c.status === 'failed')) failed++;
    else if (m.sentAt) delivered++;
    else scheduled++;
  }
  return { delivered, failed, scheduled };
}

/**
 * The one-line status the Reservations drill-in prints on its "Guest Scheduled
 * Messages" row. The frames draw two states (an "All sent" and a red "Error
 * sending message"); a stay that has only FUTURE sends is neither, so it gets
 * its own quiet count rather than a false "All sent".
 */
export function getGjRowStatus(reservationId: string): { label: string; isError: boolean } {
  const { delivered, failed, scheduled } = getGjSummary(reservationId);
  if (failed > 0) return { label: 'Error sending message', isError: true };
  if (scheduled > 0 && delivered === 0) return { label: `${scheduled} scheduled`, isError: false };
  if (scheduled > 0) return { label: `${scheduled} scheduled`, isError: false };
  if (delivered > 0) return { label: 'All sent', isError: false };
  return { label: 'None scheduled', isError: false };
}

/** Human channel label for the error register's overline (production register). */
export const GJ_CHANNEL_LABEL: Record<GjChannelType, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  booking: 'Booking.com',
  expedia: 'Expedia',
};

/** Convenience for the panel: does this guest have any failed send anywhere? */
export function guestHasGjFailure(guestId: string, reservationIds: string[]): boolean {
  return reservationIds.some(
    (id) => reservations[id]?.guestId === guestId && getGjSummary(id).failed > 0
  );
}

/** Guard so an unknown guest id can't silently produce an empty timeline. */
export function isKnownGuest(guestId: string): boolean {
  return !!guests[guestId];
}
