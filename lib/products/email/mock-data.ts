/**
 * Email Channel — Mock Data
 *
 * The six Figma threads, verbatim (subjects/previews/dates from node 12:412).
 * Each thread is auto-linked to a canonical guest from lib/core/data by sender
 * address. Loyalty tiers are read live off the canonical guest in the UI — the
 * mock never re-states a guest's tier (single source of truth).
 *
 * Sender display names are deliberately different from the linked canonical
 * guest (e.g. "Emily Johnson" <emily.johnson@gmail.com> → Emily Smith) to
 * exercise the sender ≠ linked-guest model.
 */

import { EmailThread, EmailMessage } from './types';

const STAFF_NAME = 'Theresa Webb';

export const mockThreads: EmailThread[] = [
  {
    id: 'email-emily',
    senderName: 'Emily Johnson',
    senderEmail: 'emily.johnson@gmail.com',
    subject: 'Re: Your upcoming stay at The Statler — Nov 18',
    linkedGuestId: 'guest-emily',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: new Date('2025-06-12T09:20:00'),
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
    lastActivityAt: new Date('2025-06-12T08:05:00'),
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
    lastActivityAt: new Date('2025-06-11T16:42:00'),
    preview:
      'Hi, I just received my checkout summary and there’s a charge for $45 on November 21st that I don’t recognize. It’s listed under "miscellaneous." Could you look into that for me?',
  },
  {
    id: 'email-marco',
    senderName: 'Marco Rossi',
    senderEmail: 'marco.rossi@outlook.com',
    subject: 'Re: Welcome! Your Check-In is Tomorrow',
    linkedGuestId: 'guest-marco',
    status: 'archived',
    isUnread: false,
    lastActivityAt: new Date('2025-06-11T14:10:00'),
    preview: 'Thanks, all set! Looking forward to it.',
  },
  {
    id: 'email-kristin',
    senderName: 'Kristin Lee',
    senderEmail: 'kristin.lee@gmail.com',
    subject: 'Re: Your upcoming stay at The Statler — Nov 20',
    linkedGuestId: 'guest-kristin',
    status: 'inbox',
    isUnread: true,
    lastActivityAt: new Date('2025-06-11T11:30:00'),
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
    lastActivityAt: new Date('2025-06-11T09:15:00'),
    preview:
      'Hi there, We’re arriving this Friday for our anniversary. Quick question — is the rooftop bar open on weeknights? We’d love to have a drink up there if possible.',
  },
];

export const mockMessages: Record<string, EmailMessage[]> = {
  // Featured open thread — single inbound message (matches the Figma open state)
  'email-emily': [
    {
      id: 'em-emily-1',
      threadId: 'email-emily',
      direction: 'inbound',
      sentAt: new Date('2025-06-12T09:20:00'),
      body: "Hi,\n\nI received your pre-arrival email and had a quick question — is there a fee for early check-in? We're arriving around noon on the 18th and would love to get into the room if it's ready.\n\nAlso, do you have valet parking or is there a self-park option nearby?\n\nThanks,\nEmily",
    },
  ],

  // Short two-message history (inbound + staff reply)
  'email-noah': [
    {
      id: 'em-noah-1',
      threadId: 'email-noah',
      direction: 'inbound',
      sentAt: new Date('2025-06-12T08:05:00'),
      body: "Hi,\n\nWe'll be arriving late, around 11pm. Will the front desk still be open?\n\nBest,\nNoah",
    },
    {
      id: 'em-noah-2',
      threadId: 'email-noah',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: new Date('2025-06-12T08:32:00'),
      body: 'Hi Noah,\n\nAbsolutely — our front desk is staffed 24 hours, so someone will be there to greet you and get you checked in whenever you arrive. Safe travels!\n\nWarm regards,\nTheresa',
    },
  ],

  // Short two-message history (inbound + staff reply)
  'email-brooklyn': [
    {
      id: 'em-brooklyn-1',
      threadId: 'email-brooklyn',
      direction: 'inbound',
      sentAt: new Date('2025-06-11T16:42:00'),
      body: 'Hi,\n\nI just received my checkout summary and there’s a charge for $45 on November 21st that I don’t recognize. It’s listed under "miscellaneous." Could you look into that for me?\n\nThank you,\nBrooklyn',
    },
    {
      id: 'em-brooklyn-2',
      threadId: 'email-brooklyn',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: new Date('2025-06-11T17:15:00'),
      body: 'Hi Brooklyn,\n\nThank you for flagging that — I’m looking into the $45 miscellaneous charge from November 21st now and will follow up shortly with a full breakdown. Apologies for any confusion.\n\nBest,\nTheresa',
    },
  ],

  // Archived, resolved thread
  'email-marco': [
    {
      id: 'em-marco-1',
      threadId: 'email-marco',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: new Date('2025-06-11T13:50:00'),
      body: 'Hi Marco,\n\nJust a friendly reminder that your check-in is tomorrow. You can check in online any time to skip the front desk line. Let us know if there’s anything we can prepare for your arrival!\n\nWarm regards,\nTheresa',
    },
    {
      id: 'em-marco-2',
      threadId: 'email-marco',
      direction: 'inbound',
      sentAt: new Date('2025-06-11T14:10:00'),
      body: 'Thanks, all set! Looking forward to it.',
    },
  ],

  // Short two-message history (inbound + staff reply)
  'email-kristin': [
    {
      id: 'em-kristin-1',
      threadId: 'email-kristin',
      direction: 'inbound',
      sentAt: new Date('2025-06-11T11:30:00'),
      body: 'Hello,\n\nThanks for the heads up about our upcoming stay. I had a small request — if possible, could we be placed on a high floor with a city view? We’re celebrating my husband’s birthday and it would mean a lot.\n\nThank you so much,\nKristin',
    },
    {
      id: 'em-kristin-2',
      threadId: 'email-kristin',
      direction: 'outbound',
      staffName: STAFF_NAME,
      sentAt: new Date('2025-06-11T12:05:00'),
      body: 'Hi Kristin,\n\nHappy early anniversary to you both! I’ve added a note to your reservation requesting a high floor with a city view. While I can’t guarantee it until arrival, we’ll do everything we can to make it happen.\n\nWarm regards,\nTheresa',
    },
  ],

  // Single inbound
  'email-olivia': [
    {
      id: 'em-olivia-1',
      threadId: 'email-olivia',
      direction: 'inbound',
      sentAt: new Date('2025-06-11T09:15:00'),
      body: 'Hi there,\n\nWe’re arriving this Friday for our anniversary. Quick question — is the rooftop bar open on weeknights? We’d love to have a drink up there if possible.\n\nCheers,\nOlivia',
    },
  ],
};
