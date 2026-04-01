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
  trigger: 'Inbound phone call',
  steps: [
    {
      id: 'alex-s1',
      type: 'response',
      label: 'Greet guest',
      description:
        'Answer the call with a warm greeting and identify the caller.',
    },
    {
      id: 'alex-s2',
      type: 'condition',
      label: 'Identify intent',
      description:
        'Classify the caller\'s request — information, reservation, service, or transfer.',
    },
    {
      id: 'alex-s3',
      type: 'action',
      label: 'Route to capability',
      description:
        'Dispatch the request to the appropriate capability (KB, reservations, service requests).',
    },
    {
      id: 'alex-s4',
      type: 'response',
      label: 'Handle or handoff',
      description:
        'Resolve the request directly or transfer the call to the correct department.',
    },
    {
      id: 'alex-s5',
      type: 'handoff',
      label: 'Escalation check',
      description:
        'If the guest is upset or the request is unresolved after two attempts, transfer to a manager.',
    },
  ],
  guardrails: [
    'Never provide room numbers or guest names to unverified callers.',
    'Always offer to transfer to a staff member if the guest requests it.',
    'Do not process payments or refunds — transfer to front desk.',
  ],
};

const javisWorkflow: AgentWorkflow = {
  trigger: 'New guest message',
  steps: [
    {
      id: 'javis-s1',
      type: 'condition',
      label: 'Identify channel',
      description:
        'Determine whether the message arrived via SMS, WhatsApp, or an OTA platform.',
    },
    {
      id: 'javis-s2',
      type: 'action',
      label: 'Read context',
      description:
        'Pull the guest\'s reservation details, previous conversations, and preferences.',
    },
    {
      id: 'javis-s3',
      type: 'condition',
      label: 'Route to capability',
      description:
        'Classify the request and route to the matching capability.',
    },
    {
      id: 'javis-s4',
      type: 'response',
      label: 'Respond or handoff',
      description:
        'Send the response in the original channel, or hand off to staff if needed.',
    },
    {
      id: 'javis-s5',
      type: 'handoff',
      label: 'Tone & language check',
      description:
        'Ensure response matches the channel tone (formal for email, casual for SMS) and guest language.',
    },
  ],
  guardrails: [
    'Never share one guest\'s information with another guest.',
    'Always confirm before making reservation changes.',
    'Match the language the guest writes in.',
    'Escalate harassment or safety concerns to a manager immediately.',
  ],
};

const avaWorkflow: AgentWorkflow = {
  trigger: 'Webchat initiated',
  steps: [
    {
      id: 'ava-s1',
      type: 'response',
      label: 'Welcome guest',
      description:
        'Display a branded greeting and ask how the agent can help.',
    },
    {
      id: 'ava-s2',
      type: 'condition',
      label: 'Identify intent',
      description:
        'Determine whether the visitor wants information, to book, or to speak with staff.',
    },
    {
      id: 'ava-s3',
      type: 'action',
      label: 'Answer or book',
      description:
        'Provide information from the knowledge base or walk the guest through the booking flow.',
    },
    {
      id: 'ava-s4',
      type: 'response',
      label: 'Close conversation',
      description:
        'Confirm the guest\'s needs are met and offer a follow-up link or email confirmation.',
    },
  ],
  guardrails: [
    'Never promise rates that are not available in the booking engine.',
    'Do not collect credit card details in the chat — redirect to the secure booking page.',
    'Offer to connect with a staff member after 3 unresolved exchanges.',
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

const javisTriggers: AgentTrigger[] = [
  {
    id: 'trig-javis-1',
    intent: 'Guest sends message',
    channels: [
      { channel: 'voice', enabled: false },
      { channel: 'sms', enabled: true },
      { channel: 'whatsapp', enabled: true },
      { channel: 'email', enabled: false },
      { channel: 'booking-com', enabled: true },
      { channel: 'expedia', enabled: false },
      { channel: 'webchat', enabled: true },
    ],
  },
];

const avaTriggers: AgentTrigger[] = [
  {
    id: 'trig-ava-1',
    intent: 'Guest initiates webchat',
    channels: [
      { channel: 'voice', enabled: false },
      { channel: 'sms', enabled: false },
      { channel: 'whatsapp', enabled: false },
      { channel: 'email', enabled: false },
      { channel: 'booking-com', enabled: false },
      { channel: 'expedia', enabled: false },
      { channel: 'webchat', enabled: true },
    ],
  },
];

const alex: Agent = {
  id: 'agent-alex',
  name: 'Alex',
  role: 'Voice AI Agent',
  description:
    'Handles all inbound phone calls for the front desk, answers guest questions, and routes calls to appropriate departments.',
  status: 'active',
  triggers: alexTriggers,
  connections: [conn.pms, conn.kb],
  capabilities: allProductsWithEnabled(['prod-messages', 'prod-calls', 'prod-checkin', 'prod-knowledge-base']),
  workflow: alexWorkflow,
  tone: 'Natural',
  metrics: {
    totalConversations: 2847,
    resolutionRate: 94,
    avgResponseTime: '1.2s',
    satisfactionScore: 4.8,
  },
  recentActivity: [
    { time: '2 min ago', description: 'Handled call about late checkout request for room 1204.' },
    { time: '15 min ago', description: 'Transferred caller to restaurant for dinner reservation.' },
    { time: '38 min ago', description: 'Answered question about pool hours and towel service.' },
  ],
  createdAt: '2026-01-12',
  rules: [],
};

const javis: Agent = {
  id: 'agent-javis',
  name: 'Javis',
  role: 'Guest Messaging Agent',
  description:
    'Handles incoming guest communications via SMS, WhatsApp, and OTA channels. Answers questions and fulfills requests.',
  status: 'active',
  triggers: javisTriggers,
  connections: [conn.pms, conn.kb],
  capabilities: allProductsWithEnabled(['prod-messages', 'prod-upsells', 'prod-knowledge-base']),
  workflow: javisWorkflow,
  tone: 'Natural',
  metrics: {
    totalConversations: 5123,
    resolutionRate: 89,
    avgResponseTime: '0.8s',
    satisfactionScore: 4.6,
  },
  recentActivity: [
    { time: '1 min ago', description: 'Replied to WhatsApp message about early check-in availability.' },
    { time: '8 min ago', description: 'Sent booking confirmation via SMS to guest arriving tomorrow.' },
    { time: '22 min ago', description: 'Escalated noise complaint from Booking.com guest to front desk.' },
  ],
  createdAt: '2026-02-03',
  rules: [],
};

const ava: Agent = {
  id: 'agent-ava',
  name: 'Ava',
  role: 'Webchat Agent',
  description:
    'Communicates with guests on the hotel website. Provides hotel information, handles booking inquiries, and drives direct reservations.',
  status: 'active',
  triggers: avaTriggers,
  connections: [conn.kb],
  capabilities: allProductsWithEnabled(['prod-messages', 'prod-knowledge-base']),
  workflow: avaWorkflow,
  tone: 'Casual',
  metrics: {
    totalConversations: 1456,
    resolutionRate: 91,
    avgResponseTime: '1.0s',
    satisfactionScore: 4.7,
  },
  recentActivity: [
    { time: '5 min ago', description: 'Helped visitor compare suite options and start a booking.' },
    { time: '19 min ago', description: 'Answered question about pet policy and nearby dog parks.' },
    { time: '45 min ago', description: 'Transferred chat to reservations team for group booking inquiry.' },
  ],
  createdAt: '2026-02-18',
  rules: [],
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
  { id: 'cnx-twilio', name: 'Twilio Voice', type: 'pms', status: 'connected' },
  { id: 'cnx-opera', name: 'Oracle Opera PMS', type: 'pms', status: 'connected' },
  { id: 'cnx-salesforce', name: 'Salesforce CRM', type: 'crm', status: 'setup-required' },
  { id: 'cnx-stripe', name: 'Stripe Payments', type: 'payment', status: 'connected' },
  { id: 'cnx-sendgrid', name: 'SendGrid Email', type: 'knowledge-base', status: 'connected' },
  { id: 'cnx-calendar', name: 'Google Calendar', type: 'calendar', status: 'setup-required' },
  { id: 'cnx-square', name: 'Square POS', type: 'pos', status: 'connected' },
  { id: 'cnx-hotsos', name: 'HotSOS Task Management', type: 'pos', status: 'not-available' },
];

// ---------------------------------------------------------------------------
// Activity Feed Items (for Sales & Events Overview)
// ---------------------------------------------------------------------------

export const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: 'act-1',
    title: 'Responded to Sarah Chen, Meridian Corp',
    description: 'Corporate retreat, 45 guests, Apr 15-17 — 2.1 min — 9:15 AM',
    status: 'responded',
    inquiryId: 'inq-1',
  },
  {
    id: 'act-2',
    title: 'Scheduled site visit with James Rodriguez',
    description: 'Wedding reception, 120 guests, Jun 14 — 1.8 min — 10:30 AM',
    status: 'meeting-scheduled',
    inquiryId: 'inq-2',
  },
  {
    id: 'act-3',
    title: 'Sent follow-up to Amanda Torres',
    description: 'Conference, 200+ attendees, Sep 12-14 — auto — 8:02 AM',
    status: 'follow-up-sent',
    inquiryId: 'inq-5',
  },
  {
    id: 'act-4',
    title: 'Handed off to sales team — Lisa Park, TechForward',
    description: 'Complex multi-venue request — 11:45 AM',
    status: 'handed-off',
    inquiryId: 'inq-3',
  },
  {
    id: 'act-5',
    title: 'Responded to David Kim',
    description: 'Anniversary dinner, 30 guests, Apr 5 — 3.4 min — Yesterday',
    status: 'responded',
    inquiryId: 'inq-4',
  },
];

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
  connections: [
    { id: 'conn-pms', name: 'Property Management System', type: 'pms', status: 'connected', description: 'PMS for reservation lookup and updates' },
    { id: 'conn-kb', name: 'Knowledge Base', type: 'knowledge-base', status: 'connected', description: 'Cancellation policies and property rules' },
  ],
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
        description: 'Extract confirmation number, guest name, dates, and cancellation reason from the email body.',
        conditions: [
          { id: 'er-c1', condition: 'If confirmation number is missing', action: 'Search PMS by guest name and dates' },
          { id: 'er-c2', condition: 'If multiple reservations match', action: 'Flag for staff review' },
        ],
      },
      {
        id: 'er-s2',
        type: 'action',
        label: 'Validate Cancellation Policy',
        description: 'Check the reservation against the property cancellation policy in PMS.',
        conditions: [
          { id: 'er-c3', condition: 'If within free cancellation window', action: 'Proceed — no charge' },
          { id: 'er-c4', condition: 'If within penalty window', action: 'Calculate penalty amount' },
          { id: 'er-c5', condition: 'If non-refundable rate', action: 'Flag for staff review' },
        ],
      },
      {
        id: 'er-s3',
        type: 'action',
        label: 'Update PMS',
        description: 'Cancel the reservation in the PMS and release inventory.',
        conditions: [
          { id: 'er-c6', condition: 'If PMS write succeeds', action: 'Log and proceed to confirmation' },
          { id: 'er-c7', condition: 'If PMS write fails', action: 'Retry once, then escalate to IT' },
        ],
      },
      {
        id: 'er-s4',
        type: 'response',
        label: 'Send Confirmation',
        description: 'Email guest with cancellation number, charges applied, and refund timeline.',
      },
      {
        id: 'er-s5',
        type: 'handoff',
        label: 'Escalate Exceptions',
        description: 'Route flagged items to the appropriate team for manual review.',
        conditions: [
          { id: 'er-c8', condition: 'If non-refundable or policy exception', action: 'Send to revenue manager' },
          { id: 'er-c9', condition: 'If PMS error persisted', action: 'Send to IT support' },
          { id: 'er-c10', condition: 'If guest disputed terms', action: 'Send to front desk manager' },
        ],
      },
    ],
    guardrails: [
      'Never cancel without matching confirmation number or guest identity.',
      'Always apply the correct cancellation policy.',
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
};

export const mockAgents: Agent[] = [alex, javis, ava, riley];

// ---------------------------------------------------------------------------
// Agent Templates
// ---------------------------------------------------------------------------

const templateFrontDesk: AgentTemplate = {
  id: 'tpl-front-desk',
  name: 'Front Desk Agent',
  role: 'Front Desk Assistant',
  description:
    'General-purpose front desk assistant. Answers calls, handles common requests, and routes complex issues.',
  icon: 'mdiDeskLampOn',
  tier: 'included',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-fd-1',
      intent: 'Guest contacts front desk',
      channels: [
        { channel: 'voice', enabled: true },
        { channel: 'sms', enabled: true },
        { channel: 'whatsapp', enabled: false },
        { channel: 'email', enabled: false },
        { channel: 'booking-com', enabled: false },
        { channel: 'expedia', enabled: false },
        { channel: 'webchat', enabled: false },
      ],
    },
  ],
  defaultConnections: [conn.pms, conn.kb],
  defaultCapabilities: ['prod-messages', 'prod-calls', 'prod-checkin', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'Guest contacts front desk',
    steps: [
      { id: 'fd-s1', type: 'response', label: 'Greet guest', description: 'Welcome the guest and ask how you can assist.' },
      { id: 'fd-s2', type: 'condition', label: 'Classify request', description: 'Determine if the request is informational, transactional, or needs a handoff.' },
      { id: 'fd-s3', type: 'action', label: 'Retrieve information', description: 'Pull relevant data from KB or PMS based on request type.' },
      { id: 'fd-s4', type: 'response', label: 'Respond to guest', description: 'Provide the answer or confirm the action taken.' },
      { id: 'fd-s5', type: 'handoff', label: 'Escalate if needed', description: 'Transfer to a staff member if the request cannot be resolved.' },
    ],
    guardrails: [
      'Verify caller identity before sharing reservation details.',
      'Always offer staff assistance when unsure.',
    ],
  },
  defaultTone: 'Natural',
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
  role: 'Voice AI Assistant',
  description:
    'Manages inbound and outbound phone calls with natural voice interaction.',
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
  defaultConnections: [conn.pms, conn.kb],
  defaultCapabilities: ['prod-messages', 'prod-calls', 'prod-checkin', 'prod-checkout', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'Inbound phone call',
    steps: [
      { id: 'va-s1', type: 'response', label: 'Answer & greet', description: 'Pick up the call and greet with the hotel name and a warm welcome.' },
      { id: 'va-s2', type: 'condition', label: 'Identify caller', description: 'Match the caller to a reservation using phone number or name.' },
      { id: 'va-s3', type: 'condition', label: 'Determine intent', description: 'Classify the call as informational, transactional, or transfer request.' },
      { id: 'va-s4', type: 'action', label: 'Execute action', description: 'Fulfil the request using the appropriate capability.' },
      { id: 'va-s5', type: 'handoff', label: 'Transfer if needed', description: 'Route the call to the correct department when required.' },
      { id: 'va-s6', type: 'action', label: 'Post-call follow-up', description: 'Send an SMS summary of the call and any actions taken.' },
    ],
    guardrails: [
      'Never provide room numbers to unverified callers.',
      'Always offer to transfer to a staff member when the guest asks.',
      'Keep hold time under 30 seconds before offering a callback.',
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
    cn(conn.crm, { status: 'needed' }),
    cn(conn.calendar, { status: 'optional' }),
    conn.kb,
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
    'Coordinates housekeeping requests, tracks room status, and manages cleaning schedules.',
  icon: 'mdiBroomOutline',
  tier: 'core',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-hk-1',
      intent: 'Housekeeping request or room status change',
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
  defaultConnections: [conn.pms, conn.kb],
  defaultCapabilities: ['prod-messages', 'prod-checkin', 'prod-checkout', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'Housekeeping request or room status change',
    steps: [
      { id: 'hk-s1', type: 'condition', label: 'Identify request type', description: 'Classify as cleaning request, supply request, priority turnover, or DND.' },
      { id: 'hk-s2', type: 'action', label: 'Check room status', description: 'Query current room status and today\'s assignment board.' },
      { id: 'hk-s3', type: 'action', label: 'Create or update task', description: 'Assign the task to the correct attendant with priority level.' },
      { id: 'hk-s4', type: 'response', label: 'Confirm with guest', description: 'Send an estimated completion time to the guest.' },
      { id: 'hk-s5', type: 'action', label: 'Verify completion', description: 'Follow up with the attendant to confirm task completion and update status.' },
    ],
    guardrails: [
      'Respect DND requests — never override without manager approval.',
      'Prioritise VIP and suite turnovers during peak check-in.',
      'Log all lost-and-found items immediately.',
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
  defaultConnections: [conn.pms, conn.kb],
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
  role: 'Arrival Confirmation Specialist',
  description:
    'Proactively reaches out to unresponsive guests to confirm attendance and recover potential no-shows.',
  icon: 'mdiAccountAlertOutline',
  tier: 'core',
  isLocked: false,
  defaultTriggers: [
    {
      id: 'trig-ns-1',
      intent: 'Guest has not confirmed 24 hours before arrival',
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
  defaultCapabilities: ['prod-messages', 'prod-checkin', 'prod-knowledge-base'],
  defaultWorkflow: {
    trigger: 'Guest has not confirmed 24 hours before arrival',
    steps: [
      { id: 'ns-s1', type: 'action', label: 'Identify at-risk reservations', description: 'Query PMS for arrivals without check-in activity or confirmation.' },
      { id: 'ns-s2', type: 'action', label: 'Send confirmation request', description: 'Text and email the guest asking them to confirm or cancel.' },
      { id: 'ns-s3', type: 'condition', label: 'Evaluate response', description: 'Check if the guest confirmed, cancelled, or did not respond.' },
      { id: 'ns-s4', type: 'action', label: 'Follow up if no response', description: 'Place a phone call or send a final message 4 hours before cutoff.' },
      { id: 'ns-s5', type: 'handoff', label: 'Alert front desk', description: 'Notify the front desk of likely no-shows for inventory release.' },
    ],
    guardrails: [
      'Limit outreach to 3 contact attempts per reservation.',
      'Never cancel a reservation automatically — only flag for staff.',
      'Respect guest time zones when scheduling outreach.',
    ],
  },
  defaultTone: 'Natural',
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
  templateReservations,
  templateConcierge,
  templateGuestMessaging,
  templateVoiceAI,
  templateSalesEvents,
  templateHousekeeping,
  templateServiceTask,
  templateNoShow,
  templateUpsell,
  templateFinance,
  templateLoyalty,
];
