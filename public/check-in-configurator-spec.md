# Check-in Configurator — Architecture & MVP Phase Split

> Self-contained spec for the configurator's data model, phase boundaries, and kiosk absorption.
> Companion to `CHECK_IN_FLOW_CONFIG.md` (which covers the "what and why" for non-engineers).
> Resolved through multi-session debate with Vibhor + Matt (Apr 27–28 2026).

---

## TL;DR

> "Configurations build flows which are visible easily to hotels and CS."

Two orthogonal layers, three deployment phases. Global Config owns the data contract; Flow per surface owns the presentation. All conditionals live in Global. "Form" is not a Global concept — it emerges from Flow's step composition.

---

## Architecture: two orthogonal layers

This is **not** cascade-with-overrides. It's separation of concerns by question type.

### Layer 1 — Global Config (Manage app)

Owns the **data contract**: what to collect, who from, under what conditions, how it routes to PMS.

- **Atomic units:** inputs (`first_name`, `email`, etc.) and atomic presets (`id-consent`, `id-type-select`, `id-photo-front`, `id-photo-back`, `id-selfie`, `credit-card-form`, etc.).
- **Per-input attributes:**
  - PMS tag (e.g., `guest.first_name`)
  - Validation rules (required, regex, etc.)
  - Required-ness — global only, no per-flow override
  - Per-device visibility (which surfaces collect this datapoint)
  - Conditional rules (segment, nationality, age, loyalty, rate code)
- **Contract copy:** input labels, validation messages, consent text, policy text — anything compliance-relevant or part of what the guest is agreeing to.
- **Step titles for built-in presets** (Flow may override per surface for UX reasons).

### Layer 2 — Flow per surface

Surfaces: `mobile-web`, `mobile-SDK`, `tablet-reg`, `kiosk`.

Owns **presentation only** — NOT data, NOT conditionals.

- **Step composition:** which inputs/presets are grouped into each step.
- **Step ordering:** the sequence within the flow.
- **UX copy:** step intros, hints, navigation guidance — anything telling the guest *how* to interact.
- **Step titles for custom steps** (e.g., a hotel-defined "Pet Policy" step name).
- **Per-page body copy edits.**

Flow is **dependent on** Global. Flow can only arrange existing inputs and presets; it cannot define new ones, change validation, or add conditional rules.

### Why orthogonal layers, not cascade

Cascade-with-overrides degrades into "depends which override won" debugging at scale. Orthogonal layers mean every setting type lives in exactly one place — CS doesn't have to learn "where does X live?". Their mental model is just: **data questions → Global, layout questions → Flow.**

---

## Where conditionals live: all in Global

Every conditional rule is Global. Flow has zero conditional logic.

| Rule | Lives in |
|---|---|
| "Show ID type X if guest is Italian" | Global (segment-based scope) |
| "Skip ID step if profile recognized" | Global (PMS-attribute condition) |
| "Show pet policy if pet=true was captured" | Global (data-state condition, runtime-evaluated) |
| "Estimated arrival time on mobile-web only" | Global (per-device visibility) |
| "Step ordering for kiosk" | Flow (presentation) |
| "Page intro copy: 'Tap below to start'" | Flow (UX guidance) |

Flow renders inputs/presets when their Global conditions are met; nothing more.

---

## "Form" is not a Global concept — all bundling is Flow

Global has **atoms only**:
- Atomic inputs (`first_name`, `email`, `phone`, etc.)
- Atomic presets (`id-consent`, `id-type-select`, `id-photo-front`, etc.)
- Atomic copy blocks (`pet_policy_text`, `hotel_policies_text`, `marketing_consent_text` — compliance-relevant text)

Flow composes atoms into steps. A "form" / "step" is purely a Flow container.

Worked examples:
- Reg Card = a Flow step containing many guest-info atoms (same atoms on mobile-web rendered as one combined step vs kiosk rendered as one-input-per-step is pure Flow composition).
- Pet Policy = a Flow step containing a policy copy block + agree-checkbox.

**Reuse across surfaces:** recreate the composition on each Flow tab. Step templates (saved Flow-level compositions) is a v2 Flow-level feature, NOT a Global data structure.

⚠️ **Do not introduce a "Custom Forms registry" in Global.** Bundling there cascades wrong (changing a bundle affects every flow referencing it; per-flow customization like "break out email on mobile only" becomes a Global edit that side-effects other flows). All bundling is Flow.

### Multi-stage presets (ID Capture)

ID Capture has natural sub-stages: consent → type select → front photo → back photo → selfie. Each stage is its **own atomic preset** in Global. Flow chooses to render them as one combined step (kiosk: all five in one step) or N separate steps (mobile-SDK: each as its own page).

---

## Three deployment phases

### Phase 1 — Stays in Django

Boolean feature flags, integration plumbing, hotel-level operational defaults. Set at onboarding, rarely changed. Engineering must touch.

**Test:** if changing this requires engineering judgment, it's Phase 1.

### Phase 2 — Moves to Global Config (Manage app)

How features work once enabled. CS-tunable. Frequently changed.

**Test:** if a CS person in another timezone needs to change this without engineering, it's Phase 2.

### Phase 3 — Flow tab (per surface)

Step composition, ordering, UX copy. Pulls from Global. CS-owned.

**Test:** if it's about *how data is presented* on a specific surface, it's Phase 3.

---

## Phase split — categorized

Source of truth: `Check-in Config.xlsx` annotations + production code in `frontend/manage/` and `backend/check_in/`.

### Phase 1 — Stays in Django

**Product enablement (boolean toggles):**
- `has_check_in_mobile`, `has_apple_wallet`, `has_google_wallet`
- `has_e_folio`, `has_auto_checkout`, `has_ai_checkout`, `has_id_document_ocr`
- `has_onsite_booking`

**Step availability switches** (the on/off, not the configs):
- `id_step`, `id_step_with_ocr`, `credit_card_step`, `additional_guests_step`

**PMS / payment plumbing:**
- `pms_payment_slot_identifier`, `pms_payment_slot_rate_code_mapping`
- `pms_checkin_deposit_payment_slot_identifier`
- `payment_gateway_config_id`, `detect_funding_type_gateway_config_id`
- `funding_type_detection_strategy`, `surcharge_calculation_strategy`
- `is_tokenizing_with_hotel_payment_gateway`
- `disable_stripe_validation`
- `override_payment_gateway_to_post_raw_credit_card_to_pms`
- `pms_prepopulate_additional_guests`
- `require_preexisting_reservations`

**Surcharge rates** (kept in Django for MVP — typo risk on billing rates):
- All `surcharge_*_percentage` fields

**Webhook integrations & credentials:**
- `notification_webhook_url`
- `notification_webhook_auth_credentials`

**Hotel-level operational:**
- `default_guest_language_tablet`
- `check_in_cut_off_hour`, `check_in_cutoff_day`

### Phase 2 — Moves to Global Config

**ID Documents domain:**
- `require_id_card_back`
- `id_options` (which IDs accepted, with nationality-segmented overrides)
- `id_retention_days`, `purge_id_on_reservation_status_change`
- `show_id_consent`, `id_consent_cta_text`, `id_consent_text_i18n`
- All 13 `id_document_*` editability fields (already pre-tagged "Move to Form Builder")

**Additional Guests domain** (all fields pre-tagged "Move to Form Builder"):
- All `additional_guests_*` field configs (23 fields)

**Payment domain (CS-frequent):**
- `credit_card_upload_policy`
- `require_credit_card_postal_code`
- `blocked_card_types`, `blocked_card_networks`
- `deposit_strategy`, `is_canary_processing_deposits`
- `should_skip_deposit_if_routing_rules_exist`
- `post_deposit_surcharge_to_pms`, `deposit_surcharge_transaction_code`, `show_deposit_surcharge_detail`
- `use_surcharge_manual_correction_for_credit_cards`
- `match_cardholder_and_client_name`
- `disable_view_full_card_info`, `disable_credit_card_storage`

**Auto check-in** (already hotel-facing today):
- `AutoCheckInConfiguration.{enabled, checkin_time, auto_check_in_window, require_pre_registration, require_identity_verification, require_id_name_match}`

**Guest UX:**
- `guest_gender_options`
- `message_after_successful_check_in_i18n`
- `has_ratings`

**Operational notifications:**
- `notification_emails` (staff alert list — separate from webhook)

### Reg card data — out of MVP scope

The reg card itself (input definitions + PMS tagging) is already managed in the existing Manage app reg card builder. **For MVP, link out** rather than rebuild. Later phases may consolidate.

The architectural model still applies: reg card emerges as a Flow step composing atomic inputs from Global. We just don't ship a new reg-card editor on top of what already exists.

### Deprecate — don't migrate

- `rollout_check_in_v2_level`
- `has_registration_card_canary_ui`, `has_registration_card_settings`
- `theme` (use `hotels.theme` instead)
- `show_estimated_total`, `hide_id_section_dashboard`
- `integration_auto_post_to_pms`, `integration_precheckin_method`
- All `integration_auto_post_to_pms_*` flags marked "Y in reg card" (handled by reg card builder)

### Demo / internal — ignore

- `has_id_card_recognition` (demo only)
- `demo_pane_has_additional_fields`, `demo_room_numbers`

---

## "Settings handled outside Manage app" — UI affordance

Add a **collapsible section at the bottom of the Global Config tab** listing Phase 1 + Deprecated + Demo settings. Read-only; transparency only. CS sees what exists and where it lives, even if they can't edit it here.

Structure:
```
▶ Settings handled outside Manage app

  Managed in Django (engineering-set):
    • [grouped by category, with one-line descriptions]

  Deprecated (will be removed):
    • [list]

  Demo / internal:
    • [list]
```

Each row: field name + one-line description on hover. No edit affordance. Pulls from a metadata registry (or for prototype: hardcoded).

---

## Kiosk absorption

Kiosk built its own framework. Goal: absorb into the unified configurator. Three migrations needed.

### Migrating: kiosk step lists → Flow tab data

Kiosk's `*_step_list` fields ARE the Flow definitions for kiosk surface, just stored as serialized arrays in Django:
- `check_in_step_list`
- `check_out_step_list`
- `registration_step_list`

Migration: pull these into the Flow tab as the kiosk surface's editable step composition. Step list serialization format will need a one-time transformer.

### Killing: kiosk-specific input collection booleans

These duplicate what should be **per-input device visibility** in Global Config:

| Killing this kiosk field | Replace with |
|---|---|
| `collect_nationality_for_primary_guest` | Global `nationality` input → kiosk visibility toggle |
| `collect_nationality_for_additional_guests` | Global `additional_guest.nationality` → kiosk visibility toggle |
| `collect_passport_for_primary_guest` | Global `passport` input → kiosk visibility toggle |
| `collect_passport_for_additional_guests` | Global `additional_guest.passport` → kiosk visibility toggle |
| `collect_passport_names` | Per-input toggle on passport name fields (verify with code — semantics unclear) |

After migration: kiosk reads device visibility from Global like every other surface. The kiosk-specific booleans get dropped.

### Keeping in Django (kiosk-only operational, no Manage app analog)

These are genuinely kiosk-specific (hardware/PMS interaction unique to kiosk):
- `take_payment_strategy`, `payment_authorize_only`, `payment_rely_on_payment_window`
- `payment_billing_folio_window`
- `skip_payment_for_special_requests`, `skip_payment_for_payment_methods`
- `block_kiosk_check_in_for_special_requests`
- `check_in_allowed_rate_codes`
- `room_condition_for_assignment`, `room_not_ready_queue_enabled`
- `has_pms_state_check`, `has_immediate_id_purge`
- `addon_codes_purchaseable_at_check_out`
- `addon_codes_purchaseable_during_early_check_in`
- `has_early_checkin` (kiosk-specific add-on, not the same as pre-arrival)

These get listed in the "Settings handled outside Manage app" section.

### Deferred — kiosk variants

Kiosk has multi-mode step lists:
- `handheld_check_in_step_list`
- `video_check_in_step_list`, `video_check_out_step_list`

These are sub-products (especially video — likely a separate product). **Out of scope for current MVP** — focus on main check-in flow first. Accommodate when those products are integrated into the unified framework.

---

## Open questions

1. **Surcharge percentages — Phase 1 or Phase 2?** Currently Phase 1 (typo risk on billing). Could promote to Phase 2 once we have audit-logged + confirmation-guarded edit pattern. Defer until safety story exists.

2. **`collect_passport_names` semantics.** Need code-level verification to map this kiosk boolean to the right Global input. May be a behavior toggle on existing name fields rather than a new field.

3. **Brand-template drift over time.** Scripts seed Global Config at onboarding from brand defaults. If brand updates requirements 6 months later, individual hotels don't auto-inherit. Acceptable for MVP; may need a brand-template-pull workflow in v2.

4. **"Required + not visible on any active surface" warning.** A field marked required-globally but hidden on every enabled surface can never be satisfied. The configurator should surface as a warning (not block). Implementation deferred but worth tracking.

---

## What this means for prototype implementation

- **Configuration tab** = Phase 2 surface. Sections per data domain (Identity, Payment, Additional Guests, Auto Check-in, Custom Forms registry). Each section: per-input controls including device visibility toggles + condition rules.
- **Flow tab** (per surface) = Phase 3. Resolved view from Global, allow step composition + ordering only. Field-level config jumps back to Global ("defined in Global → click to edit").
- **Phase 1 visibility** = collapsible "Settings handled outside Manage app" section at bottom of Configuration tab.
- **Reg card** = a step in Flow composed of atomic inputs from Global. No special "reg card editor" in this prototype's UI; link to the existing Manage app reg card builder for the input definitions.

---

## References

- Companion: `docs/CHECK_IN_FLOW_CONFIG.md` (problem framing, mental model for non-engineers)
- Source spreadsheet: `Check-in Config.xlsx` (config field-level annotations)
- Production code: `backend/check_in/`, `frontend/manage/`, `backend/kiosk/`
- Memory: `project_checkin_configurator_architecture.md` (architectural decisions log)
