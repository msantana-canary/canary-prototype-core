---
name: Agent Builder — Kevin + Terry Feedback (April 2026)
description: Key design changes from Kevin sync (Apr 14) and Terry conversation. Combines connectors+capabilities, slims profile, adds hierarchy/front-back labeling. Pre-SDR feedback.
type: project
originSessionId: 2f7f840c-79ab-4cb2-97a2-e87a167b9f2d
---
## Kevin Sync Action Items (Apr 14)
1. Get feedback from SDR team on agent builder design
2. Slim down agent profile — combine rules/guidelines + guardrails (redundant)
3. Combine connectors + capabilities into unified section
4. Miguel handles UI cleanup for communications products going forward

## Key Design Changes Agreed

### Connectors + Capabilities Merge
Connectors become parents, capabilities are sub-items:
- Connect Email → enables send/receive capabilities
- Connect Knowledge Base → access to specific data sources (documents)
- Connect Messages → enables channels (web chat, SMS, WhatsApp, email, Expedia, etc.)
- Connect Upsells → available offer types, auto-approval thresholds

**Rationale:** Capabilities and connectors are functionally similar (both require setup/purchase, both gate what the agent can do). Two separate tabs creates confusion. Unified view is cleaner.

**Nuance:** Capabilities = Canary products (require purchase). Connectors = external integrations (OAuth, API keys). Still distinct concepts but can share a single UI section.

### Agent Profile Slim-Down
Current: separate Rules/Guidelines textarea + Guardrails textarea.
New: combine into one. They describe the same thing (agent-wide behavioral principles).

### Front-of-House vs Back-of-House Agent Types
- **Front-of-house (guest-facing):** needs tone, communication settings, avoided topics
- **Back-of-house (automation):** no tone required — pure backend work
- Example backend: Email Reservation Agent (parse email → update PMS, no guest response)
- Primarily a labeling distinction; UI could conditionally hide tone/communication for backend agents

### Workflow Hierarchy
Kevin: workflows need clearer main-vs-sub hierarchy. Main orchestrator workflows should visibly call sub-workflows (e.g., shared payment processing flow invoked from booking + checkout + upsells).

Miguel's response: conditions already support this ("if X → trigger payment reconciliation flow"), but UI doesn't communicate the hierarchy. Not just visual treatment — users need to understand that sub-workflows exist and can be invoked.

Deferred: how to visualize the hierarchy. Maybe: main workflow tiles larger, sub-workflows indented or linked differently.

## Capabilities vs Check-in Complexity (Open Question)
Kevin's concern: simple "check-in capability" toggle isn't enough for a product with nuanced rules and PMS integrations. Ex: "if guest has X, update Y field in PMS."

Miguel's take: basic check-in works in Canary; PMS-level ops need additional integration work. The capability toggle enables access, the workflows instruct behavior, the connectors bridge to the PMS.

Deferred: where do those PMS-level conditional rules live? Currently stuffed into workflow conditions but could overflow.

## Sales & Events Agent Context (Terry Conversation)
- SJ asked for Sales & Events Agent 2 weeks ago — first ROI-focused agent
- Starting with offline prompt testing (Word doc, iterate to ~70% accuracy) before building full UI
- Joshua building, isolated between three people (not full STM)
- Philosophy: horizontal agents must excel at vertical tasks to be useful

### Email Templates (Not Free-form Generation)
- Hotel creates templates (e.g., wedding inquiries at different price points)
- Agent selects appropriate template based on parameters (budget, event type, headcount)
- Similar model to contracts/authorizations (select from predefined templates)
- Some users may also want a bullet-point prompt-injection textarea

### Contracts in Left Nav
Contracts settings should live as their own settings page. Vision: convert RFP response → proposal → contract with one button, auto-populate, send.

## Design Principles (Video Game Inspired)
- **MGS5 loadout system:** optimized configs for beginners, full customization for veterans
- **FF12 Gambit system:** agent behaviors as priority-ordered IF/THEN rules
- Left = equipment/workflow selection, middle = agent config, right = impacts/results

## Current State
- Prototype has 6 deployed agents, 4-step wizard, Advanced Builder mode, 25 unique activity timelines
- Editable workflow visualizer shipped on `demo/agent-builder` branch (Apr 14)
- Connectors + capabilities are still separate tabs in the builder — this is the first merge candidate
- Agent Profile has separate Rules/Guidelines + Guardrails textareas — second merge candidate

## Reference
- Kevin sync Notion: https://www.notion.so/canarytechnologies/Miguel-Kevin-33c81468615180068e76e8dc01846016
- Terry follow-up Notion: https://www.notion.so/canarytechnologies/34281468615180788320c7daf269fe38
