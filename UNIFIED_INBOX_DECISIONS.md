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

## Compact Inbox Header over Full-Width SubNav
**Decision:** Collapse Inbox/Archived/Blocked + filter + search + compose into a compact header above the thread list column, replacing the full-width SubNav bar.
**Why:** Reclaims vertical space for the conversation area. Conversation/Broadcast moving down one level (Design Jam June 2). Vaporware and team-chat branches already proved the pattern.
**Rejected:** Keeping the full-width SubNav (wastes vertical space). Prototype has a toggle to compare both.
**Open:** None — both variants available for demo.

## Inbox/Archived/Blocked as Dropdown (not pills)
**Decision:** Use CanarySelect compact dropdown for mailbox switching instead of horizontal pills.
**Why:** Miguel: dropdown is extensible for future custom inboxes beyond just Inbox/Archived/Blocked. Saves horizontal space.
**Rejected:** Horizontal pills (team-chat branch pattern) — limited scalability.
**Open:** None.

## Search Collapsed to Icon Button
**Decision:** Search bar hidden by default, revealed by icon click with two variants (slide-down, takeover).
**Why:** Search bar sitting empty 95% of the time wastes space. Same click count (click icon → type = click field → type). Validated: messaging is async, not high-urgency scan-time-critical.
**Rejected:** Always-visible search bar (wastes space for a fallback action).
**Open:** None.

## Channel Tabs as CanaryTabs Text Underline (not pills/dropdown/icon-tabs)
**Decision:** Use CanaryTabs with variant="text" and size="compact" for channel switching, with badge counts for unreads.
**Why:** Design Jam June 2 landed on "smaller tabs that look visually different from top-level tabs." Text underline fits. Badges show unread counts per channel without extra clicks.
**Rejected:** Old pills variant (crowded at 5 channels). Dropdown (hides unread counts — flagged at Design Jam). Icon tabs (relies on icon recognition).
**Open:** Component doesn't exist in Canary UI design system — needs formal proposal per Amanda's June 4 guidance.

## SMS Default, Not "All Channels"
**Decision:** Default to SMS when opening a thread. Do not show all channels mixed chronologically.
**Why:** Miguel: "It doesn't make sense to arbitrarily bundle ALL messages from ALL channels together when there are clearly DIFFERENT use cases. They're HOTEL guests. THAT'S the delta. We're not a generic comms product." SMS is the primary in-stay channel. Mixing pre-stay OTA with mid-stay SMS creates noise.
**Rejected:** "All" as default (Intercom pattern) — applies to generic helpdesk, not hotel communication where channels serve distinct journey phases.
**Open:** Reinforced. Do not revisit without new hotel-specific evidence.

## Email Thread Selector as CanarySelect (for now)
**Decision:** Use CanarySelect dropdown for switching between email threads within a guest. Full-width, compact size, below Email tab.
**Why:** Design system compliance. Long email subjects need full-width text, not chips. Works for 1-4 threads.
**Rejected:** Custom dropdown (Miguel: "custom component is not how we do things"). Chips/pills (email subjects too long to truncate meaningfully, would be yet another custom component).
**Open:** Competitive research shows NO product uses a dropdown for this. Intercom/Front use separate list items + sidebar "Recent Conversations." The dropdown works for the prototype but may not be the final Figma solution. Needs further design thinking.

## Email Thread Filtering by emailThreadId
**Decision:** Each email Message has an emailThreadId field linking it to a specific EmailThread. Filtering uses this ID, not array slicing.
**Why:** Old slice(0,3)/slice(3) hack broke when Fatima grew to 4 email threads. Proper ID-based association is robust regardless of thread count.
**Rejected:** Position-based slicing (fragile, hardcoded).
**Open:** None.

## Reply-Oriented Email Composer
**Decision:** Email composer shows "Reply to this email..." placeholder and "Reply" button. No subject line field.
**Why:** V1 is reply-only per PRD. Staff are responding to guest journey emails, not composing new ones. Matches PRD spec.
**Rejected:** "Compose email..." / "Send via Email" (implies compose-new, not reply).
**Open:** PRD says subject should auto-fill as read-only "Re: [last subject]" — not yet implemented. Consider adding when email thread selector is refined.
