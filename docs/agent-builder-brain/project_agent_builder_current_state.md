---
name: agent-builder-current-state-april-8-2026
description: "Complete snapshot of everything built on demo/agent-builder branch. File map, agent roster, feature inventory, what works, what's next."
metadata: 
  node_type: memory
  type: project
  originSessionId: 8f91d479-ca29-4a79-a6be-eefacb9ba66f
---

> **STATUS (updated 2026-05-18): PARKED — exploration complete.** All 6 SDR/Kevin tasks shipped (commit 9039675, pushed). The Q2 Block 2 review pivoted production direction to Claude-first UI; prototype kept as the design-space exploration that informed it. **Read first:** `project_agent_builder_design_direction_may2026.md` (pivot + what transfers), `project_q2_block2_comms_review_may18.md` (SJ directive), `agent-builder/CAPTURE.md` (raw reasoning incl. build #3–6 + pivot). The inventory below is the April 8 snapshot — still accurate for what exists, but #3–6 (template library, team templates, hierarchy viz, test sandbox) were added after it.

## Branch & Location
- **Branch:** `demo/agent-builder` (pushed to origin, NOT on main)
- **Worktree:** `/Users/miguelsantana/Documents/Claude-Projects/canary-prototype-worktrees/agent-builder/`
- **Vercel preview:** https://canary-prototype-core-dgz35a34m-msantana-canarytechnos-projects.vercel.app
- **Route:** `/settings/agents`
- **Dev server:** `PORT=3005 pnpm dev` from the worktree

## What's Built — Complete Feature Inventory

### Dashboard (`AgentDashboard.tsx` + `AgentCard.tsx`)
- 3-column grid of agent cards
- Hero stat as centerpiece (big number + label + context)
- Draft vs Active status badges
- "Create new agent" button → template grid
- Click agent → edit view (active) or resume wizard (draft)

### Template Grid (`AgentTemplateGrid.tsx`)
- Standard header bar (back arrow + title + subtitle)
- "Build from Scratch" tile with TWO buttons: Guided Setup + Advanced Builder
- 5 real templates + 3 locked premium templates
- Template cards with tier badges (Included, Core, Premium)
- Locked cards: grayed out, lock icon + "Requires X add-on" message
- Grid on colorBlack8 background

### Creation Flows
1. **Guided Setup** (template or scratch) — 4-step wizard: Profile → Capabilities → Workflows → Connectors → Deploy
2. **Advanced Builder** — creates empty draft, opens tabbed edit view directly (no wizard). Profile, Capabilities, Connectors, Workflows tabs. Deploy button in header.

### Agent Edit View (`AgentView.tsx`)
- Slide-over with X close button + agent name + Save/Deploy button
- 5 tabs for active agents: Overview, Agent Profile, Capabilities, Connectors, Workflows
- 4 tabs for draft agents: Agent Profile, Capabilities, Connectors, Workflows (no Overview)
- Tab bar swaps to detail header when viewing activity detail or editing workflow
- Capabilities + Connectors tabs have inline sidebars (340px right panel)
- Workflow edit has chat sidebar (400px) for template/guided agents

### Agent Profile (`AgentProfileStep.tsx`)
- "Who is your agent?" header with icon — shows in ALL modes (scratch, template, edit)
- Agent description (from template or typed)
- Agent name input
- Responsibilities list (add/remove)
- Operating Rules (guidelines textarea + guardrails textarea)
- Communication Settings (collapsible, KBSection pattern): tone selector + avoided topics

### Capabilities (`CapabilitiesStep.tsx` + `CapabilitiesSidebar`)
- 3-column grid of enabled capabilities with gear + delete icons
- Sidebar shows available capabilities to add
- Gear icon opens config modals for: Messages (channels), Calls (transfer categories), Upsells, Contracts, Authorizations

### Connectors (`ConnectorsStep.tsx` + `ConnectorsSidebar`)
- 2-column grid of assigned connectors with status badges + delete
- Sidebar shows unassigned (Available) + not-available connectors
- Property-level status is source of truth (`mockConnectors`)
- `'unassigned'` status = property has it, agent doesn't use it
- Setup modal flow: confirm → connecting → connected (with green glow)
- 12 connectors total: Twilio Voice, Oracle Opera PMS, KB, Payment Gateway, SendGrid, HotSOS, Vostio Mobile Key, POS, Salesforce CRM, Google Calendar, Flexkeeping, Dormakaba

### Workflows (`WorkflowsStep.tsx` + `WorkflowVisualizer.tsx` + `AgentChat.tsx`)
- Overview grid: workflow cards with name, description, step count + "Create new Workflow"
- Detail view: workflow name input + WorkflowVisualizer + chat sidebar
- Visualizer: trigger card (blue) → step cards → condition boxes → dashed connectors
- Chat: Claude API with tool_use, per-workflow contextual chips (25 workflows covered), seeded intro messages
- Slide-in animation when entering detail view
- Tab bar header: "Edit Workflow" / "New Workflow" + "Save edits" / "Save workflow" (shaded button)

### Activity Timeline (`ActivityTimeline.tsx` + `timeline-data.ts`)
- Three interleaved layers: workflow steps (dividers), capability tool calls (activity cards), conversation (messages)
- Event types: date-separator, trigger, workflow-step, agent-activity, guest-activity, guest-message, ai-response, system-event, processing
- Capability labels: CHECK-IN, MESSAGING, CALLS, UPSELLS, KNOWLEDGE BASE, CONTRACTS, PMS, SERVICE TICKETS
- Agent name in AI response bubbles (not "CANARY")
- Guest avatar on guest messages
- Animated in-progress: events reveal progressively, auto-scroll, all complete through to resolution
- CTA hookups: "View Check-in" → /check-in?guest=guest-emily, "View Transcript" → CallDetailsModal

### Overview Tab (`OverviewTab.tsx` + `ThreadDetailView.tsx`)
- Hero stat card + 4 metric cards + Activity Feed list
- Per-agent activity feeds with universal status model (completed/in-progress/escalated/flagged/failed)
- Click activity item → tab bar swaps to detail header, timeline renders below
- 25 unique timelines across 6 agents (1,210 lines in timeline-data.ts)

### Store (`store.ts`)
- Zustand store with wizard state, navigation, CRUD, deploy, draft save
- `saveDraft` / `deployAgent` persist all fields including profile, workflows, filtered connectors
- Draft resume: click draft → wizard with pre-filled data
- Advanced builder: creates empty draft → opens edit view
- Connector hydration: 4 paths all merge remaining property catalog
- Save filters out 'unassigned' and 'not-available' connectors

## Agent Roster (6 Deployed Agents)

| Agent | ID | Workflows | Key Connectors |
|---|---|---|---|
| Voice AI Agent | agent-alex | 1 (Inbound Call Handler) | Twilio, PMS, KB |
| Sales & Events Agent | agent-sales-events | 3 (Inquiry, Cold Lead, Contract) | PMS, SendGrid, KB, CRM, Calendar, Payment |
| Email Reservation Agent | agent-email-res | 3 (Cancel, Modify, Confirm) | PMS, SendGrid, KB |
| Service Ticket Agent | agent-service-ticket | 1 (Service Resolution) | HotSOS, PMS, KB |
| Front Desk Agent | agent-front-desk | 7 (Booking, FAQ, Service, Upsell, Checkout, Survey, Escalation) | PMS, KB, Payment, HotSOS |
| Check-in Processing Agent | agent-checkin | 5 (Submission, ID, Payment, Room, Upsells) | PMS, Payment, Vostio, KB |

All deployed agents have Statler-specific workflow conditions (staff names, venues, policies, rates).
Templates remain generic (any hotel).

## What's Next
See `project_agent_builder_editable_visualizer.md` — editable workflow visualizer for Advanced Builder mode.

## QA Status
- TypeScript: 0 errors
- Build: 0 errors
- Unused imports: cleaned
- Dead code: cleaned (Javis/Ava removed)
- All flows verified: template creation, scratch guided, advanced builder, draft resume, deploy, edit agent
