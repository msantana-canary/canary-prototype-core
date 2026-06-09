---
name: Draft Agent Resume Flow
description: How drafts work — save, resume, deploy, and the hydration pattern that avoids duplicates
type: project
---

## Draft Flow
1. User creates agent (template or scratch), clicks X → save warning → "Save as draft"
2. Draft appears on dashboard with "Draft" status badge
3. Click draft → reopens WIZARD (not detail view) at step 1 with all data pre-filled
4. Save draft again → UPDATES existing draft (no duplicate) via `selectedAgentId` check
5. Deploy from draft → REPLACES draft with active agent (same ID)

## Key Implementation Details
- `selectAgent` checks `agent.status === 'draft'` → routes to `currentView: 'wizard'` instead of `'detail'`
- `AgentBuilderPage` shows WizardLayout when `wizardTemplate || selectedAgentId` (not just wizardTemplate)
- Hydration in `selectAgent` populates ALL wizard fields: name, description, capabilities, workflows, connectors, profile fields
- Connector hydration merges saved connectors with remaining property catalog (same pattern as AgentView)
- `saveDraft` and `deployAgent` check `state.selectedAgentId` — if set, replace existing agent instead of pushing new

**Why:** Without the `selectedAgentId` check, every save created a new agent. Without the wizard routing, drafts opened the deployed agent view (which shows empty metrics/activity for an undeployed agent).
