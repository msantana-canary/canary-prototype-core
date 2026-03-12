# Canary Checkout Product - Analysis & Feature Summary

**Date:** 2025-12-17
**Purpose:** Understanding the existing Canary checkout product to rebuild as a workable prototype

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Feature Categories](#feature-categories)
4. [UI Structure](#ui-structure)
5. [Architecture](#architecture)
6. [Key Files Reference](#key-files-reference)
7. [API Endpoints](#api-endpoints)
8. [Database Models](#database-models)
9. [Checkout vs Check-In](#checkout-vs-check-in)

---

## Overview

The Canary Checkout product handles **guest departures and payment reconciliation** for hotels. It supports e-folio delivery, auto-checkout for departed guests, late checkout purchases, and guest feedback collection.

**Core Value Proposition:**
- Electronic folio (e-folio) delivery and acceptance
- Auto-checkout for guests who already left
- Late checkout addon purchasing
- Guest feedback and review collection
- Multi-channel messaging (email, SMS, WhatsApp)
- Staff dashboard for checkout management

**Total Codebase:**
- 243+ Python files (backend)
- 18 Vue components (staff dashboard)
- 4 API files + 2 store files (guest app)
- 90+ database migrations

---

## Technology Stack

### Frontend (Guest App)
- **Location:** Shares app with check-in (`frontend/check-in/`)
- **Framework:** Vue 2/3 (transitioning)
- **State Management:** Vuex
- **Language:** TypeScript

### Frontend (Staff Dashboard)
- **Location:** `frontend/hotels/src/checkOuts/`
- **Framework:** Vue 2
- **UI Library:** canary-ui
- **State Management:** Vuex

### Backend
- **Framework:** Django
- **Database:** PostgreSQL (with full-text search)
- **Async Tasks:** Celery
- **API:** Django REST Framework
- **Logging:** structlog

### Kiosk Integration
- **Location:** `backend/canary/kiosk/steps/check_out/`
- **Pattern:** Step-based workflow engine

---

## Feature Categories

### 1. Guest Checkout Flow
**Multi-step wizard:**
- Email/phone collection
- Checkout time selection
- E-folio review and acceptance
- Guest feedback/review (optional)
- Auto-checkout option

**Time Types:**
- `already_left` - Guest departed
- `now` - Leaving immediately
- `planned` - Scheduled departure time

### 2. E-Folio (Electronic Folio)
- Display of charges/line items
- Folio confirmation step
- Mobile toggle support
- PMS integration for charge sync
- Kiosk payment integration

### 3. Auto-Checkout
**Requirements:**
- Card on file
- E-folio enabled
- Notification sent to guest

**Status Tracking:**
- pending
- processing
- completed
- failed
- scheduled
- canceled

**Features:**
- Automatic charge processing
- Email/SMS payment confirmation
- Cron job processing (`cron_auto_checkout`)

### 4. Late Checkout Purchase
- Integrates with addons system
- `PurchasedLateCheckOutAddon` model
- Configurable checkout time options
- Hotel occupancy-based availability
- Staff approval/denial workflow

### 5. Guest Feedback
- Rating/review submission
- Configurable rating threshold
- TripAdvisor link integration
- Google Reviews link integration
- Review reminder cron job

### 6. Staff Dashboard
**Folder Organization:**
- **Pending** - Created/sent checkouts
- **Submitted** - Guest completed checkout
- **Processed** - Staff processed
- **Archived** - Completed/archived

**Features:**
- Search and filtering
- Real-time unread count
- Bulk operations
- Manual data entry

### 7. Messaging
**Channels:**
- Email
- SMS
- WhatsApp
- Zingle

**Features:**
- Delivery status tracking
- Retry for failed sends
- View logs of all communications
- Resend capability

### 8. Kiosk Steps
- `collect_email/` - Email collection
- `confirm_folio/` - Folio confirmation
- `completed/` - Completion screen
- `unavailable/` - Checkout unavailable

---

## UI Structure

### Staff Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  CHECKOUT DASHBOARD                           [Search] [Filter]  │
├─────────────────────────────────────────────────────────────────┤
│  Tabs: [Pending] [Submitted] [Processed] [Archived]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Guest Name        Room    Departure    Status    Actions│    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ John Smith        101     Dec 17       Sent      [View] │    │
│  │ Jane Doe          205     Dec 17       Submitted [View] │    │
│  │ ...                                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Checkout Details Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  CHECKOUT DETAILS                                    [X Close]   │
├──────────────────────────────────┬──────────────────────────────┤
│                                  │                               │
│  GUEST INFO                      │  E-FOLIO                      │
│  ├─ Name: John Smith            │  ├─ Room charges: $150.00     │
│  ├─ Email: john@email.com       │  ├─ Restaurant: $45.00        │
│  ├─ Phone: +1 555-1234          │  ├─ Mini bar: $25.00          │
│  └─ Room: 101                   │  └─ Total: $220.00            │
│                                  │                               │
│  RESERVATION                     │  GUEST REVIEW                 │
│  ├─ Confirmation: ABC123        │  ├─ Rating: 4/5 stars         │
│  ├─ Check-in: Dec 14            │  └─ "Great stay!"             │
│  └─ Check-out: Dec 17           │                               │
│                                  │                               │
├──────────────────────────────────┴──────────────────────────────┤
│  OPERATION LOGS                                                  │
│  ├─ Dec 17 08:00 - Link sent via email                          │
│  ├─ Dec 17 09:30 - Guest viewed checkout                        │
│  └─ Dec 17 10:15 - Guest submitted checkout                     │
├─────────────────────────────────────────────────────────────────┤
│  [Send Email] [Send SMS] [Process] [Archive]                     │
└─────────────────────────────────────────────────────────────────┘
```

### Guest Checkout Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER                                    │
│  [Hotel Logo]                              [Language Selector]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: CONTACT INFO                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Email: [________________]                               │    │
│  │  Phone: [________________]                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Step 2: CHECKOUT TIME                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ( ) I've already left                                   │    │
│  │  ( ) I'm leaving now                                     │    │
│  │  ( ) I plan to leave at: [Time picker]                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Step 3: E-FOLIO REVIEW                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [Folio line items...]                                   │    │
│  │  Total: $220.00                                          │    │
│  │  [✓] I accept the charges                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Step 4: FEEDBACK (Optional)                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Rate your stay: [★★★★☆]                                 │    │
│  │  Comments: [________________]                             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                              [Submit Checkout]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Backend Structure

```
/backend/canary/check_out/
├── models/
│   ├── check_out.py           # Main CheckOut model (180+ fields)
│   ├── configuration.py        # Hotel-level config
│   ├── check_out_action.py     # Action tracking
│   ├── check_out_operation_log.py  # Audit logs
│   └── enums.py               # Folder types, time types
├── services/                   # 11 services, 2051 LOC
│   ├── auto_checkout.py        # Auto-checkout logic
│   ├── check_out.py            # Core checkout service
│   ├── check_out_dashboard.py  # Dashboard operations
│   ├── check_out_event.py      # Event publishing
│   ├── check_out_search.py     # Search functionality
│   └── check_out_config_cache.py
├── views/
│   ├── dashboard/              # 6 staff views
│   │   ├── check_out_dashboard.py
│   │   ├── check_out_details.py
│   │   └── check_out_messages.py
│   └── guest/                  # 4 guest views
│       ├── guest_check_out.py
│       └── guest_auto_checkout.py
├── events/                     # 31 event types
├── tasks/                      # Async Celery tasks
├── management/commands/        # Cron jobs
│   ├── cron_auto_checkout.py
│   ├── cron_send_review_reminder.py
│   └── cron_send_tripadvisor_review_reminder.py
├── schemas/                    # 10 API schemas
└── migrations/                 # 90+ migrations
```

### Frontend Structure (Staff Dashboard)

```
/frontend/hotels/src/checkOuts/
├── CheckOutDashboard/
│   ├── CheckOutDashboardList.vue  # Main list view
│   ├── CheckOutSearch.vue         # Search/filter
│   ├── CheckOutCreateModal.vue    # Create checkout
│   └── store/store.ts             # Vuex store
├── CheckOutDetails/
│   ├── CheckOutDetails.vue        # Main details
│   ├── CheckOutEFolio.vue         # E-folio display
│   ├── EFolioCard.vue             # E-folio card
│   ├── GuestReviewCard.vue        # Guest review
│   └── DepartureTimeCard.vue      # Departure time
└── CheckOutModal/
    ├── CheckOutModal.vue          # Main modal
    ├── CheckOutInfo.vue           # Guest info
    └── CheckOutModalLogs.vue      # Operation logs
```

### Frontend Structure (Guest App)

```
/frontend/check-in/src/
├── checkOut/
│   ├── CheckOutStore.ts           # Vuex store
│   └── CheckOutStore.test.ts
├── api/checkOut/
│   ├── PostAutoCheckout.ts        # Auto-checkout
│   ├── PostViewLog.ts             # View logging
│   ├── PutCheckOut.ts             # Update checkout
│   └── TrackExternalReviewLinkClick.ts
└── views/CheckOut/                # Check-in app views
    ├── CheckOutEFolio/
    ├── LateCheckOut/
    └── CheckOutTime/
```

### Kiosk Steps

```
/backend/canary/kiosk/steps/check_out/
├── collect_email/
│   ├── step.py
│   ├── configuration.py
│   └── strings.py
├── confirm_folio/
│   ├── step.py
│   └── ...
├── completed/
│   └── ...
└── unavailable/
    └── ...
```

---

## Key Files Reference

### Backend Must-Know Files

| File | Purpose |
|------|---------|
| `models/check_out.py` | Main CheckOut model (180+ fields) |
| `models/configuration.py` | Hotel-level settings |
| `services/auto_checkout.py` | Auto-checkout logic |
| `services/check_out.py` | Core checkout operations |
| `services/check_out_dashboard.py` | Dashboard data |
| `views/dashboard/check_out_dashboard.py` | Staff dashboard API |
| `views/guest/guest_auto_checkout.py` | Guest auto-checkout |

### Frontend Must-Know Files

| File | Purpose |
|------|---------|
| `CheckOutDashboardList.vue` | Staff dashboard list |
| `CheckOutModal.vue` | Staff checkout modal |
| `CheckOutDetails.vue` | Guest-facing details |
| `EFolioCard.vue` | E-folio display |
| `CheckOutStore.ts` | Guest checkout state |

---

## API Endpoints

### Guest API

```
PUT /guest_api/check_outs/{hotel_slug}/{check_out_slug}
  - Update checkout time/type

POST /guest_api/check_outs/{hotel_slug}/{check_out_slug}/auto-checkout
  - Trigger auto-checkout

GET /guest_api/hotels/{hotel_slug}/checkouts/{checkout_slug}/track/event
  - Track checkout events (views, clicks)
```

### Staff API

```
GET /api/check_outs
  - List all checkouts

GET /api/check_outs/{check_out_slug}
  - Get checkout details

GET /api/hotels/{hotel_slug}/checkouts
  - Dashboard list with filtering

GET /api/hotels/{hotel_slug}/checkouts/search
  - Search checkouts

GET/POST /api/check_outs/{slug}/{message_type}
  - Send messages (email, SMS, WhatsApp)

GET /api/check_outs/{slug}/unread_count
  - Get unread count for dashboard

GET /api/reports/check_outs
  - Export checkout data
```

---

## Database Models

### CheckOut (Main Model)

**Key Fields:**
- `uuid` - Unique identifier
- `slug` - URL-friendly identifier
- `folder` - Status folder (created, sent, submitted, processed, archived)
- `guest_name`, `guest_email`, `guest_phone`, `room_number`
- `departure_date`, `checkout_time`
- `time_type` - already_left, now, planned
- `auto_checkout_status` - pending, processing, completed, failed
- `e_folio_accepted` - Boolean
- `review_rating` - Guest rating
- `search_vector` - Full-text search

**Relationships:**
- `hotel` - FK to Hotel
- `reservation` - FK to Reservation
- `late_checkout_addon` - FK to PurchasedLateCheckOutAddon

### Configuration (Hotel Settings)

**Key Fields:**
- `has_e_folio` - Toggle e-folio feature
- `has_ratings` - Toggle guest feedback
- `has_auto_checkout` - Enable auto-checkout
- `check_out_time_minute_offset` - Default checkout time
- `skip_checkout_time_step` - Skip time selection
- `review_rating_threshold` - Minimum for external review prompt
- `submit_message_i18n` - Completion message (multi-language)
- `tripadvisor_url`, `google_reviews_url` - External review links

### CheckOutOperationLog (Audit Trail)

**Event Types:**
- created, moved_to_processed, moved_to_submitted, moved_to_archived
- link_sent_email, link_sent_sms, link_sent_whatsapp, link_sent_zingle
- link_failed_email, link_failed_sms, link_failed_whatsapp
- late_checkout_addon_approved, late_checkout_addon_denied
- guest_feedback_submitted

---

## Checkout vs Check-In

| Aspect | Check-In | Check-Out |
|--------|----------|-----------|
| **Goal** | Guest arrival & room access | Guest departure & payment |
| **Key Data** | Deposit, ID scan, room assignment | Folio charges, departure time, feedback |
| **Steps** | Payment, ID, T&C, early/late check-in | Email, time, folio review, feedback |
| **Unique Features** | Mobile key, upsells | E-folio, auto-checkout, reviews |
| **Dashboard Folders** | Different states | Pending, Submitted, Processed, Archived |
| **Events** | Check-in lifecycle | 31+ unique events |
| **Auto-Processing** | Manual | Auto-checkout for departed guests |
| **Messaging** | Arrival confirmations | Departure reminders, review requests |

---

## Event System

**31+ Event Types:**

**Auto-Checkout Lifecycle:**
- auto_checkout_initiated
- auto_checkout_scheduled
- auto_checkout_attempted
- auto_checkout_completed
- auto_checkout_failed

**Checkout Lifecycle:**
- checkout_created
- checkout_viewed
- checkout_submitted
- checkout_processed
- checkout_updated
- checkout_archived

**E-Folio Events:**
- e_folio_accepted
- e_folio_pushed_to_tablet
- e_folio_accepted_on_device

**Message Events:**
- link_sent_email, link_sent_sms, link_sent_whatsapp, link_sent_zingle
- link_failed_email, link_failed_sms, link_failed_whatsapp, link_failed_zingle

**Late Checkout:**
- late_checkout_requested
- late_checkout_approved
- late_checkout_denied

**External Reviews:**
- google_review_link_clicked
- tripadvisor_link_clicked

**Feedback:**
- guest_feedback_submitted

---

## Notes

- **Backend:** 243 files, 11 services (2,051 LOC)
- **Staff Dashboard:** 18 Vue components
- **Guest App:** 4 API files, 2 store files (shared with check-in)
- **Migrations:** 90+ (mature product)
- **Events:** 31+ event types
- **Kiosk Steps:** 4 checkout-specific steps
- **Integrations:** PMS gateway, Stripe, TripAdvisor, Google Reviews
