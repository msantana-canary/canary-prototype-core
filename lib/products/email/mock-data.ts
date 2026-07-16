/**
 * Email Channel — Mock Data
 *
 * A guest-journey inbox for The Statler: ~14 Inbox threads + 3 Archived, each
 * auto-linked to a canonical guest from lib/core/data by sender address.
 * Loyalty tiers are read live off the canonical guest in the UI — the mock
 * never re-states a guest's tier (single source of truth).
 *
 * Sender display names are USUALLY different from the linked canonical guest
 * (married name, nickname, partner's email) to exercise the sender ≠ linked-
 * guest model — but a few (Sarah Martinez, James Chen, Priya Sharma) match
 * exactly so the pattern doesn't read as a gimmick. One thread (the events
 * inquiry) is intentionally UNLINKED.
 *
 * TIMESTAMPS ARE REBASED at module load: every date is an offset from
 * `new Date()`, so the newest activity is always "today" and the feed dividers
 * (TODAY / YESTERDAY / JUL 14) stay truthful. Two threads (Brooklyn's billing
 * dispute, James's folio question) span multiple calendar days on purpose.
 */

import { EmailThread, EmailMessage } from './types';

const STAFF_NAME = 'Theresa Webb';

// --- Date rebasing helpers -------------------------------------------------
const NOW = new Date();

/** A Date `daysAgo` days before today at the given local hour:minute. */
function dayAt(daysAgo: number, hour: number, minute: number): Date {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export const mockThreads: EmailThread[] = [
  // ---------------------------------------------------------------- INBOX
  {
    id: 'email-emily',
    senderName: 'Emily Johnson',
    senderEmail: 'emily.johnson@gmail.com',
    subject: 'Re: Your upcoming stay at The Statler — Nov 18',
    linkedGuestId: 'guest-emily',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: dayAt(0, 9, 20),
    preview:
      "Hi, I received your pre-arrival email and had a quick question — is there a fee for early check-in? We're arriving around noon on the 18th and would love to get into the room if it's ready.",
  },
  {
    id: 'email-noah',
    senderName: 'Noah Williams',
    senderEmail: 'noah.w@outlook.com',
    subject: 'Re: Pre-Arrival Information — Welcome to The Statler',
    linkedGuestId: 'guest-noah',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: dayAt(0, 8, 32),
    preview: "We'll be arriving late, around 11pm. Will the front desk still be open?",
  },
  {
    id: 'email-brooklyn',
    senderName: 'Brooklyn Carter',
    senderEmail: 'brooklyn.carter@gmail.com',
    subject: 'Re: Your Checkout Summary — Thank You for Staying',
    linkedGuestId: 'guest-brooklyn',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: dayAt(0, 11, 48),
    preview:
      "Thanks for looking into it. I checked my statement again and the $45 is still showing — could you confirm what it was for?",
  },
  {
    id: 'email-kristin',
    senderName: 'Kristin Lee',
    senderEmail: 'kristin.lee@gmail.com',
    subject: 'Re: Your upcoming stay at The Statler — Nov 20',
    linkedGuestId: 'guest-kristin',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: dayAt(0, 8, 10),
    preview:
      'Hello, Thanks for the heads up about our upcoming stay. I had a small request — if possible, could we be placed on a high floor with a city view? We’re celebrating my husband’s birthday and it would mean a lot.',
  },
  {
    id: 'email-olivia',
    senderName: 'Olivia Chen',
    senderEmail: 'olivia.chen@gmail.com',
    subject: 'Re: Pre-Arrival Information — Welcome to The Statler',
    linkedGuestId: 'guest-olivia',
    status: 'inbox',
    isUnread: false,
    lastActivityAt: dayAt(0, 6, 50),
    preview:
      'Hi there, We’re arriving this Friday for our anniversary. Quick question — is the rooftop bar open on weeknights? We’d love to have a drink up there if possible.',
  },
  {
    id: 'email-sarah',
    senderName: 'Sarah Martinez',
    senderEmail: 'sarah.martinez@gmail.com',
    subject: 'Re: Your Stay Details — Checkout is Sunday',
    linkedGuestId: 'guest-sarah',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: dayAt(0, 10, 5),
    preview:
      "Hi, our flight doesn't leave until the evening — is there any chance of a late checkout on Sunday? Even 2pm would help a lot.",
  },
  {
    id: 'email-james',
    senderName: 'James Chen',
    senderEmail: 'james.chen@gmail.com',
    subject: 'Re: Your Folio & Receipt — The Statler',
    linkedGuestId: 'guest-james',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: dayAt(0, 8, 55),
    preview:
      'Thanks for the breakdown. One more thing — the receipt shows two room-service charges on the same night. Could you double-check that?',
  },
  {
    id: 'email-priya',
    senderName: 'Priya Sharma',
    senderEmail: 'priya.sharma@gmail.com',
    subject: 'Re: Pre-Arrival Information — Welcome to The Statler',
    linkedGuestId: 'guest-priya',
    status: 'inbox',
    isUnread: false,
    lastActivityAt: dayAt(1, 16, 20),
    preview:
      'Perfect, thank you! One last question — do you have a fitness center, and what are the hours?',
  },
  {
    id: 'email-nina',
    senderName: 'Nina Ashford',
    senderEmail: 'nina.ashford@outlook.com',
    subject: 'Re: Celebrating Your Anniversary at The Statler',
    linkedGuestId: 'guest-nina',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: dayAt(1, 13, 10),
    // CC's her partner (guest-side) so the Info sidebar's Participants CC row
    // has real data — this plants the answer to Jake's DSN-1775 CC question.
    cc: [{ name: 'David Ashford', email: 'david.ashford@outlook.com' }],
    preview:
      'Hi, thank you for the lovely note! It’s our 10th anniversary — would it be possible to have a bottle of champagne waiting in the room when we arrive?',
  },
  {
    id: 'email-hannah',
    senderName: 'Hannah Fletcher',
    senderEmail: 'hannah.fletcher@gmail.com',
    subject: 'Re: Your Spa Package is Confirmed',
    linkedGuestId: 'guest-hannah',
    status: 'inbox',
    isUnread: false,
    lastActivityAt: dayAt(0, 7, 15),
    preview:
      'Got the confirmation, thank you! Could we move the couples massage to 4pm instead of 2pm on the day of check-in?',
  },
  {
    id: 'email-robert',
    senderName: 'Rob Thompson',
    senderEmail: 'rob.thompson@outlook.com',
    subject: 'Re: How was your stay at The Statler?',
    linkedGuestId: 'guest-robert',
    status: 'inbox',
    isUnread: false,
    lastActivityAt: dayAt(1, 18, 20),
    preview:
      'Happy to leave a review — the staff were fantastic. Quick note: the room safe wasn’t working, wanted to flag it for the next guest.',
  },
  {
    id: 'email-yuki',
    senderName: 'Yuki Sato',
    senderEmail: 'yuki.sato@gmail.com',
    subject: 'Re: Your Checkout Summary — Thank You for Staying',
    linkedGuestId: 'guest-yuki',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: dayAt(0, 6, 20),
    preview:
      'Hello, could you email me an itemized receipt for my company expense report? I need the taxes broken out separately.',
  },
  {
    id: 'email-carlos',
    senderName: 'Carlos Mendes',
    senderEmail: 'carlos.mendes@gmail.com',
    subject: 'Re: Welcome! Your Check-In is Tomorrow',
    linkedGuestId: 'guest-carlos',
    status: 'inbox',
    isUnread: false,
    lastActivityAt: dayAt(1, 17, 0),
    preview: 'All set on my end — see you tomorrow. Is parking included with the room?',
  },
  {
    // Intentionally UNLINKED — an events/vendor inquiry with no guest profile.
    id: 'email-events',
    senderName: 'Rebecca Nolan',
    senderEmail: 'events@cascadeevents.co',
    subject: 'Group Room Block — October Conference',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: dayAt(1, 12, 0),
    preview:
      'Hello, I’m organizing a conference in October and would like to reserve a block of 25 rooms. Could you send group rates and availability?',
  },

  // ------------------------------------------------------------- ARCHIVED
  {
    id: 'email-marco',
    senderName: 'Marco Rossi',
    senderEmail: 'marco.rossi@outlook.com',
    subject: 'Re: Welcome! Your Check-In is Tomorrow',
    linkedGuestId: 'guest-marco',
    status: 'archived',
    isUnread: false,
    lastActivityAt: dayAt(2, 14, 10),
    preview: 'Thanks, all set! Looking forward to it.',
  },
  {
    id: 'email-liam',
    senderName: 'Liam Carter',
    senderEmail: 'liam.carter@gmail.com',
    subject: 'Re: Your Check-In is Confirmed',
    linkedGuestId: 'guest-liam',
    status: 'archived',
    isUnread: false,
    lastActivityAt: dayAt(3, 11, 0),
    preview: 'Great, thank you for confirming. We’ll see you Thursday afternoon.',
  },
  {
    id: 'email-chloe',
    senderName: 'Chloe Martin',
    senderEmail: 'chloe.martin@outlook.com',
    subject: 'Re: Your upcoming stay at The Statler',
    linkedGuestId: 'guest-chloe',
    status: 'archived',
    isUnread: false,
    lastActivityAt: dayAt(4, 9, 30),
    preview: 'Wonderful — thank you for arranging the early check-in. Much appreciated!',
  },
];

export const mockMessages: Record<string, EmailMessage[]> = {
  // Featured open thread — single inbound message (matches the Figma open state)
  'email-emily': [
    {
      id: 'em-emily-1',
      threadId: 'email-emily',
      direction: 'inbound',
      sentAt: dayAt(0, 9, 20),
      body: "Hi,\n\nI received your pre-arrival email and had a quick question — is there a fee for early check-in? We're arriving around noon on the 18th and would love to get into the room if it's ready.\n\nAlso, do you have valet parking or is there a self-park option nearby?\n\nThanks,\nEmily",
    },
  ],

  // Two-message history (inbound + staff reply), same day
  'email-noah': [
    {
      id: 'em-noah-1',
      threadId: 'email-noah',
      direction: 'inbound',
      sentAt: dayAt(0, 8, 5),
      body: "Hi,\n\nWe'll be arriving late, around 11pm. Will the front desk still be open?\n\nBest,\nNoah",
    },
    {
      id: 'em-noah-2',
      threadId: 'email-noah',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: dayAt(0, 8, 32),
      body: 'Hi Noah,\n\nAbsolutely — our front desk is staffed 24 hours, so someone will be there to greet you and get you checked in whenever you arrive. Safe travels!\n\nWarm regards,\nTheresa',
    },
  ],

  // MULTI-DAY billing dispute: inquiry two days ago → staff reply yesterday → guest reply today
  'email-brooklyn': [
    {
      id: 'em-brooklyn-1',
      threadId: 'email-brooklyn',
      direction: 'inbound',
      sentAt: dayAt(2, 16, 42),
      body: 'Hi,\n\nI just received my checkout summary and there’s a charge for $45 on November 21st that I don’t recognize. It’s listed under "miscellaneous." Could you look into that for me?\n\nThank you,\nBrooklyn',
    },
    {
      id: 'em-brooklyn-2',
      threadId: 'email-brooklyn',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: dayAt(1, 10, 15),
      body: 'Hi Brooklyn,\n\nThank you for your patience. I looked into the $45 miscellaneous charge from November 21st — it was logged by our housekeeping team. I’m confirming the details with them now and will follow up shortly.\n\nBest,\nTheresa',
    },
    {
      id: 'em-brooklyn-3',
      threadId: 'email-brooklyn',
      direction: 'inbound',
      sentAt: dayAt(0, 11, 48),
      body: 'Thanks for looking into it. I checked my statement again and the $45 is still showing — could you confirm what it was for? I don’t recall using any paid housekeeping services.\n\nBrooklyn',
    },
  ],

  // Two-message history, same day
  'email-kristin': [
    {
      id: 'em-kristin-1',
      threadId: 'email-kristin',
      direction: 'inbound',
      sentAt: dayAt(0, 7, 40),
      body: 'Hello,\n\nThanks for the heads up about our upcoming stay. I had a small request — if possible, could we be placed on a high floor with a city view? We’re celebrating my husband’s birthday and it would mean a lot.\n\nThank you so much,\nKristin',
    },
    {
      id: 'em-kristin-2',
      threadId: 'email-kristin',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: dayAt(0, 8, 10),
      body: 'Hi Kristin,\n\nHappy early birthday to your husband! I’ve added a note to your reservation requesting a high floor with a city view. While I can’t guarantee it until arrival, we’ll do everything we can to make it happen.\n\nWarm regards,\nTheresa',
    },
  ],

  // Single inbound
  'email-olivia': [
    {
      id: 'em-olivia-1',
      threadId: 'email-olivia',
      direction: 'inbound',
      sentAt: dayAt(0, 6, 50),
      body: 'Hi there,\n\nWe’re arriving this Friday for our anniversary. Quick question — is the rooftop bar open on weeknights? We’d love to have a drink up there if possible.\n\nCheers,\nOlivia',
    },
  ],

  // Single inbound — late checkout request (sender matches guest exactly)
  'email-sarah': [
    {
      id: 'em-sarah-1',
      threadId: 'email-sarah',
      direction: 'inbound',
      sentAt: dayAt(0, 10, 5),
      body: "Hi,\n\nOur flight doesn't leave until the evening on Sunday — is there any chance of a late checkout? Even 2pm would help a lot so we don't have to wait around the lobby.\n\nThank you,\nSarah",
    },
  ],

  // MULTI-DAY folio question: inquiry two days ago → staff reply yesterday → guest reply today
  'email-james': [
    {
      id: 'em-james-1',
      threadId: 'email-james',
      direction: 'inbound',
      sentAt: dayAt(2, 14, 20),
      body: 'Hi,\n\nI’m going through my folio for the expense report and a couple of the line items aren’t clear to me. Could you send a plain-English breakdown of the charges?\n\nThanks,\nJames',
    },
    {
      id: 'em-james-2',
      threadId: 'email-james',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: dayAt(1, 9, 30),
      body: 'Hi James,\n\nHappy to help. Your folio breaks down as: room rate ($189/night x 2), occupancy tax, and two room-service orders. I’ve attached an itemized copy — let me know if anything still looks off.\n\nBest,\nTheresa',
    },
    {
      id: 'em-james-3',
      threadId: 'email-james',
      direction: 'inbound',
      sentAt: dayAt(0, 8, 55),
      body: 'Thanks for the breakdown. One more thing — the receipt shows two room-service charges on the same night. Could you double-check that one of them isn’t a duplicate?\n\nJames',
    },
  ],

  // Two-message history, yesterday
  'email-priya': [
    {
      id: 'em-priya-1',
      threadId: 'email-priya',
      direction: 'inbound',
      sentAt: dayAt(1, 15, 40),
      body: 'Hi,\n\nThanks for the welcome email. Could you tell me whether breakfast is included with our rate, and where it’s served?\n\nBest,\nPriya',
    },
    {
      id: 'em-priya-2',
      threadId: 'email-priya',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: dayAt(1, 16, 20),
      body: 'Hi Priya,\n\nYes — a hot breakfast buffet is included with your rate, served in the Garden Room from 6:30 to 10:30am daily. We look forward to hosting you!\n\nWarm regards,\nTheresa',
    },
  ],

  // Single inbound — anniversary / special occasion
  'email-nina': [
    {
      id: 'em-nina-1',
      threadId: 'email-nina',
      direction: 'inbound',
      sentAt: dayAt(1, 13, 10),
      body: 'Hi,\n\nThank you for the lovely note! It’s our 10th anniversary — would it be possible to have a bottle of champagne waiting in the room when we arrive? Happy to add it to the bill.\n\nWarmly,\nNina',
    },
  ],

  // Single inbound — upsell confirmation follow-up
  'email-hannah': [
    {
      id: 'em-hannah-1',
      threadId: 'email-hannah',
      direction: 'inbound',
      sentAt: dayAt(0, 7, 15),
      body: 'Hi,\n\nGot the spa package confirmation, thank you! Could we move the couples massage to 4pm instead of 2pm on the day of check-in? Our train gets in around noon.\n\nThanks,\nHannah',
    },
  ],

  // Single inbound — review request reply
  'email-robert': [
    {
      id: 'em-robert-1',
      threadId: 'email-robert',
      direction: 'inbound',
      sentAt: dayAt(1, 18, 20),
      body: 'Hello,\n\nHappy to leave a review — the staff were fantastic and the room was spotless. One small note for your team: the room safe wasn’t working during our stay. Wanted to flag it for the next guest.\n\nBest,\nRob',
    },
  ],

  // Single inbound — itemized receipt request
  'email-yuki': [
    {
      id: 'em-yuki-1',
      threadId: 'email-yuki',
      direction: 'inbound',
      sentAt: dayAt(0, 6, 20),
      body: 'Hello,\n\nCould you email me an itemized receipt for my company expense report? I need the room charges and taxes broken out separately. Thank you for a wonderful stay.\n\nRegards,\nYuki',
    },
  ],

  // Single inbound — pre-arrival, check-in tomorrow
  'email-carlos': [
    {
      id: 'em-carlos-1',
      threadId: 'email-carlos',
      direction: 'inbound',
      sentAt: dayAt(1, 17, 0),
      body: 'Hi,\n\nAll set on my end — see you tomorrow. One quick question: is parking included with the room, or is there a nightly charge?\n\nThanks,\nCarlos',
    },
  ],

  // Single inbound — UNLINKED events inquiry
  'email-events': [
    {
      id: 'em-events-1',
      threadId: 'email-events',
      direction: 'inbound',
      sentAt: dayAt(1, 12, 0),
      body: 'Hello,\n\nI’m organizing a professional conference in October and would like to reserve a block of 25 rooms for three nights. Could you send your group rates, availability, and whether you have meeting space on site?\n\nBest,\nRebecca Nolan\nCascade Events Co.',
    },
  ],

  // Archived, resolved thread
  'email-marco': [
    {
      id: 'em-marco-1',
      threadId: 'email-marco',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: dayAt(2, 13, 50),
      body: 'Hi Marco,\n\nJust a friendly reminder that your check-in is tomorrow. You can check in online any time to skip the front desk line. Let us know if there’s anything we can prepare for your arrival!\n\nWarm regards,\nTheresa',
    },
    {
      id: 'em-marco-2',
      threadId: 'email-marco',
      direction: 'inbound',
      sentAt: dayAt(2, 14, 10),
      body: 'Thanks, all set! Looking forward to it.',
    },
  ],

  // Archived, resolved thread
  'email-liam': [
    {
      id: 'em-liam-1',
      threadId: 'email-liam',
      direction: 'inbound',
      sentAt: dayAt(3, 10, 30),
      body: 'Hi,\n\nJust confirming our reservation for Thursday — is a 3pm check-in fine? We’re driving in from out of state.\n\nThanks,\nLiam',
    },
    {
      id: 'em-liam-2',
      threadId: 'email-liam',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: dayAt(3, 11, 0),
      body: 'Hi Liam,\n\nConfirmed — your reservation is all set and 3pm check-in works perfectly. Drive safely, and we’ll see you Thursday afternoon!\n\nWarm regards,\nTheresa',
    },
  ],

  // Archived, resolved thread
  'email-chloe': [
    {
      id: 'em-chloe-1',
      threadId: 'email-chloe',
      direction: 'inbound',
      sentAt: dayAt(4, 9, 0),
      body: 'Hi,\n\nWe’re arriving early on Saturday, around 10am. Any chance the room could be ready then? No worries if not.\n\nThank you,\nChloe',
    },
    {
      id: 'em-chloe-2',
      threadId: 'email-chloe',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: dayAt(4, 9, 30),
      body: 'Hi Chloe,\n\nGood news — we’ve arranged an early check-in for you at 10am on Saturday. Your room will be ready when you arrive. Safe travels!\n\nWarm regards,\nTheresa',
    },
  ],
};
