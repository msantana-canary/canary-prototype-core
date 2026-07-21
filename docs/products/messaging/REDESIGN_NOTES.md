# Messaging Redesign — Build Notes (branch `demo/messaging-redesign`)

> Source of truth: Figma **"Scheduled Messages List"** file `9R9OxMQwfc7XcoaQwvRPdm`, frame **"Messaging"** node `29-2099`.
> SJ verbally accepted the Messaging top-level redesign; this branch pressure-tests the internals.
> Scope: the product surface INSIDE the container only — the legacy `CanaryAppShell` stays for now
> (the Figma's navy 240px rail + 52px header are the new AppShell, deliberately NOT built here;
> that lands as a component-level fix later).

## Sidebar v2 — grouped cards (2026-07-20)

The Conversation Details sidebar (`GuestInfoSidebar`) is reframed as a **verification aid**:
"did the guest-journey messages send, and on which stay did something break?"

- **Phone-grouping rule (load-bearing):** stays are grouped by the **auto-link fact**
  (guest phone === thread phone) — **NEVER by asserted person identity**. Sudarshan's identity
  constraint is respected: Canary can't tell two humans sharing a phone from one human with a
  nickname, so names are **never collapsed across stays**. On a stay row the guest name renders
  **only if it differs** from the card-header name (the shared-phone edge).
- **Linked Reservations moved to the TOP** — it's the star of the panel now. Section order is
  (1) Linked Reservations, (2) Assignment, (3) Service Tasks, (4) Call History.
- **Contact Number card removed** — the phone folds into the **primary card** as its anchor
  (phone icon + number under the guest name).
- **Cards, not a table.** One **PRIMARY card** holds *all* auto-linked stays: header = current
  guest name + green **AUTO-LINKED** outline tag (`CanaryTag` OUTLINE/SUCCESS/COMPACT, the
  provenance signal) + the thread phone; body = one **stay row** per auto-linked reservation,
  sorted **in-house → upcoming (soonest first) → past (most recent first)**. Dates are the most
  prominent field (the disambiguator); room shows when in-house; a small 10px uppercase state
  label (IN-HOUSE / UPCOMING / PAST) derives from `reservation.status`. Auto-linked stays have
  **no unlink** — they're facts, production hard-blocks it. Each manually-linked entry gets its
  own **SECONDARY card** with a gray "Linked by staff" caption (the assertion signal) and a kebab
  → "Unlink reservation" (wired to the existing `onUnlinkReservation` flow).
- **GJ scheduled-message status line** (per stay row, visual-only): a small mock map
  `gjMessageStatus` in `lib/products/messaging/mock-data.ts` keyed by reservation id
  (`{delivered, failed, scheduled}`). **Failures are the loudest thing in the card** — `failed > 0`
  renders a **red** line (`colorRed1` #E40046) with an alert icon: "N message(s) failed to send"
  ("something went wrong" is the #1 triage signal). Otherwise a quiet 12px `colorBlack3` line:
  "✓ D delivered · S scheduled". **No click behavior / detail modal yet — deferred to a later pass.**
- **440px both mechanics:** the push wrapper animates width 0↔440; the drawer is fixed 440 (both
  bumped from 360/400). The push/drawer `PrototypeVariantToggle` behavior is unchanged.
- **Demo data — the "Johnny" scenario (thread '14'):** John Smith (`guest-john-s`) now has **three**
  auto-linked stays — a past solo work trip (`res-john-feb-past`, Feb 3–5, checked-out), the current
  in-house stay (`res-john-jul`, Jul 13–15, room 504), and a future stay (`res-john-sep`, Sep 22–25,
  upcoming). Same guest = same phone (+16507665555) → all three auto-link. James Brady / Ethan Parker
  / Liam Carter remain manually-linked secondary cards. `res-john-jul` carries `failed: 1` so the red
  state is demoable. New reservations are **additions only** to `lib/core/data/reservations.ts` (no
  existing entries modified — safe for other products' typecheck).

> ⚠ Vestigial note carried from v1: the "Auto-linked badge" rationale predates the badge's own
> removal in the row list; here AUTO-LINKED lives on the primary card header as provenance, not in
> thread rows.

## Sidebar v3 + layout (2026-07-21)

Five changes this pass — the panel mechanic, the linked-guests presentation, the stays table
default, the column proportions, and the collapsed views.

- **Panel mechanic v3 — FLOATING PANEL (replaces BOTH push and drawer; now THE mechanic).**
  Conversation Details is a **fixed, floating white card** on the right: **400px** wide, `rounded-[12px]`,
  1px `colorBlack6` border, large soft shadow (`0 12px 32px rgba(0,0,0,0.12)`), inset from the window
  edges — **top 72 / right 16 / bottom 16** so it floats *below* the 56px legacy shell header — with
  internal `.scrollbar-invisible` scroll. Slides + fades in on open (`translate-x` + opacity, ~250ms).
  A subtle **scrim** (`rgba(0,0,0,0.10)` over the viewport below the shell header) fades in behind it
  and **closes the panel on click**. The old `infoPanelStyle`/`setInfoPanelStyle` store state, the
  `PrototypeVariantToggle` component (deleted), and the push/drawer branches are all **gone**. The
  info-button pressed state + close behaviors are unchanged.
- **Linked guests are a CAROUSEL (not a vertical stack).** One guest card per slide: slide 1 = the
  primary phone-grouped card (unchanged content model), slides 2+ = each "Linked by staff" guest.
  Nav = left/right **chevron arrows + centered dots**; arrows disable at the ends (no wrap), dots are
  clickable. **Failure-visibility rule:** a *hidden* slide whose guest has any GJ status with
  `failed > 0` renders its **dot red** (`#E40046`) instead of gray (`colorBlack5`) — failures stay
  loud even off-screen (active dot is always `colorBlueDark1`). Demo: on slide 2, dot 1 goes red
  (John's in-house stay carries the failure). The "+" link + refresh buttons stay in the section header.
- **Stays table default = CURRENT + UPCOMING; the rest expands.** The primary card's mini-table shows
  only **in-house + upcoming** stays by default; **past** stays collapse behind a small
  "**Show N more stays**" text button (`colorBlueDark1`, 12px) at the table bottom → "**Show fewer**"
  to collapse. Per-row expandable details are unchanged.
- **% widths for list + convo.** The thread-list column is **35%** and the thread view **65%** of the
  content row (flex-basis percentages + `min-w-0`, replacing the fixed 434px). With the floating panel
  there's **no push resizing** anymore — the body row is always 35/65.
- **Filters consolidation.** The Inbox/Archived/Blocked segmented-control card **and** the in-card
  Filters row are **removed** from the thread-list column (it's now just scrolling rows; default view
  stays `inbox`). A **Filters button** sits on the search row *between* search and New message (40px,
  white, `colorBlack5` border, `rounded-[6px]`, filter icon + "Filters" + a blue count badge "2").
  Clicking it opens a lightweight **popover** (anchored under the button, white, shadow, `rounded-8`):
  a **VIEW radio group** — Inbox (default) / Archived / Blocked — **wired to the store's `currentView`**
  (this is where the collapsed views live now), plus decorative disabled placeholder rows ("Assigned
  to", "Channel") suggesting the future feature. Closes on outside click.
  **Usage data point: <1% of usage is on the Archived/Blocked views** — the justification for
  collapsing them out of the always-visible chrome into the Filters popover.

> Verified live on :3009 — floating panel + scrim, 4-slide carousel with the red hidden-failure dot,
> "Show 1 more stay" expander, 35/65 columns, and the Filters popover all render clean (tsc 0, no
> console errors).

## What changed vs the old surface (Conversations tab)

| Area | Old | Redesign |
|---|---|---|
| Canvas | flush white, columns separated by borders | modular white cards (rounded-12, `colorBlack6` border) on a `colorBlack8` canvas, 16px gaps, 24px page padding |
| Main nav tabs | 14px w/ icons on `#f0f0f0` bar | 16px Medium text-only on white, 4px flush-bottom underline |
| Online status | `CanarySelect` | tonal status pill (dot + label + caret) w/ small menu |
| Search + New message | right side of SubNav | full-width row spanning the surface (search is `flex-1`) |
| Inbox/Archived/Blocked | `CanaryTabs` rounded pills in SubNav | boxed segmented-control card atop the list column (selected = filled `colorBlueDark1`) |
| List scoping dropdown | All/My/Unassigned `CanarySelect` (decorative) | REMOVED — future **Filters** feature absorbs it ("Filters ▸ 2 applied" row is visual-only for now) |
| Thread row | 40px circular avatar, solid-blue selected row (white text), unread bg tint + bold preview, status `CanaryTag` | 32px rounded-8 avatar, soft selected (`colorBlueDark5` + `colorBlueDark3` border, rounded-6), unread = pink dot ONLY, status as plain text in the room label ("112 (RESERVED)"), **loyalty tier as a gray compact tag beside the name** (Miguel's call 2026-07-20 — deviates from the frame, which has no tag in rows), flag icon for flagged threads |
| Messages | chat bubbles, guest left / staff right, 48px left timestamp gutter | FLAT left-aligned blocks (Slack register, ported from the email surface): 32px avatar, name + right-aligned time (NO per-block loyalty tag), body, footer = channel (inbound) / **real delivery status** (outbound). Delivery status follows the production rule — renders under every outbound message (staff AND AI) from carrier receipts, labels "Sending / Sent / Delivered / Failed to send"; **failed = red row + alert icon + "Learn more"** into a carrier-error modal (modal out of scope) |
| Day divider | centered 10px gray text | full-width hairline + LEFT-aligned 10px Medium uppercase label |
| Thread header | Archive (SHADED), Link reservation text btn, info, vertical kebab | Archive (tonal `rgba(40,88,196,0.1)`), info w/ pressed state, horizontal kebab; Link reservation lives in the info panel only |
| Composer | `#666` border rounded-4; attach/translate/list/concierge | rounded-12 card w/ `colorBlack6` border (blue focus kept); **emoji**/attach/list/concierge; gray rounded-6 AI pill; 32px split "Send via SMS" w/ side-only radii |
| Info panel | 400px fixed drawer only | **Floating panel v3** — a fixed 400px white card inset from the window edges (top 72 / right 16 / bottom 16) with a scrim behind it; replaces the earlier push/drawer experiment (see "Sidebar v3 + layout" above). Linked Reservations is a guest carousel |

New data affordance: `Thread.isFlagged` (flag replaces the unread dot in the row). No flag/unflag flow yet — feature TBD.

**Loyalty tag placement (Miguel 2026-07-20):** loyalty tier renders in the thread LIST row and the thread HEADER (added there this pass — it was missing), and is REMOVED from message blocks (it repeated on every message and read too loud). **Delivery status follows the production rule:** it renders on every outbound message (staff + AI), driven by carrier receipts, mapped to Sending / Sent / Delivered / Failed to send; failed messages get the alert-icon + "Learn more" treatment (mirrors production `MessageAtomBubble.vue`; the carrier-error modal is out of scope).

## Deliberately NOT built (parked, per Miguel 2026-07-20)

- **New AppShell** (navy rail, 52px header, Reservations button, Copilot chip, "102 guest messages today") — later, at component level.
- **Chain of thoughts** (the AI reasoning checklist in the frame) — was a visual conceptualization; the real treatment puts AI thinking in a sidebar. Separate design pass.
- **Copilot** anything — not touched in this exercise.
- **Filters panel / flag flow / assignment scoping** — v3 made the Filters **popover** real for the
  Inbox/Archived/Blocked VIEW group (wired to `currentView`); the "Assigned to" / "Channel" rows are
  still decorative placeholders. Flag flow + assignment scoping remain TBD.
- **Broadcast** redesign — after the main surface is right.
- **AI answers** tab removed 2026-07-20 — capability moved into Settings as Knowledge Base (per Miguel), tab is redundant on the messaging surface. Gone from the nav, the `MainNavTab` type, and the page.
- AI-message thumbs/info feedback row — dropped to match the frame; revisit if it's missed.
- Translate composer tool — replaced by emoji per the frame; flag if translation needs a home.

## ⚠ Design-system TODO — for a future Claude doing the library pass

The Figma mixes classic tokens with new-paradigm values. **The rule we followed: classic
color/type (Roboto, `colorBlueDark1` #2858C4, `colorBlack*` grays), unit-6 radii on all NEW
interactive elements.** These are hand-rolled overrides in this branch because the Figma
values are NOT finalized — when they finalize, promote into `@canary-ui/components`:

1. **6px corner radius** for buttons/inputs/segmented controls (library `button-cornerRadius` is 4px; the frame still has stale 4px instances — treat those as drift, not intent).
2. **12px card radius** + `colorBlack6` 1px border + `colorBlack8` canvas — the modular-card surface language.
3. **Soft selection treatment**: `colorBlueDark5` fill + `colorBlueDark3` border (replaces solid-blue selected rows; also the info-button pressed state).
4. **Rounded-8 square avatars** (32/40px) replacing circles.
5. **Tonal button variant**: 10%-alpha fill + full-strength text (`rgba(40,88,196,0.1)` + `colorBlueDark1`; green analog `rgba(0,128,64,0.1)` + `colorLightGreen1` used by the status pill).
6. **Boxed segmented control**: white card, 4px padding, 4px gap, filled-blue selected segment.
7. **Split button** anatomy: side-only 6px radii, 1px seam.
8. **Status pill** (online/away/offline) — dot + tonal bg + caret. Note the Figma has a 6-outer/8-inner radius mismatch on this control; we used 6 throughout.
9. Figma mock nits to fix in the file when convenient: Chain-of-thoughts says Room 504 vs Emily's 153; dates say 2024; "TODAY" divider is 5 literal spaces + text; "AI actitivity" layer typo; Filters row hard-coded at 434 bleeding its card padding; Canary chatlog detached at fixed 862.

## Files touched

- `lib/products/messaging/types.ts` — `Thread.isFlagged`
- `lib/products/messaging/mock-data.ts` — thread `'2'` flagged (the Figma's flagged row)
- `lib/products/messaging/store.ts` — v2 added `infoPanelStyle`/`setInfoPanelStyle`; **v3 removed them** (floating panel is now the only mechanic)
- `components/products/messaging/` — `MainNav`, `AppLayout` (SubNav dropped for Conversations; **v3: Filters button + popover on the search row, wired to `currentView`**), `ThreadList` (**v3: segmented control + in-card Filters row removed → just rows**), `ThreadListItem`, `ThreadView`, `MessageBubble` (flat blocks), `MessageFeed`, `DateSeparator`, `MessageComposer`, `Avatar` (rounded-8), `GuestInfoSidebar` (**v3: floating panel + scrim + guest carousel + stays expand**). `PrototypeVariantToggle` **deleted in v3**.
- `app/(dashboard)/messages/page.tsx` — card-on-canvas composition; **v3: 35/65 flex-basis columns; floating info panel (no push resizing); `currentView`/`setCurrentView` passed to AppLayout for the Filters popover**
