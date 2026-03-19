# Checkout Product Inventory

> Complete reference for the Checkout prototype. Covers every built feature, the data model, production gaps, and how to extend it.
>
> Last updated: 2026-03-18

---

## 1. Product Overview

The **Checkout Dashboard** is a hotel staff tool for managing guest departures. Staff use it to:

- Track guests approaching checkout across folders (submitted, pending, processed)
- Approve or deny late checkout requests
- Review and manage electronic folios (eFolios) with itemized charges
- Approve or deny upsell add-ons attached to checkout
- Read guest reviews and see external review indicators (TripAdvisor, Google)
- Process completed checkouts and manage activity logs
- Create new checkout entries manually

The dashboard has a **single-pane scrollable layout** with collapsible sections for each folder, plus a special section for pending late checkout requests. Clicking any row opens a full-page **detail panel overlay** with folio, upsells, guest review, notes, and contact info.

---

## 2. What's Built in the Prototype

### 2.1 Page Layout

**File:** `app/(dashboard)/checkout/page.tsx`

- Single scrollable list (no two-pane split like check-in)
- `sidebar-nav-reset` event listener closes the detail panel when sidebar is clicked
- Sections: Late checkout requests -> Submitted -> Pending -> Processed
- Search filtering by guest name, phone, or email
- Late checkout approve/deny handlers with state updates
- "Mark as processed" handler that moves a submission to the processed folder

### 2.2 SubNav (Top Bar)

**File:** `components/products/checkout/SubNav.tsx`

- `CanaryInputSearch` for filtering guests
- "Insights" button (stub handler)
- "Export" button (stub handler)
- "New checkout" primary button (opens modal)
- Same layout pattern as check-in SubNav

### 2.3 DateSelector

Imported from `components/products/check-in/DateSelector.tsx` (shared component).

### 2.4 Late Checkout Requests Section

Rendered at the top of the list in `page.tsx` when pending requests exist.

- Filters: `lateCheckoutRequested === true && lateCheckoutApproved === null`
- Uses `CollapsibleSection` (imported from check-in, shared)
- Each request rendered with `LateCheckoutRequestItem`

#### LateCheckoutRequestItem

**File:** `components/products/checkout/LateCheckoutRequestItem.tsx`

- Layout: Avatar | Name + Room | Late checkout info + Deny + Approve
- Shows: guest avatar, name, bed icon + room number
- Right side: "Late Check Out (2 PM) * $50" text + Deny (danger shaded) + Approve (primary) buttons
- Price only shown when `lateCheckoutPrice > 0`
- Approve/Deny handlers update `lateCheckoutApproved` on the submission

### 2.5 Submission List Sections

Three `CollapsibleSection` groups in `page.tsx`:

| Section | Folder Filter | Default Count | Default State |
|---------|--------------|---------------|---------------|
| **Submitted** | `folder === 'submitted'` | 0 | Collapsed when empty |
| **Pending** | `folder === 'pending'` | 9 | Open |
| **Processed** | `folder === 'processed'` | 5 | Open |

Note: `archived` submissions are not shown in the list (filtered out implicitly by folder).

Each section uses `CheckOutListItem` components.

#### CheckOutListItem

**File:** `components/products/checkout/CheckOutListItem.tsx`

- 3-column layout: Avatar | Name+Tags+Room+Indicators | Action/Rating
- Shows guest name, loyalty badge (custom tag styling), departure time tag, room with bed icon
- **Pending/submitted items:** "Message" button (only when guest has phone)
- **Processed items (right side):**
  - Review indicators: internal review icon, TripAdvisor circle, Google Reviews icon
  - Star rating (1-5 filled/empty stars in gold)
  - eFolio signed indicator (pen icon + "eFolio signed" text)
  - Auto-checkout status tag (`Auto-checkout` green, `Auto-checkout failed` red, `Auto-checkout scheduled` yellow)

### 2.6 Detail Panel

**File:** `components/products/checkout/CheckOutDetailPanel.tsx` (~900 lines)

Full-page slide-in overlay. Same animation pattern as check-in (`shouldRender` + `animateIn`, 500ms transition).

#### Header

- Avatar, guest name, loyalty badge
- Info strip: departure time, room + room type code, date range, confirmation code, rate code
- Action buttons: Activity log (history icon), ActionMenu (dots), Close (X)
- **ActionMenu items:** "View Check-in" (navigates to `/check-in?guest=...`), "Stop automated messages" (stub), "Delete reservation" (danger, stub)

#### Main Content (Left Column, flex: 2)

**Section 1: Departure Time**
- `CanaryCard` with border
- Simple text: "Standard checkout time **10:00 AM**" (pending) or "Expected to depart at **10:00 AM**" (processed)

**Section 2: Folio**
- `CanaryCard` with border
- Header: "Folio" + status tag (PENDING / SIGNED ON TABLET / EMAILED) + "Email Summary of Charges" button + "Send to Tablet" button (pending only) + expand/collapse chevron
- **Collapsed by default.** Expandable folio content:
  - Line items table: Date | Description | Amount (negative amounts shown in parentheses)
  - Black divider above "Balance due" total
  - "Updated as of [date] at 3:53 PM EDT" timestamp
  - Grey divider
  - Signed confirmation: green check + "[Guest] signed the folio on [date] at [time] EDT" + "View signed folio" button (processed)
  - Unsigned state: "[Guest] has not confirmed the folio yet"

**Section 3: Manage Upsells**
- `CanaryCard` with border
- Uses `UpsellsSection` component imported from `components/products/check-in/UpsellsSection.tsx` (shared)
- Same approve/deny/reviewed flow as check-in
- Read-only when processed/archived

**Section 4: Guest Review**
- `CanaryCard` with border
- Header: "Guest review"
- **When review exists:**
  - Star rating (1-5 filled/empty stars, gold color `#FAB541`)
  - Rating text: "4 / 5"
  - Quoted review text
  - External review indicators (below a grey divider):
    - TripAdvisor: green circle icon + "[Guest] visited the Tripadvisor review website from Canary checkout."
    - Google Reviews: Google icon + "[Guest] visited the Google review website from Canary checkout."
- **No review:** "No guest review." centered text

**Footer:** "Created by Canary * [confirmation code]"

#### Sidebar (Right Column, flex: 1)

- **Mark as processed / Processed banner:**
  - Pending/submitted: Full-width "Mark as processed" primary button
  - Processed/archived: Green banner with check icon: "This checkout has been processed"

- **Contact info:** Same layout as check-in
  - Phone (with Message icon linking to messaging, and dots menu)
  - Email (with dots menu)
  - Language
  - "Assign Staff or Department" link

- **Notes section:**
  - Same implementation pattern as check-in detail panel
  - Add note with `CanaryTextArea`, Cancel/Save
  - Note display with author, relative time, hover highlight
  - Dots menu: Copy (with inline toast), Edit (inline), Delete

- **Copy toast:** Fixed bottom-center toast "Copied to clipboard" with 3s auto-dismiss

### 2.7 Activity Log Modal

**File:** `components/products/checkout/ActivityLogModal.tsx`

- `CanaryModal` with title "Activity Log", medium size, close on overlay click
- Reverse-chronological list of events
- Each entry: gray circle avatar (person icon) + description text + formatted timestamp
- Empty state: "No activity recorded."
- Opened via the history button in the detail panel header

### 2.8 New Checkout Modal

**File:** `components/products/checkout/NewCheckoutModal.tsx`

- `CanaryModal` with title "Create new checkout", medium size
- Fields: Confirmation Number, First/Last name, Date range (arrival/departure), Email (optional), Phone (optional)
- Footer: Cancel (text button) + Create (primary button)
- Form resets on close
- **Note:** Unlike check-in's "New check-in" modal, this does NOT yet create runtime data -- it just closes the modal

---

## 3. Data Model

### 3.1 Types

**File:** `lib/products/checkout/types.ts`

```typescript
type CheckOutFolder = 'pending' | 'submitted' | 'processed' | 'archived';
type FolioStatus = 'pending' | 'signed_on_tablet' | 'emailed';
type AutoCheckoutStatus = 'completed' | 'scheduled' | 'failed';

interface CheckOutSubmission {
  id: string;
  reservationId: string;           // Links to canonical reservation
  guestId: string;                 // Links to canonical guest
  folder: CheckOutFolder;
  departureTime?: string;          // "10:00 AM"
  departureDate: string;           // ISO date or DEMO_TODAY
  folioStatus?: FolioStatus;
  folioSignedAt?: Date;
  guestRating?: number;            // 1-5
  guestReview?: string;
  efolioAccepted?: boolean;
  autoCheckoutStatus?: AutoCheckoutStatus;
  submittedAt?: Date;
  processedAt?: Date;
  // Review indicator flags
  tripadvisorClicked?: boolean;
  googleReviewClicked?: boolean;
  hasInternalReview?: boolean;
  // Late checkout request
  lateCheckoutRequested?: boolean;
  lateCheckoutTime?: string;       // "2 PM"
  lateCheckoutPrice?: number;      // e.g., 50
  lateCheckoutApproved?: boolean | null;  // null = pending
}

interface FolioLineItem {
  id: string;
  date: string;                    // "Mar 16, 2026"
  description: string;
  amount: number;                  // Negative for credits/payments
}

interface ActivityLogEntry {
  id: string;
  description: string;
  timestamp: Date;
}

const DEMO_TODAY = '2026-03-16';
const CHECKOUT_TIME = '10:00 AM';

// Re-exports GuestNote from check-in types
// Duplicates loyaltyColors from check-in types
```

### 3.2 Mock Data

**File:** `lib/products/checkout/mock-data.ts`

| Export | Type | Count | Description |
|--------|------|-------|-------------|
| `checkOutSubmissions` | `CheckOutSubmission[]` | 16 | All checkout submissions across 4 folders |
| `checkoutFolioItems` | `Record<string, FolioLineItem[]>` | 5 guests | Itemized folio charges (room, tax, dining, spa, deposits, payments) |
| `checkoutNotes` | `Record<string, GuestNote[]>` | 4 guests | Staff notes keyed by checkout submission ID |
| `checkoutActivityLogs` | `Record<string, ActivityLogEntry[]>` | 5 guests | Reverse-chronological event logs |
| `checkoutUpsells` | `Record<string, UpsellItem[]>` | 5 guests | Upsell items (imports `UpsellItem` from check-in types) |

**Folder distribution:**

| Folder | Count | Notes |
|--------|-------|-------|
| `pending` | 9 | Today's departures, main working list |
| `submitted` | 0 | Empty (matches production screenshot) |
| `processed` | 5 | Completed checkouts with ratings/signed folios |
| `archived` | 2 | Old checkouts, not displayed in list |

**Late checkout requests:** 2 submissions have `lateCheckoutRequested: true` and `lateCheckoutApproved: null` (co-raj and co-leila).

**Folio data is realistic:** Room charges per night, sales tax at 14.5%, incidental charges (dining, spa, minibar, parking), advance deposits, and card payments. Balances are mathematically correct.

### 3.3 Canonical Data Dependencies

Checkout submissions reference IDs from:

- **`lib/core/data/guests.ts`** -- Guest name, avatar, initials, phone, email, language, loyalty status
- **`lib/core/data/reservations.ts`** -- Room number, room type code, confirmation code, check-in/out dates, rate code
- **`lib/products/check-in/mock-data.ts`** -- Every checkout guest has a corresponding `checked_in` entry in the check-in submissions array (guests must check in before they can check out)

---

## 4. What Exists in Production But NOT in Prototype

Based on analysis of `/Users/miguelsantana/Documents/Canary/canary/frontend/hotels/src/checkOuts/`:

### Dashboard Gaps

| Feature | Production Files | Notes |
|---------|-----------------|-------|
| **Folder Filter Dropdown** | `CheckOutSearch.vue`, `constants.ts` | Production has a folder selector dropdown (All / Pending / Submitted / Departed) to filter the list. Prototype shows all folders as separate sections. |
| **Auto-Checkout Status Component** | `AutoCheckoutStatus.vue` | Dedicated component for auto-checkout status display. Prototype has inline tag rendering in `CheckOutListItem`. |
| **Dashboard Store** | `store/store.ts` | Centralized Pinia store for checkout state management, API calls, and pagination. Prototype uses React `useState` inline. |
| **"Silenced" / "Other" Folder** | `constants.ts` | Production has a fourth visible folder labeled "Silenced" (maps to `OTHER`). Prototype has `archived` but doesn't display it. |

### Detail View Gaps

| Feature | Production Files | Notes |
|---------|-----------------|-------|
| **CheckOut Modal (Legacy)** | `CheckOutModal/CheckOutModal.vue`, `CheckOutModalHeader.vue`, `CheckOutInfo.vue`, `CheckOutModalLogs.vue` | Production has both a modal view AND a detail page view. Prototype only has the detail panel overlay. |
| **EFolio Card** | `EFolioCard.vue`, `CheckOutEFolio.vue` (x2, in Details + Modal) | Production has a dedicated eFolio card component separate from the main folio. Prototype renders folio inline. |
| **Departure Time Card** | `DepartureTimeCard.vue` | Production has a standalone card component. Prototype renders departure time inline in a `CanaryCard`. |
| **Guest Review Card** | `GuestReviewCard.vue` | Production has a standalone component. Prototype renders guest review inline in a `CanaryCard`. |
| **Detail Sidebar** | `CheckOutDetailsSidebar.vue` | Production has a separate sidebar component. Prototype renders sidebar content inline. |
| **Detail Body** | `CheckOutDetailsBody.vue` | Production has a separate body component. Prototype renders body content inline. |

### Functional Gaps

| Feature | Notes |
|---------|-------|
| **eFolio PDF Generation** | Production generates downloadable/printable eFolio PDFs. Prototype shows "Email Summary of Charges" and "View signed folio" as stub buttons. |
| **Automated Checkout Scheduling** | Production can schedule auto-checkouts. Prototype only displays the status tag. |
| **Send Checkout Link** | Production has email/SMS link sending for guest self-checkout. Prototype has the "New checkout" modal but doesn't create data or send links. |
| **Real-Time WebSocket Updates** | Production uses WebSocket for live status changes. Prototype is static mock data. |
| **Folder Drag & Drop** | Production may support moving submissions between folders via UI. Prototype only has "Mark as processed" button. |
| **Batch Operations** | Production may support bulk processing of checkouts. Prototype is one-at-a-time. |
| **NewCheckoutModal Data Creation** | The "New checkout" modal closes without creating runtime data, unlike check-in's equivalent which creates guests/reservations/submissions in memory. |

---

## 5. How to Add a Feature

### Step 1: Identify Where It Goes

| What you're building | Where |
|---------------------|-------|
| New data fields | `lib/products/checkout/types.ts` (types) + `lib/products/checkout/mock-data.ts` (data) |
| New detail panel section | `components/products/checkout/` (new component) + import in `CheckOutDetailPanel.tsx` |
| New list-level feature | `app/(dashboard)/checkout/page.tsx` |
| New modal | `components/products/checkout/` (new component) + trigger from page or detail panel |
| Shared component (used by check-in too) | `components/core/` or existing shared locations |

### Step 2: Add the Type

```typescript
// lib/products/checkout/types.ts
export interface CheckOutSubmission {
  // ... existing fields ...
  myNewField?: string;
}
```

### Step 3: Add Mock Data

```typescript
// lib/products/checkout/mock-data.ts
// Add data for existing or new submissions
// Remember to also add a checked_in entry in check-in mock-data if adding a new guest
```

### Step 4: Build the Component

Create a new file in `components/products/checkout/`. Follow existing patterns:

- `'use client'` directive
- Import from `@canary-ui/components` with proper enums
- Import types from `@/lib/products/checkout/types`
- Import canonical data types from `@/lib/core/types/`

### Step 5: Wire It Up

- **Detail panel section:** Import in `CheckOutDetailPanel.tsx`, render inside a `<CanaryCard hasBorder>` in the main content column
- **List feature:** Add to `page.tsx`
- **Modal:** Add state + trigger in the parent component

### Important: Adding a New Checkout Guest

If you add a new guest to the checkout mock data, you MUST also:

1. Add the guest to `lib/core/data/guests.ts`
2. Add the reservation to `lib/core/data/reservations.ts`
3. Add a `checked_in` entry in `lib/products/check-in/mock-data.ts` (at the bottom, in the checkout guests section)

---

## 6. Component Map

```
app/(dashboard)/checkout/page.tsx
├── SubNav                                checkout/SubNav.tsx
├── DateSelector                          check-in/DateSelector.tsx          (shared)
├── CollapsibleSection (x4 sections)      check-in/CollapsibleSection.tsx    (shared)
├── LateCheckoutRequestItem               checkout/LateCheckoutRequestItem.tsx
│   └── Avatar                            messaging/Avatar.tsx               (shared)
├── CheckOutListItem                      checkout/CheckOutListItem.tsx
│   └── Avatar                            messaging/Avatar.tsx
├── CheckOutDetailPanel                   checkout/CheckOutDetailPanel.tsx
│   ├── Avatar                            messaging/Avatar.tsx
│   ├── ActionMenu                        core/ActionMenu.tsx                (shared)
│   ├── Departure Time section            (inline, CanaryCard)
│   ├── Folio section                     (inline, CanaryCard, expandable)
│   ├── UpsellsSection                    check-in/UpsellsSection.tsx        (shared)
│   ├── Guest Review section              (inline, CanaryCard, star rating)
│   ├── Mark as Processed / Status banner (inline)
│   ├── Contact info                      (inline)
│   ├── Notes section                     (inline)
│   ├── Copy Toast                        (inline)
│   └── ActivityLogModal                  checkout/ActivityLogModal.tsx
└── NewCheckoutModal                      checkout/NewCheckoutModal.tsx
```

---

## 7. Cross-Product Connections

### Components Imported FROM Check-in

| Component | Source File | Used In |
|-----------|------------|---------|
| `DateSelector` | `components/products/check-in/DateSelector.tsx` | Checkout page |
| `CollapsibleSection` | `components/products/check-in/CollapsibleSection.tsx` | Checkout page (4 sections) |
| `UpsellsSection` | `components/products/check-in/UpsellsSection.tsx` | CheckOutDetailPanel |

### Shared Core Components

| Component | File | Used By |
|-----------|------|---------|
| `ActionMenu` | `components/core/ActionMenu.tsx` | CheckOutDetailPanel header |
| `Toast` | `components/core/Toast.tsx` | Available (detail panel uses inline toast instead) |
| `Avatar` | `components/products/messaging/Avatar.tsx` | List items, detail panel, late checkout items |

### Shared Types (Imported from Check-in)

| Type | Source | Usage |
|------|--------|-------|
| `GuestNote` | `lib/products/check-in/types.ts` | Re-exported by checkout types, used for notes |
| `UpsellItem` | `lib/products/check-in/types.ts` | Imported directly by checkout mock-data and detail panel |

### Navigation Links

- **Checkout -> Check-in:** ActionMenu in CheckOutDetailPanel has "View Check-in" which navigates to `/check-in?guest={guestId}`. This works because every checkout guest also exists in the check-in submissions.
- **Check-in -> Checkout:** ActionMenu in CheckInDetailPanel has "View Checkout" which navigates to `/checkout?guest={guestId}`. (Note: checkout page does not yet support the `?guest=` query param for auto-opening -- only check-in does.)
- **Checkout -> Messaging:** Phone icon button in detail panel sidebar opens the guest's messaging thread via `useMessagingStore`.

### Data Dependencies

- **Every checkout guest must have a check-in entry.** The bottom of `lib/products/check-in/mock-data.ts` contains 16 `checked_in` entries specifically for checkout guests (9 pending + 5 processed + 2 archived).
- **Guest data flows:** `lib/core/data/guests.ts` -> both products read the same guest records.
- **Reservation data flows:** `lib/core/data/reservations.ts` -> both products read the same reservation records.
- **Broadcast connection:** The messaging broadcast product can target departing guests via the `departures` built-in group.

### Duplicated Constants (Consolidation Opportunity)

These values are defined identically in both products:

| Constant | Check-in Location | Checkout Location |
|----------|-------------------|-------------------|
| `DEMO_TODAY` | `lib/products/check-in/types.ts` | `lib/products/checkout/types.ts` |
| `loyaltyColors` | `lib/products/check-in/types.ts` | `lib/products/checkout/types.ts` |

Consider moving to `lib/core/` if a third product needs them.

### Missing Cross-Product Feature

The checkout page does **not** support the `?guest=` URL parameter for auto-opening a detail panel (unlike check-in which does). If someone clicks "View Checkout" from the check-in detail panel, the checkout page opens but the detail panel does not auto-open to that guest.
