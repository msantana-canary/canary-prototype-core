# Canary Agent Builder — Product Requirements Document

> **Owner:** Miguel Santana (Design) + Kevin Li (PM)
> **Status:** Prototype in progress
> **Created:** March 26, 2026
> **Last updated:** March 26, 2026

---

## Problem

Enterprise hotel brands and independent properties need AI agents that automate operational workflows — from answering guest questions to handling sales inquiries to processing night audits. Today, Canary offers AI capabilities embedded within individual products (messaging, webchat, voice), but there is no way for hotels to create, configure, or manage purpose-driven AI agents that work across channels and products.

**The competitive threat is real.** Lance.live (YC W26) reached $2.2M ARR in 6 months selling pre-built AI agents to 50+ hotels including Marriott, Hilton, and Hyatt properties. They use vision-based "computer use agents" that operate hotel software directly — no API integrations required. SJ Sawhney: *"I'm convinced we're getting disrupted if we don't do anything."*

Canary has a significant advantage: an existing product suite (messaging, voice, webchat, check-in, checkout, contracts, payments) that agents can leverage as capabilities. Lance builds from scratch; we build on top of infrastructure that already exists.

---

## Who

- **Hotel sales directors / revenue managers** — configuring agents for sales inquiries, rebooking, upsells
- **Front desk managers / ops teams** — configuring agents for guest communication, service requests, night audit
- **Canary CS/onboarding teams** — setting up and customizing agents for hotels during implementation
- **SJ Sawhney** — primary stakeholder, will pressure-test the prototype

---

## Competitive Landscape

### Lance.live (YC W26)
- **Model:** Pre-built, purpose-specific agents (Receptionist AI + Sales AI + iPad ops hub)
- **Differentiator:** Computer-use agents with vision-based AI — operate hotel software directly without API integrations
- **Traction:** $3.5M seed, $2.2M ARR in 6 months, 50+ hotels
- **Pricing:** Not public; estimated ~$3-4K/mo per hotel based on revenue/hotel count
- **Weakness:** Forward-deployed engineers required for setup; sustainability at scale unclear
- **Key intel:** Co-founder's parent worked at Marriott, which likely accelerated hotel customer acquisition

*Source: YC profile, lance.live website, SJ in March 24 meeting*

### Sierra.ai
- **Model:** Horizontal agent platform — Agent Studio (no-code) + Agent SDK (code)
- **Differentiator:** Natural language as primary configuration method; A/B experimentation on live agent behavior; auto-detection of knowledge gaps
- **Customers:** Rocket Mortgage, SoFi, Brex, SiriusXM, Minted (not hospitality-focused)
- **Architecture:** Four-pillar model (Journeys, Knowledge, Brand, Insights)
- **Key insight:** "Journeys" (their workflow equivalent) are defined in natural language, not visual builders

*Source: sierra.ai website, sierra.ai/product pages*

### Industry Pattern (from AI Product Intel research, March 9)
Four-pillar architecture validated across Ada, Intercom, Salesforce, Sierra, Voiceflow:
1. **Knowledge** — What does the agent know?
2. **Behavior/Persona** — How does it behave?
3. **Actions/Tools** — What can it do?
4. **Insights** — How is it performing?

Key emerging patterns: persistent test panels, AI-that-tests-AI (simulations), failure-first insights, natural language agent building.

*Source: Miguel's AI Product Intel report, March 9, 2026*

---

## Proposed Solution

### Core Concept

The Canary Agent Builder is a **chat-driven configuration interface** where hotel operators describe what they want an agent to do, and the system generates the agent's workflow, identifies required connections, and surfaces the right configuration — all in real-time.

**The chat IS the builder.** There is no separate settings page that the user manually clicks through. The persistent chat on the right drives everything on the left. The AI navigates the interface, highlights issues, and makes recommendations — like a knowledgeable colleague sitting next to you.

### Interaction Model

**Two-panel layout:**
- **Left panel:** Structured settings UI with tabs (Workflow, Connections, Capabilities, Insights, Activity). These provide visual grounding and are manually clickable, but the AI navigates between them based on the conversation.
- **Right panel:** Persistent chat. Always visible. Primary way the user interacts with the agent configuration.

**AI navigates the left panel:** When the user asks "why is this failing?" the AI switches to the Connections tab and highlights the broken connection. When the user asks "show me performance," the AI navigates to Insights. Tabs become state indicators, not primary navigation.

*Source: Miguel/Claude product thinking session, March 26*

### Structured Instructions (inspired by Notion Agents)

Instead of a freeform text box or a node-based workflow canvas, agent behavior is defined through **structured instruction sections:**

- **📋 Overview** — What this agent does (1-2 sentences)
- **⚙️ Workflow** — Numbered steps the agent follows (also rendered as a visual flow diagram)
- **⚡ Actions** — What the agent can do, with specific instructions per action
- **🛡️ Guardrails** — What the agent must NOT do
- **🎯 Style** — Tone, brand voice, property-specific talking points

The chat builds and edits these sections in real-time. The visual workflow diagram is a SECONDARY representation generated FROM the instructions — not the primary input method.

*Source: Notion agent builder analysis + Miguel's design direction, March 26*

### Pre-Built Agents + Customization

Hotels start with **pre-built, purpose-specific agents** (not a blank builder). Each comes with opinionated defaults — workflows, connections, capabilities — that work out of the box. Hotels customize through **prompt injection** — layering property-specific instructions on top of the base behavior.

**Analogy:** Hiring an employee who already knows the job, then giving them YOUR property's playbook.

Examples of prompt injection: "Always push ACH over credit card," "CC the GM for events over $50K," "We don't host weddings under 100 guests."

*Source: Miguel in Kevin 1:1 (March 25), team consensus in Design Jam (March 26)*

### Intent-Driven Configuration

The system infers what an agent needs based on what the user describes:
1. User picks a template or describes intent from scratch
2. System analyzes intent → surfaces required connections (Email, PMS, Calendar, etc.)
3. Pre-flight check: "Email connected ✓, PMS needs setup, Calendar needs access"
4. User connects what's missing
5. AI assistant refines behavior through conversation

**Connections as qualification:** If a hotel wants a Sales Inquiry Agent but doesn't have email connected, surface that immediately — not after 30 minutes of configuring behavior.

*Source: Miguel/Claude product thinking session, March 25*

### Lifecycle-Aware Progressive Disclosure

The interface adapts based on the agent's lifecycle:
- **No agent yet** → Template picker or open prompt. Nothing else on screen.
- **Building** → Chat + visual workflow. Connections surface only when AI identifies they're needed.
- **Configured, not deployed** → Test panel becomes prominent. "Try it before going live."
- **Running** → Activity and insights become the primary view. Chat becomes a refinement tool.

*Source: Miguel/Claude product thinking session, March 26*

### Guided vs. Open Chat

- **First time creating** → Guided (quick reply chips for common intents: "Handle sales inquiries," "Respond to guest FAQ")
- **Configuring/refining** → Semi-guided (contextual suggestions based on gaps: "Your workflow doesn't have a fallback for unavailable dates")
- **Troubleshooting/operating** → Fully open ("Why did the agent quote the wrong rate on Tuesday?")

*Source: Miguel/Claude product thinking session, March 26*

---

## Agent Types (from March 24 Brainstorm)

### Revenue-Driving
1. **Sales Inquiry Agent** (TOP PRIORITY) — Responds to group booking/event inquiries in <5 minutes with availability + CTA to schedule meeting
2. **Rebooking Agent** — Reaches out to past guests conversationally to invite rebooking
3. **Upsell Agent** — Recognizes upsell opportunities, asks follow-up questions, submits for staff approval

### Operational
4. **Service Task Agent** — Recognizes tickets from guest messages, asks follow-ups, creates/assigns tickets
5. **Email Reservation Agent** — Parses email booking requests, sends booking links
6. **Cancellation Agent** — Handles cancellation requests via email, validates cancellation window
7. **No-Show Prevention Agent** — Proactively follows up with unresponsive guests at 5pm and 8pm
8. **Loyalty Recognition Agent** — Ensures all interactions recognize loyalty status

### Back-Office
9. **KB Cleanup Agent** — Daily analysis and cleanup of knowledge base
10. **Night Audit Payment Agent** — Processes OTA payments owed
11. **Credit Card Validation Agent** — Runs cards, reaches out for replacements if declining
12. **Refund Review Agent** — Reviews refunds/adjustments, sends anomalies to GM
13. **Operational Insights Agent** — Scans reviews and tickets for patterns (e.g., recurring room issues)

*Source: March 24 Agent Vision Meeting transcript*

---

## Sales Inquiry Agent — Deep Dive

### What Happens Today (from Terry Lin's discovery, 6 hotel interviews)

| Stage | What the sales manager does | Key constraint |
|-------|----------------------------|----------------|
| **Lead Intake** | Receive inquiries via email, phone, word of mouth, RFPs | Leads range from "just shopping" to "need it now" |
| **Qualify** | Check dates, space, budget, event type | 21 days ideal, but 7 months (weddings) to years (citywides) |
| **Proposal** | Check availability, compile rates/photos, send proposal, negotiate | "We literally are playing Tetris with our calendars" — Jennifer Liebsack, Vinarosa |
| **Contract** | Create in hotel system (Salesforce/Delphi), use Canary for e-signatures | 10-30 docs per event lifecycle; revisions common |
| **Payment** | Collect deposit at signing; contract not "definite" until deposit | CC on file universal; hotels pushing ACH to avoid 3-4% fees |
| **Post-signing** | Link auth to booking, post funds to PMS, generate receipts | Manual PMS transfer if no integration |

*Source: Terry Lin, Digital Contracts & Sales Booking Agent Discovery, Feb-Mar 2026 interviews*

### What the Agent Handles (V1)

**Stages 1-2 only:** Lead intake + initial qualification + rapid response.
- Monitor email inbox for group booking / event inquiries
- Auto-classify urgency
- Check basic event space + room block availability
- Send response within 5 minutes with: relevant info, availability, CTA to schedule meeting

Stages 3-6 (proposal, contract, payment, post-signing) are the long tail — the agent grows into these over time.

### Required Connections (for V1)
- **Email** — monitor inbox, send responses (HAVE: Gmail integration)
- **Knowledge Base** — event space details, pricing, packages (HAVE)
- **PMS** — availability check (NEED: PMS availability read via Gateway API)
- **Calendar** — schedule meetings (OPTIONAL: Google Calendar)
- **CRM** — log leads (NEED: Salesforce lead create — read-only today)

*Source: Terry Lin's discovery document*

---

## Capability Tiers & Pricing Model

### Tier Structure

**INCLUDED (table stakes — every hotel gets this):**
- Answer from Knowledge Base
- Handoff to Staff
- Guest Profile Lookup
- Send Confirmation/Follow-up

**CORE (standard tier — most hotels buy this):**
- Reservation Lookup/Modify
- Service Request Creation
- Booking/Availability Check
- Multi-channel (SMS + Email + Voice)
- Sales Inquiry Handling

**PREMIUM (advanced — revenue-driving):**
- Contract Generation/E-sign
- Payment Processing
- Upsell/Revenue Optimization
- Outbound Campaigns (Rebooking, No-show)
- Analytics/Insights Dashboard

**VOICE ADD-ON (separate infrastructure):**
- Inbound/Outbound Voice Calls
- Call Transfer/Routing

### Prototype Demo Strategy

Sales Inquiry Agent positioned as **mid-tier (Core)** — shows the upgrade path. "You're here, here's what you could unlock with Premium." More compelling than showing the top shelf.

Anti-cannibalization: INCLUDED capabilities are what existing messaging AI already does (repackaging). NEW revenue comes from capabilities that don't exist yet in current products.

*Source: Miguel/Claude pricing discussion, March 25-26*

---

## Technical Architecture

### AI-Powered Building

- **Model:** Claude Sonnet via `@anthropic-ai/sdk` (already in prototype dependencies)
- **Approach:** Client-side API calls with `dangerouslyAllowBrowser: true` (prototype only)
- **System prompt:** Defines available capabilities per tier, connection types, workflow node types, Canary product context
- **Response format:** Structured JSON (trigger, workflow steps, connections, guardrails, instructions)
- **Target latency:** Under 6 seconds per generation
- **Animations:** Staggered node appearance during generation (200ms delay per node)
- **Conversation history:** Last 10 messages maintained for iterative refinement
- **Fallback:** If API fails, return template defaults; if response is malformed, extract what's parseable

### AI-Navigated Interface

The AI can include navigation actions in its responses:
- `navigateTo: 'workflow'` — switches the left panel to the Workflow tab
- `highlight: 'conn-pms'` — highlights a specific element on the current tab
- `suggest: [...]` — shows quick reply chips for the next action

*Source: Miguel/Claude technical discussion, March 25-26*

---

## Acceptance Criteria & Flows

### Flow 1: Dashboard → View Agents
- [ ] User navigates to Settings → Canary Agents
- [ ] Dashboard shows 3 pre-built agents (Alex/Voice, Javis/Messaging, Ava/Webchat) with status badges, metrics
- [ ] Each agent card shows: name, role, status (Active/Paused), conversations, resolution rate, satisfaction score
- [ ] "Create Agent" button is prominent

### Flow 2: Create Agent from Template
- [ ] User clicks "Create Agent"
- [ ] Template grid shows 12+ agent types with tier badges (Included/Core/Premium)
- [ ] Locked templates show overlay with "Requires [X] add-on" message
- [ ] User selects "Sales & Events Agent" (Core tier)
- [ ] Builder opens with: pre-populated workflow on left, chat on right with welcome message
- [ ] Welcome message includes the default workflow and suggestions for customization
- [ ] Visual workflow diagram renders immediately with the template's default steps

### Flow 3: Create Agent from Scratch
- [ ] User selects "Start from Scratch"
- [ ] Builder opens with: empty left panel, chat on right with guided prompt
- [ ] Chat shows quick reply chips: "Handle sales inquiries," "Respond to guest FAQ," "Process cancellations"
- [ ] User types or clicks a chip
- [ ] AI generates workflow, connections, and instructions within 6 seconds
- [ ] Visual workflow appears on the left with staggered node animation
- [ ] Connections checklist surfaces below workflow showing what's needed vs. connected

### Flow 4: Iterative Refinement via Chat
- [ ] User types "Add a step to check room block availability"
- [ ] AI updates the workflow — new node appears with animation
- [ ] User types "Always push ACH payment over credit card"
- [ ] AI adds this to the guardrails/style section
- [ ] User types "What connections do I need?"
- [ ] AI navigates to Connections tab, highlights missing ones
- [ ] Conversation history maintained — user can reference previous messages

### Flow 5: AI-Navigated Tabs
- [ ] User asks "Why is this failing?" → AI switches to Connections, highlights broken connection
- [ ] User asks "Show me performance" → AI switches to Insights tab
- [ ] User asks "What are my capabilities?" → AI switches to Capabilities tab, lists them
- [ ] User can also manually click tabs at any time

### Flow 6: Deploy Agent
- [ ] User clicks "Deploy" → confirmation dialog
- [ ] Agent appears on dashboard as Active with 0 conversations
- [ ] Toast notification: "[Agent Name] deployed successfully"

### Flow 7: View/Edit Existing Agent
- [ ] User clicks an agent card from dashboard
- [ ] Agent detail view opens with tabs (Workflow, Connections, Capabilities, Insights, Activity)
- [ ] Chat panel on right persists — user can ask questions or make changes
- [ ] Capabilities tab shows toggle per capability + editable instruction text (prompt injection)
- [ ] Changes via chat update the relevant tab in real-time

### Flow 8: Troubleshooting
- [ ] User asks "Why did the agent quote the wrong rate to the Marriott group?"
- [ ] AI navigates to relevant section, identifies the issue (e.g., stale KB data, missing guardrail)
- [ ] AI suggests a fix and offers to apply it

---

## Phasing

### Phase 1: Foundation + Dashboard (Current)
- Data model, Zustand store, sidebar integration
- Dashboard with 3 pre-built agents
- Template selection grid

### Phase 2: Builder + AI Integration
- Chat-to-visual-workflow powered by Claude Sonnet
- Structured instructions (Overview, Workflow, Actions, Guardrails, Style)
- Connections checklist with pre-flight status
- AI-navigated tabs

### Phase 3: Agent Detail + Management
- Tabbed detail view for existing agents
- Capability editing with prompt injection
- Deploy/pause controls
- Activity feed

### Phase 4: Polish + Demo
- Animations (workflow generation, node highlighting)
- Guided chips and progressive disclosure
- Error handling and graceful fallbacks
- SJ pressure-test readiness

### Phase 5: (Future) Agent in Action
- Simulated inbox showing agent processing real inquiries
- Outbound email preview
- Live session monitoring

---

## Open Questions

1. **How does the AI communicate navigation?** When switching tabs, does it say "I'm showing you the Connections tab" or just switch silently?
2. **How does highlighting work?** Glow effect? Scroll-to? Color change?
3. **Do hotel operators trust an interface that de-emphasizes manual navigation?** Some people want to see all settings even if they don't touch them.
4. **Integration availability for Q2:** What connections are real (email, KB) vs. need API work (PMS write, Payments)?
5. **Forward-deployed vs. self-serve:** Will this be set up by Canary CS or by hotels directly?

---

## Success Metrics

| Metric | Target | How We Measure |
|--------|--------|---------------|
| SJ approval | SJ can use the prototype to build Sales Inquiry Agent and find it compelling | Direct feedback from pressure-test session |
| Time to first agent | <10 minutes from template selection to deployed agent | Prototype testing |
| AI generation latency | <6 seconds per workflow generation | API response time + render time |
| Graceful fallback rate | 0 crashes when SJ tries to break it | Error-free demo |

---

## Related Resources

- **Notion PRD:** [Agent Vision Meeting 3/24](https://www.notion.so/canarytechnologies/Agent-Vision-Meeting-3-24-Tue-32d81468615180a3806ec2809ff3d115)
- **Terry's discovery:** [Digital Contracts & Sales Booking Agent Discovery](https://www.notion.so/canarytechnologies/Digital-Contracts-Sales-Booking-Agent-Discovery-32e8146861518066ad6dec7186e688b3)
- **Miguel/Kevin 1:1 (March 25):** [Notion meeting notes](https://www.notion.so/canarytechnologies/32781468615180b8b673d5a282376509)
- **AI Product Intel:** Miguel's research doc, March 9, 2026
- **Existing prototypes:**
  - Agent Fleet: https://canary-agent-builder.vercel.app/
  - Channel Settings: https://product-prototype-agent-builder.vercel.app/
  - Kevin's Genesis: `/Users/miguelsantana/Downloads/Archive (2)/agent-genesis/`
  - Kevin's Builder v2: `/Users/miguelsantana/Downloads/Archive (2)/agent-builder-v2/`
- **Prototype repo:** `canary-prototype-core` on branch `demo/agent-builder`

---

## Revisions

### March 27, 2026 — Revision 1

**Sources reviewed:** Miguel/Claude product thinking sessions (March 26-27), Wenjun/Miguel Slack thread (March 27), Kevin/Miguel 1:1 context
**Reviewed by:** Miguel Santana

#### Modified Requirements

- **Capabilities are now Canary Products, not generic skills.** Originally: generic capabilities like "Knowledge Base", "Staff Handoff", "Guest Lookup." → Now: capabilities map to Canary's product suite (Messages, Calls, Check-in, Checkout, Contracts, Authorizations, Upsells, Digital Tips, Payment Links). The agent uses these products as action tools. This ties directly to monetization — capabilities ARE products.
  - *Source:* Miguel in product thinking session, March 27
  - *Context:* "If you look at the Canary sidebar, those are like capabilities that the agent can leverage. If the guest is asking for a contract, they will use the Contracts capability."

- **Connections are external integrations only, NOT channels.** Originally: connections included both data sources and communication channels. → Now: connections are strictly external system integrations (PMS, CRM, POS, Calendar). Channels (Voice, SMS, WhatsApp, Email) are a separate concept tied to triggers.
  - *Source:* Miguel in product thinking session, March 27
  - *Context:* "Connections in my mind are what our product integrates to in order to read information that is external from the Canary product."

- **Triggers are intents, not channels.** Originally: trigger = what starts the agent (e.g., "inbound email"). → Now: trigger = the EVENT/INTENT ("Guest inquires about booking", "Sales inquiry received"). Channels are the MEDIUM through which triggers are detected, and channels can be restricted per trigger (e.g., booking inquiries only on Messaging, not Voice).
  - *Source:* Miguel in product thinking session, March 27
  - *Context:* "The Trigger is WHAT triggers the agent. The channel is the means of which the agent is detecting and responding to these triggers."

- **Creation and editing are fundamentally different UX.** Originally: same two-panel layout for both building and viewing. → Now: creation has NO tabs (growing summary + wizard/chat), editing HAS tabs (structured navigation). Building a house vs living in it.
  - *Source:* Miguel in product thinking session, March 27
  - *Context:* "If we're creating things from scratch, the tabs might not exist yet, because we haven't built anything."

- **Hybrid creation flow: wizard + chat.** Originally: chat-only builder. → Now: wizard handles structured agent setup (template, triggers, channels, connections, capabilities, guardrails), then chat handles workflow building. This resolves the debate between chat-first and wizard-first approaches.
  - *Source:* Wenjun/Miguel Slack thread, March 27; Kevin's position from March 25 1:1
  - *Context:* Wenjun: "Chat is good to build workflows, but not agent." "You are building an AI, but doesn't mean has to use AI to be the builder." Kevin: "There's a world for both."

- **Single workflow with visual diagram replaces text list + diagram.** Originally: both numbered text workflow list AND visual diagram shown. → Now: visual diagram only for workflow representation. Text sections (Overview, Actions, Guardrails) remain. Removes redundancy.
  - *Source:* Miguel in product thinking session, March 27

- **Summary tab as default for existing agents.** Originally: Workflow tab was default for all views. → Now: existing/running agents default to Summary tab (status, key metric, last activity). New agents during creation default to Workflow.
  - *Source:* Miguel in product thinking session, March 27

#### New Requirements

- **Trigger-channel matrix.** Each trigger (intent) can have different channels enabled/disabled. Example: "Booking inquiry" enabled on SMS/WhatsApp/Booking.com but NOT Voice. This requires a matrix UI in the Triggers configuration.
  - *Source:* Miguel in product thinking session, March 27
  - *Context:* "If I have both Voice and Messaging perhaps I only want Messaging to do booking inquiries and I don't want Voice to handle those kinds of inquiries."

- **Wizard creation flow (6 steps).** New structured creation flow:
  1. Pick template or name agent
  2. Define triggers (intents) + channels per trigger
  3. Select connections (external systems)
  4. Select capabilities (Canary products)
  5. Set tone/guardrails
  6. Build workflows via chat
  - *Source:* Wenjun/Miguel Slack thread + Miguel/Claude design session, March 27

- **Auto-typing effect for AI-generated content.** When AI generates or updates content, text reveals word-by-word and workflow nodes appear sequentially. Only triggers on new AI-generated content, not on page load.
  - *Source:* Miguel feedback during prototype testing, March 26

- **Pre-flight connection check in AI responses.** When creating a new workflow, AI must include a connection status summary (✅ connected, ⚠️ setup required) and list capabilities being enabled.
  - *Source:* Miguel feedback during prototype testing, March 26

#### Dropped Requirements

- **Numbered text workflow list.** Removed from Workflow tab — visual diagram is the sole workflow representation. Text was redundant with the diagram.
  - *Source:* Miguel/Claude design discussion, March 27

- **Keyword-based tab auto-navigation.** Removed — was too aggressive, yanked users between tabs unexpectedly. Tabs only auto-switch when AI returns NEW data for that tab during creation, never during editing.
  - *Source:* Miguel bug report during prototype testing, March 26

#### Open Questions

- Exact UX for trigger-channel matrix configuration
- Whether multiple workflows per agent (one per trigger intent) is needed for prototype or deferred
- How wizard steps transition visually (stepper bar? progress indicator?)
- Whether "Build with AI" (pure chat) should exist as an alternative to the wizard for power users

### March 29, 2026 — Revision 2

**Sources reviewed:** Miguel's product thinking sessions (March 27-29), Wenjun/Miguel Slack thread (March 27), SJ's company presentation (March 27)
**Reviewed by:** Miguel Santana

#### Conceptual Framework Shift — "Gran Turismo + FF12"

The agent builder is conceptualized as a video game customization system:
- **Tracks = Use cases** (sales, front desk, housekeeping). Each track has different optimal configurations.
- **Parts = Capabilities** (Canary products, connections). Parts must match the track.
- **Auto-optimize = Templates** with recommended parts for the track. Works 90% of the time.
- **Manual tuning = Property-specific customization** based on "driving style."
- **Gambit system = Priority-ordered conditional rules** (IF/THEN) that define agent behavior. Purchased/unlocked capabilities expand available gambits.
- *Source:* Miguel, product thinking sessions March 28-29

#### Modified Requirements

- **Wizard replaced by AI companion conversation.** Originally: 6-step form wizard. → Now: guided conversation where AI recommends and user confirms. No forms, no toggles, no technical jargon. System infers triggers/connections/capabilities from template + user context.
  - *Source:* Miguel/Claude design session, March 27; Wenjun feedback ("too damn technical")

- **Workflow visualization is LINEAR, not branching.** Originally: node-based flowchart with branching. → Now: linear step sequence (1→2→3→4→5) where each step can have scoped conditional rules (expand to see). Multi-branching flowcharts deemed over-engineering for the 90% use case.
  - *Source:* Miguel, March 29
  - *Context:* "Multi-branching flows seem too complex and might be over-optimizing for a use case that doesn't exist."

- **Conditional logic lives WITHIN steps, not between them.** Each step can have resolution paths (available/unavailable/partial/handoff) but the overall flow stays linear.
  - *Source:* Miguel, March 29

- **Agent behavior shown as prioritized rule list (gambit board).** Instead of flowchart nodes, the agent's rules are an ordered IF/THEN list that users can reorder, add, and remove.
  - *Source:* Miguel's FF12 Gambit System analogy, March 28

- **"Start from scratch" restored** alongside templates. Two entry points: templates (guided/scripted) and scratch (AI-powered/open-ended). Both produce the same output.
  - *Source:* Miguel, March 27

#### New Requirements

- **Act 2: Agent in Action.** Beyond the builder, show the agent WORKING: inbox of incoming inquiries, pipeline view (New→Responded→Meeting Scheduled→Follow-up), response previews, and the killer metric: response time reduced from hours to minutes.
  - *Source:* Miguel, March 27; SJ's framing: "The first hotel to respond ends up winning"

- **Rules tab (gambit board)** as a distinct section in the editing experience. Priority-ordered list of IF/THEN rules, separate from the workflow.
  - *Source:* Miguel's FF12 analogy, March 28

#### Dropped Requirements

- **6-step form wizard.** Replaced by AI companion conversation.
- **Node-based branching flowchart.** Replaced by linear flow with step-scoped conditions.
- **Separate wizard step components** (WizardStepTriggers, WizardStepConnections, etc.). No longer needed.

#### Strategic Context (from SJ's company presentation)

- *"We used to go after the $20-30B hotels spend on software. Now our TAM is the $500B-1T hospitality spends on labor."*
- *"We want to lead with use cases and we want to lead with our customers."*
- *"Chat is a pretty good UX for building agents... knowing how to build a tree can be complex."*
- Sales Inquiry Agent is the first agent to ship. Goal: get it in a customer's hands.
