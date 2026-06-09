---
name: Connector Architecture — Property vs Agent Level
description: Connectors are property-level (shared across agents), not agent-level. Status flows, hydration patterns, and the 'unassigned' status concept.
type: project
---

## Core Principle
Connectors are property-level — if Oracle Opera PMS is connected for one agent, it's connected for all. The agent just decides which connectors to USE, not whether they're connected.

## Status Model
- `connected` — property has this integration active
- `setup-required` — property has access but hasn't configured it yet
- `not-available` — integration doesn't exist at this property (e.g., Flexkeeping when using HotSOS)
- `unassigned` — property has it, but this agent doesn't use it (sidebar state)

## Source of Truth
`mockConnectors` in mock-data.ts holds the property-level statuses. The `propertyStatus` Map in ConnectorsStep.tsx provides lookups.

## Status Transitions
- **Remove from grid** → `'unassigned'` (moves to sidebar)
- **Add from sidebar** → restores property-level status via `propertyStatus.get(id)`
- **Setup modal completes** → `'connected'`
- **Not-available** → stays not-available, non-clickable, grayed out

## Hydration (4 entry points, ALL must merge remaining catalog)
1. `startFromTemplate` — template's defaultConnections in grid (with property statuses), remaining as 'unassigned'
2. `startFromScratch` — empty grid, ALL connectors as 'unassigned' in sidebar
3. `selectAgent` for drafts — saved connectors in grid, remaining as 'unassigned'
4. AgentView hydration for deployed agents — agent's connections in grid, remaining as 'unassigned'

## Save (saveDraft + deployAgent)
Filter OUT `'unassigned'` and `'not-available'` before persisting. Only save connectors the agent actually uses.

**Why:** We kept having bugs where connectors appeared/disappeared or lost their status because the grid/sidebar split was based on status instead of assignment. The `'unassigned'` status cleanly separates "available at property" from "used by this agent."
