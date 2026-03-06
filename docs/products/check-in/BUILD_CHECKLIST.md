# Check-In Staff Dashboard — Build Checklist

**Priority:** P1 = Must-have for demo, P2 = Nice to have, P3 = Future phase

---

## Phase 1: Data Layer & Types (Foundation)

- [ ] **P1** Expand `SubmissionStatus` to 5 values: `pending`, `partially_submitted`, `submitted`, `verified`, `checked_in`
- [ ] **P1** Update `CheckInSubmission` interface with new fields: `isWalkIn`, `isTabletRegistration`, `isFlagged`, `isNewRegistration`, `isArchived`
- [ ] **P1** Remove separate `Arrival` type — derive right pane data from submissions with `verified`/`checked_in` status
- [ ] **P1** Add `roomType` to canonical `Reservation` type (already has field, populate data)
- [ ] **P1** Expand mock data to ~15-20 submissions across all 5 statuses with realistic variety
- [ ] **P1** Add helper functions: `getSubmissionsBySection()`, `getVerifiedArrivals()`, `getCheckedInToday()`
- [ ] **P2** Add `roomReadyTime` or similar field for future room-readiness display

## Phase 2: Left Pane Refinement

- [ ] **P1** Add "Partial submissions" section between Completed and Pending
- [ ] **P1** Add collapsible "Checked-in" section (collapsed by default, only visible when has items)
- [ ] **P1** Add collapsible "Other" (archived) section (collapsed by default)
- [ ] **P1** Build `CollapsibleSection` component for Checked-in and Other
- [ ] **P1** Update `CheckInListItem` to handle all 5 statuses with correct CTA buttons:
  - `submitted` → "Verify"
  - `partially_submitted` → (no button)
  - `pending` → "Send to Tablet"
  - `checked_in` → "Message"
  - archived → "Message"
- [ ] **P1** Add "Walk-in" tag display (replaces arrival time when `isWalkIn`)
- [ ] **P2** Add verification flag icon on flagged items
- [ ] **P2** Show empty state per section: "No pending reservations"
- [ ] **P3** Wire date selector to filter submissions by date

## Phase 3: Right Pane Refinement

- [ ] **P1** Derive right pane sections from submissions (not separate Arrival data)
- [ ] **P1** Add "Tablet Registration" section (verified + tablet source)
- [ ] **P1** Refine arrival card time display:
  - Today → "2:30 PM"
  - Tomorrow → "Tomorrow"
  - Future → "In N days"
  - Checked in → "In house" tag
- [ ] **P1** Add "New Registration" green tag on applicable cards
- [ ] **P1** Add "Signed" gray tag on tablet submissions
- [ ] **P1** Make Future section collapsible
- [ ] **P2** Add verification flag icon on cards
- [ ] **P2** Add loyalty dog-ear badge on cards
- [ ] **P3** Add mobile key confirmation modal flow

## Phase 4: Interactions

- [ ] **P1** Click submission → highlight in list (selected state)
- [ ] **P2** Click submission → open detail panel (simplified)
- [ ] **P2** "Checked in?" button → moves card to "Checked-in today" section
- [ ] **P2** Search filters left pane submissions by guest name
- [ ] **P3** "Send to Tablet" → visual feedback / toast
- [ ] **P3** "Verify" → opens detail panel at verification section
- [ ] **P3** "Message" → navigates to messaging product

## Phase 5: Detail Panel

- [ ] **P2** Build basic detail panel (slide-in from right or overlay)
- [ ] **P2** Show guest info header: name, photo, reservation details
- [ ] **P2** Show registration card section with "Signed" badge
- [ ] **P3** ID verification section with sample photos
- [ ] **P3** Payment card verification section
- [ ] **P3** Upsells/add-ons section

## Phase 6: Polish

- [ ] **P2** Transition animations when cards move between sections
- [ ] **P2** Section count badges update reactively
- [ ] **P2** Empty states for each section
- [ ] **P3** Export button (decorative or CSV download)
- [ ] **P3** Insights button (decorative)
- [ ] **P3** "New check-in" flow

---

## Build Order (Recommended)

1. **Types + Data** → Foundation everything else builds on
2. **Left pane sections** → Most visible, establishes the information hierarchy
3. **Right pane cards** → Derived from same data, cards need updated fields
4. **Interactions** → Selection, search, basic click handlers
5. **Detail panel** → Separate phase, can demo without it
6. **Polish** → Animations, edge cases, decorative features

---

## Out of Scope (Not Building)

- Guest-facing check-in flow (registration card, ID upload, payment)
- Kiosk workflow engine
- Real PMS integration
- Multi-language support
- Permissions system
- Mobile key actual activation (just visual confirmation)
- Full verification workflow (just show the panel)
