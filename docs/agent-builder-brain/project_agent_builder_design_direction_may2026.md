---
name: agent-builder-design-direction-may-2026
description: "Synthesis of prototype exploration, SDR feedback, Kevin/SJ directive, and Q2 Block 2 review. Captures what we learned, what transfers, and the Claude-first direction going forward."
metadata: 
  node_type: memory
  type: project
  originSessionId: 8f91d479-ca29-4a79-a6be-eefacb9ba66f
---

## Status
The Agent Builder prototype on `demo/agent-builder` is **complete as an exploration artifact**. It explored the full design space for agent configuration, generated critical stakeholder and user feedback, and directly informed the team's strategic direction. The prototype is not the production path — it's what helped the team find the production path.

## What We Explored (Feb–May 2026)
Built on `demo/agent-builder` branch, 6 deployed agents, full feature set:

- **Dashboard** — 3-column agent grid with hero stats, active/draft status
- **Agent Templates** — 5 templates + 3 locked premium, guided wizard + advanced builder
- **4-Step Wizard** — Profile → Capabilities → Workflows → Connectors
- **Advanced Builder** — Tabbed edit view, no wizard, direct manipulation
- **Workflow Visualizer** — Trigger → step cards → conditions, editable + read-only modes
- **Chat-as-Builder** — Claude API sidebar for conversational workflow building
- **Activity Timelines** — 25 unique timelines, 3 interleaved layers, animated in-progress
- **Workflow Template Library** — 15 generic templates, 5 categories, team templates with duplication
- **Workflow Hierarchy** — Primary/sub grouping, cross-workflow condition references
- **Test Sandbox** — Split-screen with persona-driven simulated runs, active step tracking

## What We Learned

### From SDR Feedback (April 2026)
- **Three user personas**: Basic (wants templates that "just work"), Intermediate (customizes parts), Advanced (full manual control)
- **Biggest gap**: Workflow-level template store — pre-built playbooks users can browse and clone
- **Hotel staff reality**: Not tech-savvy, resist training, don't want to consult IT. UI must be simple enough to use without help.
- **"Our generation does not read that much"** — text-heavy interfaces overwhelm front-office staff
- **Activity feed was the biggest demo moment** — "you can actually visually see, this is like a live chat"

### From Kevin + Terry (April 14 Sync)
- Capabilities + connectors should merge into unified section
- Workflows need clearer main-vs-sub hierarchy (built this)
- Front-of-house vs back-of-house agent distinction matters
- Email templates model (select from predefined) > free-form generation

### From Q2 Block 2 Review (May 18, 2026)
- **SJ's directive**: "When you show me a design, I'm literally gonna ask, can you show me how they would do this on Claude? I don't want there to be differences."
- **Why**: Hundreds of millions trained on Claude's UX. Don't retrain customers on different patterns.
- **Hospitality differentiation belongs under the hood** (PMS integrations, domain knowledge) — not in the UI
- **Scope clarity**: "We're not building a greenfield agent studio. Current focus is configuring existing agents."
- **Team renamed**: Agent Studio → Agent Knowledge
- **Capacity**: ~2/3 redirected to VoIP this block. No engineering bandwidth to act on designs.

### From Kevin + Miguel Chat (May 18)
- Kevin 60-70% confident on chat-as-interface adoption
- Miguel's concern: hotel users may shy away from chat builder, need hand-holdy onboarding
- Kevin: "Chat should feel more hand-holdy over time — just talk to me, I'll figure it out with you"
- **Agreed direction**: Guided flow with clarifying questions + pre-filled quick replies (like Claude's onboarding)
- **Both modes needed**: Guided for beginners, advanced for pros — confirmed the dual-mode approach
- **Avoid**: ElevenLabs-style complexity (visual node builders with boxes and arrows)
- **Reference**: Sana.ai's sequential builder with preview/testing side-by-side — "kinda what we have thoughts for"

## Design Principles Going Forward

### 1. Chat-First, Not Dashboard-First
The entry point should feel like starting a conversation, not browsing a settings page. "Hey, let me walk you through building a quick agent" — not a grid of cards.

### 2. Guided Onboarding to Wow Moment
Pre-filled quick replies, clarifying questions, examples that drive completion. The wow moment needs to happen fast — within the first minute of interaction.

### 3. Preview/Test as Side Panel
Claude's "artifacts" pattern: chat on left, preview on right. The workflow visualizer, test sandbox, and configuration preview all belong in this right panel as the user builds via chat.

### 4. Dual Mode (Later)
Guided chat flow for Basic/Intermediate users. Some form of direct manipulation for Advanced users. Don't build the advanced mode first — guided is the priority.

### 5. Hospitality Under the Hood
PMS integrations, domain-specific knowledge, hotel workflow templates — these are the differentiators. The UI wrapper should feel familiar to anyone who's used Claude/ChatGPT.

## What Transfers to Production (Regardless of UI)

Everything below is UI-agnostic — it works whether the shell is a dashboard or a chat:

- **Workflow data model**: Steps, conditions, triggers, guardrails, cross-workflow references
- **Agent roster + template system**: Pre-built agents with template-based creation
- **Capability + connector architecture**: Property-level connectors, capability toggles, config modals
- **Workflow template library**: Category-based browsing, clone + customize, team templates
- **Test scenario framework**: Persona-driven test runs, step-by-step execution, guardrail verification
- **Activity timeline model**: 3-layer interleaving (workflow/capability/conversation), universal status

## What Changes

| Current Prototype | Claude-First Direction |
|---|---|
| Dashboard with agent cards as entry point | Chat conversation as entry point |
| 4-step wizard with tabs | Guided chat that asks clarifying questions |
| Visual workflow builder (flowchart cards) | Chat builds workflows, preview pane shows result |
| Hierarchy tree with indented sub-workflows | Sub-workflows referenced conversationally |
| Settings-style layout (sidebar + content) | Chat + artifact panel (like Claude) |

## Next Steps (When Agent Knowledge Has Capacity)

1. **Start with chat-first prototype** — new exploration branch. Chat interface on left, preview/artifact panel on right. User describes what they want, system builds the agent configuration.
2. **Reuse workflow visualizer as preview** — the read-only visualizer with active step tracking is the "artifact" that appears as the user builds via chat.
3. **Port test sandbox to preview pane** — "Let me test this for you" triggers the simulated test run in the artifact panel.
4. **Template library becomes conversation starters** — instead of browsing a grid, the chat suggests "I have a pre-built workflow for booking requests — want to start from there?"

## References
- Prototype: `demo/agent-builder` branch, worktree at `~/Documents/Claude-Projects/canary-prototype-worktrees/agent-builder/`
- PRD: committed in repo at `docs/AGENT_BUILDER_PRD.md`
- SDR feedback: [[project_agent_builder_sdr_feedback]]
- Kevin/Terry sync: [[project_agent_builder_kevin_terry_apr14]]
- Block 2 review: [[project_q2_block2_comms_review_may18]]
- Remaining tasks: [[project_agent_builder_remaining_tasks]]
- Venli.ai: Norwegian startup SJ referenced for connected systems + NL queries
- Sana.ai: Sequential builder with preview — Kevin's reference for "what we have thoughts for"
