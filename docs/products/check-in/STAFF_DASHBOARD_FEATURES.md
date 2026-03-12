# Check-In Staff Dashboard — Feature Specification for Prototype

**Date:** 2026-03-04
**Source:** Production codebase deep-dive + Figma screenshots
**Purpose:** Definitive reference for building the check-in staff dashboard prototype

---

## Dashboard Layout

Two-pane layout inside `CanaryAppShell`:

```
┌─────────────────────────────────────────────────────────────────────┐
│ SubNav: [Search]                      [Insights] [Export] [+ New]  │
├──────────────────────┬──────────────────────────────────────────────┤
│  LEFT PANE (480px)   │            RIGHT PANE (flex-1)              │
│                      │                                              │
│  [< cal >] Today     │  Ready for check-In                        │
│                      │                                              │
│  Completed (3)       │  Expected today (8)                         │
│  ┌────────────────┐  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Guest  [Verify]│  │  │ Card │ │ Card │ │ Card │ │ Card │      │
│  │ Guest  [Verify]│  │  └──────┘ └──────┘ └──────┘ └──────┘      │
│  └────────────────┘  │                                              │
│                      │  Future (2)  [collapsed]                     │
│  Partial (2)         │                                              │
│  ┌────────────────┐  │  Checked-in today (3)                       │
│  │ Guest          │  │  ┌──────┐ ┌──────┐ ┌──────┐               │
│  └────────────────┘  │  │ Card │ │ Card │ │ Card │               │
│                      │  └──────┘ └──────┘ └──────┘               │
│  Pending (6)         │                                              │
│  ┌────────────────┐  │                                              │
│  │ Guest [Tablet] │  │                                              │
│  └────────────────┘  │                                              │
│                      │                                              │
│  Checked-in (2) [▸]  │                                              │
│  Other (2)      [▸]  │                                              │
└──────────────────────┴──────────────────────────────────────────────┘
```

---

## Left Pane — Submission Sections

### Section Order (top → bottom)

| # | Section | Visible When | Default State | CTA Button |
|---|---------|-------------|---------------|------------|
| 1 | Completed submissions | Has items | Expanded | **Verify** |
| 2 | Partial submissions | Has items | Expanded | (none) |
| 3 | Pending | Always | Expanded | **Send to Tablet** |
| 4 | Checked-in | Has items + NOT today | Collapsed | **Message** |
| 5 | Other (archived) | Has items | Collapsed | **Message** |

### Submission Statuses (production values)

```
PENDING              → "Pending" section
PARTIALLY_SUBMITTED  → "Partial submissions" section
SUBMITTED            → "Completed submissions" section
VERIFIED             → Moves to RIGHT pane (Expected/Future)
CHECKED_IN           → Left: "Checked-in" section, Right: "Checked-in today"
```

### Submission List Item Layout

```
┌──────────────────────────────────────────────────────────┐
│  [Avatar]  Guest Name  [DIAMOND]        [Verify]         │
│            2:30 PM  🛏 Room 153                           │
└──────────────────────────────────────────────────────────┘
```

**Data per item:**
- Guest avatar (or initials fallback)
- Guest name (truncated)
- Loyalty badge (if applicable): DIAMOND, GOLD, PLATINUM, etc.
- Arrival time (for Completed/Partial only)
- "Walk-in" tag (for onsite bookings, replaces arrival time)
- Room number with bed icon
- Verification flag icon (red, if checks flagged)
- CTA button (right-aligned, varies by section)

---

## Right Pane — Arrival Cards

### Section Order

| # | Section | Filter | Cards Show |
|---|---------|--------|-----------|
| 1 | Tablet Registration | VERIFIED + source=KIOSK | Only if items exist |
| 2 | Expected today | VERIFIED + today + not kiosk | Main section |
| 3 | Future | VERIFIED + tomorrow+ (up to 21 days) | Collapsible |
| 4 | Checked-in today | CHECKED_IN + today | Bottom section |

### Arrival Card Layout

```
┌──────────────────┐
│    [Avatar]       │
│   Guest Name      │
│  2:30 PM 🛏 153   │
│                   │
│  [🔑] [Checked in?]│
└──────────────────┘
```

**Card states by scenario:**

| State | Time Display | Action Buttons |
|-------|-------------|----------------|
| Expected today, room assigned | `2:30 PM` | Key icon + "Checked in?" |
| Expected today, no room | `2:30 PM` | "Room not assigned" text |
| Future, tomorrow | `Tomorrow` | (read-only) |
| Future, N days out | `In N days` | (read-only) |
| Checked-in | `In house` tag | Green check + "Checked In" |
| Tablet registration | (no time) | Key icon + "Checked in?" |

**Additional card badges:**
- "New Registration" tag (green) — for new reg cards
- "Signed" tag (gray) — for tablet submissions
- Loyalty dog-ear corner badge
- Verification flag icon (if flagged)

---

## Staff Actions

| Action | Trigger | Behavior |
|--------|---------|----------|
| **Verify** | Click "Verify" on completed submission | Opens detail panel (ID/payment verification) |
| **Send to Tablet** | Click "Send to Tablet" on pending | Sends check-in form to kiosk device |
| **Message** | Click "Message" on checked-in/other | Opens messaging thread with guest |
| **Checked in?** | Click on arrival card button | Marks guest as checked in |
| **Activate Mobile Key** | Click key icon on arrival card | Confirmation modal → activates key |
| **New check-in** | Top nav button | Creates new check-in flow |
| **Export** | Top nav button | Exports check-in data |
| **Insights** | Top nav button | Opens analytics view |
| **Search** | Top nav search bar | Filters left pane by name/phone |
| **Date navigation** | Date selector arrows/calendar | Filters all data by selected date |

---

## Detail Panel (Click into a Submission)

When a staff member clicks a submission row, a detail view opens:

### Sections:
1. **Header** — Guest name, photo, reservation info, close button
2. **Document Verification Card**
   - ID Verification: front/back photos, OCR checks, flag indicators
   - Payment Card: card details, verification checks
3. **Registration Card** — Status, print button, "Signed" badge
4. **Upsells/Add-ons** — Pending add-ons, approved revenue
5. **Footer** — Archive, download/export

> **Prototype scope:** For V1, clicking a submission opens a simplified detail panel. Full verification workflow is a later phase.

---

## Room Readiness

Production does NOT have a separate "room readiness" field. Instead:
- **Room assigned** = has room number → show room + action buttons
- **Room not assigned** = no room → show "Room not assigned" text
- **Mobile key ready** = key icon button visible → hotel supports mobile keys
- **Checked in** = green check badge

---

## Indicators & Badges

| Indicator | Where | Visual |
|-----------|-------|--------|
| Loyalty tier | List item + card | `CanaryTag` with tier-specific colors |
| Verification flag | List item + card | Red flag icon |
| Walk-in | List item | "WALK-IN" tag (replaces arrival time) |
| Mobile key | Arrival card | Key icon button |
| New Registration | Arrival card | Green tag |
| Signed (tablet) | Arrival card | Gray tag |
| In house | Checked-in card | Gray tag |
| Greener Stay | List item + card | Leaf icon |

---

## Data Requirements for Prototype

### Check-In Submission needs:
- `id`, `guestId`, `reservationId`
- `status`: pending | partially_submitted | submitted | verified | checked_in
- `arrivalTime`: string (e.g., "2:30 PM")
- `submittedAt`: Date
- `isWalkIn`: boolean
- `hasMobileKey`: boolean
- `isTabletRegistration`: boolean
- `isFlagged`: boolean (verification flag)
- `isNewRegistration`: boolean
- `isArchived`: boolean

### Arrival (right pane) is derived from:
- Submissions with status `verified` or `checked_in`
- Enriched with guest + reservation data
- No separate Arrival type needed — just filter submissions

### Guest needs (already in canonical data):
- name, initials, avatar, phone, email, statusTag (loyalty)

### Reservation needs (already in canonical data):
- room, roomType, checkInDate, checkOutDate, confirmationCode

---

## What's Already Built (Current State)

| Component | Status | Notes |
|-----------|--------|-------|
| `SubNav` | ✅ Built | Search + Insights/Export/New buttons |
| `DateSelector` | ✅ Built | Date navigation with arrows |
| `CheckInListItem` | ⚠️ Partial | Only handles pending/completed, needs more statuses |
| `ArrivalCard` | ⚠️ Partial | Basic layout, needs tablet/flag badges |
| `page.tsx` | ⚠️ Partial | Two-pane layout works, missing sections |
| Types | ⚠️ Partial | Only 2 statuses, needs 5 |
| Mock data | ⚠️ Partial | 8 submissions, needs more variety + new fields |
| Detail panel | ❌ Not built | Entire feature missing |
| Collapsible sections | ❌ Not built | Checked-in and Other sections |
