# Phase 5 — Data Path Unification (Implementation Plan)

> Self-contained build plan for Phase 5 of the configurator rebuild. Designed to survive context compaction. Pair with `CHECK_IN_CONFIGURATOR_ARCHITECTURE.md` and the Phase 1 plan for context.

---

## Goal

Make atoms in Global Config the **single source of truth** for what flows render. Today flows still carry `FieldDef[]` legacy data; editing an atom's label in Configuration tab doesn't propagate. Phase 5 fixes that — flow steps reference atoms by ID, runtime resolves at render time.

This closes the architecture's most important credibility gap: "Global drives Flow."

## Scope

**In:**
- Refactor `StepInstance.config` for `schema-form` and `preset` step kinds to reference atoms by ID instead of inlining `FieldDef` / preset configs.
- Update default-flow-generator to populate flows with atom ID references derived from default atoms.
- Update preview rendering (`StepRenderer`, `RegistrationCardPreview`, etc.) to resolve atom IDs from Global Config at render time, applying atom-level conditions + device visibility.
- Update Flow tab step editor (`SchemaFormEditor` and friends) to operate on atom-id slots: pick atoms from Global, reorder slots, no inline atom editing (already locked down in Phase 2).
- Verify all four surfaces still render correctly.

**Out:**
- Phase 3 (multi-stage preset decomposition) — separate plan.
- Phase 4 polish — defer.
- Step templates v2.

## Architectural decisions locked

- **Flows reference atoms by ID.** Format: `step.config.atomIds: string[]` (ordered).
- **Atoms are not duplicated.** Editing an atom in Global propagates to every flow step that references it.
- **Atom-level conditions evaluated at runtime.** Step's atomIds list is the static composition; conditions filter at render.
- **Step composition is editable in Flow.** Add/remove/reorder atom slots. No atom-level editing in Flow.
- **Custom step ordering / titles / intro copy stays Flow-level.** (Already part of step.name etc.)

## Sub-phase breakdown

### 5a — Atom-reference data model

**Files:**
- `lib/products/check-in-flows/types.ts` — change `SchemaFormConfig.fields: FieldDef[]` to `SchemaFormConfig.atomIds: string[]`. Add similar shift for preset steps if needed (they currently inline configs; could become single-atom refs).
- Add helper: `resolveAtoms(atomIds: string[], allAtoms: Atom[]): Atom[]` — runtime resolver, filters out missing atoms.

**Acceptance:** types compile; old code paths still work or fail loudly with type errors.

### 5b — Migrate default-flow-generator

**Files:**
- `lib/products/check-in-flows/default-flow-generator.ts` — instead of generating `FieldDef[]` inline, generate atom ID references that point to atoms seeded in `default-atoms.ts`.
- The reg-card schema-form step's `atomIds` becomes `['atom-first-name', 'atom-last-name', 'atom-email', ...]`.
- Preset step types (id-consent, id-capture, credit-card etc.) similarly point to their preset atom IDs.

**Acceptance:** all 4 default flows generate with valid atom-id references; resolved atoms match the previous FieldDef seed.

### 5c — Update preview rendering

**Files:**
- `components/products/check-in-flows/preview/StepRenderer.tsx`
- `components/products/check-in-flows/preview/RegistrationCardPreview.tsx`
- Any other preview component that consumes `step.config.fields`

Resolve atom IDs from Global Config (via store hook), apply per-atom conditions + device visibility, render. Adapter pattern: convert `Atom` → `FieldDef`-like shape internally if the rendering code is hard to migrate, but the source of truth must be the atom.

**Acceptance:** all four flows still render in the preview pane. Editing an atom's label in Configuration tab now updates the Flow preview live.

### 5d — Update Flow step editor

**Files:**
- `components/products/check-in-flows/editors/SchemaFormEditor.tsx` — convert from FieldDef-based editing to atom-id slot management.
- New behavior: list of atom slots in the step; each slot shows atom name (read-only, from Global). Drag to reorder. "+ Add atom" picker pulls from Global atoms not yet in any step (or all atoms if multi-step references are allowed — TBD).

**Open question for 5d:** can the same atom be referenced by multiple steps in the same flow (e.g., signature on both reg-card step and pet-policy step)? Probably not — each datapoint is collected once. Enforce uniqueness within a flow's atom references.

**Acceptance:** Flow editor lets you add atoms to steps, remove from steps, reorder. Cannot edit atom-level properties (already locked in Phase 2).

### 5e — Verify + cleanup

- Sweep for any remaining `FieldDef` consumers outside Global Config.
- Verify all 4 default flows render correctly.
- Verify Configuration tab edits propagate to Flow preview.
- Verify atom condition rules filter at runtime.
- Commit + push.

## Risk areas

1. **Preset steps and preset atoms.** Currently `id-capture` is one preset config in flow; in Phase 5 we'd point at `atom-id-type-select` or split into atomic-stage references. Phase 3 (multi-stage preset decomposition) intersects here. Decide whether to fully split presets in 5a or wait until Phase 3 follows. Recommendation: keep preset steps as single-atom references in 5a–5d; Phase 3 then becomes a swap from one atom-id to multiple atom-ids in flows that want to split.

2. **`useGeneratedFlows()` and store interactions.** Flows are generated from `CheckInConfig` via `buildFlowsFromConfig`. After 5b, flow generation depends on atoms too. Decide: regenerate flows when atoms change, or treat flows as static post-generation? Recommendation: static. Hotel-onboarding scripts seed atoms + flows once; CS edits propagate.

3. **Existing preview components reference resolveText, etc., on FieldDef.** Migration adapter needed.

4. **The Flow tab's drag-reorder for fields uses dnd-kit on FieldDef IDs.** Updating to atom IDs is mechanical but every consumer needs touching.

## Sub-phase commit plan

| Sub-phase | Files touched | Commit message |
|---|---|---|
| 5a | types.ts | `Phase 5a — atom-reference data model in flow steps` |
| 5b | default-flow-generator.ts | `Phase 5b — generate flows with atom-id references` |
| 5c | StepRenderer + previews | `Phase 5c — preview rendering resolves atoms from Global` |
| 5d | SchemaFormEditor + Flow UI | `Phase 5d — Flow step editor manages atom slots` |
| 5e | sweep + verify | `Phase 5e — verify data unification end-to-end` |

## Recovery / resume protocol

To resume in a new session:
1. Load `project_checkin_phase1_progress.md` (memory) — confirms Phase 1+2 status.
2. Load this file (Phase 5 plan).
3. `git log --oneline -15` — see Phase 1+2 commits, identify last Phase 5 commit if any.
4. Pick up at next pending sub-phase.

Anti-patterns reminder (also in memory):
- Don't reintroduce Custom Forms registry in Global. Bundling is Flow-only.
- Don't add `device` as a 6th condition parameter. Per-device visibility is per-atom metadata.
- Two orthogonal layers, not cascade with overrides.

## When this is done

The architecture is end-to-end demonstrable:
- Edit an atom in Configuration → see it update across all 4 flow previews live.
- Toggle a device on an atom → see it disappear from that surface's flow preview.
- Add a condition to an atom → see steps containing it filter for non-matching guests.

Phase 3 (multi-stage preset decomposition) becomes a small additive change after this. Phase 4 polish lands at the end.
