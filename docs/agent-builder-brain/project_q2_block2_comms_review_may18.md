---
name: q2-block-2-comms-review-may-18-2026
description: "Key strategic decisions from Q2 Block 2 review. Agent Studio → Agent Knowledge rename, \"copy Claude's UI\" directive from SJ, email scoped to read-only, messaging sidebar collapse, web chat DOM control exploration."
metadata: 
  node_type: memory
  type: project
  originSessionId: 8f91d479-ca29-4a79-a6be-eefacb9ba66f
---

## Agent Builder / Agent Knowledge

**SJ's direct directive:** "When you show me a design of whatever we're doing, I'm literally gonna ask, can you show me how they would do this on Claude? And like, I don't want there to be differences."

**Why:** He explicitly called out the Agent Builder prototype exercise — "we created a whole different UI with agents and all that, and it turned out we probably should have just copied Claude's UI." Rationale: hundreds of millions trained on Claude's UX, don't retrain customers on different patterns. Hospitality differentiation belongs "under the hood" (PMS integrations), not in the UI.

**How to apply:** Future Agent Builder/Knowledge UI work should start from Claude's paradigms (chat panel, side tools, connectors) not custom dashboards. The current prototype is still valuable as a territory exploration, but production direction is Claude-first.

**Scope clarification:** "We're not building a greenfield agent studio. Current focus is configuring existing agents (voice, messaging, web chat)." Full builder is "currently just in our heads." ~2/3 of Agent Knowledge capacity redirected to VoIP this block.

**4 workstreams confirmed:** Configuration, Observability, Testing, Custom Actions — map exactly to what the prototype covers.

**Venli.ai reference:** SJ wants team to hyper-focus on 2-person hotel tech startups, not incumbents. Venli.ai (Norwegian) nailed connected systems + natural language queries for hotels.

## Email as Channel
Hard line drawn: read-only audit trail + AI automation, NOT full email client. SJ: "We're the intelligence layer, the orchestrator, not an email client." Simple text-only replies may be supported (like SMS/OTA), but never rich email composition. Writing/editing should launch external email client.

**Why:** Scope creep concern. "Once you put it out there, you're then compared to Gmail/Outlook." Kevin: "I don't want to hear six weeks from now that hotels are requesting HTML emails."

## Messaging
- **Collapsing sidebar for messaging:** Messaging is more "command center" than standard tab. [[project_guest_journey_timeline_redesign]]
- **Action item:** Jake Wilhelm + Miguel to discuss messaging nav redesign and collapsing sidebar
- **Agentic architecture migration:** Guest messaging → agentic arch (like WebChat), ~2 weeks
- **Guest profiles in side panel:** Redesign for holistic guest + reservation view

## Web Chat
- SJ: Control hotel website DOM rather than building booking flows in chat widget
- Mobile: Hand off to SMS/WhatsApp for persistence (web chat on mobile is "worthless" for DOM control)
- Desktop: Make search easier using the full page real estate, not cramming into bottom-right widget
- Web chat is lowest priority comm SKU → room to experiment with sharp pivots
- Need data on mobile vs desktop split + where booking value comes from

## Langham
- Must land by end of July (Moengage contract expires)
- Commitments: mobile attachments + loyalty ID as identifier
- SJ suspicious about why Langham chose Canary over Alliance — "doesn't add up"
- Check with Jimmy Ferrer weekly on timeline

## Other
- Message scheduler re-architecture: state machine pattern to replace brittle Python expressions
- AI support agent for "why did this send" tickets (1 week effort)
- Product observability: reservation lifecycle events in conversation thread
- Team: 1 messaging engineer donated to voice for entire block
