# CLAUDE.md - Canary Prototype Suite

> **Read this first.** This document contains essential context for working on this project.
> Last updated: 2025-12-17

---

## What Is This Project?

The **Canary Prototype Suite** is a library for building realistic product prototypes for Canary's hotel software. This is used for:

1. **Customer demos** - Polished prototypes that look exactly like the real Canary product
2. **PM/Designer testing** - Test new features "in-product" instead of guesswork through Figma

This is **NOT** for production use, actual customer data, or engineering development.

---

## Before You Build Anything

### Required Reading

**Before building ANY components or UI**, read these files in the repo root:

1. **`AI_REFERENCE.md`** - Component library guide containing:
   - Complete component inventory with correct import paths
   - All available enums (`ButtonType`, `InputType`, `TagColor`, etc.)
   - Pre-built sidebar tabs (`sidebarTabs.messages`, `sidebarTabs.checkIn`, etc.)
   - Color, typography, and spacing tokens
   - Icon naming conventions
   - Do's and Don'ts

2. **`PLANNING.md`** - Architecture decisions, folder structure, contributor workflow

---

## Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **React:** 19.x
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4.x
- **State:** Zustand
- **UI Library:** `@canary-ui/components` (from GitHub)
- **AI:** `@anthropic-ai/sdk` (Claude)
- **Icons:** `@mdi/react` + `@mdi/js`
- **Dates:** `date-fns`

---

## Critical Rules

### 1. Always Use Enums

```typescript
// WRONG - will cause TypeScript errors
<CanaryButton variant="primary" />
<CanarySidebar variant="main" />

// CORRECT - use enum values
import { ButtonType, SidebarVariant } from '@canary-ui/components';
<CanaryButton variant={ButtonType.PRIMARY} />
<CanarySidebar variant={SidebarVariant.MAIN} />
```

### 2. Use Outline Icons

```typescript
// WRONG
import { mdiHome, mdiCalendar } from '@mdi/js';

// CORRECT
import { mdiHomeOutline, mdiCalendarOutline } from '@mdi/js';
```

### 3. Use Color Tokens

```typescript
// WRONG - hardcoded colors
style={{ color: '#2858C4' }}

// CORRECT - use tokens from library
import { colors } from '@canary-ui/components';
style={{ color: colors.colorBlueDark1 }}
```

### 4. Use Pre-Built Sidebar Tabs

```typescript
// WRONG - creating sidebar tabs manually
const sections = [{ icon: mdiMessage, label: 'Messages', ... }]

// CORRECT - use pre-built exports
import { sidebarTabs, standardMainSidebarSections } from '@canary-ui/components';
const sections = standardMainSidebarSections;
// Or individual: sidebarTabs.messages, sidebarTabs.checkIn
```

### 5. Canonical Data for Guests/Reservations

**Never hardcode guest data in components.** Always use the canonical data layer:

```typescript
// Import canonical data
import { getGuest, getReservation } from '@/lib/core/data';
import { useGuest, useReservation } from '@/lib/core/hooks';

// Use in components
const guest = getGuest('guest-emily');
const reservation = useReservation('res-emily-nov');
```

This ensures the same guest appears consistently across all products (Messaging, Check-in, Checkout, etc.).

### 6. Read Files Before Editing

Never propose changes to code you haven't read. If you need to modify a file, use the Read tool first to understand the existing code.

### 7. Never Use CSS @import with Tailwind CSS 4

**Tailwind CSS 4 generates CSS that breaks `@import` placement.** The CSS spec requires `@import` rules to be at the very top of a file, before any other rules. When Tailwind processes imports, it can place `@import` statements after generated CSS, causing parsing errors.

```css
/* WRONG - will cause "Parsing CSS source code failed" error */
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Roboto...');

/* CORRECT - load fonts via Next.js instead */
```

**For fonts**, use Next.js font optimization in `layout.tsx`:

```tsx
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});
```

**For external CSS**, use `<link>` tags in the HTML head instead of `@import`.

---

## Folder Structure

```
canary-prototype-core/
├── lib/
│   ├── core/                    # SHARED ACROSS ALL PRODUCTS
│   │   ├── data/                # Canonical guest, reservation, room data
│   │   ├── types/               # Shared TypeScript types
│   │   └── hooks/               # Shared React hooks
│   │
│   └── products/                # PRODUCT-SPECIFIC LOGIC
│       ├── messaging/           # Messages store, types, mock-data
│       ├── check-in/            # Check-in specific logic
│       └── ...
│
├── components/
│   ├── core/                    # SHARED UI COMPONENTS
│   │   ├── GuestCard.tsx
│   │   └── ReservationDetails.tsx
│   │
│   └── products/                # PRODUCT-SPECIFIC UI
│       ├── messaging/
│       │   ├── ThreadList.tsx
│       │   ├── MessageFeed.tsx
│       │   └── ...
│       └── ...
│
└── app/                         # Next.js routes
    ├── messages/
    ├── check-in/
    └── ...
```

---

## Working Preferences

### Communication Style

- Value detailed technical explanations - not just what, but why
- Direct and honest feedback - fix issues immediately
- Proactive self-verification - check against Figma before claiming done
- Complete code in documentation, not just snippets

### Development Patterns

- **Figma is source of truth** - Always cross-reference designs
- **Iterative refinement** - Build, review, fix, repeat
- **Don't assume done without verification**
- **Don't guess implementation details** - Look up the correct approach

### What NOT To Do

- Don't guess component names - Only use components documented in AI_REFERENCE.md
- Don't use strings where enums are required
- Don't hardcode colors - Use design tokens
- Don't embed guest data in components - Use canonical data layer
- Don't touch other designers' product folders without coordination

---

## Component Architecture

### Layer Separation

| Layer | Where | Examples |
|-------|-------|----------|
| **Atoms** (generic UI) | `@canary-ui/components` | Button, Input, Tag, Modal |
| **Molecules** (shared) | `components/core/` | GuestCard, ReservationDetails |
| **Molecules/Organisms** (product-specific) | `components/products/[x]/` | ThreadList, MessageFeed |

### The Rule

- **Atomic library stays pure** - Only domain-agnostic UI primitives
- **Start product-specific** - New components go in their product folder
- **Promote when reused** - If Check-in component is needed in Checkout, move to `components/core/`

---

## Product Development Workflow

### For Designers Building New Products

**Step 1: Gather Reference**
- Screenshots of the real product
- Figma designs (if available)
- List of features/screens to include

**Step 2: Read Required Docs**
- `AI_REFERENCE.md` - Component library guide
- `PLANNING.md` - Architecture decisions

**Step 3: Plan Structure**
- List the components you'll need
- Identify what exists in `components/core/` (reuse first!)
- Identify what's truly product-specific

**Step 4: Build**
- Start with the main page layout (`CanaryAppShell`)
- Build components one at a time in `components/products/[your-product]/`
- Wire up to canonical data from `lib/core/data/`
- Test locally with `pnpm dev`

**Step 5: PR to Main**
- Create feature branch
- PR when product is functional
- Anyone can merge (trust-based)

---

## Folder Ownership

```
src/products/
├── messaging/      ← Miguel
├── check-in/       ← Miguel
├── checkout/       ← Miguel
├── guest-journey/  ← Miguel
├── calls/          ← Miguel
├── upsells/        ← TBD
├── contracts/      ← TBD
├── digital-tips/   ← TBD
└── ...
```

**Rules:**
- Stay in your folder → `components/products/[your-product]/`
- Need shared code changes? → Ping Miguel (canonical data, core types, shared components)
- Don't touch other products → Unless coordinating with that owner

---

## Common Mistakes to Avoid

### 1. Wrong Layout Structure

```typescript
// WRONG - header full-width, then sidebar below
<div>
  <Header />
  <div className="flex">
    <Sidebar />
    <Content />
  </div>
</div>

// CORRECT - sidebar full-height, content to the right
<div className="h-screen flex">
  <CanarySidebar />
  <div className="flex-1 flex flex-col">
    <Header />
    <Content />
  </div>
</div>
```

### 2. Missing onChange Handler

```typescript
// WRONG - controlled input without onChange
<CanarySelect value={status} />

// CORRECT - include onChange
<CanarySelect
  value={status}
  onChange={(e) => setStatus(e.target.value)}
/>
```

### 3. Wrong Tab Variant

```typescript
// WRONG - segmented shows pill background
<CanaryTabs variant={TabVariant.SEGMENTED} />

// CORRECT - text shows underline indicator
<CanaryTabs variant={TabVariant.TEXT} />
```

---

## Git Workflow

### For Multiple Features Simultaneously

Use git worktrees to work on multiple features with different Claude Code instances:

```bash
# Create a new worktree for a feature
git worktree add ../canary-prototype-worktrees/feature-name feature-name

# Each worktree can run on a different port
PORT=3001 pnpm run dev
PORT=3002 pnpm run dev
```

### Merging

1. Work on feature in worktree
2. Commit and push feature branch
3. Create PR on GitHub or merge locally
4. Clean up worktree when done

---

## Quick Reference

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Update Component Library
```bash
pnpm update @canary-ui/components --latest
```

---

## Package Installation Note

The `@canary-ui/components` package is installed from GitHub:

```json
"@canary-ui/components": "github:msantana-canary/canary-prototype-foundation"
```

It's NOT on npm. If you see `ERR_PNPM_FETCH_404`, check that the GitHub reference is correct.

---

## Contact

For questions about:
- **Canonical data, core types, shared components** → Ping Miguel
- **Architecture decisions** → Check PLANNING.md first
- **Component usage** → Check AI_REFERENCE.md first
