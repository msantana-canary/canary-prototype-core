---
name: Agent Builder — SDR/Sales Team Feedback (April 2026)
description: Live usability test with SDRs/sales reps building a Sales agent. Heavy UI/UX feedback, template store request, drag-and-drop, role-based workflows, sentiment bias concerns.
type: project
originSessionId: 2f7f840c-79ab-4cb2-97a2-e87a167b9f2d
---
## Three User Personas Identified
1. **Basic** — wants pre-built templates that "just work." Doesn't care about prompts, AI, or customization.
2. **Intermediate** — some customization ("heated seats on a car"). Customizes specific parts of a template.
3. **Advanced** — full manual control. Knows what they want, builds from scratch.

The product needs to serve all three. Currently the wizard works for Basic/Intermediate; Advanced Builder serves #3. Missing: the "template store" layer between scratch and full guided.

## Biggest Requests (Ranked by Emphasis)

### 1. Template Store / Library
Pre-built workflows that have worked for other properties. User picks, customizes specific parts, deploys. "Steve Jobs says you don't want the customer to think" — just give them something that works out of the box.

**Distinction from current templates:** current templates are agent-level (Front Desk Agent, Voice AI Agent). The SDRs want workflow-level templates inside an agent (e.g., "Indian wedding inquiry response" workflow someone else built).

### 2. Team Templates + Duplication
Save a workflow as a team template. Others can duplicate and edit without changing the original. Critical for roles hierarchy (director's workflow vs. sales manager vs. sales associate — same dashboard, different duties).

**Reference:** Rattle (Salesforce tool) does this — admin creates templates for everyone, individuals duplicate + modify.

### 3. Drag-and-Drop Workflow Builder
Current text-heavy interface is overwhelming for front-office staff. Request: visual GUI with draggable steps, arrows pointing between them. "Our generation does not read that much. Attention spans are short."

**Miguel's counter:** splitting/branching in the UI gets overly complicated. Treat each forking path as a separate workflow that can be invoked. But reordering via drag is fair.

**Hotel staff reality:** not tech-savvy, resist training, don't want to consult IT. UI must be simple enough to use without help.

### 4. Testing / Sandbox Environment
Virtual test mode to validate workflows before deploying to real customers. "Is there a way to test this? Like a virtual machine sort of thing?"

### 5. Call Routing by Salesforce Account Owner
If a customer is assigned to a specific salesperson in Salesforce, calls from their number should route directly to that person (not through the agent). "If they're connected to my Salesforce, transfer to me."

### 6. Urgent Call Flagging — Words Only, Not Tone
Detect urgency from specific words used, NOT tonality. **Tone-based sentiment analysis is a racial-bias slippery slope** ("Hong Kongers sound angry by default"). AI must not profile people. Words only.

Current messaging already does word-based anger detection. Voice should follow the same rule.

## Validated Use Cases (Real Hotel Workflows)

### Airline Crew Bookings (Maui DoS-M, 4 Luxury Hotels)
Airlines send Excel sheets with room requirements but no guest info. Someone's full-time job at his hotel is uploading this to the PMS. Currently using AI to screen reports — would adopt a structured agent instantly. **This is a standard practice across airline-hotel partnerships.**

### Event Sales — Indian & Destination Weddings
After conferences, big fat Indian weddings and destination weddings drive the events industry. Wedding planners reaching out with high-value inquiries. Entitlement is "next level" in these markets — customers want to talk to the director, not an agent.

### Speed of Response (SJ's Pinned Metric)
1 salesperson, 5 simultaneous calls = missed opportunities. AI picks up the missed ones, asks preliminary questions (event type, budget, headcount), starts the relationship before competitors can field the call.

### Post-Booking Follow-ups
Agent reminds sales staff about upcoming deadlines and clients who haven't been contacted recently. Reads the Canary dashboard, knows the timeline.

### Social Media Research for Personalization
Pull from Instagram, Facebook, LinkedIn to tailor follow-up emails. "Better tailor the follow-up email to help close the deal."

## Cultural/Market Nuance
- **North America:** guests generally skip-to-human when they detect AI
- **Asia:** entitlement culture — "Bobby and I go way back, give me a discount" — won't tolerate AI gatekeeping high-value calls
- High-end properties: repeat guests with direct relationships won't accept AI for their usual contact

**Implication:** personalization isn't just a feature — it's a gate. If the caller is a known high-value contact (via phone number / Salesforce match), skip the agent entirely.

## UI Observations From Live Use
- **Add responsibilities interaction worked well** — natural, intuitive
- **Workflow steps currently too text-heavy** — needs visual treatment
- **Capabilities config modals worked** — "holy shit okay" (surprised delight reaction to per-capability settings)
- **"Route to Sarah Kim directly" conditions** — immediate question: "how does it know which Sarah?" → needs staff-name disambiguation UI
- **Activity feed / live workflow execution** — strong reaction, "you can actually visually see, this is like a live chat" — biggest demo moment

## Integration Confirmations
- **Hilton** already uses Canary Contracts → Delphi automation
- **Google Calendar** integration is planned/needed for post-meeting contract prep
- **Salesforce** integration for account-owner call routing
- **Delphi** — sales CRM that hotels manually input into today
- Miguel: "connectors part is the hardest part"

## Tech Resistance / Self-Hosting Problem
Hotels see LinkedIn posts about vibe coding and think they can build their own AI with Claude. They don't understand:
- Backend complexity
- Security requirements
- Integration maintenance

**Positioning:** "Self-hosting is not realistic for the next 5 years. This is the framework you'd be building on anyway — let us handle it."

## Action Items
1. Test with Maui director of sales and marketing (4 luxury hotels — airline crew use case)
2. Reach out to Albert as hotel-specific use case resource
3. Implement template store for pre-built workflows (BIG feature)
4. Explore drag-and-drop workflow builder
5. Add team template + duplication
6. Get feedback from more SDR team members

## Reference
- Notion: https://www.notion.so/canarytechnologies/33c814686151805382f3e56144a3df4b
