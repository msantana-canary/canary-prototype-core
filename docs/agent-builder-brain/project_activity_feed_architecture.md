---
name: Activity Feed Architecture
description: Activity timeline is three interleaved layers — workflow progression, capability executions (tool calls), and conversation — proving the agent builder works end-to-end
type: project
---

The Activity Feed in the agent builder Overview tab is the proof that the agent builder works. You build workflows in the wizard, deploy the agent, and the activity feed shows those workflows executing against real guest interactions.

## Three Layers (interleaved chronologically)

1. **Workflow progression** — which step the agent is on, what triggered the workflow, what conditions were evaluated
2. **Capability executions** — the tool calls the agent made. Each ACTIVITY card maps to a specific capability the agent has configured. These are the agent's "hands."
3. **Conversation** — guest messages + AI responses happening alongside the workflow execution. This is the agent's "mouth."

The workflow is the brain, the capabilities are the hands, the conversation is the mouth.

## Activity Cards = Capability Tool Calls

Each activity card in the timeline represents a capability being invoked:

| Activity Card | Capability |
|---|---|
| Pre-arrival message sent via SMS | Messaging |
| Check-in link sent via SMS | Messaging |
| Guest viewed check-in link | Check-in |
| Guest completed check-in | Check-in |
| Guest requested Late Checkout | Upsells |
| Mobile key issued — Room 412 | Check-in |
| Incoming call — Handled by AI | Calls |
| Late Checkout approved | Upsells |

## CTAs Link to Capability Product Surfaces

The CTA buttons in expanded activity cards ("View Check-in", "View Transcript") navigate to the product surface of that capability — cross-product navigation showing the agent's work is real and traceable.

## Two Tracks

- **Complete track** — fully resolved interaction. Full narrative: trigger fired, every workflow step completed, conditions evaluated, guest messages woven in, AI responses sent, final outcome. Staff can audit the entire decision chain.
- **In-progress track** — the magic moment for the SJ demo. Watching the agent work in real-time: trigger fired, some steps complete with expandable details, current step processing (spinner/progress bar), future steps pending. Guest messages arriving mid-workflow, AI responding. The whole thing is alive.

## The Demo Throughline

1. Build workflows in the wizard (Steps 1-4)
2. Deploy the agent
3. Open the agent's Overview tab → activity feed
4. Click an in-progress item → watch the workflow executing step by step
5. See which capabilities (tool calls) the agent invoked at each step
6. See the conversation unfolding alongside
7. SJ sees: "this is what the workflow I configured actually DOES"

**Why:** This is the fundamental value proposition of the agent builder — configure once, watch it work autonomously, audit every decision.
**How to apply:** Every activity card should conceptually link to a capability. The timeline data model should support workflow step references and capability type metadata, not just generic "ACTIVITY" labels.
