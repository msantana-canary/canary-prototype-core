# Email Channel — Build Spec (demo/email-channel)

> Source of truth: Figma "Email Channel" node 12:412 (file tdhETyoiw4FLlMBzpQn9TD), extracted 2026-07-16.
> Context: email is its own channel — its own sidebar nav item — inside the design team's NEW app shell paradigm
> (Wenjun's nav/header redesign, SJ-approved 2026-07-13). This prototype is the demo vehicle for a customer Loom.
> Phase 1 = UI first, matching Figma exactly. Phase 2 (later) = AI draft-reply + reservation info affordance.

## Architecture decisions

- **Reuse-first (Miguel's directive, 2026-07-16):** the AppShell is genuinely NEW (top bar + sidebar massively adjusted — build custom).
  The email surface KINDA uses existing components with slight adjustments:
  - **Composer: adapt `components/products/messaging/MessageComposer.tsx`** — read it first, reuse its structure/props,
    strip to the email variant (attachment + Send only; no AI toggle/translate/templates), apply new 6px-radius style.
  - **Avatar: reuse `components/products/messaging/Avatar.tsx`** if its API fits (square rounded-8 initials).
  - **Thread list: heavily revised** — new component, but read `ThreadListItem.tsx` first and keep its prop/data idioms
    (guest?, reservation?, isSelected, onClick) so the vocabulary stays consistent.
  - **New dashboard style cascades:** 6px border radius on buttons and inputs (the new `unit-6` convention) — where a
    `CanaryButton`/`CanaryInput` renders the old radius, override via className rather than forking the component.
  - Inbox/Archived: check `CanarySegmentedControl` first; if its rendering can't match the Figma (p-4 container, filled
    blue active tab, 6px radii), build a small local segmented control instead.
- **Standalone route group:** `app/email/` with its OWN `layout.tsx` using the new custom shell.
  Do NOT touch `app/(dashboard)/` — that's the legacy `CanaryAppShell` paradigm and other routes stay on it.
- **New shell is custom-built** in `components/products/email/shell/` — the library's `CanaryAppShell`/`CanarySidebar`
  render the OLD design. Do not use them here. Do use library enums/tokens/`CanaryTag` etc. where they fit.
- **Data model encodes sender ≠ linked guest** (matches Rachel's prototype + the Figma):
  the email's From identity (`senderName`/`senderEmail`) is distinct from the auto-linked canonical guest profile.
  Thread list + thread header show the SENDER name; the message block inside the read pane shows the LINKED GUEST
  name + loyalty tag. This is deliberate (auto-link by sender address); it is NOT a mock-data bug.
- **Colors:** import `colors` from `@canary-ui/components` for every hex that maps to a token.
  Raw values with no token (`#375492` sidebar bg, `#022440` team-chat pill, `#465FF5` + gradient stops for Copilot,
  `rgba(0,0,0,0.16)` user row, `rgba(40,88,196,0.1)` archive btn) live as named constants in
  `components/products/email/shell/shell-tokens.ts` with a comment noting they're new-paradigm colors not yet in the library.
- **Icons:** `@mdi/js` outline variants. The Figma reuses a placeholder Messages icon on several items — substitute
  the real vocabulary (matches `sidebarTabs`): Messages `mdiMessageOutline`, Email `mdiEmailOutline`, Calls `mdiPhoneOutline`,
  Upsells `mdiTagOutline`, F&B `mdiSilverwareForkKnife`, Check-in `mdiLoginVariant`, Checkout `mdiLogoutVariant`,
  Digital Tips `mdiCashMultiple`, Authorizations `mdiCreditCardOutline`, Contracts `mdiFileDocumentOutline`,
  Clients on File `mdiAccountGroupOutline`, Team Chat `mdiAccountMultipleOutline`, Settings `mdiCogOutline`,
  Support `mdiHelpCircleOutline`, hotel selector `mdiUnfoldMoreHorizontal`, search `mdiMagnify`,
  attach `mdiPaperclip`, info `mdiInformationOutline`, more `mdiDotsHorizontal`, insights `mdiChartBoxOutline`,
  copilot `mdiWaveform` (graphic_eq equivalent).
- Replace the Figma's literal-space hacks (hotel selector leading spaces, "     TODAY") with real padding/margins.
- Dev server: `PORT=3007 pnpm dev` (3005/3006/3010 belong to other worktrees).

## Canvas

Root: flex row, full viewport, bg `#FAFAFA` (colorBlack8). Sidebar fixed 240px + content column flex-1.
Font Roboto throughout (already loaded via next/font in root layout).

## 1. Sidebar (`NewSidebar`) — w-240, bg #375492, full height, flex-col

- **Hotel selector** (px-12 py-16, gap-8): text one line, ellipsis — `38653` (Bold 12/18, ls 0.24px, white) then
  `Days Inn & Suites by Wyndham Wausau` (Regular 12/18, white). Right: unfold-more icon 20×20 white. Divider below (1px, white ~20% opacity).
- **Nav groups** (pt-12, gap-8 between groups; each group flex-col gap-4 px-12; 1px divider between groups):
  1. Communications: Messages · **Email (ACTIVE)** · Calls
  2. Guest Management: Upsells · F&B · Check-in · Checkout · Digital Tips
  3. Records: Authorizations · Contracts · Clients on File
- **Nav item anatomy:** w-216 px-12 py-8, flex gap-8 items-center, rounded-6.
  Inactive: transparent bg, white icon+label (Regular 14/22).
  **Active: solid white pill (rounded-6), BLACK label, icon dark.** Hover (inactive): white at ~8% opacity.
  Optional badge right: 16×16 circle `#F16682` (colorPink1), Bold 12 white number. Email carries badge `4`.
- **Bottom sticky** (flex-1 justify-end, pb-12 px-12, gap-8, centered):
  - Canary logo, ~135×34, **20% opacity** (use `/public` logo asset if present, else text-mark placeholder).
  - **Team Chat** nav item: pill bg `#022440` full opacity, white label, badge `4` (#F16682).
  - **User row**: full-width, bg `rgba(0,0,0,0.16)`, rounded-6, three cells:
    1. User (flex-1, py-12, stacked): avatar 20×20 rounded-4 bg colorBlueDark4 (#C9D5F0), initials `TS` Bold 10 uppercase colorBlueDark1 (#2858C4); below `Theresa` Regular 12 white 50% opacity.
    2. Settings (w-72, stacked py-12): cog 20×20 white; `Settings` Regular 12 white 50%.
    3. Support (w-72, stacked): help 20×20 white; `Support` Regular 12 white 50%.
- Nav behavior: Email = active/no-op. Messages routes to `/messages` (legacy shell — acceptable jump). Everything else inert (no cursor-pointer).

## 2. Top bar (`NewTopBar`) — h-52, bg white, border-b 1px colorBlack6 (#E5E5E5), px-24, flex justify-between items-center

- Left: page title `Email` — Medium 14/22 black.
- **Copilot pill** — centered over the CONTENT COLUMN (center it inside the top bar itself since the bar already sits right of the sidebar; do NOT viewport-center): h-28, rounded-full, border 1px `#465FF5`, px-12, flex gap-8 items-center.
  Bg: white with faint AI tint overlay `linear-gradient(6.19deg, rgba(25,55,237,0.03) 23.5%, rgba(140,40,255,0.03) 41.4%, rgba(196,54,244,0.03) 56.2%, rgba(221,49,49,0.03) 73.8%)`.
  Contents: waveform icon 16×16 (gradient-ish blue ok) · `Copilot` Medium 14 · thin vertical divider 10px · `2 items need attention` Medium 14.
  Both text runs use gradient text: `bg-gradient-to-r from-[#465FF5] via-[#8E4FD6] to-[#DB3535] bg-clip-text text-transparent`.
- Right (gap-12, items-center): bar-chart icon 12×12 `#666` · `Insights` Regular 14 colorBlack3 · 12px vertical divider · `106` Bold 14 black + `guest messages today` Regular 14 black · chevron-right 16×16.

## 3. Email page content

### Search + CTA row (px-24 py-16, gap-12)
- Search field flex-1: bg white, border 1px colorBlack5 (#CCC), rounded-6, pl-8 pr-16 py-8; magnify 20×20 + placeholder `Search` Regular 14 colorBlack3. **Functional**: filters thread list by sender name, guest name, subject, body.
- `New message` button: bg colorBlueDark1, h-40, rounded-6, px-16, label Medium 14 white. Click = no-op for now (toast/console fine).

### Body (px-24 pb-24, gap-16, flex, flex-1, min-h-0)

**Left column w-434, flex-col gap-16:**
- **Inbox/Archived segmented control**: container bg white, border 1px colorBlack6, rounded-6, p-4, flex gap-4; each tab flex-1 px-24 py-8 rounded-6 centered Medium 14/22. Active: bg colorBlueDark1, white. Inactive: transparent, colorBlack3. Functional toggle.
- **Thread list card**: bg white, border 1px colorBlack6, rounded-12, px-8 py-16, gap-8, flex-1, overflow-y-auto.
  - **Row** (px-12 py-8, gap-12, flex items-start, rounded-6, cursor-pointer):
    - Selected: bg colorBlueDark5 (#EAEEF9), border 1px colorBlueDark3 (#93ABE1). Unselected: transparent (hover bg colorBlack8).
    - Avatar 32×32 rounded-8 bg colorBlack6, initials Bold 12 colorBlack3.
    - Content: name row = sender name Medium 14/22 black + date Regular 10/16 colorBlack3 UPPERCASE right;
      then subject Regular 14/22 black ellipsis-1-line; preview Regular 14/22 colorBlack3 ellipsis-1-line.
    - Unread: subject/name at Medium weight + small dot optional — Figma doesn't show an unread row state; keep a `isUnread` field in data, minimal styling (bold name), fine to iterate.

**Right column flex-1 — Thread view card**: bg white, border 1px colorBlack6, rounded-12, flex-col, h-full, overflow-clip.
- **Thread header**: h-70, border-b 1px colorBlack6, px-16 py-8, flex justify-between items-center.
  - Left: avatar 40×40 rounded-8 bg colorBlack6 initials Medium 14 colorBlack3; then (px-8) line 1 `SenderName - sender@email.com` Medium 16/24 black; line 2 subject Regular 16/24 black.
  - Right **action group — hidden by default, revealed on thread-view hover** (Figma has it at opacity-0):
    `Archive` button bg `rgba(40,88,196,0.1)` h-40 rounded-6 px-16 label Medium 14 colorBlueDark1 · info icon-btn 20×20 p-10 rounded-4 · more-horiz icon-btn. Archive is functional (moves thread to Archived).
- **Message feed** (flex-1, overflow-y-auto, pt-16, justify-end content bottom-anchored):
  - Date divider: `TODAY` Medium 10/16 black uppercase, centered via padding (no literal spaces), h-30.
  - **Flat message block** (Gmail register, NOT bubbles): px-16 py-8, gap-12, flex items-start.
    Avatar 32×32 rounded-8 (guest: colorBlack6 bg / initials colorBlack3).
    Content: title row = **linked guest name** Medium 14/22 black + loyalty CanaryTag (e.g. `GOLD ELITE`: bg colorBlack6, border colorBlack5, rounded-4, Medium 10 uppercase) + timestamp `Jun 12, 9:20 AM` Regular 10/16 colorBlack3 uppercase right.
    Body Regular 14/22 black, whitespace-pre-wrap, multi-paragraph.
    Staff replies: same anatomy, staff name `Theresa Webb`, no loyalty tag.
- **Composer** (p-16): box bg white border 1px colorBlack6 rounded-12:
  - textarea row px-8 py-12, placeholder `Reply to this email...` Regular 14 colorBlack3, auto-grow.
  - divider 1px colorBlack6.
  - toolbar p-8 justify-between: paperclip icon-btn (p-6 rounded-4) left; **Send** right: bg colorBlueDark1 h-32 rounded-6 px-16 label Medium 12 white, **disabled until text entered** (disabled = colorBlack5 bg). Send appends a staff message block to the thread (optimistic, in-store).

## 4. Data layer (`lib/products/email/`)

```ts
// types.ts
export interface EmailMessage {
  id: string;
  threadId: string;
  direction: 'inbound' | 'outbound';
  body: string;            // plain text, \n\n paragraphs
  sentAt: Date;
  staffName?: string;      // outbound only
}
export interface EmailThread {
  id: string;
  senderName: string;      // From display name — what list + header show
  senderEmail: string;
  subject: string;         // "Re: ..." inherited
  linkedGuestId?: string;  // canonical guest auto-linked BY SENDER ADDRESS — may be undefined
  status: 'inbox' | 'archived';
  isUnread: boolean;
  lastActivityAt: Date;
}
```
- `store.ts` (Zustand): threads, messages, selectedThreadId, view ('inbox'|'archived'), searchQuery, composer draft;
  actions: selectThread, setView, setSearch, archiveThread, sendReply.
- `mock-data.ts` — the six Figma threads VERBATIM (subjects/previews/dates below), each linked to a canonical guest
  from `lib/core/data` (import `getGuest` / search `guests.ts` for exact ids — do NOT invent guests):
  | Sender (From) | Email | Linked canonical guest |
  |---|---|---|
  | Emily Johnson | emily.johnson@gmail.com | Emily Smith (GOLD ELITE — verify tier in guests.ts, use whatever it actually is) |
  | Noah Williams | noah.w@outlook.com | Noah Davis |
  | Brooklyn Carter | (invent plausible) | Brooklyn Simmons |
  | Marco Rossi | (invent plausible) | Marco Bitanga-Sevilla |
  | Kristin Lee | (invent plausible) | Kristin Watson |
  | Olivia Chen | (invent plausible) | pick a plausible canonical guest (e.g. Olivia …) or leave UNLINKED to plant the unlinked story |
  Check each guest's actual loyalty tier in canonical data and display that tier tag; if none, omit the tag.

### Figma mock threads (verbatim)
1. EJ · Emily Johnson · JUN 12 · `Re: Your upcoming stay at The Statler — Nov 18` · preview: `Hi, I received your pre-arrival email and had a quick question — is there a fee for early check-in? We're arriving around noon on the 18th and would love to get into the room if it's ready.`
2. NW · Noah Williams · JUN 12 · `Re: Pre-Arrival Information — Welcome to The Statler` · `We'll be arriving late, around 11pm. Will the front desk still be open?`
3. BC · Brooklyn Carter · JUN 11 · `Re: Your Checkout Summary — Thank You for Staying` · `Hi, I just received my checkout summary and there's a charge for $45 on November 21st that I don't recognize. It's listed under "miscellaneous." Could you look into that for me?`
4. MR · Marco Rossi · JUN 11 · `Re: Welcome! Your Check-In is Tomorrow` · `Thanks, all set! Looking forward to it.`
5. KL · Kristin Lee · JUN 11 · `Re: Your upcoming stay at The Statler — Nov 20` · `Hello, Thanks for the heads up about our upcoming stay. I had a small request — if possible, could we be placed on a high floor with a city view? We're celebrating my husband's birthday and it would mean a lot.`
6. OC · Olivia Chen · JUN 11 · `Re: Pre-Arrival Information — Welcome to The Statler` · `Hi there, We're arriving this Friday for our anniversary. Quick question — is the rooftop bar open on weeknights? We'd love to have a drink up there if possible.`

Emily's full open-thread message body (inbound, Jun 12, 9:20 AM):
```
Hi,

I received your pre-arrival email and had a quick question — is there a fee for early check-in? We're arriving around noon on the 18th and would love to get into the room if it's ready.

Also, do you have valet parking or is there a self-park option nearby?

Thanks,
Emily
```
Give 2–3 of the other threads a short multi-message history (inbound + a staff reply) so clicking around feels alive; keep bodies consistent with their previews. Seed one archived thread so the Archived tab isn't empty.

## Phase 2 (do NOT build yet — logged for scope)
- AI draft-reply moment (Copilot pill → draft appears in composer) — Rachel's future-sell ask.
- Reservation info affordance (info icon → sidebar panel, NOT popup — SJ/Wenjun steer). Sidebar contents TBD w/ Rachel.
- CC display, unlinked-sender states, New message compose flow.
