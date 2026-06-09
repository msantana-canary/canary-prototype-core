---
name: Agent Builder & Sales Inquiry Agent
description: Context for building the Sales Inquiry Agent prototype — two existing prototypes, team decisions, competitive context, and product thinking
type: project
---

## Mission
Build the Sales Inquiry Agent end-to-end using the Agent Builder paradigm. Pressure test where the UI breaks down. Think like a PM, not just a designer.

**Action item (from SJ):** "Miguel and Kevin to use Agent Builder prototype to design the Sales Inquiry Agent and identify where the UI breaks down."

## Sales Inquiry Agent Definition
From the March 24 meeting: "Hotel gets a request for a group booking or an event, this agent responds in less than 5 minutes with information, availability, and a call to action to set up a meeting to discuss further."

- Top priority agent — directly drives revenue
- Hotels with event spaces — inquiry values in hundreds of thousands of dollars
- SJ: "I'm pretty sure this is what Lance got to $2 million in revenue on"
- Eventually: send contracts, negotiate terms
- Requires multi-channel: can read email, use messaging for SMS, voice AI for calls, contracts product for signing

## Two Existing Prototypes

### Prototype 1: Agent Fleet Concept
- **URL:** https://canary-agent-builder.vercel.app/
- **Repo:** https://github.com/canary-technologies-corp/prototype-canary-agents
- **What it is:** Settings page showing 4 named agents (Alex=Voice, Javis=Messaging, Sam=Reservations, Ava=Webchat) as cards with status, activity, engagement metrics
- **Depth:** Shallow — one-page concept, display-only cards, no detail views
- **Key concept:** Agents as virtual employees with personalities, workflows, capabilities, knowledge

### Prototype 2: Channel AI Settings
- **URL:** https://product-prototype-agent-builder.vercel.app/ (password: Likethebird)
- **Repo:** https://github.com/canary-technologies-corp/product-prototype-agent-builder
- **What it is:** Deep per-channel AI configuration — Webchat, Messages, Front Desk Calls
- **Depth:** High fidelity — working test sandbox, draft/publish flow, version history with rollback
- **Key features per channel:**
  - Agent Settings (greeting, instructions)
  - Tools/Connectors (KB, booking links, handoff, routing, Google Maps, reservation assistance)
  - Test Agent panel (persistent, real-time, persona switching)
  - Draft → Publish → Version History → Rollback system
  - Webchat: appearance config, deployment level (brand/property), booking form, avoided topics, AI draft mode
  - Calls: voice settings, agent actions (create/edit), forward numbers, follow-up SMS, call history log

## Team Direction (agreed March 24)

**Near-term:** Channel names stay as products with "Product Settings" and "AI Agent Settings" subsections.
- Kevin: "I think this pattern is still right. It's just right now there's one agent, but you might create different agents over time."

**Nomenclature:** Products = Messages, Webchat, Front Desk Calls. Within each: tools/actions at the capability level.
- Kevin: "Tools and actions are pretty widely used. Agents have access to tools and actions."

**Long-term vision:** Agent-first paradigm where agents are autonomous virtual employees decoupled from products. But for now, channel-based is the practical approach.

## Competitive Context: Lance.live
- YC-backed, $3.5M seed, $2.2M ARR in 6 months (Canary took 2.5 years to reach same)
- Agent-first approach — selling specific agents (sales inquiry, rebooking, etc.)
- SJ: "I'm convinced we're getting disrupted if we don't do anything"
- Revenue model debate: sell agent SKUs vs subscription vs outcome-based

## Four-Pillar Architecture (from AI Product Intel research, March 9)
Validated across Ada, Intercom, Salesforce, Sierra, Voiceflow:
1. **Knowledge** — What does the agent know?
2. **Behavior/Persona** — How does it behave?
3. **Actions** — What can it do?
4. **Insights** — How is it performing?

Key design insight: "What if the test panel IS the product?"

## Agent Ideas Brainstormed (prioritized)
**Revenue:**
1. Sales Inquiry Agent (TOP PRIORITY)
2. Rebooking Agent
3. Upsell Agent

**Operational:**
4. Service Task Agent (housekeeping triage)
5. Email Reservation Agent
6. Cancellation Agent
7. No-Show Prevention Agent
8. Loyalty Recognition Agent

**Back-office:**
9. KB Cleanup Agent
10. Night Audit Payment Agent
11. Credit Card Validation Agent
12. Refund Review Agent
13. Operational Insights Agent

## Current Product Thinking (as of March 25)

### Two-Layer Approach (proposed, not yet validated with team)
**Layer 1: Agent Builder (generalizable platform)**
- Works for ANY agent, not just sales
- Create → pick trigger → define knowledge → assign tools → set guardrails → test → deploy
- Foundation already exists in prototype-canary-agents repo (templates, canvas, workflow builder)
- UI should NOT change based on which agent you're building

**Layer 2: Agent in Action (Sales Inquiry specific)**
- Demo showing the agent actually handling an inquiry
- Mock email → agent processes → response with availability + CTA
- Dashboard with activity, metrics, live sessions
- This is what makes the prototype feel "real" for SJ

### Phasing (proposed)
- Phase 1: Agent creation flow (template → configure trigger/knowledge/tools/guardrails)
- Phase 2: Agent working (simulated inbox, agent processing, outbound email preview)
- Phase 3: Agent management (dashboard, live sessions, version history, test sandbox)

### Key Insight: Don't Over-Optimize for Sales
Terry's 6-stage pipeline (Lead Intake → Qualify → Proposal → Contract → Payment → Post-signing) is sales-specific. If we build the agent builder around that, we lose generalizability. The 12+ agents brainstormed have completely different workflows but share the SAME configuration model (trigger, knowledge, tools, guardrails). Use Terry's research to inform the TOOLS the sales agent needs, not the builder UI.

### What's Generalizable (four-pillar model)
Every agent needs: Trigger (what starts it), Knowledge (what it knows), Actions/Tools (what it can do), Guardrails (what it shouldn't do). The workflow is agent-specific, the container is universal.

## Open Questions
- Direction: which prototype approach to evolve? (Genesis guided? Builder v2 wizard? Your canvas? Hybrid?)
- Does SJ want builder UX, agent-in-action demo, or both?
- How do agents that span multiple channels fit the per-channel model?
- Human-in-the-loop boundaries for sales (auto-respond vs draft for review?)
- Kevin's preference between opinionated (Genesis) vs open (Builder v2)?

## Repos
- Your agent fleet: `canary-technologies-corp/prototype-canary-agents` (rich — 5 views, workflow builder, 14 templates)
- Terry's channel settings: `canary-technologies-corp/product-prototype-agent-builder` (deep config, sandbox, versioning)
- Kevin's Genesis (opinionated): `/Users/miguelsantana/Downloads/Archive (2)/agent-genesis/`
- Kevin's Builder v2 (non-opinionated): `/Users/miguelsantana/Downloads/Archive (2)/agent-builder-v2/`
- Terry's sales discovery: https://www.notion.so/canarytechnologies/Digital-Contracts-Sales-Booking-Agent-Discovery-32e8146861518066ad6dec7186e688b3
