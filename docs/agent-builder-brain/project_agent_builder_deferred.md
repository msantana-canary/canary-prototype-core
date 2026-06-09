---
name: Agent Builder — Deferred Features
description: Features discussed and tabled for later. Pick up when needed.
type: project
---

## AI-Inferred Connectors for From-Scratch Flow
When building from scratch, the Connectors step should infer which systems are needed based on capabilities and workflows configured in steps 1-3. E.g., if you added Messages + a booking workflow, it should suggest PMS + Knowledge Base. Currently from-scratch shows all connectors as setup-required with no intelligence. Would need a Claude API call at the Workflows→Connectors transition.

## Config vs Runtime Conditions (#22)
Check-in agent mixes admin config conditions ("If payment step disabled → skip") with runtime conditions ("If payment fails → retry"). These are fundamentally different but look identical in the UI. Options: different visual treatment, separate section, or accept for v1.

## Parallel Execution Representation (#25)
Front Desk orchestrator executes multiple capability nodes in parallel (LangGraph pattern). Linear workflow model can't represent this. Options: accept as simplification, add parallel group visual, or rely on multi-workflow model. Kevin knows it's a simplification.

## Template-Specific Contextual Intros (#10)
Each template needs its own pre-built workflows with contextual AI chat intros. Sales, Front Desk, Check-in, etc. all need different intro messages and chip suggestions per workflow. Partially done for Sales & Events, needs expansion.

## Capability Gear Icon Deep Config (#17)
The gear icon on each capability card should open meaningful per-tool configuration. Messages = channel selection, Contracts = template settings, Upsells = which offers. Kevin: "where you ultimately need a lot of configuration is really within the tools." Architecture supports it, UI needs building.
