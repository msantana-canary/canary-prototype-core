# /prototype — Build or extend a Canary product prototype

You are helping a designer or PM build or modify a product prototype in the Canary Prototype Suite. This repo contains realistic, interactive prototypes of Canary's hotel software products.

## Step 1: Understand what they want

Ask the user:

**"What product are you working on?"**
- Messaging (1:1 conversations, broadcast, AI answers)
- Check-in (staff dashboard, guest submissions, detail panel)
- Checkout (departure management, folio, reviews)
- Guest Journey (timeline, message editor, campaigns, segments)
- Calls (call history, transfer rules, forward numbers)
- Knowledge Base (AI context, custom statements, segments)
- **New product** (not yet built)

**"What are you trying to do?"**
- **"I have a Figma design"** — Ask for the Figma link. Use the Figma MCP tools to read the design, then plan the build.
- **"I have a PRD"** — Ask for the link (Notion, Google Doc, etc.). Read it and plan the build.
- **"I have an idea I want to explore"** — Ask them to describe it. Help them think through it before building. Ask clarifying questions.
- **"I want to see what exists"** — Read the product inventory doc and give them a walkthrough of what's built and what's possible.

## Step 2: Read the docs

Before writing ANY code, read these files:

1. **`CLAUDE.md`** (repo root) — Critical rules, tech stack, folder structure, component library rules
2. **`AI_REFERENCE.md`** (repo root) — Component library guide with all available components, enums, tokens
3. **`docs/products/[product]/PRODUCT_INVENTORY.md`** — Detailed inventory of what's built, data model, how to extend

For existing products, the inventory doc tells you exactly what components exist, where they are, and how to add new features.

## Step 3: Create a branch

ALWAYS create a feature branch before making changes. Never work directly on main.

```bash
git checkout -b feature/[descriptive-name]
```

If the user is working concurrently with others, suggest using a git worktree:
```bash
git worktree add ../canary-prototype-worktrees/[feature-name] -b feature/[feature-name]
```

## Step 4: Plan before building

Enter plan mode for any non-trivial work. Read the existing product code to understand:
- Current component structure
- Data model and mock data
- How similar features are implemented in other products
- What can be reused vs. what needs to be built new

Present your plan to the user before writing code.

## Step 5: Build

Follow these rules strictly:

### Component Library (Non-Negotiable)
- **ALWAYS** use `@canary-ui/components` — CanaryButton, CanaryInput, CanaryModal, CanaryTag, CanaryCard, etc.
- **ALWAYS** use enums — `ButtonType.PRIMARY`, `TagColor.SUCCESS`, `InputSize.NORMAL`, etc.
- **NEVER** use raw `<button>`, `<input>`, or hand-roll components that exist in the library
- **ALWAYS** use outline icon variants from `@mdi/js` (e.g., `mdiHomeOutline` not `mdiHome`)
- **ALWAYS** use color tokens from `colors` (e.g., `colors.colorBlueDark1` not `'#2858C4'`)
- Use `InputSize.NORMAL` on all form inputs (library defaults to LARGE)

### Data
- Use canonical guest/reservation data from `lib/core/data/`
- Add product-specific mock data in `lib/products/[product]/`
- Don't overlap guest assignments with other products (check existing mock data first)

### File Organization
- Components go in `components/products/[product]/`
- Logic, types, store go in `lib/products/[product]/`
- Pages go in `app/(dashboard)/[product]/` or `app/(settings)/settings/[product]/`
- Shared components go in `components/core/`

## Step 6: Review

After building, spin up the dev server for the user to review:

```bash
pnpm dev
# Or on a specific port if another server is running:
PORT=3002 pnpm dev
```

Tell the user the URL to check. Wait for their feedback before committing.

## Step 7: Commit

Only commit when the user approves. Never merge to main without explicit approval.

```bash
git add [specific files]
git commit -m "descriptive message"
```

Do NOT push or merge unless the user asks you to.

## Available Products Reference

| Product | Dashboard Route | Settings Route | Inventory Doc |
|---------|----------------|----------------|---------------|
| Messaging | `/messages` | — | `docs/products/messaging/PRODUCT_INVENTORY.md` |
| Check-in | `/check-in` | — | `docs/products/check-in/PRODUCT_INVENTORY.md` |
| Checkout | `/checkout` | — | `docs/products/checkout/PRODUCT_INVENTORY.md` |
| Guest Journey | — | `/settings/guest-journey` | — |
| Calls | `/calls` | `/settings/calls` | — |
| Knowledge Base | — | `/settings/knowledge-base` | — |
| Segments | — | `/settings/segments` | — |
