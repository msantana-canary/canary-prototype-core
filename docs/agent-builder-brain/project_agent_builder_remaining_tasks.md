---
name: Agent Builder — Remaining Tasks (May 13, 2026)
description: All 6 prioritized tasks from Kevin + SDR feedback complete. Only untasked SDR ideas remain. Template library UI polish deferred per Miguel.
type: project
originSessionId: 129047c7-9ab9-4428-8977-3b82d22ec378
---
## All Completed (commit 9039675, pushed to origin/demo/agent-builder)
1. ✅ **Profile slim-down** — merged Rules/Guidelines + Guardrails into one textarea
2. ✅ **Step reordering** — up/down arrow buttons in editable workflow visualizer
3. ✅ **Workflow template library** — 15 generic templates, 5 categories + Team tab, inline preview, "Use" clones into agent
4. ✅ **Team templates + duplication** — "Save as Team Template" from 3-dot menu, purple "Shared by" badges, 3 pre-seeded + user-created
5. ✅ **Workflow hierarchy visualization** — primary/sub grouping, blue accent tiles, tree-branch indentation, cross-workflow condition refs (invokesWorkflowId), condition chips in visualizer. Check-in + Sales show hierarchy; Front Desk stays flat.
6. ✅ **Workflow test sandbox (Phase A)** — split-screen test mode, persona picker, animated simulated runs, step-by-step event feed (trigger/guest/agent/condition/guardrail), active step glow, 8 scenarios across 6 workflows

## Deferred
- **Template library UI polish** — Miguel has UI thoughts to revisit later (May 12 note)
- **Test sandbox Phase B** — live interactive mode with real Claude API responses (grounded in workflow definition)
- **Test sandbox Phase C** — save/replay test runs for demo slides

## Not Yet Tasked (from SDR feedback)
- Call routing by Salesforce account owner
- Urgent call flagging: words only, NOT tone (racial bias concern)
- Airline crew bookings use case
- Social media research for personalization

## Key Files
- Branch: `demo/agent-builder`
- Worktree: `~/Documents/Claude-Projects/canary-prototype-worktrees/agent-builder/`
- New files: `WorkflowTemplateLibrary.tsx`, `WorkflowTestMode.tsx`, `workflow-templates.ts`, `workflow-test-scenarios.ts`
- Modified: `WorkflowOverview.tsx`, `WorkflowVisualizer.tsx`, `AgentView.tsx`, `WorkflowsStep.tsx`, `store.ts`, `types.ts`, `mock-data.ts`
