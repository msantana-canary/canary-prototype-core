import type { WorkflowTemplate, TeamWorkflowTemplate } from './types';

export const WORKFLOW_TEMPLATE_CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Templates' },
  { id: 'team', label: 'Team' },
  { id: 'sales-events', label: 'Sales & Events' },
  { id: 'guest-engagement', label: 'Guest Engagement' },
  { id: 'front-desk', label: 'Front Desk' },
  { id: 'check-in-checkout', label: 'Check-in & Checkout' },
  { id: 'operations', label: 'Operations' },
];

export const workflowTemplates: WorkflowTemplate[] = [
  // ── Sales & Events ──────────────────────────────────────────────────
  {
    id: 'wft-event-inquiry',
    name: 'Event Inquiry Response',
    description: 'Responds to inbound event inquiries — identifies event type, checks space availability, and sends a personalized proposal with pricing.',
    category: 'sales-events',
    tags: ['events', 'sales', 'proposals'],
    popularity: 5,
    trigger: 'Receive Event Inquiry',
    triggerDescription: 'Incoming email, form submission, or call about hosting an event at the property.',
    steps: [
      {
        id: 'ei-s1', type: 'action', label: 'Parse Inquiry Details',
        description: 'Extract event type, preferred dates, estimated headcount, budget range, and any special requirements from the inquiry.',
        conditions: [
          { id: 'ei-c1', condition: 'If corporate event', action: 'Check for existing corporate rate agreement in CRM' },
          { id: 'ei-c2', condition: 'If wedding or social event', action: 'Flag for dedicated event coordinator assignment' },
          { id: 'ei-c3', condition: 'If incomplete details', action: 'Send clarification email requesting missing info (dates, headcount, budget)' },
        ],
      },
      {
        id: 'ei-s2', type: 'action', label: 'Check Availability',
        description: 'Query event space calendar for requested dates. Include room block availability if overnight stays are needed.',
        conditions: [
          { id: 'ei-c4', condition: 'If space available', action: 'Pull pricing for matching event packages' },
          { id: 'ei-c5', condition: 'If preferred dates unavailable', action: 'Suggest 3 nearest alternative date ranges' },
          { id: 'ei-c6', condition: 'If room block needed (20+ rooms)', action: 'Include group rate options with attrition terms' },
        ],
      },
      {
        id: 'ei-s3', type: 'response', label: 'Send Proposal',
        description: 'Compose and send a personalized proposal with space options, pricing tiers, catering menus, and AV packages.',
        conditions: [
          { id: 'ei-c7', condition: 'If event value > $25K', action: 'CC Director of Sales on the proposal' },
          { id: 'ei-c8', condition: 'If returning client', action: 'Reference previous events and offer loyalty pricing' },
        ],
      },
      {
        id: 'ei-s4', type: 'action', label: 'Schedule Follow-up',
        description: 'Set a follow-up reminder and offer to schedule a site visit or virtual walkthrough.',
      },
    ],
    guardrails: [
      'Respond to all inquiries within 2 hours during business hours.',
      'Never commit to pricing without checking current rate sheets.',
      'Always include cancellation terms and deposit requirements in proposals.',
    ],
  },
  {
    id: 'wft-lead-followup',
    name: 'Lead Follow-up Sequence',
    description: 'Re-engages leads that went silent after an initial proposal. Sends progressive follow-ups with increasing urgency based on event timeline.',
    category: 'sales-events',
    tags: ['sales', 'follow-up', 'leads'],
    popularity: 4,
    trigger: 'Detect Silent Lead',
    triggerDescription: 'No response from a lead after 48 hours from initial proposal or last touchpoint.',
    steps: [
      {
        id: 'lf-s1', type: 'action', label: 'Assess Lead Priority',
        description: 'Check event value, timeline proximity, and previous engagement level to determine follow-up urgency.',
        conditions: [
          { id: 'lf-c1', condition: 'If event value > $50K', action: 'High priority — follow up within 24 hours' },
          { id: 'lf-c2', condition: 'If event within 60 days', action: 'Urgent — they may be booking elsewhere' },
          { id: 'lf-c3', condition: 'If event 6+ months out', action: 'Standard priority — monthly touchpoint' },
        ],
      },
      {
        id: 'lf-s2', type: 'response', label: 'Send Follow-up',
        description: 'Compose and send follow-up email with updated availability or additional incentives.',
        conditions: [
          { id: 'lf-c4', condition: 'If 1st follow-up', action: 'Friendly check-in with updated availability and testimonials' },
          { id: 'lf-c5', condition: 'If 2nd follow-up', action: 'Add urgency — mention other groups interested in same dates' },
          { id: 'lf-c6', condition: 'If 3rd follow-up', action: 'Final outreach — offer a quick 10-minute call' },
        ],
      },
      {
        id: 'lf-s3', type: 'handoff', label: 'Escalate or Archive',
        description: 'After 3 follow-ups with no response, escalate high-value leads to the sales team or archive standard leads.',
        conditions: [
          { id: 'lf-c7', condition: 'If high-value lead', action: 'Escalate to Director of Sales with full context' },
          { id: 'lf-c8', condition: 'If no engagement at all', action: 'Archive and add to quarterly re-engagement list' },
        ],
      },
    ],
    guardrails: [
      'Maximum 3 follow-ups per lead before escalation.',
      'Never send follow-ups on weekends or holidays.',
      'Always reference the original proposal details in follow-ups.',
    ],
  },
  {
    id: 'wft-contract-prep',
    name: 'Post-Meeting Contract Prep',
    description: 'After a site visit or meeting, compiles discussed terms, generates a contract with deposit schedule, and sends for e-signature.',
    category: 'sales-events',
    tags: ['contracts', 'events', 'sales'],
    popularity: 3,
    trigger: 'Meeting Completed',
    triggerDescription: 'A scheduled meeting or site visit is marked as completed in the calendar.',
    steps: [
      {
        id: 'cp-s1', type: 'action', label: 'Compile Event Details',
        description: 'Gather all discussed terms: dates, space, headcount, catering, AV, and agreed pricing.',
        conditions: [
          { id: 'cp-c1', condition: 'If meeting notes exist in CRM', action: 'Pull details automatically from CRM record' },
          { id: 'cp-c2', condition: 'If no notes available', action: 'Send summary confirmation email to verify details before contract' },
        ],
      },
      {
        id: 'cp-s2', type: 'action', label: 'Generate Contract',
        description: 'Create digital contract with event details, pricing, deposit schedule, and cancellation terms.',
        conditions: [
          { id: 'cp-c3', condition: 'If event > $100K', action: 'Route to Director of Sales for review before sending' },
          { id: 'cp-c4', condition: 'If client has a master agreement', action: 'Apply existing corporate terms and rate schedule' },
        ],
      },
      {
        id: 'cp-s3', type: 'action', label: 'Set Deposit Schedule',
        description: 'Configure deposit collection timeline based on event date and total value.',
        conditions: [
          { id: 'cp-c5', condition: 'If event within 90 days', action: '50% deposit upfront, balance 30 days before' },
          { id: 'cp-c6', condition: 'If event 3-6 months out', action: '25% now, 25% at 90 days, balance at 30 days' },
          { id: 'cp-c7', condition: 'If event 6+ months out', action: '25% deposit, then quarterly payments' },
        ],
      },
      {
        id: 'cp-s4', type: 'response', label: 'Send for Signature',
        description: 'Email the contract for e-signature with deposit payment link attached.',
      },
    ],
    guardrails: [
      'Always include cancellation policy and deposit schedule in every contract.',
      'Contracts over $100K require Director of Sales approval before sending.',
      'Never modify standard cancellation terms without management approval.',
    ],
  },

  // ── Guest Engagement ────────────────────────────────────────────────
  {
    id: 'wft-pre-arrival',
    name: 'Pre-Arrival Welcome',
    description: 'Sends a personalized welcome message before arrival with check-in instructions, property highlights, and upsell opportunities.',
    category: 'guest-engagement',
    tags: ['pre-arrival', 'engagement', 'messaging'],
    popularity: 5,
    trigger: 'Arrival in 48 Hours',
    triggerDescription: 'Guest check-in date is within 48 hours and no pre-arrival message has been sent.',
    steps: [
      {
        id: 'pa-s1', type: 'action', label: 'Gather Guest Context',
        description: 'Pull reservation details, loyalty tier, stay history, and any special requests from the PMS.',
        conditions: [
          { id: 'pa-c1', condition: 'If returning guest', action: 'Reference previous stays and preferences' },
          { id: 'pa-c2', condition: 'If loyalty member (Gold+)', action: 'Include tier-specific benefits and welcome amenity details' },
          { id: 'pa-c3', condition: 'If first-time guest', action: 'Include property overview and local highlights' },
        ],
      },
      {
        id: 'pa-s2', type: 'response', label: 'Send Welcome Message',
        description: 'Compose personalized welcome with check-in time, directions, parking info, and a digital check-in link.',
        conditions: [
          { id: 'pa-c4', condition: 'If mobile check-in enabled', action: 'Include digital check-in link prominently' },
          { id: 'pa-c5', condition: 'If special occasion noted (birthday, anniversary)', action: 'Add congratulations and mention complimentary amenity' },
        ],
      },
      {
        id: 'pa-s3', type: 'action', label: 'Offer Pre-Arrival Upsells',
        description: 'Present relevant add-ons based on guest profile and availability.',
        conditions: [
          { id: 'pa-c6', condition: 'If room upgrades available', action: 'Offer upgrade with pricing' },
          { id: 'pa-c7', condition: 'If early check-in available', action: 'Offer early check-in option' },
        ],
      },
    ],
    guardrails: [
      'Never send pre-arrival messages between 10 PM and 8 AM hotel local time.',
      'Maximum 1 pre-arrival message per reservation.',
      'Do not send to OTA reservations managed by the OTA.',
    ],
  },
  {
    id: 'wft-upsell-offer',
    name: 'Upsell & Upgrade Offers',
    description: 'Identifies upsell opportunities and presents room upgrades, early check-in, late checkout, and add-on packages to guests.',
    category: 'guest-engagement',
    tags: ['upsells', 'revenue', 'upgrades'],
    popularity: 4,
    trigger: 'Upsell Opportunity Detected',
    triggerDescription: 'Guest mentions interest in upgrades, early arrival, late departure, or additional services.',
    steps: [
      {
        id: 'uo-s1', type: 'action', label: 'Check Available Upsells',
        description: 'Query available upsell options based on reservation, room type, dates, and inventory.',
        conditions: [
          { id: 'uo-c1', condition: 'If room upgrades available', action: 'Calculate upgrade price difference and present options' },
          { id: 'uo-c2', condition: 'If early check-in or late checkout available', action: 'Include time slots and pricing' },
          { id: 'uo-c3', condition: 'If no relevant upsells', action: 'Acknowledge and suggest contacting front desk for special requests' },
        ],
      },
      {
        id: 'uo-s2', type: 'response', label: 'Present Offer',
        description: 'Show upsell options with pricing and benefits in a guest-friendly format.',
      },
      {
        id: 'uo-s3', type: 'action', label: 'Process Acceptance',
        description: 'If guest accepts, update reservation in PMS and capture payment.',
        conditions: [
          { id: 'uo-c4', condition: 'If accepted', action: 'Update PMS reservation and send confirmation' },
          { id: 'uo-c5', condition: 'If declined', action: 'Acknowledge gracefully — no repeat offers for declined upsells' },
        ],
      },
    ],
    guardrails: [
      'Never push upsells to guests who have active complaints.',
      'Respect guest preferences — no repeat offers for declined items.',
      'Loyalty tier complimentary benefits should never be charged.',
    ],
  },
  {
    id: 'wft-satisfaction-survey',
    name: 'Guest Satisfaction Survey',
    description: 'Sends a satisfaction survey during or after a stay, processes responses, and escalates negative feedback to management.',
    category: 'guest-engagement',
    tags: ['feedback', 'surveys', 'reputation'],
    popularity: 3,
    trigger: 'Survey Trigger Point Reached',
    triggerDescription: 'Guest reaches mid-stay or post-checkout milestone, triggering a satisfaction check.',
    steps: [
      {
        id: 'ss-s1', type: 'response', label: 'Send Survey',
        description: 'Send a brief satisfaction survey via the guest\'s preferred messaging channel.',
      },
      {
        id: 'ss-s2', type: 'action', label: 'Process Response',
        description: 'Log the survey response with score, comments, and guest details.',
        conditions: [
          { id: 'ss-c1', condition: 'If positive (4-5 stars)', action: 'Thank warmly and invite to leave a public review' },
          { id: 'ss-c2', condition: 'If negative (1-2 stars)', action: 'Apologize and escalate to duty manager immediately' },
          { id: 'ss-c3', condition: 'If neutral (3 stars)', action: 'Thank and ask what could be improved' },
        ],
      },
      {
        id: 'ss-s3', type: 'handoff', label: 'Escalate Negative Feedback',
        description: 'Route negative reviews to management with full context for immediate recovery.',
      },
    ],
    guardrails: [
      'Never argue with or dismiss negative feedback.',
      'Escalate all negative reviews to management within 1 hour.',
      'Maximum 1 survey per stay — do not spam guests.',
    ],
  },

  // ── Front Desk ──────────────────────────────────────────────────────
  {
    id: 'wft-booking-request',
    name: 'Booking Request Handler',
    description: 'Handles new reservation requests — checks availability, presents room options with rates, processes the booking, and sends confirmation.',
    category: 'front-desk',
    tags: ['reservations', 'booking', 'front-desk'],
    popularity: 5,
    trigger: 'Booking Intent Detected',
    triggerDescription: 'Guest asks about availability, rates, or wants to make a reservation.',
    steps: [
      {
        id: 'br-s1', type: 'action', label: 'Check Availability',
        description: 'Query PMS for room availability matching guest dates, room type, and guest count.',
        conditions: [
          { id: 'br-c1', condition: 'If rooms available', action: 'Present matching options with rates and descriptions' },
          { id: 'br-c2', condition: 'If no availability', action: 'Suggest alternative dates — never recommend competing properties' },
          { id: 'br-c3', condition: 'If corporate or group rate mentioned', action: 'Verify rate code and apply negotiated pricing' },
        ],
      },
      {
        id: 'br-s2', type: 'response', label: 'Present Options',
        description: 'Show available room types with rates, amenities, photos (on webchat), and booking links.',
      },
      {
        id: 'br-s3', type: 'action', label: 'Process Booking',
        description: 'Create the reservation in PMS via booking gateway and capture payment if required.',
        conditions: [
          { id: 'br-c4', condition: 'If booking succeeds', action: 'Generate confirmation number and send details' },
          { id: 'br-c5', condition: 'If prepayment required', action: 'Capture payment before confirming' },
          { id: 'br-c6', condition: 'If booking fails', action: 'Apologize and offer to transfer to front desk' },
        ],
      },
      {
        id: 'br-s4', type: 'response', label: 'Send Confirmation',
        description: 'Send booking confirmation with confirmation number, dates, room type, cancellation policy, and check-in instructions.',
      },
    ],
    guardrails: [
      'Never override published rates without manager approval.',
      'Always include cancellation policy in booking confirmation.',
      'Only offer room types currently in property inventory.',
    ],
  },
  {
    id: 'wft-faq-handler',
    name: 'FAQ & Information',
    description: 'Answers guest questions about hotel facilities, policies, local area, and services using the knowledge base.',
    category: 'front-desk',
    tags: ['faq', 'knowledge-base', 'information'],
    popularity: 4,
    trigger: 'Information Request Detected',
    triggerDescription: 'Guest asks a question about the hotel, amenities, policies, or local area.',
    steps: [
      {
        id: 'fq-s1', type: 'action', label: 'Search Knowledge Base',
        description: 'Query the property knowledge base using semantic search to find the best matching answer.',
        conditions: [
          { id: 'fq-c1', condition: 'If high-confidence match found', action: 'Use KB answer as response basis' },
          { id: 'fq-c2', condition: 'If question about local area', action: 'Search local recommendations database' },
          { id: 'fq-c3', condition: 'If no match found', action: 'Generate best-effort response and flag for KB gap review' },
        ],
      },
      {
        id: 'fq-s2', type: 'response', label: 'Compose Answer',
        description: 'Generate a helpful, conversational response tailored to the guest and messaging channel.',
      },
    ],
    guardrails: [
      'Never fabricate information not in the knowledge base.',
      'If unsure, say "let me check with the team" and escalate.',
      'Always use property-verified hours and policies.',
    ],
  },
  {
    id: 'wft-service-request',
    name: 'Service Request Routing',
    description: 'Handles guest service requests — identifies the issue type, creates a ticket in the task management system, and confirms with the guest.',
    category: 'front-desk',
    tags: ['service', 'tickets', 'housekeeping', 'maintenance'],
    popularity: 4,
    trigger: 'Service Request Detected',
    triggerDescription: 'Guest reports an issue or requests a service (housekeeping, maintenance, amenities).',
    steps: [
      {
        id: 'sr-s1', type: 'action', label: 'Identify Issue Type',
        description: 'Parse the service request and match against ticket categories.',
        conditions: [
          { id: 'sr-c1', condition: 'If clear category match', action: 'Use matched ticket type and route to correct department' },
          { id: 'sr-c2', condition: 'If ambiguous request', action: 'Ask one clarifying question before proceeding' },
          { id: 'sr-c3', condition: 'If safety issue (leak, fire, lockout)', action: 'Skip ticket — escalate to staff immediately' },
        ],
      },
      {
        id: 'sr-s2', type: 'response', label: 'Acknowledge Guest',
        description: 'Confirm receipt of the request and provide estimated response time based on SLAs.',
      },
      {
        id: 'sr-s3', type: 'action', label: 'Create Service Ticket',
        description: 'Generate ticket with room number, department, issue type, priority, and guest context for staff dispatch.',
      },
    ],
    guardrails: [
      'Route safety issues directly to staff — never just create a ticket.',
      'Never create duplicate tickets for the same room and issue.',
      'Provide realistic time estimates based on department SLAs.',
    ],
  },
  {
    id: 'wft-escalation',
    name: 'Staff Escalation',
    description: 'Routes conversations the agent cannot resolve to the right staff member with full context and escalation reason.',
    category: 'front-desk',
    tags: ['escalation', 'handoff', 'staff'],
    popularity: 3,
    trigger: 'Escalation Required',
    triggerDescription: 'Agent cannot resolve the issue, guest is upset, or topic is marked as staff-only.',
    steps: [
      {
        id: 'es-s1', type: 'action', label: 'Classify Escalation',
        description: 'Determine escalation reason — unresolvable, guest frustration, staff-only topic, or policy exception.',
        conditions: [
          { id: 'es-c1', condition: 'If guest frustration detected', action: 'Priority escalation — notify manager immediately' },
          { id: 'es-c2', condition: 'If billing or rate dispute', action: 'Route to front desk manager with folio details' },
          { id: 'es-c3', condition: 'If AI cannot respond', action: 'Standard escalation to front desk' },
        ],
      },
      {
        id: 'es-s2', type: 'handoff', label: 'Notify Staff',
        description: 'Send escalation notification with full conversation context, guest details, and recommended action.',
      },
      {
        id: 'es-s3', type: 'response', label: 'Inform Guest',
        description: 'Let the guest know a staff member has been notified and will follow up shortly.',
      },
    ],
    guardrails: [
      'Never attempt to resolve billing disputes without staff involvement.',
      'Always include full conversation context in escalation notifications.',
      'Guest should never wait more than 5 minutes without acknowledgment.',
    ],
  },

  // ── Check-in & Checkout ─────────────────────────────────────────────
  {
    id: 'wft-checkin-processing',
    name: 'Digital Check-in Processing',
    description: 'Processes digital check-in submissions — verifies ID, captures payment, assigns room, and issues mobile key.',
    category: 'check-in-checkout',
    tags: ['check-in', 'identity', 'payment', 'mobile-key'],
    popularity: 5,
    trigger: 'Check-in Submitted',
    triggerDescription: 'Guest completes the digital check-in form via mobile or web.',
    steps: [
      {
        id: 'ci-s1', type: 'action', label: 'Verify Identity',
        description: 'Run ID document through verification — match name to reservation, check expiry, flag issues.',
        conditions: [
          { id: 'ci-c1', condition: 'If ID matches reservation', action: 'Mark identity as verified' },
          { id: 'ci-c2', condition: 'If name mismatch', action: 'Flag for front desk manual review' },
          { id: 'ci-c3', condition: 'If ID expired', action: 'Notify guest to present valid ID at front desk' },
        ],
      },
      {
        id: 'ci-s2', type: 'action', label: 'Process Payment',
        description: 'Capture or authorize payment method on file for incidentals and remaining balance.',
        conditions: [
          { id: 'ci-c4', condition: 'If payment succeeds', action: 'Mark payment as captured and continue' },
          { id: 'ci-c5', condition: 'If payment fails', action: 'Request alternative payment method from guest' },
        ],
      },
      {
        id: 'ci-s3', type: 'action', label: 'Assign Room',
        description: 'Auto-assign best available room matching reservation type and guest preferences.',
        conditions: [
          { id: 'ci-c6', condition: 'If preferred room available', action: 'Assign preferred room (high floor, quiet, etc.)' },
          { id: 'ci-c7', condition: 'If loyalty member', action: 'Prioritize upgrade-eligible rooms' },
        ],
      },
      {
        id: 'ci-s4', type: 'response', label: 'Send Confirmation & Key',
        description: 'Send room assignment confirmation with mobile key (if enabled) and property welcome info.',
      },
    ],
    guardrails: [
      'Never auto-approve check-ins with ID verification failures.',
      'Payment authorization must succeed before room assignment.',
      'Always send confirmation with room number and check-in time.',
    ],
  },
  {
    id: 'wft-checkout-folio',
    name: 'Express Checkout & Folio',
    description: 'Processes guest checkout — generates the folio, handles disputes, processes final payment, and sends a departure confirmation.',
    category: 'check-in-checkout',
    tags: ['checkout', 'folio', 'billing', 'departure'],
    popularity: 4,
    trigger: 'Checkout Request',
    triggerDescription: 'Guest indicates they want to check out or asks about their bill.',
    steps: [
      {
        id: 'co-s1', type: 'action', label: 'Generate Folio',
        description: 'Pull guest folio from PMS with all charges, taxes, credits, and adjustments.',
      },
      {
        id: 'co-s2', type: 'response', label: 'Send Folio for Review',
        description: 'Send itemized folio to guest for review via their messaging channel.',
        conditions: [
          { id: 'co-c1', condition: 'If outstanding balance', action: 'Include payment link with folio' },
          { id: 'co-c2', condition: 'If balance is zero', action: 'Confirm no further charges needed' },
        ],
      },
      {
        id: 'co-s3', type: 'action', label: 'Process Checkout',
        description: 'Mark reservation as checked out in PMS. Release room for housekeeping.',
        conditions: [
          { id: 'co-c3', condition: 'If guest disputes a charge', action: 'Escalate to front desk — never auto-resolve billing disputes' },
          { id: 'co-c4', condition: 'If late checkout', action: 'Apply late checkout fee unless waived by loyalty tier or upsell' },
        ],
      },
      {
        id: 'co-s4', type: 'response', label: 'Send Departure Confirmation',
        description: 'Send thank-you message with feedback survey link and rebooking incentive.',
      },
    ],
    guardrails: [
      'Never adjust charges without staff approval.',
      'Always include feedback survey in departure message.',
      'Late checkout fees must respect loyalty tier benefits.',
    ],
  },
  {
    id: 'wft-noshow-outreach',
    name: 'No-Show Prevention Outreach',
    description: 'Sends progressive pre-arrival messages to reduce no-shows — confirms arrival plans, encourages mobile check-in, and flags unresponsive guests.',
    category: 'check-in-checkout',
    tags: ['no-show', 'pre-arrival', 'outreach'],
    popularity: 3,
    trigger: 'Arrival in 72 Hours',
    triggerDescription: 'Guest check-in is within 72 hours and no engagement has been recorded.',
    steps: [
      {
        id: 'ns-s1', type: 'response', label: 'Send Arrival Confirmation',
        description: 'Send a friendly message confirming reservation details and asking guest to confirm arrival plans.',
      },
      {
        id: 'ns-s2', type: 'action', label: 'Monitor Response',
        description: 'Track whether the guest responded or engaged with the message.',
        conditions: [
          { id: 'ns-c1', condition: 'If guest confirms', action: 'Mark as confirmed — send check-in link 24 hours before arrival' },
          { id: 'ns-c2', condition: 'If no response after 24 hours', action: 'Try alternate channel (SMS if email was first, or vice versa)' },
          { id: 'ns-c3', condition: 'If guest requests cancellation', action: 'Process cancellation per policy and confirm' },
        ],
      },
      {
        id: 'ns-s3', type: 'handoff', label: 'Flag Unresponsive Guests',
        description: 'After 2 outreach attempts with no response, flag the reservation for front desk attention.',
      },
    ],
    guardrails: [
      'Maximum 2 outreach messages per reservation before flagging.',
      'Never send messages between 10 PM and 8 AM hotel local time.',
      'Do not contact OTA reservations managed by the OTA.',
    ],
  },

  // ── Operations ──────────────────────────────────────────────────────
  {
    id: 'wft-reservation-change',
    name: 'Reservation Change Handler',
    description: 'Processes reservation modifications and cancellations — validates against policy, updates the PMS, and confirms changes with the guest.',
    category: 'operations',
    tags: ['reservations', 'modifications', 'cancellations'],
    popularity: 4,
    trigger: 'Change Request Received',
    triggerDescription: 'Guest or system submits a reservation modification, cancellation, or date change request.',
    steps: [
      {
        id: 'rc-s1', type: 'action', label: 'Validate Request',
        description: 'Verify the reservation exists and check the request against cancellation/modification policy.',
        conditions: [
          { id: 'rc-c1', condition: 'If within free cancellation window', action: 'Process cancellation with full refund' },
          { id: 'rc-c2', condition: 'If outside cancellation window', action: 'Apply cancellation fee per policy and notify guest' },
          { id: 'rc-c3', condition: 'If date change requested', action: 'Check availability for new dates before confirming' },
        ],
      },
      {
        id: 'rc-s2', type: 'action', label: 'Update Reservation',
        description: 'Apply the change in PMS — update dates, room type, or mark as cancelled.',
        conditions: [
          { id: 'rc-c4', condition: 'If PMS update succeeds', action: 'Generate updated confirmation' },
          { id: 'rc-c5', condition: 'If PMS update fails', action: 'Retry once, then escalate to staff' },
        ],
      },
      {
        id: 'rc-s3', type: 'response', label: 'Confirm Changes',
        description: 'Send confirmation email with updated reservation details or cancellation confirmation and refund timeline.',
      },
    ],
    guardrails: [
      'Apply cancellation policy exactly as configured — no manual overrides.',
      'Always verify confirmation number before processing any changes.',
      'OTA reservations must be modified through the OTA, not directly.',
    ],
  },
  {
    id: 'wft-lost-found',
    name: 'Lost & Found Inquiry',
    description: 'Handles guest inquiries about items left behind — searches the lost & found log, coordinates with housekeeping, and arranges shipping if found.',
    category: 'operations',
    tags: ['lost-found', 'housekeeping', 'guest-service'],
    popularity: 2,
    trigger: 'Lost Item Report',
    triggerDescription: 'Guest contacts the property about an item left behind during their stay.',
    steps: [
      {
        id: 'lf2-s1', type: 'action', label: 'Search Lost & Found Log',
        description: 'Look up the guest\'s room and checkout date in the lost & found inventory.',
        conditions: [
          { id: 'lf2-c1', condition: 'If item found in log', action: 'Confirm item details with the guest' },
          { id: 'lf2-c2', condition: 'If not in log yet', action: 'Create a search request for housekeeping to check the room' },
        ],
      },
      {
        id: 'lf2-s2', type: 'response', label: 'Update Guest',
        description: 'Inform the guest whether the item was found and next steps.',
        conditions: [
          { id: 'lf2-c3', condition: 'If item found', action: 'Offer shipping options with cost estimate or in-person pickup' },
          { id: 'lf2-c4', condition: 'If item not found after search', action: 'Apologize and provide contact info for further follow-up' },
        ],
      },
      {
        id: 'lf2-s3', type: 'action', label: 'Arrange Return',
        description: 'If shipping requested, create shipping label and coordinate pickup with the front desk.',
      },
    ],
    guardrails: [
      'Always verify guest identity before confirming item details.',
      'Keep lost & found items for 90 days per property policy.',
      'High-value items (electronics, jewelry) require in-person ID verification for pickup.',
    ],
  },
];

// ── Pre-seeded Team Templates ───────────────────────────────────────────

export const defaultTeamTemplates: TeamWorkflowTemplate[] = [
  {
    id: 'team-vip-arrival',
    name: 'VIP Arrival Protocol',
    description: 'Custom arrival workflow for high-value repeat guests — personalized greeting, pre-stocked amenities, and manager notification.',
    category: 'guest-engagement',
    tags: ['vip', 'arrival', 'loyalty'],
    popularity: 5,
    source: 'team',
    sharedBy: 'Sarah Kim',
    sharedAt: '2026-04-28T14:30:00Z',
    trigger: 'VIP Guest Arriving Today',
    triggerDescription: 'Guest with Diamond/Platinum tier or VIP flag has check-in date today.',
    steps: [
      {
        id: 'vip-s1', type: 'action', label: 'Pull Guest Profile',
        description: 'Retrieve full guest history — past stays, preferences, complaints, special requests, and loyalty tier.',
        conditions: [
          { id: 'vip-c1', condition: 'If 5+ previous stays', action: 'Include favorite room type and any standing requests' },
          { id: 'vip-c2', condition: 'If previous complaint on file', action: 'Flag for manager — ensure issue has been addressed' },
        ],
      },
      {
        id: 'vip-s2', type: 'action', label: 'Prepare Welcome Amenities',
        description: 'Notify housekeeping to pre-stock room with welcome amenities based on guest preferences.',
        conditions: [
          { id: 'vip-c3', condition: 'If Diamond Elite', action: 'Full welcome package — champagne, fruit basket, handwritten note from GM' },
          { id: 'vip-c4', condition: 'If Platinum Elite', action: 'Standard welcome — bottled water, snack plate, welcome card' },
          { id: 'vip-c5', condition: 'If known dietary restrictions', action: 'Adjust amenities accordingly (no alcohol, nut-free, etc.)' },
        ],
      },
      {
        id: 'vip-s3', type: 'response', label: 'Send Personalized Welcome',
        description: 'Send a warm pre-arrival message referencing their loyalty and any special arrangements.',
      },
      {
        id: 'vip-s4', type: 'action', label: 'Alert Front Desk Team',
        description: 'Notify front desk manager and assigned staff that VIP is arriving — include guest photo, preferences, and any notes.',
      },
    ],
    guardrails: [
      'Never reference specific past complaint details in guest-facing messages.',
      'Diamond Elite gets priority room assignment — high floor, city view.',
      'Alert must reach front desk at least 2 hours before expected arrival.',
    ],
  },
  {
    id: 'team-group-billing',
    name: 'Group Billing Reconciliation',
    description: 'End-of-event billing workflow for group blocks — reconcile room charges, F&B, AV, and incidentals against the master folio.',
    category: 'operations',
    tags: ['billing', 'groups', 'events', 'finance'],
    popularity: 3,
    source: 'team',
    sharedBy: 'Michael Torres',
    sharedAt: '2026-05-02T09:15:00Z',
    trigger: 'Group Checkout Date Reached',
    triggerDescription: 'Group block end date has passed and final billing reconciliation is needed.',
    steps: [
      {
        id: 'gb-s1', type: 'action', label: 'Compile Master Folio',
        description: 'Pull all charges across the group block — room nights, F&B, AV rentals, incidentals, and parking.',
        conditions: [
          { id: 'gb-c1', condition: 'If individual billing (guests pay own rooms)', action: 'Only include shared charges (F&B, AV, meeting rooms) on master folio' },
          { id: 'gb-c2', condition: 'If master billing (company pays all)', action: 'Include all room charges, F&B, and incidentals on master folio' },
        ],
      },
      {
        id: 'gb-s2', type: 'action', label: 'Check Against Contract',
        description: 'Validate charges against the signed contract — verify agreed rates, attrition, and any comped items.',
        conditions: [
          { id: 'gb-c3', condition: 'If attrition clause triggered', action: 'Calculate attrition fee per contract terms and add to folio' },
          { id: 'gb-c4', condition: 'If charges exceed estimate by 20%+', action: 'Flag for revenue manager review before sending' },
        ],
      },
      {
        id: 'gb-s3', type: 'response', label: 'Send Final Invoice',
        description: 'Email itemized invoice to the group organizer with payment link and Net 30 terms.',
      },
    ],
    guardrails: [
      'Always reconcile against the signed contract before sending.',
      'Attrition fees must match contract terms exactly — no manual adjustments without approval.',
      'Send invoice within 48 hours of group checkout.',
    ],
  },
  {
    id: 'team-loyalty-recovery',
    name: 'Loyalty Recovery Outreach',
    description: 'Re-engages loyalty members who had a negative experience — apology message, recovery offer, and follow-up to rebuild the relationship.',
    category: 'guest-engagement',
    tags: ['loyalty', 'recovery', 'feedback', 'retention'],
    popularity: 4,
    source: 'team',
    sharedBy: 'Theresa Webb',
    sharedAt: '2026-05-05T16:00:00Z',
    trigger: 'Negative Feedback from Loyalty Member',
    triggerDescription: 'Loyalty member (Gold+) submits a survey rating of 1-2 stars or files a formal complaint.',
    steps: [
      {
        id: 'lr-s1', type: 'action', label: 'Assess Severity',
        description: 'Review the complaint details, guest history, and loyalty tier to determine appropriate recovery level.',
        conditions: [
          { id: 'lr-c1', condition: 'If Diamond Elite with 10+ stays', action: 'Maximum recovery — personal call from GM + comp future night' },
          { id: 'lr-c2', condition: 'If Gold/Platinum with service failure', action: 'Standard recovery — apology email + dining credit or room upgrade on next stay' },
          { id: 'lr-c3', condition: 'If issue was safety-related', action: 'Escalate to operations manager immediately — do not auto-respond' },
        ],
      },
      {
        id: 'lr-s2', type: 'response', label: 'Send Recovery Message',
        description: 'Compose personalized apology acknowledging the specific issue, what was done to fix it, and the recovery offer.',
      },
      {
        id: 'lr-s3', type: 'action', label: 'Schedule Follow-up',
        description: 'Set a 7-day follow-up to check if the guest has responded or booked again.',
        conditions: [
          { id: 'lr-c4', condition: 'If guest responds positively', action: 'Log as recovered — update guest profile with resolution notes' },
          { id: 'lr-c5', condition: 'If no response after 7 days', action: 'Send one more gentle follow-up, then close the case' },
        ],
      },
    ],
    guardrails: [
      'Never blame the guest or be defensive in recovery messages.',
      'Recovery offers must be pre-approved by front desk manager.',
      'Safety-related complaints bypass this workflow entirely — escalate to operations.',
    ],
  },
];
