# Canary Check-In Product - Analysis & Feature Summary

**Date:** 2025-12-17
**Purpose:** Understanding the existing Canary check-in product to rebuild as a workable prototype

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

---

## Overview

The Canary Check-In product is a **comprehensive digital check-in platform** for the hospitality industry. It supports guest-facing web check-in, kiosk workflows, and integrates with hotel PMS systems for seamless operations.

**Core Value Proposition:**
- Digital guest registration card collection
- ID verification (photo-based + AI-powered)
- Payment card capture and deposit collection
- Addon upsells (early check-in, late checkout, room upgrades)
- Digital key delivery (QR codes, Google Wallet)
- Multi-guest check-in support
- 44-language localization

**Total Codebase:**
- ~856 source files
- ~17MB across frontend, backend, and kiosk

---

## Technology Stack

### Frontend
- **Framework:** Vue 3 (Composition API)
- **State Management:** Pinia
- **Build Tool:** Vite
- **Language:** TypeScript
- **UI Library:** Custom "canary-ui"
- **Styling:** SCSS
- **Internationalization:** vue-i18n (44 languages)
- **Icons:** Material Design Icons (MDI)

### Backend
- **Framework:** Django (Python)
- **Database:** PostgreSQL
- **Async Tasks:** Celery
- **Payments:** Stripe
- **File Storage:** Cloud storage (images, wallet passes)

### Kiosk Layer
- **Pattern:** Step-based workflow engine
- **Session Management:** Django models
- **Step Configuration:** Per-hotel customization

---

## Feature Categories

### 1. Registration Card Collection
- Guest information form (name, email, phone, address)
- PMS-integrated reservation lookup
- Required vs optional field configuration
- Multi-language form support
- Nationality and vehicle info collection
- Custom question support

### 2. ID Verification
**Methods:**
- Photo-based ID document upload (v1 & v2)
- Advanced AI/ML verification
- Passport collection for international guests
- Selfie-based identity verification
- Singapore Tourism Board (STB) EVA compliance

**Workflow:**
- ID information review/editing step
- Guest ID management
- Photo recognition integration

### 3. Payment Processing
- Stripe payment gateway integration
- Credit card image capture (for PMS)
- Deposit collection with surcharges
- Payment authorization workflows
- Client secret management
- PMS deposit synchronization

### 4. Addon Upsells
**Available Addons:**
- Early check-in purchasing
- Late checkout purchasing
- Room upgrade offerings
- Membership gift offers

**Features:**
- Addon storefront display
- Inventory management
- Rate code configuration
- Addon details modals

### 5. Digital Key Management
- QR code generation for key access
- Google Wallet pass creation
- Key encoding session management
- Mobile key integration

### 6. Multi-Guest Workflows
- Additional guest collection
- Accompanying guest details
- Guest age verification
- Per-guest nationality collection
- Next destination tracking

### 7. Checkout Features
- eFolio (electronic folio) delivery
- Late checkout requests
- Post-stay feedback collection
- Auto-checkout workflows

### 8. Kiosk Workflows
**25 Configurable Steps:**
- Registration card
- Email/phone/address collection
- ID upload & verification
- Passport collection
- Policy confirmation
- Proforma folio confirmation
- Key encoding
- Addon purchasing
- Membership gifts
- Additional guest flows

### 9. Staff Tipping
- Staff member tipping
- Department tipping
- Staff lookup/search
- Tipping form submission

### 10. Analytics & Logging
- Check-in event tracking
- Step completion analytics
- Session metrics collection
- Operation audit logs
- Deposit inconsistency detection

### 11. Notifications
- Check-in invitations
- Post-check-in messaging
- Message cadence configuration
- Slack notifications for staff

### 12. Hotel Configuration
- Per-hotel step customization
- Early check-in rate codes
- Addon code configuration
- Check-in time validation
- Theme customization

---

## UI Structure

### Guest Check-In Flow (Web)

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER                                    │
│  [Hotel Logo]                              [Language Selector]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    MAIN CONTENT AREA                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │              Step-Based Form Content                     │    │
│  │                                                          │    │
│  │  • Reservation Lookup                                    │    │
│  │  • Registration Card Form                                │    │
│  │  • ID Upload                                             │    │
│  │  • Payment Card                                          │    │
│  │  • Addons Selection                                      │    │
│  │  • Policy Acceptance                                     │    │
│  │  • Completion Screen                                     │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                        FOOTER                                    │
│  [Back]                                    [Continue / Submit]   │
│                      [Security Badge]                            │
└─────────────────────────────────────────────────────────────────┘
```

### Key UI Components

**Views (24 directories):**
- `CheckIn/` - Main check-in flow (9 sub-views)
- `CheckOut/` - Checkout flow (3 sub-views)
- `Lookup/` - Reservation lookup (3 sub-views)
- `Key/` - Key management
- `WalletHome/` - Wallet features (5 sub-views)
- `WalletLogin/` - Wallet auth (4 sub-views)
- `TipStaff/` - Tipping variants

**Check-In Sub-Views:**
- `CheckInCard/` - Payment card collection
- `CheckInCardPhotos/` - Card image capture
- `CheckInIdPhotos/` - ID document upload (5 components)
- `CheckInStbIdPhotos/` - Singapore STB verification
- `CheckInRegCardReview/` - Review & validation
- `CheckInAddons/` - Addon upsells
- `CheckInDrawerModals/` - Help modals
- `CheckInQRCode.vue` - Key encode QR

**Components (13 directories):**
- `ImageUploader/` - ID/card image capture (4 components)
- `addons/` - Addon components (5 components)
- `roomUpgrades/` - Room upgrade UI (5 components)
- `MultiGuest/` - Multi-guest handling

---

## Architecture

### Frontend Structure

```
/frontend/check-in/src/
├── App.vue                    # Main entry point
├── main.ts                    # Vue 3 initialization
├── router.ts                  # Route configuration
├── store.ts                   # Pinia setup
├── AppStore.ts                # Global app state
├── checkIn/                   # CORE CHECK-IN LOGIC (18 files)
│   ├── CheckInStore.ts        # Main state management (14KB)
│   ├── CheckInSubmitCard.vue  # Card submission (22KB)
│   ├── CardSubmitter.ts       # Card processing (13KB)
│   ├── AuthorizationSubmitter.ts
│   ├── DepositSubmitter.ts
│   └── RegistrationCardSubmitter.ts (18KB)
├── views/                     # 24 view directories
├── components/                # 13 component directories
├── composables/               # 7 Vue 3 composables
├── api/                       # API client layer
│   ├── checkIn/               # 20 endpoints
│   └── checkOut/              # 4 endpoints
├── locale/                    # 44 language files
├── scss/                      # 9 stylesheets
└── theme/                     # 7 theme files
```

### Backend Structure (check_in app)

```
/backend/canary/check_in/
├── models/                    # 23 Django models
│   ├── check_in.py
│   ├── registration_card.py
│   ├── deposit.py
│   ├── additional_guest.py
│   ├── configuration.py
│   └── stb_eva_information*.py
├── services/                  # 29 business logic files
│   ├── check_in.py
│   ├── registration_card.py
│   ├── check_in_payment.py
│   ├── check_in_id.py
│   ├── deposit.py
│   └── google_wallet.py
├── views/                     # 43 HTTP endpoints
│   ├── guest_check_in_view.py
│   ├── guest_check_in_id_view.py
│   ├── guest_check_in_registration_card_view.py
│   ├── guest_check_in_payment_card_view.py
│   └── google_wallet_pass.py
├── schemas/                   # 21 serialization files
├── events/                    # 61 event definitions
├── tasks/                     # 15 async tasks
├── access_control/            # 5 permission files
└── migrations/                # 473 migrations
```

### Kiosk Workflow Structure

```
/backend/canary/kiosk/
├── steps/check_in/            # 25 workflow steps
│   ├── registration_card/
│   ├── collect_email/
│   ├── collect_phone/
│   ├── collect_address/
│   ├── upload_id/
│   ├── advanced_id_verification/
│   ├── guest_passport/
│   ├── add_ons/
│   ├── confirm_policies/
│   ├── encode_key/
│   ├── early_check_in/
│   ├── late_check_out/
│   └── additional_guest/      # 6 sub-steps
├── views/                     # 14 API endpoints
│   ├── check_in_session.py
│   ├── id_verification.py
│   ├── payment.py
│   └── key_encode_session.py
└── models/sessions/
    └── check_in_session.py    # Session model
```

---

## Key Files Reference

### Frontend Must-Know Files

| File | Purpose | Size |
|------|---------|------|
| `checkIn/CheckInStore.ts` | Main state management | 14KB |
| `checkIn/CheckInSubmitCard.vue` | Card submission form | 22KB |
| `checkIn/RegistrationCardSubmitter.ts` | Reg card submission | 18KB |
| `checkIn/CardSubmitter.ts` | Card processing logic | 13KB |
| `composables/useHotelDeviceStore.ts` | Device state | 9KB |
| `views/CheckIn/CheckIn.vue` | Primary check-in view | - |

### Backend Must-Know Files

| File | Purpose | Lines |
|------|---------|-------|
| `admin.py` | Django admin config | 35KB |
| `urls.py` | URL routing | 13KB |
| `services/check_in.py` | Core business logic | - |
| `services/registration_card.py` | Reg card operations | - |
| `services/check_in_payment.py` | Payment processing | - |
| `views/guest_check_in_view.py` | Main check-in endpoint | - |

### Kiosk Must-Know Files

| File | Purpose |
|------|---------|
| `steps/check_in/*/step.py` | Step implementations |
| `views/check_in_session.py` | Session management |
| `models/sessions/check_in_session.py` | Session model |

---

## API Endpoints

### Guest Check-In (Frontend → Backend)

**Registration:**
- `POST /api/check_in/registration_card` - Submit registration card
- `GET /api/check_in/registration_card` - Get existing card
- `GET /api/check_in/new_registration` - Start new registration

**ID Verification:**
- `POST /api/check_in/id` - Submit ID photos
- `POST /api/check_in/selfie` - Submit selfie
- `POST /api/check_in/passport` - Submit passport

**Payment:**
- `POST /api/check_in/card` - Submit payment card
- `POST /api/check_in/card_photos` - Submit card images
- `GET /api/check_in/deposit` - Get deposit info
- `PUT /api/check_in/deposit` - Update deposit
- `POST /api/check_in/deposit_surcharge` - Add surcharge
- `GET /api/check_in/stripe_client_secret` - Get Stripe secret
- `PUT /api/check_in/stripe_client_secret` - Update Stripe secret
- `GET /api/check_in/hotel_payment_gateway` - Get gateway config

**Addons:**
- `POST /api/check_in/skip_addons` - Skip addons step

**Wallet:**
- `POST /api/check_in/google_wallet_pass` - Create wallet pass

### Kiosk Workflow (49 endpoints)

**Session:**
- `POST /api/kiosk/session` - Create kiosk session
- `GET /api/kiosk/session` - Get session state
- `GET /api/kiosk/reservations` - Get reservations

**Step Processing:**
- `POST /api/kiosk/values` - Submit step values
- `POST /api/kiosk/acknowledge_step` - Acknowledge step
- `POST /api/kiosk/back_step` - Go back

**Verification:**
- `POST /api/kiosk/id_verification` - Basic ID verification
- `POST /api/kiosk/advanced_id_verification` - AI verification

**Key & Room:**
- `POST /api/kiosk/assign_room` - Assign room
- `GET /api/kiosk/room_assignment_status` - Check assignment
- `POST /api/kiosk/encode_key_session` - Start key encoding
- `GET /api/kiosk/encode_key_status` - Check key status

**Payment:**
- `POST /api/kiosk/payment` - Process payment
- `GET /api/kiosk/payment_status` - Check payment status

---

## Database Models

### Core Models

**CheckIn**
- Main check-in record
- Links to Reservation
- Status tracking (pending, completed, failed)
- AI management flags

**RegistrationCard**
- Guest form data (name, email, phone, address)
- Custom question responses
- Validation state
- Multi-language support

**Deposit**
- Deposit amount and currency
- Payment method
- PMS sync status
- Surcharge tracking

**AdditionalGuest**
- Accompanying guest info
- Age and nationality
- Next destination

**Configuration**
- Per-hotel settings
- Step configuration
- Addon codes
- Rate codes

### Kiosk Session Model

**CheckInSession**
- `check_in_id` - FK to CheckIn
- `KeyEncoderStatus` - not_active, active
- `RoomAssignmentStatus` - not_started, in_progress, completed, failed
- `CheckInStatus` - not_started, completed, failed
- `ValidatedCreditCardWindow` - validation state
- `FailureReason` - failure tracking

### Singapore STB Models

**STBEVAInformation**
- EVA compliance data
- Selfie verification
- Passport verification
- Operation logs

---

## Performance & Security

### Performance
- Configuration caching
- Query optimization
- Step-based lazy loading
- Image compression for uploads

### Security
- PCI compliance for card handling
- GDPR for guest data
- STB EVA compliance (Singapore)
- SSL/TLS for all transactions
- Permission-based access control

---

## Notes

- **Frontend:** 278 files, 6.4MB (Vue 3 + TypeScript)
- **Backend check_in:** 257+ files, 9.6MB (Django)
- **Kiosk:** 107 files, 1.1MB (workflow engine)
- **Languages:** 44 localization files
- **Migrations:** 473 (mature product)
- **Steps:** 25 configurable kiosk steps
- **Integrations:** Stripe, Google Wallet, multiple PMS systems
