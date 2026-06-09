---
name: Kevin Sync — Agent Builder Validation + Gaps (March 31)
description: Kevin validated the 4-step design but raised triggers, pressure testing, and agent-as-orchestrator architecture. Critical gaps to address.
type: project
---

## What Kevin Validated
- 4-step creation flow (Profile → Capabilities → Workflows → Connectors) ✅
- GT metaphor for templates + customization ✅
- Opinionated guided experience for hotel managers ✅
- Blank-slate mode for enterprise IT teams ✅
- Conversational workflow editing via AI chat ✅
- Linear workflows with step-scoped conditions ✅

## Critical Gap: Triggers
Kevin's biggest concern — **how does the agent get triggered?** Not clearly represented in current design.

**Options discussed:**
- In Agent Profile ("who your agent is" includes when it activates)
- Per workflow (each workflow has its own trigger as step 1)
- Separate setup flow for triggers that require configuration (e.g., "listen to emails" needs email integration setup)

**Why it matters:** "Every agent builder I've seen universally has a trigger. How does this work get started?"

**Current state:** We have "Receive Inquiry" as step 1 in the Sales workflow, but there's no explicit trigger configuration step. For the Sales agent it's implicit (email arrives), but for other agents the trigger varies wildly.

## Agents = Orchestrators
**Agreed:** Agents are persona-level orchestrators, not narrow single-task bots.

A messaging agent = one agent with multiple responsibilities (book, cancel, answer questions, create tickets, upsell). NOT 30 separate agents for each task.

Kevin: "That's sort of how we're building agents right now — they're orchestrators of multiple tools."
Miguel: "Individual people have multiple responsibilities."

**Implication for design:** The workflows within an agent are its "tools." Each workflow handles a different responsibility. The agent decides which workflow to invoke based on the trigger/input.

## Pressure Testing Required
Kevin recommended testing the design against 5 scenarios beyond sales:

1. **Pure backend automation** — email arrives, update PMS reservation (no guest interaction, no tone/communication)
2. **Service ticket creation** — back-and-forth clarifying questions, assign to right person
3. **Current chat AI rebuild** — front desk agent with surveys, service tickets, upsells, bookings (the messaging agent we already ship)
4. **Check-in automation** — end-to-end digital check-in flow
5. **Email cancellation/reservation modification** — parse email, check policy, cancel or modify in PMS, respond

**Why:** "It's hard for me to wrap my head because it's very tied towards the sales inquiry response." Need to prove the design works for ALL agent types.

## Pre-built Agents for Demo
Miguel needs to showcase pre-built agents as if they already exist:
- **Messaging agent** (what we ship today as chat AI)
- **Voice agent** (what we ship today as voice AI)
- **Check-in agent** (digital check-in automation)
- **Sales & Events agent** (the one we're building)

SJ wants to see: pre-built agents that are already working + the ability to build the sales agent himself.

## Tools = Where the Power Is
Kevin: "Where you ultimately need a lot of configuration is really within the tools."

Tools can be:
- Linear flows (like our current workflow steps)
- Non-deterministic workflows (agent decides path)
- The opinionated version gives the most configuration power within tools

**Implication:** Our "Capabilities" step might need deeper configuration per capability, not just toggle on/off. The gear icon on each capability card should open meaningful configuration.

## Agent Profile Flexibility
Kevin noted: "Not all agents are going to have tone, but they might have guidelines. The guidelines might be different from instructions."

**Implication:** A backend automation agent doesn't need communication style or avoided topics. The Agent Profile step might need to adapt based on agent type — show tone/communication for customer-facing agents, hide it for backend agents.

## Block 3 Context
- Migrating existing AI to agentic architecture is the big theme
- Rollout: voice first → web chat → messaging
- Sierra released Ghostwriter (chat-based flow builder) — market moving toward accessible tools
- Backend systems stay the same — it's about finding the right UX paradigm

## Reference
- Notion: https://www.notion.so/canarytechnologies/Miguel-Kevin-33481468615180cdaf27c5909552514e
