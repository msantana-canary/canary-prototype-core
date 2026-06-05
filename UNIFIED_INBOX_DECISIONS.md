# Unified Inbox — Decision Log

> Decisions by name. Supersede, don't delete.

## Guest-First Thread Model
**Decision:** Thread list entries represent guests/reservations, not channels. One entry per guest regardless of how many channels they've used.
**Why:** Front desk staff think "I need to deal with Emily" not "I need to check my email tab." Validated by Rachel with multiple customers. Design Jam June 2 converged on this independently.
**Rejected:** Channel-first separation (separate Email tab, SMS tab) — this is what the PRD currently says and what Jason built in CC-2344. Rejected because it forces context-switching between views for the same guest.
**Open:** PRD hasn't been updated yet. Jason's tab-based V1 is already shipped. Frame as V2 evolution, not V1 replacement.

## Channel Selector at Thread Level
**Decision:** Channels are selectable within the thread view (not as top-level inbox tabs). Default to SMS. Staff switch channels deliberately.
**Why:** Keeps the thread list unified. Composer and message feed adapt to the selected channel. Avoids multiplying top-level tabs.
**Rejected:** Top-level channel tabs (PRD approach) — creates separate inboxes. Also rejected: "view all channels mixed" as default — too noisy, resembles the Akia problem.
**Open:** Exact component for channel switching doesn't exist in Canary UI — needs formal proposal per Amanda's June 4 guidance.

## Channel Selector Position: Below Header
**Decision:** Channel selector lives in its own row below the thread header, not in the header itself or above the composer.
**Why:** Header was too crowded with 5 channels + Archive + info + menu. Design Jam June 2 and Jake June 3 meeting both landed on channels in the header area. "Above composer" position lost — HubSpot does this but team preferred header proximity.
**Rejected:** In the header row (too complex at 5 channels). Above the composer (Design Jam and Jake meeting landed on header area).
**Open:** None.

## Channel Selector Style: Small Tabs (not dropdown, not chips)
**Decision:** Leaning toward small tab-like buttons that look visually distinct from top-level tabs to establish hierarchy.
**Why:** Dropdown hides unread counts — you'd have to open it to see which channels have activity (flagged at Design Jam June 2). Chips feel like filters, not navigation.
**Rejected:** Dropdown (hides unreads). Chips (feels like filtering). Akia's graying out approach (confusing — Rachel: "I think akia is doing it wrong").
**Open:** Exact visual treatment TBD in Figma. Must not look like top-level tabs. Prototype has 3 variants for comparison (pills, dropdown, icon-tabs).

## V1 Channel Grouping: SMS, WhatsApp, OTA, Email
**Decision:** Group Booking.com + Expedia into a single "OTA" bucket for V1. Four channels total.
**Why:** Simplifies the selector. Separate OTA channels can come later if needed. Agreed between Rachel and Miguel (June 2).
**Rejected:** Showing all 5+ channels separately (pills break at that count — prototype proved this visually).
**Open:** WeChat, FB Messenger, Apple Business Messages may come later — scalability still a consideration.

## No Subject Line in Email Composer
**Decision:** Email composer has no subject field. Just adapts the send button ("Send via Email") and placeholder text.
**Why:** First phase is replying to guest journey emails, not composing new threads. Subject is inherited from the email being replied to.
**Rejected:** Subject line input (both inline and full variants were built and tested, then removed).
**Open:** None for V1. May revisit if/when compose-new-email is supported.

## Notification: Auto-Open to Notified Channel
**Decision:** When selecting an unread thread, auto-open to the channel with the unread notification. Priority tier: SMS > WhatsApp > Email.
**Why:** Red dot on thread list is sufficient for "something needs attention." Once you click in, the system should take you to the right channel. Priority reflects messaging urgency norms.
**Rejected:** Channel badges on thread list items (unnecessary — red dot is enough). Manual channel discovery (poor UX for time-pressed front desk staff).
**Open:** None.

## Archive Stays Top-Level
**Decision:** Archive button remains in the thread header as a top-level action, not buried in the 3-dot menu.
**Why:** Miguel: "Moving Archive to 3 dot is most likely a no go, used often as top level by hotel users."
**Rejected:** Moving Archive to overflow menu.
**Open:** None.

## Email Composer: Text-Only, Reply-Only
**Decision:** No rich text editor, no HTML rendering for compose, no attachments in V1. SJ approved.
**Why:** Scope control — explicitly not building Outlook. PRD non-goal: "Replace hotel email clients entirely." Risk register flags "scope creep toward full email client" as high severity.
**Rejected:** Rich text / HTML compose. The "Rich Compose" prototype variant (with formatting toolbar) was built for exploration but the team direction is text-only.
**Open:** None for V1.

## Layout Convergence: Conversation/Broadcast Down One Level
**Decision:** Conversation and Broadcast are no longer top-level tabs. Inbox/Archived/Blocked become dropdown filters in the guest list column. Channels as tabs under guest thread header.
**Why:** Design Jam June 2 — Miguel and Wenjun independently arrived at the same paradigm. Frees up top-level nav space. Creates cleaner hierarchy.
**Rejected:** Current layout (Conversations | Broadcast | AI Answers as top-level tabs with Inbox/Archived/Blocked as sub-pills).
**Open:** Exact implementation in Figma TBD.

## Proceed Without SJ Approval on Side Panel
**Decision:** Kevin gave green light (June 4) to proceed with side panel design without waiting for SJ's sign-off. ~10 people aligned on the direction.
**Why:** SJ's overlay pivot (June 3) threatened to block progress. Team pushed back that power users can't work from a popup. Kevin unblocked by authorizing the team to act as "informed decision makers."
**Rejected:** SJ's "ever-present bottom-left overlay" for messaging (too constraining for staff who live in messaging all day).
**Open:** SJ may still push back. Strategy: bring engineers (Sudarshan + Matias) into next SJ conversation.
