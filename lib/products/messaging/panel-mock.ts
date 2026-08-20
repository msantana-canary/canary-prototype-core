/**
 * Conversation Details panel — seed data for the three attached-object tabs.
 *
 * Upsells and service tasks hang off the GUEST (they follow the person across
 * stays); calls hang off the THREAD (a call is a conversation on this number,
 * not a property of the person). Nothing here is a count — every badge and
 * total in the panel is derived by counting these rows, so the mock can grow
 * without anyone remembering to update a number.
 *
 * Deliberately kept LOCAL to messaging. The Calls product has its own store
 * with its own shape and its own screens; wiring the panel into it would couple
 * two prototypes for the sake of three rows, and the first divergence in either
 * would break the other. This is a facsimile — a couple of calls on the demo
 * thread is the whole requirement.
 */

import { CallRecord, ServiceTask, Upsell } from './types';

/* ─────────────────────────────────────────────────────────────────────────
   Upsells — keyed by guest id
   ───────────────────────────────────────────────────────────────────────── */

export const upsellsByGuest: Record<string, Upsell[]> = {
  'guest-emily': [
    { id: 'ups-emily-1', name: 'Bottle of Prosecco', quantity: 1, category: 'Add-on', status: 'requested' },
    { id: 'ups-emily-2', name: 'Welcome Amenity', quantity: 1, category: 'Add-on', status: 'approved' },
    // No quantity: you don't buy two of a room upgrade.
    { id: 'ups-emily-3', name: 'King Suite', category: 'Room Upgrade', status: 'approved' },
    { id: 'ups-emily-4', name: 'Two Cocktails', quantity: 1, category: 'Add-on', status: 'denied' },
  ],
  'guest-nathan-r': [
    { id: 'ups-nathan-1', name: 'Late Check-Out', quantity: 1, category: 'Add-on', status: 'approved' },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   Service tasks — keyed by guest id
   ───────────────────────────────────────────────────────────────────────── */

export const serviceTasksByGuest: Record<string, ServiceTask[]> = {
  'guest-emily': [
    { id: 'task-emily-1', title: 'Wireless Internet Problem', status: 'open', room: '153' },
    { id: 'task-emily-2', title: 'Replace missing chair', status: 'open', room: '153' },
    // The "WAITING {n}M" register: production prints the elapsed minutes inside
    // the tag, and the number is the point — 1652 minutes is a task nobody
    // picked up for over a day.
    { id: 'task-emily-3', title: '101 - Living Room HVAC', status: 'waiting', waitingMinutes: 1652, room: '153' },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   Calls — keyed by THREAD id (exemplar thread only)
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Thread '1' (Emily Smith) is the demo thread — the inbox's most recent, so the
 * panel opens on it. Three calls, all different: the frames' two identical
 * February rows are logged mock duplication, not a pattern to copy.
 *
 * The detailed call is the late-checkout one. Its meta grid names EMILY, not
 * the frame's "Theresa Webb" — Theresa is the front-desk STAFF member this
 * prototype signs staff replies with, and the frame's own transcript trace says
 * "Found Emily Smith". A guest-name field naming the staff member is a mock
 * slip; the trace is the coherent read, so the guest is Emily and the room is
 * her real room (153).
 */
export const callsByThread: Record<string, CallRecord[]> = {
  '1': [
    {
      id: 'call-emily-1',
      startedAtLabel: 'May 12th at 10:02 AM',
      durationLabel: '1 min',
      guestName: 'Emily Smith',
      timeOfCall: 'Today at 02:45 PM',
      durationClock: '15:24',
      elapsedClock: '07:32',
      handleStatus: 'Contained',
      externalId: '123e4567-e89b-12d3-a456-426614174000',
      summary: [
        "The guest called to ask for a late checkout. Canary AI confirmed Room 153 was available, waived the $40 fee for the guest's Diamond Elite status, and coordinated with housekeeping to offer a 3:30 PM checkout.",
        'No follow-up needed — Canary AI resolved the request.',
      ],
      beginsLabel: 'Call Begins • 2:45 PM',
      transcript: [
        {
          speaker: '1 (646) 123-4567',
          time: '2:45 PM',
          text: "Hi! Any chance I could get a late checkout today? My flight isn't until this evening.",
          steps: [
            { tool: 'search_for_reservation_by_calling_phone_number', note: 'Found Emily Smith — Room 153, checking out today' },
            { tool: 'offer_upsells', note: 'Late check-out is available for this stay' },
            { tool: 'search_upsells', note: 'Late check-out until 3:30 PM — $40, one-time charge' },
            { tool: 'Guest profile', note: 'Diamond Elite — fee can be waived' },
            { tool: 'create_service_ticket', note: 'Housekeeping notified — afternoon clean for Room 153' },
            { tool: 'Decision', note: 'Approve — offer 3:30 PM checkout' },
          ],
        },
        {
          speaker: 'Canary AI',
          isAi: true,
          time: '2:47 PM',
          text: 'Good news — I can extend your checkout to 3:30 PM today. Would you like me to add it?',
        },
        {
          speaker: '1 (646) 123-4567',
          time: '2:48 PM',
          text: "That's perfect, yes please. And is there somewhere I can leave my bags after that?",
        },
        {
          speaker: 'Canary AI',
          isAi: true,
          time: '2:49 PM',
          text: "Done — you're set until 3:30 PM. The bell desk in the lobby can hold your luggage for as long as you need, no charge.",
        },
      ],
    },
    {
      id: 'call-emily-2',
      startedAtLabel: 'February 27th at 8:36 AM',
      durationLabel: '1 min 3 sec',
      guestName: 'Emily Smith',
      timeOfCall: 'Feb 27th at 08:36 AM',
      durationClock: '01:03',
      elapsedClock: '00:41',
      handleStatus: 'Contained',
      externalId: '9f14c0a2-7b3d-4e51-9c88-2a61de44f0b7',
      summary: [
        'The guest asked what time breakfast service ends. Canary AI answered from the property compendium (10:30 AM on weekdays, 11:00 AM at weekends) and offered to add a wake-up call.',
        'No follow-up needed — Canary AI resolved the request.',
      ],
      beginsLabel: 'Call Begins • 8:36 AM',
      transcript: [
        {
          speaker: '1 (646) 123-4567',
          time: '8:36 AM',
          text: 'Morning — what time does breakfast finish?',
          steps: [
            { tool: 'search_knowledge_base', note: 'Compendium · Dining — breakfast 6:30–10:30 AM weekdays' },
            { tool: 'Decision', note: 'Answer directly — no reservation change needed' },
          ],
        },
        {
          speaker: 'Canary AI',
          isAi: true,
          time: '8:36 AM',
          text: "Breakfast runs until 10:30 AM on weekdays and 11:00 AM at weekends, in the lobby restaurant. Would you like a wake-up call tomorrow so you don't miss it?",
        },
      ],
    },
    {
      id: 'call-emily-3',
      startedAtLabel: 'February 3rd at 6:12 PM',
      durationLabel: '4 min 18 sec',
      guestName: 'Emily Smith',
      timeOfCall: 'Feb 3rd at 06:12 PM',
      durationClock: '04:18',
      elapsedClock: '02:05',
      handleStatus: 'Transferred',
      externalId: 'c47b1de9-3a20-4f6c-b0d5-8e917ac2e334',
      summary: [
        'The guest reported that the room safe would not close. Canary AI opened a maintenance ticket for Room 148 and transferred the call to the front desk so an engineer could be dispatched during the stay.',
        'Follow-up: front desk took the call at 6:14 PM.',
      ],
      beginsLabel: 'Call Begins • 6:12 PM',
      transcript: [
        {
          speaker: '1 (646) 123-4567',
          time: '6:12 PM',
          text: "The safe in my room won't lock — the door just springs back open.",
          steps: [
            { tool: 'search_for_reservation_by_calling_phone_number', note: 'Found Emily Smith — Room 148, checked in' },
            { tool: 'create_service_ticket', note: 'Maintenance · Room safe fault — Room 148' },
            { tool: 'Decision', note: 'Transfer — in-room hardware fault needs a person' },
          ],
        },
        {
          speaker: 'Canary AI',
          isAi: true,
          time: '6:13 PM',
          text: "I'm sorry about that. I've logged it for maintenance and I'm putting you through to the front desk now so they can send someone up.",
        },
      ],
    },
  ],
};

/** Elapsed / total as a 0–1 fraction, so the scrubber can't contradict the clock. */
export function callProgress(call: CallRecord): number {
  const toSeconds = (clock: string) => {
    const [m, s] = clock.split(':').map(Number);
    if (Number.isNaN(m) || Number.isNaN(s)) return 0;
    return m * 60 + s;
  };
  const total = toSeconds(call.durationClock);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, toSeconds(call.elapsedClock) / total));
}
