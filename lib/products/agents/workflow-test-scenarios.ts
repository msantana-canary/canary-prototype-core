export interface TestPersona {
  id: string;
  name: string;
  avatar: string;
  tier?: string;
  description: string;
}

export interface TestScenarioEvent {
  type: 'trigger' | 'guest-message' | 'agent-response' | 'system-note' | 'condition-match' | 'guardrail-check';
  content: string;
  activeStepId?: string;
  matchedConditionId?: string;
  delay: number;
}

export interface TestScenario {
  id: string;
  workflowId: string;
  persona: TestPersona;
  events: TestScenarioEvent[];
}

const personas: Record<string, TestPersona> = {
  corporateBooker: {
    id: 'persona-corp',
    name: 'Sarah Chen',
    avatar: 'SC',
    description: 'Corporate travel manager booking a team retreat for 45 people',
  },
  frustratedVip: {
    id: 'persona-vip',
    name: 'Robert Hartley',
    avatar: 'RH',
    tier: 'DIAMOND ELITE',
    description: 'Long-time Diamond Elite guest who had a bad experience last stay',
  },
  firstTimeGuest: {
    id: 'persona-first',
    name: 'Anika Patel',
    avatar: 'AP',
    description: 'First-time guest arriving tomorrow, needs parking and restaurant info',
  },
  weddingPlanner: {
    id: 'persona-wedding',
    name: 'Michelle Torres',
    avatar: 'MT',
    description: 'Wedding planner inquiring about a 120-guest reception for next spring',
  },
  coldLead: {
    id: 'persona-cold',
    name: 'David Park',
    avatar: 'DP',
    description: 'Sent a proposal 5 days ago for a corporate offsite — no response yet',
  },
  serviceRequest: {
    id: 'persona-service',
    name: 'James Liu',
    avatar: 'JL',
    tier: 'GOLD ELITE',
    description: 'In-house guest reporting a broken AC unit at 11 PM',
  },
  checkinGuest: {
    id: 'persona-checkin',
    name: 'Emily Nakamura',
    avatar: 'EN',
    tier: 'PLATINUM ELITE',
    description: 'Platinum member completing mobile check-in with an upgrade request',
  },
  checkoutDispute: {
    id: 'persona-checkout',
    name: 'Mark Stevens',
    avatar: 'MS',
    description: 'Guest checking out who disputes a minibar charge on the folio',
  },
};

export const testScenarios: TestScenario[] = [
  // ── Front Desk: Booking Request ──────────────────────────────────
  {
    id: 'test-fd-booking-corp',
    workflowId: 'wf-fd-booking',
    persona: personas.corporateBooker,
    events: [
      { type: 'trigger', content: 'Booking intent detected — incoming webchat message', delay: 0 },
      { type: 'guest-message', content: 'Hi, I need to book rooms for our annual team retreat. We need about 15 rooms for March 20-22. Do you have availability? We have a corporate rate code CORP.', delay: 800 },
      { type: 'system-note', content: 'Step 1: Check Availability — querying PMS for March 20-22', activeStepId: 'fdb-s1', delay: 1200 },
      { type: 'condition-match', content: 'Matched: If rooms available → Present options with rates', matchedConditionId: 'fdb-c1', activeStepId: 'fdb-s1', delay: 1800 },
      { type: 'condition-match', content: 'Matched: If guest mentions corporate travel → Ask for rate code CORP', matchedConditionId: 'fdb-c7', activeStepId: 'fdb-s1', delay: 2200 },
      { type: 'agent-response', content: 'Great news — we have 15+ rooms available for March 20-22! With your CORP rate, here are the options:\n\n• Standard King — $219/night (CORP rate)\n• Deluxe Double — $279/night (CORP rate)\n• Executive Suite — $389/night (CORP rate)\n\nWould you like to proceed with a room block? I can also check meeting space availability for your retreat.', activeStepId: 'fdb-s2', delay: 2800 },
      { type: 'guest-message', content: 'Perfect, let\'s do 10 Standard Kings and 5 Deluxe Doubles. Can you also check if there\'s a meeting room for 45 people?', delay: 4200 },
      { type: 'system-note', content: 'Step 3: Process Booking — creating room block in PMS', activeStepId: 'fdb-s3', delay: 4800 },
      { type: 'condition-match', content: 'Matched: If booking succeeds → Generate CTL confirmation', matchedConditionId: 'fdb-c4', activeStepId: 'fdb-s3', delay: 5400 },
      { type: 'agent-response', content: 'Your room block is confirmed!\n\n📋 Confirmation: CTL-28471\n📅 March 20-22, 2026\n🛏️ 10 Standard King + 5 Deluxe Double\n💰 Total: $7,470 (CORP rate applied)\n\nI\'ve also reserved Breakout Room A (capacity 45) for your retreat. Our 48-hour free cancellation policy applies. I\'ll send the full confirmation to your email now.', activeStepId: 'fdb-s4', delay: 6000 },
      { type: 'guardrail-check', content: '✓ Cancellation policy included in confirmation\n✓ Only offered rooms in property inventory\n✓ Corporate rate verified before applying', delay: 7000 },
    ],
  },
  {
    id: 'test-fd-booking-first',
    workflowId: 'wf-fd-booking',
    persona: personas.firstTimeGuest,
    events: [
      { type: 'trigger', content: 'Booking intent detected — incoming SMS message', delay: 0 },
      { type: 'guest-message', content: 'Hey, do you have any rooms available this weekend? Just for one night, Saturday.', delay: 800 },
      { type: 'system-note', content: 'Step 1: Check Availability — querying PMS for this Saturday', activeStepId: 'fdb-s1', delay: 1200 },
      { type: 'condition-match', content: 'Matched: If no availability for requested dates → Suggest alternative dates', matchedConditionId: 'fdb-c2', activeStepId: 'fdb-s1', delay: 1800 },
      { type: 'agent-response', content: 'Unfortunately, we\'re fully booked this Saturday — we have a large event in-house. But I do have availability for:\n\n• Friday night (May 15) — Standard King from $289\n• Sunday night (May 17) — Standard King from $249\n• Next Saturday (May 23) — all room types available\n\nWould any of these work for you?', activeStepId: 'fdb-s2', delay: 2400 },
      { type: 'guardrail-check', content: '✓ Never recommend competing properties — only suggested alternative dates', delay: 3200 },
    ],
  },

  // ── Front Desk: Service Request ──────────────────────────────────
  {
    id: 'test-fd-service-urgent',
    workflowId: 'wf-fd-ticket',
    persona: personas.serviceRequest,
    events: [
      { type: 'trigger', content: 'Service request detected — incoming SMS from Room 419', delay: 0 },
      { type: 'guest-message', content: 'The AC in room 419 is completely broken, it\'s blowing hot air. It\'s 11 PM and I can\'t sleep. Can someone fix this ASAP?', delay: 800 },
      { type: 'system-note', content: 'Step 1: Identify Issue — parsing request against ticket categories', activeStepId: 'fdt-s1', delay: 1200 },
      { type: 'condition-match', content: 'Matched: If maintenance/repair request → Route to Maintenance (ext. 300) via HotSOS', matchedConditionId: 'fdt-c5', activeStepId: 'fdt-s1', delay: 1800 },
      { type: 'agent-response', content: 'I\'m sorry about the AC issue, Mr. Liu. I\'ve flagged this as urgent for our maintenance team — someone will be at Room 419 within the hour. Given the late hour, I can also offer to move you to an available room immediately if you\'d prefer not to wait.', activeStepId: 'fdt-s2', delay: 2400 },
      { type: 'system-note', content: 'Step 3: Create Recommended Ticket — generating HotSOS ticket', activeStepId: 'fdt-s3', delay: 3200 },
      { type: 'agent-response', content: 'Ticket #HOS-4819 created: HVAC repair, Room 419, Priority: URGENT, 1-hour SLA. Maintenance team notified.', activeStepId: 'fdt-s3', delay: 3800 },
      { type: 'guardrail-check', content: '✓ Realistic SLA estimate provided (1 hour for maintenance)\n✓ No duplicate ticket created\n✓ Guest acknowledged promptly', delay: 4400 },
    ],
  },

  // ── Sales: Inquiry Response ──────────────────────────────────────
  {
    id: 'test-sales-wedding',
    workflowId: 'wf-sales-inquiry',
    persona: personas.weddingPlanner,
    events: [
      { type: 'trigger', content: 'Inquiry received — email from torres.events@gmail.com in sales inbox', delay: 0 },
      { type: 'guest-message', content: 'Hi there, I\'m a wedding planner looking for a venue for a reception next April. We\'re expecting about 120 guests, sit-down dinner with dancing after. The couple has a budget around $80K for the venue and catering. Do you have any Saturday availability in April 2027?', delay: 800 },
      { type: 'system-note', content: 'Step 1: Parse Details — extracting event type, dates, headcount, budget', activeStepId: 'se-s1', delay: 1400 },
      { type: 'condition-match', content: 'Matched: If wedding inquiry for Saturday → Check 12+ month advance calendar', matchedConditionId: 'cond-q5', activeStepId: 'se-s1', delay: 2000 },
      { type: 'system-note', content: 'Step 2: Check Availability — querying event spaces for April 2027 Saturdays', activeStepId: 'se-s2', delay: 2600 },
      { type: 'condition-match', content: 'Matched: If wedding with 100+ guests → Grand Ballroom or Starlight Terrace only', matchedConditionId: 'cond-a5', activeStepId: 'se-s2', delay: 3200 },
      { type: 'system-note', content: 'Step 3: Draft Response — composing personalized proposal', activeStepId: 'se-s3', delay: 3800 },
      { type: 'condition-match', content: 'Matched: If budget > $50K → Use VIP template, CC General Manager', matchedConditionId: 'cond-d3', activeStepId: 'se-s3', delay: 4200 },
      { type: 'condition-match', content: 'Matched: If wedding inquiry → Include coordinator, mention Bridal Suite', matchedConditionId: 'cond-d4', activeStepId: 'se-s3', delay: 4600 },
      { type: 'agent-response', content: 'Dear Michelle,\n\nThank you for considering The Statler for your client\'s wedding! We\'d be honored to host.\n\nFor a 120-guest reception, I recommend our Grand Ballroom (200 seated capacity) with the adjoining Starlight Terrace for cocktail hour.\n\n📅 April 2027 Saturday availability: April 5, April 12, April 26\n💰 Starting at $85/person plated dinner (est. $10,200 F&B minimum)\n🏨 Bridal Suite complimentary with reception booking\n👰 Our wedding coordinator Sarah Kim is available to discuss all details\n\nI\'d love to schedule a site visit. Would any afternoon next week work?\n\nWarm regards,\nThe Statler Events Team', activeStepId: 'se-s4', delay: 5200 },
      { type: 'system-note', content: 'Step 5: Follow Up — setting automated cadence', activeStepId: 'se-s5', delay: 6200 },
      { type: 'condition-match', content: 'Matched: If no response after 48 hours → Run Lead Follow-up Sequence', matchedConditionId: 'cond-f1', activeStepId: 'se-s5', delay: 6600 },
      { type: 'guardrail-check', content: '✓ Flagged for Director of Sales (event > $50K)\n✓ Cancellation policy will be included in formal proposal\n✓ Catering quote above $85/person minimum\n✓ Saturday lead time expectation set', delay: 7200 },
    ],
  },

  // ── Sales: Cold Lead ─────────────────────────────────────────────
  {
    id: 'test-sales-cold',
    workflowId: 'wf-cold-lead',
    persona: personas.coldLead,
    events: [
      { type: 'trigger', content: 'Silent lead detected — David Park, no response in 5 days after initial proposal', delay: 0 },
      { type: 'system-note', content: 'Step 1: Assess Lead Priority — checking event value and timeline', activeStepId: 'cl-s1', delay: 800 },
      { type: 'condition-match', content: 'Matched: If event value > $50K → High priority, follow up within 24 hours', matchedConditionId: 'cl-c3', activeStepId: 'cl-s1', delay: 1400 },
      { type: 'system-note', content: 'Step 2: Send Follow-up — composing 1st follow-up email', activeStepId: 'cl-s3', delay: 2000 },
      { type: 'condition-match', content: 'Matched: If 1st follow-up → Friendly check-in with updated availability', matchedConditionId: 'cl-c6', activeStepId: 'cl-s3', delay: 2400 },
      { type: 'agent-response', content: 'Hi David,\n\nJust following up on the proposal I sent for your corporate offsite (June 15-17, 35 attendees). I wanted to let you know that we\'ve had some interest in those dates, but I\'m holding your preferred space.\n\nI also wanted to share a few recent photos from a similar event we hosted last month — the feedback was fantastic.\n\nWould you have 10 minutes for a quick call this week? I\'d love to answer any questions.\n\nBest,\nThe Statler Events Team', activeStepId: 'cl-s3', delay: 3000 },
      { type: 'guardrail-check', content: '✓ Follow-up count: 1 of 3 maximum\n✓ Not sent on weekend\n✓ References original proposal details', delay: 3800 },
    ],
  },

  // ── Check-in: Process Submission ─────────────────────────────────
  {
    id: 'test-ci-platinum',
    workflowId: 'wf-ci-process',
    persona: personas.checkinGuest,
    events: [
      { type: 'trigger', content: 'Check-in submitted — Emily Nakamura, Platinum Elite, Res #CTL-39201', delay: 0 },
      { type: 'system-note', content: 'Step 1: Validate Completeness — checking required fields', activeStepId: 'cip-s1', delay: 800 },
      { type: 'condition-match', content: 'Matched: If ID verification required → Run ID Verification Review', matchedConditionId: 'cip-c2', activeStepId: 'cip-s1', delay: 1400 },
      { type: 'condition-match', content: 'Matched: If deposit or payment required → Run Payment Reconciliation', matchedConditionId: 'cip-c11', activeStepId: 'cip-s1', delay: 1800 },
      { type: 'system-note', content: 'Sub-workflow: ID Verification Review — processing uploaded driver\'s license', delay: 2200 },
      { type: 'system-note', content: 'Sub-workflow: Payment Reconciliation — $100/night hold authorized via Stripe', delay: 2800 },
      { type: 'system-note', content: 'Step 2: Sync to PMS — pushing data to Oracle Opera', activeStepId: 'cip-s2', delay: 3400 },
      { type: 'condition-match', content: 'Matched: If auto-post enabled and sync succeeds → Log CTL confirmation', matchedConditionId: 'cip-c3', activeStepId: 'cip-s2', delay: 3800 },
      { type: 'system-note', content: 'Step 3: Auto-verify Eligibility — all verifications pass', activeStepId: 'cip-s3', delay: 4200 },
      { type: 'condition-match', content: 'Matched: If all verifications pass → Run Room Assignment & Key', matchedConditionId: 'cip-c6', activeStepId: 'cip-s3', delay: 4600 },
      { type: 'condition-match', content: 'Matched: If upsells were accepted → Run Upsell Processing', matchedConditionId: 'cip-c12', activeStepId: 'cip-s3', delay: 5000 },
      { type: 'system-note', content: 'Sub-workflow: Room Assignment — Platinum Elite, assigned Room 812 (8th floor, city view)', delay: 5400 },
      { type: 'system-note', content: 'Sub-workflow: Upsell Processing — late checkout until 2 PM applied ($50)', delay: 5800 },
      { type: 'agent-response', content: 'Welcome back, Ms. Nakamura! Your check-in is confirmed:\n\n🏨 Room 812 — Deluxe Double, 8th floor city view\n🔑 Mobile key sent to your Apple Wallet\n🕐 Late checkout until 2 PM confirmed\n📍 Enter via 151 W 54th St\n\nAs a Platinum Elite member, enjoy complimentary breakfast in The Statler Lounge (7-10 AM). We look forward to seeing you!', activeStepId: 'cip-s4', delay: 6400 },
      { type: 'condition-match', content: 'Matched: If auto-verified → Low-priority notification to staff', matchedConditionId: 'cip-c9', activeStepId: 'cip-s4', delay: 7000 },
      { type: 'guardrail-check', content: '✓ ID verification passed before room assignment\n✓ Payment authorized before proceeding\n✓ Platinum Elite — floors 6+ assigned (Room 812)\n✓ All PMS sync attempts logged', delay: 7600 },
    ],
  },

  // ── Front Desk: Checkout ─────────────────────────────────────────
  {
    id: 'test-fd-checkout-dispute',
    workflowId: 'wf-fd-checkout',
    persona: personas.checkoutDispute,
    events: [
      { type: 'trigger', content: 'Checkout request detected — Room 305, Mark Stevens', delay: 0 },
      { type: 'system-note', content: 'Step 1: Generate Folio — pulling charges from PMS', activeStepId: 'fdc-s1', delay: 800 },
      { type: 'agent-response', content: 'Good morning, Mr. Stevens! Here\'s your folio for Room 305:\n\n🏨 2 nights — Deluxe Double: $698\n🍽️ Room service (Mar 15): $47\n🧊 Minibar: $24\n🅿️ Valet parking (2 nights): $130\n\n💰 Total: $899\n\nA payment link has been sent to complete checkout. Does everything look correct?', activeStepId: 'fdc-s2', delay: 1600 },
      { type: 'condition-match', content: 'Matched: If parking charges present → Itemize separately', matchedConditionId: 'fdc-c5', activeStepId: 'fdc-s2', delay: 2200 },
      { type: 'guest-message', content: 'Wait, I didn\'t use the minibar at all. That $24 charge is wrong. Can you remove it?', delay: 3000 },
      { type: 'system-note', content: 'Step 3: Process Checkout — dispute detected', activeStepId: 'fdc-s3', delay: 3600 },
      { type: 'condition-match', content: 'Matched: If guest disputes a charge → Escalate to front desk, do not auto-resolve', matchedConditionId: 'fdc-c3', activeStepId: 'fdc-s3', delay: 4000 },
      { type: 'agent-response', content: 'I completely understand, Mr. Stevens. I\'ve flagged the minibar charge for review — our front desk team will look into this right away. They\'ll be able to adjust the folio directly.\n\nIn the meantime, I\'ll hold off on processing the final charge until the dispute is resolved. You should hear back within a few minutes.', activeStepId: 'fdc-s3', delay: 4600 },
      { type: 'guardrail-check', content: '✓ Did NOT auto-resolve billing dispute — escalated to staff\n✓ Guest informed of next steps and timeline\n⚠️ Departure confirmation held until dispute resolved', delay: 5400 },
    ],
  },
];

export function getScenariosForWorkflow(workflowId: string): TestScenario[] {
  return testScenarios.filter((s) => s.workflowId === workflowId);
}
