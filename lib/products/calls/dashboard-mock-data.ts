/**
 * Mock Data for Calls Dashboard
 *
 * Realistic call data for demo purposes.
 */

import type { CallSummary } from '@/lib/products/calls/dashboard-types';

export const mockCalls: CallSummary[] = [
  {
    uuid: 'call-31',
    terminal_state: 'transferred',
    derived_state: 'missed_by_front_desk',
    phone_number: '+1 (917) 442-8163',
    call_start_date: '2026-03-22T15:12:00Z',
    call_duration_seconds: 203,
    guest: {
      name: 'Priya Nair',
      phone_number: '+1 (917) 442-8163',
    },
    call: {
      summary: 'The guest reported a malfunctioning keycard and requested immediate access to her room. Voice AI gathered details before transferring to the front desk.',
      forward_category: 'Front Desk',
      forward_reason: 'Guest locked out of room due to keycard issue, requires front desk assistance.',
    },
    answeredQuestions: [
      { questionId: 'q18', question: 'Room Number', answer: 'Room 1407' },
      { questionId: 'q19', question: 'Type of Assistance', answer: 'Room issue (keycard not working)' },
      { questionId: 'q20', question: 'Urgency', answer: 'Immediate' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How may I assist you?', timestamp: '3:12 PM' },
      { speaker: 'guest', text: 'Hi, my keycard stopped working and I\'m locked out of my room.', timestamp: '3:12 PM' },
      { speaker: 'agent', text: 'I\'m sorry about that. What is your room number?', timestamp: '3:12 PM' },
      { speaker: 'guest', text: 'Room 1407.', timestamp: '3:13 PM' },
      { speaker: 'agent', text: 'And how urgent is this? Are you standing outside the room now?', timestamp: '3:13 PM' },
      { speaker: 'guest', text: 'Yes, I\'m in the hallway. I need to get in right away.', timestamp: '3:13 PM' },
      { speaker: 'agent', text: 'Let me transfer you to the front desk immediately so they can send someone up with a new keycard.', timestamp: '3:14 PM' },
    ],
  },
  {
    uuid: 'call-30',
    terminal_state: 'handled',
    derived_state: 'completed',
    phone_number: '+1 (646) 331-7720',
    call_start_date: '2026-03-21T11:05:00Z',
    call_duration_seconds: 142,
    guest: {
      name: 'Thomas Bergman',
      phone_number: '+1 (646) 331-7720',
    },
    call: {
      summary: 'The guest asked about late checkout availability and checkout time. The agent confirmed standard checkout is 11 AM and explained that late checkout until 2 PM may be available for a fee.',
    },
    transcript: [
      { speaker: 'agent', text: 'Welcome to The Statler. How can I help you today?', timestamp: '11:05 AM' },
      { speaker: 'guest', text: 'Hi, what time is checkout?', timestamp: '11:05 AM' },
      { speaker: 'agent', text: 'Standard checkout is at 11:00 AM. Would you like information about late checkout?', timestamp: '11:05 AM' },
      { speaker: 'guest', text: 'Yes please, is late checkout available?', timestamp: '11:06 AM' },
      { speaker: 'agent', text: 'Late checkout until 2:00 PM may be available depending on occupancy, typically for a fee of $50. I\'d recommend requesting it at the front desk the morning of your departure.', timestamp: '11:06 AM' },
      { speaker: 'guest', text: 'Good to know. I\'ll ask tomorrow morning. Thanks!', timestamp: '11:07 AM' },
    ],
  },
  {
    uuid: 'call-29',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (203) 876-4451',
    call_start_date: '2026-03-19T09:38:00Z',
    call_duration_seconds: 267,
    guest: {
      name: 'Catherine Aldridge',
      phone_number: '+1 (203) 876-4451',
    },
    call: {
      summary: 'The caller inquired about booking a bridal shower brunch at the hotel restaurant. Voice AI gathered party details before transferring to the restaurant team.',
      forward_category: 'Restaurant',
      forward_reason: 'Guest requesting private dining reservation for a bridal shower.',
    },
    answeredQuestions: [
      { questionId: 'q6', question: 'Number of Guests', answer: '18 people' },
      { questionId: 'q7', question: 'Preferred Date and Time', answer: 'Sunday, April 6th at 11:00 AM' },
      { questionId: 'q8', question: 'Dietary Restrictions', answer: 'Two guests are vegan, one has a nut allergy' },
      { questionId: 'q9', question: 'Special Occasion', answer: 'Birthday' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How may I help you today?', timestamp: '9:38 AM' },
      { speaker: 'guest', text: 'Hi, I\'m planning a bridal shower brunch and I\'d love to host it at your restaurant. Do you do private dining?', timestamp: '9:38 AM' },
      { speaker: 'agent', text: 'We do offer private dining options. How many guests are you expecting?', timestamp: '9:39 AM' },
      { speaker: 'guest', text: 'About 18 people.', timestamp: '9:39 AM' },
      { speaker: 'agent', text: 'What date and time were you considering?', timestamp: '9:39 AM' },
      { speaker: 'guest', text: 'Sunday, April 6th around 11 AM for a brunch.', timestamp: '9:40 AM' },
      { speaker: 'agent', text: 'Are there any dietary restrictions or allergies in your group?', timestamp: '9:40 AM' },
      { speaker: 'guest', text: 'Yes, two of us are vegan and one person has a severe nut allergy.', timestamp: '9:41 AM' },
      { speaker: 'agent', text: 'Let me connect you with our restaurant team who can check availability for the private dining room and discuss menu options.', timestamp: '9:41 AM' },
    ],
  },
  {
    uuid: 'call-28',
    terminal_state: 'transferred',
    derived_state: 'missed_by_front_desk',
    phone_number: '+1 (312) 609-5534',
    call_start_date: '2026-03-12T20:17:00Z',
    call_duration_seconds: 185,
    guest: {
      name: 'Robert Halsey',
      phone_number: '+1 (312) 609-5534',
    },
    call: {
      summary: 'The guest called about a noise complaint from the room above. Voice AI gathered details before transferring to the front desk for resolution.',
      forward_category: 'Front Desk',
      forward_reason: 'Noise complaint requiring immediate front desk intervention.',
    },
    answeredQuestions: [
      { questionId: 'q18', question: 'Room Number', answer: 'Room 803' },
      { questionId: 'q19', question: 'Type of Assistance', answer: 'Noise complaint' },
      { questionId: 'q20', question: 'Urgency', answer: 'Immediate' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Welcome to The Statler. How can I assist you?', timestamp: '8:17 PM' },
      { speaker: 'guest', text: 'Hi, I\'m in room 803 and there\'s extremely loud music coming from the room above me. It\'s been going on for over an hour.', timestamp: '8:17 PM' },
      { speaker: 'agent', text: 'I\'m sorry to hear that. Let me note your room number. How urgent would you say this is?', timestamp: '8:18 PM' },
      { speaker: 'guest', text: 'Very urgent. My wife and I are trying to sleep and we have an early flight.', timestamp: '8:18 PM' },
      { speaker: 'agent', text: 'I completely understand. Let me transfer you to the front desk right away so they can send someone to address the situation.', timestamp: '8:19 PM' },
    ],
  },
  {
    uuid: 'call-27',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (516) 223-9087',
    call_start_date: '2026-02-25T14:52:00Z',
    call_duration_seconds: 224,
    guest: {
      name: 'Elena Vasquez',
      phone_number: '+1 (516) 223-9087',
    },
    call: {
      summary: 'The caller wanted to book a deep tissue massage and facial package at the spa. Voice AI gathered treatment preferences and transferred to the spa team.',
      forward_category: 'Spa',
      forward_reason: 'Guest requesting spa package appointment for two treatments.',
    },
    answeredQuestions: [
      { questionId: 'q14', question: 'Treatment Type', answer: 'Package (massage + facial)' },
      { questionId: 'q15', question: 'Preferred Date and Time', answer: 'Saturday, March 1st at 10:00 AM' },
      { questionId: 'q16', question: 'Therapist Preference', answer: 'Female therapist' },
      { questionId: 'q17', question: 'Health Conditions', answer: 'None' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How may I help you?', timestamp: '2:52 PM' },
      { speaker: 'guest', text: 'Hi, I\'d like to book a spa treatment. Do you have any packages that include a massage and facial?', timestamp: '2:52 PM' },
      { speaker: 'agent', text: 'Yes, we offer several combination packages. What type of massage are you interested in?', timestamp: '2:53 PM' },
      { speaker: 'guest', text: 'A deep tissue massage, and then a hydrating facial afterwards.', timestamp: '2:53 PM' },
      { speaker: 'agent', text: 'When would you like to come in?', timestamp: '2:53 PM' },
      { speaker: 'guest', text: 'Saturday, March 1st in the morning, around 10 AM.', timestamp: '2:54 PM' },
      { speaker: 'agent', text: 'Do you have a therapist preference?', timestamp: '2:54 PM' },
      { speaker: 'guest', text: 'A female therapist, please.', timestamp: '2:54 PM' },
      { speaker: 'agent', text: 'Any health conditions or allergies we should know about?', timestamp: '2:55 PM' },
      { speaker: 'guest', text: 'No, nothing to note.', timestamp: '2:55 PM' },
      { speaker: 'agent', text: 'Let me transfer you to our spa team to confirm availability and pricing for the package.', timestamp: '2:55 PM' },
    ],
  },
  {
    uuid: 'call-26',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (718) 490-3312',
    call_start_date: '2026-02-18T16:30:00Z',
    call_duration_seconds: 295,
    guest: {
      name: 'Jonathan Pierce',
      phone_number: '+1 (718) 490-3312',
    },
    call: {
      summary: 'The caller inquired about hosting a product launch cocktail reception at the hotel. Voice AI gathered event details before transferring to the catering and events team.',
      forward_category: 'Catering & Events',
      forward_reason: 'Corporate event inquiry for a product launch reception.',
    },
    answeredQuestions: [
      { questionId: 'q1', question: 'Event Type', answer: 'Other (product launch cocktail reception)' },
      { questionId: 'q2', question: 'Group Size', answer: '80-100 people' },
      { questionId: 'q3', question: 'Preferred Dates', answer: 'April 10th, 2026 (evening)' },
      { questionId: 'q4', question: 'Catering Requirements', answer: 'Passed hors d\'oeuvres and cocktail bar, kosher options needed' },
      { questionId: 'q5', question: 'Budget Range', answer: 'Over $20,000' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How can I assist you today?', timestamp: '4:30 PM' },
      { speaker: 'guest', text: 'Hi, my company is looking to host a product launch event and we love the look of your venue. Do you handle private events?', timestamp: '4:30 PM' },
      { speaker: 'agent', text: 'Absolutely, we host a wide variety of private events. What type of event are you planning?', timestamp: '4:31 PM' },
      { speaker: 'guest', text: 'It\'s a cocktail reception for a product launch. We\'d want passed appetizers and a bar.', timestamp: '4:31 PM' },
      { speaker: 'agent', text: 'How many guests are you expecting?', timestamp: '4:31 PM' },
      { speaker: 'guest', text: 'Somewhere between 80 and 100.', timestamp: '4:32 PM' },
      { speaker: 'agent', text: 'What date are you considering?', timestamp: '4:32 PM' },
      { speaker: 'guest', text: 'April 10th, in the evening. Around 6 PM start.', timestamp: '4:32 PM' },
      { speaker: 'agent', text: 'Any dietary requirements or restrictions for the catering?', timestamp: '4:33 PM' },
      { speaker: 'guest', text: 'We\'ll need kosher options available for some attendees.', timestamp: '4:33 PM' },
      { speaker: 'agent', text: 'And what is your approximate budget for the event?', timestamp: '4:33 PM' },
      { speaker: 'guest', text: 'We\'re thinking north of $20,000, depending on what\'s included.', timestamp: '4:34 PM' },
      { speaker: 'agent', text: 'Excellent. Let me connect you with our catering and events team to discuss venue options and get you a proposal.', timestamp: '4:34 PM' },
    ],
  },
  {
    uuid: 'call-25',
    terminal_state: 'transferred',
    derived_state: 'missed_by_front_desk',
    phone_number: '+1 (929) 557-6841',
    call_start_date: '2026-02-10T08:04:00Z',
    call_duration_seconds: 198,
    guest: {
      name: 'Lisa Drummond',
      phone_number: '+1 (929) 557-6841',
    },
    call: {
      summary: 'The caller wanted to book a room for a weekend getaway and asked about availability and suite rates. Voice AI gathered reservation details before transferring to reservations.',
      forward_category: 'Reservations',
      forward_reason: 'Guest requesting suite availability and rates for a weekend stay.',
    },
    answeredQuestions: [
      { questionId: 'q10', question: 'Check-in and Check-out Dates', answer: 'February 21-23, 2026 (weekend)' },
      { questionId: 'q11', question: 'Number of Guests', answer: '2 adults, 1 child' },
      { questionId: 'q12', question: 'Room Type Preference', answer: 'Suite' },
      { questionId: 'q13', question: 'Special Occasion', answer: 'No special occasion' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Welcome to The Statler. How may I help you?', timestamp: '8:04 AM' },
      { speaker: 'guest', text: 'Good morning. I\'m looking to book a room for a weekend trip with my family.', timestamp: '8:04 AM' },
      { speaker: 'agent', text: 'I\'d be happy to help. What dates are you considering?', timestamp: '8:04 AM' },
      { speaker: 'guest', text: 'February 21st to 23rd.', timestamp: '8:05 AM' },
      { speaker: 'agent', text: 'How many guests will be staying?', timestamp: '8:05 AM' },
      { speaker: 'guest', text: 'Two adults and our seven-year-old daughter.', timestamp: '8:05 AM' },
      { speaker: 'agent', text: 'Do you have a room type preference?', timestamp: '8:06 AM' },
      { speaker: 'guest', text: 'We\'d prefer a suite if the price is reasonable. What are the rates?', timestamp: '8:06 AM' },
      { speaker: 'agent', text: 'Let me transfer you to our reservations team who can check availability and walk you through our suite options and rates.', timestamp: '8:06 AM' },
    ],
  },
  {
    uuid: 'call-23',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (408) 555-0192',
    call_start_date: '2026-01-08T18:45:00Z',
    call_duration_seconds: 195,
    guest: {
      name: 'Michael Chen',
      phone_number: '+1 (408) 555-0192',
    },
    call: {
      summary: 'The caller requested a dinner reservation at the hotel restaurant for a birthday celebration. Voice AI gathered dining preferences before transferring to the restaurant.',
      forward_category: 'Restaurant',
      forward_reason: 'Guest requesting dinner reservation for a special occasion.',
    },
    answeredQuestions: [
      { questionId: 'q6', question: 'Number of Guests', answer: '6 people' },
      { questionId: 'q7', question: 'Preferred Date and Time', answer: 'Saturday, January 11th at 7:30 PM' },
      { questionId: 'q8', question: 'Dietary Restrictions', answer: 'One vegetarian, one gluten-free' },
      { questionId: 'q9', question: 'Special Occasion', answer: 'Birthday' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How may I help you?', timestamp: '6:45 PM' },
      { speaker: 'guest', text: "Hi, I'd like to make a dinner reservation at your restaurant.", timestamp: '6:45 PM' },
      { speaker: 'agent', text: "I'd be happy to help with that. How many guests will be dining?", timestamp: '6:45 PM' },
      { speaker: 'guest', text: 'There will be 6 of us.', timestamp: '6:46 PM' },
      { speaker: 'agent', text: 'What date and time would you prefer?', timestamp: '6:46 PM' },
      { speaker: 'guest', text: 'Saturday, January 11th at 7:30 PM if possible.', timestamp: '6:46 PM' },
      { speaker: 'agent', text: 'Are there any dietary restrictions or allergies we should know about?', timestamp: '6:47 PM' },
      { speaker: 'guest', text: 'Yes, one person is vegetarian and another is gluten-free.', timestamp: '6:47 PM' },
      { speaker: 'agent', text: 'Is this for a special occasion?', timestamp: '6:47 PM' },
      { speaker: 'guest', text: "Yes, it's my wife's birthday.", timestamp: '6:48 PM' },
      { speaker: 'agent', text: "How wonderful! Let me transfer you to our restaurant team to confirm the reservation and discuss any special arrangements.", timestamp: '6:48 PM' },
    ],
  },
  {
    uuid: 'call-24',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (650) 555-0847',
    call_start_date: '2026-01-07T11:22:00Z',
    call_duration_seconds: 178,
    guest: {
      name: 'Sarah Thompson',
      phone_number: '+1 (650) 555-0847',
    },
    call: {
      summary: 'The caller inquired about spa services and wanted to book a couples massage. Voice AI gathered treatment preferences before transferring to the spa.',
      forward_category: 'Spa',
      forward_reason: 'Guest requesting couples massage appointment.',
    },
    answeredQuestions: [
      { questionId: 'q14', question: 'Treatment Type', answer: 'Massage (couples massage)' },
      { questionId: 'q15', question: 'Preferred Date and Time', answer: 'Friday, January 10th at 2:00 PM' },
      { questionId: 'q16', question: 'Therapist Preference', answer: 'No preference' },
      { questionId: 'q17', question: 'Health Conditions', answer: 'Partner has lower back sensitivity' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How can I assist you today?', timestamp: '11:22 AM' },
      { speaker: 'guest', text: "Hi, I'm staying at the hotel this weekend and wanted to book a spa treatment.", timestamp: '11:22 AM' },
      { speaker: 'agent', text: 'Of course! What type of treatment are you interested in?', timestamp: '11:22 AM' },
      { speaker: 'guest', text: "We'd like a couples massage.", timestamp: '11:23 AM' },
      { speaker: 'agent', text: 'Lovely choice. What date and time would you prefer?', timestamp: '11:23 AM' },
      { speaker: 'guest', text: 'Friday, January 10th around 2 PM if available.', timestamp: '11:23 AM' },
      { speaker: 'agent', text: 'Do you have a therapist preference - female, male, or no preference?', timestamp: '11:24 AM' },
      { speaker: 'guest', text: 'No preference for either of us.', timestamp: '11:24 AM' },
      { speaker: 'agent', text: 'Are there any health conditions or allergies we should be aware of?', timestamp: '11:24 AM' },
      { speaker: 'guest', text: 'My partner has some lower back sensitivity, so they should be gentle in that area.', timestamp: '11:25 AM' },
      { speaker: 'agent', text: "I've noted that. Let me transfer you to our spa team to confirm availability and finalize your appointment.", timestamp: '11:25 AM' },
    ],
  },
  {
    uuid: 'call-22',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (555) 234-5678',
    call_start_date: '2026-01-08T14:34:00Z',
    call_duration_seconds: 240,
    guest: {
      name: 'Maria Rodriguez',
      phone_number: '+1 (555) 234-5678',
    },
    call: {
      summary: 'The caller inquired about hosting a corporate retreat for Meridian Tech. Voice AI gathered event details before transferring to the events team.',
      forward_category: 'Catering & Events',
      forward_reason: 'Corporate event inquiry requiring events team follow-up.',
    },
    answeredQuestions: [
      { questionId: 'q1', question: 'Event Type', answer: 'Corporate retreat / team building' },
      { questionId: 'q2', question: 'Group Size', answer: '45-50 people' },
      { questionId: 'q3', question: 'Preferred Dates', answer: 'March 15-16, 2026 (flexible on weekdays)' },
      { questionId: 'q4', question: 'Catering Requirements', answer: 'Full day catering, vegetarian options needed, no alcohol' },
      { questionId: 'q5', question: 'Budget Range', answer: '$10,000 - $20,000' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How may I help you today?', timestamp: '2:34 PM' },
      { speaker: 'guest', text: 'Hi, I\'m calling about hosting a corporate event at your hotel.', timestamp: '2:34 PM' },
      { speaker: 'agent', text: 'I\'d be happy to help with that. What type of event are you planning?', timestamp: '2:35 PM' },
      { speaker: 'guest', text: 'It\'s a corporate retreat and team building event for Meridian Tech.', timestamp: '2:35 PM' },
      { speaker: 'agent', text: 'Excellent! How many guests are you expecting?', timestamp: '2:35 PM' },
      { speaker: 'guest', text: 'About 45 to 50 people.', timestamp: '2:36 PM' },
      { speaker: 'agent', text: 'What dates are you considering?', timestamp: '2:36 PM' },
      { speaker: 'guest', text: 'March 15th and 16th, but we\'re flexible on weekdays if needed.', timestamp: '2:36 PM' },
      { speaker: 'agent', text: 'Do you have any catering requirements or dietary restrictions?', timestamp: '2:37 PM' },
      { speaker: 'guest', text: 'Yes, we need full day catering with vegetarian options, and no alcohol.', timestamp: '2:37 PM' },
      { speaker: 'agent', text: 'And what is your approximate budget for the event?', timestamp: '2:37 PM' },
      { speaker: 'guest', text: 'We\'re looking at $8,000 to $12,000 total.', timestamp: '2:38 PM' },
      { speaker: 'agent', text: 'Perfect. Let me transfer you to our events team who can discuss availability and provide a detailed quote.', timestamp: '2:38 PM' },
    ],
  },
  {
    uuid: 'call-1',
    terminal_state: 'transferred',
    derived_state: 'missed_by_front_desk',
    phone_number: '+1 (630) 669-7188',
    call_start_date: '2025-12-29T09:42:00Z',
    call_duration_seconds: 245,
    call: {
      summary: 'The guest inquired about check-in time and was told it\'s available until 12 AM, then requested to speak with the sales department and was transferred.',
      forward_category: 'Front Desk',
      forward_reason: 'The caller needs to speak with the sales department.',
    },
    transcript: [
      { speaker: 'agent', text: 'Welcome to The Statler. How can I help?', timestamp: '9:42 AM' },
      { speaker: 'guest', text: 'Hi. What time is check-in?', timestamp: '9:42 AM' },
      { speaker: 'agent', text: 'Check-in is available until 12 AM. I do not have information about the earliest check-in time. Is there anything else I can help you with?', timestamp: '9:42 AM' },
      { speaker: 'guest', text: 'Can I speak with somebody in the sales department?', timestamp: '9:43 AM' },
      { speaker: 'agent', text: "I'm transferring you now to someone who can assist you. One moment, please.", timestamp: '9:43 AM' },
    ],
  },
  {
    uuid: 'call-2',
    terminal_state: 'transferred',
    derived_state: 'missed_by_front_desk',
    phone_number: '+1 (360) 649-3445',
    call_start_date: '2025-12-23T08:25:00Z',
    call_duration_seconds: 312,
    guest: {
      name: 'Kevin Park',
      phone_number: '+1 (360) 649-3445',
    },
    call: {
      summary: 'The guest asked for help with the room\'s heat and slow Internet. Voice AI gathered details before transferring to the front desk for Internet assistance.',
      forward_category: 'Front Desk',
      forward_reason: 'The caller needs further assistance with their Internet issue that the automated agent was unable to resolve.',
    },
    answeredQuestions: [
      { questionId: 'q18', question: 'Room Number', answer: 'Room 412' },
      { questionId: 'q19', question: 'Type of Assistance', answer: 'Room issue (heating and Internet)' },
      { questionId: 'q20', question: 'Urgency', answer: 'Immediate' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Welcome to The Statler. How can I help you today?', timestamp: '8:25 AM' },
      { speaker: 'guest', text: "Hi, I'm in room 412 and it's really cold in here. How do I turn up the heat?", timestamp: '8:25 AM' },
      { speaker: 'agent', text: 'I can help with that. The thermostat is located on the wall near the entrance. Press the up arrow to increase the temperature. It may take a few minutes to warm up.', timestamp: '8:26 AM' },
      { speaker: 'guest', text: "Okay, I found it. Also, the Internet is really slow. I can't get my video calls to work.", timestamp: '8:27 AM' },
      { speaker: 'agent', text: 'How urgent is this request?', timestamp: '8:27 AM' },
      { speaker: 'guest', text: 'Pretty urgent, I have a call in 30 minutes.', timestamp: '8:27 AM' },
      { speaker: 'agent', text: "I understand. Let me transfer you to the front desk who can send someone to check on your connection right away.", timestamp: '8:28 AM' },
    ],
  },
  {
    uuid: 'call-3',
    terminal_state: 'transferred',
    derived_state: 'missed_by_front_desk',
    phone_number: '+44 7782 686057',
    call_start_date: '2025-12-18T06:19:00Z',
    call_duration_seconds: 428,
    guest: {
      name: 'James Whitfield',
      phone_number: '+44 7782 686057',
    },
    call: {
      summary: 'The guest inquired about the hotel\'s amenities and booking a stay for this weekend. Voice AI gathered reservation details before transferring to the reservations team.',
      forward_category: 'Reservations',
      forward_reason: 'The caller needs assistance with rates and availability for this weekend.',
    },
    answeredQuestions: [
      { questionId: 'q10', question: 'Check-in and Check-out Dates', answer: 'December 21-22, 2025 (this weekend)' },
      { questionId: 'q11', question: 'Number of Guests', answer: '2 adults' },
      { questionId: 'q12', question: 'Room Type Preference', answer: 'Suite' },
      { questionId: 'q13', question: 'Special Occasion', answer: 'Anniversary' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How may I assist you today?', timestamp: '6:19 AM' },
      { speaker: 'guest', text: "Hi, I'm interested in booking a stay this weekend. Can you tell me about your amenities?", timestamp: '6:19 AM' },
      { speaker: 'agent', text: 'Of course! We have a heated outdoor pool open from 6 AM to 10 PM, a full-service spa, and two restaurants on-site. What are your check-in and check-out dates?', timestamp: '6:20 AM' },
      { speaker: 'guest', text: 'This weekend, December 21st to 22nd.', timestamp: '6:20 AM' },
      { speaker: 'agent', text: 'How many guests will be staying?', timestamp: '6:20 AM' },
      { speaker: 'guest', text: 'Just 2 adults.', timestamp: '6:21 AM' },
      { speaker: 'agent', text: 'Do you have a room type preference?', timestamp: '6:21 AM' },
      { speaker: 'guest', text: "We'd like a suite if available.", timestamp: '6:21 AM' },
      { speaker: 'agent', text: 'Is this booking for a special occasion?', timestamp: '6:22 AM' },
      { speaker: 'guest', text: "Yes, it's our anniversary.", timestamp: '6:22 AM' },
      { speaker: 'agent', text: 'Congratulations! Let me transfer you to our reservations team who can help with availability and rates.', timestamp: '6:23 AM' },
    ],
  },
  {
    uuid: 'call-4',
    terminal_state: 'transferred',
    derived_state: 'missed_by_front_desk',
    phone_number: '+1 (310) 657-1333',
    call_start_date: '2025-12-15T16:31:00Z',
    call_duration_seconds: 289,
    call: {
      summary: 'The guest inquired about the hotel restaurant and room service, and was provided with information on dining options. The guest was then transferred to the front desk to address concerns about the pool temperature and make a reservation.',
      forward_category: 'Front Desk',
      forward_reason: 'The caller\'s pool temperature concern requires human assistance and the agent is transferring the call to the front desk.',
    },
  },
  {
    uuid: 'call-5',
    terminal_state: 'transferred',
    derived_state: 'missed_by_front_desk',
    phone_number: '+1 (510) 557-5258',
    call_start_date: '2025-12-05T08:47:00Z',
    call_duration_seconds: 356,
    guest: {
      name: 'David Chang',
      phone_number: '+1 (510) 557-5258',
      arrival_date: '2025-12-10',
      departure_date: '2025-12-12',
    },
    call: {
      summary: 'The guest inquired about the hotel\'s airport shuttle, early check-in, and dining options, and was transferred to a reservation agent for further assistance. The guest was provided with information about the shuttle and on-site restaurant, Smoke, before being transferred.',
      forward_category: 'Reservations',
      forward_reason: 'The call was transferred because the guest requested to speak with a reservation agent.',
    },
  },
  {
    uuid: 'call-6',
    terminal_state: 'transferred',
    derived_state: 'missed_by_front_desk',
    phone_number: '+1 (909) 647-3157',
    call_start_date: '2025-12-03T09:19:00Z',
    call_duration_seconds: 412,
    call: {
      summary: 'The guest inquired about booking a room from January 17 to January 28, 2026, for 2 adults and 2 children, and was transferred to the reservations team to discuss a discount.',
      forward_category: 'Reservations',
      forward_reason: 'The caller has a question regarding a discount for their booking.',
    },
  },
  {
    uuid: 'call-7',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (786) 286-3311',
    call_start_date: '2025-11-27T16:59:00Z',
    call_duration_seconds: 198,
    call: {
      summary: 'The guest inquired about availability for a one-night stay on December 2-3 and was transferred to the reservations team to complete the booking over the phone.',
      forward_category: 'Reservations',
      forward_reason: 'The caller needs assistance with completing their booking.',
    },
  },
  {
    uuid: 'call-8',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+852 3001 1572',
    call_start_date: '2025-11-05T16:28:00Z',
    call_duration_seconds: 267,
    call: {
      summary: 'The guest asked about check-in time and hotel amenities, and was transferred to the front desk for assistance with accessing their room.',
      forward_category: 'Front Desk',
      forward_reason: 'The caller needs assistance with accessing their room.',
    },
  },
  {
    uuid: 'call-9',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (786) 664-7460',
    call_start_date: '2025-11-04T07:51:00Z',
    call_duration_seconds: 334,
    guest: {
      name: 'Mohsin Saeed',
      phone_number: '+1 (786) 664-7460',
      arrival_date: '2025-11-04',
      departure_date: '2025-11-07',
    },
    call: {
      summary: 'The guest inquired about the pool and check-in time, and was informed that the pool is open from 6:00 AM to 6:00 PM and check-in begins at 3:00 PM. The guest was then transferred to the front desk to assist with a room upgrade.',
      forward_category: 'Front Desk',
      forward_reason: 'The caller needs assistance with upgrading their room.',
    },
    answeredQuestions: [
      { questionId: 'q18', question: 'Room Number', answer: 'Checking in today (no room yet)' },
      { questionId: 'q19', question: 'Type of Assistance', answer: 'Check-in/Check-out (room upgrade request)' },
      { questionId: 'q20', question: 'Urgency', answer: 'Today' },
    ],
    transcript: [
      { speaker: 'agent', text: 'Welcome to The Statler. How can I help you today?', timestamp: '7:51 AM' },
      { speaker: 'guest', text: "Hi, I'm checking in today. What time is the pool open?", timestamp: '7:51 AM' },
      { speaker: 'agent', text: 'The pool is open from 6:00 AM to 6:00 PM daily.', timestamp: '7:52 AM' },
      { speaker: 'guest', text: 'Great. And what time can I check in?', timestamp: '7:52 AM' },
      { speaker: 'agent', text: 'Check-in begins at 3:00 PM. Is there anything else I can help you with?', timestamp: '7:52 AM' },
      { speaker: 'guest', text: "Actually yes, I'd like to inquire about upgrading my room to a suite.", timestamp: '7:53 AM' },
      { speaker: 'agent', text: 'I can connect you with the front desk to discuss upgrade options. How urgent is this request?', timestamp: '7:53 AM' },
      { speaker: 'guest', text: "Not super urgent, just want to know before I check in today.", timestamp: '7:53 AM' },
      { speaker: 'agent', text: 'Let me transfer you to the front desk who can check availability and pricing for you.', timestamp: '7:54 AM' },
    ],
  },
  {
    uuid: 'call-10',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (914) 719-2386',
    call_start_date: '2025-09-24T13:08:00Z',
    call_duration_seconds: 187,
    call: {
      summary: 'Amir requested an extra towel and Wi-Fi maintenance for his room. He was transferred to someone who can assist with his requests.',
      forward_category: 'Maintenance',
      forward_reason: 'The caller is requesting extra assistance with their room amenities and Wi-Fi.',
    },
  },
  {
    uuid: 'call-11',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (712) 251-4836',
    call_start_date: '2025-09-24T13:09:00Z',
    call_duration_seconds: 145,
    guest: {
      name: 'Becca Aleynik',
      phone_number: '+1 (712) 251-4836',
      arrival_date: '2025-09-23',
      departure_date: '2025-09-26',
    },
    call: {
      summary: 'Becca requested towels to be sent to room 218. The agent transferred the call to assist with the request.',
      forward_category: 'Front Desk',
      forward_reason: 'The caller is requesting towels be sent to their room.',
    },
  },
  {
    uuid: 'call-12',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (201) 477-8278',
    call_start_date: '2025-10-08T10:40:00Z',
    call_duration_seconds: 423,
    guest: {
      name: 'Daniel Anderson',
      phone_number: '+1 (201) 477-8278',
    },
    call: {
      summary: 'The guest asked about check-in time and hotel amenities, and was informed that check-in is at 3:00 PM and the hotel has a pool and gym. The guest was then transferred to someone else for further assistance.',
      forward_category: 'Front Desk',
      forward_reason: 'The caller is requesting more information about the hotel\'s pool and gym.',
    },
  },
  {
    uuid: 'call-13',
    terminal_state: 'handled',
    derived_state: 'completed',
    phone_number: '+1 (650) 745-5828',
    call_start_date: '2026-01-08T10:26:00Z',
    call_duration_seconds: 189,
    guest: {
      name: 'Brandon Gip',
      phone_number: '+1 (650) 745-5828',
    },
    call: {
      summary: 'The guest inquired about check-in time and hotel dining options. The agent provided check-in time and information about the hotel\'s restaurant and bakery.',
    },
    transcript: [
      { speaker: 'agent', text: 'Welcome to The Statler. How can I help you today?', timestamp: '10:26 AM' },
      { speaker: 'guest', text: 'Hi, what time is check-in?', timestamp: '10:26 AM' },
      { speaker: 'agent', text: 'Check-in is available starting at 3:00 PM. Is there anything else I can help you with?', timestamp: '10:26 AM' },
      { speaker: 'guest', text: 'Yes, do you have a restaurant on site?', timestamp: '10:27 AM' },
      { speaker: 'agent', text: 'Yes! We have Smoke, our on-site restaurant open for breakfast, lunch, and dinner. We also have a bakery in the lobby that serves fresh pastries and coffee.', timestamp: '10:27 AM' },
      { speaker: 'guest', text: 'Perfect, that\'s all I needed. Thank you!', timestamp: '10:28 AM' },
      { speaker: 'agent', text: 'You\'re welcome! We look forward to your stay.', timestamp: '10:28 AM' },
    ],
  },
  {
    uuid: 'call-14',
    terminal_state: 'handled',
    derived_state: 'completed',
    phone_number: '+1 (347) 979-2523',
    call_start_date: '2026-01-06T14:22:00Z',
    call_duration_seconds: 312,
    guest: {
      name: 'Amanda Corbosiero',
      phone_number: '+1 (347) 979-2523',
    },
    call: {
      summary: 'The guest inquired about the hotel\'s pool and pet policy, and then booked a room for January 14th to 15th. The agent sent a booking link to the guest\'s phone to complete the reservation.',
    },
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How may I assist you?', timestamp: '2:22 PM' },
      { speaker: 'guest', text: 'Hi, I\'m thinking of booking a stay. Do you have a pool?', timestamp: '2:22 PM' },
      { speaker: 'agent', text: 'Yes, we have a rooftop pool open from 10:00 AM to 8:00 PM daily.', timestamp: '2:23 PM' },
      { speaker: 'guest', text: 'Great! And what\'s your pet policy? I have a small dog.', timestamp: '2:23 PM' },
      { speaker: 'agent', text: 'We welcome dogs under 25 pounds for a $35 nightly pet fee. We even have treats at the front desk!', timestamp: '2:24 PM' },
      { speaker: 'guest', text: 'Perfect. I\'d like to book a room for January 14th to 15th.', timestamp: '2:24 PM' },
      { speaker: 'agent', text: 'I\'d be happy to help. I\'m sending a booking link to your phone now to complete your reservation.', timestamp: '2:25 PM' },
      { speaker: 'guest', text: 'Got it. Thank you so much!', timestamp: '2:26 PM' },
    ],
  },
  {
    uuid: 'call-18',
    terminal_state: undefined,
    derived_state: 'completed',
    phone_number: '+1 (315) 908-1338',
    call_start_date: '2026-01-05T17:49:00Z',
    call_duration_seconds: 23,
    call: {
      summary: 'No user conversation detected.',
    },
  },
  {
    uuid: 'call-15',
    terminal_state: 'handled',
    derived_state: 'completed',
    phone_number: '+1 (415) 687-5250',
    call_start_date: '2026-01-05T12:54:00Z',
    call_duration_seconds: 156,
    call: {
      summary: 'The guest asked about check-in time and parking options. The agent provided check-in time as available until 12 AM and explained the hotel\'s parking options.',
    },
    transcript: [
      { speaker: 'agent', text: 'Welcome to The Statler. How can I help?', timestamp: '12:54 PM' },
      { speaker: 'guest', text: 'What time can I check in?', timestamp: '12:54 PM' },
      { speaker: 'agent', text: 'Check-in is available until 12 AM. Our front desk is open 24 hours.', timestamp: '12:54 PM' },
      { speaker: 'guest', text: 'And do you have parking?', timestamp: '12:55 PM' },
      { speaker: 'agent', text: 'Yes, we offer both valet parking for $45 per night and self-parking for $30 per night.', timestamp: '12:55 PM' },
      { speaker: 'guest', text: 'Great, thanks for the info.', timestamp: '12:56 PM' },
    ],
  },
  {
    uuid: 'call-21',
    terminal_state: 'transferred',
    derived_state: 'completed',
    phone_number: '+1 (323) 555-0147',
    call_start_date: '2026-01-04T09:15:00Z',
    call_duration_seconds: 187,
    guest: {
      name: 'Rachel Kim',
      phone_number: '+1 (323) 555-0147',
    },
    call: {
      summary: 'The guest requested to speak with the events team about booking a conference room. The agent transferred the call to the events department.',
      forward_category: 'Events',
      forward_reason: 'The caller needs to discuss conference room availability and pricing.',
    },
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How may I help you?', timestamp: '9:15 AM' },
      { speaker: 'guest', text: 'Hi, I\'m interested in booking a conference room for a corporate event next month.', timestamp: '9:15 AM' },
      { speaker: 'agent', text: 'I\'d be happy to connect you with our events team. They can discuss availability, room options, and pricing with you.', timestamp: '9:16 AM' },
      { speaker: 'guest', text: 'That would be great, thank you.', timestamp: '9:16 AM' },
      { speaker: 'agent', text: 'I\'m transferring you now. One moment please.', timestamp: '9:17 AM' },
    ],
  },
  {
    uuid: 'call-16',
    terminal_state: 'handled',
    derived_state: 'completed',
    phone_number: '+1 (360) 649-3445',
    call_start_date: '2025-12-23T08:23:00Z',
    call_duration_seconds: 98,
    call: {
      summary: 'The guest requested extra towels, specifying 5 extra bath towels, and the agent notified the hotel staff to send them to the room.',
    },
    transcript: [
      { speaker: 'agent', text: 'Welcome to The Statler. How can I assist you?', timestamp: '8:23 AM' },
      { speaker: 'guest', text: 'Hi, I\'m in room 305. Could I get some extra towels please?', timestamp: '8:23 AM' },
      { speaker: 'agent', text: 'Of course! How many towels would you like?', timestamp: '8:23 AM' },
      { speaker: 'guest', text: '5 extra bath towels would be great.', timestamp: '8:24 AM' },
      { speaker: 'agent', text: 'I\'ve notified housekeeping. They\'ll bring 5 bath towels to room 305 shortly.', timestamp: '8:24 AM' },
      { speaker: 'guest', text: 'Thank you!', timestamp: '8:24 AM' },
    ],
  },
  {
    uuid: 'call-17',
    terminal_state: 'handled',
    derived_state: 'completed',
    phone_number: '+1 (317) 379-9178',
    call_start_date: '2025-12-22T13:47:00Z',
    call_duration_seconds: 234,
    guest: {
      name: 'Ziyang Long',
      phone_number: '+1 (317) 379-9178',
    },
    call: {
      summary: 'The guest inquired about the hotel\'s pet policy and was informed that dogs under 25 pounds are allowed for a $35 nightly fee. The guest was also offered to bring their dog to the front desk for a treat.',
    },
    transcript: [
      { speaker: 'agent', text: 'Thank you for calling The Statler. How can I help you today?', timestamp: '1:47 PM' },
      { speaker: 'guest', text: 'Hi, I\'m checking in tomorrow and I wanted to ask about your pet policy.', timestamp: '1:47 PM' },
      { speaker: 'agent', text: 'We\'re pet-friendly! Dogs under 25 pounds are welcome for a $35 nightly fee.', timestamp: '1:48 PM' },
      { speaker: 'guest', text: 'Perfect, my dog is a small terrier. Is there anything I need to bring?', timestamp: '1:48 PM' },
      { speaker: 'agent', text: 'Just your furry friend! We have water bowls available at the front desk, and feel free to stop by for a treat for your pup.', timestamp: '1:49 PM' },
      { speaker: 'guest', text: 'That\'s wonderful, thank you so much!', timestamp: '1:49 PM' },
    ],
  },
  {
    uuid: 'call-19',
    terminal_state: undefined,
    derived_state: 'active',
    phone_number: '+1 (415) 555-0123',
    call_start_date: new Date().toISOString(),
    call_duration_seconds: 67,
    call: {
      summary: 'Currently speaking with guest about reservation changes...',
      forward_category: 'Reservations',
    },
  },
  {
    uuid: 'call-20',
    terminal_state: undefined,
    derived_state: 'active',
    phone_number: '+1 (212) 555-0456',
    call_start_date: new Date(Date.now() - 120000).toISOString(),
    call_duration_seconds: 124,
    guest: {
      name: 'Jennifer Martinez',
      phone_number: '+1 (212) 555-0456',
    },
    call: {
      summary: 'Discussing spa appointment availability...',
      forward_category: 'Spa',
    },
  },
];

/**
 * Get calls filtered by derived state, sorted by date (most recent first)
 */
export function getCallsByState(state: 'missed_by_front_desk' | 'completed' | 'active'): CallSummary[] {
  return mockCalls
    .filter(call => call.derived_state === state)
    .sort((a, b) => new Date(b.call_start_date).getTime() - new Date(a.call_start_date).getTime());
}

/**
 * Get a single call by UUID
 */
export function getCallByUuid(uuid: string): CallSummary | undefined {
  return mockCalls.find(call => call.uuid === uuid);
}

/**
 * Format call date for display
 */
export function formatCallDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleDateString('en-US', options).replace(',', ' •');
}

/**
 * Format duration for display (e.g., "2:45")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
