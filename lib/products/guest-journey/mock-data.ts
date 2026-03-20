/**
 * Guest Journey Mock Data
 *
 * 9 messages across all 5 stages with realistic email/SMS content + merge tags.
 * 3 scheduled campaigns. 3 segments.
 */

import { GuestJourneyMessage, ScheduledCampaign, Segment } from './types';

// ── Mock Messages ───────────────────────────────────────────────────────

export const mockMessages: GuestJourneyMessage[] = [
  // ── PRE_ARRIVAL ─────────────────────────────────────────────────────
  {
    id: 'msg-checkin-invite',
    title: 'Check In',
    type: 'CHECK_IN',
    stage: 'PRE_ARRIVAL',
    timing: {
      delta: '2_DAYS',
      direction: 'BEFORE',
      anchor: 'ARRIVAL',
      sendTime: '9:00 AM',
    },
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'Complete Your Check-in for {{hotel_name}}',
        body: 'Dear {{guest_first_name}},\n\nWe\'re excited to welcome you to {{hotel_name}} on {{arrival_date}}! To make your arrival seamless, please complete your online check-in.\n\n{{guest_url_button}}\n\nYou\'ll be able to:\n- Verify your identity\n- Confirm your payment method\n- Select room preferences\n- Add special requests\n\nSee you soon!\n{{hotel_name}}',
        language: 'en',
      },
      {
        channel: 'sms',
        isEnabled: true,
        body: 'Hi {{guest_first_name}}! Your stay at {{hotel_name}} is in 2 days. Complete check-in now: {{guest_url}}',
        language: 'en',
      },
      {
        channel: 'whatsapp',
        isEnabled: true,
        body: 'Hi {{guest_first_name}}, your stay at {{hotel_name}} is coming up on {{arrival_date}}. Complete your pre-arrival check-in here: {{guest_url}}. We look forward to welcoming you!',
        language: 'en',
      },
      {
        channel: 'booking',
        isEnabled: true,
        body: 'Hi {{guest_first_name}}, it\'s almost time for your stay at {{hotel_name}} - why not pre-check in now for a smooth arrival? Click here to start: {{guest_url}}.\n\nYou can reach out to the front desk by responding to this message any time. Reply QUIT to stop. Msg and data rates may apply.',
        language: 'en',
      },
      {
        channel: 'expedia',
        isEnabled: true,
        body: 'Hi {{guest_first_name}}, it\'s almost time for your stay at {{hotel_name}} - why not pre-check in now for a smooth arrival? Click here to start: {{guest_url}}.\n\nYou can reach out to the front desk by responding to this message any time. Reply QUIT to stop. Msg and data rates may apply.',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en', 'es'],
    segmentTarget: 'ALL_GUESTS',
    reminderCount: 2,
    whatsappStatus: 'approved' as const,
    segmentVariants: [
      {
        segmentId: 'seg-vip',
        isEnabled: true,
        channels: [
          { channel: 'email', isEnabled: true, subject: 'VIP Pre-Arrival Check-in — {{hotel_name}}', body: 'Dear {{guest_formal_name}},\n\nAs a valued Diamond Elite member, we\'ve prepared a personalized check-in experience for your upcoming stay at {{hotel_name}}.\n\nComplete your VIP pre-arrival check-in to unlock:\n- Priority room selection\n- Complimentary suite upgrade (subject to availability)\n- Express check-in at our VIP desk\n\n{{guest_url_button}}\n\nWe look forward to welcoming you.\n{{hotel_name}} Concierge Team', language: 'en' },
          { channel: 'sms', isEnabled: true, body: '{{guest_formal_name}}, as a Diamond Elite member at {{hotel_name}}, complete your VIP check-in for priority room selection and express arrival: {{guest_url}}', language: 'en' },
        ],
      },
    ],
  },
  // Check-in Invitation reminders
  {
    id: 'msg-checkin-invite-reminder-1',
    title: 'Check In',
    type: 'CHECK_IN',
    stage: 'PRE_ARRIVAL',
    timing: {
      delta: '1_DAY',
      direction: 'BEFORE',
      anchor: 'ARRIVAL',
      sendTime: '9:00 AM',
    },
    channels: [
      {
        channel: 'sms',
        isEnabled: true,
        body: 'Reminder: {{guest_first_name}}, your stay at {{hotel_name}} is tomorrow! Complete check-in now: {{guest_url}}',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en'],
    segmentTarget: 'ALL_GUESTS',
    parentId: 'msg-checkin-invite',
    parentType: 'CHECK_IN',
  },
  {
    id: 'msg-checkin-invite-reminder-2',
    title: 'Check In',
    type: 'CHECK_IN',
    stage: 'PRE_ARRIVAL',
    timing: {
      delta: 'SAME_DAY',
      direction: 'BEFORE',
      anchor: 'ARRIVAL',
      sendTime: '12:00 PM',
    },
    channels: [
      {
        channel: 'sms',
        isEnabled: false,
        body: 'Last chance to check in online before arriving at {{hotel_name}}: {{guest_url}}',
        language: 'en',
      },
    ],
    isEnabled: false,
    supportedLanguages: ['en'],
    segmentTarget: 'ALL_GUESTS',
    parentId: 'msg-checkin-invite',
    parentType: 'CHECK_IN',
  },
  {
    id: 'msg-welcome-pre',
    title: 'Welcome Message',
    type: 'CUSTOM',
    stage: 'PRE_ARRIVAL',
    timing: {
      delta: '5_DAYS',
      direction: 'BEFORE',
      anchor: 'ARRIVAL',
      sendTime: '10:00 AM',
    },
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'Getting Ready for Your Stay at {{hotel_name}}',
        body: 'Dear {{guest_formal_name}},\n\nThank you for choosing {{hotel_name}}. We\'re preparing everything for your arrival on {{arrival_date}}.\n\nHere are a few things to know:\n- Check-in time: 3:00 PM\n- Valet parking available\n- Restaurant reservations recommended\n\nWe look forward to hosting you.\n\nWarm regards,\n{{hotel_name}} Team',
        language: 'en',
      },
    ],
    isEnabled: false,
    supportedLanguages: ['en'],
    segmentTarget: 'ALL_GUESTS',
  },

  // ── ARRIVAL ─────────────────────────────────────────────────────────
  {
    id: 'msg-checkin-confirmed',
    title: 'Post check-in',
    type: 'POST_CHECK_IN',
    stage: 'ARRIVAL',
    timing: {
      delta: 'ASAP',
      direction: 'AFTER',
      anchor: 'CHECK_IN',
    },
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'Check-in Confirmed — Welcome to {{hotel_name}}!',
        body: 'Dear {{guest_first_name}},\n\nYour check-in is confirmed! Here are your stay details:\n\n- Confirmation: {{confirmation_id}}\n- Room Type: {{room_type}}\n- Check-out: {{departure_date}}\n\nIf you need anything during your stay, don\'t hesitate to reach out.\n\nEnjoy your stay!\n{{hotel_name}}',
        language: 'en',
      },
      {
        channel: 'sms',
        isEnabled: true,
        body: 'Welcome to {{hotel_name}}, {{guest_first_name}}! Your check-in is confirmed. Conf#: {{confirmation_id}}. Need help? Reply to this message.',
        language: 'en',
      },
      {
        channel: 'whatsapp',
        isEnabled: true,
        body: 'Your check-in at {{hotel_name}} is confirmed! Conf#: {{confirmation_id}}. Reply here if you need anything during your stay.',
        language: 'en',
      },
      {
        channel: 'booking',
        isEnabled: true,
        body: 'Welcome to {{hotel_name}}, {{guest_first_name}}! Your check-in is confirmed. Confirmation: {{confirmation_id}}. Feel free to message us if you need anything.',
        language: 'en',
      },
      {
        channel: 'expedia',
        isEnabled: true,
        body: 'Welcome to {{hotel_name}}, {{guest_first_name}}! Your check-in is confirmed. Confirmation: {{confirmation_id}}. Feel free to message us if you need anything.',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en', 'es'],
    segmentTarget: 'ALL_GUESTS',
    whatsappStatus: 'approved',
  },

  // ── IN_HOUSE ────────────────────────────────────────────────────────
  {
    id: 'msg-welcome-inhouse',
    title: 'Welcome to the Hotel',
    type: 'CUSTOM',
    stage: 'IN_HOUSE',
    timing: {
      delta: 'ASAP',
      direction: 'AFTER',
      anchor: 'ARRIVAL',
      delayMinutes: 60,
    },
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'Welcome! Here\'s What\'s Happening at {{hotel_name}}',
        body: 'Hi {{guest_first_name}},\n\nWelcome to {{hotel_name}}! We hope you\'re settling in.\n\nHere\'s what\'s happening today:\n- Rooftop bar happy hour: 5-7 PM\n- Live jazz in the lobby: 8 PM\n- Late-night room service available until 1 AM\n\nExplore our amenities and services:\n{{guest_url_button}}\n\nEnjoy!\n{{hotel_name}} Team',
        language: 'en',
      },
      {
        channel: 'sms',
        isEnabled: true,
        body: 'Welcome to {{hotel_name}}, {{guest_first_name}}! Happy hour at the rooftop bar 5-7 PM today. See all amenities: {{guest_url}}',
        language: 'en',
      },
      {
        channel: 'whatsapp',
        isEnabled: true,
        body: 'Welcome to {{hotel_name}}! We hope you enjoy your stay. Feel free to message us here for anything you need during your visit.',
        language: 'en',
      },
      {
        channel: 'booking',
        isEnabled: true,
        body: 'Welcome to {{hotel_name}}, {{guest_first_name}}! We hope you enjoy your stay. Message us anytime if you need assistance.',
        language: 'en',
      },
      {
        channel: 'expedia',
        isEnabled: true,
        body: 'Welcome to {{hotel_name}}, {{guest_first_name}}! We hope you enjoy your stay. Message us anytime if you need assistance.',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en', 'es', 'fr'],
    segmentTarget: 'ALL_GUESTS',
    whatsappStatus: 'approved_marketing',
    segmentVariants: [
      {
        segmentId: 'seg-nonmembers',
        isEnabled: true,
        channels: [
          { channel: 'email', isEnabled: true, subject: 'Welcome to {{hotel_name}} — Join Our Loyalty Program!', body: 'Hi {{guest_first_name}},\n\nWelcome to {{hotel_name}}! We hope you\'re settling in nicely.\n\nDid you know? By joining our loyalty program, you can earn points on every stay and unlock exclusive benefits like:\n- Room upgrades\n- Late checkout\n- Complimentary breakfast\n- Member-only rates\n\nSign up today — it\'s free and takes less than a minute.\n\nEnjoy your stay!\n{{hotel_name}} Team', language: 'en' },
          { channel: 'sms', isEnabled: true, body: 'Welcome to {{hotel_name}}, {{guest_first_name}}! Join our free loyalty program to earn points and unlock upgrades on future stays. Ask the front desk for details!', language: 'en' },
        ],
      },
    ],
  },
  {
    id: 'msg-upsell-amenities',
    title: 'Upsell',
    type: 'UPSELL',
    stage: 'IN_HOUSE',
    timing: {
      delta: '1_DAY',
      direction: 'AFTER',
      anchor: 'ARRIVAL',
      sendTime: '2:00 PM',
    },
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'Enhance Your Stay at {{hotel_name}}',
        body: 'Hi {{guest_first_name}},\n\nMake the most of your time with us! We have some exclusive offerings for our guests:\n\n- Spa & Wellness: Book a rejuvenating treatment\n- Restaurant: Reserve a table at our award-winning restaurant\n- Room Upgrade: Upgrade to a suite for a special rate\n- Late Checkout: Extend your stay for just $50\n\nBrowse and book:\n{{guest_url_button}}\n\n{{hotel_name}} Team',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en'],
    segmentTarget: 'ALL_GUESTS',
    segmentVariants: [
      {
        segmentId: 'seg-corporate',
        isEnabled: true,
        channels: [
          { channel: 'email', isEnabled: true, subject: 'Business Amenities at {{hotel_name}}', body: 'Dear {{guest_first_name}},\n\nWe hope your business trip is going well. As a corporate guest, you have access to our exclusive business amenities:\n\n- Business Center: 24/7 access with printing and scanning\n- Meeting Rooms: Complimentary 2-hour booking\n- Express Laundry: Same-day turnaround\n- Airport Transfer: Pre-book your departure\n\nBrowse and book:\n{{guest_url_button}}\n\n{{hotel_name}} Team', language: 'en' },
        ],
      },
      {
        segmentId: 'seg-weekend',
        isEnabled: false,
        channels: [
          { channel: 'email', isEnabled: true, subject: 'Weekend Experiences at {{hotel_name}}', body: 'Hi {{guest_first_name}},\n\nMake your weekend unforgettable! Here are some special weekend-only offerings:\n\n- Saturday Brunch: Chef\'s special tasting menu\n- Pool & Cabana: Reserve your spot\n- Couples Spa Package: 20% off this weekend\n- Late Checkout: Enjoy until 2 PM for just $30\n\n{{guest_url_button}}\n\n{{hotel_name}} Team', language: 'en' },
        ],
      },
    ],
  },
  {
    id: 'msg-midstay',
    title: 'Mid-Stay',
    type: 'MID_STAY',
    stage: 'IN_HOUSE',
    timing: {
      delta: '2_DAYS',
      direction: 'AFTER',
      anchor: 'ARRIVAL',
      sendTime: '10:00 AM',
    },
    channels: [
      {
        channel: 'sms',
        isEnabled: true,
        body: 'Hi {{guest_first_name}}, how is your stay at {{hotel_name}}? If there\'s anything we can do to make it better, just reply here. We\'re happy to help!',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en'],
    segmentTarget: 'ALL_GUESTS',
  },

  // ── DEPARTURE ───────────────────────────────────────────────────────
  {
    id: 'msg-checkout-reminder',
    title: 'Checkout',
    type: 'CHECK_OUT',
    stage: 'DEPARTURE',
    timing: {
      delta: 'SAME_DAY',
      direction: 'BEFORE',
      anchor: 'DEPARTURE',
      sendTime: '8:00 AM',
    },
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'Checkout Today — {{hotel_name}}',
        body: 'Good morning {{guest_first_name}},\n\nThis is a friendly reminder that checkout is today by 11:00 AM.\n\nYou can check out:\n- At the front desk\n- Via mobile checkout: {{guest_url_button}}\n\nNeed a late checkout? Contact the front desk and we\'ll do our best to accommodate.\n\nThank you for staying with us!\n{{hotel_name}}',
        language: 'en',
      },
      {
        channel: 'sms',
        isEnabled: true,
        body: 'Good morning {{guest_first_name}}! Checkout is by 11 AM today. Check out on your phone: {{guest_url}} — Need late checkout? Reply here!',
        language: 'en',
      },
      {
        channel: 'whatsapp',
        isEnabled: true,
        body: 'Good morning {{guest_first_name}}! Checkout is by 11 AM today. You can check out via mobile: {{guest_url}}. Need a late checkout? Just reply here!',
        language: 'en',
      },
      {
        channel: 'booking',
        isEnabled: true,
        body: 'Good morning {{guest_first_name}}, your checkout at {{hotel_name}} is today by 11:00 AM. If you need a late checkout, please reply to this message.',
        language: 'en',
      },
      {
        channel: 'expedia',
        isEnabled: true,
        body: 'Good morning {{guest_first_name}}, your checkout at {{hotel_name}} is today by 11:00 AM. If you need a late checkout, please reply to this message.',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en', 'es'],
    segmentTarget: 'ALL_GUESTS',
    whatsappStatus: 'approved',
    segmentVariants: [
      {
        segmentId: 'seg-long-stay',
        isEnabled: true,
        channels: [
          { channel: 'email', isEnabled: true, subject: 'Thank You for Your Extended Stay — {{hotel_name}}', body: 'Dear {{guest_first_name}},\n\nThank you for choosing to spend multiple nights with us at {{hotel_name}}. We hope every day of your stay was memorable.\n\nAs a multi-night guest, we\'d love to offer you a special rate on your next visit. Check out our loyalty offers:\n{{guest_url_button}}\n\nSafe travels!\n{{hotel_name}} Team', language: 'en' },
          { channel: 'sms', isEnabled: true, body: 'Thank you for your extended stay at {{hotel_name}}, {{guest_first_name}}! We have a special return rate waiting for you. Check out on your phone: {{guest_url}}', language: 'en' },
        ],
      },
    ],
  },

  // ── POST_DEPARTURE ──────────────────────────────────────────────────
  {
    id: 'msg-thank-you',
    title: 'Post checkout',
    type: 'POST_CHECK_OUT',
    stage: 'POST_DEPARTURE',
    timing: {
      delta: 'ASAP',
      direction: 'AFTER',
      anchor: 'CHECK_OUT',
      delayMinutes: 120,
    },
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'Thank You, {{guest_first_name}}!',
        body: 'Dear {{guest_first_name}},\n\nThank you for choosing {{hotel_name}}. We hope you had a wonderful stay.\n\nYour final folio has been sent to {{guest_email}}. If you have any questions about charges, please don\'t hesitate to contact us.\n\nWe hope to welcome you back soon!\n\nBest regards,\n{{hotel_name}} Team',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en'],
    segmentTarget: 'ALL_GUESTS',
  },
  {
    id: 'msg-review-request',
    title: 'Review Request',
    type: 'CUSTOM',
    stage: 'POST_DEPARTURE',
    timing: {
      delta: '1_DAY',
      direction: 'AFTER',
      anchor: 'CHECK_OUT',
      sendTime: '3:00 PM',
    },
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'How Was Your Stay at {{hotel_name}}?',
        body: 'Dear {{guest_first_name}},\n\nWe hope you enjoyed your stay at {{hotel_name}}! Your feedback helps us improve and helps other travelers make informed decisions.\n\nWould you take a moment to share your experience?\n\n[Leave a Review]\n\nThank you for your time — it means a lot to our team.\n\nWarmly,\n{{hotel_name}}',
        language: 'en',
      },
      {
        channel: 'sms',
        isEnabled: true,
        body: 'Hi {{guest_first_name}}, thank you for staying at {{hotel_name}}! We\'d love your feedback — leave a quick review: {{guest_url}}',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en', 'es'],
    segmentTarget: 'ALL_GUESTS',
  },
];

// ── Mock Campaigns ──────────────────────────────────────────────────────

export const mockCampaigns: ScheduledCampaign[] = [
  {
    id: 'camp-weekly-specials',
    title: 'A Special Evening for Our Diamond Elite Members',
    sendTime: '1:00 PM',
    repeatEvery: 1,
    cadence: 'weekly',
    weeklyDay: 'Tuesday',
    endCondition: 'on_date',
    endOnDate: '02/14/2025',
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'Exclusive Invitation: Diamond Elite Wednesdays',
        body: 'Dear {{guest_first_name}}, As a valued Diamond Elite member, you\'re invited to our exclusive Diamond Social Hour this Thursday at 6:00 PM. Join us in the Sky Lounge for complimentary wine, hors d\'oeuvres, and breathtaking views of the city. It\'s the perfect way to unwind and connect with fellow distinguished travelers.',
        language: 'en',
      },
      {
        channel: 'sms',
        isEnabled: true,
        body: 'Hi {{guest_first_name}}! Diamond Elite exclusive: Social Hour this Thursday at 6 PM in the Sky Lounge. Complimentary wine & hors d\'oeuvres. See you there!',
        language: 'en',
      },
      {
        channel: 'whatsapp',
        isEnabled: false,
        body: 'Hi {{guest_first_name}}! As a Diamond Elite member, you\'re invited to our exclusive Social Hour this Thursday at 6 PM in the Sky Lounge. Complimentary wine & hors d\'oeuvres. We hope to see you there!',
        language: 'en',
      },
      {
        channel: 'booking',
        isEnabled: false,
        body: 'Dear {{guest_first_name}}, as a valued guest you\'re invited to our Diamond Social Hour this Thursday at 6:00 PM in the Sky Lounge. Enjoy complimentary wine and hors d\'oeuvres.',
        language: 'en',
      },
      {
        channel: 'expedia',
        isEnabled: false,
        body: 'Dear {{guest_first_name}}, as a valued guest you\'re invited to our Diamond Social Hour this Thursday at 6:00 PM in the Sky Lounge. Enjoy complimentary wine and hors d\'oeuvres.',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en'],
    segmentTarget: 'ALL_GUESTS',
    nextSendDate: '01/14/2025',
    lastRunAt: '01/07/2025',
  },
  {
    id: 'camp-wine-tasting',
    title: 'Exclusive Wine Tasting Event',
    sendTime: '1:00 PM',
    repeatEvery: 1,
    cadence: 'monthly',
    monthlyWeekday: 'Tuesday',
    monthlyWeekdayOccurrence: 1,
    endCondition: 'after_count',
    endAfterCount: 3,
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'Exclusive Invitation: Diamond Elite Wednesdays',
        body: 'Dear {{guest_first_name}}, As a valued Diamond Elite member, you\'re invited to our exclusive Diamond Social Hour this Thursday at 6:00 PM. Join us in the Sky Lounge for complimentary wine, hors d\'oeuvres, and breathtaking views of the city. It\'s the perfect way to unwind and connect with fellow distinguished travelers.',
        language: 'en',
      },
      {
        channel: 'sms',
        isEnabled: true,
        body: 'You\'re invited to our exclusive wine tasting event! Join us for an evening of fine wines and gourmet pairings at {{hotel_name}}.',
        language: 'en',
      },
      {
        channel: 'whatsapp',
        isEnabled: false,
        body: 'You\'re invited to an exclusive wine tasting at {{hotel_name}}! An evening of fine wines, gourmet pairings, and great company awaits. Reply here to RSVP.',
        language: 'en',
      },
      {
        channel: 'booking',
        isEnabled: false,
        body: 'You\'re invited to an exclusive wine tasting event at {{hotel_name}}. Join us for an evening of fine wines and gourmet pairings. Contact the front desk for details.',
        language: 'en',
      },
      {
        channel: 'expedia',
        isEnabled: false,
        body: 'You\'re invited to an exclusive wine tasting event at {{hotel_name}}. Join us for an evening of fine wines and gourmet pairings. Contact the front desk for details.',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en'],
    segmentTarget: 'SPECIFIC_SEGMENT',
    segmentId: 'seg-vip',
    nextSendDate: '02/04/2025',
  },
  {
    id: 'camp-newsletter',
    title: 'Monthly Newsletter',
    sendTime: '9:00 AM',
    repeatEvery: 1,
    cadence: 'monthly',
    monthlyDay: 1,
    endCondition: 'never',
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: '{{hotel_name}} Monthly Newsletter',
        body: 'Your monthly update from {{hotel_name}} with news, events, and exclusive offers.\n\nThis month\'s highlights:\n- New spa treatments available\n- Restaurant menu refresh\n- Upcoming local events\n\nBook your next stay: {{guest_url}}',
        language: 'en',
      },
      {
        channel: 'sms',
        isEnabled: false,
        body: 'Hi {{guest_first_name}}! Check out what\'s new at {{hotel_name}} this month — new spa treatments, updated menus, and upcoming events. Visit {{guest_url}} for details.',
        language: 'en',
      },
      {
        channel: 'whatsapp',
        isEnabled: false,
        body: 'Hi {{guest_first_name}}! Here\'s your monthly update from {{hotel_name}}. We\'ve got new spa treatments, a refreshed restaurant menu, and exciting local events coming up. Reply here for more details!',
        language: 'en',
      },
      {
        channel: 'booking',
        isEnabled: false,
        body: 'Monthly update from {{hotel_name}}: New spa treatments available, restaurant menu refresh, and upcoming local events. We look forward to your next visit!',
        language: 'en',
      },
      {
        channel: 'expedia',
        isEnabled: false,
        body: 'Monthly update from {{hotel_name}}: New spa treatments available, restaurant menu refresh, and upcoming local events. We look forward to your next visit!',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en'],
    segmentTarget: 'ALL_GUESTS',
    nextSendDate: '04/01/2026',
    lastRunAt: '03/01/2026',
  },
];

// ── Mock Segments ───────────────────────────────────────────────────────

export const mockSegments: Segment[] = [
  {
    id: 'seg-diamond',
    name: 'Diamond Elite',
    rules: [{ id: 'rule-d1', guestProperty: 'Loyalty Status', condition: 'includes', values: ['Diamond'], dropdownValue: '' }],
    description: 'Diamond Elite loyalty members — highest tier benefits.',
    estimatedGuests: 45,
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: 'seg-platinum',
    name: 'Platinum Elite',
    rules: [{ id: 'rule-p1', guestProperty: 'Loyalty Status', condition: 'includes', values: ['Platinum'], dropdownValue: '' }],
    description: 'Platinum Elite loyalty members.',
    estimatedGuests: 87,
    createdAt: Date.now() - 86400000 * 55,
  },
  {
    id: 'seg-gold',
    name: 'Gold Elite',
    rules: [{ id: 'rule-g1', guestProperty: 'Loyalty Status', condition: 'includes', values: ['Gold'], dropdownValue: '' }],
    description: 'Gold Elite loyalty members.',
    estimatedGuests: 156,
    createdAt: Date.now() - 86400000 * 50,
  },
  {
    id: 'seg-silver',
    name: 'Silver Elite',
    rules: [{ id: 'rule-s1', guestProperty: 'Loyalty Status', condition: 'includes', values: ['Silver'], dropdownValue: '' }],
    description: 'Silver Elite loyalty members.',
    estimatedGuests: 234,
    createdAt: Date.now() - 86400000 * 45,
  },
  {
    id: 'seg-vip',
    name: 'High-level Loyalty',
    rules: [
      {
        id: 'rule-1',
        guestProperty: 'Loyalty Status',
        condition: 'includes',
        values: ['Diamond', 'Platinum'],
        dropdownValue: '',
      },
    ],
    description: 'Targets Diamond and Platinum loyalty members for premium experiences.',
    estimatedGuests: 142,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'seg-long-stay',
    name: 'Multi-night stays',
    rules: [
      {
        id: 'rule-2',
        guestProperty: 'Number of Nights Staying',
        condition: 'is equal to',
        values: [],
        dropdownValue: 'Multiple Nights',
      },
    ],
    description: 'Targets guests staying more than one night.',
    estimatedGuests: 287,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'seg-weekend',
    name: 'Weekend Leisure',
    rules: [
      {
        id: 'rule-3',
        guestProperty: 'Rate Code',
        condition: 'includes',
        values: ['LEISURE', 'WEEKEND', 'PKG'],
        dropdownValue: '',
      },
      {
        id: 'rule-4',
        guestProperty: 'Number of Nights Staying',
        condition: 'is equal to',
        values: [],
        dropdownValue: 'Multiple Nights',
        operator: 'And',
      },
    ],
    description: 'Targets leisure and weekend rate guests staying multiple nights.',
    estimatedGuests: 98,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'seg-corporate',
    name: 'Corporate Travellers',
    rules: [
      {
        id: 'rule-5',
        guestProperty: 'Rate Code',
        condition: 'includes',
        values: ['CORP', 'GOV', 'BIZ'],
        dropdownValue: '',
      },
    ],
    description: 'Targets guests on corporate, government, and business rate codes.',
    estimatedGuests: 203,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'seg-nonmembers',
    name: 'Non-members',
    rules: [
      {
        id: 'rule-6',
        guestProperty: 'Loyalty Status',
        condition: 'excludes',
        values: ['Diamond', 'Platinum', 'Gold', 'Silver'],
        dropdownValue: '',
      },
    ],
    description: 'Targets guests who are not part of any loyalty program.',
    estimatedGuests: 412,
    createdAt: Date.now() - 86400000 * 2,
  },
];
