# Email Product Inventory

> **Purpose:** Single source of truth for the Email prototype. Any Claude Code session — from this repo or a fork — should read this before touching email code. Written as Jason's (eng) reference.
> **Branch:** `demo/email-channel`
> **Last updated:** 2026-07-16

---

## 1. Product Overview

Email is Canary's guest-facing email channel, modeled as **its own top-level side-nav item** inside the design team's NEW app-shell paradigm (Wenjun's nav/header redesign, SJ-approved 2026-07-13). It is NOT a tab inside Messaging and NOT a channel selector — it is a first-class surface with its own route, its own shell, and its own data layer.

The surface is a Gmail-register inbox for a single hotel (The Statler): a two-column reading layout (thread list | thread view) with an Inbox/Archived split, functional search, reply sending, archive, and a pushable/drawer Email Info sidebar. It ships with ~14 seeded inbox threads + 3 archived threads, each auto-linked to a canonical guest by sender address.

The defining data decision is **sender ≠ linked guest**: the email's From identity (`senderName` / `senderEmail`) is distinct from the auto-linked canonical guest profile (`linkedGuestId`). The thread list and header show the SENDER; the message block inside the read pane shows the LINKED GUEST name + loyalty tag. Auto-link is by sender address, so the two identities may differ (married name, nickname, partner's email) — this is deliberate, matching Rachel's prototype and the Figma, not a mock-data bug.

This prototype is the demo vehicle for a customer Loom. Phase 1 (this branch) is UI + core behaviors; AI-forward material (Copilot pill, AI draft-reply, New-message compose) lives on the AI fork — see §4.

**Figma source:** "Email Channel" file `tdhETyoiw4FLlMBzpQn9TD`, node `12:412` (extracted 2026-07-16).
**Spec / decisions:** `EMAIL_CHANNEL_SPEC.md` (repo root) — build spec, Figma measurements, and the Phase 2a Email Info Sidebar spec.

---

## 2. What's Built in the Prototype

### 2.1 Route & Shell

**Route**
- `/email` — `app/email/page.tsx` renders `<EmailSurface />`. Standalone route group with its OWN `app/email/layout.tsx`.
- The layout is the custom new shell: `NewSidebar` (240px rail) + a content column with `NewTopBar` over the page. It deliberately does NOT use the legacy `app/(dashboard)/` `CanaryAppShell` paradigm — other routes stay on it.

**NewSidebar** — `components/products/email/shell/NewSidebar.tsx`
- Custom 240px navy (`#375492`) rail for the new shell (the library's `CanarySidebar` renders the OLD design). Uses library color tokens + `@mdi` outline icons.
- Hotel selector (property code + name), three nav groups (Communications / Guest Management / Records), bottom sticky block (20%-opacity Canary logo, Team Chat pill, user/settings/support row).
- Email is the ACTIVE item (white pill, no-op). Messages / Calls / Check-in / Checkout route to their legacy shells; everything else is inert.
- **Email nav badge is DERIVED** from the store's unread inbox count (`threads.filter(isUnread && status==='inbox').length`), `undefined` when zero. No hardcoded number — it bumps live as mail arrives.

**NewTopBar** — `components/products/email/shell/NewTopBar.tsx`
- 52px white header: page title left, the Copilot pill centered over the content column (gated behind `SHOW_COPILOT = false` on this baseline), Insights / "guest messages today" cluster right. All inert in Phase 1.

### 2.2 Email Surface

**EmailSurface** — `components/products/email/EmailSurface.tsx`
- The page content: a Search + CTA row over a two-column body (`EmailThreadList` | `EmailThreadView`), with `EmailInfoSidebar` always mounted (renders as a push column or a fixed drawer depending on style), and the `PrototypeVariantToggle` floating control.
- Search field is functional (writes `searchQuery` to the store). New-message compose is OUT of MVP — removed from this baseline (returns on the AI fork).

**EmailThreadList** — `components/products/email/EmailThreadList.tsx`
- Left column. Inbox/Archived segmented control (local, functional toggle) + a scrollable thread-list card.
- Filters by `searchQuery` (sender name, linked guest name, subject, body/preview) and renders `EmailThreadListItem` rows in recency order (newest `lastActivityAt` first).

**EmailThreadListItem** — `components/products/email/EmailThreadListItem.tsx`
- One row: 32×32 initials avatar, SENDER name + relative date (`formatThreadListDate`), subject (1-line ellipsis), preview (1-line ellipsis). Selected = blue bg + border; unread = bolder treatment.

**EmailThreadView** — `components/products/email/EmailThreadView.tsx`
- Right column read pane. Header shows SENDER identity (`SenderName - email` + subject) and an always-visible action group (Archive button + info toggle; kebab dropped until there's a menu).
- Message feed: Gmail-register FLAT message blocks (not chat bubbles), grouped by calendar day with TODAY/YESTERDAY/date dividers. Inbound blocks show the LINKED GUEST name + loyalty `CanaryTag`; outbound blocks show the staff name (`Theresa Webb`).
- **Auto-scroll:** an `endRef` + `useEffect` keyed on `[messages.length, selectedThreadId]` scrolls the feed to the bottom on thread switch AND on any new message (including live-simulated inbound to the open thread).
- Renders `EmailComposer` at the bottom.

**EmailComposer** — `components/products/email/EmailComposer.tsx`
- Adapted from `components/products/messaging/MessageComposer.tsx`, stripped to the email variant: auto-growing textarea + paperclip (decorative) + Send only (no AI toggle / translate / templates). New 6px/12px-radius dashboard style. Send disabled until text entered; Enter sends, Shift+Enter newlines. `onSend` → `sendReply`.

**EmailInfoSidebar** — `components/products/email/EmailInfoSidebar.tsx` (Phase 2a)
- A PORT of Messaging's `GuestInfoSidebar`. Two presentation styles chosen via the prototype toggle: **PUSH** (third body column; thread list collapses 434→334) or **DRAWER** (Messaging's actual mechanic — fixed to the right screen edge, translate-x slide-in). Toggled by the thread header's info icon (which gets a pressed/active state while open).
- Sections: **Email identity** (sender + auto-link mapping to the canonical guest with an AUTO-LINKED badge; "No linked guest" state for unlinked threads like Rebecca Nolan) · **Participants** (From/To/CC, display-only; Nina Ashford's thread carries a CC to plant the answer to Jake's DSN-1775 CC question) · **Linked Reservation** (ported table anatomy + AUTO-LINKED badge — settled cross-project shape, not redesigned) · **Assignment** (Assign Staff or Department) · **Scheduled Guest Journey Messages** + "View channel statuses" link · **Open conversation** cross-channel jump → `/messages`.
- Deliberately OUT of v1: Call History, Service Tasks.

**PrototypeVariantToggle** — `components/products/email/PrototypeVariantToggle.tsx`
- Floating bottom-right "decide-in-the-room" control. Collapses to a pill; expands to a card with:
  - **INFO PANEL** radio group — Push vs Drawer (`infoPanelStyle`).
  - **DEMO** section — "Simulate incoming email" button (inbox-arrow-down icon) that fires `simulateInboundEmail`, with a live "N left" / "none left" counter and disabled state when the scripted queue is exhausted.

### 2.3 Functional Behaviors

| Behavior | Where | Notes |
|---|---|---|
| Inbox/Archived view toggle | `EmailThreadList` → `setView` | Auto-selects the most recent thread in the target view |
| Search | `EmailSurface` → `setSearch` | Filters list by sender name, linked guest name, subject, body/preview |
| Select thread | `selectThread` | Opens in read pane, clears draft, marks read (invariant: open thread is never unread) |
| Send reply | `EmailComposer` → `sendReply` | Optimistic; appends an outbound block, bumps `lastActivityAt` + preview |
| Archive | thread header → `archiveThread` | Moves to Archived, marks read, auto-selects next inbox thread |
| **Simulate inbound** | prototype toggle → `simulateInboundEmail` | Demo control; delivers the next scripted inbound (see §3.3) |
| Info panel push/drawer | prototype toggle → `setInfoPanelStyle` | Live style switch |
| Info panel open/close | thread header info icon → `toggleInfo` | Icon shows pressed/active state while open |
| Unread conventions | store-level `markThreadRead` | Unread lives on the thread; the open thread is force-read; the sidebar badge derives from unread inbox count |

---

## 3. Data Model

All email data lives in `lib/products/email/`.

### 3.1 Types — `lib/products/email/types.ts`

```typescript
type EmailDirection = 'inbound' | 'outbound';
type EmailView = 'inbox' | 'archived';
type EmailStatus = 'inbox' | 'archived';

interface EmailMessage {
  id: string;
  threadId: string;
  direction: EmailDirection;
  body: string;            // plain text, \n\n paragraphs
  sentAt: Date;
  staffName?: string;      // outbound only
}

interface EmailParticipant { name: string; email: string; }

interface EmailThread {
  id: string;
  senderName: string;      // From display name — what list + header show
  senderEmail: string;
  subject: string;         // "Re: ..." inherited
  linkedGuestId?: string;  // canonical guest auto-linked BY SENDER ADDRESS — may be undefined
  status: EmailStatus;
  isUnread: boolean;
  lastActivityAt: Date;
  preview: string;         // one-line list preview
  cc?: EmailParticipant[]; // thread-level; feeds the Info sidebar's CC row
}
```

**Sender ≠ linked guest:** `senderName`/`senderEmail` (the From identity) are distinct from `linkedGuestId` (the canonical guest profile). List + header render the sender; the read-pane message block renders the linked guest + loyalty tag. Auto-link is by sender address, so they may differ — deliberate. One thread (Rebecca Nolan, events inquiry) is intentionally UNLINKED to plant the unlinked story.

### 3.2 Store (Zustand) — `lib/products/email/store.ts` — `useEmailStore`

**State:**
| Field | Type | Purpose |
|---|---|---|
| `threads` | `EmailThread[]` | All threads (inbox + archived) |
| `messages` | `Record<string, EmailMessage[]>` | Messages keyed by threadId, chronological ascending |
| `selectedThreadId` | `string \| null` | Open thread; auto-set to the most recent inbox thread on load |
| `view` | `EmailView` | Active list view |
| `searchQuery` | `string` | Thread search filter |
| `draft` | `string` | Composer draft (cleared on select/send) |
| `isInfoOpen` | `boolean` | Email Info sidebar visibility |
| `infoPanelStyle` | `'push' \| 'drawer'` | Info panel presentation |
| `inboundQueueIndex` | `number` | Progress through the simulate-inbound demo queue |

**Actions:** `selectThread` · `setView` · `setSearch` · `setDraft` · `archiveThread` · `sendReply` · `toggleInfo` · `setInfoOpen` · `setInfoPanelStyle` · `simulateInboundEmail`.

**Derived invariants (no hardcoded state):**
- Initial `selectedThreadId` = most recent inbox thread (matches the list's top row).
- `markThreadRead` enforces "the open thread is never unread" — applied on load, `selectThread`, and `setView`.
- The sidebar badge is derived at render time from the unread inbox count — never stored.

### 3.3 Simulate-inbound demo queue

`simulateInboundEmail()` delivers the NEXT item from a fixed 3-item script (`INBOUND_SCRIPT` in `store.ts`), timestamped `new Date()` at delivery. `INBOUND_QUEUE_LENGTH` is exported for the control's counter.

1. **Reply** to Sarah Martinez's late-checkout thread (`email-sarah`) — a thank-you + one follow-up ("...could we also store our bags after checkout..."). Bumps to top; goes unread unless it's the open thread.
2. **New thread** (`email-sim-sophia`) from a fresh sender (Sophia Anderson) auto-linked to canonical guest **`guest-sophia`** (Sophia Anderson, GOLD ELITE) — a plausible pre-arrival shuttle request. Lands at top, unread, badge bumps.
3. **Reply** to Brooklyn Carter's billing-dispute thread (`email-brooklyn`) — the escalation beat ("Sorry to push — could I get an update today?...").

**Queue mechanics:** index-based, **does NOT cycle — it stops when exhausted**. On exhaustion the control disables and shows "none left"; it resets only on a full page reload. Each delivery re-inserts the thread into the inbox (in case it was archived), sets `lastActivityAt = now` (so the list re-sorts to top automatically), updates the preview, and marks unread unless the thread is the one currently open (respecting the "open thread is never unread" invariant). New threads are appended to `threads`; replies append to `messages[threadId]` (so the open thread's feed grows → the `endRef` effect keyed on `messages.length` fires → auto-scroll).

### 3.4 Mock data — `lib/products/email/mock-data.ts`

- `mockThreads` — ~14 inbox + 3 archived threads. Timestamps are REBASED at module load (offsets from `new Date()`) so the newest activity is always "today" and the feed dividers stay truthful. Two threads (Brooklyn's billing dispute, James's folio question) span multiple calendar days on purpose.
- `mockMessages` — `Record<threadId, EmailMessage[]>`. Several threads carry a short inbound + staff-reply history so clicking around feels alive; one archived thread seeds the Archived tab.
- Sender display names USUALLY differ from the linked canonical guest (to exercise sender ≠ guest); a few match exactly (Sarah Martinez, James Chen, Priya Sharma) so the pattern doesn't read as a gimmick. Loyalty tiers are read live off the canonical guest in the UI — the mock never re-states a tier.

### 3.5 Date helpers — `lib/products/email/date-utils.ts`

`formatThreadListDate` (today → time, yesterday → YESTERDAY, else "MMM d"), `formatDayDivider` (TODAY / YESTERDAY / "MMM d" for feed dividers), plus re-exported `isSameDay` / `startOfDay`. All rely on the mock's rebased timestamps.

### 3.6 Connection to canonical data

- Threads store `linkedGuestId` → canonical `getGuest(id)` (`lib/core/data/guests.ts`). Display name, loyalty `statusTag`, avatar, and reservation data all derive from the canonical guest at render time — the email product never duplicates guest data.
- The Email Info sidebar reads reservations via `getGuestReservations` for the Linked Reservation section.
- The new-thread demo item uses `guest-sophia` (a canonical guest not otherwise used in the email inbox).

---

## 4. Not in MVP / Lives on the AI Fork

These are deliberately absent from this baseline (`demo/email-channel`). AI-forward material was pulled per Miguel + eng sync (7/16) so the customer Loom leads with the channel, not the AI. They return on the AI-features fork.

- **New message compose** — the "New message" CTA and compose flow are removed from `EmailSurface` on this branch. Unlinked-sender manual linking is also deferred.
- **AI draft replies** — the Copilot pill → draft-appears-in-composer moment (Rachel's future-sell). Not wired; `EmailComposer` has no AI affordances.
- **Copilot pill** — present in `NewTopBar` but gated behind `SHOW_COPILOT = false`. The AI fork flips it true to bring the gradient "N items need attention" pill back.
- **Insights** — the top-bar Insights / "guest messages today" cluster is decorative (no analytics view).
- **Info sidebar depth** — Call History and Service Tasks are intentionally out of the Info sidebar v1 (voice noise on an email surface / defer until asked).
- **Attachments** — the composer paperclip is decorative.

---

## 4a. AI Features (this fork — `demo/email-channel-ai`)

> This branch is the AI fork of the frozen baseline: the "future sell" build for a churn-risk customer. The agreed AI stance is **draft-only, never auto-send** — AI writes a reply into a review card; staff review/edit/Send. Everything in §4 above is deliberately absent from the baseline but present here, EXCEPT the top-bar Copilot pill, which stays hidden (see below).

### The AI draft-reply card — `components/products/email/AiDraftCard.tsx`

The star of the fork. A review card that sits ABOVE the composer inside `EmailThreadView`, carrying the AI visual language on this build (electric-blue `#465FF5` border, faint `shellTokens.copilotTint` over white, gradient "Suggested reply" label with the `mdiWaveform` icon).

- **Title copy:** "Suggested reply" (not "Copilot suggested reply") — verb-honest, hotelier-readable, and avoids over-claiming a persistent-assistant surface that's deliberately hidden here.
- **Micro-reassurance line:** "Review before sending — nothing is sent automatically." (small/muted) makes the never-auto-send promise legible.
- **Grounding chips** (the differentiator): below the draft body, muted source chips showing what the reply is grounded in — the linked reservation (`Reservation · Room N · dates`, from canonical `getGuestReservations`), the guest's loyalty tier (from `getGuest().statusTag`), and one static property-policy chip per thread (from `ai-drafts.ts`, e.g. "Policy · Luggage storage", "Folio · Nov 21 charge"). Unlinked threads (Rebecca) show no reservation/tier chip — only the policy chip.
- **Footer actions:** **Use draft** (primary — lands the text in the composer) · **Shorten** (directed transform → the scripted ~2-sentence variant; disabled once short) · **Regenerate** (cycles the two full variants). **Thumbs up/down** (right-aligned, `mdiThumbUpOutline`/`mdiThumbDownOutline`, messaging-feedback style): mutually exclusive per draft variant — re-clicking the selected thumb clears it; selected = `colorBlueDark1` icon on a `colorBlueDark5` (rounded-4) chip. Purely local (`entry.feedback: 'up' | 'down'`), cleared automatically on Regenerate/Shorten (the variant changed). Thumbs-down reveals a muted one-line note under the footer — *"Thanks — Theresa's edits teach the AI your voice."* — tying the signal to the voice-learning story. No network.
- **Detected intent → suggested action** (prototype, **default-off** toggle — see below): when the *Intent actions* toggle is ON, eligible `ready` cards with an authored `intentAction` show ONE extra row between the grounding chips and the footer: a `mdiLightningBoltOutline` glyph + muted intent label (Medium 11) + `→` + a compact outline action button (1px `#465FF5` border, rounded-6). Clicking flips it locally (per thread) to an *Added* checkmark chip (`mdiCheck` on `colorBlueDark5`). Authored for four threads only — Sarah (late checkout → "Offer Late Checkout · $40"), Nina (anniversary → "Add champagne amenity task"), Brooklyn (billing dispute → "Create folio adjustment task"), Sophia (shuttle → "Book 3:30 PM shuttle"); all other cards show nothing.
- **Generating state:** ~1.2s "Drafting a reply…" with shimmering gray placeholder lines (`.email-draft-shimmer-line` in `globals.css`, pure CSS). Transforms (Regenerate/Shorten/restore) use a ~0.8s shimmer.
- **`AiOrbButton`** (same file): the on-demand / re-summon affordance — an animated "Siri-orb" pill (gradient border + a rotating/breathing CSS orb + gradient "Draft a reply" label) that lives in the composer toolbar **immediately left of Send**. Self-gating: shown whenever the open thread is draft-eligible and no live card is on screen (status undefined / `dismissed` / `used`); hidden when a card is `ready`; stays visible in a disabled "Drafting…" state while `generating` (the orb doubles as the loading indicator). Orb CSS is in `globals.css` (`.ai-orb*`).

### Draft lifecycle & eligibility

- A thread is **DRAFT-ELIGIBLE** when its most recent message is inbound (guest awaiting a reply). The card only renders for eligible threads.
- **On-demand mode** (default): no auto shimmer; the composer's **Draft a reply** orb generates on click. Clicking maps to the right store action for the current state — `generateDraft` (no entry) · `restoreDraft` (`dismissed`) · `forceGenerateDraft` (`used`). When a **simulated inbound arrives on the OPEN thread**, the card force-drafts for the new message — the demo money shot fires in on-demand too (explicit presenter action, not ambient auto-drafting).
- **Auto mode:** selecting an eligible thread with no cached draft → generating → draft. Cached per thread (`no re-shimmer on revisit`). When a **simulated inbound arrives on the OPEN thread**, the card force-regenerates for the new message. Switching **to on-demand** clears any live (`generating`/`ready`) cards so the orb takes over; `used`/`dismissed` history is kept.
- **Use draft** → text lands in the composer (editable), card → `used` (disappears); the orb returns for re-summon.
- **Dismiss (X)** → card → `dismissed`; the composer's orb re-summons it (`restoreDraft`).

### Draft-application mechanism (composer hand-off)

`EmailComposer` stays locally stateful (its own typed text). "Use draft" fires a one-shot store signal `draftApplication: { threadId, text, seq }`; the composer applies it when the signal targets its `threadId` and the monotonic `seq` is newer than the last it applied (an `appliedSeq` ref that persists across thread switches, so revisiting a thread never re-injects an old draft). The composer also resets its text on `threadId` change. This lands the draft **and enables Send** without lifting composer state into the store.

### Store additions — `lib/products/email/store.ts`

- State: `aiDrafts: Record<string, { variantIndex; isShort; status: 'generating'|'ready'|'dismissed'|'used'; feedback?: 'up'|'down' }>` · `aiDraftTrigger: 'auto'|'on-demand'` · `draftApplication` signal · `showIntentActions: boolean` (default `false`) · `intentActionsDone: Record<string, boolean>`.
- Actions: `generateDraft` (cache-guarded) · `forceGenerateDraft` (re-shimmer over a cached entry; used by simulate on the open thread) · `regenerateDraft` (cycles variants) · `shortenDraft` · `dismissDraft` · `restoreDraft` · `useDraft` · `setAiDraftTrigger` · `setDraftFeedback` (mutually-exclusive thumbs toggle) · `setShowIntentActions` · `markIntentActionDone`.
- `feedback` lives on the draft entry so it clears for free when the entry is rebuilt (Regenerate/Shorten/(re)generate construct a fresh entry with no feedback field). `intentAction` lives on the scripted `AiDraft` in `ai-drafts.ts` (four threads only).
- Timers are `setTimeout` inside actions, guarded by a module-level per-thread generation token so a superseding click never gets clobbered by an earlier timer.

### Scripted content — `lib/products/email/ai-drafts.ts`

Hand-authored (no live LLM, deterministic demo). Keyed by thread ID; covers every inbox thread AND the three simulate beats (`email-sarah` bag-storage follow-up, new `email-sim-sophia` shuttle request, `email-brooklyn` $45 escalation). Each entry: two full `variants` (staff voice, sign-off "Theresa", specific to the guest's actual question), a `short` variant, and a static `policyChip`.

### Prototype toggle & New message

- `PrototypeVariantToggle` gains an **"AI drafts"** radio group (Auto / On demand; **default On demand**) and an **"AI actions"** section with a single **Intent actions** checkbox (**default OFF**) that flips `showIntentActions` — the cheap in-room switch for the lukewarm detected-intent → suggested-action exploration.
- The **New message** button returns right of the search field in `EmailSurface` (no "FUTURE" tag — this branch is the future). No-op click.

### Copilot pill stays hidden — by design

`NewTopBar.tsx` keeps `SHOW_COPILOT = false` on this fork (the designer calls it a secret feature). The AI visual language lives in the draft card instead, not the top bar.

---

## 5. Component Map

```
app/email/layout.tsx  (EmailLayout — new shell)
├── NewSidebar            (240px navy rail; Email active; badge = unread inbox count)
└── content column
    ├── NewTopBar         (title · Copilot pill [gated off] · Insights cluster)
    └── app/email/page.tsx → EmailSurface
        ├── Search + CTA row            (search functional; New message removed)
        └── body (flex)
            ├── EmailThreadList
            │   ├── Inbox/Archived segmented control
            │   └── EmailThreadListItem  ×N   (sender, date, subject, preview, unread)
            ├── EmailThreadView
            │   ├── Header  (sender identity, Archive, Info toggle)
            │   ├── Message feed  (day dividers + flat MessageBlock ×N; endRef auto-scroll)
            │   └── EmailComposer  (textarea, paperclip, Send)
            └── EmailInfoSidebar  (push column OR drawer)
                ├── Email identity  (sender → linked guest, AUTO-LINKED / no-link)
                ├── Participants    (From / To / CC)
                ├── Linked Reservation  (ported table + AUTO-LINKED badge)
                ├── Assignment
                ├── Scheduled Guest Journey Messages
                └── Open conversation  → /messages

        PrototypeVariantToggle  (floating: INFO PANEL push/drawer + DEMO simulate-inbound)
```

---

## 6. How to Add a Feature

1. **Read first** — `EMAIL_CHANNEL_SPEC.md` (root) for Figma measurements + architecture decisions, and `AI_REFERENCE.md` for the component library.
2. **Types** — add to `lib/products/email/types.ts`.
3. **Mock data** — `lib/products/email/mock-data.ts` (keep timestamps on the `dayAt` rebasing helper; use canonical guest IDs, don't invent guests).
4. **Store** — add state + action to `lib/products/email/store.ts` (declare the interface field first, then implement in `create()`).
5. **Components** — `components/products/email/` (shell pieces in `components/products/email/shell/`). Reuse library enums/tokens/`CanaryTag`; override the old radius via className rather than forking components. Don't use `CanaryAppShell`/`CanarySidebar` here — they render the old paradigm.
6. **Canonical data** — always via `getGuest` / `getGuestReservations`; never hardcode guest data in components.
