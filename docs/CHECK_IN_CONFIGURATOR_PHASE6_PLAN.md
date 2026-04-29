# Phase 6 — Configuration Tab Split-Pane Refactor (Implementation Plan)

> Self-contained build plan. Designed to survive context compaction. Pair with `CHECK_IN_CONFIGURATOR_ARCHITECTURE.md` and `project_checkin_phase1_progress.md` (memory) for context.

---

## Goal

Convert the Configuration tab from a one-column inline-expand layout to a **two-column split-pane**: atoms list on the left, focused atom editor on the right. Mirrors the existing Flows tab pattern (step list + phone preview).

Solves three problems at once:
- Wide canvas was wasted (atom rows used ~700px of 1100px available)
- Inline-expand pushed other atoms down on every edit, breaking scan flow
- Edit affordances (label, helper, PMS tag, conditions) were scattered between row controls and an expanded panel

## Scope

**In:**
- Split-pane layout: atoms list (~45%) + atom editor (~55%)
- Left pane: compact single-line atom rows, click-to-select, quick toggles only (Required + 4 device + condition count badge)
- Right pane: focused editor with Details section (label/helper/placeholder/PMS tag/auto-skip) + Visibility section (conditions editor), stacked
- Empty-state right pane: relocate `Settings Handled Outside Manage App` content here (currently bottom of page)
- Selected atom state in store
- Library component swaps (combine here since touching the same files):
  - PMS tag chip → `CanaryTag` (`TagSize.COMPACT`, `TagColor.DEFAULT`)
  - "Add condition" affordance → `CanaryButton` (`ButtonType.GHOST`, `ButtonSize.NORMAL`)
  - Domain section atom-count badge → less loud color (`TagColor.DEFAULT` instead of bright info-blue)

**Out (deferred):**
- Active flows chevron rationalization (#5 in eval — user holding to think about)
- Loyalty Welcome / Completion atoms (still in legacy editor fallback)
- Multi-language label editing
- Phase 4 step templates (v2)

## Architectural decisions locked

- **Click row = select atom.** No separate edit pencil. Selection persists until different atom clicked or empty area clicked.
- **Right pane is always present.** Empty state shows "Settings handled outside" content; selected state shows atom editor.
- **Conditions edit moves to right pane.** No more inline expand under the row.
- **Quick toggles stay on the row.** Required + 4 device pills + condition count badge — these flip in-place without selecting the atom (so power-users can toggle without visiting the editor).
- **Adding an atom auto-selects it.** New atom → row appears + right pane opens its editor.
- **Conditions count badge is read-only on row.** Click row to actually edit (or click badge as a shortcut to select-and-scroll-to-conditions).
- **Domain sections collapse independently.** Multiple can be open simultaneously.

## Sub-phases (commit-by-commit recovery boundaries)

### 6a — Selected atom state in store

**Files:** `lib/products/check-in-flows/store.ts`

Add `selectedAtomId: string | null` to state. Add `selectAtom(id)`, `deselectAtom()` actions. Mirror existing `selectStep`/`deselectStep` patterns.

**Acceptance:** types compile, store holds state, no UI change yet.

**Commit:** `Phase 6a — selected atom state in store`

### 6b — Refactor AtomRow to single-line + click-to-select

**Files:** `components/products/check-in-flows/configuration/AtomRow.tsx`

Compress to single-line layout:
```
[icon] [name] [PMS tag]   ●Req  ⌘W ⌘M ⌘T ⌘K   ⌐0   🗑
```
- Drop inline expand sections (details + conditions both go to right pane)
- Drop edit pencil button — entire row is clickable to select
- Quick toggles (Required, device pills) stop event propagation so they don't trigger selection
- Conditions count badge displayed (no inline editor; clicking selects atom)
- Delete icon hover-revealed at far right
- Selected state: visible left border or background highlight when `selectedAtomId === atom.id`
- Apply library swaps inline:
  - PMS tag chip → `CanaryTag` `COMPACT`
  - Required-but-not-shown warning stays (Phase 4)

Keep the variant logic (input / preset / copy-block) for the row content. Drop `AtomDetailsEditor` from this file — moves to AtomDetailPane in 6c.

**Acceptance:** rows render single-line, click selects (visible state change), toggles work without selecting, no inline expand. Right pane not yet present.

**Commit:** `Phase 6b — single-line click-to-select AtomRow`

### 6c — Create AtomDetailPane

**Files:** new `components/products/check-in-flows/configuration/AtomDetailPane.tsx`

Right-pane component. Reads `selectedAtomId` from store, finds the atom, renders editor.

Structure:
- Header: atom icon + name + delete button
- Section: "Details" — Label (EN), Helper text (EN), Placeholder (EN), PMS Mapping select, Auto-skip toggle. Reuse the existing detail editor logic from old AtomRow.
- Section: "Visibility" — `ConditionRuleEditor` for atom.conditions, scope='field'.
- Empty state: when `selectedAtomId` is null, render `<SettingsHandledElsewhere />`.

Variant handling: input / preset / copy-block paths from old `AtomDetailsEditor`.

Library swap inline: any "Add condition" affordance uses `CanaryButton` `GHOST` `NORMAL`.

**Acceptance:** AtomDetailPane renders correctly given a selected atom; empty state shows SettingsHandledElsewhere.

**Commit:** `Phase 6c — AtomDetailPane component`

### 6d — Restructure CheckInConfigPage to split-pane

**Files:** `components/products/check-in-flows/CheckInConfigPage.tsx`

New layout:
```
┌─ Configuration ────────────────────────────────────┐
│  Active flows banner (full width, kept)            │
├──────────────────────────────┬─────────────────────┤
│  Domain sections (scrolling) │  AtomDetailPane     │
│  - Guest Info                │  (selected atom or  │
│  - ID Documents              │   empty state)      │
│  - Payment                   │                     │
│  - Additional Guests         │                     │
│  - Auto Check-In             │                     │
│  - Copy Blocks               │                     │
│  - Custom Inputs             │                     │
└──────────────────────────────┴─────────────────────┘
```
- Left pane scrolls independently
- Right pane stays in view (sticky positioning or fixed pane)
- Remove the bottom-of-page `<SettingsHandledElsewhere />` (moved to empty-state right pane)

Width split: 45% / 55% (or 40/60 — pick what looks right; `flex` with appropriate basis).

**Acceptance:** layout renders side-by-side; clicking an atom in left pane shows its editor on right; clicking another atom swaps; clicking empty area or a "deselect" affordance returns to empty state.

**Commit:** `Phase 6d — split-pane Configuration tab layout`

### 6e — Polish + final library swaps

**Files:**
- `DomainSection.tsx` — atom-count badge color change (`TagColor.DEFAULT`)
- `AddAtomMenu.tsx` — verify ButtonType used
- Sweep for any remaining custom button styles

**Acceptance:** all chips/buttons use library components; loud blue badges toned down.

**Commit:** `Phase 6e — Configuration tab library polish`

## Recovery / resume protocol

To resume in a new session:
1. Load `project_checkin_phase1_progress.md` (memory) — confirms Phase 1–5 + 3 + 4 status, points here.
2. Load this file for sub-phase plan.
3. `git log --oneline -10` — see what's committed.
4. Read in-progress sub-phase status from progress memory.
5. Pick up at next pending sub-phase.

## Anti-patterns to avoid

- **Don't reintroduce per-row inline expand.** The whole point of split-pane is right-pane handles editing. Inline expand creates the layout-jiggle problem we're solving.
- **Don't put atom editing in a modal.** Modal loses surrounding context, hurts power-user flow. We chose split-pane intentionally over modal.
- **Don't make the right pane scroll at the page level.** Right pane is its own scroll container; left pane is its own scroll container. Independent.
- **Don't reintroduce a "Custom Forms registry" anywhere** (architecture-wide rule from Phase 1 — bundling is Flow-only). Configuration tab atoms are flat.

## Risk areas

1. **Sticky right pane on mobile/narrow viewports.** Split-pane assumes desktop. If viewport < 1024px or so, fall back to one-column with right pane sliding over (modal-ish) — but for prototype, just degrade to stacked.

2. **Selecting state across re-renders.** When CS edits the label of selected atom, selection should persist. Test that updating the atom doesn't deselect.

3. **Click target collision.** Quick toggles (Required, device pills) shouldn't trigger row selection. Use `e.stopPropagation()`.

4. **Empty state real estate.** SettingsHandledElsewhere may need light restyling to feel like a "this is the right pane" component, not "this got pushed here from the bottom."

5. **Existing `AtomDetailsEditor` in AtomRow needs to move.** Don't accidentally duplicate logic — extract once into AtomDetailPane and delete from AtomRow.
