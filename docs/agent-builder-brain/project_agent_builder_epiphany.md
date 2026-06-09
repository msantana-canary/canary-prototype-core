---
name: Agent Builder Epiphany — Gran Turismo + FF12 Framework
description: Miguel's conceptual framework for agent builder — video game analogies for customization, gambit-style prioritized rules, and linear workflows. Core design thinking from March 28.
type: project
---

## Part 1: Gran Turismo — Tracks and Parts

**Tracks = Use cases.** Sales inquiry, front desk, housekeeping, night audit. Each track has different requirements.

**Parts = Capabilities, connections, configuration.** PMS, CRM, email, KB, contracts, payments. Components you assemble for a specific track.

**You can't use the same parts for every track.** An agent optimized for luxury resort sales won't work for a casino's event booking. Parts must match the track.

**Two modes:**
- **Auto-optimize (template):** System recommends best parts for this track. Works 90% of the time. Deploy and go.
- **Manual tuning (from scratch):** Customize each part based on your property's "driving style" — your specific process, nuances, requirements.

**The 90% → 100% gap is personalization.** Base setup handles the track. Fine-tuning handles YOUR version — your sales tactics, ACH preference, GM approval thresholds.

**Even auto-optimized setups can be tuned after deployment.** You don't need perfection before you race. Race, see what needs adjusting, tune.

## Part 2: FF12 Gambit System — Priority-Ordered Rules

**Characters = Agents.** Tank (front desk absorbs all), healer (service agent resolves issues), DPS (sales agent drives revenue).

**Gambits = Conditional rules.** IF [condition] → THEN [action]. Priority-ordered, checked top to bottom, first match executes.

**Gambit slots = The agent's playbook.** Ordered by priority. Reorderable. Transparent. Readable.

**Buying gambits = Purchasing capabilities.** You don't get everything out of the box. Unlock/buy Canary products to expand what the agent can do. More gambits = more powerful agent.

**Role determines optimal gambit setup.** A healer with attack gambits is useless. A sales agent without Contracts can't close deals.

**Visualization reframe:** Instead of flowchart (nodes/arrows), agent behavior is a PRIORITIZED RULE LIST:
```
1. IF sales inquiry received → Parse details, check availability, respond in 5 min
2. IF event > $50K → CC GM, use VIP template
3. IF no response after 48hrs → Send follow-up
4. IF guest asks pricing → Don't quote, schedule a call
5. DEFAULT → Hand off to sales team
```

Readable, orderable, editable. No flowchart nodes needed.

**Monetization = the gambit shop.** INCLUDED tier = base gambits. CORE = competitive gambits. PREMIUM = advanced strategy gambits. Buy capabilities to make your agent more powerful.

## Part 3: Linear Workflows, Not Branching Trees

**Core argument:** Most workflows are LINEAR. Multi-branching flowcharts are over-engineering for a problem that doesn't exist for 90% of use cases.

**Sales Inquiry flow is linear:** Receive → Parse → Check availability → Draft response → Send with CTA. Always this order.

**What people think are "branches" are actually:**
- **Response variations** the AI handles naturally (wedding vs corporate = different response, same flow)
- **Gambit-style rules** (IF > $50K → CC GM — not a branch, just a rule)
- **Handoffs** (IF can't handle → send to human — escape valve, not a branch)

**The model:** Linear flow handles the 90%. Gambit rules handle nuances. Handoff catches the 10%.

**Exception:** Truly SEPARATE workflows may exist (e.g., "respond to new inquiry" AND "follow up after 48hrs silence"). Different triggers, different linear flows. But each individually is still linear.

**Why this matters:** Multi-branching flowcharts try to explicitly define every edge case. But that's what the AI is for — handling variation within a predictable flow without every path pre-drawn.

## Part 4: Step-Scoped Conditional Logic (March 29)

Conditional logic lives WITHIN individual steps, not between them. The flow stays linear (1→2→3→4→5) but each step can have resolution paths for different outcomes.

**Example — Step 3: Check Availability**
```
├─ Available → continue to next step
├─ Partial overlap → mention to guest, suggest alternatives
├─ Unavailable → suggest alternative dates
└─ Niche situation → handoff to {{hotel_email}}
```

**Visualization:** Linear flow reads top to bottom. Steps are expandable — click to see conditions. Default view is just the straight line. Detail view shows per-step rules.

**Why this works:**
- Simple at a glance (linear flow)
- Depth when needed (expand a step to see conditions)
- Editable per step ("add a rule for blackout dates" → goes into step 3's conditions)
- The overall flow doesn't change when you add conditions to a step
- Matches how hotel operators think: "when we check availability, here's what we do depending on the result"

## Creation Wizard Flow (March 29 — agreed step-by-step)

### Step order:
1. **Template / Scratch** — "What should your agent do?"
   - Template grid OR "Start from scratch"
   - Both share the same starting point
2. **Channels** — "Where should your agent listen?"
   - Copy: "Choose the channels your agent will monitor and respond on."
   - User selects: Email, SMS, WhatsApp, Voice, Webchat, etc.
3. **Capabilities** — "What can your agent do?"
   - Copy (template): "We've pre-selected the recommended capabilities for a Sales & Events Agent. You can adjust based on your needs."
   - Copy (scratch): "Select the capabilities your agent needs. Not sure? Start with the basics — you can always add more later."
   - Tiles: Messages, Voice, Knowledge Base, Upsells, Contracts, Authorizations, Payment Links, Check-in, Checkout, Digital Tips
   - Pre-selected based on template; rest available but off
4. **Workflow** — "How should it handle requests?"
   - Template: pre-built flow shown for review. Chat available for adjustments.
   - Scratch: AI generates from description. User reviews.
   - NO manual step matrix. No Action/Condition/Delay node types exposed.
   - User sees: "Check availability", "Draft response" — not "Action node"
   - System assigns types internally for rendering
5. **Connections** — Pre-flight review (NOT configuration)
   - Copy: "Based on your setup, your agent needs access to these systems. We've checked what's already connected."
   - ✅ Connected / ⚠️ Setup Required / ℹ️ Optional
   - User reviews, doesn't toggle. Last step before deploy.
6. **Deploy**

### Workflow creation approach:
- **Frictionless.** No step matrices, no node types exposed.
- Template users: review pre-built flow, adjust via chat
- Scratch users: AI generates flow from description, review and adjust
- Complexity lives in EDITING experience (post-deployment), not creation

### Sales Inquiry Agent — 6-Step Linear Flow with Conditions (validated against Terry's research)

**Step 1: Receive Inquiry** — Email arrives at sales inbox. Extract sender, subject, body.

**Step 2: Parse & Qualify** — Identify event type, dates, headcount, budget, contact info. Classify lead urgency.
- If missing critical info (dates or headcount) → reply asking for details before proceeding
- If spam or irrelevant inquiry → archive, don't respond
- If urgent (event within 30 days) → flag as priority, expedite response
- If early-stage shopping (6+ months out) → warmer informational tone, set longer follow-up cadence
- If mid-cycle (1-6 months) → standard sales response
*Source: Jennifer Liebsack, Vinarosa — "Some are just totally shopping. Others are like, 'My gosh, we've got a board meeting.'"*

**Step 3: Check Availability** — Query PMS for room block AND event space availability for requested dates.
- If fully available → continue with full availability summary
- If partial overlap with existing booking → mention conflict, suggest alternative dates or adjusted room block
- If completely unavailable → suggest nearest available dates, offer to waitlist
- If complex/niche request (multi-venue, unusual setup) → handoff to sales team with context
*Source: Jennifer Liebsack — "We literally are playing Tetris with our calendars with the event space."*

**Step 4: Draft Response** — Compose personalized response based on inquiry type and availability.
- If inquiry is detailed enough → generate mini-proposal with availability summary, relevant packages, property highlights, photos
- If inquiry is vague → lead with clarifying questions, still include property overview
- If event budget > $50K → use VIP response template, CC General Manager
- If wedding → include venue photos, wedding-specific language, mention wedding coordinator
- If returning corporate client → reference past booking history, offer loyalty rate
- If third-party planner or OTA → use third-party template with commission terms
*Source: Kylie Wikle, Ranch Laguna Beach — "We send them a proposal with what the availability is. We send them photos, what the pricing requirements are."*

**Step 5: Send Response** — Deliver email with CTA to schedule a meeting/site visit. Target: within 5 minutes of receipt. Always include: meeting scheduling link, property contact info, next steps.

**Step 6: Follow Up** — Cadence varies by lead type and urgency.
- If corporate event → follow up in 48 hours, then weekly until response
- If wedding → follow up in 1 week, then monthly touchpoints (cycle: 7-18 months)
- If conference/citywide → follow up in 2 weeks, long cycle (can be years)
- If guest replied but hasn't booked → send additional info, case studies, testimonials
- If no response after 2nd follow-up → handoff to sales team with full context
- If meeting was scheduled → send calendar confirmation + pre-meeting info packet
*Source: Jennifer Liebsack — "You'd want to move them in within 21 days. Wedding leads might take seven months." Danica Tolen — "Some of my contracts are seven to nine years."*

**V1 scope covers Terry's stages 1-3 (Intake → Qualify → Proposal first response). Stages 4-6 (Contract → Payment → Post-signing) are the growth path.**

**Gaps acknowledged:**
- Availability check is simplified vs real "Tetris" of coordinating with other salespeople
- "Response" is simpler than a full formal proposal package — V2 could generate PDFs
- Multi-signer scenarios (bride vs parents) not handled in V1
- Negotiation loop (back-and-forth on terms) deferred to human handoff

## How This Applies to the Builder

1. **Pick your track** (template or describe from scratch)
2. **System recommends optimized parts** (auto-optimize for this track)
3. **Add gambit-style rules** (property-specific customizations)
4. **Workflow is linear** — show as a simple sequence, not a branching tree
5. **Each step can have scoped conditions** — expand to see/edit resolution rules
6. **Rules are a priority list** — show as an ordered list of IF/THEN, not nodes
7. **Buy more capabilities** to unlock more powerful gambit options

## Sales Inquiry Agent v2.0 Spec (March 29)

### The Track
Sales Inquiry Response — respond to event/group booking inquiries in <5 minutes with availability + CTA to schedule meeting.

### Linear Flow (6 steps)
1. Receive inquiry (email arrives at sales inbox)
2. Parse details (event type, dates, headcount, budget, contact)
3. Check availability (with step-scoped conditions: available/partial/unavailable/niche→handoff)
4. Draft response (availability summary, packages, property highlights; IF >$50K→VIP template+CC GM)
5. Send response (target: within 5 minutes)
6. Follow up (if no reply in 48hrs → reminder with urgency)

### Default Gambit Rules
1. IF event > $50K → CC GM
2. IF wedding → wedding-specific language
3. IF returning client → reference history
4. IF asks pricing → don't quote, schedule call
5. IF OTA/third party → different template
6. Always push ACH
7. DEFAULT → handoff to sales team with context

### Parts (Auto-Optimized)
- Channels: Email
- Connections: PMS (required), KB (required), CRM (recommended), Calendar (optional)
- Capabilities: Messages (included), KB (included), Contracts (core, disabled default), Payment Links (premium, locked)
- Tone: Formal

### Creation Experience
AI companion guides: picks up from template → asks about channels → confirms connections → asks tone → asks property rules → shows summary → deploy. No forms, no technical jargon.

### Agent in Action (Act 2)
- Inbox: inquiries with pipeline status (New → Responded → Meeting Scheduled → Follow-up)
- Response preview: actual email the agent sent
- Metrics: response time, inquiries handled, meetings scheduled
- Killer stat: "Response time reduced from 4.2 hours to 2.3 minutes"

### Editing Experience
Tabs: Summary | Workflow (linear, expandable steps) | Rules (gambit list) | Connections | Capabilities | Activity
Chat panel on right for refinement.

### Key Differences from v1
- Flowchart → linear flow with step-scoped conditions
- Generic capabilities → Canary products
- 6-step wizard → AI companion conversation
- Everything visible → progressive disclosure
- Separate creation (conversation) vs editing (tabs) experiences
