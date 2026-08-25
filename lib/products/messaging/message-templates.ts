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
 * The property this prototype is signed in to.
 *
 * ⚠ The SAME string is hardcoded in `app/(dashboard)/layout.tsx` and
 * `app/(settings)/layout.tsx` for the shell's property switcher. It is repeated
 * here rather than imported because those are the shell's props and this is
 * template data; the honest fix is a property record in `lib/core/data/`, which
 * is a shared-data change (ping Miguel). Logged rather than faked.
 */
export const DEMO_PROPERTY_NAME = 'Days Inn & Suites by Wyndham Wausau';

/**
 * The facts a merge tag can name. Every field is optional: a thread with no
 * linked guest knows none of them, and a tag with nothing behind it must not
 * render as an empty hole.
 */
export interface MergeTagContext {
  guest_first_name?: string;
  hotel_name?: string;
  arrival_date?: string;
  confirmation_id?: string;
  guest_url?: string;
}

/**
 * Resolve `{{ tag }}` runs against what this conversation actually knows.
 *
 * ⚠ A DELIBERATE DEVIATION FROM PRODUCTION, and it is a deviation about WHEN.
 * Production interpolates at SEND time — the picker and the composer both carry
 * the literal tags, and the guest is the first party to see a real name. This
 * resolves at INSERT time instead, on the "Use" path only, so the agent edits a
 * sentence that reads the way the guest will read it.
 *
 * The reason is that "Use" hands the copy over to a human to change. A template
 * she is invited to edit while three of its facts are still spelled
 * `{{ guest_first_name }}` is a sentence she cannot actually proofread, and the
 * first thing anybody does with it is type the guest's name in by hand — which
 * is worse than the tag, because a hand-typed name doesn't update.
 *
 * The PICKER LIST keeps its raw tags (that is the documented choice above: a
 * hotelier reading the list needs to see which facts get filled in), and the
 * BROADCAST composer keeps them too — a broadcast has no single guest to
 * resolve against, and production leaves them literal there.
 *
 * A tag with no fact behind it is left EXACTLY as written. Silence would be a
 * lie about what the template says; the raw tag at least reads as "this will be
 * filled in", which is true.
 */
export function interpolateMergeTags(body: string, context: MergeTagContext): string {
  return body.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (whole, tag: string) => {
    const value = context[tag as keyof MergeTagContext];
    return value ? value : whole;
  });
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
      // ⚠ `{{ hotel_name }}`, not a literal. The frame's copy hardcodes "Canary
      // Test Hotel", which put a DIFFERENT property's name in a message sent
      // from this one — the two other tag-bearing presets already use the tag.
      'Hi {{ guest_first_name }}! We are excited to welcome you to {{ hotel_name }}. ' +
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
 *
 * ⚠ GATED, AND CURRENTLY UNREACHABLE. These only exist on an Apple Messages for
 * Business session, so the picker renders this tab only for a thread whose
 * `channel` is `AMB` — and no thread in this prototype is. That gate is the fix
 * for a real bug: the tab used to show on every SMS conversation, and its
 * "Send" delivered this body verbatim into the feed, raw merge tags included.
 * Leaving the list here (rather than deleting it) is deliberate — it is real
 * production data, and the day an AMB thread exists the tab lights up on it.
 */
export const APPLE_TEMPLATES: MessageTemplate[] = [
  PRESET_TEMPLATES[0],
  PRESET_TEMPLATES[1],
  PRESET_TEMPLATES[2],
].map((t) => ({ ...t, id: `apple-${t.id}` }));
