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
7d. **Overflow (kebab) menu** — hand-rolled in `BroadcastScheduledPanel` and `BroadcastGroupList`. Production has `CanaryOverflowMenu` (with an `OverflowMenuItemColor.DANGER` item variant); `@canary-ui` exports no equivalent, so every kebab in this branch is bespoke. Best single candidate for promotion.
7e. **Scheduled pill** — the composer's rounded-24 "Scheduled for …" chip with a clear affordance. No library chip carries icon + label + dismiss.
7g. **Ledger tokens / roster reason-groups** — variant C's 24px funnel chips and the lock-glyph row treatment. No library chip or list-group covers them.
7f. **Filter chips** — the loyalty quick-select chips and the dismissible value chips (Rate Code / Group Code / Room Number). Hand-rolled in BOTH filter-modal variants; the library has no selectable-chip or removable-chip component.
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
