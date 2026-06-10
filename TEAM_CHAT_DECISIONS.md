# Team Chat — Decision Log (the *why*, not just the *what*)

> **Purpose:** capture the reasoning + rejected alternatives that plain status docs lose. Read this WITH `TEAM_CHAT_SPIKE.md` (state/file-map) and the `team-chat-design-tasks` memory. Then read the source transcripts (bottom) for full depth.
> **How a fresh Claude should start:** read this → tell Miguel your understanding of the top decisions AND their reasoning AND where you're unsure → let him correct → only then proceed. Don't cold-execute.

## Status (2026-06-10) — ⚠️ DIRECTION REVERSED by SJ: PUSH is dead, OVERLAY (quick-fire) is the call
**v0 = an OVERLAY (covers content; dim/scrim OK), reframed as a QUICK in-and-out tool — NOT a persistent push panel.** SJ overruled push at the 2026-06-08 "Decision Layout" meeting (Blake brought in as the deciding outside opinion). Core reversal: SJ rejects "keep content visible for reference" as a primary driver — Team Chat is quick coordination, *whatever's behind is irrelevant*. Entry trending bottom-left / left-sidebar; one cohesive container (groups + chat). **Reversible bet** (SJ: if overlay fails, the sidebar/push already exists = the fallback). See **D22**. **D19 (push) is SUPERSEDED.** Frontend PAUSED pending Miguel's high-confidence overlay designs → strong rec → Jake+Miguel → **SJ final sign-off**; Miguel now researching/exploring. Ironically swings back toward the *original* overlay + bottom-left idea (old spike variants F dock + G overlay) that push had killed — now framed as quick-fire, not "command center."

> **Historical (2026-06-04, SUPERSEDED by D22):** v0 had settled as top-header pill → right-side PUSH panel → full-screen (D19), unblocked by Kevin without SJ, validated PRD-complete + shipped to eng (DSN-1850). SJ then re-opened it 06-08 and reversed to overlay.

> **Historical (2026-06-01, superseded):** Spike compared container models A–E live at 1440px; "no container model chosen yet" after two Jake calls; plan was to present A–E to SJ. That exploration is done — the decision is now made (D19).

---

## DECISION LOG (each: Decision · Why · Rejected & why · Still-open)

### D1 — It's a *coordination layer*, not a chat app
- **Why:** the only thing that beats WhatsApp is knowing Canary objects (guest/reservation/ticket/upsell). Plain chat loses to WhatsApp's 15-yr head start + universal mobile.
- **Rejected:** "build a chat tab" — a worse WhatsApp. Also rejected: scoping it as just a feature *of* Messaging (it should reach every product).
- **Open:** is it its own SKU? Jake/Mati say yes (you can have check-in without messaging but still coordinate); Kevin says no. UNRESOLVED — but gate it independently of Messaging regardless.

### D2 — Why build it at all
- **Why:** *both* real customer demand (AE channel asks, lost deals) AND SJ's MSA-driven "more products → more MSAs." Be honest which is driving: MSA-driven → must be packageable/differentiated enough to justify a line item; product-driven → must measurably help existing users.
- **Risk:** if it's MSA-theater shipped as plain chat, it won't get adopted (see D5).

### D3 — Entry = global header pill → slide-in panel
- **Why:** reachable from every product without leaving the screen; Wenjun *independently* placed team chat in the header (convergent signal).
- **Rejected:** dedicated tab/destination (just another place to go, competes head-on with WhatsApp); right rail (the app already has a left sidebar → sandwiching content between two rails).

### D4 — Container model is the core OPEN fork (A–E)
- **The principle that constrains it (Miguel's catch):** team chat must be ONE consistent global layer, identical on every product (and sellable as a SKU). It must NOT negotiate with each product's internal panels.
- **Rejected (important):** the "tab between Guest Profile and Team Chat" idea — elegant *only* in messaging; it breaks the moment you're in check-in/checkout (no guest-profile rail to tab with), and it conflates *guest context* (one guest) with *team coordination* (departments). Don't per-surface it.
- **The five built to compare:** A overlay (floats, reflows nothing, hides content) · B shell-gutter (page reflows by its own responsive rules) · C collapse-nav-to-rail · D compact-chrome + overlay · E compact-chrome + gutter.
- **Claude's lean:** **B** (keeps content visible = the "reference the guest while coordinating" value), with **A** as the demands-nothing fallback where push would break a page. C is conceptually cleanest for width but is a *stand-in* (see D9). D/E are messaging-specific polish.
- **Still-open:** pick one. The spike multiplies options; the next job is to NARROW, ideally to a recommendation for Jake, not all five.

### D5 — The 1440px squeeze / the real collision
- **Reframe:** the contest is NOT team-chat-vs-the-page; it's **team-chat vs. the product's OWN right panel** (messaging's Conversation Details behind the "i"; check-in's detail panel). At 1440: nav|list|thread|details|chat = 5 regions = impossible.
- **The tension:** team chat's value is "see the guest while coordinating," but that's exactly what blows the width budget.
- **The bet we made:** it's largely a v1+ problem — object cards (which carry context into chat) are v1, and staff-ops chat rarely needs the guest's full details open simultaneously. So v0 default = 4 regions (fine); the 5th is a rare, deliberate, degrade-gracefully case.
- **Rejected:** building messaging's speculative 3-panel-always-on (always-on Guest Profile) — Miguel: "no reliable argument" to execute it. If it ever ships, IT owns the coexistence.
- **Still-open fork:** coexist-simultaneously (real multi-panel, aggressive collapse) vs. single-shared-slot-that-swaps-and-leans-on-cards (Jake's implicit bet). Unresolved after 2 Jake calls.

### D6 — IA: group-list-first + flat thread
- **Why group-list-first:** scales to Andrew's many department groups AND gives cross-group unread triage (which group needs me now?) — the seed of the command-center.
- **Rejected:** the dropdown switcher (my first attempt) — it *buries* cross-group awareness; it was a width-saving shortcut, the wrong trade. The fix for "narrow" is a compact list, not eliminating the list.
- **Why flat thread (not bubbles):** reads as a scannable ops log; AI auto-posts + object cards sit cleanly; bubbles waste width. Counter-argument considered: bubbles feel like WhatsApp (adoption) — but ops-tool legibility won. Low-stakes; gut-check in visual pass.

### D7 — Object cards = the differentiator, deferred to v1
- Compact guest/reservation/ticket card dropped into a message. NOT v0 (kept in the spike only as illustrative content). This is half the wedge.

### D8 — Acknowledge/confirm-read: REMOVED (was a misstep)
- Built it Deputy-style ("Confirm you've seen this / N of M"); Miguel correctly called it **redundant** — passive "Seen by N" suffices. Reverted.

### D9 — Variant C is a stand-in (lib dependency)
- A *true* collapsible icon-rail needs the component library to support collapse — **it doesn't** (grep-confirmed: no collapse/icon-rail mode in `@canary-ui/components`). C uses a custom `CollapsedNavRail` (structure lifted from the vaporware) + `hideSidebar`. The real version is the **collapsible-sidebar / Wenjun** track. (I first shipped C as a full-*hide* — wrong; Miguel corrected → icon rail → then we found it's actually lib-blocked.)

### D10 — Compact chrome (Option D) is an ORTHOGONAL modifier, not a peer of A/B/C
- D = compact messaging chrome (toolbar→sidebar header, compact tabs/online-hours) + overlay; **E** = compact chrome + gutter. So you can compare D-overlay vs D-gutter against A/B. Compact chrome gates on D/E only (not global — that was a bug Miguel flagged).

### D11 — New-message compose paradigm (a real prototype-core bug)
- prototype-core put the new-message phone input in the thread **LIST** (wrong). Correct (real product + vaporware) = a "To:" header in the thread **PANE**. Root cause: inherited from the initial `canary-messaging` port (commit `5ae7e59e`), never intentional — NOT our session. Fixed in the spike via `ComposeHeader`; the proper -core fix is prompted in `FIX_NEW_MESSAGE_PROMPT.md`.

### D12 — Library pinned to `bbc64f3` (reverted off latest)
- Updating to latest `0c485c5` silently **broke the AppShell header** (breaking `CanaryAppShell` header change; it still *built*, so dev-200 didn't catch it). Reverted + pinned for spike stability. The header-API change must be reconciled before adopting latest.

### D13 — Variant C rail = faithful render of the REAL sidebar, not a hand-rolled list
- **Decision:** the collapsed rail now renders the SAME `standardMainSidebarSections` the live `CanarySidebar` uses (threaded from the dashboard layout so the unread badge + selected item stay 1:1), with the real MAIN treatment — ground `#375492`, white icons ~50% at rest, selected = white pill with icon/label in the ground color, 3 sections w/ dividers, Settings pinned bottom. Added **hover-to-expand** (mini → 208px) so collapsing the nav doesn't cost label legibility.
- **Why:** the old rail hardcoded **5 of the 13** products with *guessed* icons (Check-in = bed not `mdiLogin`; Upsells = tag not `mdiCashMultiple`; Checkout = grid not `mdiLogout`) and a wrong navy (`#1E335A`, absent from the lib; real ground is `#375492`). For SJ to read C as a credible "collapsed sidebar" option it must match the real nav exactly; deriving from the lib source-of-truth guarantees it and won't drift.
- **Rejected — "match the vaporware collapsed sidebar" (the original ask):** there isn't one. Searched all branches + commits — the vaporware only has a collapsible *guest-info* (right) sidebar + collapsible thread swim-lanes; its CLAUDE.md "Phase 2: Collapsible Product Sidebar" was never landed (branch gone). So **D9's "structure lifted from the vaporware" was inaccurate.** Modeled on the real `CanarySidebar` MAIN instead.
- **Rejected — rebuild icons via an id→mdi map:** unnecessary + drift-prone. `item.icon` is an `@mdi/react` `<Icon>` with no `color` prop (inherits `currentColor`), so the real icon nodes are reused as-is and themed via CSS.
- **Structural fix (2nd pass):** rail is now **full-height in the sidebar's own slot** — `fixed inset-y-0` + the shell offset right by `pl-[64px]` so the header sits to its *right* (Miguel caught it flooding the full width over the nav). Canary mark added top-left to match the real sidebar. The rail rendering moved up from `TeamChatSpikeRoot` (content region) to `(dashboard)/layout.tsx` (shell level).
- **Open:** still a *visual* stand-in — production C needs a real collapse mode in `@canary-ui/components` (the D9 / collapsible-sidebar / **SJ-tomorrow** dependency). Files: `CollapsedNavRail.tsx` (full-height rail); `(dashboard)/layout.tsx` (renders rail + offsets shell); `TeamChatSpikeRoot.tsx` (reverted to content-push only); `spike-store.ts` (C meta).

### D14 — v0 container = side panel; floating widget rejected
- **Decision (team, 2026-06-02 SJ review + eng debrief):** ship v0 as a **side panel** (overlay or push — still low-stakes). Wenjun's floating/draggable co-pilot widget is **out**.
- **Why:** persistence is the wedge — hotels keep internal comms open all day ("the pulse of the hotel"; a GM runs Canary + WhatsApp side-by-side on 32" monitors). Side-by-side lets staff copy guest context into chat without task-switching. Push slightly favored (Jake: "slide in so we don't cover info"); overlay fine too (Sudarshan: "you can always minimize it").
- **Rejected — floating widget:** Sudarshan (eng) — draggable in-browser chat = refresh/resize/stacking/state nightmare ("wreaks havoc"); even coded perfectly the UX is bad (always covering content, must reposition as you switch products, 2000s-popup feel). Only semi-viable floaty = a bottom-corner web-chat launcher; still lost.
- **Open:** final push-vs-overlay; maybe offer pin+float as a user preference in v1; SJ sign-off (see process entry).

### D15 — SJ's real objection = the entry-pill *treatment*, not placement
- **Decision:** the header/top-bar is the **confirmed home** for global functions (SJ conceded). The fix is **differentiating the Team Chat entry** from the Reservations pill, not moving it off the header.
- **Why:** SJ's only concrete gripe — Team Chat and Reservations pills look identical but do different things ("Design Logic 101").
- **Agreed tweaks (Jake + Miguel, 6/2 Slack — bucketed as part of the *separate* nav redesign, NOT a v0 blocker):** Jake **approved the prototype's Team Chat button**; move the Team Chat pill to the **right of Reservations** (keeps Reservations + the $500 Referral pill adjacent); **shrink the account button to just the avatar** (easy FE lift) so the action pills read as buttons.
- **Rejected:** three visually-equal top-right pills. **Open:** exact treatment lands in the nav-redesign track.

### D16 — Decouple the left-nav overhaul / collapsible sidebar from team-chat v0
- **Decision:** v0 ships a side panel on the **existing** chrome. SJ's "everything-on-the-left / strip-the-header / full-vertical-height" overhaul — and any collapsible sidebar — is a **separate track**, not a v0 dependency.
- **Why:** Langham is contingent on team chat shipping and August (frontend) is waiting; the team explicitly refuses to block v0 on a nav redesign.
- **Reframes Variant C:** the full-height collapsed rail is **no longer a v0 container candidate** — it belongs to the decoupled nav track. *(Claude's suggestion: it doubles as a ready-made "clean-left future" demo for SJ, since it shows exactly the full-vertical-height he's asking for.)*
- **Open:** owner/timing of the nav track.

### D17 — v0 is blocked on SJ conviction, not design
- **Decision/path:** Jake sends SJ the user-interview / Gong recordings + transcripts, then schedules a **follow-up with engineers (Sudarshan + Mati) in the room** to bring a unified **side-panel recommendation** + the floaty's technical refutation (engineers "cornering" SJ has historically gotten him to yes).
- **Why:** no decision was made — "too many stakeholders," SJ asked for the Gong calls. Jake feels "disempowered to decide"; this is "service-ticket-settings all over again" (4 laps back to Jake + Miguel's original side-panel instinct, now validated by customers + engineers).
- **Craft note (Wenjun):** frame **user-first** ("quick in/out") and anchor on **competitor examples** before showing the solution — SJ needs evidence, not assertion.
- **Confirmations (no change):** global access = #1 customer ask; department/group-first; **≥1440px single-monitor = 80% of users** (desktop-first validated); v0 needs 1–2 differentiators to market (Catherine).

### D18 — Messaging-usage data + variant F: "ever-present launcher that opens full"
- **Data (Snowflake `fact_messages`, US, 30d, 146,953 staff-user-days, staff-sent `SOURCE='hotel'`):** MEDIAN staff-user-day = **2 messages, 1 active hour, 25-min span = in-and-out**; AVG = 6.2 msgs / 2.2 hrs / 209-min span = a heavy **power-user tail that lives in it**. Bimodal.
- **What it settles:** the in/out median *validates* SJ's ever-present-launcher instinct (and Wenjun's "quick in/out"); the tail needs the full workspace. Resolved position: **an ever-present launcher that OPENS INTO THE FULL WORKSPACE** (not a capped popup) — serves both. Caveat: measures active *sends*, not "open & reading" (a floor on presence); US-only.
- **Built:** Variant **F** = SJ's docked Messenger launcher (bottom-left, Departments + Staff, stackable popups), integrated flush into the navy App Shell sidebar (180px). Pressure-tests the floaty + multi-window stacking.
- **Correction:** I'd called the dock "dead on arrival" for a primary workspace — the data refutes that for the median user. Credit Miguel's "it's just relocating the entry" reframe.
- **Open:** launcher opens full-size vs stays popup (the fork) · merge guest+staff vs a one-tap bridge from the guest thread (the leak/towels moment argues bridge-first) · ambient-layer concurrency (messaging open *while in other products*) still unmeasured — next pull.

### D19 — v0 surface = top-header pill → right-side PUSH panel → full-screen (SUPERSEDES the "overlay command center" reading)
> ⚠️ **SUPERSEDED 2026-06-08 by D22** — SJ reversed this to a quick-fire overlay. Kept for the reasoning + as the documented fallback (SJ called the reversal reversible). The push *rationale* (keep content visible to reference while coordinating) is exactly what SJ overruled.
- **Decision (2026-06-03 Team Chat Review, ~10 people aligned):** Team Chat is a **pill in the top header** (right of Reservations); clicking it opens a **right-side panel that PUSHES the page content aside** (reflow, not cover); the panel can **expand to full-screen** and collapse back. Read into the record verbatim: *"team chat is a pill in the top header. When we click onto it, it pushes everything to the side, and we have the ability to make that side panel full screen."*
- **Why:** persistence-while-visible is the wedge — the underlying product must stay visible so staff reference guest context while coordinating (the GM premise: *"it's not over anything, it's not covering anything so you can always jump very easily between the two"*). Right side because *"most apps have it on the right… Instagram, Facebook, LinkedIn… Notion, Shopify, OpenAI, Claude."* Full-screen serves the power-user tail (managing multiple groups); the bimodal data (D18) backs "compact panel for the majority + full workspace for the tail."
- **Rejected — overlay (variant G) / floating widget:** *"the side rail feels cleaner than like an overlay"*; floaty was already killed on eng grounds (D14, Sudarshan). **Rejected — bottom-left ever-present launcher (variant F / SJ's Slack pivot):** *"I'm not expecting any messages from the bottom… so I will miss messages."* **Rejected — nested under Messages / a peer top-nav tab:** keeps it a global layer reachable from every product (honors the PRD customer ask *"Team Chat should be completely separate from guest messaging"*).
- **Supersedes:** the prior INDEX/CAPTURE "overlay command center, bottom-left launcher, SJ 'overlay not take over'" lock. Net effect ≈ old **variant B (push) + header-pill entry (D3) + a new full-screen mode**.
- **Open:** in messaging the team-chat panel is **either/or** with the guest Conversation Details panel (single shared right slot — *"it could be an either/or thing"*); exact header treatment (Team pill right of Reservations + shrink account button to avatar) lands in the decoupled nav-redesign track (D15/D16).

### D20 — v0 unblocked by Kevin without SJ sign-off (RESOLVES D17)
- **Decision (2026-06-04):** proceed to build/spec the side panel **without waiting for SJ's approval.** Jake (Slack): *"according to kevin, we just move forward without SJ's approval (as informed decision makers) and design the side panel in order to unblock the project! Especially since we had a good discussion yesterday and we had like 10 people aligned on the same direction."* Miguel: *"LGTM! I count that as a win!"*
- **Why:** ~10 stakeholders aligned at the 6/3 review; further delay blocks Langham + August. Kevin invoked "informed decision-makers" to break the SJ-conviction gate.
- **Supersedes D17:** the "send SJ the Gong calls + eng-backed follow-up" path is no longer the gate — the decision is made. SJ's bottom-left/"overlay not take over" Slack pivot is moot (the room's push direction + Kevin's call win).
- **Open:** SJ could still weigh in later; if he pushes the all-left-nav overhaul, that's the *decoupled* track (D16), not a v0 blocker.

### D21 — v0 scope is the LEAN PRD scope, not the reconstructed "command center" checklist
- **Decision:** validate the Figma against the authoritative **PRD scope-by-version table** (PRD: *Team Chat — Internal Staff Group Messaging*, Jake owner, 2026-05-20, page `366814686151807687aff66ab342f797`; TDD `36d814686151809ab42fc6e681efe9bf`). **V0 = lean text-only group chat:** groups CRUD (create/rename/archive, **admin-only**, kebab + "New group") · membership (admin add/remove + staff self join/leave) · text messages real-time, **flat** · **all staff READ any group** (visibility ≠ membership) · member-only unread badge + notifications · group archival · unread (top-bar bubble + per-group) · in-app toasts · auto-seed from departments (no setup UX) · Datadog logging · quiet-hours ignored.
- **Why:** the prior brain's "v0 don't-forget" list (attachments/@mentions/mute/search/reactions/Seen-by-N/post-to-dept-bridge/object-cards) was reconstructed from CALLS, not the PRD, and **over-scoped v0**. Per the PRD: @mentions/attachments/mobile/presence = **V1**; read-receipts/edit-delete/search/broadcast/private-groups/AI/object-cards = **V2**; reactions = unscoped; 1:1 DMs = **don't exist** (*"a 2-member group is just a small group"*). The entire differentiator "wedge" (object cards, ticket→message, suggested-post, guest cards, deep links) is **V2**.
- **Rejected for v0 (with the doc that defers each):** showing attachments, @mentions, reactions, search, read-receipts, object/guest cards, a staff-DM list, or threaded replies in the v0 Figma — all deferred per PRD.
- **Open (resolve IN the Figma):** (1) **DMs/staff list** — prototypes show staff DMs; PRD says groups-only → drop the DM column for v0 (biggest visual delta). (2) **Attachments** — Jake verbally "dead in the water" (v0) vs his PRD's V1 → reconcile w/ Jake; design composer to accept attach later, don't build it. (3) **"Subscribe/Unsubscribe" vs "Join/Leave"** copy — explicit PRD open Q. Plus draw the **admin-vs-staff states** and the **empty state** (no departments → zero groups). Group list is **two-tier** (your groups + collapsed "More groups", readable-not-badged).

### D22 — REVERSAL: v0 = quick-fire OVERLAY, not a persistent push panel (SJ's call; supersedes D19)
- **Decision (2026-06-08 "Decision Layout" mtg — SJ + Blake):** ship Team Chat as a **small overlay** that **covers content** (dim/scrim acceptable), entered from a **bottom-left / left-sidebar** launcher, framed as a **quick in-and-out** tool (open → message → close). ONE cohesive container (groups + active conversation, Slack-style), one conversation at a time. NOT the persistent right-side push panel (D19).
- **Why (SJ):** Team Chat's job is *communication*, not keeping the dashboard visible. "It is not often that you will need the information behind the team chat" → covering content is fine. The reference/copy-paste need (D19's whole basis) is a *secondary* driver, solvable inside the messaging page's own sidebar. Mental model = "switching apps on a phone," not two panels side-by-side. Loosely backed by D18 bimodal data (MEDIAN user is in/out → quick-fire fits the majority).
- **Rejected/overruled:** **D19 push** (its core rationale explicitly downgraded by SJ) · **persistent right rail** (Blake: "super annoying," ex-Google; screens not that wide) · **multi-window Messenger-style split popups** (cluttered; SJ wants one container, one conversation at a time).
- **Reversibility hedge (load-bearing):** SJ framed it as an assumption he'll reverse — "if the overlay doesn't work, the sidebar already exists." D19's push/sidebar = documented FALLBACK, not waste.
- **The real OPEN tension (Claude's flag):** quick-fire overlay vs. the sticky **v1 wedge** (object cards, ticket loop, AI posts, group chat w/ images/PDFs — which *need* real estate; SJ himself said group chat needs bigger/taller/wider). Design toward: keep the **overlay THIN (quick-fire)** + invest richness in a **full-screen "messaging portal"** (SJ named it: "the messaging portal you get out of this into") reachable from the overlay. Overlay = quick layer; portal = command center. Cramming the wedge into the small overlay IS the boxing-in risk.
- **Open:** entry point + overlay footprint/anchor/size · **Zendesk relocation** (prod floaty bottom-left = collision; API-triggerable from anywhere now) · notifications-while-open · real monitor-width number (Blake disputes 1440) · the overlay⇄portal escalation. → Miguel: research + ONE strong rec (Wenjun: "don't ask for opinions") → Jake+Miguel → **SJ final sign-off**. Frontend PAUSED till then.

---

## Reasoning texture / near-misses (the stuff docs usually drop)
- We almost over-fitted the container to *messaging* (the tabbed-rail idea) before Miguel pulled it up an altitude to "one consistent global layer." That altitude shift is the most important reasoning move in the whole project.
- "Dev server returns 200" ≠ "production build passes." The lib-update header break and the likely Vercel build risk both come from trusting dev over `next build`.
- The spike kept *accreting* variants (A→E). Good for exploration, but its value now is **narrowing**, not adding. Presenting all five to Jake would be a mistake.
- The deepest strategic truth: as plain chat-in-a-panel this is a worse WhatsApp; the reason-to-switch is entirely the v1 wedge.

## Personas (source of truth = the calls)
- **Garden City / Andrew Gee:** many department groups; WhatsApp + radio + email; loves read receipts; mobile is make-or-break (staff float a large campus).
- **HIE Spring Hill / Ryan Cornelius:** ONE shared daily log (OneNote), cadenced not live, searchable, no mobile; wants guest-card-in-chat + cross-product; HotelKey PMS.
- → The product must serve BOTH live department groups AND a cadenced shared log.

## The v1 wedge (why it's worth switching — all deferred)
Service-ticket loop (guest texts "towels" → AI ticket → posts to Housekeeping group → claim/resolve → status syncs → **kills the radio**) · the inline **Suggested Team Chat Post** (Jake's idea, strongest single concept) · cadenced shift-handover/daily-log (Ryan's half, currently under-served).

## v0 scope risk (most concrete)
Attachments + @mentions are "fast-follow" in the PRD, but Jake himself said it's **"dead in the water"** without attachments. They're probably really v0; ship without them and the "5 msgs/day" adoption metric never triggers.

## Biggest risks (priority order)
1. **No decision** — comparison tool that doesn't force a pick = analysis paralysis. Commit to a model (lean: B + A fallback).
2. **1440 worst case is deferred, not solved** — could break the chosen model if the bet (rare/v1) is wrong or messaging goes 3-panel.
3. **v0 scope** (attachments/@mentions).
4. **Wedge is v1** — v0 alone won't drive adoption / justify the MSA bet.
5. **Demo ≠ production** — pinned old lib, dev-only verification, spike scaffolding; Vercel prod build untested (likely unused-imports in `ThreadList.tsx`).
6. **Mobile** — desktop-first v0 is intentional, but Andrew's adoption hinges on the staff app.

## Spike commits (the durable trail)
`70492ee` A/B/C/D harness → `53ebc06` group-list+flat-thread → `dc3216e` boosters+C → `08bb983` Option D → `9590108` C real rail → `b17f4bd` doc+lib-bump → cleanup (`f9db0b9`,`8712ad8`) → `cae6ac6` compose-in-pane fix → `24dcca2` compact pass+design brief → `7669f21` collapsible harness → `e8576cc` D=overlay+gutter (variant E) → `ee8b62a` z-index fix. Pushed; **not merged to main**.

## Source transcripts (the territory — zoom in here for depth)
- Garden City / Andrew (discovery) — Notion.
- HIE Spring Hill / Ryan — Notion: `2026-05-22 HIE Spring Hill Ryan Cornelius`.
- Internal Team Chat w/ Jake (2026-05-27) — Notion (full transcript + PRD link).
- **Miguel ↔ Jake (NEW, unread):** https://www.notion.so/canarytechnologies/Miguel-Jake-37281468615180daa555e24cdcba2a42 — read the TRANSCRIPT, not the summary. Synthesize what it changes vs this log.
- Companion docs in-repo: `TEAM_CHAT_SPIKE.md` (state/files), `TEAM_CHAT_DESIGN_BRIEF.md` (Claude Design prompt), `FIX_NEW_MESSAGE_PROMPT.md` (the -core compose fix).

## Reusable resume prompt (paste into a fresh session)
> "Continue the Team Chat spike. Read `TEAM_CHAT_DECISIONS.md` + `TEAM_CHAT_SPIKE.md` + the `team-chat-design-tasks` memory. Tell me your understanding of the top decisions, the *reasoning* behind each, and where you're unsure — don't proceed until I correct you. Then read the transcript at [Notion link] (transcript, not summary) and tell me what it changes."
