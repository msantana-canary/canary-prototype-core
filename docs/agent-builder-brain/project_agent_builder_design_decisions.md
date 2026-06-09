---
name: Agent Builder Design Decisions (April 2026)
description: Key design decisions and WHY for the agent builder — agent roster, activity feed architecture, profile vs workflow separation, chat sidebar, status model
type: project
---

## Agent Roster: Why We Dropped Javis + Ava

Kevin said agents should be persona-level orchestrators, not narrow channel-specific bots. Javis (Messaging) and Ava (Webchat) were just channel wrappers for what Front Desk Agent already does. Keeping them contradicted the architecture.

**Final roster (6):** Voice AI, Sales & Events, Email Reservation, Service Ticket, Front Desk, Check-in Processing.
**Why these 6:** Maps 1:1 to Kevin's pressure test scenarios (voice, sales, backend automation, service tickets, chat AI rebuild, check-in automation).

Alex renamed to "Voice AI Agent" — all agents use functional names, not persona names. Consistency matters for the demo.

## Activity Feed: Universal Status Model

Original statuses were sales-specific (RESPONDED, MEETING SCHEDULED, FOLLOW-UP SENT). Doesn't scale — each new agent type would need custom status vocabulary.

**Decision:** Universal statuses derived from workflow execution state: completed, in-progress, escalated, flagged, failed. Same across ALL agents. No orchestration needed per agent.

**Title/subtitle formula:** `[outcome] — [entity]` / `[workflow] · [detail] · [duration]`. Assembled from workflow execution data, not manually authored. Same formula for all agents.

**Why:** Hotel users creating custom agents shouldn't have to define status vocabularies or activity feed formats. The execution engine produces the data, the UI formats it.

## Profile vs Workflow: Where Guidelines Live

**Workflow conditions** = step-scoped tactical logic ("at this step, if X, do Y")
**Profile guidelines** = agent-wide behavioral principles ("in ALL situations, always/never X")

Example: "$50K threshold" appears in both places but serves different purposes:
- Workflow condition: "At Draft Response step → use VIP template" (execution path)
- Profile rule: "Flag for Director of Sales" (universal operating principle)

**Why this matters:** The profile tab shows WHO the agent is. The workflow shows WHAT it does. They're conceptually distinct even when they reference the same business rules.

## Chat Sidebar: Context-Dependent

**Updated (April 8):** Chat sidebar is now shown ONLY when editing workflows for template/guided agents. It's hidden everywhere else (Overview, Profile, Capabilities, Connectors tabs).

Three workflow editor modes based on how the agent was created (`agent.templateId`):
1. **Template/Guided agents** (`templateId` exists): read-only visualizer + chat sidebar (AI-assisted editing)
2. **Advanced Builder agents** (`templateId` undefined): editable visualizer, full width, no chat (manual editing)
3. The mode persists through deployment — an advanced-built agent stays manual even after deploying

**Why not a test console:** The animated in-progress timelines ARE the test demo. They show MORE than a chat test would (workflow steps, capability invocations, the full three-layer story).

## Tab Bar: Full Width + Inline Sidebars

With the chat panel gone, tabs go full width. Capabilities and Connectors render their sidebar panels inline (flex row: [content | sidebar]) under the tab bar. Each tab manages its own layout.

Activity detail view: tab bar swaps to back arrow + title + subtitle (slide-in animation). The header is IN the tab bar slot, not a separate element — keeps the layout clean.

## Edit Agent Header: X Instead of Back Arrow

Matches the wizard close pattern (WizardLayout uses mdiClose). Avoids doubling the back button metaphor — X closes the slide-over, back arrow within tabs navigates internal state.
