# Phase 1 — Global Config Rebuild (Implementation Plan)

> Self-contained build plan for Phase 1 of the configurator rebuild. Designed to survive context compaction — a fresh Claude reading just this doc + `CHECK_IN_CONFIGURATOR_ARCHITECTURE.md` should be able to resume work cleanly.

---

## Goal

Restructure the Configuration tab from sub-feature settings panels (current `CheckInConfigPage`) into a **data-domain layout with atomic units**, matching the resolved architecture: Global owns atoms; Flow composes them into steps.

## Scope

**In:**
- New atomic data model (`InputAtom | PresetAtom | CopyBlockAtom`) in types + store.
- Domain-grouped Configuration tab with per-atom rows.
- Per-atom controls: required, validation, 4-toggle device visibility, conditions.
- Condition editing moved from Flow context to Global context.
- "Settings handled outside Manage app" collapsible at bottom.

**Out (deferred to later phases):**
- Flow tab demotion (Phase 2)
- Multi-stage preset decomposition (Phase 3)
- Custom Forms registry — **explicitly not building this; bundling is Flow-only.**
- Step templates (v2 nice-to-have)
- UDF / pet policy custom inputs (Phase 4 if pursued)

## Architectural decisions locked

- **No Custom Forms registry in Global.** All bundling lives in Flow. (Validated 3× across sessions.)
- **No `device` as a 6th condition parameter.** Device coverage is per-atom metadata via 4 toggles, not a runtime condition.
- **All conditional logic in Global**, on atoms. Flow renders what's in scope; no Flow-level conditions.
- **Required = global only.** No per-flow override.
- **4-toggle device-visibility row** (Web / Mobile / Tablet Reg / Kiosk), inline-compact, per atom.
- **Reg card is a Flow step composed of Global atoms**, not a Global concept.
- **Step disappears when all atoms hidden by conditions** — runtime behavior, no step-level conditions needed.

See `CHECK_IN_CONFIGURATOR_ARCHITECTURE.md` for the full rationale and `project_checkin_configurator_architecture.md` (memory) for the cross-session decision log including the warnings on the two anti-patterns above.

---

## Atomic data model (target shape)

```typescript
// New union type — Global Config holds these
type Atom = InputAtom | PresetAtom | CopyBlockAtom;

type AtomDomain =
  | 'guest-info'        // name, contact, address, stay preferences
  | 'id-documents'      // ID consent, ID type, ID photo capture, ID-extracted fields
  | 'payment'           // CC config, deposits, surcharge (CS-tunable subset)
  | 'additional-guests' // multi-guest fields
  | 'auto-check-in'     // auto-checkin config
  | 'copy-blocks'       // legal/policy text (hotel policies, marketing consent)
  | 'custom';           // hotel-defined UDF inputs

type Surface = 'web' | 'mobile-web' | 'tablet-reg' | 'kiosk' | 'mobile-app';

interface DeviceVisibility {
  web: boolean;
  'mobile-web': boolean;
  'tablet-reg': boolean;
  kiosk: boolean;
  'mobile-app': boolean;
}

interface AtomBase {
  id: string;
  domain: AtomDomain;
  deviceVisibility: DeviceVisibility;
  conditions?: Condition[];  // existing Condition type from current code
}

interface InputAtom extends AtomBase {
  kind: 'input';
  fieldType: FieldDef['type'];   // reuse existing FieldType ('text-input' | 'email' | ...)
  label: LocalizedText;
  placeholder?: LocalizedText;
  helperText?: LocalizedText;
  pmsTag?: ElementTag;
  required: boolean;
  autoSkipIfFilled?: boolean;
  options?: FieldOption[];
}

interface PresetAtom extends AtomBase {
  kind: 'preset';
  presetType: 'id-consent' | 'id-type-select' | 'id-photo-front' | 'id-photo-back' | 'id-selfie' | 'credit-card-form' | 'deposit-collection' | 'loyalty-welcome' | 'completion';
  // Preset-specific config — type narrowed per presetType
  config: IdConsentConfig | IdTypeSelectConfig | /* ... */ unknown;
}

interface CopyBlockAtom extends AtomBase {
  kind: 'copy-block';
  name: string;              // CS-facing label, e.g. "Hotel Policies"
  content: LocalizedText;    // the actual text
}
```

Notes:
- `FieldDef` (existing) maps to `InputAtom`. The migration path: convert existing FieldDef instances to InputAtom shape; refactor consumers.
- Preset configs from `step-templates.ts` get split: the per-stage config moves to its corresponding `PresetAtom`. Multi-stage decomposition is Phase 3, but the atom shape is ready for it.
- `LocalizedText`, `Condition`, `FieldOption`, `ElementTag` types already exist in `lib/products/check-in-flows/types.ts` — reuse.

---

## New Configuration tab UI structure

Replace `CheckInConfigPage.tsx` content with:

```
┌─────────────────────────────────────────────────────┐
│ Configuration                                       │
│ Define what data your check-in flow collects, how   │
│ it routes to PMS, and per-surface visibility.       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ▼ GUEST INFO                                        │
│   ┌───────────────────────────────────────────┐    │
│   │ First name        guest.first_name        │    │
│   │ Required ✓  [W][M][T][K]  No conditions  │    │
│   ├───────────────────────────────────────────┤    │
│   │ Last name         guest.last_name         │    │
│   │ Required ✓  [W][M][T][K]  No conditions  │    │
│   ├───────────────────────────────────────────┤    │
│   │ Estimated arrival reservation.estimated_  │    │
│   │ Required ✗  [W][M][T][K]  No conditions  │    │
│   │              ↑ Tablet/Kiosk off            │    │
│   └───────────────────────────────────────────┘    │
│   + Add input                                       │
│                                                     │
│ ▼ ID DOCUMENTS                                      │
│   [...same pattern with id-consent text, id-type   │
│    options, ID-extracted fields editability...]    │
│                                                     │
│ ▼ PAYMENT                                           │
│   [...credit card options, deposit config...]      │
│                                                     │
│ ▼ ADDITIONAL GUESTS                                 │
│   [...multi-guest field configs...]                │
│                                                     │
│ ▼ AUTO CHECK-IN                                     │
│   [...auto-checkin enablement, time, requires...]  │
│                                                     │
│ ▼ COPY BLOCKS                                       │
│   ┌───────────────────────────────────────────┐    │
│   │ Hotel Policies                            │    │
│   │ [W][M][T][K]   Show if has_pet=true       │    │
│   │ "Statler New York maintains a smoke-free  │    │
│   │  environment..."                  [edit]  │    │
│   └───────────────────────────────────────────┘    │
│   + Add copy block                                  │
│                                                     │
│ ─────────────────────────────────────────           │
│ ▶ Settings handled outside Manage app              │
│   (collapsed by default)                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Each `<AtomRow>` renders a single atom with:
- **Top line:** display label + (small) PMS tag chip (read-only)
- **Bottom line:** required toggle + 4-checkbox device row + conditions count + edit button

Click anywhere on the row → expand inline editor (or open a side panel — TBD in 1c).

Click "Settings handled outside Manage app" → expand collapsible listing Phase 1 / Deprecated / Demo entries (read-only).

---

## File-by-file work plan

### Sub-phase 1a — Atom data model (no UI change)

**Files to edit:**
- `lib/products/check-in-flows/types.ts` — add `Atom` union type, `InputAtom`, `PresetAtom`, `CopyBlockAtom`, `DeviceVisibility`, `AtomDomain`. Keep `FieldDef` for now (existing flow code consumes it; migration in 1c).
- `lib/products/check-in-flows/store.ts` — add `atoms: Atom[]` to store state. Add CRUD actions: `addAtom`, `updateAtom`, `removeAtom`. Keep existing flow state intact.
- `lib/products/check-in-flows/default-atoms.ts` (new) — seed atom data from current `default-flow-generator.ts` defaults. Convert existing reg card fields, ID config, payment config to atoms.

**Acceptance:** types compile, store holds atoms, no UI change. Verify via `pnpm build` typecheck.

**Commit message:** "Add atom data model in Global Config layer (Phase 1a)"

### Sub-phase 1b — AtomRow component

**Files to add:**
- `components/products/check-in-flows/configuration/AtomRow.tsx` — reusable component rendering one `Atom` with device toggles, required toggle, conditions count + edit affordance. Three internal variants: input row, preset row, copy block row.

**Acceptance:** AtomRow renders correctly in isolation (drop into a test page). Toggles fire callbacks. No store integration yet.

**Commit message:** "Add reusable AtomRow component (Phase 1b)"

### Sub-phase 1c — New Configuration tab layout

**Files to edit:**
- `components/products/check-in-flows/CheckInConfigPage.tsx` — replace existing sub-feature panels with domain-grouped sections rendering atoms via `<AtomRow>`. Wire up to atom store actions.

**Files to add:**
- `components/products/check-in-flows/configuration/DomainSection.tsx` — collapsible section per `AtomDomain`, lists atoms in that domain.
- `components/products/check-in-flows/configuration/AddAtomMenu.tsx` — "+ Add input/preset/copy block" picker.

**Acceptance:** Configuration tab shows new layout with all seeded atoms. Edit toggles work. Can add new atoms (custom inputs go to `custom` domain).

**Commit message:** "Reorganize Configuration tab around data domains (Phase 1c)"

### Sub-phase 1d — Move condition editing to Global

**Files to edit:**
- `components/products/check-in-flows/configuration/AtomRow.tsx` — open existing `ConditionRuleEditor` inline or in side panel when "edit conditions" clicked.
- `components/products/check-in-flows/editors/FieldDetailPanel.tsx` — remove condition editor section (Flow context shouldn't edit conditions). Show read-only "X conditions defined in Global → click to view" instead.

**Acceptance:** Condition editing happens only in Configuration tab. Flow tab shows resolved-state read-only.

**Commit message:** "Move condition editing to Global Config tab (Phase 1d)"

### Sub-phase 1e — Settings handled outside collapsible

**Files to add:**
- `components/products/check-in-flows/configuration/SettingsHandledElsewhere.tsx` — collapsible listing Phase 1 / Deprecated / Demo settings from spec doc. Hardcoded list for prototype; production would pull from a metadata registry.

**Files to edit:**
- `components/products/check-in-flows/CheckInConfigPage.tsx` — render SettingsHandledElsewhere at bottom of Configuration tab.

**Acceptance:** Collapsible appears at bottom, shows ~30-40 settings grouped by status, expand/collapse works.

**Commit message:** "Add Settings-handled-outside disclosure (Phase 1e)"

---

## Recovery / resume protocol

After each sub-phase commit:
1. Update `project_checkin_phase1_progress.md` (memory): mark sub-phase complete, note next sub-phase.
2. Commit with message format above.
3. If session is approaching capacity, stop at sub-phase boundary.

To resume in a new session:
1. Read `project_checkin_phase1_progress.md` (loaded automatically via MEMORY.md).
2. Read this plan doc.
3. Read `CHECK_IN_CONFIGURATOR_ARCHITECTURE.md` for context.
4. Run `git log --oneline -10` to see what's committed.
5. Pick up at next pending task in TaskList.

---

## Open questions to resolve as we go

1. **AtomRow edit affordance — inline expand vs side panel?** Inline is more compact; side panel handles complex preset configs better. **Decide during 1b.** Lean: inline expand for input + copy block, side panel for preset (since presets have type-specific config).

2. **Should existing `FieldDef` be deleted or kept as a compatibility shim?** Flow tab still consumes it. **Decision: keep for now (1a–1c), remove or wrap in 1d when Flow tab is touched.** Phase 2 will fully migrate.

3. **Multi-language editing for `LocalizedText` fields — minimal UI for prototype?** Existing `FieldDetailPanel` has a per-language input list. Reuse that pattern in AtomRow's expanded edit state. **Decide during 1c.**

4. **Preset atom seed data — full configs or stubs?** Existing presets in `step-templates.ts` have rich configs. For 1a, port verbatim. Phase 3 will decompose multi-stage presets into atomic stages.

5. **How does an atom signal it's Phase 1 (in Django, read-only here)?** For prototype, separate "Settings handled outside" collapsible (1e) handles this. We don't need to mark individual atoms as Phase 1 within domain sections — those domains only contain Phase 2 atoms.
