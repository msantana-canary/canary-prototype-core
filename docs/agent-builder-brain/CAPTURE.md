# Agent Builder — CAPTURE (raw, append-only)

> Layer 0 of the 3-layer brain. Append-only, never edit prior entries. Tag `[verbatim]` or `[my summary]`.
> Decision log = the many `project_agent_builder_*.md` topic files in the memory root (design_decisions, connector_architecture, draft_flow, deployed_vs_template, activity_feed_architecture, editable_visualizer, kevin_terry_apr14, sdr_feedback). INDEX = `project_agent_builder_current_state.md`.

## Session save — 2026-05-12 (session 129047c7 — the main build session)

This session built the bulk of the agent builder on `demo/agent-builder`, then this final stretch did Kevin/SDR polish. By the time of this save, LATER sessions had already completed all 6 tasks (commit 9039675) and the project is now PARKED ("exploration complete", Claude-first pivot per `project_agent_builder_design_direction_may2026.md`). This entry captures reasoning from THIS session not already in the topic files.

### Decisions made this session (with the road not taken)

- [my summary] **Step reordering = up/down arrows, NOT drag-and-drop.** Built drag-and-drop first (HTML5 native, no lib), then reversed it. **Why:** each editable step card is ~200px tall, so dragging across 5 steps means scrolling-while-dragging — terrible UX. Arrows next to the trash icon are precise, one-click, height-independent. First step hides up-arrow, last hides down-arrow. Trash icon recolored red (#CC3340) for distinction. [verbatim user] "does it need a drag or would it benefit from an up or down button instead beside the trash button? Reason being is because each step takes up so much vertical space that we can't move it reasonably long distances if we have like, 5 steps"

- [my summary] **Profile slim-down: merged the two "Rules/Guidelines" + "Guardrails" textareas into ONE** "Rules, guidelines, and guardrails" textarea. **Why:** Kevin Apr 14 — they describe the same thing (agent-wide behavioral principles), two boxes was redundant. Existing data auto-concatenates with `\n\n` on first load, then flows into `behavioralGuidelines` and clears `guardrailsText` (single source of truth going forward).

- [my summary] **Sandbox/testing approach — recommended Option A, which the later session built as "Phase A".** Three options framed: (A) "Test Run" button → pick a pre-built scenario → watch the existing animated in-progress timeline play out (reuses animation engine, fastest, visual wow); (B) "Simulate" chat → type a sample guest message, agent shows which step/conditions hit (needs Claude API to evaluate); (C) full sandbox/clone → real messages, no PMS writes (production feature, not prototype). **Why A:** minimal build (animation infra already exists), strong demo moment, answers "does my workflow work?" without a real execution engine. Confirmed by outcome — `project_agent_builder_remaining_tasks.md` shows later session shipped "Phase A: split-screen test mode, persona picker, animated simulated runs, 8 scenarios." B/C deferred.

- [my summary] **Editable visualizer was already built by a prior session** — I re-verified rather than rebuilt (no repeat work). Memory file said "NOT YET BUILT" but it was shipped; updated status. Lesson: verify against current code before trusting an old memory's status line (the 33-day-old reminder was right).

### State at this save
- [my summary] Branch `demo/agent-builder`, pushed to origin (personal `msantana-canary`). NOT merged to main. This session's commits: profile slim-down (1b24831), step reordering arrows (f041a9d). Both pushed.
- [my summary] Vercel preview live; needed `NEXT_PUBLIC_ANTHROPIC_API_KEY` added to the `demo/agent-builder` preview env (was failing with "Could not resolve authentication method" because the env var was missing on the deploy). Added via `vercel env add ... preview demo/agent-builder`, redeployed via empty commit.
- [my summary] Fixed a literal `→` rendering as text (not an arrow) in WorkflowVisualizer JSX line ~504 — inside JSX text nodes the escape doesn't unescape; replaced with literal `→`.
- [my summary] Library search-icon bug (icon pinned to top, overflowing) = Tailwind 4 treats `transform: translateY(-50%)` (TW3 pattern in lib styles.css) and native `translate` as separate properties; the CanarySelect fix had sidestepped it with `top-0` + explicit height. Full fix handed to the library Claude (apply CanarySelect's pattern to CanaryInputSearch/Input/CreditCard/Password/Multiple). Lib updated via `pnpm add git+...foundation`.

### Open / next (superseded — see remaining_tasks.md, all 6 done by May 13)
- [my summary] At THIS session's end, tasks #3–6 (workflow template store, team templates, hierarchy, sandbox) were still pending and meant for a fresh session. They were subsequently completed. Untasked SDR ideas still open: Salesforce-account-owner call routing; words-only urgent-call flagging (NOT tone — racial-bias concern, [verbatim SDR] "Hong Kongers sound angry by default"); airline-crew bookings use case; social-media personalization.

## Session save — 2026-05-18 (the build-#3–6 + Block-2-pivot session — commit 9039675)

This is the session that ACTUALLY built tasks #3–6 (referenced in hindsight by the 05-12 entry above as "done by May 13"). Build happened ~May 12–13; the Q2 Block 2 review + strategic pivot landed May 18. This block captures the build reasoning AND the pivot that PARKED the project — neither was in the topic files before.

### Build decisions this session (with the road not taken)

- [my summary] **#3 Workflow Template Library — templates genericized away from the SDR's "Indian wedding" example.** SDR feedback named "Indian wedding inquiry response" as the canonical workflow-template use case; I started toward that, Miguel course-corrected. Built 15 universal hotel workflows across 5 categories (Sales & Events, Guest Engagement, Front Desk, Check-in/Checkout, Operations) instead. **Why:** niche cultural example doesn't generalize; every property needs event-inquiry / lead-followup / booking / pre-arrival / upsell / service / checkout / escalation. [verbatim user] "Indian wedding might be too niche so think through a little bit what would be a good template for hotel user but yeah give it a crack"
- [my summary] **#3 distinction preserved (Rattle model):** workflow-LEVEL templates inside an agent, NOT agent-level templates (which already existed). "Use" always clones with fresh IDs on workflow + every step + every condition — the source template is never mutated. Library is the first thing shown on "Add Workflow"; "Start from Scratch" lives inside the library, not as the default.
- [my summary] **#4 Team Templates** — "Save as Team Template" in the workflow tile's 3-dot menu; purple "Shared by [name]" badge replaces the category badge; dedicated "Team" tab in the library. Pre-seeded 3 realistic ones (Sarah Kim — VIP Arrival Protocol, Michael Torres — Group Billing Reconciliation, Theresa Webb — Loyalty Recovery Outreach) so the tab isn't empty on first load. User-saved templates attribute to current user (Theresa Webb). **Why pre-seed:** empty-state would read as broken in a demo.
- [my summary] **#5 Hierarchy = role-tagging, NOT a DAG.** Added optional `role: 'primary'|'sub'` + `parentWorkflowId` to AgentWorkflow, and `invokesWorkflowId` to StepCondition. Primary renders full-width with blue left-accent + "Calls N sub-workflows"; subs render indented under a tree-branch left border with "Called by [primary]". **Rejected:** connector lines/arrows between tiles — too much SVG/DOM fragility for prototype fidelity. **Front Desk deliberately stays FLAT** (7 peer workflows, no forced parent) — only Check-in (Process Submission → 4 subs) and Sales & Events (Inquiry → Cold Lead + Contract Prep) show hierarchy. Cross-workflow refs added to mock-data conditions so the "Run X workflow" chips light up in the visualizer.
- [my summary] **#6 Test Sandbox = "Phase A" (simulated), the option I'd recommended last session.** Split-screen: left = WorkflowVisualizer with new `activeStepId`/`activeConditionId` props (persistent pulsing glow on the live step, blue highlight on the matched condition); right = test panel with persona picker + timed event feed (trigger / guest-message / agent-response / system-note / condition-match / guardrail-check). 8 scenarios across 6 workflows, each a distinct persona (e.g. Sarah Chen corporate booker, Robert Hartley frustrated Diamond VIP, Mark Stevens checkout-dispute). Personas double as the #C "scenario library" — Miguel's idea: [verbatim] "This could also tie into Phase C because we could do test personas to examplify these simulated runs." **Why simulated over live-Claude:** reliable/deterministic for demos, reuses no real execution engine, instant wow. Phases B (live interactive Claude) + C (save/replay runs) explicitly deferred.
- [my summary] Library enum gotchas fixed: `ButtonType.SECONDARY` doesn't exist → use `SHADED`; `disabled` prop → `isDisabled`. (Same class of canary-ui naming traps as before.)

### THE PIVOT — Q2 Block 2 Comms Review (May 18) parked the project
- [verbatim SJ, from transcript] "When you show me a design of whatever we're doing, I'm literally gonna ask, can you show me how they would do this on Claude? And like, I don't want there to be differences."
- [verbatim SJ] "we went through this exercise of creating, like, what does the agent builder look like? And it turned out we probably should have just copied [Claude's] UI. You know, we created a whole different UI with, like, agents and all that"
- [my summary] SJ's rationale: hundreds of millions already trained on Claude/ChatGPT UX — don't retrain hotel customers on bespoke patterns. Hospitality differentiation belongs UNDER the hood (native PMS API integrations, not MCP) — NOT in the UI. [verbatim SJ] "more under the hood, not over the hood."
- [my summary] **"Agent Studio" → "Agent Knowledge"** rename. Scope explicitly narrowed: NOT building a greenfield studio — "configuring existing agents (voice, messaging, web chat)." 4 workstreams confirmed (Configuration, Observability, Testing, Custom Actions) — they map exactly onto what the prototype already explored. ~2/3 of Agent Knowledge capacity redirected to VoIP this block → no eng counterpart to hand designs to.
- [my summary] Venli.ai (Norwegian hotel-tech startup) referenced by SJ as the connected-systems + natural-language-query model to study. Sana.ai's sequential builder w/ side-by-side preview = Kevin's "kinda what we have thoughts for."

### Kevin ↔ Miguel Slack (May 18) — chat-first adoption debate
- [verbatim Kevin] "i think i'm like 60-70% confident; i think a lot of folks are coming around, chat gpt & claude is making chat the interface to interact and build"
- [verbatim Miguel] "while you and I are well-versed in the chat-as-interface paradigm, I wonder what % of our users will know what to do when given this product" — anecdote: AEs/Sales saw the chat-as-builder demo, kept voicing that hotel users "might shun/shy away from this interface and need more hand-holdy onboardings."
- [verbatim Kevin] "yeah i actually think the chat should feel more hand holdy over time ya know" / "its like - just talk to me, i'll [figure] it out with you" / "while change is hard - i think we gotta get them to the wow moment quickly"
- [my summary] Agreed direction: guided chat flow w/ clarifying questions + pre-filled quick replies (Claude-onboarding style); dual-mode confirmed — [verbatim Kevin] "yeah i think we'll need both ultimately" (guided for beginners, advanced/freeform for pros). Avoid ElevenLabs-style node-graph complexity — [verbatim Miguel] "wanna avoid the complexity of agent-builders like ElevenLabs."

### Decision to PARK (mine, Miguel agreed)
- [my summary] Recommended parking the prototype as **"exploration complete"** rather than continuing to build on the current custom-UI paradigm. **Why:** (1) the prototype already did its job — it's literally the exercise SJ cited that produced the "just copy Claude" conclusion; building more on the bespoke paradigm has diminishing returns now that production direction is shifting; (2) Agent Knowledge has no capacity to consume designs this block; (3) Miguel has nearer-term deliverables (Jake + messaging-nav/command-center, check-in configurator). Wrote `project_agent_builder_design_direction_may2026.md` as the synthesis (what transfers UI-agnostically vs what changes for Claude-first). Reframing, NOT redesign — the bones (chat + visualizer split, guided setup, templates, test sandbox, all the workflow/condition/guardrail data modeling) transfer; the shell shifts from "settings dashboard w/ agent cards" to "chat-first builder w/ artifact preview pane."

### State at this save
- [my summary] Commit **9039675** on `demo/agent-builder` (11 files, +2249/−150): new files WorkflowTemplateLibrary.tsx, WorkflowTestMode.tsx, workflow-templates.ts, workflow-test-scenarios.ts. Pushed to origin (personal `msantana-canary`). NOT merged to main. `npx tsc --noEmit` clean. Co-author tag used Opus 4.6 on that commit.
- [my summary] Project is now **PARKED**. Next pickup (when Agent Knowledge has capacity, ~Q3): start a NEW chat-first exploration branch — chat on left, reuse the read-only visualizer (w/ activeStepId) as the "artifact" preview, port the test sandbox into that preview pane, turn the template library into conversation-starters. See design-direction doc for the full plan + the current-vs-Claude-first comparison table.
- [my summary] Miguel's CURRENT active work has since moved to **Messaging Command Center** (`project_command_center.md`, Wenjun's `ai-dashboard` repo, branch `feature/command-center`, `PORT=4123`) — the continuation of the Jake + messaging-nav thread. Separate brain.

---

## Transcript mining — 2026-06-08 (deep anti-abridging pass — sessions 129047c7 + 8f91d479)

> **What this is.** Step 2 of plan `goofy-splashing-rabbit.md` ("Preserve at FULL FIDELITY — no abridging"). The 18 topic files were written incrementally and compressed out the granular reasoning — the back-and-forth, the rejected sub-options, the exact words. This pass mined the RAW `.jsonl` chat transcripts to recover that reasoning. Method: the multi-project transcripts were stripped to clean text, the Agent-Builder regions located (the monster session 129047c7 is mostly OTHER projects — broadcast filters, etc. — and was sliced to the agent-builder spans only), then **parallel subagents mined one day-aligned chunk each** against an "already-captured" digest, instructed to go DEEPER than the summaries and capture every decision + alternative-it-beat + WHY + verbatim quotes. Append-only; each `### Cx`/`### Sx` block is one chunk's verbatim-tagged findings, reproduced from the mining subagent faithfully.
>
> **Canonical agent-builder sessions = `129047c7` (main build, Mar 25 → May 11) + `8f91d479` (strategy + May-18 pivot).** Confirmed three ways: signal density, edited-file paths, and the check-in session's own Claude stating verbatim "129047c7, 8f91d479 are the Agent Builder sessions (different project)."
>
> **Sessions verified NON-agent-builder and discarded:** `90b9dd50` (check-in; its Claude lists `demo/agent-builder` under "unrelated products"), `acdb7dbc` (check-in-flows; 100% `check-in-flows/*` edits — the agent-builder mentions are git-hygiene only, provenance note below), `0866a6b6` (guest-check-in demo / Statler), `163a375a` (a messaging-3panel branch lookup — dated May-18 but NOT the pivot), `0db1fe75` (command-center; one agent-builder quote extracted below). **SDR feedback session `2f7f840c` is GONE from disk** (expired) — its content is already preserved in `project_agent_builder_sdr_feedback.md`, so it cannot be re-mined and is treated as satisfied-by-file.
>
> **Provenance note (from acdb7dbc git-hygiene, 2026-04-21):** `AGENT_BUILDER_PRD.md` (with a +127-line Revisions section) and `AGENT_BUILDER_FULL_CONTEXT.md` (untracked, 965 lines) were committed into the agent-builder worktree during a branch-sorting cleanup — that's where the repo `docs/` PRD + full-context docs originate.
>
> **One agent-builder quote salvaged from 0db1fe75 (command-center session):** [verbatim — Miguel, on the Claude-first lens] "When you show me a design of whatever we're doing, I'm literally gonna ask, can you show me how they would do this on Claude? And like, I don't want there to be differences." (Echoes SJ's May-18 directive — Miguel had internalized it as his own design test.)

---

### C1 — 129047c7 — DAY 2026-03-25 — Project genesis: AI-agent-builder concept intro, two-prototypes setup, earliest architecture/IA, Sales Inquiry Agent definition, Lance.live competitive context, four-pillar origins

#### Net-new decisions & reasoning (not in the digest)

- [my summary] **The whole project's genesis was a comprehension failure with SJ, not a strategy doc.** Wenjun built the very first agent-builder prototype overnight specifically because SJ literally could not understand the agent-first paradigm verbally. This is the origin event.
  - [verbatim — Wenjun] "I was like talking, trying to explain to SJ and he's just like, 'I don't get it.' So I put together a prototype to demonstrate that idea."
  - [verbatim — Wenjun] "So I was trying to explain to SJ yesterday What's in my head? And he told me like, no, he doesn't get it. and without seeing a prototype so Just like, you know, today, last night, I spin up this prototype, like, you know, try to demonstrate, like, what I mean in my head so he can actually, like, visualize it."
  - [my summary] The prototype-as-explanation pattern is the founding move of the whole project — a prototype existed to make a verbal idea legible, before any product intent. Wenjun: "It's not meant for anything that is tied to our product, honestly. But it's just like a happy jam session."

- [my summary] **Two FOUNDING metaphors collided in the genesis meeting: "buffet" (rejected) vs. "hiring an employee" (adopted).** The hiring-employee framing won explicitly because it's easier for the hotelier audience to grasp — this is the seed of the entire "virtual employee / job post / responsibilities" model.
  - [verbatim — speaker in meeting] "If you're thinking about it like a buffet, you have one agent and you just give them a bunch of tools and capabilities. Think about it like you're hiring an employee. What kind of responsibility do you want to assign to that employee? And I think it's easier for our audience to actually understand this."
  - [verbatim — Wenjun, later] "For my hotel, I want to hire an employee. Instead of a real person, we hire a virtual person. And then what do you need? Right? This is like, you need a job post and then use out all the responsibilities and also like know how you should behave as well. … can we actually like using a similar paradigm to actually building out a person with the personality and also job responsibility and also capability"

- [my summary] **The "products become tools the agents invoke" inversion was stated at genesis** — products demoted from the thing-you-sell to channels/tools the orchestrating agent uses. This is the architectural inversion underpinning everything.
  - [verbatim — meeting] "So my agents don't exist here yet. Not anymore, but those products are actually the tools they can actually use. Our product becomes two square inches. Like a channel or something they can invoke, right?"
  - [verbatim — meeting] "What if we completely decouple what our product is … versus the agents. Can the agents be a separate autonomous workforce than like the AI feature within the product."

- [my summary] **The sale is at the capabilities + orchestration level, not the product level — stated as the original monetization thesis.**
  - [verbatim — meeting] "So the sale is at the capabilities and... orchestration, the capabilities level." / "Yeah, and also the workflows, right? You can orchestrate how the agent gonna behave for you."
  - [verbatim — meeting] "the capabilities could also be like… a menu list of items that you can add in and if they don't have it, they can purchase and add more. … all the capabilities could be unlocked if you pay a higher monthly fee or if you buy one time."

- [my summary] **Outcome-based pricing was explicitly examined and flagged as dangerous, grounded in Miguel's Notable post-mortem.** This is the *reasoning* behind why pricing later landed on capabilities/products rather than outcomes.
  - [verbatim — Miguel] "Like we're trying to sell outcomes. Um... Outcomes are tough. They can be tough if outcomes are not well-defined. That's the problem we ran into. Notable was essentially workflow automation for hospitals. We sold outcomes and flows. … The outcomes, I think, started getting a little tough to sell because both you and your end customer have to be aligned on the value."
  - [verbatim — Miguel] "when, The bill came and They were like, wait, but it doesn't actually cost us this much money to do this. Like, we shouldn't pay this much. … I know Sierra charges based on outcome. So when it doesn't work…"
  - [verbatim — Miguel] "It was a pretty big exercise for us to work with hospitals. do like a full time study and get alignment on like when you submit a prior audit cost you 20 minutes, the average cost of your employee is this much. Those are all different inputs."

- [my summary] **"Stop the intellectual debate, build it end-to-end" is the actual launch decision** — and the explicit mechanism chosen was: pick ONE agent, force yourself to build it in the prototype, and let the UI break to surface the real questions. The genuine decision was *the methodology* (pressure-test by building, not by arguing).
  - [verbatim — SJ/meeting] "I really think we're at this point where we're going to have an intellectual conversation about these items, like agents and workflows and connectors and capabilities and whatever. And we're like, well, depending on the day, one of us will convince the other that this works better. … or like the last tweet, the last Twitter post that I read or LinkedIn post article that one of you saw, like that'll influence everything. And so let's not get caught up in the name here. Let's just describe the things and then let's decide which one we want to do."
  - [verbatim — SJ/meeting] "I feel like Robert needs to meet the road here a little bit now. … What is the first agent that we would like encourage our customers to create… it'll force us to answer some of these questions around like the UI paradigm, the capabilities, the knowledge, the documents, and see it end-to-end and through."
  - [verbatim — SJ/meeting] "force yourself to use it to build the [Sales Inquiry Agent]. And let's see where things break down. … And maybe things don't break down, you need to add concepts."
  - [verbatim — SJ/meeting] "Otherwise we're going to have an intellectual debate about prototypes." / "Intellectual debate done. Let's go."

- [my summary] **Agents↔workflows boundary blur was diagnosed live, in real time, by the act of renaming an agent.** "Reservation Agent" got renamed to "Respond to email sales inquiries" mid-conversation — and that act itself demonstrated the agent had just become a workflow. The original observation that later hardens into "agents = orchestrators, workflows = their tools."
  - [verbatim — Miguel] "We just changed these from agents to in my capabilities workflow." / "This is exactly what just happened, right? In the renaming of this agent to this thing."
  - [verbatim — meeting] "Maybe you get rid of workflows and you just have agents and within those agents people can define the capabilities of those agents."
  - [verbatim — Miguel] "So it was my fault for renaming."

- [my summary] **The "trigger OR schedule" duality was stated at genesis as the agent activation model** — long before "Triggers = biggest gap" (Kevin Mar 31).
  - [verbatim — Miguel] "It's like you either run things on a trigger or you run things on a schedule. So nothing should be stopping you from saying, every night at 9 p.m., do this action. That action can be defined in the workload, which might be like… access to the knowledge base and clean it up."

- [my summary] **Human-in-the-loop was raised as an unsolved tension at genesis and explicitly DEFERRED ("let's not go that deep yet").** Seed of the later "human-in-the-loop + triage" requirement.
  - [verbatim — meeting] "some of it is easy to sort of overlook and just let the agent run itself. Others, I feel, might still need human intervention or human in the loop. … if we tell them that we automate the night audit… They're still probably going to feel like they need to be responsible to look into those options." / [verbatim] "Yeah, let's not go that deep yet."

- [my summary] **"Don't expose core prompts; only allow custom instructions as 'prompt injection' for specific tools" was an explicit early guardrail decision.** Custom actions for voice are defined in human-readable language and, longer-term, should be prompt-based not UI-based.
  - [verbatim — meeting] "Yeah, within calls, that's the one where you can create a tool, essentially, through this create action. … you would just define it in human readable language."
  - [verbatim — meeting] "I think longer term, eventually these new actions can like be a prompt base rather than UI-based tools work. The outcome is as we determine them. Not UI driven. There's a lot of clicking around you have to do, right?"

- [my summary] **"Forward-deployed engineer" was reframed as the thing the AI follow-up-questions should replace — then Miguel partially retracts it**, deciding Canary's CS will do the hand-holding rather than the product needing great onboarding Q&A. Origin of the "guided vs. self-serve" tension that recurs all project.
  - [verbatim — meeting] "One of the root reasons I think that these agent builder companies have forward deployed [engineers] in the news is essentially for that, right? … we at the forward deployed engineer would need to ask."
  - [verbatim — meeting] "Yeah, so I guess I think I take that back. I don't think we need to get good at asking follow-up questions because we're going to be working with our customers on detours from the base agents."
  - [verbatim — meeting] "I do think that like chat as a UX is good for updating and creating the agents. But I think in the end, you're still going to need the settings page. … starting with the settings page, and we're going to layer on a layer that like makes it really easy to config." (Settings-first, chat-as-layer — the *inverse* emphasis from the later Mar 26 "chat IS the builder" swing.)

- [my summary] **Anti-cannibalization growth-curve story was the original investor framing, told as a literal whiteboard chart.** Each generation grows faster than the last; valuation should be pegged to the newest (AI/agents) curve.
  - [verbatim — Miguel] "we've had digital authorizations as the wedge product… back in 2017. Then like in 2020 we like launch GMS… contactless check-in. And that actually has been growing faster than our wedge product grew… Then in like 2024 we launched our kind of like first agentic solution… AI guest messaging… that's actually grown even faster. … this framework is not only right for our business… this also is how we storytell our way that Don't look so much here and here [old curves]… our evaluation should be based on the growth of this [agents]. … Not only is it true, it's actually a good way to [tell the story]."
  - [verbatim — Miguel] "there's also along the way, a storytelling for investors, right? … you see that like SaaS is like taking a hit, right? Like in terms of valuations."

- [my summary] **"Front desk calls" rename decision (genesis-level) — to differentiate from call-center calls and to signal that "wherever there's agent settings, there's an AI revenue stream."** The revenue-stream tell is the load-bearing rationale.
  - [verbatim — Miguel] "Whenever there's agent settings, that means there's an AI revenue stream. And in that agent settings is kind of when you get to control the agent."
  - [verbatim — meeting] "be front desk calls… Because that also says like… That delineates this product to a… Call center calls."

- [my summary] **"Channel = one agent today, but multiple agents per channel over time" was the agreed reconciliation of the products-vs-agents debate.** The bridge that let them keep product nav AND honor the agent vision.
  - [verbatim — Kevin] "I think this pattern is still right. It's just right now there's one agent, but you might create different agents over time. They'll still have access to tools."
  - [verbatim — Miguel] "within front desk calls, right? There might be like a Concierge AI agent settings. reservations, AI agent settings… These become like the different agents and then within the agents you have different tools."

- [my summary] **Actions vs. Agents naming was almost reversed at genesis.** The PRD had recharacterized agents as "actions"; with "agents" now the hot term, the team debated swapping back. Resolution: keep tools/actions at the capability level, but allow the agent label at the channel level.
  - [verbatim — meeting] "in the PRD… we wanted to recharacterize it as actions, but in reality, they are agents. So should we pivot back and rename them as agents? Because from a labeling perspective, people are more recognized agents."
  - [verbatim — Kevin] "Generally within the agent buildings I've seen, tools and actions are pretty widely used. It's like agents have access to tools and actions and that allows them to do things."

#### Deeper reasoning on already-captured decisions (quotes + rejected sub-options + back-and-forth)

- **"Palantir for hotels":** the digest cites this as positioning; here's its actual birth — credited as possibly Miguel's own idea, planted in Wenjun's head via an email, and immediately punctured by SJ.
  - [verbatim — meeting] "The best example is, Can we be the [palantir]? … Can we be the [palantir] here for hotels?"
  - [verbatim — SJ] "It's not as cool as being a palantir for… Did it hurt in a war, but sure."
  - [verbatim — Miguel] "You probably put this in my head, so it's probably your idea."
  - [my summary] Later weaponized against the MCP question — Palantir = owning the AI/action layer, the *reason* Canary should NOT become an MCP/plumbing layer. [verbatim — meeting] "We want to be the planters for the hotels. We're owning the AI layer and we're taking the actions. Do we want to become the MCP layer? Probably not."

- **Sales Inquiry Agent definition (top-priority agent):** Miguel dictating it verbatim plus the value justification and the "this is what Lance monetized" hunch.
  - [verbatim — Miguel] "Sales. Inquiry. Agent… hotel gets a request for a group booking or an event. This agent… Response in less than five minutes. with information, availability, And… A call to action. To. Set up a meeting. to discuss further."
  - [verbatim — Miguel] "I'm like pretty sure Don't ask me how, but I'm pretty sure this is what Lance spoke to $2 million in revenue on."
  - [verbatim — meeting] "You have to have an event space… It can't be a small hotel… But the value of an inquiry is really high. It's in the hundreds of thousands of dollars."
  - [verbatim — meeting] "the first two are the only revenue-[driving]. … This top one is super, super valuable in terms of driving revenue to a hotel."

- **Four-pillar architecture origin:** the digest credits "AI Product Intel Mar 9." This chunk contains that ENTIRE source report verbatim (pasted into chat by Miguel). Pillars = **Knowledge → Behavior/Persona → Actions → Insights** mapped across Ada/Intercom/Salesforce/Sierra/Voiceflow.
  - [verbatim — AI Product Intel report] "The agent builder space has converged on a four-pillar architecture (Knowledge, Behavior/Persona, Actions, Insights) but products diverge sharply on how users navigate those pillars and how they build confidence before going live."
  - [verbatim — report] "First-time setup should walk through pillars sequentially (wizard), then switch to tab-based for ongoing management" — the literal source of the later Creation(wizard)-vs-Editing(tabs) split.
  - [verbatim — report] "What if the test panel IS the product? If a hotelier spends 80% of their time testing and 20% configuring, should the builder be a test environment with configuration tools?"
  - [my summary] Report also seeds AI-that-tests-AI (Voiceflow/Sierra/Cognigy/Decagon), failure-first insights (Intercom Optimize/Tidio/Freshworks), Sankey flow viz, and "Human Hours Saved" metric — all later echoed in the test sandbox + insights work.

- **Chat-as-input / visual-flow-as-output:** this chunk captures its *birth moment* — Miguel proposes the magic moment, and Claude's `/team-pm-thinking` challenge crystallizes the input/output split.
  - [verbatim — Miguel] "an additional magic moment is that if the AI assistant can actually show the changes happening as the user types the instruction. Whether it's workflow, or text… If they were showing a flowchart then it could be like, 'I wanna make this change' and then the flowchart evolves and changes and explains why those changes are made."
  - [verbatim — Claude, in PM-thinking challenge] "Is the right answer maybe: text/chat as the INPUT, visual flow as the OUTPUT? The user describes what they want, and the system shows them the resulting logic visually?"
  - [verbatim — Claude] "you're not asking anyone to BUILD in the canvas — but they can SEE and VERIFY in the canvas. The AI builds it, they approve it."
  - [my summary] Split explicitly motivated by THREE problems Claude enumerated: (1) non-technical users can't build in a canvas, (2) trust gap, (3) debugging — "Even if they don't BUILD it visually, they might need to SEE it visually."

- **Notion Agent Builder as reference:** Claude's full teardown after Miguel sent ~19 screenshots, plus Kevin's original verbal description.
  - [verbatim — Kevin] "they have templates, which is like probably the most top types it's like are you a Q&A answer, are you a daily morning brief person… and from the templates you can just like there's a chat as a UX to essentially build this agent… and then in the settings they're sort of like triggers, prompt, tools. And that's pretty much it."
  - [verbatim — Claude teardown] "No workflow builder at all. The 'workflow' is just numbered steps in plain English inside the Instructions page… The AI interprets these instructions. The user doesn't draw nodes or connect conditions."
  - [verbatim — Claude] "the market might be moving AWAY from workflow builders toward simpler paradigms."
  - [my summary] Claude proposed adapting Notion's blank Instructions page into a *hospitality-structured* template: When to engage / What to say / What to do / What NOT to do / When to hand off. Seed of the later profile/guidelines structure.

- **Lance.live competitive context:** net-new here — the precise comparative ("2.5 years for Canary"), the traction agent (closed sales/event bookings via a named SF founder "Reggie Amar"), and SJ's strategic read that enterprise contracts must NOT block disruption.
  - [verbatim — meeting] "they just announced they've raised a $3.5 million seed round. They also just announced that there are $2.2 million of CAR in [six] months. By the way, it took us two and a half years to get to $2.2 million of [ARR]."
  - [verbatim — meeting] "the one that they're getting traction around is closed sales… So Reggie Amar, I don't know who he is. This guy, he's in San Francisco… these guys have event space… When they get an event."
  - [verbatim — meeting] "SJ said that a lot of the stuff that we're doing is also because we're tied and married towards enterprise contracts. And we shouldn't let that stop us from innovating and disrupting as much as we can." / "Can we actually disrupting ourselves before everybody else?"
  - [verbatim — meeting] "We can't really underestimate how much people care about the ease of use for these things… for them, the math makes sense. It's just like buy one, do one task, and that's simple enough."

- **"Chat is not the optimum interface" (Wenjun):** Wenjun's foundational anti-chat thesis stated HERE on Mar 25, with the visual-communication argument.
  - [verbatim — Wenjun] "Chat is actually not the optimum like the interface to interact with AI. That's what we stuck with… in ChatGPT. … my prediction is we're slowly moving away from chat for interaction with AI."
  - [verbatim — Wenjun] "chat is like, you need to be very clear on what you actually want. Or something like, oh, I have some vague idea in my head, but I don't know what exactly to ask. Then you get stuck… if I provide a template for you… now I have some sort of idea. Now I can start building things. Visual is actually one of the elements that we've actually been ignoring since [ChatGPT]… playing a huge part of like human communications… Otherwise everything become text, there's no picture."
  - [my summary] Original "blank canvas is intimidating → templates + visual scaffolding" argument, pre-dating the Mar 27 hybrid decision. Miguel and an eng converge: "An empty canvas is almost as intimidating as [a blank page]" / "you give somebody a blank canvas, they might not know what to do, but if you can use suggestions… It will guide them to the right path."

- **Workflow builder skepticism (genesis):** the root distrust of node-based builders, tied to WhatsApp's bot builder.
  - [verbatim — Miguel] "when I was looking at Wenjin's, the thing where he basically had drag and drop actual workflows, which I think is how you build the rich features in WhatsApp… the automated bot builder in WhatsApp… I kind of feel like people also want to move away from that because sometimes it can get too technical too."
  - [verbatim — Miguel] "I think chat as a way to build those diagrams is the right UX, because then you can kind of just be conversational and be like, okay, if the guest says this, then I want to do this, but the guest says this, then I want to do that."

- **Generalizable-vs-sales-specific tension (the core scoping decision):** the *founding articulation* of why the builder must stay generic.
  - [verbatim — Miguel] "There's so much complexity in that flow but it stops becoming 'repeatable' for other products/agents. We optimize too much for sales we lose the ability to break it out to other products."
  - [verbatim — Claude reframe] "If we prototype the agent builder around that, we get a great Sales Inquiry Agent demo but we've built a sales tool, not an agent platform. … These [12 agents] share almost nothing at the workflow level. What they DO share is the configuration model."
  - [my summary] Resolution = explicit **two-layer model**: Layer 1 = generalizable Agent Builder (UI doesn't change per agent), Layer 2 = the specific agent in action (the "holy shit, this is real" demo). Claude's rule for using Terry's discovery: use it for the *knowledge/tools palette*, NOT to design the builder UI — "the 6 stages tell us what tools to offer."

#### Reversals

- **Settings-first (chat as a thin layer on top) → leaning toward chat-as-primary by end of chunk.** Mar 25 morning meeting landed on "start with the settings page, layer chat on." By Mar 25 night, after the Notion teardown + PM-thinking challenge, the emphasis flipped toward chat/AI as the *primary input* with visual flow as output and settings demoted to "the basics." (Full "chat IS the builder" swing is Mar 26.)
  - [verbatim — meeting, morning] "starting with the settings page, and we're going to layer on a layer that like makes it really easy to config."
  - [verbatim — Claude, night] "Chat/AI as the PRIMARY input… Visual flow as the SECONDARY output… Settings panel for the basics… Templates for the starting point."
- **"Reservation Agent" → "Respond to email sales inquiries" (renamed mid-meeting), then the rename itself reverted conceptually** when the team realized renaming had turned an agent into a workflow ("it was my fault for renaming").
- **Miguel asserts then retracts "we need to get good at AI follow-up questions"** (quoted above).

#### Rejected options

- **"Buffet" mental model (one agent, dump all tools on it)** — rejected for "hiring an employee with assigned responsibilities" (more legible to hoteliers).
- **Selling pure outcomes / outcome-based pricing (à la Sierra)** — rejected as primary model; outcomes are hard to align on, customers balk at the bill (Miguel's Notable failure).
- **Becoming an MCP / plumbing layer** — rejected: "Do we want to become the MCP layer? Probably not. That's where things are gonna be super struggle." Canary owns the AI/action layer (Palantir framing).
- **Dropping the workflow/visual representation entirely (Notion-pure simplicity)** — Miguel's stated assumption, rejected by the PM-thinking challenge (trust gap, opaque debugging, real conditional logic like "$50K AND returning corporate booker → VIP package"). Outcome was NOT "drop it" but "don't build IN it, SEE/VERIFY in it."
- **Native Swift for the staff app** — rejected (React Native preferred). [NON-AGENT-BUILDER tangent in same session; noted only.]
- **Building the Sales Inquiry Agent as a new channel tab (Direction A)** — Claude floated and rejected: "Sales inquiries aren't a 'channel' — this forces a use case into a channel box."
- **Pricing agents purely as standalone SKUs ("buy one agent")** — debated, left unresolved; Miguel pushed back: "it just like troubles me that If we just like the selling by agents, is that the right model? Or… We can let you build whatever agents you want, but you have to pay for the skills." (build-anything, pay-per-capability favored.)

#### Notable verbatim quotes (Miguel's framings/metaphors/reactions worth preserving raw)

- [verbatim — Miguel] "We're gonna try to make it real. We're gonna try to make it do better or be better." (founding charge for the Sales Inquiry build.)
- [verbatim — Miguel] "I really need to think more like a product manager, even if even though I'm a product designer… I need to be able to think through the product thinking as clearly and thoughtfully as possible and see what we're able to build realistically based on the infrastructure that we have and the infrastructure that we can build up on top of."
- [verbatim — Miguel] "that wasn't Kevin's concern that was my concern but good job remembering." (correcting Claude on attribution — the guidance/guarantee-success concern is Miguel's own.)
- [verbatim — Miguel] "I think the hotel operator will have varying degrees of use. … front desk management… generic… is a set and forget kind of thing, but sales inquiries can be very granular and specific… push ACH, or maybe there are specific sales tactics and processes that are property and brand specific conversation points that they need to follow and be faithful for. Trusting the AI is still a gap; there still needs to be a human in the loop but in a way for them to understand and digest how things are working, and what they can do to triage/fix the problem." (THE requirements articulation anchoring human-in-the-loop + triage + the spectrum of agent complexity.)
- [verbatim — Miguel] "I think guidance is a key element. I think we can have out of the box templates… A wizard may help, but I think even further we should have an AI assistant that can help build an agent from scratch, triage on the side. I would imagine that if I had a problem with some customer inquiries in the last few days, I can point to this assistant, and ask why this problem keeps happening then I can be pointed in the right direction." (original spec for templates + wizard + AI-assistant-with-triage in one breath.)
- [verbatim — Miguel] "the more it sounds like… The scope is getting bigger and bigger, but then yeah, it's good to keep adding scope and then I'm gonna figure out which ones like The bare minimum required to get this product out and successful." (scoping philosophy — expand then cut to MVP.)
- [verbatim — Miguel] "We've thought too much about this now. Now, like, okay, we need to do something. How do we do it end to end and like really answer these questions in the field, right?"
- [verbatim — Miguel] "Agent Builder was kind of spurred on from RFPs, like Hilton was one of them, for voice they wanted an Agent Builder in particular… it's just been expedited because of the inherent gut reaction that SJ got from seeing Lance.live." (dual origin — Hilton RFP demand + Lance scare. Not in the digest.)
- [verbatim — Miguel] "it's effectively like the product I used to work on is effectively this. … At Notable, I worked on the workflow automation platform for hospitals… We didn't call them agents back then because there wasn't the whole agentic thing. But effectively, you were creating these little mini workflows that automated certain things." (Miguel's direct prior-art credibility — Notable EHR workflow automation = agent builder precursor.)
- [verbatim — Miguel] "I saw one dude's and I was like, shit, is this just Claude's default for what an agent builder is?" — [verbatim — Kevin reply] "It might be, but you just used my prototype as a way to build a framework that looked like it's real." (early self-aware worry that all prototypes converge on Claude's generic default — foreshadows the May-18 "should've just copied Claude" pivot.)
- [verbatim — Miguel] "I think also because Agent Builder… This is something that we've all been thinking about in different sorts of ways"
- [verbatim — meeting, on target user] "it's going to be Monica Daubensbeck at Von Trapp, right? She hates her front desk and she thinks that they're all idiots. So she'll automate it. … the 36 rooms guy [Wade] in [National Park / Zion]… Those people at that level, whether they're owners, regional managers, or individual property managers, they Are the ones who are going to be actively involved." (concrete named personas for who builds agents — owners/regional/property managers, not front desk.)
- [verbatim — meeting] "Are we, like, ourselves, like, doing the same thing as well? That we actually like stuck into the form of what we already know." (Wenjun's self-critique — the team is as trapped in its existing-product framing as hoteliers are.)

#### Open questions / deferrals raised here

- Selling agents as standalone SKUs vs. subscription-to-build-many vs. outcome/transaction-based — explicitly punted ("We can get to that later. Let's get some traction, then we can get to that.").
- Human-in-the-loop quantification — deferred ("let's not go that deep yet").
- Which agent-creation paradigm wins — templates vs. structured instructions vs. connections vs. workflow builder — left open; Claude's synthesis (chat-input + visual-output + settings + templates) offered but not ratified ("I won't know till I see it").
- Who actually builds the agents (hotel GM / sales director / Canary CS) — flagged as load-bearing; partially answered by the "owners/regional/property managers" list but not for the Canary-CS-does-it case.
- How to encode each agent's unique "specifications" inside a generalizable container — Miguel's explicit open question.
- Scope/phasing of the prototype (which of the 6 sales stages; Phase 1 creation / Phase 2 working / Phase 3 management) — proposed, not locked.
- Whether email is even a Canary "channel" / new infrastructure — raised, unanswered.
- Q2 launch feasibility — aspirational ("if it's a simple enough implementation, it's something that we could run through for Q2 maybe").

#### Coverage note
~70% of this chunk is Agent Builder; ~30% other-project noise skipped (staff-app native-Swift-vs-React-Native; prototype-core merging/feature-flagging; card-art handoff; mobile-key onboarding/Travelodge; a personal fashion tangent inside the Miguel↔Kevin 1:1). The chunk reproduces verbatim the *entire* AI Product Intel (Mar 9) report and Terry's Sales-Booking discovery summary, so the four-pillar + 6-stage-pipeline provenances are fully grounded. Many "meeting" quotes are auto-transcribed multi-speaker audio with imperfect attribution (the transcript garbles names: "planters"=Palantir, "Lens/Netherlands"=Lance, "car/CAR"=ARR); attributed to "meeting" where the speaker wasn't reliably identifiable. Miguel's own `[U …]` lines are high-confidence verbatim.

---

### C2 — 129047c7 — 2026-03-26 — Revised UI direction (settings+chat, AI-navigates-left), self-criticism + heavy first build

#### Net-new decisions & reasoning (not in the digest)

- [my summary] **Three competing IA models (A/B/C) were explicitly laid out before the Mar-26 reversal.** Option A = everything in chat+visual flow (rejected: "Knowledge sources and connections are really 'setup' concerns, not 'workflow' concerns. Mixing them muddies the visual"). Option B = four pillars as sections (rejected later: "too much navigation"). Option C = two layers, identity-once vs behavior-iterate (Claude's own doubt: may not map to how operators think). The tie-breaker: Terry's interviewees described their work in STAGES with tools/knowledge EMBEDDED in the workflow — "checking availability IS the workflow, not a separate 'connection' to configure." That pushed back toward A-with-smart-inference.
  - [verbatim — Claude] "That might argue for Option A after all — but with the AI assistant being smart enough to extract the knowledge/connection requirements FROM the workflow description. You say 'check Salesforce for room availability' and the system knows it needs a Salesforce connection and surfaces that."

- [my summary] **Miguel's "be opinionated, define HOW they should work" stance is the philosophical license for the whole product** — origin of intent-driven config. He rejects waiting to learn user mental models because the domain has none yet.
  - [verbatim — Miguel] "to be fair we'll never know truly how hotel staff are gonna use this tool because this is a new frontiner and a new technological realm. We can afford to be opinionated and define HOW they should work. I think when we start the conversation we should ask what they would want the agent to do, we can provide pre-baked options or they can start froms cratch. But from what they ask, we can know what connections we'd expect to require to ensure that this agent will work effectively. We can have some pre-built integrations, and then highlight what needs access."

- [my summary] **"Onboarding a real employee" metaphor for the create flow** — distinct from GT/FF12/MGS. Frames connections as a "pre-flight check."
  - [verbatim — Claude] "This is actually closer to how you'd onboard a real employee. You don't ask a new sales hire to 'configure their workflow.' You tell them their job, hand them the tools they need, and give them a playbook. They figure out the nuances over time with coaching."
  - [verbatim — Claude] "The connections/integrations piece is interesting because it doubles as a qualification step. If a hotel wants a Sales Inquiry Agent but doesn't have email connected, that's a blocker you surface immediately — not something they discover after spending 30 minutes configuring behavior. Almost like a pre-flight check."

- [my summary] **Prompt-injection-on-stock-capabilities is a pattern lifted from an existing Canary feature, applied to pre-built agents.** Resolution = "opinionated defaults with editable instructions per capability." Technical mechanism under the "90%→100% personalization gap."
  - [verbatim — Miguel] "One of the things we've been doing for one of our features is to use prompt injection on our out of the box 'actions' to slightly tailor/edit our stock capabilities. Should that same behavior be in our out of the box stuff?"
  - [verbatim — Claude] "So pre-built agents are opinionated defaults with editable instructions per capability. Not rebuilding the workflow, just tuning the behavior within it."

- [my summary] **The "SJ goes in to break it" requirement forced a real Claude API, not a canned demo.** Decision to wire live Sonnet (`claude-sonnet-4-20250514`) into the prototype; determinism via system prompt; graceful fallbacks; <6s latency budget; animations to mask the latency window.
  - [verbatim — Miguel] "I want this thing to simulate as real as possible. When SJ goes in to test it, he's here to break it. If we're gonna use text-as-interface we're gonna need that to ACTUALLY work if SJ decides to use it to build it from scratch."
  - [verbatim — Miguel] "evolving is fine, instantaeneous is good but we can project to simulate what reality will be like, and we can probably throw in animations or something to make it look like something is really coming to life. Ideally we'd want things to be deterministic, but we can have a system prompt that provides guidance to the Sonnet model, right?… I think Generate > Show Result is fine if we can keep it under 6 seconds, because that's how AI works right now, right?"
  - [verbatim — Miguel] (on wild off-script asks) "if it's truly out of left field then we can see how it looks."

- [my summary] **Location decision: the product lives in the Settings Sidebar under "Canary Agents."** Implemented as `addProduct` after Knowledge Base, route `/settings/agents`, icon `mdiRobotOutline`.
  - [verbatim — Miguel] "Have some pre-built agents already active and fleshed out too. This product will be located in the Settings Sidebar under Canary Agents or something"

- [my summary] **The Lance.live computer-use insight reframed Canary's AI as an interface-OPERATOR, not just a Q&A bot.** Conceptual justification for AI-navigates-the-left-side.
  - [verbatim — Miguel] "what I've discovered was that last dot live is apparently like a computer forward or computer deployed AI agent. From the basis of it, it literally seems like it's just scanning what's on your computer and then operationalizing it, or it's using screen recording or video to scan what is on the computer, and then just like click on the buttons to do the action that it was required to do. … So in essence, our AI should kind of have the visibility of like what it needs to do or fix in order to get the job done."
  - [verbatim — Claude] "Our AI does the same thing but natively — it knows the UI because it IS the UI. It can point to specific elements, navigate to specific views, highlight specific problems. It's not just answering questions — it's operating the interface alongside you."

- [my summary] **AI navigation implemented as a `navigateTo` action in the structured API response** — the AI returns a tab to switch to (and optionally elements to highlight) alongside the workflow/connections JSON.
  - [verbatim — Claude] "When AI responds, it can include a `navigateTo` action that switches the left side's active tab and optionally highlights specific elements"

- [my summary] **Guided-vs-open chat resolved as lifecycle-dependent, three concrete modes.** First-time = guided (quick-reply chips forming a conversation tree); configuring = semi-guided (chips inferred from GAPS); troubleshooting/operating = open (no chips).
  - [verbatim — Miguel] "In the chat threads, do we add guided conversations, kinda like quick replies, or let it be incredibly open? Just thinking that through."
  - [verbatim — Claude] (semi-guided) "These aren't random chips — they're inferred from gaps in their current setup."

- [my summary] **Lifecycle-aware progressive disclosure given its 4 concrete states** (this chunk is where it's defined). No-agent→template picker/open prompt ONLY; Building→chat+evolving workflow, connections surface only when AI identifies them; Configured-not-deployed→test panel prominent ("Try it before going live"); Running→activity+insights primary, chat becomes refinement. Tension Claude flagged: hiding things may erode trust.
  - [verbatim — Miguel] "The thing that I criticize amongst all the prototpyes that we've seen is that there's too much noise, and what's the functionalty and features that matter the most to a user at any given time?"
  - [verbatim — Claude] "it's not about removing features — it's about showing the RIGHT features at the RIGHT time."

- [my summary] **Sierra.ai researched and used to VALIDATE the direction.** Sierra's four pillars (Journeys/Knowledge/Brand/Insights) map to Canary's; auto-detect-knowledge-gaps + simulations-as-deploy-gate noted. Key DIFFERENCE: Sierra shows NO visual output of its NL-defined Journeys ("which is what our 'magic moment' is about"); and Sierra SPLITS no-code (Studio) and code (SDK) into separate products whereas Canary serves both with one interface.

- [my summary] **Notion's instructions page became the model for "structured-but-not-rigid" sections.** Resolution: "the instructions page IS the source of truth (like Notion), but there's a visual workflow tab that renders a flow diagram FROM those instructions." Miguel later refined that sections should GUIDE the workflow rather than be open text.
  - [verbatim — Miguel] "I'm thinking about how Notion does it in their product. It's literally a single sheet that kind of provides distinct instructions. But maybe similar to what we talked about before, instead of an open text format, it would be more useful to have possible like sections to sort of guide the workflow of this. So I think the visual still kind of helps, but ultimately it's just something we need to think about."

- [my summary] **The build was attempted with parallel background agents but they hit a sandbox boundary** — the worktree was a sibling path outside the cwd sandbox, so Write silently failed; Claude fell back to Bash heredoc. (Explains why the early build was clunky.)

- [my summary] **"Both the text workflow list AND the visual diagram is redundant noise" — Miguel's challenge killed the text list.** Decision: kill the numbered text workflow list; the visual diagram IS the workflow; keep Overview/Actions/Guardrails as text. Beat: keeping both (rejected as the exact noise they criticized — "One of them is always decorative"); and the inverse (kill diagram keep text — the visual is the "magic moment" so it won).
  - [verbatim — Miguel] "Why/why not have both the workflow AND the visual workflow? And is Workflow even te right place to start when opening an agent??"
  - [verbatim — Claude] "The numbered text list and the visual node diagram are the same information displayed twice… It adds exactly the kind of noise we criticized in every other prototype. One of them is always decorative."
  - [verbatim — Miguel] (resolution) "Visual diagram is nice, we can go with that. Summary should be for existing agents, new agents we could probably do workflow. So I think you/we are right"

- [my summary] **Default-tab-by-lifecycle decided: new/building → Workflow; existing/running → new Summary tab** (status + one key metric + last activity + one-liner). Implemented (`'summary'` AgentViewTab, SummaryTabContent).

- [my summary] **The multi-workflow-per-agent question opened, then Miguel forced a self-test that reversed Claude's own instinct.** Initially Claude proposed workflow cards + pre-loaded multiple workflows per template (modeled on Miguel's old `prototype-canary-agents` WorkflowBuilder: Booking Request / Guest Complaint / Service Request / Check-in Upsell / Group-Event Inquiry). Self-test #1 walked it back: diagram directly for 1 workflow, expandable cards for 2+, templates start with ONE primary workflow (pre-loading 3-4 = "a wall of content they didn't ask for"). Self-test #2 (max reasoning) went further: questioned whether "multiple workflows" is the right abstraction AT ALL — operators describe ONE flow with STAGES; what looks like separate scenarios are branches/condition-nodes handled by capabilities (prompt injection). The self-diagnosed mistake: copied an old Zapier-style automation BUILDER, but "AI agents are fundamentally different — they route themselves based on intent." Multi-workflow only justified for genuinely separate TRIGGERS. (Seed of the digest's "Linear workflows NOT branching trees" Mar-29 framing — surfaced here a day earlier.)
  - [verbatim — Miguel] "Have you thought about multiple flows per agent? All I see is one"
  - [verbatim — Miguel] "test against yourself, is your thinking right? don't contradict for the sake of it just think it through"
  - [verbatim — Miguel] "try again, just put in max reasoning"
  - [verbatim — Claude] "Where I think I was wrong: I jumped to 'multiple workflows as a list' because your original prototype had it. But that was a workflow BUILDER for automations (like Zapier), not an AI agent builder. AI agents are fundamentally different — they route themselves based on intent. You don't need to pre-define every branch."
  - [verbatim — Claude] "Different scenarios are handled by CAPABILITIES with per-capability instructions (prompt injection), not separate named workflows. The Front Desk Agent workflow: Call comes in → Greet → Identify intent → [condition: FAQ / Reservation / Service / Transfer] → Handle or handoff. That's one diagram with a branch point — not 4 separate workflows."

- [my summary] **AI tab-navigation by keyword-detection was built then ripped out (too aggressive).** It auto-switched tabs on ANY response mentioning "connections"/"capabilities," yanking the user off Workflow mid-conversation. Replaced: only switch on NEW DATA for a tab, and only when BUILDING a new agent.
  - [verbatim — Claude] "the keyword detection approach was wrong. It should only switch on data changes."

- [my summary] **Auto-typing / typewriter reveal added to BOTH chat bubbles and structured sections** (from the messaging-vaporware repo idea). Chat = 40ms/word; Overview types word-by-word, workflow steps stagger 400ms, guardrails 300ms. Gated to fire ONLY on new AI data — multiple fixes needed because it kept firing on mount/manual tab clicks.

- [my summary] **A live-fix vs batch-fix working-mode preference was set during pressure-testing.** Miguel didn't want Claude idle while he trawled for bugs.
  - [verbatim — Miguel] "I;m still finding things. What's better? To dump fixes live or to batch things? I don't like you being inactive while I'm pressure testing"
  - [verbatim — Claude] "Keep dumping live. I'll collect everything and batch-fix when you say go."

- [my summary] **A live ANTHROPIC API key was pasted into the conversation** (`.env.local` didn't travel with the worktree; no `NEXT_PUBLIC_ANTHROPIC_API_KEY` in core's env). Claude flagged it twice for rotation. (Explains a real friction point in making the prototype "actually work.")
  - [verbatim — Claude] "Also — you should rotate that key after we're done. It's now in the conversation history."

#### Deeper reasoning on already-captured decisions (quotes + rejected sub-options + back-and-forth)

- **"The chat IS the builder" → Mar-26 reversal:** the actual sequence — Miguel BUILT the full chat-IS-builder + dashboard + 5-tab detail version FIRST, saw it live, recoiled.
  - [verbatim — Miguel] "sigh look I'mma be honest I'm not loving the UI. Still feels overly complex and honestly doesn't feel like we're doing the Chat-to-visual interface... I gotta go to workflows specifically to see it, etc. I feel like our agent should be able to access WHERE we need to go, or something. Is that instict right? Challenge it."
  - [verbatim — Claude] "we built a traditional settings app with a chat bolted onto one of the views."
  - Claude's pushback (where it did NOT fully concede): a HOME state still needs visual scanning. [verbatim — Claude] "There still needs to be SOME visual structure for scanning — when you open the agent page, you need to see your agents at a glance without asking a question. The dashboard with agent cards is still useful as a HOME state."
  - First proposal was a NO-TABS pure two-panel (left=AI-shows-whatever / right=always-chat). Miguel found it "a little weird." The Lance insight then reframed it into KEEP-the-tabs-but-AI-drives-them. [verbatim — Claude, first no-tabs proposal] "No tabs. No separate builder vs detail view. ONE view per agent… The AI navigates the interface for you. You never click a tab." — with its own flag: "If the AI is slow or misunderstands, you're stuck. With tabs, you can always click."
  - [verbatim — Claude] (the safety valve) "A minimal breadcrumb or section indicator at the top of the visual output showing WHAT you're looking at… but you switch between them by talking, not clicking. Think of it like how Claude Code works."

- **Pricing tiers — the back-and-forth behind "sell capabilities through the agents, not a store":**
  - [verbatim — Claude] "Don't sell capabilities directly — sell them through the agents that need them… The upsell happens naturally at the moment of need — not as a separate shopping experience."
  - [verbatim — Jake, via Claude] "Outcomes are tough… when the market was good, everyone was like, totally, this is awesome. But when the bill came, they were like, wait, but it doesn't actually cost us this much."
  - [verbatim — SJ, via Claude] "You can create the agent, but you have to pay for the reservation, like, you know, typically." / "Now you want an agent for handling your phone calls. Now you have to pay extra for the voice capability."
  - [verbatim — Miguel] "what are the core capabilities that we should bundle or sell that you know any basic hotel can use that doesn't cannibalize into the more premium pricing that we want to incorporate down the line."
  - Sales-agent-as-mid-tier WHY: [verbatim — Miguel] "The Sales agent should be a middle tier maybe for this demo so we can show what it's like to be a mid-level user vs. a premium user, and we can showcase an opportunity to sell." Claude: "Shows the upgrade path… More compelling than showing the top shelf."

- **Lance.live competitive intel (researched here via 8+ WebFetch):** YC W26; sells Receptionist AI Agent + Sales AI Agent + Lance Pad (tablet ops hub); 50+ hotels across Marriott/Hilton/Hyatt; team ex-Google/Salesforce/Domo/Stanford; lead metric ">30% reduction in front desk calls"; founder's dad worked at Marriott; "vision-based computer-use agents" navigating legacy systems — integration WITHOUT APIs is "their secret sauce." No public pricing; inferred ~$3-4K/month/hotel.

- **"Be honest about infrastructure" (Not-yet-available states):** exact framing + the alternative it beat.
  - [verbatim — Claude] "Should the prototype be honest about that (show 'Not yet available' states) or aspirational (show everything as connectable)? I think being honest is stronger — it turns the prototype into a roadmap conversation: 'Here's what we can ship in Q2 with what we have, here's what requires API work.'"
  - Have/Need split (from Terry's discovery): Have = Gmail, Calendar, Salesforce hotel lookup; Need = PMS availability read, Digital Contracts API, Payments API, PMS write.

- **Four-pillar / Wenjun "capabilities determine workflows":**
  - [verbatim — Wenjun, via Claude] "If an agent lacks certain capabilities, it cannot build those workflows."
  - [verbatim — Wenjun, via Claude] "Do not start from what we already have... think completely beyond, even like beyond what this browser is."

- **Pre-built > build-from-scratch for MVP (both-and nuance):**
  - [verbatim — Miguel] "pre built is good. It's good to show like real life examples and everything. and then like we still wanna be able to give SJ an ability to build from scratch, and have that flow be guided as well."

#### Reversals

- **Full chat-IS-builder + dashboard + 5-tab detail view → two-panel (tabs-left / persistent-chat-right / AI-navigates).** Why: "a traditional settings app with a chat bolted onto one of the views."
- **No-tabs pure-two-panel (Claude's first reversal proposal) → keep-tabs-but-AI-drives-them.** Why: Miguel found pure-no-tabs "a little weird"; Lance computer-use gave the better model. [verbatim — Miguel] "Definitely closer to what I'm envisioning but honestly it's a little weird."
- **Keyword-based AI tab auto-navigation → data-change-only, building-mode-only.**
- **Numbered text workflow list + visual diagram → visual diagram only** (redundant).
- **"Multiple workflows as a list, templates pre-load 3-4" → one workflow per agent** (branches = condition nodes; scenarios = capabilities).
- **Editable Overview textarea → AI-generated Overview text** (+ sections always-visible, no collapse).

#### Rejected options

- **Outcome-based pricing** — Jake's Notable scar tissue.
- **A standalone capability "store"** — upsell embedded at moment-of-need instead.
- **Aspirational "show everything as connectable"** — honest "Not yet available" instead.
- **Fully inflexible pre-built agents (Lance-style)** — every property has quirks (Kylie@Ranch Laguna ≠ Danica@Hilton President KC).
- **Fully-flexible-from-scratch as the default** — blank-page problem.
- **Streaming the API response token-by-token** — Generate→Show-Result <6s + animations instead.
- **Collapsible instruction sections** — breaks "see everything at a glance."
- **Custom button-based tabs** — use `CanaryTabs variant="text"`. [verbatim — Miguel] "Are these our tabs?"
- **Opacity-wash lock overlay on locked template cards** — illegible; grayed card + lock badge + Upgrade CTA. [verbatim — Miguel] "might wanna think of a better way to fix this, it's so failing accessibility"

#### Notable verbatim quotes (Miguel's framings/reactions worth preserving raw)

- [verbatim — Miguel] "Look at all the prototypes made by different people, all vibe-coded by their own instances of Claude. Who's to say the origin of the idea is borne from their minds or influenced by you? What do you think?" (central self-criticism — convergence-on-Claude-defaults)
- [verbatim — Claude] "There's a real chance that every prototype in front of you — yours, Terry's, Kevin's, and now what I just built — converges on the same patterns not because they're the RIGHT patterns, but because they're the patterns Claude defaults to. Dashboard with cards. Split panels. Wizard steps. Chat sidebar. Tabs… That's the average of every agent builder that exists."
  - [verbatim — Claude] "every time you ask me to build an agent builder, you're going to get some variation of what already exists. And if Lance is disrupting you, building what already exists isn't going to help."
- [verbatim — Miguel] "I think fundamentally what's been built is kind of right but HOW we present the information is crucial." (the pivot from "rebuild it all" to "reorganize what we have")
- [verbatim — Miguel] "the PRD should be kind of a living document, as well as your memory, but go for it"
- [verbatim — Miguel] "test against yourself, is your thinking right? don't contradict for the sake of it just think it through" (the working pattern — self-critique without sycophantic reversal)
- [verbatim — Miguel] "what is with this big ass gap on the right" (maxWidth-constraint bug)
- [verbatim — Miguel] "Responsiveness is a bit lacking eh… additionally can we add transitions or something? We've got some that we're already using between pages/overlays it's just a little dead right now"
- [verbatim — Miguel] "For Front Desk agent, why is it recommending to set up sales?" (hardcoded suggestion chips not contextual — led to per-template TEMPLATE_CHIP_MAP)

#### Open questions / deferrals raised here

- **Multiple workflows per agent (data model)** — UNRESOLVED at chunk's end (Claude's max-reasoning position is "one workflow for the demo, multi only for genuinely separate triggers later," unratified). The live cliff-hanger of C2.
- **Text-by-default-with-visual-as-toggle vs visual-only** — Claude floated a toggle; Miguel chose visual-only for Workflow; toggle dropped but never explicitly killed.
- **Whether hotel operators trust an interface that HIDES things** — flagged, unresolved.
- **Capabilities tab layout** — repeatedly reported broken; Claude unsure it rendered correctly at chunk's end.
- **PRD created** at `docs/AGENT_BUILDER_PRD.md` (385 lines, via `/prd-revision` though it was a NET-NEW PRD) — 5 open questions inside it + success metrics (SJ approval, <10 min to first agent, <6s latency, 0 crashes). Acceptance = 8 flows.
- **Whether the AI assistant should maintain conversation history for iteration** — a stale-history bug had to be patched via `useAgentStore.getState()`.

#### Coverage note
~90% Agent Builder; single-session, single-day, AB-dominant. Skipped: the `/prd-revision` skill's instruction dump, routine dev-server/sandbox churn, and an AdditionalGuest type-fix (a check-in branch build error). "Wenjin" in transcript = Wenjun. The chunk ENDS mid-debate on multi-workflow (continues in a later chunk).

---

### C3 — 129047c7 — 2026-03-27 → 03-30 — data-model refinement, creation-vs-editing UX, Wenjun agent-vs-workflow debate, HYBRID decision, GT/FF12 epiphany, Sales-agent 6-step flow

#### Net-new decisions & reasoning (not in the digest)

- [my summary] **Channels do NOT overlap with Connections — and triggers/channels form a MATRIX.** Miguel rejected Claude's first framing (channels = a configuration in Connections). Connections = external-data integrations; channels = the medium of detection/response, restrictable per trigger. Produced the trigger×channel matrix and "each trigger IS a workflow."
  - [verbatim — Miguel] "channels is a configuration in connections because connections in my mind are what our product integrates to in order to read information that is external from the canary product."
  - [verbatim — Miguel] "the Trigger is WHAT triggers the agent, e.g. Guest inquires about booking, guest rrequires room service… and the channel is the means of which the agent is detecting and responding to these triggers."

- [my summary] **"Complexity is fine" — explicit anti-stripping directive.** Complexity should only be removed if genuinely *better*. The governing principle behind keeping the full data model.
  - [verbatim — Miguel] "Complexity is fine, the more we can figure out what we try to break, the better. If we're stripping for the sake of complexity instead of simplifying because it's better, then I'd rather keep the complexity. If you can justify the simplification then I'm down for it."

- [my summary] **The AI-companion guided conversation absorbs BOTH wizard and chat (a Clippy/Notion-AI move) — claimed to satisfy Wenjun (structured), Miguel (guided), and non-technical (no jargon) at once.** "The AI companion IS the wizard."
  - [verbatim — Miguel] "I feel like having like an AI companion, similar to how like a Notion AI works or or Clippy back in Microsoft days… that kind of just like hey, this is probably like if you want to build this, I highly recommend using this or… activating this or using these connectors."

- [my summary] **REVERSAL within the chunk: the guided conversation killed "build from scratch," so the escape hatch was restored as a SECOND entry point.** Template grid gets TWO entry points — "Pick a template" (scripted/deterministic) and "Build from scratch" (Claude-API/open-ended) — both converging on the same configured-agent + summary + deploy. Kevin's "world for both" as two entry points into ONE experience, NOT two UIs.
  - [verbatim — Miguel] "building from scratch becomes non-existent now, right? And if someone had a unique use-case, then the templates just won't cut it. I feel like a combination of the setup wizard that you had plus something else would work."

- [my summary] **Outcome-first, not trigger-first: the user expresses what the agent should DO; system infers the trigger.** Claude cited Terry's interviews — sales managers start from the PROBLEM, never "I need an email trigger." First question = "What should this agent do?"
  - [verbatim — Miguel] "Given the customer research, seems like the first thing we're debating is when this agent should be triggered or why this agent should be triggered, correct or wrong?" (Claude: "wrong — or at least not the FIRST thing.")

- [my summary] **Step-scoped conditional logic lives INSIDE a step's card, not between steps (the gambit nested one level deeper).** Claude framed it: "Flow level = linear sequence (the track); Step level = conditional rules for THIS step (the gambits per step)."
  - [verbatim — Miguel] "Maybe within an individual trigger card, that's where the conditional logic lives? So yeah like let's say in step 3, check availability, then it might manifest as: Check Availability - If available, move on… - If no availability, suggest alternatives - If situation is niche, handoff to {{hotel_email}}"

- [my summary] **Creation-flow step ORDER nailed down: Template/Scratch → Channels → Capabilities → Workflow → Connections (review only) → Deploy.** Reasoning per seam: Channels first (most tangible — "our inquiries come through email"); Capabilities before Connections (user cares about products, system infers connections); Workflow after Capabilities (workflow USES the capabilities); Connections LAST as a pre-flight checklist "not a configuration screen."
  - [verbatim — Miguel] "Scratch, template, doesn't matter, what's the next question that gets asked? Channels? Capabilities? Connections?"
  - [verbatim — Miguel] "Connectors or Capabilities?" → "Judging by what you told me, connectors, right?"

- [my summary] **REVERSAL (late, driven by a Wenjun call): Channels gets ABSORBED into Capabilities — 6 steps → 5.** Wenjun: channels come WITH the capability (enable Messages → configure SMS/WhatsApp/OTA inside it; Calls IS voice). Claude flagged the risk: heavier Capabilities step.
  - [verbatim — Wenjun] "No, it's not important. Because it comes with the capability." / "If you can't like the message, that's where you configure the message capability."
  - [verbatim — Wenjun] "in essence, there are only two channels. It's either messages, which encompasses everything from WhatsApp."

- [my summary] **Multiple workflows AND step-scoped conditions — settled as BOTH (Wenjun resolved Miguel's torn question).** Different workflows for genuinely different jobs; within each, conditions that fork outcomes.
  - [verbatim — Miguel] "I'm trying to also understand whether it makes sense to have multiple workflows or one workflow with multiple conditional logic within individual steps… because ultimately it's supposed to lead back to that same track."
  - [verbatim — Wenjun] "It should be both. Because some workflow is about increase, right? Some workflow is about refunds… within the workflow we still need… Different conditions."

- [my summary] **Connectors are NOT purchase-gated; the tier/paywall lives on Capabilities.** "You're not paying for the PMS integration, you're paying for the capability that USES it." Statuses = Connected / Setup Required / Reconnect (expired token) / Not Yet Available.
  - [verbatim — Claude] "I don't think connectors should be purchase-gated. The purchase gate lives on Capabilities (Canary products)… Connections are just plumbing."

- [my summary] **Step 1 of creation = agent IDENTITY/BEHAVIOR (the "job description / employee onboarding" page), explicitly NOT capabilities/workflow/channels.** Contents: editable Name (defaults from template), Description/Role, Tone of Voice, Guardrails (Behavioral Guidelines = positive, Guardrails = negative, Avoided Topics = topic blocking). "all that's built in this particular page would come out as a system prompt on our back end." Gambit rules kept OUT (workflow-scoped, step 4).
  - [verbatim — Miguel] "imagine you've PICKED the template, this card appears… step 1 is only showing what the sales agent is, but what should we be able to configure in this step?"

- [my summary] **Section copy decisions (operator-readable, outcome-framed):** Workflow tab = **"Your agent's playbook"** ("I like 'playbook' because that's how hotel operators think about it"); Capabilities = **"What can your agent do?"**; Connections = **"What does your agent need access to?"**; Channels = **"Where should your agent listen?"**. Miguel rejected Check-in/Checkout/Digital Tips as pre-selected Sales capabilities.
  - [verbatim — Miguel] "Add a spin on it, if we're doing template, we should have like 'we have pre-added some recommended capabilities based on the requirements of this agent' or something more human-readable"

- [my summary] **Miguel took over the UI himself in Figma, demoting Claude to thought-partner** — because he wasn't happy with Claude's UI builds. Three demo flows locked: (1) create from scratch, (2) create from template, (3) view active agent.
  - [verbatim — Miguel] "I havne't been happy with your UI implementation so I figured I'll do it myself, with you as my thought partner evaluating the validity of this design based on all the conversations that we've had… To execute the best possible product."

- [my summary] **"Agent Type" tab renamed → "Agent Profile."** Tier badges DROPPED in favor of "everything looks inclusive except items locked out of the tier." Agent Summary section on overview DROPPED as duplicative with the Agent Profile tab.
  - [verbatim — Miguel] "I think tier badges might not be necessary, it would probably make more sense to have everything look inclusive EXCEPT for the ones locked out by not being in that tier list."

#### Deeper reasoning on already-captured decisions (quotes + rejected sub-options + back-and-forth)

- **Capabilities = Canary products (the sidebar):** Miguel's originating articulation.
  - [verbatim — Miguel] "if you look at the canary sidebar, where all our products are, I would imagine that those are like capabilities that the agent can leverage… the agent uses the messaging product as a capability, if the guest is asking for a contract, then they will use the contract's capability or authorization's… or pull out the upsells capability."

- **Wenjun "chat builds workflows not agents" → hybrid (full depth, the Slack thread reproduced):**
  - [verbatim — Wenjun] "chat is good to build workflows" / "but not agent" / "a blank canvas is very difficult to define a AI agent for everything hotel need the agent to be"
  - [verbatim — Wenjun] "chat is great for engineers, not for our users" → (Miguel: "Can we dig into that a little?") → "its too open ended" / "in fact when you build an agent, it's mostly structured" / "i'd say chat is lazy to adjustfy to launch"
  - [verbatim — Miguel] "Even if we inject a system prompt to structure these chats?" → [verbatim — Wenjun] "but why has to be chat?"
  - [verbatim — Wenjun] "i feel some what strongly that template builder is the right path" / "within that, you can have a chat for something not structured input" / "you know exactly what you are building and how exactly it will behave"
  - [verbatim — Miguel] "so deterministic vs. probablistic?" → [verbatim — Wenjun] "you are building an AI, but doesn't mean has to use AI to be the builder" / "you can describe the workflow to AI to let it build the workflow" / "but not the agent itself"
  - Wenjun's diagnosis of Kevin's confusion: [verbatim — Wenjun] "one thing i think he didn't get is the different between workflow v.s. agent… what i was reacting to was in the show and tell. he said chat can build the agent. what he showed was using chat to build workflow, not agent." (Miguel: "I can change his mind on that.")
  - Kevin's position via Miguel: [verbatim — Miguel] "Kevin doesn't feel strongly and says there can be a world for both, choose which flow you wanna do."

- **The HYBRID decision (full depth):** Miguel did NOT immediately accept — "hybrid or two different flows?" and wavered ("shit I'm not sure… I wanna build all to field test it… from an implementation perspective it seems like it's a pain in the ass"). Claude's closing argument: all flows share the same RESULT (same data model + editing experience), so build the data model + editing first and swap creation flows independently. A THIRD option Claude floated that effectively won later — "Wizard with a chat sidebar."
  - [verbatim — Miguel] "Do we want hybrid or two different flows? Save your context to memory first because it's a great framework"
  - [verbatim — Miguel] "Sure, so we're gonna go for the hybrid approach then?" → [verbatim — Claude] "Yeah — wizard for the agent structure, chat for the workflow building. One flow, not two."

- **Creation vs Editing = "building a house vs living in it":** Miguel sharpened it from "transition" to "it's segmented the complex information." (Later CHALLENGED by Wenjun — see Reversals.)
  - [verbatim — Miguel] "If we're creating things from scratch, the tabs might not exist yet… It's a blank canvas with a guided conversation that then helps build/populate the thing, then the tabs kind of get revealed. Or… maybe the tabs don't get revealed and we just see the summation of things that are built."
  - [verbatim — Miguel] "I think it's a natural transition, it's more like it's segmented the complex information. It really is building vs living in a house."

- **Gran Turismo epiphany (full origin, told twice):**
  - [verbatim — Miguel] "you can be super granular, you can pick your suspension, the yaw of the of the frame, the… downforce… via like the spoiler choices and the diffusers… if you don't [know], there's still… a way to just automate those improvements… choose the correct parts to optimize for this track… because not you can't just like slap on the best parts and expect it to be the same for every track."
  - [verbatim — Miguel] "sales users, their goal is to get bookings, complete sales, get people to give their deposits… How they get to that end goal differs per property, per person, per style… there's probably like a base requirement set of parts that can succeed with this track like 90% of the time… then because every property… has a different focus or nuance… then they should optimized based on that."
  - Re-told to Wenjun: [verbatim — Miguel] "every track requires a different car… you can fine tune things based on your driving preferences… Or you can have the game automate what is best for that track based on the available parts that you have." / "In video games, you don't chat with somebody to help build you the car… You can either build it from scratch yourself if you know what you're doing, or the game can automate it for you, and then you can customize from there." (the anti-chat argument the GT metaphor encodes.)

- **FF12 gambit system (full origin, incl. monetization):**
  - [verbatim — Miguel] "every character is essentially an automated agent. You are providing them a list of capabilities that could be stack ranked based on priority, with a bunch of if and or rule rules that allow the party to be automated… you have your tank, you have your priestess… your high DPS… they all have a… pool of capabilities… optimized for the kind of role that you want them to play."
  - [verbatim — Miguel] "similar to from a business perspective, you have to purchase gambit. You don't get all the gambit out of the box, you have to buy them or earn them in battle in order to add more capabilities."

- **Linear-not-branching workflows (Miguel's origin articulation):**
  - [verbatim — Miguel] "in reality, isn't it… just like one specific workflow, and then you have like a bunch of smaller things that can accommodate outside the line questions and then they release back into the original flow?"
  - [verbatim — Miguel] "multi-branching flows seem to be too complex… that might be over optimizing for a use case that doesn't exist… Our goal is the 90% and not the ten percent." (escape: "it might be better to just direct straight to the property instead of having to try to handle it ourselves.")

- **No step-type matrix for creation (Action/Condition/Delay/Handoff/Notify are invisible internals):** "A sales director doesn't think 'I need an Action node followed by a Condition node.'" Complexity pushed to *editing*; creation stays frictionless. Miguel: "Frictionless sounds good."
  - [verbatim — Miguel] "Do we need to make step matrices, like Action, Condition, Delay, Handoff, Notify? How complex do we need to make this?"

#### Reversals

- **Hybrid wizard (forms) → AI-companion guided conversation (no forms).** Built a 6-step form wizard, user-tested it as a hotel sales director, it failed steps 2–4 ("What's a trigger?" / "I don't know what PMS stands for"). [verbatim — Claude] "By now they've clicked through 4 screens of technical configuration they didn't understand. They're either confused or have already left."
- **Guided conversation (template-only) → conversation WITH a restored "Build from scratch" entry point.**
- **6-step creation flow → 5-step (Channels folded into Capabilities).** Wenjun's live call.
- **Creation = no-tabs/growing-summary, distinct from tabbed editing → CHALLENGED by Wenjun toward "same tab structure for both, step-by-step deferred."** Miguel went *agnostic* ("whether it's step by step or not… I just want a clear delineation of information"), leaving it semi-reversed/open.
  - [verbatim — Wenjun] "Can we do this step by step later? I feel like it's not necessary to actually [have] this flow, just have the tab Test structure?"
  - [verbatim — Wenjun] "in my mind, I struggle to understand why it is different from the agent you already built… you basically have… already hired a person and then you browse through the contractors. And I don't see the need to be different when you're building the tool."
- **Compaction-induced mock-data flip-flop (5-step ↔ 6-step), then full revert.** After auto-compaction, Claude misread an image (the older 6-step version) as an instruction and overwrote the Terry-validated 5-step "Parse & Qualify" mock data; Miguel reacted angrily; Claude reverted.
  - [verbatim — Miguel] "no you idiot go back go back ughhhhh what the fuck I hate that you compacted!!!!!!! Read your memory again, understand EVERYTHING we've been working on, then DON'T. DO. ANYTHING. JUST UNDERSTAND THE SITUATION"
  - [verbatim — Miguel] (the real ask) "what I'm asking from you is to rewrite that 6-step version to match the new mock data you made, because I'm putting the info into Figma" — i.e. update the *doc*, not the *prototype*.
- **"Auto-configure" button → deleted.** Wenjun: templates ARE already configured ("You just buy a car"), so the button is redundant; only from-scratch needs generation. [verbatim — Miguel] "It was just in my head because I remember that's how you do it in video games if you weren't typing."

#### Rejected options

- **Trigger-first creation** — rejected; users think outcome-first (Jennifer Liebsack: "it takes too long to respond," not "I need an email trigger").
- **Manual step-type matrix in creation** — engineer-brained; types are invisible internals.
- **Tier badges on every capability** — "everything looks inclusive except locked items."
- **Connectors purchase-gated** — paywall belongs on Capabilities.
- **Agent Summary section on overview** — duplicative of Agent Profile tab.
- **"Channels" as a standalone step AND an edit tab** — removed after Wenjun call.
- **Building the full trigger×channel matrix for the SJ demo** — deferred (Sales agent = ONE trigger on Email); UI designed to support multiples without showing them.
- **"Answer inbound phone calls" as a Sales responsibility / "Conversational" tone for Sales** — rejected on research grounds (email-triggered; Formal tone for event/corporate/wedding).

#### Notable verbatim quotes (Miguel's framings/metaphors/reactions worth preserving raw)

- [verbatim — Miguel] "shit I'm not sure... I wanna build all to field test it... from an implementation perspective it seems like it's a pain in the ass" (hybrid-vs-two-flows; the build-everything instinct Claude talked him out of)
- [verbatim — Miguel] "Agent in Action piece is important so pin that to memory… I imagine that there'll be two things to show; creating that sales agent, and seeing the sales agent in action? respond to leads etc. In-process leads, etc." (origin of the two-act structure)
- [verbatim — Miguel] "this experience needs to be more guided." (the through-line critique)
- [verbatim — Miguel] "damn, even when saved to memory I need to resend you all the notion links eh? Would it help to save those links to memory the next time you need to remember?"
- [verbatim — Miguel, to Wenjun] "Prototyping this idea or communicating this idea with AI to Claude to build it off for you, it always comes up with the wrong thing. And so I found it quicker to just do Figma. So I sketched it out in Figma first… and then I will retroactively add it into Claude."
- [verbatim — Miguel, to Wenjun] "from a workflow perspective, the workflow should be very straightforward. You just should be able to add conditional logic within specific parts of the step. To fit your particular fork."
- [verbatim — Miguel, to Wenjun] "This is the part that I was worried the most about, honestly." (the multiple-workflows-vs-conditions question — his single biggest design anxiety, resolved by Wenjun's "both")
- [verbatim — Miguel] "This is why we're never going to be replaced… The prototype that Vibor made is using the same brand new component… made its own step-by-step thing that Kevin also made in a separate prototype. So Claude's just making like a default idea… I tried doing it myself… and it built the same thing too." (Claude converging every prompt to the same generic step-by-step pattern)
- [verbatim — Miguel] "Thank you also for your feedback on the agent builder part. I was very scared of showcasing it, and then now I feel a lot better." (emotional state going into the Wenjun review)

Embedded meeting/transcript quotes worth preserving (Agent Vision / Design Jam):
- [verbatim — Wenjun] "Agent Builder is just like a interface that you can… configure your agent, what they can do… What the agent can do should be going beyond the canoe [Canary] product." (capabilities exceed Canary's own products)
- [verbatim — Wenjun] "What he showed is actually workflows. It's not an agent. What an agent here is… has access to all this information. That's the capability that the hotel assigns to this agent… the personality can be completely different."
- [verbatim — Wenjun] "capabilities build workflows, right?" / (Miguel) "it can't do the workflow if it doesn't have that ability… Exactly… capabilities build workflows." (no capability → can't build that workflow → monetization lever)
- [verbatim — Wenjun] "Do not start from what we already have." / "all the products we've used so far is just a tool for the [agent] in the future."
- [verbatim — Wenjun] "One is you charge for usage, the other way is you charge for outcome… their business model is… not charging for the SaaS… What they're charging is… the business outcome… how many the AI actually resolved." ("Pricing is not… your concern" — leadership's, not product's)
- [verbatim — SJ, Agent Vision] "the first two are the only revenue ones… This like gives you more customers… You know how Canary chases [CARR]? Hotel Chase's bookings. Let's build this one [Sales Inquiry]."
- [verbatim — SJ, Agent Vision] "force yourself to use it to build the… first agent… let's see where things break down… Otherwise, we're going to have an intellectual debate about prototypes. You're just going circles." ("Miguel? Yeah… who's working through the designs and iterations? Probably Miguel.")
- [verbatim — Kevin, Show&Tell] "we really do feel that like chat is a pretty good UX for building agents… knowing how to build a tree can be complex." / "historically why workflow automation tools are really difficult is because you have to account for all the edges… that's where LLMs can really… [catch] the edges." (Kevin's chat-positive position — the one Wenjun rebutted)
- [verbatim — Kevin] "We want to lead with use cases and we want to lead with our customers." / "currently pay an $80,000 sales rep to answer those leads… the first hotel to respond ends up winning."
- [verbatim — SJ, TAM] "we used to go after the $20 to $30 billion that hotels spend on software a year. But now… our Total Adjustable Market is the $500 billion to trillion dollars that hospitality spends on labor every year… we 10x, 20x our total addressable market." + heuristic "the more repetitiveness in jobs of a hotel, the more chance an agent can be built to probabilistically solve that job 98 to 99% of the time."
- [verbatim — team, Agent Vision] "let's not get caught up in the name here. Let's just describe the things and then… flush that one all the way through."
- [verbatim — team] "you either run things on a trigger or you run things on a schedule." (e.g. nightly KB cleanup / night audit)
- Lance.live competitive detail (Design Jam): vision-based "computer use agents" (no APIs, screen-recording), desktop app not web, forward-deployed engineers; "$2.2M ARR in six months" vs Canary's 3–4 years; founders ex-Salesforce + Marriott-parent connection; distillation tactic floated — "every time we're going to book something and then use their agent" to reverse-engineer it.

#### Open questions / deferrals raised here

- Step-by-step creation vs tab structure for creation — left **agnostic/open** after Wenjun; Miguel only firm on "a clear delineation of information."
- Order of creation steps — Wenjun raised whether order should be fixed; Miguel: "that's an open question," only sure Agent Profile/identity is a good first step.
- Whether each Capability card needs expandable channel-config — flagged, unresolved.
- Channels granularity — deferred ("keeping it super basic" first pass).
- Activity-feed status differentiation — Miguel wants it but "not entirely sure how."
- Stages 4–6 of the sales cycle (Contract → Payment → Post-signing) — deferred V2; gated on non-existent APIs.
- Deployment friction: Vercel won't deploy from a collaborator's push on Wenjun's repo → if SJ needs live changes during the Thursday demo, Miguel must duplicate the repo and deploy on his own Vercel. (Foreshadows the later private-fork pattern.)
- Two unverifiable conditions in the Sales workflow flagged: the **$50K VIP / CC-GM** threshold and the **spam filter** — team-originated, NOT in Terry's research.

#### Coverage note
~60–65% Agent Builder (live design dialogue + the long pasted Agent-Vision/Design-Jam/Wenjun transcripts). The 03-28 stretch is mostly the Design Jam transcript (Lance deep-dive, capabilities-build-workflows, TAM) — on-topic, mined. Skipped: SF-bus-accident tangent, ChatGPT/Airbase admin chatter, and the END of the final Wenjun transcript which pivots to David's onboarding starter-tickets + the Check-In Step Configurator (another project) — left out per scope except where the step-configurator's "conditional logic within inputs" visibly cross-pollinated Miguel's step-scoped-conditions idea (noted as context, not mined). The compaction summary block was treated as recap, not re-mined, except for the load-bearing user quotes it preserved.

---

### C4 — 129047c7 — 2026-03-31 — Kevin sync (4-step validation, TRIGGERS gap, agents=orchestrators) + full Figma-driven UI rebuild

#### Net-new decisions & reasoning (not in the digest)

- [my summary] **Wizard + edit view both implemented as a right-sliding full-page overlay over the dashboard (not a route change), reusing the check-in/checkout/GJ detail-panel pattern.** Beat: a separate page/route. Why: dashboard stays mounted underneath; "Back" slides it back out. Pattern = `absolute inset-0 z-50` overlay, `shouldRender`+`animateIn` two-state, `translate-x-full`→`translate-x-0`, `transition-transform duration-500 ease-out`, no portal.
  - [verbatim — Claude] "when the user clicks 'Create Agent' from the dashboard or picks a template, the wizard slides in from the right as a full-page overlay (same as clicking a check-in guest). The 'Back' button slides it back out to reveal the dashboard underneath."

- [my summary] **Deploy = no dedicated deploy PAGE; the last wizard step (Connectors) swaps "Next" for "Deploy", opening a confirmation modal with a load-and-deploy animation, then drops into the Overview tab.** Beat: a dedicated pre-commit review/summary page (Miguel judged it too hard to compress for the hotel user).
  - [verbatim — Miguel] "3. This one I'm not sure, it would be difficult to compartmentalize everything into a single page for the hotel user to look over before committing."
  - [verbatim — Miguel] "Modal could work, add a neat little animation to 'load and deploy' the agent."
  - Animation evolved into 3 phases: (1) confirmation modal, (2) deploying — rocket icon wobbles/floats + 2.5s progress bar, no close, (3) deployed — rocket→green checkmark pop-in, "is live!", auto-closes after 1.5s. [verbatim — Miguel] "In that deploy animation modal we don't need the x button anymore haha."

- [my summary] **Create-from-scratch = SAME 4-step flow as template, differing only by empty starting states.** Beat: a distinct from-scratch flow. Why: the only real delta is the Agent Profile. Per-step: Profile blank; Capabilities empty → "Auto-configure" button (GT auto-optimize); Workflows empty → AI generates from description; Connectors same.
  - [verbatim — Miguel] "Let's dig into this a little bit, the biggest delta is the Agent Profile, but everything else seems to be the same, but showing an empty state, no? Capabilities will be a good spot to use an 'auto-configure' button that I think I showed you before."

- [my summary] **The Activity Feed's individual "Active" thread, clicked open, IS the dedicated pipeline / "watching it work" view — not a separate pipeline screen.** Thread detail = header (source/subject/received/status), delivery-tracker-style agent step trace with per-step checks/spinner, conditions-fired trace (trust/transparency), rendered response preview, operator actions (Edit & Resend / Hand off / Mark resolved), right-panel conversation context. Proves SJ's speed claim via timestamp delta ("2.1 minutes").
  - [verbatim — Miguel] "I want this dedicated pipeline, I imagine if we look at the Activity Feed and look at an individual 'Active' thread, we can see it working it live, right?"

- [my summary] **Agent Profile description blurb removed from the Performance/Activity area.** "Performance/Activity is about how the agent is performing, not what it is." Replace with metrics-contextual copy.

- [my summary] **Workflows tab = TWO levels: an overview grid of workflow tiles, then a per-workflow detail (step list + chat).** "Your agent's playbook" intro replaced by an editable workflow-name input. Tile descriptions LLM-generated. "Create new Workflow" dashed card opens detail in blank state with chat as primary builder. Header text: "Edit Workflow" / "Create New Workflow."
  - [verbatim — Miguel] "when we click into a workflow tile, we'll see what we currently see now (that you've built) but instead replacing that Your agent's playbook section with an input for you to name your agent... The description in the tile should be LLM generated based on the flow that was built."

- [my summary] **3 concrete Sales & Events workflows seeded** (replacing single-workflow assumption): Sales Inquiry Response (6 steps, Active), Cold Lead Follow-up (4 steps, Draft), Post-Meeting Contract Prep (3→5 steps, Draft). Two "Draft" to reinforce multiple workflows at different readiness. Map to Terry's growth path (wf1 = V1 stages 1-3, wf2 = follow-up, wf3 = stage 4 Contract).

- [my summary] **Per-workflow contextual chat intros + per-workflow recommended chips.** Beat: a single hardcoded intro reused across all workflows. Three chip tiers built: per-workflow chips, new-workflow chips (suggest workflow *types* per template), fallback template chips. Deferred: per-template pre-built workflows w/ their own intros (too much content; tabled as todo).
  - [verbatim — Miguel] "shouldn't the recommended chips be different depending on the workflow that we're working on? I would imagine that we would have to build custom or different chips per workflow."
  - [verbatim — Miguel] "Moving forward we should probably make appropriate contextual intros whenever we build a new agent from template to have their own workflows etc. But table that as a to do maybe? Because that's a lot"

- [my summary] **The Workflows chat is the live editing interface — natural-language edits must directly mutate the left panel in real time (not regenerate).** Reuse existing `AgentChat` (Approach A) over a lighter inline chat (Approach B). Rule: Claude returns the FULL updated workflow (not a diff) and PRESERVES all existing steps/conditions.
  - [verbatim — Miguel] "the main goal is that whatever we decide to change in the chat or whatever we discussed in the chat should directly edit the content on the left panel. So maybe if someone says, in step one, I'm wanna add a couple of conditions... we should be able to create an understandable or complex enough flow, maybe within the system prompt or whatever, to get this whole aspect of the product to work. Do you understand me?"

- [my summary] **Workflow-change visual feedback = a steady "neon" glow + blue-1 border on the changed step/condition CONTAINER, no scroll, text stays black.** Beat (reversal chain): typing/untyping effect + turning the changed condition TEXT blue + aggressive pulsing/expanding box-shadow. Final: `0 0 12px` 35%-opacity Blue1 steady for 70% of a 3s window then fade + `#2858C4` border.
  - [verbatim — Miguel] "Oh don't turn the text blue, just the condition container its in"
  - [verbatim — Miguel] "I don't like the glow, it's too aggressive... or I guess just not executed it well. Any way to make it something like neon? I think we're using blue 3 we can make it Blue1 or something like that for the border, right?"

- [my summary] **Template-aware AI guidance for new-workflow creation.** System prompt receives `templateName`+`templateRole`; for `isNewWorkflow:true` includes template-specific question lists; told to ask 2-3 focused questions before generating, not dump everything.
  - [verbatim — Miguel] "I wonder if we should make it super guided based on knowing what is the templateized agent that I'm making. So if I am making a sales agent based on the sales template... the questions it should ask me should relate to that template..."

- [my summary] **Save Workflow + LLM-generated description on save** (`max_tokens:100`, ≤25-word one-liner). "Save Workflow" → just "Save."

- [my summary] **Chat replies render formatted text (bold, bullets, numbered lists) via a lightweight line-by-line parser, no markdown library.**

- [my summary] **Bubble color/orientation convention locked: USER = blue (`#EAEEF9`) right; AI/agent = grey (`#F0F0F0`) left.** A *reversal* of the initial mapping. [verbatim — Miguel] "blue is supposed to be our message and grey is supposed to be the AI's message, so swap."

- [my summary] **Composer = simplified messaging-product MessageComposer (auto-resizing textarea + divider + Send), no toolbar/AI toggle.** Iterated repeatedly (rows 2→1→bare input→messaging pattern); Miguel kept rejecting it ("the composer still... sucks. Did you not change it?").

#### Deeper reasoning on already-captured decisions (quotes + rejected sub-options + back-and-forth)

- **TRIGGERS gap (the day's biggest surface):**
  - [verbatim — Kevin] "One thing that I universally see across the agent builders is a trigger. How does this work get started? And I think that's where I'm like, it's not quite standing out to me. How does this agent get triggered and how does it get started?"
  - [verbatim — Kevin] "there's a receive inquiry, but it's very specific to the sales agent, right?"
  - [verbatim — Miguel] "triggers, we can either add that on who your agent is... or it could be slotted on the workflows. It could be agnostic from who your agent is, and then every time you set up a workflow, You say, I want to listen to emails and do this... the first step being the trigger will be when this agent gets triggered."
  - [verbatim — Kevin] "Do we need like a setup stage then? If you're like, okay, like listen to emails... there's some agent builders that are like, oh, okay, you want us to listen to emails. Well, we first have to set that up. And there's this whole like workflow to set you up on email."
  - Miguel's resolution on setup: don't do it in chat — defer to the Connectors step ("setup required"). [verbatim — Miguel] "I wouldn't probably do it in the chat, but I would probably... say, okay, in the connectors in the next step, we will list out the connectors that need set up... This will probably say like, setup required or some shit like that."
  - **FINAL DECISION (post-meeting): triggers live in the WORKFLOW** (the workflow IS the instruction set; an agent with no workflow is an empty shell). Beat: agent-level triggers.
    - [verbatim — Miguel] "in my head, the triggers should be defined in the workflow. because I mean if you provide responsibilities... if you don't give a workflow, there's not really anything that the agent can do, is there?... It's like you're giving the car parts, but you're not driving it, essentially."
    - [verbatim — Claude] "Triggers per workflow is the right call — the workflow IS the instruction set, and the trigger is what kicks it off. Without a workflow, the agent is just a persona with no playbook."

- **Agents = orchestrators (full debate; Miguel first floated narrow agents as a real alternative):**
  - [verbatim — Miguel] "there's this macro thing of like, are agents on a use case level or are agents at an orchestration level?... A messaging agent can book, it can modify, it can answer questions... I think it's at the former where it's at the macro level."
  - Steelman of the narrow version: [verbatim — Miguel] "You could break down your email inbox into like, oh, we actually have 30 email agents. One that's very focused on cancellation... It becomes a very narrow agent."
  - Key insight: data model accommodates BOTH; "dealer's choice." [verbatim — Miguel] "It's dealer's choice, more or less... it's just fundamentally the same as just whether you decide to buy multiple of the same thing or just buy the one thing and use it multiple times right people have a car frame situation or a car for all terrain."
  - [verbatim — Kevin] "if it's helpful, like, yeah, that's sort of how we're building agents right now is that they're orchestrators of multiple tools."
  - [verbatim — Miguel] "I prefer orchestrators of multiple tools as well... they are individual people and individual people have multiple responsibilities." / "they could have very few responsibilities, but it's still more than one... you can't just be like, I have to do this and then if there's something that takes me off track, I become useless."
  - [verbatim — Kevin] "Yeah, it is the right way."

- **Profile flexibility / not all agents have tone (→ adaptive Agent Profile):**
  - [verbatim — Kevin] "not all agents are going to have Cone [tone]? but they might have guidelines. The guidelines might be different from instructions and the prompt... maybe this is just a specific type and maybe we have different agent types... communications agents that are very focused on responding and you need to have tone. And you might have workflow agents that are just focused on accomplishing a task at hand. Maybe that's also a hybrid."

- **"Tools = where the power is" (Kevin, full statement):**
  - [verbatim — Kevin] "I think where you ultimately need a lot of configuration is really within the tools... In the opinionated version, that's where you have the most power. Tools ended up being almost like these could be non-deterministic workflows, but you can also build these tree-based structures that were your tools. Because some tools are just total linear flows... And then agents have access to multiple tools... it's really up to the agent to determine how they work, what tools they access, what tools they call."
  - Implication (kept as todo #17): the Capabilities gear must become *meaningful per-capability config* — "That depth is what separates our builder from a simple checklist."

- **The 5 pressure-test scenarios (Kevin's exact framing):**
  - (1) Backend automation: [verbatim — Kevin] "you receive this email and update this reservation in the PMS? Like how would that live and how would that get set up?"
  - (2) Service ticket: [verbatim — Kevin] "creating a service ticket and going back and forth and asking clarifying questions based on different service ticket types..."
  - (3) Rebuild current chat AI: [verbatim — Kevin] "if we were to rebuild our current chat AI with this agent framework, what would that look like?... respond to surveys, create service tickets, generate upsells, create a booking..."
  - (4) Check-in automation: [verbatim — Kevin] "what is, if I wanted to set up the full end-to-end automation for check-in..."
  - (5) Email cancellation → modification: Miguel generalized it. [verbatim — Miguel] "maybe all in general, it's not just like an email cancellation agent, but just like a reservation modification agent."
  - Kevin's anchoring caution: [verbatim — Kevin] "it's hard for me to wrap my head because it's very tied towards the sales inquiry response..." / [verbatim — Miguel] "I don't want us to funnel too far down a use case."

- **Demo must include PRE-BUILT agents + SJ builds the sales agent himself:**
  - [verbatim — Miguel] "While making this prototype, probably showcase some pre-built agents already. Which messaging voice check-in and then we build the sales on top of that... I want to make sj build the sales agent so like... have the ones from an established product and then because he wants to see how it's built and then how it works."

- **GT metaphor (origin retelling to Kevin — fullest verbatim source):**
  - [verbatim — Miguel] "I kind of had this epiphany while I was on a run on Saturday... I associated basically everything that I learned from video games to Agent Builder because technically the players you control are automated agents."
  - [verbatim — Miguel] "every single flow or task that we want an agent to do is a track... being a receptionist is a track. Following sales leads is a track... You can buy a car and you can buy the best parts for that car. But those best parts might not be optimized for that track."
  - [verbatim — Miguel] "for the very beginner who starts out buying a car and building a car. They might not know what to do. So they can get the baseline settings that the game provides them and then tweak based on their personal driving preferences. But once they get better, they can build a car from the ground up."
  - [verbatim — Miguel] "you're breaking down each of these individual parts as if you're breaking down parts of the car. So the first step, you're picking out the engine. Then you're picking out the wheels... breaking down these steps in the creation of the agent is pretty crucial in keeping things digestible."

- **Why opinionated (brand-new tech, no established mental model):**
  - [verbatim — Miguel] "the whole point was basically to cut out a lot of the noise that came with the agent builder and... we get to be very opinionated for this and we should make We should get people to do our flow because this is brand new tech anyway, and people don't have an idea or a concept of what the established flows are."
  - [verbatim — Miguel] "with what you made and what Wenjin made and with what Terry made — It still might be too complex for generic hotel users. And so instead, why not just guide them through a process that's already pre-configured."

- **Two tracks (templated hotel managers vs Fortune-100 IT build-from-scratch):**
  - [verbatim — Kevin] "for the most part, there is this other side, which is the Fortune 100 companies that have IT teams... I don't think it's actually one or the other. I think we have to think about it for both. But that's like the Hilton... they're just like, I don't want out of the box, I want the tools."
  - [verbatim — Miguel] "those are gonna be two different tracks more or less. You can get the prebuilt ones, Or you can build from scratch, which basically take up the same capabilities as the pre-built ones. You're just building the shit yourself."

- **Capabilities = products, blocked if not purchased (Miguel's retelling):**
  - [verbatim — Miguel] "the capabilities are the abilities that the agent can do that are derived from our product lineup... If you haven't purchased contracts, we'll block out that capability and say you have to purchase contracts first."
  - [verbatim — Miguel] "within each capability, you can configure custom settings... messages, if I click configure... which channels am I making this available to?... the Products are the capabilities and then you have granular functionalities within that."

- **Linear flows + conditions (NOT add-an-action builders):**
  - [verbatim — Miguel] "a lot of the workflows that I've seen from the prototypes is that they're all very like, Add an action, add a thing... those workflow builders that we've seen other people do. I wanted to keep them as simple as possible... the flows are very linear... the conditions are the alternative flavors that help you get from point A to point B."

- **"Workflow builders will need their own agents" (budget flag):**
  - [verbatim — Miguel] "these workflow builders are going to need their own agents which I don't know from a budget standpoint how that's gonna work for us."
  - [verbatim — Kevin] "I don't think it's getting more expensive... I think for us it's just finding out the right paradigm. It can be the underlying backend systems stay the same."

#### Reversals

- **Step-1 "Receive Inquiry" merged into "Parse & Qualify" (5 steps) → reverted to a separate step (6 steps).** Why: Miguel's Figma had 6 steps; Figma is source of truth.
- **Workflow-change feedback: typing/untyping + blue TEXT + pulsing box-shadow → steady neon glow + blue-1 border on container only, text black.**
- **Communication-style `CanarySelect`: shortened labels + helper text → reverted to full descriptive labels.** Root cause was a `CanarySelect` library bug (fixed by the component-library Claude). [verbatim — Miguel] "Was that a problem with the component or your implementation? The problem is still there. You should put the text back."
- **Composer: `CanaryTextArea` (rows 2→1) → bare `<input>` → messaging-product MessageComposer pattern.**
- **AI workflow-edit transport: freeform JSON-in-text → (end of chunk) decision to rebuild on Claude `tool_use`.** Why: persistent parsing failures (conditions dropped, greedy `\{[\s\S]*\}` matcher, lossy context). Miguel: "is a system prompt really a fix for the solution or is it symptomatic of a deeper problem?" → multi-turn-by-design + `tool_use`.

#### Rejected options

- **Reusing the messaging `MessageBubble` component for the agent chat** — too coupled to the messaging `Message` type. (The *composer* was later adopted in simplified form — bubbles no, composer yes.)
- **A dedicated deploy/summary page** — Deploy button + animated modal instead.
- **"Auto-configure" via LLM for from-scratch connections** — Miguel flagged a cheaper alternative: "we could provide guidance to where they can go instead of using an LLM to figure out what connections and capabilities are missing."
- **Forward-deploy-engineer business model (Sierra-style)** — set aside as not scalable (Fortune-500-only). [verbatim — Miguel] "what's the point of building an agent builder when you could probably do a business model like Sierra and just forward deploy people, but the only problem is it's just not scalable." (Sierra's **Ghostwriter** chat flow-builder cited as evidence the market is moving toward accessible tools.)

#### Notable verbatim quotes (Miguel's framings/reactions worth preserving raw)

- [verbatim — Miguel] "Ok! So, with all that being said, this design fulfills everything that's been asked of us for this project?"
- [verbatim — Miguel] "eh just keep going, once I look and test, we can chip away at it."
- [verbatim — Miguel] "Woahhh UI is broken AF, can we revert the UI at least to match what you made before this update?"
- [verbatim — Miguel] "y'all say human a lot, that's kinda weird. Probably refer it to regular terms like staff or something." (ties to his "hotelier readable" preference)
- [verbatim — Miguel] "Siiiick ok I think from a UI perspective it's mostly good enough to cross it off the list. what's next"
- [verbatim — Miguel] "I'm practically building like a fully realized product more or less." / "I want to hand it over to SJ to break. and to make it as well thought through as possible."
- [verbatim — Miguel, re component-library rule] "I noticed you're not using components from our component library. Remember that it is a rule to implement our components where available... Don't make things up unnecessarily." (triggered a full `@canary-ui` audit; built `CanaryChip REMOVABLE` for avoided topics, `CanaryChip SELECTABLE` for quick-reply chips)
- [verbatim — Miguel] "read, understand, question, OODA if you need to, get back to me and let's discuss"
- [verbatim — Miguel, on why Figma over prototyping] "you have one prototype, Terry has one prototype, and Wenjin has one prototype... you guys didn't use a Figma to base it off of... And it spat out a lot of the same UI. So that's what was throwing me off... it was faster to sketch it on Figma than it was to actually go into prototypes. I'm trying to make it as clear as possible so that everybody is aligned." (rationale for Figma-as-source-of-truth, codegen-from-Figma)
- [verbatim — Kevin] "I think we're near the right place." / "Yeah, I feel like more and more folks are starting to get familiar with agent building and flow building... we should try to stay close to the gaming pleasure [gaming metaphor]. It's easy to understand." (Kevin endorses GT framing)

#### Open questions / deferrals raised here

- **Trigger setup stage** — Kevin's "do we need a setup stage?"; Miguel deferred setup UI into Connectors "setup required." (Trigger lives in workflow; setup-flow mechanics still TBD.)
- **Adaptive Agent Profile by agent type** — show different fields / optional / "smart detection"; resolve by building a backend pressure-test agent. (Tasks #13-16.)
- **Capability gear = deep per-capability config** (task #17).
- **Per-template pre-built workflows + contextual intros** — tabled (task #10).
- **Connector sidebar→grid add flow** — rough; deferred for proper add animation (task #9).
- **AI workflow editing reliability** — full `tool_use` rebuild in progress (task #12); **multi-turn one-question-per-turn** creation (task #18).
- **Demo agent polish** — explicitly LAST in priority.
- Block 3 theme = migrate existing AI to agentic architecture; rollout planned **voice → web chat → messaging**. (Foreshadows the May-18 pivot.)

#### Coverage note
~80% Agent Builder. Non-AB: a brief OKR/voice-tone aside (Kevin's custom-tone voice PR; SJ's Block-3 OKR review) + a Terry/Jake P0 alignment mention — skipped. The middle ~60% is dense Figma-pixel-matching/build/debug with most tool payloads elided in source; captured load-bearing *decisions* + Miguel's verbatim reactions rather than per-edit CSS. The Kevin sync (lines 2217-2575) is a full verbatim transcript, mined at maximum depth.

---

### C5 — 129047c7 — 2026-04-01→04-02 — Trigger card, profile restructure, 4 production-derived pressure-test agents, check-in paradigm flip, template lineup cut, capability config modals, header UX reversals, Activity Feed "two tracks"

#### Net-new decisions & reasoning (not in the digest)

- [my summary] **Workflow AI migrated from raw-JSON output to Claude `tool_use` (two tools: `update_workflow` + `respond`).** Beat: a 4-level fallback JSON parser (greedy regex) with "silent failures, conditions dropped, raw JSON in chat." Side effect: it *accidentally* solved the separately-tracked "multi-turn 1-question-per-turn" task — the `respond` tool naturally returns one message and forces Claude to choose between asking vs editing.
  - [verbatim — Miguel] "Kinda seems like you added it already because it's already just asking me one question at a time with sub bullets instead of multiple questions"
  - [verbatim — Miguel] (earlier) "that 2nd one, is a system prompt really a fix for the solution or is it symptomatic of a deeper problem?" (the framing that drove the structural tool_use fix vs prompt-patching)

- [my summary] **Trigger is its own distinct visual card that PRECEDES Step 1 — not Step 1 itself.** Beat: prior model where trigger WAS step 1. Why: a Figma frame showed a separate blue card (`#EAEEF9` bg, `#2858C4` border, lightning-bolt). Data-model split: `AgentWorkflow.trigger` + `AgentWorkflow.triggerDescription`, pulled out of `steps[]` in all 3 Sales workflows. Decided: trigger **emerges from chat** (the AI's first question "what should trigger this?" IS the trigger), NOT a separate form field (rejected as redundant).
  - [verbatim — Miguel] "How do we define the trigger?... it's a single trigger per workflow. We're triggering a workflow... should the trigger creation be part of the workflow process, or do we type in the trigger in the its own input, or do we try to make it contextual and have the chat sort of determine what that trigger is?"
  - [verbatim — Miguel] "Use this design as your new trigger: [Figma 101-14256] which PRECEDES step 1... you may have to modify existing workflows and the process of cerating new workflows to have the trigger be the start, the next step being step 1 then continuing onwards."

- [my summary] **Event-driven vs scheduled/polling trigger distinction surfaced as a known gap, armed with pre-canned counters.** Cold-Lead trigger ("monitor for leads with no response after 48h") is polling/cron while Sales-Inquiry/Contract-Prep are event/webhook. Decision: concept sound for the prototype; trigger card communicates WHAT activates regardless of mechanism.
  - [verbatim — Miguel] "Might wanna list out counteranswers for me if I get asked that, but in any case, let's commit, move forward, what's next"

- [my summary] **Agent Profile split into "Always shown" (Name/Description/Responsibilities/Operating Rules/Guardrails) + a collapsible "Communication Settings" (Communication Style + Avoided Topics).** Beat options A (adaptive hide based on capabilities — rejected: requires capabilities BEFORE profile, reversing step order) and C (leave gaps empty — rejected: Kevin/SJ would notice). Why: backend agents make "Communication Style"/"Avoided Topics" meaningless; "Behavioral Guidelines" label misleadingly implies *communication* behavior → renamed → **"Operating Rules"**. Communication section defaults open for comms templates, closed for backend/scratch.
  - [verbatim — Miguel] "Should we bundle the unscalable fields into a sort of optional section or bucket? Option B but a little clearer."
  - [verbatim — Miguel] (request to self-evaluate honestly) "Evaluate for a second if the Agent Profile entires WORK overall for all of the Pressure Test items, because we may need to rework it. Be opinionated and concede if you cant find a good argument. It'd be good for you to build the agent yourself and see if it can fit in the paradigms we've built."

- [my summary] **Backend agent demonstrated as a DEPLOYED agent on the dashboard, NOT a template.** Reversal of Claude's first attempt (built it as an "Email Reservation Agent" *template*). Why: backend agents are built from scratch by power users; they wouldn't ship as templates.
  - [verbatim — Miguel] "Hmmm, not what I was looking for. I was looking for an agent that's already deployed here: [Image] not a template. Backend agents probably wouldn't have templates to begin with..."
  - [verbatim — Miguel] "Those who do the from scratch flow are like the people I said in my GT analogy, those who know the precise tuning of their cars to get it to drive/race the optimum way they want it."

- [my summary] **Backend deployed agent renamed from persona name "Riley" → functional "Email Reservation Agent".** Beat: persona naming. Why: nobody named it — a made-up persona name has no provenance. Persona names stay for guest-facing agents; backend processors get functional names. (NOTE for dedup: Javis & Ava are still ALIVE in C5 as deployed mock agents — their removal happens later than this chunk.)
  - [verbatim — Miguel] "Eh, I don't know if we wanna give them names because... where would the name come from lol, do we make it up? Probably not. Well... maybe in the From Scratch flow we'll have a name input in Agent profile, no?"

- [my summary] **Human-in-the-loop staff approval = a REGULAR step with branching conditions, NOT a new `approval`/`wait` step type.** Why: the flow is still LINEAR — it pauses but doesn't branch. Service Ticket workflow became 6 steps + trigger with "Staff Review" as step 5.
  - [verbatim — Miguel] "I would say it's a regular step because it's essentially still a straight line eh? Because it will proceed with the flow once the human in the loop is given, kinda like Claude when I have to do approvals for your tasks you're just oging in a straight line eh?"
  - [verbatim — Claude] "Same as how you approve my tool calls — I'm not going down a different path, I'm just waiting for the green light to continue the same line."

- [my summary] **Front Desk Orchestrator rebuilt from one monolithic 6-step workflow → 7 separate capability workflows** (Booking / FAQ&Info / Service Request / Upsell / Checkout / Survey / Escalation). Why: real Chat AI is a LangGraph state machine; one agent routes between per-capability workflows. Added optional `workflows[]` array to the `Agent` type.
  - [verbatim — Miguel] "I think in our conversation it's basically saying our 'Messaging' agent and 'Voice' agent, that are currently inivisible in the UI of our product, and we're just revealing it as a representative agent in the agent builder or something"

- [my summary] **Check-in agent fundamentally reframed: it does NOT automate the guest's check-in form — it's the POST-SUBMISSION processor that automates the hotel STAFF's workflow.** Big reversal: original had "Registration Card"/"Payment Capture" (those are the *guest's* steps). Why: the guest does check-in via a link; the agent acts on the OUTPUT — auto-mark checked-in, process upsells, validate ID, confirm deposit, enroll loyalty. Core pain removed: staff process check-ins on BOTH Canary AND the PMS (double-work). Rebuilt as "Check-in Processing Agent" with 5 workflows. Resolved "does check-in even belong as an agent?" — yes, same paradigm as Email Reservation.
  - [verbatim — Miguel] "I think the check-in agent is not about having the agent do the check-in process in the form for the guest on their behalf. We're sending the guest a link to do the check-in. They do the flow... what the agent can do is not within the check-in flow, but rather what happens when check-in submissions are completed..."
  - [verbatim — Miguel] "We're essentially automating the hotel user's workflow, and the agent will process check-ins on the hotel users behalf, skipping a major fundamental problem right now where the hotel user processes checkins on both Canary AND PMS"

- [my summary] **Agent-specific Overview metrics — each agent shows its own KPIs, not Sales-specific ones.** Added `heroStat` + `cards` to `AgentMetrics`. (Check-in Processing = Submissions Processed / Auto-Verified / PMS Sync Success / Deposit Capture Rate; backend agents drop satisfaction → 0.)

- [my summary] **Template lineup cut from 13 → 8 (5 real + 3 locked premium); 4 cut for redundancy.** Cut: **Guest Messaging** ("it IS the Front Desk agent renamed"), **Reservations** (subset of Front Desk + Email Reservation), **Concierge** ("just a Google Places search inside Chat AI"), **Service Task** (covered by deployed Service Ticket agent). Kept real: Front Desk, Voice AI, Sales & Events, Housekeeping, No-Show Prevention. Validated against production code.
  - [verbatim — Miguel] "figure out which templates are kind of realistic for what a hotel user would wanna build for their workflows, peep what we have in production, then build all these templates with the same depth and rigor that we have for the first batch of templates we made."

- [my summary] **Capability config modals only appear on capabilities with MEANINGFUL agent-level config; no gear on the rest.** Beat: a gear on every capability. Distinction: agent config = "how to USE the product" within this agent, NOT the product's full config (its own admin page). Gear: Messages (channels), Calls (transfer categories + welcome + follow-up SMS), Upsells (offer types + auto-approval threshold), Contracts (template + auto-send vs review), **Authorizations** (form templates — earned a gear after production check revealed V1/V2/Voice-Booking templates). No gear: Check-in, Checkout, KB, Digital Tips, Payment Links.
  - [verbatim — Miguel] "I think people would expect that the full capabilities of the product are available at the agent's mercy, but ultimately, what should be configured for the agent? Messages is easy... but what about the others?"
  - [verbatim — Miguel] "For the ones that don't have config, do we even need toggles? We already have an add/remove funcitonality"

- [my summary] **Messages/Calls/Upsells config use the broadcast-filter chip pattern (`LoyaltyChip`/`ChannelChip`), grouped in ONE bordered container with dividers.** Auth/Contracts use `CanaryCheckbox` (`size="normal"`) NOT switches and NOT plain HTML.
  - [verbatim — Miguel] "For configure messages, canw e look at broadcast filters and use the section + chips functionality there?" / "make it one table"

- [my summary] **Connector "Setup required" → mock 2-phase connecting modal (confirm → animated authenticating → green check, auto-close).** From-scratch connector inference (AI picks connectors from configured capabilities/workflows) explicitly TABLED but saved to deferred-features memory.
  - [verbatim — Miguel] "For the sake of this demo, clicking on it should just trigger a modal similar to the deploy modal to show it 'connecting' or something... For from scratch, we in theory should infer the best connectors for the job but I think that's difficult to hook up for our demo, no?"
  - [verbatim — Miguel] "Ehhh table it but add it to memory in case we ever wanna pick it up."

- [my summary] **Description field hidden in from-scratch flow; auto-generated by LLM at deploy.** Why: for scratch it's an empty textarea = "friction for no clear benefit"; description doesn't feed the system prompt meaningfully — it's dashboard display text.
  - [verbatim — Miguel] "For start from scratch do we need this [description]... does it affect the agent in any way, does it prompt it in any way, should we just create an LLM pass to give the description?"

- [my summary] **"Start from Scratch" became a visible dashed card (first in template grid)** wired to a "scratch template marker." From-scratch = all-blank wizard; AI available only at the workflow level ("A backend automation agent user knows they need PMS and email — they don't need AI to tell them that").

- [my summary] **Rich Activity Timeline / ThreadDetailView built** — chronological cross-product feed (date-separator, agent-activity, guest-activity, guest-message, ai-response, system-event, processing). Two mock scenarios: a 15-event completed check-in journey + a 4-event in-progress sales inquiry with a live "Drafting personalized proposal..." processing card. CTAs ("View Check-in", "View Transcript") demonstrate cross-product reach (visual-only).
  - [verbatim — Miguel] (the load-bearing reframe) "Essentially the fundamental thing that I'm trying to do is that the Activity Feed has two tracks; in progress and complete, the whole point is to demonstrate how the Agent has been used as part of the workflows that it has built within it. The magic moment is to show SJ an in progress activity, watching the agent work and the conversation unfold until completion or something."
  - [verbatim — Miguel] "I just want you to understand where the CTAs hook up so you understand the cross-product avilities"

#### Deeper reasoning on already-captured decisions (quotes + rejected sub-options + back-and-forth)

- **Pressure-test agents built from PRODUCTION CODE, not guesses:** Miguel refused generic placeholder content; Claude explored `~/Documents/Canary/canary/` via sub-agents.
  - [verbatim — Miguel] "for 14, 15, 16, I think it requires knowledge of our actual product and how it works to sort of visualize the functionality needed to get the agent to work properly. Would you agree?"
  - [verbatim — Miguel] "Do yout hink you can determine the functionaltiy by looking at my production code?"
  - Production findings: Service Ticket = **AI recommends, staff approves** (not auto-create), dedup via cosine similarity >0.75, 7 vendor systems (Hotsos/Flexkeeping/HubOS…); Front Desk = LangGraph parallel-node state machine (intent → fan-out → converge → audit → send); Check-in = post-submission PMS sync → room assignment → mobile key → membership enrollment.

- **"Linear model can't represent parallelism" (Front Desk):** conceded limitation; prototype fakes it with a single "execute all matching in parallel" condition. Resolved (#25) via the multi-workflow model (each capability = its own workflow), NOT parallel branches.
  - [verbatim — Miguel] (cross-workflow routing visibility) "are you saying that if an If condition is triggered that leads to another workflow, we have no way of showing it besides just mentioning it in text?" → explored Blue1 bold hyperlink, ultimately NOT built (no workflow currently references another by name). "I mean if we need it add it, if not then it's fine."

- **Config-vs-runtime conditions (#22):** resolved to "just text visibility is fine," then mooted — the check-in rebuild removed all "If step disabled → skip" config-style conditions.
  - [verbatim — Miguel] "#22 I think we can keep it simple for now. So just text visibility can work."

- **Per-workflow contextual chips extended to ALL ~25 workflows + 8 agent types** — driven by demo-defensibility.
  - [verbatim — Miguel] "Yeah do it, better so they don't run into it and tell me OOP YOU MISSED A SPOT"

#### Reversals

- **Trigger-as-Step-1 → Trigger as a distinct card preceding Step 1.**
- **Backend agent as a TEMPLATE → as a DEPLOYED agent on the dashboard.**
- **Persona name "Riley" → functional "Email Reservation Agent."**
- **Check-in agent as the guest form flow → as the post-submission staff processor.** (Biggest paradigm reversal in the chunk.)
- **Front Desk one monolithic 6-step workflow → 7 per-capability workflows.**
- **Header back-button UX — reversed TWICE.** v1: back-arrow navigates steps + separate "Save Draft." v2: back-arrow CLOSES builder w/ unsaved-changes modal, remove Save Draft. v3 (FINAL): left button becomes an **X** (close + warning), right "Save Draft" RENAMED "Back" (navigates to previous step). "Save as draft" made REAL (creates `status:'draft'` agent, gray dot + "Draft" label).
  - [verbatim — Miguel v3] "The back button closes the flow BUT you should replace the icon with an X so it's more distinct. Save Draft button stays, gets renamed to 'Back', and functionally acts as a back button to move back into the flow. Understood?"
- **Capability config checkboxes: switches → CanaryCheckbox → plain HTML → back to CanaryCheckbox (`size="normal"`).** [verbatim — Miguel] "girl wtf use my components why woudl you go for plain html unless explicitly stated otherwise? We have a NORMAL size checkbox from the component library you just defaulted to large for whatever eason"
- **AI response bubble border-radius corrected** (`16px 0 16px 16px`). [verbatim — Miguel] "the bubble is upside down (border radii) I think?"

#### Rejected options

- **Separate trigger input field** — redundant with the chat (single source of truth).
- **New `approval`/`wait` step type** for human-in-the-loop — it's still a linear step.
- **Visual parallel-branch diagram** for Front Desk concurrency — multi-workflow model instead.
- **Cross-workflow hyperlink navigation** — NOT built (zero use cases).
- **Profile option A (adaptive hide)** — forces capabilities-before-profile.
- **Profile option C (leave comms fields empty)** — "Kevin and SJ will notice."
- **A gear/config on every capability** — no-op gear is misleading.
- **From-scratch connector inference** — tabled (hard to demo).
- **From-scratch description textarea** — hide + LLM-generate at deploy.
- **Playwright/e2e testing** — unnecessary for the prototype.

#### Notable verbatim quotes (Miguel's framings/reactions worth preserving raw)

- [verbatim — Miguel] "Demo-ready is irrelevant, I'm striving for as perfect as possible here because in our company, everyone is stringent, sharp, and requires answers for every possibility. Being half-assed or complacent is not an option here. So we're gonna push push push until we get it to a state where I feel is impossible to dispute from our larger team." (the bar is team-proof, not demo-proof)
- [verbatim — Miguel] "do it, then we'll continue, I want more perfection"
- [verbatim — Miguel] "let's break all of these down to individual tasks/requirements and we'll tackle it one by one."
- [verbatim — Miguel] (supply-chain security check, mid-build, before letting Claude read production code) "Before you start, can you run this real quick... grep -r 'plain-crypto-js' package-lock.json... ls /tmp/ld*" (Claude confirmed clean — "Those look like supply chain compromise / malware indicators.")
- [verbatim — Miguel] (delegation/trust pattern) "You tell me lol" / "I should be asking you lol, but I guess it's Check-in"

#### Open questions / deferrals raised here

- **Deferred to memory file:** #10 template-specific intros (later completed), #17 capability gear (completed), #22 config-vs-runtime (mooted), #25 parallel execution (resolved via multi-workflow), + from-scratch connector AI-inference.
- **New tasks (#27–#30):** dashboard polish + click-draft-to-resume editing; locked premium templates (Upsell/Finance/Loyalty) need aspirational preview content; from-scratch end-to-end test; edit-view non-Overview tab polish.
- **Email Reservation** still missing new-reservation/multi-email-type workflows beyond the 3 built.
- **Activity Feed data model** open at chunk end: timeline events need to *reference workflow steps* so the feed visibly proves "build it in the wizard → watch it run." (Chunk ends mid-design.)
- **"ACTIVITY" label naming** unresolved — "I wonder if it's action, activity, or something else?"; landed on a "middle ground" (contextual label + workflow/step as metadata in the expandable detail).

#### Coverage note
~95% Agent Builder — essentially two continuous build days on the worktree. Non-AB negligible (passing refs to the check-in configurator + broadcast-filters as reuse sources; one Playwright tangent). A compaction at ~20:52 on 04-02 — its bullets treated as Claude paraphrase (nothing tagged verbatim-Miguel except quotes sourced from the live turns). Large inline HTML paste-dumps (production messaging feed, rendered activity timeline) skimmed structurally. Chunk ends mid-conversation on the Activity-Feed two-tracks design.

---

### C6 — 129047c7 — 2026-04-03→04-05 — Activity-feed-as-workflow-execution; per-agent timelines; universal status/title derivation; roster consolidation; tab-bar reversal

#### Net-new decisions & reasoning (not in the digest)

- [my summary] **Activity cards ARE capability tool-calls (not arbitrary events).** The precise framing that produced the 3-layer model. Miguel arrived at it by reading the rendered timeline: the cards already said "check-in, payments, calls" which map 1:1 to configured capabilities, so a card = "the agent used this tool, here's what happened, here's where to see it in that product's surface." The CTAs deep-link into **the product surface of that capability**.
  - [verbatim — Miguel] (04-03 00:05) "the activities are basically capabilities or they're linked to capabilities, because as you can see, like the activity shows like check-in, payments, calls, which are linked to our capabilities, which I guess you can classify them as like tool calls that the agent was able to execute on because that was required for their flow."
  - [verbatim — Claude] "The workflow is the brain, the capabilities are the hands, and the conversation is the mouth." (Miguel ratified this hard.)
  - [my summary] Saved to a dedicated memory file `project_activity_feed_architecture.md` at Miguel's explicit instruction.

- [my summary] **Workflow step-tiles become in-line DIVIDERS in the conversation feed (new `workflow-step` event type).** When the flow advances, the "tile" lifts from WorkflowVisualizer into the convo as a full-width divider (analogous to existing date separators). Two new event types: `trigger` (blue lightning card opening the feed) + `workflow-step` (numbered divider). The concrete mechanism behind the "3-layer interleaving."
  - [verbatim — Miguel] (04-03 00:15) "if we move to the next step in the workflow we take the 'tile' from workflow and have that as part of the convo flow, you get what I mean? Kind of like a divider."

- [my summary] **Trigger must be the FIRST event in every timeline — and the trigger is "customer intent," learned from the Voice/Calls product.**
  - [verbatim — Miguel] (04-03 00:22) "remember to start with the trigger! In Voice/Calls product I learned that the action trigger is 'customer intent' so in this case, it's definitely the trigger, no?"

- [my summary] **The triggering email must render BEFORE the trigger card** (causal order: email-arrives → trigger-fires → workflow-starts).
  - [verbatim — Miguel] (04-03 01:05) "For Sarah Chen shouldn't the inquiry email show before the trigger?"

- [my summary] **In-progress timelines must visibly ANIMATE step-by-step on open ("the magic moment") — explicitly to show SJ what "in progress" looks like.** Not grayed-out pending steps (Miguel's first ask, Claude's first build, rejected as insufficient) but events fading in one-by-one as if watching the agent work live. `animated` prop, progressive reveal (~12s), auto-scroll. The `animated` flag in `timeline-data.ts` is the single source of truth.
  - [verbatim — Miguel] (04-03 01:11) "Oh I mean when I actually open Lisa Park, I should actually SEE the events running. like go through the steps. Realistically it doesn't happen instantly in real life but this is to show SJ how an in-progress works"
  - [my summary] Two-beat evolution: first fix (01:07) = grayed pending Steps 4-5 (clock icon, 45% opacity) → THEN escalated to full animation.

- [my summary] **Per-agent activity feeds + 25 unique timelines, grounded in REAL guest entities that exist across products.** For entity-tied capabilities (check-in/checkout/calls) the guest "logically" must exist in the guest list. Mapping: Check-in→Emily Smith, Sales→Sarah Chen/Lisa Park, Voice→calls mock data, Front Desk→messaging conversation list.
  - [verbatim — Miguel] (04-03 01:19) "they're tied to actual entities and guests, so logically think, when the agent is triggered for a guest that has checked in, does their profile exist in the guest list?"
  - [verbatim — Miguel] (04-03 02:51) "feel free to make more guests as necessary. But logic should match"

- [my summary] **Front Desk Agent timeline = the "orchestrator story" rendered: multiple workflows firing within ONE guest conversation** (FAQ → Upsell → Service Request), each switch surfaced by a new trigger card + step dividers. Resolved: each workflow keeps its OWN trigger, so a topic-switch fires a new trigger and the agent re-routes — "the timeline will show that naturally."
  - [verbatim — Miguel] (04-03 01:19) "With the Front Desk Agent with ALL of its workflows, are we able to map out a mock example of a completed or in progress workflow?"

- [my summary] **Universal activity STATUS derived from workflow-execution state, NOT custom-authored per agent — because per-agent vocab is "another orchestration layer."** The key reasoning the digest compresses. Miguel pushed back twice on agent-specific vocab on maintainability/scale grounds, forcing engine-derived statuses (Completed/In Progress/Escalated/Flagged/Failed). Old sales-specific RESPONDED/MEETING-SCHEDULED/FOLLOW-UP-SENT reframed as "flavors of completed" that describe *how* it finished → belong in the description, not the status tag.
  - [verbatim — Miguel] (04-03 15:39) "In real life how do we maintain what those status vocabulary are? It adds another orchestration layer when we create agents, no?"
  - [verbatim — Miguel] (04-03 15:32) "if this table needs to be uniform across all agents regardless of workflow/priority" (the seed question)

- [my summary] **Title/Subtitle ALSO auto-derive from the execution log — "a view of the workflow execution log," not manually authored.** Formula: **Title = `[terminal-step outcome] — [primary entity]`**, **Subtitle = `[workflow name] · [key detail] · [duration]`**, assembled from 5 engine-known facts. Resolved the "confusing table" feedback (subtitle "doing too much" — mixing what/when/how-fast).
  - [verbatim — Miguel] (04-03 15:43) "Statuses are great, now Title Subtitle, how do we orchestrate that?"
  - [verbatim — Miguel] (04-05 17:06) "so that should apply for all, right? Since it's universal and easy to maintain"

- [my summary] **CTA hookups: navigate INTO the real product, don't rebuild it.** "View Check-in" deep-links to Emily's actual check-in detail page (`?guest=guest-emily`); "View Transcript" reuses the calls-dashboard modal. Refinement: open *Emily's* detail specifically, not just the dashboard.
  - [verbatim — Miguel] (04-03 00:49) "it's easier if you just direct to Emily's check-in details page, like leave the product instead of rebuilding it… The calls transcript we're just gonna use the modal that we have in the calls dashboard"
  - [verbatim — Miguel] (04-03 01:00) "you just went to check-in but you wanna go specifically to Emily's Check-in Details. That info is important"

- [my summary] **Contracts/Authorizations activity cards must mirror production config + the connector spec.** Contracts card = template-based, optional staff review, e-signature; Authorizations card = form template (V1/V2), ID-verification, amount-verification. KB queries get an explicit "Searched knowledge base" card.
  - [verbatim — Miguel] (04-03 00:22) "try to ensure the contracts and authorizations are in line with our actual production code and what we spec'd out as a configuration as part of our connectors, so it all makes sense."

- [my summary] **Code organization: extract all timeline mock data into `timeline-data.ts` (1,210 lines); keep `ActivityTimeline.tsx` a pure component (562 lines).** Bulk data delegated to subagents. ThreadDetailView reduced to a lookup by activity-item ID.

- [my summary] **Activity-detail view replaces the TAB BAR with a detail header (back-arrow + title + subtitle) in the SAME container — no double header.** Via `hideHeader` prop on ActivityTimeline + AgentView swapping tab-bar content on `selectedThreadId`.
  - [verbatim — Miguel] (04-05 17:56) "when we go into activity details, we should just replace the tabs with the header details thing… Because it makes sense we're looking at an internal thing. I think your implementation of the tab div is correct, we're just replacing the tabs with the header details below."

#### Deeper reasoning on already-captured decisions (quotes + rejected sub-options + back-and-forth)

- **Drop Javis (Messaging) + Ava (Webchat); add Sales & Events as a *deployed* agent — the live derivation.** Miguel asked open-endedly, pasting the full Kevin transcript as spec. Resolution: Javis/Ava are channel-specific wrappers around what the **Front Desk Agent** (7 workflows) already does, contradicting Kevin's "agents are at a persona level / orchestrators." Alex (Voice) survives as "borderline" because voice is a fundamentally different interaction model. Sales & Events was only a *template* and Kevin wants SJ to both **build it AND see it run**, so it became a 6th deployed agent. Service Ticket kept standalone (Miguel's call).
  - [verbatim — Miguel] (04-03 01:19) "are Alex, Javis and Ava redundant? Would we stand to benefit seeing other actual usable agents instead? Were there any ones that Kevin wanted me to pressure test that we haven't built examples of yet?"
  - [verbatim — Miguel] (04-03 02:51) "We can keep service ticket agent separate."

- **Activity-feed universal status — the maintainability argument that forced it.** The universal question driving the whole feed: **"did the agent handle it, or does a human need to act?"** A sales hand-off and a service-ticket escalation are "the same outcome — agent couldn't finish, human needed"; only the description differs.

- **Title/subtitle formula — invented here, table-by-table, in response to a confusing-table screenshot.** Rejected interim ideas Claude floated (capability icon on left; response-time as its own metric; pulsing dot for processing) set aside for "workflow name + cleaner time separation," which Miguel pushed to full engine-derivation.

- **Gran Turismo / FF12 origin — the full verbatim Kevin↔Miguel meeting transcript (04-03, lines ~537–815) is the primary source for the GT pitch.** Selected load-bearing:
  - [verbatim — Miguel] "every single flow or task that we want an agent to do is a track… being a receptionist is a track. Following sales leads is a track… For every track, you can buy a car and you can buy the best parts for that car. But those best parts might not be optimized for that track."
  - [verbatim — Miguel] "our agents out of the box are regular cars… when we pick a template for an agent… the car that you're buying is already kind of prebuilt and optimized for that particular workflow. You can then… tweak it a little bit based on your driving style."
  - [verbatim — Miguel] "the flows are linear, but then the conditions are the alternative flavors that help you get from point A to point B."
  - [verbatim — Miguel] "I created a very opinionated [agent] builder… because the thing is, with what you made and what Wenjin made and with what Terry made — it still might be too complex for generic hotel users. So instead, why not just guide them through a process that's already pre-configured."
  - [verbatim — Miguel] "this is brand new tech anyway, and people don't have an idea or a concept of what the established flows are."
  - [verbatim — Miguel] "I'm practically building like a fully realized product more or less." / "I want to hand it over to SJ to break."

- **Triggers = biggest gap (Kevin Mar 31), verbatim live:** Kevin raised it; Miguel conceded he hadn't placed it ("that's an open question that I haven't figured out where to slot in yet"). Setup-stage question for connector-gated triggers — Miguel: don't do it in chat, defer to the Connectors step "setup required."
  - [verbatim — Kevin] "One thing that I universally see across the agent builders is a trigger. How does this work get started? … it's not quite standing out to me."

- **Agents = orchestrators (Kevin Mar 31) — verbatim mutual landing.** Miguel's persona analogy: "they are individual people, and individual people have multiple responsibilities… you can't just be like, I have to do this and then if there's something that takes me off track, I become useless." Both agreed the data model accommodates *both* readings ("dealer's choice… buy multiple of the same thing or just buy the one thing and use it multiple times").

- **Tools = where the real config power lives (Kevin) — feeds the later "differentiation under the hood":** [verbatim — Kevin] "where you ultimately need a lot of configuration is really within the tools… In the opinionated version, that's where you have the most power… some tools are just total linear flows."

#### Reversals

- **AgentView header restructure (merge tabs into header container) → reverted to side-by-side.** Miguel asked to "pin tabs to the bottom of the container, remove L/R padding"; Claude *misread* as "merge tab bar into header," breaking layout. Fix: revert structure, adjust ONLY within the existing tab-bar div.
  - [verbatim — Miguel] (04-05 17:54) "Oh god wtf happened it used to be side by side with the Chat with Agent header…. The previous implementation was right I was adjusting the positioning of the tabs WITHIN that div..."
- **In-progress timeline: static grayed-out pending steps → full live animation.**
- **CTA "View Check-in" → `/check-in` dashboard → `/check-in?guest=guest-emily` (Emily's specific detail panel).**

#### Rejected options

- **Rebuilding the check-in detail panel inside Agent Builder** — `CheckInDetailPanel` is a heavyweight slide-over; cheaper/more honest to navigate into the real product.
- **Per-agent custom status vocabulary** — maintenance/scale burden, "another orchestration layer"; engine-derived universal statuses instead.
- **Manually-authored title/subtitle per activity** — "a view of the workflow execution log" instead.
- **Sierra-style forward-deploy-engineers business model** (raised via Val's question) — set aside: not scalable; Sierra's own *Ghostwriter* chat-flow-builder cited as evidence the market moves toward accessible builders. Kevin: forward-deploy "becomes the motion" early but "over time it's going to be pretty expensive."

#### Notable verbatim quotes (Miguel's framings/reactions worth preserving raw)

- [verbatim — Miguel] (04-03 00:08) "You've hit the nail on the head, please commit what you've explained to me to memory because it's the perfect understanding of what I'm trying to do here. I might try to bring it up in conversation." (ratifying brain=workflow / hands=capabilities / mouth=conversation as an SJ talking point)
- [verbatim — Miguel] (04-03 01:14) "commit don't merge! just moving on to the next step" (the no-merge-without-review rule enforced inline)
- [verbatim — Miguel] (04-03 15:32) "Let's evaluate a little, in the activity feed, per agent, what would be the most important thing for a hotel user to see?"
- [verbatim — Miguel] (Kevin meeting) "I don't want us to funnel too far down a use case."
- [verbatim — Miguel] (Kevin meeting) "it was faster to sketch it on Figma than it was to actually go into prototypes. I'm trying to make it as clear as possible so that everybody is aligned… So fingers crossed y'all get it."
- [verbatim — Miguel] (Kevin meeting) "I want to make SJ build the sales agent… have the [other] ones from an established product and then because he wants to see how it's built and then how it works."
- [verbatim — Kevin] (meeting) "SJ's super done with OKRs… voice, we wrapped in like 10 minutes… he more so used it to understand and not really pressure tested anything."
- [verbatim — Kevin] (meeting) "Migrating our existing AI systems to Agentic [architecture] is the big theme… we'll probably start with voice, then do web chat, then do messaging." (the sequencing that later gates Agent Builder rollout)
- [verbatim — Kevin] (meeting, on cost) "I don't think it's getting more expensive… the underlying backend systems stay the same… it's just finding out the right paradigm."

#### Open questions / deferrals raised here
- Where exactly the **trigger** lives (agent vs each workflow) — "open question I haven't figured out where to slot in" (leaning per-workflow; resolved later, unresolved *here*).
- Whether a **connector setup-stage** flow is needed (deferred to Connectors "setup required").
- Whether **workflow builders themselves need their own agents** (budget open question).
- (04-05 18:05, chunk end, interrupted) (a) animate a transition into activity detail? (b) **Edit-agent header should use an X button like Create-agent** — [verbatim — Miguel] "look at the edit agent header vs create agent header, I think we use an X button to exit the agent builder so it should be the same for the edit agent so we don't double the back button" (origin moment of the digest's "Edit header X not back-arrow" decision; unimplemented at the cut).

#### Coverage note
~99% Agent Builder — the entire chunk is on-topic (activity-feed architecture build + a full embedded Kevin↔Miguel strategy meeting, the verbatim PRIMARY SOURCE for the GT pitch, the orchestrator decision, the triggers-gap, and voice→webchat→messaging sequencing). Tool-call bodies were `[tr omitted]`, so exact diffs aren't recoverable; every decision/rationale is captured.

---

### C7 — 129047c7 — 2026-04-06 → 04-07 — dense build: activity feed, roster naming, profile sweep, connector property-level model + `'unassigned'` invention, Statler customization, dashboard hero stats, draft flow, Advanced Builder

#### Net-new decisions & reasoning (not in the digest)

- [my summary] **Timestamps kept on ALL activity-feed events (no blanks), after a 3-way back-and-forth that started as "strip them entirely."** Initial move: remove the 48px timestamp column because "dividers + chronological order tell the story." Miguel told Claude to challenge itself; Claude self-rebutted (completed timelines carry narrative weight — check-in 10AM→9:15PM = "agent managed this guest's journey over 11 hours"; sales "2.1 min" is the hero metric). Proposed keep-on-completed/drop-on-animated; Miguel rejected the split (a blank timestamp "shows timestamps weren't applied to everything"). Final: fill `time` on every event across all 25 timelines.
  - [verbatim — Miguel] "Challenge the idea yourself if you think strongly otherwise"
  - [verbatim — Miguel] "Well if in-progress is just a state before completion, then timestamps matter. But you should show the timestamps instead of just leaving it blank If it's blank it shows that timestamps weren't applied to everything"
  - [verbatim — Claude] "for completed flows, timestamps carry real narrative weight. … Without it, you lose the sense of 'this agent managed this guest's journey over 11 hours.'"

- [my summary] **All 6 in-progress activity timelines extended to run to completion** (previously only Sales did; others "just show the spinner and stop"). "the demo impact is much stronger when you watch the whole thing complete."
  - [verbatim — Miguel] "For some of the in progress one across agents, should we take the flow to completion? I notice some of them stop in the middle"

- [my summary] **Guest-message bubbles get a gray person `GuestAvatar` on the left** mirroring the blue `AgentAvatar` on the right — a reversal of the first fix (pin-flush-left), which Miguel himself caught.
  - [verbatim — Miguel] "Ah wait, I see why you did that... should we revert and just add a 'person' avatar instead so it doesn't look misalgned with the other boxes its in?"

- [my summary] **Agent Profile tab declared cosmetic/display-only for this phase — "just a spot where we fill in info."** Nothing downstream reads from profile fields; workflow conditions and guardrails are self-contained within each workflow object. Despite being non-functional, Miguel chose to fully polish it.
  - [verbatim — Miguel] "So, for now, I don't believe Agent Profile actually affects anything in the deeper steps, right? It's just a spot where we fill in info?"
  - [verbatim — Miguel] "Nah let's polish it! We're real close to getting this being its max polish and demo'd"

- [my summary] **Added `responsibilities`/`behavioralGuidelines`/`avoidedTopics` to the `Agent` type and populated all 6 deployed agents** (previously these lived ONLY in the wizard store, so every deployed agent's profile tab rendered blank — "undermines the 'these are real, working agents' story"). Framed as "wiring existing data into the right fields during hydration. 15 minutes, not a redesign."
  - [verbatim — Miguel] "This kind of seems like a lot larger sweep of changes than I expected. WHy did we miss this before when we built these initially?"
  - [verbatim — Claude] "Because we built bottom-up — workflows first (the exciting part), then capabilities, then connectors. The profile tab was always the 'fill in later' step since the template pre-fills most of it."

- [my summary] **Backend agents (Email Reservation, Check-in Processing) deliberately have EMPTY tone — and that's correct, not a gap** (front-of-house vs back-of-house, applied at the data level). Communication Settings made collapsible so backend agents can hide it; opens-by-default only when the agent has a tone.
  - [verbatim — Claude (audit)] "Email Reservation and Check-in Processing having empty tone is actually correct — they're backend automation agents with no guest-facing conversation"

- [my summary] **Production-realism audit of all 6 agent profiles.** Claude flagged ONE aspirational stretch honestly: Front Desk "Process room bookings" — production chat AI handles booking *inquiries*/sends *links* but "doesn't process bookings directly in PMS. Our prototype is aspirational here … but this is where the product is headed, so it's defensible." Sourcing called out: Sales & Events "directly validated against Terry's research with 6 hotel sales leaders."
  - [verbatim — Miguel] "So, just making sure, it's reflective of actual production/what we expact hotel agents to be/act? Tell me your thoughts"

- [my summary] **Dashboard AgentCard redesigned: hero stat becomes the centerpiece**, replacing truncated recent-activity + a generic "~95 conversations/day · 94% resolved" line. Diagnosis: name+role identical for Voice AI ("wasted line"); recent activity "truncates into unreadable noise"; generic metric "the same formula for all 6 — nothing stands out"; hero stat (the value prop) "hidden one click deep." Done at `/effort max`.
  - [verbatim — Miguel] "the tiles kinda make sense but... do the overviews make sense? Does it actually pull the important info that the hotel user cares about at an initial glance? When we deploy a new agent, what's the thing that it shows?"
  - [verbatim — Claude] "The dashboard is the first screen SJ sees. These cards need to sell the story in 2 seconds flat: 'You have 6 agents running your hotel and they're crushing it.'"
  - Hero-stat table: Voice AI 2.4 min Avg Call (industry 6.8) · Sales 2.1 min Response (industry 4.2 hrs) · Email Reservation <1 min Processing · Service Ticket 18 min Resolution · Front Desk 0.8 sec Response · Check-in 94% Auto-Verify.

- [my summary] **Edit-Workflow header context-aware: "New Workflow"/"Save workflow" for empty-step workflows vs "Edit Workflow"/"Save edits" for workflows with steps** (detection: "if it has no steps, it's new").
  - [verbatim — Miguel] "in a deployed agent it should say new workflow not edit workflow and save workflow instead of edits"

- [my summary] **Workflow edit replaces the tab bar (back arrow + workflow name + Save), same pattern as activity-detail** — not a separate page. "Save edits" shaded blue so it "doesn't clash with the above save button."
  - [verbatim — Miguel] "the edit agent page, for edit workflow it should replace the tabs, similar to activity feed details"
  - [verbatim — Miguel] "maybe make save edits shaded so it doesn't clash with the above save button"

- [my summary] **Fallback workflow chips changed from question-style to action-style** (one-line fix). Bug: from-scratch/custom agents creating a new workflow hit fallback question chips ("Describe the trigger…") which send a question to Claude that only the USER can answer → "It's a loop." Fix: action commands.
  - [verbatim — Miguel] "the chip makes me ask a question and the AI responds that I have to be the one to provide the answer, you see the problem in this, no/"

- [my summary] **`deployAgent`/`saveDraft` bugs fixed: deploy now persists `workflows` (was only `currentWorkflow`), persists profile fields, uses consistent `wizardCommunicationStyle || wizardTone`.**

- [my summary] **Draft click → resume WIZARD (not the deployed detail view), all data pre-filled.** "A draft is an incomplete creation … no metrics, no activity to show. You're picking up where you left off." Two follow-on bugs fixed: (1) draft-from-scratch fell through to the template PICKER (AgentBuilderPage only showed WizardLayout when `wizardTemplate` truthy → also show when `selectedAgentId` exists); (2) `saveDraft` saved `wizardConnections` (old type) but UI reads `wizardConnectors` → fixed both paths.
  - [verbatim — Miguel] "when we save draft it shows the current deployed agent details page even though the deployment isn't complete. What shall we do here?"

- [my summary] **NEW: second "Advanced Builder" creation path alongside "Guided Setup" — a NON-LINEAR from-scratch flow that drops you straight into the tabbed edit view** (no wizard, no Back/Next, no step indicator, no Overview tab). Miguel's insight: linear wizard is right for templates (guided tweaking) but artificial for from-scratch power users — "they kinda already know what they want and each step might not depend on the other." Claude's realization: "we already built the non-linear interface. It's the edit agent view." Both paths kept; maps to Kevin's "IT team" persona.
  - [verbatim — Miguel] "Similar to our analogies when first creating this, what if when people are creating froms cratch they just wanna customize everything from the jump? If that's the case, do we need to put them in a linear flow? They kinda already know what they want and each step might not depend on the other in the 'from scratch' flow."
  - [verbatim — Claude] "The template flow keeps the linear wizard because the guided experience IS the value. The scratch flow skips it because you don't need hand-holding."
  - [verbatim — Miguel] "good, so we're aligned. Great mind reading! Edit agent view WITHOUT the overview, essentially."

#### Deeper reasoning on already-captured decisions (quotes + rejected sub-options + back-and-forth)

- **Functional names not persona names (Alex → "Voice AI Agent") — the rename moment, tied to the Javis/Ava drop.**
  - [verbatim — Miguel] "Should Alex still be named Alex"
  - [verbatim — Claude] "No — it's the odd one out. Every other agent is named by function… and 'Alex' doesn't tell you what it does. We dropped Javis and Ava for the same reason. Should be Voice AI Agent to match the pattern."
  - Note: Javis & Ava persist in `mock-data.ts` as dead code (tone "Natural"/"Casual", empty rules), repeatedly flagged "skip those / dead code / ignore" — they were *commented out of the roster*, never deleted (later removed in C8).

- **Chat sidebar removed from the deployed-agent edit view ("is the test panel the product" thread) — the FULL origin of "why not a test console: the activity feed IS the test demo."** Claude laid out 3 options (kill / Workflows-tab-only / repurpose-as-test-console) then argued the activity feed is *strictly more* than a test console.
  - [verbatim — Miguel] "Ok no, for the big question. The Agent details page. Let's evaluate. I had a chat in there but we haven't been able to hook it up to the functionality of our internal page. What should we do with it, let's evaluate and question the usefulness of this"
  - [verbatim — Claude] "there's a conceptual mismatch. 'Chat with Sales & Events Agent' implies you're testing the agent … But that's not what it does. It's a configuration assistant wearing the agent's name."
  - [verbatim — Claude] "the activity feed already IS the proof the agent works — and it's more compelling than a test console would be. … Templates are pre-optimized — changes are incremental … The activity feed shows MORE than a test console would."
  - **Reversal within the decision:** Miguel chose to *hide* (comment out the import), not delete: "Maybe you should just hide it in case we want to bring it up again." (Later reversed again — chat returns scoped only to the workflow-edit sub-view; see Reversals.)
  - **Layout consequence Miguel specified:** [verbatim — Miguel] "the navigation bar should actually fill the entire width of its container. And then like all of the chats, capabilities, options, connectors options appear in a side panel underneath the Tabbed Header Bar." → the "tab bar full-width + inline sidebars (340px)" decision, captured with its originating instruction.

- **Connector architecture = property-level + 4 hydration entry points + save-filtering — FULL bug-driven evolution (~10 exchanges on 04-07):**
  1. Sidebar empty in edit view → first fix: merge agent's connections with remaining `mockConnectors`, marking ALL remaining `'not-available'`.
  2. Miguel: adding a not-available item wrongly flipped it to "Setup required." Claude: marking everything `'not-available'` was wrong — "some (Stripe, SendGrid, Google Calendar) are actually available, just not assigned to this agent. Only HotSOS is truly not available." → preserve original `mockConnectors` status.
  3. Miguel questioned keeping "Not Available" at all; Claude defended it as a demo-story asset (see Rejected).
  4. Decision to **tailor connectors per agent**: [verbatim — Miguel] "it wouldn't make sense to have a service ticket agent but HotSOS connector is not working, right?"
  5. The **Statler-customization clarification** revealed templates ≈ deployed connectors; verified side-by-side.
  6. Templates back-filled to match deployed (Voice AI missing Twilio, Housekeeping/Service Task missing HotSOS, Sales missing SendGrid).
  7. From-scratch: stop overriding to `'setup-required'` — [verbatim — Miguel] "if the connectors are the same across agents, if they're already set up they don't need to be set up again" → use `mockConnectors` real statuses.
  - The fix narrative: "Property-level status (`mockConnectors`) is the source of truth. Agent-level is just 'am I using this connector or not.'"

#### Reversals

- **Activity-feed timestamps: started removing entirely → reverted to keeping on ALL events.** (Blank timestamps look like a bug; completed timelines need the time-arc.)
- **Guest-bubble alignment: pinned-flush-left → added a GuestAvatar → removed padding again.** Miguel reverted the first approach himself.
- **Chat sidebar in edit view: removed/hidden → brought back, scoped ONLY to the workflow-edit sub-view (400px, `existingAgent`+`sidebar` mode).** Gap analysis: "a small wiring job, not a content gap" (chip maps already covered all 25 workflows/8 agent types).
  - [verbatim — Miguel] "should we add the chat workflow back to the edit agent workflow details? This might take more work because you HAVE to ensure that the chats are hooked up appropriately to every workflow."
  - [verbatim — Miguel] "existing agent has their own workflows so the intros and chips should be workflow specific no?... Doesn't that make the gap bigger?" (challenged Claude's "small gap" claim; Claude re-checked, confirmed per-workflow chips already built)
- **Connector "remove" behavior: set removed → `'not-available'` → invented a new `'unassigned'` status.** (See deep-dive below.)
- **Template-grid card padding saga (multiple reversals):** double padding → negative-margin hack (clipped overflow) → CSS class (didn't match, TW4) → native `padding` prop `padding="small"` (broke height alignment) → Miguel "look holistically" → restore default padding, inner div padding:0, lock-message in-flow, `height:100%` for even grid stretch.
  - [verbatim — Miguel] "The heights are no longer aligned, so much worse than before… The previous iteration was fine. … Look holistically, please"

#### Rejected options

- **Killing "Not Available" connector status — KEPT (a candidate-for-removal that survived).** [verbatim — Claude] "When SJ sees HotSOS grayed out as 'not available,' the story is: 'we know this integration exists, your property doesn't have it, and if you ever add it, it's right here.' That's a stronger demo story than just hiding it." Decision: keep but scope per agent.
- **Conditionally show/hide Communication Settings** — kept collapsible instead (KBSection pattern), open-by-default for tone-having agents.
- **`removedIds` ref to track per-agent connector usage** — caused a TS error; replaced by the `'unassigned'` status. The cleaner "add an `inUse` boolean" was named but declined ("requires a type change") — then they made a type change anyway (`'unassigned'`).
- **A separate "Test your agent" console** — activity feed shows more.
- **Custom workflow chips per template AND per scratch** — only the shared fallback needed fixing.
- **Indicating already-deployed templates in the grid** — Miguel waved it off: "3 doesn't matter don't worry about it."

#### The `'unassigned'` status — full-depth rationale (verification spot-check)

- **Problem statement (verbatim, the trigger):** [verbatim — Miguel] "If I remove connectors from the list of used ones, they shouldn't change to 'Not Available' no? whatever status they had, it should be retained. So if it was Active while in the list, it should still be active outside of the list, I'm just not using it for this agent."
- **The conceptual fix (verbatim):** [verbatim — Claude] "add `'unassigned'` status to connectors. When you remove a connector from the grid, it becomes `'unassigned'` (property has it, agent doesn't use it). The sidebar shows `'unassigned'` + `'not-available'`. And the AgentView hydration merges the remaining property catalog so there's always something to add."
- **Why a new status and not reuse existing:** the old code conflated "removed from this agent" with "genuinely not available at property level" because both lived in `'not-available'` and the grid/sidebar split was *status-based*. `'unassigned'` cleanly separates *agent-assignment* from *property-availability*. The sidebar displays an `'unassigned'` connector with its **property-level** status (so the user knows what they're getting).
- **The follow-on add bug (verbatim):** [verbatim — Miguel] "in edit deployed agent, if a connector is on the right list, and I add it to the left, the setup is required again even though in other places it's already connected. Do a sweep of if man and help me find the edge cases because I can't keep finding small mistakes." → `handleAdd` always set `'setup-required'`; fixed to look up the real property-level status. Claude did a full transition sweep (remove→`unassigned`; add→restore property status; setup-modal→`connected`; not-available→stays + non-clickable).
- **Save-filtering (the last piece):** [verbatim — Miguel] "when I save, the connectors selected/removed are not saved." → save was persisting `'unassigned'`/`'not-available'`; fixed so **only `'connected'` or `'setup-required'`** persist; on reopen, hydration re-merges the remaining catalog as `'unassigned'`.
- **The 4 hydration entry points all converge:** Template (grid = recommended w/ property statuses; sidebar = remaining "Available" + not-available) · From scratch (grid empty; sidebar = full catalog) · Resume draft (grid = saved; sidebar = remaining) · Edit deployed (grid = assigned; sidebar = remaining). Merge logic added in three store/view locations because the "sidebar empty / connectors gone" bug recurred at each entry point. `startFromScratch` now starts everything in the sidebar as `'unassigned'`; `startFromTemplate` puts only `defaultConnections` in the grid, rest `'unassigned'`.
- **Miguel's meta-frustration that drove the rigor:** [verbatim — Miguel] "Do a sweep of if man and help me find the edge cases because I can't keep finding small mistakes." (The connector model's complexity generated a long tail of edge-case bugs — *why* the property-vs-assignment separation had to be made rigorous.)

#### Statler-specific customization of deployed agents (verification spot-check)

- **The clarifying question that forced template-vs-deployed differentiation:** [verbatim — Miguel] "Are you essentially saying that the template agents and the currently deployed agents are exactly the same? I thought that we were kinda trying to make them different… the deployed agents actually reflect our real use case and the template agents are recommendations that might not like be deployed in our production, but are like example… Can you help ratify these thoughts for me?"
- **The crisp distinction (verbatim):** [verbatim — Claude] "**Templates** = Generic starter kits for ANY hotel… **Deployed agents at The Statler** = What THIS hotel actually runs. Connectors `connected` to THEIR systems (Oracle Opera, Twilio, HotSOS). Rules tailored to THEIR policies ('VIP Diamond tier gets priority,' 'CC Theresa Webb on escalations'). Metrics show THEIR performance. Activity feeds show THEIR real guest interactions."
- **"before/after" framing:** [verbatim — Claude] "The template is the 'before,' the deployed agent is the 'after.'" Differentiator chosen = *more conditions + Statler-specific references*, e.g. template "If budget > $50K → use VIP template" vs deployed "If budget > $50K → use VIP template, CC GM Theresa Webb" + "If returning corporate client → reference past booking, apply Statler loyalty rate."
- **Decision: change ONLY deployed agents' workflows, leave templates generic.** [verbatim — Miguel] "yep, full scope check everything and make sure it makes sense." A sub-agent applied it across all 6.
- **The actual Statler-specific data injected (verbatim enumeration):**
  - **Voice AI:** W 54th St parking, The Statler Restaurant (ext. 250), Carnegie Hall/Central Park, department extensions.
  - **Email Reservation:** CTL-XXXXX confirmation format, 48-hour free cancellation, PROMO/ADVANCE non-refundable codes, Diamond/Platinum courtesy cancellation.
  - **Service Ticket:** HotSOS departments (Maintenance ext. 300 / James Rodriguez, Housekeeping ext. 310), SLAs (30 min housekeeping, 1 hr maintenance), pool/gym → Operations not Maintenance.
  - **Front Desk:** room types + Statler rates ($289 Standard King, $349 Deluxe Double, $489 Executive Suite), rate codes (CORP, AAA, GOV), pool 6AM–10PM, checkout 11AM, late checkout $50.
  - **Check-in Processing:** $100/night deposit, Diamond on floor 10+, ADA on 2nd floor, Vostio mobile key, accepted ID types.
  - **Sales & Events:** Grand Ballroom (200 seated/350 cocktail), Breakout A (30 pax)/B (25 pax), catering minimums ($85 plated/$65 buffet), Director of Sales Sarah Kim, Saturday weddings 12+ months out.
  - (Net-new vs digest: staff **James Rodriguez** (Maintenance) and **GM Theresa Webb**, extensions ext.250/300/310, the W-54th-St garage, rate codes CORP/AAA/GOV.)

#### Profile vs Workflow conditions (deeper than digest)

- [verbatim — Miguel] "for Sales & Events, is there any way to differentiate between the if conditions of the workflow vs the guidelines in the profile?"
- [verbatim — Claude] "$50K example actually appears in both but does different things: **Workflow condition:** 'At Draft Response step → use VIP template, CC GM' (how to format THIS response) · **Profile rule:** 'Flag for Director of Sales follow-up' (ensure a human gets involved, period)."
- [verbatim — Claude] "The guardrails currently on the workflow (`workflow.guardrails`) are actually profile-level rules that got put in the wrong place. They should live on the profile." (the data-modeling insight behind the later profile-hydration: guardrails → behavioralGuidelines.)

#### Notable verbatim quotes (Miguel's framings/reactions worth preserving raw)
- [verbatim — Miguel] "let's evaluate and question the usefulness of this" (re the edit-view chat — pressure-testing built features)
- [verbatim — Miguel] "Do an audit, you already did all 6 agents Voice seems to be the only one tghat's sparse. Once you check, come back to me before you build" (consult-before-building, in action)
- [verbatim — Miguel] "Can you help ratify these thoughts for me?" (template-vs-deployed)
- [verbatim — Miguel] "Great mind reading!" (delight when Claude landed on "edit view without overview" for Advanced Builder)
- [verbatim — Miguel] "Add stuff to memory as well, especially WHY we decided to do the things we do" / "save to memory everything that we've done that you haven't added to memory yet" (explicit instruction that the WHY is the thing worth preserving — validates this whole mining exercise)
- [verbatim — Miguel] "I can't keep finding small mistakes" (frustration with the connector edge-case tail)
- [verbatim — Miguel] "Okay, not bothered to check the rest of the moment, so I'm assuming that it is actually working as intended."

#### Open questions / deferrals raised here
- **Deployed-agent Save bug (Task #42):** Editing a deployed agent's tabs + clicking top-level "Save" does NOT persist — "Need to write wizard state back to the agent in the store." (Distinct from the draft/deploy fixes done here.)
- **From-scratch guided flow (#29):** never verified end-to-end.
- **Advanced Builder flow:** just built, untested.
- **Locked premium templates (#28):** Upsell/Finance/Loyalty need lock/aspirational state.
- **Behavioral guidelines read "a bit generic"** — could be sharper; sufficient for demo. Soft deferral.
- **`handleTabSwitch` left dead in AgentView** (minor tech-debt).

#### Coverage note
~95% Agent Builder; no other-project content of substance (one stray `/effort` block). Much of the chunk is small UI-plumbing summarized rather than quote-mined; preserved verbatim every decision/rationale/reversal/rejected-option/framing. The three flagged spot-checks (`'unassigned'`, Statler customization, Javis+Ava/Alex naming) are all present at full depth. Net-new vs digest: timestamp keep/strip reversal, the Advanced Builder non-linear flow (entirely net-new), the dashboard hero-stat redesign, additional Statler staff/extensions/rate-codes, and the full bug-driven evolution chain that produced the connector property-level model.

---

### C8 — 129047c7 — 2026-04-08 → 04-14 → 05-11 → 05-12 → 06-08/09 — editable workflow visualizer plan + build; drag→arrows reversal; sandbox A/B/C; brain-preservation philosophy

#### Net-new decisions & reasoning (not in the digest)

- [my summary] **The editable-visualizer idea originated from a power-user "type it myself" frustration, explicitly NOT a feature request.** The seed of the whole three-mode architecture.
  - [verbatim — Miguel] (04-08T16:21) "Ok, now for one more thing I wanna try... for Advanced Builder, for Workflows, I don't WANT to have a chat building workflow. Just to provide an alternative option, because for advanced buidlers they know what they want so reasonably... they might wanna just type that shit themselves. How would we go about it"

- [my summary] **Option A (visualizer itself becomes editable) beat Option B (read-only viz + form/property-inspector panel).** Claude initially *recommended B* (faster, data binding existed, "it's how most workflow builders work"); Miguel overrode to A on UX grounds and demanded a full design-think before any build.
  - [verbatim — Claude] (recommending B) "My recommendation: **Option B** for now. Fastest path to something functional… We can evolve to Option A later if needed."
  - [verbatim — Miguel] (04-08T16:26) "gotta be A dude, plan, think, question how we want it, how it works in context with this project, how it should work for our users, etc. and once we're confident, THEN we build"
  - Design principle articulated: **"No mode switch, no 'click to edit' — it's always editable. The diagram IS the form."** / "it still looks like a workflow diagram, not a boring form."

- [my summary] **The Advanced Builder persona sharpened: "Enterprise IT teams who already have a spec… They don't want to negotiate with an AI — they want to type exactly what they need and move on."** The "don't want to negotiate with an AI" framing is the load-bearing justification for the no-chat mode.

- [my summary] **Deployed-from-Advanced-Builder agents KEEP editable-viz + NO chat — Miguel corrected an over-reach.** Claude first proposed deployed Advanced agents get editable viz + chat both ("best of both worlds"); Miguel rejected mixing modes.
  - [verbatim — Claude] (the over-reach) "the deployed agent edit view becomes: **editable visualizer on the left + chat sidebar on the right**… Best of both worlds."
  - [verbatim — Miguel] (04-08T16:58) "Hey for Deployed Agents don't we need two separate versions, one for advance build agents and one built off templates/regular scratch, advane build retains the manual entry and no chat sidebar, and the others retain their original same behavior, because it works, no?"
  - Resolved to the canonical **three modes**: (1) Template/Guided-Scratch = read-only viz + chat ("Works, don't touch it"); (2) Advanced Builder draft = editable viz, full width, no chat; (3) Deployed-from-Advanced = same as (2). "because it works, no?" = explicit don't-break-what-works instruction.

- [my summary] **`agent.templateId` chosen as the mode discriminator over a new `buildMode` flag.** Claude first proposed `buildMode`; then rejected the arbitrary flag for persisting the already-existing template ID ("a natural relationship that already exists in the wizard state but wasn't being persisted" + reusable "you can see which template any agent came from"). Mapping: template → `'tpl-sales-events'`; guided scratch → `'tpl-scratch'`; Advanced → `undefined`.
  - [verbatim — Miguel] (04-08T17:07) "As for the question, I'm not an eng so I have no idea. Look holistically and figure out the best implement" (recurrent: Miguel defers implementation, owns UX/product).

- [my summary] **Trigger card is an immutable "first step."**
  - [verbatim — Miguel] (04-08T16:58) "Trigger is never deletable, it's an immutable 'first step'" / "so in a fresh workflow, there's a Trigger and Step 1, THEN we can add more below" → fresh skeleton = Trigger (blank) + Step 1 (blank) + "Add Step".

- [my summary] **Step-type selector (action/response/handoff dropdown) was in the plan, then KILLED.** Claude's verdict: type changes no behavior, "The description IS the specification," adding it is "cognitive overhead without functional payoff."
  - [verbatim — Miguel] (04-08T16:49) "4. So question, does this matter? Just curious as to whether free flow text or determining the steptype through a selector is important. Think through this"
  - [verbatim — Claude] "A power user writing 'Send cancellation confirmation email to guest' doesn't need to also categorize it as 'response'… **Skip it.**"

- [my summary] **Conditions = single TextArea per step (one per line), beat structured inline IF/THEN-input rows.**
  - [verbatim — Miguel] (04-08T16:49) "3. This one I'm not sure, if it acts like a system prompt wouldn't a TextArea be sufficient and they'll write the prompt for it to build the conditions? What's the risk of this?"
  - [verbatim — Claude] "conditions don't execute — they're specification text… **TextArea per step, labeled 'Conditions (optional)'**. Simpler to build, matches how power users think, and we can split on newlines for display."

- [my summary] **Delete-step confirmation split by agent state:** deployed agents get a modal warning ("This change affects the live workflow"); drafts/advanced delete silently. Step renumbering automatic from array index.
  - [verbatim — Miguel] (04-08T16:49) "When deleting a step in the workflow in a deployed agent, we should get confirmation flow. Also the steps adjust, so in a 6 step flow, if I delete step 3, step 4 becomes step 3, etc."

- [my summary] **The "NOT building" list enumerated twice and accepted clean:** drag-and-drop reordering · AI assistance *in the editor* · parallel step support · visual condition branching. Guardrails excluded from the visualizer — "They're agent-level, handled in the Profile tab under 'Operating Rules.'" Miguel: "8. yep."

- [my summary] **Trigger configuration realistic-dependency map — built deliberately as SJ counter-argument ammunition** ("realistic dependencies so I can counterargue when demoing"). Email→SendGrid, Voice→Twilio, Check-in→PMS webhook, Timer→agent running, Message→channel config in Capabilities. "be honest about infrastructure" applied to triggers.

- [my summary] **Vercel deploy is branch-preview only, never main — double-checked twice.**
  - [verbatim — Miguel] (04-08T03:19) "So we're not merging… it's mainly just to demo so... let's make a URL on vercel?" / (03:22) "Just from the branch and not in Main, right?"

- [my summary] **Vercel API key = env-var `NEXT_PUBLIC_ANTHROPIC_API_KEY` scoped to `preview`** (chat broke on the live preview because the key was only in local `.env.local`). The `NEXT_PUBLIC_` prefix is load-bearing — the key is exposed client-side in this prototype.

- [my summary] **Self-QA philosophy: Miguel demands wholesale audits against original concepts; chose NOT to fix a low-risk item to avoid breakage.**
  - [verbatim — Miguel] (04-08T01:42) "can you do a wholesale evaluation of absolutely everything we've built on this branch... No bugs, no nothing, clean code, everything?... based ont he concepts that I put forth when starting this project"
  - [verbatim — Miguel] (04-08T03:04, on a tautology fix) "4.maybe don't touch so we don't risk breaking things?" (risk-averse-on-working-code, same as "because it works, no?")

- [my summary] **~250 lines of dead Javis/Ava code removed from `mock-data.ts`** (only the array entries had been removed earlier; the definitions lingered). A botched `sed` deleted `alex` too and had to be `git checkout`-reverted, then done via subagent.

#### Deeper reasoning on already-captured decisions (quotes + rejected sub-options + back-and-forth)

- **Drag-and-drop → up/down arrows reversal (the spot-check) — full primary-source moment.** Drag-and-drop was BUILT FIRST (HTML5 native drag API, no library: `draggable` + `onDragStart/onDragOver/onDrop`, 50% opacity + dashed blue border on drag, blue drop-indicator, auto-renumber, editable-mode-only) — committed via `--amend`. Then Miguel raised the vertical-space problem and Claude reversed it the same session.
  - [verbatim — Miguel] (05-11T21:12, the trigger) "ehh I wonder, does it need a drag or would it benefit from an up or down button instead beside the trash button? Reason being is because each step takes up so much vertical space that we can't move it reasonably long distances if we have like, 5 steps for example"
  - [verbatim — Claude] (the ~200px reasoning) "Good point — dragging a card that's 200px tall across 5 steps means scrolling while dragging, which is terrible UX. Up/down arrows are more practical and precise."
  - Result: **↑ ↓** arrows beside a red trash icon; first step hides up-arrow, last hides down-arrow. The drag commit was `--amend`-replaced (git history shows arrows, not the drag detour).

- **Profile slim-down (Kevin's ask) — the exact concatenation logic.** Two textareas merged into one "Rules, guidelines, and guardrails" under "Operating Rules." Migration the digest compressed: **on first load, if an agent had content in BOTH `behavioralGuidelines` AND `guardrailsText`, concatenate with `\n\n`; after the first edit everything flows into `behavioralGuidelines` and `guardrailsText` is cleared** — single source of truth going forward. Built as task #1, committed before drag-and-drop.

- **Sandbox = "Phase A" (simulated) — the A/B/C framing primary source (05-12).** The SDR ask was *only* the vague line, so Claude invented the option space.
  - [verbatim — SDR, relayed] "Is there a way to test this? Like a virtual machine sort of thing?" — "pretty vague."
  - **Option A "Test Run" button** — pick a pre-built scenario, hit Test, watch the animated timeline. "Basically our existing animated in-progress timelines, but triggered on demand… Fastest to build since we already have the animation engine."
  - **Option B "Simulate" chat** — type a sample guest message, agent shows which step/conditions hit. "needs Claude API calls to evaluate."
  - **Option C Full sandbox** — clone into a test env, real messages, no PMS writes. "a production feature, not a prototype."
  - [verbatim — Claude] recommendation "For the demo, I'd lean toward **A** — visual wow moment with minimal build… answers 'does my workflow work?' without building a real execution engine." (NOTE: in this chunk Miguel never explicitly answered — the dev server crashed and the thread parked. The "A wins / B+C deferred" resolution lands in S2.)

- **Three workflow editor modes by `templateId` — decided here (05-11), not just executed.** Problem statement: "the ONLY way to build/edit workflows was through the AI chat sidebar… That works great for guided users, but enterprise IT teams just want to type their steps directly."

- **Capabilities/Connectors "merge" status (05-11):** the two tabs already render their **sidebars inline (340px)** — done in the earlier polish pass. The *deeper* Kevin-asked merge (connectors-as-parents / capabilities-as-sub-items, one tab) was still NOT done as of 05-11 — the open item.

#### Reversals

- **Drag-and-drop step reordering → up/down arrows.** (~200px-tall cards make dragging a scroll-while-drag nightmare.) Quotes above.
- **"Deployed-from-Advanced gets editable viz + chat (best of both worlds)" → "no chat, retains as-built mode."** ("because it works.")
- **Step-type selector (planned) → removed.** (Description IS the spec.)
- **Plan v1 "consolidate 17 files into ONE doc" → "preserve all verbatim + mine transcripts + thin navigator" (the June brain-plan reversal).** See meta section.

#### Rejected options

- **Option B form/property-inspector panel** — rejected for Option A despite being faster; "boring form" vs "the diagram IS the form."
- **`buildMode: 'advanced' | 'guided'` flag** — rejected for persisting `templateId`.
- **Structured inline IF/THEN condition rows** — rejected for a single per-step textarea.
- **Sandbox Option B (Simulate chat) + Option C (full clone)** — not chosen for the demo (B needs live Claude; C is "a production feature").
- **Tautology/unused-var fix in ActivityTimeline** — deliberately not fixed ("don't touch so we don't risk breaking things").
- **Dedicated trigger-configuration UI** — the "only soft gap" vs Kevin's "setup flows"; not built; demo-answered via connectors.

#### Notable verbatim quotes (Miguel's framings/reactions worth preserving raw)

- [verbatim — Miguel] "gotta be A dude, plan, think, question how we want it… and once we're confident, THEN we build" (his consult-before-building cadence, explicit)
- [verbatim — Miguel] "they might wanna just type that shit themselves" (the Advanced-Builder power-user thesis, raw)
- [verbatim — Miguel] "Trigger is never deletable, it's an immutable 'first step'"
- [verbatim — Miguel] "because it works, no?" (don't-break-working-code instinct)
- [verbatim — Miguel] "I'm not an eng so I have no idea. Look holistically and figure out the best implement"
- [verbatim — Miguel] (04-08T17:16, memory-handoff anxiety) "is the memory incredibly extensive? I'd like ot to be super fucking clear because i'm always apprehensive to start the new sesh." (the cross-session-context anxiety that ultimately motivates the whole brain-preservation effort)
- [verbatim — Miguel] (05-11T20:47, duplicate-work scare) "Oh wasn't the advanced builder already built? I feel like we had this already built. what did the previous context/conversations say?... did we jsut do repeat work?" (memory-staleness: the editable viz was built by a *parallel* session and the memory file still said "PLANNED — NOT YET BUILT" while the INDEX said "Shipped Apr 14")
- [verbatim — Miguel] (06-09T00:35, brain-consolidation mandate) "yeah put any agent-builder brain stuff into the appropriate space, wanna make sure it's parked and done so that if I wanna continue on this project it'll be straightforward. I feel like there's so muhc context floating around I wanna ensure that the brain has everything it needs when I pick it up again"

#### Deeper reasoning — the brain-preservation / anti-abridging philosophy (June 9, the meta layer framing THIS mining job)

- **Claude self-caught the lossy-summarization flaw and reversed its own plan.** Plan v1 said "consolidate the 17 files into ONE doc."
  - [verbatim — Claude] "no, the plan as written does NOT stand the test of time… **The fatal flaw:** my plan said 'consolidate the 17 files into ONE doc.' That's *summarization*, which is precisely the lossy-compression failure mode the brain convention exists to prevent… That's the abridging tendency you don't trust — and you're right not to."
  - [verbatim — Claude] "**The deeper miss:** the 17 memory files may *themselves* already be abridged. The richest source of reasoning is the **raw session transcripts**… A lot of that granularity likely never made it into a file. My plan never touched the transcripts — so it would bake in whatever was already lost."
  - [verbatim — Claude] the corrected doctrine: "**consolidation ≠ compression. Preserve + mine + navigate — never synthesize-down.**"
- **The 5-step corrected method** (the blueprint that produced THIS task): (1) preserve all files verbatim into `docs/agent-builder-brain/`; (2) **mine the transcripts via parallel subagents, extracting every reasoned decision + rejected path not already in a file, appended verbatim to CAPTURE.md** — "the anti-abridging step my first plan completely lacked"; (3) thin navigator front-door that routes, not a synthesis; (4) fill net-new gaps (Venli/Sana, Agent Knowledge def, chat-first confidence debate, SDR ranking); (5) push to GitHub.
- **The structural durability gap, named:** code projects push *code* to GitHub but the *thinking* sits local-only in `~/.claude/` unless the project keeps its decision log in the repo (Team Chat's `TEAM_CHAT_DECISIONS.md`, Unified Inbox's `UNIFIED_INBOX_DECISIONS.md` cited as doing it right). Fix: copy the brain into `docs/agent-builder-brain/` on `demo/agent-builder`.
- **Verification bar set for the mining (the standard THIS output is judged against):** "a reader opening `README.md` cold can reach any topic, and a spot-check confirms specific reasoning (drag→arrows reversal, sandbox A/B/C, connector 'unassigned' rationale, Statler-customization, template 'Indian wedding too niche' genericization, hierarchy-as-role-tagging-not-DAG) is present at full reasoning depth — not bullet-summary."
- Process note: a mid-session OS permission lock on the worktree (`cd` → "Operation not permitted") blocked the commit/push for a session; the copy sat local-only until 06-09T02:20 committed + pushed it.

#### Open questions / deferrals raised here

- **Sandbox A/B/C unresolved in this chunk** (Claude recommended A; Miguel never answered — dev server crashed). Resolution lands in S2.
- **Connectors+Capabilities parent/child merge (Kevin's real ask)** — still NOT done as of 05-11.
- **Workflow-level template store (SDR #1)** — task #3, handed to a fresh session.
- **Trigger configuration UI** — acknowledged "soft gap"; demo-answered via connectors.
- **Two remaining brain tasks at session end:** mine transcripts → CAPTURE (THIS job), + write 4 gap sections + navigator README + re-point INDEX + ARCHIVED headers on 3 superseded files.

#### Coverage note
~95% Agent Builder; only non-AB = two passing mentions (the `feature/checkin-flow-config` session referenced to avoid worktree cross-wiring; a Tailwind-4 search-icon bug in the *messaging* page's `CanaryInputSearch`). Richest net-new: the April-8 editable-visualizer Q&A (full design-think behind the three modes, every rejected sub-option with Miguel's exact prompts) + the June anti-abridging philosophy (which defines the mining standard itself). Drag→arrows + sandbox A/B/C captured at full primary-source depth. Flag for orchestrator: the sandbox "B/C-deferred / A-shipped-as-Phase-A" conclusion is in S2, not here.

---

### S1 — 8f91d479 — 2026-05-11 → 05-12 — Workflow template library (#3) + hierarchy viz (#5) + team templates (#4) build

#### Net-new decisions & reasoning (not in the digest)

- [my summary] **"Indian wedding" was the SDR's literal example, not Miguel's — and Claude itself flagged it as too niche BEFORE Miguel did.** Two independent triggers for the genericization (Claude's instinct + Miguel's instruction).
  - [verbatim — Miguel] (05-11T21:58) "Indian wedding might be too niche so think through a little bit what would be a good template forhotel user but yeah give it a crack"
  - [verbatim — Claude] "Good call — 'Indian wedding' was the SDR's example but it's way too niche for a template library. I'll think through what's universally useful across hotel types: event inquiry (generic), lead follow-up, booking requests, pre-arrival outreach, upsells, service requests, checkout, escalation — workflows any property would need."

- [my summary] **No preview MODAL — clicking the card expands an INLINE preview.** Beat: a popup/modal. Why: keeps browsing fast (no context switch).
  - [verbatim — Claude] "**No preview modal** — clicking the card itself should show a quick inline preview (expand to see steps), with 'Use Template' as the CTA. Keeps it fast."

- [my summary] **Category TABS, not a sidebar, for filtering.** Beat: a left filter sidebar. Why: matches existing CanaryTabs patterns.
  - [verbatim — Claude] "**Category tabs, not sidebar** — matches the existing tab patterns in the product (CanaryTabs)"

- [my summary] **Template content adapted from the existing ~20 mock workflows, genericized — deliberately NOT lorem ipsum.** Real-sounding content sells the demo.
  - [verbatim — Claude] "**Template source** — adapted from the existing ~20 mock workflows but genericized. This means real-sounding content, not lorem ipsum."

- [my summary] **"Start from Scratch" lives INSIDE the library as the top card, not as the default creation path.** The library is the *first thing* shown on creating a workflow; scratch is demoted to an option within it.
  - [verbatim — Claude] "the template library is the *first thing* shown when creating a new workflow (replacing the current 'create blank' behavior), with 'Start from Scratch' as an option within the library, not the default path."

- [my summary] **"Create new Workflow" card RENAMED to "Add Workflow"** — load-bearing for the new mental model (you're *adding from a catalog*, not *creating from nothing*).

- [my summary] **The 5 categories + exact 15-template taxonomy locked here** (digest lists categories, not per-template): Sales & Events (3): Event Inquiry Response, Lead Follow-up Sequence, Post-Meeting Contract Prep · Guest Engagement (3): Pre-Arrival Welcome, Upsell & Upgrade Offers, Guest Satisfaction Survey · Front Desk (4): Booking Request Handler, FAQ & Information, Service Request Routing, Staff Escalation · Check-in & Checkout (3): Digital Check-in Processing, Express Checkout & Folio, No-Show Prevention Outreach · Operations (2): Reservation Change Handler, Lost & Found Inquiry. Tabs show live counts; cards sort by `popularity`, show category badge + step/guardrail counts.

- [my summary] **`WorkflowTemplate` type EXTENDS `AgentWorkflow`** (adds `category`, `tags`, `popularity`) — a superset, so cloning into an agent is a clean structural fit (drop the extra metadata). Reinforces the Rattle "fresh-IDs clone" model mechanically.

- [my summary] **Library visibility is transient state reset on navigation.** `showWorkflowTemplateLibrary` placed OUTSIDE `initialWizardState`, so its reset had to be hand-wired into `goBack` AND `resetBuilder` (else the library "persists unexpectedly").

- [my summary] **Hierarchy was CONCEPTUAL-ONLY before this build — zero data-model support.** Main-vs-sub was implied by naming/positioning but nothing in types/data encoded it (the "before" the `role`/`parentWorkflowId` decision replaced).
  - [verbatim — Claude] "The hierarchy is conceptual today — no data model support."

- [my summary] **Cross-workflow link chips render in READ-ONLY visualizer mode only — NOT editable mode.** In editable mode you see the raw condition text ("If ID verification required → Run ID Verification Review workflow") but not the styled `mdiOpenInNew` chip. Accepted as fine (still legible as text).

- [my summary] **Icon for cross-workflow links: `mdiOpenInNew`** (considered `mdiArrowRightBold`/"a link icon" first).

- [my summary] **Front Desk's intro copy is hierarchy-aware** — flat agents read "Each workflow handles a specific guest intent" instead of "Calls N sub-workflows."

- [my summary] **3-dot menu implemented as a state-based popover, "for prototype simplicity"** (beat a real dropdown-menu/portal). Same `WorkflowMenu` reused across ungrouped + primary/sub tiles.
  - [verbatim — Claude] "For prototype simplicity, I'll use a state-based popover."

- [my summary] **Team-template attribution stamps the current logged-in user (Theresa Webb) as author** (the just-saved "Booking Request" surfaced "Shared by Theresa Webb").

- [my summary] **Team templates interleave with built-in in the "All" view, plus a dedicated filtered "Team" tab.** "All Templates 19" = 15 built-in + 3 pre-seeded + 1 saved; "Team 4" filters to user-generated. Purple "Shared by" badge replaces the category badge for team entries.

#### Deeper reasoning on already-captured decisions (quotes + rejected sub-options + back-and-forth)

- **Workflow template library (#3) — the Rattle "never-mutate, always-fresh-IDs" model, stated upfront:**
  - [verbatim — Claude] "**Rattle-style distinction preserved:** the original template is never mutated. Every 'Use Template' creates a fresh copy."
  - [verbatim — Claude] "`addWorkflowFromTemplate(template)` action — clones with unique IDs on workflow and all steps/conditions" (fresh-ID scope = all three tiers).
  - [my summary] Verified end-to-end: "Use" → new unique ID → opens in editor with name pre-filled, "all steps, conditions, and trigger data carried over cleanly," chat sidebar loads contextual intro + action chips.

- **#3 maps 1:1 to the three SDR personas, restated as design rationale:** Basic = pick + deploy as-is; Intermediate = pick + tweak; Advanced = "Start from Scratch" (worked pre-build). The library unlocks Basic/Intermediate.
  - [verbatim — Claude] "1. **Basic** — picks a template, deploys it as-is / 2. **Intermediate** — picks a template, tweaks conditions and steps / 3. **Advanced** — uses 'Start from Scratch' (already works today)"

- **Workflow-level vs agent-level templates — drawn sharply against the existing `AgentTemplateGrid`:**
  - [verbatim — Claude] "This is fundamentally different from the existing agent-level templates… This is a library of **individual workflow templates** that live inside an agent — pre-built playbooks like 'Indian wedding inquiry response' or 'Cold lead follow-up' that someone can browse, clone into their agent, and customize."

- **Team templates (#4) — the role-hierarchy USE CASE (director→manager→associate cascade) + the Rattle/Salesforce admin lineage:**
  - [verbatim — Claude] "Critical for role hierarchy — a director builds a workflow, a sales manager clones and tweaks it for their role, a sales associate clones a simpler version."
  - [verbatim — Claude] "The SDR reference was Rattle (Salesforce tool) — admin creates templates for everyone, individuals duplicate + modify."

- **Team templates (#4) — pre-seed-to-avoid-empty-state, an explicit demo-safety move:**
  - [verbatim — Claude] "I'll pre-seed a few realistic team templates so the tab isn't empty on first load."
  - [my summary] 3 pre-seeded: VIP Arrival Protocol (Sarah Kim), Loyalty Recovery Outreach (Theresa Webb), Group Billing Reconciliation (Michael Torres).

- **Hierarchy = role-tagging NOT a DAG (#5) — connector-line rejection, from the planning ExitPlanMode:**
  - [verbatim — Claude/plan] "Kevin (Apr 14 sync): 'Workflows need clearer main-vs-sub hierarchy. Main orchestrator workflows sho…'" (plan opens by quoting Kevin's request as the driver).
  - [my summary] Chosen encoding: `role`/`parentWorkflowId` on workflows + `invokesWorkflowId` on conditions; rendered via *layout + labels + text references* (full-width blue-accent primary "Calls N sub-workflows" + indented tree-branch subs "Called by [primary]"), never SVG edges.

- **Front Desk stays FLAT — verified deliberate, not an oversight:**
  - [verbatim — Claude] "Front Desk Agent stays completely flat — all 7 workflows in a standard 2-column grid, no badges, no hierarchy. … Exactly as planned." (only Check-in: Process Submission→4 subs, and Sales & Events: Sales Inquiry Response→2 subs, show hierarchy)

#### Reversals
- (none in this chunk) — The drag-drop → arrows reordering reversal does NOT appear here (it's in C8, dated 05-11 in the main session). This chunk covers #3 (template library), #5 (hierarchy viz), #4 (team templates) + the START of the #6 sandbox discussion. Profile slim-down (#1) and step-reordering (#2) were done in an earlier session and only referenced as completed.

#### Rejected options
- **Preview modal/popup** — inline card-expand instead (speed).
- **Filter sidebar for categories** — top category tabs (match CanaryTabs).
- **Lorem-ipsum/placeholder template content** — genericized-real content (demo credibility).
- **"Indian wedding inquiry response" as a shipped template** — too niche (Miguel + Claude both flagged).
- **"Start from Scratch" as the default path** — demoted to a card inside the library.
- **`mdiArrowRightBold`/generic link icon** — `mdiOpenInNew` chosen.
- **Real dropdown-menu component** — state-based popover (prototype simplicity).
- **Connector lines/arrows for hierarchy** — tagging+layout model instead (SVG/DOM fragility).

#### Sandbox (#6) — the discussion STARTS here (decision deferred to S2)
- [verbatim — SDR (re-quoted by Claude)] "Is there a way to test this? Like a virtual machine sort of thing?"
- [my summary] Three fidelity tiers laid out (the menu the eventual "Phase A simulated" was picked from):
  - Option 1 (Simplest): "Test Run" button replaying a *pre-scripted* scenario through the existing animated timeline — "a canned demo replay. Low build effort."
  - Option 2 (Medium): interactive chat sandbox, type as a fake guest — "Could use Claude to generate responses grounded in the workflow definition… heavier to build." (the future Phase B path.)
  - Option 3 (Full): split-screen test mode — visualizer highlighting the active step + live conversation — "The 'wow' version but probably 6+ hours."
  - [verbatim — Claude] (recommendation, NOT yet accepted) "my recommendation is option 1 … the fastest to build and the concept lands clearly in a demo without needing a real AI backend." — NOTE: this chunk ENDS on Claude recommending option 1; the actual built result was the *full split-screen simulated* version ("Phase A"), so the decision flipped toward option 3's shape in a later chunk (S2).
  - [verbatim — Miguel] (05-12T18:37) "Ok so let's discuss # 6 a bit, what's expected here?" (opens the discussion; no decision in this chunk).

#### Notable verbatim quotes (Miguel's framings/reactions worth preserving raw)
- [verbatim — Miguel] (05-11T21:38, opening instruction) "Read all memory files… Understand everything before doing anything. IMPORTANT: Use the EXISTING worktree — do NOT create a new one. … tell me what you know BEFORE you start implementing" (hard process rule — comprehension + consult-before-building + no-new-worktree guard; he had just set `/effort max`)
- [verbatim — Miguel] (same instruction, the #3 framing) "This is NOT agent-level templates (we have those). This is workflow-level templates INSIDE an agent… Think 'Indian wedding inquiry response' workflow that someone else built and you can clone into your agent." (where the "Indian wedding" example entered)
- [verbatim — Miguel] (05-11T22:34, after #3 verified) "Nice, put a pin in upgrading this I have some thoughts on the UI, let's do the other stuff first then come back to this, is tha tok" (explicitly PARKS template-library UI polish — an open thread)
- [verbatim — Miguel] (05-11T22:39) "let's go 5" (picks #5 hierarchy viz next)
- [verbatim — Miguel] (05-12T18:25) "ok what is #4 again?" (needed a refresher a day later — the task list wasn't memorized)
- [verbatim — Miguel] (05-12T18:27) "Yeah go for it for now" (greenlights #4)

#### Open questions / deferrals raised here
- **Template-library UI polish explicitly pinned** — Miguel has unspecified "thoughts on the UI," deferred to "come back to this."
- **#6 sandbox fidelity level unresolved at chunk end** (decision lands in S2; ultimately the fuller split-screen "Phase A simulated" shape).
- **`remaining_tasks.md` + a `..._deferred` file** exist and were read (canonical 6-task list + deferred items).

#### Coverage note
~98% Agent Builder; only non-AB = a boundary note that another Claude session may be on `feature/checkin-flow-config`. All tool-result bodies (`[tr omitted]`)/screenshots stripped, so granular code/data specifics aren't recoverable; captured every decision/rationale/quote in the visible text. MISMATCH vs the briefing's S1 expectations: the **profile slim-down (#1)** and **drag-drop→arrows reversal (#2)** do NOT occur here — only referenced as completed (the reversal is fully mined in C8). This chunk = tasks **#3, #5, #4** + the opening of **#6**. The "Indian wedding genericization," "Rattle fresh-IDs clone," "team templates pre-seed," and "hierarchy = role-tagging not a DAG" spot-checks all appear and are mined at full depth.

---

### S2 — 8f91d479 — 2026-05-13 → 06-09 — Test sandbox Phase A build + THE MAY-18 CLAUDE-FIRST PIVOT + park decision

#### Net-new decisions & reasoning (not in the digest)

- [my summary] **"Go whole hog" on the full test-mode scope — Miguel chose the maximal version because there were no upcoming demos to constrain it.** (Authorized the 3-phase scope.)
  - [verbatim — Miguel] (05-13T00:43) "Seems like other Claude had the same ideas. I'd like to think of the Full scope one, what did you have in mind? Might as well go whole hog I don't have demos anytime soon"

- [my summary] **The "wow moment" lives in *how the test manifests in the overview*, not just that it exists.** First articulation of the dual "simulate for demo slides / real versions too" need that became Phase A vs Phase B.
  - [verbatim — Miguel] (05-13T00:46) "Test run in the overview seems about right, how it manifests will be interesting because this is the wow moment. Maybe for demo slides later we could also pretend to 'simulate' these tests, but obviously we want versions that are real too."

- [my summary] **Personas tie Phase A (simulated) to Phase C (scenario library) — Miguel's own connection** (collapsing A and C together).
  - [verbatim — Miguel] (05-13T00:49) "Yeah Phase A is neat! This could also tie into Phase C because we could do test personas to examplify these simulated runs."
  - [verbatim — Claude] "the personas give the simulated runs narrative weight… you can show 'watch how the same workflow handles these two completely different guests.'"

- [my summary] **Commit-but-don't-merge discipline reaffirmed for the whole #3–6 batch.**
  - [verbatim — Miguel] (05-13T21:50) "I guess commit and put it into the branch in git but yeah I don't want to merge to main"

- [my summary] **Sales-agent / RFP-responder analogy is the precedent for the email "audit not client" decision** (the *origin* of the "we're the intelligence layer / orchestrator, not a client" framing).
  - [verbatim — SJ-side] "I think about this a little bit and how we've been thinking about like RFP responder and that you want the audit, but not necessarily make it full fledged… our goal is to ingest so that we can automate when we can, but it's not necessarily like create a new email… I think the focus should be on audit."
  - [verbatim — SJ-side] "There's also a lot of benefit in this today's day and age not being a client. Being the orchestrator and letting the other system do all the complexities of UI work. We're the intelligence layer… But we're not like your system. We're not your client."
  - [verbatim — SJ-side] (the launch-out mechanic) "you literally click edit and it opens a new tab with the client open and the message there… So all like the work stream of Writing. Never, never enters Canary land."

- [my summary] **Product Observability "centered system events in the chat thread" is a direct sibling pattern to the Agent Builder Activity Feed** — the same "centered/gray system note, NOT a guest message" interleaving SJ independently demanded for messaging observability.
  - [verbatim — SJ-side] "The core of this here is like we want it in the chat… It can't look like a message… It should be centered, I think. Centered in the gray or something, just to indicate."

#### Deeper reasoning on already-captured decisions (quotes + rejected sub-options + back-and-forth)

- **The May-18 SJ "copy Claude's UI" directive (THE PIVOT) — raw verbatim, decoded.** The transcript is messy voice-to-text: "Claude" → **blog / plots / cloud / Cloud / PUD / FUD / code / codecs**, "Venli.ai" → "Vanity.ai" / "Aneri", "Mews" → "music". The digest cleaned these; the actual record:
  - [verbatim — SJ] "we went through this exercise of creating, like, what does the agent builder look like? And it turned out we probably should have just copied plots [Claude's] UI. You know, we created a whole different UI with, like, agents and all that"
  - [verbatim — SJ] "the UI for agent building… we shouldn't reinvent the wheel here. We should assume that our early adopters of agent studio… will have used Claude or codecs [Codex]. And so just follow the same patterns. They have connectors buried in… even the way you do knowledge and text and whatever, let's not actually try to make the air face [interface]… hotel specific. Let's straight up. Replicate the things you're used to."
  - [verbatim — SJ] **the "I have garbage in me" rationale (NOT in digest — the deepest WHY):** "I am not enough of a heavy user of Agents… to actually have strong opinions on the UI… And that is how I think we actually get left behind. by the 22 year old who never had the baggage of a UI dashboard. The way we get behind is they just have so many more reps… you'll have a visceral reaction of what an agentic dashboard looks like, which I cannot have because I just have so much garbage in me about all the past shit. And they don't."
  - [verbatim — SJ] **the "cheat code":** "So one cheat code is like, okay, well, Billions of people, hundreds of millions of people are using this interface, so I'm just going to copy this interface and not think about it. Not try to outthink myself here."
  - [verbatim — SJ] **the literal standing instruction (what "parked the project" cites):** "Do me a favor, just stick to that. Like, when you show me a design of whatever we're doing, I'm literally gonna ask, can you show me how they would do this on blog [Claude]? And like, I don't want there to be differences. We don't want to reinvent the wheel."
  - [verbatim — SJ] **the "follow the puck / training" meta-point:** "they're training hundreds of millions of people With their UI… Just, just follow that training. and not try to retrain on something different." / "follow that puck. … We can skip a few of their releases. It doesn't have to be every single one."
  - [verbatim — SJ] **"under the hood not over the hood" — full sentence:** "Right now, I think a lot of the divergences are under the hood… don't integrate with the PMS based off of some MCP. Do API integrations with the PMS. Like that's the hospitality specific thing… more under the hood, not over the hood." → SJ: "I agree."

- **The pushback ON "copy Claude" — the two counter-arguments (NOT in digest).** Not unanimous capitulation:
  - [verbatim — Miguel/team] **Counter #1, the treadmill:** "they do keep changing these UIs pretty rapidly… We want to be careful about being in this game where it's like, okay, we just have to keep copying to keep up kind of thing."
  - [verbatim — Miguel/team] **Counter #2, generic-vs-specialty:** "Claude is a UI that is meant to be kind of generic for any… white collar job… And we are a specialty product… specialized towards hotels… I do think that should be reflected… under the hood."
  - [verbatim — Miguel/team] **the structured-data argument:** "when you want to see information about like your in-house reservations or… these Data lists… you want to be able to see that in a way that is somewhat structured… not the UI changes every time because the agent builds it different every time… Consistency around things that you do a lot."
  - [verbatim — SJ] **his concession:** "Maybe, man, maybe. But I think things are changing. And by the way, I'm not advocating for Changing our UI every time Cloud shifts a UI."
  - [verbatim — Miguel] **his future-divergence caveat:** "I completely agree here. I am just like… I think there will come a time X months, Y years in the future in which Being divergent for your industry is probably important. Right now, I think a lot of the divergences are under the hood."

- **"How do users manage agents in Claude?" — the concrete paradigm SJ asked to be shown:**
  - [verbatim — SJ] "Don't overthink it. How do users manage agents in Cloud [Claude]?"
  - [verbatim — Claude/Miguel-side] "We have multiple chats in like a side panel Then they have tools that connect to it… the chat paradigm here, but then you can preview what is built."
  - [verbatim — SJ] "Do me a favor, just stick to that."

- **Agent Studio → Agent Knowledge rename — about what "Studio" *connotes*:**
  - [verbatim — SJ] "let's rename these to not be Agent Studio. Agent Studio means something different. Maybe call it Agent Knowledge… The studio is the actual builder in your head. I don't think this is agent builder… this is just agent knowledge."
  - [verbatim — team] "previously we called this agent builder Brown or Brownfield agent builder." / "Agent Knowledge… It could become an intelligence leader [layer]… Right now agent knowledge is fine."

- **The 4 workstreams — verbatim definitions** (digest lists names; here's how the team described each + the "rule builder / primitives" framing that maps to the Agent Builder gambit work):
  - [verbatim — team] "There are three legs… One is being able to configure all the AI's in the product channel now. So voice, messaging, web chat. The second leg is observability. So why does the AI say it's an answer? We want to be able to see the knowledge base sources… the third part is testing… see that in the dashboard before you [deploy]. And then this is the rule builder. So as we move to the agent builder, what are the primitives for those rules that we want to let you set up?"
  - [verbatim — team] Custom Actions = the "most agent-studio-y" remaining piece: "how can we make it easier to configure our existing agents… make it easier for people to add pump injections [prompt injections]… We're not doing the green fields… Instead… hey, what if you added a custom action."
  - [verbatim — team] **the full builder is "just in our heads":** "This… totally new product… is currently just in our heads."

- **"~2/3 to VoIP" — exact framing + "donating one engineer, can't do this indefinitely":**
  - [verbatim — team] "AK is made up of three people and about two-thirds of that capacity is being redirected to help VoIP with their market projects."
  - [verbatim — team] "messaging is donating one engineer with the capacity to voice for the entire block… we cannot indefinitely support moving one engineer away from messaging, but we can for this block."

- **Venli.ai — the use case SJ said "we skipped" (the chat-as-query gap):**
  - [verbatim — SJ] "the use case that he nails is we skip that use case… If you connect your systems, your loyalty systems, your PMS, your CRS, your Canary, what questions can you ask it? What dashboards can you build?… we got into so much like the code tab of FUD [Claude]… the agent builder tab of PUD [Claude], and we skipped the chat part."
  - [verbatim — SJ] **"hyper focus on 2-person startups" in full:** "I want us to hyper focus on what the two persons started is doing and hospitality. Like, hyper hyper focus. Ignore what opera's doing, ignore what music's [Mews] doing… As a product manager, it won't be a bad idea to spend X hours a week looking for small hotel tech startups… They don't have any of the baggage that we have."
  - [verbatim — SJ] Venli framed as M&A target: "We had a conversation with this guy possible investment, possible buy-ins, company type of thing."

- **"Copy Claude even for observability":**
  - [verbatim — team] "Even the observability piece… when you build an agent on cloud [Claude], how do you do observability on it? They have sources today… and you can see your [reasoning]."
  - [verbatim — SJ] "So I think my point still stands. Even observability, please just copy what they did."

#### Reversals

- **(Project-level, strategic) the entire custom visual builder paradigm (workflow cards / hierarchy tree / template library / dashboard-of-agents) → reframed as a "what we explored" artifact, replaced by a future Claude-clone chat-first direction.** Why: SJ's "under the hood, not over the hood" directive. The prototype is NOT thrown away — it's the exploration that produced the conclusion.
  - [verbatim — Claude, Miguel concurring] "The prototype did its job. SJ literally called it out… The prototype was the exploration that led to that conclusion. That's not a failure — that's exactly what prototypes are for."

#### Rejected options

- **Building a full email client / write-mode email** — email-as-a-channel "ends at building an email client"; hard line: read-only audit + AI auto-response, writing "launches out to the client."
  - [verbatim — SJ-side] "Email as a channel… it ends at building an email client. Like, I was a little bit scared of this."
  - [verbatim — SJ-side] "we need to draw a line in the sand. I don't want to end up building an email client."
  - [verbatim — SJ-side] (the line-test) "the moment it starts to smell like an email client… now we're sending out the emails and you can see them."

- **Live-Claude-powered test mode (Phase B) as the demo vehicle** — deferred for Phase A simulated; real Claude is "impressive but fragile for demos (API latency, unexpected responses, costs)"; simulated is "reliable and controllable."
  - [verbatim — Claude] "Real Claude-powered testing is impressive but fragile for demos… Simulated testing is reliable and controllable but doesn't prove the product works. You probably want both — a 'live' mode for when you're actually validating, and a 'demo' mode that replays a perfect scripted scenario every time."
  - [my summary] Biggest *technical* risk for the (deferred) live mode = **visualizer step-matching** (Claude's free-text response must map back to a specific step/condition — fuzzy; "Claude might skip steps or combine them"); mitigation = step IDs in the system prompt + structured metadata. Zero risk for simulated (scripted).

- **Web-chat "rates & availability via PMS integration, Opera-first"** — SJ argued for **controlling the hotel-website DOM** (LLM reads DOM → generates/self-heals scripts → executes the NL search on the real site). Rejected the in-widget booking-flow (wastes the hotel's existing real estate). Same "be the orchestrator, don't rebuild what exists" logic SJ applied to email.
  - [verbatim — SJ] "I feel like we should have web chat control for the website… it should actually understand the Search Flow of what I say. and execute that natural language query… on the website, and show you the result on the website of that search."
  - [verbatim — SJ] "It doesn't actually make sense to cram the photos of the hotel, any availability, in this bottom right web chat… Why are you not using all the other real estate that the user has open?… it also feels duplicative to The hotel probably spent a bunch of time and money [on a] flow or UI to display their product."
  - [verbatim — eng pushback] "The problem is it becomes extremely brittle because we control the website widget and not the website." → [verbatim — counter] "that self healing process is way more possible than it used to be."

#### Notable verbatim quotes (Miguel's framings/reactions worth preserving raw)

- [verbatim — Miguel] (Slack, 8:18 AM) "while I don't disagree, how confident are we that everyone's gonna take to the chat interface easily?" (opens the chat-adoption debate)
- [verbatim — Kevin] (8:19) "i think i'm like 60-70% confident; i think a lot of folks are coming around, chat gpt & claude is making chat the interface to interact and build"
- [verbatim — Miguel] (8:21) "my only concern is that while you and I are well-versed in the chat-as-interface paradigm, I wonder what % of our users will know what to do when given this product"
- [verbatim — Miguel] (8:22–8:23) **the AE/Sales field-evidence:** "awhile back I was showing a couple of AEs and Sales the Agent Builder I made awhile ago, with the chat-as-builder thing… while the demo was cool for them, a concern that kept being voiced was that hotel users might shun/shy away from this interface and need more hand-holdy onboardings… It's purely anecdotal though"
- [verbatim — Kevin] (8:23) "yeah i actually think the chat should feel more hand holdy over time ya know" / "its like - just talk to me, i'll [figure i]t out with you"
- [verbatim — Kevin] (8:23) "while change is hard - i think we gotta get them to the wow moment quickly"
- [verbatim — Miguel] (8:24) "drag em kicking and screaming into the new world haha"
- [verbatim — Kevin] (8:24) "i think examples to help drive them to completion / so like - hey let me walk you through building a quick agent / it is scary at first / i mean i was scared a few months ago… and then now its like just wired as part of me"
- [verbatim — Miguel] (8:24) **the quick-replies resolution:** "that works, and giving pre-filled quick replies would be helpful to guide the convo"
- [verbatim — Kevin] (8:25) "i like the guided flow from claude design / where it comes back and asks clarifying" → [verbatim — Miguel] (8:25) "100% that's where my mind went to / one of the easiest onboarding process"
- [verbatim — Miguel] (8:26) **avoid-ElevenLabs:** "I was peeping other competitors, wanna avoid the complexity of agent-builders like ElevenLabs 😂" … (8:27) "I mean for us, we can understand it / but for the hotel user, they'll be like 😫"
- [verbatim — Kevin] (8:27) **RFP-agent lesson — single-prompt failed:** "even for the RFP ag[e]nts, i think we led with single massive prompt / didn't make sense and also doesn't show the nuance" → [verbatim — Miguel] "yeah 100% / plus, as you and I both know, people don't like to read 🤪"
- [verbatim — Miguel] (8:31) **Sana.ai reference:** "Sana is a little more sequential, with 'preview'/testing side by side" … (8:33) "LOL back to the 3 panel convo"
- [verbatim — Kevin] (8:33) "yeah this sequential is kinda what we have thoughts for agent builder" → [verbatim — Miguel] (8:34) "it's like we never left! 😂"
- [verbatim — Miguel] (8:35–8:36) **the dual-mode origin restated:** "the one I made was sequential but I remember we were discussing the merits/benefits of sequential building vs. free-form / I think we decided on a freeform Advanced Builder for more pro-users and a guided one for beginners"
- [verbatim — Kevin] (8:36) **"need both ultimately":** "yeah i think we'll need both ultimately" → [verbatim — Miguel] "works for me"
- [verbatim — Miguel] (05-18T16:26) **the question that triggered the reassessment:** "Do you think our design needs to fundamentally change following the conversation in this meeting?"
- [verbatim — Miguel] (05-18T20:40) **the park-and-document request:** "what do you recommend we do? Also I'd love to get some writeup in the memories or somewhere to kind of put [p]en to paper on what we wanna do here"
- [verbatim — Miguel] (06-08T21:26) **the brain-save framing — ADD don't overwrite:** "I added some context from a separate Claude session to the brain-save but you seem to have more context too, can you use /brain-save to ADD (not necessarily o[v]erwrite) the context to the brain file for agent-builder?"

#### Open questions / deferrals raised here
- **Phase B (live interactive Claude-grounded test mode) + Phase C (save/replay scenarios)** — explicitly deferred; only Phase A (simulated) shipped.
- **Template library UI polish** — deferred "come back to it."
- **The Claude-clone production direction is unbuilt** — entry point should become "starting a Claude conversation" not "a dashboard of 6 agent cards"; visualizer repurposed as the "artifact/preview pane"; hierarchy tree → conversational references; template library → conversation starters. All described, none built.
- **Whether to evolve the current prototype vs. start a fresh Claude-style exploration** — Claude asked; Miguel chose to PARK rather than answer.
- **Dual-mode (guided + freeform Advanced) confirmed needed but unbuilt for the Claude-first paradigm.**
- **Jake Wilhelm + Miguel messaging-nav redesign / "messaging as command center"** — the action item that becomes the *successor* work (Command Center), pulling focus off Agent Builder.

#### Coverage note
~70% of this chunk is Agent Builder + the directly-governing strategy meeting; all of it mined. The May-18 Q2 Block 2 transcript (lines ~339–1038) covers many products (UDFs/MoEngage, inbound email, scheduled-campaign segmentation, support-ticket AI, message-scheduler state-machine rewrite, Langham, web-chat DOM, guest-profile side panel). Captured the **email "audit not client"**, **observability-events-in-chat**, **Agent Knowledge rename/4-workstreams/⅔-to-VoIP**, **Venli/Sana**, **web-chat DOM** stretches because they either *are* Agent Knowledge or carry the same governing reasoning. Skipped pure-messaging-scheduler internals, MoEngage opt-in mechanics, Langham post-mortem. **Key fidelity gain over the digest:** the raw transcript garbles "Claude"→blog/plots/cloud/PUD/FUD/codecs, "Venli"→Vanity/Aneri, "Mews"→music — preserved verbatim + decoded inline; the digest's SJ quotes were lightly cleaned/conflated, so the raw wording ("I have so much garbage in me," "22-year-old with no baggage," "follow that puck," "cheat code," "I'm literally gonna ask can you show me how they'd do this on [Claude]") is reproduced unabridged, plus the two-sided pushback (UI-treadmill + generic-vs-specialty + structured-data-consistency) the digest dropped.
