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

## OTA Channel Merge (V1)
**Decision:** Booking.com and Expedia collapse into a single "OTA" channel/tab.
**Why:** From the Rachel conversation, OTAs are unified first. Prototype shouldn't over-model the immediate term. Miguel: "It'll be broken up down the line but this is a prototype so we should worry about the immediate term."
**Rejected:** Separate Booking.com and Expedia tabs (premature; crowds the tab row).
**Open:** Will split per-OTA later in production.

## Three Email-View Variants (toggleable)
**Decision:** Email-thread display becomes a togglable prototype variant with three options — Dropdown, List→drill-in, Unified chronological. Built so the team can compare before Figma.
**Why:** The email-thread-selection UX is the most unresolved part. Competitive research (Mobbin: Intercom/Front/Zendesk/Plain) showed NO product uses a dropdown — all use a list of threads. Rather than guess, build all three and judge live.
**Variant 1 (Dropdown):** CanarySelect below Email tab. Built. Works but not industry-validated.
**Variant 2 (List→drill-in):** Email tab opens to a list of threads (subject + preview + timestamp + unread dot); click opens conversation + composer; "← All emails" back link; single thread skips the list; re-entry lands on the list. Industry-standard pattern. Email is inherently a list-of-threads medium; SMS/WhatsApp/OTA are single streams — email opening to a list reinforces it's a different kind of channel (hotel-context point).
**Variant 3 (Unified chronological):** All emails in one stream, grouped by subject headers, GJ-automated sends badged `GUEST JOURNEY`, click-any-bubble to set reply target, composer shows "Replying to: [Subject]" and is inert until a target is picked. Does NOT violate the no-mixing-channels principle — mixes subjects within one channel, not channels. GJ-marking is a hotel-specific insight (lots of guest "email" is automated GJ noise).
**Rejected:** Picking one approach blind. Chips for the dropdown (subjects too long; would be a custom component). "All channels" merged default (Miguel: hotel channels serve distinct journey phases — that was a separate, firmly-held decision).
**Open:** BUILT + browser-tested 2026-06-10 (all three variants, Fatima showcase). Reply-target uses click-to-select (Miguel chose over per-group Reply button). Dropdown now explicitly defaults to the first thread (was showing all emails while the select displayed the first subject — inconsistency fixed). Cosmetic nit: dropdown labels render "Re: Re: …" when a subject already starts with "Re:".

## Two-Tab Channel Mode: Messages + Email (comparison variant)
**Decision:** A fourth toggle dimension ("Channel Tabs": Per-channel / Two-tab). In two-tab mode there are only two tabs — **Messages** and **Email**. Messages = every non-email channel (SMS, WhatsApp, OTA) interleaved chronologically, with the per-bubble channel label providing attribution. Combined unread badge across the three channels. The send channel defaults to wherever the conversation last happened; clicking any bubble switches the send channel to that bubble's channel (consistent with unified email's click-to-select). The Email tab composes with whichever email-view variant is active.
**Why:** Miguel requested it (2026-06-10) as a live comparison: the industry-dominant interleave pattern, minus email. Email stays separate because it's the one channel that's inherently thread-structured; everything else is a single stream.
**Copy:** "Messages" chosen for the merged tab (Miguel deferred copy, suggested "Messaging" as placeholder). Hotelier-readable: front desk staff say "did you message the guest?" — message = text/WhatsApp/OTA chat. Rejected "Messaging" (reads like a product category, not a tab) and "Chat" (less collision with the page title, but not the word staff use).
**Tension noted:** Merging SMS/WhatsApp/OTA chronologically is the "All channels mixed" pattern that SMS Default, Not "All Channels" rejected — minus email. Built as a deliberate pressure-test toggle, NOT a reversal of that decision. Per-channel mode remains the default.
**Rejected:** A channel picker widget in the composer (another custom component; click-to-select is cheaper and consistent). Making two-tab the default.
**Open:** Whether click-a-bubble-to-switch-send-channel is discoverable enough. Whether this variant survives Miguel's own SMS-Default reasoning once clicked through.

## Interleaved Email Threads in the Unified View (stress test + focus-on-select)
**Decision:** The "one unexplored option" from the Miguel/Rachel 2026-06-10 sync = the unified email view exercised with email threads that genuinely interleave in time — strictly chronological by message, click-to-select reply target. Two parts:
1. **Stress-test data:** John Smith (thread 14, group coordinator) now has 3 email threads whose 12 messages interweave across Mar 10–14 (Room Block w/ GJ confirmation · Direct Billing, ends unanswered · Meeting Room). Renders as 8 subject headers over 12 messages — the "switch, switch, switch" case made real. Fatima (cleanly sequential threads) untouched — she remains tomorrow's tidy showcase; John is the messy one.
2. **Focus-on-select rendering (Miguel delegated the UX call):** run-boundary subject headers stay (adaptive: long runs = one header, interleaves = header per switch — honest about fragmentation). Headers are clickable as reply targets. Once a target is picked, all other threads' bubbles + headers dim to 50% opacity, so the chosen conversation reads as one continuous thread *through* the interleave. This is the answer to "what makes this different from the list?" — chronological for scanning recency, focused like a thread view at the moment of reply, one surface.
**Why:** The meeting's open question — "do we organize the threads chronologically or the emails chronologically… is it constantly breaking up?" — could not be evaluated on sequential mock data. Per-bubble dimming at selection time addresses the thrash exactly when the user commits to a conversation, without permanent color-coding (rejected before: "doesn't need to be too obvious").
**Superseded misbuild (same day):** An all-channels-in-one "Single stream" mode (email interleaved with SMS/WhatsApp/OTA, no tabs) was built on a misreading of this ask and reverted at Miguel's direction (commits 11e3be25 → reverted cf8b1a87). One piece was salvaged deliberately: sent email replies now carry the reply target's emailThreadId, fixing subject-less replies in the unified view.
**Rejected:** Per-bubble subject labels (redundant within runs; noisier than headers + dimming). Thread-grouped ordering (violates the chronological requirement; collapses into the List variant). Permanent per-thread color accents.
**Open:** ANSWERED same day — see Email View Verdict below. The stress test did its job: Jake's interleave objection was visible within minutes of looking at John's thread.

## Email View Verdict: Unified Rejected, List Front-Runner (group review, 2026-06-10)
**Decision:** After Jake + Rachel reviewed the live prototype (Slack, ~2:30 PM), the **Unified chronological email view is rejected**. **List→drill-in is the front-runner**, not yet finalized.
**Why Unified died (four stacked reasons):**
1. **Miguel's principled kill — email is context-based, not chronological.** "Email threads are not read in a chronological message by message thing, they're CONTEXT based… chronological order is irrelevant, convo context is in email." Chronology is a *messaging-channel* property — this is the Honda Civic/BMW distinction applied one level deeper, and it strengthens the email-as-separate-channel argument.
2. **Jake — scroll cost:** "I'd have to scroll so much to find other threads."
3. **Jake — pattern break:** interleaved A→B→A forces skipping over thread B to follow thread A; "the other two mimic how people already think about email. That'd break a big pattern." / "List looks the most like email — if it ain't broke don't fix."
4. **Rachel — implementation risk:** multiple convos in one stream "might also cause more bugs too."
**Why List over Dropdown:** Rachel: "one less click to look at all of ur threads." Jake's only pro-dropdown point (port the last-message preview into the dropdown) still hides thread inventory + unread state behind a click — the exact dropdown weakness flagged at Design Jam June 2 — and Mobbin research found 0/7 products using a dropdown. List also carries the hotel-context rationale: email opening to a list reinforces it's a different kind of channel.
**Rejected:** Unified (above). Dropdown-with-preview (Jake's patch — keeps the hide-behind-a-click problem; noted in case it resurfaces).
**Open:**
- ~~PENDING: show or hide the Unified variant to SJ tomorrow~~ — RESOLVED 2026-06-11: Miguel: "Unified sux so get it out." Removed from the variant panel before the SJ demo (code dormant, not deleted).
- List not formally locked — Miguel hasn't declared final; Jake also accepts dropdown. New contender: Dropdown Rich (below).
- **CC question (Jake):** what happens when a guest CCs someone — reply-all behavior, thread participants, what staff see. Joked away in Slack but it's a real spec gap → belongs in DSN-1775 / PRD.
- Jake's List polish ideas from yesterday's look: table-like framing, red dot for unanswered emails (dot already built).

## Dropdown Rich: Jake's Pretty-and-Simple Hybrid (built for the SJ demo, 2026-06-11)
**Decision:** Third email-view toggle option, **Dropdown rich** — collapsed it reads like a compact CanarySelect (one line, current subject, chevron, small unread-count badge); open, it shows the List view's exact row anatomy (subject + last-message preview + timestamp + unread dot, reverse-chron, current selection highlighted). Selection semantics identical to plain Dropdown (filters the feed, defaults to first thread). Unified simultaneously pulled from the panel per Miguel's call.
**Why:** Jake (Slack, morning of SJ demo): "what if we made the dropdown slightly prettier to merge pretty & simple?" — Miguel's framing of the bet: a new pattern either gets pinned ("that's not in our system") or greenlit. Built as a *toggle* rather than a replacement so the choice happens in the room: open with the safe plain dropdown (demo default), flip to rich if SJ pins on ugly/simple. SJ concedes to prototypes — carrying both is predict-and-prepare. The "not in our system" exposure is shared with the channel tabs, which already need Amanda's formal component proposal.
**Also fixed:** plain dropdown's "Re: Re:" double-prefix (guards subjects already starting with "Re:").
**Rejected:** Replacing the plain dropdown outright (no fallback in the room). Skipping the hybrid (leaves Jake's idea untested on the one day SJ is looking).
**Open:** SJ's reaction today decides its fate. If List still wins, the rich rows port over anyway — they ARE the List rows in a popover, so nothing is wasted. Demo defaults: per-channel tabs + plain Dropdown.
**Polish round (Miguel, same day — "I love it" + 3 tweaks):** (1) trigger is a full-bleed row in the header unit, not a select-style control — panel drops full-width beneath it; (2) 160ms ease-out open animation + chevron rotation; (3) "Demo Data → Unread email" toggle in the variant panel marks the latest email thread unread across the rich dropdown (badge + dot), List view, and Email tab badge — lets the unread treatment be shown on demand in the room. Side-effect of the demo toggle: the plain Dropdown shows NO unread affordance with it on — live illustration of the dropdown weakness flagged at Design Jam.

## Email Goes Top-Level (SJ pivot, 2026-06-11 design review)
**Decision:** Email leaves the messaging surface entirely. It becomes its **own top-level tab** alongside Conversations and Broadcasts — NOT a channel tab nested under a guest thread. Within it, email is organized **by thread, like Gmail — not by guest**; the guest is attached via a side panel. Proposed shape: **three-panel layout** — thread list → conversation → associated guest (with a jump link to their DMs in Conversations). Rachel is designing this as a new prototype.
**Why — SJ's dilution argument (10:30 review, he joined early):**
- Only **~5–6% of reservations** actively use guest messaging. Web-chat customers already receive more web chats than guest messages. Add email and it likely becomes the **highest-volume inbound channel** — pushing guest messages (the intimate, paying-guest channel, one of Canary's fastest-growing products) to the bottom of the list. Staff stop finding value in guest messaging if the inbox is dominated by email.
- **"Unified is a positive word"** — stated preference for a unified inbox doesn't reflect real behavior; if people truly wanted everything in one place, a winning product would already exist (his Notion/Slack/Gmail portal test).
- Email is also uniquely spam-susceptible; web chat is always a real inquiry about the hotel's most important thing — a booking.
**Why this is NOT a full loop back to the PRD** (Rachel: "that's what we had at the beginning, no?" — "you loop around the track"): the Email-Is-A-Different-Vehicle principle (Honda Civic/BMW) won so completely it got promoted from channel-tab level to top-level surface. Miguel's framing in the room: stop shoehorning email features into the messaging layout — Conversations = fast/instant, Email = slow/async; a fully email-first design. **The Guest-First Thread Model survives untouched for instant channels** — SJ's argument evicted email, not the unified guest view. And the List paradigm (yesterday's verdict winner) becomes the new tab's left pane — the EmailThreadList row anatomy ports directly.
**Technical decisions made in the room:**
- **Auto-link guests by actual sender address ONLY** — never a self-reported email field (Rachel's anti-spoofing rule, same principle as phone-number auto-linking). Personal-vs-work email edge case acknowledged; shared phone number helps deduplicate.
- **Keep it simple for V1:** no inbox/blocked/archived categorization for email.
- **Search:** both content and guest search; pair with the Q3 messaging content-search work.
**Superseded by this:** the email-inside-messaging surface — Channel Selector at Thread Level (for email), Three Email-View Variants, Dropdown Rich, and the Email half of Two-Tab Channel Mode are superseded as email's home (the thread-row/drill-in UX ports to the new surface). The 2:30 demo defaults discussed earlier today are moot.
**Open / validation gates:**
- SJ to validate his own assumption: what % of inbound emails are actually guest-related.
- Team to ask **~3 users who actively use both web chat and messaging** whether they want them combined — leading question framed the *opposite* way (SJ's own methodology). Terry/Monica candidates; Mitsis explicitly a bad pick.
- Whether **web chat stays under Conversations** is open.
- Rachel designing the top-level email prototype; old prototype to be sent to Jake.
- "Conversations" may need relabeling ("Messages and Email" / fast-vs-slow framing floated, mostly in jest).
- PRD + eng design doc now stale in a NEW direction (they said separate tabs *under* messaging; reality is now separate *surface*).
- Status: direction logged, prototype untouched — Miguel deciding next steps later.

## Email Surface V1 (built 2026-06-12, branch prototype/email-top-level)
**Decision:** The top-level Email tab, built bare/simple — **two panes, 3-panel suspended** (guest panel deferred; linked guest lives as a compact strip in the thread header instead). New branch + worktree; the unified-inbox branch/URL is frozen as the historical prototype.
**Shape:**
- **Inbox/Sent direction split, not triage** (the inbound-vs-outbound discussion): Inbox = threads with ≥1 inbound; Sent = outbound-only (GJ machine output + unanswered staff sends). A guest reply *promotes* Sent → Inbox. Rationale: one mixed list recreates SJ's dilution argument in miniature (GJ sends go to every acknowledged reservation; replies come from few), and hiding outbound kills audit + the only proactive workflow reply-only V1 has. Lives in the **compact header** (CanarySelect dropdown + collapsed search icon) — the messaging compact-header pattern, introduced to a second surface exactly as Miguel's "wedge" framing intended.
- **Counts as the SJ readout:** dropdown reads `Inbox (11) / Sent (4)`; within Inbox, linked rows show guest names, unlinked show raw senders (8 vs 3 in mock) — the "% of inbound that's guest-related" question made visible, no chart.
- **Read pane = Gmail register, NOT bubbles** (Miguel's spec from the 6/11 review: "delineated by lines… like Gmail"). Flat full-width email blocks per team-chat's FlatMessage anatomy, hairline-separated. Email should *feel* slower than Conversations on sight.
- **Auto-link by sender address**: linked threads carry guest strip (name + room/dates + "Open conversation" jump into Conversations). GJ threads always linked (GJ only sends to acknowledged reservations — Miguel, to verify in production code). Manual linking skipped for V1.
- **CC display-only, guest-side** (wedding inquirer CCs her partner) — plants Jake's CC question in the UI without designing the answer.
- **Deliberately absent:** compose button (reply-only V1 — not rebuilding Outlook), folders beyond the direction split, rich text. Search icon is a non-functional placeholder pairing with Q3 content search.
- Conversations stripped to SMS/WhatsApp/OTA; variant panel pruned (email-view + channel-tab sections removed; "unread" demo toggle now simulates on the Email tab's Inbox).
- **Polish round (same day):** email composer simplified to attachment + Reply (AI/translate/templates/caret are messaging tooling — stripped on the email surface only); list header brought to exact CompactInboxHeader metrics; **search made functional** — slide-down input filtering BOTH content and guest/sender per the 6/11 "Both" decision (subject, body, guest name, sender name/email).
- **Volume + signal round (same day):** Sent inflated to 14 GJ-only threads vs Inbox 11 — inverted to the realistic automated-outbound ratio (Miguel: "real life we get more outbound than inbound"), so the dropdown counts themselves demo SJ's dilution math. Res-connected threads signified at list level with a muted **bed icon + room number** beside the sender (chosen over guest avatars and reservation tags — hotel-native glyph, compact, operationally useful; unlinked rows simply lack it).
**Open:** 3-panel + guest side panel (suspended, revisit); auto-select opens most recent Inbox thread (no auto-open-unread yet); web-chat-under-Conversations question pending the user validation gates; staff "bump" send in a Sent thread keeps it in Sent (correct but worth a beat in review).

## Conversations Loses Channel Tabs (2026-06-12)
**Decision:** No channel tabs inside Conversations on the email-top-level branch. One chronological stream of SMS/WhatsApp/OTA per guest — matching production, where instant messaging is already unified ("we already have that, so we don't have to build more" — Rachel/Miguel 6/10). Composer auto-targets wherever the conversation last happened; clicking any bubble switches the send channel. Variant chrome (Inbox Layout standard/compact + search variants) deliberately KEPT — the compact header now demos on both the Conversations and Email surfaces.
**Why:** The channel-tab work was the *splitting* experiment, and the split lost twice — once to the unified-instant reality of production, once to the SJ pivot that removed the channel (email) that most needed separating. The frozen unified-inbox branch URL holds every tab iteration for comparison.
**Rejected (parked, not killed):** Jake's thread-list channel filter ("filter your thread list on different channels") — the only remaining channel-navigation concept; has a natural home in the compact header's filter icon if it returns.
**Open:** None for this branch.
