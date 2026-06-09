# Agent Builder Brain — Preservation Status

> This folder is the **GitHub-durable** copy of the Agent Builder project brain. Plan: `~/.claude/plans/goofy-splashing-rabbit.md` ("Preserve at FULL FIDELITY — no abridging").
> Philosophy: **consolidation ≠ compression.** Preserve verbatim, mine transcripts, navigate — never synthesize-down.

## DONE (this pass — 2026-05-12)
- ✅ **Step 1 — Verbatim preservation.** All 18 memory files copied byte-for-byte into this folder (no rewriting). This closed the durability gap: the reasoning now lives on GitHub, not just local `~/.claude/`.
- ✅ **Step 6 (partial) — pushed.** This corpus committed + pushed to `origin/demo/agent-builder`.

## NOT DONE — REQUIRED FOR FULL FIDELITY (next session, context-heavy)
These are the steps that actually guard against abridging. They were deferred only because this session ran out of context — NOT because they're optional.

### Step 2 — Mine raw transcripts into CAPTURE.md (the anti-abridging core)
The 18 files were written incrementally and **miss granular reasoning** that only exists in the raw chat transcripts. Mine them.
- Transcript dir: `/Users/miguelsantana/.claude/projects/-Users-miguelsantana-Documents-Claude-Projects-canary-prototype-core/*.jsonl`
- **Parallelize: one subagent per transcript** (each is huge — won't fit one context). Each extracts every decision + the alternative it beat + WHY, every reversal, every rejected option, exact user quotes — **verbatim-tagged**, deduped vs the existing files. Orchestrator appends to `CAPTURE.md` (append-only, dated, session-tagged).

**Mining checklist (mark as each is mined):**
- [ ] `129047c7…` — main build session (activity-feed 3-layer arch, connector 'unassigned' model, draft flow, advanced builder, editable visualizer, drag→arrows reversal, sandbox A/B/C framing, Statler customization, dashboard hero cards, template grid, profile slim-down)
- [ ] `8f91d479…` — current_state origin
- [ ] `2f7f840c…` — kevin_terry + sdr_feedback origin
- [ ] May-18 pivot session (Q2 Block 2, Claude-first directive, Agent Knowledge rename)
- [ ] (list any other `.jsonl` that mentions agent builder — check before declaring done)

### Step 3 — Fill 4 net-new gaps (real paragraphs, not stubs)
1. **"Agent Knowledge" product def** + 4 workstreams (Configuration / Observability / Testing / Custom Actions) + how the prototype maps to each
2. **Venli.ai + Sana.ai references** — what transfers from each (Venli: connected-systems NL query; Sana: sequential builder + side-by-side preview)
3. **Chat-first adoption-confidence debate** — Kevin 60–70%, Miguel's hotel-user "shun chat" concern, agreed resolution (guided chat w/ clarifying Qs + pre-filled quick replies)
4. **Priority ranking of the 4 untasked SDR ideas** (Salesforce routing; words-only urgency flagging — NOT tone, racial-bias concern; airline-crew bookings; social-media personalization)

### Step 4 — Navigator README
Write `README.md` here: a map (one line per file: what + when to read). Sections: Start-here (parked status, resume entry points, triggers) → Strategic → Decisions (by name) → Feedback → Raw (CAPTURE) → Gaps. Routes only; summarizes nothing away.

### Step 5 — Re-point memory INDEX
Edit `~/.claude/…/memory/project_agent_builder_current_state.md` top block → name this folder's `README.md` as the front door. ARCHIVED one-liners on superseded files (`project_agent_builder.md`, pre-pivot `design_direction.md`, stale `reference_agent_builder_figma.md`). Preserve, never delete.

## Resume entry point for the PROJECT itself (when work restarts)
Not the brain — the actual product. Parked pending Agent Knowledge capacity (~2/3 on VoIP through Aug 2026). Pickup = NEW chat-first exploration branch reusing the workflow data models + visualizer-as-artifact. See `project_agent_builder_design_direction_may2026.md`.
