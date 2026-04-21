# Agent Builder — Full Context Document

> **Purpose:** This is the single comprehensive reference for any Claude instance working on the Agent Builder project. It contains everything that has been built, why, design decisions with rationale, feedback from stakeholders, planned changes, and deferred features.
>
> **Last updated:** 2026-04-14
> **Owner:** Miguel Santana (Design) + Kevin Li (PM)
> **Branch:** `demo/agent-builder`
> **Worktree:** `/Users/miguelsantana/Documents/Claude-Projects/canary-prototype-worktrees/agent-builder/`
> **Route:** `/settings/agents`
> **Dev server:** `PORT=3005 pnpm dev` from the worktree
> **Vercel preview:** https://canary-prototype-core-dgz35a34m-msantana-canarytechnos-projects.vercel.app

---

## 1. Project Overview

### What This Is

The Canary Agent Builder is a prototype for a platform where hotel operators create, configure, and manage purpose-driven AI agents that automate operational workflows — from handling guest messages to processing sales inquiries to managing check-in flows. It lives inside the Canary Prototype Suite, a library of realistic product prototypes for Canary's hotel software.

This is a **design prototype** for:
1. **SJ Sawhney** (CEO) to pressure-test and demo to stakeholders
2. **SDR/sales team** to demo agent concepts to hotel prospects
3. **Kevin Li** (PM) and the product team to validate the agent-first architecture before engineering commits

It is NOT production code and uses no real customer data.

### Who It's For

| Persona | What They Need |
|---------|---------------|
| **Hotel sales directors / revenue managers** | Configure agents for sales inquiries, rebooking, upsells |
| **Front desk managers / ops teams** | Configure agents for guest communication, service requests |
| **Canary CS/onboarding teams** | Set up and customize agents for hotels during implementation |
| **SJ Sawhney** | Primary stakeholder — will break it, need graceful fallbacks |
| **SDR team** | Demo the concept to hotel prospects — needs to be visually compelling |

### Three User Personas (from SDR feedback, Apr 2026)

1. **Basic** — wants pre-built templates that "just work." Does not care about prompts, AI, or customization.
2. **Intermediate** — some customization ("heated seats on a car"). Customizes specific parts of a template.
3. **Advanced** — full manual control. Knows what they want, builds from scratch.

The product serves all three. The wizard works for Basic/Intermediate; the Advanced Builder serves persona 3.

### Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **React:** 19.x
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4.x
- **State:** Zustand
- **UI Library:** `@canary-ui/components` (from GitHub — `github:msantana-canary/canary-prototype-foundation`)
- **AI:** `@anthropic-ai/sdk` (Claude Sonnet for chat-to-workflow generation)
- **Icons:** `@mdi/react` + `@mdi/js` (always use outline variants)
- **Dates:** `date-fns`

### Branding

The prototype is themed as **The Statler New York** (formerly "The Grand Hotel"):
- Address: 151 West 54th St, New York, NY 10019
- All deployed agents have Statler-specific workflow conditions (staff names, venues, policies, rates)
- Templates remain generic (any hotel)
- Hotel images in `public/images/` — Statler logo + property photo
- Knowledge Base content themed to NYC (Carnegie Hall, Central Park, subway, JFK/LGA/EWR)

### Competitive Context

**Lance.live** (YC W26): $3.5M seed, $2.2M ARR in 6 months selling pre-built AI agents to 50+ hotels (Marriott, Hilton, Hyatt). Uses vision-based "computer use agents" that operate hotel software directly without API integrations. Forward-deployed engineers required. SJ: "I'm convinced we're getting disrupted if we don't do anything."

**Sierra.ai**: Horizontal agent platform. "Journeys" (workflow equivalent) defined in natural language, not visual builders. Customers include Rocket Mortgage, SoFi, Brex.

**Canary's advantage:** Existing product suite (messaging, voice, webchat, check-in, checkout, contracts, payments) that agents leverage as capabilities. Lance builds from scratch; Canary builds on infrastructure that already exists.

### Key References

| Resource | URL |
|----------|-----|
| Figma designs | https://www.figma.com/design/EonU6l1LFib9tb4DgOkBdy/Agent-Builder |
| Agent Vision Meeting (Mar 24) | https://www.notion.so/canarytechnologies/Agent-Vision-Meeting-3-24-Tue-32d81468615180a3806ec2809ff3d115 |
| Terry's Sales Discovery | https://www.notion.so/canarytechnologies/Digital-Contracts-Sales-Booking-Agent-Discovery-32e8146861518066ad6dec7186e688b3 |
| Kevin sync (Mar 31) | https://www.notion.so/canarytechnologies/Miguel-Kevin-33481468615180cdaf27c5909552514e |
| Kevin sync (Apr 14) | https://www.notion.so/canarytechnologies/Miguel-Kevin-33c81468615180068e76e8dc01846016 |
| Terry follow-up (Apr 14) | https://www.notion.so/canarytechnologies/34281468615180788320c7daf269fe38 |
| SDR feedback session | https://www.notion.so/canarytechnologies/33c814686151805382f3e56144a3df4b |
| Agent Fleet prototype | https://canary-agent-builder.vercel.app/ |
| Channel Settings prototype | https://product-prototype-agent-builder.vercel.app/ (password: Likethebird) |

### PRD

The PRD lives at `docs/AGENT_BUILDER_PRD.md` in the repo. It was created March 26 and has two revisions (March 27, March 29). Key shifts across revisions:
- Rev 1: Capabilities became Canary Products (tied to monetization). Connections became external-only. Triggers became intents, not channels. Creation vs editing became fundamentally different UX. Hybrid wizard + chat model adopted.
- Rev 2: "Gran Turismo + FF12" conceptual framework. Wizard replaced by AI companion conversation. Linear workflows replaced branching flowcharts. Gambit-style priority rule list added. "Agent in Action" Act 2 spec added.

---

## 2. What's Been Built (Complete Feature Inventory)

### Dashboard (`AgentDashboard.tsx` + `AgentCard.tsx`)

- 3-column grid of agent cards (all 6 deployed agents)
- Hero stat as centerpiece on each card (big number + label + context)
- Draft vs Active status badges
- "Create new agent" button at top-right navigates to template grid
- Click agent card: active agents open edit view, draft agents resume the wizard

### Template Grid (`AgentTemplateGrid.tsx`)

- Standard header bar (back arrow + title + subtitle)
- "Build from Scratch" tile with TWO buttons: **Guided Setup** + **Advanced Builder**
- 5 real templates + 3 locked premium templates (8 total)
- Template cards with tier badges (Included, Core, Premium)
- Locked cards: grayed out, lock icon + "Requires X add-on" message
- Grid on `colorBlack8` background

**Templates:**

| Template | ID | Tier | Locked? |
|----------|-----|------|---------|
| Front Desk Agent | `tpl-front-desk` | Included | No |
| Voice AI Agent | `tpl-voice-ai` | Included | No |
| Sales & Events Agent | `tpl-sales-events` | Core | No |
| Housekeeping Agent | `tpl-housekeeping` | Core | No |
| No-Show Prevention | `tpl-no-show` | Core | No |
| Upsell Agent | `tpl-upsell` | Premium | Yes |
| Finance Agent | `tpl-finance` | Premium | Yes |
| Loyalty Agent | `tpl-loyalty` | Premium | Yes |

### Creation Flows

**1. Guided Setup (template or scratch)**
- 4-step wizard: Profile -> Capabilities -> Workflows -> Connectors -> Deploy
- `WizardLayout.tsx` + `WizardStepIndicator.tsx` manage the flow
- Step indicator shows progress with checkmarks for completed steps
- "X" button to close wizard (triggers save-as-draft warning)

**2. Advanced Builder**
- Creates empty draft with no template (`templateId` stays undefined)
- Opens tabbed edit view directly (skips wizard)
- Profile, Capabilities, Connectors, Workflows tabs available
- Deploy button in header

### Agent Edit View (`AgentView.tsx`)

- Slide-over panel with X close button + agent name + Save/Deploy button
- **5 tabs for active agents:** Overview, Agent Profile, Capabilities, Connectors, Workflows
- **4 tabs for draft agents:** Agent Profile, Capabilities, Connectors, Workflows (no Overview — no metrics yet)
- Tab bar swaps to detail header when viewing activity detail or editing a workflow
- Capabilities + Connectors tabs have inline sidebars (340px right panel)
- Workflow edit has chat sidebar (400px) for template/guided agents only

### Agent Profile (`AgentProfileStep.tsx`)

- "Who is your agent?" header with icon
- Shows in ALL modes (scratch, template, edit)
- Fields: Agent description (from template or typed), Agent name input, Responsibilities list (add/remove), Operating Rules (guidelines textarea + guardrails textarea), Communication Settings (collapsible): tone selector + avoided topics

### Capabilities (`CapabilitiesStep.tsx` + `CapabilitiesSidebar`)

- 3-column grid of enabled capabilities with gear + delete icons
- Sidebar shows available capabilities to add
- Gear icon opens config modals for:
  - **Messages**: channel selection (SMS, WhatsApp, Email, Webchat, Booking.com, Expedia)
  - **Calls**: transfer categories
  - **Upsells**: offer types, auto-approval thresholds
  - **Contracts**: template settings
  - **Authorizations**: form configuration
- 10 Canary products total (see types section for IDs)

### Connectors (`ConnectorsStep.tsx` + `ConnectorsSidebar`)

- 2-column grid of assigned connectors with status badges + delete
- Sidebar shows unassigned (Available) + not-available connectors
- Property-level status is source of truth (`mockConnectors`)
- `'unassigned'` status = property has it, agent does not use it
- Setup modal flow: confirm -> connecting spinner -> connected (with green glow animation)

**12 connectors total:**

| Connector | ID | Type | Property Status |
|-----------|-----|------|----------------|
| Twilio Voice | `conn-twilio` | voice | connected |
| Oracle Opera PMS | `conn-pms` | pms | connected |
| Knowledge Base | `conn-kb` | knowledge-base | connected |
| Payment Gateway | `conn-payment` | payment | connected |
| SendGrid Email | `conn-sendgrid` | email | connected |
| HotSOS | `conn-hotsos` | task-management | connected |
| Vostio Mobile Key | `conn-vostio` | mobile-key | connected |
| Point of Sale | `conn-pos` | pos | connected |
| Salesforce CRM | `conn-crm` | crm | setup-required |
| Google Calendar | `conn-calendar` | calendar | setup-required |
| Flexkeeping | `conn-flexkeeping` | task-management | not-available |
| Dormakaba Locks | `conn-dormakaba` | mobile-key | not-available |

### Workflows (`WorkflowsStep.tsx` + `WorkflowVisualizer.tsx` + `AgentChat.tsx`)

- **Overview grid:** Workflow cards showing name, description, step count + "Create new Workflow" button
- **Detail view:** Workflow name input + WorkflowVisualizer + chat sidebar (for template agents)
- **Visualizer:** Trigger card (blue, lightning bolt icon) -> step cards -> condition boxes -> dashed connectors
- **Chat:** Claude API with `tool_use`, per-workflow contextual chips (25 workflows covered), seeded intro messages
- Slide-in animation when entering detail view
- Tab bar header: "Edit Workflow" / "New Workflow" + "Save edits" / "Save workflow" (shaded button)
- Editable workflow visualizer shipped April 14 (inputs for trigger name, step labels, descriptions, conditions as textarea)

### Activity Timeline (`ActivityTimeline.tsx` + `timeline-data.ts`)

- Three interleaved layers (see Architecture section for full detail):
  1. **Workflow progression** — which step the agent is on (brain)
  2. **Capability executions** — tool calls the agent made (hands)
  3. **Conversation** — guest messages + AI responses (mouth)
- Event types: `date-separator`, `trigger`, `workflow-step`, `agent-activity`, `guest-activity`, `guest-message`, `ai-response`, `system-event`, `processing`
- Capability labels: CHECK-IN, MESSAGING, CALLS, UPSELLS, KNOWLEDGE BASE, CONTRACTS, PMS, SERVICE TICKETS
- Agent name appears in AI response bubbles (not "CANARY")
- Guest avatar on guest messages
- **Animated in-progress:** Events reveal progressively with auto-scroll, all complete through to resolution
- CTA hookups: "View Check-in" -> `/check-in?guest=guest-emily`, "View Transcript" -> `CallDetailsModal`
- **25 unique timelines** across 6 agents (1,210 lines in `timeline-data.ts`)

### Overview Tab (`OverviewTab.tsx` + `ThreadDetailView.tsx`)

- Hero stat card + 4 metric cards + Activity Feed list
- Per-agent activity feeds with universal status model (completed / in-progress / escalated / flagged / failed)
- Click activity item -> tab bar swaps to detail header, timeline renders below
- Per-agent activity feeds stored in `agentActivityFeeds` record in mock-data

### Deploy Modal (`DeployModal.tsx`)

- Confirmation dialog before deploying
- Agent appears on dashboard as Active
- Toast notification on success

### All Component Files

```
components/products/agents/
  ActivityTimeline.tsx       — Three-layer timeline with progressive reveal
  AgentBuilderPage.tsx       — View switcher (dashboard/wizard/detail)
  AgentCard.tsx              — Dashboard card with hero stat
  AgentChat.tsx              — Claude API chat with contextual chips
  AgentDashboard.tsx         — 3-column grid of agents
  AgentInAction.tsx          — Act 2: agent working (sales inquiries, pipeline, metrics)
  AgentProfileStep.tsx       — Profile fields (name, description, responsibilities, rules, tone)
  AgentTemplateGrid.tsx      — Template selection with tiers + locked states
  AgentView.tsx              — Tabbed edit view (slide-over)
  AgentWizard.tsx            — 4-step creation flow
  CapabilitiesStep.tsx       — Capability grid + sidebar
  CapabilityCard.tsx         — Individual capability tile
  CapabilityConfigModal.tsx  — Per-capability config (Messages channels, Calls categories, etc.)
  ConnectionsChecklist.tsx   — Legacy connection checklist (may be deprecated)
  ConnectorsStep.tsx         — Connector grid + sidebar + setup modal
  DeployModal.tsx            — Deploy confirmation
  GambitRulesList.tsx        — Priority-ordered IF/THEN rules
  OverviewTab.tsx            — Hero stat + metrics + activity feed
  StructuredInstructions.tsx — Legacy structured text sections
  ThreadDetailView.tsx       — Activity item detail with timeline
  WizardLayout.tsx           — Wizard chrome (header, step indicator, navigation)
  WizardStepIndicator.tsx    — Step progress bar
  WorkflowOverview.tsx       — Workflow card grid
  WorkflowVisualizer.tsx     — Linear flow visualizer (trigger + steps + conditions)
  WorkflowsStep.tsx          — Workflows tab (grid + detail + chat)
  index.ts                   — Barrel exports
```

---

## 3. Architecture

### Folder Structure

```
lib/products/agents/
  types.ts          — All TypeScript interfaces (Agent, AgentTemplate, WorkflowStep, etc.)
  mock-data.ts      — 6 deployed agents, 8 templates, 12 connectors, activity feeds, workflows
  store.ts          — Zustand store (wizard state, navigation, CRUD, deploy, draft)
  timeline-data.ts  — 25 unique activity timelines (1,210 lines)
  services/
    agent-builder-api.ts — Claude API integration for chat-to-workflow
```

### Data Model (Key Types)

**Agent** (runtime instance):
```typescript
interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  triggers: AgentTrigger[];
  connections: Connection[];
  capabilities: CanaryProduct[];
  workflow: AgentWorkflow;        // Primary workflow
  workflows?: AgentWorkflow[];    // Multiple workflows for orchestrator agents
  tone: string;
  metrics: AgentMetrics;
  recentActivity: { time: string; description: string }[];
  createdAt: string;
  rules: GambitRule[];
  responsibilities?: string[];
  behavioralGuidelines?: string;
  avoidedTopics?: string[];
  templateId?: string;  // Determines workflow editor mode (chat vs manual)
}
```

**AgentTemplate** (gallery/starter kit):
```typescript
interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  tier: 'included' | 'core' | 'premium';
  isLocked: boolean;
  lockMessage?: string;
  defaultTriggers: AgentTrigger[];
  defaultConnections: Connection[];
  defaultCapabilities: string[];  // IDs of CanaryProducts to enable
  defaultWorkflow: AgentWorkflow;
  defaultTone: string;
  defaultRules?: GambitRule[];
}
```

**AgentWorkflow:**
```typescript
interface AgentWorkflow {
  id?: string;
  name?: string;
  description?: string;           // LLM-generated summary for overview tile
  trigger: string;                // Short label: "Receive Inquiry"
  triggerDescription?: string;    // Detail text
  steps: WorkflowStep[];
  guardrails: string[];
}
```

**WorkflowStep:**
```typescript
interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'response' | 'handoff';
  label: string;
  description: string;
  tier?: 'included' | 'core' | 'premium';
  conditions?: StepCondition[];   // Step-scoped conditional logic
}
```

**Key enums / union types:**
- `AgentStatus`: `'active' | 'paused' | 'draft'`
- `ActivityStatus`: `'completed' | 'in-progress' | 'escalated' | 'flagged' | 'failed'`
- `ConnectorStatus`: `'connected' | 'setup-required' | 'not-available' | 'unassigned'`
- `WizardStep`: `'profile' | 'capabilities' | 'workflows' | 'connectors'`
- `AgentViewTab`: `'overview' | 'profile' | 'capabilities' | 'workflows' | 'connectors'`
- `AppView`: `'dashboard' | 'wizard' | 'detail'`
- `ChannelType`: `'voice' | 'sms' | 'whatsapp' | 'email' | 'booking-com' | 'expedia' | 'webchat'`

### Zustand Store (`store.ts`)

The store manages three distinct states:

1. **Navigation state:** `currentView` (dashboard/wizard/detail), `selectedAgentId`, `editAgentTab`
2. **Wizard state:** All wizard fields (name, description, template, triggers, connections, capabilities, guardrails, tone, rules, responsibilities, behavioral guidelines, avoided topics, communication style, connectors, workflows)
3. **Chat state:** `builderMessages`, `currentWorkflow`, `currentConnections`, `isGenerating`

**Key store actions:**
- `startFromTemplate(template)` — Populates wizard fields from template, sets `currentView: 'wizard'`
- `startFromScratch()` — Empty wizard fields, `currentView: 'wizard'`
- `startAdvancedBuild()` — Creates empty draft, opens edit view directly (no wizard)
- `selectAgent(id)` — If agent is draft, routes to wizard; if active, routes to detail view
- `saveDraft()` — Filters out unassigned/not-available connectors, saves. If `selectedAgentId` exists, updates existing (no duplicate)
- `deployAgent()` — Same filtering, sets status to active. If `selectedAgentId` exists, replaces existing
- `resetBuilder()` — Clears all wizard state

**Connector hydration (4 entry points):**
1. `startFromTemplate` — Template's `defaultConnections` in grid (with property statuses), remaining connectors as 'unassigned'
2. `startFromScratch` — Empty grid, ALL connectors as 'unassigned' in sidebar
3. `selectAgent` for drafts — Saved connectors in grid, remaining as 'unassigned'
4. `AgentView` hydration for deployed agents — Agent's connections in grid, remaining as 'unassigned'

All four paths merge the remaining property catalog so no connectors get lost.

### AI Integration (`services/agent-builder-api.ts`)

- Claude Sonnet via `@anthropic-ai/sdk` with `dangerouslyAllowBrowser: true` (prototype only)
- Uses `tool_use` for structured workflow updates
- Conversation history maintained for iterative refinement
- Per-workflow contextual chip suggestions (25 workflows covered)
- Seeded intro messages per workflow context
- `.env.local` needs `NEXT_PUBLIC_ANTHROPIC_API_KEY` in the worktree

---

## 4. Design Decisions and Rationale

### 4.1 Agent Roster — Why These 6, Why Not More

Kevin said agents should be **persona-level orchestrators**, not narrow single-task bots. The original prototype had persona-named agents (Alex/Voice, Javis/Messaging, Ava/Webchat). Javis and Ava were dropped because they were just channel wrappers for what the Front Desk Agent already does. Keeping them contradicted the orchestrator architecture.

**Final roster of 6 maps 1:1 to Kevin's pressure test scenarios:**
1. Voice AI Agent -> Voice handling
2. Sales & Events Agent -> Sales inquiry response
3. Email Reservation Agent -> Backend automation (email -> PMS)
4. Service Ticket Agent -> Service ticket creation
5. Front Desk Agent -> Current chat AI rebuild (the messaging orchestrator)
6. Check-in Processing Agent -> Check-in automation

All agents use functional names (not persona names like "Alex" or "Javis"). Consistency matters for the demo. Alex was renamed to "Voice AI Agent."

### 4.2 Activity Feed — Three-Layer Architecture

The activity feed in the Overview tab proves that the agent builder works end-to-end: build workflows in the wizard, deploy the agent, watch the workflows executing against real guest interactions.

**Three layers (interleaved chronologically):**
1. **Workflow progression (brain)** — which step the agent is on, what triggered it, what conditions were evaluated
2. **Capability executions (hands)** — tool calls the agent made. Each activity card maps to a specific capability (check-in, messaging, calls, upsells, etc.)
3. **Conversation (mouth)** — guest messages + AI responses happening alongside the workflow execution

**Activity card to capability mapping:**

| Activity Card Example | Capability |
|----------------------|------------|
| Pre-arrival message sent via SMS | Messaging |
| Check-in link sent via SMS | Messaging |
| Guest viewed check-in link | Check-in |
| Guest completed check-in | Check-in |
| Guest requested Late Checkout | Upsells |
| Mobile key issued — Room 412 | Check-in |
| Incoming call — Handled by AI | Calls |
| Late Checkout approved | Upsells |

**CTAs link to capability product surfaces:** "View Check-in" navigates to `/check-in?guest=guest-emily`, "View Transcript" opens `CallDetailsModal`. This cross-product navigation shows the agent's work is real and traceable.

**Two tracks:**
- **Complete track** — fully resolved interaction. Full narrative for audit.
- **In-progress track** — the magic demo moment. Events reveal progressively, auto-scroll, the whole thing is alive. Staff can watch the agent work in real-time.

**The throughline:** Configure workflows in wizard (steps 1-4) -> deploy agent -> open Overview -> click an in-progress item -> watch the workflow executing step by step -> see which capabilities the agent invoked -> see the conversation unfolding alongside -> SJ sees: "this is what the workflow I configured actually DOES."

### 4.3 Universal Activity Status Model

Original statuses were sales-specific (RESPONDED, MEETING SCHEDULED, FOLLOW-UP SENT). That does not scale — each new agent type would need custom status vocabulary.

**Decision:** Universal statuses derived from workflow execution state: `completed`, `in-progress`, `escalated`, `flagged`, `failed`. Same across ALL agents. No per-agent orchestration needed.

**Title/subtitle formula:** `[outcome] -- [entity]` / `[workflow] . [detail] . [duration]`. Assembled from workflow execution data, not manually authored. Same formula for all agents. Hotel users creating custom agents should never have to define status vocabularies or activity feed formats.

### 4.4 Profile vs Workflow — Where Guidelines Live

**Workflow conditions** = step-scoped tactical logic ("at this step, if X, do Y"). Lives WITHIN individual workflow steps.
**Profile guidelines** = agent-wide behavioral principles ("in ALL situations, always/never X"). Lives in Agent Profile tab.

Example: "$50K threshold" appears in both places but serves different purposes:
- Workflow condition: "At Draft Response step -> use VIP template" (execution path within a specific step)
- Profile rule: "Flag for Director of Sales" (universal operating principle across all workflows)

The profile tab shows WHO the agent is. The workflow shows WHAT it does. They are conceptually distinct even when they reference the same business rules.

### 4.5 Chat Sidebar — Context-Dependent Display

Chat sidebar is shown ONLY when editing workflows for template/guided agents. It is hidden everywhere else (Overview, Profile, Capabilities, Connectors tabs).

**Why not a persistent test console:** The animated in-progress timelines ARE the test demo. They show MORE than a chat test would (workflow steps, capability invocations, the full three-layer story). The activity feed IS the proof.

### 4.6 Three Workflow Editor Modes

Determined by `agent.templateId`:

| Mode | Condition | Layout | Use Case |
|------|-----------|--------|----------|
| **Chat mode** | `templateId` exists | Read-only visualizer + chat sidebar (400px) | Template/guided agents — hotel managers |
| **Manual mode** | `templateId` undefined | Editable visualizer, full width, no chat | Advanced Builder agents — enterprise IT teams |

The mode is set at creation time and persists through deployment. An advanced-built agent stays manual even after deploying.

**Editable visualizer (manual mode) features:**
- Trigger card: input fields for name + description (always present, NOT deletable — immutable first step)
- Step cards: input for label, textarea for description, delete button (trash icon)
- Conditions: single textarea labeled "Conditions (optional)", one per line, rendered as bullet list in read-only mode
- "+ Add Step" button at bottom
- Automatic step renumbering on delete
- Fresh workflow skeleton: trigger card (blank) + Step 1 (blank)

**What we are NOT building for the visualizer:**
- Drag-and-drop reordering
- AI assistance in the manual editor
- Parallel step support
- Visual condition branching (stays linear)
- Step type selector (description IS the spec, system infers type)
- Undo functionality

### 4.7 Connector Architecture — Property vs Agent Level

Connectors are **property-level** (shared across agents). If Oracle Opera PMS is connected for one agent, it is connected for all. The agent just decides which connectors to USE, not whether they are connected.

**Status model:**
- `connected` — property has this integration active
- `setup-required` — property has access but has not configured it yet
- `not-available` — integration does not exist at this property (e.g., Flexkeeping when using HotSOS)
- `unassigned` — property has it, but this agent does not use it (sidebar state)

**Source of truth:** `mockConnectors` in `mock-data.ts` holds property-level statuses. The `propertyStatus` Map in `ConnectorsStep.tsx` provides lookups.

**Status transitions:**
- Remove from grid -> `'unassigned'` (moves to sidebar)
- Add from sidebar -> restores property-level status via `propertyStatus.get(id)`
- Setup modal completes -> `'connected'`
- Not-available -> stays not-available, non-clickable, grayed out

**Save behavior:** `saveDraft` and `deployAgent` filter OUT `'unassigned'` and `'not-available'` before persisting. Only save connectors the agent actually uses.

### 4.8 Draft Agent Resume Flow

1. User creates agent (template or scratch), clicks X -> save warning -> "Save as draft"
2. Draft appears on dashboard with "Draft" status badge
3. Click draft -> reopens WIZARD (not detail view) at step 1 with all data pre-filled
4. Save draft again -> UPDATES existing draft (no duplicate) via `selectedAgentId` check
5. Deploy from draft -> REPLACES draft with active agent (same ID)

**Key implementation detail:** `selectAgent` checks `agent.status === 'draft'` and routes to `currentView: 'wizard'` instead of `'detail'`. Without this, drafts would open the deployed agent view (which shows empty metrics/activity for an undeployed agent).

### 4.9 Deployed vs Template Differentiation

**Templates = Generic starter kits:**
- Broad conditions ("If budget > $50K -> use VIP template")
- Connectors marked as 'needed'/'optional' (not yet set up)
- No hotel-specific names, venues, or policies
- For ANY hotel to use as a starting point

**Deployed agents = Statler-specific:**
- MORE conditions than templates (hotel added their own)
- Statler references: staff names (Theresa Webb, Sarah Kim, James Rodriguez), venues (Grand Ballroom 200 seated / 350 cocktail, Breakout A 30 pax / B 25 pax), policies ($45 parking, 48-hour free cancellation, $100/night deposit)
- Connectors are 'connected' (actually hooked up)
- Real metrics and activity feeds
- Profile data (responsibilities, guidelines, avoided topics) tailored to The Statler

When SJ compares a template to a deployed agent, the deployed one should clearly show signs of customization — more conditions, specific names, specific policies. The template is "before," the deployed agent is "after."

### 4.10 Linear Workflows, Not Branching Trees

Most workflows are LINEAR. Multi-branching flowcharts are over-engineering for a problem that does not exist for 90% of use cases. What people think are "branches" are actually:
- **Response variations** the AI handles naturally (wedding vs corporate = different response, same flow)
- **Gambit-style rules** (IF > $50K -> CC GM — not a branch, just a rule)
- **Handoffs** (IF cannot handle -> send to human — escape valve, not a branch)

Conditional logic lives WITHIN individual steps (step-scoped conditions), not between them. The flow stays linear (1->2->3->4->5) but each step can have resolution paths.

### 4.11 Tab Bar Layout

With the chat panel gone from non-workflow tabs, tabs go full width. Capabilities and Connectors render their sidebar panels inline (flex row: [content | sidebar]) under the tab bar. Each tab manages its own layout.

Activity detail view: tab bar swaps to back arrow + title + subtitle (slide-in animation). The header IS in the tab bar slot, not a separate element.

### 4.12 Edit Agent Header: X Instead of Back Arrow

Matches the wizard close pattern (WizardLayout uses `mdiClose`). Avoids doubling the back button metaphor — X closes the slide-over, back arrow within tabs navigates internal state.

### 4.13 "Gran Turismo + FF12" Conceptual Framework

**Tracks = Use cases.** Sales inquiry, front desk, housekeeping, night audit. Each track has different optimal configurations.

**Parts = Capabilities, connections, configuration.** PMS, CRM, email, KB, contracts, payments. Components you assemble for a specific track.

**Auto-optimize = Templates.** System recommends best parts for this track. Works 90% of the time.

**Manual tuning = From scratch.** Customize each part based on your property's "driving style."

**Gambit system = FF12-style priority-ordered IF/THEN rules.** Purchased/unlocked capabilities expand available gambits. Gambit slots = the agent's playbook. Buying gambits = purchasing capabilities. Role determines optimal gambit setup.

---

## 5. Current Agent Roster

### All 6 Deployed Agents

| # | Agent Name | ID | Template ID | Status | Workflows | Key Connectors |
|---|-----------|-----|-------------|--------|-----------|----------------|
| 1 | Voice AI Agent | `agent-alex` | `tpl-voice-ai` | active | 1 (Inbound Call Handler) | Twilio, PMS, KB |
| 2 | Sales & Events Agent | `agent-sales-events` | `tpl-sales-events` | active | 3 (Inquiry Response, Cold Lead Follow-up, Contract Prep) | PMS, SendGrid, KB, CRM, Calendar, Payment |
| 3 | Email Reservation Agent | `agent-email-res` | `tpl-reservations` | active | 3 (Process Cancellation, Process Modification, Process Confirmation) | PMS, SendGrid, KB |
| 4 | Service Ticket Agent | `agent-service-ticket` | `tpl-service-task` | active | 1 (Service Resolution) | HotSOS, PMS, KB |
| 5 | Front Desk Agent | `agent-front-desk` | `tpl-front-desk` | active | 7 (Booking, FAQ, Service Request, Upsell, Checkout, Post-Stay Survey, Escalation) | PMS, KB, Payment, HotSOS |
| 6 | Check-in Processing Agent | `agent-checkin` | none | active | 5 (Process Submission, ID Verification Review, Payment Reconciliation, Room Assignment, Upsell Processing) | PMS, Payment, Vostio, KB |

Note: Check-in Processing Agent has no `templateId` in the current data, which would default it to manual editor mode.

### Sales & Events Agent (Deep Dive)

The Sales & Events Agent is the showcase agent — SJ's top priority. It responds to group booking and event inquiries in under 5 minutes.

**6-step linear workflow (validated against Terry Lin's hotel interviews):**
1. **Receive Inquiry** — Email arrives at sales inbox. Extract sender, subject, body.
2. **Parse & Qualify** — Identify event type, dates, headcount, budget, contact info. Classify lead urgency.
3. **Check Availability** — Query PMS for room block AND event space availability.
4. **Draft Response** — Compose personalized response based on inquiry type and availability.
5. **Send Response** — Deliver email with CTA to schedule meeting. Target: within 5 minutes.
6. **Follow Up** — Cadence varies by lead type and urgency.

**Step-scoped conditions example (Step 3: Check Availability):**
- Available -> continue to next step
- Partial overlap -> mention to guest, suggest alternatives
- Unavailable -> suggest alternative dates
- Niche situation -> handoff to `{{hotel_email}}`

**Default gambit rules:**
1. IF event > $50K -> CC GM
2. IF wedding -> wedding-specific language
3. IF returning client -> reference history
4. IF asks pricing -> do not quote, schedule call
5. IF OTA/third party -> different template
6. Always push ACH
7. DEFAULT -> handoff to sales team with context

**Statler-specific deployed conditions (beyond template):**
- Staff names: Theresa Webb (Director of Sales), Sarah Kim (Sales Manager), James Rodriguez (Events Coordinator)
- Venues: Grand Ballroom (200 seated / 350 cocktail), Breakout A (30 pax), Breakout B (25 pax)
- Policies: $45 parking, 48-hour free cancellation, $100/night deposit
- Route to Sarah Kim directly for wedding inquiries
- Route to James Rodriguez for corporate events under 50 guests

### Front Desk Agent (Orchestrator Showcase)

The Front Desk Agent is the most complex — 7 workflows demonstrating the orchestrator architecture. One agent with multiple responsibilities (book, cancel, answer questions, create tickets, upsell). NOT 30 separate agents for each task.

**7 workflows:** Booking, FAQ, Service Request, Upsell, Checkout, Post-Stay Survey, Escalation

### Check-in Processing Agent (Backend Automation)

Pure backend agent — no guest-facing communication. Processes the staff workflow after guests submit pre-arrival check-in. Demonstrates that the builder works for non-conversational agents too.

**5 workflows:** Process Submission, ID Verification Review, Payment Reconciliation, Room Assignment, Upsell Processing

---

## 6. Feedback History

### Kevin Li Sync (March 31, 2026)

**What Kevin validated:**
- 4-step creation flow (Profile -> Capabilities -> Workflows -> Connectors)
- GT metaphor for templates + customization
- Opinionated guided experience for hotel managers
- Blank-slate mode for enterprise IT teams
- Conversational workflow editing via AI chat
- Linear workflows with step-scoped conditions

**Critical gap — Triggers:** "Every agent builder I've seen universally has a trigger. How does this work get started?" Not clearly represented in current design. Options discussed: in Agent Profile, per workflow (trigger as step 1), separate setup flow. Currently "Receive Inquiry" is step 1 in the Sales workflow but there is no explicit trigger configuration step.

**Agents = Orchestrators:** "That's sort of how we're building agents right now — they're orchestrators of multiple tools." A messaging agent = one agent with multiple responsibilities. NOT 30 separate agents.

**Pressure test required against 5 scenarios:**
1. Pure backend automation (email arrives, update PMS — no guest interaction)
2. Service ticket creation (back-and-forth, assign to right person)
3. Current chat AI rebuild (front desk with surveys, tickets, upsells, bookings)
4. Check-in automation (end-to-end digital check-in)
5. Email cancellation/reservation modification

**Tools = where the power is:** "Where you ultimately need a lot of configuration is really within the tools." Capabilities might need deeper per-tool configuration, not just toggle on/off. The gear icon on each capability card should open meaningful configuration.

**Agent Profile flexibility:** "Not all agents are going to have tone, but they might have guidelines." Backend automation agents do not need communication style. The profile step might adapt based on agent type.

**Pre-built agents for demo:** SJ wants to see pre-built agents that are already working + the ability to build the sales agent himself. Need: Messaging agent, Voice agent, Check-in agent, Sales & Events agent.

**Reference:** https://www.notion.so/canarytechnologies/Miguel-Kevin-33481468615180cdaf27c5909552514e

### Kevin Li + Terry Lin (April 14, 2026)

**Key design changes agreed:**

**1. Connectors + Capabilities merge:** Connectors become parents, capabilities are sub-items:
- Connect Email -> enables send/receive capabilities
- Connect Knowledge Base -> access to specific data sources (documents)
- Connect Messages -> enables channels (web chat, SMS, WhatsApp, email, Expedia, etc.)
- Connect Upsells -> available offer types, auto-approval thresholds

**Rationale:** Capabilities and connectors are functionally similar (both require setup/purchase, both gate what the agent can do). Two separate tabs creates confusion. Unified view is cleaner.

**Nuance:** Capabilities = Canary products (require purchase). Connectors = external integrations (OAuth, API keys). Still distinct concepts but can share a single UI section.

**2. Agent Profile slim-down:** Current: separate Rules/Guidelines textarea + Guardrails textarea. New: combine into one. They describe the same thing (agent-wide behavioral principles).

**3. Front-of-house vs Back-of-house labels:**
- Front-of-house (guest-facing): needs tone, communication settings, avoided topics
- Back-of-house (automation): no tone required — pure backend work
- Example backend: Email Reservation Agent (parse email -> update PMS, no guest response)
- Primarily a labeling distinction; UI could conditionally hide tone/communication for backend agents

**4. Workflow hierarchy:** Kevin: workflows need clearer main-vs-sub hierarchy. Main orchestrator workflows should visibly call sub-workflows (e.g., shared payment processing flow invoked from booking + checkout + upsells). Miguel: conditions already support this but UI does not communicate the hierarchy. Deferred: how to visualize it.

**5. Capabilities vs Check-in complexity:** Kevin: simple "check-in capability" toggle is not enough for a product with nuanced rules and PMS integrations. Miguel: basic check-in works in Canary; PMS-level ops need additional integration work. The capability toggle enables access, the workflows instruct behavior, the connectors bridge to the PMS.

**Sales & Events context from Terry:**
- SJ asked for Sales & Events Agent 2 weeks ago — first ROI-focused agent
- Starting with offline prompt testing (Word doc, iterate to ~70% accuracy) before building full UI
- Joshua building, isolated between three people
- Philosophy: horizontal agents must excel at vertical tasks to be useful
- **Email templates, not free-form generation.** Hotel creates templates (wedding inquiries at different price points). Agent selects appropriate template based on parameters. Similar model to contracts/authorizations.
- Contracts settings should live as their own settings page. Vision: convert RFP response -> proposal -> contract with one button.

**Action items:**
1. Get feedback from SDR team on agent builder design
2. Slim down agent profile (combine rules/guidelines + guardrails)
3. Combine connectors + capabilities into unified section
4. Miguel handles UI cleanup for communications products going forward

**References:**
- Kevin sync: https://www.notion.so/canarytechnologies/Miguel-Kevin-33c81468615180068e76e8dc01846016
- Terry follow-up: https://www.notion.so/canarytechnologies/34281468615180788320c7daf269fe38

### SDR / Sales Team Feedback (April 2026)

Live usability test with SDRs/sales reps building a Sales agent.

**Biggest requests (ranked by emphasis):**

**1. Template Store / Library:** Pre-built workflows that have worked for other properties. User picks, customizes specific parts, deploys. Current templates are agent-level. SDRs want WORKFLOW-level templates inside an agent (e.g., "Indian wedding inquiry response" workflow someone else built).

**2. Team Templates + Duplication:** Save a workflow as a team template. Others can duplicate and edit without changing the original. Critical for roles hierarchy (director's workflow vs. sales manager vs. sales associate). Reference: Rattle (Salesforce tool).

**3. Drag-and-Drop Workflow Builder:** Current text-heavy interface is overwhelming for front-office staff. Request: visual GUI with draggable steps, arrows. "Our generation does not read that much." Miguel's counter: splitting/branching gets complicated. Treat each forking path as a separate workflow. But reordering via drag is fair.

**4. Testing / Sandbox Environment:** Virtual test mode to validate workflows before deploying to real customers.

**5. Call Routing by Salesforce Account Owner:** If a customer is assigned to a specific salesperson in Salesforce, calls from their number should route directly to that person.

**6. Urgent Call Flagging — Words Only, Not Tone:** Detect urgency from specific words, NOT tonality. **Tone-based sentiment analysis is a racial-bias slippery slope** ("Hong Kongers sound angry by default"). AI must not profile people. Words only. Current messaging already does word-based anger detection. Voice should follow the same rule.

**Validated use cases (real hotel workflows):**
- **Airline crew bookings** — Airlines send Excel sheets with room requirements but no guest info. Someone's full-time job uploading to PMS. Standard practice across airline-hotel partnerships.
- **Event sales — Indian & destination weddings** — After conferences, big fat Indian weddings and destination weddings drive events industry. High-value, high-entitlement.
- **Speed of response** — 1 salesperson, 5 simultaneous calls = missed opportunities. AI picks up the missed ones, asks preliminary questions.
- **Post-booking follow-ups** — Agent reminds sales staff about upcoming deadlines and clients who have not been contacted recently.
- **Social media research for personalization** — Pull from Instagram, Facebook, LinkedIn to tailor follow-up emails.

**Cultural/market nuance:**
- North America: guests skip-to-human when they detect AI
- Asia: entitlement culture — "Bobby and I go way back, give me a discount" — will not tolerate AI gatekeeping high-value calls
- High-end properties: repeat guests with direct relationships will not accept AI for their usual contact
- **Implication:** If the caller is a known high-value contact (via phone number / Salesforce match), skip the agent entirely.

**UI observations from live use:**
- Add responsibilities interaction worked well (natural, intuitive)
- Workflow steps currently too text-heavy (needs visual treatment)
- Capabilities config modals caused surprised delight ("holy shit okay")
- "Route to Sarah Kim directly" conditions raised immediate question: "how does it know which Sarah?" — needs staff-name disambiguation
- **Activity feed / live workflow execution was the biggest demo moment** — "you can actually visually see, this is like a live chat"

**Integration confirmations:**
- Hilton already uses Canary Contracts -> Delphi automation
- Google Calendar integration planned/needed
- Salesforce integration for account-owner call routing
- Delphi — sales CRM hotels manually input into today

**Tech resistance / self-hosting:** Hotels see LinkedIn posts about vibe coding and think they can build their own AI. Positioning: "Self-hosting is not realistic for the next 5 years. This is the framework you'd be building on anyway."

**Action items:**
1. Test with Maui director of sales and marketing (4 luxury hotels — airline crew use case)
2. Reach out to Albert as hotel-specific use case resource
3. Implement template store for pre-built workflows (BIG feature)
4. Explore drag-and-drop workflow builder
5. Add team template + duplication
6. Get feedback from more SDR team members

---

## 7. Planned Changes

### 7.1 Connectors + Capabilities Merge (Option 1 / Capabilities-Primary)

**Current state:** Connectors and Capabilities are separate tabs in the builder (wizard steps 2 and 4, edit view tabs 4 and 5).

**Planned:** Merge into a unified section. Connectors become parents, capabilities are sub-items. The mental model is: "Connect X -> gain Y capabilities."

**Connector-to-capability mapping table:**

| Connection | Capabilities Unlocked |
|-----------|----------------------|
| Email (SendGrid) | Send/receive emails, email templates, auto-responses |
| Knowledge Base | FAQ answers, policy lookups, document access |
| Messages (Twilio/channels) | SMS, WhatsApp, Webchat, Booking.com, Expedia channels |
| Voice (Twilio) | Inbound/outbound calls, call transfer, voice AI |
| PMS (Oracle Opera) | Reservation lookup/modify, availability check, guest profiles |
| Contracts | E-signature generation, contract templates |
| Upsells | Offer types, auto-approval thresholds, upgrade flows |
| Authorizations | CC auth forms, payment verification |
| Payment Gateway | Payment collection, payment links, deposit processing |
| CRM (Salesforce) | Lead logging, account-owner routing, history lookup |
| Calendar (Google) | Meeting scheduling, availability slots |
| Task Management (HotSOS) | Service ticket creation, assignment, tracking |

**Why:** Capabilities and connectors are functionally similar (both require setup/purchase, both gate what the agent can do). Two separate tabs creates confusion. SDRs and hotel operators do not distinguish between "connecting" and "enabling."

**Nuance to preserve:** Capabilities = Canary products (require purchase, tied to monetization). Connectors = external integrations (OAuth, API keys). The concepts are distinct even if the UI is unified.

### 7.2 Agent Profile Slim-Down

**Current:** Separate textareas for Rules/Guidelines and Guardrails.
**Planned:** Combine into one section. They describe the same thing (agent-wide behavioral principles — things the agent should always/never do).

### 7.3 Template Store Concept

**SDR request:** Workflow-level templates (not just agent-level). Pre-built workflows that have worked for other properties. Users pick, customize, deploy.

**Team templates:** Save a workflow as a team template. Others duplicate and edit without changing original. Critical for roles hierarchy.

**Not yet designed or built.** Biggest feature request from SDR feedback.

### 7.4 Front-of-House vs Back-of-House Labeling

- Front-of-house (guest-facing): shows tone, communication settings, avoided topics in profile
- Back-of-house (automation): hides tone section, pure backend work
- Primarily a labeling/conditional-visibility distinction

---

## 8. Deferred Features

### AI-Inferred Connectors for From-Scratch Flow
When building from scratch, the Connectors step should infer which systems are needed based on capabilities and workflows configured in steps 1-3. Currently from-scratch shows all connectors as setup-required with no intelligence. Would need a Claude API call at the Workflows -> Connectors transition.

### Config vs Runtime Conditions
Check-in agent mixes admin config conditions ("If payment step disabled -> skip") with runtime conditions ("If payment fails -> retry"). These are fundamentally different but look identical in the UI. Options: different visual treatment, separate section, or accept for v1.

### Parallel Execution Representation
Front Desk orchestrator executes multiple capability nodes in parallel (LangGraph pattern). Linear workflow model cannot represent this. Options: accept as simplification, add parallel group visual, or rely on multi-workflow model. Kevin knows it is a simplification.

### Template-Specific Contextual Intros
Each template needs its own pre-built workflows with contextual AI chat intros. Sales, Front Desk, Check-in all need different intro messages and chip suggestions per workflow. Partially done for Sales & Events, needs expansion.

### Capability Gear Icon Deep Config
The gear icon on each capability card should open meaningful per-tool configuration. Messages = channel selection, Contracts = template settings, Upsells = which offers. Kevin: "where you ultimately need a lot of configuration is really within the tools." Architecture supports it, UI partially built (Messages channels, Calls categories, Upsells, Contracts, Authorizations modals exist).

### Drag-and-Drop Workflow Reordering
SDR request. Reordering steps via drag is fair (Miguel agreed). Full branching drag-and-drop is not planned — each forking path should be a separate workflow.

### Testing / Sandbox Environment
SDR request. Virtual test mode to validate workflows before deploying to real customers. Currently the animated in-progress timelines serve as a proxy for testing, but a true sandbox with input simulation is deferred.

### Call Routing by Salesforce Account Owner
If a customer is assigned to a specific salesperson in Salesforce, calls from their number should route directly (skip the agent). Requires Salesforce CRM integration.

### Social Media Research for Personalization
Pull from Instagram, Facebook, LinkedIn to tailor follow-up emails. Mentioned by SDRs. Very aspirational.

### Workflow Hierarchy Visualization
Kevin: workflows need clearer main-vs-sub hierarchy. Main orchestrator workflows should visibly call sub-workflows. Not just visual treatment — users need to understand that sub-workflows exist and can be invoked. Deferred: how to visualize it (indentation, linking, size differentiation).

### Agent in Action (Act 2)
Beyond the builder, show the agent WORKING in a simulated environment:
- Inbox of incoming sales inquiries
- Pipeline view (New -> Responded -> Meeting Scheduled -> Follow-up)
- Outbound email preview
- Killer stat: "Response time reduced from 4.2 hours to 2.3 minutes"
- Component `AgentInAction.tsx` exists but is not currently wired into the main flow.

---

## 9. Open Questions

### Cross-Cutting Connectors
When connectors become parents of capabilities in the merged UI, some connectors serve multiple agents (PMS is used by nearly every agent). How do we show that connecting a PMS for one agent makes it available for all? The property-level model handles this in the data layer, but the UI needs to communicate it.

### Empty State for Canary-Native Capabilities
Some capabilities are native Canary products (Messages, Check-in, Checkout) that do not require external connectors. In the merged connectors+capabilities model, what is the "parent" for a Canary-native capability? Is it a virtual "Canary Platform" connector? Or do native capabilities stand alone without a parent?

### Workflow Hierarchy
How do sub-workflows get represented? Options discussed:
- Main workflow tiles larger, sub-workflows indented or linked differently
- Conditions that reference other workflows ("if X -> trigger payment reconciliation flow")
- Separate section for shared/utility workflows
Kevin raised this; no decision made yet.

### Email Templates vs Free-Form Generation
Terry says hotels create email templates (wedding, corporate, different price points) and the agent selects the right one. This is NOT the agent writing emails from scratch. How does template selection work in the workflow? Is it a step condition ("If wedding -> use wedding template") or a capability config ("Messages capability has template library")?

### Staff-Name Disambiguation
SDR question: "Route to Sarah Kim directly" — how does the system know which Sarah? Needs a staff directory / people picker in workflow conditions. Not designed yet.

### Capability Complexity for Check-in
Kevin: simple "check-in capability" toggle is not enough for a product with nuanced rules and PMS integrations. Where do PMS-level conditional rules live? Currently stuffed into workflow conditions but could overflow. The capability toggle enables access, workflows instruct behavior, connectors bridge to PMS — but the granularity question remains.

### Trigger Configuration
Kevin's biggest concern from Mar 31: "Every agent builder I've seen universally has a trigger. How does this work get started?" Currently triggers are implicit (step 1 of each workflow) but there is no explicit trigger configuration step in the wizard. Options: in Agent Profile, per workflow, separate setup flow.

### Agent in Action Timing
When does the "Agent in Action" view (Act 2) become the priority? Currently the builder itself (Act 1) is still being refined. SJ wants to see the agent working, not just being configured.

---

## Appendix A: Figma Reference

**Figma file:** https://www.figma.com/design/EonU6l1LFib9tb4DgOkBdy/Agent-Builder

**Key frames:**

| View | Node ID |
|------|---------|
| Agent Type (Step 1) | `node-id=101-15731` |
| Capabilities (Step 2) | `node-id=101-14347` |
| Workflows (Step 3) | `node-id=101-13928` |
| Connectors (Step 4) | `node-id=101-14807` |
| Edit/Overview | `node-id=101-15204` |

**Creation flow (4 steps, per Wenjun alignment):**
1. Agent Type — identity, responsibilities, guidelines, tone, guardrails
2. Capabilities — Canary products grid with channel config inside each (channels no longer a separate step)
3. Workflows — linear flow with step-scoped conditions + chat builder on right
4. Connectors — pre-flight review of connected systems

**Edit view tabs:** Overview, Agent Type, Capabilities, Connectors, Channels

## Appendix B: All Repos and Prototypes

| Prototype | URL | Notes |
|-----------|-----|-------|
| Agent Fleet concept | https://canary-agent-builder.vercel.app/ | Shallow — one-page concept |
| Channel AI settings | https://product-prototype-agent-builder.vercel.app/ | Deep per-channel config (pw: Likethebird) |
| Kevin's Genesis | Local: `/Users/miguelsantana/Downloads/Archive (2)/agent-genesis/` | Opinionated guided flow |
| Kevin's Builder v2 | Local: `/Users/miguelsantana/Downloads/Archive (2)/agent-builder-v2/` | Non-opinionated builder |
| THIS prototype (Agent Builder) | Branch `demo/agent-builder` in `canary-prototype-core` | The active build |

**Repos:**
- Agent fleet: `canary-technologies-corp/prototype-canary-agents`
- Terry's channel settings: `canary-technologies-corp/product-prototype-agent-builder`
- This prototype: `msantana-canary/canary-prototype-core` (branch `demo/agent-builder`)

## Appendix C: Capability Tiers & Pricing Model

**INCLUDED (table stakes):**
- Answer from Knowledge Base
- Handoff to Staff
- Guest Profile Lookup
- Send Confirmation/Follow-up

**CORE (standard tier):**
- Reservation Lookup/Modify
- Service Request Creation
- Booking/Availability Check
- Multi-channel (SMS + Email + Voice)
- Sales Inquiry Handling

**PREMIUM (advanced):**
- Contract Generation/E-sign
- Payment Processing
- Upsell/Revenue Optimization
- Outbound Campaigns (Rebooking, No-show)
- Analytics/Insights Dashboard

**VOICE ADD-ON:**
- Inbound/Outbound Voice Calls
- Call Transfer/Routing

Sales Inquiry Agent positioned as mid-tier (Core) — shows the upgrade path. Anti-cannibalization: INCLUDED capabilities are what existing messaging AI already does (repackaging). NEW revenue comes from capabilities that do not exist yet.

## Appendix D: QA Status (as of April 8, 2026)

- TypeScript: 0 errors
- Build: 0 errors
- Unused imports: cleaned
- Dead code: cleaned (Javis/Ava agents removed)
- All flows verified: template creation, scratch guided, advanced builder, draft resume, deploy, edit agent
- Editable workflow visualizer shipped April 14 on `demo/agent-builder` branch
