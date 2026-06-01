# Team Chat — Container Spike (handoff / pick-up-anywhere notes)

**Status as of 2026-06-01:** Reviewed with Jake. **No container direction chosen yet** — A/B/C/D are all built and live for comparison. Next task per Miguel: **"clean up this prototype"** (scope to clarify — see Open Questions).

**Where it lives:** repo `canary-prototype-core`, worktree `../canary-prototype-worktrees/team-chat`, branch `prototype/team-chat-container` (branched off `origin/main`). Run: `PORT=3010 pnpm dev` (from the worktree). Lock file in `.next/dev/lock` may need deleting if "another instance" error.

**What this spike answers:** the *container* question only — how a globally-accessible internal Team Chat panel should enter and coexist with Canary product pages at **1440px** (most users' width). It is NOT the team-chat product; content is realistic-but-static.

---

## The dev harness (not final UI)
A floating **SPIKE HARNESS** (bottom-left, dark card) toggles 4 container variants live + jumps backdrops (Check-in / Messages / Checkout). Reads a tiny zustand store. Remove it (and the whole spike) before anything ships.

### The 4 variants (all product-agnostic, shell-level — except D)
- **A — Overlay layer:** panel floats over the page; reflows nothing; covers content while open. (Salesforce Utility Bar / Messenger.) Demands nothing of any product → cleanest decoupling, but hides content.
- **B — Shell gutter:** reserves a right gutter at shell level; the product reflows into the narrower viewport **by its own responsive rules**. (Slack single-slot.) Verified: on /messages the product *dropped its own Conversation Details panel* and reflowed — product owns the squeeze, as theorized.
- **C — Collapse nav to rail:** collapses the main left nav to a narrow icon rail (`CollapsedNavRail`, structure lifted from the vaporware) so opening chat reclaims the nav's width instead of squeezing the product. (Earlier this was a wrong "full-hide" — now a real icon rail.)
- **D — Toolbar → sidebar (messaging-specific):** removes the messaging top toolbar (`SubNav`) and compresses Inbox/Archived/Blocked + search + new-message into the thread-list column header (`CompactInboxHeader`, vaporware pattern). This is a *messaging layout cleanup*, a different axis from A/B/C — exposed as an option per Miguel's request. NOTE: omits the vaporware's filter icon button (trivial to add).

---

## Decisions LOCKED (don't relitigate without reason)
- Team Chat = **contextual coordination layer**, not a general chat app. Differentiation = it knows about Canary objects (guests/reservations/tickets/upsells).
- **Header pill** entry (`CanaryAppShell` `headerActions`, beside the user profile) → global slide-in panel across every product. Pill confirmed available; Wenjun independently put team chat in the header too.
- **Group-list-first** IA (list → tap group → flat thread → back), NOT a dropdown. Scales to many department groups + cross-group unread triage.
- **Flat thread** rendering (Slack/Teams style, "You" label), NOT chat bubbles. Reads as an ops log; AI auto-posts + object cards sit cleanly.
- **Team Chat must be ONE consistent global thing** across all products (and a sellable SKU). REJECTED: per-surface "tab between Guest Profile and Team Chat" — it breaks consistency and conflates guest-context (one guest) with team-coordination (departments). (Miguel's catch.)
- **Acknowledge / confirm-read REMOVED** — redundant; passive "Seen by N" is enough.
- **Object/guest cards = v1, NOT v0.** They're in the spike thread as illustrative content only.
- Right rail and a persistent footer bar (old "D") were both KILLED (sandwich problem / composer collision).

## The core unresolved fork (the collision)
The real container tension is **Team Chat vs. the product's OWN right-side panel** (messaging's Conversation Details behind the "i"; check-in's detail panel), not team-chat-vs-the-page. At 1440 that risks `nav | list | thread | details | chat` = 5 regions. The value of team chat ("reference the guest while coordinating") *wants* both visible, but that's exactly the squeeze. **The fork (still undecided after Jake):**
1. Team chat coexists *simultaneously* with the product panel → real multi-panel system, aggressive nav/list collapse (variant C is a step toward this).
2. Team chat is a *mode* that takes a single shared right slot, swapping with the product's panel, leaning on **object-cards to carry context** so you don't need both open. (Jake's implicit bet.)
- Mitigating facts: object-cards are v1 and staff-ops chat rarely needs the guest's full details open, so the squeeze pressure is largely a v1+ concern. v0 default `nav|list|thread|chat` (4 regions) is fine; the opt-in 5th region is a rare deliberate state.
- Don't build the speculative **3-panel-always-on** messaging (always-on Guest Profile) — Miguel: "no reliable argument" to execute it. If it ever ships, IT owns the coexistence (likely a tabbed right-context slot, Intercom-style).

---

## File map (all spike code)
**lib/products/team-chat/**: `types.ts` (Group/ChatMessage/ObjectCardRef), `spike-store.ts` (zustand: variant A|B|C|D, panelOpen, view list|thread, activeGroupId; `VARIANT_META`), `mock-data.ts` (5 groups: Front Desk/Housekeeping/Maintenance/Valet/Announcements; messages on canonical guests).
**components/products/team-chat/**: `TeamChatPill.tsx` (header pill + unread), `TeamChatPanel.tsx` (group-list + flat thread + composer), `TeamChatContainer.tsx` (A/B/C/D positioning; isFloat = A||D), `TeamChatSpikeRoot.tsx` (wraps children; right push for B/C, left rail pad for C; mounts container + switcher + rail), `VariantSwitcher.tsx` (dev harness), `ObjectCard.tsx` (guest/reservation/ticket card), `SuggestedTeamChatPost.tsx` (the "Post to Front Desk" card), `CollapsedNavRail.tsx` (C's icon rail).
**Wiring:** `app/(dashboard)/layout.tsx` (pill in headerActions; `hideSidebar` when C+open; wraps children in `TeamChatSpikeRoot`). `components/products/messaging/`: `AppLayout.tsx` (gate `SubNav` off when D), `CompactInboxHeader.tsx` (D's compressed header), `ThreadView.tsx` (renders `SuggestedTeamChatPost` for John Smith's thread). `app/(dashboard)/messages/page.tsx` (renders CompactInboxHeader in thread-list column when D).

## Commit trail (branch prototype/team-chat-container)
- `70492eea` initial A/B/C/D harness
- `53ebc062` v0 revision: group-list-first + flat thread (A/B only)
- `dc3216ed` boosters + variant C nav-reclaim (suggested-post, acknowledge, C hide-nav)
- `08bb9830` Option D (toolbar→sidebar); dropped acknowledge; flagged C
- `9590108e` variant C = real collapsible icon-rail

---

## Jake's parallel build (reference)
`https://canary-team-chat-demo.vercel.app/messages` (Vercel pwd: `likethebird`). Same header-pill direction. His bets: single shared right slot (Team Chat replaces Conversation Details) + **collapse left nav to icons** + **group-list-first** tray (Your Groups/Other Groups, AI summaries, @mention, mute) + an inline **"Suggested Team Chat Post"** in the guest thread (we poached this). Vaporware 3-panel messaging: `https://canary-messaging-vaporware.vercel.app/messaging` (same pwd) — collapsed icon nav + triaged inbox + always-on AI Guest Profile. Repo local at `~/Documents/Claude-Projects/canary-messaging-vaporware` (collapsible sidebar in `components/messaging/AppLayout.tsx`).

## Feature roadmap (captured, not built)
- **v0 table-stakes still missing:** @mentions, **attachments** (Jake: "dead in the water" without — riskiest PRD cut; arguably v0 not fast-follow), notifications + per-group mute, search, reactions, group membership + on-shift presence.
- **v1 wedge (why it beats WhatsApp):** the **service-ticket loop** (guest texts "towels" → AI ticket → posts to Housekeeping group → claim/resolve → status syncs → kills the radio); AI **suggested-post → group**; **cadenced shift-handover / daily-log + digest** (Ryan's half, under-served — Announcements ≠ structured handover); cross-product "share to team chat".
- **Open product threads:** SKU question (Jake wants own SKU, Kevin disagrees — gate separately from Messaging regardless); the **staff/mobile app** is the make-or-break for adoption (Andrew) but desktop-first v0 is intentional; D's filter-icon parity with vaporware.

## Discovery source-of-truth
- Garden City Hotel (Andrew Gee, Dir Front Office): WhatsApp dept groups + radio + email; loves read receipts; many departments; mobile critical.
- HIE Spring Hill (Ryan Cornelius): OneNote single shared **daily log** (cadenced, searchable, no mobile); wants cross-product chat + guest-card-in-chat; HotelKey PMS.
- Notion PRD: "Team Chat — Internal Staff Group Messaging" (Jake). Research workflow surfaced 52 comparable products (Hotelkit, Quore, Beekeeper, Deputy, Intercom, Slack, Front, Salesforce Utility Bar, Zello, etc.) — full notes in Claude memory `team-chat-design-tasks.md`.

## Open questions for "clean up" (clarify with Miguel)
"Clean up this prototype" is ambiguous — candidates: (a) remove the dev harness + dead variants and commit to ONE container as a clean baseline; (b) tidy/refactor code (extract shared bits, remove the spike scaffolding markers) while keeping all 4 toggles; (c) polish the visual fidelity of the panel/cards. Since no direction was chosen, (b) — make it a clean, well-organized baseline that keeps A/B/C/D selectable — is the safest read, but CONFIRM before deleting variants.
