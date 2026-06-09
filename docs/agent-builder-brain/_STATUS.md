# Agent Builder Brain — Preservation Status

> This folder is the **GitHub-durable** copy of the Agent Builder project brain. Plan: `~/.claude/plans/goofy-splashing-rabbit.md` ("Preserve at FULL FIDELITY — no abridging").
> Philosophy: **consolidation ≠ compression.** Preserve verbatim, mine transcripts, navigate — never synthesize-down.

## DONE (this pass — 2026-05-12)
- ✅ **Step 1 — Verbatim preservation.** All 18 memory files copied byte-for-byte into this folder (no rewriting). This closed the durability gap: the reasoning now lives on GitHub, not just local `~/.claude/`.
- ✅ **Step 6 (partial) — pushed.** This corpus committed + pushed to `origin/demo/agent-builder`.

## STEP 2 — DONE (2026-06-08 deep mining pass)
✅ **Step 2 — Mine raw transcripts into CAPTURE.md.** Complete. The 7 `.jsonl` files in the transcript dir were stripped to clean text, the agent-builder regions located (the two monster sessions are mostly OTHER projects), sliced into 10 day-aligned chunks, and mined by 10 parallel Opus subagents (one per chunk). Findings appended verbatim to `CAPTURE.md` under the dated section "## Transcript mining — 2026-06-08" as blocks C1–C8 (session 129047c7) + S1–S2 (session 8f91d479). Append-only. CAPTURE.md went 61 → ~1,450 lines.

### Step 2 — Mine raw transcripts into CAPTURE.md (the anti-abridging core)
The 18 files were written incrementally and **miss granular reasoning** that only exists in the raw chat transcripts. Mined them via parallel subagents; every decision + the alternative it beat + WHY, every reversal, every rejected option, exact verbatim quotes — deduped vs the existing files, appended to `CAPTURE.md`.

**Mining checklist (DONE):**
- [x] `129047c7…` — main build session → mined as **C1–C8** (genesis→build→drag→arrows→editable-visualizer→brain-philosophy). Agent-builder region was clean-file lines ~5167–24862; everything before was broadcast filters / other projects (excluded). Captured: the SJ "didn't get it" prototype origin, buffet-vs-employee, outcome-pricing Notable scar tissue, chat-IS-builder reversal chain, TRIGGERS-live-in-workflow, agents=orchestrators debate, the full `'unassigned'` bug-driven evolution, Statler customization (+James Rodriguez/Theresa Webb/extensions/rate codes), Advanced Builder non-linear flow, drag→arrows reversal at primary-source depth, sandbox A/B/C framing, brain-preservation philosophy.
- [x] `8f91d479…` — current_state + strategy/pivot → mined as **S1–S2**. Captured: workflow template library + "Indian wedding too niche" genericization + Rattle clone model, team templates, hierarchy-as-role-tagging-NOT-DAG, test sandbox Phase A/B/C, and **THE MAY-18 PIVOT at maximum fidelity** (SJ's raw decoded quotes — "I have so much garbage in me," "22-year-old with no baggage," "follow that puck," "cheat code," "under the hood not over the hood" — PLUS the two-sided pushback the topic-files dropped), Agent Knowledge rename, Venli/Sana, chat-first adoption debate, park decision.
- [x] `2f7f840c…` — **GONE from disk** (expired; was the SDR-feedback origin per `sdr_feedback.md`'s frontmatter). Cannot be re-mined; its content is already preserved verbatim in `project_agent_builder_sdr_feedback.md`. Treated as satisfied-by-file.
- [x] May-18 pivot session — it is **`8f91d479` DAY 2026-05-18** (lines 1020–1892), mined in **S2**. (NOTE: `163a375a` is dated May-18 but is an unrelated messaging-3panel branch lookup — NOT the pivot.)
- [x] Other `.jsonl` checked — `90b9dd50` (check-in; its own Claude calls `demo/agent-builder` "unrelated"), `acdb7dbc` (check-in-flows; 100% `check-in-flows/*` edits, agent-builder mentions = git-hygiene only), `0866a6b6` (guest-check-in demo), `0db1fe75` (command-center; one AB quote salvaged into CAPTURE), `163a375a` (messaging-3panel lookup) — all verified NON-agent-builder and excluded. Other project dirs (Canary backend, foundation, wyndham) hold no `.jsonl`. **Mining is COMPLETE.**

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
