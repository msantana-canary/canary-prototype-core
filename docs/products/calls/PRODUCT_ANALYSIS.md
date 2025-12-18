# Canary Calls/Voice Product - Analysis & Feature Summary

**Date:** 2025-12-17
**Purpose:** Understanding the existing Canary voice/calls product to rebuild as a workable prototype

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
9. [AI Abilities](#ai-abilities)

---

## Overview

Canary Calls is a **sophisticated AI-powered voice system** that handles inbound hotel calls with intelligent routing, natural language understanding, and seamless integration with hotel operations.

**Core Value Proposition:**
- AI agent answers and handles guest calls
- Knowledge base Q&A for hotel information
- Reservation lookup, confirmation, and cancellation
- Intelligent call forwarding to staff
- Multi-language support (30+ languages)
- Call recording, transcription, and analysis
- Deep integration with chat/messaging threads

**Total Codebase:**
- 761 Python files (backend voice app)
- 103 database migrations
- 38+ prompt template directories
- 15 AI abilities
- 10 specialized skills

---

## Technology Stack

### Telephony Providers
- **Twilio** - Primary voice provider
  - Incoming calls, dial operations
  - Call forwarding, queue management
  - Recording & transcription

- **Bandwidth** - Alternative provider
  - SIP-based incoming calls
  - Stream-based audio processing
  - Transfer handling

### Real-time Communication
- **LiveKit** - Primary real-time engine
  - SIP trunk integration
  - Agent session management
  - Multilingual support

- **Fanout** - Message broadcasting
  - Real-time call state updates
  - Client synchronization

### AI/LLM
- **Open Source LLM** (configurable) - Primary
- **GPT (OpenAI)** - Alternative
- **Groq** - Experimental

### Speech Processing
- **Cartesia Sonic 2** - Text-to-Speech (TTS)
  - Configurable voice IDs
  - Speed control (Slow/Normal/Fast)

- **Deepgram** - Speech-to-Text (STT)
  - Real-time transcription
  - Multi-language support
  - Custom key terms

### Backend
- **Django** - Web framework
- **Celery** - Task queue
- **Redis** - Caching & metrics
- **PostgreSQL** - Database

### Frontend
- **Vue 3** - UI framework
- **TypeScript** - Type safety
- **Canary UI** - Component library

---

## Feature Categories

### 1. Call Handling

**Inbound Call Flow:**
- Answer incoming calls automatically
- AI agent greeting with personalization
- Context-aware conversation
- Natural language understanding

**Call States:**
| State | Description |
|-------|-------------|
| `HANDLED` | Successfully handled guest request |
| `TRANSFERRED` | Forwarded to hotel staff |
| `NO_CONVERSATION` | No conversation happened |
| `BLOCKED` | Rejected gracefully |
| `FAILED` | Failed to handle |
| `SILENCE` | Caller was silent |
| `BYPASSED` | Bypassed per config rules |

### 2. AI Agent Capabilities

**Knowledge Base Q&A:**
- Answer questions about hotel
- Amenities, hours, policies
- Directions and local info

**Reservation Handling:**
- Search by name, confirmation #, phone
- Confirm reservation details
- Cancel reservations
- Generate booking links

**Smart Routing:**
- Forward to appropriate department
- Property issue escalation
- Upsell opportunity transfer

**Contextual Awareness:**
- Previous call history
- Chat conversation history
- Guest information
- Reservation details
- Support tickets

### 3. Multi-Language Support

**30+ Languages Including:**
- English, Spanish, French, German, Italian
- Portuguese, Dutch, Polish, Russian
- Chinese (Mandarin, Cantonese)
- Japanese, Korean, Vietnamese
- Arabic, Hebrew, Turkish
- Hindi, Thai, Tagalog

**Features:**
- Language detection
- Real-time translation
- Language-specific TTS voices

### 4. Call Management

**Active Calls:**
- Real-time call monitoring
- Current caller information
- Call duration tracking

**Call History:**
- Completed calls list
- Missed calls tracking
- Call filtering and search

**Call Details:**
- Full transcripts
- Call summaries
- Audio recordings
- Topic extraction
- Intent classification

### 5. Call Analysis

**Post-Call Processing:**
- Automatic summarization
- Intent classification (2-level)
- Topic extraction
- Quality evaluation

**Analytics:**
- Portfolio-level statistics
- Call volume metrics
- Performance tracking
- Export capabilities

### 6. Configuration

**Hotel Settings:**
- Welcome message customization
- AI personality settings
- Forward number management
- Bypass rules for VIP numbers
- Ability enable/disable
- Language preferences

**Voice Settings:**
- TTS model selection
- Voice speed control
- Background noise options
- Phonetic pronunciation hints

---

## UI Structure

### Staff Dashboard - Call List

```
┌─────────────────────────────────────────────────────────────────┐
│  CALLS                                           [Filter] [Search]│
├─────────────────────────────────────────────────────────────────┤
│  Tabs: [Active] [Completed] [Missed]                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ACTIVE CALLS                                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  📞 +1 (555) 123-4567                                    │    │
│  │  Guest: John Smith | Room 101                            │    │
│  │  Duration: 2:45 | Status: In Progress                    │    │
│  │  [View Details]                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  COMPLETED CALLS                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Caller          Duration    Status       Time          │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  +1 555-1234     3:22        Handled      10:30 AM      │    │
│  │  +1 555-5678     1:45        Transferred  10:15 AM      │    │
│  │  +1 555-9012     0:30        Missed       10:00 AM      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Call Details View

```
┌─────────────────────────────────────────────────────────────────┐
│  CALL DETAILS                                        [X Close]   │
├──────────────────────────────────┬──────────────────────────────┤
│                                  │                               │
│  CALL INFO                       │  CALLER INFO                  │
│  ├─ Date: Dec 17, 2025          │  ├─ Phone: +1 555-123-4567    │
│  ├─ Time: 10:30 AM              │  ├─ Name: John Smith          │
│  ├─ Duration: 3:22              │  ├─ Email: john@email.com     │
│  └─ Status: Handled             │  └─ Room: 101                 │
│                                  │                               │
├──────────────────────────────────┴──────────────────────────────┤
│                                                                  │
│  SUMMARY                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Guest called to ask about late checkout options.        │    │
│  │  AI provided information about $50 late checkout fee.    │    │
│  │  Guest requested to book late checkout for 2 PM.         │    │
│  │  Request was confirmed and SMS sent with details.        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  TRANSCRIPT                                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [AI] Hello, thank you for calling Statler Hotel.        │    │
│  │       How may I assist you today?                        │    │
│  │                                                          │    │
│  │  [Guest] Hi, I wanted to ask about late checkout.        │    │
│  │                                                          │    │
│  │  [AI] Of course! We offer late checkout until 2 PM       │    │
│  │       for a fee of $50. Would you like me to add         │    │
│  │       that to your reservation?                          │    │
│  │                                                          │    │
│  │  [Guest] Yes please, that would be great.                │    │
│  │                                                          │    │
│  │  [AI] Perfect, I've added late checkout to your          │    │
│  │       reservation. You'll receive a confirmation SMS.    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ANALYSIS                                                        │
│  ├─ Intent: Late Checkout Request                               │
│  ├─ Topics: Late checkout, Fees, Confirmation                   │
│  └─ Quality: Good                                               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  [Play Recording]  [Download Transcript]  [View in Thread]       │
└─────────────────────────────────────────────────────────────────┘
```

### Admin - Voice Settings

```
┌─────────────────────────────────────────────────────────────────┐
│  VOICE SETTINGS                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GENERAL                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Voice Number: +1 (555) 000-1234                         │    │
│  │  Welcome Message: [Hello, thank you for calling...]      │    │
│  │  AI Personality: [Professional and friendly]             │    │
│  │  Voice Speed: ( ) Slow  (•) Normal  ( ) Fast             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  FORWARD NUMBERS                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Category          Number           Description          │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  Front Desk        +1 555-0001      Main reception       │    │
│  │  Reservations      +1 555-0002      Booking inquiries    │    │
│  │  Concierge         +1 555-0003      Guest services       │    │
│  │  [+ Add Number]                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  BYPASS NUMBERS                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Numbers that skip AI and go directly to staff:          │    │
│  │  +1 555-9999 (VIP Guest)                                 │    │
│  │  +1 555-8888 (Owner)                                     │    │
│  │  [+ Add Bypass]                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  LANGUAGES                                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [✓] English  [✓] Spanish  [✓] French  [ ] German        │    │
│  │  [ ] Chinese  [ ] Japanese  [ ] Korean  [+ More...]      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  AI ABILITIES                                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [✓] Knowledge Base Q&A                                  │    │
│  │  [✓] Reservation Lookup                                  │    │
│  │  [✓] Reservation Confirmation                            │    │
│  │  [✓] Booking Link Generation                             │    │
│  │  [ ] Reservation Cancellation                            │    │
│  │  [✓] Call Forwarding                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                              [Cancel]  [Save]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Backend Structure

```
/backend/canary/voice/
├── models/                     # 25 database models
│   ├── call.py                 # Main call record
│   ├── configuration.py        # Hotel voice config
│   ├── turn.py                 # Conversation turns
│   ├── inbound_call_segment.py # Guest audio
│   ├── outbound_call_segment.py # AI responses
│   ├── call_analysis.py        # Post-call analysis
│   ├── forward_number.py       # Transfer destinations
│   └── caller.py               # Caller information
├── services/                   # 41 service modules
│   ├── call_service.py         # Core business logic
│   ├── call_manager.py         # Call orchestration
│   ├── call_publish.py         # Real-time updates
│   └── contexts/               # Context services
│       ├── chat_context_service.py
│       ├── hotel_context_service.py
│       └── reservations_context_service.py
├── views/                      # 28 API endpoints
│   ├── twilio_incoming_call.py
│   ├── bandwidth_initiate_call.py
│   └── admin/                  # Admin views
├── livekit/                    # 21 LiveKit modules
│   ├── session.py              # Session management
│   ├── base_agent.py           # Base agent
│   └── agents/                 # Specialized agents
├── abilities/                  # 15 AI abilities
│   ├── kb_qa.py                # Knowledge base
│   ├── confirm_reservation.py
│   ├── cancel_reservation.py
│   ├── booking_link.py
│   └── forward_call.py
├── skills/                     # 10 specialized skills
│   ├── reservation_search.py
│   ├── summaries.py
│   └── categorize_call.py
├── ai/                         # AI reasoning
│   ├── brain.py                # LLM orchestration
│   ├── prompts.py              # Prompt management
│   └── ability/                # Ability framework
├── prompts/                    # 38 prompt templates
├── tasks/                      # Celery async tasks
└── migrations/                 # 103 migrations
```

### Frontend Structure

```
/frontend/hotels/src/calls/
├── Calls.vue                   # Main calls view
├── Lists/
│   ├── ActiveCallsList.vue     # Active calls
│   ├── CompletedCallsList.vue  # Completed calls
│   ├── MissedCallsList.vue     # Missed calls
│   └── CallDetails.vue         # Call detail view
├── CallStatusTag.vue           # Status indicator
├── VoiceInsights.vue           # Analytics
└── shared.ts                   # Utilities

/frontend/adminland/src/calls/
└── CallSettingsPage.vue        # Voice settings

/frontend/packages/shared/
├── schemas/voice/
│   ├── Call.ts
│   ├── CallSummary.ts
│   ├── CallTranscript.ts
│   └── VoiceConfiguration.ts
└── api/voice/
    ├── GetCalls.ts
    ├── GetCallTranscript.ts
    └── UpdateVoiceConfiguration.ts
```

### Call Flow Architecture

```
Incoming Call (Twilio/Bandwidth)
         │
         ▼
┌─────────────────────────┐
│   Webhook Handler       │
│   (twilio_incoming_call)│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Call Consumer         │
│   (TwilioCallConsumer)  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Call Manager          │
│   (Orchestration)       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   LiveKit Session       │
│   + AI Agent            │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Ability Execution     │
│   (kb_qa, forward, etc) │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   LLM Processing        │
│   + Context Services    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   TTS Response          │
│   (Cartesia Sonic 2)    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Post-Call Processing  │
│   (Summary, Analysis)   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Database + Fanout     │
│   (Real-time update)    │
└─────────────────────────┘
```

---

## Key Files Reference

### Backend Must-Know Files

| File | Purpose |
|------|---------|
| `models/call.py` | Main call record model |
| `models/configuration.py` | Hotel voice settings |
| `models/turn.py` | Conversation turn tracking |
| `services/call_manager.py` | Call orchestration |
| `services/call_service.py` | Core business logic |
| `livekit/session.py` | LiveKit session management |
| `abilities/kb_qa.py` | Knowledge base Q&A |
| `abilities/forward_call.py` | Call forwarding logic |

### Frontend Must-Know Files

| File | Purpose |
|------|---------|
| `Calls.vue` | Main calls dashboard |
| `CallDetails.vue` | Call detail view |
| `CallSettingsPage.vue` | Voice configuration |
| `schemas/voice/Call.ts` | Call TypeScript types |

---

## API Endpoints

### Call Management

```
GET  /api/voice/{hotel_slug}/calls
  - List calls with filtering

GET  /api/voice/{hotel_slug}/calls/{call_uuid}
  - Get call details

GET  /api/voice/{hotel_slug}/call_summaries
  - Get call summaries

GET  /api/voice/{hotel_slug}/calls/{call_uuid}/transcript
  - Get call transcript

GET  /api/voice/{hotel_slug}/calls/{call_uuid}/transcript/download
  - Download transcript
```

### Configuration

```
GET  /api/voice/{hotel_slug}/configuration
  - Get voice configuration

PUT  /api/voice/{hotel_slug}/configuration
  - Update voice configuration
```

### Portfolio Analytics

```
GET  /api/voice/portfolios/{portfolio_uuid}
  - Get portfolio voice info

GET  /api/voice/portfolios/{portfolio_uuid}/call_statistics
  - Get call statistics

GET  /api/voice/portfolios/{portfolio_uuid}/call_statistics/download
  - Export statistics
```

### Webhooks (Internal)

**Twilio:**
- `POST /twilio/incoming_call` - Initial call
- `POST /twilio/dial_outcome` - Dial results
- `POST /twilio/enqueue_status` - Queue status
- `POST /twilio/forward_status` - Forward status
- `POST /twilio/recording_status` - Recording ready

**Bandwidth:**
- `POST /bandwidth/initiate_call` - Call initiation
- `POST /bandwidth/call_status` - Status updates
- `POST /bandwidth/stream_event` - Audio events
- `POST /bandwidth/recording_available` - Recording ready

---

## Database Models

### Call (Main Model)

**Key Fields:**
- `uuid` - Unique identifier
- `from_number` - Caller phone number
- `to_number` - Hotel voice number
- `hotel_uuid` - FK to Hotel
- `thread_id` - FK to chat Thread
- `phone_id` - FK to Phone
- `started_at`, `answered_at`, `ended_at` - Timestamps
- `terminal_state` - Final call state
- `summary` - AI-generated summary
- `source` - Twilio/Bandwidth/Local
- `livekit_call_id` - LiveKit reference
- `slack_thread_id` - Slack integration

### Configuration (Hotel Settings)

**Key Fields:**
- `hotel` - OneToOne to Hotel
- `use_livekit` - Enable LiveKit
- `voice_number` - Hotel voice number
- `forward_call_to` - Default forward number
- `welcome_message` - Greeting text
- `personality` - AI personality
- `tts_model` - TTS configuration
- `bypass_numbers` - VIP bypass list
- `supported_languages` - Language list
- `booking_link_enabled` - Enable booking links
- `has_booking_agent` - Booking agent capability
- `has_upsell_agent` - Upsell agent capability

### Turn (Conversation)

**Key Fields:**
- `call` - FK to Call
- `role` - Agent or User
- `text` - Spoken text
- `timestamp` - When spoken
- `language` - Detected language
- `agent_name` - Which agent
- `was_interrupted` - Interruption flag
- `kb_entries_retrieved` - KB entries used

### CallAnalysis (Post-Call)

**Key Fields:**
- `call` - FK to Call
- `first_level_intent` - Primary intent
- `second_level_intent` - Secondary intent
- `tags` - Call tags
- `evaluator_execution_context` - Eval data

---

## AI Abilities

### Core Abilities (15)

| Ability | Purpose |
|---------|---------|
| `kb_qa` | Knowledge base Q&A |
| `confirm_reservation` | Confirm booking details |
| `cancel_reservation` | Cancel reservations |
| `booking_link` | Generate booking links |
| `forward_call` | Transfer to staff |
| `respond` | Generate responses |
| `end_call` | End call gracefully |
| `personalized_welcome` | Custom greetings |
| `trust_driver_welcome` | TrustDriver integration |

### Specialized Skills (10)

| Skill | Purpose |
|-------|---------|
| `reservation_search` | Find reservations |
| `reservation` | Reservation handling |
| `summaries` | Call summarization |
| `upsells` | Upsell opportunities |
| `categorize_call` | Intent classification |
| `extract_transcript_topics` | Topic extraction |
| `message` | SMS follow-up |

### Context Services

| Service | Data Provided |
|---------|---------------|
| `ChatContextService` | Last 14 days of chat messages |
| `HotelContextService` | Hotel information |
| `ReservationsContextService` | Reservation data |
| `UpsellsContextService` | Available upsells |
| `TicketGatewayContextService` | Support tickets |
| `PreviousCallsContextService` | Call history |

---

## Integration with Messaging

**Thread Association:**
- Calls linked to chat threads via `call.thread_id`
- Guest identified by phone number
- Call transcript appears in thread history

**Context Sharing:**
- AI uses chat history for context
- SMS follow-up after calls
- Unified guest communication view

**Key Integration Files:**
- `services/contexts/chat_context_service.py`
- `services/call_publish.py` (Fanout broadcasting)
- `models/call.py` (thread foreign key)

---

## Notes

- **Backend:** 761 Python files, 103 migrations
- **Models:** 25 database models
- **Services:** 41 service modules
- **Abilities:** 15 AI abilities
- **Skills:** 10 specialized skills
- **Prompts:** 38+ template directories
- **Languages:** 30+ supported
- **Providers:** Twilio, Bandwidth, LiveKit
- **Speech:** Cartesia (TTS), Deepgram (STT)
