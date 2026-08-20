/**
 * Messaging Mock Data
 *
 * Thread and message data that references canonical guests and reservations.
 *
 * ⚠ The guest-journey scheduled-message log used to live here as a hand-typed
 * literal (`gjMessages` / `gjMessageStatus`). It moved to
 * `guest-journey-link.ts` and is now COMPILED from the guest-journey product's
 * own campaigns, so the panel and the product that sends the messages can no
 * longer disagree about what a touchpoint is called. See that file's header.
 */

import { Thread, Message } from './types';


/**
 * Mock threads - link to canonical guest and reservation IDs
 */
export const mockThreads: Thread[] = [
  // Multi-reservation thread (1 auto-linked + 3 manually linked)
  {
    id: '14',
    assignedTo: { type: 'user', id: 'u-wenjun', name: 'Wenjun Li', departmentId: 'dept-front-office' },
    contactNumber: '+16507665555',
    // John Smith (guest-john-s) is auto-linked across three stays — a past solo
    // work trip, the current in-house stay, and a future stay (all same phone).
    // Sarah Smith (guest-sarah-s) booked her own upcoming stay on the SAME phone —
    // she auto-links too, and her differing name appears on her own stay row
    // inside the primary card (never-collapse-names rule).
    // James Brady / Ethan Parker / Liam Carter are manually linked (different phones).
    linkedReservationIds: ['res-john-jul', 'res-john-feb-past', 'res-john-sep', 'res-sarah-s-nov', 'res-james-jul', 'res-ethan-jul', 'res-liam-aug'],
    lastMessage: "Here are some nearby restaurant recommendations: Ithaca Ale House, Komonz Grill, MIX, Red's Place, and Chili's Grill & Bar. The hotel also recommends Il Ristorante Alga, Coltivare, Moosewood Restaurant, and Gola Osteria. Let me know if you need more assistance!",
    lastMessageAt: new Date('2026-03-16T10:04:00'),
    isUnread: true,
    status: 'inbox',
  },
  // Single manually-linked reservation (phone doesn't match)
  {
    id: '15',
    assignedTo: { type: 'department', id: 'dept-housekeeping', name: 'Housekeeping' },
    contactNumber: '+13305559999',
    linkedReservationIds: ['res-emerson-jun'],
    lastMessage: 'Hi, I wanted to confirm my reservation for next month.',
    lastMessageAt: new Date('2026-03-16T09:50:00'),
    isUnread: true,
    status: 'inbox',
  },
  /**
   * THE ANONYMOUS THREAD — no linked reservations, so there is no guest, no
   * avatar and no name: the phone number IS the conversation. The panel has a
   * whole root variant for this state (thread details instead of a guest
   * profile, "Link guest" instead of a reservation count), and it is the ~norm
   * for an inbound number the PMS has never seen.
   */
  {
    id: '16',
    contactNumber: '+12125550000',
    linkedReservationIds: [],
    lastMessage: 'Is there availability for this weekend?',
    lastMessageAt: new Date('2026-03-16T09:30:00'),
    isUnread: false,
    status: 'inbox',
  },
  // Single auto-linked threads (existing guests — phone matches contactNumber)
  /**
   * THE EXEMPLAR THREAD for the Conversation Details panel. It sorts to the top
   * of the inbox (newest message), so it is what the panel opens on.
   *
   * Emily Smith owns FOUR of these stays — the in-house one, a reserved one, and
   * two past ones — which is where "Emily's Reservations → 4" and the whole
   * Reservations drill-in come from. The other three are COMPANIONS: Nathan
   * Reyes and Claire Whitfield share Emily's phone (so they auto-link, and they
   * are the "Set primary guest" picker's candidates), and James Brady is a
   * staff-made link on his own number (so his row is the one that can actually
   * be unlinked).
   */
  {
    id: '1',
    assignedTo: { type: 'user', id: 'u-miguel', name: 'Miguel Santana', departmentId: 'dept-front-office' },
    contactNumber: '+15005550012',
    linkedReservationIds: [
      'res-emily-jul',
      'res-emily-sep',
      'res-emily-feb-past',
      'res-emily-nov-past',
      'res-nathan-jul',
      'res-claire-aug',
      'res-james-jul',
    ],
    lastMessage: "Here are some nearby restaurant recommendations: Ithaca Ale House, Komonz Grill, MIX, Red's Place, and Chili's Grill & Bar. The hotel also recommends Il Ristorante Alga, Coltivare, Moosewood Restaurant, and Gola Osteria. Let me know if you need more assistance!",
    lastMessageAt: new Date('2026-03-16T18:32:00'),
    isUnread: true,
    status: 'inbox',
  },
  {
    id: '2',
    assignedTo: { type: 'department', id: 'dept-housekeeping', name: 'Housekeeping' },
    contactNumber: '+15005550013',
    linkedReservationIds: ['res-miguel-nov'],
    lastMessage: "Of course — I'll have extra face towels sent up to your room right away.",
    lastMessageAt: new Date('2026-03-16T10:07:00'),
    isUnread: true,
    status: 'inbox',
    isFlagged: true,
  },
  {
    id: '3',
    contactNumber: '+15005550014',
    linkedReservationIds: ['res-brooklyn-nov'],
    lastMessage: 'Got it, thanks.',
    lastMessageAt: new Date('2026-03-16T10:04:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '4',
    assignedTo: { type: 'user', id: 'u-david', name: 'David Chen', departmentId: 'dept-housekeeping' },
    contactNumber: '+15005550015',
    linkedReservationIds: ['res-marco-nov'],
    lastMessage: 'What time will the pool close?',
    lastMessageAt: new Date('2026-03-16T10:04:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '5',
    assignedTo: { type: 'department', id: 'dept-food-beverage', name: 'Food and Beverage' },
    contactNumber: '+15005550016',
    linkedReservationIds: ['res-kristin-nov'],
    lastMessage: "Great. That's super helpful.",
    lastMessageAt: new Date('2026-03-16T10:04:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '6',
    contactNumber: '+15005550017',
    linkedReservationIds: ['res-liam-nov'],
    lastMessage: 'Awesome! That really clears things up.',
    lastMessageAt: new Date('2026-03-16T10:04:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '7',
    assignedTo: { type: 'user', id: 'u-wenjun', name: 'Wenjun Li', departmentId: 'dept-front-office' },
    contactNumber: '+15005550018',
    linkedReservationIds: ['res-olivia-nov'],
    lastMessage: 'Fantastic! This is exactly what I needed.',
    lastMessageAt: new Date('2026-03-16T10:04:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '8',
    contactNumber: '+15005550019',
    linkedReservationIds: ['res-noah-nov'],
    lastMessage: 'Perfect! This information is incredibly useful.',
    lastMessageAt: new Date('2026-03-16T10:04:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '9',
    assignedTo: { type: 'department', id: 'dept-front-office', name: 'Front Office' },
    contactNumber: '+15005550024',
    linkedReservationIds: ['res-emma-nov'],
    lastMessage: 'Excellent! I appreciate your help with this.',
    lastMessageAt: new Date('2026-03-16T10:04:00'),
    isUnread: false,
    status: 'inbox',
  },
  // New guest threads
  {
    id: '17',
    contactNumber: '+15005550040',
    linkedReservationIds: ['res-priya-nov'],
    lastMessage: 'Could you arrange a taxi to the airport for tomorrow at 6 AM?',
    lastMessageAt: new Date('2026-03-16T09:15:00'),
    isUnread: true,
    status: 'inbox',
  },
  {
    id: '18',
    contactNumber: '+15005550042',
    linkedReservationIds: ['res-yuki-nov'],
    lastMessage: 'Is there a Japanese restaurant nearby you would recommend?',
    lastMessageAt: new Date('2026-03-16T08:50:00'),
    isUnread: true,
    status: 'inbox',
  },
  {
    id: '19',
    contactNumber: '+15005550043',
    linkedReservationIds: ['res-fatima-nov'],
    lastMessage: 'Thank you for the upgrade, the suite is beautiful!',
    lastMessageAt: new Date('2026-03-16T10:00:00'),
    isUnread: false,
    status: 'inbox',
  },
  // Escalated conversation — an unresolved complaint (room 226). The row's
  // attention dot renders amber (warning), mirroring production's `is_escalated`
  // `.isEscalated` variant.
  {
    id: '20',
    assignedTo: { type: 'department', id: 'dept-food-beverage', name: 'Food and Beverage' },
    contactNumber: '+15005550045',
    linkedReservationIds: ['res-lucia-nov'],
    lastMessage: "I've been waiting over an hour for the extra blankets and room 226 is freezing. No one has come by — this is really disappointing.",
    lastMessageAt: new Date('2026-03-16T07:30:00'),
    isUnread: true,
    status: 'inbox',
    isEscalated: true,
  },
  {
    id: '21',
    contactNumber: '+15005550050',
    linkedReservationIds: ['res-hiroshi-nov'],
    lastMessage: 'The room service menu — is it available after midnight?',
    lastMessageAt: new Date('2026-03-15T23:45:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '22',
    contactNumber: '+15005550057',
    linkedReservationIds: ['res-ingrid-nov'],
    lastMessage: 'Perfect, I will pick up the key at the front desk.',
    lastMessageAt: new Date('2026-03-15T16:20:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '23',
    contactNumber: '+15005550063',
    linkedReservationIds: ['res-thomas-k-nov'],
    lastMessage: 'Do you have a business center or somewhere I can print documents?',
    lastMessageAt: new Date('2026-03-16T08:00:00'),
    isUnread: true,
    status: 'inbox',
  },
  {
    id: '24',
    contactNumber: '+15005550064',
    linkedReservationIds: ['res-rachel-nov'],
    lastMessage: 'Thank you, that was very helpful!',
    lastMessageAt: new Date('2026-03-15T15:30:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '25',
    contactNumber: '+15005550066',
    linkedReservationIds: ['res-chloe-nov'],
    lastMessage: 'Is the spa open on Sundays?',
    lastMessageAt: new Date('2026-03-16T09:00:00'),
    isUnread: true,
    status: 'inbox',
  },
  {
    id: '26',
    contactNumber: '+15005550067',
    linkedReservationIds: ['res-andre-nov'],
    lastMessage: 'All good now, the AC is working fine.',
    lastMessageAt: new Date('2026-03-15T22:10:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '27',
    contactNumber: '+15005550068',
    linkedReservationIds: ['res-maya-nov'],
    lastMessage: 'We loved the complimentary breakfast. Thank you!',
    lastMessageAt: new Date('2026-03-16T10:30:00'),
    isUnread: false,
    status: 'inbox',
  },
  // Archived conversations
  {
    id: '10',
    assignedTo: { type: 'user', id: 'u-miguel', name: 'Miguel Santana', departmentId: 'dept-front-office' },
    contactNumber: '+15005550020',
    linkedReservationIds: ['res-sarah-nov'],
    lastMessage: 'Thank you so much for the wonderful stay! Everything was perfect.',
    lastMessageAt: new Date('2026-03-12T11:30:00'),
    isUnread: false,
    status: 'archived',
  },
  {
    id: '11',
    contactNumber: '+15005550021',
    linkedReservationIds: ['res-james-nov'],
    lastMessage: 'All set, thanks for resolving the WiFi issue.',
    lastMessageAt: new Date('2026-03-11T16:45:00'),
    isUnread: false,
    status: 'archived',
  },
  {
    id: '12',
    assignedTo: { type: 'user', id: 'u-david', name: 'David Chen', departmentId: 'dept-housekeeping' },
    contactNumber: '+15005550022',
    linkedReservationIds: ['res-maria-nov'],
    lastMessage: 'Perfect, the late checkout worked out great. See you next time!',
    lastMessageAt: new Date('2026-03-10T14:20:00'),
    isUnread: false,
    status: 'archived',
  },
  {
    id: '13',
    contactNumber: '+15005550023',
    linkedReservationIds: ['res-robert-nov'],
    lastMessage: 'Appreciate all your help with the room upgrade and restaurant reservations!',
    lastMessageAt: new Date('2026-03-09T10:15:00'),
    isUnread: false,
    status: 'archived',
  },
];

/**
 * Mock messages - organized by thread ID
 *
 * ── AI STEPS ──────────────────────────────────────────────────────────────
 * `aiSteps` is UNIVERSAL AI-message anatomy, not a garnish on a hero message:
 * every `sender: 'ai'` message below carries a trace that plausibly produces
 * that exact reply, and every one of them also carries a `sourceCount` (2–4).
 * The card is closed by default; the "Completed N Steps" caption opens it.
 *
 * Narratives are invented but internally coherent — they use the thread's real
 * guest, room and stay dates, and the tool sequence matches the shape of the
 * answer (a dining reply searches places and ranks them; a late-arrival
 * acknowledgment looks up the reservation and flags the front desk).
 *
 * ⚠ ONE deliberate exception: thread '1' / `m2` carries the FRAME's six steps
 * verbatim (frame `steps-open`), which name "Room 504, Checking Out Today" and
 * "Gold Elite" while Emily is room 153, Diamond Elite, arriving. That
 * incoherence is a known Figma copy nit already logged in REDESIGN_NOTES
 * ("Chain-of-thoughts says Room 504 vs Emily's 153") — it is reproduced on
 * purpose so the exemplar matches the design file. Do not "fix" it here.
 */
export const mockMessages: Record<string, Message[]> = {
  // Phone-only thread (no reservation linked)
  '14': [
    {
      id: 'm100',
      threadId: '14',
      sender: 'guest',
      content: 'I will arrive late today. My flight is delayed.',
      timestamp: new Date('2026-03-16T17:10:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm101',
      threadId: '14',
      sender: 'ai',
      content: 'Thanks for letting us know!',
      timestamp: new Date('2026-03-16T17:25:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 2,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found John Smith — Room 504, Checking In Today' },
        { tool: 'Classify_intent', note: 'Late Arrival Notice — Flight Delay' },
        { tool: 'Search_knowledge_base', note: 'Front Desk Staffed 24 Hours — No Action Required' },
        { tool: 'Update_reservation_note', note: 'Late Arrival Flagged For The Front Desk' },
        { tool: 'Decision', note: 'Acknowledge Only — No Follow-Up Needed' },
      ],
    },
    {
      id: 'm102',
      threadId: '14',
      sender: 'guest',
      content: 'Give me a list of nearby restaurants',
      timestamp: new Date('2026-03-16T18:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm103',
      threadId: '14',
      sender: 'ai',
      content: "Here are some nearby restaurant recommendations: Ithaca Ale House, Komonz Grill, MIX, Red's Place, and Chili's Grill & Bar. The hotel also recommends Il Ristorante Alga, Coltivare, Moosewood Restaurant, and Gola Osteria. Let me know if you need more assistance!",
      timestamp: new Date('2026-03-16T18:32:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 3,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found John Smith — Room 504, In-House Through Jul. 15' },
        { tool: 'Classify_intent', note: 'Dining Recommendation Request' },
        { tool: 'Search_knowledge_base', note: 'Hotel Dining Guide — 4 Partner Restaurants' },
        { tool: 'Search_local_places', note: '5 Restaurants Within Half A Mile' },
        { tool: 'Check_guest_preferences', note: 'No Dietary Restrictions On File' },
        { tool: 'Rank_results', note: 'Partner Venues First, Then Nearest' },
        { tool: 'Compose_reply', note: '9 Venues Listed, Follow-Up Offered' },
      ],
    },
  ],
  // Thread 15 — single manually-linked reservation
  '15': [
    {
      id: 'm104',
      threadId: '15',
      sender: 'guest',
      content: 'Hi, I wanted to confirm my reservation for next month.',
      timestamp: new Date('2026-03-16T09:50:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Thread 16 — empty/unlinked thread
  '16': [
    {
      id: 'm105',
      threadId: '16',
      sender: 'guest',
      content: 'Is there availability for this weekend?',
      timestamp: new Date('2026-03-16T09:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Emily Smith's conversation
  '1': [
    // ── Day before (2026-03-15) — pre-arrival ──
    {
      id: 'm200',
      threadId: '1',
      sender: 'guest',
      content: "Hi, I'm checking in tomorrow. Could I request a late checkout on my departure day?",
      timestamp: new Date('2026-03-15T14:20:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm201',
      threadId: '1',
      sender: 'staff',
      content: "Hi Emily! Welcome — as a Diamond Elite member we've noted a complimentary 2:00 PM late checkout for your departure. See you tomorrow!",
      timestamp: new Date('2026-03-15T14:35:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm202',
      threadId: '1',
      sender: 'guest',
      content: 'Wonderful, thank you. Could you also have some extra bath towels waiting in the room?',
      timestamp: new Date('2026-03-15T15:10:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm203',
      threadId: '1',
      sender: 'ai',
      content: "Absolutely — I've added extra bath towels to your room ahead of arrival. Anything else I can prepare for you?",
      timestamp: new Date('2026-03-15T15:12:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 2,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Emily Smith — Room 153, Arriving Tomorrow' },
        { tool: 'Classify_intent', note: 'Amenity Request — Extra Bath Towels' },
        { tool: 'Check_room_status', note: 'Room 153 Vacant — Pre-Arrival Prep Window Open' },
        { tool: 'Create_service_ticket', note: 'Housekeeping — 2 Extra Bath Towels Before Arrival' },
        { tool: 'Compose_reply', note: 'Confirm Request, Invite Further Prep' },
      ],
    },
    {
      id: 'm204',
      threadId: '1',
      sender: 'guest',
      content: "That's all for now, thanks so much!",
      timestamp: new Date('2026-03-15T15:40:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    // FAILED-SEND EXEMPLAR. The failed state itself is unchanged production
    // logic; only its footer register moved — a red underlined caption link
    // ("MESSAGE FAILED TO SEND") replaces the old red row + alert icon +
    // "Learn more" pair. Lives on thread '1' with the other two exemplars so
    // one screen shows all three footer registers.
    {
      id: 'm205',
      threadId: '1',
      sender: 'staff',
      content: 'My pleasure! We look forward to welcoming you.',
      timestamp: new Date('2026-03-15T16:05:00'),
      channel: 'SMS',
      status: 'failed',
    },
    // ── Arrival day (2026-03-16) ──
    {
      id: 'm1',
      threadId: '1',
      sender: 'guest',
      content: 'I will arrive late today. My flight is delayed.',
      timestamp: new Date('2026-03-16T17:10:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    // PRIMARY STEPS EXEMPLAR — the frame's six steps, VERBATIM (see the
    // module header for why the room/tier facts deliberately disagree with
    // Emily's actual reservation).
    {
      id: 'm2',
      threadId: '1',
      sender: 'ai',
      content: 'Thanks for letting us know!',
      timestamp: new Date('2026-03-16T17:25:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 3,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Emily Smith — Room 504, Checking Out Today' },
        { tool: 'Offer_upsells', note: 'Late Check-Out Is Available For This Stay' },
        { tool: 'Search_upsells', note: 'Late Check-Out Until 3:30 PM — $40, One-Time Charge' },
        { tool: 'Guest Profile', note: 'Gold Elite — Fee Can Be Waived' },
        { tool: 'Create_service_ticket', note: 'Housekeeping Notified — Afternoon Clean For Room 504' },
        { tool: 'Decision', note: 'Approve — Offer 3:30 PM Checkout' },
      ],
    },
    // AI-DECLINED EXEMPLAR — the frame puts it on this message.
    {
      id: 'm3',
      threadId: '1',
      sender: 'guest',
      content: 'Give me a list of nearby restaurants',
      timestamp: new Date('2026-03-16T18:30:00'),
      channel: 'SMS',
      status: 'delivered',
      aiDeclined: true,
    },
    {
      id: 'm4',
      threadId: '1',
      sender: 'ai',
      content: "Here are some nearby restaurant recommendations: Ithaca Ale House, Komonz Grill, MIX, Red's Place, and Chili's Grill & Bar. The hotel also recommends Il Ristorante Alga, Coltivare, Moosewood Restaurant, and Gola Osteria. Let me know if you need more assistance!",
      timestamp: new Date('2026-03-16T18:32:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 3,
      // The frame's hover state names this one "Completed 8 Steps".
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Emily Smith — Room 153, In-House Through Jul. 15' },
        { tool: 'Classify_intent', note: 'Dining Recommendation Request' },
        { tool: 'Get_property_profile', note: 'Statler New York — Downtown, Walkable Core' },
        { tool: 'Search_knowledge_base', note: 'Hotel Dining Guide — 4 Partner Restaurants' },
        { tool: 'Search_local_places', note: '5 Restaurants Within Half A Mile' },
        { tool: 'Check_guest_preferences', note: 'No Dietary Restrictions On File' },
        { tool: 'Rank_results', note: 'Partner Venues First, Then Nearest' },
        { tool: 'Compose_reply', note: '9 Venues Listed, Follow-Up Offered' },
      ],
    },
  ],
  // Miguel's conversation
  '2': [
    {
      id: 'm5',
      threadId: '2',
      sender: 'guest',
      content: 'Can I have extra face towels to the room please?',
      timestamp: new Date('2026-03-16T10:04:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    // Failed outbound — exercises the production "Failed to send" treatment
    // (red row + alert icon + Learn more) in MessageBubble.
    {
      id: 'm5b',
      threadId: '2',
      sender: 'staff',
      content: "Of course — I'll have extra face towels sent up to your room right away.",
      timestamp: new Date('2026-03-16T10:07:00'),
      channel: 'SMS',
      status: 'failed',
    },
  ],
  // Brooklyn's conversation
  '3': [
    {
      id: 'm6',
      threadId: '3',
      sender: 'guest',
      content: 'What are the check-out procedures?',
      timestamp: new Date('2026-03-16T09:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm7',
      threadId: '3',
      sender: 'ai',
      content: 'Check-out time is 11:00 AM. You can check out at the front desk or use express check-out through the TV in your room.',
      timestamp: new Date('2026-03-16T09:32:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 2,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Brooklyn Simmons — Room 130, Departing Mar. 18' },
        { tool: 'Classify_intent', note: 'Check-Out Process Question' },
        { tool: 'Search_knowledge_base', note: 'Check-Out Policy — 11:00 AM Standard' },
        { tool: 'Check_express_checkout_eligibility', note: 'In-Room TV Check-Out Enabled For This Stay' },
        { tool: 'Compose_reply', note: 'State The Time, Name Both Methods' },
      ],
    },
    {
      id: 'm8',
      threadId: '3',
      sender: 'guest',
      content: 'Got it, thanks.',
      timestamp: new Date('2026-03-16T10:04:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Marco's conversation
  '4': [
    {
      id: 'm9',
      threadId: '4',
      sender: 'guest',
      content: 'What time will the pool close?',
      timestamp: new Date('2026-03-16T10:04:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Kristin's conversation
  '5': [
    {
      id: 'm10',
      threadId: '5',
      sender: 'guest',
      content: 'Is there a gym in the hotel?',
      timestamp: new Date('2026-03-16T09:45:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm11',
      threadId: '5',
      sender: 'ai',
      content: 'Yes! Our fitness center is on the 2nd floor and is open 24/7 for all guests.',
      timestamp: new Date('2026-03-16T09:46:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 2,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Kristin Watson — Room 130, In-House' },
        { tool: 'Classify_intent', note: 'Amenity Question — Fitness Center' },
        { tool: 'Search_knowledge_base', note: 'Fitness Center — 2nd Floor, Open 24/7, Keycard Access' },
        { tool: 'Compose_reply', note: 'Confirm Location And Hours' },
      ],
    },
    {
      id: 'm12',
      threadId: '5',
      sender: 'guest',
      content: "Great. That's super helpful.",
      timestamp: new Date('2026-03-16T10:04:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Liam's conversation
  '6': [
    {
      id: 'm13',
      threadId: '6',
      sender: 'guest',
      content: 'Can you explain the parking options?',
      timestamp: new Date('2026-03-16T09:20:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm14',
      threadId: '6',
      sender: 'ai',
      content: 'We offer valet parking for $35/day and self-parking for $25/day. Both are available 24/7.',
      timestamp: new Date('2026-03-16T09:22:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 3,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Liam Johnson — Room 318, In-House' },
        { tool: 'Classify_intent', note: 'Parking Question' },
        { tool: 'Search_knowledge_base', note: 'Parking — Valet $35/Day, Self-Park $25/Day' },
        { tool: 'Check_parking_availability', note: 'Both Lots Open, Attended 24 Hours' },
        { tool: 'Compose_reply', note: 'Present Both Options With Rates' },
      ],
    },
    {
      id: 'm15',
      threadId: '6',
      sender: 'guest',
      content: 'Awesome! That really clears things up.',
      timestamp: new Date('2026-03-16T10:04:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Olivia's conversation
  '7': [
    {
      id: 'm16',
      threadId: '7',
      sender: 'guest',
      content: 'What time is breakfast served?',
      timestamp: new Date('2026-03-16T09:00:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm17',
      threadId: '7',
      sender: 'ai',
      content: 'Our complimentary breakfast buffet is served daily from 6:30 AM to 10:30 AM in the main dining room.',
      timestamp: new Date('2026-03-16T09:02:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 2,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Olivia Brown-Henderson — Room 204, In-House' },
        { tool: 'Classify_intent', note: 'Breakfast Hours Question' },
        { tool: 'Guest Profile', note: 'Platinum Elite — Breakfast Included On Rate' },
        { tool: 'Search_knowledge_base', note: 'Breakfast Buffet — 6:30–10:30 AM, Main Dining Room' },
        { tool: 'Compose_reply', note: 'Give Hours And Location' },
      ],
    },
    {
      id: 'm18',
      threadId: '7',
      sender: 'guest',
      content: 'Fantastic! This is exactly what I needed.',
      timestamp: new Date('2026-03-16T10:04:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Noah's conversation
  '8': [
    {
      id: 'm19',
      threadId: '8',
      sender: 'guest',
      content: 'Do you have any recommendations for local attractions?',
      timestamp: new Date('2026-03-16T08:45:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm20',
      threadId: '8',
      sender: 'ai',
      content: "Absolutely! Within walking distance you have the waterfront, several museums, and historic downtown. I can also arrange tours if you're interested.",
      timestamp: new Date('2026-03-16T08:47:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 4,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Noah Davis — Room 415, Departing Mar. 17' },
        { tool: 'Classify_intent', note: 'Local Attractions Request' },
        { tool: 'Get_property_profile', note: 'Statler New York — Walkable Downtown Core' },
        { tool: 'Search_knowledge_base', note: 'Concierge Guide — Waterfront, Museums, Historic District' },
        { tool: 'Search_upsells', note: 'Guided Tours Bookable Through The Concierge Desk' },
        { tool: 'Compose_reply', note: 'Three Walkable Areas, Offer To Arrange Tours' },
      ],
    },
    {
      id: 'm21',
      threadId: '8',
      sender: 'guest',
      content: 'Perfect! This information is incredibly useful.',
      timestamp: new Date('2026-03-16T10:04:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Emma's conversation
  '9': [
    {
      id: 'm22',
      threadId: '9',
      sender: 'guest',
      content: 'Can I request a late checkout?',
      timestamp: new Date('2026-03-16T08:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm23',
      threadId: '9',
      sender: 'ai',
      content: 'Yes, we can accommodate a late checkout until 2:00 PM for an additional $50, subject to availability. Would you like me to arrange that for you?',
      timestamp: new Date('2026-03-16T08:32:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 3,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Emma Wilson-Rodriguez — Room 409, Departing Mar. 19' },
        { tool: 'Classify_intent', note: 'Late Check-Out Request' },
        { tool: 'Search_upsells', note: 'Late Check-Out Until 2:00 PM — $50, One-Time Charge' },
        { tool: 'Check_room_status', note: 'Room 409 Not Pre-Sold For Mar. 19 — Subject To Arrivals' },
        { tool: 'Guest Profile', note: 'Club Member — No Complimentary Late Check-Out' },
        { tool: 'Decision', note: 'Quote The Fee, Ask Before Booking' },
      ],
    },
    {
      id: 'm24',
      threadId: '9',
      sender: 'guest',
      content: 'Excellent! I appreciate your help with this.',
      timestamp: new Date('2026-03-16T10:04:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Priya's conversation
  '17': [
    {
      id: 'm62',
      threadId: '17',
      sender: 'guest',
      content: 'Hi, could you arrange a taxi to the airport for tomorrow at 6 AM?',
      timestamp: new Date('2026-03-16T09:15:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Yuki's conversation
  '18': [
    {
      id: 'm63',
      threadId: '18',
      sender: 'guest',
      content: 'Is there a Japanese restaurant nearby you would recommend?',
      timestamp: new Date('2026-03-16T08:50:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Fatima's conversation
  '19': [
    {
      id: 'm64',
      threadId: '19',
      sender: 'guest',
      content: 'I just arrived and noticed my suite has been upgraded!',
      timestamp: new Date('2026-03-16T09:40:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm65',
      threadId: '19',
      sender: 'staff',
      content: 'Welcome back, Ms. Al-Hassan! As a Diamond Elite member, we upgraded you to the Presidential Suite. We hope you enjoy your stay!',
      timestamp: new Date('2026-03-16T09:42:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm66',
      threadId: '19',
      sender: 'guest',
      content: 'Thank you for the upgrade, the suite is beautiful!',
      timestamp: new Date('2026-03-16T10:00:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Lucia's conversation — escalated (unresolved complaint)
  '20': [
    {
      id: 'm67a',
      threadId: '20',
      sender: 'guest',
      content: 'Can someone bring extra blankets to room 226? It is quite cold in here.',
      timestamp: new Date('2026-03-16T06:20:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm67',
      threadId: '20',
      sender: 'guest',
      content: "I've been waiting over an hour for the extra blankets and room 226 is freezing. No one has come by — this is really disappointing.",
      timestamp: new Date('2026-03-16T07:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Hiroshi's conversation
  '21': [
    {
      id: 'm68',
      threadId: '21',
      sender: 'guest',
      content: 'The room service menu — is it available after midnight?',
      timestamp: new Date('2026-03-15T23:45:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm69',
      threadId: '21',
      sender: 'ai',
      content: 'Our room service is available 24 hours. The full menu is in your room, or I can send you a digital copy.',
      timestamp: new Date('2026-03-15T23:46:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 2,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Hiroshi Nakamura — Room 504, In-House' },
        { tool: 'Classify_intent', note: 'Room Service Hours Question' },
        { tool: 'Search_knowledge_base', note: 'In-Room Dining — 24 Hours, Overnight Menu After 11 PM' },
        { tool: 'Compose_reply', note: 'Confirm 24-Hour Service, Offer The Digital Menu' },
      ],
    },
  ],
  // Ingrid's conversation
  '22': [
    {
      id: 'm70',
      threadId: '22',
      sender: 'guest',
      content: 'Hi, I left my mobile key in the old room after I switched. Can I get a new one?',
      timestamp: new Date('2026-03-15T16:00:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm71',
      threadId: '22',
      sender: 'staff',
      content: 'Of course! I\'ve reissued a mobile key for your new room 608. You can also pick up a physical key at the front desk.',
      timestamp: new Date('2026-03-15T16:05:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm72',
      threadId: '22',
      sender: 'guest',
      content: 'Perfect, I will pick up the key at the front desk.',
      timestamp: new Date('2026-03-15T16:20:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Thomas's conversation
  '23': [
    {
      id: 'm73',
      threadId: '23',
      sender: 'guest',
      content: 'Do you have a business center or somewhere I can print documents?',
      timestamp: new Date('2026-03-16T08:00:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Rachel's conversation
  '24': [
    {
      id: 'm74',
      threadId: '24',
      sender: 'guest',
      content: 'What are the hours for the rooftop bar?',
      timestamp: new Date('2026-03-15T15:00:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm75',
      threadId: '24',
      sender: 'ai',
      content: 'The rooftop bar is open daily from 4:00 PM to midnight. Happy hour is 4-6 PM with half-price cocktails!',
      timestamp: new Date('2026-03-15T15:02:00'),
      channel: 'SMS',
      status: 'delivered',
      sourceCount: 2,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Rachel Cohen — Room 416, In-House' },
        { tool: 'Classify_intent', note: 'Outlet Hours Question — Rooftop Bar' },
        { tool: 'Search_knowledge_base', note: 'Rooftop Bar — Daily 4:00 PM–Midnight' },
        { tool: 'Search_upsells', note: 'Happy Hour 4–6 PM, Half-Price Cocktails' },
        { tool: 'Compose_reply', note: 'Give Hours, Lead With Happy Hour' },
      ],
    },
    {
      id: 'm76',
      threadId: '24',
      sender: 'guest',
      content: 'Thank you, that was very helpful!',
      timestamp: new Date('2026-03-15T15:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Chloe's conversation
  '25': [
    {
      id: 'm77',
      threadId: '25',
      sender: 'guest',
      content: 'Is the spa open on Sundays?',
      timestamp: new Date('2026-03-16T09:00:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Andre's conversation
  '26': [
    {
      id: 'm78',
      threadId: '26',
      sender: 'guest',
      content: 'The air conditioning in room 124 seems to be blowing warm air.',
      timestamp: new Date('2026-03-15T21:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm79',
      threadId: '26',
      sender: 'staff',
      content: 'Sorry about that! I\'m sending maintenance to check the AC unit right away.',
      timestamp: new Date('2026-03-15T21:35:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm80',
      threadId: '26',
      sender: 'guest',
      content: 'All good now, the AC is working fine.',
      timestamp: new Date('2026-03-15T22:10:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Maya's conversation
  '27': [
    {
      id: 'm81',
      threadId: '27',
      sender: 'guest',
      content: 'We loved the complimentary breakfast. Thank you!',
      timestamp: new Date('2026-03-16T10:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Sarah Martinez - Archived
  '10': [
    {
      id: 'm25',
      threadId: '10',
      sender: 'guest',
      content: 'Hi! Just checked in. The room looks lovely!',
      timestamp: new Date('2026-03-09T15:20:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm26',
      threadId: '10',
      sender: 'staff',
      content: 'Welcome Sarah! So glad you like it. Please let us know if you need anything during your stay.',
      timestamp: new Date('2026-03-09T15:22:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm27',
      threadId: '10',
      sender: 'guest',
      content: 'Thank you so much for the wonderful stay! Everything was perfect.',
      timestamp: new Date('2026-03-12T11:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // James Chen - Archived
  '11': [
    {
      id: 'm35',
      threadId: '11',
      sender: 'guest',
      content: "The WiFi in my room isn't working. I need to join a video call in 30 minutes.",
      timestamp: new Date('2026-03-10T14:15:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm36',
      threadId: '11',
      sender: 'staff',
      content: "I'm so sorry about that! Let me get our IT team to your room right away.",
      timestamp: new Date('2026-03-10T14:16:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm42',
      threadId: '11',
      sender: 'guest',
      content: 'All set, thanks for resolving the WiFi issue.',
      timestamp: new Date('2026-03-11T16:45:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Maria Garcia - Archived
  '12': [
    {
      id: 'm43',
      threadId: '12',
      sender: 'guest',
      content: "Hola! Is it possible to have a late checkout? My flight isn't until 6pm.",
      timestamp: new Date('2026-03-09T09:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm44',
      threadId: '12',
      sender: 'ai',
      content: 'Hi Maria! Yes, we can arrange a late checkout for you. Would 3:00 PM work for your schedule?',
      sourceCount: 3,
      aiSteps: [
        { tool: 'Search_for_reservation_by_calling_phone_number', note: 'Found Maria Garcia — Room 225, Departing Mar. 10' },
        { tool: 'Detect_language', note: 'Spanish Greeting, English Body — Reply In English' },
        { tool: 'Classify_intent', note: 'Late Check-Out Request — 6 PM Flight' },
        { tool: 'Check_room_status', note: 'Room 225 Has No Same-Day Arrival' },
        { tool: 'Search_upsells', note: 'Late Check-Out Until 3:00 PM Available' },
        { tool: 'Decision', note: 'Offer 3:00 PM, Confirm Before Booking' },
      ],
      timestamp: new Date('2026-03-09T09:35:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm50',
      threadId: '12',
      sender: 'guest',
      content: 'Perfect, the late checkout worked out great. See you next time!',
      timestamp: new Date('2026-03-10T14:20:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
  // Robert Thompson - Archived
  '13': [
    {
      id: 'm51',
      threadId: '13',
      sender: 'guest',
      content: "I'd like to request a room upgrade if possible. Staying for 4 nights.",
      timestamp: new Date('2026-03-05T16:00:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm52',
      threadId: '13',
      sender: 'staff',
      content: "Good evening Mr. Thompson! As a Diamond Elite member, we'd be happy to upgrade you to a junior suite at no additional charge.",
      timestamp: new Date('2026-03-05T16:05:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm61',
      threadId: '13',
      sender: 'guest',
      content: 'Appreciate all your help with the room upgrade and restaurant reservations!',
      timestamp: new Date('2026-03-09T10:15:00'),
      channel: 'SMS',
      status: 'delivered',
    },
  ],
};
