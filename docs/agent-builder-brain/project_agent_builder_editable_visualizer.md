---
name: Editable Workflow Visualizer — Plan (Not Yet Built)
description: Plan for inline-editable workflow visualizer for the Advanced Builder mode. Three editor modes based on agent origin. Agreed design decisions.
type: project
originSessionId: 129047c7-9ab9-4428-8977-3b82d22ec378
---
## Status: BUILT AND WIRED — verified May 2026

## Three Workflow Editor Modes

Determined by `agent.templateId`:
- `templateId` exists → **Chat mode** (read-only visualizer + chat sidebar). Template/guided agents.
- `templateId` undefined → **Manual mode** (editable visualizer, full width, no chat). Advanced Builder agents.
- Deployed agents retain their creation mode permanently.

## Implementation: Persist templateId on Agent

Add `templateId?: string` to Agent type. Populate in:
- `saveDraft`: `templateId: state.wizardTemplate?.id`
- `deployAgent`: same
- `startAdvancedBuild`: no template, so `templateId` stays undefined
- Existing deployed mock agents: add `templateId` matching their template origin

## Editable Visualizer Design

The same WorkflowVisualizer component but with an `editable` prop. When editable:

### Trigger Card (always present, NOT deletable)
- Trigger name: `<input>` field
- Trigger description: `<input>` field
- Blue bg, lightning bolt — same visual as current
- "Immutable first step" — always exists, can edit but not remove

### Step Cards (editable)
- Step label: `<input>` field
- Step description: `<textarea>` field  
- No step type selector (skip — description IS the spec, system infers type)
- Delete button (trash icon) per step
- Deployed agents: delete shows confirmation modal ("This affects the live workflow")
- Draft agents: delete without confirmation

### Conditions (per step)
- Single `<textarea>` labeled "Conditions (optional)"
- User writes one condition per line
- Rendered as bullet list in read-only mode
- Simpler than structured IF/THEN inputs

### Add Step
- Button at bottom of visualizer: "+ Add Step"
- Creates blank step card with empty fields

### Step Renumbering
- Automatic from array index
- Delete step 3 of 6 → steps 4-6 become 3-5

### Fresh Workflow Skeleton
- Trigger card (blank, editable) + Step 1 (blank) are the starting state
- "Add Step" button below to grow

### Full Width
- In manual mode: no chat sidebar, visualizer uses full container width
- In chat mode: visualizer on left + chat sidebar 400px on right (existing)

## What We're NOT Building
- Drag-and-drop reordering (steps are added in order)
- AI assistance in the manual editor
- Parallel step support
- Visual condition branching (still linear)
- Step type selector (not needed)
- Undo functionality

## Context
- Advanced Builder = for enterprise IT teams who know what they want
- Template/Guided = for hotel managers who need hand-holding
- The choice is made at creation time and persists through deployment
- Kevin's framework: templates for hotel managers, blank-slate for IT teams
