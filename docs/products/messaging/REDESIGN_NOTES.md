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

## Sidebar v4 (2026-07-21)

Six changes this pass — panel width, the primary-card disclosure model, a nested
per-reservation messages table, a truncation-proof date format, smaller dots, and a
toggleable compact top row.

- **Panel width 400 → 600px.** The floating Conversation Details card widens to
  **600px** (inset/scrim/slide-fade animation all unchanged). The extra width is what
  lets the nested messages table and the detail rows breathe.
- **Primary card v4 — "current open, next collapsed, link for the rest."** The
  primary phone-grouped card no longer renders every stay as an equal mini-table row.
  Instead, using the existing in-house → upcoming → past sort:
  - the **CURRENT (in-house)** reservation is **expanded by default** as a full detail
    block — the icon+value rows (phone, email, dates, room, confirmation, check-in/out
    status w/ open-link icons) **followed by the nested GJ messages table** (below);
  - the **NEXT** reservation is a **collapsed row** (compact date range + state +
    compact status/failed signal + chevron); expanding shows the same detail-block
    anatomy incl. its own table;
  - **everything else** (further-future + past) hides behind a **"View N more
    reservations"** text link (`colorBlueDark1`, 13px) → "**View fewer**" to collapse.
  Default-open is driven by resetting the shared `expandedResId` to the in-house stay's
  id on thread change. Shared-phone rule unchanged (Sarah Smith's Nov stay still shows
  her differing name on its row).
- **Nested per-reservation GJ messages table (the "table in a table").** A
  rounded-8, `colorBlack6`-bordered container **inside each reservation's detail block**
  (`GjMessagesTable` in `GuestInfoSidebar`, rendered from `ExpandedDetails` so both the
  primary rows and the secondary cards get it). One hairline-divided row per
  guest-journey message: **title** (14px Medium) left, right-aligned **timestamp**
  caption ("Sent Jul 11 · 9:00 AM" for sent, bare "Jul 14 · 9:00 AM" for scheduled),
  and a row of ~18px **channel icons** beneath — email (`mdiEmailOutline`), SMS
  (`mdiMessageProcessingOutline`), WhatsApp (`mdiWhatsapp`), plus two **OTA letter
  chips** (tiny rounded squares: "B" white-on-`#1a3c8b` Booking, "E" black-on-`#ffd43b`
  Expedia). **Per-channel status drives color:** failed = red `#E40046`, scheduled =
  40% opacity, sent = `colorBlack2`. **If any channel in a row failed, that row's
  timestamp also turns red + gains an alert icon** — failures stay the loudest thing.
- **Data model + derived counts.** New `gjMessages` map in
  `lib/products/messaging/mock-data.ts`: `Record<reservationId, Array<{title; sentAt?;
  scheduledFor?; channels: {type: 'email'|'sms'|'whatsapp'|'booking'|'expedia'; status:
  'sent'|'failed'|'scheduled'}[]}>>`, seeded for **all of thread 14's reservations**
  (`res-john-jul` carries a **failed WhatsApp on its Check-in** message → matches the
  existing "1 failed"), plus James/Ethan/Liam's and Emily's `res-emily-jul`. The coarse
  `{delivered, failed, scheduled}` summary the collapsed rows + carousel red-dot rule
  consume is now **DERIVED from `gjMessages`** via `getGjSummary()` (message-level count:
  a sent message with any failed channel counts failed; else sent ⇒ delivered, else ⇒
  scheduled) so the table and the summary can never disagree. The legacy
  `gjMessageStatus` map stays as a **fallback** for reservations without a detail log.
- **Compact date format everywhere in the panel.** New `formatCompactDateRange`
  collapses the month/year so ranges never truncate at any width: same-month prints the
  month once ("Jul. 13 - 15, 2026"), cross-month prints both with one trailing year
  ("Sep. 28 - Oct. 2, 2026"), cross-year keeps both years. Replaces the old
  `formatDateRange` at every call site (stay rows, collapsed rows, detail block,
  secondary cards).
- **Smaller carousel dots.** Dots shrink **8 → 6px** (active/red rules unchanged).
- **Compact top-row experiment (toggleable).** The repo's dark-pill **"Prototype"**
  idiom is **recreated as `PrototypeVariantToggle`** (bottom-right) with one option
  group, **"Top row": Full (default) vs Compact**, wired to a new store field
  **`topRowStyle: 'full' | 'compact'`**. In **Compact**, the search input is sized to the
  thread-list column (**35%** of the content row, aligned to the list card's edges) and
  the Filters + New message controls become **40px icon-only buttons** (filter-variant
  icon w/ a corner count badge; New message = `mdiMessagePlusOutline` on the primary blue
  button), each with an `aria-label`. **Full** mode is unchanged.

> Verified live on :3009 — 600px panel, John Smith's current stay expanded with the red
> "1 failed" signal, the nested table (Booking "B" chip + red WhatsApp on the failed
> Check-in row), "View 2 more reservations" link, compact dates, 6px dots, and the
> Full/Compact top-row toggle all render clean (tsc 0, no console errors).

## State vocabulary alignment (2026-07-21)

The load-bearing rule this pass: **ONE state family → ONE visual channel → ONE
vocabulary.** Production screenshots are the reference for provenance + lifecycle.
Each distinct state family in the panel now speaks through exactly one channel:

- **Provenance = structure + section ⓘ tooltip.** The green **AUTO-LINKED** badge is
  **retired** from the primary-card header (matches production's post-April
  treatment) — provenance is now **structural**: the primary card simply *is* the
  phone-matched group. The "how did these link?" explanation moves to a small ⓘ
  icon (`mdiInformationOutline`, ~16px, `colorBlack3`) beside the **Linked
  Reservations** heading, carrying production's copy verbatim as a hover tooltip:
  *"Reservations link automatically when the guest's phone number in your PMS
  matches this conversation. If it's missing, check the phone number in your PMS,
  or search & link a reservation manually here."* Secondary (staff-linked) cards
  keep their **"Linked by staff"** caption — that's the assertion-side signal.
- **Lifecycle = PMS vocabulary chips.** The invented **IN-HOUSE / UPCOMING / PAST**
  text labels are **deleted everywhere in the panel**. Each stay instead shows a
  small lifecycle **chip** derived from `reservation.status`, in production's
  vocabulary + chip register (10px uppercase, `<LifecycleChip>`): our prototype's
  `'upcoming'` → **RESERVED** (light blue: bg `colorBlueDark5`, text
  `colorBlueDark1`, border `colorBlueDark3`); `'checked-in'` → **CHECKED-IN** (tonal
  green: bg `rgba(0,128,64,0.1)`, text `colorLightGreen1`); `'checked-out'` →
  **CHECKED-OUT** (gray: bg `colorBlack7`, text `colorBlack3`). **Cancelled &
  no-show reservations are hidden from the panel entirely** (filtered out of both
  linked lists — matches production's April fix; filtering logic is in even though
  no current mock data carries those statuses). **Room** shows as its own small
  "RM {room}" text *beside* the chip (not fused into the label) for checked-in
  stays only.
- **Sort order unchanged, grouping re-derived from status.** Rows still sort
  temporally (current → future by date → past). The "current + upcoming visible,
  **View N more**" default state now derives its grouping directly from
  `reservation.status` — `'checked-in'` + `'upcoming'` stay visible; `'checked-out'`
  hides behind the link — instead of the old `StayState` temporal enum (which
  survives only for the sort). Stay-row grid columns widened at 600px
  (`minmax(0,1fr) 140px 148px 22px`) so chip + room + GJ status
  ("✓ 1 sent · 3 scheduled") fit without truncation.
- **Other state families unchanged, each still on its own channel:** delivery =
  the GJ status line / nested messages table, flow status = the detail rows
  (check-in / check-out status), loyalty = guest-level only (list row + thread
  header).
- Secondary cards also carry a `<LifecycleChip>` beside the guest name so the
  lifecycle vocabulary reads identically across both card types (adaptation — the
  task specified the primary rows; extending it to secondary cards honors the
  one-vocabulary rule).

> Verified live on :3009 — John Smith's thread shows CHECKED-IN + "RM 504" on the
> current stay, RESERVED on both upcoming stays (incl. Sarah Smith's differing
> name), and CHECKED-OUT on the revealed Feb past stay; the AUTO-LINKED badge is
> gone, the ⓘ tooltip carries production's copy, and the "1 failed" signal stays
> loud (tsc 0, no console errors).

## Sidebar v5 — progressive disclosure (2026-07-21)

Design principle (Miguel + Rachel): **conversation details are the panel's content;
GJ messages are ANCILLARY monitoring** — healthy = nearly silent, failure =
unmissable. This pass demotes GJ from an always-on table to a two-intensity banner
and establishes an internal DRILL-IN as a platform pattern.

- **GJ demoted to a two-intensity BANNER (`GjBanner`).** The inline nested GJ
  messages table is **removed from the reservation detail blocks**; each stay
  row / reservation detail now carries ONE compact tappable line:
  - **HEALTHY = quiet gray** — "Scheduled messages ✓" (13px `colorBlack3`,
    chevron-right affordance, transparent bg).
  - **FAILURE = promoted red banner** — subtle red tint bg
    (`rgba(228,0,70,0.06)`), alert icon + "N message(s) failed to send" in
    `colorRed1` medium weight — the **loudest** element in the card.
  Both variants tap through to the drill-in.
- **DRILL-IN view = internal panel navigation (the "thing").** Tapping a banner
  slides the panel's content to a **Scheduled Messages** detail for THAT
  reservation — the panel navigates **within itself** via a `translateX(-100%)`
  track (~250ms), NOT a new modal/route. Header = back arrow (top-left) + title
  "Scheduled messages" + subtitle "guest name · compact date range". Back returns
  to the main panel with **state preserved** (expand + pager position intact; a
  `lastDrillRef` keeps the drill pane's content mounted while it slides back out).
  Content = the existing `GjMessagesTable`, now at **full panel width**. This
  internal-navigation idiom is deliberately established as a **platform pattern —
  the future home for AI explanations** and other progressive-disclosure features.
- **Failed rows carry production's error register.** Under a failed message row in
  the drill-in, a small error block per failed channel: **"Error {code}"** (mono,
  `colorRed1`) + one **curated hotelier-readable line** + a **"Learn more"**
  underlined no-op link (production reference: messaging's
  `MessageErrorDetailsModal`). New `errorCode` + `errorNote` fields on failed
  channel entries in `gjMessages` (`res-john-jul` Check-in → WhatsApp **63016**:
  "WhatsApp couldn't deliver — the guest hasn't opted in or the 24-hour window
  closed."). Rationale (in a code comment): hotels can't fix a Twilio/carrier
  failure, but the on-screen code **saves Canary support the investigation**.
- **GUEST PAGER replaces the carousel dots+arrows.** The idiom is carried from
  **Check-in's multi-guest control** ("‹ 👥 N ›"). Under the Linked Reservations
  heading, **left-aligned** (~28px row): chevron-left button · people icon
  (`mdiAccountMultipleOutline`) + guest count · chevron-right button. Arrows
  **disable at the ends** (no wrap); slides are unchanged (primary phone-grouped
  card first, then staff-linked guests). **The dots row is removed entirely.**
  **Hidden-failure signal:** when any **off-screen** guest has a reservation with
  failed GJ messages, the pager's **count chip renders red** (`colorRed1` text +
  `rgba(228,0,70,0.08)` bg) — the signal the red dot used to carry.

> Adaptation: the SecondaryCard's collapsed header keeps its `GjStatusLine`
> at-a-glance summary and the primary rows keep their `GjStatusCell` — the banner
> replaces only the **table inside the expanded detail block** (per the spec's
> "remove the nested table from the detail blocks"). GJ banners appear in every
> reservation's detail block (primary rows + secondary cards) via `ExpandedDetails`.

> Verified live on :3009 — banner (loud red on John's in-house stay / quiet gray
> elsewhere), tap → drill-in slide to Scheduled messages with the full-width table,
> Error 63016 block + Learn more on the failed WhatsApp row, back preserves state,
> and the guest pager with the red hidden-failure count chip (tsc 0, 200 on
> /messages, no console errors).

## Sidebar v6 — card anatomy corrections (2026-07-21)

Miguel reviewed v5 against a reference mock; this pass corrects the guest card
anatomy, promotes GJ monitoring to the card level, and fixes compact top-row mode.
Primary and secondary cards now share ONE component (`GuestCard`).

- **Guest card anatomy (primary AND secondary, one structure).**
  - **CARD HEADER:** guest name (16px medium); second line = phone icon + number
    AND (only when the guest has a checked-in stay) bed icon + current room, side
    by side.
  - **INSET SUB-TABLE — a "table IN the card", not "table AS the card".** A
    bordered (`colorBlack6`), `rounded-[8px]` container INSET within the card
    padding; hairline dividers. Row = a left-aligned flex row (8px gaps) of **stay
    dates (14px medium) + lifecycle chip + "RM {room}" inline BESIDE the dates**;
    right side = **per-row kebab ⋯ + expand chevron**. A differing guest name
    (Sarah Smith on the shared phone) renders as a second line under the dates.
    **Per-row GJ summary cells are DELETED** — future reservations haven't sent
    anything; the signal lives in the card banner now. **Collapsed by default
    (Miguel corrected his own mock — 2026-07-21):** the sub-table does NOT list
    all stays flat. It shows only **(1) the current (checked-in) stay + (2) the
    single next upcoming stay**; every remaining stay (further-future + past) hides
    behind a **"View N more reservations"** text link (`colorBlueDark1`, 13px) as
    the sub-table's last row — clicking reveals them in place, **"View fewer"**
    collapses back. If the guest has no current stay, the single visible row is the
    next upcoming (or the most recent past if none is upcoming). The **guest-scoped
    drill-in still covers ALL stays** regardless of collapse state. (E.g. thread
    14's John Smith card: Jul (current) + Sep (next) visible; "View 2 more
    reservations" hides Nov (Sarah) + Feb.)
  - **Per-row kebab.** Staff-linked rows → "Unlink reservation" (wired to the
    existing `onUnlinkReservation` flow). Phone-matched (auto) rows → the item
    renders **DISABLED** with the production rationale as its subtitle: *"Can't
    unlink — phone number matches this conversation."*
  - **Expanded row detail.** The row header (dates + chip + RM inline, left-aligned
    **flex — the fixed grid columns are killed**) stays put; the detail fields
    (phone/email/dates/room/confirmation/check-in/out) render below it. No GJ table
    in the detail block anymore.
  - **CARD-LEVEL GJ BANNER (replaces v5's per-stay banners).** A full-width
    `rounded-[8px]` **gray-tinted box** (`#f4f5f6`) at the card bottom: **"Guest
    Scheduled Messages"** (14px medium) + chevron-right — a clearly contained
    tappable box, not floating text. **FAILURE variant** when ANY of the card's
    reservations has failed messages: red tint (`rgba(228,0,70,0.06)`) + alert icon
    + "N message(s) failed to send" in `colorRed1`. Tap → drill-in.
- **Drill-in is now GUEST-level.** Tapping a card's banner drills into a Scheduled
  Messages detail scoped to that card's guest, showing **ALL** the card's
  reservations **SECTIONED per reservation** — each section header is a compact
  date range + lifecycle chip in a small-caps caption register, sections in
  stay-sort order (current → upcoming → past). Failed rows keep production's Twilio
  error register (code + curated line + Learn more). The subtitle under the
  "Scheduled messages" title is the **guest name only**. State is carried via a
  `DrillTarget { guestName, stays }` (a `lastDrillRef` keeps the pane mounted while
  it slides back out); back preserves main-panel state.
- **Compact top-row mode corrected.** In compact mode the search field + Filters
  icon button + New-message icon button TOGETHER span exactly the thread-list
  column width (the 35% column) and sit **ABOVE the thread list, INSIDE the left
  column**; the **conversation thread column then runs FULL HEIGHT** from the top of
  the content area (it fills the vertical gap the old top row occupied).
  Implementation: in compact mode `AppLayout` renders **no** top search row; the
  controls move into the page's left-column stack (controls row, then the list
  card). The search + Filters + New-message controls were **extracted into a
  reusable `ConversationControls` component** (with `FiltersControl`) so the exact
  same controls serve both placements — full-width band (AppLayout) vs
  column-scoped (page). Full mode is unchanged. Store toggle + `PrototypeVariantToggle`
  wiring untouched.

> Adaptation: the primary/secondary split collapses into a single `GuestCard`
> (both card types have identical anatomy now); each stay row derives its kebab
> behavior from `lr.isAutoLinked` (auto → disabled unlink, staff → live unlink).
> Row-level "RM {room}" shows whenever the reservation has a room (reserved stays
> with an assigned room, e.g. Sarah's RM 618, show it too); the HEADER room is
> gated to the checked-in stay only.

> Verified live on :3009 — John Smith's card (header phone + RM 504, 4-guest pager,
> inset sub-table with Sarah Smith's differing name on the Nov row + CHECKED-OUT
> Feb row, red "1 message failed to send" card banner), the auto-row kebab's
> disabled "Can't unlink" item, the guest-level sectioned drill-in (JUL/SEP/NOV/FEB
> sections + Error 63016 register), and compact mode (column-scoped controls +
> full-height thread view) all render clean (tsc 0, 200 on /messages, no console
> errors).

## Sidebar v7 — "one fact, one home" + pager in the header (2026-07-21)

A design pass to kill duplicated facts and reclaim the floating pager row. Two
corrections to the `GuestCard` anatomy; the inset sub-table, stay-row centering,
compact top-row mode, the GJ banner, and the drill-in register are all unchanged.

- **One fact, one home — CARD HEADER only.** The room number was surfacing in
  both the card header and the stay row. The consolidation applies to the **card
  header**: it now carries just **guest name + phone below it**. The bed-icon
  current-room block is **removed** (and the `checkedInStay`/`headerRoom`
  derivation with it). The room's glance home is the stay row's **"RM {room}"**,
  always visible for the current stay by default.
  - **EXPANDED ROW DETAIL is production's COMPLETE reservation-details block** —
    the familiar full record, in order: **Phone, Email, Dates, Room, Confirmation
    Code, Check-in Status, Check-out Status** (the two status rows keep their
    open-in-new jump links). The Dates and Room rows **deliberately echo** the stay
    row header one line above — that repetition is intentional: the expanded block
    is the whole, familiar anatomy, not a de-duped subset. *(Amends an interim v7
    slim-down that had trimmed Phone/Dates/Room from the expanded detail — the
    designer reversed it; the complete block is restored. The one-fact-one-home
    consolidation stays scoped to the card header.)*
  - Stay rows are unchanged.
- **Pager moves into the card header.** The floating pager row above the card is
  gone. The guest carousel control (**‹ 👥 N ›**, same disabled-at-ends arrow
  behavior, same red-count-chip-on-hidden-failure rule) now renders **inside the
  card header, right-aligned on the guest-name line** — name left (truncating,
  `min-w-0`), pager right (`shrink-0`); phone stays on its own line below. The pager
  **only renders when there is more than one guest card** — single-guest threads
  show a plain header with no pager.
  - Implementation: the pager is extracted into a small `GuestPager` component and
    passed into `GuestCard` as a `pager` ReactNode header slot. The pager's state
    (current index, total, prev/next, `hiddenFailure`) still lives in the parent;
    the `slides` array now carries card DATA (name/phone/stays) rather than
    pre-built nodes, and only the active card renders. The **hidden-failure signal
    still considers all OTHER (non-visible) cards**, so a failed guest-journey
    message off-screen still turns the count chip red.

> Verified live on :3009 — thread 14 (John Smith, 4 guest cards): pager sits in the
> header beside the name, arrows disable at the ends, phone below the name, no room
> in the header. Expanding a stay row shows production's complete block —
> phone/email/dates/room/confirmation/check-in/check-out, in order — with the stay
> row's "RM {room}" still inline above it (the dates/room echo is intentional).
> Paging off John's card (which holds the failures) turns the count chip red. A
> single-guest thread renders no pager, and a long guest name clamps with an
> ellipsis (`white-space:nowrap; overflow:hidden; text-overflow:ellipsis`). tsc 0.

## Broadcast — step 1 baseline (2026-07-28)

Step 1 of a staged broadcast redesign. This is the **A/B baseline**: the existing
broadcast flows kept functionally identical, re-dressed in the card-on-canvas
register so it can be compared against later steps. **Restraint is the spec** —
recipients-as-floating-panel, rich audience rows (counts / last-send previews),
the filter-modal restructure, and scheduling are all later steps and are
deliberately absent.

### Layout — two cards, not three columns

The old left rail (groups) and middle column (guest list) combine into **ONE
card**: they're closely associated — you pick an audience, then narrow it to
recipients. The surface is now two white rounded-12 cards on the `colorBlack8`
canvas, spaced and margined like Conversations (16px gap, 24px page padding, 16px
top). The Audience card is **content-sized** — not a share of the canvas — and
the Thread card takes everything left over.

**Left card — Audience (combined).** The two old panes keep their **side-by-side**
relationship *inside* the one card, at **equal widths**: a 212px
audience-selector column, a vertical `colorBlack6` hairline, a 212px recipients
column. The card is therefore 212 + 1 + 212 + borders wide and no wider.

- *Audience column (212px, scrolls independently):* the status trio (Arrivals /
  In-house / Departures) as compact selectable rows with their existing icons,
  then a GROUPS section (10px uppercase label + "+" new-group button + kebab)
  listing custom groups. Rows use the redesign selection register (soft
  `colorBlueDark5` fill + `colorBlueDark3` border, rounded-6) instead of
  solid-blue `CanaryListItem` rows. The status trio renders **bare** (icon +
  name); **GROUPS rows keep their member count and last-broadcast preview**,
  which both the old prototype and production show.
- *Recipients column (212px):* Filters row (built-ins only), date control
  (Arrivals/Departures — knowingly decorative, nothing filters on it),
  Select-all, and the guest list with its EXPECTING / CHECKED IN section labels
  and hover contact popover. Rows are **bare** — checkbox, avatar, name, room —
  matching production. The name truncates rather than wrapping (full name on the
  hover popover and as a `title`).
  **One inset for the whole column:** a single `COLUMN_INSET` of **12px** governs
  every box in here — Filters row, date control, Select-all, segment labels and
  guest rows all start at the same left edge and end at the mirrored right edge.
  Guest rows carry no horizontal padding of their own, so a row's hover
  background is exactly the Filters row's box rather than sitting indented inside
  it. The date control is a **compact 32px row** (calendar icon + formatted date,
  1px `colorBlack6` border, rounded-6) with a transparent native date input laid
  over it — it replaces the full-height bordered `CanaryInputDate` box that
  dominated the column, and picking a date still works.

**Right card — Broadcast thread.** Header names the audience with the recipient
count beneath it, in the Conversations thread-header register; the dead info
button is gone. Feed and composer below.

### The control-band collapse

`BroadcastSubNav` (Active/Archived pills + "Manage segments" link) is **removed
entirely**. Active is simply the default state; **Archived moved into the GROUPS
kebab** ("View archived" ⇄ "View active", showing the existing empty state);
**"Manage segments" remains reachable only** from the filter modal's Guest
Segments mode, where it already lived.

### Old vs new

| Area | Old | Step 1 baseline |
|---|---|---|
| Surface | 3 flush columns separated by borders, gray column fills (`#fafafa` / `#f0f0f0`) | 2 white rounded-12 cards with `colorBlack6` borders on the `colorBlack8` canvas, Conversations spacing; the first two columns live side by side INSIDE the Audience card at equal 212px widths, split by a vertical hairline. The Audience card is content-sized; the Thread card takes the rest |
| Control band | white sub-nav strip: Active/Archived pills + "Manage segments" | REMOVED — Active is the default, Archived in the GROUPS kebab, Manage segments only inside the filter modal |
| Audience rows | `CanaryList`/`CanaryListItem`, solid-blue selected row, custom groups carried a 40px gray tile + member count + last-broadcast preview | lean rounded-6 rows, soft blue selection, icon + name only (counts/previews are step 4) |
| Guest rows | 40px avatar | 32px rounded-8 square avatar, otherwise unchanged — checkbox, avatar, name, room, and the same no-phone treatment (0.4 opacity, disabled, "No phone number") |
| Filters row | `CanaryListItem` in `#eaeef9` | tonal rounded-6 row, same built-ins-only content and clear "×"; it and the date control define the column's shared 12px inset |
| Thread header | 60px, generic group icon + bare "N guests", dead info button | 70px Conversations register, audience name + guest count, rounded-8 tile, info button dropped |
| Sent broadcasts | right-aligned tinted bubbles with a trailing antenna tile and a left timestamp gutter | FLAT LEFT-ALIGNED blocks (Slack register, same anatomy as `MessageBubble`): 32px sender avatar, sender name + right-aligned uppercase time, body, meta row = antenna + recipient count + the "N FILTERS APPLIED" / segment-name chip (still opens the filters-applied modal) |
| Composer | `#666` border rounded-4, `p-6`, ad-hoc icon buttons | Conversations composer anatomy — rounded-12 card, `colorBlack6` border w/ blue focus, hairline divider, ghost tool icons, 32px rounded-6 Send. No AI toggle (broadcasts have none) |
| Sending | fired immediately | **"Send to N guests?" confirm** (production parity); the draft survives Cancel |

### Fixes bundled into this step

1. **Sticky selection — mirrors production exactly.** `applyFilters` used to
   overwrite the selection wholesale. It now reproduces production's rule:
   snapshot the messageable rows currently on screen that are *unchecked*, then
   rebuild the selection from the new filter result minus that snapshot. Two
   consequences worth knowing, both matching production:
   - The snapshot is derived **fresh at apply time**, not kept as history. A
     manual uncheck survives while the guest stays visible, and is forgotten once
     a filter hides them.
   - A manually-checked guest who falls **outside** the new result is dropped —
     the selection is rebuilt purely from the result, so there are never
     invisible recipients in the send count.

   **Clearing a filter is a full reset**: production refetches the folder and
   re-selects every messageable guest, so manual unchecks do *not* survive a
   clear. Select-all / Deselect-all are plain set/empty, and switching audience
   resets — again matching production.
2. **Live match count in Quick Filters.** The filter modal's footer now shows
   "N guests match" live as criteria change — it previously rendered only in
   Guest Segments mode. Count only; the modal redesign is step 3.
3. **Segment-name-on-chip bug.** Sending with a loaded segment showed
   "N FILTERS APPLIED" instead of the segment name: `sendBroadcast` looked a
   `seg-*` id up against a broadcast-local `sf-*` list, which never matched. It
   now resolves against the guest-journey segment store — the single source.
4. **Save-as-segment toast.** The "filter saved" toast was dead (it watched a
   list the save flow never wrote to). It's now fired by the actual
   save-as-segment action, via transient store state, and reads "Guest segment
   saved".
5. **Dead code removed.** `ManageFiltersModal` (deleted), `BroadcastSubNav`
   (deleted), the broadcast store's `savedFilters` list and its
   `saveFilter` / `updateFilter` / `deleteFilter` actions, the manage-filters
   modal state, `mockSavedFilters`, and the now-orphaned
   `.broadcast-group-list li` CSS rule. Guest Segments are the single source.
6. **FAB overlap.** The `PrototypeVariantToggle` FAB sat on top of the broadcast
   composer's Send button. It only drives the Conversations top-row experiment,
   so it's now scoped to that tab.

### Deliberately NOT in step 1

Recipients-as-floating-panel · richer audience rows (beyond the count + preview production already shows) ·
filter-modal restructure · scheduling · wiring the date picker (still decorative)
· archiving a group (the archived view exists, nothing archives into it).

## Broadcast — delivery panel + send later (2026-07-28)

Two builds on top of the step-1 baseline, both mirroring production semantics.

### Per-recipient delivery panel

Clicking a sent broadcast block opens a panel listing every recipient and what
happened to their copy. Production ships this as a 420px right-edge slide-over;
ours rides the shared floating-panel shell (480px — one narrow list, not the
sidebar's guest cards). Anatomy follows production: "Broadcast message" title,
icon meta rows (body · sent timestamp · sender ·
"(Audience) N"), then a bordered rounded-8 recipient list with the status
right-aligned. Avatars are our 32px rounded-8 squares, not production's circles,
and the close is an **X in a 30px hover circle** matching the Conversation
Details panel rather than production's slide-back-out arrow. (The scheduled-
broadcast panel still uses production's left arrow — untouched.)

Status vocabulary is production's `NotificationStatus` set with its own English
labels — including FAILED and BLOCKED_HIGH_RATE_COUNTRY deliberately sharing
"Failed to send". "Pending RTC" (an outstanding WhatsApp Request-to-Contact
behind a failed send) is *derived* in production; the prototype has no
per-channel fields to derive from, so it is stored as its own status.

Colour is production's two-tint rule exactly: **only** FAILED red and Pending RTC
amber (`colors.warning`); everything else is plain black — including
`blocked-high-rate-country`, which reads "Failed to send" untinted because
production's class check is `=== FAILED`, and including "Not sent". (An earlier
pass diverged on those two; reverted — if it's in production we keep it.)

The filter/segment chip keeps its own FiltersAppliedModal and stops the click
from reaching the block. The panel sits at z 40 / scrim 39, below `zIndex.modal`
(50), so both that modal and the send-confirm stack above it.

### Send later (scheduled broadcasts)

**The gate is custom-group-only**, exactly as production: `BroadcastsV2.vue`
passes `!isBuiltInBroadcastFolder(currentFolder)` into the composer, which then
renders the clock. The affordance is **absent** on Arrivals / In-house /
Departures, not disabled.

- **Composer** gains a clock beside attachment + templates. It opens
  "Schedule send time" — date + "Select time" side by side, Cancel + "Schedule
  send time", enabled only once both are chosen. Time slots are 15-minute
  blocks generated from *now* when the chosen date is today, so a past time is
  never offered, and changing the date clears the time — both production
  behaviours.
- **Scheduled pill** appears under the textarea: clock + "Scheduled for Today,
  1:00 PM" in `colorBlueDark1` inside a rounded-24 outline, with a ✕ to clear.
  Clicking the label reopens the modal. The day part follows production's full
  cascade — Today / Tomorrow / weekday within 6 days / "August 14, 2026".
- **Send with a schedule set queues instead of sending**, and skips the
  send-confirm (production has no confirmation on that path). Note production
  leaves the button reading "Send" either way; we match.
- **In the feed**, scheduled sends are NOT interleaved chronologically. They sit
  in a pinned block after everything sent, behind a hairline and a centered
  "Scheduled to send later" header — production's `MessageList.vue` layout. The
  block itself is our flat-block register (a clock tile where the sender avatar
  goes, soft `colorBlack8` card, blue "Scheduled for …" line) rather than
  production's outlined bubble, since this surface has no bubbles.
- **The block carries no actions** — like production's atom it is a launcher.
  All management lives in its panel, with production's own hybrid split: three
  bare icon buttons (edit text · edit time · send now) and a kebab holding only
  the destructive Delete. Delete and Send now confirm, with production's copy
  verbatim; edit text and edit time do not and leave the panel open.
- **Send now** converts the queued item into a sent broadcast with delivery
  statuses and drops it from the queue — production posts to `/send` and removes
  the record, letting the resulting broadcast appear in the normal feed.

Data: `ScheduledBroadcast { id, groupId, body, senderName, sendAt, createdAt }`,
a trimmed `ScheduledGroupBroadcast` (production carries uuid/id pairs, a
nullable `broadcast` id, and `sent_at`/`deleted_at` tombstones; here the record
simply leaves the list). One is seeded on the Corporate retreat group, relative
to now, so it always reads as a future send.

## Broadcast — opted-out gate + per-folder auto-select (2026-07-28)

Two more production behaviours imported exactly.

### Opted-out guests

`canMessageGuest` is now production's rule verbatim — **phone on file AND not
opted out of messaging**. `BroadcastGuestEntry` gains `messagingOptedOut`, and an
opted-out guest gets the identical treatment to a no-phone guest: 0.4 opacity,
disabled checkbox, never auto-selected, never counted as selectable. The subtitle
is production's `guestRoomMethod` copy, with opted-out taking precedence:

- `"{room} • Opted out from messaging"`
- `"{room} • No phone number"`

(Note the bullet is `•`, not the `·` we had.) Three opted-out guests are seeded,
one per built-in folder, all single-folder guests so the flag can't contradict
itself: Tariq (Arrivals), Lucia (In-house), Javier (Departures).

### Per-folder buckets and auto-select exclusions

Guests now carry `checkInStatus` (production's `CheckInStatus`: expecting /
in-house / checked-out) instead of our invented per-folder `segment`. Our
"Departing" label is gone — production has no such bucket; a departing guest has
not checked out, so it is simply in-house, and Departures buckets it under
"Expecting".

**Buckets** (production's `guestsByBucket`), with production's own section
titles — "Expecting" / "Checked In" / "Checked Out", in that order:

| Folder | Bucketing |
|---|---|
| In-house | one list, **no section headers** |
| Departures | checked-out → "Checked Out"; everyone else → "Expecting" |
| Arrivals | in-house → "Checked In"; checked-out → "Checked Out"; rest → "Expecting" |

**Auto-select exclusions** (production's `selectGuestsForFolder`) — beyond
`canMessageGuest`, entering a folder pre-selects:

| Folder | Pre-selected |
|---|---|
| Custom / In-house | everyone messageable |
| Departures | everyone except checked-out |
| Arrivals | everyone except in-house and checked-out |

i.e. only the "Expecting" bucket pre-selects on Arrivals and Departures. This
exclusion applies **only** on folder entry and filter-clear — production does not
re-apply it in Select-all or the filter-apply rebuild, which take everything
messageable that is visible, so neither do we. A consequence worth expecting:
Arrivals loads with the Select-all checkbox **indeterminate**, because the
checked-in guest is visible-and-messageable but deliberately unselected. That is
production's behaviour too.

**Sorting** (production's `sortedGuests`): unmessageable guests sink to the
bottom of their section, alphabetical by last name within each side.

## Broadcast — step 3: filter modal A/B (2026-07-28)

The filter modal redesign ships as a **live A/B**, not a replacement. Both
variants are real and switchable from the prototype FAB, so the designer can see
before and after on the same data.

**Toggle.** `PrototypeVariantToggle` now takes a `surface` prop and renders the
option group belonging to the tab you're on — Conversations keeps "Top row"
(full / compact), Broadcast gets "Filter modal" (Classic / Builder), wired to the
store's `filterModalVariant`. The FAB moved to **bottom-LEFT**. Both surfaces put
their composer's Send at the bottom-right of the right-hand card, so a
bottom-right FAB lands on top of it — which is exactly the overlap that got it
scoped off broadcast in the first place. Bottom-left can't collide with a Send
button on either surface and needs no per-surface offset.

**Classic is byte-identical.** `FilterGuestsModal.tsx` is untouched — it is the
"before" side of the comparison. The cost is that the builder can't import its
two private rule-conversion helpers, so those live in a parallel module
(`lib/products/messaging/broadcast-segment-rules.ts`). Deliberate duplication;
when the A/B resolves, delete the loser and make the winner the sole consumer.

**Builder anatomy** (~760px, `CanaryModal`, two columns):

- *Left — the builder.* "Start from: [Guest Segment]" over the guest-journey
  segments, beside "Save as Guest Segment". Picking a segment loads its rules
  into the rows below as editable state; editing any of them flips the caption
  from `Using "X"` to `Custom — edited from "X"` — Loops' unsaved-segment
  mechanic. Rules appear one at a time through **"+ Add filter"** rather than as
  a wall of empty inputs, and each row has a remove. Loyalty is the six quick
  chips; Rate Code / Group Code / Room Number are type-to-chip; Length of Stay and
  Guest Recurrence are their deselectable binary radios. Room Number stays hidden
  on Arrivals.
- *Right — the live answer.* "N guests match" plus a scrolling preview of the
  matched guests (avatar, name, room) that updates as rules change, over the
  "Manage segments" link. This column is the reason the modal earns its width:
  classic makes you apply and then go look.
- *Footer.* Clear all · Cancel · Apply, with Apply disabled at zero matches.

**Store semantics are identical between variants** — same
`BroadcastFilterCriteria`, same `applyFilters` (including passing the segment id
when the audience is still an unedited segment, so the sent broadcast's chip
renders the segment name), same sticky-selection interaction, same
save-as-segment toast. Presentation and workflow only.

Hand-rolled in the builder, because `@canary-ui` exports no equivalent: the
loyalty quick-chips and dismissible value chips (classic hand-rolls these too),
the "+ Add filter" popover menu, and the row remove button. Logged in the
promotion list.

## Broadcast — step 5: left-panel paradigms A/B/C (2026-07-28)

Two challenger paradigms for the broadcast left panel, live behind the prototype
toggle alongside the untouched baseline. The toggle's broadcast surface now
carries **two stacked groups** — "Left panel" (Baseline / To-strip / Ledger) and
the step-3 "Filter modal" (Classic / Builder) — because two experiments run at
once.

**Baseline is the control arm and renders identically.** The one shared file that
changed is `BroadcastGuestList`, which gained two optional props whose defaults
reproduce today's output exactly. That was a deliberate choice over duplicating
its row / bucket / sort / popover logic: a second copy would let the control arm
drift from the challengers, which would corrupt the comparison the A/B exists
for. The only baseline-visible edit is a section-header `div` gaining
`flex items-center justify-between`; with one child it lays out identically.

### Variant B — "To-strip" (addressing)

*A broadcast is a message TO someone, so the recipient belongs in the composer as
an address, not in a permanently-open list holding half the surface.*

- **Left card → 320px pure audience list.** Recipients column removed. Status rows
  carry live folder populations; a group holding a queued send shows an inline
  "N scheduled" line.
- **Right card is the room.** The header drops its guest-count subtitle so the
  count has exactly one home.
- **To strip** as the composer's first child: `To:` · audience token
  ("In-house · all 34" / "Arrivals · 18 of 26") · dismissible filter token · a
  quiet right-hand note when something is held back ("2 removed" / "8 already
  checked in" / "3 can't receive texts") · ghost filter button on built-ins.
  Zero selection turns the token red — "0 of 26 — no one to send to" — and Send
  disables.
- **Recipients panel** (FloatingPanel, 480px) carries the baseline recipients
  experience with its controls lifted into the header, plus a per-bucket
  "Add all N".
- **"Why these guests?"** drills to a level-2 slide showing the subtraction
  ledger — source, each exclusion, the total — using the same translateX mechanic
  as the Conversation Details sidebar.
- **Send confirm** gains a two-line message preview, an audience sentence, an
  overlapping avatar strip with "+N" overflow, and a "Review recipients" link
  that reopens the panel with the draft intact.
- ⚠ **For the designer's eye:** the panel uses the standard shell scrim for
  consistency. Whether a recipients panel opened *from the composer* should dim
  the app behind it — when the thing you're checking is the message you're still
  writing — is worth a look.

### Variant C — "Ledger-roster" (confidence)

*Confidence comes from seeing the whole audience, including who is NOT receiving
and why.*

- **Audience card → 623px** (220px rail + hairline + 400px roster); thread card
  takes the rest.
- **Card-spanning ledger header.** "{N} recipients" at 20px is the largest type on
  the surface — the result — over a caption and a token row that is the funnel
  that produced it, in order: source → filter (an arrow, not a minus) → system →
  locked/unreachable → your edits. Tokens render only when nonzero, so a clean
  folder shows headline and caption alone. No "=" token; the headline is the sum.
  Clicking an exclusion token expands NOT SENDING and scrolls to that group.
- **Roster** splits into a sticky SENDING TO (production buckets as sub-headers,
  each with its own checkbox) and a collapsed NOT SENDING bar carrying a summary
  ("2 unreachable · 3 already checked in"), which expands into reason groups.
- **Excluded rows render at FULL opacity** — the deliberate divergence from
  production's 0.4. Dimming makes the most diagnostic information on the surface
  the hardest to read; exclusion is carried by grouping and a lock glyph instead.
  Unreachable rows swap the checkbox for a lock; production's row copy is kept
  verbatim.
- **Filter-excluded guests never appear in NOT SENDING** — they are outside the
  audience, and the ledger's filter token already accounts for them.
- **Select-all is variant-gated:** here it also pulls status-rule-excluded guests
  into sending, and the ledger flips to "+ N you added". Baseline and B keep
  production semantics.
- **Filter-clear shows a toast** ("Filters cleared — selection reset"), because
  production resets the selection silently and it is easy to miss.

Both variants share: `broadcast-audience-facts.ts`, which derives the whole
subtraction ledger from existing store facts, and a Send button labelled
"Send to {N}" (baseline keeps a plain "Send" so the control arm stays honest).

**Skipped for v1, logged:** row-migration animation, a live/tense ledger, and a
frozen ledger snapshot in the delivery panel.

**Note on `touchedGuestIds`:** the brief asked for it to separate "you unchecked
this" from "the system excluded this". It proved unnecessary — a system exclusion
is identified by the guest's own `checkInStatus` against the folder rule, so any
other messageable unselected guest is by definition a user removal. No state was
added for it.

## ⚠ App-shell height collapse — root cause (2026-07-28)

The recurring bug where the whole app — navy rail *and* content cards — is cut at
one horizontal line with dead white below.

**It was never a collapse. The app was being scrolled out of the viewport.**

`CanaryAppShell`'s root is `h-screen min-h-screen overflow-hidden` — a fixed
100vh box that clips its own overflow. But `html`/`body` carry no height and no
overflow constraint, so the DOCUMENT is independently scrollable. Scroll it and
the entire shell, rail included, slides up as one rigid block and paints white
beneath. Both halves cut at the same y precisely *because* it is one block
moving, which is why it never looked like a component bug.

Two things made it fire:

1. **`100vh` guarantees the overflow.** It resolves against the *large* viewport,
   so on any browser with dynamic chrome the shell is taller than the visible
   area — the document has a few scrollable pixels by construction.
2. **`scrollIntoView` was the trigger.** It scrolls *every* scrollable ancestor
   up to the document, not just the nearest one. `MessageFeed` called it on every
   message change, so ordinary use kept yanking the shell upward. (Telling
   detail: `BroadcastMessageFeed` already carried a comment about scrolling "not
   ancestor scroll contexts" — an earlier session hit this and fixed one call
   site without recognising the general cause.)

**Fix — structural, three layers:**

- `html, body { height: 100%; overflow: hidden; overscroll-behavior: none; }` in
  `globals.css`. Nothing in this app ever intends the document to scroll — every
  scroll region is an inner `overflow-auto` container — so removing document
  scroll entirely makes the failure impossible rather than unlikely. Verified
  safe: every route renders inside `CanaryAppShell` (whose `<main>` is
  `overflow-auto`); the only non-shell route is a one-line redirect stub.
- `100vh → 100dvh` under `@supports`, removing the overflow at its source. The
  rules are unlayered so they beat Tailwind's `@layer utilities` regardless of
  import order — and the library ships its own compiled `.h-screen`, so ours has
  to win on the cascade, not on the build.
- Every `scrollIntoView` in the messaging surfaces replaced with container-scoped
  `scrollTop`. `MessageFeed` and variant C's ledger-token jump both now scroll
  only their own box.

Deliberately NOT patched: `node_modules/@canary-ui`. The shell's `h-screen` is
reasonable on its own; it is the *unconstrained document* underneath it that made
it fragile, and that is ours to own. Worth raising with the library owner anyway
— `100dvh` would be the better default there.

## Conversations — third top-row option: "In-card" (2026-07-29)

A third arm on the existing Top row experiment, joining Full and Compact.

Compact floats the column-scoped controls ABOVE the thread-list card. **In-card**
takes that one step further: the same control anatomy — column-scoped search,
icon Filters with its count badge, icon New message — becomes the card's OWN
header zone, inside the card border with a hairline beneath it. The controls are
a `shrink-0` sibling of the scroll container, so they hold position while the
rows scroll underneath; no `position: sticky` needed, and no chance of the header
scrolling away.

To stop that header cramping, this variant alone widens the list column to **45%**
(conversation 55%). Full and Compact keep 35/65. Like Compact, the conversation
card runs full height — `AppLayout` draws no full-width row for either
column-scoped variant.

**Full and Compact are behaviourally untouched.** Every edit is either additive
or a conditional that evaluates identically for them: `isColumnScoped` reduces to
the old `isCompact` for both, the flex-basis ternaries return the old 35/65, and
`ThreadList`'s new `header` prop is `undefined`, which renders nothing.

## ⚠ Schedule modal date boundary (2026-07-29)

`CanaryInputDate` is a three-field **MM/DD/YYYY** control — it emits
`${m}/${d}/${y}` and parses its `value` by splitting on `/`. `broadcast-schedule.ts`
assumed `yyyy-MM-dd` in both directions, which broke send-later completely:
`new Date("07/29/2026T00:00:00")` is Invalid Date, so zero time slots were
generated, "Select time" never populated, and the confirm button was permanently
disabled. The seed round-trip failed the same way in reverse, so Reschedule
opened empty.

Normalised at the boundary: `toDateInputValue` emits `MM/dd/yyyy`, and
`parseDateInputValue` is the single reader — tolerant of both shapes, building at
local midnight so a date can't slip a day, and rejecting incomplete or impossible
dates (`02/31` would otherwise roll over to March 3).

**Two date formats coexist deliberately, and this is the thing to remember:**
`CanaryInputDate` speaks `MM/DD/YYYY`; a native `<input type="date">` — which is
what the compact date control in the recipients column uses — speaks
`yyyy-MM-dd`. Anything crossing into either one goes through the boundary
helpers.

## Team jam canon (2026-07-30)

The jam resolved every open A/B and landed one design. The losing arms were
deleted; git history is the archive.

**Resolved:** the To-strip broadcast paradigm won (Baseline and Ledger deleted).
A panel won the filter surface (both modals deleted). Conversations keeps the
full-width search band (compact and in-card deleted). With every option group
resolved, the prototype toggle FAB itself is gone.

**Kept from the losers before deleting them:** the Builder modal's attribute
controls and live-match logic (now `BroadcastFilterControls`), and the Ledger
roster's reason grouping (now `broadcast-audience-split`). The ledger *layout*
lost; "who isn't receiving, and why" was the valuable part.

### Broadcast

- **Left column is two STACKED cards** — status trio, then GROUPS — so the lists
  read as separate objects rather than zones of one card. Group rows show a blue
  clock + "N scheduled" when they hold a queued send.
- **The To strip is the address line.** Fresh: "To: All In-house guests (21)".
  Narrowed: wrapping dismissible chips, one per constraint, with the live count
  and funnel right-aligned. Send reads "Send to 21 guests".
- **The date joined the address and became real.** Arrivals and Departures carry
  an inline date token (default today) that turns into an "Arrives/Departs on
  {date} ×" chip once moved. Entries gained `folderDate`, seeded across today..+2,
  and those two folders are genuinely date-scoped — this replaces the decorative
  picker that died with the recipients column. Changing the date re-selects, like
  switching audience: a selection held over from another day would send to guests
  no longer on screen.
- **One filter/recipients panel** replaces both modals and the recipients column,
  because filtering and reviewing recipients are the same job. Filters apply
  LIVE — no Apply button, since the panel is also the list and staged criteria
  would leave the list disagreeing with the controls above it.

### Conversations — and what the production audit found

- **Search band**: full-width search + "New message". The Filters button died;
  scoping moved into the thread-list card header, next to the list it scopes.
- **Card header**: "Conversations" + an "Inbox ⇅" control opening the scope menu.

**Production audit — the semantics we mirrored.** Production splits this across
*two* controls (a folder pill row and a flat assignment select); the landed
design consolidates them into one menu, but the behaviour underneath is
production's:

- **Assignment is a single exclusive axis.** Production holds three refs and
  every setter nulls the other two, so picking a department *replaces*
  "Assigned"; the server rejects more than one assignment param. All conversations
  / Assigned / Unassigned / a department / a person are one single-select axis,
  not five checkboxes.
- **Folder and assignment STACK (AND).** Changing folder doesn't clear
  assignment, so "Archived + Housekeeping" is reachable.
- **Department matching is TRANSITIVE** — the department itself, or a user who
  belongs to it. User matching is exact only.
- **"Assigned"/"Unassigned" mean assigned to anyone**, not to me. There is no
  "assigned to me" in production.
- **Copy is production's verbatim**, including "Archived" (not "Archive") and
  "All conversations".

**Channels: declined.** An earlier pass built a channel axis from the mock. The
audit found production has no channel filter on the conversation list at all — no
channel param in the request schema, and "Non-Web Chat" appears nowhere in the
codebase — and the designer's call was "we don't do channels then don't add it".
The axis is gone: the CHANNELS section, the scoping predicate, `Thread.channel`
and the `ThreadChannel` type. **Message-level channel data is untouched** — the
inbound SMS/WhatsApp/Email label, "Send via SMS", and delivery-status rendering
all still run on `Message.channel`; it was only ever the list-scoping axis that
was invented.

**The menu is one control with TWO stacking axes**, which is exactly production's
model:

| Axis | Options | Behaviour |
|---|---|---|
| Folder | Inbox / Archived / Blocked | single-select |
| Assignment | All conversations / Assigned / Unassigned / a department / a person | single-select — a department replaces "Assigned", a person replaces the department |

The two AND together, so "Archived + Housekeeping" is reachable. **Two ticks are
visible at once** (one per axis), so an active row also takes the selection
register's `colorBlueDark5` tint — that is what makes each read as "the choice in
this section" rather than as multi-select. No radio pattern was invented; the
design system has none to borrow.

**The trigger names the combined scope**, not the verb: "Inbox" when assignment
is default, otherwise "Inbox · Housekeeping" / "Archived · Unassigned". It
truncates at the card-header width with the full scope on hover.

- **Thread header**: ⓘ, then Archive as a TEXT button, then the kebab. The
  composer's emoji icon was already present.

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
- **Broadcast** redesign — step 1 (the A/B baseline reskin + settled fixes) landed 2026-07-28; see "Broadcast — step 1 baseline" above. Steps 2–4 (recipients panel, filter-modal restructure, rich audience rows) are still out.
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
7b. **Compact date control** — a 32px rounded-6 row (calendar icon + formatted date, 1px `colorBlack6` border) with a transparent native date input laid over it. Hand-rolled in `BroadcastGuestList` to replace `CanaryInputDate`, whose full-height bordered box dominated the 212px recipients column. Designer asked for it and accepted it as an in-branch override. The library still has no compact/inline date variant.
7c. **Floating panel shell** — `components/products/messaging/FloatingPanel.tsx`. Fixed inset card + scrim + two-phase mount + 240ms slide/fade + reduced-motion, z 40/39 under `zIndex.modal` (50). Used by Conversation Details, the broadcast delivery panel and the scheduled-broadcast panel. Promote once a second product needs a right-side panel.
7d. **Overflow (kebab) menu** — ⚠ **SUPERSEDED 2026-08-21, the premise was stale.** `@canary-ui` v0.6.0 DOES export `CanaryOverflowMenu` — custom `trigger`, `placement`, `isDanger`, `isDivider`, click-outside included — so "exports no equivalent" was wrong. Every kebab that could ride it now does (`components/core/ActionMenu`, the thread header's Block/Unblock menu, the status pill's menu). What remains is a narrower, sharper ask: **per-item colour and a per-item DISABLED state with a hint**. `item.label` is typed `string`, every non-divider item is unconditionally clickable and closes the menu on click, and item colour is `colorBlack2`-or-danger set inline with no hook. That is what keeps the panel's `Kebab` — whose whole point is that a disabled item still SHOWS, with the reason underneath — hand-rolled. The broadcast kebabs are pre-cutoff canon and were not re-scoped in the 2026-08-21 pass.
7e. **Scheduled pill** — the composer's rounded-24 "Scheduled for …" chip with a clear affordance. No library chip carries icon + label + dismiss.
7g. **Ledger tokens / roster reason-groups** — variant C's 24px funnel chips and the lock-glyph row treatment. No library chip or list-group covers them.
7f. **Filter chips** — the loyalty quick-select chips and the dismissible value chips (Rate Code / Group Code / Room Number). Hand-rolled in BOTH filter-modal variants. ⚠ **Premise partly stale as of 2026-08-21:** v0.6.0 exports `CanaryChip` with SELECTABLE and REMOVABLE types, and the AI feedback form's reason chips now ride it. The real gap is `customColor` — the chip's registers are colour-locked to blue (selectable) and grey-fill (removable) via inline styles, so any third register needs an `!important` block (see `.chip-source`). The broadcast filter chips are pre-cutoff canon and were not re-scoped in that pass.
8. **Status pill** (online/away/offline) — dot + tonal bg + caret. Note the Figma has a 6-outer/8-inner radius mismatch on this control; we used 6 throughout.
9. Figma mock nits to fix in the file when convenient: Chain-of-thoughts says Room 504 vs Emily's 153; dates say 2024; "TODAY" divider is 5 literal spaces + text; "AI actitivity" layer typo; Filters row hard-coded at 434 bleeding its card padding; Canary chatlog detached at fixed 862.

## Files touched

- `lib/products/messaging/types.ts` — `Thread.isFlagged`
- `lib/products/messaging/mock-data.ts` — thread `'2'` flagged (the Figma's flagged row)
- `lib/products/messaging/store.ts` — v2 added `infoPanelStyle`/`setInfoPanelStyle`; **v3 removed them** (floating panel is now the only mechanic)
- `components/products/messaging/` — `MainNav`, `AppLayout` (SubNav dropped for Conversations; **v3: Filters button + popover on the search row, wired to `currentView`**), `ThreadList` (**v3: segmented control + in-card Filters row removed → just rows**), `ThreadListItem`, `ThreadView`, `MessageBubble` (flat blocks), `MessageFeed`, `DateSeparator`, `MessageComposer`, `Avatar` (rounded-8), `GuestInfoSidebar` (**v3: floating panel + scrim + guest carousel + stays expand**; **v7: pager into the card header; "one fact, one home" scoped to the card header (room dropped from the header); expanded row detail is production's COMPLETE reservation-details block — phone/email/dates/room/confirmation/check-in/check-out**). `PrototypeVariantToggle` **deleted in v3**.
- `app/(dashboard)/messages/page.tsx` — card-on-canvas composition; **v3: 35/65 flex-basis columns; floating info panel (no push resizing); `currentView`/`setCurrentView` passed to AppLayout for the Filters popover**; **broadcast step 1: the `PrototypeVariantToggle` FAB is scoped to the Conversations tab**

### Broadcast — step 1 baseline

- `lib/products/messaging/broadcast-mock-data.ts` — `mockSavedFilters` removed
- `lib/products/messaging/broadcast-store.ts` — sticky selection mirroring production, segment lookup against the guest-journey store, `segmentSavedToast`; `savedFilters` + `saveFilter`/`updateFilter`/`deleteFilter` + manage-filters modal state removed; `loadedSavedFilterId` → `loadedSegmentId`
- `components/products/messaging/broadcast/` — NEW `BroadcastAudienceCard`; `BroadcastView` (two cards on canvas), `BroadcastGroupList` (audience selector + GROUPS kebab), `BroadcastGuestList` (recipients zone), `BroadcastThread` (audience header), `BroadcastMessageBubble` (flat blocks), `BroadcastMessageFeed`, `BroadcastComposer` (Conversations anatomy + send confirm), `FilterGuestsModal` (live match count + real save toast). `BroadcastSubNav` and `ManageFiltersModal` **deleted**.
- `components/products/messaging/AppLayout.tsx` — broadcast control band removed
- `app/globals.css` — orphaned `.broadcast-group-list li` rule removed

## AppShell V2 migration (2026-07-30, library v0.6.0)

The prototype now renders inside `CanaryAppShellV2`. V1 (`CanaryAppShell`,
`CanarySidebar`) is deprecated in v0.6.0 — and, in practice, no longer usable:
`CanaryAppShellProps` **dropped `propertyName`, `userProfile` and
`reservationStatus` entirely**, so the V1 shell in 0.6.0 has no property
switcher, no user chip and no PMS pill. The upgrade forced the migration; it
wasn't optional. Both layouts moved — `(dashboard)` and `(settings)`.

**What V2 gives us, and the exact API used** (from
`node_modules/@canary-ui/components/AI_REFERENCE.md` + `dist/index.d.ts`):

| Concern | V1 | V2 |
|---|---|---|
| Property | `propertyName="Statler New York"` | `property={{ name, code }}` — name **and** code in the sidebar switcher |
| User | `userProfile={{ name, role, avatarUrl }}` | `user={{ name, avatarUrl }}` in the sidebar footer |
| PMS pill | `reservationStatus={{ label, isConnected }}` | same shape, now on the top bar |
| Page title | `pageTitle` | **derived from `selectedSidebarItemId`** — don't pass it |
| Nav groupings | `standardMainSidebarSections` | `standardMainSidebarSectionsV2` (Communications · Guest Management · SDM) |
| Settings back | `sidebarTitle` + `sidebarBackButton` slot | `sidebarBackLabel` + `onSidebarBack` |
| Settings entry | a `settings` nav item | a sidebar **footer button** — `onSettingsClick` |
| New | — | `teamChat={{ badge }}`, `insight={{ label }}`, `copilot={{ message }}` |

Both badges the canon frames show are real props: `addBadge(...)` still works on
the V2 sections (it is section-shape generic, and `CanarySidebarV2` renders
`item.badge`), and Team Chat has its own `badge`.

**What V2 does NOT support that we had:** the user's **role** ("Front desk").
`SidebarV2User` is `{ name, avatarUrl }` only — the footer shows a first name.
Following the canon frames, the user is now just "Theresa". Also gone: the
`amenities`, `payment-links` and `id-verification` nav ids (not in the V2
groupings), so their route-map entries were dropped; they pointed at routes
this prototype never had.

**Ours, kept:** `MainNav` (Conversations/Broadcast tab strip + online-hours
caption + status pill) still renders full-bleed directly under the top bar,
which is what `contentPadding="none"` is for.

**Died:** `components/products/messaging/PageHeader.tsx` — a second, unused
`CanaryPageHeader` carrying its own "Statler New York" property switcher. It
had no importers and would not have compiled against 0.6.0 anyway.

### ⚠ Height chain under V2 — re-verified, one change

The `html, body { height:100%; overflow:hidden; overscroll-behavior:none }`
lock stays, and matters MORE than before. But the `100vh → 100dvh` half of the
fix **stopped reaching the shell**:

- V1 sized its root with the Tailwind **classes** `h-screen min-h-screen`, so
  the unlayered `@supports` override in `globals.css` won on the cascade.
- V2 sizes its root with **inline styles** (`height: 100vh; minHeight: 100vh`).
  No class selector can beat an inline style.

Consequence if left alone: document scroll is still impossible (the html/body
lock is doing that job), so the "app scrolled out of the viewport" bug cannot
return — but on any browser with dynamic chrome the shell would be *taller than
the visible area and clipped*, putting the bottom of the messaging UI below the
fold with no way to reach it.

Fix: both shells pass `className="canary-shell-dvh"` — V2's documented
`className` prop lands on that same root — and `globals.css` clamps it with
`height/min-height: 100dvh !important` under `@supports`. `!important` is the
only thing that outranks an inline style; this is the one place in the branch
it is justified.

`FloatingPanel`'s hardcoded `top: 56` (scrim) and `top: 72` (panel) were old
V1-header constants. They now read `shellV2.topBarHeight` (52) and
`shellV2.topBarHeight + 16`, so the panel tracks the shell instead of a number
someone has to remember.

### ⚠ Cold-start crash in the broadcast store (fixed in the same pass)

`getGuestEntriesForGroup` read its date as
`useBroadcastStore.getState().selectedDate` — but the store's **initial state**
calls it (via `getSelectableGuestIds`) inside `create()`, before the
`useBroadcastStore` binding exists. Temporal dead zone: a cold module
evaluation threw `Cannot access 'useBroadcastStore' before initialization` and
every route importing the broadcast surface 500'd. It survived typecheck and
HMR because on a warm reload the binding is already initialised — only a real
restart (this one) exposes it.

Fixed structurally, not with a guard: `date` is now an explicit required
parameter on `getGuestEntriesForGroup`, `getFilteredGuestEntries`,
`getSelectableGuestIds`, `getVisibleSelectableIds`, `getAudienceFacts`,
`getAudienceSplit` and `getFolderPopulation`. Store actions pass
`get().selectedDate`; components pass the store's `selectedDate` (which also
makes the memos correctly date-reactive); initial state passes
`INITIAL_SELECTED_DATE`, the same constant that seeds `selectedDate`, so the
two cannot drift. **Nothing below the store in that module may read the store
back** — the type signature now enforces it.

## Batch 2 — thread-list selects, AI message anatomy, composer (2026-08-19)

Landed frame: **2038:57666** (plus the `dd-allconv` / `dd-inbox` / `composer` /
`ai-off` / `steps-open` / `steps-hover` states). Frame 2048:39135 was reference
only — its side panel is a later batch, and its "Filters" header button and
older steps arrangement are both dead.

### 1. The list card header is TWO selects, not a title + one menu

`ThreadScopeMenu.tsx` no longer exports one consolidated menu. It exports
`AssignmentSelect` (left) and `FolderSelect` (right) over a shared `ScopeSelect`
shell. **The semantics did not move**: assignment is still one single-select
axis whose choices null each other (production's rule), folder is still
independent, and the two still AND together.

What changed is legibility. One trigger naming both axes had to concatenate
them ("Inbox · Housekeeping"), which read as a single compound state rather than
two stackable ones. Two triggers each name their own axis, so the AND is visible
in the layout instead of in a separator character.

The assignment select occupies the slot the **"Conversations" card title** used
to hold. The list is self-evidently the conversations; spending the title slot
on the noun bought nothing, and spending it on the current scope buys the one
fact a user actually needs before reading the rows.

| | Trigger | Menu |
|---|---|---|
| Assignment | "All Conversations" 16px black + blue ⇅ | 264px · STATUSES / DEPARTMENTS / STAFF overlines, hairline dividers between sections |
| Folder | "Inbox" 14px blue + blue ⇅ | 176px · Inbox / Archived / Blocked |

Menu register: white rounded-8, 1px `colorBlack6`, **no drop shadow**, and a
right-aligned check on the active row with **no blue selection tint** — with one
axis per menu there is only ever one tick on screen, so the tick carries it
alone. (The old consolidated menu needed the tint precisely because two ticks
were visible at once and read as multi-select.)

`maxHeight` is 480px, which clears the full assignment list (~460px) today. The
popover lives inside the card's `overflow-clip`, which is fine at these widths;
the scrollbar is invisible, so a cap that bit into the list would silently hide
its last row — hence sizing the cap to the content rather than the reverse.

### 2. AI message anatomy — the batch's centre of gravity

An AI message is no longer a staff message with a different name colour:

```
[orb]  Canary · Completed 6 Steps ⌄                          5:25 PM
       ┌────────────────────────────────────────────────┐
       │ ✓ Search_for_reservation… · Found Emily Smith … │   (toggled)
       └────────────────────────────────────────────────┘
       Thanks for letting us know!
       DELIVERED  ( 3 SOURCES ⌄ )     ⓘ  👍  👎   ← on hover
```

**Steps are UNIVERSAL, not a hero garnish.** Every `sender: 'ai'` message in the
mock carries a trace and a `sourceCount`, because the feature is observability:
a hotelier should be able to ask "why did it say that?" of *any* answer, not
just an interesting one. Seeding only the exemplar would have designed a demo,
not a feature. The card is **closed by default everywhere** — with steps on
every message, defaulting open would bury the conversation under its own audit
trail. The caption is the toggle.

Step rows render `Tool_name · Narrative` verbatim from the trace. We do NOT
normalise the tool names: the frame's own six steps mix snake_case
(`Search_for_reservation_by_calling_phone_number`) with proper nouns (`Guest
Profile`, `Decision`), and that mixture is what a real trace looks like.

⚠ The primary exemplar (thread `'1'`, message `m2`) carries the frame's six
steps verbatim, which name "Room 504, Checking Out Today" and "Gold Elite" while
Emily is room 153, Diamond Elite, arriving. That is the Figma copy nit already
logged in the design-system TODO above ("Chain-of-thoughts says Room 504 vs
Emily's 153"), reproduced on purpose. Do not "fix" it in code.

**The orb** is PORTED from the email-channel-ai worktree
(`components/products/email/AiDraftCard.tsx` + its `globals.css`): an 18px
living gradient blob — four translucent colour ribbons drifting, scaling and
morphing at incommensurate speeds over a pearl ground, with a pulsing white
core, all pure CSS off a single `--orb-speed` custom property. Here it keeps its
18px size and sits centred in a 32px rounded-8 gradient-bordered tile so it
drops into the message-avatar slot without changing the feed's rhythm. It idles
**slower** than on the email draft button (`--orb-speed: 1.6` vs `1`) — that one
is a transient affordance, this one sits in a message list forever.

### 3. Three footer registers, one slot

All three live in the same 10px uppercase caption line:

1. **Delivery status** (outbound) — production's ladder, logic unchanged.
2. **"AI CHOSE NOT TO RESPOND"** (inbound, `Message.aiDeclined`) — a blue
   underlined link after the channel caption. Silence from the agent is a
   decision; an unexplained silence reads as a bug. Naming it turns a gap into
   a fact.
3. **"MESSAGE FAILED TO SEND"** (outbound, `status: 'failed'`) — a red
   underlined link that **replaces** the old failed register (red row + alert
   icon + "Learn more"). The state logic is untouched, only its dress:
   collapsing three elements into one link puts the failure in the same rhythm
   as every other caption instead of shouting a whole extra row.

All three exemplars sit on thread `'1'` so one screen shows all three.

### 4. Composer

- **Dead:** the "Send via SMS" split button + channel chevron. The channel is
  already named twice (the placeholder, and every inbound caption) and the
  picker had nothing to pick — production routes on the thread, not per send.
  One square blue send icon-button now.
- **Dead:** the `CanarySwitch`-in-a-gray-pill AI toggle.
- Tool icons are **bare**: 16px, zero padding, no background boxes, 12px gaps,
  gray → blue on hover. Five inert affordances should not out-weigh the two
  live controls opposite them.
- No internal divider. The textarea and the toolbar share one field, so the
  composer reads as one place to type rather than a form with a footer.
- The send button stays **full-strength blue when empty** (the frame's idle
  state) while remaining `disabled`; only the cursor gives that away.

**The AI pill** is the composer's second live control:
- **On** — "AI On" in the shared AI gradient, pearl fill, static pink→lavender
  hairline. The agent is working; it does not need to ask for attention.
- **Off** — "AI Off" in plain gray, and the 1px border carries a slowly
  **revolving hue wheel** (a conic gradient whose start angle animates via a
  registered `@property`). Colour moves; geometry does not — no wobble, no
  pulse, no scale. Hues are deliberately **desaturated**: at full chroma a 1px
  rainbow on a 50px pill reads as a highlighter and out-shouts the send button.
  Under `prefers-reduced-motion` the same gradient renders static.

### 5. Store — AI is per-thread now

`aiEnabled` was one global boolean doing two unrelated jobs. It has been split:

- `aiEnabled` (unchanged, still global, still off) = the **demo auto-response
  simulation** through `/api/claude`, read by the page's send handler. No longer
  reachable from the composer.
- `threadAiEnabled: Record<string, boolean>` + `isThreadAiEnabled` /
  `toggleThreadAi` = the **AI agent switch**, scoped to the conversation, which
  is what the pill drives. Production scopes it this way for a reason: an agent
  paused on an angry thread must stay running on every other one. Sparse map,
  absent ⇒ **ON**, matching production's default and the frame.

### 6. Thread header

Right actions are now three **bare** icons in order — archive, ⓘ, kebab. Archive
was a text button; the info button carried a blue tonal pressed fill. Both are
gone: `IconAction` is a 28px square with **zero padding**, transparent at rest,
neutral 8%-black wash on hover and while pressed. No blue pressed tint — the
surface already spends blue on selection and on links, and a third blue state
made "pressed" compete with "selected". The kebab popover lost its drop shadow
(border only, branch-wide).

### Row parity — already there

The frame's row additions needed **no new data**: `requestCount` already renders
as ticket-icon + count (Emily 153, Marco, Kristin), `res-marco-nov.room` is
already `"112 (reserved)"` (the row uppercases it), and PLATINUM ELITE already
exists on `guest-olivia` — whose canonical `#E2E7EA` / `#3C5D71` tag colours are
**pixel-identical to the frame**, and whose 43-character name is the truncation
exemplar. Nothing was invented.

### Promotion candidates (for the library pass)

Add to the design-system TODO list above:

10. **Gradient AI text register** — `.ai-gradient-text`, one magenta→violet ramp
    shared by the "Canary" sender name and the "AI On" pill label. Every
    AI-authored surface should read as one voice.
11. **Orb avatar** — `.ai-orb*` + the 32px `.ai-orb-tile`. Second product to use
    it (after email), so it has earned promotion.
12. **Steps card** — bordered rounded-8 trace list, `✓ Tool · Narrative` rows,
    12px caption register. Generic to any agent surface.
13. **Sources chip** — bordered rounded-full 20px caption pill with a chevron.
    The library has no caption-weight chip.
14. **AI pill** — gradient-bordered toggle, with the animated-border "off"
    variant. The `@property` conic technique is reusable for any "dormant, tap
    me" control.
15. **Two-select card header** — a title-slot select paired with a right-aligned
    scope select. Any list card with two scoping axes wants this.
16. **Bare-icon toolbar / `IconAction`** — ⚠ **REFRAMED 2026-08-21, the premise
    was stale.** "The library only has padded/boxed icon buttons" was wrong
    against v0.6.0: `ButtonType.ICON_SECONDARY` is already a transparent,
    zero-padding icon button with a wash that only appears on hover, and every
    icon control on this surface now renders through it. Two real gaps remain,
    and they are what the ask should have said all along:
    **(a) the wash is BLUE.** It is 8% of the resolved `ButtonColor`, which is
    `colorBlueDark1` for every non-status colour — `HEADING_TEXT`, `FONT` and
    `FONT_SECONDARY` are unimplemented in the compiled switch and fall through
    to it. There is no grey ButtonColor and no neutral register, so every icon
    button here carries `.icon-btn-neutral` to repaint the wash layer black.
    **(b) the size ramp stops at 24px.** TINY is the floor; the frames draw 30,
    28, 20 and 18. A smaller step, plus an `isPressed` latch and an `aria-label`
    passthrough, would retire the whole `.icon-btn-*` block.
17. **Caption-link register** — 10px uppercase underlined links in the footer
    slot (blue informational / red failure). Replaces the bespoke failed-message
    row.

---

## Batch 2.1 — Miguel's eyeball pass (2026-08-20)

Same frames as batch 2 (**2038:57666** + `dd-allconv` / `dd-inbox` /
`searchbar-node` / `steps-hover` / `composer` / `ai-off`). Eight verdicts on
what batch 2 actually put on screen. Three of them supersede batch-2 decisions
outright — those are marked ⚠.

### 1. ⚠ Staff is blue

> "Staff is blue, guest is black, AI is all the cool shit." — Miguel

Supersedes "everyone's name is black; only the AI is special". The staff sender
name is `colorBlueDark1` and the staff initials tile is `colorBlueDark5` ground
with `colorBlueDark1` glyphs — a new `tone` prop on `Avatar` (`neutral` |
`blue`), which photo avatars ignore because the photo is the identity.

Three senders, three registers, all readable from one column:

| | Name | Avatar |
|---|---|---|
| Guest | `colorBlack1` | photo, or gray initials tile |
| Staff | `colorBlueDark1` | blue initials tile |
| AI | magenta→violet gradient | the animated orb tile |

Black-for-everyone made the feed one undifferentiated voice — you had to *read*
the name to know which side sent it. Blue is already the product's "us" colour
(actions, links, selection), so the property's own replies inherit it and stop
reading as a third kind of guest. The escalation neutral → brand → alive is the
point: the AI is still the only sender that gets motion.

### 2. Two hover states lost their boxes

- **"Completed N Steps ⌄"** sits inline with the sender name, so a hover
  background drew a chip in the middle of a line of text. Hover is now the text
  itself: gray → black, nothing else moves.
- **The AI footer icons (ⓘ 👍 👎)** lose the gray chip entirely — the frame
  draws them naked. Bare, gray at rest, each going `colorBlueDark1` on its own
  hover. That is deliberately the SAME gray→blue the composer's tool icons use,
  so every bare icon on this surface answers the pointer identically. Thumbs-up
  still latches blue on click.

### 3. ⚠ The indicator cluster hugs right

Supersedes the reserved-slot rule. The attention dot used to render an
always-present 10px box (transparent when idle) so "the row never shifts". What
that bought was a hole: a flagged-but-read row parked its flag 10px plus a gap
short of the right edge, floating against nothing.

Both indicators are now conditional, in one `shrink-0` cluster pinned right by
the preview's `flex-1`, in the frame's order — **dot, then flag**. One, the
other, or both; whichever exist, the last one lands on the right margin.

### 4. ⚠ Thread rows hover at 8% black

`#f9fafb` is ~2% over white. Next to a `colorBlueDark5` selected row it was
invisible, and "where my pointer is" has to be tellable from "what is open" at a
glance. Rows now take the neutral 8%-black wash this branch already uses for
every transient control state (thread-header `IconAction`, the scope-select
trigger). Neutral vs. blue also keeps the two states in different colour
families rather than two strengths of the same one.

⚠ **Root cause, found on inspection: the hover was not weak, it was dead.** The
row set `backgroundColor: 'transparent'` inline for the unselected case, and an
inline style outranks any class — so `hover:bg-*` never painted, at `#f9fafb` or
at 8%. Unselected rows now set no inline background at all and let the class own
the state; selected rows keep the inline fill because they have no hover to
lose. **Worth grepping for elsewhere**: the same
`isSelected ? '' : 'hover:bg-…'` + inline-`transparent` pattern appears in
`broadcast/BroadcastGroupList.tsx`, which is likely dead for the same reason
(untouched here — out of scope for this batch).

### 5. Search + "New message" moved INSIDE the list card

Per node `searchbar-node`. The band used to be full width above BOTH columns,
which was a lie about its reach — search filters the thread list and "New
message" opens a thread; neither touches the 65% column it was hanging over, and
stretching the input to ~1000px made a control that returns a 350px list look
like a global search.

The card now stacks: **header selects → hairline → search band → rows.** Every
control that narrows the list is inside the thing it narrows, top to bottom in
order of coarseness (which folder → which assignment → which words). No divider
under the search band — it and the rows are one list surface. The band's
horizontal padding is the ROWS' 8px, not the header's, so the field's edges line
up with the row cards below rather than the triggers above.

`AppLayout` shed `searchQuery` / `onSearchChange` / `onNewMessage`; threading
them through a shell that only forwarded them is how the band ended up spanning
columns it does not scope. The 16px it used to contribute is now the content
row's own `paddingTop`.

### 6. The scope menus are rebuilt on CanarySelect's contract

> "Take the CanarySelect as the base structure so that it's not a massive
> deviance from the real product." — Miguel

**Finding: `CanarySelect` is a thin wrapper around a native `<select>`.** It
forwards a ref to `HTMLSelectElement`, spreads `SelectHTMLAttributes` onto it,
and renders `options` as plain `<option>` children — so its popover is drawn by
the operating system. None of this file's design contract survives that:

| The frame needs | Native `<select>` / CanarySelect gives |
|---|---|
| STATUSES / DEPARTMENTS / STAFF overlines | no grouping at all — `options` is a FLAT array, no `<optgroup>`; even with one, the label's type and colour are OS-controlled |
| hairline dividers between sections | nothing; not expressible |
| a right-aligned check row | an OS-drawn selection mark, position and glyph not ours |
| 264px / 176px popovers, white rounded-8, 1px `colorBlack6`, no shadow | OS-sized and OS-positioned |
| a BORDERLESS trigger in the card-title slot, 16px medium + ⇅ | a full-width bordered field on the library's fixed 32/40/48px ramp |

So "keep the trigger and the popover, replace only the menu content" was not
available — there is no separable trigger or popover to keep. What the rewrite
keeps instead is the **contract**, so a future swap is mechanical:

1. Options ARE the library's `CanarySelectOption` (`{ label, value, disabled? }`),
   extended by exactly ONE field — `section` — which is the capability gap
   itself. Drop `section` and the arrays feed `<CanarySelect>` unmodified.
2. One controlled `value` + one `onChange`, single-select, `disabled` honoured.
   Production's assignment exclusivity is now *structural*: one value, nowhere
   to put a second assignment. (The one deliberate signature deviation:
   `onChange` hands back the value, not a `ChangeEvent<HTMLSelectElement>` —
   our trigger is a button, there is no such event to forge.)
3. Trigger heights come off the library's `InputSize` ramp, not magic numbers.
4. The a11y contract a native select gave for free is **rebuilt, not dropped**:
   `combobox` / `listbox` / `option` roles, `aria-selected`,
   `aria-activedescendant`, and full keyboard operation (Enter/Space/↓/↑ to
   open, ↑/↓/Home/End to move, Enter/Space to pick, Escape/Tab to close, focus
   returned to the trigger). The hand-rolled version this replaces had none of
   it.

⚠ **The placeholder quirk was checked.** `CanarySelect` renders its
`placeholder` (or, failing that, its `label`) as a real `<option value=""
disabled>` — a phantom row inside the menu. `ScopeSelect` has no placeholder
prop at all: both axes always hold a real value ("All conversations" / "Inbox"
are values, not empty states), so neither menu can grow one. Verified in the
browser — 9 options and 3 options, no extras.

Section overlines are `role="presentation"`: a `role="listbox"` may only contain
options and groups, and with no library grouping to map onto, the overline stays
a visual affordance. The option labels are unambiguous without it.

### 7. The AI pill grew an orb, a state model, and an ignition

Miguel approved the design ("try it"). The pill carries a **14px orb left of its
label in both states** — the same component as the 32px message avatar, scaled
by `--orb-size`. A toggle that only says "AI On" *describes* a state; one that
shows the agent breathing *is* the state, and it makes the thing you flip
visibly the thing that speaks.

| State | Orb | Border | Label |
|---|---|---|---|
| On, idle | calm (`--orb-speed: 1.6`) | quiet pearl hairline | AI gradient |
| On, hover | faster (`0.85`) | tint DEEPENS | AI gradient |
| Off | dormant — grayscale, 0.72 opacity, barely drifting (`6`) | the revolving hue wheel, unchanged | plain gray |
| Igniting | waking (see below) | a spark sweeping out of the orb | AI gradient |

**Off → On is an ignition**, ~650ms ease-out, three effects in one window so it
reads as a single gesture rather than a pile-up:

- the orb **wakes** — `ai-orb-wake`: saturation blooms back from gray, a scale
  pulse 1 → 1.35 → 1, and one full fast revolution of the whole blob. A single
  360° turn of the orb reads as the petals whipping round once; animating each
  ribbon's own duration instead would just restart four timers mid-flight.
- the petals **race** — `--orb-speed` drops to `0.3` for the window, then snaps
  back to calm when the class comes off. The snap is invisible under the wake
  animation's own motion, which is exactly why the two are co-timed.
- the border **fires** — `ai-pill-spark`: a conic gradient **anchored at the
  orb** (`at 14px 50%`, the orb's own centre) sweeps its bright band around the
  ring and fades, leaving the quiet on-border underneath. Because the origin is
  the orb, the light reads as coming *out of it* rather than orbiting a centre
  nothing is at.

**On → Off gets no fanfare**: a quick desaturate (a 260ms `filter` transition),
then the dormant drift. Turning something off should not be a performance.

The spark is a sibling ring at `inset: -1px` (an absolutely positioned child is
offset from the *padding* box, so `0` would sit inside the border), cut with
`mask-composite: exclude` rather than the padding-box/border-box background
trick the pill itself uses — that trick needs an opaque inner layer, and this
overlay must keep its interior transparent so the pearl shows through.

Ignition is driven by the **click**, not by an `aiEnabled` prop diff: AI state is
per-thread now, so a diff would fire the animation every time the user opened a
thread whose agent was already on, and the pill would appear to switch itself.

Under `prefers-reduced-motion` the whole thing collapses to a crossfade — the
orb's `filter` transition is the only motion, the pulse/revolution/sweep never
run, and both borders render static.

### Files touched (batch 2.1)

- `components/products/messaging/AiOrb.tsx` — **new.** `<AiOrb size>` +
  `<AiOrbTile>`; the orb is now one component at two sizes.
- `components/products/messaging/Avatar.tsx` — `tone` prop.
- `components/products/messaging/MessageBubble.tsx` — staff blue, `StepsToggle`,
  boxless `FeedbackIcon`, uses `AiOrbTile`.
- `components/products/messaging/ThreadListItem.tsx` — indicator cluster, hover.
- `components/products/messaging/ThreadList.tsx` — `search` slot.
- `components/products/messaging/ConversationControls.tsx` — doc only (re-housed).
- `components/products/messaging/AppLayout.tsx` — three props dropped.
- `components/products/messaging/ThreadScopeMenu.tsx` — rebuilt on the
  CanarySelect contract.
- `components/products/messaging/MessageComposer.tsx` — pill orb + ignition.
- `app/globals.css` — `--orb-size`, the pill state model, `ai-orb-wake` /
  `ai-pill-spark`.
- `app/(dashboard)/messages/page.tsx` — search band wired into the card.

### Promotion candidates — additions

Extending the batch-2 list:

18. **Sectioned single-select** — ⚠ this is the sharpest foundation ask on the
    list. `CanarySelect` cannot express a grouped menu at all, because it is a
    native `<select>` whose option model is a flat `{label, value, disabled}[]`.
    Two capabilities are missing and both are generic, not messaging-specific:
    **(a) option SECTIONS** — an overline + divider grouping, i.e. an
    `optgroup`-equivalent the library actually styles; **(b) a CHECK-ROW
    selected affordance** — a right-aligned tick instead of an OS mark. A third,
    softer ask: **(c) a borderless/inline trigger variant**, for selects that sit
    in a title slot rather than a form field. `ThreadScopeMenu.ScopeSelect` is a
    working reference implementation of all three, keyboard and ARIA included.
    ⚠ Also worth fixing at the source: `CanarySelect` renders its placeholder as
    a real disabled `<option>`, so every placeholder'd select carries a phantom
    first row.
19. **Orb size parameterisation** — `.ai-orb` is now driven by `--orb-size`
    (every internal layer is percentage-based) as well as `--orb-speed`. One
    component, two sizes on this surface already (32px message avatar, 14px
    pill). Promote the component, not two copies of the CSS.
20. **AI pill state model** — supersedes item 14. The pill is no longer just a
    gradient-bordered toggle: it is orb + label with four states (on / on-hover /
    off-dormant / igniting), a ~650ms three-part activation gesture, a
    no-fanfare deactivation, and a reduced-motion crossfade. The reusable pieces
    are the **dormant-orb treatment** (grayscale + near-stopped drift = "asleep,
    not gone"), the **anchored border sweep** (`mask-composite: exclude` ring
    whose conic origin is a specific element, so light appears to come out of
    that element), and the rule that **activation gets a gesture and
    deactivation does not**.

---

## Batch 3 — Conversation Details, rebuilt guest-profile-first (2026-08-20)

The panel is a **wholesale replacement**, not an edit. `GuestInfoSidebar` is
deleted, along with `LinkReservationModal` and `UnlinkReservationModal`.

### Why the old one had to go

The previous panel was organised around **the link**: a stack of cards, one per
linked reservation, grouped by *how each link came to exist* (phone-matched vs.
staff-made) and paged through a carousel. That is the shape of the data model,
not the shape of the reader's question. A hotelier opens this panel to ask "who
am I talking to, and what do I need to know about them" — and answering it meant
paging a carousel to reassemble one person out of several rows.

The new panel starts from **the person**:

```
[avatar]  Emily Smith  CHECKED-IN                                      ⋯
┌─ Assigned to ─────────────┐ ┌─ Emily's Reservations ─────────────────┐
│ Miguel Santana          ⇅ │ │ 4                                    › │
└───────────────────────────┘ └────────────────────────────────────────┘
                  ( Show reservation details ⌄ )
── Linked Reservations · Upsells ④ · Service Tasks · Call History ──────
```

One person in the spotlight; her stays behind a count; everything else attached
to her behind four tabs. **Every number on screen is derived** — the reservation
count and the Upsells badge are `.length`s, never literals.

### The panel standard (new, and the reusable thing here)

`components/products/messaging/panel/PanelShell.tsx`

- **600px fixed.** The contents have one right layout; a resizable panel would
  buy nothing and cost four breakpoints.
- **12px to the top, right and bottom of the VIEWPORT.** The same gap on three
  sides is what makes it read as one floating object instead of a drawer hinged
  to an edge. Height is whatever the viewport leaves; content scrolls inside.
- **Over everything, top bar included** (panel z-index 45 / scrim 44, both below
  `zIndex.modal` so a CanaryModal opened from inside still stacks above).
- **rounded-16, 1px `colorBlack6`, NO shadow** — the branch-wide rule.
- Same two-phase mount + reduced-motion downgrade + scrim-to-close as
  `FloatingPanel`.

⚠ **Deliberately NOT `FloatingPanel`.** That shell stays the right one for the
**broadcast** panels (480px, tucked under the top bar, shadowed) and they are
untouched. The two panels have genuinely different jobs; one component being
both would mean five props that each mean "be the other one".

### Drill-ins replace, and they stack

Every drill-in takes the whole panel behind `← {Page title}` — no breadcrumb, no
persistent profile header. At 600px a drill-in that kept the root's chrome would
spend a third of its height re-stating where you already know you are. The X
never moves.

Navigation is a translateX track over a real **stack**, so
`Reservations → Guest Scheduled Messages` is two levels deep and Back walks out
one at a time. Nine pages total: root, Reservations, Guest Scheduled Messages,
Call details, Link reservation, Set primary guest, Create service task (plus the
anonymous root variant and the unlink confirm).

### Primary is a SPOTLIGHT, not a link

The load-bearing distinction, and the one most likely to be re-litigated:
`setThreadPrimary` writes **one per-thread display preference** and touches no
reservation. Every candidate in the picker is *already* attached to the thread —
they auto-linked because their guest's phone IS the conversation's number.

The problem it solves is that **a phone number is not a person**. When a family
books three rooms on one mobile, Canary sees three reservations and one number
and cannot know which human is holding it. Nothing in the data will ever tell
it. So the panel asks the one party who does know, and remembers the answer for
this thread. Profile header, Current Reservation band, reservation count and
drill-in, the companion list, the thread-list row and the thread header all
re-index off it.

Link / Unlink remain data operations and are kept structurally separate.

### Linked Reservations = COMPANIONS ONLY

Miguel: *"linked rez are companions to this reservation — Emily's family that
has a separate room but is connected to her."* Self is excluded; a guest listed
as her own companion is a tautology. (The frame showing Emily inside Emily's own
linked list is a stale iteration and was not replicated.)

A **phone-matched** row's "Unlink reservation" renders **disabled with the
reason underneath** rather than being hidden — production hard-blocks it because
the link would only reappear on the next sync, and "you can't do this and here's
why" is information where a missing menu item is a mystery. This is also why the
old modal's "Unable to unlink" variant is gone: it was an error message
pretending to be a dialog, arriving *after* the click.

### Guest Scheduled Messages — a timeline, and real GJ data

**A timeline, not a table.** A table says "here are some records"; a rail says
"here is a sequence, and this is where you are in it". These touchpoints ARE a
sequence, and the question brought to the screen is temporal: what has gone out,
what is coming, where did it break. The rail answers all three, and its one red
dot answers the third without reading a word.

Card anatomy: title + **`CanaryTag` beside the name** — green "Sent" / red
"Failed" / blue "Scheduled" (Miguel's addition over the drawn frame, which
carried status only in the timestamp's *wording*) · right-aligned timestamp ·
channel icon row with failed channels tinted red · per-channel error blocks in
the existing register (gray channel overline, one red `Error {code}: {line}`
with only the carrier code underlined; 30006 / 63016 copy reused verbatim).

**Card rule: "Sent" if ANY channel succeeded.** A message that reached the guest
by email and failed on SMS *did* reach the guest — calling the whole card
"Failed" would send a hotelier chasing someone who already has the information.
Damage stays per-channel, where it happened.

**⚠ The timeline is now COMPILED from the Guest Journey product**
(`lib/products/messaging/guest-journey-link.ts`, read-only import). It used to
be a hand-typed literal with invented touchpoint names — "Pre-Arrival",
"Mid-Stay Check", "Post-Stay Thank You" — none of which exist in the product
that sends those messages. A hotelier who configures "Mid-Stay" in Guest Journey
and reads "Mid-Stay Check" in Messaging is looking at two products describing
one send. Now: titles verbatim from the campaigns, order by journey stage, send
times projected from each campaign's own `timing` against the reservation's real
dates. Booking Confirmation stays as a **system** touchpoint (it fires off the
booking, not off the journey, and is the only card carrying an OTA chip);
failures stay authored, because failure is the state the panel exists to surface
and it has to be seeded to be demoable.

### Reuse: the AI steps trace

`MessageBubble`'s steps card is extracted to `<AiStepsCard>` and rendered inline
in the **call transcript**, between utterances. A voice call is the one channel
a hotelier can't skim, so it carries the same observability a chat AI message
does — and the AI's work should look the same wherever it is shown. An optional
`accent` dress swaps the bordered box for a 2px gradient left bar: inside a
transcript every utterance already has a speaker bar, so a boxed trace reads as
a foreign object in that column.

### Picker / link-flow pattern

One row (`ReservationResultRow`), two pages. Both ask a hotelier to do the same
physical thing — read five facts about a stay and pick the right one — so they
share a row rather than growing two that differ by accident. Facts in order:
**name + lifecycle · phone · confirmation code · dates · room**. Name first
because that's what you were told; dates and room last because those are what
you confirm against. Selection = blue tint **and** a check (the tint alone is
easy to miss on a light row; the check alone is easy to miss in a list of five).

Both pages end in a **sticky tonal-blue commit bar**, disabled until there's a
selection.

### The anonymous variant

No linked reservations ⇒ no guest ⇒ nothing to put a portrait of. The phone
number becomes the title, the reservation card becomes "Link guest", and the
expander opens **thread** details (Name / Phone / Email) instead of a
reservation. This is not a degraded state — it is the ~norm for an inbound
number the PMS has never seen. The "Show/Hide thread details" label flips
correctly (the frame's stale "Show"-while-open label was not replicated).

### Files touched (batch 3)

- `components/products/messaging/panel/` — **new**: `PanelShell`, `panel-ui`,
  `panel-format`, `AssignSelect`, `ConversationDetailsPanel`, `PanelTabs`,
  `ReservationRecord`, `ReservationsPage`, `ScheduledMessagesPage`,
  `CallDetailsPage`, `LinkReservationPage`, `SetPrimaryGuestPage`,
  `CreateServiceTaskPage`, `ReservationResultRow`, `UnlinkConfirmModal`.
- `components/products/messaging/AiStepsCard.tsx` — **new** (extracted).
- `components/products/messaging/Avatar.tsx` — `shape` + a 48px `profile` size.
- `components/products/messaging/{GuestInfoSidebar,LinkReservationModal,UnlinkReservationModal}.tsx`
  — **deleted**.
- `components/products/messaging/ThreadList.tsx` — the row now names the thread's
  derived primary, not `linkedReservationIds[0]`.
- `lib/products/messaging/` — `guest-journey-link.ts`, `panel-selectors.ts`,
  `panel-mock.ts` (**new**); `types.ts`, `store.ts`, `mock-data.ts` extended.
- `lib/core/data/` — Emily's stay history + two shared-phone travellers.
- `app/globals.css` — `.ai-gradient-bar`, `.canary-tag-r4`.

### Promotion candidates — additions

21. **⚠ `CanaryTag` border-radius 2 → 4** — a **design-system change**, called by
    Miguel on 2026-08-20, not a local override. `CanaryTag` hardcodes
    `rounded-[2px]`; at the 10px/compact sizes this surface uses, 2px reads as a
    hard rectangle beside every other rounded-4/8 object in the panel. Until the
    library moves, every tag here opts in via `.canary-tag-r4`
    (`!important`, because the library's arbitrary utility has identical
    specificity and stylesheet order can't be relied on). **The fix belongs in
    the library**, not in a class each consumer has to remember.
22. **The panel standard** — 600px fixed, 12px viewport inset on top/right/
    bottom, over the app chrome, rounded-16, 1px border, no shadow, internal
    scroll per page, `← {Page title}` drill-ins on a real navigation stack. This
    is the reusable primitive: any product needing a detail surface beside a
    working canvas wants exactly this, and there is nothing like it in the
    library today (`CanarySideSheet` is edge-hinged and full-height).
23. **Steps-trace card** — supersedes item 12. Now two surfaces (chat message,
    call transcript) and two dresses (bordered box, gradient left bar). One
    component, promoted with the `accent` variant.
24. **GJ timeline card** — rail + dot + status tag + channel icons + the
    per-channel error register. The *error register itself* (gray channel
    overline, one red sentence, only the carrier code underlined) is the piece
    most worth promoting: every product that sends anything can fail this way.
25. **Reservation result row** — name + lifecycle over phone / code / dates /
    room, with a tint+check selection. Every product that makes a human pick a
    reservation out of a list needs this exact row.
26. **Label/value detail rows** (`DetailRows`) — gray label left, value right, no
    dividers, optional trailing affordance (copy icon, chevron), optional
    link/error colouring. The reservation record's whole anatomy is one call.

### Eyeball / fix-in-post list

- **Profile avatar is a CIRCLE** at 48px, per every panel frame — the feed's
  avatars stay rounded-8 squares. Defensible (row marker vs. portrait) but it is
  a second avatar shape on one surface; worth a look.
- **Set-primary helper copy** is the frame's verbatim and explains the mechanism
  where it could just give the instruction. Copy pass pending.
- **Lifecycle tag case**: uppercase everywhere except the Reservations accordion
  header, which draws sentence case in the frame (it sits beside a 16px date
  line, where all-caps shouts over the date). Two registers for one vocabulary —
  confirm or collapse.
- **Details band ground** is `#F7F8F9`, a literal: there is no token between
  `colorBlack7` (#F0F0F0, too heavy behind body text) and `colorBlack8`
  (#FAFAFA, invisible against white). A token in that gap would be useful.
- **Arrival Date** on the link flow is drawn but inert.
- **Stubs** (deliberate, all no-ops): refresh buttons, the Upsells "+" and its
  external-link icons, service-task kebab items, "Add name" / "Add email" on the
  anonymous thread, "Download Transcript", playback controls, the error-code
  link. Playback is decorative but **coherent** — the scrubber's fill is computed
  from elapsed/total, so it can't contradict the clock the way the frame's does.
  *(Batch 3.1: the service-task kebab is no longer a stub — its one item,
  "Unlink", is wired.)*
- **Full-viewport scrim.** The panel now clears the top bar, so the scrim covers
  the whole window rather than stopping under the chrome. It dims the thread you
  may still be reading; if that reads wrong, the scrim is one style block.

---

## Batch 3.1 — Miguel's eyeball pass on the panel (2026-08-20)

Six fixes, all on the Conversation Details panel. Four are visual; two are the
panel giving up hand-rolled chrome for the library's.

### 1. The control cards answer the pointer in the SELECTION register

"Assigned to" and "{Name}'s Reservations" had a 2%-black wash for hover — which
on a card that already sits on white is indistinguishable from no hover at all.
They now light up in the register the product already uses for "this one":
`colorBlueDark5` fill, `colorBlueDark1` border, label darkening #666 → #000,
120ms. That is the same tint family as the selected thread row and the selected
reservation result row, so the panel's cards and the list's rows say "picked"
the same way.

The two cards are now ONE component (`<ControlCard>` in `panel-ui.tsx`). They
were two copies of the same 40 lines in two files, which is exactly how the
hover states would have drifted apart again.

⚠ Hover is React STATE here, not a `hover:` class — the cards carry inline
colours, and an inline style outranks any class. Same trap already documented
for `ThreadListItem`.

### 2. One line above the tabs, not two

The details zone drew a top hairline AND the tab strip drew its own, so the
closed panel showed two rules 15px apart with a dead gray sliver between them.
The pill's line stays (it is the line the pill straddles); the tab strip's TOP
rule is gone. Its BOTTOM hairline stays — that is the rail the active indicator
sits on.

### 3. The details band expands instead of appearing

The band used to mount and unmount, so a click swapped ~250px of record in with
no transit. It now animates on `grid-template-rows: 0fr → 1fr` — 220ms open on
the panel's own `cubic-bezier(0.16, 1, 0.3, 1)`, 160ms close on an ease-in, with
opacity trailing 60ms behind on open. `prefers-reduced-motion: reduce` drops
every transition to `none` and the swap is instant again.

Why `0fr → 1fr` and not a measured max-height: height can't be transitioned from
`auto`, and a max-height guess has to cover both variants — the anonymous thread
opens 109px of contact rows, a checked-in guest opens 245px of reservation
record. The grid track animates to whatever the content actually is. The track
carries `overflow: hidden`, so nothing flashes a scrollbar mid-transition, and
the collapsed content is `inert` so a Tab key can't land inside a zero-height
region.

The anonymous thread-details expander is the same mechanism and got it for free.

### 4. The tab strip is `CanaryTabs` now

Miguel: *"Are the tabs our components? they're missing their hover states."*
They weren't, and they were. `<PanelTabBar>` (in `PanelTabs.tsx`) is
`CanaryTabs` text/compact, and the hover wash, the blue active label, the 4px
underline and the pink count badge all come from the library. The CALL DETAILS
drill-in's Summary/Transcript strip was the second hand-rolled tab row on this
surface with the same missing hover — it is the same component now too.

**What CanaryTabs could express:** the badge (`CanaryTab.badge`, a pink pill —
no local badge component needed), the hover wash (`hover:bg-black/5`), the
pressed state, the active blue, the underline indicator.

**What it could NOT — two library asks:**

27. **⚠ `CanaryTabs` is UNCONTROLLED.** It takes `defaultTab` and reports
    `onChange`, and there is no `activeTab` prop, so a consumer cannot MOVE the
    tab. This panel moves it from outside three times — thread switch, after
    linking a reservation, after creating a service task. The workaround is a
    remount (bumped `key`) whenever the outside value diverges from the last
    value the library reported; remounting only on divergence keeps ordinary
    clicks on the library's own state, where its transitions still run. **The
    fix belongs in the library**: accept an optional `activeTab` and behave as a
    controlled component when it is passed.
28. **⚠ `CanaryTabs` renders `badge` under a truthiness test**, so `badge={0}`
    prints a literal "0" pill. Every count badge is derived, and derived counts
    are zero most of the time. Zero is passed as `undefined` here; the library
    should treat `0` as "no badge" (or render it, but deliberately).
29. **⚠ `CanaryTabs` has no ARIA tab semantics** — no `role="tablist"` /
    `role="tab"` / `aria-selected`. The hand-rolled strip this replaced had
    them. Worth a library pass.
30. **`CanaryTabs` text/compact draws a 4px label row**, which yields a 33px
    strip where this panel's frame draws 47px. There is no padding or density
    prop, so `.panel-tab-bar` in `globals.css` overrides the internal padding.
    A `density` or `padding` prop would remove the need.

Two deliberate deviations from the old hand-rolled strip, both taken because
they are the library's own contract: the active underline now spans the full tab
(label + its 16px padding) rather than hugging the label ±2px, and inactive
labels are `colorBlack2`/medium rather than `colorBlack1`/regular.

### 5. The service-task kebab is production's

It offered "Mark as complete" / "Reassign" / "Open in Service Tickets" — three
invented stubs. Production's row menu carries **"Unlink" alone, in the danger
register**, because a ticket's LIFECYCLE belongs to the Service Tickets product
and the only thing this panel owns is the ticket's ASSOCIATION with this
conversation. No confirm dialog: production unlinks without one, and unlike a
guest unlink this destroys nothing — the ticket still exists in its own product.
The row leaves the list (`unlinkServiceTask` on the store) and a toast is the
receipt.

No "Open in {vendor}" stub above it: the prototype's `ServiceTask` carries no
vendor, and the reference menu has one item.

### 6. Download Transcript is `CanaryButton`

`ButtonType.SHADED` is exactly the panel's tonal-blue commit register
(`colorBlueDark1` at 10% over white ≈ `colorBlueDark5`) and it brings hover and
press states the hand-rolled button never had. `.panel-commit-button` in
`globals.css` restores the panel's 44px / rounded-8 geometry — `CanaryButton`'s
NORMAL size is h-10 / rounded-4 and neither is a prop.

⚠ Its sibling `PanelFooterAction` (the drill-in commit bar) is still
hand-rolled. Identical geometry and colour, but its hover is an opacity fade
rather than the library's background step. One follow-up edit, deliberately not
taken in this batch.

### Files touched (batch 3.1)

- `components/products/messaging/panel/` — `panel-ui.tsx` (**new**
  `<ControlCard>`), `ConversationDetailsPanel.tsx`, `AssignSelect.tsx`,
  `PanelTabs.tsx` (**new** `<PanelTabBar>`), `CallDetailsPage.tsx`,
  `PanelShell.tsx` (`useReducedMotion` extracted and exported).
- `lib/products/messaging/store.ts` — `unlinkServiceTask`.
- `app/globals.css` — `.panel-tab-bar`, `.panel-commit-button`.

### Not touched, on purpose

- **The details band's ground** (`BAND_BG = '#F7F8F9'`) — Miguel is ruling on it
  separately.

---

## Batch 4 — the AI loop: explanation, feedback, drafts, bands (2026-08-20)

The observability and action layer around the thread. Batch 2 gave every AI
message its trace and three footer registers, and left every affordance a stub.
This batch makes all of them go somewhere, and adds the four things the AI can
put in front of a hotelier without sending anything.

### 1. THE DELINEATION — sidebar = observability, modal = quick action

Miguel's ruling, and the architecture of the whole batch. It is not a taste
call about surfaces; it is a call about ERRANDS.

**Explaining an answer is reading.** You scan it, you compare it against the
thread still visible beside you, you may go and look at a source. A modal for
that blacks out the conversation the explanation is about. So the AI Explanation
is a **panel**, on the panel standard from batch 3 — 600px, 12px to three
viewport edges, over the app chrome, the same shell as Conversation Details. A
hotelier should not have to learn two right-hand cards.

The frames draw it as a floating modal card. That is Figma's convention for
"here is a surface, in isolation" and not a placement instruction — the same
file draws the Conversation Details panel exactly the same way, and that one is
a panel.

**Acting on a verdict is doing.** 👎, editing a one-line fact, reading a carrier
receipt: each is a short errand with a commit and a cancel and no context worth
keeping on screen. Those are **modals**.

### 2. The explanation opens AT the explanation, and has three doors

Title + X, no back arrow — there is nothing behind it. Three affordances land on
the same page:

| affordance | state |
|---|---|
| ⓘ on an AI message | success — a band recapping what was sent |
| "AI CHOSE NOT TO RESPOND" on an inbound message | non-response — intro paragraph + Action Taken, and **no band**, because nothing was sent |
| the "3 SOURCES ⌄" chip | the same page |

The sources chip is the interesting one. Its chevron used to promise a popover
of source statements. That popover would have been a thinner copy of a list the
sidebar already prints — beside the reasoning that selected it, which is the
part that makes the list mean anything. **One source of truth, reachable three
ways** beat two lists that agree until they don't.

Sections are hairline-separated: intro (non-response only) · AI-message band ·
What AI understood · Sources Used + "Go to Knowledge Base" · Action Taken
(non-response only) · Result · footer "Give AI Feedback".

**The orb, not the waveform.** Every frame in this batch draws the AI as a
five-bar equaliser tile — the VOICE product's mark, pasted into a messaging
surface whose feed already speaks in orbs. Miguel: *orb everywhere*. One agent,
one face, and the living one.

**Result variants**: two are drawn and built ("AI successfully responded…",
"AI chose not to respond"). Three more are enumerated in a comment on
`AiExplanation` and deliberately not built — didn't-know (empty Sources is a
different section STATE, not different copy), guardrail-blocked (wants a
"Blocked by" section naming the rule), escalated (Action Taken would have to
name a person or department). Each needs its own frame before it is worth
faking.

### 3. Feedback is one form with two chromes

Sidebar page behind a back arrow (from the explanation's footer) and standalone
modal (from 👎). Same `<AiFeedbackForm>` — not because sharing is tidy, but
because **the taxonomy is the artefact**. The eight reasons are what the loop
actually learns from, and two copies of a taxonomy is one taxonomy plus a future
disagreement.

Chips are **multi-select**. A reply is rarely wrong in exactly one way — "Wrong
Information" and "Should Have Escalated" are routinely both true, and a single
pick makes the hotelier throw away the half of the signal that doesn't fit.
Selected fills `colorBlueDark1` with a white label: the same "this one" blue the
thread row and the reservation result row already use. **≥1 chip gates submit**;
the note is explicitly optional, so the chips are the real submission.

👎 **latches AND asks.** The latch is the verdict and survives the modal being
cancelled — you did disagree, whether or not you explained why. The modal is
where the verdict gets a reason. 👍 stays a bare local latch: there is still no
pipeline behind a compliment, and inventing one would be the only unearned claim
on the surface.

### 4. The band stack, and the rule that orders it

Everything the AI puts between the feed and the composer, top to bottom:

```
  draft card                 a whole message, waiting for a human
  suggested fact   (AI)      the agent asking to learn something
  recommended ticket (blue)  a detection you can act on
  escalation       (amber)   a guest has been waiting
  away             (amber)   the property is not answering
  ───────────────────────────  the composer input
```

**AMBER IS ALWAYS NEAREST THE COMPOSER** (Miguel). It is a rule about what
happens when you start typing: the amber bands are CONDITIONS ON THE MESSAGE you
are about to send — it is going out while the property is marked away, to a
guest who has already waited 24 minutes. They belong in the last line of sight
before the cursor. The AI and ticket bands are things to do INSTEAD of typing,
so they meet the eye on its way down from the conversation rather than on its
way into the box.

A fixed order also means the slot never reflows into a different shape when one
band resolves: dismiss the fact and the ticket rises, while the amber pair never
moves, because it was never above anything.

**The slot belongs to the composer**, not the thread view. Its whole meaning is
proximity — an away band eight pixels above the box is a condition; the same
band pinned under the feed is a page header.

Three registers, and they are three on purpose:

- **AI** (gradient border, whisper fill) — the agent is PROPOSING and wants
  permission. The only register carrying the agent's own colours, because it is
  the only one where the agent is speaking.
- **BLUE** — the product's utility register, per the frame. A recommended
  service ticket is a HOTEL object; dressing it as an AI artefact would file it
  under "the robot's stuff" rather than under "my work".
- **AMBER** — a state of the world you did not choose and cannot accept or
  reject.

The escalation band has no actions and no dismiss, deliberately: you cannot
agree or disagree with how long someone has been waiting, and the only way to
clear it is the composer directly below.

**The Away pill is real now.** It writes `workspaceStatus` to the store instead
of colouring itself locally, so the band demos live across every thread from one
control. A band that demos by editing mock data is a band nobody can show in a
meeting. (Off-hours variant enumerated in a comment, not built — it wants
different copy and a schedule state, and one band with a `label` prop would have
been the cheap version of a decision nobody has made.)

### 5. The suggested-fact queue, and "Add Information to AI"

Sequential and **persistent**. Head of the queue is the visible band, "+N more"
says how many are behind it, and **nothing auto-hides on a timer** — Skip/× is
the only way out. A suggestion that quietly expires is one the product asked for
and then threw away, and a hotelier who notices that once stops answering them.

Add-to-AI is a **toast**, not an inline confirmation state on the band: the
band's job is finished the moment the fact is accepted, and a band that stays
behind to congratulate itself is a band still occupying the slot the next fact
needs.

Edit opens the **"Add Information to AI" modal** — title, "AI knowledge update"
label, textarea PREFILLED with the fact, Cancel / solid-blue "Add to AI".
Prefilled because the common case is a small correction (a room number, a set of
hours), and making someone retype a sentence they mostly agree with teaches them
to press Dismiss instead. Committing the edit is the **same event** as Add from
the band — Edit is a detour on the way to Add, not a second outcome.

### 6. The drafted-response card

Its own gradient-bordered card above the composer, separate from the band slot:
"RESPONSE DRAFTED BY AI" overline, the draft body, Edit / Send / × dismiss.

**Edit hands the draft to the composer** and the card leaves. Not an inline
editor, not a modal: the composer is where messages get written, it already has
send, attachments, translate and the AI pill, and it is four inches below. An
inline editor would have been a second composer with none of the composer's
tools.

**Send attributes to the HUMAN.** The message lands as the signed-in staff
member's, not as Canary's — a person read it and chose to send it, so the
property owns the words. Attributing an approved draft to the AI would let it
take credit for a sentence a person is accountable for, and would make the
feed's three sender registers lie about who is speaking.

**⚠ DELIBERATE DEVIATION FROM PRODUCTION — dismiss asks nothing.** Production
opens the feedback taxonomy when a draft is thrown away, on the (good) argument
that a rejected draft is the cheapest training signal the loop will ever get.
Miguel's call: this batch already has two feedback surfaces, and a third mouth
asking the same question at the exact moment someone is clearing their screen
turns the assistant into a form. If the loop needs the signal, ask once, later —
not as a toll on every dismissal. Noted in the code at `dismissDraft` and on the
card.

### 7. "Review" hands off to a form that already exists

The recommended-ticket band's Review opens the Conversation Details panel's
**existing** Create-service-task drill-in, prefilled with the band's room and
issue. The form IS the review; a second review dialog here would have been a
copy that drifts.

The mechanic: the panel owns its navigation stack and nothing else may push onto
it, so the band states an INTENT on the store (`panelIntent`, with a nonce so two
identical Reviews are two events) and the panel decides how to honour it.

### 8. Carrier errors — "Message Not Delivered"

Reached from the red "MESSAGE FAILED TO SEND" caption. Per-channel blocks:
WhatsApp 21212 + SMS 30006 on one send, which is not mock noise — production
attempts the rich channel and falls back, so one red caption can stand for two
different refusals, and showing only the last would send a hotelier to fix the
wrong thing.

The register was EXTRACTED, not written: the guest-journey timeline already drew
it inline. It is `<CarrierErrorLine>` now, used by both.

**⚠ Known dead promise, kept as drawn**: the helper paragraph says some issues
"may require action, such as updating recipient info or retrying the message,"
and the modal offers neither. Already on the fix-in-post list; shipped verbatim
so the review argues about the frame rather than about a paraphrase of it.

### 9. Store / mock

- `AiExplanation` on the message it explains — success on `ai` messages,
  non-response on `guest` messages carrying `aiDeclined`. State is read off the
  message, not off a discriminator field.
- **`sourceCount` is DERIVED** from `explanation.sources.length` at decoration
  time. The footer chip and the sidebar's list are two views of one array. The
  fastest way to make an observability surface untrusted is to say three and
  then show four.
- The footnotes live in `ai-mock.ts`, not in `mock-data.ts`: threading a
  fifteen-line explanation through every AI message would have doubled the
  transcript and made the conversation unreadable in the file that exists to
  make it readable. `mock-data.ts` decorates on the way out.
- Thread 1's two explanations are the FRAMES verbatim, inconsistencies included
  ("Chilli's" vs "Chili's", the double space in "MIX,  and Red's Place", bullet
  1's lone period, "What AI understood" in sentence case beside three title-case
  headings). All are fix-in-post items; the build matches the file, and the file
  gets fixed first.

### Exemplar threads

| thread | guest | carries |
|---|---|---|
| 1 | Emily Smith | both explanation states (⓵ `m4` success, `m3` non-response), a failed send |
| 2 | Miguel Andre Briones Santana Rodriguez | suggested-fact queue (2 — the frame's towels fact + one more, so "+1 more" is demo-able), a failed send |
| 4 | Marco Bitanga-Sevilla | suggested fact (pool closure, from the edit-modal frame) **and** the recommended ticket (room 112 / Bath Towels, the frame's own numbers) — the stacking demo |
| 20 | Lucia Rossi | escalation, "Unanswered for 24 minutes." |
| 25 | Chloe Dubois | the drafted response |
| — | any | the away band, live off the status pill |

⚠ Marco's thread gained one seeded message: a bath-towel request timestamped
BEFORE the pool question, so the band's room-and-issue is detected from
something you can read in the thread while the list row's preview stays the
frame's "What time will the pool close?"

⚠ The draft's BODY diverges from frame 2030:47254, which drafts a gym/mini-golf
answer into a thread that asked about restaurants — an incoherence the frame
audit logged. The card's chrome is the frame's; the body answers the guest who
is actually waiting, because a demo where the draft doesn't match the question
teaches the reviewer that drafts don't match questions.

### One bug fixed on the way

**The composer is keyed to its thread now.** It holds its text in local state,
so switching conversations carried the box's contents to the next one.
Survivable while the only way to fill it was to type; not survivable once the
draft card could put an AI's reply to Chloe into Lucia's composer. Real
per-thread drafts (kept, not cleared) remain a separate feature.

### Files touched (batch 4)

- **new** `components/products/messaging/ai/` — `AiExplanationPanel.tsx`,
  `AiFeedbackForm.tsx`, `AiFeedbackModal.tsx`, `AiRecapBand.tsx`,
  `CarrierErrorModal.tsx`, `AiDraftCard.tsx`, `AddInformationModal.tsx`,
  `ThreadAiSlot.tsx`, `band-ui.tsx`.
- **new** `lib/products/messaging/ai-mock.ts`.
- `lib/products/messaging/` — `types.ts`, `store.ts`, `mock-data.ts`.
- `components/products/messaging/` — `MessageBubble.tsx`, `MessageComposer.tsx`,
  `ThreadView.tsx`, `MainNav.tsx`.
- `components/products/messaging/panel/` — `panel-ui.tsx` (**new**
  `<CarrierErrorLine>`, `PanelFooterAction` variant), `PanelShell.tsx` (`label`),
  `ConversationDetailsPanel.tsx`, `CreateServiceTaskPage.tsx`,
  `ScheduledMessagesPage.tsx`.
- `app/globals.css` — `.ai-gradient-band`.
- `app/(dashboard)/messages/page.tsx` — the four AI surfaces + one toast.

### Promotion candidates — additions

27. **The AI-band register** (`.ai-gradient-band`) — 1px gradient border,
    whisper-tint fill, rounded-8. The dress for anything an agent PROPOSES
    rather than reports. Already worn by two objects here (draft card,
    suggested-fact band) and it is the same two-layer padding-box/border-box
    trick as `.ai-orb-tile` and `.ai-pill-on`; the three should become one token
    set rather than three near-identical gradients.
28. **`<CarrierErrorLine>`** — supersedes the "error register" half of item 24.
    Now genuinely shared (GJ timeline + carrier modal). Every Canary product
    that sends anything can fail this way.
29. **The context band** (`<ContextBand>` + `<BandButton>`) — icon · content ·
    action pair · bare dismiss, in an AI / blue / amber register. Any product
    with a "here is something about this record, act or dismiss" notice wants
    it, and the amber-nearest-the-input stacking rule travels with it.
30. **The reason-chip group** — outline-blue at rest, filled-blue selected,
    multi-select, wrapping. A generic taxonomy picker; nothing in `@canary-ui`
    covers it.
31. **`PanelFooterAction` variant** — the commit bar now has tonal and primary
    registers. Still hand-rolled (item 26 in batch 3.1's list flagged that it
    should become `CanaryButton`); the variant makes the eventual swap a
    two-line change.

### ⚠ Library asks — additions

31a. ~~**`CanaryButton` has no small/compact size.**~~ ⚠ **WRONG, and retired
     2026-08-21.** v0.6.0 has the full ramp — TABLET / LARGE / NORMAL /
     `ButtonSize.COMPACT` (h-8, i.e. exactly the 32px the bands draw) / TINY
     (h-6). `BandButton` was hand-rolled against a size that already existed.
     It is `CanaryButton` COMPACT now; only the radius, the 13px label, the
     14px padding and the fill-based hover are overrides. The lesson is
     procedural, so it is kept rather than deleted: **re-read the installed
     `.d.ts` before writing "the library has no…" into a justification.** Three
     of this document's asks (7d, 7f, 31a) were stale the day they were written.
31b. **`CanaryModal` draws no header or footer rules.** Every frame in this
     batch rules both. Each modal here bleeds a border back out through the
     library's `px-6 py-4` padding by hand. A `dividers` prop (or just drawing
     them) would remove three copies of the same negative-margin trick.

### Stub inventory after batch 4

Everything in the AI loop now does something. What remains inert, and why:

- **"Go to Knowledge Base"** (explanation sidebar) — the KB is a whole other
  product surface this prototype does not carry. A fake destination would be
  worse than an honest dead link.
- **Download Transcript** (call details, batch 3) — unchanged.
- **Composer tool icons** (emoji / attach / ~~translate~~ ~~templates~~
  ~~service ticket~~) — decorative since batch 2. Templates and Translate went
  live 2026-08-24; **service ticket retired from this list 2026-08-25 (QA-4)**
  — it now opens the Conversation Details panel's create-task drill-in via
  `requestCreateTask`, prefilled with the thread's room, same as the
  recommended-ticket band's Review. Emoji and Attach remain inert.
- **Copilot pill, Insights, Reservations chip** (top bar) — other products.
- **👍** — latches locally; there is no pipeline behind a compliment yet.
- **Carrier error codes** — underlined as links, no destination (the vendor's
  docs are external).

---

## Batch 5 — Base-component compliance (2026-08-21)

**Miguel's rule, verbatim:** *"use our base components at the minimum … The
component is the base … we follow the Figma for any new visual niggles but need
to be sure we're using the already base components in our design system
foundation."*

This batch is that rule applied to every control on the surface. It changes no
design. It swaps skeletons: each control now renders THROUGH its
`@canary-ui/components` base, the Figma deltas ride overrides layered on top,
and every delta is logged below so the library can eventually absorb it.

### The rule that comes out of it

**Hand-rolled is a promotion-list decision from now on, not a default.** A
control may only be hand-rolled when a named base has been checked and CANNOT
express the design — and when that happens the file says which base, why, and
what would unlock it. Three of this document's own library asks (7d, 7f, 31a)
were stale the day they were written, because "the library has no…" was written
from memory rather than from the installed `.d.ts`. **Re-read the `.d.ts`
before you write that sentence.**

### What was rebuilt — 34 controls across four families

**Core chrome (4).** MainNav's Conversations/Broadcast tabs → `CanaryTabs` text
(the hand-rolled markup was a pixel-level duplicate, down to the `px-4 py-2`
box and the `w-full h-1` underline). The online-status pill → `CanaryTag` +
`CanaryOverflowMenu`. `components/core/ActionMenu` → `CanaryOverflowMenu`.
`components/core/Toast` → `CanaryToast` (kept as a thin wrapper only because
the base doesn't portal — see below).

**The Conversation Details panel (8).** `PanelFooterAction` →
`CanaryButton` SHADED/PRIMARY. `RowList` → `CanaryList hasOuterBorder`. Four
tab rows + `ReservationResultRow` → `CanaryListItem`. Every icon button →
`CanaryButton` ICON_SECONDARY. The reservations accordion → `CanaryExpand`. The
inert Arrival Date → `CanaryInput isReadonly`. The playback transport →
`CanaryButton` at three sizes.

**The AI loop (6).** `BandButton` → `CanaryButton` COMPACT. `ReasonChip` →
`CanaryChip` SELECTABLE. Both textareas → `CanaryTextArea`. The dismiss ×
(written twice) → one `BandDismiss` on `CanaryButton` TINY. "Go to Knowledge
Base" → `CanaryButton` TEXT.

**Thread / list / composer (15).** `IconAction`, the compose ×, the tool icons
and the feedback icons → `CanaryButton` ICON_SECONDARY; the send button →
ICON_PRIMARY. The kebab → `CanaryOverflowMenu`. Search → `CanaryInputSearch`.
The thread row → `CanaryListItem`. All four card shells → `CanaryCard`. The
Sources chip → `CanaryChip`. `CaptionLink` and `StepsToggle` → `CanaryButton`
TEXT. The composer field and the "To:" input → `CanaryTextArea` / `CanaryInput`.

Three hand-rolled click-outside effects and four hand-rolled popovers are gone
with them.

### The exception set — seven, all documented in their own files

These were checked against a named base and left hand-rolled. Each carries a
header block naming the base, the structural blocker, and the ask.

| Component | Nearest base | Why it can't |
|---|---|---|
| `Kebab` (panel) | `CanaryOverflowMenu` | `item.label` is `string`; every item is clickable and closes on click. The disabled-item-with-its-reason row — the whole point of this menu — has no expression. |
| `AssignSelect` | `CanarySelect` | Native `<select>`: no card trigger, no section overlines, no check row. Second consumer of the ScopeSelect gap. |
| `ScopeSelect` | `CanarySelect` | Same gap; documented since batch 2.1, re-verified unchanged. |
| `ExpanderPill` | `CanaryChip` / `CanaryButton` | No base draws a neutral-outline pill. Chip is colour-locked blue in every state; OUTLINED's border comes from `ButtonColor`, which has no neutral. |
| `PanelShell` | `CanarySideSheet` | Edge-hinged, unanimated, brings its own header, mounts above `zIndex.modal`. |
| `FloatingPanel` | `CanarySideSheet` | Same five blockers. |
| `Avatar` | `CanaryProfileImage` | Circle-only, initials colours hardcoded inline, no icon fallback, no image transform. |

The verified **legit-new** set is unchanged and stays hand-rolled: `AiOrb`,
`ContextBand` and its four compositions, `AiStepsCard`'s trace rows, the
composer AI pill, `ControlCard`, `DetailRows`, `CarrierErrorLine`, the audio
scrubber, the GJ timeline, `DateSeparator`, and the typography furniture.

### The override layer

Everything the frames add on top of a base lives in ONE documented block in
`app/globals.css` — the pattern `.panel-commit-button` established, generalised.
The load-bearing one is the **icon-button ramp**: five hand-rolled registers
(30 / 28 / 24 / 20 / 18px, three different neutral hover washes) collapse onto
`.icon-btn-neutral` + orthogonal size and radius modifiers over `CanaryButton`
ICON_SECONDARY. The three washes become the library's one 8% / 16% ladder — a
deliberate consolidation, not a miss.

⚠ **Two cascade facts, both learned the hard way, both recorded in the CSS.**
(1) These classes are UNLAYERED and Tailwind's `!` utilities live in
`@layer utilities`; for IMPORTANT declarations layer order REVERSES, so a `!`
utility at a call site always beats the same property in a shared class. That is
the right precedence — but it silently killed `.textarea-boxed:focus`'s blue
border against a rest-state `!border-[#E5E5E5]`, so a class rule on a
pseudo-class must be re-asserted as a utility. (2) `.field-chromeless`
deliberately does NOT set height: an `!important` height outranks the inline
height a textarea's autosize writes.

### ⚠ Library asks — the batch's output

Sorted by how much they would remove.

32. **`CanaryButton` ARIA + ref passthrough.** No `aria-label`, no
    `aria-pressed`, no `aria-expanded`, no `title`, no ref, no rest-prop spread,
    and icon types render no children. Costs on this surface: `aria-pressed` on
    the thread-header info toggle, both message feedback latches and the eight
    reason chips; `aria-expanded` on the steps toggle and the panel kebab
    trigger. Accessible names survive only via a workaround — the mdi `Icon`'s
    `title` plus an explicit stable `id`, because `@mdi/react` otherwise derives
    the `<title>` id from a module-level counter and trips hydration. Two icon
    registers also need a wrapper `<span>` purely to carry `onMouseEnter`.
33. **`CanaryListItem` keyboard activation.** It renders `<li role="button"
    tabIndex={0}>` with `onClick` on an inner div and NO key handler: the row
    takes focus, announces itself as a button, and ignores Enter and Space. Every
    clickable row here carries `useRowKeyActivation`
    (`lib/products/messaging/`) as a stopgap — **delete that hook when this
    lands.** Also: `role="button"` is duplicated on the `<li>` and its inner div,
    `isSelected` maps to no `aria-pressed`/`aria-selected`, and the padding ramp
    offers only compact (8px) and normal (16px) where this surface draws 12.
34. **`CanaryInput` `pl-10` / `pr-10` are missing from `dist/styles.css`** — a
    BUG, not a gap. The component adds those classes when `leftAddon`/
    `rightAddon` is set, the library ships neither, and a consuming app's
    Tailwind never generates them because no app source emits them. The addon
    inset is dead in every consumer today; here the calendar glyph painted on
    top of the placeholder until `!pl-10` was added. Also wire `label` →
    `htmlFor`/`id`.
35. **Neutral ButtonColor.** `NORMAL`, `HEADING_TEXT`, `FONT` and
    `FONT_SECONDARY` all resolve to `colorBlueDark1` — the last three are
    unimplemented in the compiled switch. There is no grey button, which is why
    every neutral icon button here repaints `.button-bg` black.
36. **Sub-24px icon sizes** (plus 28 and 30 rungs) and an `isPressed` latch.
    TINY is the floor; the frames draw 30, 28, 20 and 18.
37. **A chromeless / embedded field variant** of `CanaryTextArea` and
    `CanaryInput`, for composite fields where the parent card owns the border,
    the radius and the focus ring. Related: `autoExpand`'s minimum is a
    hardcoded 40px (32 at COMPACT) with no prop, which is why the composer keeps
    its own autosize; and `min-h-[80px]` should be overridable by prop.
38. **`customColor` on `CanaryChip`**, for parity with `CanaryTag.customColor`.
    Both chip registers are colour-locked (selectable blue, removable grey fill)
    via inline, state-driven styles, so any third register — the Sources chip's
    neutral caption outline, the ExpanderPill — needs an `!important` block.
    Also: no `aria-pressed`, `minWidth: 72` is not disable-able, and it is the
    one base that does not set `font-['Roboto']`.
39. **Per-item colour on `CanaryOverflowMenu`**, plus item-level `disabled` +
    `hint` + ReactNode `label` + stay-open-on-disabled-click. The first would
    retire two accepted colour deltas; the rest would retire the panel `Kebab`.
40. **`CanaryTooltip`: portal it, allow wrapping, flip on collision, and
    `aria-hidden` the bubble when it is not visible.** It renders `absolute` and
    `whitespace-nowrap`, so it dies inside any `overflow-hidden` ancestor; and
    because the bubble is always in the DOM at `opacity: 0`, an element that
    also carries its own `aria-label` gets read out twice.
41. **`CanaryList`: an opt-out for the per-child mount animation** (every row
    fades and slides 8px over 350ms with no stagger and no prop), and a keying
    strategy that doesn't ghost trailing rows when the list shrinks.
42. **`CanaryExpand`: `aria-expanded` on the header, class hooks, a borderless
    variant.** Its header is a `div[role="button"]` that sets no
    `aria-expanded`; every visual delta rides `.panel-accordion`'s descendant
    selectors, which are fragile by construction.
43. **`CanaryCard` needs a `style` passthrough** (it takes `className` only),
    and note that it nests children in a second div — any flex/`min-h-0` height
    chain has to be re-established on that child.
44. **A solid toast register**, and portal the toast. `CanaryToast` is tinted
    (pale ground, coloured border and text) with a mandatory close ×; this
    product's receipt is a solid bar that dismisses itself. And it positions
    `fixed` without portalling, so inside a transform-animated panel it anchors
    to the panel.
45. **`CanaryLink` / an inline text variant.** No link primitive exists, so
    three text affordances here neutralise four `CanaryButton` TEXT traits to
    fake one.
46. **`CanaryProfileImage`: `shape` (square + radius), `tone`/custom colours on
    the initials tile, an icon fallback, and an image transform hook.** Four
    axes `Avatar` needs and the base has none of.
47. **12px list-row padding, 6px input radius, and a `colorBlack5` quiet border
    variant** — the three metric deltas this surface asks for most often.
48. **Library CSS bug:** `dist/styles.css` hand-writes `.-translate-x-1\/2` as
    `transform: translateX(-50%)` while Tailwind v4 emits the same class as
    `translate: -50%`. Both apply, so a centred element shifts a full
    half-width. It happens to be invisible where we hit it; it is not intent.

### Visual deltas this batch accepted

None of these were designed; each is a base contract asserting itself, and each
is a one-line revert if Miguel disagrees.

- **Icon-button hover washes**: `#F0F0F0` (≈5.9% black) and `rgba(0,0,0,.06)`
  → the library's `rgba(0,0,0,.08)`, plus a 16% press state none of them had.
- **Overflow-menu items**: non-danger rows `colorBlueDark1` / `colorBlack1` →
  `colorBlack2`; hover `gray-50` → `colorBlack7`; the popover hangs flush under
  its trigger instead of 4px below (restored to 4px on the thread kebab only).
- **`CanaryList` mount animation** on every panel list — rows fade and slide
  8px into place on tab switch, panel open and drill-in.
- **New hover/press states** on the commit bar, the playback transport, the
  reason chips and the picker rows, which previously had none.
- **The band buttons' primary is 2px narrower** — the hand-roll drew a 1px
  border in the same blue as its fill; `ButtonType.PRIMARY` draws none.
- **Arrival Date's border** `colorBlack5` → `colorBlack3`, which now MATCHES the
  real input beside it. The hand-drawn div disagreed with its own sibling.
- **The two AI textareas answer focus for the first time.** Their hand-rolled
  focus rule was an unimportant class losing to an inline `border` shorthand, so
  it had never painted.
- **Search is a `searchbox`, not a `textbox`**, and line-height 22 → 21.

### Files touched (batch 5)

- `app/globals.css` — the base-component override block.
- `components/core/` — `ActionMenu.tsx`, `Toast.tsx`.
- `components/products/messaging/` — `MainNav.tsx`, `SubNav.tsx`,
  `FloatingPanel.tsx`, `ThreadView.tsx`, `ThreadList.tsx`, `ThreadListItem.tsx`,
  `MessageBubble.tsx`, `MessageComposer.tsx`, `ComposeHeader.tsx`,
  `ConversationControls.tsx`, `Avatar.tsx`, `AiStepsCard.tsx`.
- `components/products/messaging/ai/` — `band-ui.tsx`, `AiDraftCard.tsx`,
  `AiExplanationPanel.tsx`, `AiFeedbackForm.tsx`, `AddInformationModal.tsx`.
- `components/products/messaging/panel/` — `panel-ui.tsx`, `PanelTabs.tsx`,
  `ReservationsPage.tsx`, `ReservationResultRow.tsx`, `LinkReservationPage.tsx`,
  `SetPrimaryGuestPage.tsx`, `CallDetailsPage.tsx`, `ConversationDetailsPanel.tsx`,
  `AssignSelect.tsx`, `PanelShell.tsx`.
- `lib/products/messaging/useRowKeyActivation.ts` — new, and temporary.

### Not touched, on purpose

`components/products/messaging/broadcast/` is pre-cutoff canon and was out of
scope. Its hand-rolled kebabs, filter chips and compact date control are the
reason asks 7b, 7d, 7e, 7f and 7g still read the way they do; a full sweep of
that directory is a separate, explicitly re-scoped pass.

---

## Batch 6 — Design-review alignment (2026-08-24)

Six changes off Miguel's design review of **Friday 2026-08-21**. Landed frames:
`2112:26219` (list-card header), `2075:36678` (Linked Reservations),
`2090:37167` (the steps open-state). Nothing in this batch is new surface — it
is the review re-deciding four things that were already drawn and two that were
wearing the wrong clothes.

### 1. The list-card header, third arrangement

`ThreadScopeMenu.tsx` · `ThreadList.tsx` · `app/(dashboard)/messages/page.tsx`

The two selects **swapped sides and registers**. The history now runs:

| | Left (card-title slot) | Right |
|---|---|---|
| 1st (batch 1) | one consolidated menu naming BOTH axes — "Inbox · Housekeeping" | — |
| 2nd (batch 2, `2038:57666`) | **Assignment** · "All Conversations" 16px black | **Folder** · "Inbox" 14px blue |
| 3rd (**this**, `2112:26219`) | **Folder** · "Inbox" 16px black | **Assignment** · live scope, 14px blue |

**Why.** The title slot is the card's NAME, and a name should be the stabler of
the two axes. A folder is a place you are IN — "Inbox" holds still for a whole
shift. An assignment is a filter you throw at that place and take off again, so
titling the card "All Conversations" and then quietly renaming it "Housekeeping"
on every pick meant the card had no fixed identity to read past. Now the card is
called what it IS, and the filter sits on the right in the blue that already
means "this is a control", with its trigger always reporting the live selection
("Housekeeping", "Theresa Webb") so the scope is legible without opening
anything.

**What did NOT move**, and this is the point: the menus, the STATUSES /
DEPARTMENTS / STAFF sections, the hairline dividers, the right-aligned check,
production's exclusivity rule, and the whole `ScopeSelect` CanarySelect-contract
argument from batch 2. This was trigger placement and register only. The file's
production-audit block carries the three-arrangement history so the next move is
argued against the record rather than against the last screenshot.

One deliberate visual delta: the **⇅ glyph takes its trigger's colour** instead
of a fixed `colorBlueDark1`. With a black title on the left, a blue chevron made
the card's name look half-linked.

**Search + New message drop to COMPACT.** They were on the ramp's NORMAL step —
a 40px field and a 40px button, which is page-level sizing — inside a 350px card,
under two 32px select triggers. COMPACT lands both at 32px so the card's three
fixed zones share one rhythm, and it is the library's own ramp rather than a set
of metric overrides. Side effect: `.input-search-quiet`'s 36px text inset is no
longer a delta (COMPACT's own size class already reads `pl-[36px]`); it is kept
and re-commented because the 20px glyph is measured against it.

### 2. Linked Reservations expands in the row

`PanelTabs.tsx` · `panel-ui.tsx` · `ConversationDetailsPanel.tsx` ·
`ReservationRecord.tsx` · `globals.css`

A companion's reservation record had nowhere to go. The row printed a name, a
phone and a room; the dates, the email, the confirmation number, the check-in
status and — most importantly — whether that guest's scheduled messages actually
sent were all simply absent from the product.

The obvious fix was a drill-in page per companion. **The review rejected it**: a
companion is a fact ABOUT the conversation you are standing in, and sending a
hotelier to a separate page to read one costs them the thread. So: progressive
disclosure, in place.

**Collapsed**, the row answers "who else is on this conversation, and where are
they" in two lines — name + lifecycle tag, then the phone plus ONE locator.
Which locator is derived from the stay: a guest who is IN THE BUILDING gets a
room number (that is how you reach them), a guest who is not gets a date range
(that is when they matter). Printing a room for a stay three weeks out states a
fact about a key nobody has cut.

**Open**, it is the full `ReservationRecord` — the same eight rows the primary
guest's stays get, "Guest Scheduled Messages" included. That row is the whole
reason this was worth doing: a failed send on a COMPANION's stay was previously
unattributable and unreachable, and it now opens that stay's own guest-journey
timeline through the SAME `ScheduledMessagesPage` the Reservations drill-in
opens. One timeline surface, two doors.

Three rules from the review, all structural rather than enforced by hand:
**one at a time** (`expandedId` is a single value — two open records in a 600px
panel means neither is readable), **closed by default** (most threads have
companions nobody asks about), and **no second accordion**.

That last one earned some plumbing. The row rides the same `CanaryExpand` +
`.panel-accordion` route as the Reservations drill-in; `.panel-accordion-row` is
a MODIFIER on that class, restating only what a list row disagrees with — the
12px/16px row inset (the same numbers `CanaryListItem` gets from `[&>*]:!py-3
[&>*]:!pr-3`), square corners, and `colorBlack8` as the wash. And the height
animation moved out of `ConversationDetailsPanel`'s reservation-details band into
a shared **`ExpandRegion`** in `panel-ui.tsx` (grid `0fr → 1fr`, the band's own
220/160ms pair, `prefers-reduced-motion` safe, `inert` while shut). The summary
line and the record are two `ExpandRegion`s with inverted flags, so they trade
places instead of one of them jumping.

`useMountedThrough` is the one piece of machinery worth naming: `CanaryExpand`
renders its body under `isExpanded &&`, so a closing body vanishes on the first
frame and there is nothing left to animate out. The hook holds `isExpanded` true
for the 160ms the body is still on screen — which keeps the prop's meaning
honest rather than lying to it.

⚠ **Deviation from the brief, on purpose.** The written spec said the collapsed
row's trailing affordance is a **chevron RIGHT**; the frame draws **down/up**,
and down/up is what shipped. A right chevron is this surface's promise of a PAGE
(Call History rows, the reservation control cards), and the entire decision this
change implements is "no internal page". It also matches the Reservations
accordion, which is the pattern the brief told us not to fork. One-line revert if
Miguel meant it literally.

⚠ The frame's Linked Reservations list shows two **"Emily Smith"** rows inside
Emily's own panel. Not replicated — self is excluded from companions (the
standing rule from batch 3), and those rows are a stale iteration. The exemplar
thread's real cast — Nathan Reyes (in-house, room), James Brady and Claire
Whitfield (reserved, date ranges) — exercises both locator variants as drawn.

### 3. The composer has an upsells tool

`MessageComposer.tsx`

Production grew one, so the prototype does. Sixth in the bare-icon row, after
the service ticket, because those two are the toolbar's only "do a thing to this
stay" affordances and production orders them that way. ~~Same decorative
`ToolIcon` treatment as its five siblings — no flow behind it in this
branch.~~ **Upsells is still inert; its neighbour is not** — the service ticket
icon went live 2026-08-25 (QA-4), see the stub-inventory entry above.

**`mdiCashMultiple`**, verified against the reference at 10×: the front note is
identical, glyph for glyph (thick border, white interior, filled centre circle).
The reference stacks its second note down-RIGHT and mdi stacks down-LEFT, but
mdi's whole "Multiple" family stacks left (`mdiCreditCardMultipleOutline` does
the same), so that is the SET's convention rather than a wrong pick — the glyph
is used unflipped rather than CSS-mirroring a design-system icon. The outline
rule is waived because `mdiCashMultipleOutline` does not exist and this is
already the glyph the library's own vocabulary spends on money
(`sidebarTabs.digitalTips`). Explicitly NOT `sidebarTabs.upsells`'s
`mdiTagOutline` — that mark is the Upsells PRODUCT's nav identity, and reusing it
here would read as "go to Upsells" rather than "attach an upsell".

### 4. Feedback for a silence

`AiFeedbackForm.tsx` · `AiExplanationPanel.tsx` · `AiFeedbackModal.tsx`

The feedback form had one subject and two doors. Entered from **"AI CHOSE NOT TO
RESPOND"**, though, there is no answer on screen, and the eight critique chips
are unanswerable — "Wrong Tone/Wording" about nothing, "Incomplete Information"
about silence. The form was asking a hotelier to fault an artefact that does not
exist.

So `AiFeedbackForm` takes a **`context: 'response' | 'non-response'`**, and three
things move:

| | response | non-response |
|---|---|---|
| Heading | "Why was this response wrong?" | **"Why should AI have responded?"** |
| Chips | the eight critiques | **Had the Information · Question Was Clear · Safe to Answer · Didn't Need a Human · Guest Left Waiting** |
| Note label | "How do you typically respond…" | **"How would you have responded? (optional)"** |

The non-response chips are **preconditions, not faults**. A hotelier who thinks
the AI should have answered is asserting the bar was cleared, and each chip names
one bar — in the decision's own order (could it answer → was it allowed to →
what did the silence cost). "Guest Left Waiting" is last because it is the
consequence rather than the reason, and it is the only chip about the GUEST.

Everything else is shared and stays shared: multi-select, the ≥1 gate, the
optional note and its placeholder, Submit, the toast. That is why this is a
variant and not a second component — the taxonomy is the artefact, and the
machinery around it drifting would be the real cost. The recap band needed no
change; it already prints the question alone when there is no answer.

The 👎 modal now derives its context and its recap the same way the panel does.
Today only an AI message can open it, so it is always `'response'` — but the day
a non-response grows a quick-action door, the modal arrives correct instead of
quoting the guest back at herself under the AI's orb.

### 5. The two AI textareas go back to stock — and the r8 delta was DRIFT

`AiFeedbackForm.tsx` · `AddInformationModal.tsx` · `globals.css`

Miguel, at the review, on the feedback note: *"that's not our component."*

It always **was** `CanaryTextArea`. What it was wearing wasn't. `.textarea-boxed`
gave it an 8px radius and a focus-answers-on-the-BORDER register, and the two
call sites added pale `#E5E5E5` / `#CCCCCC` hairlines over the library's
`#666666`. Between them, a base component rendered at a radius, a border colour
and a focus treatment that no other Canary textarea has — which is worse than a
hand-rolled control, because it looks sanctioned.

**All of it is deleted.** `.textarea-boxed` is gone from `globals.css` rather
than left orphaned, and so are both `!border-[…]` overrides and both
`focus:!border-[#2858C4]` utilities, which existed only to win the cascade fight
the borders started. Both fields now draw the library's own 4px radius, `#666666`
hairline and 2px inset blue focus outline. Per-field METRICS stay — min-height,
padding, type size, `rows`, `resize` — because those are geometry, not costume.

> ⚠ **FOR MIGUEL'S FIGMA PASS.** The 8px radius and the pale border are **frame
> drift, not a sanctioned design-system change.** They were reproduced faithfully
> because the frames drew them, and that is exactly how a private costume becomes
> a convention. The FRAMES should be redrawn against the stock `CanaryTextArea`
> — 4px radius, `#666666` hairline, focus on a 2px inset outline — so that file
> and build agree. If the 8px box is actually wanted, it is a design-system
> change to `CanaryTextArea` and belongs on the promotion list with the
> `canary-tag-r4` radius change, not in this branch's override layer.

**One thing had to be added back, and it is not a delta.** With the dress off,
the base's own focus turned out never to have painted in this app: `CanaryTextArea`
names its focus state in Tailwind ARBITRARY-value classes
(`focus:outline-[#2858c4]`, `focus:outline-offset-[-1px]`), Tailwind v4 emits
utilities only for the sources it scans, and `node_modules` is not one — so the
field computed `outline: rgba(0,0,0,0) solid 2px`, a two-pixel TRANSPARENT ring.
`.field-focus-blue` restates the library's own two values verbatim. It is a
**build gap**, logged as such: point the build at
`@canary-ui/components/dist` so every base component's arbitrary-value classes
compile, and delete the class. Worth checking what else on this surface has been
silently missing its library-declared state.

### 6. The steps trace loses its box

`AiStepsCard.tsx` · `MessageBubble.tsx` · `CallDetailsPage.tsx`

The review's resolution of the open **"white box"** question, and it went against
the box — everywhere.

A message in this feed has no container of its own: the name, the body and the
delivery caption all sit directly on the thread's ground. Dropping a rounded-8
`colorBlack6` card into the middle of that stack made the AUDIT TRAIL the most
enclosed thing in the conversation, which is backwards — the trace is secondary
reading and the box gave it a frame the answer it explains never gets. It also
fenced the AI's work off from the AI's own name.

Open steps are now bare `✓ tool · narrative` rows on the message ground,
indented under "Canary", marked by the **2px AI-gradient rail** — the gradient
bleeding DOWN from the name, which ties the block to the speaker instead of to a
border. Measured off `2090:37167`: the rail sits **flush with the content
column's left edge** (exactly under the "C" of Canary), the glyphs clear it by
~8px, and its extent is the ROWS' extent top and bottom — no vertical padding, no
top margin, one 8px step down to the answer.

That treatment was already in the codebase as the call transcript's `accent`
dress. With the box gone there is nothing left for the prop to distinguish, so
**`accent` and the `CanaryCard` variant are both deleted** and the rail is the
component's only dress; the transcript keeps its own 12px/4px inset through
`style` and is otherwise untouched. Closed state ("Canary · Completed N Steps ⌄")
and the toggle's hover are unchanged.

⚠ **Eyeball:** the frame draws the rail noticeably PALER than ours, and running
the other way — a soft purple at the top fading to pink at the bottom, where our
one AI ramp runs magenta → purple → indigo top to bottom. Un-blended it is
roughly `#b345c6 → #d6379f → a red-pink` at ~40% strength, which is not the
system ramp reordered, it is a different gradient. Kept as `.ai-gradient-bar` on
purpose: the branch has ONE AI gradient declared in ONE place and every AI mark
follows it, and forking a second ramp for one surface is how "the AI gradient"
stops meaning anything. If Miguel wants the frame's softness it is a modifier
class and a five-minute change — but it should be a change to the ramp's rules,
not a private copy.

### Files touched (batch 6)

- `app/globals.css` — `.panel-accordion-row` added; `.textarea-boxed` deleted;
  `.field-focus-blue` added; `.input-search-quiet` re-commented.
- `app/(dashboard)/messages/page.tsx` — header select order.
- `components/products/messaging/` — `ThreadScopeMenu.tsx`, `ThreadList.tsx`,
  `ConversationControls.tsx`, `MessageComposer.tsx`, `MessageBubble.tsx`,
  `AiStepsCard.tsx`.
- `components/products/messaging/ai/` — `AiFeedbackForm.tsx`,
  `AiFeedbackModal.tsx`, `AiExplanationPanel.tsx`, `AddInformationModal.tsx`.
- `components/products/messaging/panel/` — `PanelTabs.tsx`, `panel-ui.tsx`,
  `ConversationDetailsPanel.tsx`, `ReservationRecord.tsx`, `CallDetailsPage.tsx`.

### ⚠ Library / build asks — additions

49. **Tailwind must scan `@canary-ui/components/dist`.** Base components declare
    state with arbitrary-value classes that consuming apps never compile, so
    those states silently do nothing. Found on `CanaryTextArea`'s focus outline;
    almost certainly not the only one. Either scan the package or ship the
    library's own compiled CSS for its own classes.
50. **`aria-expanded` on `CanaryExpand`** — restated from batch 5, because this
    batch doubled the number of accordions on the surface. Its header is a
    `div[role="button"]` and nothing outside can say whether it is open.
51. **An `ExpandRegion`-shaped primitive.** Two surfaces now hand-roll the
    `grid 0fr→1fr` height animation, and `CanaryExpand`'s mount/unmount body is
    what forces it (there is no exit to animate). A base expander with a
    transition — or just a `keepMounted` — would retire both `ExpandRegion` and
    `useMountedThrough`.

---

## Batch 7 — Composer flows + broadcast deltas (2026-08-24)

The last two drawn sections plus three fixes. Landed frames: `tpl-open` /
`tpl-select` (templates modal), `translate-1` / `translate-2` (translate row),
`group-1` / `group-2` (New group), `msgdetails` (Message details),
`steps-final-2090-37167` (the steps rail's lighter gradient).

### 1. The templates modal, and THE VERB SPLIT

`MessageTemplatesModal.tsx` (**new**) · `lib/products/messaging/message-templates.ts`
(**new**) · `MessageComposer.tsx`

The composer's templates tool is the first of its six icons to do anything. What
it opens is a two-tab picker, and the tabs **commit to different actions**:

| | Button | What happens |
|---|---|---|
| **Preset Messages** | **Use** | the body lands in the composer input, replacing it; the modal closes; the agent edits and sends when she is ready |
| **Apple Message Templates** | **Send** | the message goes immediately, and the composer's own draft is left alone |

**Why the split is the point.** A preset is a first draft the hotel wrote — it
is expected to be edited, and an "insert" that then auto-sent would take the
edit away. An Apple template is an Apple-hosted PAYLOAD; there is no text to
edit, so routing it through the composer would be two clicks that change
nothing. The frames only draw the Apple tab; both are built, because a picker
where every row does the same thing does not need two tabs.

Selection is **per-tab and resets on switch** — a preset selection carried into
the Apple tab would leave a "Send" button armed with a row nobody can see.

**Mock templates are production-flavoured, with merge tags rendered LITERALLY.**
The drawn three (Welcome / DND - Housekeeping Service / Extend Your Stay
Promotion) are verbatim; three more are written in the same register against
production's own tag set — `{{ guest_first_name }}`, `{{ hotel_name }}`,
`{{ arrival_date }}`, `{{ guest_url }}`, `{{ confirmation_id }}`. Nothing here
invents a tag: an invented tag in a demo is a promise the real product cannot
keep. The extra three cover the three shapes a front desk actually reuses — a
pre-arrival nudge, a paid upsell offer, and a factual answer to a daily question.

The Apple list is deliberately the SAME three bodies as the top of the preset
list. Production seeds both from the same hotel copy, and the thing a hotelier is
being asked to understand is the VERB, not the wording.

**Base components, and four call-site overrides.** `CanaryModal` (title, ×,
overlay, Escape) · `CanaryTabs` TEXT (the control MainNav and SubNav already
take) · `CanaryList` + `CanaryListItem` for the rows · `CanaryButton` TEXT /
PRIMARY in the footer. `CanaryList` draws its own hairlines between children, so
there is no divider element. The overrides are descendant variants on the base's
OWN structure rather than new global classes: `!p-0` on the modal body (the frame
runs rows full-bleed so a selected row's tint reaches both edges, and each row
pays its 24px inset back), header and footer border rules the base does not
draw, `!max-w-[800px]` over `size="large"`'s 896.

### 2. The translate row is a ROW

`MessageComposer.tsx` · `lib/products/messaging/translate.ts` (**new**)

Not a drawer, not a popover: a band INSIDE the composer card, between the input
and the toolbar. That placement is the argument — translation is a property of
the message being typed, and anything detached would separate the setting from
the sentence it applies to.

Anatomy per the frames: a **preview chip** above the selects once there is a
draft (the ORIGINAL is already on screen — it is the textarea — so the row adds
only the translated line, in a small `colorBlack7` chip; a chip rather than a
plain line because this text is not the message, it is a rendering of it), then
**From → arrow → To**. Both are plain `CanarySelect` at COMPACT: flat
single-selects with no sections and no check rows, which is what the base is
for. This is **NOT** the `ScopeSelect` / `AssignSelect` gap and must not be
confused with it.

**One sanctioned delta: the From select is GRAY-FILLED** (`#E5E5E5` fill and
border) where the base draws white on a `#666666` hairline. The frame draws it
and the reason holds: From reports a DETECTED fact, To is the choice being made,
and the two must not look like a matched pair of decisions. It stays ENABLED —
an agent writing in Spanish to a Japanese guest is real, and `isDisabled` would
dim the label to unreadable — so the fill does the work `isReadonly` would do if
the field were inert.

The translate tool icon **latches blue while its row is open**. It is the only
toolbar affordance that leaves something on screen behind it; the other five
keep the plain hover-tint ladder.

⚠ **SEND IS UNCHANGED, AND THAT IS ENUMERATED RATHER THAN FAKED.** Production
sends the TRANSLATED body — the guest reads their own language, the thread keeps
the original for staff. Wiring that here would print Japanese under Theresa
Webb's name in the feed with no way to see what she typed, because a per-message
original/translation pair is a `Message` model change this branch has not been
asked for. The row previews; Send sends the box. The work, if it is wanted, is a
`translatedBody` field plus a caption in `MessageBubble`.

The canned language model (`translate.ts`) is deterministic: a phrasebook for
the handful of phrases a demo types, plus an INTENT-BUCKETED fallback (thanks /
apology / question / default) so unknown text gets a plausible sentence in the
target language rather than a spinner, the English back, or the same string for
two different inputs. Five targets.

### 3. Compose is gated on a committed number

`ComposeHeader.tsx` · `app/(dashboard)/messages/page.tsx` · `store.ts` (unchanged)

Miguel: *"no composer would appear until a number gets put in."*

The pane has two states and the seam between them is a COMMIT, not a keystroke.
Before: "To: [ ]" and one line of instruction, no composer — there is nothing to
send TO, and a live message box over an empty address field invites a hotelier
to type a message she cannot send. After: the same header with the number in it
and the full `MessageComposer` underneath.

**COMMIT is Enter OR BLUR**, at production's own ≥10-digit bar (restated in the
component so the gate and `createThreadFromPhone` cannot disagree). Blur counts
because a hotelier who types a number and reaches for the message box has
finished addressing; making her press Enter first would be a rule she has to
learn from a dead composer. Typing back below ten digits retracts the composer.

⚠ **THE THREAD IS NO LONGER CREATED AT COMMIT.** It used to be: Enter called
`createThreadFromPhone` immediately, dropped compose mode, and handed the user a
normal ThreadView — which made the composer's appearance a side effect of
LEAVING this pane, so the gate could not be expressed here at all. It also left
an empty conversation in the inbox for every number anyone typed and thought
better of. The SEND now creates the thread and posts the message into it in one
step (`handleSendFirstMessage` on the page). The AI pill is real and local, and
its value is dropped on send; the new thread takes the store's per-thread default.

### 4. New group — a rebuild, not an edit

`broadcast/CreateGroupModal.tsx` · `broadcast-types.ts` · `broadcast-store.ts`

The old modal drew the frame's furniture and none of its behaviour. Its own
comment called the contact row "(decorative)": "Add" added nothing, there was no
table to add it to, and the only field that reached the store was the group's
name. A hotelier could run the one flow in Broadcast that builds an audience and
come out the other side with an empty group.

**What the modal is FOR.** The three built-in folders are the PMS's answer to
"who is here". A CUSTOM group is the list the PMS has no opinion about — the
wedding party, the conference block, the ownership group — which is why the
contact row asks for a NAME and a NUMBER rather than offering a guest picker.

**The data model says so too.** `BroadcastGroupContact { id, name?, phone,
channel }` on a new `contacts` field: nothing typed here is expected to resolve
to a reservation, and keeping that fact explicit means nothing downstream has to
guess whether a member id will find a PMS guest. `memberCount` is derived from
`contacts.length` — a stored count that can disagree with the list it counts is a
bug waiting for its first edit. ⚠ QA-3 amended the second half of this: the
contacts ALSO become `memberGuestIds` under synthetic ids, because "not a PMS
guest" is a claim about provenance and was being read as "cannot be texted".

**Channel is SMS or WhatsApp.** Production has no third option; the old modal's
"Apple Messages" was invented (Apple Messages is negotiated per-device off the
same number, not picked by staff).

**The entry row appends and CLEARS ITSELF** — it is a repeating action, and a
form that keeps the last contact in it invites a double-Add.

**`CanaryTable` is a near-exact match for the drawn table** and that is not
luck: the base renders column labels OUTSIDE the border, an 8px spacer row, then
a bordered rounded-8 body whose first and last rows carry the radius — which is
the frame, element for element. Two overrides: the header's type register (base
14px semibold `colorBlack2` → the frame's 10px uppercase overline) and the row
height. ⚠ The row-padding override must be scoped
`[&_tbody_tr:not(:first-child)_td]` — the base's first tbody row is the 8px
SPACER, and a blanket `td` padding inflates the gap under the overlines to 48px.

**Save creates the group and LANDS THE USER IN IT.** Creating a group and then
having to go and find it is the flow admitting it did nothing.

⚠ **Deliberate deviations.** (a) Field borders stay stock `#666666` against the
frames' pale hairline — the batch-6 ruling applied, since Miguel called the same
pale border on the same base components *frame drift, not a sanctioned
design-system change*. (b) Save is gated on ≥1 contact **and** a name; the brief's
rule is the contact, and the name is added because `createGroup` refuses a
nameless group and a Save that is enabled and then silently does nothing is worse
than one that is honestly disabled. (c) No Cancel button — the frame's footer
holds "Upload Contacts ⓘ" and "Save", and the × is the cancel.

⚠ **The frame's three identical "Miguel Santana" rows are MOCK FILLER and are
not seeded.** The table is populated by real Add-contact entries. A demo that
ships with three copies of one person teaches that the flow does not work.

⚠ **No edit-group flow existed and none was added.** `CreateGroupModal` was and
is create-only; the GROUPS kebab holds "View archived" and nothing else.

~~⚠ **A hand-entered contact is not a messageable recipient yet.**~~
**RETIRED — fixed in QA-3 (2026-08-25).** The note called this pre-existing
behaviour for any empty custom group rather than a regression; QA verification
showed the group is never empty, because the modal refuses to save without a
contact. So EVERY group this flow could produce arrived saying "1 guest" on its
rail row and "no one to send to" in its To strip at the same time, with Send
permanently disabled — the dead end was the flow's only possible outcome, not an
edge case. Hand-entered contacts are recipients now; see the QA-3 record.

### 5. Message details — the status becomes a CHIP

`broadcast/BroadcastDeliveryPanel.tsx`

Title "Broadcast message" → **"Message details"** (the panel is opened FROM a
broadcast block, so naming it after the broadcast restated where you already
were), a header hairline, and the status moves from right-aligned text to a
`CanaryTag` OUTLINE chip **beside the name**.

**Moving it is what changes the colour model**, because a chip cannot be
"untinted" — a neutral outline is still a chip, and the only question is which
colour. So production's two-tint rule becomes four registers answering ONE
question, did it reach the guest:

| | Statuses |
|---|---|
| **GREEN** (SUCCESS) | delivered · read |
| **AMBER** (WARNING) | pending-rtc |
| **RED** (ERROR) | failed |
| **GREY** (DEFAULT) | sending · sent · resent · not-sent · blocked-high-rate-country |

The frame draws green and amber. **Red is built though it is undrawn**: a panel
whose whole job is surfacing damage cannot ship without its damage state, and
the anatomy is one enum value apart.

⚠ **`blocked-high-rate-country` STAYS GREY**, reading "Failed to send" beside a
red chip reading the same words. Production's class check is `=== FAILED`, so a
blocked recipient has never been tinted; an earlier pass diverged on exactly this
and was reverted. Grey is what "untinted" becomes once the text is a chip.

Labels stay production's verbatim (FAILED and BLOCKED_HIGH_RATE_COUNTRY share
"Failed to send"); `CanaryTag` uppercases them, which is what the frame draws.
The full 7-state logic is intact. The chip register is the library's stock
OUTLINE palette, so the ERROR chip is the pink-family red the library ships, not
`colorRed1`.

Rows also gain a **per-recipient jump icon**, and it is INERT in this branch:
production opens that recipient's own 1:1 conversation, which crosses from the
broadcast store into the messaging store AND has to flip the page's
Conversations/Broadcast tab, which is local state above both. A store action that
owns the active tab is the shape of the fix.

⚠ **The dedupe was already done.** The frame's three identical "Fatima
Al-Hassan" rows are its mock; the prototype's recipient lists have always been
distinct guests per message, so no data changed. The exemplar broadcast
(`bm-ih-2`) exercises six different people across five different statuses.

⚠ **The frame draws NO meta rows** — it goes header → hairline → list — and the
body / timestamp / sender / audience block is KEPT. It is the only place the
broadcast's own text is readable once the panel is open, and the restyle brief
named the title, the chips, the subtitle and the jump icon and did not name it.
A clean delete if Miguel meant the frame literally.

### 6. ONE panel standard, and `FloatingPanel` is deleted

`panel/PanelShell.tsx` · the three broadcast panels · `FloatingPanel.tsx`
(**deleted**)

`PanelShell` used to carry a note explaining why the broadcast panels kept their
own shell: 480px, tucked under the top bar, shadowed, *"genuinely different
jobs"*. **They do not have different jobs.** All four panels are the same object
— a right-hand card holding one list you opened from the surface behind it — and
the differences were the accidents of having been written months apart.

Two shells cost two widths, two z-index pairs, two insets, two mount mechanics
kept "in step deliberately" by hand, and a shadow on one branch of a surface
whose standing rule is that nothing casts one.

What changed for the three, all of it the standard asserting itself: **480 →
600px**, under-the-top-bar → **over everything**, 16px insets → **12px**,
rounded-12 → **16**, z 40/39 → **45/44**, and **the shadow is gone**. Contents
and behaviour are untouched — this was a shell swap. `FloatingPanel` had no other
consumer and is deleted rather than left orphaned; its `CanarySideSheet`
exception block is now redundant with `PanelShell`'s, which says the same five
things.

The delivery panel's close × also moved onto `CanaryButton` ICON_SECONDARY while
that header was open — one of the broadcast directory's remaining hand-rolled
controls, retired in passing rather than as a sweep.

### 7. The dead hover in `BroadcastGroupList`

Same bug the thread row had, and the same fix. The audience row carried
`hover:bg-[#f9fafb]` as a CLASS and `backgroundColor: 'transparent'` as an INLINE
STYLE. An inline style outranks any class, `:hover` included, so the wash had
never rendered in the life of the component — and it read as "the hover is too
subtle" rather than "there is no hover", which is exactly why it survived.

Fixed by stating the background where it can win (a hover flag driving the
inline value), and taking the branch's ONE neutral wash while we were there:
`rgba(0,0,0,0.08)`, the library's own hover step, where `#f9fafb` was a ~2% grey
that would have been invisible even if it had painted. A SELECTED row does not
answer hover at all — it is already carrying the blue tint and its border.

### 8. The steps trace grows, breathes, and goes quiet

`MessageBubble.tsx` · `AiStepsCard.tsx` · `motion.tsx` (**new**) ·
`panel/panel-ui.tsx` · `panel/PanelShell.tsx` · `globals.css`

**IT ANIMATES.** The trace used to appear and vanish on the frame while
everything else that opens in place on this surface — the reservation-details
band, Linked Reservations — grows. A trace that SNAPS shoves the answer down the
screen with no motion to follow, which reads as the feed re-laying-out rather
than as one block opening.

`ExpandRegion`, `useMountedThrough` and the 220/160 pair moved DOWN out of
`panel/panel-ui.tsx` into `components/products/messaging/motion.tsx`, with
`useReducedMotion` from `PanelShell` beside them. Importing `panel-ui` into
`MessageBubble` to get one animation would have dragged the whole panel
vocabulary — PanelHeader, PanelTag, DetailRows, RowList, the copy affordance —
into the thread, and **the thread does not belong to the panel**. Both files
re-export what they used to own, so every existing call site is unchanged and
there is still exactly one implementation. This is also the answer to ask 51's
first half: the mechanism is now in one place for three consumers.

**AND IT BREATHES** (Miguel, 8/24: *"a little tight"*). **10px above** the first
step and **10px below** the last, where the batch-6 build had 0 and 8. The air is
a MARGIN outside the rail rather than padding inside it — padding would stretch
the rail past its rows and turn the bracket back into a bar, which is the one
thing the measured note in `MessageBubble` says not to do. The closed state's
rhythm is untouched.

### 9. ⚠ THE AI RAMP NOW HAS TWO TIERS — a ramp rule, not a colour

`globals.css` · `AiStepsCard.tsx`

Batch 6 flagged that the frame's steps rail is much paler than ours and declined
to fork a second gradient for one surface. Miguel ruled for the lighter rail
(*"not too heavy"*), so this is the other answer: **a strength modifier over the
same ramp.**

**THE RULE, and it is the point of this entry:**

> **FULL** (`--ai-ramp-strength: 100%`) is for **BRAND MARKS** — things that ARE
> the agent: the orb, the "AI On" pill, the "Canary" sender name, the proposing
> band's border. Identity, small, saturated.
>
> **QUIET** (`--ai-ramp-strength: 40%`) is for **STRUCTURAL RAILS** — things
> that merely BELONG to the agent: the 2px rail marking the steps trace. A rail
> is furniture running the height of a block of secondary reading; at full
> strength it out-shouts the name it hangs off and competes with the answer it
> explains.

The three stops are now `:root` tokens (`--ai-ramp-magenta` / `-purple` /
`-indigo`) plus a ground, and every AI surface — `.ai-gradient-text`,
`.ai-gradient-bar`, `.ai-gradient-band` — reads them. `.ai-gradient-quiet` sets
the strength and nothing else. Change a stop and BOTH tiers follow, which is the
whole reason this is a modifier and not a second gradient.

The quiet tier slices the ramp **purple → magenta** rather than carrying all
three stops: at 40% the indigo end lands on a pale periwinkle the frame plainly
does not draw, and dropping a stop is a slice of the same ramp rather than a new
colour. Measured result `#e0b5e8 → #efafd9` against the frame's
`#e0b5e7 → #f0aeb9` — the top stop is exact, the bottom a few points cooler than
the frame's rose. ⚠ Eyeball item; it is a stop-order question, not a new gradient.

**Both steps-trace callers take it** — the feed and the call transcript. The
argument for quieting one is the argument for quieting the other, and a rail that
is pale in the feed and saturated in the transcript would say the AI's work
matters more on the phone.

`.ai-gradient-band` keeps a fourth stop (`#e2456d`, a warm lead-in only that
register carries) and writes its 4% fill out longhand, because its two layers
need different strengths in one declaration.

### 10. ⚠ FOUNDATION ASK #49 — root-caused, and it was TWO bugs

`app/globals.css` · `AiFeedbackForm.tsx` · `AddInformationModal.tsx`

**Bug one, fixed: Tailwind never scanned the library.** Base components name
their states in ARBITRARY-VALUE classes (`focus:outline-[#2858c4]`,
`focus-within:outline-offset-[-1px]`, `placeholder:text-gray-500`,
`bg-[rgba(40,88,196,0.05)]`, …). Tailwind v4 emits a utility only for the
sources it scans and its automatic detection skips `node_modules`, so every one
of them compiled to nothing.

```css
@source "../node_modules/@canary-ui/components/dist/index.mjs";
```

Pointed at `index.mjs` (the ESM build the app imports) rather than the whole
`dist/`: `index.js`, `index.d.ts` and the two `.map` files repeat the same class
strings, and the maps additionally carry the library's raw TS source — a lot of
text to re-scan on every rebuild for zero extra utilities. **43 rules appeared;
nothing was removed; `pnpm build` is clean.** Full inventory below.

**Bug two, found because the first fix did not work: the library BLOCKS ITS OWN
focus ring.** `dist/styles.css` hand-writes

```css
.outline-none { outline: 2px solid transparent; outline-offset: 2px; }
```

— the Tailwind **v3 SHORTHAND**, which sets outline-COLOR (transparent) and
outline-OFFSET, where v4's `outline-none` sets only `outline-style: none`.
`CanaryTextArea`, `CanaryInput` and `CanarySelect` all carry `outline-none` at
REST beside their `focus:outline-*` classes, so the transparent colour and the
+2px offset apply in every state. And it WINS despite lower specificity, because
**the library's stylesheet is unlayered while Tailwind's utilities live in
`@layer utilities`** — for non-important declarations an unlayered rule beats a
layered one whatever the selectors say.

That is the cascade trap this document already carries, in a third variant: the
two rules are in different STYLESHEETS. The fix is three unlayered rules in
`globals.css` (which loads after the library's) restating the library's own
declarations, keyed on **the library's own class names** — so every base field on
every surface gets its declared focus ring back, including the error register and
the `focus-within` one the date inputs use.

**`.field-focus-blue` is deleted**, along with both call sites. It did this per
field on the theory that the scan was the only problem; the fix now lives once,
at the register, and neither textarea names a focus state any more.

Measured before/after on the real `CanaryTextArea`:
`rgba(0,0,0,0) solid 2px / offset 2px` → `rgb(40,88,196) solid 2px / offset -1px`.

#### ⚠ NEWLY-PAINTING STATES — the inventory Miguel asked for

43 rules now compile. These are the ones that touch a component this surface
actually uses. Nothing was designed; each is the library behaving as it declares.

| Where | What now paints |
|---|---|
| **`CanaryTextArea` / `CanaryInput` / `CanarySelect` / `CanaryInputPhone`** | the **blue focus ring** — `#2858c4`, 2px, inset −1px. Visible on the AI feedback note, the Add-Information box, the New group fields and the translate selects. Chromeless fields are unaffected (`.field-chromeless:focus`'s `outline: none !important` still wins). |
| same, error state | the **red focus ring** `#E40046` and red helper text. No call site sets `error` today, so nothing renders yet. |
| **`CanaryListItem` with `isSelected`** | **`hover:opacity-90`** — a SELECTED row now dims to 90% on hover. `ThreadListItem` and the templates modal neutralise it (`[&>*]:hover:!opacity-100`, a deliberate design call); **`ReservationResultRow` does not**, so the Set-primary and Link-reservation pickers gained a hover-dim on their selected row. Left as the base's behaviour; one class to opt out if Miguel disagrees. |
| **`CanaryInput`** | `placeholder:text-gray-500` + `placeholder:opacity-100` — placeholders move off the browser default to `#6a7282` at full opacity. Visible in the New group modal. Call sites that already override (`.input-search-quiet`, the To: field) are unchanged. |
| **`CanarySelect`** | `appearance-none` — the native dropdown arrow is now suppressed by class as well as by the component's inline `WebkitAppearance`. No change in Chrome; a real fix in Firefox. |
| **`CanaryChip`** | `duration-150` — the reason chips now transition their colours over 150ms instead of switching instantly. |
| **`CanaryCard`** | `hover:shadow-lg` + `transition-shadow` — **only when `onClick` is set**, and no card on this surface passes one. No shadow appeared. Worth knowing before anyone makes a card clickable on a no-shadow surface. |
| **`CanaryListItem`** | `flex-row` (no-op, it is the default direction) and `text-xs` on the `description` slot — no consumer here uses that slot. |
| **`CanaryCheckbox` / `CanaryRadio`** | `pl-1` on the label. The broadcast guest list already zeroes label padding globally, so nothing moved. |
| **`CanaryOverflowMenu`** | `my-1` — divider items only, and no menu here has one. |

Everything else in the 43 belongs to components this surface does not render
(`CanarySteps`, `CanaryCalendar`, `CanaryDialog`, `CanaryProgressBar`,
`CanaryAutocomplete`, `CanarySettingsCard`, `CanaryTooltip`'s left/right
placements, and the whole `*Underline` family).

⚠ **One dev-only artefact, not a bug.** The first page reload after a CSS
rebuild can show a `useId` hydration warning (stale SSR HTML against a fresh
client bundle). It clears on the next reload and does not occur in the
production build.

### Files touched (batch 7)

- **New:** `components/products/messaging/MessageTemplatesModal.tsx`,
  `components/products/messaging/motion.tsx`,
  `lib/products/messaging/message-templates.ts`,
  `lib/products/messaging/translate.ts`.
- **Deleted:** `components/products/messaging/FloatingPanel.tsx`.
- `app/globals.css` — `@source`; the AI ramp tokens + quiet tier;
  `.field-focus-blue` deleted; the library-focus-ring block added.
- `app/(dashboard)/messages/page.tsx` — `handleSendFirstMessage`.
- `components/products/messaging/` — `MessageComposer.tsx`, `ComposeHeader.tsx`,
  `MessageBubble.tsx`, `AiStepsCard.tsx`.
- `components/products/messaging/ai/` — `AiFeedbackForm.tsx`,
  `AddInformationModal.tsx` (patch class removed).
- `components/products/messaging/panel/` — `PanelShell.tsx`, `panel-ui.tsx`.
- `components/products/messaging/broadcast/` — `CreateGroupModal.tsx`,
  `BroadcastDeliveryPanel.tsx`, `BroadcastFilterPanel.tsx`,
  `BroadcastScheduledPanel.tsx`, `BroadcastGroupList.tsx`.
- `lib/products/messaging/` — `broadcast-types.ts`, `broadcast-store.ts`.

### ⚠ Library / build asks — additions

49. **RESOLVED in this app** — Tailwind now scans the library bundle. The ask
    stands for the LIBRARY: ship compiled CSS for your own arbitrary-value
    classes, or document `@source` as a required install step. Every consuming
    app has this bug today.
52. **⚠ `dist/styles.css` hand-writes a Tailwind v3 `.outline-none`**
    (`outline: 2px solid transparent; outline-offset: 2px`) which blocks the
    library's own `focus:outline-*` classes in every consumer, because the
    stylesheet is unlayered and Tailwind's utilities are not. Drop it (v4 emits a
    correct one) or ship the stylesheet inside a `@layer`. This is the single
    highest-value fix on the list: it is currently impossible for any consumer to
    see a Canary field's focus ring without a workaround.
53. **`CanaryTable` needs a row-padding prop and a header type register.** Its
    row is `py-1` and its header is 14px semibold; every real table wants
    different numbers, and both are reachable only through descendant selectors.
    Also: the 8px spacer row it renders as the first `<tr>` is invisible in the
    API and silently absorbs any `td` padding override.
54. **`CanarySelect`: a `readonly`/reported visual register.** The translate
    row's From field reports a detected value; `isDisabled` dims the label,
    `isReadonly` paints `#FAFAFA`, and neither is the frame's grey-filled field.
55. **`CanaryTabs` is uncontrolled with no `activeTab`.** Three consumers now
    mirror `onChange` into local state purely so something outside can read which
    tab is live — the templates modal needs it to name the footer's verb.

---

## QA-1 — the verified fix batch (2026-08-25)

A QA sweep produced 50 confirmed findings. QA-1 is the demo-critical subset:
flow logic, app chrome, dead feedback, and mock coherence. Keyboard, focus and
the remaining polish are QA-2's and are deliberately untouched here.

Three of Miguel's rulings shaped the batch and are recorded in the code as well
as here, because a decision that lives only in a doc gets re-litigated by the
next person who reads the code.

### Ruling 1 — archived threads get no re-open button

> *"Re-open is basically if we start chatting in the archived thread again, and
> then it goes back into the regular inbox."*

The QA finding was "archived conversations have no re-open affordance anywhere,
and the store even ships an unwired `reopenThread`". That is not a gap. Re-open
is not a filing action a hotelier performs on a conversation; it is what
HAPPENS to a conversation when it starts again. So:

- **`sendMessage`'s reopen side effect IS the feature**, not an accident, and it
  is commented as such at the call site. Sending into an archived thread returns
  it to the inbox; sending into a blocked one unblocks it.
- **`reopenThread` stays and stays unreachable from the UI.** It is not dead
  code — `sendMessage` is its one caller — and the comment on it says in as many
  words: do not wire this to a button.
- Composing a new message to an archived number reaches the same door, since
  compose now resolves to the existing thread (below) and the send re-opens it.

The affordance a demo actually needs here is undo-by-continuing, and that is
what it has.

### Ruling 2 — one number, one thread

`createThreadFromPhone` compared nothing. Composing to a number the inbox
already carried built a second, identity-less thread at the top of the list
while the named one sat mid-list — two live conversations for one phone number.
SMS has no such model: the guest's handset will show one thread whatever this
app does.

It now matches on digits (formatting is a rendering choice; the digits are the
fact), selects the existing thread, and lets the composed first message land in
it. The linkage was never missing — inbox SEARCH already resolved that number
to the named thread — compose was simply the one surface ignoring it.

### Ruling 3 — Apple Message Templates are AMB-only

Apple Message Templates are Apple Messages for Business payloads. Production
gates the tab on a thread having a live AMB session, because an Apple-hosted
rich payload cannot be delivered down an SMS thread. The prototype showed the
tab on every conversation, and its "Send" pushed the template body verbatim
into the feed — raw `{{ guest_first_name }}` in a DELIVERED staff message, with
the thread-list row previewing the same token at the top of the inbox.

The gate is built on the real condition rather than hidden behind a flag:
`Thread.channel` carries the session, `MessageChannel` gains `AMB`, and the
picker renders the tab only for an AMB thread. **No thread in this prototype is
AMB, so the tab never renders today** — which is the honest state, since there
is no Apple session here to send into — and the raw-token Send path is out of
reach as a consequence rather than by suppression. The day an AMB thread exists,
the tab lights up on it and only on it.

The Apple list stays in `message-templates.ts`. It is real production data, and
deleting it would lose the thing the gate exists to gate.

**Merge tags, and one deliberate deviation.** Production interpolates at SEND
time. Preset "Use" now interpolates at INSERT time, because "Use" hands the copy
to a human to edit and a sentence she is invited to proofread while three of its
facts still read `{{ guest_first_name }}` is a sentence she cannot proofread —
the first thing anyone does with it is type the name in by hand, which is worse
than the tag because a hand-typed name does not update. The PICKER ROWS keep
their literal tags (that is what tells her which facts get filled in), and so
does the BROADCAST composer, which has no single guest to resolve against.
A tag with no fact behind it is left exactly as written; silence would be a lie
about what the template says.

`PRESET_TEMPLATES[0]` also stopped hardcoding "Canary Test Hotel" — a different
property's name in a message sent from this one — and uses `{{ hotel_name }}`
like its two tag-bearing siblings.

### What else went in

**Flow.** Per-thread composer drafts in the store (the component stays keyed by
thread, so cross-guest bleed is still structurally impossible; what changed is
that the text is kept rather than dropped — it matters most for the AI draft
card's Edit, which consumes the card and leaves the composer holding the only
copy). `selectThread` split from `focusThread`, so a folder switch, archive or
block lands the selection without marking an unopened thread read. Both land on
the top RECENCY-sorted row using the page's own comparator. Clicking a row while
composing exits compose. Anonymous threads key service tasks on the thread.
Reschedule opens on the broadcast's real send time. The feed follows its own
growth so the hero trace click stops hiding the answer.

**Chrome.** Every nav item is mapped and every route exists — four real, six to
an in-shell placeholder. See the stub inventory below. The broadcast composer's
Templates icon is live.

**Feedback.** The inline-background-beats-hover-class bug swept to zero across
the whole app (six more elements, four products). The broadcast filter chips
gained the `CanaryChip` hover/press ladder they never had. The fact-edit modal's
commit consumes its argument.

**Mock coherence.** One timeline: March 16, 2026. Detailed in the commit; the
rule that came out of it is now in `mock-data.ts`'s header — *a step narrative is
a claim about data on screen beside it*, so those notes are maintained against
`reservations.ts` rather than written freehand.

### Stub inventory — QA-1 update

Unchanged entries stand. Two changes:

- **The Upsells "+" is now ON the list.** It was not, which is why QA flagged it
  as a dead control: it rendered as a full `CanaryButton` indistinguishable from
  the live "+" buttons beside it (Link a reservation, Create service task, both
  of which work). Creating an upsell belongs to the Upsells product and this
  branch does not carry it, so the control stays and stops pretending. The panel's
  `IconAction` gained an `isStub` register — pointer cursor dropped, tooltip
  names the destination — applied to the "+" and to the per-row
  "Open {name} in Upsells" icons so the two stubs on one card read as one thing.
  A stub still takes no `onClick`: a handler that does nothing is
  indistinguishable from a broken one, from outside AND from the code.
- **The broadcast composer's Templates icon LEFT the list** — it is wired.
  Its neighbour, the broadcast attach icon, remains decorative. Both were absent
  from the inventory entirely (it covered the 1:1 composer's icons only), which
  is how the Templates twin stayed dead after its Conversations counterpart went
  live. Adding a decorative icon to a composer means adding it here.
- **Six side-nav items are no longer stubs OR dead ends.** Upsells, F&B, Digital
  Tips, Authorizations, Contracts and Clients on File route to
  `PrototypeSurfacePlaceholder`. Five of them previously hit Next's unthemed 404
  with the whole shell gone; F&B was unmapped and did nothing. The placeholder is
  deliberately not a mocked-up empty product screen — that would be a worse lie
  than the 404, because nobody would catch it. It names the PROTOTYPE as the
  thing that stops there, not the product.

### Known, deliberate, and left alone

- **Thread 1 / `m2`'s six steps** stay frame-verbatim (Room 504, Gold Elite)
  against Emily's real 153 / Diamond Elite. Logged Figma copy nit; it gets fixed
  in Figma first.
- **Marco's row stays "112 (RESERVED)"** — a drawn frame exemplar. His message
  became a pre-arrival request instead, which keeps the recommended-ticket band
  coherent as a room-prep ticket.
- **Room 407** carries a one-day checkout-boundary overlap between two check-in
  reservations. Pre-existing, in another product's data, and no messaging thread
  names that room.
- **Thread 1's 6:32 PM last message** sits ahead of the inbox's ~10:30 AM
  cluster. Frame-driven and untouched.

### ⚠ Dev-server note (not a code issue)

Creating six route directories in one pass left the running dev server's watcher
having registered only the first three; the other three 404'd until their
directories were re-created, which produced fresh add events. The route files
were byte-identical throughout and all six serve 200 now. A fresh `pnpm dev` or
a production build never sees this. Worth knowing before anyone debugs a
"missing" route that is plainly on disk.

---

## QA-2 — keyboard, focus and polish (2026-08-25)

The second half of the same 50-finding sweep. QA-1 took the demo-critical lane
(flow logic, app chrome, dead feedback, mock coherence) and deliberately left
these: everything a mouse never touches, plus the polish that only shows up if
you watch closely. Five commits, four lanes.

The whole batch shares one property worth stating up front: **none of it changes
what the demo looks like.** Every ring is `:focus-visible`, every trap is keyed
to Tab, every Escape goes through a stack that yields to whatever is on top.
Drive the prototype with a pointer and it is unchanged to the pixel.

### The through-line — three library gaps, one shape

Three of the six keyboard findings were the SAME shape: a base component
announces a capability in the accessibility tree and then does not implement it.

| The base says | The base does |
|---|---|
| `CanaryButton` renders a real `<button>` | ...with `outline-none` at rest and no focus state, so the ring is 2px of transparent at every state |
| `CanaryOverflowMenu` renders a menu | ...whose items are `<div onClick>` with no role, no tabindex, no keys, and no Escape |
| `CanaryModal` draws a scrim over the page | ...with no `role="dialog"`, no initial focus, no trap, no restore — the page behind it stays fully operable |
| `CanaryListItem` puts `role="button"` on the `<li>` | ...and on the inner div too, so every row is a button inside a button, the outer one click-inert |

That is not four bugs, it is one habit: **the DRAWN state is complete and the
ANNOUNCED state is aspirational.** Every fix below is a stopgap keyed to the
library's own DOM or class names, and every one carries a "delete this file the
day the base handles it" note, because the alternative — a parallel component
set — is exactly the drift this branch spent batch 5 eliminating.

### 1. The focus ring, second half

Ask #49's root cause (batch 7) was the library's unlayered
`.outline-none { outline: 2px solid transparent; outline-offset: 2px }` — the
Tailwind v3 SHORTHAND, which sets outline-COLOUR where v4's sets only
outline-style. That fix restored the ring on FIELDS, which declare
`focus:outline-[#2858c4]` and were being blocked from painting it.

Buttons are the other half and they are a different problem: they declare no
focus state at all. So the fix is a `:focus-visible` treatment rather than a
restatement, in the same unlayered block, keyed on the library's own class
names:

```css
button.outline-none:focus-visible,
a.outline-none:focus-visible,
button.focus\:outline-none:focus-visible,   /* CanaryTabs, overflow trigger */
a.focus\:outline-none:focus-visible,
[role='button'].outline-none:focus-visible { outline-color: #2858c4; }
```

Three things make it safe. It sets only the COLOUR, so the geometry stays the
library's (2px solid, +2px offset, already in the shorthand). It is
element-qualified, so the field register above keeps its own −1px INSET ring
instead of being overwritten. And `:focus-visible` does not match a
pointer-focused button, so a mouse-driven demo paints nothing new.

Measured after: `#2858c4 solid 2px / +2px` on "New message", the three
thread-header icons, the composer tools and the modal commit buttons — and the
ring fades in over the button's own 200ms `transition-all`, which is the
library's, not ours.

### 2. ONE DISMISSAL GRAMMAR — the decision this batch is really about

The surface had four answers to Escape. `CanaryModal` handled it. `PanelShell`
handled nothing, so all five slide-in panels ignored the modal keystroke while
announcing `role="dialog"` over a full-viewport scrim. The panel's kebab
listened for an outside mousedown only. `AssignSelect` closed but dropped focus
on `<body>`.

The obvious fix — a document listener per surface — is wrong, and it is worth
writing down why, because it is the trap anyone re-doing this will fall into.
**These surfaces nest.** The unlink confirm is a `CanaryModal` at z 50 opened
from inside a panel at z 45; a kebab popover opens inside that same panel. Four
independent listeners means one Escape closes all of them.

So: `lib/products/messaging/escape-stack.ts`. One document listener, a LIFO
stack of layers, and Escape reaches the topmost only.

```
  open a panel                 → layer 1
  open a kebab inside it       → layer 2
  Escape → kebab closes, focus returns to its trigger, PANEL STAYS
  Escape → panel closes
```

**The modal layer is a deliberate no-op.** `CanaryModal` owns its own Escape and
we cannot take it off, so a modal registers a layer that does nothing — its only
job is to sit on top and absorb the keypress so the panel underneath does not go
with it. Both listeners fire; exactly one surface leaves.

Verified in a browser, in that exact sequence.

### 3. Modals take, trap and return focus

`ModalFocusScope` wraps all twelve `CanaryModal` call sites on this surface. It
is a `display: contents` element — no box, no line box, no flex/grid
participation, so it cannot move anything — which is the only reason wrapping
twelve differently-shaped call sites was a two-line change each instead of a
prop-plumbing exercise.

In order: remember the opener → move focus in on the next frame (waiting one
frame so a field with `autoFocus` wins) → trap Tab in a cycle at capture phase,
pulling focus back if it arrives from outside → restore to the opener on close,
**but only if the opener is still in the document**, because a modal whose
commit deletes its own launcher has nowhere honest to go back to.

Measured before: Tab three times from an open templates modal and you were on
the composer's AI pill BEHIND the scrim, and Enter flipped it.

### 4. Menus answer keys

`OverflowMenuKeys` wraps `CanaryOverflowMenu` and drives it through the two
doors the base exposes — a click on the trigger wrapper toggles, a click on an
item runs it and closes — while reading open/closed off the base's own DOM
shape (the popover is the root's second child and exists only while open). No
private state is guessed at; the base still owns opening and dismissal.

One unplanned win: `trigger` is a free slot and the workspace status pill hands
it a `CanaryTag`, which is a `<span>`. That menu had **no tab stop at all** —
unreachable rather than merely unusable. The wrapper makes the base's own
trigger wrapper the control when the trigger slot is not one, so the pill is now
`role="button" aria-haspopup="menu"` and operable.

The panel's hand-rolled `Kebab` and `AssignSelect` get the same contract stated
directly. `AssignSelect` finally matches `ScopeSelect` one surface over, which
had the whole thing right already — arrows, Home/End, Escape-returns-to-trigger.
One correction to the QA filing on the way: it claimed `AssignSelect` had no
Escape handler. It did; what it lacked was the focus return.

### 5. Send and status

- **The delivery ladder.** Outbound starts at `sending` and walks to `sent`
  (600ms) and `delivered` (1800ms). The two lower rungs already existed in
  `MessageStatus` and `STATUS_LABELS` and were unreachable for any live send,
  because `sendMessage` stamped `'delivered'` at creation. ⚠ The timings are
  fiction and have to read as PLAUSIBLE rather than fast: under ~300ms the
  ladder is a flicker, which is worse than not animating. Seeded failures never
  enter the ladder; inbound has no receipt of its own and is untouched.
- **The list follows the thread.** Unblock from inside Blocked used to collapse
  the list to "No conversations" while the pane went on showing the whole
  conversation, no row selected anywhere. Clearing the pane was the smaller fix
  and the more surprising one — the hotelier is READING this conversation, and
  taking it off screen as a reward for unblocking reads as an error. Following
  also makes the rule uniform: archive and block already land you on the inbox's
  top row, so **the list always shows the folder that holds your open thread.**
- **The draft card takes a stance.** "Response drafted by AI" used to render
  beside an "AI Off" pill, fully actionable. The pill is the hotelier saying
  *I am handling this conversation*; the draft is the AI's offer to handle it.
  While the first is true the second comes off screen. ⚠ HIDDEN, NOT DISCARDED —
  `drafts[threadId]` is untouched, so toggling back On returns the same draft
  word for word. A pause that destroyed the AI's work would make the toggle a
  one-way door.
- **The commit button names what it does.** With a time pinned the broadcast's
  Send routes to the queue and skips the confirm (production parity, already
  documented); the label went on promising an immediate blast. Now
  "Schedule via SMS" — production's, and the same shape as the 1:1 composer's
  "Send via SMS": the verb changes, the channel stays. The count drops out
  because the pill directly above already states the WHEN, which is what a
  scheduled blast is read for.

### 6. The GJ timeline

Two findings, one root cause: the page trusted `buildJourneyTimeline` to have
put things in an order the page then contradicted in prose.

- **Clock first, stage as the tie-break.** The sort was `STAGE_ORDER` first, so
  Mid-Stay "Jul 15 · 10:00 AM" rendered directly above Checkout "Jul 15 ·
  8:00 AM" on a rail whose entire grammar is *later is further down*. Nothing
  moves across days — the journey stages were already chronological — so the
  visible change is exactly the same-day inversions.
- **The timestamp's verb IS the card's tag.** `sentAt` is set for anything
  ATTEMPTED and a failure implies an attempt, so a fully-failed card printed
  "Sent Feb 5 · 10:00 AM" beside its own red Failed tag. One vocabulary now —
  Sent / Failed / Scheduled — so the tag and the time cannot disagree again.
  Partial failures still read "Sent", correctly: something landed.

### 7. Input validation, and one phone register

- **Rejection became visible.** Compose's `commit()` was an `if` with no `else`.
  The ≥10-digit gate is right and deliberate; the product simply never said so,
  so garbage plus Enter was indistinguishable from a broken app. The base's error
  register paints in the field, and the pane's ONE line of prose mutates from the
  instruction into the rejection — same slot, same ramp, error colour. The pane
  never grows a second explanatory line, because there is nowhere to put one: the
  header row is a single 40px line with a Cancel button on the end.
- **The new-group gate was the mirror image.** `entryPhone.trim().length > 0`
  let "banana" through Add contact, into the table, and into a saved group. Both
  surfaces read one shared `isPlausiblePhone` now.
- **One phone register.** `formatPhoneForDisplay` in
  `lib/products/messaging/phone.ts`, applied everywhere raw digits reached the
  screen. ⚠ DISPLAY ONLY — `contactNumber` is untouched and the store still
  matches on digits, so formatting can never fork a thread or fail a match. And
  it REFUSES rather than guesses: ten digits (or eleven with a US country code)
  become `(201) 555-0123`; anything else — short, international, alphabetic —
  comes back byte-identical. A formatter that reshapes what it does not
  understand turns a number a hotelier could still dial into one they cannot.

### 8. Three small honesties

- **Refresh answers now.** Both card-header refresh icons produced zero DOM
  mutations while painting the same hover wash and pointer cursor as the live "+"
  beside them. Refresh is the SAFE click — the control a demo audience tries
  first *because* it cannot break anything. ⚠ It deliberately does NOT get the
  `isStub` treatment: that register is for actions belonging to a product this
  branch does not carry ("Add an upsell"). Refreshing a card is this panel's own
  action and there is nothing to fetch — the data is a fixture, so a real refresh
  would re-render byte-identical rows. So the glyph turns exactly one revolution
  and then nothing changes, because nothing changed. Which is what a refresh
  against unchanged data looks like in the real product too.
- **Offline says what Away says.** `offline` was a selectable `WorkspaceStatus`
  consumed by nothing but the pill's own colours. THE MUTATION RULE: the band's
  tone, icon and second sentence never change; only the first sentence changes,
  and what it names is WHO decided the property is not answering — a person or
  the clock.

  | status | copy |
  |---|---|
  | `away` | You are away. Auto response is enabled. |
  | `offline` | Outside online hours. Auto response is enabled. |

  ⚠ STILL NOT BUILT: a real schedule. Nothing compares the clock against the
  "Online hours: 8:00 AM – 11:00 PM EST" the top bar prints as static text, so
  the off-hours copy is reached by picking Offline from the pill rather than by
  time passing. That is the honest demo shape — the copy exists and is reachable
  — and the scheduler stays on the not-built list.
- **Rachel Cohen's card is hers.** `res-rachel-nov.paymentCard.cardholderName`
  read "Rachel Green", one drill-in from a thread the panel titles Rachel Cohen.
  Fixed at the canonical data, plus the stale comment header in `ai-mock.ts`.

### Files touched (QA-2)

**New**
- `lib/products/messaging/escape-stack.ts` — the LIFO Escape stack
- `lib/products/messaging/phone.ts` — `formatPhoneForDisplay` + `isPlausiblePhone`
- `components/products/messaging/ModalFocusScope.tsx`
- `components/products/messaging/OverflowMenuKeys.tsx`

**Changed** — `app/globals.css` · `MainNav` · `MessageTemplatesModal` ·
`ThreadView` · `ThreadListItem` · `ComposeHeader` · `ai/ThreadAiSlot` ·
`ai/AddInformationModal` · `ai/AiFeedbackModal` · `ai/CarrierErrorModal` ·
`broadcast/BroadcastComposer` · `broadcast/BroadcastFilterPanel` ·
`broadcast/BroadcastMessageBubble` · `broadcast/BroadcastScheduledPanel` ·
`broadcast/CreateGroupModal` · `broadcast/ScheduleSendTimeModal` ·
`broadcast/ScheduledBroadcastBlock` · `panel/AssignSelect` · `panel/PanelShell` ·
`panel/PanelTabs` · `panel/panel-ui` · `panel/ConversationDetailsPanel` ·
`panel/ScheduledMessagesPage` · `panel/ReservationRecord` ·
`panel/ReservationResultRow` · `panel/UnlinkConfirmModal` ·
`lib/products/messaging/store` · `lib/products/messaging/guest-journey-link` ·
`lib/products/messaging/useRowKeyActivation` · `lib/core/data/reservations` ·
`lib/products/messaging/ai-mock`

### Stub inventory — QA-2 update

Unchanged entries stand. Three changes:

- **Both card-header "Refresh" icons are ON the list**, as *answering stubs*: a
  one-revolution spin and no data change. A new sub-category, and the only member
  of it. Distinguish it from `isStub` (which drops the pointer cursor and names
  another product) — that register is for actions this branch cannot perform;
  this one is for an action with nothing to do.
- **The call-details PLAYBACK BAR is on the list.** Play, ±15s and the speed
  chip are all inert and the source has always said so ("PLAYBACK IS DECORATIVE
  BUT COHERENT" — there is no `<audio>` element anywhere, by design), but it was
  absent from this inventory while "Download Transcript" on the same page was on
  it. It is the most functional-looking dead control in the panel: a filled
  primary play button and a live-computed scrubber. **Not changed in code, on
  purpose** — the decorative-but-answering rationale in `CallDetailsPage.tsx` is
  a standing ruling, not an oversight. Listed so a demo driver knows not to press
  Play in front of SJ.
- **The top-left property switcher is on the list.** `CanaryAppShellV2` renders
  the hotel name with an always-present ⇅ chevron and `cursor: onPropertyClick ?
  "pointer" : "default"`; this branch passes `property` and no handler. It sits
  in the corner of every screenshot. **Shell territory, not changed here** — the
  honest fix is library-side (hide the chevron when there is no handler), which
  is ask #62 below; a branch-level no-op handler would buy a pointer cursor and
  still leave the hover paint missing, because the component attaches no hover
  state to that row at all.

### Not in QA-2's scope, and still open

- **Linking the primary guest's OWN stay lands with no feedback.** The flow
  returns to the Linked Reservations tab (companions unchanged, correctly — a
  guest's own stay is not their own companion) and the only trace is the
  "Emily's Reservations" count ticking. The data routing is deliberate; the
  rough edge is the silent landing. Cheapest fix is a success toast in `onLink`
  — the Toast plumbing already exists in the panel and the service-task unlink
  beside it already toasts.
- **The link picker showed one reservation twice** for the query "Emily"
  (identical rows, same confirmation code). Mock-data duplicate or a missing
  dedupe in the picker; noticed during QA verification, never triaged.

### ⚠ Library / build asks — additions

56. **`CanaryButton` has no focus state.** It composes `cursor-pointer
    outline-none` and names no `:focus-visible`, so with #52's hand-written
    `.outline-none` shorthand in play, every button on every consuming surface
    computes a 2px TRANSPARENT ring at focus. Same for `CanaryTabs`, the
    overflow-menu trigger and the dialog/side-sheet close buttons, which use the
    `focus:outline-none` variant of the same shorthand. Give them a real
    `:focus-visible` treatment, or stop writing `outline-none` at rest so the UA
    default survives. Companion to #52; both die together.
57. **`CanaryOverflowMenu` has no keyboard.** Items are `<div onClick>` with no
    `role`, no `tabindex` and no key handling; the only dismissal is a document
    click-outside listener. A keyboard user can open a menu they can neither
    operate nor close. Wanted: focusable `role="menuitem"` items, arrow
    navigation, Escape-closes-and-restores-focus, and a focusable trigger
    wrapper when the `trigger` slot is not itself a control (it takes any node —
    ours is a `CanaryTag`).
58. **`CanaryModal` has no focus management.** No `role="dialog"`, no
    `aria-modal`, no initial focus, no trap, no restore — the page behind the
    scrim stays fully operable from the keyboard, verified by toggling a control
    behind an open modal. Escape and × close correctly; everything else leaks.
    ~~Wanted from the library.~~ **PARTIALLY COVERED by an app-level stopgap,
    QA-4 (2026-08-25):** `ModalFocusScope` (all twelve call sites) now renders
    the real `role="dialog"` + `aria-modal="true"` on its own wrapper div, on
    top of the initial-focus/trap/restore it already did — the missing piece
    turned out to be the same bug that broke the CanaryModal-title-18px rule
    (`[role='dialog']` matched nothing because nothing rendered it). This ask
    stays open only because it is an app-level patch on a `display: contents`
    div, not the library rendering the role on the dialog itself — delete the
    wrapper's ARIA the day `CanaryModal` does.
59. **A DISMISSAL CONTRACT across the base surfaces.** `CanaryModal` owns Escape
    privately and the (still-unbuilt) inset side-panel variant will need it too.
    Two independent document listeners means one Escape closes both a modal and
    the panel that launched it. Wanted: a shared layer stack, so nesting works
    without every consuming app rebuilding one. Extends the "side-panel
    standard" promotion item.
60. **`CanaryListItem` announces a doubled role.** `role="button"` lands on the
    `<li>` AND on the inner div, with identical accessible names and the click
    handler on the inner one only — so the row reads as a button inside a
    button and the outer, focusable node is click-inert. Extends the existing
    "handle your own keys" ask on the same component; both are one fix.
61. **`CanaryInputPhone` spreads no native input props.** `CanaryInputPhoneProps`
    declares `value`/`onChange`/`defaultCountry`/`size`/`placeholder` and nothing
    else — no `onBlur`, no `onKeyDown`, no `ref` passthrough to the events — so a
    "touched" signal has to be taken off a React blur bubbling out of a wrapper
    div. Its internal `onChange` also fires on `keyup`/`change`/`blur` rather
    than `input`, which is worth documenting whatever else changes.
62. **`CanarySidebarV2` draws a property-switcher chevron with no switcher.**
    The ⇅ glyph renders unconditionally while `cursor` is branched on
    `onPropertyClick`, and the row attaches no hover state at all — unlike the
    back button directly below it in the same component. Hide the chevron when
    there is no handler, or give the row the same hover register as its siblings.

### ⚠ Dev-server note (second instance, same watcher)

QA-1 logged the running dev server's watcher missing new route directories. It
does the same thing to **CSS**: the 45-line addition to `app/globals.css` was not
picked up at all — not on save, and not on `touch` — and the served chunk kept
its old hash while JS HMR went on working normally. A second edit that changed
CONTENT again did trigger the rebuild, after which the rule served correctly and
was verified live.

Worth knowing because the failure mode is silent and looks exactly like a broken
selector: the rule is in the file, the page is freshly loaded, and the computed
style has not moved. Check the served chunk before debugging the CSS. A fresh
`pnpm dev` or a production build never sees this.

---

## QA-3 — the fix seams (2026-08-25)

Twelve confirmed findings, and what they have in common is where they live:
every one of them is an EDGE of a QA-1 or QA-2 fix rather than a place those
batches never reached. One-number-one-thread compared raw digits while the
formatter beside it already knew a `+1` was optional, so the most ordinary way a
US hotelier types a number forked the duplicate row the rule exists to prevent.
The-list-follows-the-thread was wired into unblock and archived-send but not
into compose, so composing from Archived opened a conversation on the right and
left the list showing a folder that did not contain it. Read-is-human was
honoured by every landing except the page's own auto-select, which spent the
fixture's seeded unread dot before the demo began and ate a hand-set "Mark as
Unread" on compose-cancel. Escape-closes-panels shipped without the focus
restore that makes closing survivable, and the one popover that never registered
a layer dismissed the panel underneath it along with itself. `CanaryExpand`'s
header swallowed Enter on behalf of everything nested inside it, which made
three kebabs keyboard-dead and silently toggled the record instead. The focus
ring was keyed on the library's class names rather than on what a control IS, so
adopted and hand-rolled controls kept the UA default and the surface painted two
rings; the one it did paint faded in over 200ms because `transition-all`
animated it. The Guest Journey timeline split sent from scheduled on a
per-reservation clock and ended up claiming a Mar 17 message had been sent, two
clicks from a thread whose separator says Mar 16. "New group" refuses to save
without a contact and then stored those contacts where the audience pipeline
never looked, so every group the flow could produce was born unsendable. And a
module-scope `Date.now()` in the broadcast fixtures, read once on the server and
once in the browser, put a red dev-overlay badge on the surface about once every
thirty loads. The through-line: a rule that is stated once and applied
everywhere is a fix; a rule that is stated twice, or applied at four of its five
doors, is a bug with better paperwork. So the phone normalizer, the demo clock
and the guest resolver each now exist exactly once, and the ring is stated by
role rather than by ancestry.

### The twelve

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | 10-digit compose forked a duplicate thread | `phoneIdentity` in `phone.ts` is the ONE normalizer; `store.phoneKey` is now an alias of it |
| 2 | Compose from Archived stranded the list | `createThreadFromPhone` sets `currentView` to the folder holding the thread |
| 3 | Cancel-compose (and mount) ate unread dots | page auto-select uses `focusThread`, not `selectThread` |
| 4 | Folder switch mid-compose left compose over a selected row | `setCurrentView` exits compose |
| 5 | GJ timeline claimed a Mar 17 send as "Sent" | `reservationNow` capped at `DEMO_TODAY` evening |
| 6 | Accordion header swallowed Enter/Space from nested kebabs | `Kebab` stops propagation of the keys it owns; library ask #63 |
| 7 | `OverflowMenuKeys` bypassed the escape stack | registers a layer, open state read off the DOM |
| 8 | Escape-closing a panel stranded focus on `<body>` | `PanelShell` captures and restores its opener |
| 9 | Two focus-ring registers on one keyboard path | ring stated by role; rows take a −2px inset |
| 10 | Ring faded in over 200ms | `transition-property: all, outline-color` with `0s` for the ring |
| 11 | Created group was permanently unsendable | contacts become recipients; `broadcast-contacts.ts` resolves both kinds |
| 12 | Dev-overlay badge could appear mid-demo | hour-snapped fixture seeds + `devIndicators: false` |

### Files touched (QA-3)

`lib/products/messaging/phone.ts` · `store.ts` · `guest-journey-link.ts` ·
`broadcast-store.ts` · `broadcast-mock-data.ts` · `broadcast-audience-split.ts` ·
`broadcast-audience-facts.ts` · **new** `broadcast-contacts.ts` ·
`app/(dashboard)/messages/page.tsx` · `app/globals.css` ·
`components/products/messaging/OverflowMenuKeys.tsx` ·
`panel/PanelShell.tsx` · `panel/panel-ui.tsx` ·
`broadcast/BroadcastFilterPanel.tsx` · `BroadcastThread.tsx` ·
`BroadcastDeliveryPanel.tsx` · `BroadcastScheduledPanel.tsx` · `next.config.ts`

### ⚠ Library ask — addition

63. **`CanaryExpand`'s header eats the keyboard of everything it contains.** The
    header is a `role="button"` div whose `onKeyDown` runs `preventDefault()` +
    `onToggle()` on ANY bubbled Enter/Space, with no `event.target` guard. A
    kebab, a link or any control placed in the `header` slot is therefore
    keyboard-dead — the cancelled default is the native click that never fires —
    and pressing Enter on it silently toggles the record instead. Wanted: ignore
    key events whose target is not the header itself. A disclosure header that
    cannot hold a control cannot hold the anatomies these rows draw.

### ⚠ Note on `devIndicators: false`

`next.config.ts` changes do not hot-reload; the badge stays reachable until the
dev server is next started. The hydration root cause is fixed in the fixtures
regardless, so the badge has nothing to report either way.

### Not in QA-3's scope, and still open

- **The panel takes no initial focus on open.** QA-3 gave `PanelShell` the
  restore half of the modal pattern and deliberately not the other two —
  initial focus and a Tab trap. The panel is a companion to the conversation,
  not a takeover of it, and a `role="dialog"` over a scrim that does not trap
  Tab is a separate design question rather than a bug to patch in a fix batch.
- **`dayOffset()` still reads the real calendar day.** Same SSR/client class as
  the hour-snapped seeds above, at day granularity, so it can only diverge
  across midnight. Left alone because the broadcast folders are seeded relative
  to "today" ON PURPOSE and pinning them would change which arrivals the demo
  shows.

## Batch 8 — Filter modal, Figma-compliant (2026-08-26)

The broadcast filter modal ("In-house guests" / "Arriving today" / etc.) brought
into line with Miguel's frame, Figma 1435-17906. Five changes, one gate, one
deletion.

### 1. Fixed 887×738 geometry — supersedes the 1300px width

`BroadcastFilterPanel.tsx`

The team-jam canon line "A panel won the filter surface" (2026-07-30, above)
was already superseded once, on 2026-08-25, when Miguel ruled the surface back
to a modal — "for broadcasts we had it as a modal." That modal then ran
`!max-w-[1300px]`, a width picked because two columns didn't fit the 800px
family, not because it was measured off a frame. This batch measures it:
`!max-w-[887px]`, with the two columns and the gutter now exact —
24px outer insets, two 407.5px columns, a 24px gutter
(24+407.5+24+407.5+24 = 887) — carried by the modal body's own `px-6`/`gap-6`
rather than per-column padding.

The body slot also gets a FIXED flex-basis (666px = 738 total − the header's
72px) with `grow-0`/`shrink`/`min-h-0`, so the modal's rendered height stops
being a function of how many guests match. Miguel: "the height just shortens,
that can't happen." Verified at 21, 1, and 0 matches — identical modal height
in all three; `max-h-[90vh]` still clamps (and compresses the body, never the
header) on short viewports.

### 2. Rate code / Group code / Room number → `CanaryInputMultiple`

`BroadcastFilterPanel.tsx` · `BroadcastFilterControls.tsx`

Miguel's verdict on the hand-rolled `TypeToChipInput`: it was doing the wrong
thing — chips belonged INSIDE the bordered field, not in a tray drawn above it.
`TypeToChipInput` and its `ValueChip` are deleted; all three code fields are now
the base `CanaryInputMultiple`, which draws each value as a `CanaryChip`
REMOVABLE inside the bordered field, above the type-in line, with a
focus-within outline and blur-commit for free. The one gap: the base does not
normalize on commit, so `normalizeCodeValues` (upper-case + de-dupe) wraps
`onChange` before it reaches the store — codes are case-insensitive
identifiers, and the base correctly has no opinion on that. Helper text is now
`Press "Enter" to add`, matching the quoted "Enter" in the Figma anatomy.

No further library gaps found: `CanaryInputMultiple`'s anatomy (label above the
field, chips inside, helper text below) already matches Figma 1435-17906
without an override. The ask ledger stays at #63; nothing new logged for this
control.

### 3. Non-input labels match the base input label

`BroadcastFilterControls.tsx`

Miguel: "you'll notice that the label styling will be different so the other
non-inputs should match." `FilterSectionLabel` — now only above Loyalty status,
Length of stay and Guest recurrence, since Rate code/Group code/Room number
carry their own label via `CanaryInputMultiple` — is restyled pixel-identical
to the base input label at `InputSize.NORMAL`: weight 500 → 400,
`colors.colorBlack1` → Tailwind `text-black` (the base hardcodes the Tailwind
class, not the token), bottom gap 8px → 4px. `CanaryFormLabel` was checked
first and doesn't fit — it renders 14px, weight 500, `colors.colorBlack2`, a
different and more prominent register meant for standalone labeled fields — so
this stays a hand-restyled `<p>`, not a base-component swap.

### 4. Trailing-check roster — supersedes leading checkbox + in-modal NOT SENDING roll-up

`BroadcastFilterPanel.tsx` · `broadcast-audience-split.ts`

The Figma row has no leading checkbox: selection reads as a trailing 20px check
(`colors.colorBlueDark1`, darkening to `colors.colorBlack1` on hover) at the
row's right edge, over a hover-washed (`colors.colorBlack8`) hit target.
`GuestRow` drops `CanaryCheckbox` and its `mdiLockOutline` "locked" state for a
hand-rolled `role="checkbox"` div — a conscious, Figma-driven exception to the
base-components-are-the-floor rule, since no base row anatomy has a
checkbox-less, trailing-indicator toggle. `aria-checked` carries the state;
Enter/Space toggles like a click.

The modal's NOT SENDING roll-up — the collapsed bar, the four reason groups,
"Include all" — is gone. Unreachable guests (no phone, opted out) now render
INLINE in the same sorted list, greyed (`colors.colorBlack3` name + sub-line),
`aria-disabled="true"`, not toggleable, with their reason folded into the
sub-line by `guestRoomMethod` (e.g. "118 STD · No phone number" — shorter, and
Figma's `·` separator, not production's "Opted out from messaging"). The count
semantics are unchanged: "N guests match" still counts everyone matched,
reachable or not; the send list is still `selectedGuestIds`. `ReasonGroup` is
deleted.

`getAudienceSplit` keeps its full `sending`/`unreachable`/`statusHeld`/
`userRemoved` shape — trimming it to only what this one call site now paints
would be a bigger change than this batch asked for — but its two other
exports, `summariseNotSending` and `notSendingCount`, had exactly one caller
each (this same file, inside the deleted roll-up) and are now genuinely dead;
both are deleted. A repo-wide check found no OTHER surface (`BroadcastToStrip`,
`BroadcastDeliveryPanel` / "Message details") importing anything from
`broadcast-audience-split.ts` — the reason-grouping logic this file was built
to carry does not currently survive anywhere else, worth flagging since the
opposite was the working assumption going in. New export:
`sortGuestsByLastName`, the same comparator `getAudienceSplit`'s buckets were
already sorted by, applied across the merged `visible` set so the roster reads
in "normal sort position" instead of matched-then-grouped-by-reason.

### 5. "Start from a segment" — gated off

`BroadcastFilterPanel.tsx` · `BroadcastView.tsx`

Not in the Figma frame. `SHOW_START_FROM_SEGMENT = false` (same idiom as
`SHOW_SOURCES_CHIP` in `MessageBubble.tsx`) hides the label, `CanarySelect` and
Save button; `handleStartFrom`, `segmentOptions`, `sourceSegmentId` and the
Save-as-segment nested modal all stay wired but unreachable, ready to flip back
when the segments feature resurfaces. `BroadcastView.tsx`'s header comment,
which claimed "Manage segments is reachable only from the filter modal's Guest
Segments mode," is corrected — right now it is reachable from nowhere.

### ⚠ Focus-visible ring gap, found not fixed — CLOSED in the follow-up commit

The new checkbox row is a real focusable control (`tabIndex`, `role="checkbox"`,
`aria-checked`, Enter/Space), but `app/globals.css`'s existing role-keyed
`:focus-visible` block (QA-3, 2026-08-25) lists `button`, `a[href]`, `summary`,
`[role='button']`, `[role='menuitem']`, `[role='option']`, `[role='tab']`,
`[role='switch']`, `[role='combobox']` — `[role='checkbox']` is not among them,
so the row took focus with no visible ring. The batch left it documented rather
than patched (its drive-by budget named exactly two stale comments); the commit
after the batch added `[role='checkbox']:focus-visible` to that selector list,
in the same pattern the list already follows.

### Files touched (Batch 8)

`components/products/messaging/broadcast/BroadcastFilterPanel.tsx` ·
`BroadcastFilterControls.tsx` · `BroadcastView.tsx` ·
`lib/products/messaging/broadcast-audience-split.ts`

## Batch 9 — Demo-day review, second pass: composer parity, production-format status rows, details open by default (2026-08-26)

Three fixes out of Miguel's 2026-08-26 demo-day review (Batch 8 was the
first). Unrelated to each other except in timing — one composer, one panel
row format, one default-state call — so they land as one entry rather than
three thin ones.

### 1. Broadcast composer re-synced to the Conversations composer

`BroadcastComposer.tsx` · **new** `components/products/messaging/composer-ui.tsx`
(`ToolIcon` extracted from it) · `MessageComposer.tsx` (import only, zero
behaviour change) · `broadcast/BroadcastThread.tsx`

Miguel: the To strip is fine, but "everything underneath it is wrong." It
was — `BroadcastComposer` had stayed on its July-28 baseline (hand-rolled
`<textarea>`, a second hairline above the toolbar, padding-6 icon buttons with
a hover-wash box, a 32px text-pill Send) through every batch that rebuilt
`MessageComposer` on top of it, and the two composers had quietly drifted
apart. This batch re-syncs everything below the strip:

- **`ToolIcon` moved out of `MessageComposer.tsx`** into a new shared
  `composer-ui.tsx` so both composers' toolbars render through one component
  instead of two hand-tuned copies of the same idea. `MessageComposer`'s own
  six call sites are untouched — it now imports what it used to define.
  Broadcast's Attach and Templates icons take the identical bare-18px,
  gray→blue-on-hover treatment; the Schedule clock (custom-group audiences
  only) joins the same row and goes blue via `isActive` once a time is pinned,
  the same latch Conversations' Translate tool uses.
- **The textarea is now `CanaryTextArea`** with Conversations' exact classes
  (`field-chromeless textarea-composer scrollbar-invisible`) and the same
  manual autosize effect (22px floor, 140px cap) — the hand-rolled
  `<textarea>` had no autosize at all. Placeholder stays `"Type message..."`,
  deliberately NOT copied from the SMS-specific 1:1 wording: a broadcast is
  channel-neutral.
- **The second hairline is gone.** Only the rule under the To strip remains
  (untouched, per the brief — `BroadcastToStrip.tsx` was not opened).
- **The card shell is now `CanaryCard`** at `CardPadding.COMPACT`, and it
  DOES host the full-bleed strip — see the ⚠ below for how and the new
  library ask that comes out of it.
- **Send lost its label.** "Send to N guests" / "Schedule via SMS" / "Send"
  is gone; the button is `MessageComposer`'s exact icon-only square
  (`CanaryButton` ICON_PRIMARY COMPACT, `icon-btn-28 icon-btn-r8
  icon-btn-nodim`, white `mdiSend` at 0.7, full-strength blue even while
  disabled). The recipient count already lives in the To strip and the
  scheduled pill already states the WHEN — the button repeating either fact
  was saying the same sentence twice. The accessible name still carries the
  verb: the mdi `Icon`'s `title` reads "Send broadcast" or "Schedule
  broadcast" once a time is pinned, same title-as-name pattern every icon
  button on this surface already uses. `showSendCount` — the prop that used
  to gate the retired label — is now dead with nothing to gate, so it's
  removed from `BroadcastComposerProps` and its one call site in
  `BroadcastThread.tsx` rather than left as an inert prop nobody can act on.

All broadcast-only logic survived untouched: `canSend`'s `recipientCount > 0`
gate, the send-confirm modal and its "Review recipients" link, the
schedule-vs-confirm routing in `requestSend`, the scheduled pill with its
clear ✕, and the templates modal's broadcast deltas (no Apple tab, literal
merge tags).

⚠ **`CanaryCard` HOSTS THE FULL-BLEED STRIP — it does not structurally
refuse it, but it does not offer it either.** `CanaryCard` wraps every child
in exactly one `p-3` (12px, at COMPACT) div; there is no separate edge-to-edge
slot the way `MessageComposer`'s own `topSlot` gets by living entirely OUTSIDE
its card. Broadcast's To strip has to stay INSIDE this card — it shares the
card's rounded top corners and its hairline has to run the card's full width
— so it rides a negative-margin bleed wrapper: `margin: -12px -12px 0 -12px`
cancels the COMPACT padding on three sides and lands the strip flush against
the card's own 1px border, identical to where the hand-rolled shell had it;
the bottom margin stays 0 so the textarea resumes at the ordinary inset right
after. `overflow-hidden` alongside the existing `!rounded-[12px]` override
clips the strip's square corners to the card's rounded ones — the one thing
the hand-rolled shell got for free from `overflow-clip` and this trick has to
ask for explicitly. Measured against the previous DOM, the geometry is
pixel-identical. Logged as library ask #64 below rather than left as a
one-off trick, since any future full-bleed header/footer inside a
`CanaryCard` (a table's zebra row, a media card's cover image) will hit the
same wall.

### 2. Check-in / Checkout rows → production's plain-status + conditional open-icon format

`panel/ReservationRecord.tsx` · `panel/panel-ui.tsx` (**new** `OpenRecordIcon`,
sibling of `CopyIcon`)

Verified against production's Vue source: the status word ("Submitted") is a
PLAIN, non-interactive span — never a link — and the only clickable element is
a small open-in-new icon beside it, rendered ONLY when a check-in/checkout
record exists, opening a details modal overlay. Our two rows were doing the
opposite: the whole value was `isLink`-blue with no icon and no modal behind
it. Miguel's ruling: format them like Confirmation number — plain value,
trailing icon.

`isLink` is dropped from both rows; the value now renders in `DetailRows`'
plain `colorBlack2` register, same as Confirmation number's. `OpenRecordIcon`
is `CopyIcon`'s sibling rather than a new register — same `CanaryButton`
anatomy, same TINY / `.icon-btn-20` size, same neutral hover wash via
`.icon-btn-neutral` — with the rest colour changed to `colorBlack3` (an
outline glyph beside a plain value, not `CopyIcon`'s link-blue) and it renders
in the row's `trailing` slot ONLY when `checkInStatus`/`checkOutStatus` is
`'Submitted'` or `'Completed'` — the exact condition that used to gate
`isLink`. The click is a NO-OP, added to the accepted-stubs list alongside
playback and the property switcher: production opens a check-in/checkout
details modal this branch has not built, and the icon deliberately does NOT
navigate to `/check-in` — that would assert a destination production doesn't
use. The Guest Scheduled Messages row (its own `isLink`/red-error register,
unrelated to this fix) is untouched.

### 3. Reservation details open by default

`panel/ConversationDetailsPanel.tsx`

Miguel: "the sidebar should show reservation details already." `detailsOpen`
now initialises to `!isAnonymous` instead of a hardcoded `false`, and the
thread-change reset effect sets the same derived value rather than forcing it
closed — switching threads lands on a linked guest with the band already
open. Anonymous threads keep the collapsed default on purpose: the low-weight
"Show thread details" treatment for a bare phone number was a deliberate,
data-justified call from the panel's 2026-08-21 rebuild, not an oversight, so
the state is DERIVED from `isAnonymous` rather than two independent defaults
that could drift.

Arrival does not animate — only a user's own toggle does, reusing the
mechanism `ReservationsPage`'s spotlight-stay accordion already established
for the identical problem (its header comment: "the arrival does not animate,
only the toggles do"). That page gates an `ExpandRegion`'s `animateOnMount`
off a `hasToggled` flag; this band isn't built on `ExpandRegion` — it's one
always-mounted `grid-template-rows` div, not a conditionally-mounted body — so
the same idea is applied one layer down: a new `hasToggledDetails` flag
(`false` until the `ExpanderPill` is actually clicked, reset alongside
`detailsOpen` on every thread change) guards all three of the band's own CSS
transitions (`background-color`/`border-bottom-color`/`margin-bottom` on the
zone, `grid-template-rows` on the grid, `opacity` on the inner content). Until
the first toggle, every one of those properties renders with `transition:
'none'`, so a linked thread arrives already open with no grow-in; the first
click (and every one after) restores the full 220ms open / 160ms close
easing. The expander pill correctly reads "Hide reservation details" from the
first frame, since it renders whatever `detailsOpen` already is.

### ⚠ Library ask — addition

64. **`CanaryCard` has exactly one children slot, padded, with no full-bleed
    option.** `cardPadding`/`padding` apply to a single wrapping div around
    `children`; there is no header/footer-style slot that reaches the card's
    own edges the way `title`/`footer` reach the border-top/border-bottom but
    not the sides. A full-bleed strip inside a padded card currently has to
    cancel the padding by hand with a negative-margin wrapper sized to match
    whatever `cardPadding` resolves to — brittle if the padding scale ever
    changes underneath it. Wanted: an `edgeSlot` (or a `padding="none"` on a
    per-child basis) that reaches the card's own border on all sides.

### Files touched (Batch 9)

`components/products/messaging/broadcast/BroadcastComposer.tsx` ·
**new** `components/products/messaging/composer-ui.tsx` ·
`components/products/messaging/MessageComposer.tsx` ·
`components/products/messaging/broadcast/BroadcastThread.tsx` ·
`components/products/messaging/panel/ReservationRecord.tsx` ·
`components/products/messaging/panel/panel-ui.tsx` ·
`components/products/messaging/panel/ConversationDetailsPanel.tsx`

## Batch 10 — Demo-day review, continued: entry-page back button, archive toast (2026-08-26)

Two more fixes out of the same 2026-08-26 demo-day review pass (Batches 8 and
9 were the first two). Related only in timing.

### 1. Direct-entry drill-ins render no back arrow

`panel/ConversationDetailsPanel.tsx` · `panel/CreateServiceTaskPage.tsx`

Miguel, on the create-service-task page reached from the composer's cloche
icon: it "shouldn't have a back button because it's just the service ticket
that they care about." The general rule, not a one-off for this page: a
drill-in that is the panel's ENTRY page — reached by `setStack([...])`
replacing the whole stack rather than by `push` onto an existing one — has
nothing beneath it to walk back to, so it renders no back arrow. A page
`push`ed from the root (or from another drill-in) always has the root
beneath it and keeps the arrow.

Mechanically: `PanelRoute` gained an `isEntryPage?: boolean` field
(intersected across every route kind, so the concept generalizes even though
only one kind uses it today). The panelIntent effect — the ONE call site that
`setStack`s a populated array outright, servicing both the composer cloche
AND the amber recommended-ticket band's "Review" — sets `isEntryPage: true`
on the route it creates. The in-panel `push({ kind: 'create-task' })` from
the Tasks tab does not set it, so that path keeps its back arrow (the stack
still has the root "beneath" it there, in the sense that matters — the user
was just standing on it). The create-task render block passes
`onBack={r.isEntryPage ? undefined : pop}`; `CreateServiceTaskPage.onBack` is
now optional, matching `PanelHeader.onBack`, which already rendered no arrow
when the prop was omitted — no change needed there. The X (close) is
untouched in both cases; only the arrow is conditional. `grep`-confirmed:
`create-task` is the only page ever reached via a direct `setStack([{...}])`
populate — every other kind only ever arrives via `push`, so no other page's
behavior changes.

### 2. Archive fires a toast

`lib/products/messaging/store.ts`

Miguel: "Archive should have a toast saying 'thread archived.'" `archiveThread`
now calls `get().showToast('Thread archived')` after it re-files the thread,
closes the panel, and lands on the inbox's top row — one call site, so every
entry point that goes through this action gets the receipt (today that's the
thread header's Archive icon; `grep` for `archiveThread` turned up exactly one
caller, `app/(dashboard)/messages/page.tsx`'s `ThreadView onArchive`). The
message matches the surface's existing toast register (sentence case, past
tense, no trailing period — "Feedback submitted", "Added to AI knowledge").
Unarchiving stays silent on purpose: the QA ruling that messaging into an
archived thread re-opens it is a quiet recovery, not a user-initiated action
worth confirming, so `reopenThread` is untouched.

### Related, same-day, landed separately

**AI feedback submit now closes the panel after the toast** (commit
`79784a2a`) — noted here for the record, not re-implemented in this batch.

### Files touched (Batch 10)

`components/products/messaging/panel/ConversationDetailsPanel.tsx` ·
`components/products/messaging/panel/CreateServiceTaskPage.tsx` ·
`lib/products/messaging/store.ts`

## Batch 11 — Demo-day review, continued: "Composer = modal" (2026-08-26)

Miguel's ruling, stated plainly: **"Composer = modal."** Anything the
composer's tool row launches opens a MODAL. Templates already conformed — it
has opened `MessageTemplatesModal` since batch 5. The service-ticket cloche was
the one violator: it opened the Conversation Details panel straight to its
create-task drill-in, which meant one tool in the row behaved like every other
control on the surface's right-hand panel while its five siblings behaved like
dialogs. Production agrees — ticket creation is a centred `CanaryDialog` from
every entry point, panel included.

### 1. The cloche now opens `CreateServiceTaskModal`

`components/products/messaging/CreateServiceTaskModal.tsx` (new) ·
`components/products/messaging/MessageComposer.tsx`

The composer's service-ticket tool icon (`mdiRoomServiceOutline`) no longer
calls `requestCreateTask` — the `panelIntent` mechanic that told the
Conversation Details panel to reset its stack and land on `create-task`. It
now sets local state (`isCreateTaskModalOpen`) and opens
`CreateServiceTaskModal`, mounted by the composer for the same reason
`MessageTemplatesModal` is: every exit writes to state or calls a handler this
component already owns, so the modal has no business living anywhere else.

The modal joins the CONTENT-MODAL FAMILY exactly the way `AddInformationModal`
and `CreateGroupModal` do — `ModalFocusScope` + `CanaryModal`, `size="large"` +
`!max-w-[800px]` + the family's header/footer hairline classes, copied
verbatim from `AddInformationModal.tsx`. The 18px title rides
`ModalFocusScope`'s own CSS hook, same as every sibling. Footer is Cancel
(outlined) + Submit (primary, disabled until the form validates) — the same
pair `AddInformationModal` and `CreateGroupModal` draw. Escape and focus
trapping come free from `ModalFocusScope`, which is the whole point of that
wrapper existing.

**Submit fires the same create logic the panel version fires** —
`createServiceTask(taskOwnerId, { title, status: 'open', room, quantity })` —
and then, unlike the panel drill-in (which fires no toast on create today),
closes the modal and shows **"Service task created"**, matching the register
of "Thread archived" / "Feedback submitted" (sentence case, past tense, no
trailing period).

### 2. One form, two shells

`components/products/messaging/panel/CreateServiceTaskForm.tsx` (new) ·
`components/products/messaging/panel/CreateServiceTaskPage.tsx`

The three fields (Room number, Issue type, Quantity), the prefill props, the
validation gate and the submit-building logic moved out of
`CreateServiceTaskPage` into a new shared `CreateServiceTaskForm`.
`CreateServiceTaskPage` is now a THIN panel-shell wrapper — `PanelHeader`,
the scrolling body's chrome, a sticky `PanelFooterAction` — around that shared
form; its panel behavior (back/close, the entry-page no-back-arrow rule from
Batch 10, post-submit `setTab('tasks'); pop()`) is unchanged.

Two shells now render the one form:

- **The panel drill-in** (`CreateServiceTaskPage`) — still reached by the
  Tasks tab's Create (`push`, keeps the back arrow) and the amber ticket
  band's Review (`panelIntent` direct entry, prefilled, no back arrow).
  Unchanged behavior, new internals.
- **The modal** (`CreateServiceTaskModal`, new) — reached only by the
  composer's cloche.

Because the two shells put the visible Submit button in different places (the
panel's is a fixed footer bar OUTSIDE the scrolling body; the modal's lives in
`CanaryModal`'s `footer` prop), the form can't own that button itself — it
exposes validity via an `onCanSubmitChange` callback and an imperative
`submit()` on a forwarded ref, and each shell's own button reads the one and
calls the other. Same fields, same three-fields-and-what-they-are-NOT
reasoning as before (room prefilled, issue free text, quantity optional) — see
the comment on `CreateServiceTaskForm` itself.

### 3. What's left of `panelIntent`

`lib/products/messaging/store.ts` · `components/products/messaging/ai/ThreadAiSlot.tsx`

Nothing to delete. `panelIntent` / `requestCreateTask` had exactly two callers
before this batch — the composer cloche and the amber recommended-ticket
band's Review (`ThreadAiSlot.tsx`, `onReview={() => requestCreateTask(ticket.room,
ticket.issueType)}`). The cloche is the one that moved; Review is untouched
and is now the mechanism's ONLY caller. The `isEntryPage` plumbing on
`PanelRoute` (Batch 10 §1) stays for the same reason — Review's direct entry
still `setStack`s a populated route with `isEntryPage: true`, so it still
renders no back arrow. Batch 10's own text ("servicing both the composer
cloche AND the amber band's Review") is superseded by this entry: read it as
"servicing the amber band's Review" going forward.

### 4. No Figma frame yet

The create-task MODAL (as opposed to the pre-existing panel drill-in, which
does have a drawn frame) has no drawn Figma frame — this batch built it
straight from the content-modal family's existing pattern
(`AddInformationModal` / `CreateGroupModal`), the same way Batch 8's filter
modal and others have before a frame existed. Goes on the Figma-pass list.

### Files touched (Batch 11)

`components/products/messaging/CreateServiceTaskModal.tsx` (new) ·
`components/products/messaging/panel/CreateServiceTaskForm.tsx` (new) ·
`components/products/messaging/panel/CreateServiceTaskPage.tsx` ·
`components/products/messaging/MessageComposer.tsx` ·
`components/products/messaging/ThreadView.tsx`

## Batch 12 — Mock data: 8 sparse threads enriched for SJ demo realism (2026-08-26)

Mock DATA only — zero component/logic changes. Miguel: some conversations read
as 3–4-message filler; enrich a handful into fuller, realistic exchanges
without needing to demo every feature.

**The rule used:** APPEND-HISTORY-ONLY. For each target thread, new
`guest`/`staff`/`ai` messages were inserted at the FRONT of that thread's
array — timestamped earlier (same day or an earlier day, always inside the
guest's own reservation window per `lib/core/data/reservations.ts`) — and
every pre-existing message in that thread (id, content, timestamp, sender,
status, steps) was left byte-for-byte untouched, in its original order. The
thread's existing FINAL message keeps its id and timestamp, so list-preview
text, `lastMessageAt`, sort order and unread state in `mockThreads` needed no
changes at all — confirmed by diff (zero deletions, only insertions; the
`mockThreads` array and the `mockThreads`-adjacent exemplar thread blocks
show no diff hunks).

**Exemplar threads — untouched, verified by diff:** thread `1` (Emily Smith,
full AI loop), `2` (Miguel Andre Briones Santana Rodriguez, fact queue), `4`
(Marco Bitanga-Sevilla, recommended-ticket band + Review), `14` (John
Smith/Sarah Smith/James Brady shared-phone + folio script), `16` (anonymous
`(212) 555-0000`), `20` (Lucia Rossi, escalation), `25` (Chloe Dubois, AI
draft card).

**Threads enriched (8), all guest ↔ staff unless noted, new messages in
`m3xx` id ranges to avoid any collision with the existing `m1`–`m105`/`m200`–
`m205` ids:**

| Thread | Guest | Before → After | New topic added (earlier) | Existing tail (untouched) |
|---|---|---|---|---|
| 3 | Brooklyn Simmons (Rm 130) | 3 → 6 | Wifi drop-out fix — **AI reply** with `aiSteps`/`sourceCount` | Check-out procedure |
| 6 | Liam Johnson (Rm 318) | 3 → 6 | Pre-arrival early check-in + extra pillows — staff | Parking options |
| 7 | Olivia Brown-Henderson (Rm 204) | 3 → 6 | Pool/spa hours on arrival — staff | Breakfast hours |
| 9 | Emma Wilson-Rodriguez (Rm 409) | 3 → 6 | Early-arrival luggage hold at bell desk — staff | Late check-out fee |
| 17 | Priya Sharma (Rm 419) | 1 → 6 | Business-center/printing, then itemized-invoice billing — staff ×2 | Airport taxi request (still unanswered, as before) |
| 18 | Yuki Tanaka (Rm 511) | 1 → 6 | Turndown-service hours — **AI reply** with `aiSteps`/`sourceCount`; then decaf coffee pods — staff | Japanese-restaurant ask (still unanswered, as before) |
| 21 | Hiroshi Nakamura (Rm 510) | 2 → 5 | Lost laptop charger, found at front desk — staff | Room-service-after-midnight (existing AI reply) |
| 24 | Rachel Cohen (Rm 416) | 3 → 6 | Anniversary dinner reservation booked — staff | Rooftop-bar hours (existing AI reply) |

Two AI replies total (Brooklyn's wifi fix, Yuki's turndown hours) — both carry
a full `aiSteps` trace in the same tool-name/note shape as the rest of the
file (reservation lookup → intent → KB search → compose), and a `sourceCount`
set directly on the message (no entry added to `ai-mock.ts`'s
`aiExplanations`, so these two have no "why" sidebar — acceptable, the sidebar
is optional per-message anatomy). Every other new reply is `sender: 'staff'`
per Miguel's steps-are-load-bearing preference. All new messages use
`channel: 'SMS'`, `status: 'delivered'` — the same values every other message
in the file uses; no new status values introduced.

Rooms, dates and (where mentioned) loyalty tiers in the new copy are pulled
from `lib/core/data/reservations.ts` / `guests.ts` for each guest — e.g. Emma
Wilson-Rodriguez's existing AI trace already establishes she has no loyalty
tier on file, so her new message doesn't invent one; Yuki Tanaka's Platinum
Elite tier (confirmed in `guests.ts`) backs the turndown-service AI step.
Two threads (17, 18) message the property the day before/day of arrival —
the same pre-arrival pattern the Emily Smith exemplar already uses.

Not touched: `broadcast-mock-data.ts`, `guest-journey-link.ts`,
`panel-mock.ts` (upsells/service-tasks/calls), `ai-mock.ts` (explanations/
drafts/facts/tickets/carrier errors), `store.ts`, any component.

`pnpm tsc --noEmit` clean.

### Files touched (Batch 12)

`lib/products/messaging/mock-data.ts`

## Batch 13 — Live "AI thinking" demo sequence (Maya) + Emily decline-context fix (2026-08-27)

Two changes this pass, both for the SJ demo: a scripted, live sequence in one
thread, and a surgical content fix in the exemplar thread.

### 1. Maya Patel's live "AI thinking" sequence

**Trigger.** The FIRST time Maya's thread (`'27'`) is selected in a session —
`useThreadDemoSequence(selectedThreadId)`, called from `messages/page.tsx`.
"In a session" is a new, deliberately NON-persisted store flag
(`demoSequencePlayed`); this store carries no persistence middleware, so a
page **reload replays the whole sequence** for rehearsal. Re-selecting her
thread again without reloading finds it already landed, same as any other
conversation.

**Script** (Claude desktop's crossfading status label is the reference —
Miguel):
1. **Typing (~2.5s)** — "Maya Patel is typing" above the composer, with a
   small staggered three-dot pulse (`.typing-dot` in `globals.css`).
2. **Guest message lands** — "Such a lovely stay so far! Is there any chance
   of a late checkout **this Thursday**? We'd love a slow morning." Thread
   preview/sort updates the normal way (`updateThreadLastMessage`).

   ⚠ **"Tomorrow" doesn't hold.** The mock world's "now" is Monday
   2026-03-16 (every thread's latest timestamp tops out there); Maya's stay
   (`res-maya-nov`) checks out **Thursday the 19th** — three days out, not
   one. Both her message and the AI's reply name the weekday instead of
   saying "tomorrow."
3. **Beat (~500ms), then the AI block appears THINKING** — `AiOrbTile` +
   "Canary," and in the slot "Completed N Steps" normally occupies, a status
   label crossfades (250ms fade / 1.4s hold, per label) through: *Reading the
   conversation… → Looking up Maya's reservation… → Checking the
   late-checkout policy… → Checking housekeeping's schedule… → Writing a
   reply…* — a quiet shimmer rides the same AI ramp tokens `.ai-gradient-text`
   uses (`.ai-thinking-label` + `.ai-gradient-quiet`, `app/globals.css`), at
   the same 40% "structural rail" strength the steps trace's own rail uses.
4. **Completion** — the label crossfades into the real "Completed 5 Steps ⌄"
   chip, the reply fades in (~250ms): "Of course, Maya — I've noted a 1:00 PM
   late checkout for Room 331 this Thursday, complimentary with your Club
   membership. Enjoy the slow morning!" — then the delivery caption walks the
   normal Sending → Sent → Delivered ladder (`walkDeliveryLadder`,
   `LADDER_SENT_MS` / `LADDER_DELIVERED_MS`, unchanged from any other live
   send).
5. From there it's a full first-class AI message: 5-step expandable record
   (`Review_conversation_history` / `Search_for_reservation_by_calling_phone_
   number` / `Search_knowledge_base` / `Check_room_status` / `Compose_reply`),
   `sourceCount: 2`, an `aiExplanations.m83` entry (`ai-mock.ts`), hover
   ⓘ/👍/👎 all live. Observability continues exactly as it does on every
   other AI message.

**The 1:00 PM hour**, cohered against the rest of the mock world rather than
invented in isolation: it sits under Diamond Elite's own proactive 2:00 PM
(Emily Smith, thread `1`, `m201`: "as a Diamond Elite member we've noted a
complimentary 2:00 PM late checkout") and clear of the fee-based $40/$50 lines
Elite tiers get waived at the desk (`m2`, `m23` in `ai-mock.ts`). Club Member
is a separate, lower loyalty tier from the Silver/Gold/Platinum/Diamond Elite
ladder, so a humbler complimentary hour for it — proactively noted, same as
Emily's — contradicts neither.

**Typing indicator — restyled, not duplicated.** `typingThreadId`
(`store.ts`) already flowed through `ThreadList` (row preview swaps to an
italic "{name} is typing…") and `ThreadView` (a static caption above the
composer, "Guest is typing" at `colorBlack4`). Reused as-is for the trigger
mechanism; only the above-composer caption's DRESS changed per this brief:
`colorBlack4` → `colorBlack3`, the generic "Guest" → the actual guest's name,
and a new `TypingEllipsis` (`ThreadView.tsx`) grows the staggered dot pulse
where the line used to just say "...". `ThreadList`'s own row-level indicator
is untouched — out of scope, and it already carries the guest's first name.

**Mechanics.** `lib/products/messaging/useThreadDemoSequence.ts` drives the
whole thing off `setTimeout`s (offsets: 0 / 2500 / 3000 / 4650 / 6300 / 7950 /
9600 / 11250ms), reading/writing the store imperatively
(`useMessagingStore.getState()` / `.setState()`) rather than through React
state, since a timer callback isn't a component. Two new pieces of store
state carry it: `demoThinkingMessageId` / `demoThinkingLabel` (which message
is "thinking" and what its header currently shows — read by `MessageFeed`,
handed to exactly one `MessageBubble` as its new `thinkingLabel` prop) and
`demoSequencePlayed` (session-scoped, per thread). `MessageBubble` renders the
crossfade as two permanently-mounted, opacity-toggled layers stacked in one
CSS grid cell — the label and the "Completed N Steps" chip — so the swap is
one continuous 250ms transition rather than a mount/unmount pop; the reply
body and the whole footer (delivery caption, sources, feedback) are withheld
entirely while `thinkingLabel` is set and fade in once it clears.

⚠ **Interruption.** Switching away from Maya's thread mid-sequence cancels
every pending timer and fast-forwards straight to the landed state (both
messages present, real content/steps/explanation, sequence marked played) —
never a stranded half-typed guest message or a half-thought AI block. The
cleanup distinguishes a REAL switch-away from React StrictMode's dev-only
mount→cleanup→mount (which Next's dev server runs, and which would otherwise
read as "the user already left" on every single selection) by checking
whether the STORE's `selectedThreadId` has actually changed by the time
cleanup runs — see the hook's own header comment for the full reasoning. Every
message-insertion point is additionally idempotent (checks the id isn't
already in the array first), so even the pathological case of a full page
unmount/remount without a reload can't duplicate a step.

**Content lives in `mock-data.ts`, not the hook.** `MAYA_DEMO_THREAD_ID`,
`mayaDemoGuestMessage`, `mayaDemoThinkingLabels`, `mayaDemoAiReply` (with its
`aiSteps`) sit beside her seeded thread — same place every other thread's
`aiSteps` live — deliberately NOT inside `rawMessages`, so they don't exist at
module load and a reload finds the thread back at one message.

### 2. Emily's decline-context fix (thread `1`, the exemplar)

Surgical, minimal diff. Her 6:30 PM guest message (`m3`, `aiDeclined`) used to
ask "Give me a list of nearby restaurants" — the SAME question `m4` answered
two minutes later, so the AI declined a question and then answered it in the
same thread. Now:

- **`m3`'s content** → "One more thing — can you split my bill across two
  cards when I check out? My company is covering the room." Billing/split-
  payment is a genuinely decline-worthy ask (needs a human) — unlike a
  restaurant list.
- **`m3`'s `aiExplanations` entry** (`ai-mock.ts`) → `understood` and
  `sources` rewritten to match (billing-policy-flavored: a signed-
  authorisation requirement, a front-desk note, and "the AI agent cannot
  authorise a split payment across cards" — mirroring `m103`'s existing
  folio-transfer decline almost exactly). `intro` and `actionTaken` are
  UNTOUCHED — still the frame's own verbatim wording.
- **New `m3b`** (6:31 PM, guest) → "Also — any good restaurant
  recommendations nearby?" — the question `m4` was always answering, now
  asked. `m4` itself, its steps, its DINING explanation, and everything after
  are byte-for-byte untouched; the thread's `lastMessage`/`lastMessageAt`
  (`mockThreads`) already read `m4`, so nothing there needed touching either.

The file header's own long-standing note — "Thread 1's two explanations (`m4`
success, `m3` non-response) are the FRAMES, verbatim... do not tidy them
here" — no longer holds for `m3`; it's been updated to say so, with the
reasoning, rather than left to contradict the entry beneath it.

### 3. No Figma frame yet

The THINKING state (the crossfading status label, in place of "Completed N
Steps") has no drawn Figma frame — built straight from the Claude-desktop
reference and the existing AI-message anatomy, the same way other undrawn
states in this file have been before a frame existed (see Batch 11 §4).
Flag for the Figma coverage pass as an enumerate item on **flow #9** (per the
external MASTER_COVERAGE tracker) alongside whatever else that flow is still
missing.

### Files touched (Batch 13)

`lib/products/messaging/mock-data.ts` · `lib/products/messaging/ai-mock.ts` ·
`lib/products/messaging/store.ts` ·
`lib/products/messaging/useThreadDemoSequence.ts` (new) ·
`components/products/messaging/MessageBubble.tsx` ·
`components/products/messaging/MessageFeed.tsx` ·
`components/products/messaging/ThreadView.tsx` ·
`app/(dashboard)/messages/page.tsx` · `app/globals.css`

`pnpm tsc --noEmit` clean.
