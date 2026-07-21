/**
 * Messaging Mock Data
 *
 * Thread and message data that references canonical guests and reservations.
 */

import { Thread, Message } from './types';

/**
 * Guest-Journey scheduled-message delivery status, keyed by reservation id.
 *
 * VISUAL-ONLY mock for the Conversation Details sidebar's per-stay status line
 * (the panel is a verification aid). Failures are the loudest signal — a stay
 * with `failed > 0` renders a red "N message(s) failed to send" line; otherwise
 * a quiet "✓ D delivered · S scheduled" line. No detail modal yet.
 *
 * Covers every reservation on thread '14' (the "Johnny" scenario); res-john-jul
 * (the in-house stay) carries a failure so the red state is demoable.
 */
export const gjMessageStatus: Record<string, { delivered: number; failed: number; scheduled: number }> = {
  'res-john-jul': { delivered: 4, failed: 1, scheduled: 2 },
  'res-john-feb-past': { delivered: 6, failed: 0, scheduled: 0 },
  'res-john-sep': { delivered: 0, failed: 0, scheduled: 3 },
  'res-sarah-s-nov': { delivered: 0, failed: 0, scheduled: 2 },
  'res-james-jul': { delivered: 2, failed: 0, scheduled: 2 },
  'res-ethan-jul': { delivered: 3, failed: 0, scheduled: 1 },
  'res-liam-aug': { delivered: 1, failed: 0, scheduled: 4 },
};

/**
 * Per-reservation Guest-Journey message log — the "table in a table" data model
 * (v4). Each entry is one GJ message with a title, a send/schedule time, and a
 * set of delivery CHANNELS each carrying its own status. This is the detailed
 * source of truth; the coarse `gjMessageStatus` counts above are a FALLBACK for
 * reservations without a detailed log. The summary counts the collapsed rows +
 * carousel red-dot rule consume are DERIVED from this via `getGjSummary`, so the
 * two never disagree.
 *
 * Channel types: email / sms / whatsapp render as icons; booking / expedia render
 * as tiny OTA letter chips. A `failed` channel is the loudest thing in the row.
 * `sentAt` present ⇒ a sent message (channels sent/failed); `scheduledFor` ⇒ a
 * future message (channels scheduled).
 *
 * Times are pre-formatted display strings ("Jul 13 · 9:00 AM"); the UI prepends
 * "Sent " for sent messages and shows the scheduled time bare.
 */
export type GjChannelType = 'email' | 'sms' | 'whatsapp' | 'booking' | 'expedia';
export type GjChannelStatus = 'sent' | 'failed' | 'scheduled';

export interface GjMessageEntry {
  title: string;
  sentAt?: string;
  scheduledFor?: string;
  // A `failed` channel carries production's error register: the raw carrier
  // `errorCode` (a real Twilio code) + a curated, hotelier-readable `errorNote`.
  // Rationale: hotels can't fix a Twilio/carrier failure, but surfacing the code
  // on-screen (mirrors production's MessageErrorDetailsModal) saves Canary support
  // the investigation — they know the exact carrier error without opening a ticket.
  channels: Array<{ type: GjChannelType; status: GjChannelStatus; errorCode?: string; errorNote?: string }>;
}

export const gjMessages: Record<string, GjMessageEntry[]> = {
  // John Smith — current in-house stay (Jul 13–15). Check-in's WhatsApp FAILED →
  // the demoable red state (matches the old "1 failed").
  'res-john-jul': [
    { title: 'Booking Confirmation', sentAt: 'Jun 20 · 2:14 PM', channels: [{ type: 'email', status: 'sent' }, { type: 'booking', status: 'sent' }] },
    { title: 'Pre-Arrival', sentAt: 'Jul 11 · 9:00 AM', channels: [{ type: 'email', status: 'sent' }, { type: 'sms', status: 'sent' }] },
    { title: 'Check-in', sentAt: 'Jul 13 · 9:00 AM', channels: [{ type: 'email', status: 'sent' }, { type: 'sms', status: 'sent' }, { type: 'whatsapp', status: 'failed', errorCode: '63016', errorNote: "WhatsApp couldn't deliver — the guest hasn't opted in or the 24-hour window closed." }] },
    { title: 'Welcome to the Hotel', sentAt: 'Jul 13 · 3:30 PM', channels: [{ type: 'email', status: 'sent' }, { type: 'sms', status: 'sent' }] },
    { title: 'Mid-Stay Check', scheduledFor: 'Jul 14 · 9:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'sms', status: 'scheduled' }] },
    { title: 'Check-out', scheduledFor: 'Jul 15 · 8:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'sms', status: 'scheduled' }] },
  ],
  // John Smith — past solo work trip (Feb 3–5). Fully delivered.
  'res-john-feb-past': [
    { title: 'Booking Confirmation', sentAt: 'Jan 15 · 10:00 AM', channels: [{ type: 'email', status: 'sent' }] },
    { title: 'Pre-Arrival', sentAt: 'Feb 1 · 9:00 AM', channels: [{ type: 'email', status: 'sent' }, { type: 'sms', status: 'sent' }] },
    { title: 'Check-in', sentAt: 'Feb 3 · 9:00 AM', channels: [{ type: 'email', status: 'sent' }, { type: 'sms', status: 'sent' }] },
    { title: 'Post check-in', sentAt: 'Feb 3 · 4:00 PM', channels: [{ type: 'email', status: 'sent' }] },
    { title: 'Check-out', sentAt: 'Feb 5 · 8:00 AM', channels: [{ type: 'email', status: 'sent' }, { type: 'sms', status: 'sent' }] },
    { title: 'Post-Stay Thank You', sentAt: 'Feb 6 · 11:00 AM', channels: [{ type: 'email', status: 'sent' }] },
  ],
  // John Smith — future stay (Sep 22–25). Booking sent; the rest scheduled.
  'res-john-sep': [
    { title: 'Booking Confirmation', sentAt: 'Jul 2 · 1:00 PM', channels: [{ type: 'email', status: 'sent' }, { type: 'expedia', status: 'sent' }] },
    { title: 'Pre-Arrival', scheduledFor: 'Sep 20 · 9:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'sms', status: 'scheduled' }] },
    { title: 'Check-in', scheduledFor: 'Sep 22 · 9:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'sms', status: 'scheduled' }] },
    { title: 'Check-out', scheduledFor: 'Sep 25 · 8:00 AM', channels: [{ type: 'email', status: 'scheduled' }] },
  ],
  // Sarah Smith — her own upcoming stay on the shared phone (Nov 14–17).
  'res-sarah-s-nov': [
    { title: 'Booking Confirmation', sentAt: 'Aug 30 · 3:00 PM', channels: [{ type: 'email', status: 'sent' }, { type: 'booking', status: 'sent' }] },
    { title: 'Pre-Arrival', scheduledFor: 'Nov 12 · 9:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'sms', status: 'scheduled' }] },
    { title: 'Check-in', scheduledFor: 'Nov 14 · 9:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'whatsapp', status: 'scheduled' }] },
  ],
  // James Brady — manually-linked (Jul 15–18).
  'res-james-jul': [
    { title: 'Booking Confirmation', sentAt: 'Jul 1 · 11:00 AM', channels: [{ type: 'email', status: 'sent' }, { type: 'expedia', status: 'sent' }] },
    { title: 'Pre-Arrival', sentAt: 'Jul 13 · 9:00 AM', channels: [{ type: 'email', status: 'sent' }, { type: 'sms', status: 'sent' }] },
    { title: 'Check-in', scheduledFor: 'Jul 15 · 9:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'sms', status: 'scheduled' }] },
    { title: 'Check-out', scheduledFor: 'Jul 18 · 8:00 AM', channels: [{ type: 'email', status: 'scheduled' }] },
  ],
  // Ethan Parker — manually-linked (Jul 15–18).
  'res-ethan-jul': [
    { title: 'Booking Confirmation', sentAt: 'Jul 2 · 9:00 AM', channels: [{ type: 'email', status: 'sent' }] },
    { title: 'Pre-Arrival', sentAt: 'Jul 13 · 9:00 AM', channels: [{ type: 'email', status: 'sent' }, { type: 'sms', status: 'sent' }] },
    { title: 'Welcome to the Hotel', sentAt: 'Jul 14 · 10:00 AM', channels: [{ type: 'email', status: 'sent' }] },
    { title: 'Check-in', scheduledFor: 'Jul 15 · 9:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'sms', status: 'scheduled' }] },
  ],
  // Liam Carter — manually-linked (Aug 10–13).
  'res-liam-aug': [
    { title: 'Booking Confirmation', sentAt: 'Jul 20 · 2:00 PM', channels: [{ type: 'email', status: 'sent' }, { type: 'booking', status: 'sent' }] },
    { title: 'Pre-Arrival', scheduledFor: 'Aug 8 · 9:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'sms', status: 'scheduled' }] },
    { title: 'Check-in', scheduledFor: 'Aug 10 · 9:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'sms', status: 'scheduled' }] },
    { title: 'Welcome to the Hotel', scheduledFor: 'Aug 10 · 3:00 PM', channels: [{ type: 'email', status: 'scheduled' }] },
    { title: 'Check-out', scheduledFor: 'Aug 13 · 8:00 AM', channels: [{ type: 'email', status: 'scheduled' }] },
  ],
  // Emily Smith — thread '1' in-house stay (Jul 13–15), fully healthy.
  'res-emily-jul': [
    { title: 'Booking Confirmation', sentAt: 'Jun 25 · 10:00 AM', channels: [{ type: 'email', status: 'sent' }] },
    { title: 'Pre-Arrival', sentAt: 'Jul 11 · 9:00 AM', channels: [{ type: 'email', status: 'sent' }, { type: 'sms', status: 'sent' }] },
    { title: 'Check-in', sentAt: 'Jul 13 · 9:00 AM', channels: [{ type: 'email', status: 'sent' }, { type: 'sms', status: 'sent' }] },
    { title: 'Welcome to the Hotel', sentAt: 'Jul 13 · 4:00 PM', channels: [{ type: 'email', status: 'sent' }, { type: 'whatsapp', status: 'sent' }] },
    { title: 'Mid-Stay Check', scheduledFor: 'Jul 14 · 9:00 AM', channels: [{ type: 'email', status: 'scheduled' }] },
    { title: 'Check-out', scheduledFor: 'Jul 15 · 8:00 AM', channels: [{ type: 'email', status: 'scheduled' }, { type: 'sms', status: 'scheduled' }] },
  ],
};

/**
 * Derive the coarse {delivered, failed, scheduled} summary a reservation shows on
 * its collapsed row / carousel dot FROM its detailed `gjMessages` log (so the two
 * can never disagree). Counting is message-level: a sent message with any failed
 * channel counts as failed; otherwise sent ⇒ delivered, else ⇒ scheduled. Falls
 * back to the legacy `gjMessageStatus` map for reservations without a detail log.
 */
export function getGjSummary(reservationId: string): { delivered: number; failed: number; scheduled: number } | undefined {
  const msgs = gjMessages[reservationId];
  if (msgs && msgs.length > 0) {
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
  return gjMessageStatus[reservationId];
}

/**
 * Mock threads - link to canonical guest and reservation IDs
 */
export const mockThreads: Thread[] = [
  // Multi-reservation thread (1 auto-linked + 3 manually linked)
  {
    id: '14',
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
    contactNumber: '+13305559999',
    linkedReservationIds: ['res-emerson-jun'],
    lastMessage: 'Hi, I wanted to confirm my reservation for next month.',
    lastMessageAt: new Date('2026-03-16T09:50:00'),
    isUnread: true,
    status: 'inbox',
  },
  // Empty thread (no linked reservations)
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
  {
    id: '1',
    contactNumber: '+15005550012',
    linkedReservationIds: ['res-emily-jul'],
    lastMessage: "Here are some nearby restaurant recommendations: Ithaca Ale House, Komonz Grill, MIX, Red's Place, and Chili's Grill & Bar. The hotel also recommends Il Ristorante Alga, Coltivare, Moosewood Restaurant, and Gola Osteria. Let me know if you need more assistance!",
    lastMessageAt: new Date('2026-03-16T18:32:00'),
    isUnread: true,
    status: 'inbox',
  },
  {
    id: '2',
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
    contactNumber: '+15005550015',
    linkedReservationIds: ['res-marco-nov'],
    lastMessage: 'What time will the pool close?',
    lastMessageAt: new Date('2026-03-16T10:04:00'),
    isUnread: false,
    status: 'inbox',
  },
  {
    id: '5',
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
  {
    id: '20',
    contactNumber: '+15005550045',
    linkedReservationIds: ['res-lucia-nov'],
    lastMessage: 'Can someone bring extra blankets to room 226?',
    lastMessageAt: new Date('2026-03-16T07:30:00'),
    isUnread: true,
    status: 'inbox',
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
    {
      id: 'm205',
      threadId: '1',
      sender: 'staff',
      content: 'My pleasure! We look forward to welcoming you.',
      timestamp: new Date('2026-03-15T16:05:00'),
      channel: 'SMS',
      status: 'delivered',
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
    {
      id: 'm2',
      threadId: '1',
      sender: 'ai',
      content: 'Thanks for letting us know!',
      timestamp: new Date('2026-03-16T17:25:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm3',
      threadId: '1',
      sender: 'guest',
      content: 'Give me a list of nearby restaurants',
      timestamp: new Date('2026-03-16T18:30:00'),
      channel: 'SMS',
      status: 'delivered',
    },
    {
      id: 'm4',
      threadId: '1',
      sender: 'ai',
      content: "Here are some nearby restaurant recommendations: Ithaca Ale House, Komonz Grill, MIX, Red's Place, and Chili's Grill & Bar. The hotel also recommends Il Ristorante Alga, Coltivare, Moosewood Restaurant, and Gola Osteria. Let me know if you need more assistance!",
      timestamp: new Date('2026-03-16T18:32:00'),
      channel: 'SMS',
      status: 'delivered',
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
  // Lucia's conversation
  '20': [
    {
      id: 'm67',
      threadId: '20',
      sender: 'guest',
      content: 'Can someone bring extra blankets to room 226?',
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
