/**
 * Agent Builder Types
 *
 * TypeScript interfaces for the Agent Builder prototype —
 * hybrid wizard + chat approach with triggers, connections, and capabilities.
 * v2: Added step-scoped conditions, gambit rules, and sales inquiry types.
 */

// ---------------------------------------------------------------------------
// Channel Types
// ---------------------------------------------------------------------------

export type ChannelType = 'voice' | 'sms' | 'whatsapp' | 'email' | 'booking-com' | 'expedia' | 'webchat';

export interface ChannelConfig {
  channel: ChannelType;
  enabled: boolean;
}

// All available channels with display names
export const ALL_CHANNELS: { type: ChannelType; label: string; icon: string }[] = [
  { type: 'voice', label: 'Voice', icon: 'mdiPhoneOutline' },
  { type: 'sms', label: 'SMS', icon: 'mdiMessageTextOutline' },
  { type: 'whatsapp', label: 'WhatsApp', icon: 'mdiWhatsapp' },
  { type: 'email', label: 'Email', icon: 'mdiEmailOutline' },
  { type: 'booking-com', label: 'Booking.com', icon: 'mdiDomain' },
  { type: 'expedia', label: 'Expedia', icon: 'mdiAirplaneTakeoff' },
  { type: 'webchat', label: 'Webchat', icon: 'mdiChatOutline' },
];

// ---------------------------------------------------------------------------
// Triggers (intents/events the agent handles)
// ---------------------------------------------------------------------------

export interface AgentTrigger {
  id: string;
  intent: string;  // "Guest inquires about booking"
  channels: ChannelConfig[];
}

// ---------------------------------------------------------------------------
// Connections (external system integrations — NOT channels)
// ---------------------------------------------------------------------------

export type ConnectionType = 'pms' | 'crm' | 'pos' | 'calendar' | 'payment' | 'knowledge-base';
export type ConnectionStatus = 'connected' | 'needed' | 'optional';

export interface Connection {
  id: string;
  name: string;
  type: ConnectionType;
  status: ConnectionStatus;
  description: string;
}

// ---------------------------------------------------------------------------
// Canary Products (the agent's CAPABILITIES — what Canary products it can use)
// ---------------------------------------------------------------------------

export interface CanaryProduct {
  id: string;
  name: string;        // "Messages", "Contracts", "Upsells"
  icon: string;        // mdi icon path name
  description: string;
  enabled: boolean;
  tier: 'included' | 'core' | 'premium';
  instructions?: string;  // prompt injection
}

// All available Canary products (matches sidebar)
export const CANARY_PRODUCTS: Omit<CanaryProduct, 'enabled' | 'instructions'>[] = [
  { id: 'prod-messages', name: 'Messages', icon: 'mdiMessageTextOutline', description: 'Guest messaging across SMS, WhatsApp, and OTA channels.', tier: 'included' },
  { id: 'prod-calls', name: 'Calls', icon: 'mdiPhoneOutline', description: 'Voice AI for inbound and outbound phone calls.', tier: 'included' },
  { id: 'prod-checkin', name: 'Check-in', icon: 'mdiLoginVariant', description: 'Digital check-in with ID verification and payment capture.', tier: 'included' },
  { id: 'prod-checkout', name: 'Checkout', icon: 'mdiLogoutVariant', description: 'Digital checkout with folio review and guest feedback.', tier: 'included' },
  { id: 'prod-upsells', name: 'Upsells', icon: 'mdiCashMultiple', description: 'Room upgrades, early check-in, late checkout, and add-on offers.', tier: 'core' },
  { id: 'prod-contracts', name: 'Contracts', icon: 'mdiFileSignOutline', description: 'Digital contracts with e-signatures for events and groups.', tier: 'core' },
  { id: 'prod-authorizations', name: 'Authorizations', icon: 'mdiShieldCheckOutline', description: 'Credit card authorization forms and payment verification.', tier: 'core' },
  { id: 'prod-digital-tips', name: 'Digital Tips', icon: 'mdiCurrencyUsd', description: 'Digital tipping for housekeeping and staff.', tier: 'core' },
  { id: 'prod-payment-links', name: 'Payment Links', icon: 'mdiCreditCardOutline', description: 'Send payment collection links to guests.', tier: 'premium' },
  { id: 'prod-knowledge-base', name: 'Knowledge Base', icon: 'mdiBookOpenOutline', description: 'AI-powered answers from hotel FAQs and policies.', tier: 'included' },
];

// ---------------------------------------------------------------------------
// Step-scoped Conditions (v2)
// ---------------------------------------------------------------------------

export interface StepCondition {
  id: string;
  condition: string;   // "If available"
  action: string;      // "Continue to next step"
}

// ---------------------------------------------------------------------------
// Gambit Rules — priority-ordered IF/THEN list (v2)
// ---------------------------------------------------------------------------

export interface GambitRule {
  id: string;
  condition: string;   // "IF event > $50K"
  action: string;      // "CC General Manager, use VIP template"
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export type WorkflowNodeType = 'trigger' | 'action' | 'condition' | 'response' | 'handoff';

export interface WorkflowStep {
  id: string;
  type: WorkflowNodeType;
  label: string;
  description: string;
  tier?: 'included' | 'core' | 'premium';
  conditions?: StepCondition[];
}

export interface AgentWorkflow {
  id?: string;
  name?: string;           // "Sales Inquiry Response"
  description?: string;    // LLM-generated summary for the overview tile
  trigger: string;         // summary text for the visual diagram trigger node
  steps: WorkflowStep[];
  guardrails: string[];
}

// ---------------------------------------------------------------------------
// Agent Status & Metrics
// ---------------------------------------------------------------------------

export type AgentStatus = 'active' | 'paused' | 'draft';

export interface AgentMetrics {
  totalConversations: number;
  resolutionRate: number;
  avgResponseTime: string;
  satisfactionScore: number;
}

// ---------------------------------------------------------------------------
// Agent (runtime instance)
// ---------------------------------------------------------------------------

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  triggers: AgentTrigger[];
  connections: Connection[];
  capabilities: CanaryProduct[];
  workflow: AgentWorkflow;
  tone: string;  // "Natural" | "Formal" | "Casual" | "Luxury"
  metrics: AgentMetrics;
  recentActivity: { time: string; description: string }[];
  createdAt: string;
  rules: GambitRule[];
}

// ---------------------------------------------------------------------------
// Agent Template (gallery / starter kit)
// ---------------------------------------------------------------------------

export interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  tier: 'included' | 'core' | 'premium';
  isLocked: boolean;
  lockMessage?: string;
  defaultTriggers: AgentTrigger[];
  defaultConnections: Connection[];
  defaultCapabilities: string[];  // IDs of CanaryProducts to enable
  defaultWorkflow: AgentWorkflow;
  defaultTone: string;
  defaultRules?: GambitRule[];
}

// ---------------------------------------------------------------------------
// Agent in Action — Sales Inquiry types (v2)
// ---------------------------------------------------------------------------

export type InquiryStatus = 'new' | 'processing' | 'responded' | 'meeting-scheduled' | 'follow-up';

export interface SalesInquiry {
  id: string;
  from: string;        // "Sarah Chen, Chen & Associates"
  email: string;
  subject: string;
  eventType: string;   // "Corporate Retreat"
  dates: string;       // "April 15-17, 2026"
  headcount: number;
  budget?: string;
  receivedAt: Date;
  status: InquiryStatus;
  responseTime?: string; // "2.3 minutes"
  agentResponse?: string;
}

// ---------------------------------------------------------------------------
// Connectors (named external systems with integration status)
// ---------------------------------------------------------------------------

export type ConnectorStatus = 'connected' | 'setup-required' | 'not-available';

export interface ConnectorConfig {
  id: string;
  name: string;          // "Twilio Voice", "Oracle Opera PMS"
  type: ConnectionType;
  status: ConnectorStatus;
  description?: string;
}

// ---------------------------------------------------------------------------
// Activity Feed (for Overview tab)
// ---------------------------------------------------------------------------

export type ActivityStatus = 'responded' | 'meeting-scheduled' | 'follow-up-sent' | 'handed-off' | 'processing';

export interface ActivityFeedItem {
  id: string;
  title: string;          // "Responded to Sarah Chen, Meridian Corp"
  description: string;    // "Corporate retreat, 45 guests, Apr 15-17 — 2.1 min — 9:15 AM"
  status: ActivityStatus;
  inquiryId?: string;     // links to SalesInquiry for thread detail
}

// ---------------------------------------------------------------------------
// Wizard (4-step creation flow)
// ---------------------------------------------------------------------------

export type WizardStep = 'profile' | 'capabilities' | 'workflows' | 'connectors';

export const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'profile', label: 'Agent Profile' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'connectors', label: 'Connectors' },
];

// ---------------------------------------------------------------------------
// Builder Conversation
// ---------------------------------------------------------------------------

export interface BuilderMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflowUpdate?: AgentWorkflow;
  connectionsUpdate?: Connection[];
}

// ---------------------------------------------------------------------------
// View Types
// ---------------------------------------------------------------------------

export type AgentViewTab = 'overview' | 'profile' | 'capabilities' | 'workflows' | 'connectors';
export type AppView = 'dashboard' | 'wizard' | 'detail';
