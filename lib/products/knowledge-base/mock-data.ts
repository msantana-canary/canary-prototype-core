/**
 * Knowledge Base Mock Data — Statler New York
 */

import { KBCategory, CustomContextEntry } from './types';

export const mockCategories: KBCategory[] = [
  {
    id: 'arrival-departure',
    title: 'Arrival & Departure',
    entries: [
      {
        id: 'ad-checkin-time',
        question: 'What time is check-in?',
        answer: 'Check-in is at 3:00 PM.',
      },
      {
        id: 'ad-checkout-time',
        question: 'What time is check-out?',
        answer: 'Check-out is at 11:00 AM. Late check-out may be available upon request for an additional fee.',
      },
      {
        id: 'ad-shuttle',
        question: 'Airport Shuttle',
        value: 'no' as const,
        subQuestions: [
          { id: 'ad-shuttle-how', question: 'How do I get to the hotel from the airport?', answer: 'The Statler is a 30-minute taxi ride from JFK and a 20-minute ride from LaGuardia. We recommend using a rideshare service or our preferred car service — please contact the front desk for arrangements.' },
        ],
      },
      {
        id: 'ad-parking',
        question: 'Parking',
        value: 'yes' as const,
        subQuestions: [
          { id: 'ad-parking-desc', question: 'What kind of parking is available?', answer: 'Valet parking is available at our Commerce Street entrance for $65 plus tax per day (includes in-and-out privileges). Self-parking is available at the nearby SP+ garage on Jackson Street for $45/day.' },
        ],
      },
      {
        id: 'ad-bags',
        question: 'Can someone help us with our bags?',
        answer: 'Absolutely! Our bell staff is available 24/7 to assist with luggage. Just let the front desk know when you arrive.',
      },
    ],
  },
  {
    id: 'hotel-facilities',
    title: 'Hotel Facilities',
    entries: [
      {
        id: 'hf-wifi',
        question: 'What is the WiFi login and password?',
        answer: 'Connect to "Statler-Guest" network. No password required — accept the terms on the landing page to connect.',
      },
      {
        id: 'hf-pool',
        question: 'Pool',
        value: 'yes' as const,
        subQuestions: [
          { id: 'hf-pool-loc', question: 'Where is the pool located?', answer: 'The rooftop pool is located on the 19th floor with panoramic views of downtown Dallas.' },
          { id: 'hf-pool-open', question: 'What time does the pool open?', answer: '7:00 AM' },
          { id: 'hf-pool-close', question: 'What time does the pool close?', answer: '10:00 PM' },
        ],
      },
      {
        id: 'hf-hottub',
        question: 'Hot Tub',
        value: 'yes' as const,
        subQuestions: [
          { id: 'hf-hottub-loc', question: 'Where is the hot tub located?', answer: 'The hot tub is adjacent to the rooftop pool on the 19th floor.' },
          { id: 'hf-hottub-open', question: 'What time does the hot tub open?', answer: '7:00 AM' },
          { id: 'hf-hottub-close', question: 'What time does the hot tub close?', answer: '10:00 PM' },
        ],
      },
      {
        id: 'hf-gym',
        question: 'Gym/Fitness Studio',
        value: 'yes' as const,
        subQuestions: [
          { id: 'hf-gym-desc', question: 'Can you describe the gym?', answer: 'Our 24-hour fitness center features Peloton bikes, treadmills, ellipticals, free weights, and a stretching area. Located on the 3rd floor.' },
          { id: 'hf-gym-open', question: 'What time does the gym open?', answer: 'Open 24 hours.' },
        ],
      },
      {
        id: 'hf-spa',
        question: 'Spa',
        value: 'yes' as const,
        subQuestions: [
          { id: 'hf-spa-desc', question: 'Can you describe the spa?', answer: 'The Statler Spa offers a full menu of treatments including massages, facials, body wraps, and nail services. Book in advance as appointments fill quickly.' },
          { id: 'hf-spa-open', question: 'What time does the spa open?', answer: '9:00 AM' },
          { id: 'hf-spa-close', question: 'What time does the spa close?', answer: '8:00 PM' },
        ],
      },
      {
        id: 'hf-restaurant',
        question: 'Restaurant',
        value: 'yes' as const,
        subQuestions: [
          { id: 'hf-rest-desc', question: 'Can you describe the hotel restaurant?', answer: 'Elm & Good is our signature restaurant offering modern Texas cuisine with locally sourced ingredients. We also have Waterproof, our rooftop bar and lounge.' },
          { id: 'hf-rest-open', question: 'What time does the restaurant open?', answer: 'Breakfast: 7:00 AM. Lunch: 11:30 AM. Dinner: 5:30 PM.' },
          { id: 'hf-rest-close', question: 'What time does the restaurant close?', answer: 'Kitchen closes at 10:00 PM. Bar service until midnight.' },
        ],
      },
      {
        id: 'hf-business',
        question: 'Business Center',
        value: 'yes' as const,
        subQuestions: [
          { id: 'hf-biz-desc', question: 'Can you describe the business facilities?', answer: 'Our business center on the 2nd floor includes complimentary printing, scanning, and high-speed internet. Private meeting rooms are available for reservation.' },
          { id: 'hf-biz-open', question: 'What time does the business center open?', answer: '6:00 AM' },
          { id: 'hf-biz-close', question: 'What time does the business center close?', answer: '11:00 PM' },
        ],
      },
    ],
  },
  {
    id: 'room-services',
    title: 'Room & Services',
    entries: [
      { id: 'rs-fridge', question: 'Is there a fridge in the room?', value: 'yes' as const, subQuestions: [] },
      { id: 'rs-iron', question: 'Is there an iron in the room?', value: 'yes' as const, subQuestions: [] },
      { id: 'rs-safe', question: 'Is there an in-room safe?', value: 'yes' as const, subQuestions: [] },
      { id: 'rs-hairdryer', question: 'Is there a hair dryer in the room?', value: 'yes' as const, subQuestions: [] },
      {
        id: 'rs-heating',
        question: 'How can I adjust the heating in my room?',
        answer: 'Use the thermostat panel on the wall near the entrance. You can set your preferred temperature between 60°F and 80°F.',
      },
      {
        id: 'rs-ac',
        question: 'How can I adjust the air conditioning in my room?',
        answer: 'The same thermostat panel controls both heating and cooling. Switch to "Cool" mode and set your desired temperature.',
      },
      {
        id: 'rs-laundry',
        question: 'Does the hotel have laundry available?',
        answer: 'Yes, we offer same-day dry cleaning and laundry service. Place items in the laundry bag in your closet and call the front desk for pickup before 9:00 AM for same-day return.',
      },
      {
        id: 'rs-housekeeping',
        question: 'How often is housekeeping provided?',
        answer: 'Daily housekeeping is provided. Place the "Do Not Disturb" sign on your door if you prefer to skip service. Contact the front desk for additional towels or amenities.',
      },
      {
        id: 'rs-roomservice',
        question: 'How can I order room service?',
        answer: 'Dial "0" on your in-room phone for room service. Available daily from 6:00 AM to midnight. A full menu is available in the compendium on your nightstand.',
      },
      {
        id: 'rs-ice',
        question: 'Where are the ice machines?',
        answer: 'Ice machines are located on every other floor near the elevator lobby. Floors 3, 5, 7, 9, 11, 13, 15, 17, and 19.',
      },
      {
        id: 'rs-packages',
        question: 'Can the hotel receive packages for me?',
        answer: 'Yes, we accept packages at the front desk. Please use: ATTN: [Your Name], Statler New York, 1914 Commerce St, Dallas, TX 75201.',
      },
      {
        id: 'rs-pets',
        question: 'Does the hotel allow pets?',
        answer: 'Yes! The Statler is pet-friendly. Dogs under 50 lbs are welcome with a $75 per stay pet fee. We provide water bowls and treats at check-in.',
      },
      {
        id: 'rs-smoking',
        question: 'Does the hotel allow smoking?',
        answer: 'The Statler is a 100% smoke-free property. Smoking is not permitted indoors. A designated outdoor smoking area is available on the ground floor terrace.',
      },
    ],
  },
];

export const mockCustomContext: CustomContextEntry[] = [
  { id: 'cc-1', text: 'The Statler was originally built in 1956 and underwent a $460 million restoration completed in 2017.' },
  { id: 'cc-2', text: 'Elm & Good restaurant serves breakfast from 7 AM, lunch from 11:30 AM, and dinner from 5:30 PM daily.' },
  { id: 'cc-3', text: 'The rooftop pool and bar, Waterproof, is open seasonally from April through October.' },
  { id: 'cc-4', text: 'The hotel is a 5-minute walk from the Dallas Arts District and 10 minutes from Dealey Plaza.' },
  { id: 'cc-5', text: 'Complimentary coffee is available in the lobby from 6:00 AM to 10:00 AM daily.' },
  { id: 'cc-6', text: 'The nearest DART light rail station is Akard Station, a 3-minute walk from the hotel.' },
  { id: 'cc-7', text: 'Room upgrades are subject to availability and can be requested at check-in or via the Canary app.' },
  { id: 'cc-8', text: 'The hotel has 20 floors and 159 guest rooms, including 6 suites.' },
  { id: 'cc-9', text: 'The Statler ballroom can accommodate up to 300 guests for events and weddings.' },
  { id: 'cc-10', text: 'Guests can request a rollaway bed for $25/night, subject to availability.' },
  { id: 'cc-11', text: 'The concierge desk is staffed from 7:00 AM to 10:00 PM for restaurant reservations, tours, and local recommendations.' },
  { id: 'cc-12', text: 'DFW Airport is approximately 25 minutes away by car. Love Field is 15 minutes away.' },
  { id: 'cc-13', text: 'The hotel offers complimentary bicycle rentals for exploring downtown Dallas.' },
  { id: 'cc-14', text: 'High-speed WiFi is complimentary for all guests. Premium bandwidth is available for $9.95/day.' },
  { id: 'cc-15', text: 'The Statler partners with local gallery Deep Ellum Art Co. for rotating lobby art installations.' },
];
