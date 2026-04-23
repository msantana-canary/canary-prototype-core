# Check-In Flow Configurator

> A simplified explanation of what we're building and why. Written for
> a fresh-eyes audience — teams, exec review, anyone not already deep in
> the weeds with Vibhor and me.
>
> Based on the Apr 21 design session with Vibhor + Leandro.

---

## The problem

Every Canary hotel has a slightly different check-in experience, and we've built each one by hand.

- **Italian hotels** need nationality-gated ID collection — Alloggiati requires it by law.
- **Singapore hotels** need to register every stay with the Singapore Tourism Board.
- **Wyndham properties** get ENCODE fraud checks as a brand perk; Best Westerns don't.
- **Japanese hotels** will soon need us to collect a family-registration document for spouses sharing a room.

Every one of these is an engineering ticket today. When a new region joins, or a brand changes vendors, or a hotel asks for "can we add estimated arrival time to the registration card?", it goes through product → engineering → ship. CS can't help the hotel directly. And the check-in code has become a growing pile of if-statements per country, brand, and rate plan.

**This doesn't scale.**

## The insight

> _"Everything is a form."_
> — Vibhor, four minutes in

Every step of a check-in flow is just a form that collects data points for the PMS.

- Registration card? Form.
- OCR scan? Also a form — it's auto-populating fields, but the fields it populates are the same reg-card fields.
- ID consent? A little form: heading, body, an acknowledgment checkbox, a CTA.
- Credit card? Form with specialized UX.
- Loyalty welcome, upsells, accompanying-guest collection, the final "all set" screen? All forms.

And a check-in flow is just an **ordered list of forms**. Different surfaces (web, mobile, tablet reg, kiosk) can have different lists. Some sub-flows (upsells, mobile key, accompanying-guest) are themselves complete flows that slot into multiple main flows by reference — we don't redraw upsells for each surface.

That's the entire mental model.

## What changes

| Before | After |
|---|---|
| Engineering hard-codes each hotel's flow | CS assembles the flow from a catalog of form templates |
| "Add estimated arrival time to the reg card" is a ticket | CS drags a field into the reg card in the manage app |
| Italian ID rules live in a switch statement | CS attaches `if nationality = IT` to an ID option, done |
| Country requirements are code branches | Country requirements are default flow configurations |
| New region = new release | New region = new default picked up automatically |

Engineering's role inverts. We don't code per-hotel; we maintain two catalogs: **form templates** and **condition parameters**. When CS hits something the catalogs can't express — "we need to collect a document specific to Japan" or "we need to condition on rate plan" — _that's_ the engineering ask, and it ships for everyone at once.

## How it works

Three layers, top to bottom:

**1. Property-level feature flags.** What has this hotel purchased or enabled? (Check-in, kiosks, ID verification, OCR, deposit collection, upsells, mobile key, loyalty program, regional compliance.) Think Django admin. Set by CS at onboarding, mostly driven by the Salesforce contract.

**2. A default flow, auto-generated from flags + country + brand.**
- Italian hotel → Alloggiati step appears, driver's license is gated to Italian nationals.
- Singapore hotel → STB step appears.
- Wyndham → ID verification uses ENCODE provider.
- US independent → generic baseline.

CS never starts from a blank page.

**3. The configurator itself.** CS browses the property's flows, clicks a step, edits. Drag to reorder. Add a field to the reg card. Toggle a step as skippable. Attach a show/hide condition. Change ID consent language. A live phone preview updates as they edit.

## The four primitives

- **Schema-form step.** Build any form by composing fields from a catalog (text, email, phone, date, country, signature, dropdown, etc.). Attach a _semantic tag_ to each field to map it to a PMS property — that's how we know this field is `guest.email` and can skip it on subsequent surfaces if it's already filled. Registration card and OCR are the two main schema-form steps today; anyone can make more.

- **Preset step.** Specialized templatized forms with domain-specific UX: credit card capture, ID consent, ID verification, deposit collection. Configured via copy and toggles rather than field edits. Engineering adds preset types; CS picks from the list.

- **Nested flow step.** A reference to another flow. At this point, the guest enters Upsells / Mobile Key / Accompanying Guest, completes it, then returns. Sub-flows are reused — upsells is configured once and slots into web, mobile, and kiosk main flows alike.

- **Condition.** A simple show/hide rule that can attach at the step level, the field level, or (for dropdowns) the individual-option level. Parameters start with nationality, age, and loyalty — engineering adds more as CS needs them.

## Who uses it (and when)

**CS team, full access.** This is a CS tool first. They configure any property's flows, add and remove steps, edit reg-card fields, attach conditions, adjust consent copy. Lives in the manage app.

**Hotels, later, read-only-ish.** Eventually hotels will see their own flows and be allowed to edit a small whitelist — consent language, a few other copy-level things. Structural changes stay CS-only for a long time. Nobody expects hotels to build a reg card from scratch.

**Design intent:** built in manage today, but designed as if it will move to the Canary dashboard later. The UI should feel production-quality from day one.

## What this prototype shows

- Statler NY as the sample property, with Web and Mobile check-in flows
- Drag-drop step list; add/remove steps from a picker filtered by the property's feature flags
- Schema-form field builder for the reg card (drag-drop fields, per-field config, semantic tags)
- Preset editors for ID consent (multi-language copy) and ID capture (ID type options)
- **One example of nationality-gated conditional logic**: driver's license only shown to Italian nationals, demonstrated by flipping the simulated guest's nationality in the preview
- Live PhoneFrame preview that reflects configuration changes immediately
- Upsells shown as a nested-flow reference to prove the composability pattern

## What's explicitly deferred

Per Vibhor's guidance — _"we build based on what we know, let the edge cases come to us"_:

- Kiosk and tablet-reg surfaces (known to be structurally different from web/mobile; out of MVP)
- Richer conditional logic beyond show/hide (AND/OR groups, more operators — later)
- Step reordering with constraints (can't put ID collection before nationality, etc.)
- Cross-surface checkpoints (data carry-over is opinionated engineering, not configurable)
- Hotel-side editing permissions
- Accompanying-guest loops, group-reservation assignment, guest-profile recognition (mentioned as flow-level nested patterns, not implemented in this pass)
- Backend persistence (this is a prototype)

These are all mentioned in the design so engineering can see the trajectory. None of them ship in the first build.

## The pitch in one sentence

The check-in flow stops being a product we ship and starts being a configuration CS manages — engineering only gets involved when we need to invent a new primitive, not for every hotel.

---

*Last updated: 2026-04-23.*
*Source of truth for design direction: the Apr 21 Vibhor/Leandro/Miguel session transcript.*
