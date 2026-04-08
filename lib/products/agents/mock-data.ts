/**
 * Agent Builder Mock Data
 *
 * Pre-built agents, templates, and connection catalogue for the
 * Agent Builder prototype. Updated for the hybrid wizard + chat model
 * with triggers (intents + channels), connections (external systems),
 * and capabilities (Canary products).
 *
 * v2: Added gambit rules, step conditions, and sales inquiries.
 */

import type {
  ActivityFeedItem,
  Agent,
  AgentTemplate,
  AgentTrigger,
  AgentWorkflow,
  CanaryProduct,
  Connection,
  ConnectorConfig,
  GambitRule,
  SalesInquiry,
} from '@/lib/products/agents/types';
import { CANARY_PRODUCTS } from '@/lib/products/agents/types';

// ---------------------------------------------------------------------------
// Reusable Connections (external systems only — NOT channels)
// ---------------------------------------------------------------------------

const conn = {
  pms: {
    id: 'conn-pms',
    name: 'Property Management System',
    type: 'pms' as const,
    status: 'connected' as const,
    description: 'Opera, Mews, or other PMS for reservations and guest data.',
  },
  crm: {
    id: 'conn-crm',
    name: 'Salesforce CRM',
    type: 'crm' as const,
    status: 'needed' as const,
    description: 'Lead management and sales pipeline tracking.',
  },
  calendar: {
    id: 'conn-calendar',
    name: 'Google Calendar',
    type: 'calendar' as const,
    status: 'optional' as const,
    description: 'Meeting scheduling and availability checking.',
  },
  payment: {
    id: 'conn-payment',
    name: 'Payment Gateway',
    type: 'payment' as const,
    status: 'connected' as const,
    description: 'Stripe or Canary Payments for processing transactions.',
  },
  kb: {
    id: 'conn-kb',
    name: 'Knowledge Base',
    type: 'knowledge-base' as const,
    status: 'connected' as const,
    description: 'Hotel FAQs, policies, and local information.',
  },
  pos: {
    id: 'conn-pos',
    name: 'Point of Sale',
    type: 'pos' as const,
    status: 'optional' as const,
    description: 'Restaurant and retail transaction data.',
  },
  twilio: {
    id: 'conn-twilio',
    name: 'Twilio Voice',
    type: 'voice' as const,
    status: 'connected' as const,
    description: 'Inbound and outbound voice call routing.',
  },
  sendgrid: {
    id: 'conn-sendgrid',
    name: 'SendGrid Email',
    type: 'email' as const,
    status: 'connected' as const,
    description: 'Transactional email delivery for confirmations and proposals.',
  },
  hotsos: {
    id: 'conn-hotsos',
    name: 'HotSOS',
    type: 'task-management' as const,
    status: 'connected' as const,
    description: 'Housekeeping and maintenance task management.',
  },
  flexkeeping: {
    id: 'conn-flexkeeping',
    name: 'Flexkeeping',
    type: 'task-management' as const,
    status: 'not-available' as const,
    description: 'Alternative task management platform for hotel operations.',
  },
  vostio: {
    id: 'conn-vostio',
    name: 'Vostio Mobile Key',
    type: 'mobile-key' as const,
    status: 'connected' as const,
    description: 'Mobile key generation and delivery for guest room access.',
  },
  dormakaba: {
    id: 'conn-dormakaba',
    name: 'Dormakaba Locks',
    type: 'mobile-key' as const,
    status: 'not-available' as const,
    description: 'Alternative mobile key and lock integration.',
  },
};

export const availableConnections: Connection[] = [
  conn.pms,
  conn.crm,
  conn.calendar,
  conn.payment,
  conn.kb,
  conn.pos,
];

// ---------------------------------------------------------------------------
// Helper — build a CanaryProduct from the catalogue with enabled flag
// ---------------------------------------------------------------------------

function enableProduct(id: string, enabled = true, instructions?: string): CanaryProduct {
  const base = CANARY_PRODUCTS.find((p) => p.id === id);
  if (!base) throw new Error(`Unknown product ID: ${id}`);
  return { ...base, enabled, instructions };
}

function allProductsWithEnabled(enabledIds: string[]): CanaryProduct[] {
  return CANARY_PRODUCTS.map((p) => ({
    ...p,
    enabled: enabledIds.includes(p.id),
  }));
}

// ---------------------------------------------------------------------------
// Helper — clone a connection with overrides
// ---------------------------------------------------------------------------

function cn(base: Connection, overrides?: Partial<Connection>): Connection {
  return { ...base, ...overrides };
}

// ---------------------------------------------------------------------------
// Default Gambit Rules for Sales & Events (v2)
// ---------------------------------------------------------------------------

export const defaultSalesRules: GambitRule[] = [
  { id: 'rule-1', condition: 'IF event budget > $50,000', action: 'CC General Manager on response, use VIP response template', enabled: true },
  { id: 'rule-2', condition: 'IF inquiry mentions wedding', action: 'Use wedding-specific language and highlight venue photos', enabled: true },
  { id: 'rule-3', condition: 'IF returning corporate client', action: 'Reference past booking history and offer loyalty rate', enabled: true },
  { id: 'rule-4', condition: 'IF guest asks about specific pricing', action: 'Don\'t quote final numbers, suggest scheduling a call instead', enabled: true },
  { id: 'rule-5', condition: 'IF inquiry from third-party planner or OTA', action: 'Use third-party response template with commission terms', enabled: false },
  { id: 'rule-6', condition: 'DEFAULT', action: 'Hand off to sales team with full inquiry context', enabled: true },
];

// ---------------------------------------------------------------------------
// Mock Sales Inquiries for Agent in Action (v2)
// ---------------------------------------------------------------------------

export const mockSalesInquiries: SalesInquiry[] = [
  {
    id: 'inq-1',
    from: 'Sarah Chen, Chen & Associates',
    email: 'sarah@chenassociates.com',
    subject: 'Corporate Retreat for 45 — April 2026',
    eventType: 'Corporate Retreat',
    dates: 'April 15-17, 2026',
    headcount: 45,
    budget: '$35,000',
    receivedAt: new Date('2026-03-29T09:15:00'),
    status: 'responded',
    responseTime: '2.1 minutes',
    agentResponse: 'Thank you for your interest in hosting your corporate retreat at The Statler, Sarah. We\'d love to welcome your team of 45 for April 15-17.\n\nI\'ve checked our availability and we have the Grand Ballroom and two breakout rooms available for those dates. For a group of 45 with your budget range, I\'d recommend our Executive Retreat Package which includes:\n\n- Full-day meeting space with AV setup\n- Coffee breaks and working lunch\n- Discounted sleeping room block at $289/night\n- Complimentary welcome reception\n\nWould you like to schedule a site visit to see the spaces? I have availability this Thursday or Friday afternoon.\n\nBest regards,\nSales & Events Agent\nThe Statler New York',
  },
  {
    id: 'inq-2',
    from: 'James Rodriguez, Meridian Events',
    email: 'james@meridianevents.com',
    subject: 'Wedding Reception — June 2026, ~120 guests',
    eventType: 'Wedding Reception',
    dates: 'June 14, 2026',
    headcount: 120,
    budget: '$85,000',
    receivedAt: new Date('2026-03-29T10:30:00'),
    status: 'meeting-scheduled',
    responseTime: '1.8 minutes',
    agentResponse: 'Congratulations on your upcoming wedding! The Statler would be honored to host your celebration.\n\nFor a reception of 120 guests on June 14, our Starlight Terrace offers a stunning setting with panoramic city views. Given your budget, I\'d suggest our Premium Wedding Package which includes:\n\n- Exclusive venue access from 4pm-midnight\n- Custom floral arrangements and decor consultation\n- Full catering with premium bar package\n- Bridal suite for day-of preparation\n- Room block of 40 rooms at preferred rate\n\nI\'ve CC\'d our General Manager as this is a VIP-level event. Would you and the couple be available for a tasting and site tour next week?\n\nWarmly,\nSales & Events Agent\nThe Statler New York',
  },
  {
    id: 'inq-3',
    from: 'Lisa Park, TechForward Inc',
    email: 'lpark@techforward.io',
    subject: 'Team offsite — 25 people, 2 nights',
    eventType: 'Team Offsite',
    dates: 'May 8-10, 2026',
    headcount: 25,
    receivedAt: new Date('2026-03-29T11:45:00'),
    status: 'processing',
    responseTime: undefined,
  },
  {
    id: 'inq-4',
    from: 'David Kim, Kim Family',
    email: 'david.kim@email.com',
    subject: 'Anniversary dinner for 30',
    eventType: 'Private Dinner',
    dates: 'April 5, 2026',
    headcount: 30,
    receivedAt: new Date('2026-03-28T16:20:00'),
    status: 'responded',
    responseTime: '3.4 minutes',
    agentResponse: 'Happy anniversary! We\'d love to host your celebration at The Statler.\n\nFor an intimate dinner of 30 guests, I\'d recommend our Library Room — it offers a warm, elegant atmosphere perfect for milestone celebrations. Our private dining package includes:\n\n- Exclusive use of the Library Room (seats up to 36)\n- Customizable 3-course menu with wine pairing options\n- Dedicated event coordinator\n- Complimentary champagne toast\n\nWould you like to discuss menu options? I\'m happy to set up a call with our Executive Chef.\n\nBest,\nSales & Events Agent\nThe Statler New York',
  },
  {
    id: 'inq-5',
    from: 'Amanda Torres, Northeast Pharma',
    email: 'atorres@nepharm.com',
    subject: 'Annual conference — 200+ attendees, 3 days',
    eventType: 'Conference',
    dates: 'September 12-14, 2026',
    headcount: 200,
    budget: '$150,000',
    receivedAt: new Date('2026-03-29T08:00:00'),
    status: 'follow-up',
    responseTime: '1.5 minutes',
    agentResponse: 'Thank you for considering The Statler for your annual conference, Amanda. A 200+ attendee event over three days is exactly the kind of program we excel at.\n\nI\'ve reviewed our September availability and the Grand Ballroom complex is open for September 12-14. Our Conference Package for your scale includes:\n\n- Grand Ballroom (capacity 300) plus 4 breakout rooms\n- Full AV package with on-site technician\n- All-day beverage service and catered meals\n- Room block of 150+ rooms at corporate rate\n- Dedicated conference coordinator\n\nI\'ve CC\'d our General Manager given the scope of this event. Could we schedule a planning call this week to discuss your specific requirements?\n\nBest regards,\nSales & Events Agent\nThe Statler New York',
  },
];

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

const alexWorkflow: AgentWorkflow = {
  id: 'wf-voice-main',
  name: 'Inbound Call Handler',
  description: 'Handles inbound calls — greets, identifies guest, routes to abilities, transfers or resolves.',
  trigger: 'Inbound Call Received',
  triggerDescription: 'Guest calls the hotel phone number routed through Canary Voice.',
  steps: [
    { id: 'va-s1', type: 'response', label: 'Greet Caller', description: 'Welcome guest with personalized greeting if identified, generic if not.',
      conditions: [
        { id: 'va-c1', condition: 'If guest identified by phone number', action: 'Use personalized welcome with name and reservation reference — "Welcome back to The Statler New York, [name]"' },
        { id: 'va-c2', condition: 'If unknown caller', action: 'Use standard greeting — "Thank you for calling The Statler New York, located on West 54th Street. How may I assist you?"' },
      ],
    },
    { id: 'va-s2', type: 'action', label: 'Identify Intent', description: 'Determine what the caller needs — information, reservation, transfer, or service.',
      conditions: [
        { id: 'va-c3', condition: 'If reservation question', action: 'Look up reservation in PMS by phone number, name, or CTL confirmation number' },
        { id: 'va-c4', condition: 'If FAQ or hotel info', action: 'Search knowledge base for matching answer' },
        { id: 'va-c5', condition: 'If requesting specific department', action: 'Prepare transfer to requested department' },
        { id: 'va-c6', condition: 'If reporting issue', action: 'Gather details and create service ticket' },
        { id: 'va-c17', condition: 'If caller asks about parking', action: 'Provide W 54th St garage details — $45/night self-park, $65/night valet, in/out privileges included' },
        { id: 'va-c18', condition: 'If caller asks about dining or restaurant', action: 'Offer to transfer to The Statler Restaurant at ext. 250, or share hours (breakfast 7-10:30 AM, dinner 5:30-10 PM)' },
        { id: 'va-c19', condition: 'If caller asks about nearby attractions', action: 'Reference Carnegie Hall (2 blocks), Central Park (5 min walk), Times Square (10 min walk)' },
      ],
    },
    { id: 'va-s3', type: 'action', label: 'Execute Ability', description: 'Run the matched voice ability — KB answer, reservation lookup, booking link, or call transfer.',
      conditions: [
        { id: 'va-c7', condition: 'If answer found in KB', action: 'Respond verbally with the answer' },
        { id: 'va-c8', condition: 'If reservation found', action: 'Read back reservation details — dates, room type, CTL-XXXXX confirmation number' },
        { id: 'va-c9', condition: 'If needs booking', action: 'Offer to text a booking link to the caller\'s phone' },
        { id: 'va-c10', condition: 'If complex request beyond abilities', action: 'Prepare transfer with context summary for staff' },
        { id: 'va-c20', condition: 'If caller asks about pool or fitness center', action: 'Pool hours 6 AM – 10 PM (towels provided), fitness center open 24 hours with key card access' },
      ],
    },
    { id: 'va-s4', type: 'handoff', label: 'Transfer or Resolve', description: 'Either resolve the call or transfer to the appropriate department with a summary.',
      conditions: [
        { id: 'va-c11', condition: 'If resolved', action: 'Thank guest and end call' },
        { id: 'va-c12', condition: 'If transfer needed', action: 'Announce transfer, provide staff with call summary' },
        { id: 'va-c13', condition: 'If guest insists on human', action: 'Transfer immediately — don\'t push back more than once' },
        { id: 'va-c21', condition: 'If transfer to restaurant', action: 'Transfer to The Statler Restaurant at ext. 250' },
        { id: 'va-c22', condition: 'If transfer to maintenance or housekeeping', action: 'Transfer to Maintenance (ext. 300) or Housekeeping (ext. 310) based on issue type' },
        { id: 'va-c23', condition: 'If transfer to concierge', action: 'Transfer to Concierge desk at ext. 200 — Theresa Webb available weekdays 7 AM – 11 PM' },
      ],
    },
    { id: 'va-s5', type: 'response', label: 'Post-Call Follow-up', description: 'Send follow-up SMS with relevant info, booking links, or confirmation.',
      conditions: [
        { id: 'va-c14', condition: 'If booking discussed', action: 'Text booking link to caller\'s phone number' },
        { id: 'va-c15', condition: 'If information shared', action: 'Text a summary of the key details discussed' },
        { id: 'va-c16', condition: 'If guest opted out of SMS', action: 'Skip follow-up — respect preference' },
        { id: 'va-c24', condition: 'If parking or directions discussed', action: 'Text W 54th St garage address and self-park/valet rates' },
      ],
    },
  ],
  guardrails: [
    'Never share other guests\' room numbers or personal information.',
    'Always offer to transfer when the guest asks — don\'t push back more than once.',
    'Keep hold time under 30 seconds before offering callback or transfer.',
    'Never process payments or refunds over the phone — direct to secure link.',
    'Always use "The Statler New York" as the property name — never abbreviate to "Statler."',
    'For rate inquiries, quote published rack rates only — refer to reservations for corporate/group/promo rates.',
  ],
};

// ---------------------------------------------------------------------------
// Pre-built Agents
// ---------------------------------------------------------------------------

const alexTriggers: AgentTrigger[] = [
  {
    id: 'trig-alex-1',
    intent: 'Guest calls front desk',
    channels: [
      { channel: 'voice', enabled: true },
      { channel: 'sms', enabled: false },
      { channel: 'whatsapp', enabled: false },
      { channel: 'email', enabled: false },
      { channel: 'booking-com', enabled: false },
      { channel: 'expedia', enabled: false },
      { channel: 'webchat', enabled: false },
    ],
  },
];

const alex: Agent = {
  id: 'agent-alex',
  name: 'Voice AI Agent',
  role: 'Voice AI Agent',
  description:
    'Handles all inbound phone calls for the front desk, answers guest questions, and routes calls to appropriate departments.',
  status: 'active',
  triggers: alexTriggers,
  connections: [conn.twilio, conn.pms, conn.kb, cn(conn.sendgrid, { status: 'setup-required' })],
  capabilities: allProductsWithEnabled(['prod-messages', 'prod-calls', 'prod-checkin', 'prod-knowledge-base']),
  workflow: alexWorkflow,
  tone: 'Natural',
  metrics: {
    totalConversations: 2847,
    resolutionRate: 94,
    avgResponseTime: '1.2s',
    satisfactionScore: 4.8,
    heroStat: { label: 'Avg. Call Duration', value: '2.4 min', subtitle: 'Industry avg: 6.8 min' },
    cards: [
      { label: 'Calls Handled', value: '2,847', subtitle: 'this month' },
      { label: 'Resolved by AI', value: '94%', subtitle: '+3% from last month' },
      { label: 'Avg. Response Time', value: '1.2s', subtitle: 'pickup to greeting' },
      { label: 'Transfer Rate', value: '6%', subtitle: '-1% from last month' },
    ],
  },
  recentActivity: [
    { time: '2 min ago', description: 'Handled call about late checkout request for room 1204.' },
    { time: '15 min ago', description: 'Transferred caller to restaurant for dinner reservation.' },
    { time: '38 min ago', description: 'Answered question about pool hours and towel service.' },
  ],
  createdAt: '2026-01-12',
  rules: [
    { id: 'va-r1', condition: 'IF caller asks for another guest\'s room number', action: 'Never disclose — offer to transfer or take a message', enabled: true },
    { id: 'va-r2', condition: 'IF caller insists on speaking to a human', action: 'Transfer immediately — do not push back more than once', enabled: true },
    { id: 'va-r3', condition: 'IF caller requests payment or refund', action: 'Never process over phone — transfer to front desk', enabled: true },
    { id: 'va-r4', condition: 'DEFAULT', action: 'Attempt AI resolution, offer SMS follow-up with details', enabled: true },
  ],
  responsibilities: [
    'Answer all inbound calls to the hotel front desk line',
    'Identify guest by phone number and greet by name when possible',
    'Answer questions about hotel amenities, hours, and policies using knowledge base',
    'Look up reservations by confirmation number, name, or phone',
    'Transfer calls to the correct department when needed',
    'Send follow-up SMS with booking links, directions, or key details after calls',
  ],
  behavioralGuidelines: 'Keep responses concise and conversational — callers expect quick answers, not scripts. Match the guest\'s energy level. If a caller sounds rushed, be efficient. If they\'re chatty, be warm. Always confirm before transferring. Never leave a caller on hold for more than 30 seconds without checking back in.',
  avoidedTopics: ['Other guests\' room numbers or personal info', 'Specific pricing or rate negotiations', 'Payment processing or refunds', 'Staff schedules or internal operations'],
};

// ---------------------------------------------------------------------------
// Connectors (named external systems for the Connectors step)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Additional Workflows for the Overview page (multi-workflow support)
// ---------------------------------------------------------------------------

export const mockWorkflowColdLead: AgentWorkflow = {
  id: 'wf-cold-lead',
  name: 'Cold Lead Follow-up',
  description: 'Re-engages leads that went silent after initial proposal. Sends progressive follow-ups based on event type and timeline.',
  trigger: 'Detect Silent Lead',
  triggerDescription: 'Monitor for leads with no response after 48 hours from initial proposal.',
  steps: [
    {
      id: 'cl-s1',
      type: 'action',
      label: 'Assess Lead Priority',
      description: 'Check event value, timeline, and previous engagement to determine follow-up urgency.',
      conditions: [
        { id: 'cl-c3', condition: 'If event value > $50K', action: 'High priority — follow up within 24 hours' },
        { id: 'cl-c4', condition: 'If event is within 60 days', action: 'Urgent — they may be booking elsewhere' },
        { id: 'cl-c5', condition: 'If wedding lead with 6+ month timeline', action: 'Standard priority — monthly touchpoint' },
      ],
    },
    {
      id: 'cl-s3',
      type: 'response',
      label: 'Send Follow-up',
      description: 'Compose and send a follow-up email with updated availability or additional incentives.',
      conditions: [
        { id: 'cl-c6', condition: 'If 1st follow-up', action: 'Friendly check-in with updated availability and a new photo or testimonial' },
        { id: 'cl-c7', condition: 'If 2nd follow-up', action: 'Add urgency — mention other groups looking at same dates' },
        { id: 'cl-c8', condition: 'If 3rd follow-up', action: 'Final outreach — offer to schedule a quick 10-minute call' },
      ],
    },
    {
      id: 'cl-s4',
      type: 'handoff',
      label: 'Escalate or Archive',
      description: 'If no response after 3rd follow-up, escalate to sales team or archive the lead.',
      conditions: [
        { id: 'cl-c9', condition: 'If high-value lead (> $50K)', action: 'Escalate to Director of Sales with full context' },
        { id: 'cl-c10', condition: 'If standard lead with no engagement', action: 'Archive and add to quarterly re-engagement list' },
        { id: 'cl-c11', condition: 'If lead responded but didn\'t commit', action: 'Keep in active pipeline with 30-day check-in' },
      ],
    },
  ],
  guardrails: [
    'Maximum 3 follow-ups per lead before escalation.',
    'Never send follow-ups on weekends or holidays.',
    'Always reference the original proposal details in follow-ups.',
  ],
};

export const mockWorkflowContractPrep: AgentWorkflow = {
  id: 'wf-contract-prep',
  name: 'Post-Meeting Contract Prep',
  description: 'After a site visit or meeting is completed, prepares and sends a contract draft with deposit schedule and cancellation terms.',
  trigger: 'Meeting Completed',
  triggerDescription: 'Detect when a scheduled meeting or site visit is marked as completed in the calendar.',
  steps: [
    {
      id: 'cp-s2',
      type: 'action',
      label: 'Compile Event Details',
      description: 'Gather all discussed terms from the meeting: dates, space, headcount, catering, AV requirements, and agreed pricing.',
      conditions: [
        { id: 'cp-c1', condition: 'If meeting notes exist in CRM', action: 'Pull details automatically from CRM record' },
        { id: 'cp-c2', condition: 'If no notes available', action: 'Send a summary confirmation email to client to verify details before contract' },
      ],
    },
    {
      id: 'cp-s3',
      type: 'action',
      label: 'Generate Contract',
      description: 'Create digital contract with event details, pricing, deposit schedule, and cancellation terms using Canary Contracts.',
      conditions: [
        { id: 'cp-c3', condition: 'If event > $100K', action: 'Route to Director of Sales for review before sending' },
        { id: 'cp-c4', condition: 'If wedding', action: 'Include wedding-specific addendum (tastings, rehearsal dinner, bridal suite)' },
        { id: 'cp-c5', condition: 'If corporate with master agreement', action: 'Apply corporate rate schedule and existing terms' },
      ],
    },
    {
      id: 'cp-s4',
      type: 'action',
      label: 'Set Deposit Schedule',
      description: 'Configure the deposit collection timeline based on event date and value.',
      conditions: [
        { id: 'cp-c6', condition: 'If event within 90 days', action: '50% deposit upfront, balance 30 days before event' },
        { id: 'cp-c7', condition: 'If event 3-6 months out', action: '25% deposit now, 25% at 90 days, balance at 30 days' },
        { id: 'cp-c8', condition: 'If event 6+ months out', action: '25% deposit now, then quarterly payments until 30 days before' },
      ],
    },
    {
      id: 'cp-s5',
      type: 'response',
      label: 'Send for Signature',
      description: 'Email the contract to the client via Canary Contracts for e-signature with deposit payment link attached.',
      conditions: [
        { id: 'cp-c9', condition: 'If multiple signers (e.g., bride + parents)', action: 'Send to primary signer, CC secondary contacts' },
        { id: 'cp-c10', condition: 'If third-party planner', action: 'Send to planner with client CC\'d' },
      ],
    },
  ],
  guardrails: [
    'Always include cancellation policy and deposit schedule in every contract.',
    'Contracts over $100K require Director of Sales review before sending.',
    'Never send contracts without verified event details from the meeting.',
    'Always push ACH as preferred payment method to reduce CC processing fees.',
  ],
};

export const mockConnectors: ConnectorConfig[] = [
  { id: 'conn-twilio', name: 'Twilio Voice', type: 'voice', status: 'connected' },
  { id: 'conn-pms', name: 'Oracle Opera PMS', type: 'pms', status: 'connected' },
  { id: 'conn-kb', name: 'Knowledge Base', type: 'knowledge-base', status: 'connected' },
  { id: 'conn-payment', name: 'Payment Gateway', type: 'payment', status: 'connected' },
  { id: 'conn-sendgrid', name: 'SendGrid Email', type: 'email', status: 'connected' },
  { id: 'conn-hotsos', name: 'HotSOS', type: 'task-management', status: 'connected' },
  { id: 'conn-vostio', name: 'Vostio Mobile Key', type: 'mobile-key', status: 'connected' },
  { id: 'conn-pos', name: 'Point of Sale', type: 'pos', status: 'connected' },
  { id: 'conn-crm', name: 'Salesforce CRM', type: 'crm', status: 'setup-required' },
  { id: 'conn-calendar', name: 'Google Calendar', type: 'calendar', status: 'setup-required' },
  { id: 'conn-flexkeeping', name: 'Flexkeeping', type: 'task-management', status: 'not-available' },
  { id: 'conn-dormakaba', name: 'Dormakaba Locks', type: 'mobile-key', status: 'not-available' },
];

// ---------------------------------------------------------------------------
// Activity Feed Items (for Sales & Events Overview)
// ---------------------------------------------------------------------------

export const mockActivityFeed: ActivityFeedItem[] = [
  { id: 'act-1', title: 'Response sent — Sarah Chen', description: 'Inquiry Response · Corporate retreat, 45 guests · 2.1 min', status: 'completed', inquiryId: 'inq-1' },
  { id: 'act-2', title: 'Site visit scheduled — James Rodriguez', description: 'Inquiry Response · Wedding reception, 120 guests · 1.8 min', status: 'completed', inquiryId: 'inq-2' },
  { id: 'act-3', title: 'Follow-up sent — Amanda Torres', description: 'Cold Lead Follow-up · Conference, 200+ attendees · auto', status: 'completed', inquiryId: 'inq-5' },
  { id: 'act-4', title: 'Drafting proposal — Lisa Park', description: 'Inquiry Response · Team offsite, 25 people · in progress', status: 'in-progress', inquiryId: 'inq-3' },
  { id: 'act-5', title: 'Response sent — David Kim', description: 'Inquiry Response · Anniversary dinner, 30 guests · 3.4 min', status: 'completed', inquiryId: 'inq-4' },
];

/**
 * Per-agent activity feed items for the Overview tab.
 * Universal format: Title = [outcome] — [entity], Subtitle = [workflow] · [detail] · [duration]
 * Statuses: completed | in-progress | escalated | flagged | failed
 */
export const agentActivityFeeds: Record<string, ActivityFeedItem[]> = {
  'agent-sales-events': mockActivityFeed,

  'agent-alex': [
    { id: 'alex-1', title: 'Call resolved — Emily Smith', description: 'Call Handling · Parking directions · 1m 12s', status: 'completed', inquiryId: 'alex-1' },
    { id: 'alex-2', title: 'Call transferred — Noah Davis', description: 'Call Handling · Dinner reservation · 42s', status: 'escalated', inquiryId: 'alex-2' },
    { id: 'alex-3', title: 'Call resolved — Hiroshi Nakamura', description: 'Call Handling · Room service hours · 1m 05s', status: 'completed', inquiryId: 'alex-3' },
    { id: 'alex-4', title: 'Handling call — Priya Sharma', description: 'Call Handling · Taxi request · in progress', status: 'in-progress', inquiryId: 'alex-4' },
  ],

  'agent-front-desk': [
    { id: 'fd-1', title: 'Resolved — Brooklyn Simmons', description: 'FAQ + Upsell + Service Request · 3 workflows · 4 min', status: 'completed', inquiryId: 'fd-1' },
    { id: 'fd-2', title: 'Booking completed — Marco Bitanga-Sevilla', description: 'Booking · Room 112, Mar 20-22 · 2.3 min', status: 'completed', inquiryId: 'fd-2' },
    { id: 'fd-3', title: 'Escalated — Thomas Kim', description: 'Escalation · Billing discrepancy, guest frustrated · 1.2 min', status: 'escalated', inquiryId: 'fd-3' },
    { id: 'fd-4', title: 'Checking availability — Chloe Dubois', description: 'Booking · Spa appointment, Sunday · in progress', status: 'in-progress', inquiryId: 'fd-4' },
  ],

  'agent-checkin': [
    { id: 'ci-1', title: 'Auto-verified — Emily Smith', description: 'Process Submission · Room 412, mobile key issued · 8s', status: 'completed', inquiryId: 'ci-1' },
    { id: 'ci-2', title: 'Auto-verified — Brooklyn Simmons', description: 'Process Submission · Room 130, mobile key issued · 6s', status: 'completed', inquiryId: 'ci-2' },
    { id: 'ci-3', title: 'ID mismatch — Sarah Martinez', description: 'ID Verification Review · Name mismatch, staff review required', status: 'flagged', inquiryId: 'ci-3' },
    { id: 'ci-4', title: 'Validating — Olivia Brown-Henderson', description: 'Process Submission · Checking completeness · in progress', status: 'in-progress', inquiryId: 'ci-4' },
  ],

  'agent-email-res': [
    { id: 'er-1', title: 'Cancelled — Michael Torres', description: 'Process Cancellation · #CTL-88421, no charge · 42s', status: 'completed', inquiryId: 'er-1' },
    { id: 'er-2', title: 'Modified — Jennifer Walsh', description: 'Process Modification · Dates shifted Apr 12→19 · 38s', status: 'completed', inquiryId: 'er-2' },
    { id: 'er-3', title: 'Flagged — Robert Kim', description: 'Process Cancellation · Non-refundable rate, revenue manager', status: 'flagged', inquiryId: 'er-3' },
    { id: 'er-4', title: 'Validating policy — Amanda Liu', description: 'Process Cancellation · #CTL-93102 · in progress', status: 'in-progress', inquiryId: 'er-4' },
  ],

  'agent-service-ticket': [
    { id: 'st-1', title: 'Ticket resolved — Lucia Rossi', description: 'Service Resolution · Extra blankets, Room 226 · 45 min', status: 'completed', inquiryId: 'st-1' },
    { id: 'st-2', title: 'Maintenance dispatched — Andre Williams', description: 'Service Resolution · AC repair, Room 124 · tracking', status: 'flagged', inquiryId: 'st-2' },
    { id: 'st-3', title: 'Ticket resolved — Fatima Al-Hassan', description: 'Service Resolution · Suite key issue, Room 602 · 20 min', status: 'completed', inquiryId: 'st-3' },
    { id: 'st-4', title: 'Analyzing request — Maya Patel', description: 'Service Resolution · Blocked drain, Room 331 · in progress', status: 'in-progress', inquiryId: 'st-4' },
  ],
};

// ---------------------------------------------------------------------------
// Email Reservation Agent — individual workflows
// ---------------------------------------------------------------------------

const erWorkflowModification: AgentWorkflow = {
  id: 'wf-email-modify',
  name: 'Process Modification Email',
  description: 'Parses date change, room type, and guest count modification requests from inbound emails and applies them to the PMS.',
  trigger: 'Modification Email Received',
  triggerDescription: 'Inbound email matching modification keywords (change dates, switch rooms, add guest, etc.).',
  steps: [
    { id: 'erm-s1', type: 'action', label: 'Parse Modification Request', description: 'Extract CTL-XXXXX confirmation number, requested changes (dates, room type, guest count), and reason from email.',
      conditions: [
        { id: 'erm-c1', condition: 'If CTL confirmation number found', action: 'Look up reservation in Oracle Opera PMS' },
        { id: 'erm-c2', condition: 'If no confirmation number', action: 'Search by guest name + original dates' },
        { id: 'erm-c3', condition: 'If multiple changes requested', action: 'Process each change sequentially' },
      ],
    },
    { id: 'erm-s2', type: 'action', label: 'Validate Changes', description: 'Check if the requested modifications are possible — date availability, room type availability, rate impact.',
      conditions: [
        { id: 'erm-c4', condition: 'If new dates available at same rate', action: 'Apply change directly' },
        { id: 'erm-c5', condition: 'If new dates available at different rate', action: 'Flag rate difference for guest confirmation before applying' },
        { id: 'erm-c6', condition: 'If requested dates/room not available', action: 'Suggest closest alternatives — Standard King, Deluxe Double, or Executive Suite' },
        { id: 'erm-c7', condition: 'If modification violates policy (e.g., non-modifiable rate)', action: 'Flag for staff review' },
        { id: 'erm-c10', condition: 'If PROMO or ADVANCE rate code', action: 'Non-modifiable — flag for revenue manager, cannot change dates or room type' },
        { id: 'erm-c11', condition: 'If Diamond/Platinum Elite loyalty member', action: 'Allow one complimentary date change within 48 hours of arrival per Statler loyalty policy' },
      ],
    },
    { id: 'erm-s3', type: 'action', label: 'Update PMS', description: 'Apply the validated changes to the reservation in Oracle Opera — update dates, room type, guest count, and rate.',
      conditions: [
        { id: 'erm-c8', condition: 'If PMS update succeeds', action: 'Log changes with CTL confirmation number and proceed to confirmation' },
        { id: 'erm-c9', condition: 'If PMS update fails', action: 'Retry once, then flag for staff with error details' },
      ],
    },
    { id: 'erm-s4', type: 'response', label: 'Send Confirmation', description: 'Email guest with updated CTL reservation details — new dates, room type, rate, and any price difference.' },
  ],
  guardrails: [
    'Never modify a reservation without matching the CTL-XXXXX confirmation number or guest identity.',
    'Always show rate impact before applying changes that affect pricing.',
    'PROMO and ADVANCE rate codes are non-modifiable — always route to revenue manager.',
    'Log all modifications for audit trail.',
  ],
};

const erWorkflowConfirmation: AgentWorkflow = {
  id: 'wf-email-confirm',
  name: 'Process Confirmation Email',
  description: 'Matches inbound confirmation emails to pending reservations and marks them as confirmed in the PMS.',
  trigger: 'Confirmation Email Received',
  triggerDescription: 'Inbound email from guest confirming their upcoming reservation.',
  steps: [
    { id: 'erc-s1', type: 'action', label: 'Match Reservation', description: 'Extract confirmation number or guest details from the email and locate the reservation in PMS.',
      conditions: [
        { id: 'erc-c1', condition: 'If exact reservation match found', action: 'Proceed to verify details' },
        { id: 'erc-c2', condition: 'If multiple possible matches', action: 'Flag for staff to select correct reservation' },
        { id: 'erc-c3', condition: 'If no match found', action: 'Reply asking guest for confirmation number' },
      ],
    },
    { id: 'erc-s2', type: 'action', label: 'Verify & Confirm', description: 'Confirm reservation details match what the guest expects — dates, room type, rate, guest count.',
      conditions: [
        { id: 'erc-c4', condition: 'If details match guest expectations', action: 'Mark as confirmed in PMS' },
        { id: 'erc-c5', condition: 'If guest mentions discrepancies', action: 'Flag for staff review before confirming' },
        { id: 'erc-c6', condition: 'If Diamond or Platinum Elite loyalty member', action: 'Include loyalty welcome amenity note and priority room assignment flag' },
      ],
    },
    { id: 'erc-s3', type: 'response', label: 'Send Confirmation', description: 'Reply to guest with confirmed CTL-XXXXX reservation summary — dates, room type, rate, The Statler check-in instructions, and pre-arrival check-in link.' },
  ],
  guardrails: [
    'Never confirm a reservation that has unresolved discrepancies.',
    'Always include pre-arrival check-in link in confirmation emails.',
    'Include The Statler\'s 48-hour cancellation policy reminder in every confirmation.',
    'Include parking info (W 54th St garage, $45/night self-park) in confirmation for drive-in guests.',
  ],
};

// ---------------------------------------------------------------------------
// Riley — Email Reservation Agent (Backend Automation, Pressure Test #1)
// ---------------------------------------------------------------------------

const riley: Agent = {
  id: 'agent-email-res',
  name: 'Email Reservation Agent',
  role: 'Reservation Processor',
  description: 'Processes reservation-related emails (cancellations, modifications, confirmations) and updates the PMS automatically.',
  status: 'active',
  triggers: [
    {
      id: 'trig-riley-1',
      intent: 'Reservation email received',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: false },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  connections: [conn.pms, conn.sendgrid, conn.kb],
  capabilities: CANARY_PRODUCTS.map((p) => ({
    ...p,
    enabled: p.id === 'prod-knowledge-base',
  })),
  workflow: {
    id: 'wf-email-cancel',
    name: 'Process Cancellation Email',
    description: 'Parses inbound cancellation emails, validates against PMS policy, cancels or flags for review.',
    trigger: 'Cancellation Email Received',
    triggerDescription: 'Inbound email matching cancellation keywords detected in reservations inbox.',
    steps: [
      {
        id: 'er-s1',
        type: 'action',
        label: 'Parse Email Content',
        description: 'Extract confirmation number (CTL-XXXXX format), guest name, dates, and cancellation reason from the email body.',
        conditions: [
          { id: 'er-c1', condition: 'If confirmation number is missing', action: 'Search PMS by guest name and dates' },
          { id: 'er-c2', condition: 'If multiple reservations match', action: 'Flag for staff review' },
          { id: 'er-c11', condition: 'If confirmation number does not match CTL-XXXXX format', action: 'Check if OTA booking number — route to OTA portal team' },
        ],
      },
      {
        id: 'er-s2',
        type: 'action',
        label: 'Validate Cancellation Policy',
        description: 'Check the reservation against The Statler\'s cancellation policy — 48-hour free cancellation for standard rates.',
        conditions: [
          { id: 'er-c3', condition: 'If within 48-hour free cancellation window', action: 'Proceed — no charge, full refund' },
          { id: 'er-c4', condition: 'If within penalty window (< 48 hours)', action: 'Calculate one-night penalty per Statler policy' },
          { id: 'er-c5', condition: 'If non-refundable rate (PROMO or ADVANCE rate codes)', action: 'Flag for revenue manager — no auto-cancellation allowed' },
          { id: 'er-c12', condition: 'If Diamond Elite or Platinum Elite loyalty member', action: 'Apply courtesy late cancellation — waive penalty up to 24 hours before arrival' },
          { id: 'er-c13', condition: 'If group block reservation (10+ rooms)', action: 'Route to sales team (Sarah Kim) — group cancellation terms apply' },
        ],
      },
      {
        id: 'er-s3',
        type: 'action',
        label: 'Update PMS',
        description: 'Cancel the reservation in Oracle Opera PMS and release inventory.',
        conditions: [
          { id: 'er-c6', condition: 'If PMS write succeeds', action: 'Log CTL confirmation number and proceed to confirmation' },
          { id: 'er-c7', condition: 'If PMS write fails', action: 'Retry once, then escalate to IT' },
        ],
      },
      {
        id: 'er-s4',
        type: 'response',
        label: 'Send Confirmation',
        description: 'Email guest with CTL cancellation number, charges applied, refund timeline, and rebooking link for The Statler New York.',
      },
      {
        id: 'er-s5',
        type: 'handoff',
        label: 'Escalate Exceptions',
        description: 'Route flagged items to the appropriate team for manual review.',
        conditions: [
          { id: 'er-c8', condition: 'If non-refundable (PROMO/ADVANCE) or policy exception', action: 'Send to revenue manager' },
          { id: 'er-c9', condition: 'If PMS error persisted', action: 'Send to IT support' },
          { id: 'er-c10', condition: 'If guest disputed terms', action: 'Send to front desk manager' },
          { id: 'er-c14', condition: 'If loyalty member requests exception beyond courtesy window', action: 'Route to guest services manager for discretionary approval' },
        ],
      },
    ],
    guardrails: [
      'Never cancel without matching CTL-XXXXX confirmation number or verified guest identity.',
      'Always apply The Statler\'s 48-hour free cancellation policy for standard rates.',
      'PROMO and ADVANCE rate codes are always non-refundable — never auto-cancel.',
      'Diamond and Platinum Elite members get courtesy late cancellation up to 24 hours before arrival.',
      'Log every action for audit trail.',
      'Never process group/event booking cancellations — route to sales team.',
    ],
  },
  tone: '',
  metrics: {
    totalConversations: 312,
    resolutionRate: 96,
    avgResponseTime: '< 1 min',
    satisfactionScore: 0,
    heroStat: { label: 'Avg. Processing Time', value: '< 1 min', subtitle: 'Email received to PMS updated' },
    cards: [
      { label: 'Emails Processed', value: '312', subtitle: 'this month' },
      { label: 'Auto-Processed', value: '96%', subtitle: 'without staff intervention' },
      { label: 'PMS Sync Success', value: '99.2%', subtitle: '3 failures this month' },
      { label: 'Escalation Rate', value: '4%', subtitle: 'OTA + non-refundable' },
    ],
  },
  recentActivity: [
    { time: '9:42 AM', description: 'Cancelled reservation #CTL-88421 — free cancellation window, no charge applied.' },
    { time: '9:15 AM', description: 'Flagged reservation #CTL-77102 for revenue manager — non-refundable rate.' },
    { time: '8:58 AM', description: 'Processed modification for #CTL-90315 — dates shifted from Apr 12-14 to Apr 19-21.' },
    { time: '8:30 AM', description: 'Escalated OTA reservation #BK-445521 — routed to Booking.com portal team.' },
  ],
  createdAt: '2026-03-15',
  rules: [
    { id: 'er-r1', condition: 'IF group or event booking', action: 'Route to sales team — do not auto-cancel', enabled: true },
    { id: 'er-r2', condition: 'IF OTA reservation', action: 'Flag for OTA portal cancellation', enabled: true },
    { id: 'er-r3', condition: 'IF VIP or loyalty member', action: 'Flag for front desk manager review', enabled: true },
    { id: 'er-r4', condition: 'DEFAULT', action: 'Process per standard policy', enabled: true },
  ],
  responsibilities: [
    'Monitor reservations inbox for cancellation, modification, and confirmation emails',
    'Parse reservation details (confirmation number, dates, guest name) from email content',
    'Validate changes against hotel cancellation and modification policies',
    'Update reservations in Oracle Opera PMS automatically',
    'Send confirmation emails to guests after processing',
    'Escalate policy exceptions and OTA reservations to appropriate staff',
  ],
  behavioralGuidelines: 'Process every email within 60 seconds of receipt. Always match confirmation numbers before making changes. Log every PMS write for audit trail. Never auto-cancel group bookings or event reservations — those go to the sales team.',
  avoidedTopics: [],
};
// Attach all workflows to riley
riley.workflows = [riley.workflow, erWorkflowModification, erWorkflowConfirmation];

// ---------------------------------------------------------------------------
// Service Ticket Agent (Pressure Test #2)
// AI recommends tickets from guest messages, staff approves and creates.
// ---------------------------------------------------------------------------

const serviceTicketAgent: Agent = {
  id: 'agent-service-ticket',
  name: 'Service Ticket Agent',
  role: 'Service Request Coordinator',
  description: 'Detects service requests in guest messages, recommends tickets to staff, and tracks resolution through vendor systems.',
  status: 'active',
  triggers: [
    {
      id: 'trig-st-1',
      intent: 'Guest reports service issue via messaging',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: true },
        { channel: 'email', enabled: false },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  connections: [conn.hotsos, conn.pms, conn.kb, conn.flexkeeping],
  capabilities: CANARY_PRODUCTS.map((p) => ({
    ...p,
    enabled: ['prod-messages', 'prod-knowledge-base'].includes(p.id),
  })),
  workflow: {
    id: 'wf-service-ticket',
    name: 'Service Ticket Resolution',
    description: 'Detects service requests, gathers details, recommends tickets, and tracks through to resolution.',
    trigger: 'Service Request Detected',
    triggerDescription: 'Guest message identified as a service request (housekeeping, maintenance, amenity, etc.).',
    steps: [
      {
        id: 'st-s1',
        type: 'action',
        label: 'Analyze Guest Message',
        description: 'Parse the guest message to identify service request intent and urgency.',
        conditions: [
          { id: 'st-c1', condition: 'If message is unclear or vague', action: 'Ask clarifying question — what room, what issue, when did it start?' },
          { id: 'st-c2', condition: 'If multiple issues mentioned', action: 'Address highest priority first, queue remaining' },
          { id: 'st-c3', condition: 'If guest expresses anger or frustration', action: 'Acknowledge emotion first, then proceed to resolution' },
          { id: 'st-c13', condition: 'If pool, gym, or fitness center issue', action: 'Route to Operations department (ext. 320) — not Maintenance' },
          { id: 'st-c14', condition: 'If Diamond or Platinum Elite guest', action: 'Auto-escalate to priority queue — SLA reduced to 15 min for housekeeping, 30 min for maintenance' },
        ],
      },
      {
        id: 'st-s2',
        type: 'action',
        label: 'Match Ticket Type',
        description: 'Search HotSOS ticket categories for the best match — Housekeeping, Maintenance, Engineering, Operations, or Front Desk.',
        conditions: [
          { id: 'st-c4', condition: 'If exact match found (similarity > 0.75)', action: 'Use matched HotSOS ticket category' },
          { id: 'st-c5', condition: 'If partial match', action: 'Present top 2-3 HotSOS categories to staff for selection' },
          { id: 'st-c6', condition: 'If no match found', action: 'Create generic "Guest Request" ticket and flag for staff categorization' },
          { id: 'st-c7', condition: 'If duplicate ticket exists for same room', action: 'Skip creation, update existing ticket with new context' },
          { id: 'st-c15', condition: 'If HVAC, plumbing, or electrical issue', action: 'Route to Maintenance dept (ext. 300) — James Rodriguez on duty weekdays' },
          { id: 'st-c16', condition: 'If housekeeping request (towels, cleaning, amenities)', action: 'Route to Housekeeping dept (ext. 310) — SLA 30 minutes' },
        ],
      },
      {
        id: 'st-s3',
        type: 'response',
        label: 'Acknowledge Guest',
        description: 'Send confirmation to guest that their request has been received and is being addressed.',
        conditions: [
          { id: 'st-c8', condition: 'If urgent (safety, leak, lockout)', action: 'Send immediate acknowledgment — "Our team is on the way"' },
          { id: 'st-c9', condition: 'If routine housekeeping (towels, toiletries)', action: 'Confirm receipt — estimated delivery within 30 minutes' },
          { id: 'st-c17', condition: 'If maintenance request (AC, plumbing, electrical)', action: 'Confirm receipt — estimated response within 1 hour' },
        ],
      },
      {
        id: 'st-s4',
        type: 'action',
        label: 'Create Recommended Ticket',
        description: 'Generate a recommended HotSOS ticket for staff review with room number, department (Maintenance ext. 300 / Housekeeping ext. 310 / Operations ext. 320), issue type, priority, and guest context.',
      },
      {
        id: 'st-s5',
        type: 'action',
        label: 'Staff Review',
        description: 'Staff reviews the recommended ticket and approves, rejects, or re-categorizes before it is created in HotSOS.',
        conditions: [
          { id: 'st-c10', condition: 'If approved', action: 'Create ticket in HotSOS and proceed to tracking' },
          { id: 'st-c11', condition: 'If rejected — invalid request', action: 'Close recommendation and log reason' },
          { id: 'st-c12', condition: 'If rejected — wrong category', action: 'Re-assess ticket type and resubmit recommendation to staff' },
        ],
      },
      {
        id: 'st-s6',
        type: 'action',
        label: 'Track Resolution',
        description: 'Monitor ticket status from HotSOS and send follow-up to guest when resolved.',
        conditions: [
          { id: 'st-c18', condition: 'If housekeeping ticket resolved within 30-min SLA', action: 'Send satisfaction check to guest' },
          { id: 'st-c19', condition: 'If maintenance ticket resolved within 1-hour SLA', action: 'Send satisfaction check to guest' },
          { id: 'st-c20', condition: 'If exceeds SLA', action: 'Escalate to department manager and notify guest of delay' },
          { id: 'st-c21', condition: 'If staff rejects recommended ticket', action: 'Log reason and reassess — ask guest for more details if needed' },
        ],
      },
    ],
    guardrails: [
      'Never promise a specific resolution time — use SLA estimates (housekeeping 30 min, maintenance 1 hour).',
      'Always confirm room number before creating a ticket.',
      'Route safety issues (fire, water, lockout) to staff immediately — do not wait for ticket approval.',
      'Never create duplicate tickets for the same room and issue.',
      'Pool/gym/fitness center issues go to Operations (ext. 320), NOT Maintenance.',
      'Always include guest loyalty tier in ticket context — Diamond/Platinum get priority SLA.',
    ],
  },
  tone: 'Natural',
  metrics: {
    totalConversations: 847,
    resolutionRate: 89,
    avgResponseTime: '45 sec',
    satisfactionScore: 4.2,
    heroStat: { label: 'Avg. Resolution Time', value: '18 min', subtitle: 'From request to completion' },
    cards: [
      { label: 'Tickets Created', value: '847', subtitle: 'this month' },
      { label: 'Avg. Resolution Time', value: '18 min', subtitle: 'request to close' },
      { label: 'SLA Met', value: '89%', subtitle: 'within target time' },
      { label: 'Satisfaction', value: '4.2/5', subtitle: 'post-resolution survey' },
    ],
  },
  recentActivity: [
    { time: '10:15 AM', description: 'Created ticket for Room 412 — broken AC unit. Priority: High.' },
    { time: '9:48 AM', description: 'Resolved ticket for Room 308 — extra towels delivered in 12 min.' },
    { time: '9:22 AM', description: 'Escalated Room 115 — water leak, staff notified immediately.' },
    { time: '8:55 AM', description: 'Duplicate skipped — Room 412 already has active AC ticket.' },
  ],
  createdAt: '2026-02-20',
  rules: [
    { id: 'st-r1', condition: 'IF safety issue (fire, water, lockout)', action: 'Bypass recommendation — alert staff directly', enabled: true },
    { id: 'st-r2', condition: 'IF same room + same issue within 24 hours', action: 'Update existing ticket instead of creating new', enabled: true },
    { id: 'st-r3', condition: 'IF guest has made 3+ requests this stay', action: 'Flag as high-attention guest for front desk', enabled: true },
    { id: 'st-r4', condition: 'DEFAULT', action: 'Create recommended ticket for staff review', enabled: true },
  ],
  responsibilities: [
    'Detect service requests in guest messages (housekeeping, maintenance, amenities)',
    'Ask clarifying questions when the issue is vague or missing details',
    'Match requests to the correct ticket type using semantic search',
    'Create recommended tickets for staff approval with room, issue, and priority',
    'Track ticket resolution and send follow-up to guests when complete',
    'Deduplicate requests — update existing tickets instead of creating new ones',
  ],
  behavioralGuidelines: 'Always acknowledge the guest\'s issue with empathy before creating a ticket. Confirm the room number before submitting. For urgent issues (safety, water, lockout), bypass the recommendation step and alert staff directly. Never promise a specific resolution time — use estimates.',
  avoidedTopics: ['Blaming hotel staff or departments', 'Promising specific resolution times', 'Compensation or refund offers'],
};

// ---------------------------------------------------------------------------
// Front Desk Orchestrator (Pressure Test #3)
// Replaces current Chat AI — multi-capability guest-facing agent.
// ---------------------------------------------------------------------------

// Front Desk individual workflows (one per capability)
const fdWorkflowBooking: AgentWorkflow = {
  id: 'wf-fd-booking',
  name: 'Booking Request',
  description: 'Handles new reservation requests — checks availability, presents options, processes booking, and sends confirmation.',
  trigger: 'Booking Intent Detected',
  triggerDescription: 'Guest asks about availability, rates, or wants to make a reservation.',
  steps: [
    { id: 'fdb-s1', type: 'action', label: 'Check Availability', description: 'Query PMS for room availability matching guest dates, room type, and guest count.',
      conditions: [
        { id: 'fdb-c1', condition: 'If rooms available', action: 'Present options — Standard King ($289), Deluxe Double ($349), Executive Suite ($489) with descriptions' },
        { id: 'fdb-c2', condition: 'If no availability for requested dates', action: 'Suggest alternative dates at The Statler — never recommend competing properties' },
        { id: 'fdb-c3', condition: 'If webchat channel', action: 'Include interactive booking form widget' },
        { id: 'fdb-c7', condition: 'If guest mentions corporate travel', action: 'Ask for corporate rate code (CORP) — apply negotiated rate if valid' },
        { id: 'fdb-c8', condition: 'If guest mentions AAA or government', action: 'Apply AAA or GOV rate code — verify membership at check-in' },
      ],
    },
    { id: 'fdb-s2', type: 'response', label: 'Present Options', description: 'Show available Statler room types with rates, amenities, and booking links. Include photos on webchat.' },
    { id: 'fdb-s3', type: 'action', label: 'Process Booking', description: 'Create the reservation in Oracle Opera PMS via booking gateway.',
      conditions: [
        { id: 'fdb-c4', condition: 'If booking succeeds', action: 'Generate CTL-XXXXX confirmation with details' },
        { id: 'fdb-c5', condition: 'If payment required upfront', action: 'Capture payment via Stripe before confirming' },
        { id: 'fdb-c6', condition: 'If booking fails', action: 'Apologize and suggest calling the front desk' },
      ],
    },
    { id: 'fdb-s4', type: 'response', label: 'Send Confirmation', description: 'Send booking confirmation with CTL confirmation number, dates, room type, 48-hour cancellation policy, and check-in instructions.' },
  ],
  guardrails: ['Never override published rates without manager approval.', 'Always include The Statler\'s 48-hour free cancellation policy in booking confirmation.', 'Only offer Standard King, Deluxe Double, or Executive Suite — no room types outside the Statler inventory.'],
};

const fdWorkflowFAQ: AgentWorkflow = {
  id: 'wf-fd-faq',
  name: 'FAQ & Information',
  description: 'Answers guest questions about hotel facilities, policies, nearby places, and general inquiries using the knowledge base.',
  trigger: 'Information Request Detected',
  triggerDescription: 'Guest asks a question about the hotel, amenities, policies, or local area.',
  steps: [
    { id: 'fdf-s1', type: 'action', label: 'Search Knowledge Base', description: 'Query The Statler knowledge base using semantic search to find the best matching answer.',
      conditions: [
        { id: 'fdf-c1', condition: 'If high-confidence match found', action: 'Use KB answer as response basis' },
        { id: 'fdf-c2', condition: 'If question is about nearby places/restaurants', action: 'Search NYC places database — prioritize Carnegie Hall, Central Park, Times Square area' },
        { id: 'fdf-c3', condition: 'If no match found', action: 'Generate best-effort response, flag for KB gap review' },
        { id: 'fdf-c4', condition: 'If question about pool or fitness', action: 'Pool hours 6 AM – 10 PM (towels provided poolside), fitness center 24 hours with room key access' },
        { id: 'fdf-c5', condition: 'If question about parking', action: 'W 54th St garage — $45/night self-park, $65/night valet, in/out privileges included' },
        { id: 'fdf-c6', condition: 'If question about checkout time', action: 'Standard checkout 11 AM, late checkout available until 2 PM (subject to availability, $50 fee)' },
      ],
    },
    { id: 'fdf-s2', type: 'response', label: 'Compose Answer', description: 'Generate a helpful, conversational response using KB content, tailored to the guest and channel.' },
  ],
  guardrails: ['Never fabricate information not in the knowledge base.', 'If unsure, say "let me check with the team" and escalate.', 'Always use Statler-verified hours and policies — do not guess amenity schedules.'],
};

const fdWorkflowServiceTicket: AgentWorkflow = {
  id: 'wf-fd-ticket',
  name: 'Service Request',
  description: 'Handles guest service requests — identifies issue, matches ticket type, acknowledges guest, and recommends ticket for staff approval.',
  trigger: 'Service Request Detected',
  triggerDescription: 'Guest reports an issue or requests a service (housekeeping, maintenance, amenities).',
  steps: [
    { id: 'fdt-s1', type: 'action', label: 'Identify Issue', description: 'Parse the service request and match against HotSOS ticket categories via embedding search.',
      conditions: [
        { id: 'fdt-c1', condition: 'If clear match found', action: 'Use matched HotSOS ticket type' },
        { id: 'fdt-c2', condition: 'If ambiguous', action: 'Ask one clarifying question before proceeding' },
        { id: 'fdt-c3', condition: 'If safety issue (leak, fire, lockout)', action: 'Skip ticket — escalate to staff immediately' },
        { id: 'fdt-c4', condition: 'If housekeeping request', action: 'Route to Housekeeping (ext. 310) via HotSOS — 30 min SLA' },
        { id: 'fdt-c5', condition: 'If maintenance/repair request', action: 'Route to Maintenance (ext. 300) via HotSOS — 1 hour SLA' },
      ],
    },
    { id: 'fdt-s2', type: 'response', label: 'Acknowledge Guest', description: 'Confirm receipt of the request and provide estimated response time based on Statler SLAs.' },
    { id: 'fdt-s3', type: 'action', label: 'Create Recommended Ticket', description: 'Generate a recommended HotSOS ticket with room, department code, issue type, priority, and guest context for staff review.' },
  ],
  guardrails: ['Route safety issues directly to staff — do not create a ticket.', 'Never create duplicate tickets for the same room and issue.', 'Use Statler SLA estimates: housekeeping 30 min, maintenance 1 hour.'],
};

const fdWorkflowUpsell: AgentWorkflow = {
  id: 'wf-fd-upsell',
  name: 'Upsell Offer',
  description: 'Identifies upsell opportunities and presents room upgrades, early check-in, late checkout, and add-on offers to guests.',
  trigger: 'Upsell Opportunity Detected',
  triggerDescription: 'Guest mentions interest in upgrades, early arrival, late departure, or additional services.',
  steps: [
    { id: 'fdu-s1', type: 'action', label: 'Search Available Upsells', description: 'Query available Statler upsell options based on guest reservation, room type, and dates.',
      conditions: [
        { id: 'fdu-c1', condition: 'If room upgrades available', action: 'Offer upgrade — Standard King → Deluxe Double (from $45/night), Deluxe → Executive Suite (from $95/night)' },
        { id: 'fdu-c2', condition: 'If early check-in or late checkout available', action: 'Late checkout until 2 PM ($50), early check-in from 12 PM ($40, subject to availability)' },
        { id: 'fdu-c3', condition: 'If no relevant upsells', action: 'Acknowledge request and suggest contacting front desk' },
        { id: 'fdu-c6', condition: 'If guest mentions spa or wellness', action: 'Offer Statler Spa Package — 60-min massage + late checkout ($175)' },
      ],
    },
    { id: 'fdu-s2', type: 'response', label: 'Present Offer', description: 'Show Statler upsell options with pricing and benefits in a guest-friendly format.' },
    { id: 'fdu-s3', type: 'action', label: 'Process Acceptance', description: 'If guest accepts, process the upsell — update reservation in Oracle Opera and capture payment via Stripe.',
      conditions: [
        { id: 'fdu-c4', condition: 'If accepted', action: 'Update reservation in PMS and confirm to guest' },
        { id: 'fdu-c5', condition: 'If declined', action: 'Acknowledge gracefully, no follow-up' },
      ],
    },
  ],
  guardrails: ['Never push upsells to guests who have complained.', 'Respect guest preferences — no repeat offers for declined upsells.', 'Diamond Elite members get complimentary late checkout — do not charge them.'],
};

const fdWorkflowCheckout: AgentWorkflow = {
  id: 'wf-fd-checkout',
  name: 'Guest Checkout',
  description: 'Processes checkout requests — generates folio, handles disputes, and sends departure confirmation.',
  trigger: 'Checkout Request Detected',
  triggerDescription: 'Guest indicates they want to check out or asks about their bill.',
  steps: [
    { id: 'fdc-s1', type: 'action', label: 'Generate Folio', description: 'Pull the guest folio from Oracle Opera PMS with all charges, taxes, and credits.' },
    { id: 'fdc-s2', type: 'response', label: 'Send Folio', description: 'Send the itemized folio to the guest for review via their messaging channel.',
      conditions: [
        { id: 'fdc-c1', condition: 'If guest has outstanding balance', action: 'Include Stripe payment link with folio' },
        { id: 'fdc-c2', condition: 'If balance is zero or pre-paid', action: 'Confirm no further charges needed' },
        { id: 'fdc-c5', condition: 'If parking charges present', action: 'Itemize parking separately — $45/night self-park or $65/night valet' },
      ],
    },
    { id: 'fdc-s3', type: 'action', label: 'Process Checkout', description: 'Mark the reservation as checked out in PMS at standard checkout time (11 AM). Release room for housekeeping.',
      conditions: [
        { id: 'fdc-c3', condition: 'If guest disputes a charge', action: 'Escalate to front desk — do not auto-resolve billing disputes' },
        { id: 'fdc-c4', condition: 'If late checkout (after 11 AM, before 2 PM)', action: 'Apply $50 late checkout fee unless Diamond Elite (complimentary) or pre-purchased upsell' },
        { id: 'fdc-c6', condition: 'If checkout after 2 PM without approval', action: 'Charge additional half-day rate — escalate to front desk manager' },
      ],
    },
    { id: 'fdc-s4', type: 'response', label: 'Departure Confirmation', description: 'Send thank-you message from The Statler New York with feedback survey link and rebooking incentive.' },
  ],
  guardrails: ['Never adjust charges without staff approval.', 'Always include feedback survey in departure message.', 'Standard checkout is 11 AM, late checkout until 2 PM ($50 fee, free for Diamond Elite).'],
};

const fdWorkflowSurvey: AgentWorkflow = {
  id: 'wf-fd-survey',
  name: 'Survey Response',
  description: 'Processes guest survey responses — logs feedback, acknowledges the guest, and escalates negative reviews.',
  trigger: 'Survey Response Received',
  triggerDescription: 'Guest replies to a satisfaction survey sent during or after their stay.',
  steps: [
    { id: 'fds-s1', type: 'action', label: 'Log Response', description: 'Record the survey response with score, comments, and guest details.' },
    { id: 'fds-s2', type: 'response', label: 'Acknowledge Guest', description: 'Thank the guest for their feedback.',
      conditions: [
        { id: 'fds-c1', condition: 'If positive feedback (4-5 stars)', action: 'Thank warmly and invite to leave a public review' },
        { id: 'fds-c2', condition: 'If negative feedback (1-2 stars)', action: 'Apologize and escalate to management for follow-up' },
        { id: 'fds-c3', condition: 'If neutral (3 stars)', action: 'Thank and ask if there is anything we can improve' },
      ],
    },
  ],
  guardrails: ['Never argue with negative feedback.', 'Escalate all negative reviews to duty manager within 1 hour.'],
};

const fdWorkflowEscalation: AgentWorkflow = {
  id: 'wf-fd-escalation',
  name: 'Staff Escalation',
  description: 'Handles cases the agent cannot resolve — routes to the right staff member with full context.',
  trigger: 'Escalation Required',
  triggerDescription: 'Agent cannot generate a response, guest is upset, or topic is marked as staff-only.',
  steps: [
    { id: 'fde-s1', type: 'action', label: 'Determine Escalation Reason', description: 'Classify why escalation is needed — no AI response, anger detected, staff-only topic, or audit failure.',
      conditions: [
        { id: 'fde-c1', condition: 'If anger or frustration detected', action: 'Priority escalation — notify manager immediately via SMS' },
        { id: 'fde-c2', condition: 'If staff-only topic (rates, billing, complaints)', action: 'Route to specific department' },
        { id: 'fde-c3', condition: 'If AI simply cannot respond', action: 'Standard escalation to front desk' },
      ],
    },
    { id: 'fde-s2', type: 'handoff', label: 'Notify Staff', description: 'Send escalation notification via configured channels (email, SMS, WhatsApp) with full conversation context.',
      conditions: [
        { id: 'fde-c4', condition: 'If staff responds within escalation window', action: 'Mark as handled' },
        { id: 'fde-c5', condition: 'If no response within window', action: 'Re-escalate via secondary channel' },
      ],
    },
  ],
  guardrails: ['Never leave a guest without acknowledgment — always send "I\'m connecting you with our team."', 'Include full conversation history in every escalation.'],
};

const frontDeskAgent: Agent = {
  id: 'agent-front-desk',
  name: 'Front Desk Agent',
  role: 'Guest Communication Orchestrator',
  description: 'Manages all guest messaging across channels. Handles bookings, FAQ, service requests, upsells, checkout, and surveys — routing to the right capability based on guest intent.',
  status: 'active',
  triggers: [
    {
      id: 'trig-fd-1',
      intent: 'Guest sends message on any channel',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: true },
        { channel: 'email', enabled: false },
        { channel: 'booking-com', enabled: true },
        { channel: 'expedia', enabled: true },
        { channel: 'webchat', enabled: true },
      ],
    },
  ],
  connections: [conn.pms, conn.kb, conn.payment, conn.hotsos, cn(conn.twilio, { status: 'setup-required' }), cn(conn.sendgrid, { status: 'setup-required' })],
  capabilities: CANARY_PRODUCTS.map((p) => ({
    ...p,
    enabled: ['prod-messages', 'prod-checkin', 'prod-checkout', 'prod-upsells', 'prod-knowledge-base'].includes(p.id),
  })),
  workflow: fdWorkflowBooking,
  workflows: [fdWorkflowBooking, fdWorkflowFAQ, fdWorkflowServiceTicket, fdWorkflowUpsell, fdWorkflowCheckout, fdWorkflowSurvey, fdWorkflowEscalation],
  tone: 'Natural',
  metrics: {
    totalConversations: 2341,
    resolutionRate: 91,
    avgResponseTime: '22 sec',
    satisfactionScore: 4.5,
    heroStat: { label: 'Avg. Response Time', value: '22 sec', subtitle: 'Across all capabilities' },
    cards: [
      { label: 'Messages Handled', value: '2,341', subtitle: 'this month' },
      { label: 'Resolution Rate', value: '91%', subtitle: 'without staff handoff' },
      { label: 'Capabilities Used', value: '5', subtitle: 'Bookings, FAQ, Tickets, Upsells, Checkout' },
      { label: 'Satisfaction', value: '4.5/5', subtitle: 'from guest surveys' },
    ],
  },
  recentActivity: [
    { time: '10:30 AM', description: 'Answered FAQ about pool hours for Room 602 via WhatsApp.' },
    { time: '10:12 AM', description: 'Processed room upgrade request for Room 815 — Executive Suite, $45/night.' },
    { time: '9:55 AM', description: 'Created service ticket for Room 203 — noise complaint, routed to security.' },
    { time: '9:40 AM', description: 'Handled checkout request for Room 1104 — folio sent via SMS.' },
    { time: '9:18 AM', description: 'Escalated to front desk — guest in Room 507 requesting rate adjustment (staff-only topic).' },
  ],
  createdAt: '2026-01-10',
  rules: [
    { id: 'fd-r1', condition: 'IF safety or emergency issue', action: 'Escalate to staff immediately — do not attempt AI resolution', enabled: true },
    { id: 'fd-r2', condition: 'IF rate or billing dispute', action: 'Route to front desk manager — staff-only topic', enabled: true },
    { id: 'fd-r3', condition: 'IF guest is VIP or loyalty elite', action: 'Use premium tone, prioritize response, CC guest services manager', enabled: true },
    { id: 'fd-r4', condition: 'IF OTA guest with booking.com or Expedia', action: 'Include OTA-specific policies in response', enabled: true },
    { id: 'fd-r5', condition: 'DEFAULT', action: 'Respond via matched capability with standard tone', enabled: true },
  ],
  responsibilities: [
    'Handle all in-stay guest messaging across SMS, WhatsApp, Booking.com, and Expedia',
    'Answer guest questions about hotel amenities, policies, and local area using knowledge base',
    'Process room bookings and check availability in PMS',
    'Create and track service tickets for maintenance and housekeeping requests',
    'Present and process upsell offers (late checkout, room upgrades, amenities)',
    'Handle checkout requests and send folios',
    'Collect post-stay survey responses',
    'Escalate complex issues or frustrated guests to front desk staff',
  ],
  behavioralGuidelines: 'You are the hotel\'s primary messaging agent — guests expect fast, helpful responses on any topic. Match the guest\'s tone. Use the knowledge base first before escalating. If you don\'t know the answer, say so honestly and offer to connect them with staff. Never make up information about rates, availability, or policies.',
  avoidedTopics: ['Rate negotiations or price matching', 'Staff complaints or internal issues', 'Other guests\' information', 'Legal or liability topics'],
};

// ---------------------------------------------------------------------------
// Check-in Processing Agent (Pressure Test #4 — REVISED)
// Automates STAFF's post-submission workflow — not the guest's check-in form.
// Eliminates the double-work of processing in both Canary AND PMS.
// ---------------------------------------------------------------------------

// Individual check-in processing workflows
const ciWorkflowProcessSubmission: AgentWorkflow = {
  id: 'wf-ci-process',
  name: 'Process Submission',
  description: 'Validates check-in data, syncs to PMS, and auto-marks verified if all checks pass.',
  trigger: 'Check-in Submitted',
  triggerDescription: 'Guest completes and submits their pre-arrival check-in form.',
  steps: [
    { id: 'cip-s1', type: 'action', label: 'Validate Completeness', description: 'Check that all required fields are filled — registration card, payment (if required), ID (if required).',
      conditions: [
        { id: 'cip-c1', condition: 'If all required steps complete', action: 'Proceed to PMS sync' },
        { id: 'cip-c2', condition: 'If partially submitted (missing required steps)', action: 'Flag as incomplete — send guest a reminder to finish' },
        { id: 'cip-c11', condition: 'If non-prepaid rate and no deposit captured', action: 'Flag for deposit collection — Statler requires $100/night hold for non-prepaid rates' },
      ],
    },
    { id: 'cip-s2', type: 'action', label: 'Sync to PMS', description: 'Push registration card data, payment method, and guest details to Oracle Opera PMS via gateway API.',
      conditions: [
        { id: 'cip-c3', condition: 'If auto-post enabled and sync succeeds', action: 'Log CTL confirmation and proceed' },
        { id: 'cip-c4', condition: 'If auto-post enabled and sync fails', action: 'Retry once, then alert front desk with error details' },
        { id: 'cip-c5', condition: 'If auto-post not enabled', action: 'Flag for staff to manually enter in Oracle Opera' },
      ],
    },
    { id: 'cip-s3', type: 'action', label: 'Auto-verify Eligibility', description: 'Check if submission qualifies for automatic check-in — valid ID, deposit captured, no flags.',
      conditions: [
        { id: 'cip-c6', condition: 'If all verifications pass', action: 'Auto-mark as Verified (ready for check-in)' },
        { id: 'cip-c7', condition: 'If any verification pending', action: 'Hold in Submitted status until resolved' },
        { id: 'cip-c8', condition: 'If issues detected (failed ID, declined payment)', action: 'Flag for front desk review with specific issue noted' },
        { id: 'cip-c12', condition: 'If Diamond Elite guest', action: 'Priority auto-verify — assign high floor room (10th floor+) if available' },
        { id: 'cip-c13', condition: 'If ADA accessibility noted on reservation', action: 'Restrict room assignment to 2nd floor ADA-accessible rooms' },
      ],
    },
    { id: 'cip-s4', type: 'response', label: 'Notify Staff', description: 'Send notification to hotel staff with submission summary and any required actions.',
      conditions: [
        { id: 'cip-c9', condition: 'If auto-verified (no issues)', action: 'Low-priority notification — submission processed successfully' },
        { id: 'cip-c10', condition: 'If flags or exceptions', action: 'High-priority alert with specific items needing attention' },
      ],
    },
  ],
  guardrails: ['Log every PMS sync attempt for audit trail.', 'Never auto-verify if ID verification is pending or failed.', 'Always notify staff of exceptions — never silently skip.', 'Statler requires $100/night deposit hold for all non-prepaid rate codes.', 'Diamond Elite guests get priority processing and high-floor room assignment.'],
};

const ciWorkflowIdReview: AgentWorkflow = {
  id: 'wf-ci-id',
  name: 'ID Verification Review',
  description: 'Auto-validates ID documents from OCR results, checks expiry and document type, flags issues for manual review.',
  trigger: 'ID Document Submitted',
  triggerDescription: 'Guest uploads ID photos or completes OCR scan during check-in.',
  steps: [
    { id: 'cid-s1', type: 'action', label: 'Validate OCR Results', description: 'Check extracted data — name match, document type accepted (US passport, driver\'s license, state ID), issue/expiry dates valid.',
      conditions: [
        { id: 'cid-c1', condition: 'If OCR extraction successful and all fields match', action: 'Auto-approve ID verification' },
        { id: 'cid-c2', condition: 'If name mismatch between ID and reservation', action: 'Flag for staff review — possible different guest' },
        { id: 'cid-c3', condition: 'If document is expired', action: 'Reject and request new document from guest' },
        { id: 'cid-c4', condition: 'If manual upload (no OCR)', action: 'Queue for staff visual review' },
        { id: 'cid-c7', condition: 'If document type not accepted (e.g., student ID, library card)', action: 'Reject — only US passport, driver\'s license, or state-issued photo ID accepted per Statler policy' },
        { id: 'cid-c8', condition: 'If international passport without US visa', action: 'Accept for tourist stays under 90 days — flag if stay exceeds 90 days for compliance review' },
      ],
    },
    { id: 'cid-s2', type: 'action', label: 'Push to PMS', description: 'Post verified identity and document information to Oracle Opera PMS guest profile.',
      conditions: [
        { id: 'cid-c5', condition: 'If passport with visa info', action: 'Include visa details in PMS posting' },
        { id: 'cid-c6', condition: 'If local ID (driver\'s license or state ID)', action: 'Post ID number, state of issue, and document type' },
      ],
    },
  ],
  guardrails: ['Never auto-approve if name does not match reservation.', 'Always store document images for compliance — never delete before checkout.', 'Accepted documents: US passport, driver\'s license, state-issued photo ID, international passport.'],
};

const ciWorkflowPayment: AgentWorkflow = {
  id: 'wf-ci-payment',
  name: 'Payment Reconciliation',
  description: 'Syncs deposit to PMS, handles failed payments, and processes refunds when needed.',
  trigger: 'Deposit Captured or Failed',
  triggerDescription: 'Payment gateway returns result after guest submits credit card during check-in.',
  steps: [
    { id: 'cipay-s1', type: 'action', label: 'Verify Deposit Status', description: 'Check Stripe payment intent status — fulfilled, pending, or failed. Statler requires $100/night hold for non-prepaid rates.',
      conditions: [
        { id: 'cipay-c1', condition: 'If deposit captured successfully', action: 'Sync deposit amount and card token to Oracle Opera PMS' },
        { id: 'cipay-c2', condition: 'If deposit pending', action: 'Monitor and retry — sync once confirmed' },
        { id: 'cipay-c3', condition: 'If deposit failed after max retries', action: 'Flag reservation for front desk collection on arrival' },
        { id: 'cipay-c6', condition: 'If prepaid rate (PROMO, ADVANCE, PKG)', action: 'Skip deposit hold — payment already captured at booking' },
        { id: 'cipay-c7', condition: 'If deposit amount does not match $100/night requirement', action: 'Recalculate and re-authorize for correct hold amount' },
      ],
    },
    { id: 'cipay-s2', type: 'action', label: 'Sync to PMS', description: 'Post payment method and deposit record to Oracle Opera PMS so front desk sees it on arrival.',
      conditions: [
        { id: 'cipay-c4', condition: 'If PMS accepts payment posting', action: 'Mark payment as reconciled' },
        { id: 'cipay-c5', condition: 'If PMS rejects (duplicate, format error)', action: 'Log error and flag for staff to manually enter' },
      ],
    },
  ],
  guardrails: ['Never store raw card numbers — only tokenized references via Stripe.', 'Log all payment attempts for PCI compliance.', 'Statler deposit policy: $100/night hold for non-prepaid rates (BAR, CORP, AAA, GOV, RACK, LEISURE, WEEKEND).'],
};

const ciWorkflowRoomAssignment: AgentWorkflow = {
  id: 'wf-ci-room',
  name: 'Room Assignment & Key',
  description: 'Fetches room assignment from PMS, updates Canary, generates mobile key, and notifies guest.',
  trigger: 'Room Assigned in PMS',
  triggerDescription: 'PMS webhook or polling detects that a room number has been assigned to the reservation.',
  steps: [
    { id: 'ciroom-s1', type: 'action', label: 'Fetch Room Assignment', description: 'Pull room number from Oracle Opera PMS and update the Canary check-in record.',
      conditions: [
        { id: 'ciroom-c1', condition: 'If room matches requested type', action: 'Accept assignment and proceed' },
        { id: 'ciroom-c2', condition: 'If room is out-of-order or not ready', action: 'Alert housekeeping (ext. 310) and hold key generation' },
        { id: 'ciroom-c5', condition: 'If Diamond Elite guest', action: 'Assign high floor (10th floor+) with city view when available' },
        { id: 'ciroom-c6', condition: 'If ADA accommodation on reservation', action: 'Restrict to 2nd floor ADA-accessible rooms only' },
        { id: 'ciroom-c7', condition: 'If Platinum Elite guest', action: 'Prefer upper floors (6th+) — do not assign ground floor unless requested' },
      ],
    },
    { id: 'ciroom-s2', type: 'action', label: 'Generate Mobile Key', description: 'Trigger mobile key creation via Vostio integration and prepare for Apple/Google Wallet delivery.',
      conditions: [
        { id: 'ciroom-c3', condition: 'If Vostio mobile key enabled', action: 'Generate key via Vostio API and add to Apple/Google Wallet' },
        { id: 'ciroom-c4', condition: 'If mobile key not enabled or Vostio unavailable', action: 'Skip — guest will get physical key at front desk' },
      ],
    },
    { id: 'ciroom-s3', type: 'response', label: 'Notify Guest', description: 'Send guest their room number, Vostio mobile key link, and Statler arrival instructions (151 W 54th St entrance) via SMS/email.',
    },
    { id: 'ciroom-s4', type: 'action', label: 'Mark Checked In', description: 'Update check-in status to Checked In in Canary. Complete the check-in lifecycle.',
    },
  ],
  guardrails: ['Never assign a room that is out of order.', 'Always confirm room readiness with housekeeping status before sending key.', 'Diamond Elite: floors 10+ with city view. Platinum Elite: floors 6+. ADA: 2nd floor only.', 'Mobile keys generated via Vostio — verify Vostio API status before issuing.'],
};

const ciWorkflowUpsells: AgentWorkflow = {
  id: 'wf-ci-upsells',
  name: 'Upsell Processing',
  description: 'Auto-processes accepted upsells — applies upgrades to PMS reservation and captures additional payment.',
  trigger: 'Upsell Accepted During Check-in',
  triggerDescription: 'Guest accepts a room upgrade, early check-in, late checkout, or add-on during the check-in flow.',
  steps: [
    { id: 'ciup-s1', type: 'action', label: 'Validate Availability', description: 'Confirm the accepted upsell is still available (room type, time slot) at time of processing.',
      conditions: [
        { id: 'ciup-c1', condition: 'If still available', action: 'Proceed to apply' },
        { id: 'ciup-c2', condition: 'If no longer available (sold out since guest checked in)', action: 'Notify guest of unavailability, process refund via Stripe if pre-charged' },
        { id: 'ciup-c6', condition: 'If Diamond Elite guest requests late checkout', action: 'Complimentary late checkout until 2 PM — no charge, apply directly' },
      ],
    },
    { id: 'ciup-s2', type: 'action', label: 'Apply to PMS', description: 'Update the reservation in Oracle Opera with the upgrade — new room type, early arrival time, or late departure.',
      conditions: [
        { id: 'ciup-c3', condition: 'If room upgrade (Standard King → Deluxe Double or Executive Suite)', action: 'Change room type in PMS, adjust rate (from $45/night for upgrade)' },
        { id: 'ciup-c4', condition: 'If early check-in', action: 'Update arrival time in PMS, notify housekeeping (ext. 310) for early room prep' },
        { id: 'ciup-c5', condition: 'If late checkout', action: 'Update departure time to 2 PM in PMS, apply $50 fee unless Diamond Elite' },
      ],
    },
    { id: 'ciup-s3', type: 'action', label: 'Capture Payment', description: 'Charge the additional amount for the upsell to the guest\'s card on file via Stripe.' },
    { id: 'ciup-s4', type: 'response', label: 'Confirm to Guest', description: 'Send confirmation of the upsell with updated Statler reservation details — new room type, check-in time, or checkout time.' },
  ],
  guardrails: ['Never charge for an upsell that cannot be fulfilled.', 'Always confirm room availability before applying upgrade in PMS.', 'Notify housekeeping (ext. 310) immediately for early check-in requests.', 'Diamond Elite late checkout until 2 PM is always complimentary — never charge.'],
};

const checkInAgent: Agent = {
  id: 'agent-checkin',
  name: 'Check-in Processing Agent',
  role: 'Post-Submission Processor',
  description: 'Automates the hotel staff workflow after guests submit pre-arrival check-in — PMS sync, ID review, payment reconciliation, room assignment, and upsell processing. Eliminates the double-work of managing both Canary and PMS.',
  status: 'active',
  triggers: [
    {
      id: 'trig-ci-1',
      intent: 'Guest submits pre-arrival check-in',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  connections: [conn.pms, conn.payment, conn.vostio, conn.kb, conn.dormakaba],
  capabilities: CANARY_PRODUCTS.map((p) => ({
    ...p,
    enabled: ['prod-checkin', 'prod-upsells', 'prod-authorizations', 'prod-messages', 'prod-knowledge-base'].includes(p.id),
  })),
  workflow: ciWorkflowProcessSubmission,
  workflows: [ciWorkflowProcessSubmission, ciWorkflowIdReview, ciWorkflowPayment, ciWorkflowRoomAssignment, ciWorkflowUpsells],
  tone: '',
  metrics: {
    totalConversations: 1856,
    resolutionRate: 94,
    avgResponseTime: '< 1 min',
    satisfactionScore: 0,
    heroStat: { label: 'Auto-Verify Rate', value: '94%', subtitle: 'Submissions processed without staff intervention' },
    cards: [
      { label: 'Submissions Processed', value: '1,856', subtitle: 'this month' },
      { label: 'Auto-Verified', value: '94%', subtitle: 'no staff review needed' },
      { label: 'PMS Sync Success', value: '98.7%', subtitle: '24 retries this month' },
      { label: 'Deposit Capture Rate', value: '97%', subtitle: '56 failed, 41 recovered' },
    ],
  },
  recentActivity: [
    { time: '11:02 AM', description: 'Auto-verified submission for Res #CTL-44218 — ID passed, deposit synced to PMS, marked ready.' },
    { time: '10:45 AM', description: 'Applied room upgrade for Res #CTL-38901 — Standard → Deluxe, $45/night captured, PMS updated.' },
    { time: '10:20 AM', description: 'Flagged Res #CTL-41557 — deposit failed 3x, marked for front desk collection on arrival.' },
    { time: '9:58 AM', description: 'Mobile key generated for Room 718 — sent via Apple Wallet, guest notified via SMS.' },
    { time: '9:30 AM', description: 'ID name mismatch for Res #CTL-39204 — flagged for staff visual review.' },
  ],
  createdAt: '2026-01-05',
  rules: [
    { id: 'ci-r1', condition: 'IF VIP or Diamond loyalty tier', action: 'Priority processing — auto-verify and assign best available room', enabled: true },
    { id: 'ci-r2', condition: 'IF group booking (10+ rooms)', action: 'Route to group coordinator — do not auto-process individually', enabled: true },
    { id: 'ci-r3', condition: 'IF PMS sync fails twice', action: 'Alert front desk immediately — do not silently retry', enabled: true },
    { id: 'ci-r4', condition: 'DEFAULT', action: 'Auto-process per hotel check-in configuration', enabled: true },
  ],
  responsibilities: [
    'Validate completeness of guest check-in submissions (registration card, ID, payment)',
    'Sync registration data and payment methods to Oracle Opera PMS',
    'Auto-verify eligible submissions (valid ID, deposit captured, no flags)',
    'Process ID verification via OCR — validate name match, document type, expiry',
    'Reconcile deposits — sync successful payments, flag failures for front desk',
    'Assign rooms and generate mobile keys when PMS room assignment is ready',
    'Process upsells accepted during check-in (upgrades, early arrival, late checkout)',
  ],
  behavioralGuidelines: 'This is a backend automation agent — no direct guest communication. Process every submission as fast as possible. Never auto-verify if ID verification is pending or failed. Always log PMS sync attempts for audit trail. Alert staff immediately on any failure that blocks a guest from checking in.',
  avoidedTopics: [],
};

const salesEventsAgent: Agent = {
  id: 'agent-sales-events',
  name: 'Sales & Events Agent',
  role: 'Sales & Events Coordinator',
  description: 'Responds to group booking and event inquiries. Qualifies leads, checks availability, and schedules meetings.',
  status: 'active',
  triggers: [
    {
      id: 'trig-se-1',
      intent: 'Sales inquiry received',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: false },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
    {
      id: 'trig-se-2',
      intent: 'Event booking follow-up',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  connections: [conn.pms, conn.sendgrid, conn.kb, cn(conn.crm, { status: 'setup-required' }), cn(conn.calendar, { status: 'setup-required' }), conn.payment],
  capabilities: allProductsWithEnabled(['prod-messages', 'prod-contracts', 'prod-payment-links', 'prod-knowledge-base']),
  workflow: {
    id: 'wf-sales-inquiry',
    name: 'Sales Inquiry Response',
    description: 'Responds to inbound event and group booking inquiries with availability, proposals, and meeting scheduling.',
    trigger: 'Receive Inquiry',
    triggerDescription: 'Incoming email detected in sales inbox. Extract sender, subject, body.',
    steps: [
      {
        id: 'se-s1', type: 'action', label: 'Parse Details',
        description: 'Identify event type, dates, headcount, budget, and contact info. Classify lead urgency.',
        conditions: [
          { id: 'cond-q1', condition: 'If missing critical info (dates or headcount)', action: 'Reply asking for details before proceeding' },
          { id: 'cond-q2', condition: 'If spam or irrelevant inquiry', action: 'Archive, don\'t respond' },
          { id: 'cond-q3', condition: 'If urgent (event within 30 days)', action: 'Flag as priority, expedite response — CC Director of Sales Sarah Kim' },
          { id: 'cond-q4', condition: 'If headcount > 200', action: 'Route to Sarah Kim directly — Grand Ballroom max capacity applies (200 seated, 350 cocktail)' },
          { id: 'cond-q5', condition: 'If wedding inquiry for Saturday', action: 'Check 12+ month advance calendar — Saturdays at The Statler book over a year out' },
        ],
      },
      {
        id: 'se-s2', type: 'action', label: 'Check Availability',
        description: 'Query PMS for room block and event space availability — Grand Ballroom (200 seated / 350 cocktail), Breakout Room A (30 pax), Breakout Room B (25 pax), Library Room (36 seated).',
        conditions: [
          { id: 'cond-a1', condition: 'If fully available', action: 'Continue with full availability summary including venue capacities' },
          { id: 'cond-a2', condition: 'If partial overlap', action: 'Suggest alternative dates or adjusted room block' },
          { id: 'cond-a3', condition: 'If completely unavailable', action: 'Suggest nearest available dates' },
          { id: 'cond-a4', condition: 'If headcount fits Breakout Rooms only (under 30)', action: 'Recommend Breakout Room A (30 pax) or B (25 pax) — more intimate, lower F&B minimum' },
          { id: 'cond-a5', condition: 'If wedding with 100+ guests', action: 'Grand Ballroom or Starlight Terrace only — include wedding coordinator availability note' },
        ],
      },
      {
        id: 'se-s3', type: 'response', label: 'Draft Response',
        description: 'Compose personalized response based on inquiry type, venue fit, and availability.',
        conditions: [
          { id: 'cond-d1', condition: 'If inquiry is detailed', action: 'Generate mini-proposal with venue, catering minimums ($85/person plated, $65 buffet), and highlights' },
          { id: 'cond-d2', condition: 'If inquiry is vague', action: 'Lead with clarifying questions — dates, headcount, event type, budget range' },
          { id: 'cond-d3', condition: 'If budget > $50K', action: 'Use VIP template, CC General Manager' },
          { id: 'cond-d4', condition: 'If wedding inquiry', action: 'Include Statler wedding coordinator availability, mention Bridal Suite, and note Saturday lead time (12+ months)' },
        ],
      },
      { id: 'se-s4', type: 'action', label: 'Send Response', description: 'Deliver email with CTA to schedule a meeting or site visit with Director of Sales Sarah Kim.' },
      {
        id: 'se-s5', type: 'action', label: 'Follow Up',
        description: 'Automated follow-up cadence based on lead type and urgency.',
        conditions: [
          { id: 'cond-f1', condition: 'If corporate event', action: 'Follow up in 48 hours, then weekly' },
          { id: 'cond-f2', condition: 'If wedding', action: 'Follow up in 1 week, monthly touchpoints — reference wedding coordinator Sarah Kim' },
          { id: 'cond-f3', condition: 'If no response after 2nd follow-up', action: 'Handoff to Sarah Kim and sales team with full inquiry context' },
        ],
      },
    ],
    guardrails: [
      'Never commit to final rates without revenue manager approval.',
      'Always include cancellation policy in proposals.',
      'Flag events over $50K for Director of Sales Sarah Kim.',
      'Catering minimums: $85/person plated, $65/person buffet — never quote below without approval.',
      'Grand Ballroom max: 200 seated / 350 cocktail. Do not overbook.',
      'Saturday weddings require 12+ month lead time — set expectations early.',
    ],
  },
  tone: 'Formal',
  metrics: {
    totalConversations: 89,
    resolutionRate: 92,
    avgResponseTime: '2.1 min',
    satisfactionScore: 0,
    heroStat: { label: 'Avg. Response Time', value: '2.1 min', subtitle: 'Industry avg: 4.2 hours' },
    cards: [
      { label: 'Inquiries Handled', value: '89', subtitle: 'this month' },
      { label: 'Proposals Sent', value: '73', subtitle: '82% conversion to proposal' },
      { label: 'Meetings Scheduled', value: '31', subtitle: '42% of proposals' },
      { label: 'Revenue Pipeline', value: '$2.4M', subtitle: 'active proposals' },
    ],
  },
  recentActivity: [
    { time: '15 min ago', description: 'Responded to corporate retreat inquiry from Sarah Chen — 45 guests, Apr 15-17.' },
    { time: '1 hr ago', description: 'Sent follow-up to James Rodriguez — wedding reception site visit scheduled.' },
    { time: '2 hr ago', description: 'Handed off multi-venue request from Lisa Park to sales team.' },
  ],
  createdAt: '2026-03-01',
  rules: [
    { id: 'se-r1', condition: 'IF event value > $50K', action: 'Require Director of Sales approval before sending proposal', enabled: true },
    { id: 'se-r2', condition: 'IF wedding inquiry', action: 'Always mention wedding coordinator availability and include venue photos', enabled: true },
    { id: 'se-r3', condition: 'IF returning corporate client', action: 'Reference past booking history, offer loyalty rate', enabled: true },
    { id: 'se-r4', condition: 'DEFAULT', action: 'Respond within 5 minutes, include CTA to schedule meeting or site visit', enabled: true },
  ],
  responsibilities: [
    'Monitor sales inbox for event and group booking inquiries',
    'Parse inquiry details — event type, dates, headcount, budget, contact info',
    'Check room block and event space availability in PMS',
    'Draft and send personalized proposals with venue details and pricing',
    'Schedule meetings and site visits via calendar integration',
    'Follow up on cold leads with progressive outreach cadence',
    'Prepare contracts after meetings with deposit schedules and terms',
  ],
  behavioralGuidelines: 'Respond to every inquiry within 5 minutes — speed wins deals. Be consultative, not transactional. Ask clarifying questions when details are missing rather than guessing. Always include a CTA (schedule a call, book a site visit). Never quote final rates without revenue manager approval — use "starting from" language.',
  avoidedTopics: ['Competitor comparisons or disparagement', 'Final pricing without revenue manager approval', 'Guarantees about date availability beyond 48 hours', 'Internal revenue targets or occupancy rates'],
};
salesEventsAgent.workflows = [salesEventsAgent.workflow, mockWorkflowColdLead, mockWorkflowContractPrep];

export const mockAgents: Agent[] = [alex, salesEventsAgent, riley, serviceTicketAgent, frontDeskAgent, checkInAgent];

// ---------------------------------------------------------------------------
// Agent Templates
// ---------------------------------------------------------------------------

const templateFrontDesk: AgentTemplate = {
  id: 'tpl-front-desk',
  name: 'Front Desk Agent',
  role: 'Guest Communication Orchestrator',
  description:
    'Manages all guest messaging across SMS, WhatsApp, and OTA channels. Handles bookings, FAQ, service requests, upsells, checkout, and surveys.',
  icon: 'mdiDeskLampOn',
  tier: 'included',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-fd-1',
      intent: 'Guest sends message on any channel',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: true },
        { channel: 'email', enabled: false },
        { channel: 'booking-com', enabled: true },
        { channel: 'expedia', enabled: true },
        { channel: 'webchat', enabled: true },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb, conn.payment, conn.hotsos, cn(conn.twilio, { status: 'needed' }), cn(conn.sendgrid, { status: 'needed' })],
  defaultCapabilities: ['prod-messages', 'prod-checkin', 'prod-checkout', 'prod-upsells', 'prod-knowledge-base'],
  defaultWorkflow: fdWorkflowBooking,
  defaultTone: 'Natural',
  defaultRules: [
    { id: 'fd-r1', condition: 'IF safety or emergency issue', action: 'Escalate to staff immediately — do not attempt AI resolution', enabled: true },
    { id: 'fd-r2', condition: 'IF rate or billing dispute', action: 'Route to front desk manager — staff-only topic', enabled: true },
    { id: 'fd-r3', condition: 'IF guest is VIP or loyalty elite', action: 'Use premium tone, prioritize response, CC guest services manager', enabled: true },
    { id: 'fd-r4', condition: 'IF OTA guest with booking.com or Expedia', action: 'Include OTA-specific policies in response', enabled: true },
    { id: 'fd-r5', condition: 'DEFAULT', action: 'Respond via matched capability with standard tone', enabled: true },
  ],
};

const templateReservations: AgentTemplate = {
  id: 'tpl-reservations',
  name: 'Reservations Agent',
  role: 'Reservations Specialist',
  description:
    'Manages reservation inquiries, bookings, modifications, and cancellations across all channels.',
  icon: 'mdiCalendarCheckOutline',
  tier: 'included',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-res-1',
      intent: 'Reservation inquiry received',
      channels: [
        { channel: 'voice', enabled: true },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: true },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: true },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb],
  defaultCapabilities: ['prod-messages', 'prod-calls', 'prod-checkin', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'Reservation inquiry received',
    steps: [
      { id: 'res-s1', type: 'condition', label: 'Identify request type', description: 'Determine if the guest wants to book, modify, or cancel.' },
      { id: 'res-s2', type: 'action', label: 'Check availability', description: 'Query the PMS for room availability and rates.' },
      { id: 'res-s3', type: 'response', label: 'Present options', description: 'Share available rooms, rates, and packages with the guest.' },
      { id: 'res-s4', type: 'action', label: 'Process booking', description: 'Create, modify, or cancel the reservation in the PMS.' },
      { id: 'res-s5', type: 'response', label: 'Send confirmation', description: 'Email or text the booking confirmation to the guest.' },
    ],
    guardrails: [
      'Always confirm dates, room type, and rate before finalising.',
      'Apply cancellation policy accurately and inform the guest.',
      'Never override rate restrictions without manager approval.',
    ],
  },
  defaultTone: 'Natural',
};

const templateConcierge: AgentTemplate = {
  id: 'tpl-concierge',
  name: 'Concierge Agent',
  role: 'Digital Concierge',
  description:
    'Provides local recommendations, activity bookings, restaurant reservations, and transportation arrangements.',
  icon: 'mdiMapMarkerOutline',
  tier: 'included',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-con-1',
      intent: 'Guest asks for recommendation or booking',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: true },
        { channel: 'email', enabled: false },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: true },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb],
  defaultCapabilities: ['prod-messages', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'Guest asks for a recommendation or booking',
    steps: [
      { id: 'con-s1', type: 'condition', label: 'Understand preferences', description: 'Ask about cuisine type, budget, distance, group size, or activity interest.' },
      { id: 'con-s2', type: 'action', label: 'Search recommendations', description: 'Query the knowledge base and partner directory for matching options.' },
      { id: 'con-s3', type: 'response', label: 'Present options', description: 'Share curated options with descriptions, distance, and pricing.' },
      { id: 'con-s4', type: 'action', label: 'Make booking', description: 'Reserve the selected restaurant, activity, or transport on behalf of the guest.' },
      { id: 'con-s5', type: 'response', label: 'Confirm details', description: 'Send confirmation with time, address, and any preparation tips.' },
    ],
    guardrails: [
      'Only recommend verified partner establishments.',
      'Disclose if a recommendation is a paid partnership.',
      'Confirm guest allergies or accessibility needs before restaurant bookings.',
    ],
  },
  defaultTone: 'Natural',
};

const templateGuestMessaging: AgentTemplate = {
  id: 'tpl-guest-messaging',
  name: 'Guest Messaging Agent',
  role: 'Guest Messaging Specialist',
  description:
    'Handles all guest messaging across SMS, WhatsApp, email, and OTA platforms.',
  icon: 'mdiMessageTextOutline',
  tier: 'included',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-gm-1',
      intent: 'New guest message on any channel',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: true },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: true },
        { channel: 'expedia', enabled: true },
        { channel: 'webchat', enabled: true },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb],
  defaultCapabilities: ['prod-messages', 'prod-upsells', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'New guest message on any channel',
    steps: [
      { id: 'gm-s1', type: 'condition', label: 'Detect channel & language', description: 'Identify the message source and guest language.' },
      { id: 'gm-s2', type: 'action', label: 'Load guest context', description: 'Pull reservation, preferences, and conversation history from the PMS.' },
      { id: 'gm-s3', type: 'condition', label: 'Classify intent', description: 'Categorise as question, request, complaint, or general chat.' },
      { id: 'gm-s4', type: 'response', label: 'Compose response', description: 'Draft a response matching the channel tone and guest language.' },
      { id: 'gm-s5', type: 'handoff', label: 'Escalate if needed', description: 'Transfer to a staff member for complex or sensitive issues.' },
    ],
    guardrails: [
      'Match the language the guest writes in.',
      'Keep OTA responses within platform character limits.',
      'Never share guest details across different reservations.',
    ],
  },
  defaultTone: 'Natural',
};

const templateVoiceAI: AgentTemplate = {
  id: 'tpl-voice-ai',
  name: 'Voice AI Agent',
  role: 'Inbound Call Handler',
  description:
    'Answers inbound hotel calls with AI. Handles guest questions, reservation lookups, call transfers, and sends follow-up SMS.',
  icon: 'mdiPhoneOutline',
  tier: 'core',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-va-1',
      intent: 'Inbound phone call',
      channels: [
        { channel: 'voice', enabled: true },
        { channel: 'sms', enabled: false },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: false },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  defaultConnections: [conn.twilio, conn.pms, conn.kb, cn(conn.sendgrid, { status: 'needed' })],
  defaultCapabilities: ['prod-messages', 'prod-calls', 'prod-checkin', 'prod-knowledge-base'],
  defaultWorkflow: {
    id: 'wf-voice-main',
    name: 'Inbound Call Handler',
    description: 'Handles inbound calls — greets, identifies guest, routes to abilities, transfers or resolves.',
    trigger: 'Inbound Call Received',
    triggerDescription: 'Guest calls the hotel phone number routed through Canary Voice.',
    steps: [
      { id: 'va-s1', type: 'response', label: 'Greet Caller', description: 'Welcome guest with personalized greeting if identified, generic if not.',
        conditions: [
          { id: 'va-c1', condition: 'If guest identified by phone number', action: 'Use personalized welcome with name and reservation reference' },
          { id: 'va-c2', condition: 'If unknown caller', action: 'Use standard hotel greeting — "Thank you for calling The Statler, how can I help?"' },
        ],
      },
      { id: 'va-s2', type: 'action', label: 'Identify Intent', description: 'Determine what the caller needs — information, reservation, transfer, or service.',
        conditions: [
          { id: 'va-c3', condition: 'If reservation question', action: 'Look up reservation in PMS by phone number, name, or confirmation number' },
          { id: 'va-c4', condition: 'If FAQ or hotel info', action: 'Search knowledge base for matching answer' },
          { id: 'va-c5', condition: 'If requesting specific department', action: 'Prepare transfer to requested department' },
          { id: 'va-c6', condition: 'If reporting issue', action: 'Gather details and create service ticket' },
        ],
      },
      { id: 'va-s3', type: 'action', label: 'Execute Ability', description: 'Run the matched voice ability — KB answer, reservation lookup, booking link, or call transfer.',
        conditions: [
          { id: 'va-c7', condition: 'If answer found in KB', action: 'Respond verbally with the answer' },
          { id: 'va-c8', condition: 'If reservation found', action: 'Read back reservation details — dates, room type, confirmation number' },
          { id: 'va-c9', condition: 'If needs booking', action: 'Offer to text a booking link to the caller\'s phone' },
          { id: 'va-c10', condition: 'If complex request beyond abilities', action: 'Prepare transfer with context summary for staff' },
        ],
      },
      { id: 'va-s4', type: 'handoff', label: 'Transfer or Resolve', description: 'Either resolve the call or transfer to the appropriate department with a summary.',
        conditions: [
          { id: 'va-c11', condition: 'If resolved', action: 'Thank guest and end call' },
          { id: 'va-c12', condition: 'If transfer needed', action: 'Announce transfer, provide staff with call summary' },
          { id: 'va-c13', condition: 'If guest insists on human', action: 'Transfer immediately — don\'t push back more than once' },
        ],
      },
      { id: 'va-s5', type: 'response', label: 'Post-Call Follow-up', description: 'Send follow-up SMS with relevant info, booking links, or confirmation.',
        conditions: [
          { id: 'va-c14', condition: 'If booking discussed', action: 'Text booking link to caller\'s phone number' },
          { id: 'va-c15', condition: 'If information shared', action: 'Text a summary of the key details discussed' },
          { id: 'va-c16', condition: 'If guest opted out of SMS', action: 'Skip follow-up — respect preference' },
        ],
      },
    ],
    guardrails: [
      'Never share other guests\' room numbers or personal information.',
      'Always offer to transfer when the guest asks — don\'t push back more than once.',
      'Keep hold time under 30 seconds before offering callback or transfer.',
      'Never process payments or refunds over the phone — direct to secure link.',
    ],
  },
  defaultTone: 'Natural',
};

const templateSalesEvents: AgentTemplate = {
  id: 'tpl-sales-events',
  name: 'Sales & Events Agent',
  role: 'Sales & Events Coordinator',
  description:
    'Responds to group booking and event inquiries. Qualifies leads, checks availability, and schedules meetings.',
  icon: 'mdiHandshakeOutline',
  tier: 'core',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-se-1',
      intent: 'Sales inquiry received',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: false },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
    {
      id: 'trig-se-2',
      intent: 'Event booking follow-up',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  defaultConnections: [
    cn(conn.pms, { status: 'needed' }),
    cn(conn.sendgrid, { status: 'needed' }),
    conn.kb,
    cn(conn.crm, { status: 'needed' }),
    cn(conn.calendar, { status: 'optional' }),
    cn(conn.payment, { status: 'needed' }),
  ],
  defaultCapabilities: ['prod-messages', 'prod-contracts', 'prod-payment-links', 'prod-knowledge-base'],
  defaultWorkflow: {
    id: 'wf-sales-inquiry',
    name: 'Sales Inquiry Response',
    description: 'Responds to inbound event and group booking inquiries with availability, proposals, and meeting scheduling.',
    trigger: 'Receive Inquiry',
    triggerDescription: 'Incoming email detected in sales inbox. Extract sender, subject, body.',
    steps: [
      {
        id: 'se-s1',
        type: 'action',
        label: 'Parse Details',
        description: 'Identify event type, dates, headcount, budget, and contact info. Classify lead urgency.',
        conditions: [
          { id: 'cond-q1', condition: 'If missing critical info (dates or headcount)', action: 'Reply asking for details before proceeding' },
          { id: 'cond-q2', condition: 'If spam or irrelevant inquiry', action: 'Archive, don\'t respond' },
          { id: 'cond-q3', condition: 'If urgent (event within 30 days)', action: 'Flag as priority, expedite response' },
          { id: 'cond-q4', condition: 'If early-stage shopping (6+ months out)', action: 'Use warmer informational tone, set longer follow-up cadence' },
        ],
      },
      {
        id: 'se-s2',
        type: 'action',
        label: 'Check Availability',
        description: 'Query PMS for room block and event space availability for requested dates.',
        conditions: [
          { id: 'cond-a1', condition: 'If fully available', action: 'Continue with full availability summary' },
          { id: 'cond-a2', condition: 'If partial overlap with existing booking', action: 'Mention conflict, suggest alternative dates or adjusted room block' },
          { id: 'cond-a3', condition: 'If completely unavailable', action: 'Suggest nearest available dates, offer to waitlist' },
          { id: 'cond-a4', condition: 'If complex or niche request', action: 'Handoff to sales team with full context' },
        ],
      },
      {
        id: 'se-s3',
        type: 'response',
        label: 'Draft Response',
        description: 'Compose personalized response based on inquiry type and availability.',
        conditions: [
          { id: 'cond-d1', condition: 'If inquiry is detailed enough', action: 'Generate mini-proposal with availability, packages, and property highlights' },
          { id: 'cond-d2', condition: 'If inquiry is vague', action: 'Lead with clarifying questions, include property overview' },
          { id: 'cond-d3', condition: 'If event budget > $50K', action: 'Use VIP response template, CC General Manager' },
          { id: 'cond-d4', condition: 'If wedding inquiry', action: 'Include venue photos, wedding-specific language, mention coordinator' },
          { id: 'cond-d5', condition: 'If returning corporate client', action: 'Reference past booking history, offer loyalty rate' },
        ],
      },
      {
        id: 'se-s4',
        type: 'action',
        label: 'Send Response',
        description: 'Deliver email with CTA to schedule a meeting or site visit. Target: within 5 minutes of receipt.',
      },
      {
        id: 'se-s5',
        type: 'action',
        label: 'Follow Up',
        description: 'Automated follow-up cadence based on lead type and urgency.',
        conditions: [
          { id: 'cond-f1', condition: 'If corporate event', action: 'Follow up in 48 hours, then weekly until response' },
          { id: 'cond-f2', condition: 'If wedding', action: 'Follow up in 1 week, then monthly touchpoints (7-18 month cycle)' },
          { id: 'cond-f3', condition: 'If conference or citywide', action: 'Follow up in 2 weeks, long cycle' },
          { id: 'cond-f4', condition: 'If guest replied but hasn\'t booked', action: 'Send additional info, case studies, testimonials' },
          { id: 'cond-f5', condition: 'If no response after 2nd follow-up', action: 'Handoff to sales team with full context' },
          { id: 'cond-f6', condition: 'If meeting was scheduled', action: 'Send calendar confirmation and pre-meeting info packet' },
        ],
      },
    ],
    guardrails: [
      'Never commit to final rates without revenue manager approval.',
      'Always include cancellation policy in proposals.',
      'Don\'t quote specific pricing — schedule a call instead.',
      'Flag weddings and events over $50K for personal follow-up by Director of Sales.',
      'Always include a CTA to schedule a meeting or site visit.',
    ],
  },
  defaultTone: 'Formal',
  defaultRules: defaultSalesRules,
};

const templateHousekeeping: AgentTemplate = {
  id: 'tpl-housekeeping',
  name: 'Housekeeping Agent',
  role: 'Housekeeping Coordinator',
  description:
    'Manages housekeeping service requests, coordinates with vendor task systems, and sends proactive housekeeping offers to guests.',
  icon: 'mdiBroomOutline',
  tier: 'core',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-hk-1',
      intent: 'Guest reports housekeeping issue OR scheduled housekeeping check',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: true },
        { channel: 'email', enabled: false },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb, cn(conn.hotsos, { status: 'needed' }), conn.flexkeeping],
  defaultCapabilities: ['prod-messages', 'prod-knowledge-base'],
  defaultWorkflow: {
    id: 'wf-hk-request',
    name: 'Housekeeping Service Request',
    description: 'Processes guest housekeeping requests — towels, cleaning, amenities — and routes to the appropriate vendor system.',
    trigger: 'Housekeeping Request Received',
    triggerDescription: 'Guest sends a message requesting housekeeping service (towels, cleaning, minibar, etc.).',
    steps: [
      { id: 'hk-s1', type: 'action', label: 'Identify Request Type', description: 'Parse the guest message to determine the specific housekeeping need.',
        conditions: [
          { id: 'hk-c1', condition: 'If room cleaning request', action: 'Check if room is due for service today' },
          { id: 'hk-c2', condition: 'If amenity request (towels, toiletries)', action: 'Create delivery task with item list and room number' },
          { id: 'hk-c3', condition: 'If minibar restock', action: 'Route to F&B team — not housekeeping' },
          { id: 'hk-c4', condition: 'If maintenance issue (broken, leaking)', action: 'Escalate to maintenance, not housekeeping' },
        ],
      },
      { id: 'hk-s2', type: 'action', label: 'Create Task in Vendor System', description: 'Generate a housekeeping task in the hotel\'s task management system (Hotsos, Flexkeeping, etc.).',
        conditions: [
          { id: 'hk-c5', condition: 'If vendor system connected', action: 'Create task automatically with room, priority, and details' },
          { id: 'hk-c6', condition: 'If vendor system not connected', action: 'Send request to housekeeping email or phone' },
          { id: 'hk-c7', condition: 'If duplicate request for same room within 2 hours', action: 'Update existing task instead of creating new' },
        ],
      },
      { id: 'hk-s3', type: 'response', label: 'Acknowledge Guest', description: 'Confirm receipt and provide estimated completion time.',
        conditions: [
          { id: 'hk-c8', condition: 'If standard request (towels, cleaning)', action: '"We\'ll have that to you within 30 minutes."' },
          { id: 'hk-c9', condition: 'If priority request (spill, urgent)', action: '"Someone is on their way right now."' },
          { id: 'hk-c10', condition: 'If after-hours request', action: '"We\'ve noted your request for first thing in the morning."' },
        ],
      },
      { id: 'hk-s4', type: 'action', label: 'Track Completion', description: 'Monitor task status and send follow-up to guest when completed.',
        conditions: [
          { id: 'hk-c11', condition: 'If task completed within SLA', action: 'Send satisfaction check to guest' },
          { id: 'hk-c12', condition: 'If task overdue', action: 'Escalate to housekeeping supervisor' },
          { id: 'hk-c13', condition: 'If guest sends follow-up asking for status', action: 'Provide real-time update from vendor system' },
        ],
      },
    ],
    guardrails: [
      'Never enter a room without guest consent or standard check-out protocol.',
      'Route maintenance issues to maintenance, not housekeeping.',
      'Don\'t promise specific times — use estimates.',
      'Maximum 1 follow-up per completed task.',
    ],
  },
  defaultTone: 'Natural',
};

const templateServiceTask: AgentTemplate = {
  id: 'tpl-service-task',
  name: 'Service Task Agent',
  role: 'Service Request Handler',
  description:
    'Recognises service requests from guests, asks follow-up questions, creates tickets, and assigns to staff.',
  icon: 'mdiWrenchOutline',
  tier: 'core',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-st-1',
      intent: 'Guest reports an issue or makes a request',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: true },
        { channel: 'email', enabled: false },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: true },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb, cn(conn.hotsos, { status: 'needed' }), conn.flexkeeping],
  defaultCapabilities: ['prod-messages', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'Guest reports an issue or makes a request',
    steps: [
      { id: 'st-s1', type: 'condition', label: 'Categorise request', description: 'Determine if this is maintenance, amenity, or service-related.' },
      { id: 'st-s2', type: 'action', label: 'Gather details', description: 'Ask follow-up questions about location, urgency, and specifics.' },
      { id: 'st-s3', type: 'action', label: 'Create ticket', description: 'Log the request as a service ticket with priority and category.' },
      { id: 'st-s4', type: 'action', label: 'Assign to staff', description: 'Route the ticket to the appropriate department or individual.' },
      { id: 'st-s5', type: 'response', label: 'Confirm with guest', description: 'Let the guest know the request has been logged and provide an ETA.' },
      { id: 'st-s6', type: 'handoff', label: 'Follow up', description: 'Check back with the guest after the ETA to confirm resolution.' },
    ],
    guardrails: [
      'Escalate safety-related issues (e.g., water leaks, broken locks) immediately.',
      'Never promise a specific completion time — provide estimates.',
      'Log all requests even if resolved verbally.',
    ],
  },
  defaultTone: 'Natural',
};

const templateNoShow: AgentTemplate = {
  id: 'tpl-no-show',
  name: 'No-Show Prevention Agent',
  role: 'Pre-Arrival Engagement Coordinator',
  description:
    'Proactively reaches out to guests before arrival to confirm reservations, encourage pre-check-in, and reduce no-shows.',
  icon: 'mdiAccountAlertOutline',
  tier: 'core',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-ns-1',
      intent: 'Reservation arrival date approaching',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb, cn(conn.sendgrid, { status: 'needed' })],
  defaultCapabilities: ['prod-messages', 'prod-checkin', 'prod-knowledge-base'],
  defaultWorkflow: {
    id: 'wf-noshow-main',
    name: 'Pre-Arrival Outreach',
    description: 'Sends timed messages before arrival to confirm reservation and encourage pre-check-in.',
    trigger: 'Arrival Date Approaching',
    triggerDescription: 'Guest reservation arrival date is within the configured outreach window (e.g., 3 days before).',
    steps: [
      { id: 'ns-s1', type: 'response', label: 'Send Pre-Arrival Message', description: 'Send initial outreach message with check-in link and arrival information.',
        conditions: [
          { id: 'ns-c1', condition: 'If 3 days before arrival', action: 'Send pre-check-in invitation with mobile check-in link' },
          { id: 'ns-c2', condition: 'If 1 day before arrival', action: 'Send arrival details — address, parking, check-in time' },
          { id: 'ns-c3', condition: 'If day of arrival', action: 'Send "your room is almost ready" with mobile check-in CTA' },
        ],
      },
      { id: 'ns-s2', type: 'action', label: 'Monitor Engagement', description: 'Track if guest opened message, clicked check-in link, or completed check-in.',
        conditions: [
          { id: 'ns-c4', condition: 'If guest completed pre-check-in', action: 'No further outreach needed — send confirmation' },
          { id: 'ns-c5', condition: 'If guest opened but didn\'t complete', action: 'Send reminder 12 hours later' },
          { id: 'ns-c6', condition: 'If guest didn\'t open message', action: 'Try alternate channel (SMS if email, email if SMS)' },
        ],
      },
      { id: 'ns-s3', type: 'action', label: 'Escalate Non-Engagement', description: 'Flag unresponsive guests for front desk attention.',
        conditions: [
          { id: 'ns-c7', condition: 'If no engagement 4 hours before arrival', action: 'Alert front desk to confirm reservation' },
          { id: 'ns-c8', condition: 'If past check-in time with no activity', action: 'Flag as potential no-show for inventory release' },
          { id: 'ns-c9', condition: 'If guest responds to cancel', action: 'Process cancellation per hotel policy' },
        ],
      },
      { id: 'ns-s4', type: 'response', label: 'Post-Arrival Confirmation', description: 'Once guest checks in, send welcome message and property information.',
        conditions: [
          { id: 'ns-c10', condition: 'If checked in via mobile', action: 'Send mobile key and welcome info with hotel FAQ link' },
          { id: 'ns-c11', condition: 'If checked in at front desk', action: 'Send "enjoy your stay" message with property guide' },
        ],
      },
    ],
    guardrails: [
      'Maximum 3 outreach messages per reservation.',
      'Never send messages between 10 PM and 8 AM hotel time.',
      'Always include opt-out option in outreach messages.',
      'Don\'t send to OTA reservations managed by the OTA.',
    ],
  },
  defaultTone: 'Conversational',
};

const templateUpsell: AgentTemplate = {
  id: 'tpl-upsell',
  name: 'Upsell & Revenue Agent',
  role: 'Revenue Optimisation Specialist',
  description:
    'Identifies upsell opportunities, recommends upgrades, and handles promotional offers.',
  icon: 'mdiTrendingUp',
  tier: 'premium',
  isLocked: true,
  lockMessage: 'Requires Revenue Optimization add-on',
  defaultTriggers: [
    {
      id: 'trig-up-1',
      intent: 'Guest checks in or reservation is created',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: true },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb, cn(conn.payment, { status: 'needed' })],
  defaultCapabilities: ['prod-messages', 'prod-upsells', 'prod-checkin', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'Guest checks in or reservation is created',
    steps: [
      { id: 'up-s1', type: 'action', label: 'Analyse guest profile', description: 'Review loyalty tier, past spend, and stay history for upsell signals.' },
      { id: 'up-s2', type: 'condition', label: 'Identify opportunities', description: 'Match available upgrades and add-ons to the guest profile.' },
      { id: 'up-s3', type: 'response', label: 'Present offer', description: 'Send a personalised upgrade or add-on offer via the guest\'s preferred channel.' },
      { id: 'up-s4', type: 'action', label: 'Process upgrade', description: 'Apply the upgrade to the reservation and charge the differential.' },
      { id: 'up-s5', type: 'response', label: 'Confirm change', description: 'Send updated confirmation with the new room type or add-on details.' },
    ],
    guardrails: [
      'Never upsell to guests who have complained during the current stay.',
      'Cap upsell offers at 2 per stay to avoid being intrusive.',
      'Ensure upgrade pricing matches the revenue management system.',
    ],
  },
  defaultTone: 'Natural',
};

const templateFinance: AgentTemplate = {
  id: 'tpl-finance',
  name: 'Finance & Billing Agent',
  role: 'Billing & Payments Specialist',
  description:
    'Processes payments, manages invoices, handles credit card validations, and runs night audit tasks.',
  icon: 'mdiCreditCardOutline',
  tier: 'premium',
  isLocked: true,
  lockMessage: 'Requires Canary Payments add-on',
  defaultTriggers: [
    {
      id: 'trig-fin-1',
      intent: 'Payment or billing event',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: false },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb, cn(conn.payment, { status: 'needed' })],
  defaultCapabilities: ['prod-messages', 'prod-authorizations', 'prod-payment-links', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'Payment or billing event',
    steps: [
      { id: 'fin-s1', type: 'condition', label: 'Identify event type', description: 'Classify as charge, refund, card validation, invoice request, or audit flag.' },
      { id: 'fin-s2', type: 'action', label: 'Retrieve folio', description: 'Pull the guest folio and transaction history from the PMS.' },
      { id: 'fin-s3', type: 'action', label: 'Process transaction', description: 'Execute the charge, refund, or validation via the payment gateway.' },
      { id: 'fin-s4', type: 'response', label: 'Send receipt', description: 'Email the receipt or updated invoice to the guest.' },
      { id: 'fin-s5', type: 'action', label: 'Audit trail', description: 'Log every transaction with timestamp, amount, and authorisation code.' },
    ],
    guardrails: [
      'Require manager approval for refunds over $500.',
      'Never store full credit card numbers — use tokenised references.',
      'Flag discrepancies during night audit for manual review.',
    ],
  },
  defaultTone: 'Formal',
};

const templateLoyalty: AgentTemplate = {
  id: 'tpl-loyalty',
  name: 'Loyalty Program Agent',
  role: 'Loyalty & Recognition Specialist',
  description:
    'Recognises loyalty members, provides tier-specific benefits, and ensures loyalty recognition across touchpoints.',
  icon: 'mdiStarOutline',
  tier: 'premium',
  isLocked: true,
  lockMessage: 'Requires Canary Loyalty add-on',
  defaultTriggers: [
    {
      id: 'trig-loy-1',
      intent: 'Loyalty member identified or tier event triggered',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb],
  defaultCapabilities: ['prod-messages', 'prod-upsells', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'Loyalty member identified or tier event triggered',
    steps: [
      { id: 'loy-s1', type: 'action', label: 'Look up membership', description: 'Pull loyalty tier, points balance, and benefit entitlements.' },
      { id: 'loy-s2', type: 'condition', label: 'Check tier benefits', description: 'Determine which benefits apply (upgrade, late checkout, welcome amenity).' },
      { id: 'loy-s3', type: 'action', label: 'Apply benefits', description: 'Automatically apply eligible benefits to the reservation.' },
      { id: 'loy-s4', type: 'response', label: 'Welcome message', description: 'Send a personalised welcome acknowledging their loyalty status.' },
      { id: 'loy-s5', type: 'handoff', label: 'Track recognition', description: 'Log that the guest was recognised to prevent duplicate outreach.' },
    ],
    guardrails: [
      'Always recognise loyalty status — missing recognition is worse than no program.',
      'Never downgrade a benefit that was previously promised.',
      'Escalate points disputes to the loyalty program manager.',
    ],
  },
  defaultTone: 'Luxury',
};

// ---------------------------------------------------------------------------
// Backend Automation Agent — Pressure Test #1
// No guest communication. Reads emails, updates PMS, sends confirmations.
// ---------------------------------------------------------------------------

const templateEmailReservation: AgentTemplate = {
  id: 'tpl-email-reservation',
  name: 'Email Reservation Agent',
  role: 'Reservation Processor',
  description:
    'Processes reservation-related emails (cancellations, modifications, confirmations) and updates the PMS automatically.',
  icon: 'mdiEmailOutline',
  tier: 'core',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-er-1',
      intent: 'Reservation email received',
      channels: [
        { channel: 'voice', enabled: false },
        { channel: 'sms', enabled: false },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: true },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  defaultConnections: [
    cn(conn.pms, { status: 'needed' }),
    cn(conn.sendgrid, { status: 'needed' }),
    conn.kb,
  ],
  defaultCapabilities: ['prod-knowledge-base'],
  defaultWorkflow: {
    id: 'wf-email-cancel',
    name: 'Process Cancellation Email',
    description: 'Parses inbound cancellation emails, validates against PMS policy, cancels or flags for review, and sends confirmation.',
    trigger: 'Cancellation Email Received',
    triggerDescription: 'Inbound email matching cancellation keywords detected in reservations inbox.',
    steps: [
      {
        id: 'er-s1',
        type: 'action',
        label: 'Parse Email Content',
        description: 'Extract confirmation number, guest name, dates, and cancellation reason from the email body.',
        conditions: [
          { id: 'er-c1', condition: 'If confirmation number is missing', action: 'Search PMS by guest name and dates to find matching reservation' },
          { id: 'er-c2', condition: 'If multiple reservations match', action: 'Flag for staff review — do not auto-cancel' },
        ],
      },
      {
        id: 'er-s2',
        type: 'action',
        label: 'Validate Cancellation Policy',
        description: 'Check the reservation against the property cancellation policy in PMS.',
        conditions: [
          { id: 'er-c3', condition: 'If within free cancellation window', action: 'Proceed to cancel — no charge' },
          { id: 'er-c4', condition: 'If within penalty window', action: 'Calculate penalty amount per policy' },
          { id: 'er-c5', condition: 'If non-refundable rate', action: 'Flag for staff review — cannot auto-cancel' },
        ],
      },
      {
        id: 'er-s3',
        type: 'action',
        label: 'Update PMS',
        description: 'Cancel the reservation in the PMS and release the inventory. Apply charges if applicable.',
        conditions: [
          { id: 'er-c6', condition: 'If PMS write succeeds', action: 'Log confirmation and proceed to notification' },
          { id: 'er-c7', condition: 'If PMS write fails', action: 'Retry once, then flag for staff with error details' },
        ],
      },
      {
        id: 'er-s4',
        type: 'response',
        label: 'Send Confirmation',
        description: 'Send a cancellation confirmation email to the guest with cancellation number, any charges applied, and refund timeline.',
      },
      {
        id: 'er-s5',
        type: 'handoff',
        label: 'Escalate Exceptions',
        description: 'Route flagged items to the front desk team for manual review.',
        conditions: [
          { id: 'er-c8', condition: 'If non-refundable or policy exception', action: 'Send to revenue manager with full context' },
          { id: 'er-c9', condition: 'If PMS error persisted', action: 'Send to IT support with error log' },
          { id: 'er-c10', condition: 'If guest disputed the cancellation terms', action: 'Send to front desk manager for guest resolution' },
        ],
      },
    ],
    guardrails: [
      'Never cancel a reservation without matching the confirmation number or guest identity.',
      'Always apply the correct cancellation policy — no manual overrides without staff approval.',
      'Log every cancellation action for audit trail.',
      'Never process cancellations for group/event bookings — route to sales team.',
    ],
  },
  defaultTone: '',
  defaultRules: [
    { id: 'er-r1', condition: 'IF group or event booking', action: 'Route to sales team — do not auto-cancel', enabled: true },
    { id: 'er-r2', condition: 'IF OTA reservation (Booking.com, Expedia)', action: 'Do not cancel in PMS — flag for OTA portal cancellation', enabled: true },
    { id: 'er-r3', condition: 'IF VIP or loyalty member', action: 'Flag for front desk manager review before processing', enabled: true },
    { id: 'er-r4', condition: 'DEFAULT', action: 'Process cancellation per standard policy', enabled: true },
  ],
};

export const agentTemplates: AgentTemplate[] = [
  templateFrontDesk,
  templateVoiceAI,
  templateSalesEvents,
  templateHousekeeping,
  templateNoShow,
  templateUpsell,
  templateFinance,
  templateLoyalty,
];
