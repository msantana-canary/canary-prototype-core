# Agent Builder — Brain (front door)

> **This folder is the complete, GitHub-durable brain for the Agent Builder prototype.** It is a *map, not a warehouse* — this README only routes you to the right file; it summarizes nothing away. Every file below is preserved verbatim. When a topic file and `CAPTURE.md` disagree, **`CAPTURE.md` (raw, verbatim) wins** — the topic files are lossier summaries.
>
> Philosophy this brain was built under: **consolidation ≠ compression. Preserve + mine + navigate — never synthesize-down.** (See `_STATUS.md` for the preservation method and `CAPTURE.md`'s mined block for the granular reasoning that the topic files compressed out.)

---

## START HERE — status & resume

**STATUS: PARKED (May 18, 2026) — "exploration complete."** All 6 SDR/Kevin tasks shipped (commit `9039675`, pushed to `origin/demo/agent-builder`). The Q2 Block 2 review pivoted production direction to **Claude-first UI**; the prototype is kept as the design-space exploration that *produced* that conclusion (SJ literally cited it). It is NOT a failed build — it is the exercise that found the production path.

**Why parked (not abandoned):** "Agent Knowledge" (the shippable scope) has no engineering capacity this block — ~2/3 of the 3-person team is on VoIP. No eng counterpart to hand designs to. See `GAP_SECTIONS.md` §1.

**Resume entry point for the PRODUCT (when AK has capacity, ~Q3):** start a NEW chat-first exploration branch — chat on the left, the read-only workflow visualizer (with `activeStepId`) as the "artifact" preview pane on the right, the test sandbox ported into that pane, the template library turned into conversation-starters. Reuse the workflow/condition/guardrail **data models** verbatim (they transfer; the shell changes). Full plan: `project_agent_builder_design_direction_may2026.md` → "Next Steps" + the current-vs-Claude-first comparison table.

**The code:** branch `demo/agent-builder`, worktree `~/Documents/Claude-Projects/canary-prototype-worktrees/agent-builder/`, route `/settings/agents`, `PORT=3005 pnpm dev`. **NOT merged to main; never merge to main.** PRD + full context: repo `docs/AGENT_BUILDER_PRD.md` + `docs/AGENT_BUILDER_FULL_CONTEXT.md`.

**Trigger to reopen this brain:** "catch up on Agent Builder" / "continue the agent builder" → read this README, then `CAPTURE.md` (the truth), then the topic file for your specific question.

---

## RAW REASONING — read this for the *why* (the truth layer)

- **`CAPTURE.md`** — Layer-0 raw, append-only, verbatim-tagged. **The source of truth.** Two parts: (a) the 2026-05-12/05-18 session saves (build #1–6 + the pivot); (b) the big **2026-06-08 transcript-mining pass** — blocks **C1–C8** (session 129047c7, the main build, Mar 25→May 11) + **S1–S2** (session 8f91d479, strategy + the May-18 pivot). Read a chunk block when you need the granular back-and-forth, the rejected sub-options, or Miguel's exact words behind any decision. **C1** = genesis (why the project exists). **S2** = the pivot at maximum fidelity (raw SJ quotes).
- **`_STATUS.md`** — the preservation method + the mining checklist (what was mined, what was discarded as non-agent-builder, what's gone from disk). Read to understand how this brain was assembled or to resume an unfinished pass.

## STRATEGIC — the pivot & the forward plan (read these first for direction)

- **`project_agent_builder_design_direction_may2026.md`** — THE post-pivot synthesis. What we explored, what we learned, **what transfers UI-agnostically vs. what changes for Claude-first** (comparison table), and the next-steps plan. Read first when picking the project back up.
- **`project_q2_block2_comms_review_may18.md`** — the May-18 directive in brief: SJ's "copy Claude's UI / under the hood not over the hood," Agent Studio → Agent Knowledge rename, 4 workstreams, email read-only, web-chat DOM. (For the *raw* version with SJ's full reasoning and the team's pushback, read `CAPTURE.md` block S2.)
- **`GAP_SECTIONS.md`** — four topics that were discussed but never structured, written as real prose: (1) **Agent Knowledge product def + the 4 workstreams** and how the prototype maps to each; (2) **Venli.ai / Sana.ai** — what transfers from each; (3) the **chat-first adoption-confidence debate** (Kevin 60–70% vs Miguel's hotel-user concern, and the agreed resolution); (4) **priority ranking of the 4 untasked SDR ideas.** Read for the strategic open threads.

## DECISIONS — the technical/UX decision files (by name)

- **`project_agent_builder_epiphany.md`** — the **Gran Turismo (tracks/parts) + FF12 gambit (priority-ordered rules) + linear-workflows-not-trees** conceptual framework, plus the Sales Inquiry 6-step flow validated against Terry's research. Read for *why the product is shaped the way it is.* (Origins told verbatim in `CAPTURE.md` C3/C4/C6.)
- **`project_agent_builder_design_direction.md`** — the big **pre-pivot** design-thinking doc (Mar 25–29): chat-as-input/visual-as-output, Wenjun's agent-vs-workflow debate → the hybrid decision, the data model, creation-vs-editing UX, pricing tiers, Lance.live competitive. *Historical* (pre-Claude-first) but the richest single record of the early IA reasoning. **[ARCHIVED — superseded by the May-2026 direction for forward plans, but preserved as the definitive pre-pivot record.]**
- **`project_agent_builder_design_decisions.md`** — roster (why Javis+Ava dropped), activity-feed universal status model, profile-vs-workflow, chat-sidebar context rules, tab-bar/header decisions. The compact "what we decided + why" index. *(NOTE: its "6 agents map 1:1 to Kevin's pressure tests" line is loose — see Known errors below.)*
- **`project_activity_feed_architecture.md`** — the **Observability anchor**: the activity timeline as 3 interleaved layers (**workflow = brain / capabilities = hands / conversation = mouth**), the activity-card ↔ capability mapping table, and the two-tracks (complete / in-progress "magic moment") demo throughline. Read for how "watch the agent work" is constructed. *(Restored 2026-06-09 — it was referenced by CAPTURE but missing from the first preservation pass.)*
- **`project_agent_builder_connector_architecture.md`** — connectors are **property-level not agent-level**; the `'unassigned'` status; 4 hydration entry points; save-filtering. (Full bug-driven origin in `CAPTURE.md` C7.)
- **`project_agent_builder_draft_flow.md`** — draft save/resume/deploy + the `selectedAgentId` no-duplicate pattern.
- **`project_agent_builder_deployed_vs_template.md`** — templates = generic starter kits; deployed agents = **Statler-specific** (staff names, venues, policies). The "before/after" demo story. (Extra Statler specifics — James Rodriguez, GM Theresa Webb, extensions, rate codes — in `CAPTURE.md` C7.)
- **`project_agent_builder_editable_visualizer.md`** — the 3 workflow-editor modes (by `templateId`), trigger-card-immutable, conditions-as-textarea, the "NOT building" list. (The design-think + the drag→arrows reversal in `CAPTURE.md` C8.)
- **`project_agent_builder_deferred.md`** — features discussed and tabled (AI-inferred connectors, config-vs-runtime conditions, parallel execution, capability gear deep-config).
- **`project_agent_builder_remaining_tasks.md`** — the 6 SDR/Kevin tasks (all ✅, commit 9039675) + the 4 untasked SDR ideas (ranked in `GAP_SECTIONS.md` §4).
- **`reference_agent_builder_figma.md`** — Figma file + key frame node-IDs for the 4-step creation flow + edit view. **[ARCHIVED — stale: reflects the pre-pivot 4-step Figma; node-IDs may have drifted. Kept for reference, not authoritative.]**

## FEEDBACK — the stakeholder inputs that drove the design

- **`project_agent_builder_kevin_sync_mar31.md`** — Kevin validated the 4-step flow; surfaced the **TRIGGERS gap** + agents-as-orchestrators + the 5 pressure-test scenarios. (Verbatim in `CAPTURE.md` C4/C6.)
- **`project_agent_builder_kevin_terry_apr14.md`** — combine connectors+capabilities, slim the profile, front-vs-back-of-house, hierarchy, email-templates-over-freeform.
- **`project_agent_builder_sdr_feedback.md`** — the SDR/sales usability test: 3 personas, template-store = #1 request, drag-drop, **words-not-tone urgency (racial-bias)**, airline-crew, Salesforce routing, social-media. (Its origin session `2f7f840c` is gone from disk — this file IS the preservation.)

## SNAPSHOT & EARLY CONTEXT

- **`project_agent_builder_current_state.md`** — the **April-8 feature inventory** (file map, agent roster, what's built). Accurate for what exists; the #3–6 features were added after it. This is also the memory **INDEX** that points here. Read for a complete component/feature map.
- **`project_agent_builder.md`** — the **earliest context**: mission, the two prior prototypes (Agent Fleet + Channel AI Settings), Lance.live, four-pillar architecture, the 12 brainstormed agents. **[ARCHIVED — earliest framing, largely superseded; preserved as the project's starting point.]**

---

## CANONICAL DATA MODEL (the live model, as built)

> The only *full* glossary of all six terms together lives in the ARCHIVED pre-pivot `design_direction.md`, and two of its definitions drifted. This is the corrected canonical model (matches the shipped code + CAPTURE):
- **Trigger** — the intent/event that starts a workflow ("Sales inquiry received," "Guest submitted check-in"). A distinct immutable card that **precedes** Step 1; stored as its own field (`trigger` + `triggerDescription`), not as `steps[0]`. **One trigger per workflow.**
- **Workflow** — the linear step sequence handling one trigger. **Many workflows per agent** (NOT one-per-agent). Steps carry optional step-scoped conditions; `role`/`parentWorkflowId` express primary/sub hierarchy; `invokesWorkflowId` on a condition cross-references another workflow.
- **Channel** — the medium (SMS/WhatsApp/Voice/Email/OTA). **NOT a standalone primitive** — channels were **folded into Capabilities** (configured *inside* the Messages/Calls capability), per Wenjun (CAPTURE C3). *(The archived `design_direction.md` still defines Channel as a co-equal primitive — that's stale.)*
- **Capability** — a Canary **product** the agent can use (Messages, Calls, Check-in, Upsells, Contracts, Authorizations, etc.). This is the **monetization layer** (locked if not purchased). Some carry per-agent config (gear modal); add/remove to the grid IS the on/off.
- **Connector** — an external integration (PMS/CRM/POS/SendGrid/Twilio…). **Property-level, not agent-level**; the agent only chooses which to *use*. Statuses: connected / setup-required / not-available / `'unassigned'` (property has it, this agent doesn't use it).
- **Guardrails / Operating Rules** — agent-wide behavioral principles, on the **Profile** tab (the Kevin-asked slim-down merged "Rules/Guidelines" + "Guardrails" into one `behavioralGuidelines` field). Distinct from step-scoped workflow conditions (tactical, per-step).

## KNOWN ERRORS in the preserved topic files (2026-06-09 audit)

> The topic-file *copies* are kept byte-pristine for preservation, so these known errors are flagged here (and in CAPTURE's ERRATA) rather than edited in place. **When a topic file conflicts with CAPTURE, CAPTURE wins.**
- `project_agent_builder_editable_visualizer.md` — frontmatter title says "Plan (Not Yet Built)" but the body + the shipped code say **BUILT**. It is built (3 editor modes). Title lags; body is right.
- `project_agent_builder_design_decisions.md` L12 — "6 agents map 1:1 to Kevin's pressure tests" is **loose**: Kevin named **5** scenarios; the real roster = those 5 + the 2 flagship customer-facing agents (Voice, Sales & Events) SJ wanted demoed. See CAPTURE C6.
- `project_agent_builder_deployed_vs_template.md` L15 — **"$45 parking" is uncorroborated** (appears nowhere in the raw). CAPTURE C7 has "W 54th St parking garage" (no fee); the corroborated fee is "late checkout $50."
- **Wizard step count** — stated as 4 / 5 / 6 across files. **Canonical = 5** (Profile → Capabilities → Workflows → Connectors → Deploy). `epiphany.md`'s 6 is the superseded pre-Wenjun version; "4-step" labels undercount.
- **Speaker-attribution caveats** (see CAPTURE ERRATA for detail): the Notable scar tissue is **Miguel's**, not Jake's (C2 mis-tag); the **May-18 meeting (S2) is unlabeled** so its in-meeting speaker tags are inference (the Slack-DM tags are reliable); genesis-prototype authorship (Wenjun vs Miguel) is **ambiguous in the source**, not settled.

---

### Reading order for a cold pickup
1. This README (you are here) → 2. `CAPTURE.md` C1 (genesis) + S2 (pivot), then its **ERRATA** at the end (correction log) → 3. `project_agent_builder_design_direction_may2026.md` (forward plan) → 4. `GAP_SECTIONS.md` (open threads) → 5. dive into the specific decision file you need.
