# Team Chat — Build Reference (load this to be the build-feedback partner)

> ⚠️ **2026-06-08 — DIRECTION REVERSED to a quick-fire OVERLAY (see `TEAM_CHAT_DECISIONS.md` D22).** The push / top-header-pill / right-side-panel layout described below is SUPERSEDED. Frontend is paused. The **scope** here (lean v0 feature list, what's V1/V2) is still valid; the **layout** is not — entry is now bottom-left-ish, behavior is a content-covering overlay.

> **Fresh session?** Read this + `TEAM_CHAT_DECISIONS.md` (the *why*). Then you're caught up: Miguel sends screenshots of the real build; you cross-check against the v0 checklist + locked direction below and flag what's missing or drifting. You are eyes-and-ears — review, don't rebuild.

## Locked direction (don't relitigate) — UPDATED 2026-06-04 (push, not overlay)
- **Entry = top-header pill**, placed **right of Reservations** (and shrink the account button to just the avatar). NOT a bottom-left dock — *"I'm not expecting any messages from the bottom… so I will miss messages."*
- **Open = right-side panel that PUSHES content aside** (reflow, stays visible — *"it's not over anything, it's not covering anything"*), **expandable to full-screen** and collapse back. NOT an overlay (*"the side rail feels cleaner than an overlay"*), NOT a takeover. Decision read into the 6/3 record: *"a pill in the top header… it pushes everything to the side… ability to make that side panel full screen."*
- **In messaging:** the panel is **either/or** with the guest Conversation Details panel (single shared right slot).
- **IA:** group-list-first; **flat thread** (Slack/Teams "You" style), not bubbles. Group list is **two-tier**: your groups first, then a collapsed **"More groups"** (readable but not badged).
- **Process:** UNBLOCKED 2026-06-04 — Kevin: move forward without SJ's approval (informed decision-makers, ~10 aligned).
- **Decoupled from v0:** left-nav overhaul / collapsible sidebar / full guest+staff *merge* are NOT v0 (would block Langham). v0 ships on existing chrome.
- Prototypes: branch `prototype/team-chat-container`; variants F (dock) and G (overlay) are **dead** — the answer ≈ old **variant B (push) + header-pill + a full-screen mode**.

## The data receipt (use with SJ)
`fact_messages`, US, 30d, 146,953 staff-user-days: **median = 2 msgs / 25-min span (in/out)**; **avg = 6.2 / 3.5-hr span** → a heavy power-user tail that *lives in it*. So compact launcher (the majority) + full command center (the tail). Measures sends, not "open & reading."

## v0 feature checklist — CORRECTED 2026-06-04 against the real PRD (`366814686151807687aff66ab342f797`)
> ⚠️ The prior checklist here over-scoped v0 (it was reconstructed from calls). The PRD scope table is authoritative. **v0 is lean text-only group chat.**

**IN v0 (the Figma must show):**
- [ ] Top-header pill (right of Reservations) → right-side **push** panel → **full-screen** expand/collapse
- [ ] **Group list, two-tier**: your groups first + collapsed "More groups" (readable, not badged)
- [ ] **Active group view**: name + subscriber/member count header · flat message list (cursor-paginated) · **text composer** (no attach/@mention in v0)
- [ ] **All staff READ any group** (visibility ≠ membership)
- [ ] **Admin (property_manager) actions**: create / rename / archive group (kebab + "New group" CTA), add/remove members — *gated; non-admins don't see these*
- [ ] **Staff self join/leave** (a.k.a. subscribe/unsubscribe — copy TBD)
- [ ] **Unread**: top-bar bubble badge (total) + per-group badge (members only)
- [ ] **In-app toast** on new message in your groups (group + sender + truncated body → click opens group)
- [ ] **Empty state** (hotel with no departments → zero groups → "create your first group")
- [ ] Quiet-hours **ignored** (no UI). Auto-seed from departments + Datadog logging = backend (no Figma).

**NOT v0 — do NOT draw these (PRD defers each):**
- @mentions → **V1** · attachments → **V1** (⚠️ Jake verbally "dead in the water"; reconcile — design composer to accept attach later, don't build it) · mobile/push → V1 · presence "set offline" → V1
- read receipts ("Seen by N") → **V2** · edit/delete → V2 · **search** → V2 · broadcast/@channel → V2 · **reactions** → not scoped · private groups → V2 · threaded replies → flat only
- **1:1 DMs DON'T EXIST** — a 2-member group is just a small group (drop any staff-DM list the prototypes showed)

**Open copy/UX decisions for the Figma:** "Subscribe/Unsubscribe" vs "Join/Leave" (PRD open Q) · notification sound (dedicated / none / toggle — open).

## The wedge = ALL V2 (design so it's not blocked, but it is NOT v0)
- **Object cards** (guest/reservation/ticket in a message) · **ticket→message** (towels→Housekeeping) · **AI suggested-post → group** (Jake's "Suggested Team Chat Post") · guest-profile cards in thread · deep-link to a guest thread — per PRD these are **V2 "Awareness/linking + AI capabilities."** The service-ticket loop and cadenced shift-handover/daily-log (Ryan's half) live here too.

## Open threads (flag if a screenshot touches these)
- **Guest+staff merge:** v0 = co-locate + the post-to-dept bridge; the full fused inbox/notification stream is fast-follow (one stream for SLA-guest + ephemeral-staff is a hazard).
- **SKU:** own SKU? Jake yes, Kevin no — gate separately from Messaging regardless. Unresolved.
- **Mobile:** make-or-break for adoption (Andrew); desktop-first v0 is intentional.

## People (for framing)
- **SJ** — decider. Responds to data + engineers + built things, not opinion. Yes-and, ask-don't-assert, let Sudarshan/Mati carry hard "no"s.
- **Jake W** — PM partner; leans right-side-tray-alongside. **Wenjun** — de-facto design lead; floaty-leaning.
- **August** — frontend, building v0. **Langham** — deal contingent on shipping.

## Personas
- **Garden City / Andrew Gee:** many dept groups; WhatsApp+radio+email; loves read receipts; **mobile critical**.
- **HIE Spring Hill / Ryan Cornelius:** one shared **daily log** (OneNote), cadenced/searchable, no mobile; wants guest-card-in-chat + cross-product.

## Resume prompt (paste into a fresh session)
> "Team Chat build-feedback mode. Read `TEAM_CHAT_BUILD_REFERENCE.md` + `TEAM_CHAT_DECISIONS.md`. You're my eyes-and-ears cross-reference as August builds v0 — I'll send screenshots; flag missing/drifting features against the v0 checklist and the locked direction. Review, don't rebuild."
