/**
 * Message templates — the composer's template library.
 *
 * TWO TABS, TWO VERBS. This is the settled design rule and it is the reason the
 * two lists are separate data rather than one list with a flag:
 *
 *   • PRESET MESSAGES are the hotel's own canned replies. They are a STARTING
 *     POINT — the button reads "Use", the body lands in the composer, and the
 *     agent edits it before sending. That is why every preset body carries its
 *     merge tags LITERALLY (`{{ guest_first_name }}`): production interpolates
 *     them at send time, and a hotelier reading the list needs to see which
 *     facts the template is going to fill in for her.
 *   • APPLE MESSAGE TEMPLATES are Apple-hosted rich message payloads. They are
 *     not text you can edit — the payload is the artefact — so the button reads
 *     "Send" and the message goes immediately.
 *
 * The merge-tag vocabulary is production's own set:
 * `{{ guest_first_name }}` · `{{ hotel_name }}` · `{{ arrival_date }}` ·
 * `{{ guest_url }}` · `{{ confirmation_id }}`. Nothing here invents a tag —
 * an invented tag in a demo is a promise the real product cannot keep.
 *
 * The first three bodies in each list are VERBATIM from the frames
 * (`tpl-open` / `tpl-select`); the remaining presets are written in the same
 * register against the same tag set.
 */

export interface MessageTemplate {
  id: string;
  title: string;
  body: string;
}

/**
 * PRESET MESSAGES — inserted into the composer, editable before send.
 *
 * The drawn three first, in the frames' order, then three more that cover the
 * three shapes a front desk actually reuses: a pre-arrival nudge, a paid
 * upsell offer, and a factual answer to a question that gets asked every day.
 */
export const PRESET_TEMPLATES: MessageTemplate[] = [
  {
    id: 'preset-welcome',
    title: 'Welcome',
    body:
      'Hi {{ guest_first_name }}! We are excited to welcome you to Canary Test Hotel. ' +
      'For fast and easy communication directly with the front desk, we now offer texting. ' +
      'Please reply to this text with any comments, questions, or concerns.',
  },
  {
    id: 'preset-dnd-housekeeping',
    title: 'DND - Housekeeping Service',
    body:
      'Good morning, we noticed you have a privacy sign on your door. Would you like us to ' +
      'return for housekeeping service today? If so, what time is best for you?',
  },
  {
    id: 'preset-extend-stay',
    title: 'Extend Your Stay Promotion',
    body:
      'Exclusive offer for our in-house guests only!\n' +
      'Extend your reservation and receive an additional $25 off of our “Book Direct and Save” nightly room rate!\n' +
      'Please reach out to Front Desk for more details and mention “extended stay promotion”.',
  },
  {
    id: 'preset-pre-arrival',
    title: 'Pre-Arrival Check-In',
    body:
      'Hi {{ guest_first_name }}, your stay at {{ hotel_name }} begins {{ arrival_date }}. ' +
      'You can check in online before you get here — it takes about a minute: {{ guest_url }}\n' +
      'Reply to this message if there is anything we can set up for your arrival.',
  },
  {
    id: 'preset-late-checkout',
    title: 'Late Check-Out Offer',
    body:
      'Good morning {{ guest_first_name }}! Not ready to head out? We can hold your room until ' +
      '2:00 PM for $40, subject to availability. Reply YES and we will add it to reservation ' +
      '{{ confirmation_id }}.',
  },
  {
    id: 'preset-wifi',
    title: 'WiFi Details',
    body:
      'Happy to help! The guest network at {{ hotel_name }} is “Canary-Guest”, and the password ' +
      'is your room number followed by your last name. If it will not connect, reply here and we ' +
      'will send someone up.',
  },
];

/**
 * APPLE MESSAGE TEMPLATES — sent as-is, immediately.
 *
 * The drawn three, verbatim. Deliberately the same three bodies as the top of
 * the preset list: production seeds both lists from the same hotel copy, and
 * the difference a hotelier is being asked to understand is the VERB, not the
 * wording. Two different sets of words would have taught the opposite.
 */
export const APPLE_TEMPLATES: MessageTemplate[] = [
  PRESET_TEMPLATES[0],
  PRESET_TEMPLATES[1],
  PRESET_TEMPLATES[2],
].map((t) => ({ ...t, id: `apple-${t.id}` }));
