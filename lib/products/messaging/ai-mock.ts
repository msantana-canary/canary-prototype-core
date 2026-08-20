/**
 * THE AI LOOP'S DATA — explanations, drafts, suggested facts, ticket
 * suggestions, escalation clocks and carrier receipts.
 *
 * It lives beside `mock-data.ts` rather than inside it for one reason: the
 * message log is a TRANSCRIPT and this is its FOOTNOTES. Threading a
 * fifteen-line explanation through every `ai` message would have doubled the
 * transcript's length and made the conversation unreadable in the file that
 * exists to make the conversation readable. `mock-data.ts` decorates its
 * messages from these tables on the way out, so the runtime shape is still one
 * `Message` carrying its own explanation.
 *
 * ── THE INVARIANT ─────────────────────────────────────────────────────────
 * `sourceCount` is DERIVED from `sources.length` at decoration time. The
 * footer chip ("3 SOURCES ⌄") and the sidebar's Sources Used list are two views
 * of one array, and the fastest way to make an observability surface untrusted
 * is to have it say three and then show four.
 *
 * ── THE COPY ──────────────────────────────────────────────────────────────
 * Thread 1's two explanations (`m4` success, `m3` non-response) are the FRAMES,
 * verbatim — including the inconsistencies the audit logged as fix-in-post:
 * "Chilli's" with two Ls against the message's "Chili's", the double space in
 * "MIX,  and Red's Place", bullet 1 ending in a period where 2 and 3 do not,
 * and "What AI understood" in sentence case beside three title-case headings.
 * They are reproduced on purpose so the build matches the design file. Do not
 * tidy them here — they get fixed in Figma first.
 *
 * Every other explanation is invented but internally coherent: it uses the
 * thread's real guest, room and stay, and its sources are the knowledge-base
 * statements the message's own `aiSteps` claim to have searched.
 */

import { AiDraft, AiExplanation, CarrierError, SuggestedFact, TicketSuggestion } from './types';

/* ─────────────────────────────────────────────────────────────────────────
   Explanations, by message id
   ───────────────────────────────────────────────────────────────────────── */

/** The frame's three restaurant bullets, shared by every dining answer. */
const DINING_SOURCES = [
  'On the 1st floor we have the Ithaca Ale House, open from 7:00 AM to 9:00 PM.',
  "On the 5th floor we have Komonz Grill, MIX,  and Red's Place, all open from 12:00 PM to 9:00 PM",
  "Chilli's Grill & Bar is located in the basement level, and is open from 6:00 PM to 3:00 AM",
];

export const aiExplanations: Record<string, AiExplanation> = {
  /* ── Thread 1 · the two DRAWN states ──────────────────────────────────── */

  // SUCCESS — frame 2026:46726, verbatim.
  m4: {
    understood: 'The guest asked a question about the hotel',
    sources: DINING_SOURCES,
    result: "AI successfully responded to the guest's message",
  },

  // NON-RESPONSE — frame 2038:58955, verbatim. Hangs on the GUEST message the
  // agent left alone, which is why it has no message band to recap.
  m3: {
    intro:
      "Based on the context of the guest's message, AI chose not to respond. Review the details below to understand what triggered this decision.",
    understood: 'The guest asked a question about the hotel',
    sources: DINING_SOURCES,
    actionTaken:
      'To prevent miscommunication or further escalation, AI flagged the message for staff so a team member can step in and provide a more thoughtful resolution',
    result: 'AI chose not to respond',
  },

  /* ── Every other AI message ───────────────────────────────────────────── */

  m203: {
    understood: 'The guest asked for extra bath towels to be waiting in the room before arrival',
    sources: [
      'Housekeeping accepts pre-arrival amenity requests until 6:00 PM the day before check-in.',
      'Standard rooms are set with two bath towels; additional linens are complimentary on request',
    ],
    result: "AI successfully responded to the guest's message",
  },

  m2: {
    understood: 'The guest is arriving late because of a delayed flight',
    sources: [
      'The front desk is staffed 24 hours; there is no cut-off for late arrivals.',
      'Late check-out until 3:30 PM is available on this rate for a one-time $40 charge',
      'Elite members may have the late check-out fee waived at the front desk',
    ],
    result: "AI successfully responded to the guest's message",
  },

  /* ── Thread 14 · John Smith ───────────────────────────────────────────── */

  m101: {
    understood: 'The guest is arriving late because of a delayed flight',
    sources: [
      'The front desk is staffed 24 hours; there is no cut-off for late arrivals.',
      'A late-arrival note on the reservation holds the room past the standard release time',
    ],
    result: "AI successfully responded to the guest's message",
  },

  m103: {
    understood: 'The guest asked a question about the hotel',
    sources: DINING_SOURCES,
    result: "AI successfully responded to the guest's message",
  },

  /* ── Thread 3 · Brooklyn Simmons ──────────────────────────────────────── */

  m7: {
    understood: 'The guest asked how check-out works',
    sources: [
      'Standard check-out is 11:00 AM.',
      'Express check-out is available on the in-room TV for stays settled to a card on file',
    ],
    result: "AI successfully responded to the guest's message",
  },

  /* ── Thread 5 · Kristin Watson ────────────────────────────────────────── */

  m11: {
    understood: 'The guest asked whether the hotel has a fitness center',
    sources: [
      'The fitness center is on the 2nd floor and is open 24 hours.',
      'Access is by room keycard; no reservation is required',
    ],
    result: "AI successfully responded to the guest's message",
  },

  /* ── Thread 6 · Liam Johnson ──────────────────────────────────────────── */

  m14: {
    understood: 'The guest asked about parking at the property',
    sources: [
      'Valet parking is $35 per day, with unlimited in-and-out access.',
      'Self-parking in the attached garage is $25 per day',
      'Both valet and self-parking are available 24 hours',
    ],
    result: "AI successfully responded to the guest's message",
  },

  /* ── Thread 7 · Olivia Brown ──────────────────────────────────────────── */

  m17: {
    understood: 'The guest asked about breakfast',
    sources: [
      'The complimentary breakfast buffet is served 6:30 AM to 10:30 AM in the main dining room.',
      'Elite members may take breakfast in the club lounge on the 12th floor',
    ],
    result: "AI successfully responded to the guest's message",
  },

  /* ── Thread 8 · Noah Williams ─────────────────────────────────────────── */

  m20: {
    understood: 'The guest asked what there is to do within walking distance',
    sources: [
      'The property sits in the walkable downtown core, two blocks from the waterfront.',
      'The Museum of the City and the Maritime Gallery are both under a ten-minute walk',
      'The historic district walking tour departs from the lobby at 10:00 AM daily',
      'Guided harbour tours can be booked at the concierge desk as an add-on',
    ],
    result: "AI successfully responded to the guest's message",
  },

  /* ── Thread 9 · Emma Davis ────────────────────────────────────────────── */

  m23: {
    understood: 'The guest asked whether they can check out later than 11:00 AM',
    sources: [
      'Late check-out until 2:00 PM is $50 and is subject to same-day availability.',
      'Housekeeping must be notified before 9:00 AM for an afternoon clean',
      'Elite members may have the late check-out fee waived at the front desk',
    ],
    result: "AI successfully responded to the guest's message",
  },

  /* ── Thread 21 · Hiroshi Tanaka ───────────────────────────────────────── */

  m69: {
    understood: 'The guest asked whether room service runs after midnight',
    sources: [
      'In-room dining is available 24 hours.',
      'The overnight menu is a reduced selection served from 11:00 PM to 6:00 AM',
    ],
    result: "AI successfully responded to the guest's message",
  },

  /* ── Thread 24 · Rachel Green ─────────────────────────────────────────── */

  m75: {
    understood: 'The guest asked about the rooftop bar',
    sources: [
      'The rooftop bar is open daily from 4:00 PM to midnight.',
      'Happy hour runs 4:00 PM to 6:00 PM with half-price cocktails',
    ],
    result: "AI successfully responded to the guest's message",
  },

  /* ── Thread 12 · Maria Garcia (archived) ──────────────────────────────── */

  m44: {
    understood: 'The guest asked for a later check-out on their departure day',
    sources: [
      'Late check-out until 3:00 PM is available on request when the room is not resold.',
      'Housekeeping must be notified before 9:00 AM for an afternoon clean',
      'Guest correspondence is in Spanish; replies should match the language of the request',
    ],
    result: "AI successfully responded to the guest's message",
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   Carrier receipts, by message id
   ───────────────────────────────────────────────────────────────────────── */

/**
 * TWO channels on one failed send, per frame 2040:68902. That is not a mock
 * flourish: production attempts WhatsApp and falls back to SMS, so a single
 * "failed" state can carry two different reasons, and a modal that showed only
 * the last one would send a hotelier to fix the wrong thing.
 */
export const carrierErrorsByMessage: Record<string, CarrierError[]> = {
  // Theresa's failed pre-arrival sign-off on Emily's thread.
  m205: [
    {
      channel: 'WhatsApp',
      code: '21212',
      detail: "The recipient's phone number isn't valid. Please verify the number and try again.",
    },
    {
      channel: 'SMS',
      code: '30006',
      detail: "This guest's number can't receive texts right now. Consider another way to contact them.",
    },
  ],
  // Theresa's failed towel confirmation on Miguel's thread — same pair, because
  // the frame draws the pair and this is the other place a hotelier meets it.
  m5b: [
    {
      channel: 'WhatsApp',
      code: '21212',
      detail: "The recipient's phone number isn't valid. Please verify the number and try again.",
    },
    {
      channel: 'SMS',
      code: '30006',
      detail: "This guest's number can't receive texts right now. Consider another way to contact them.",
    },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   Drafts, facts, tickets, clocks — by THREAD id
   ───────────────────────────────────────────────────────────────────────── */

/**
 * ONE seeded draft, on Chloe Dubois's thread (25), whose last message is an
 * unanswered guest question. The draft answers THAT question.
 *
 * ⚠ Deliberate divergence from frame 2030:47254, which drafts a gym/mini-golf
 * answer into a thread that asked about restaurants — an incoherence the frame
 * audit logged. The card's chrome is the frame's; its body answers the guest
 * who is actually waiting, because a demo where the draft doesn't match the
 * question teaches the reviewer that drafts don't match questions.
 */
export const draftsByThread: Record<string, AiDraft> = {
  '25': {
    id: 'draft-25',
    content:
      'Yes — the spa is open on Sundays from 9:00 AM to 6:00 PM. Treatments book up quickly on weekends, so I can hold a slot for you if you let me know a time.',
    sourceCount: 2,
    aiSteps: [
      { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Chloe Dubois — Room 505, Arriving Mar. 15' },
      { tool: 'Classify_intent', note: 'Amenity Hours Question — Spa' },
      { tool: 'Search_knowledge_base', note: 'Spa Hours — 9:00 AM To 6:00 PM, Seven Days' },
      { tool: 'Check_spa_availability', note: 'Sunday Openings At 10:00 AM And 2:30 PM' },
      { tool: 'Compose_reply', note: 'Confirm Hours, Offer To Hold A Slot' },
    ],
  },
};

/**
 * The suggested-fact QUEUES. Miguel's thread carries the frame's own fact (its
 * conversation is the towels conversation the frame's copy came from) plus a
 * second so the "+1 more" hint and the sequential advance are demo-able.
 * Marco's carries the pool-closure fact from the edit-modal frame — his thread
 * is the one asking when the pool closes, so accepting it is legible.
 */
export const factsByThread: Record<string, SuggestedFact[]> = {
  '2': [
    { id: 'fact-2a', text: 'The property has face towels that can be obtained at the front desk.' },
    { id: 'fact-2b', text: 'Additional linens can be requested from the front desk 24 hours a day.' },
  ],
  '4': [{ id: 'fact-4a', text: "The property's onsite pool is closed today for maintenance." }],
};

/**
 * Marco's thread, room 112 — the frame's own numbers (2042:39216). The band is
 * detected from his earlier bath-towel request, not from the pool question that
 * sits last in the thread.
 */
export const ticketSuggestionsByThread: Record<string, TicketSuggestion> = {
  '4': { room: '112', issueType: 'Bath Towels' },
};

/**
 * Minutes a guest has been left waiting. Lucia's thread (20) is the escalated
 * one — the amber row dot in the list and the amber band above the composer are
 * the same fact, said twice, in the two places a hotelier looks.
 */
export const unansweredMinutesByThread: Record<string, number> = {
  '20': 24,
};
