---
name: Agent Builder Design Direction
description: Emerging design direction from product thinking session — chat input, visual flow output, templates, and the four-pillar question
type: project
---

## Emerging Direction (March 25 discussion)

### Core Interaction Model
- **Chat/AI as PRIMARY input** — user describes what they want conversationally
- **Visual flow as SECONDARY output** — system shows the resulting logic visually in real-time as user types
- **Templates as starting point** — don't start from blank, use pre-built agent templates (from Mar 24 brainstorm: 12+ agent types)
- **Settings panel for basics** — triggers, connections, guardrails

### Key Insight
User doesn't BUILD in the workflow canvas — they SEE and VERIFY in the canvas. The AI builds it, they approve it. This solves:
- Non-technical users: just describe what you want
- Technical users: can see and trace the logic
- Trust gap: visual representation = transparency
- Debugging: when agent breaks, operator can trace the specific step

### "Magic Moment"
AI assistant shows changes happening in real-time as user types instructions. Flowchart evolves and changes with explanations of why. Chat input → live visual output.

### PM Thinking Challenges (addressed)
1. **Who's building?** Could be hotel operator OR Canary CS team — both need different depth
2. **Trust gap:** Structured text is opaque when debugging; visual flows make failures traceable
3. **Conditional complexity:** Sales workflows have real branching (if event > $50K AND returning client → VIP package). Text gets messy; visual flows handle this
4. **Lance.live:** May be a forward-deployed people play, not just UI — templates + AI assistant might match their speed
5. **Not binary:** Simple agents need simple config, complex agents need visual depth

### Open Question (being discussed)
Beyond workflows, how do the other pillars fit?
- **Knowledge** — What the agent knows (KB, documents, PMS data)
- **Actions/Tools** — What it can do (check availability, send email, create contract)
- **Insights** — How it's performing (activity, failures, metrics)
- **Guardrails** — What it shouldn't do

Are these separate tabs/sections? Part of the chat builder? Embedded in the visual flow? Need to determine the IA.

### Notion Agent Builder Reference
- No workflow builder — "workflow" is just numbered steps in plain text
- Three config sections: Triggers, Instructions (rich text page), Tools & Access (toggles)
- Split view: chat thread (left) + settings panel (right)
- Connections: simple on/off with permission levels (Notion, Slack, Calendar, Mail)
- Templates as entry point with "Ask AI to create a custom agent" prompt

### Competitive Research (AI Product Intel, March 9)
Four-pillar architecture validated across Ada, Intercom, Salesforce, Sierra, Voiceflow:
1. Knowledge → What does the agent know?
2. Behavior/Persona → How does it behave?
3. Actions → What can it do?
4. Insights → How is it performing?

Key patterns: persistent test panel, AI-that-tests-AI, failure-first insights, natural language agent building

### Intent-Driven Configuration (March 25 — latest thinking)
User starts with intent ("What should this agent do?"), system infers requirements:
1. Pick a template or describe from scratch
2. System analyzes intent → surfaces required connections (email, PMS, calendar, etc.)
3. Pre-flight check: "Email connected ✓, PMS needs setup, Calendar needs access"
4. User connects what's missing, confirms what's there
5. AI assistant refines behavior (property-specific tactics, ACH preferences, conversation points)
6. Visual flow shows what the agent will do as changes are made

**Analogy:** Onboarding a real employee — tell them their job, hand them tools, give them a playbook. Not "configure your workflow."

**Connections as qualification:** If hotel wants Sales Inquiry Agent but doesn't have email connected, surface that immediately — not after 30 minutes of configuring behavior.

**Be honest about infrastructure:** Show "Not yet available" for connections that require API work (PMS write, Payments API). Turns prototype into roadmap conversation with SJ.

**Key stance:** This is new frontier — hotel staff don't have a mental model for agent configuration. We get to be opinionated and define HOW they should work, not ask them how they want to work.

### Notion Agent Builder Lessons
- No workflow builder — instructions are plain text steps
- Three sections only: Triggers, Instructions, Tools & Access
- Split view: chat (left) + settings (right)
- Connections: simple on/off with permission levels
- Templates as entry point

### PM Thinking Challenges Applied
- Visual flow is needed for TRUST and DEBUGGING, not for input
- Chat/AI as input, visual flow as output — user describes, system shows
- Text gets messy with 5+ conditions; visual flows make branching traceable
- "Magic moment": flowchart evolves in real-time as user types instructions
- Different agent complexity = different depth needed, but same container

### Pricing / Capability Tiers (March 25)

**Competitive context:** Lance.live (YC W26) sells TWO pre-built agents (Receptionist + Sales), not a builder. 50+ hotels, Marriott/Hilton/Hyatt. $3.5M seed, $2.2M ARR in 6 months. No public pricing. Likely ~$3-4K/mo per hotel.

**Proposed tier structure:**

INCLUDED (table stakes):
- Answer from Knowledge Base
- Handoff to Staff
- Guest Profile Lookup
- Send Confirmation/Follow-up

CORE (most hotels buy this):
- Reservation Lookup/Modify
- Service Request Creation
- Booking/Availability Check
- Multi-channel (SMS + Email + Voice)

PREMIUM (high-value, revenue-driving):
- Sales Inquiry Handling
- Contract Generation/E-sign
- Payment Processing
- Upsell/Revenue Optimization
- Outbound Campaigns (Rebooking, No-show)
- Analytics/Insights Dashboard

VOICE ADD-ON (separate infra):
- Inbound/Outbound Voice Calls
- Call Transfer/Routing

**For the prototype demo:** Sales Inquiry Agent should be MID-TIER (not premium), so we can show the upgrade path — "you're here, here's what you could unlock." More compelling than showing top shelf. Shows what it's like to be a mid-level user with an opportunity to upsell.

**Anti-cannibalization:** INCLUDED capabilities are basically what existing messaging AI already does (repackaging). NEW revenue comes from capabilities that don't exist yet: Sales Inquiry, Contracts, Payments, Outbound Campaigns.

### Pre-built Agent Flexibility (March 25)
Pre-built agents are NOT inflexible. They're **opinionated defaults with editable instructions per capability** — same prompt injection pattern used for voice actions. Base behavior already works, user layers property-specific instructions on top ("always push ACH", "CC the GM for events over $50K", "we don't host weddings under 100 guests"). Like hiring an employee who knows the job but gets YOUR playbook.

### AI Architecture for Real-Time Building (March 25)
**The chat IS the builder.** Not a separate assistant panel — the text input where you describe what you want IS the interface. One input, one visual output.

**Technical approach:**
- Claude Sonnet via `@anthropic-ai/sdk` (already in prototype deps)
- System prompt defines: available capabilities per tier, connection types, workflow node types, Canary product context
- User input → API call → structured JSON response → UI renders visual flow
- Target: under 6 seconds per generation
- Animations during generation (nodes appearing, connections drawing) to make it feel alive
- System prompt provides determinism — same-ish input → same-ish output
- Conversation history maintained so user can iterate ("change response time to 3 minutes" → flow updates)
- Graceful fallback for out-of-left-field requests: acknowledge what's possible, flag what needs custom integration

**JSON response structure:**
```json
{
  trigger: { type, config },
  workflow_steps: [{ type, description, tool, condition? }],
  required_connections: [{ name, status, required }],
  guardrails: [{ rule }],
  suggested_instructions: { tone, guidelines }
}
```

**SJ will try to break it.** That's the point. Graceful fallbacks > error states.

### Revised UI Direction (March 26 — latest)

**Problem with first build:** Too many views (dashboard → templates → builder → detail with 5 tabs). Traditional settings app with chat bolted on. Not the "chat-to-visual" promise.

**Criticism across ALL prototypes (Miguel's, Terry's, Kevin's, ours):** Too much noise. Every prototype shows everything at once. All likely converge on the same patterns because they were all vibe-coded with Claude — the output reflects Claude's defaults, not novel thinking.

**New model:**
- **Left side: Structured settings UI** — tabs exist (Workflow, Connections, Capabilities, Insights, Activity). Provides visual grounding.
- **Right side: Persistent chat** — always there, always contextual. Primary interaction method.
- **AI navigates the left side** — user says "why is this failing?" → AI switches to Connections tab, highlights broken one. User says "show me performance" → AI navigates to Insights. Tabs become state indicators, not primary navigation.
- **Tabs aren't hidden** — user CAN click manually. But AI makes clicking unnecessary for most interactions.

**Lance.live insight:** They use computer-use agents (vision-based) that scan legacy hotel systems and click buttons to take actions. They work WITH existing UI. Our AI does the same but NATIVELY — it knows the UI because it IS the UI. Can point to specific elements, navigate views, highlight problems.

**Lifecycle-aware progressive disclosure:**
- **No agent yet** → template picker or open prompt. Nothing else.
- **Building** → chat + visual workflow. Connections surface when AI identifies need.
- **Configured, not deployed** → test panel prominent. "Try before going live."
- **Running** → activity/insights primary. Chat becomes refinement tool.

**Guided vs Open chat:**
- First time creating → Guided (chips/quick replies for common intents)
- Configuring/refining → Semi-guided (contextual suggestions based on gaps)
- Troubleshooting/operating → Fully open

### Refined Data Model (March 27)

**Trigger** = the INTENT/EVENT that activates the agent ("Guest inquires about booking", "Sales inquiry received"). NOT the channel.

**Channel** = the MEDIUM through which triggers are detected (Voice, SMS, WhatsApp, Booking.com, Email). Channels can be RESTRICTED per trigger — e.g., booking inquiries only on Messaging channels, not Voice.

**Connections** = EXTERNAL data sources and integrations (PMS, CRM, POS, Google Calendar). NOT channels. These are where the agent reads/writes data.

**Capabilities** = CANARY PRODUCTS the agent can use. The sidebar items (Messages, Calls, Check-in, Checkout, Contracts, Authorizations, Upsells, Digital Tips, Payment Links) are the agent's action tools. This ties directly to monetization — capabilities ARE products.
- Wenjun: "All the products we've used so far is just a tool for the agent."

**Workflow** = the logic flow for handling a trigger. One per trigger, visual diagram.

**Guardrails** = safety rules.

### Creation vs Editing UX (March 27)

**Creating (no tabs):**
- Start with a minimal left panel + chat/wizard
- As agent is built, a scrollable summary fills in (overview, workflow, triggers, connections, capabilities, guardrails)
- No tabs during creation — it's one growing document
- Feels like watching the agent come to life, not filling out a settings page

**Editing (tabs):**
- Agent exists, content is established
- Tabs: Summary | Workflow | Triggers | Connections | Capabilities | Activity
- Structured navigation for reference and modification
- Chat persists for workflow refinement and troubleshooting

**Analogy:** Building a house vs living in it. Different experiences for different phases.

### Agent vs Workflow Builder Debate (March 27)

**Wenjun's position:** Chat is good for building WORKFLOWS but NOT for building AGENTS.
- Agent configuration is STRUCTURED (name, triggers, channels, connections, capabilities, tone). Known fields, deterministic inputs. Wizard/form is better.
- Workflow logic is CREATIVE (describe steps, iterate on conditions). Chat/AI is better.
- Key quote: "You are building an AI, but doesn't mean has to use AI to be the builder."
- Key quote: "Chat is great for engineers, not for our users."
- Key quote: "A blank canvas is very difficult to define an AI agent for everything a hotel needs."

**Kevin's position:** There's a world for both. Not strongly opinionated.

**Miguel's exploration:** Guided chat could work if system prompt structures the conversation. But also open to wizard.

**Hybrid model proposed:**
1. **Wizard** for structured agent setup: template → triggers/channels → connections → capabilities → tone/guardrails. Deterministic, nothing missed.
2. **Chat** for workflow building: once structure is defined, AI builds the logic flow. Natural language for describing/iterating on steps.
3. **Summary/Deploy** review everything.
4. **Editing** uses tabs + persistent chat.

**Decision (March 27):** HYBRID — wizard for agent structure, chat for workflow building. One flow, not two separate options.

**Implementation approach:** Build editing experience first (tabs, structured content — needed regardless), then wizard creation flow, then wire chat into the workflow step. The creation flow produces the same data model as editing; only the input method differs.

### Agent in Action — Next Priority (March 27)

**The "wow moment" isn't the builder — it's watching the agent work.**

Two things to show:
1. **Creating the Sales Inquiry Agent** via the wizard (simple, guided, not technical)
2. **The agent in action** — receiving and responding to mock sales inquiries

**Agent in Action concept:**
- Simulated inbox/feed showing incoming sales inquiries (mock emails from event planners)
- Agent processes each inquiry: parses details, checks availability, drafts response
- Outbound email preview showing what the agent sends (availability + CTA to schedule meeting)
- In-process leads view: leads at different stages (new, responded, meeting scheduled, follow-up needed)
- Response time metrics: "Average response time: 2.3 minutes" (vs industry average of hours/days)

**SJ's framing (from company presentation):**
- *"Hotels get an email from a site that says a group is coming to town. Someone gets paid $60-90K to respond to those leads."*
- *"The biggest issue is it takes them hours or days to respond. The first hotel to respond ends up winning."*
- *"We want to lead with use cases and we want to lead with our customers."*

**Key insight from SJ:** *"We used to go after the $20-30B hotels spend on software. Now our TAM is the $500B-1T hospitality spends on labor."*

**Wenjun + Miguel alignment (March 27):**
- Don't get bogged down by the builder — what matters is the sales inquiry prototype WORKS
- All prototypes so far are too technical. Hotel managers need digestible, guided experiences.
- Don't expose every knob. Guide them to the desired outcome.

### Current Build State (March 29)
- **Worktree:** `../canary-prototype-worktrees/agent-builder` on branch `demo/agent-builder`
- **Build passes.** All components compile. Dev server on port 3005.
- **What's built:** Dashboard (3 agents), AI companion creation flow, linear workflow visualizer with step-scoped conditions, gambit rules list, Agent in Action view (5 mock sales inquiries, pipeline, metrics, hero stat), tabbed editing view (Summary/Workflow/Rules/Triggers/Connections/Capabilities/Activity)
- **PRD:** `docs/AGENT_BUILDER_PRD.md` with Revision 1 + Revision 2
- **Framework:** See `project_agent_builder_epiphany.md` — Gran Turismo/FF12 framework
- **NEXT:** Miguel providing Figma for layout revision. Expect significant UI/layout changes to all views.
- **.env.local** needs `NEXT_PUBLIC_ANTHROPIC_API_KEY` in the worktree for Claude API to work

### Key Files
- `lib/products/agents/types.ts` — AgentTrigger, CanaryProduct, StepCondition, GambitRule, SalesInquiry
- `lib/products/agents/mock-data.ts` — 3 agents, 12 templates, gambit rules, 5 mock inquiries
- `lib/products/agents/store.ts` — wizard state, gambit rules, action view
- `components/products/agents/AgentWizard.tsx` — AI companion conversation (scripted turns)
- `components/products/agents/AgentView.tsx` — tabbed editing (existing agents only)
- `components/products/agents/WorkflowVisualizer.tsx` — linear timeline with expandable conditions
- `components/products/agents/GambitRulesList.tsx` — priority-ordered IF/THEN rules
- `components/products/agents/AgentInAction.tsx` — Act 2: agent working, pipeline, metrics
- `components/products/agents/AgentBuilderPage.tsx` — view switcher (dashboard/wizard/detail/action)

### Still To Resolve
- Layout revision (Figma incoming from Miguel)
- "Start from scratch" flow (AI-driven for unique use cases)
- Integration availability: what's real vs aspirational in Q2?
