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
    title: 'Weekly Specials',
    sendTime: '10:00 AM',
    repeatEvery: 1,
    cadence: 'weekly',
    weeklyDays: [2], // Tuesday
    endCondition: 'never',
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'This Week\'s Special Offers at {{hotel_name}}',
        body: 'Check out our latest deals and exclusive offers for guests.',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en'],
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
        body: 'Your monthly update from {{hotel_name}} with news, events, and exclusive offers.',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en'],
  },
  {
    id: 'camp-birthday',
    title: 'Birthday Greeting',
    sendTime: '9:00 AM',
    repeatEvery: 1,
    cadence: 'monthly',
    monthlyDay: 15,
    endCondition: 'after_count',
    endAfterCount: 12,
    channels: [
      {
        channel: 'email',
        isEnabled: true,
        subject: 'Happy Birthday from {{hotel_name}}!',
        body: 'Happy Birthday, {{guest_first_name}}! As a gift, enjoy a complimentary drink at our bar on your next visit.',
        language: 'en',
      },
      {
        channel: 'sms',
        isEnabled: true,
        body: 'Happy Birthday, {{guest_first_name}}! Enjoy a free drink at {{hotel_name}} on your next visit. Show this message at the bar!',
        language: 'en',
      },
    ],
    isEnabled: true,
    supportedLanguages: ['en'],
  },
];

// ── Mock Segments ───────────────────────────────────────────────────────

export const mockSegments: Segment[] = [
  {
    id: 'seg-vip',
    name: 'VIP Guests',
    conditions: [
      {
        id: 'cond-1',
        property: 'loyalty',
        operator: 'equals',
        value: 'Diamond',
      },
    ],
    conditionLogic: 'AND',
  },
  {
    id: 'seg-long-stay',
    name: 'Long-stay Guests',
    conditions: [
      {
        id: 'cond-2',
        property: 'length_of_stay',
        operator: 'greater_than',
        value: 3,
      },
    ],
    conditionLogic: 'AND',
  },
  {
    id: 'seg-returning',
    name: 'Returning Guests',
    conditions: [
      {
        id: 'cond-3',
        property: 'guest_recurrence',
        operator: 'equals',
        value: 'returning',
      },
    ],
    conditionLogic: 'AND',
  },
];
