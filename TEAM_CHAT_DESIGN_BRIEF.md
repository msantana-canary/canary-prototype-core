# Team Chat — Design Brief (for Claude Design)

> Paste this whole file as your prompt. It's self-contained — design from it directly.

## The ask
Design **Team Chat**: an internal staff coordination layer that lives *inside* Canary's hotel-operations web dashboard (alongside Check-in, Checkout, Messaging, Upsells, Authorizations, etc.). Desktop, **1440px-first**. Produce the entry point, the panel, and how it coexists with the product pages underneath.

## Product thesis (read first — it shapes everything)
This is a **coordination layer, not a chat app.** It must NOT try to out-feature WhatsApp/Slack on messaging. Its entire reason to exist is that it **knows about Canary objects** — guests, reservations, service tickets, upsells — and lets staff coordinate *with that context attached*. If you design "a chat tab," you've missed it. Design "the place hotel staff coordinate about the guest/room/ticket they're already looking at."

## Who it's for (from real discovery calls)
- **Large hotel (Garden City):** many **department groups** (front desk, housekeeping, valet, maintenance, concierge). Live, fast. Loves read receipts ("you saw this at 10:49"). Today: WhatsApp + radio. Staff float around → mobile matters (but v0 is desktop).
- **Select-service hotel (HIE Spring Hill):** one **shared daily log** everyone appends to (in OneNote today) — cadenced, not live; searchable; an operational record. Behavior is closer to a logbook than a chat.
- So the product must serve **both**: live department group chat AND a cadenced shared log.

## Where it lives / entry
A **global header pill** (in the app-shell header, beside the user profile) that opens a **slide-in panel**, reachable from *every* product without leaving the current screen. It's one consistent thing everywhere (and potentially its own SKU) — NOT a per-product feature.

## The hard constraint (the core design problem)
At **1440px**, product pages already show a **list + detail** layout, and some (Messaging) have their own **right-hand context panel** (guest info). Adding a chat panel risks a 3–4 panel squeeze. The real tension: the panel's value is "reference the guest's details *while* coordinating," but that's exactly what blows the width budget. **This is the main thing to solve.** Explore container models:
- **Overlay** — floats on top, reflows nothing, but covers content.
- **Shell gutter / push** — page reflows into a narrower viewport.
- **Collapse the nav to an icon rail** to reclaim width when the panel opens.
- Possibly: the panel shares the product's right-rail slot (tabbed) rather than adding a 4th column.
Show how it behaves when a product's own detail panel is also open. Optimize for the common case; the simultaneous case can degrade gracefully.

## Decisions already made (don't redesign these)
- **Group-list-first IA:** open → list of groups (with unread/last-message) → tap → thread → back. Not a dropdown.
- **Flat thread** rendering (Slack/Teams style, dense, scannable as a log) — NOT alternating chat bubbles.
- **Object cards** dropped into messages are the differentiator (guest/reservation/ticket as a compact card with one action). [v1, but design them.]
- **Passive read receipts** ("Seen by N") — no explicit "confirm you've seen this" button (redundant).
- Rejected: right-rail-only, persistent footer bar.

## The command-center vision (design the hero moment)
AI auto-posts to the right staff group when an operational event happens (VIP check-in, new service ticket, upsell). The strongest single idea: a **"Suggested Team Chat Post"** that appears *inside the guest conversation* — AI detects "guest's flight is delayed" → one-tap **"Post to Front Desk."** Coordination originates at the trigger, where the human already is.

## Scope
- **v0 (desktop, text-first):** the panel, group list, flat thread, the entry pill, the container behavior. Table-stakes to feel real: @mentions, attachments (images), search, per-group mute, on-shift presence.
- **v1 (the wedge):** object cards in messages; the service-ticket loop (guest text → AI ticket → posts to dept group → claim/resolve → status syncs → replaces the radio); the suggested-post; the cadenced shift-handover/daily-log mode.

## Design system & style
Canary uses **`@canary-ui/components`** (Roboto, MDI **outline** icons, design-system color tokens — primary blue `colorBlueDark1` ≈ #2858C4). Bias toward **compact, dense, low-chrome** UI (no unnecessary collapsibles or clicks). Copy should be human- and hotelier-readable.

## Deliverables
1. The **entry pill** + open/close states.
2. The **panel**: group-list view → thread view (flat) → composer, at 1440px.
3. An **object card** in a message (guest + reservation).
4. The **container behavior** over a dense product page (check-in or messaging) — your recommended model for the 1440px squeeze, with rationale.
5. The **"Suggested Team Chat Post"** moment in a guest thread.

## Reference products (for patterns, not to copy)
Intercom (object cards + tabbed context rail), Slack (single right-panel slot, canvas), Front (internal comments vs. discussions), Salesforce Lightning Utility Bar (global docked launcher), Deputy / Beekeeper (frontline ops comms), Hotelkit / Quore (hospitality: live messenger + structured handover), 7shifts Log Book (day-scoped topic-card log).
