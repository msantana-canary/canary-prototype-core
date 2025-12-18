# Canary Messaging Product - Analysis & Feature Summary

**Date:** 2025-11-19
**Purpose:** Understanding the existing Canary messaging product to rebuild as a workable prototype

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Feature Categories](#feature-categories)
4. [UI Structure](#ui-structure)
5. [Architecture](#architecture)
6. [Key Files Reference](#key-files-reference)

---

## Overview

The Canary messaging product is a **multi-channel guest communication platform** for the hospitality industry with AI-powered automation. It supports SMS, WhatsApp, Email, Web Chat, Apple Business Messages, WeChat, and Line.

**Core Value Proposition:**
- Centralized inbox for all guest communications
- AI-powered auto-responses using hotel-specific knowledge base
- Multi-channel broadcast messaging
- Real-time conversation management
- Translation support for 36+ languages

---

## Technology Stack

### Frontend
- **Framework:** Vue.js 2.7.16 (migration to Vue 3 in progress)
- **State Management:** Pinia 2.1.7 + Vuex 3.6.2
- **Build Tool:** Vite 5.4.21
- **Language:** TypeScript 5.3.3
- **UI Library:** Custom "canary-ui" + Bulma CSS
- **Real-time:** Socket.io-client 4.7.3

### Backend
- **Framework:** Django (Python)
- **Database:** PostgreSQL
- **Cache/Pub-Sub:** Redis
- **AI/ML:** Custom embeddings + LLM integration
- **Translation:** Google Translate API

### Real-time Layer
- **Runtime:** Node.js 20 + TypeScript
- **Server:** Express.js + Socket.io
- **Adapter:** Redis adapter for horizontal scaling

---

## Feature Categories

### 1. Thread Management (Core Conversations)
- View threads in Inbox/Archived/Blocked tabs
- Thread assignment to staff/departments
- Mark threads as read/unread
- Archive/unarchive conversations
- Block/unblock threads
- Thread search and filtering
- Internal notes on threads
- Guest linking to threads
- Real-time typing indicators
- Service ticket linking

### 2. Individual Messaging
**Channels:**
- SMS (via Twilio)
- WhatsApp Business API
- Email
- Web Chat widget
- Apple Business Messages
- WeChat
- Line
- Zingle

**Features:**
- Send/receive messages
- File attachments (images, PDFs)
- Message translation (auto + manual)
- Message templates
- Channel fallback (WhatsApp → SMS)
- Message status tracking (pending/sent/delivered/failed)
- Opt-out handling

### 3. Broadcast Messaging
- Mass messaging to groups
- Broadcast folders (Arrivals/Departures/In-house/Custom)
- Filter by date/reservation status
- Broadcast groups management
- Schedule broadcasts
- Broadcast analytics (delivery status)

### 4. AI-Powered Features

**AI Response Modes:**
- **ADDRESSED:** AI handled completely
- **TERMINAL:** No response needed (conversation ended)
- **HANDOFF:** Requires human intervention
- **ANGER:** Guest frustration detected
- **ADDRESSED_INFORMATIONAL:** AI responded but flagged for review

**AI Configuration:**
- AI draft mode (staff review before sending)
- Knowledge base search (embeddings-based)
- AI tone settings (formal/casual)
- Fact-only mode
- AI auditor (validates responses)
- Automatic service ticket creation
- Survey response handling

### 5. Knowledge Base & Custom Statements
- Hotel-specific information database
- Embedding-based semantic search
- Multi-language support
- Import/export statements
- Question ID linking
- Staff feedback loop for improvements

### 6. WebChat Widget
- Embeddable chat for hotel websites
- Customizable button position/styling
- Custom logo and icons
- Welcome/error message customization
- Multi-property support
- Domain whitelisting (CORS security)

### 7. Translation Features
- Auto-detect guest language
- Translate to hotel's preferred language
- Manual translation requests
- Support for 36+ languages
- Per-thread language preferences

### 8. Message Templates
- Reusable message library
- Template variables for personalization
- Topic categorization
- Enable/disable templates
- Quick reply support

### 9. Escalations & Auto-Response
- Non-response escalation (X minutes timeout)
- Email/SMS notifications to staff
- Auto-response during away hours
- Online hours configuration
- Hotel away mode toggle

### 10. Search & Filtering
**Search By:**
- Guest name
- Phone number
- Reservation details
- Message content
- Date ranges

**Filter Options:**
- Thread status (inbox/archived/blocked)
- Assignment (user/department/unassigned)
- Arrival/departure dates
- Channel type
- Reservation status

### 11. Guest Context & Reservations
- Link threads to PMS reservations
- View guest details from chat
- Multiple guests per thread
- Guest history across threads
- Edit guest profiles

### 12. Feedback & Analytics
- AI response feedback (thumbs up/down)
- Suggest knowledge base improvements
- Message delivery tracking
- Read receipts
- Broadcast analytics

### 13. Permissions & Access Control
- Hotel-level permissions
- User-level permissions
- Department-level permissions
- Role-based feature access

### 14. Multi-Tenancy
- Hotel-scoped data isolation
- Portfolio-level management
- Brand-level webchat support
- Multi-property configurations

---

## UI Structure

### Layout (3-Column Design)

```
┌─────────────────────────────────────────────────────────────────┐
│  Top Navigation: Conversations | Broadcast | AI Answers | Insights│
├──────────────┬──────────────────────────────┬──────────────────────┤
│              │                              │                      │
│  THREAD LIST │    MESSAGE VIEW             │   GUEST DETAILS      │
│  (274px)     │    (Center Panel)           │   (Slides In)        │
│              │                              │                      │
│ [Search]     │  ┌─────────────────────────┐│                      │
│ [New Msg]    │  │ Guest Name    [Actions] ││  Reservation Info    │
│              │  ├─────────────────────────┤│  Check-in/out        │
│ Tabs:        │  │                         ││  Room number         │
│ • Inbox      │  │   Message Bubbles       ││  Contact info        │
│ • Archived   │  │   ├─Guest (left)        ││  Call history        │
│ • Blocked    │  │   └─Staff (right)       ││  Service tickets     │
│              │  │                         ││                      │
│ Thread Items:│  │   Typing indicators...  ││                      │
│ ┌──────────┐ │  │                         ││                      │
│ │Guest Name│ │  │   AI drafts            ││                      │
│ │Last msg  │ │  │                         ││                      │
│ │Time  📱  │ │  └─────────────────────────┘│                      │
│ └──────────┘ │  ┌─────────────────────────┐│                      │
│ ┌──────────┐ │  │ 📎 😊 Template ▼  Send ││                      │
│ │...       │ │  └─────────────────────────┘│                      │
│              │                              │                      │
└──────────────┴──────────────────────────────┴──────────────────────┘
```

### Key UI Components

**Left Panel - Thread List:**
- Search bar
- "New Message" button
- Tabs: Inbox / Archived / Blocked
- Scrollable thread items showing:
  - Guest name/phone
  - Last message preview
  - Timestamp
  - Unread indicator
  - Channel icon
  - Escalation warning
  - AI-managed badge

**Center Panel - Messages:**
- **Header:**
  - Guest name
  - Channel selector
  - Call button
  - AI toggle
  - Archive/Block actions
  - View Details button

- **Message Feed:**
  - Chronological bubbles
  - Typing indicators
  - Message status icons
  - AI-generated message styling
  - Feedback buttons (👍/👎)
  - Attachments
  - System messages

- **Composer:**
  - Rich text input
  - Emoji picker
  - Attachment button
  - Template selector
  - Translation toggle
  - Channel selector
  - Send button
  - Character counter

**Right Sidebar - Guest Details:**
- Reservation information
- Check-in/check-out dates
- Room number
- Contact information
- Call history
- Service tickets
- Booking details

---

## Architecture

### Frontend Structure

```
/frontend/hotels/src/chat/
├── Chat.vue                    # Main router component
├── ChatConversations.vue       # Inbox/Archive/Blocked view
├── ChatBroadcast.vue          # Broadcast messaging
├── ChatSettings.vue           # AI/Knowledge base settings
├── ChatInsights.vue           # Analytics
├── components/
│   ├── Messages/              # 37 message components
│   │   ├── Messages.vue
│   │   ├── MessageEditor.vue  # Composer
│   │   ├── MessageList.vue    # Scrollable feed
│   │   ├── MessageAtom.vue    # Individual bubble
│   │   └── ...
│   ├── ChatSidebar/           # 9 sidebar components
│   ├── GuestList/             # Thread list
│   ├── BroadcastsV2/          # Broadcast UI
│   └── KnowledgeBase/         # AI settings
├── ChatServices/
│   ├── ChatService.ts         # Main business logic (1500+ lines)
│   ├── chatStore.ts           # Pinia state
│   ├── chatBroadcastStore.ts
│   └── types.ts
└── composables/               # 12 composition functions
```

### Backend Structure

```
/backend/canary/chat/
├── models/                    # 35 Django models
│   ├── thread.py
│   ├── message.py
│   ├── configuration.py
│   ├── custom_statement.py   # Knowledge base
│   ├── broadcast.py
│   └── ...
├── views/                     # 28 API endpoint files
│   ├── api_client.py         # Main chat API
│   ├── api_external_chat.py  # Widget API
│   ├── api_twilio_*.py       # Webhooks
│   └── ...
├── services/                  # 35 business logic files
│   ├── message.py            # 2500+ lines
│   ├── thread.py
│   ├── broadcast_service.py
│   └── chat_ai/              # 27 AI service files
│       ├── chat_ai_service.py
│       ├── chat_ai_tree.py
│       ├── behaviors.py
│       ├── embeddings_services.py
│       └── ...
├── schemas/                   # 34 serialization files
├── urls.py                    # 191 URL routes
└── admin.py
```

### Real-time Communication

```
/frontend-chat/               # Node.js microservice
├── server.ts                 # Socket.io server
├── sse_handler.ts           # Server-Sent Events
├── pubsub.ts                # Redis pub/sub
└── auth.ts                  # JWT authentication
```

**Flow:**
1. Client connects via Socket.io (JWT auth)
2. Django backend publishes events to Redis
3. Node.js server subscribes to Redis channels
4. Events forwarded to clients via WebSocket
5. SSE fallback for non-WebSocket clients

**Event Types:**
- New messages
- Message status updates
- Typing indicators
- Thread updates
- Unread count changes
- AI draft generation

---

## Key Files Reference

### Frontend Must-Know Files

| File | Purpose | Lines |
|------|---------|-------|
| `ChatServices/ChatService.ts` | Main business logic | 1500+ |
| `components/Messages/MessageEditor.vue` | Message composer UI | 800+ |
| `components/Messages/MessagesContent.vue` | Message display | 600+ |
| `ChatConversations.vue` | Main conversation view | 500+ |
| `chatStore.ts` | Pinia state management | 400+ |

### Backend Must-Know Files

| File | Purpose | Lines |
|------|---------|-------|
| `services/message.py` | Message send/receive | 2500+ |
| `models/message.py` | Message model | 400+ |
| `models/thread.py` | Thread model | 300+ |
| `views/api_client.py` | Main API endpoints | 800+ |
| `services/chat_ai/chat_ai_service.py` | AI orchestration | 600+ |

### Shared Code

| File | Purpose |
|------|---------|
| `packages/shared/schemas/chat/Message.ts` | Message TypeScript types |
| `packages/shared/schemas/chat/Thread.ts` | Thread TypeScript types |
| `packages/shared/api/chat/Message.ts` | Message API client |
| `packages/shared/utilities/socketService.ts` | WebSocket client |

---

## API Endpoints (Key Routes)

### Threads
- `GET /api/chat/threads` - List threads (paginated, filterable)
- `GET /api/chat/threads/{id}` - Get single thread
- `POST /api/chat/threads` - Create new thread
- `PATCH /api/chat/threads/{id}` - Update thread
- `GET /api/chat/threads/{id}/reservation` - Get linked reservation

### Messages
- `GET /api/chat/messages` - List messages for thread
- `POST /api/chat/messages` - Send message
- `POST /api/chat/messages/translate` - Translate message

### Broadcast
- `GET /api/chat/broadcasts` - List broadcasts
- `POST /api/chat/broadcasts` - Create broadcast
- `GET /api/chat/broadcast_groups` - List groups
- `POST /api/chat/broadcast_groups/{uuid}/members` - Manage members

### AI & Knowledge Base
- `POST /api/chat/message_feedback` - Submit AI feedback
- `GET /api/chat/threads/{id}/ai_message_drafts` - Get AI drafts
- `GET /api/chat/custom_statements` - Knowledge base CRUD

### External (Widget)
- `POST /api/external/chat/sessions` - Create web chat session
- `POST /api/external/chat/sessions/{id}/messages` - Send from widget
- `POST /api/twilio/incoming_message` - SMS/WhatsApp webhook

### Real-time
- `GET /api/chat/thread_typing_indicator` - Update typing status
- `GET /api/chat/unread_counts` - Get unread counts

---

## Database Models (Core Entities)

### Thread
- Conversation container
- Links to Phone (SMS/WhatsApp) or sessions (Web/Apple/WeChat)
- Many-to-many with Guests
- Fields: `is_complete`, `is_blocked`, `is_ai_managed`, `is_escalated`, `translation_detected_language`

### Message
- Core message entity
- Source types: CLIENT, HOTEL, BROADCAST, SYSTEM, AUTO_RESPONSE, AI_RESPONSE
- Channels: SMS, WhatsApp, Email, Web, AMB, WeChat, Line
- AI fields: `ai_response_kind`, `ai_response_outcome`
- Translation fields: `translated_body`, `translation_language`

### Configuration
- Per-hotel chat settings
- AI configuration
- Knowledge base entries
- Auto-respond settings

### CustomStatement
- Knowledge base entries
- Embedding-based search
- Multi-language support
- Links to questions

### Broadcast
- Mass message campaigns
- Recipient tracking
- Delivery analytics

### BroadcastGroup
- Recipient segments
- Member management
- Last broadcast tracking

---

## Performance Optimizations

- **Pagination:** 20 threads per page
- **Virtual scrolling:** Long message lists
- **Debounced updates:** Unread counts
- **Redis caching:** Threads/messages
- **Optimistic UI:** Instant feedback
- **LocalStorage:** Draft persistence

---

## Security Features

- JWT authentication for WebSockets
- Django CSRF protection
- Permission-based access control
- Phone number validation
- File upload validation (MIME type checking)
- Rate limiting on webhooks
- Domain whitelisting for webchat

---

## Notes

- Total: 90+ Vue components for chat UI
- Total: 35+ Django models
- Total: 191 API routes
- Supports 36+ languages
- 7 communication channels
- Real-time architecture with Socket.io + Redis
- AI-powered with embeddings and LLM integration
- Multi-tenant (hotel-scoped data)
- Soft deletes for data preservation
