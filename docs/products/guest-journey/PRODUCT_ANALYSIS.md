# Canary Guest Journey Product - Analysis & Feature Summary

**Date:** 2025-12-17
**Purpose:** Understanding the existing Canary guest journey product to rebuild as a workable prototype

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
9. [Guest Lifecycle](#guest-lifecycle)

---

## Overview

Canary Guest Journey is a **multi-channel guest communication and experience platform** that orchestrates the complete guest lifecycle from pre-arrival through post-checkout. It enables targeted messaging, guest segmentation, scheduled campaigns, and digital compendium delivery.

**Core Value Proposition:**
- Automated guest communications at precise lifecycle moments
- Multi-channel delivery (Email, SMS, WhatsApp)
- Guest segmentation by loyalty, rate code, length of stay
- Scheduled recurring campaigns
- Message variants for different guest segments
- Digital compendium (property info portal)
- 44-language internationalization

**Total Codebase:**
- 125+ Python files (backend)
- 26 Vue files (admin interface)
- 73 Vue/TS files (guest app)
- 18 API files + 7 schema files (shared)
- 45+ database migrations

---

## Technology Stack

### Backend
- **Framework:** Django 4.x
- **Database:** PostgreSQL (with ArrayField, soft deletes)
- **Async Tasks:** Celery
- **Event System:** EventableModelMixin
- **Logging:** structlog

### Frontend - Admin Interface
- **Location:** `frontend/adminland/src/guestJourney/`
- **Framework:** Vue 3
- **State Management:** Pinia
- **Styling:** SCSS modules

### Frontend - Guest App
- **Location:** `frontend/guest/src/`
- **Framework:** Vue 3
- **Build Tool:** Vite
- **State Management:** Pinia
- **i18n:** 44 language files

### Shared Layer
- **Language:** TypeScript
- **APIs:** 18 API client files
- **Schemas:** 7 schema definition files

---

## Feature Categories

### 1. Message Types (10 types)

| Type | Description | Timing |
|------|-------------|--------|
| `CHECK_IN_MESSAGE` | Invitation to check in | Pre-arrival |
| `CHECK_IN_SUBMITTED_MESSAGE` | Confirmation after submission | After check-in |
| `POST_CHECK_IN_MESSAGE` | Message after completion | 0-3 hours post |
| `MID_STAY_MESSAGE` | During stay communications | Mid-stay |
| `CHECKOUT_MESSAGE` | Checkout invitation | Departure day |
| `POST_CHECK_OUT_MESSAGE` | Post-departure follow-up | 0-3 hours post |
| `PRE_DEPARTURE_MESSAGE` | Pre-checkout notices | Before departure |
| `HOUSEKEEPING_SERVICE` | Room cleaning requests | Mid-stay |
| `UPSELL_MESSAGE` | Addon/upgrade offers | Throughout stay |
| `CUSTOM_MESSAGE` | Hotel-created messages | Any time |

### 2. Scheduling & Timing

**Anchor Points:**
- Arrival date
- Departure date

**Deltas (time offsets):**
- ASAP (immediate)
- Same day (0 days)
- 1-6 days
- 1-4 weeks
- 2-6 months

**Send Times:**
- 24 hourly options (8 AM - 11 PM + night hours)
- Delays: 0-3 hours for post-check-in/out messages
- Silent hours respect

### 3. Guest Segmentation

**Target Types:**
- **Loyalty Status** - VIP, Elite, Standard, Non-member
- **Rate Codes** - Booking rate type
- **Length of Stay** - 1-night vs multi-night
- **Guest Recurrence** - First-time vs returning
- **IHG Greener Stay** - Eco-program participation
- **Room Number** - Specific room targeting

**Chain-Specific Segments:**
- IHG: 21 hardcoded segments
- Best Western: 2 hardcoded segments

### 4. Scheduled Campaigns

**Features:**
- Recurring messages to in-house guests
- Same-day arrival targeting
- Cron-based scheduling

**Cadence Types:**
- Weekly
- Monthly
- Yearly

**End Conditions:**
- Never (infinite)
- After N occurrences
- On specific date

### 5. Message Variants (V2 API)

- Segment-specific content
- Priority-based selection
- Multi-channel templates (email, SMS, WhatsApp)
- Enabled/disabled state per variant

### 6. Multi-Channel Delivery

**Channels:**
- **Email** - HTML/plain text, subject lines
- **SMS** - 160-character optimized
- **WhatsApp** - WhatsApp-specific templates

**Features:**
- Per-message channel enablement
- Delivery tracking
- Template customization

### 7. Digital Compendium

- Property details and facilities
- Restaurant and business hours
- Section-based organization
- Carousel browsing UI
- Available throughout guest stay

### 8. Upsells & Addons

**Addon Types:**
- Room upgrades
- Early check-in
- Late checkout
- F&B services
- Custom addons

**Integration:**
- Upsell messages promote addons
- Purchase order tracking
- Pre-arrival and in-stay availability

### 9. Internationalization

**44 Languages Supported:**
- European: EN, DE, FR, IT, ES, PT, NL, Polish, Russian, Ukrainian, etc.
- Asian: Chinese (3 variants), Japanese, Korean
- South Asian: Hindi, Thai, Vietnamese
- Other: Turkish, Hebrew, Arabic, Tagalog

**Implementation:**
- Per-message language support
- Translation management UI
- Locale JSON files

---

## UI Structure

### Admin - Message List

```
┌─────────────────────────────────────────────────────────────────┐
│  GUEST JOURNEY SETTINGS                    [+ New Message]      │
├─────────────────────────────────────────────────────────────────┤
│  Timeline View                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │  ARRIVAL ─────────────────────────────────── DEPARTURE   │    │
│  │     │                                            │        │    │
│  │     ├─ Check-in Invite (2 days before)          │        │    │
│  │     │                                            │        │    │
│  │     ├─ Check-in Submitted (immediate)           │        │    │
│  │     │                                            │        │    │
│  │     ├─ Post Check-in (1 hour after)             │        │    │
│  │     │                                            │        │    │
│  │     ├─ Mid-Stay Message (day 2)                 │        │    │
│  │     │                                            │        │    │
│  │     ├─ Checkout Invite (departure day)──────────┤        │    │
│  │     │                                            │        │    │
│  │     └─ Post Checkout (2 hours after)────────────┘        │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Admin - Message Editor Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  EDIT MESSAGE                                        [X Close]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Message Title: [Check-in Invitation________________]            │
│                                                                  │
│  TIMING                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Anchor: ( ) Arrival  (•) Departure                      │    │
│  │  Delta:  [2 days] [Before ▼]                             │    │
│  │  Send at: [9:00 AM ▼]                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  CHANNELS                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [✓] Email    [✓] SMS    [ ] WhatsApp                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  SEGMENTS (Optional)                                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [+ Add Segment]                                         │    │
│  │  • Loyalty: VIP Members                                  │    │
│  │  • Length of Stay: Multi-night                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  CONTENT                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Subject: [Welcome to {hotel_name}!_________________]    │    │
│  │                                                          │    │
│  │  Body:                                                   │    │
│  │  [Rich text editor with merge fields...]                 │    │
│  │                                                          │    │
│  │  [Manage Translations]                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  [Send Test]                      [Cancel]  [Save]              │
└─────────────────────────────────────────────────────────────────┘
```

### Guest App - Hotel Home

```
┌─────────────────────────────────────────────────────────────────┐
│  [Hotel Logo]              HOTEL NAME              [Language]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WELCOME, {GUEST_NAME}                                           │
│                                                                  │
│  YOUR RESERVATION                                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Confirmation: ABC123                                    │    │
│  │  Check-in: Dec 14, 2025 at 3:00 PM                       │    │
│  │  Check-out: Dec 17, 2025 at 11:00 AM                     │    │
│  │  Room: 101 - King Suite                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  QUICK ACTIONS                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Check-in │ │  Mobile  │ │  Upsells │ │ Property │           │
│  │          │ │   Key    │ │          │ │   Info   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  AVAILABLE UPGRADES                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [Image] Early Check-in - $25        [View Details]      │    │
│  │  [Image] Room Upgrade - $50          [View Details]      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  PROPERTY INFO                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [Carousel of property sections...]                      │    │
│  │  < Restaurant | Spa | Pool | Gym | Business Center >     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Backend Structure

```
/backend/canary/guest_journey/
├── models/                         # 5 model files
│   ├── guest_journey_message.py    # Core message model
│   ├── scheduled_campaign.py       # Recurring campaigns
│   ├── message_variant.py          # Segment variants
│   └── guest_segment.py            # Targeting rules
├── services/                       # 13 service files
│   ├── guest_journey_message.py    # Message business logic
│   ├── scheduled_campaign.py       # Campaign scheduling
│   ├── message_variant.py          # Variant management
│   ├── guest_segment.py            # Segment management
│   └── guest_journey_event.py      # Event tracking
├── views/                          # 8 view files
│   ├── guest_journey_message.py    # Message REST API
│   ├── scheduled_campaign.py       # Campaign REST API
│   └── guest_journey_message_variants.py
├── schemas/                        # 5 schema files
├── events/                         # 50+ event specs
│   ├── event_specs/guest_journey_message/  # 17 events
│   └── event_specs/scheduled_campaign/     # 17 events
├── validators/                     # 3 validator files
├── management/commands/            # 7 command files
├── migrations/                     # 45+ migrations
└── constants.py, urls.py
```

### Frontend - Admin Structure

```
/frontend/adminland/src/guestJourney/
├── GuestJourneySettingsPage.vue        # Main settings
├── GuestJourneySegmentsPage.vue        # Segment management
├── GuestJourneyAuditLogsModal.vue      # Audit trail
├── reservationMessage/                  # 7 files
│   ├── ReservationMessagesList.vue
│   ├── GuestJourneyMessageModal.vue
│   ├── GuestJourneyMessageInlineEditor.vue
│   └── GuestJourneyMessagePreview.vue
├── scheduledCampaign/                   # 4 files
│   ├── ScheduledCampaignsList.vue
│   └── ScheduledCampaignModal.vue
├── timeline/                            # 3 files
│   ├── TimelineList.vue
│   └── GuestJourneyTimelineItem.vue
└── shared/                              # 7 files
    ├── GuestJourneySegmentSelector.vue
    ├── CustomizeEmailTemplateModal.vue
    └── GuestJourneyManageTranslationsModal.vue
```

### Frontend - Guest App Structure

```
/frontend/guest/src/
├── views/                              # 20 views
│   ├── HotelHome.vue                   # Main landing
│   ├── MyReservation.vue               # Reservation details
│   ├── PropertyInfo/PropertyInfo.vue   # Digital compendium
│   ├── ViewAllSectionEntities.vue      # Browse sections
│   ├── Upsell_GenericDetailsView.vue   # Addon details
│   ├── UpsellRoomUpgradeDetails.vue    # Room upgrades
│   ├── ViewAllAddons.vue               # All addons
│   └── MobileKey/MobileKeyFlow.vue     # Digital keys
├── components/
│   └── reservationActions/             # 16 state components
│       ├── PreArrival.vue
│       ├── CheckInAvailable.vue
│       ├── InHouse.vue
│       ├── PostCheckIn.vue
│       ├── CheckOutAvailable.vue
│       └── PostCheckOut.vue
├── stores/                             # 5 Pinia stores
│   ├── reservationStore.ts
│   ├── UpsellPurchaseStore.ts
│   └── FoodAndBeveragePurchaseStore.ts
├── compendiumSections/
│   └── SectionCarousel.vue
└── locale/                             # 44 language files
```

### Shared Packages

```
/frontend/packages/shared/
├── api/guest_journey/                  # 18 API files
│   ├── GetGuestJourneyMessages.ts
│   ├── PostGuestJourneyMessage.ts
│   ├── CreateGuestJourneyMessageWithVariants.ts
│   ├── GetScheduledCampaignsWithVariants.ts
│   └── PostGuestJourneySendTestMessage.ts
└── schemas/guestJourney/               # 7 schema files
    ├── GuestJourneyMessage.ts
    ├── GuestJourneyMessageWithVariants.ts
    ├── MessageVariant.ts
    ├── ScheduledCampaign.ts
    └── ScheduledCampaignWithVariants.ts
```

---

## Key Files Reference

### Backend Must-Know Files

| File | Purpose |
|------|---------|
| `models/guest_journey_message.py` | Core message model |
| `models/scheduled_campaign.py` | Recurring campaign model |
| `models/message_variant.py` | Segment variant model |
| `services/guest_journey_message.py` | Message business logic |
| `services/scheduled_campaign.py` | Campaign scheduling |
| `constants.py` | System message names, segments |

### Frontend Must-Know Files

| File | Purpose |
|------|---------|
| `GuestJourneySettingsPage.vue` | Admin main settings |
| `GuestJourneyMessageModal.vue` | Message editor |
| `TimelineList.vue` | Timeline visualization |
| `HotelHome.vue` | Guest app landing |
| `reservationStore.ts` | Guest reservation state |

---

## API Endpoints

### V1 API (Legacy)

```
GET  /api/guest_journey_messages?hotel={slug}
GET  /api/guest_journey_messages/{uuid}
POST /api/guest_journey_messages/
PATCH /api/guest_journey_messages/{uuid}
DELETE /api/guest_journey_messages/{uuid}
POST /api/guest_journey_messages/send  (test message)
GET  /api/guest_journey_messages/audit_logs

GET  /api/hotels/{hotel_uuid}/scheduled_campaigns
POST /api/hotels/{hotel_uuid}/scheduled_campaigns/
PATCH /api/hotels/{hotel_uuid}/scheduled_campaigns/{uuid}
DELETE /api/hotels/{hotel_uuid}/scheduled_campaigns/{uuid}
```

### V2 API (With Variants)

```
GET  /api/v2/guest_journey_messages?hotel={slug}
GET  /api/v2/guest_journey_messages/{message_uuid}
POST /api/v2/guest_journey_messages
PATCH /api/v2/guest_journey_messages/{message_uuid}
DELETE /api/v2/guest_journey_messages/{message_uuid}

GET  /api/v2/scheduled_campaigns?hotel={slug}
GET  /api/v2/scheduled_campaigns/{campaign_uuid}
POST /api/v2/scheduled_campaigns
PATCH /api/v2/scheduled_campaigns/{campaign_uuid}
DELETE /api/v2/scheduled_campaigns/{campaign_uuid}
```

---

## Database Models

### GuestJourneyMessage

**Key Fields:**
- `uuid` - Unique identifier
- `hotel` - FK to Hotel
- `title` - Message name
- `type` - Message type enum
- `delta` - Time offset (ASAP, days, weeks, months)
- `anchor_point` - ARRIVAL or DEPARTURE
- `direction` - BEFORE or AFTER
- `send_time` - Hour of day to send
- `supported_languages` - MultiSelectField
- `delay_minutes` - Post-event delay

**Relationships:**
- `message_schedule_spec` - FK to scheduler
- `segments` - GenericRelation to GuestSegment
- `variants` - Reverse FK from MessageVariant

### ScheduledCampaign

**Key Fields:**
- `uuid` - Unique identifier
- `hotel` - FK to Hotel
- `title` - Campaign name
- `cron_schedule` - Cron expression
- `repeat_cadence` - Interval number
- `repeat_cadence_type` - weekly/monthly/yearly
- `end_type` - never/occurrences/date
- `end_date` - Optional end date
- `total_occurrences` - Max send count
- `last_run_at`, `next_run_at` - Tracking

### MessageVariant

**Key Fields:**
- `uuid` - Unique identifier
- `name` - Variant name
- `priority` - Selection priority
- `is_enabled` - Active state
- `email_template` - Email content
- `sms_template` - SMS content
- `whatsapp_template` - WhatsApp content
- `segment` - FK to segment (optional)
- `guest_journey_message` OR `scheduled_campaign` - Parent (exactly one)

### GuestSegment

**Key Fields:**
- `uuid` - Unique identifier
- `target_type` - LOYALTY, RATE_CODE, LENGTH_OF_STAY, etc.
- `target_list` - Array of target values
- `canonical_membership_levels` - Loyalty level mapping

---

## Guest Lifecycle

### Phase 1: Pre-Arrival

```
Booking ──► Post-Booking Message
              │
              ▼
         Pre-Departure Messages (T-X days)
              │
              ▼
         Check-in Invitation (T-2 days)
```

### Phase 2: Check-In

```
Guest Opens Link ──► Check-in Flow
                        │
                        ▼
               Check-in Submitted Message
                        │
                        ▼
               Post Check-in Message (0-3 hrs)
```

### Phase 3: Mid-Stay

```
During Stay:
  ├── Mid-Stay Messages
  ├── Housekeeping Requests
  ├── Upsell Messages (upgrades, F&B)
  └── Scheduled Campaigns (recurring)
```

### Phase 4: Check-Out

```
Departure Day ──► Checkout Invitation
                     │
                     ▼
               Guest Completes Checkout
                     │
                     ▼
               Post-Checkout Message (0-3 hrs)
```

### Phase 5: Post-Stay

```
After Departure:
  ├── Feedback Requests
  ├── Review Reminders
  └── Seasonal Follow-ups (2-6 months)
```

---

## Event System

### Message Events (17 types)

- `guest_journey_message_created`
- `guest_journey_message_enabled/disabled`
- `guest_journey_message_deleted`
- `guest_journey_message_title_updated`
- `guest_journey_message_rescheduled`
- `guest_journey_message_email_enabled/disabled`
- `guest_journey_message_email_template_edited`
- `guest_journey_message_sms_enabled/disabled`
- `guest_journey_message_sms_template_edited`
- `guest_journey_message_whatsapp_enabled/disabled`
- `guest_journey_message_whatsapp_template_edited`
- `guest_journey_message_custom_html_enabled/disabled`

### Campaign Events (17 types)

- Similar lifecycle events for campaigns
- Plus `scheduled_campaign_updated`

---

## Integration with Check-In/Checkout

**Check-In Integration:**
- Check-in submission triggers guest journey messages
- Uses GJ template helpers for rendering
- Creates MessageTemplate entries
- Triggers: CHECK_IN, CHECK_IN_SUBMITTED, POST_CHECK_IN

**Checkout Integration:**
- Checkout process triggers checkout messages
- Uses CheckOutRenderable for templates
- Triggers: CHECKOUT_MESSAGE, POST_CHECK_OUT_MESSAGE

**Upsell Integration:**
- Upsell messages promote addons
- Purchase tracking via PurchaseOrderStore
- Available pre-arrival and in-stay

---

## Notes

- **Backend:** 125+ files, 13 services
- **Admin UI:** 26 Vue files (~810 LOC)
- **Guest App:** 73 files, 20 views, 16 reservation state components
- **APIs:** V1 (legacy) + V2 (with variants)
- **Languages:** 44 supported
- **Events:** 34+ event types
- **Migrations:** 45+ (mature product)
- **Chain Support:** IHG (21 segments), Best Western (2 segments), Wyndham
