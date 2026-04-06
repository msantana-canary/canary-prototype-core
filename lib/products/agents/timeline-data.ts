/**
 * Timeline mock data for all agents.
 *
 * Each key corresponds to an `inquiryId` from `agentActivityFeeds` in mock-data.ts.
 * The `animated` flag is true for in-progress items (live execution simulation).
 */

import type { TimelineEvent, CapabilityLabel } from '@/components/products/agents/ActivityTimeline';
import {
  mdiMessageTextOutline,
  mdiSendOutline,
  mdiEyeOutline,
  mdiCheckCircleOutline,
  mdiTagOutline,
  mdiKeyVariant,
  mdiPhoneIncomingOutline,
  mdiLoginVariant,
  mdiClockOutline,
  mdiFlashOutline,
  mdiDatabaseOutline,
  mdiFileDocumentOutline,
  mdiBookOpenPageVariantOutline,
  mdiShieldCheckOutline,
  mdiCheckAll,
  mdiWrenchOutline,
  mdiEmailOutline,
  mdiCarOutline,
  mdiClipboardTextOutline,
  mdiAccountCheckOutline,
  mdiTicketConfirmationOutline,
  mdiCreditCardCheckOutline,
} from '@mdi/js';

// ============================================================================
// Sales & Events Agent — existing timelines migrated from ActivityTimeline.tsx
// ============================================================================

const SALES_COMPLETED_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Mar. 29' },

  // Inbound email from Sarah
  { id: 'e-0', type: 'guest-message', time: '9:15 AM', text: 'Hi there,\n\nI\'m looking to book a corporate retreat for our team — 45 people, ideally April 15-17. We\'d need a large meeting space, two breakout rooms, and a room block. Budget is around $35K. Could you send over availability and pricing?\n\nThanks,\nSarah Chen\nChen & Associates' },

  // Trigger fires
  { id: 'tr-1', type: 'trigger', time: '9:15 AM', text: 'Receive Inquiry', triggerDescription: 'Incoming email detected in sales inbox — sarah@chenassociates.com' },

  // Step 1: Parse Details
  { id: 'ws-1', type: 'workflow-step', text: 'Parse Details', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '9:15 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Parsed inquiry details',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Event Type', value: 'Corporate Retreat' },
      { label: 'Dates', value: 'April 15-17, 2026' },
      { label: 'Headcount', value: '45 guests' },
      { label: 'Budget', value: '$35,000' },
      { label: 'Urgency', value: 'Standard (30+ days out)' },
    ],
  },

  // Step 2: Check Availability
  { id: 'ws-2', type: 'workflow-step', text: 'Check Availability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '9:15 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Availability confirmed via Oracle Opera PMS',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Grand Ballroom', value: 'Available', status: 'success' },
      { label: 'Breakout Room A', value: 'Available', status: 'success' },
      { label: 'Breakout Room B', value: 'Available', status: 'success' },
      { label: 'Room Block (45)', value: 'Available at $289/night', status: 'success' },
    ],
  },

  // Step 3: Draft Response
  { id: 'ws-3', type: 'workflow-step', text: 'Draft Response', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-3', type: 'agent-activity', time: '9:16 AM', icon: mdiFileDocumentOutline, iconColor: '#16A34A', text: 'Proposal drafted — Standard Event template',
    capability: 'CONTRACTS',
    isExpandable: true,
    details: [
      { label: 'Template', value: 'Standard Event Contract' },
      { label: 'Venue Package', value: 'Grand Ballroom + 2 Breakout Rooms' },
      { label: 'Room Block', value: '45 rooms × 2 nights × $289' },
      { label: 'F&B Estimate', value: '$8,500 (continental breakfast + lunch)' },
      { label: 'Total Estimate', value: '$34,510' },
    ],
  },

  // Step 4: Send Response
  { id: 'ws-4', type: 'workflow-step', text: 'Send Response', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '9:17 AM', icon: mdiSendOutline, iconColor: '#16A34A', text: 'Proposal sent to sarah@chenassociates.com',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'Subject', value: 'Your Corporate Retreat at The Statler — April 15-17' },
      { label: 'Includes', value: 'Venue details, pricing, property highlights' },
      { label: 'CTA', value: 'Schedule a site visit' },
      { label: 'Response Time', value: '2.1 minutes', status: 'success' },
    ],
  },

  // Step 5: Follow Up
  { id: 'ws-5', type: 'workflow-step', text: 'Follow Up', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-5', type: 'agent-activity', time: '9:17 AM', icon: mdiClockOutline, text: 'Follow-up scheduled — 48 hours (corporate event cadence)',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'Cadence', value: 'Corporate event — 48hr, then weekly' },
      { label: 'Next Follow-up', value: 'March 31, 2026' },
      { label: 'Escalation', value: 'After 2nd follow-up if no response' },
    ],
  },

  // Completion
  { id: 'e-6', type: 'system-event', time: '9:17 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Inquiry Response workflow completed — 2.1 min total', capability: 'MESSAGING' },
];

// Wedding inquiry — James Rodriguez (meeting-scheduled)
const SALES_WEDDING_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Mar. 29' },

  { id: 'e-0', type: 'guest-message', time: '10:30 AM', text: 'Hello,\n\nI\'m an event planner working with a couple getting married on June 14. We\'re looking at venues for the reception — approximately 120 guests. Budget is around $85K. The couple would love a space with city views.\n\nLooking forward to hearing from you.\n\nJames Rodriguez\nMeridian Events' },

  { id: 'tr-1', type: 'trigger', time: '10:30 AM', text: 'Receive Inquiry', triggerDescription: 'Incoming email detected in sales inbox — james@meridianevents.com' },

  { id: 'ws-1', type: 'workflow-step', text: 'Parse Details', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '10:30 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Parsed inquiry details',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Event Type', value: 'Wedding Reception' },
      { label: 'Date', value: 'June 14, 2026' },
      { label: 'Headcount', value: '120 guests' },
      { label: 'Budget', value: '$85,000' },
      { label: 'Urgency', value: 'Standard (60+ days out)' },
      { label: 'Special Request', value: 'City views' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Check Availability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '10:31 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Availability confirmed via Oracle Opera PMS',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Starlight Terrace', value: 'Available', status: 'success' },
      { label: 'Bridal Suite', value: 'Available', status: 'success' },
      { label: 'Room Block (40)', value: 'Available at $319/night', status: 'success' },
    ],
  },

  { id: 'ws-3', type: 'workflow-step', text: 'Draft Response', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-3', type: 'agent-activity', time: '10:31 AM', icon: mdiFileDocumentOutline, iconColor: '#16A34A', text: 'Proposal drafted — Premium Wedding Package',
    capability: 'CONTRACTS',
    isExpandable: true,
    details: [
      { label: 'Template', value: 'Premium Wedding Contract' },
      { label: 'Venue', value: 'Starlight Terrace (panoramic city views)' },
      { label: 'Room Block', value: '40 rooms × 1 night × $319' },
      { label: 'F&B Estimate', value: '$42,000 (plated dinner + premium bar)' },
      { label: 'Total Estimate', value: '$82,760' },
    ],
  },

  { id: 'ws-4', type: 'workflow-step', text: 'Send Response', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '10:32 AM', icon: mdiSendOutline, iconColor: '#16A34A', text: 'Proposal sent to james@meridianevents.com — GM CC\'d',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'Subject', value: 'Wedding Reception at The Statler — June 14' },
      { label: 'Includes', value: 'Venue details, pricing, bridal suite, tastings' },
      { label: 'CTA', value: 'Schedule tasting and site tour' },
      { label: 'CC', value: 'General Manager (budget > $50K)' },
      { label: 'Response Time', value: '1.8 minutes', status: 'success' },
    ],
  },

  { id: 'ws-5', type: 'workflow-step', text: 'Follow Up', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-5', type: 'agent-activity', time: '10:32 AM', icon: mdiClockOutline, text: 'Follow-up scheduled — 72 hours (wedding event cadence)',
    capability: 'MESSAGING',
  },

  { id: 'e-6', type: 'system-event', time: '10:32 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Inquiry Response workflow completed — 1.8 min total', capability: 'MESSAGING' },
];

// Anniversary dinner — David Kim
const SALES_DINNER_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Mar. 28' },

  { id: 'e-0', type: 'guest-message', time: '4:20 PM', text: 'Hi,\n\nMy wife and I are celebrating our 25th anniversary and I\'d like to host a dinner for about 30 family members and close friends on April 5. We\'re looking for something elegant but not too formal. Do you have a private dining room available?\n\nThanks,\nDavid Kim' },

  { id: 'tr-1', type: 'trigger', time: '4:20 PM', text: 'Receive Inquiry', triggerDescription: 'Incoming email detected in sales inbox — david.kim@email.com' },

  { id: 'ws-1', type: 'workflow-step', text: 'Parse Details', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '4:20 PM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Parsed inquiry details',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Event Type', value: 'Private Dinner' },
      { label: 'Date', value: 'April 5, 2026' },
      { label: 'Headcount', value: '30 guests' },
      { label: 'Budget', value: 'Not specified' },
      { label: 'Occasion', value: '25th wedding anniversary' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Check Availability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '4:21 PM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Availability confirmed via Oracle Opera PMS',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Library Room', value: 'Available (seats up to 36)', status: 'success' },
    ],
  },

  { id: 'ws-3', type: 'workflow-step', text: 'Draft Response', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-3', type: 'agent-activity', time: '4:22 PM', icon: mdiFileDocumentOutline, iconColor: '#16A34A', text: 'Proposal drafted — Private Dining package',
    capability: 'CONTRACTS',
    isExpandable: true,
    details: [
      { label: 'Template', value: 'Private Dining Contract' },
      { label: 'Venue', value: 'Library Room' },
      { label: 'Menu', value: 'Customizable 3-course with wine pairing' },
      { label: 'Includes', value: 'Coordinator, champagne toast, AV' },
    ],
  },

  { id: 'ws-4', type: 'workflow-step', text: 'Send Response', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '4:23 PM', icon: mdiSendOutline, iconColor: '#16A34A', text: 'Proposal sent to david.kim@email.com',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'Subject', value: 'Your Anniversary Dinner at The Statler — April 5' },
      { label: 'CTA', value: 'Schedule a call with Executive Chef' },
      { label: 'Response Time', value: '3.4 minutes', status: 'success' },
    ],
  },

  { id: 'ws-5', type: 'workflow-step', text: 'Follow Up', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-5', type: 'agent-activity', time: '4:23 PM', icon: mdiClockOutline, text: 'Follow-up scheduled — 48 hours',
    capability: 'MESSAGING',
  },

  { id: 'e-6', type: 'system-event', time: '4:23 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Inquiry Response workflow completed — 3.4 min total', capability: 'MESSAGING' },
];

// Conference — Amanda Torres (follow-up)
const SALES_CONFERENCE_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Mar. 29' },

  { id: 'e-0', type: 'guest-message', time: '8:00 AM', text: 'Good morning,\n\nNortheast Pharma is planning our annual conference for September 12-14, 2026 — over 200 attendees across 3 days. We need a large plenary space, 4 breakout rooms, full AV, and a 150+ room block. Our budget is approximately $150K.\n\nPlease send availability and a proposal.\n\nAmanda Torres\nDirector of Events, Northeast Pharma' },

  { id: 'tr-1', type: 'trigger', time: '8:00 AM', text: 'Receive Inquiry', triggerDescription: 'Incoming email detected in sales inbox — atorres@nepharm.com' },

  { id: 'ws-1', type: 'workflow-step', text: 'Parse Details', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '8:00 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Parsed inquiry details',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Event Type', value: 'Conference' },
      { label: 'Dates', value: 'September 12-14, 2026' },
      { label: 'Headcount', value: '200+ attendees' },
      { label: 'Budget', value: '$150,000' },
      { label: 'Urgency', value: 'Standard (5+ months out)' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Check Availability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '8:01 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Availability confirmed via Oracle Opera PMS',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Grand Ballroom', value: 'Available (capacity 300)', status: 'success' },
      { label: 'Breakout Rooms A-D', value: 'All available', status: 'success' },
      { label: 'Room Block (150)', value: 'Available at corporate rate', status: 'success' },
    ],
  },

  { id: 'ws-3', type: 'workflow-step', text: 'Draft Response', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-3', type: 'agent-activity', time: '8:01 AM', icon: mdiFileDocumentOutline, iconColor: '#16A34A', text: 'Proposal drafted — Conference Package',
    capability: 'CONTRACTS',
    isExpandable: true,
    details: [
      { label: 'Template', value: 'Conference Event Contract' },
      { label: 'Venue Package', value: 'Grand Ballroom + 4 Breakout Rooms' },
      { label: 'AV', value: 'Full package with on-site technician' },
      { label: 'Room Block', value: '150 rooms × 2 nights at corporate rate' },
      { label: 'Total Estimate', value: '$145,200' },
    ],
  },

  { id: 'ws-4', type: 'workflow-step', text: 'Send Response', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '8:01 AM', icon: mdiSendOutline, iconColor: '#16A34A', text: 'Proposal sent to atorres@nepharm.com — GM CC\'d',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'Subject', value: 'Your Annual Conference at The Statler — Sep 12-14' },
      { label: 'Includes', value: 'Venue, AV, F&B, room block, coordinator' },
      { label: 'CTA', value: 'Schedule a planning call' },
      { label: 'CC', value: 'General Manager (budget > $50K)' },
      { label: 'Response Time', value: '1.5 minutes', status: 'success' },
    ],
  },

  { id: 'ws-5', type: 'workflow-step', text: 'Follow Up', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-5', type: 'agent-activity', time: '8:02 AM', icon: mdiClockOutline, text: 'Follow-up scheduled — 48 hours (conference event cadence)',
    capability: 'MESSAGING',
  },

  { id: 'e-6', type: 'system-event', time: '8:02 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Inquiry Response workflow completed — 1.5 min total', capability: 'MESSAGING' },
];

// In-progress — Lisa Park
const SALES_INPROGRESS_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-0', type: 'guest-message', time: '11:45 AM', text: 'Hello,\n\nWe\'re planning a team offsite for 25 people, May 8-10. Need meeting space and a room block for 2 nights. What do you have available?\n\nLisa Park\nTechForward Inc' },

  { id: 'tr-1', type: 'trigger', time: '11:45 AM', text: 'Receive Inquiry', triggerDescription: 'Incoming email detected in sales inbox — lpark@techforward.io' },

  { id: 'ws-1', type: 'workflow-step', text: 'Parse Details', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '11:45 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Parsed inquiry details',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Event Type', value: 'Team Offsite' },
      { label: 'Dates', value: 'May 8-10, 2026' },
      { label: 'Headcount', value: '25 people' },
      { label: 'Budget', value: 'Not specified' },
      { label: 'Urgency', value: 'Standard (30+ days out)' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Check Availability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '11:45 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Availability confirmed via Oracle Opera PMS',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Breakout Room A', value: 'Available', status: 'success' },
      { label: 'Breakout Room B', value: 'Available', status: 'success' },
      { label: 'Room Block (25)', value: 'Available at $259/night', status: 'success' },
    ],
  },

  { id: 'ws-3', type: 'workflow-step', text: 'Draft Response', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-3', type: 'agent-activity', time: '11:46 AM', icon: mdiFileDocumentOutline, iconColor: '#16A34A', text: 'Proposal drafted — Team Offsite package',
    capability: 'CONTRACTS',
    isExpandable: true,
    details: [
      { label: 'Template', value: 'Standard Event Contract' },
      { label: 'Venue Package', value: '2 Breakout Rooms (full day)' },
      { label: 'Room Block', value: '25 rooms × 2 nights × $259' },
      { label: 'Total Estimate', value: '$15,450' },
    ],
  },

  { id: 'ws-4', type: 'workflow-step', text: 'Send Response', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '11:47 AM', icon: mdiSendOutline, iconColor: '#16A34A', text: 'Proposal sent to lpark@techforward.io',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'Subject', value: 'Your Team Offsite at The Statler — May 8-10' },
      { label: 'Includes', value: 'Venue details, pricing, property highlights' },
      { label: 'CTA', value: 'Schedule a site visit' },
      { label: 'Response Time', value: '1.8 minutes', status: 'success' },
    ],
  },

  { id: 'ws-5', type: 'workflow-step', text: 'Follow Up', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-5', type: 'agent-activity', time: '11:47 AM', icon: mdiClockOutline, text: 'Follow-up scheduled — 48 hours (corporate event cadence)',
    capability: 'MESSAGING',
  },

  { id: 'e-6', type: 'system-event', time: '11:47 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Inquiry Response workflow completed — 1.8 min total', capability: 'MESSAGING' },
];


// ============================================================================
// Check-in Processing Agent — existing + new timelines
// ============================================================================

// ci-1: Emily Smith completed (migrated from MOCK_COMPLETED_TIMELINE)
const CHECKIN_EMILY_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Mar. 16' },

  { id: 'e-1', type: 'agent-activity', time: '10:00 AM', icon: mdiMessageTextOutline, text: 'Pre-arrival message sent via SMS', capability: 'MESSAGING' },
  { id: 'e-2', type: 'agent-activity', time: '2:00 PM', icon: mdiSendOutline, text: 'Check-in link sent via SMS', capability: 'MESSAGING' },
  { id: 'e-3', type: 'guest-activity', time: '4:45 PM', icon: mdiEyeOutline, text: 'Guest viewed check-in link', capability: 'CHECK-IN' },

  { id: 'tr-1', type: 'trigger', time: '5:05 PM', text: 'Check-in Submitted', triggerDescription: 'Guest completed and submitted pre-arrival check-in form.' },

  // Step 1: Validate Completeness
  { id: 'ws-1', type: 'workflow-step', text: 'Validate Completeness', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'guest-activity', time: '5:05 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Guest completed check-in',
    capability: 'CHECK-IN',
    isExpandable: true,
    details: [
      { label: 'ID Verification', value: 'Verified', status: 'success' },
      { label: 'Credit Card', value: 'Visa ****4821', status: 'success' },
      { label: 'Registration Card', value: 'Signed', status: 'success' },
      { label: 'Estimated Arrival', value: '9:00 PM' },
    ],
    action: { label: 'View Check-in' },
  },

  // Step 2: Sync to PMS
  { id: 'ws-2', type: 'workflow-step', text: 'Sync to PMS', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-4b', type: 'agent-activity', time: '5:06 PM', icon: mdiDatabaseOutline, text: 'Registration data synced to Oracle Opera PMS', capability: 'PMS' },
  {
    id: 'e-5', type: 'guest-activity', time: '5:06 PM', icon: mdiTagOutline, iconColor: '#D97706', text: 'Guest requested Late Checkout — $50.00',
    capability: 'UPSELLS',
    isExpandable: true,
    details: [
      { label: 'Upsell', value: 'Late Checkout (2:00 PM)' },
      { label: 'Price', value: '$50.00' },
      { label: 'Status', value: 'Approved', status: 'success' },
    ],
  },

  // Step 3: Auto-verify Eligibility
  { id: 'ws-3', type: 'workflow-step', text: 'Auto-verify Eligibility', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-5b', type: 'agent-activity', time: '5:07 PM', icon: mdiShieldCheckOutline, iconColor: '#16A34A', text: 'All verifications passed — auto-verified', capability: 'CHECK-IN' },
  { id: 'e-6', type: 'agent-activity', time: '5:08 PM', icon: mdiKeyVariant, text: 'Mobile key issued — Room 412', capability: 'CHECK-IN' },

  // Step 4: Notify Staff
  { id: 'ws-4', type: 'workflow-step', text: 'Notify Staff', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-6b', type: 'agent-activity', time: '5:08 PM', icon: mdiMessageTextOutline, text: 'Confirmation sent to guest + staff notified', capability: 'MESSAGING' },

  // Conversation continues
  { id: 'e-7', type: 'guest-message', time: '5:10 PM', text: 'Hi! I just completed my check-in online. I will arrive late today though — my flight is delayed.' },
  { id: 'e-8', type: 'ai-response', time: '5:12 PM', text: "Thanks for letting us know, Emily! No worries about the late arrival — your room will be ready whenever you get here. We see your check-in is all set." },
  { id: 'e-9', type: 'guest-message', time: '5:15 PM', text: 'Great! Also, is late checkout available? I have a late flight on my departure day.' },
  { id: 'e-10', type: 'ai-response', time: '5:16 PM', text: "Yes! We offer late checkout until 2:00 PM for $50. I see you've already added it from the check-in form — our team will review and approve shortly." },
  { id: 'e-11', type: 'guest-message', time: '6:30 PM', text: 'Give me a list of nearby restaurants' },
  { id: 'e-11b', type: 'agent-activity', time: '6:32 PM', icon: mdiBookOpenPageVariantOutline, text: 'Searched knowledge base — 9 results', capability: 'KNOWLEDGE BASE' },
  { id: 'e-12', type: 'ai-response', time: '6:32 PM', text: 'Here are some nearby restaurant recommendations: Ithaca Ale House, Komonz Grill, MIX, Red\'s Place, and Chili\'s Grill & Bar. The hotel also recommends Il Ristorante Alga, Coltivare, Moosewood Restaurant, and Gola Osteria. Let me know if you need more assistance!' },

  {
    id: 'e-13', type: 'guest-activity', time: '7:45 PM', icon: mdiPhoneIncomingOutline, iconColor: '#2858C4', text: 'Incoming call — Handled by AI',
    capability: 'CALLS',
    isExpandable: true,
    details: [
      { label: 'Duration', value: '1m 12s' },
      { label: 'Topic', value: 'Parking directions' },
      { label: 'Resolution', value: 'Provided parking garage directions' },
      { label: 'Outcome', value: 'Handled by AI', status: 'success' },
    ],
    action: { label: 'View Transcript' },
  },

  { id: 'e-14', type: 'system-event', time: '9:15 PM', icon: mdiLoginVariant, iconColor: '#16A34A', text: 'Guest checked in', capability: 'CHECK-IN' },

  { id: 'ds-2', type: 'date-separator', text: 'Today' },
  {
    id: 'e-15', type: 'agent-activity', time: '12:24 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Late Checkout approved — $50.00',
    capability: 'UPSELLS',
    isExpandable: true,
    details: [
      { label: 'Upsell', value: 'Late Checkout (2:00 PM)' },
      { label: 'Charged', value: '$50.00' },
      { label: 'Approved By', value: 'Theresa Webb' },
      { label: 'Status', value: 'Confirmed', status: 'success' },
    ],
  },
];

// ci-2: Brooklyn Simmons completed
const CHECKIN_BROOKLYN_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-1', type: 'agent-activity', time: '1:30 PM', icon: mdiMessageTextOutline, text: 'Pre-arrival message sent via SMS', capability: 'MESSAGING' },
  { id: 'e-2', type: 'agent-activity', time: '2:45 PM', icon: mdiSendOutline, text: 'Check-in link sent via SMS', capability: 'MESSAGING' },
  { id: 'e-3', type: 'guest-activity', time: '3:00 PM', icon: mdiEyeOutline, text: 'Guest viewed check-in link', capability: 'CHECK-IN' },

  { id: 'tr-1', type: 'trigger', time: '3:10 PM', text: 'Check-in Submitted', triggerDescription: 'Guest completed pre-arrival check-in form.' },

  // Step 1: Validate Completeness
  { id: 'ws-1', type: 'workflow-step', text: 'Validate Completeness', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'guest-activity', time: '3:10 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'All required fields complete',
    capability: 'CHECK-IN',
    isExpandable: true,
    details: [
      { label: 'ID Verification', value: 'Verified', status: 'success' },
      { label: 'Credit Card', value: 'Mastercard ****7293', status: 'success' },
      { label: 'Registration Card', value: 'Signed', status: 'success' },
      { label: 'Estimated Arrival', value: '4:00 PM' },
    ],
    action: { label: 'View Check-in' },
  },

  // Step 2: Sync to PMS
  { id: 'ws-2', type: 'workflow-step', text: 'Sync to PMS', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-5', type: 'agent-activity', time: '3:11 PM', icon: mdiDatabaseOutline, text: 'Registration data synced to Oracle Opera PMS', capability: 'PMS' },

  // Step 3: Auto-verify Eligibility
  { id: 'ws-3', type: 'workflow-step', text: 'Auto-verify Eligibility', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-6', type: 'agent-activity', time: '3:12 PM', icon: mdiShieldCheckOutline, iconColor: '#16A34A', text: 'All verifications passed — auto-verified', capability: 'CHECK-IN' },
  { id: 'e-7', type: 'agent-activity', time: '3:13 PM', icon: mdiKeyVariant, text: 'Mobile key issued — Room 130', capability: 'CHECK-IN' },

  // Step 4: Notify Staff
  { id: 'ws-4', type: 'workflow-step', text: 'Notify Staff', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-8', type: 'agent-activity', time: '3:15 PM', icon: mdiMessageTextOutline, text: 'Confirmation sent to guest + staff notified', capability: 'MESSAGING' },

  { id: 'e-9', type: 'system-event', time: '3:15 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Process Submission workflow completed', capability: 'CHECK-IN' },
];

// ci-3: Sarah Martinez — flagged for review
const CHECKIN_FLAGGED_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-1', type: 'agent-activity', time: '1:00 PM', icon: mdiSendOutline, text: 'Check-in link sent via SMS', capability: 'MESSAGING' },
  { id: 'e-2', type: 'guest-activity', time: '2:30 PM', icon: mdiEyeOutline, text: 'Guest viewed check-in link', capability: 'CHECK-IN' },

  { id: 'tr-1', type: 'trigger', time: '2:40 PM', text: 'Check-in Submitted', triggerDescription: 'Guest completed pre-arrival check-in form.' },

  { id: 'ws-1', type: 'workflow-step', text: 'Validate Completeness', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-3', type: 'guest-activity', time: '2:40 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'All required fields complete',
    capability: 'CHECK-IN',
    isExpandable: true,
    details: [
      { label: 'ID Verification', value: 'Name mismatch', status: 'error' },
      { label: 'Credit Card', value: 'Amex ****1082', status: 'success' },
      { label: 'Registration Card', value: 'Signed', status: 'success' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Sync to PMS', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-4', type: 'agent-activity', time: '2:41 PM', icon: mdiDatabaseOutline, text: 'Registration data synced to Oracle Opera PMS', capability: 'PMS' },

  { id: 'ws-3', type: 'workflow-step', text: 'Auto-verify Eligibility', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-5', type: 'agent-activity', time: '2:42 PM', icon: mdiShieldCheckOutline, iconColor: '#F59E0B', text: 'ID name mismatch detected — flagged for staff review',
    capability: 'CHECK-IN',
    isExpandable: true,
    details: [
      { label: 'Reservation Name', value: 'Sarah Martinez' },
      { label: 'ID Name', value: 'Sarah Martinez-Rodriguez' },
      { label: 'Issue', value: 'Last name mismatch', status: 'pending' },
      { label: 'Action Required', value: 'Staff visual verification' },
    ],
  },

  { id: 'ws-4', type: 'workflow-step', text: 'Notify Staff', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-6', type: 'agent-activity', time: '2:45 PM', icon: mdiMessageTextOutline, text: 'High-priority alert sent — ID name mismatch requires review', capability: 'MESSAGING' },

  { id: 'e-7', type: 'system-event', time: '2:45 PM', icon: mdiCheckCircleOutline, iconColor: '#F59E0B', text: 'Process Submission completed — awaiting staff review', capability: 'CHECK-IN' },
];

// ci-4: Olivia Brown-Henderson — in-progress
const CHECKIN_INPROGRESS_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-1', type: 'agent-activity', time: '3:30 PM', icon: mdiSendOutline, text: 'Check-in link sent via SMS', capability: 'MESSAGING' },
  { id: 'e-2', type: 'guest-activity', time: '4:15 PM', icon: mdiEyeOutline, text: 'Guest viewed check-in link', capability: 'CHECK-IN' },

  { id: 'tr-1', type: 'trigger', time: '4:25 PM', text: 'Check-in Submitted', triggerDescription: 'Guest completed pre-arrival check-in form.' },

  // Step 1
  { id: 'ws-1', type: 'workflow-step', text: 'Validate Completeness', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-3', type: 'guest-activity', time: '4:25 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'All required fields complete',
    capability: 'CHECK-IN',
    isExpandable: true,
    details: [
      { label: 'Registration Card', value: 'Signed', status: 'success' },
      { label: 'ID Document', value: 'Uploaded', status: 'success' },
      { label: 'Credit Card', value: 'Amex ****9012', status: 'success' },
      { label: 'Estimated Arrival', value: '6:00 PM' },
    ],
  },

  // Step 2
  { id: 'ws-2', type: 'workflow-step', text: 'Sync to PMS', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-4', type: 'agent-activity', time: '4:25 PM', icon: mdiDatabaseOutline, text: 'Registration data synced to Oracle Opera PMS', capability: 'PMS' },

  // Step 3
  { id: 'ws-3', type: 'workflow-step', text: 'Auto-verify Eligibility', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-5', type: 'agent-activity', time: '4:25 PM', icon: mdiShieldCheckOutline, iconColor: '#16A34A', text: 'All verifications passed — auto-verified', capability: 'CHECK-IN' },
  { id: 'e-6', type: 'agent-activity', time: '4:26 PM', icon: mdiKeyVariant, text: 'Mobile key issued — Room 508', capability: 'CHECK-IN' },

  // Step 4
  { id: 'ws-4', type: 'workflow-step', text: 'Notify Staff', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-7', type: 'agent-activity', time: '4:26 PM', icon: mdiMessageTextOutline, text: 'Confirmation sent to guest + staff notified', capability: 'MESSAGING' },

  { id: 'e-8', type: 'system-event', time: '4:26 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Process Submission workflow completed — 6s', capability: 'CHECK-IN' },
];


// ============================================================================
// Alex (Voice AI Agent) — new timelines
// ============================================================================

// alex-1: Emily Smith — parking inquiry, completed
const ALEX_PARKING_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'tr-1', type: 'trigger', time: '7:45 PM', text: 'Inbound Phone Call', triggerDescription: 'Guest called front desk — caller identified as Emily Smith, Room 412' },

  // Step 1: Identify Intent
  { id: 'ws-1', type: 'workflow-step', text: 'Identify Intent', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-1', type: 'agent-activity', time: '7:45 PM', icon: mdiPhoneIncomingOutline, iconColor: '#16A34A', text: 'Intent identified — Parking/directions inquiry', capability: 'CALLS' },

  // Step 2: Execute Ability
  { id: 'ws-2', type: 'workflow-step', text: 'Execute Ability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-2', type: 'agent-activity', time: '7:45 PM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Searched KB — parking garage location, rates, and valet options', capability: 'KNOWLEDGE BASE' },

  // Step 3: Respond to Caller
  { id: 'ws-3', type: 'workflow-step', text: 'Respond to Caller', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'ai-response', time: '7:46 PM', text: 'Hi Emily! Our parking garage entrance is on 54th Street, just past the main lobby entrance. Self-parking is $45 per night and valet parking is $65 per night. You can leave your keys with the valet at the front entrance anytime.' },

  // Completion
  { id: 'e-4', type: 'system-event', time: '7:46 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Call completed — 1m 12s, resolved by AI', capability: 'CALLS' },
];

// alex-2: Noah Davis — transferred to restaurant
const ALEX_RESTAURANT_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'tr-1', type: 'trigger', time: '6:30 PM', text: 'Inbound Phone Call', triggerDescription: 'Guest called front desk — caller identified as Noah Davis, Room 308' },

  { id: 'ws-1', type: 'workflow-step', text: 'Identify Intent', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-1', type: 'agent-activity', time: '6:30 PM', icon: mdiPhoneIncomingOutline, iconColor: '#16A34A', text: 'Intent identified — Dinner reservation request', capability: 'CALLS' },

  { id: 'ws-2', type: 'workflow-step', text: 'Execute Ability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-2', type: 'agent-activity', time: '6:30 PM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Searched KB — restaurant hours and reservation info', capability: 'KNOWLEDGE BASE' },
  { id: 'e-3', type: 'ai-response', time: '6:31 PM', text: 'Our restaurant is open until 10 PM tonight. Let me connect you directly with the hostess to make a reservation for you.' },

  { id: 'ws-3', type: 'workflow-step', text: 'Respond to Caller', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-4', type: 'agent-activity', time: '6:31 PM', icon: mdiPhoneIncomingOutline, text: 'Call transferred to restaurant — ext. 4200', capability: 'CALLS' },

  { id: 'e-5', type: 'system-event', time: '6:31 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Call completed — 0:42s, transferred to restaurant', capability: 'CALLS' },
];

// alex-3: Hiroshi Nakamura — room service hours
const ALEX_ROOMSERVICE_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'tr-1', type: 'trigger', time: '5:15 PM', text: 'Inbound Phone Call', triggerDescription: 'Guest called front desk — caller identified as Hiroshi Nakamura, Room 504' },

  { id: 'ws-1', type: 'workflow-step', text: 'Identify Intent', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-1', type: 'agent-activity', time: '5:15 PM', icon: mdiPhoneIncomingOutline, iconColor: '#16A34A', text: 'Intent identified — Room service hours inquiry', capability: 'CALLS' },

  { id: 'ws-2', type: 'workflow-step', text: 'Execute Ability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-2', type: 'agent-activity', time: '5:15 PM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Searched KB — room service hours and ordering info', capability: 'KNOWLEDGE BASE' },

  { id: 'ws-3', type: 'workflow-step', text: 'Respond to Caller', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'ai-response', time: '5:16 PM', text: 'Room service is available from 6 AM to 11 PM daily. Our full dinner menu is available until 10 PM, and after that we have a late-night menu with lighter options. Would you like me to send the menu to your room, or would you like to place an order now?' },

  { id: 'e-4', type: 'system-event', time: '5:16 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Call completed — 1m 05s, resolved by AI', capability: 'CALLS' },
];

// alex-4: Priya Sharma — in-progress taxi request
const ALEX_INPROGRESS_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'tr-1', type: 'trigger', time: '3:00 PM', text: 'Inbound Phone Call', triggerDescription: 'Incoming call — Priya Sharma, Room 419' },

  { id: 'ws-1', type: 'workflow-step', text: 'Identify Intent', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-1', type: 'agent-activity', time: '3:00 PM', icon: mdiPhoneIncomingOutline, iconColor: '#16A34A', text: 'Intent identified — Transportation request', capability: 'CALLS' },

  { id: 'ws-2', type: 'workflow-step', text: 'Execute Ability', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-2', type: 'agent-activity', time: '3:00 PM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Found taxi service — NYC Yellow Cab dispatch', capability: 'KNOWLEDGE BASE' },

  { id: 'ws-3', type: 'workflow-step', text: 'Respond to Caller', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'ai-response', time: '3:01 PM', text: 'I can arrange a taxi to JFK for tomorrow at 6 AM. The estimated fare is $55-70 depending on traffic. Shall I confirm that for you?' },
  { id: 'e-4', type: 'guest-message', time: '3:01 PM', text: 'Yes please, and can you make sure they have room for two large suitcases?' },
  { id: 'e-5', type: 'ai-response', time: '3:01 PM', text: 'Absolutely! I\'ve booked a sedan with extra luggage space for 6 AM pickup at the hotel entrance. The driver will be waiting with a sign for Sharma. Is there anything else I can help with?' },
  { id: 'e-6', type: 'guest-message', time: '3:02 PM', text: 'That\'s perfect, thank you!' },

  { id: 'e-7', type: 'system-event', time: '3:02 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Call completed — 1m 45s, resolved by AI', capability: 'CALLS' },
];


// ============================================================================
// Front Desk Agent — new timelines
// ============================================================================

// fd-1: Brooklyn Simmons — multi-workflow conversation (FAQ + Upsell + Service Ticket)
const FD_MULTI_WORKFLOW_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  // --- Workflow 1: FAQ ---
  { id: 'e-1', type: 'guest-message', time: '4:10 PM', text: 'What time does the pool close tonight?' },

  { id: 'tr-1', type: 'trigger', time: '4:10 PM', text: 'Information Request Detected', triggerDescription: 'Guest asks about hotel amenities' },

  { id: 'ws-1', type: 'workflow-step', text: 'Search Knowledge Base', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-2', type: 'agent-activity', time: '4:10 PM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Found answer — pool hours', capability: 'KNOWLEDGE BASE' },

  { id: 'ws-2', type: 'workflow-step', text: 'Compose Response', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'ai-response', time: '4:10 PM', text: 'The pool is open until 10 PM tonight. Towels are available at the pool deck, and the hot tub closes at 9:30 PM. Enjoy your swim!' },

  // --- Workflow 2: Upsell ---
  { id: 'e-4', type: 'guest-message', time: '4:12 PM', text: 'Thanks! Also, is late checkout available tomorrow? I have a 4pm flight.' },

  { id: 'tr-2', type: 'trigger', time: '4:12 PM', text: 'Upsell Opportunity Detected', triggerDescription: 'Guest mentions late departure' },

  { id: 'ws-3', type: 'workflow-step', text: 'Search Available Upsells', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-5', type: 'agent-activity', time: '4:12 PM', icon: mdiTagOutline, iconColor: '#D97706', text: 'Late checkout available — $50',
    capability: 'UPSELLS',
    isExpandable: true,
    details: [
      { label: 'Upsell', value: 'Late Checkout (2:00 PM)' },
      { label: 'Price', value: '$50.00' },
      { label: 'Availability', value: 'Available', status: 'success' },
    ],
  },

  { id: 'ws-4', type: 'workflow-step', text: 'Present Offer', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-6', type: 'ai-response', time: '4:12 PM', text: 'Yes! We offer late checkout until 2 PM for $50. That should give you plenty of time before your 4 PM flight. Would you like me to add it to your reservation?' },

  // --- Workflow 3: Service Ticket ---
  { id: 'e-7', type: 'guest-message', time: '4:15 PM', text: 'Perfect, add it. Oh and the AC in my room has been making a weird noise' },

  { id: 'tr-3', type: 'trigger', time: '4:15 PM', text: 'Service Request Detected', triggerDescription: 'Guest reports room maintenance issue' },

  { id: 'ws-5', type: 'workflow-step', text: 'Identify Issue', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-8', type: 'agent-activity', time: '4:15 PM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Matched — HVAC/AC issue', capability: 'KNOWLEDGE BASE' },

  { id: 'ws-6', type: 'workflow-step', text: 'Gather Details', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-9', type: 'agent-activity', time: '4:16 PM', icon: mdiAccountCheckOutline, iconColor: '#16A34A', text: 'Room 130 confirmed from reservation', capability: 'PMS' },

  { id: 'ws-7', type: 'workflow-step', text: 'Create Ticket', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-10', type: 'agent-activity', time: '4:16 PM', icon: mdiWrenchOutline, iconColor: '#16A34A', text: 'Ticket created — AC noise, Room 130, maintenance',
    capability: 'SERVICE TICKETS',
    isExpandable: true,
    details: [
      { label: 'Issue', value: 'AC unit making noise' },
      { label: 'Room', value: '130' },
      { label: 'Category', value: 'Maintenance — HVAC' },
      { label: 'Priority', value: 'Standard' },
    ],
  },

  { id: 'e-11', type: 'ai-response', time: '4:17 PM', text: "I've added late checkout to your reservation and created a maintenance request for the AC. Our maintenance team has been notified and should take a look shortly. Is there anything else I can help with?" },

  { id: 'e-12', type: 'system-event', time: '4:20 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: '3 workflows completed — FAQ, Upsell, Service Request', capability: 'MESSAGING' },
];

// fd-2: Marco Bitanga-Sevilla — booking completed
const FD_BOOKING_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-1', type: 'guest-message', time: '3:40 PM', text: 'Hi, I\'d like to book a room for March 20-22. Do you have any standard rooms available?' },

  { id: 'tr-1', type: 'trigger', time: '3:40 PM', text: 'Booking Intent Detected', triggerDescription: 'Guest asks about availability' },

  { id: 'ws-1', type: 'workflow-step', text: 'Check Availability', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '3:40 PM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Room availability confirmed for Mar 20-22',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Room Type', value: 'Standard King' },
      { label: 'Dates', value: 'March 20-22, 2026' },
      { label: 'Rate', value: '$199/night (CLUB MEMBER)' },
      { label: 'Availability', value: 'Available', status: 'success' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Present Options', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'ai-response', time: '3:41 PM', text: 'Great news! We have Standard King rooms available for March 20-22 at $199 per night with your Club Member rate. That would be $398 plus tax for 2 nights. Shall I go ahead and book this for you?' },

  { id: 'e-4', type: 'guest-message', time: '3:42 PM', text: 'Yes please, go ahead and book it.' },

  { id: 'ws-3', type: 'workflow-step', text: 'Process Booking', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-5', type: 'agent-activity', time: '3:43 PM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Reservation created in PMS — Room 112',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Confirmation', value: '#CTL-74291' },
      { label: 'Room', value: '112 — Standard King' },
      { label: 'Dates', value: 'March 20-22, 2026' },
      { label: 'Rate', value: '$199/night (CLUB MEMBER)', status: 'success' },
    ],
  },

  { id: 'ws-4', type: 'workflow-step', text: 'Send Confirmation', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-6', type: 'ai-response', time: '3:45 PM', text: 'Your reservation is confirmed! Here are the details:\n\n- Confirmation: #CTL-74291\n- Room 112, Standard King\n- March 20-22, 2026\n- Rate: $199/night\n\nYou\'ll receive a check-in link via SMS before your arrival. See you soon!' },

  { id: 'e-7', type: 'system-event', time: '3:45 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Booking Request workflow completed', capability: 'MESSAGING' },
];

// fd-3: Thomas Kim — escalated to front desk
const FD_ESCALATION_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-1', type: 'guest-message', time: '2:20 PM', text: 'There\'s an extra charge on my bill for $85 that I didn\'t authorize. Can someone explain this?' },

  { id: 'tr-1', type: 'trigger', time: '2:20 PM', text: 'Escalation Required', triggerDescription: 'Guest reports billing discrepancy — staff-only topic' },

  { id: 'ws-1', type: 'workflow-step', text: 'Determine Escalation Reason', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '2:20 PM', icon: mdiClipboardTextOutline, iconColor: '#F59E0B', text: 'Billing dispute detected — staff-only topic',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'Reason', value: 'Billing dispute' },
      { label: 'Policy', value: 'Staff-only topic — cannot auto-resolve' },
      { label: 'Priority', value: 'Standard' },
    ],
  },

  { id: 'e-3', type: 'ai-response', time: '2:21 PM', text: 'I understand your concern about the charge, Thomas. Let me connect you with our front desk team who can review your bill in detail and resolve this right away.' },

  { id: 'ws-2', type: 'workflow-step', text: 'Notify Staff', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-4', type: 'agent-activity', time: '2:22 PM', icon: mdiMessageTextOutline, iconColor: '#16A34A', text: 'Escalation sent to front desk manager with conversation context', capability: 'MESSAGING' },

  { id: 'e-5', type: 'system-event', time: '2:30 PM', icon: mdiCheckCircleOutline, iconColor: '#F59E0B', text: 'Escalation workflow completed — handed off to staff', capability: 'MESSAGING' },
];

// fd-4: Chloe Dubois — in-progress booking
const FD_INPROGRESS_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-1', type: 'guest-message', time: '2:15 PM', text: 'Hi, is the spa open on Sundays? I\'d like to book a massage' },

  { id: 'tr-1', type: 'trigger', time: '2:15 PM', text: 'Booking Intent Detected', triggerDescription: 'Guest asks about availability' },

  { id: 'ws-1', type: 'workflow-step', text: 'Check Availability', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '2:15 PM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Spa schedule confirmed — open Sundays 9 AM-7 PM',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: '60-min Swedish Massage', value: '11:00 AM available', status: 'success' },
      { label: '60-min Deep Tissue', value: '1:00 PM available', status: 'success' },
      { label: '90-min Hot Stone', value: '3:00 PM available', status: 'success' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Present Options', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'ai-response', time: '2:16 PM', text: 'Yes, the spa is open Sundays from 9 AM to 7 PM! Here are available massage slots:\n\n- 11:00 AM — Swedish Massage (60 min) — $120\n- 1:00 PM — Deep Tissue (60 min) — $140\n- 3:00 PM — Hot Stone (90 min) — $180\n\nWould you like to book one of these?' },
  { id: 'e-4', type: 'guest-message', time: '2:17 PM', text: 'The deep tissue at 1pm sounds great!' },

  { id: 'ws-3', type: 'workflow-step', text: 'Process Booking', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-5', type: 'agent-activity', time: '2:18 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Spa appointment booked — Deep Tissue, 1:00 PM Sunday', capability: 'PMS' },
  { id: 'e-6', type: 'ai-response', time: '2:18 PM', text: 'You\'re all set! Deep Tissue massage booked for Sunday at 1:00 PM ($140). Please arrive 15 minutes early. The spa is on the 3rd floor. Enjoy!' },

  { id: 'e-7', type: 'system-event', time: '2:18 PM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Booking Request workflow completed', capability: 'MESSAGING' },
];


// ============================================================================
// Email Reservation Agent — new timelines
// ============================================================================

// er-1: Michael Torres — completed cancellation
const EMAIL_CANCEL_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-0', type: 'guest-message', time: '9:38 AM', text: 'Hello,\n\nI need to cancel my reservation #CTL-88421 for March 28-30. A family emergency came up and we won\'t be able to make the trip.\n\nPlease confirm the cancellation.\n\nThank you,\nMichael Torres' },

  { id: 'tr-1', type: 'trigger', time: '9:38 AM', text: 'Cancellation Email Received', triggerDescription: 'Inbound email matching cancellation keywords' },

  // Step 1: Parse Email Content
  { id: 'ws-1', type: 'workflow-step', text: 'Parse Email Content', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '9:38 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Extracted reservation details from email',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Confirmation', value: '#CTL-88421' },
      { label: 'Dates', value: 'March 28-30, 2026' },
      { label: 'Reason', value: 'Family emergency' },
      { label: 'Guest', value: 'Michael Torres' },
    ],
  },

  // Step 2: Validate Cancellation Policy
  { id: 'ws-2', type: 'workflow-step', text: 'Validate Cancellation Policy', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '9:39 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Free cancellation window — no charge applies',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Policy', value: 'Free cancellation (72+ hours before arrival)' },
      { label: 'Check-in Date', value: 'March 28, 2026' },
      { label: 'Cancellation Date', value: 'Today (26+ days before)' },
      { label: 'Penalty', value: 'None', status: 'success' },
    ],
  },

  // Step 3: Update PMS
  { id: 'ws-3', type: 'workflow-step', text: 'Update PMS', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'agent-activity', time: '9:40 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Reservation cancelled, inventory released', capability: 'PMS' },

  // Step 4: Send Confirmation
  { id: 'ws-4', type: 'workflow-step', text: 'Send Confirmation', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '9:41 AM', icon: mdiEmailOutline, iconColor: '#16A34A', text: 'Cancellation confirmation sent to michael.torres@email.com',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'To', value: 'michael.torres@email.com' },
      { label: 'Subject', value: 'Cancellation Confirmed — #CTL-88421' },
      { label: 'Charges', value: 'No charges applied' },
      { label: 'Refund', value: 'N/A — no deposit collected' },
    ],
  },

  { id: 'e-5', type: 'system-event', time: '9:42 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Cancellation processed — no charge', capability: 'PMS' },
];

// er-2: Jennifer Walsh — modification
const EMAIL_MODIFY_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-0', type: 'guest-message', time: '9:10 AM', text: 'Hi there,\n\nI need to change the dates on my reservation #CTL-90315. Currently booked for April 12-14, but I need to push it to April 19-21 instead. Same room type is fine.\n\nThanks,\nJennifer Walsh' },

  { id: 'tr-1', type: 'trigger', time: '9:10 AM', text: 'Modification Email Received', triggerDescription: 'Inbound email matching modification keywords — change dates' },

  { id: 'ws-1', type: 'workflow-step', text: 'Parse Modification Request', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '9:10 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Extracted modification details',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Confirmation', value: '#CTL-90315' },
      { label: 'Current Dates', value: 'April 12-14, 2026' },
      { label: 'New Dates', value: 'April 19-21, 2026' },
      { label: 'Room Type', value: 'No change requested' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Validate Changes', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '9:11 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'New dates available at same rate',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'New Dates', value: 'April 19-21 available', status: 'success' },
      { label: 'Room Type', value: 'Standard King — available', status: 'success' },
      { label: 'Rate Impact', value: 'Same rate ($219/night)', status: 'success' },
    ],
  },

  { id: 'ws-3', type: 'workflow-step', text: 'Update PMS', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'agent-activity', time: '9:12 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Reservation dates updated in PMS', capability: 'PMS' },

  { id: 'ws-4', type: 'workflow-step', text: 'Send Confirmation', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '9:14 AM', icon: mdiEmailOutline, iconColor: '#16A34A', text: 'Modification confirmation sent to jennifer.walsh@email.com',
    capability: 'MESSAGING',
    isExpandable: true,
    details: [
      { label: 'To', value: 'jennifer.walsh@email.com' },
      { label: 'Subject', value: 'Reservation Updated — #CTL-90315' },
      { label: 'New Dates', value: 'April 19-21, 2026' },
      { label: 'Rate', value: '$219/night (unchanged)' },
    ],
  },

  { id: 'e-5', type: 'system-event', time: '9:15 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Modification processed — dates shifted Apr 12-14 to Apr 19-21', capability: 'PMS' },
];

// er-3: Robert Kim — flagged for revenue manager
const EMAIL_FLAGGED_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-0', type: 'guest-message', time: '8:50 AM', text: 'Hello,\n\nI\'d like to cancel my reservation #CTL-77102 for April 3-5. I know the rate was non-refundable, but I\'m hoping you can make an exception as my plans changed due to a medical issue.\n\nRegards,\nRobert Kim' },

  { id: 'tr-1', type: 'trigger', time: '8:50 AM', text: 'Cancellation Email Received', triggerDescription: 'Inbound email matching cancellation keywords' },

  { id: 'ws-1', type: 'workflow-step', text: 'Parse Email Content', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '8:51 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Extracted reservation details',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Confirmation', value: '#CTL-77102' },
      { label: 'Dates', value: 'April 3-5, 2026' },
      { label: 'Reason', value: 'Medical issue' },
      { label: 'Note', value: 'Guest acknowledges non-refundable rate' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Validate Cancellation Policy', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '8:52 AM', icon: mdiDatabaseOutline, iconColor: '#F59E0B', text: 'Non-refundable rate — cannot auto-cancel',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Rate Type', value: 'Non-refundable' },
      { label: 'Penalty', value: 'Full stay charge ($438)', status: 'error' },
      { label: 'Policy', value: 'Requires revenue manager approval' },
    ],
  },

  { id: 'ws-3', type: 'workflow-step', text: 'Escalate Exceptions', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'agent-activity', time: '8:55 AM', icon: mdiMessageTextOutline, iconColor: '#F59E0B', text: 'Flagged for revenue manager — non-refundable rate exception request', capability: 'MESSAGING' },

  { id: 'e-4', type: 'system-event', time: '8:58 AM', icon: mdiCheckCircleOutline, iconColor: '#F59E0B', text: 'Escalated to revenue manager — awaiting decision', capability: 'PMS' },
];

// er-4: Amanda Liu — in-progress cancellation
const EMAIL_INPROGRESS_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-0', type: 'guest-message', time: '10:30 AM', text: 'Hi,\n\nPlease cancel reservation #CTL-93102 for April 5-7. My conference was moved to a different city.\n\nThanks,\nAmanda Liu' },

  { id: 'tr-1', type: 'trigger', time: '10:30 AM', text: 'Cancellation Email Received', triggerDescription: 'Inbound email matching cancellation keywords' },

  // Step 1
  { id: 'ws-1', type: 'workflow-step', text: 'Parse Email Content', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '10:30 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Extracted reservation details',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Confirmation', value: '#CTL-93102' },
      { label: 'Dates', value: 'April 5-7, 2026' },
      { label: 'Reason', value: 'Conference relocated' },
    ],
  },

  // Step 2
  { id: 'ws-2', type: 'workflow-step', text: 'Validate Cancellation Policy', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '10:30 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Policy validated — free cancellation window',
    capability: 'PMS',
    isExpandable: true,
    details: [
      { label: 'Rate Type', value: 'Flexible' },
      { label: 'Cancellation Window', value: '48+ hours before check-in', status: 'success' },
      { label: 'Penalty', value: 'None — free cancellation' },
    ],
  },

  // Step 3
  { id: 'ws-3', type: 'workflow-step', text: 'Update PMS', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'agent-activity', time: '10:31 AM', icon: mdiDatabaseOutline, iconColor: '#16A34A', text: 'Reservation cancelled in PMS — inventory released', capability: 'PMS' },

  // Step 4
  { id: 'ws-4', type: 'workflow-step', text: 'Send Confirmation', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-4', type: 'agent-activity', time: '10:31 AM', icon: mdiSendOutline, iconColor: '#16A34A', text: 'Cancellation confirmation sent to amanda.liu@email.com', capability: 'MESSAGING' },

  { id: 'e-5', type: 'system-event', time: '10:31 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Cancellation processed — no charge, 38s total', capability: 'PMS' },
];


// ============================================================================
// Service Ticket Agent — new timelines
// ============================================================================

// st-1: Lucia Rossi — extra blankets resolved
const ST_BLANKETS_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-0', type: 'guest-message', time: '7:45 AM', text: 'Can someone bring extra blankets to room 226?' },

  { id: 'tr-1', type: 'trigger', time: '7:45 AM', text: 'Service Request Detected', triggerDescription: 'Guest message identified as service request' },

  // Step 1: Analyze Guest Message
  { id: 'ws-1', type: 'workflow-step', text: 'Analyze Guest Message', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '7:45 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Request type — housekeeping, extra blankets',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Category', value: 'Housekeeping' },
      { label: 'Item', value: 'Extra blankets' },
      { label: 'Room', value: '226' },
      { label: 'Urgency', value: 'Routine' },
    ],
  },

  // Step 2: Match Ticket Type
  { id: 'ws-2', type: 'workflow-step', text: 'Match Ticket Type', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-2', type: 'agent-activity', time: '7:45 AM', icon: mdiTicketConfirmationOutline, iconColor: '#16A34A', text: 'Matched — Housekeeping: Extra Amenities', capability: 'SERVICE TICKETS' },

  // Step 3: Acknowledge Guest
  { id: 'ws-3', type: 'workflow-step', text: 'Acknowledge Guest', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'ai-response', time: '7:46 AM', text: 'Of course! I\'ve requested extra blankets for Room 226. Our housekeeping team will bring them up shortly — usually within 15-20 minutes.' },

  // Step 4: Create Recommended Ticket
  { id: 'ws-4', type: 'workflow-step', text: 'Create Recommended Ticket', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '7:46 AM', icon: mdiWrenchOutline, iconColor: '#16A34A', text: 'Ticket created — Extra blankets, Room 226',
    capability: 'SERVICE TICKETS',
    isExpandable: true,
    details: [
      { label: 'Ticket Type', value: 'Housekeeping: Extra Amenities' },
      { label: 'Room', value: '226' },
      { label: 'Priority', value: 'Standard' },
      { label: 'Status', value: 'Pending staff review' },
    ],
  },

  // Step 5: Staff Review
  { id: 'ws-5', type: 'workflow-step', text: 'Staff Review', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-5', type: 'agent-activity', time: '7:50 AM', icon: mdiAccountCheckOutline, iconColor: '#16A34A', text: 'Approved by Theresa Webb', capability: 'SERVICE TICKETS' },

  // Step 6: Track Resolution
  { id: 'ws-6', type: 'workflow-step', text: 'Track Resolution', stepNumber: 6, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-6', type: 'agent-activity', time: '8:15 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Delivered — 45 min total', capability: 'SERVICE TICKETS' },

  { id: 'e-7', type: 'ai-response', time: '8:30 AM', text: 'Your extra blankets have been delivered to Room 226! Let me know if you need anything else.' },

  { id: 'e-8', type: 'system-event', time: '8:30 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Service ticket resolved — 45 min', capability: 'SERVICE TICKETS' },
];

// st-2: Andre Williams — AC repair in progress
const ST_AC_REPAIR_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-0', type: 'guest-message', time: '9:55 PM', text: 'The AC in my room is completely broken. It\'s blowing warm air and it\'s really hot in here.' },

  { id: 'tr-1', type: 'trigger', time: '9:55 PM', text: 'Service Request Detected', triggerDescription: 'Guest message identified as service request' },

  { id: 'ws-1', type: 'workflow-step', text: 'Analyze Guest Message', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '9:55 PM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Request type — maintenance, HVAC repair',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Category', value: 'Maintenance' },
      { label: 'Issue', value: 'AC blowing warm air' },
      { label: 'Room', value: '124' },
      { label: 'Urgency', value: 'High (comfort issue)' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Match Ticket Type', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-2', type: 'agent-activity', time: '9:56 PM', icon: mdiTicketConfirmationOutline, iconColor: '#16A34A', text: 'Matched — Maintenance: HVAC Repair', capability: 'SERVICE TICKETS' },

  { id: 'ws-3', type: 'workflow-step', text: 'Acknowledge Guest', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'ai-response', time: '9:56 PM', text: 'I\'m sorry about the AC issue, Andre. I\'ve flagged this as high priority and our maintenance team is being notified right now. In the meantime, I can have a fan sent up to your room. Would that help?' },

  { id: 'ws-4', type: 'workflow-step', text: 'Create Recommended Ticket', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '9:57 PM', icon: mdiWrenchOutline, iconColor: '#16A34A', text: 'Ticket created — AC repair, Room 124, high priority',
    capability: 'SERVICE TICKETS',
    isExpandable: true,
    details: [
      { label: 'Ticket Type', value: 'Maintenance: HVAC Repair' },
      { label: 'Room', value: '124' },
      { label: 'Priority', value: 'High' },
      { label: 'Status', value: 'Pending staff review' },
    ],
  },

  { id: 'ws-5', type: 'workflow-step', text: 'Staff Review', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-5', type: 'agent-activity', time: '10:02 PM', icon: mdiAccountCheckOutline, iconColor: '#16A34A', text: 'Approved — maintenance dispatched', capability: 'SERVICE TICKETS' },

  { id: 'ws-6', type: 'workflow-step', text: 'Track Resolution', stepNumber: 6 },
  { id: 'e-6', type: 'agent-activity', time: '10:10 PM', icon: mdiClockOutline, text: 'Maintenance en route — ETA 10 minutes', capability: 'SERVICE TICKETS' },
];

// st-3: Fatima Al-Hassan — suite upgrade issue resolved
const ST_SUITE_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-0', type: 'guest-message', time: '9:30 AM', text: 'Hi, I was supposed to be upgraded to a suite but my room key only works for a standard room. Can you fix this?' },

  { id: 'tr-1', type: 'trigger', time: '9:30 AM', text: 'Service Request Detected', triggerDescription: 'Guest message identified as service request' },

  { id: 'ws-1', type: 'workflow-step', text: 'Analyze Guest Message', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-1', type: 'agent-activity', time: '9:30 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Request type — room/key issue, suite upgrade mismatch',
    capability: 'KNOWLEDGE BASE',
    isExpandable: true,
    details: [
      { label: 'Category', value: 'Room Assignment' },
      { label: 'Issue', value: 'Key assigned to wrong room' },
      { label: 'Room', value: '602' },
      { label: 'Expected', value: 'Suite upgrade' },
    ],
  },

  { id: 'ws-2', type: 'workflow-step', text: 'Match Ticket Type', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-2', type: 'agent-activity', time: '9:31 AM', icon: mdiTicketConfirmationOutline, iconColor: '#16A34A', text: 'Matched — Front Desk: Room Assignment Error', capability: 'SERVICE TICKETS' },

  { id: 'ws-3', type: 'workflow-step', text: 'Acknowledge Guest', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'ai-response', time: '9:31 AM', text: 'I\'m sorry about the inconvenience, Fatima. I see the upgrade was confirmed but the key wasn\'t updated. I\'ve flagged this for immediate attention. Our front desk team will have this sorted out for you within a few minutes.' },

  { id: 'ws-4', type: 'workflow-step', text: 'Create Recommended Ticket', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-4', type: 'agent-activity', time: '9:32 AM', icon: mdiWrenchOutline, iconColor: '#16A34A', text: 'Ticket created — Room key reissue for suite, Room 602',
    capability: 'SERVICE TICKETS',
    isExpandable: true,
    details: [
      { label: 'Ticket Type', value: 'Front Desk: Room Assignment Error' },
      { label: 'Room', value: '602' },
      { label: 'Priority', value: 'High (guest waiting)' },
    ],
  },

  { id: 'ws-5', type: 'workflow-step', text: 'Staff Review', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-5', type: 'agent-activity', time: '9:35 AM', icon: mdiAccountCheckOutline, iconColor: '#16A34A', text: 'Approved — front desk reissuing key', capability: 'SERVICE TICKETS' },

  { id: 'ws-6', type: 'workflow-step', text: 'Track Resolution', stepNumber: 6, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-6', type: 'agent-activity', time: '9:50 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Resolved — new key encoded for suite 602', capability: 'SERVICE TICKETS' },

  { id: 'e-7', type: 'ai-response', time: '10:00 AM', text: 'Great news, Fatima! Your key has been updated for the suite. You can pick up the new key at the front desk, or if you prefer, we can have someone bring it to your room. Enjoy your upgrade!' },

  { id: 'e-8', type: 'system-event', time: '10:00 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Service ticket resolved — 30 min', capability: 'SERVICE TICKETS' },
];

// st-4: Maya Patel — in-progress drain issue
const ST_INPROGRESS_TIMELINE: TimelineEvent[] = [
  { id: 'ds-1', type: 'date-separator', text: 'Today' },

  { id: 'e-0', type: 'guest-message', time: '11:00 AM', text: 'The shower drain in our bathroom seems to be blocked. Water is pooling and it\'s not draining at all.' },

  { id: 'tr-1', type: 'trigger', time: '11:00 AM', text: 'Service Request Detected', triggerDescription: 'Guest message identified as service request' },

  // Step 1
  { id: 'ws-1', type: 'workflow-step', text: 'Analyze Guest Message', stepNumber: 1, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-1', type: 'agent-activity', time: '11:00 AM', icon: mdiBookOpenPageVariantOutline, iconColor: '#16A34A', text: 'Issue identified — Plumbing: blocked drain, Room 331', capability: 'KNOWLEDGE BASE' },

  // Step 2
  { id: 'ws-2', type: 'workflow-step', text: 'Match Ticket Type', stepNumber: 2, icon: mdiCheckAll, iconColor: '#16A34A' },
  {
    id: 'e-2', type: 'agent-activity', time: '11:01 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Matched — Maintenance: Plumbing Issue',
    capability: 'SERVICE TICKETS',
    isExpandable: true,
    details: [
      { label: 'Category', value: 'Maintenance' },
      { label: 'Type', value: 'Plumbing Issue' },
      { label: 'Priority', value: 'High — guest impact' },
      { label: 'Room', value: '331' },
    ],
  },

  // Step 3
  { id: 'ws-3', type: 'workflow-step', text: 'Acknowledge Guest', stepNumber: 3, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-3', type: 'ai-response', time: '11:01 AM', text: 'I\'m sorry about the blocked drain, Maya. I\'ve flagged this as a priority maintenance request for Room 331. Our plumbing team has been notified and should be there within 30 minutes. I\'ll follow up once it\'s resolved.' },

  // Step 4
  { id: 'ws-4', type: 'workflow-step', text: 'Create Recommended Ticket', stepNumber: 4, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-4', type: 'agent-activity', time: '11:02 AM', icon: mdiFileDocumentOutline, iconColor: '#16A34A', text: 'Ticket created — Plumbing: Blocked Drain, Room 331', capability: 'SERVICE TICKETS' },

  // Step 5
  { id: 'ws-5', type: 'workflow-step', text: 'Staff Review', stepNumber: 5, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-5', type: 'agent-activity', time: '11:05 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Approved by Theresa Webb — dispatched to maintenance', capability: 'SERVICE TICKETS' },

  // Step 6
  { id: 'ws-6', type: 'workflow-step', text: 'Track Resolution', stepNumber: 6, icon: mdiCheckAll, iconColor: '#16A34A' },
  { id: 'e-6', type: 'agent-activity', time: '11:25 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Maintenance completed — drain cleared', capability: 'SERVICE TICKETS' },
  { id: 'e-7', type: 'ai-response', time: '11:26 AM', text: 'Good news, Maya! Our maintenance team has cleared the drain in your bathroom. Everything should be working normally now. Please let me know if you have any other issues.' },
  { id: 'e-8', type: 'guest-message', time: '11:28 AM', text: 'It\'s working now, thank you so much for the quick fix!' },

  { id: 'e-9', type: 'system-event', time: '11:28 AM', icon: mdiCheckCircleOutline, iconColor: '#16A34A', text: 'Service ticket resolved — 28 min total', capability: 'SERVICE TICKETS' },
];


// ============================================================================
// Export — Record<inquiryId, { events, animated? }>
// ============================================================================

export const timelineData: Record<string, { events: TimelineEvent[]; animated?: boolean }> = {
  // --- Sales & Events Agent ---
  'inq-1': { events: SALES_COMPLETED_TIMELINE },
  'inq-2': { events: SALES_WEDDING_TIMELINE },
  'inq-3': { events: SALES_INPROGRESS_TIMELINE, animated: true },  // Lisa Park — animated in-progress
  'inq-4': { events: SALES_DINNER_TIMELINE },
  'inq-5': { events: SALES_CONFERENCE_TIMELINE },

  // --- Alex (Voice AI Agent) ---
  'alex-1': { events: ALEX_PARKING_TIMELINE },
  'alex-2': { events: ALEX_RESTAURANT_TIMELINE },
  'alex-3': { events: ALEX_ROOMSERVICE_TIMELINE },
  'alex-4': { events: ALEX_INPROGRESS_TIMELINE, animated: true },

  // --- Front Desk Agent ---
  'fd-1': { events: FD_MULTI_WORKFLOW_TIMELINE },
  'fd-2': { events: FD_BOOKING_TIMELINE },
  'fd-3': { events: FD_ESCALATION_TIMELINE },
  'fd-4': { events: FD_INPROGRESS_TIMELINE, animated: true },

  // --- Check-in Processing Agent ---
  'ci-1': { events: CHECKIN_EMILY_TIMELINE },
  'ci-2': { events: CHECKIN_BROOKLYN_TIMELINE },
  'ci-3': { events: CHECKIN_FLAGGED_TIMELINE },
  'ci-4': { events: CHECKIN_INPROGRESS_TIMELINE, animated: true },

  // --- Email Reservation Agent ---
  'er-1': { events: EMAIL_CANCEL_TIMELINE },
  'er-2': { events: EMAIL_MODIFY_TIMELINE },
  'er-3': { events: EMAIL_FLAGGED_TIMELINE },
  'er-4': { events: EMAIL_INPROGRESS_TIMELINE, animated: true },

  // --- Service Ticket Agent ---
  'st-1': { events: ST_BLANKETS_TIMELINE },
  'st-2': { events: ST_AC_REPAIR_TIMELINE },
  'st-3': { events: ST_SUITE_TIMELINE },
  'st-4': { events: ST_INPROGRESS_TIMELINE, animated: true },
};
