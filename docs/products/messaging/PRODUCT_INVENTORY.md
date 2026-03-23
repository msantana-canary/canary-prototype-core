# Messaging Product Inventory

> **Purpose:** Single source of truth for the Messaging prototype. Any Claude Code session — from this repo or a fork — should read this before touching messaging code.
> **Last updated:** 2026-03-18

---

## 1. Product Overview

The Messaging product is Canary's hotel staff communication hub. It lets front-desk staff and managers read and reply to guest messages via SMS, with a three-mode structure: **Conversations** (one-to-one threads with individual guests), **Broadcast** (one-to-many mass messages to groups like Arrivals or custom lists), and an **AI Answers** stub (not yet built). Staff can search threads, filter by inbox state, link conversations to PMS reservations for context, archive or block threads, and toggle an AI toggle that drives a live Claude-powered simulation in the prototype. The prototype ships with 27 seeded inbox threads and 4 archived threads, covering a realistic cross-section of guest personas from the canonical data layer.

---

## 2. What's Built in the Prototype

### 2.1 Conversations — 1:1 Thread Messaging

**Main page entry point**
- File: `app/(dashboard)/messages/page.tsx`
- Renders `AppLayout` with tab state (`conversations | broadcast | ai-answers`)
- Manages all store wiring, search filtering, AI simulation loop, and modal orchestration

**AppLayout**
- File: `components/products/messaging/AppLayout.tsx`
- Wraps the full messaging interface with `MainNav` on top and conditional sub-navs
- Shows `SubNav` for Conversations, `BroadcastSubNav` for Broadcast

**MainNav**
- File: `components/products/messaging/MainNav.tsx`
- Three text tabs: Conversations / Broadcast / AI Answers (with underline indicator)
- Right side: online hours label + Online/Offline/Away select dropdown

**SubNav**
- File: `components/products/messaging/SubNav.tsx`
- Rounded pill tabs: Inbox / Archived / Blocked (switches `currentView` in store)
- Search input (400px wide, searches guest name, phone, email across linked reservations)
- "New message" primary button (triggers `startNewConversation` in store)

**ThreadList**
- File: `components/products/messaging/ThreadList.tsx`
- Left column (320px fixed width)
- "All conversations / My conversations / Unassigned" dropdown filter (decorative — UI only)
- When composing new: shows phone number input bar with cancel button
- Scrollable list of `ThreadListItem` components

**ThreadListItem**
- File: `components/products/messaging/ThreadListItem.tsx`
- Displays: guest avatar, name (or contact number for unlinked), timestamp, status tag, room number, request count badge, last message preview, unread dot
- Selected state: blue background; unread state: light blue background with bold preview text
- Shows typing indicator ("Guest is typing...") when `typingThreadId` matches

**ThreadView**
- File: `components/products/messaging/ThreadView.tsx`
- Right column (flex-1)
- Header: avatar, guest name (or contact number), Archived/Blocked tags, status tag, room + dates, Archive button, "Link reservation" text button (when no linked reservations), info icon toggle, 3-dot menu
- 3-dot menu: Block / Unblock / Mark as Unread
- Renders `MessageFeed`, typing indicator line, `MessageComposer`, `GuestInfoSidebar` overlay

**MessageFeed**
- File: `components/products/messaging/MessageFeed.tsx`
- Scrollable container, auto-scrolls to bottom on new messages
- Groups messages by calendar day with `DateSeparator` labels
- Renders `MessageBubble` for each message

**MessageBubble**
- File: `components/products/messaging/MessageBubble.tsx`
- Left-aligned (guest/AI), right-aligned (staff)
- Sender label, timestamp, message text

**DateSeparator**
- File: `components/products/messaging/DateSeparator.tsx`
- Horizontal rule with centered date label between message groups

**MessageComposer**
- File: `components/products/messaging/MessageComposer.tsx`
- Bordered textarea (blue border on focus), max 1600 chars, Enter to send (Shift+Enter = newline)
- Toolbar icons: Attachment, Translate, Template list, Room Service (all decorative — no modal wired)
- AI toggle (CanarySwitch) — when enabled, triggers Claude API guest simulation after staff sends
- Send via SMS button + chevron dropdown (dropdown is decorative)

**Avatar**
- File: `components/products/messaging/Avatar.tsx`
- Reusable avatar component with image fallback to initials

**GuestInfoSidebar**
- File: `components/products/messaging/GuestInfoSidebar.tsx`
- Slides in from the right as a fixed overlay (400px, z-40)
- Contact Number card (blue background)
- Assignment card with "Assign Staff or Department" link (decorative)
- Linked Reservations section: collapsible table rows, each showing guest name + AUTO-LINKED tag (if phone matches), phone, room (in-house) or dates (not in-house). Expanded row shows phone, email, dates, room, confirmation code, check-in status (with external link icon), check-out status. Per-row 3-dot menu with "Unlink reservation" action.
- "View more reservations" link (shows when > 4 reservations)
- + (add) button → opens `LinkReservationModal`
- Service Tasks section (static "No service tickets" empty state)
- Call History section (static "No call history" empty state)

**LinkReservationModal**
- File: `components/products/messaging/LinkReservationModal.tsx`
- Searches all reservations by guest name, excludes already-linked
- Stay dates field is decorative (calendar icon, no date picker wired)
- Selectable list using `CanaryList`/`CanaryListItem`, shows guest name, dates, phone
- Link reservation button

**UnlinkReservationModal**
- File: `components/products/messaging/UnlinkReservationModal.tsx`
- Two variants:
  - **Auto-linked**: Explains why unlinking is blocked (phone match), offers "Go to PMS" (disabled)
  - **Manually linked**: Confirms unlink action with Cancel / Unlink buttons

### 2.2 Broadcast Messaging

**BroadcastView**
- File: `components/products/messaging/broadcast/BroadcastView.tsx`
- 3-column layout: GroupList (240px) | GuestList (260px) | Thread (flex-1)
- Mounts `CreateGroupModal`, `FilterGuestsModal`, `ManageFiltersModal`
- Tracks `savedFilters.length` change to show a "Filter successfully saved" toast

**BroadcastSubNav**
- File: `components/products/messaging/broadcast/BroadcastSubNav.tsx`
- Rounded pill tabs: Active / Archived
- "Manage filters" text button (only shown when saved filters exist) → `ManageFiltersModal`

**BroadcastGroupList**
- File: `components/products/messaging/broadcast/BroadcastGroupList.tsx`
- Built-in groups (Arrivals / In-house / Departures) with iconography
- Custom groups section with "GROUPS" header + "+" create button
- Each custom group item shows name, member count, last broadcast preview
- Selected state: blue background with white text/icon

**BroadcastGuestList**
- File: `components/products/messaging/broadcast/BroadcastGuestList.tsx`
- Filter row (only for built-in groups): blue "Filters" button with count badge + clear X
- Date picker (Arrivals and Departures groups only): `CanaryInputDate`
- Select All checkbox (with indeterminate state)
- Per-guest rows: checkbox + avatar + name + room; guests without phone shown at 40% opacity, disabled
- Arrivals/Departures grouped by segment: Expecting / Checked In / Departing / Checked Out
- Hover popover (portal-rendered): Contact Details card with name, phone, email, dates, room, confirmation code, check-in/check-out status

**BroadcastThread**
- File: `components/products/messaging/broadcast/BroadcastThread.tsx`
- Header: group icon + "{N} guests" count, info icon (decorative)
- `BroadcastMessageFeed` + `BroadcastComposer`

**BroadcastMessageFeed**
- File: `components/products/messaging/broadcast/BroadcastMessageFeed.tsx`
- Auto-scrolls to bottom within its own container
- Date separators between day groups
- Renders `BroadcastMessageBubble` for each message

**BroadcastMessageBubble**
- File: `components/products/messaging/broadcast/BroadcastMessageBubble.tsx`
- Right-aligned bubble with light blue background, antenna icon avatar
- Shows timestamp, sender name (all caps), message text
- Filter annotation: when message was sent with filters, shows filter icon + clickable filter label (opens `FiltersAppliedModal` sub-component inline)
- Recipient count (person-group icon + number)

**BroadcastComposer**
- File: `components/products/messaging/broadcast/BroadcastComposer.tsx`
- Simplified composer: no AI toggle, fewer toolbar icons (Attachment, Template list — decorative)
- Send button disabled when no guests selected or no message text

**CreateGroupModal**
- File: `components/products/messaging/broadcast/CreateGroupModal.tsx`
- Group title input (creates new custom group in store)
- Add contact row: name + phone + channel select + Add button (all decorative — contact adding not wired)
- "Upload contacts" link + info icon (decorative)

### 2.3 Broadcast Filters

**FilterGuestsModal**
- File: `components/products/messaging/broadcast/FilterGuestsModal.tsx`
- Two modes: **Apply** (standard filter flow) and **Edit** (used by ManageFiltersModal)
- Saved Filters dropdown (only in Apply mode, only when saved filters exist): loads criteria into form
- Loyalty Status: clickable pill chips for 6 loyalty tiers
- Rate Code, Group Code, Room Number: type-to-add chip inputs (Enter adds, X removes)
- Live match count shown in footer ("N guests match")
- Save Filter button → `SaveFilterInline` sub-modal for naming
- Apply button: calls `applyFilters` in store, auto-selects matching guests
- Filter logic: AND across attributes, OR within each attribute

**ManageFiltersModal**
- File: `components/products/messaging/broadcast/ManageFiltersModal.tsx`
- Lists all saved filters with Edit (pencil) and Delete (trash) icons
- Edit: opens `FilterGuestsModal` in edit mode (criteria only, no Apply/Save buttons)
- Delete: confirmation sub-modal with "Remove" danger button
- Shows "Filter successfully saved" toast after edit

---

## 3. Data Model

### 3.1 Core Messaging Types
File: `lib/products/messaging/types.ts`

```typescript
type MessageSender = 'guest' | 'staff' | 'ai';
type MessageChannel = 'SMS' | 'WhatsApp' | 'Email' | 'Web';
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed';
type ThreadStatus = 'inbox' | 'archived' | 'blocked';
type ThreadFilter = 'inbox' | 'archived' | 'blocked';

interface Message {
  id: string;
  threadId: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  channel?: MessageChannel;
  status?: MessageStatus;
}

interface Thread {
  id: string;
  contactNumber: string;       // Phone number being messaged (always present)
  linkedReservationIds: string[]; // Reservation IDs linked to this thread
  lastMessage: string;
  lastMessageAt: Date;
  isUnread: boolean;
  status: ThreadStatus;
}

interface LinkedReservation {
  reservation: Reservation;    // From lib/core/types/reservation
  guest: Guest;                // From lib/core/types/guest
  isAutoLinked: boolean;       // true when guest.phone === thread.contactNumber
}
```

**Auto-link rule:** A reservation is "auto-linked" when the guest's phone number matches the thread's `contactNumber`. Auto-linked reservations cannot be unlinked from the UI (they would be removed automatically if the phone number in the PMS were changed). Manually linked reservations can be unlinked via the 3-dot menu in GuestInfoSidebar.

### 3.2 Broadcast Types
File: `lib/products/messaging/broadcast-types.ts`

```typescript
type BuiltInGroupType = 'arrivals' | 'in-house' | 'departures';
type GuestSegment = 'expecting' | 'checked-in' | 'checked-out' | 'departing';
type LoyaltyTier = 'non-member' | 'club-member' | 'silver-elite' | 'gold-elite' | 'platinum-elite' | 'diamond-elite';
type MainNavTab = 'conversations' | 'broadcast' | 'ai-answers';

interface BroadcastFilterCriteria {
  loyaltyTiers: LoyaltyTier[];
  rateCodes: string[];       // e.g. 'CORP', 'BAR', 'RACK'
  groupCodes: string[];      // e.g. 'GROUP2026', 'CONF2026'
  roomNumbers: string[];
}

interface SavedFilter {
  id: string;
  name: string;
  criteria: BroadcastFilterCriteria;
}

interface BroadcastGroup {
  id: string;
  name: string;
  type: 'built-in' | 'custom';
  builtInType?: BuiltInGroupType;
  memberGuestIds?: string[];  // For custom groups
  isArchived: boolean;
  lastBroadcastPreview?: string;
  memberCount?: number;
}

interface BroadcastGuestEntry {
  guestId: string;
  reservationId: string;
  segment?: GuestSegment;
  loyaltyTier?: LoyaltyTier;
  rateCode?: string;
  groupCode?: string;
  room?: string;
}

interface BroadcastMessage {
  id: string;
  groupId: string;
  content: string;
  senderName: string;
  sentAt: Date;
  recipientCount: number;
  filterSnapshot?: BroadcastMessageFilterSnapshot;
}

interface BroadcastMessageFilterSnapshot {
  type: 'ad-hoc' | 'saved';
  savedFilterName?: string;
  criteria: BroadcastFilterCriteria;
  attributeCount: number;
}
```

### 3.3 Mock Data
**1:1 Messaging:** `lib/products/messaging/mock-data.ts`
- 27 inbox threads (IDs 1–9, 14–27) + 4 archived threads (IDs 10–13)
- Each thread has `contactNumber` + `linkedReservationIds` pointing to canonical reservation IDs
- Messages keyed by thread ID in `mockMessages` record
- Notable thread types:
  - Thread 14: multi-reservation thread (1 auto-linked + 3 manually linked)
  - Thread 15: single manually-linked reservation (phone doesn't match contact)
  - Thread 16: no linked reservations (unlinked/phone-only)
  - Threads 1–9, 17–27: single auto-linked threads

**Broadcast:** `lib/products/messaging/broadcast-mock-data.ts`
- `builtInGroups`: 3 groups (Arrivals, In-house, Departures)
- `customGroups`: 5 groups (Corporate retreat, Conference, Soccer Tournament, New Test Group, Test 10-22)
- `builtInGroupGuests`: guest entries for each built-in group with loyalty tiers, rate codes, group codes, rooms, and segments
  - Arrivals: 13 guests (mix of expecting + 1 checked-in)
  - In-house: 24 guests
  - Departures: 17 guests (mix of departing + checked-out)
- `customGroupGuests`: guest entries for each custom group
- `mockSavedFilters`: 4 pre-seeded saved filters (Corporate Guests, Group Travelers, Non-Members, Corporate Group Travelers)
- `mockBroadcastMessages`: pre-seeded broadcast history per group (including one with a filterSnapshot)

### 3.4 Messaging Store (Zustand)
File: `lib/products/messaging/store.ts` — `useMessagingStore`

**State:**
| Field | Type | Purpose |
|-------|------|---------|
| `threads` | `Thread[]` | All threads (inbox + archived + blocked) |
| `messages` | `Record<string, Message[]>` | Messages keyed by threadId |
| `selectedThreadId` | `string \| null` | Currently viewed thread |
| `aiEnabled` | `boolean` | Whether the AI simulation is on |
| `isComposingNew` | `boolean` | New conversation mode active |
| `composingPhoneNumber` | `string` | Phone number being typed in new conversation |
| `typingThreadId` | `string \| null` | Thread where "guest is typing" should show |
| `isGuestInfoOpen` | `boolean` | GuestInfoSidebar visibility |
| `isLinkReservationModalOpen` | `boolean` | LinkReservationModal visibility |
| `currentView` | `'inbox' \| 'archived' \| 'blocked'` | Active thread list view |
| `searchQuery` | `string` | Thread search filter |

**Key Actions:**
- `selectThread(threadId)` — selects and marks as read
- `sendMessage(threadId, content, sender)` — creates Message, reopens archived/blocked threads
- `startNewConversation()` / `createThreadFromPhone(phone)` / `cancelComposing()` — new conversation flow
- `archiveThread` / `reopenThread` / `blockThread` / `unblockThread` — thread lifecycle
- `markThreadAsRead` / `markThreadAsUnread`
- `setCurrentView(view)` — switches inbox/archived/blocked, auto-selects first thread
- `linkReservation(threadId, reservationId)` / `unlinkReservation(threadId, reservationId)`
- `toggleGuestInfo()` / `closeGuestInfo()`
- `setGuestTyping(threadId | null)` — controls typing indicator

### 3.5 Broadcast Store (Zustand)
File: `lib/products/messaging/broadcast-store.ts` — `useBroadcastStore`

**State:**
| Field | Type | Purpose |
|-------|------|---------|
| `allGroups` | `BroadcastGroup[]` | All built-in + custom groups |
| `selectedGroupId` | `string` | Active group |
| `activeGroupTab` | `'active' \| 'archived'` | SubNav state |
| `selectedDate` | `string` (YYYY-MM-DD) | Date picker value for arrivals/departures |
| `selectedGuestIds` | `string[]` | Checked guests for next broadcast |
| `messages` | `Record<string, BroadcastMessage[]>` | Broadcast history keyed by groupId |
| `isCreateGroupModalOpen` | `boolean` | |
| `activeFilters` | `BroadcastFilterCriteria` | Applied filter state |
| `isFilterModalOpen` | `boolean` | |
| `savedFilters` | `SavedFilter[]` | Persisted named filters |
| `loadedSavedFilterId` | `string \| null` | Which saved filter is active (for snapshot labeling) |
| `isManageFiltersModalOpen` | `boolean` | |

**Key Utility Functions (exported):**
- `getGuestEntriesForGroup(groupId, allGroups)` — looks up guest entries for any group
- `getFilteredGuestEntries(groupId, allGroups, filters)` — applies AND/OR filter logic
- `isFilterEmpty(filters)` — true when all filter arrays are empty
- `getActiveFilterCount(filters)` — count of active filter dimensions
- `emptyFilterCriteria` — zero-value filter object

**Key Actions:**
- `selectGroup(groupId)` — switches group, auto-selects all messageable guests, clears filters
- `toggleGuestSelection(guestId)` / `selectAllGuests()` / `deselectAllGuests()`
- `sendBroadcast(content)` — creates BroadcastMessage with optional filterSnapshot
- `createGroup(name)` — creates new custom group with empty memberGuestIds
- `applyFilters(criteria, savedFilterId?)` — filters guest list, auto-selects matching guests
- `saveFilter(name, criteria)` / `updateFilter(id, name, criteria)` / `deleteFilter(id)`

### 3.6 Connection to Canonical Data
- Threads reference `linkedReservationIds` → canonical `reservations[resId]` (from `lib/core/data/reservations`)
- Reservations reference `guestId` → canonical `guests[guestId]` (from `lib/core/data/guests`)
- Broadcast guest entries include `guestId` and `reservationId` pointing to the same canonical stores
- Auto-link detection: `guest.phone === thread.contactNumber` — computed at runtime, not stored
- The AI service (`lib/products/messaging/services/claude-api.ts`) reads `Guest` and `Reservation` types from canonical core types

---

## 4. What Exists in Production But NOT in the Prototype

These features are present in the production Vue codebase (`/frontend/hotels/src/chat/`) but have not been built in the prototype. Any designer can pick one of these as a next feature to prototype.

### 4.1 AI Auto-Responses (AI Answers tab)
Production: The AI Answers tab shows the hotel's knowledge base (custom statements), lets staff enable/disable AI, configure tone (formal/casual), and review AI drafts before sending. When enabled, the AI automatically generates draft replies for incoming messages — staff see a floating banner with the AI-proposed message and can accept, edit, or dismiss it.

Prototype status: `MainNavTab` type includes `'ai-answers'` and the nav tab renders, but clicking it shows a "coming soon" placeholder. No knowledge base, no draft review UI.

### 4.2 Multi-Channel Support
Production: Threads can arrive via SMS, WhatsApp Business API, Email, Web Chat widget, Apple Business Messages, WeChat, and Line. Each thread shows a channel icon. The composer has a channel selector to switch the outgoing channel. WhatsApp sessions have 24-hour session windows with expiry warnings.

Prototype status: `MessageChannel` type is defined (`'SMS' | 'WhatsApp' | 'Email' | 'Web'`), and messages store `channel`, but the UI only shows/sends SMS. No channel selector in the composer, no channel icons in the thread list, no WhatsApp session state.

### 4.3 Message Templates
Production: A template library modal accessible from the composer toolbar. Templates have a title, body with merge variables (`{{ guest_first_name }}`, `{{ hotel_name }}`), topic tags, and can be enabled/disabled. Staff select a template and it populates the composer.

Prototype status: The list icon in the composer toolbar is decorative. No template modal, no template data layer.

### 4.4 Scheduled Broadcasts
Production: Broadcasts can be scheduled for a future date/time instead of sent immediately. The scheduled broadcast modal lets staff pick date and time, preview the scheduled send, and cancel/reschedule.

Prototype status: Not built. The `BroadcastComposer` only supports immediate sends.

### 4.5 Message Translation
Production: A translation icon in the composer opens a language picker. Incoming messages can be auto-translated to the hotel's language. Staff can translate their outgoing messages before sending. Supports 36+ languages via Google Translate.

Prototype status: Translation icon is in the composer toolbar as a decorative button. No language picker, no translation logic.

### 4.6 Thread Assignment to Staff/Departments
Production: Threads can be assigned to individual staff members or departments. The thread list can be filtered by "My conversations", "Unassigned", or department. Assignment changes show in the thread header.

Prototype status: Assignment card exists in `GuestInfoSidebar` with a clickable "Assign Staff or Department" link, but no modal or action is wired. The thread list filter dropdown (All/My conversations/Unassigned) is decorative only.

### 4.7 File Attachments
Production: The attachment icon in the composer opens a file picker. Images and PDFs are sent inline in the message feed. Received attachments render as thumbnails or download links.

Prototype status: Attachment icon is decorative in both `MessageComposer` and `BroadcastComposer`.

### 4.8 Internal Notes
Production: Threads have an internal notes panel where staff can write notes visible only to hotel staff, not guests.

Prototype status: Not built.

### 4.9 Auto-Response / Away Mode
Production: Hotels can configure online hours (e.g., 8 AM–11 PM), set an away mode toggle, and define auto-response messages sent to guests who message outside online hours. The `useHotelAutoRespond` composable tracks whether the hotel is currently "away" or within online hours.

Prototype status: Online hours label and Online/Offline/Away dropdown are shown in `MainNav` as decoration. No auto-response logic, no away toggle.

### 4.10 Broadcast Analytics / Delivery Tracking
Production: After sending a broadcast, staff can click into a message to see delivery status per recipient (sent, delivered, failed). Broadcast messages have read receipts.

Prototype status: Recipient count is shown on `BroadcastMessageBubble`, but no per-recipient breakdown or delivery analytics modal.

### 4.11 Search by Message Content
Production: Thread search can match on message body content, not just guest name/phone.

Prototype status: Search in `SubNav` filters threads by guest name, phone, and email against linked reservation data. No full-text message search.

### 4.12 Guest Profile Editing from Chat
Production: The guest details sidebar has an edit link that opens the PMS guest profile. Staff can update guest phone/email/name without leaving the chat product.

Prototype status: The GuestInfoSidebar shows guest data as read-only. The external link icons on check-in/check-out status are decorative.

### 4.13 Insights Tab
Production: A dedicated Insights tab shows messaging analytics: message volume over time, response time averages, AI handling rate, channel breakdown, and top question topics.

Prototype status: Not built. `MainNavTab` does not include an insights value.

### 4.14 Broadcast Group Member Management (Edit)
Production: Custom broadcast groups can be edited after creation — add/remove individual members, rename the group, or archive it.

Prototype status: `CreateGroupModal` creates groups but the "Add contact" row is decorative (contact adding not wired). There is no Edit Group modal or member list management.

### 4.15 Broadcast Scheduled (Group) Messages
Production: A dedicated "Scheduled Group Broadcast" flow lets staff compose a message for a group, pick a future send time, and manage the queue.

Prototype status: Not built.

---

## 5. How to Add a Feature

### Step 1 — Read first
Before touching anything, read `AI_REFERENCE.md` in the repo root for the complete component library reference. Every interactive element has a Canary counterpart.

### Step 2 — Add types (if needed)
If the feature introduces new data shapes, add them to:
- `lib/products/messaging/types.ts` — for thread/message concepts
- `lib/products/messaging/broadcast-types.ts` — for broadcast concepts

### Step 3 — Add mock data (if needed)
If the feature needs seeded data:
- Thread/message data → `lib/products/messaging/mock-data.ts`
- Broadcast data → `lib/products/messaging/broadcast-mock-data.ts`

### Step 4 — Extend the store
Add state fields and action functions to:
- `lib/products/messaging/store.ts` — for conversations features
- `lib/products/messaging/broadcast-store.ts` — for broadcast features

Both stores use Zustand. Follow the existing pattern: declare the interface first, then implement in `create()`.

### Step 5 — Build components
Place new components in:
- `components/products/messaging/` — for conversation-related UI
- `components/products/messaging/broadcast/` — for broadcast-related UI

If a component would be useful in other products (e.g., a guest-avatar component), place it in `components/core/` instead.

### Step 6 — Wire into the page
- Conversation features are wired in `app/(dashboard)/messages/page.tsx`
- Broadcast features: add to `BroadcastView.tsx` or its child components
- Modal state: add `isXModalOpen`, `openXModal`, `closeXModal` to the relevant store, then render the modal in the appropriate view component

### Step 7 — Test with existing mock data
All 70 canonical guests are available at `lib/core/data/guests`. The broadcast groups already reference realistic guest populations. For new features, prefer reusing existing guest and reservation IDs rather than adding new ones.

---

## 6. Component Map

```
app/(dashboard)/messages/page.tsx   (MessagesPage)
└── AppLayout
    ├── MainNav
    │   └── [Conversations | Broadcast | AI Answers] tabs + Online status select
    ├── SubNav  (conversations tab only)
    │   └── [Inbox | Archived | Blocked] pill tabs + search + new message button
    ├── BroadcastSubNav  (broadcast tab only)
    │   └── [Active | Archived] pill tabs + manage filters button
    │
    └── [activeTab === 'conversations']
        ├── ThreadList  (320px left column)
        │   ├── Assignment filter dropdown (decorative)
        │   ├── New conversation phone input  (when isComposingNew)
        │   └── ThreadListItem  ×N
        │
        └── ThreadView  (flex-1 right area)
            ├── Header  (guest name, tags, room, dates, Archive, Link reservation, Info, Menu)
            ├── MessageFeed
            │   ├── DateSeparator
            │   └── MessageBubble  ×N
            ├── Typing indicator line
            ├── MessageComposer  (textarea, toolbar icons, AI toggle, Send via SMS)
            └── GuestInfoSidebar  (fixed overlay, 400px)
                ├── Contact Number card
                ├── Assignment card
                ├── Linked Reservations table
                │   └── ReservationRow  ×N  (collapsible, 3-dot menu)
                ├── Service Tasks section  (empty state)
                └── Call History section  (empty state)

    └── [activeTab === 'broadcast']
        └── BroadcastView
            ├── BroadcastGroupList  (240px)
            │   ├── Built-in groups  (Arrivals, In-house, Departures)
            │   └── Custom groups  (with Create Group button)
            ├── BroadcastGuestList  (260px)
            │   ├── Filter row button  (built-in groups only)
            │   ├── Date picker  (arrivals/departures only)
            │   ├── Select All checkbox
            │   └── GuestItem  ×N  (with hover ContactDetailsPopover via portal)
            ├── BroadcastThread  (flex-1)
            │   ├── Header  (guest count)
            │   ├── BroadcastMessageFeed
            │   │   ├── DateSeparator
            │   │   └── BroadcastMessageBubble  ×N  (with FiltersAppliedModal)
            │   └── BroadcastComposer
            ├── CreateGroupModal
            ├── FilterGuestsModal  (with SaveFilterInline sub-modal)
            └── ManageFiltersModal  (with FilterGuestsModal in edit mode + delete sub-modal)

    └── [activeTab === 'ai-answers']
        └── "AI Answers coming soon" placeholder

    Modals (page-level):
    ├── LinkReservationModal
    └── UnlinkReservationModal
```

---

## 7. Cross-Product Connections

### Canonical data layer
Messaging is entirely built on top of the canonical data layer. Guest names, phones, emails, avatars, status tags, reservation dates, rooms, confirmation codes, and check-in/check-out statuses all come from:
- `lib/core/data/guests.ts` — `guests` record keyed by guest ID
- `lib/core/data/reservations.ts` — `reservations` record and `reservationList` array

The messaging product never duplicates guest or reservation data — it stores only IDs and derives all display info at render time.

### Check-in → Messaging
The Check-in dashboard detail panel includes a "Message Guest" action: `app/(dashboard)/check-in/page.tsx` calls `handleMessage(id)`, which currently logs to console. To wire this up, it should navigate to `/messages` with a query param or shared state that pre-selects the thread matching the guest's phone number.

### Checkout → Messaging
The Checkout dashboard detail panel similarly has a "Message Guest" action: `app/(dashboard)/checkout/page.tsx` calls `handleMessage(id)` in multiple card states. Same stub — ready to be wired to the messages route.

### Broadcast → Canonical reservations
Broadcast guest entries each carry a `reservationId`. The `BroadcastGuestList` looks up `reservations[entry.reservationId]` for the hover popover details. The same March reservation IDs used in broadcast mock data are present in the canonical reservations store.

### Potential future links
- A guest's messaging history could be surfaced in the check-in detail panel
- The check-in status shown in GuestInfoSidebar (expanded reservation row) could deep-link to the check-in product
- The checkout status link (external icon) could navigate to the checkout product's detail view for that reservation
