/**
 * Email Channel — Scripted AI Draft Replies (the "AI" content)
 *
 * This is the AI fork's "future sell" material: for every inbox thread (plus
 * the three simulate-inbound demo beats), a set of content-aware draft replies
 * written in staff voice (Theresa), hotelier-warm and specific to the guest's
 * actual question. There is no live LLM here — these are hand-authored so the
 * demo is deterministic.
 *
 * Per thread we author:
 *   - `variants`  — TWO full drafts. "Regenerate" cycles between them.
 *   - `short`     — a ~2-sentence draft. "Shorten" swaps to it (a directed
 *                   transform, which reads more capable than blind regenerate).
 *   - `policyChip`— one static grounding chip naming the property policy /
 *                   record the draft leans on. Rendered alongside dynamic
 *                   grounding chips the card builds from canonical data (the
 *                   linked reservation + the guest's loyalty tier), so the demo
 *                   shows WHAT the reply is grounded in — the trust cue generic
 *                   email clients can't offer.
 *
 * Keys are thread IDs and MUST cover every seeded inbox thread in mock-data.ts
 * AND the simulate-inbound beats in store.ts (email-sarah reply, the new
 * email-sim-sophia thread, email-brooklyn escalation reply). Content answers
 * the LATEST inbound question — for Sarah and Brooklyn that's the simulate
 * follow-up (bag storage / the $45 escalation), which the money-shot lands on.
 */

import {
  mdiClockOutline,
  mdiReceiptTextOutline,
  mdiBedOutline,
  mdiGlassCocktail,
  mdiBagSuitcaseOutline,
  mdiWeightLifter,
  mdiCalendarBlankOutline,
  mdiFileDocumentOutline,
  mdiCarOutline,
  mdiAccountGroupOutline,
} from '@mdi/js';

/** One static grounding chip: the property policy/record the draft leans on. */
export interface PolicyChip {
  label: string;
  /** An @mdi/js outline path string. */
  icon: string;
}

export interface AiDraft {
  /** Two full drafts — "Regenerate" cycles between them. */
  variants: readonly [string, string];
  /** ~2-sentence draft — "Shorten" swaps to it. */
  short: string;
  /** Static grounding chip naming the policy/record behind the reply. */
  policyChip: PolicyChip;
}

const DRAFTS: Record<string, AiDraft> = {
  // Emily — early check-in fee + valet/self-park
  'email-emily': {
    variants: [
      "Hi Emily,\n\nGreat questions! There's no fee for early check-in — I've flagged your reservation so our front desk prioritizes your noon arrival on the 18th. If the room needs a little longer, we'll happily store your bags so you can start your day.\n\nFor parking, we offer valet on site as well as a self-park garage a block away, so either option works for you.\n\nWarm regards,\nTheresa",
      "Hi Emily,\n\nHappy to help! Early check-in is complimentary and based on availability — I've noted your noon arrival and we'll do our best to have the room ready. If it isn't quite set, we'll hold your luggage in the meantime.\n\nWe have both valet parking and a nearby self-park garage, whichever you'd prefer.\n\nBest,\nTheresa",
    ],
    short:
      "Hi Emily — early check-in is complimentary and we've flagged your noon arrival; we'll hold your bags if the room needs a little longer. Valet and nearby self-parking are both available.\n\nTheresa",
    policyChip: { label: 'Policy · Early check-in', icon: mdiClockOutline },
  },

  // Noah — arriving late (~11pm), is the front desk open?
  'email-noah': {
    variants: [
      'Hi Noah,\n\nNot to worry at all — our front desk is staffed 24 hours a day, so someone will be here to welcome you and check you in whenever you arrive, even at 11pm. Safe travels, and see you soon!\n\nWarm regards,\nTheresa',
      'Hi Noah,\n\nAbsolutely — we have front desk coverage around the clock, so an 11pm arrival is no problem at all. We’ll have everything ready for a smooth late check-in.\n\nBest,\nTheresa',
    ],
    short:
      'Hi Noah — our front desk is staffed 24/7, so an 11pm arrival is no problem at all. See you then!\n\nTheresa',
    policyChip: { label: 'Policy · Front desk 24/7', icon: mdiClockOutline },
  },

  // Brooklyn — the $45 "miscellaneous" charge dispute / escalation
  'email-brooklyn': {
    variants: [
      "Hi Brooklyn,\n\nI'm so sorry for the confusion and the back-and-forth on this. I looked into the $45 “miscellaneous” line again — it was a housekeeping charge applied in error and it should not have been on your folio. I'm having it removed today, and you'll receive an updated folio reflecting the correction by tonight.\n\nThank you for your patience, and again, my apologies for the trouble.\n\nWarm regards,\nTheresa",
      "Hi Brooklyn,\n\nApologies for the runaround — you're right to question it. The $45 was a housekeeping charge added in error. I'm removing it today and will send a corrected folio tonight so you have it in time to submit your expenses.\n\nThank you for flagging this, and sorry again for the hassle.\n\nBest,\nTheresa",
    ],
    short:
      "Hi Brooklyn — apologies for the trouble; the $45 was a housekeeping charge added in error. I'm removing it today and you'll have a corrected folio tonight.\n\nTheresa",
    policyChip: { label: 'Folio · Nov 21 charge', icon: mdiReceiptTextOutline },
  },

  // Kristin — high floor / city view for husband's birthday
  'email-kristin': {
    variants: [
      "Hi Kristin,\n\nWhat a wonderful occasion! I've added a request for a high-floor room with a city view to your reservation for your husband's birthday. While final room assignment happens at check-in, we'll do everything we can to make it special.\n\nWarm regards,\nTheresa",
      'Hi Kristin,\n\nHappy early birthday to your husband! I’ve noted a high floor with a city view on your reservation. We can’t guarantee it until arrival, but our team will make every effort to accommodate.\n\nBest,\nTheresa',
    ],
    short:
      "Hi Kristin — I've requested a high floor with a city view for your husband's birthday. We can't guarantee it until arrival, but we'll do our best.\n\nTheresa",
    policyChip: { label: 'Policy · Room preferences', icon: mdiBedOutline },
  },

  // Olivia — is the rooftop bar open on weeknights?
  'email-olivia': {
    variants: [
      'Hi Olivia,\n\nHappy anniversary! Yes — our rooftop bar is open on weeknights from 4pm to 11pm, so you’ll have plenty of time to enjoy a drink with the view. If you’d like, I’m glad to reserve a table for the two of you.\n\nWarm regards,\nTheresa',
      'Hi Olivia,\n\nCongratulations on your anniversary! The rooftop bar is indeed open on weeknights (4–11pm). Come on up — and just say the word if you’d like me to hold a spot for you.\n\nBest,\nTheresa',
    ],
    short:
      'Hi Olivia — yes, the rooftop bar is open weeknights from 4–11pm. Happy to reserve a table if you’d like!\n\nTheresa',
    policyChip: { label: 'Policy · Rooftop bar hours', icon: mdiGlassCocktail },
  },

  // Sarah — late checkout + (simulate follow-up) bag storage after checkout
  'email-sarah': {
    variants: [
      "Hi Sarah,\n\nOf course — we'd be glad to hold your bags at the front desk after checkout until you head to the airport, so you can enjoy the day luggage-free. Your late checkout is all set as well. Safe travels, and enjoy the rest of your stay!\n\nWarm regards,\nTheresa",
      "Hi Sarah,\n\nHappy to help! We'll keep your bags securely at the front desk after checkout until your evening flight — just swing by whenever you're ready. Your late checkout is confirmed too.\n\nBest,\nTheresa",
    ],
    short:
      "Hi Sarah — of course, we'll hold your bags at the front desk after checkout until your evening flight. Your late checkout is set too!\n\nTheresa",
    policyChip: { label: 'Policy · Luggage storage', icon: mdiBagSuitcaseOutline },
  },

  // James — two room-service charges on the same night; duplicate check
  'email-james': {
    variants: [
      "Hi James,\n\nGood catch — I re-checked the folio with our F&B team. You're right that two room-service charges posted on the same night, and one was a duplicate entry. I've removed the duplicate, and a corrected receipt is on its way to your inbox now.\n\nBest,\nTheresa",
      'Hi James,\n\nThanks for your patience. I reviewed the two room-service charges from that night with our team — the second was posted in error. It’s been removed, and I’m sending an updated itemized receipt shortly.\n\nWarm regards,\nTheresa',
    ],
    short:
      "Hi James — you're right, one of the two room-service charges was a duplicate. I've removed it and a corrected receipt is on its way.\n\nTheresa",
    policyChip: { label: 'Folio · Room service', icon: mdiReceiptTextOutline },
  },

  // Priya — fitness center + hours
  'email-priya': {
    variants: [
      'Hi Priya,\n\nHappy to help! Our fitness center is open 24 hours a day for all guests, located on the second floor — just use your room key for access. Enjoy your stay!\n\nWarm regards,\nTheresa',
      'Hi Priya,\n\nYes, we do! The fitness center is available around the clock on the second floor, accessible with your room key anytime.\n\nBest,\nTheresa',
    ],
    short:
      'Hi Priya — our fitness center is open 24 hours on the second floor, accessible with your room key. Enjoy your stay!\n\nTheresa',
    policyChip: { label: 'Policy · Fitness center', icon: mdiWeightLifter },
  },

  // Nina — champagne in room for 10th anniversary (thread CCs partner)
  'email-nina': {
    variants: [
      "Hi Nina,\n\nHappy 10th anniversary! We'd be delighted to have a chilled bottle of champagne waiting in your room when you arrive. I've added it to your reservation — consider it our gift to help you celebrate.\n\nWarm regards,\nTheresa",
      'Hi Nina,\n\nCongratulations on 10 years! I’ve arranged for a bottle of champagne to be waiting in your room at arrival. It would be our pleasure to help make the occasion memorable.\n\nBest,\nTheresa',
    ],
    short:
      'Hi Nina — happy 10th anniversary! We’ll have a bottle of champagne waiting in your room when you arrive.\n\nTheresa',
    policyChip: { label: 'Amenity · Champagne', icon: mdiGlassCocktail },
  },

  // Hannah — move couples massage 2pm -> 4pm
  'email-hannah': {
    variants: [
      "Hi Hannah,\n\nDone! I've moved your couples massage from 2pm to 4pm on the day of check-in, which gives you plenty of time after your midday train. You'll receive an updated spa confirmation shortly.\n\nWarm regards,\nTheresa",
      'Hi Hannah,\n\nHappy to help — your couples massage is now rescheduled to 4pm on check-in day, giving you a relaxed window after you arrive. An updated confirmation is on its way.\n\nBest,\nTheresa',
    ],
    short:
      'Hi Hannah — done! Your couples massage is moved to 4pm on check-in day, and an updated confirmation is on its way.\n\nTheresa',
    policyChip: { label: 'Spa · Booking change', icon: mdiCalendarBlankOutline },
  },

  // Rob — review + flag broken room safe
  'email-robert': {
    variants: [
      "Hi Rob,\n\nThank you so much for the kind words — I'll be sure to share them with our team! And thank you for flagging the room safe; I've sent it to maintenance to repair right away so the next guest isn't affected. We really appreciate you letting us know.\n\nWarm regards,\nTheresa",
      "Hi Rob,\n\nWe're thrilled you enjoyed your stay — thank you for offering to leave a review! I've also passed your note about the room safe to our maintenance team so it's fixed promptly. Grateful for the heads up.\n\nBest,\nTheresa",
    ],
    short:
      "Hi Rob — thank you for the kind words and for flagging the room safe; I've sent it to maintenance to fix right away.\n\nTheresa",
    policyChip: { label: 'Maintenance · Room safe', icon: mdiFileDocumentOutline },
  },

  // Yuki — itemized receipt with taxes broken out (expense report)
  'email-yuki': {
    variants: [
      "Hi Yuki,\n\nOf course — I've prepared an itemized receipt with the room charges and taxes broken out separately for your expense report, and it's attached to this email. Let me know if you need anything else for your records.\n\nWarm regards,\nTheresa",
      'Hi Yuki,\n\nHappy to help with your expense report. Attached is an itemized receipt showing room charges and taxes as separate line items. Just reply if you’d like it in a different format.\n\nBest,\nTheresa',
    ],
    short:
      'Hi Yuki — attached is an itemized receipt with room charges and taxes broken out separately for your expense report.\n\nTheresa',
    policyChip: { label: 'Folio · Itemized receipt', icon: mdiReceiptTextOutline },
  },

  // Carlos — is parking included?
  'email-carlos': {
    variants: [
      'Hi Carlos,\n\nSee you tomorrow! To answer your question: self-parking is included with your room at no extra charge, and valet is available for a nightly fee if you’d prefer. Safe travels in!\n\nWarm regards,\nTheresa',
      'Hi Carlos,\n\nLooking forward to your arrival! Parking is included with your reservation — just use our on-site garage. We also offer valet if you’d like it. See you tomorrow.\n\nBest,\nTheresa',
    ],
    short:
      'Hi Carlos — self-parking is included with your room, and valet is available for a nightly fee. See you tomorrow!\n\nTheresa',
    policyChip: { label: 'Policy · Parking', icon: mdiCarOutline },
  },

  // Rebecca Nolan (UNLINKED) — group room block inquiry
  'email-events': {
    variants: [
      "Hi Rebecca,\n\nThank you for considering The Statler for your October conference! We'd love to host your group of 25. I'm connecting you with our group sales team, who will send over our conference rates, availability for your dates, and details on our on-site meeting space. You can expect their note shortly.\n\nWarm regards,\nTheresa",
      'Hi Rebecca,\n\nWe’d be delighted to help with your October room block. For 25 rooms plus meeting space, our group sales team can put together the best rates and confirm availability — I’ve looped them in and they’ll follow up with a full proposal.\n\nBest,\nTheresa',
    ],
    short:
      "Hi Rebecca — we'd love to host your October block of 25. I've looped in our group sales team to send rates, availability, and meeting-space details.\n\nTheresa",
    policyChip: { label: 'Policy · Group bookings', icon: mdiAccountGroupOutline },
  },

  // Sophia (simulate beat: new thread) — airport shuttle, ~3pm arrival on the 22nd
  'email-sim-sophia': {
    variants: [
      "Hi Sophia,\n\nWe'd be happy to arrange your airport transfer! Our shuttle runs every 30 minutes from Terminal B, so with your 3pm landing we'll have you booked on the 3:30pm departure — just look for the Statler shuttle at the ground transportation curb. We look forward to welcoming you on the 22nd!\n\nWarm regards,\nTheresa",
      'Hi Sophia,\n\nAbsolutely — our shuttle departs Terminal B every 30 minutes. Given your 3pm arrival, I’ve reserved the 3:30pm pickup for you; our driver will be waiting at the Terminal B curb with a Statler sign. Safe travels, and see you on the 22nd!\n\nBest,\nTheresa',
    ],
    short:
      "Hi Sophia — our shuttle runs every 30 minutes from Terminal B; with your 3pm landing, I've booked you on the 3:30pm pickup. See you on the 22nd!\n\nTheresa",
    policyChip: { label: 'Policy · Airport shuttle', icon: mdiCarOutline },
  },
};

/** The full scripted draft record for a thread, or undefined if none authored. */
export function getDraft(threadId: string): AiDraft | undefined {
  return DRAFTS[threadId];
}

/** Whether a thread has any scripted draft content. */
export function hasDraft(threadId: string): boolean {
  return threadId in DRAFTS;
}
