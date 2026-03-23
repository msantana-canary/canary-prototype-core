# Check-In Product Inventory

> Complete reference for the Check-In prototype. Covers every built feature, the data model, production gaps, and how to extend it.
>
> Last updated: 2026-03-18

---

## 1. Product Overview

The **Check-In Dashboard** is a hotel staff tool for managing guest check-in submissions. Staff use it to:

- Monitor the status of incoming guest registrations (pending, partial, submitted)
- Verify guest identity and payment documents
- Approve or deny upsell add-ons (early check-in, amenities, etc.)
- View and print signed registration cards
- Activate mobile keys and confirm physical check-ins
- Track which guests are expected today, arriving in the future, or already checked in

The dashboard has a **two-pane layout**: the left pane lists submissions by status, and the right pane shows a grid of arrival cards for verified/checked-in guests. Clicking any entry opens a full-page **detail panel overlay** with the complete verification workflow.

---

## 2. What's Built in the Prototype

### 2.1 Page Layout

**File:** `app/(dashboard)/check-in/page.tsx`

- `Suspense` wrapper for `useSearchParams`
- Two-pane layout: 480px left list pane + flex-1 right arrivals grid
- URL param support: `?guest=guest-id` auto-opens the detail panel for that guest
- `sidebar-nav-reset` event listener closes the detail panel when sidebar is clicked
- Runtime guest/reservation creation for "New check-in" flow (extends canonical data in-memory)

### 2.2 SubNav (Top Bar)

**File:** `components/products/check-in/SubNav.tsx`

- `CanaryInputSearch` for filtering guests by name, phone, or email
- "Insights" button (stub handler)
- "Export" button (stub handler)
- "New check-in" primary button (opens modal)

### 2.3 DateSelector

**File:** `components/products/check-in/DateSelector.tsx`

- Left/right arrow buttons to navigate between days
- Calendar icon button (visual only -- no date picker popover)
- Date label showing "Today" or formatted date (e.g., "Mar 16, 2026")
- **Shared with Checkout** -- checkout page imports this same component

### 2.4 Left Pane -- Submission List

Three collapsible sections rendered in `page.tsx`:

| Section | Status Filter | Count |
|---------|--------------|-------|
| **Completed submissions** | `submitted` | 7 |
| **Partial submissions** | `partially_submitted` | 3 |
| **Pending** | `pending` | 9 |

Each section uses `CheckInListItem` components inside a bordered rounded list (`<ul>`).

#### CheckInListItem

**File:** `components/products/check-in/CheckInListItem.tsx`

- 3-column layout: Avatar | Name+Tags | Action Button
- Shows guest name, loyalty badge (via `loyaltyColors` custom styling), arrival time tag, room number with bed icon
- Flag icon (commented out, TODO: re-enable when flag workflow is built)
- Action buttons vary by status:
  - `submitted` -> "Verify" button
  - `pending` -> "Send to Tablet" button
  - `partially_submitted` -> no button
  - `checked_in` / `isArchived` -> "Message" button
- Clicking the row opens the detail panel

### 2.5 Right Pane -- Arrivals Grid

Three sections in `page.tsx`:

| Section | Filter | Default State |
|---------|--------|--------------|
| **Expected today** | `verified` + `arrivalDate === DEMO_TODAY` | Open |
| **Future** | `verified` + `arrivalDate > DEMO_TODAY` | Collapsed |
| **Checked-in today** | `checked_in` + `arrivalDate === DEMO_TODAY` | Open |

"Future" uses the `CollapsibleSection` component.

#### ArrivalCard

**File:** `components/products/check-in/ArrivalCard.tsx`

- 180px wide card with border, inner padding
- Large avatar (80x80), guest name, info strip (arrival time or "In house" tag, room, flag)
- **Three action states:**
  - **Has room + not checked in:** Key icon button + "Checked in?" button
  - **No room:** "Room not assigned" text
  - **Checked in:** Green checkmark + "Checked In" text
- **Two overlay animations:**
  - **Key activation overlay:** Shows key icon + "Activate mobile key" message + Activate button. Confirming triggers `onCheckIn`.
  - **Check-in confirmation overlay:** Shows luggage/door SVG illustration + "Did [Name] check in?" + Yes button. Confirming triggers `onCheckIn`.

#### CollapsibleSection

**File:** `components/products/check-in/CollapsibleSection.tsx`

- Reusable expand/collapse with title, count, chevron icon
- `defaultCollapsed` prop controls initial state
- **Shared with Checkout** -- checkout page imports this same component

### 2.6 Detail Panel

**File:** `components/products/check-in/CheckInDetailPanel.tsx` (~900 lines)

Full-page slide-in overlay that covers both panes but not the CanaryAppShell sidebar/header. Uses `absolute inset-0 z-50` within the page's relative container.

**Animation:** Two-state pattern (`shouldRender` + `animateIn`) for smooth slide-in/out with 500ms transition.

#### Header

- Avatar, guest name, loyalty badge
- Info strip: arrival time, room + room type code, date range, confirmation code, rate code
- Action buttons: Activity log (history icon), ActionMenu (dots), Close (X)
- **ActionMenu items:** "View Checkout" (navigates to `/checkout?guest=...`), "Stop automated messages" (stub), "Delete reservation" (danger, stub)

#### Verification Progress Bar

- 4-step horizontal bar: Reg card | Confirm ID | Confirm CC | Approve upsells
- Each step has state: `success` (green check), `action` (blue, clickable), `disabled` (gray)
- Clicking a step scrolls to the corresponding section in the main content
- Step labels change based on submission status (e.g., "Reg card pending" vs "Reg card signed")

#### Main Content (Left Column)

**Section 1: ID Verification + Payment Card** -- side-by-side at `>=1681px`, stacked below

- **IDVerificationSection** (`components/products/check-in/IDVerificationSection.tsx`)
  - Header: "Primary Guest" + Pending/Completed tag
  - Tabs: Front | Back | Selfie (using `CanaryTabs`)
  - ID image display at CR80 card ratio (250px x 396px) with border radius
  - Three checkboxes: government-issued, name match, not expired
  - Responsive CSS Grid layout switching between stacked and side-by-side modes
  - Falls back to "ID not available" / "Back not available" / "Selfie not available" placeholders

- **PaymentCardSection** (`components/products/check-in/PaymentCardSection.tsx`)
  - Header: "Payment card" + Pending/Completed tag
  - Credit card visual: dark gradient card showing brand logo, masked number (`**** **** **** 1234`), cardholder name, expiry, postal code
  - "Show number" button on card (visual only)
  - Auto-verified checks with green icons: billing zip, CVC, card not expired
  - Manual checkbox: "Verify ID and Credit Card name match"
  - "Report Dispute" button
  - Falls back to "Guest payment info is not submitted" when no card data

**Section 2: Manage Upsells** (`components/products/check-in/UpsellsSection.tsx`)
  - Header: "Manage upsells" + Pending/Reviewed tag
  - Column headers: Item | Quantity | Unit price
  - Each item row: name, quantity (Nx), total price, Approve/Deny buttons (or status tag)
  - Footer: "Upsell requests have been reviewed" checkbox + "Total approved revenue: $X.XX"
  - Read-only mode for verified/checked-in submissions
  - **Shared with Checkout** -- checkout detail panel imports this same component

**Section 3: Registration Card** (`components/products/check-in/RegistrationCardSection.tsx`)
  - Header: "Registration Card" + SIGNED/NOT SIGNED tag
  - "Print" button (when signed) or "Send to Tablet" button (when pending)
  - When signed: simulated registration card on gray background with:
    - Hotel logo ("The Grand Hotel")
    - Guest details grid (name, check-in, check-out, loyalty program)
    - Email, phone, estimated arrival fields
    - Special requests text area
    - Hotel policies with bullet points
    - "I have read and agree" checkbox (checked, disabled)
    - Cursive signature using Dancing Script font
    - Footer: "Created by Canary * SMKOUTMPUT"

#### Sidebar (Right Column)

- **Verify / Check-in button:**
  - Status-dependent: "Verify" primary button (submitted), "Send check-in link" (pending), or green "Checked in" banner
  - Verification action uses `createPortal` to render a full-screen confirm modal

- **Contact info:**
  - Phone (with Message icon button linking to messaging product, and dots menu)
  - Email (with dots menu)
  - Language
  - "Assign Staff or Department" link

- **Mobile keys section:**
  - Header: "Mobile keys" + key count
  - "Send link" button opens modal (with Name, Phone, Email fields)
  - Each key row: name, status tag (Activated/Not Provisioned/Deactivated), dots menu
  - Dots menu items: Activate, Deactivate, View details, Resend
  - Activate/Deactivate confirmation modals
  - Key details modal (showing phone, email, "View encoder details" link)

- **Notes section:**
  - Header: "Notes" + plus button to add
  - Add note: `CanaryTextArea` + Cancel/Save buttons
  - Note display: text, author/type label ("Special request from [guest]" or staff name), relative time
  - Hover effect with background highlight
  - Dots menu per note: Copy (with toast), Edit (inline), Delete

- **Copy toast:** Fixed bottom-center toast "Copied to clipboard" with 3s auto-dismiss

### 2.7 New Check-in Modal

**Built inline in** `app/(dashboard)/check-in/page.tsx` (using `CanaryModal`)

- Fields: Confirmation Number, First name, Last name, Date range (arrival/departure), Email (optional), Phone (optional)
- Creates runtime guest, reservation, and submission objects
- Auto-opens the detail panel for the new entry after creation
- Cancel/Create footer buttons

---

## 3. Data Model

### 3.1 Types

**File:** `lib/products/check-in/types.ts`

```typescript
type SubmissionStatus = 'pending' | 'partially_submitted' | 'submitted' | 'verified' | 'checked_in';

interface CheckInSubmission {
  id: string;
  reservationId: string;        // Links to canonical reservation
  guestId: string;              // Links to canonical guest
  status: SubmissionStatus;
  arrivalTime?: string;         // "2:30 PM"
  arrivalDate: string;          // ISO: "2026-03-16"
  submittedAt?: Date;
  hasMobileKey?: boolean;
  isFlagged?: boolean;          // Red flag icon (currently commented out in UI)
  isArchived?: boolean;         // Goes to "Other" section
  checkInTime?: string;         // For checked-in: "4:15 PM"
  isWalkIn?: boolean;           // Tabled for future
  isTabletRegistration?: boolean;
  isNewRegistration?: boolean;
}

interface UpsellItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  status: 'pending' | 'approved' | 'denied';
}

interface GuestNote {
  id: string;
  text: string;
  type: 'staff' | 'guest_request';
  author: string;
  createdAt: Date;
}

const DEMO_TODAY = '2026-03-16';

// Loyalty tier color map for custom tag styling
const loyaltyColors: Record<string, { background, border, text }>;
```

### 3.2 Mock Data

**File:** `lib/products/check-in/mock-data.ts`

| Export | Type | Count | Description |
|--------|------|-------|-------------|
| `checkInSubmissions` | `CheckInSubmission[]` | ~50 | All submissions across 5 statuses. Includes 33 entries for check-in guests AND 16 entries for checkout guests (who must be checked in first). |
| `submissionUpsells` | `Record<string, UpsellItem[]>` | 9 guests | Upsell items keyed by submission ID. Mix of pending/approved. |
| `submissionNotes` | `Record<string, GuestNote[]>` | 8 guests | Staff notes and guest requests keyed by submission ID. |

**Status distribution for check-in guests:**

| Status | Count | Location |
|--------|-------|----------|
| `submitted` | 7 | Left pane: "Completed submissions" |
| `partially_submitted` | 3 | Left pane: "Partial submissions" |
| `pending` | 9 | Left pane: "Pending" |
| `verified` | 7 | Right pane: "Expected today" (6) + "Future" (1) |
| `checked_in` | 7 | Right pane: "Checked-in today" |

Additional `checked_in` entries exist for checkout guests: 9 (pending checkout) + 5 (processed checkout) + 2 (archived checkout).

### 3.3 Canonical Data Dependencies

Check-in submissions reference IDs from:

- **`lib/core/data/guests.ts`** -- Guest name, avatar, initials, phone, email, language, loyalty status, ID image
- **`lib/core/data/reservations.ts`** -- Room number, room type code, confirmation code, check-in/out dates, rate code, payment card data

---

## 4. What Exists in Production But NOT in Prototype

Based on analysis of `/Users/miguelsantana/Documents/Canary/canary/frontend/hotels/src/checkIns/`:

### High-Value Gaps

| Feature | Production Files | Notes |
|---------|-----------------|-------|
| **Additional Guests** | `CheckInAdditionalGuests.vue` | Multi-guest check-in for a single reservation. Shows each guest's verification status separately. |
| **Fraud Checks Section** | `FraudChecksSection/`, `CCVerification.vue` | Dedicated fraud detection UI with CC verification results and flags. |
| **PMS Sync** | `CheckInPmsSyncModal.vue`, `CheckInPostToPms.vue`, `CheckInPostToPmsDemo.vue` | Post check-in data to the property management system. Production has a demo-specific variant. |
| **Deposit Details** | `CheckInDepositDetailsModal.vue` | Detailed deposit information modal. |
| **Payment Details Modal** | `CheckInPaymentDetailsModal.vue` | Expanded payment card details beyond the card preview. |
| **Refund Modal** | `CheckInRefundModal.vue` | Process refunds from the check-in detail view. |
| **Buy Now Pay Later** | `CheckInDetailsBuyNowPayLater.vue` | BNPL payment option display. |

### Mobile Key Gaps

| Feature | Production Files | Notes |
|---------|-----------------|-------|
| **Mobile Key Details Modal** | `MobileKeyDetailsModal.vue` | Expanded key status and encoder details. |
| **Vendor-Specific Key Views** | `MobileKeyDormakabaDetails.vue`, `MobileKeyVostioDetails.vue` | Per-lock-vendor mobile key details. |
| **Send Key Link Modal** | `SendLinkMobileKeyModal.vue` | Production-grade link-sending flow. |
| **Mobile Key Actions Store** | `mobileKeyActionsStore.ts` | State management for key activate/deactivate/resend flows. |

### Dashboard Gaps

| Feature | Production Files | Notes |
|---------|-----------------|-------|
| **Guest Verification Flag** | `GuestVerificationFlag.vue` | Visual flag indicator on arrival cards when verification issues exist. Currently commented out in prototype. |
| **Guest Membership Dog Ear** | `GuestMembershipDogEar.vue` | Corner badge on arrival cards for loyalty members. |
| **Mobile Key Activated Badge** | `GuestMobileKeyActivatedConfirmBadge.vue` | Animated badge overlay when key is activated. |
| **Checked-In Confirm Badge** | `GuestCheckedInConfirmBadge.vue` | Animated badge when guest is confirmed checked in. |
| **Dashboard Sidebar** | `CheckInDashboardSidebar.vue` | Sidebar with filters, date picker, counters (not a detail sidebar). |
| **New Registration Flow** | `ConnectToReservation.vue`, `NewRegistrationModalSearchResults.vue` | Walk-in guest flow: search for existing reservations to link, or create from scratch. |

### Detail View Gaps

| Feature | Production Files | Notes |
|---------|-----------------|-------|
| **Verification Check Flags** | `CheckInVerificationCheckFlagToggle.vue` | Toggle individual verification checks as flagged for review. |
| **Skip Verification Modal** | `SkipVerificationModal.vue` | Allow staff to skip verification with a reason. |
| **Guest Verification Bar** | `CheckInGuestVerificationBar.vue` | Additional verification bar component (separate from progress bar). |
| **STB/EVA Verification** | `CheckInDetailsStbVerificationCheck.vue`, `CheckInSTBEvaImage.vue`, `CheckInStbEvaModal.vue` | Scan-to-Book / EVA image verification system. |
| **Wyndham Direct Card** | `CheckInDetailsWyndhamDirectCard.vue` | Wyndham-specific integration card. |
| **Activity Logs** | `CheckInModalLogs.vue` | Reverse-chronological event log in the detail modal. Check-in prototype has notes but no activity log (unlike checkout which has one). |
| **Circular Progress** | `CircularProgress.vue` | Circular progress indicator for verification status. |
| **Print View** | `CheckInsPrint.vue` | Print-friendly view of check-in data. |
| **WebSocket Real-Time Updates** | `CheckInSocketService.ts` | Real-time status updates via PubSub. |

---

## 5. How to Add a Feature

### Step 1: Identify Where It Goes

| What you're building | Where |
|---------------------|-------|
| New data fields | `lib/products/check-in/types.ts` (types) + `lib/products/check-in/mock-data.ts` (data) |
| New detail panel section | `components/products/check-in/` (new component) + import in `CheckInDetailPanel.tsx` |
| New list-level feature | `app/(dashboard)/check-in/page.tsx` |
| New modal | `components/products/check-in/` (new component) + trigger from page or detail panel |
| Shared component (used by checkout too) | `components/core/` or keep in check-in and import cross-product |

### Step 2: Add the Type

```typescript
// lib/products/check-in/types.ts
export interface CheckInSubmission {
  // ... existing fields ...
  myNewField?: string;  // Add optional field
}
```

### Step 3: Add Mock Data

```typescript
// lib/products/check-in/mock-data.ts
// Add data for existing or new submissions
```

### Step 4: Build the Component

Create a new file in `components/products/check-in/`. Follow existing patterns:

- `'use client'` directive
- Import from `@canary-ui/components` with proper enums
- Import types from `@/lib/products/check-in/types`
- Import canonical data types from `@/lib/core/types/`

### Step 5: Wire It Up

- **Detail panel section:** Import and render in `CheckInDetailPanel.tsx` inside the main scrollable area
- **List feature:** Add to the page layout in `page.tsx`
- **Modal:** Add state management and trigger in the parent component

### Step 6: Add Section Ref (if scrollable)

If adding a section to the detail panel that the progress bar should scroll to:

```typescript
// In CheckInDetailPanel.tsx
<div ref={(el) => { sectionRefs.current['mySection'] = el; }}>
  <MySectionComponent />
</div>
```

---

## 6. Component Map

```
app/(dashboard)/check-in/page.tsx
├── SubNav                              check-in/SubNav.tsx
├── DateSelector                        check-in/DateSelector.tsx        (shared w/ checkout)
├── CheckInListItem (x3 sections)       check-in/CheckInListItem.tsx
│   └── Avatar                          messaging/Avatar.tsx             (shared)
├── CollapsibleSection                  check-in/CollapsibleSection.tsx   (shared w/ checkout)
├── ArrivalCard                         check-in/ArrivalCard.tsx
│   ├── Avatar                          messaging/Avatar.tsx
│   ├── Key activation overlay          (inline)
│   └── Check-in confirmation overlay   (inline, with SVG illustration)
├── CheckInDetailPanel                  check-in/CheckInDetailPanel.tsx
│   ├── Avatar                          messaging/Avatar.tsx
│   ├── ActionMenu                      core/ActionMenu.tsx              (shared)
│   ├── Verification Progress Bar       (inline)
│   ├── IDVerificationSection           check-in/IDVerificationSection.tsx
│   ├── PaymentCardSection              check-in/PaymentCardSection.tsx
│   ├── UpsellsSection                  check-in/UpsellsSection.tsx      (shared w/ checkout)
│   ├── RegistrationCardSection         check-in/RegistrationCardSection.tsx
│   ├── Mobile Keys Section             (inline in detail panel)
│   ├── Notes Section                   (inline in detail panel)
│   ├── Send Mobile Key Link Modal      (inline, CanaryModal)
│   ├── Activate Key Modal              (inline, CanaryModal)
│   ├── Deactivate Key Modal            (inline, CanaryModal)
│   ├── Key Details Modal               (inline, CanaryModal)
│   ├── Verify Confirm Modal            (inline, createPortal)
│   └── Copy Toast                      (inline)
└── New Check-in Modal                  (inline in page.tsx, CanaryModal)
```

---

## 7. Cross-Product Connections

### Shared Components (Used by Both Check-in and Checkout)

| Component | File | Usage |
|-----------|------|-------|
| `DateSelector` | `components/products/check-in/DateSelector.tsx` | Imported by checkout page |
| `CollapsibleSection` | `components/products/check-in/CollapsibleSection.tsx` | Imported by checkout page |
| `UpsellsSection` | `components/products/check-in/UpsellsSection.tsx` | Imported by checkout detail panel |
| `ActionMenu` | `components/core/ActionMenu.tsx` | Used by both detail panels |
| `Toast` | `components/core/Toast.tsx` | Available for both products |
| `Avatar` | `components/products/messaging/Avatar.tsx` | Used across all products |

### Navigation Links

- **Check-in -> Checkout:** ActionMenu in CheckInDetailPanel has "View Checkout" which navigates to `/checkout?guest={guestId}`
- **Checkout -> Check-in:** ActionMenu in CheckOutDetailPanel has "View Check-in" which navigates to `/check-in?guest={guestId}`
- **Check-in -> Messaging:** Phone icon button in detail panel sidebar opens the guest's messaging thread

### Data Connections

- **Checkout depends on check-in mock data:** Every checkout guest also has a `checked_in` entry in `checkInSubmissions` (16 entries at the bottom of the file: 9 pending checkout, 5 processed, 2 archived)
- **Shared types:** Checkout re-exports `GuestNote` from check-in types. Both products use `UpsellItem` from check-in types.
- **Canonical data:** Both products read the same guest/reservation records from `lib/core/data/`
- **Broadcast messaging:** Broadcast product can filter guests by check-in status via the `departures` built-in group

### Shared Constants

- `DEMO_TODAY = '2026-03-16'` is defined independently in both check-in and checkout types (same value)
- `loyaltyColors` is duplicated in both type files (identical map)
