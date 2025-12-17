# Canary Prototype Suite - Planning Document

> This document captures architectural decisions for the Canary prototype ecosystem.
> Last updated: 2024-12-17

---

## 1. Purpose

The Canary Prototype Suite serves two goals:

1. **Customer demos** - Polished, realistic product demos that look exactly like the real Canary product
2. **PM/Designer testing** - Test new features "in-product" instead of guesswork through Figma

This is NOT for:
- Production use
- Actual customer data
- Engineering development

---

## 2. The Problem

Canary has **12+ products** that need prototyping:

**Main Section:**
- Upsells
- Check-in
- Checkout
- Messages ✅ (built)
- Calls
- Digital Tips

**Secondary Section:**
- Authorizations
- Contracts
- ID Verification
- Clients on File
- Amenities
- Payment Links

**Plus:** Settings

### Challenges:
- Products share data (same guest appears in Messages, Check-in, Upsells)
- PMs need to experiment without breaking the stable prototype
- Most PMs are non-technical
- Need consistent UI that matches real product (unlike v0/Figma Make)

---

## 3. Architecture Decision: Library Model

### Decision
Publish the prototype foundation as an **npm package** that PMs install in their own projects.

### Why not other approaches?

| Approach | Rejected because |
|----------|------------------|
| Separate repos per product | No shared data, inconsistent UX |
| Single monorepo (everyone edits) | PMs could break core functionality |
| Fork-based sandboxes | Too much git complexity for non-technical PMs |

### Why library model wins:

1. **Truly idiot-proof** - Core is in `node_modules`, PMs cannot edit it
2. **Clean versioning** - Tag releases (v1.0.0), PMs opt into updates via `npm update`
3. **No git complexity** - PMs don't need forks/branches
4. **Main repo stays clean** - No experimental branches cluttering it
5. **Clear upgrade path** - PMs run `npm update @canary/prototype-core`

---

## 4. Repository Structure

### Main Library (`@canary/prototype-core`)

```
canary-prototype-core/
├── src/
│   ├── core/
│   │   ├── data/                    # 🔒 CANONICAL DATA
│   │   │   ├── guests.ts            # All guest records
│   │   │   ├── reservations.ts      # All reservations
│   │   │   ├── rooms.ts             # Room inventory
│   │   │   └── index.ts
│   │   │
│   │   ├── types/                   # 🔒 CANONICAL TYPES
│   │   │   ├── guest.ts
│   │   │   ├── reservation.ts
│   │   │   ├── room.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/                   # Shared React hooks
│   │   │   ├── useGuest.ts
│   │   │   ├── useReservation.ts
│   │   │   └── index.ts
│   │   │
│   │   └── store/                   # Shared Zustand stores
│   │       └── core-store.ts
│   │
│   ├── components/
│   │   ├── core/                    # Shared UI components
│   │   │   ├── GuestCard.tsx
│   │   │   ├── ReservationDetails.tsx
│   │   │   ├── RoomBadge.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── layout/                  # App shell components
│   │       ├── AppShell.tsx         # Sidebar + header + content area
│   │       └── index.ts
│   │
│   ├── products/                    # Built-out product modules
│   │   ├── messaging/
│   │   │   ├── components/
│   │   │   │   ├── ThreadList.tsx
│   │   │   │   ├── MessageFeed.tsx
│   │   │   │   ├── MessageComposer.tsx
│   │   │   │   └── ...
│   │   │   ├── store.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts             # Public exports
│   │   │
│   │   ├── check-in/                # Future
│   │   └── ...
│   │
│   └── index.ts                     # Main package exports
│
├── package.json
└── README.md
```

### PM's Experiment Project

```
my-upsells-experiment/
├── package.json
│   └── dependencies: { "@canary/prototype-core": "^1.0.0" }
│
├── app/
│   ├── layout.tsx       # Uses AppShell from core
│   └── page.tsx         # Their experimental UI
│
└── components/
    └── MyFeature.tsx    # Custom components using core hooks/data
```

---

## 5. Canonical Data Layer

### Principle
**One guest, consistent everywhere.** Emily Smith in Messages is the same Emily Smith in Check-in.

### Implementation

```typescript
// @canary/prototype-core/src/core/data/guests.ts
export const guests: Record<string, Guest> = {
  'guest-emily': {
    id: 'guest-emily',
    name: 'Emily Smith',
    phone: '+1 (555) 123-4567',
    email: 'emily.smith@email.com',
    tier: 'DIAMOND ELITE',
    tierColor: '#1E3A5F',
  },
  'guest-brooklyn': {
    id: 'guest-brooklyn',
    name: 'Brooklyn Simmons',
    phone: '+1 (555) 234-5678',
    email: 'brooklyn.s@email.com',
    tier: 'GOLD ELITE',
    tierColor: '#8B6914',
  },
  // ... more guests
};

// @canary/prototype-core/src/core/data/reservations.ts
export const reservations: Record<string, Reservation> = {
  'res-emily-nov': {
    id: 'res-emily-nov',
    guestId: 'guest-emily',        // Links to canonical guest
    room: '302',
    checkIn: new Date('2024-11-15'),
    checkOut: new Date('2024-11-18'),
    status: 'checked-in',
    confirmationCode: 'CAN-789456',
  },
  // ... more reservations
};
```

### Usage in any product

```typescript
import { useGuest, useReservation } from '@canary/prototype-core';

function MyComponent() {
  const guest = useGuest('guest-emily');
  const reservation = useReservation('res-emily-nov');

  return <GuestCard guest={guest} reservation={reservation} />;
}
```

---

## 6. PM Workflow

### For quick/early ideas:
1. Use **v0** or **Figma Make** for rapid prototyping
2. Demo to customers
3. If validated → move to next step

### For in-product experimentation:
1. Create new project: `npx create-canary-prototype my-experiment`
2. Scaffolds project with core library installed
3. Build experimental features using core components/data
4. Deploy to Vercel for demo URL
5. Share with customers/stakeholders

### For validated features:
1. PM shares working experiment
2. You (Miguel) or technical PM reviews
3. Reimplement properly in `@canary/prototype-core`
4. Release new version
5. All PMs get update via `npm update`

---

## 7. What's Already Built

### Messaging Product (canary-messaging repo)
- ✅ Thread list with inbox/archive/blocked views
- ✅ Message feed with date separators, typing indicators
- ✅ Message composer with AI toggle
- ✅ Claude AI auto-response integration
- ✅ Guest info sidebar
- ✅ Search and filtering
- ✅ Thread actions (archive, block, mark read/unread)
- ✅ Rich mock data (10+ guests, 40+ messages)

**To be ported** to new `@canary/prototype-core` package.

---

## 8. Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **React:** 19.x
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4.x
- **State:** Zustand
- **UI Library:** @canary-ui/components (internal)
- **AI:** Anthropic SDK (Claude)
- **Icons:** @mdi/react + @mdi/js
- **Dates:** date-fns

---

## 9. Contributor Workflow

### Core Contributors
Three product designers + Miguel build the base products directly in the library.

| Contributor | Products |
|-------------|----------|
| Miguel | Messaging, Check-in, Checkout, Guest Journey, Calls, others |
| Designer A | TBD |
| Designer B | TBD |
| Designer C | TBD |

### How designers contribute:

1. Clone repo
2. Create feature branch (`feature/upsells`, `feature/contracts`, etc.)
3. Work in their product folder (`src/products/[product]/`)
4. Use Claude Code for development (same workflow as Miguel)
5. PR to main when ready
6. Anyone can merge (trust-based)

### Rules:

- **Stay in your folder** → `src/products/[your-product]/`
- **Need shared code changes?** → Ping Miguel (canonical data, core types, shared components)
- **Don't touch other products** → Unless coordinating with that owner

### Folder ownership:

```
src/products/
├── messaging/      ← Miguel
├── check-in/       ← Miguel
├── checkout/       ← Miguel
├── guest-journey/  ← Miguel
├── calls/          ← Miguel
├── upsells/        ← Designer ?
├── contracts/      ← Designer ?
├── digital-tips/   ← Designer ?
└── ...
```

---

## 10. Component Architecture

### Layer separation:

| Layer | Where | Examples |
|-------|-------|----------|
| **Atoms** (generic UI) | `@canary-ui/components` | Button, Input, Tag, Modal |
| **Molecules** (shared) | `prototype-core/components/core/` | GuestCard, ReservationDetails |
| **Molecules/Organisms** (product-specific) | `prototype-core/components/products/[x]/` | ThreadList, MessageFeed |

### The rule:

- **Atomic library stays pure** — Only domain-agnostic UI primitives
- **Start product-specific** — New components go in their product folder
- **Promote when reused** — If Check-in component is needed in Checkout, move to `components/core/`

### Why this approach:

1. Minimizes painful cross-repo iteration (atomic library rarely touched)
2. Most work stays in prototype-core (fast iteration)
3. Clear ownership per product
4. Shared components are explicit (if it's in `core/`, it's shared)

### Folder structure:

```
@canary/prototype-core
├── components/
│   ├── core/                        # Shared across multiple products
│   │   ├── GuestCard.tsx
│   │   ├── ReservationDetails.tsx
│   │   └── RoomBadge.tsx
│   │
│   └── products/                    # Product-specific
│       ├── messaging/
│       │   ├── ThreadList.tsx
│       │   ├── ThreadListItem.tsx
│       │   ├── MessageFeed.tsx
│       │   ├── MessageBubble.tsx
│       │   ├── MessageComposer.tsx
│       │   └── GuestInfoSidebar.tsx
│       ├── check-in/
│       │   └── ...
│       └── checkout/
│           └── ...
```

### Promotion workflow:

```
1. Build GuestArrivalCard in components/products/check-in/
2. Realize Checkout needs it too
3. Move to components/core/GuestArrivalCard.tsx
4. Update imports in both products
```

---

## 11. AI Agent Instructions

### Required Reading for Claude

Before building ANY components or UI in this project, Claude MUST read:

```
/Users/miguelsantana/Documents/Claude-Projects/canary-prototype-foundation/AI_REFERENCE.md
```

This file contains:
- Complete component inventory with correct import paths
- All available enums (ButtonType, InputType, TagColor, etc.)
- Pre-built sidebar tabs (`sidebarTabs.messages`, `sidebarTabs.checkIn`, etc.)
- Color, typography, and spacing tokens
- Icon naming conventions
- Do's and Don'ts

### Key Rules for Claude:

1. **Don't guess component names** — Only use components documented in AI_REFERENCE.md
2. **Always use enums** — `ButtonType.PRIMARY` not `"primary"`
3. **Use outline icons** — `mdiHomeOutline` not `mdiHome`
4. **Use color tokens** — `colors.colorBlueDark1` not `"#2858C4"`
5. **Use pre-built sidebar tabs** — `sidebarTabs.messages` not custom objects

### When Building New Products:

1. Read AI_REFERENCE.md first
2. Use `CanaryAppShell` as the page wrapper
3. Use existing components before creating new ones
4. New molecules/organisms go in `components/products/[product]/`
5. Shared components go in `components/core/`

### Recommended Product Development Workflow (for Designers):

Before building a product, follow this sequence:

**Step 1: Gather Reference**
- Screenshots of the real product
- Figma designs (if available)
- List of features/screens to include

**Step 2: Create Analysis Doc**
- Create `[PRODUCT]_ANALYSIS.md` in your product folder
- Document: features, screens, data requirements, edge cases
- Identify what canonical data you need (guests, reservations, etc.)

**Step 3: Plan Structure**
- List the components you'll need
- Identify what exists in `components/core/` (reuse first!)
- Identify what's truly product-specific

**Step 4: Build**
- Start with the main page layout (`CanaryAppShell`)
- Build components one at a time
- Wire up to canonical data from `lib/core/data/`
- Test locally with `pnpm dev`

**Step 5: PR to Main**
- Create feature branch
- PR when product is functional
- Anyone can merge (trust-based)

---

## 12. Knowledge Transfer / CLAUDE.md Setup

### Goal
Make the "brain" transferable so any designer using Claude in the new repo gets the same guardrails, preferences, and context.

### What propagates automatically:
- `CLAUDE.md` — Read by Claude at session start
- `AI_REFERENCE.md` — Component library guide (copy from foundation repo)
- `PLANNING.md` — Architecture decisions (this file)

### Files to analyze before creating CLAUDE.md:

The following files in `canary-messaging/` may contain habits, preferences, and ideas to carry forward:

| File | Purpose |
|------|---------|
| `PROJECT_CONTEXT.md` | Original project context and goals |
| `COMPONENT_LIBRARY_MAPPING.md` | How components map to real product |
| `WORKTREES_WORKFLOW.md` | Git workflow preferences |
| `FIGMA_DESIGN_ANALYSIS.md` | Design analysis approach |
| `CANARY_MESSAGING_ANALYSIS.md` | Product analysis and decisions |
| `README.md` | Project overview |

**TODO:** Before finalizing CLAUDE.md for the new repo, read through these files and extract:
- Miguel's working preferences
- Decision-making patterns
- Communication style expectations
- Any implicit rules or conventions

### Optional: Custom slash commands

Consider creating `.claude/commands/` for common workflows:
- `/new-product` — Scaffold a new product
- `/add-component` — Create component with correct structure
- `/review` — Check code against guidelines

---

## 13. Future Enhancements

### Custom Agents (Low Priority)

If needed, consider creating custom agents for:
- **design-system-auditor** — Checks correct usage of `@canary-ui/components`
- **canonical-data-validator** — Ensures guest data comes from `lib/core/data/`
- **component-structure-checker** — Verifies folder placement

Reference: https://github.com/VoltAgent/awesome-claude-code-subagents

*Note: One designer already uses agents extensively—evaluate need before building custom ones.*

---

## 14. Open Questions / To Discuss

- [ ] Package publishing: npm (public) vs GitHub Packages (private)?
- [ ] Starter template: CLI tool (`create-canary-prototype`) or GitHub template repo?
- [ ] Versioning strategy: semver? How often to release?
- [ ] Documentation: Where to host? README only or dedicated docs site?
- [ ] CI/CD: Auto-publish on merge to main?

---

## 10. Next Steps

1. [ ] Create new repo (`canary-prototype-core`)
2. [ ] Set up package structure and build config
3. [ ] Build canonical data layer (guests, reservations, rooms)
4. [ ] Port messaging components from current repo
5. [ ] Create starter template for PMs
6. [ ] Document usage for PMs
7. [ ] Publish initial version

---

## Appendix: Dependencies

### Current @canary-ui/components exports used:
- `CanarySidebar`, `SidebarVariant`, `standardMainSidebarSections`
- `CanaryButton`, `ButtonType`, `ButtonSize`
- `CanaryTag`, `TagSize`, `TagVariant`
- Various input components

### Relationship to @canary-ui/components:
- `@canary-ui/components` = Low-level design system (buttons, inputs, etc.)
- `@canary/prototype-core` = High-level prototype components that USE @canary-ui/components
