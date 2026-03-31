/**
 * Agent Builder API — Claude Sonnet Integration
 *
 * Processes natural language input and returns structured agent
 * configuration: workflow steps, connections, guardrails.
 *
 * Now accepts wizard context (triggers, connections, capabilities) for
 * context-aware workflow generation during the wizard flow.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Agent, AgentWorkflow, AgentTrigger, CanaryProduct, Connection, BuilderMessage } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are an AI agent builder for Canary Technologies, a hotel software platform. Hotels use you to create AI agents that automate operations.

When a user describes what they want an agent to do, you generate a structured workflow and identify required integrations.

AVAILABLE WORKFLOW NODE TYPES:
- trigger: What starts the agent (e.g., "Inbound email to sales@hotel.com")
- action: An action the agent performs (e.g., "Check event space availability")
- condition: A decision point (e.g., "Is inquiry urgent?")
- response: Agent sends a message (e.g., "Send availability response with CTA")
- handoff: Escalate to human staff (e.g., "Transfer to sales manager")

AVAILABLE CANARY PRODUCTS (capabilities the agent can use):
- Messages: Guest messaging across SMS, WhatsApp, and OTA channels
- Calls: Voice AI for inbound and outbound phone calls
- Check-in: Digital check-in with ID verification and payment capture
- Checkout: Digital checkout with folio review and guest feedback
- Upsells: Room upgrades, early check-in, late checkout, and add-on offers
- Contracts: Digital contracts with e-signatures for events and groups
- Authorizations: Credit card authorization forms and payment verification
- Digital Tips: Digital tipping for housekeeping and staff
- Payment Links: Send payment collection links to guests
- Knowledge Base: AI-powered answers from hotel FAQs and policies

AVAILABLE CONNECTION TYPES (external systems):
- pms: Property Management System (Opera, Mews, etc.)
- crm: Customer Relationship Management (Salesforce, etc.)
- pos: Point of Sale system
- payment: Payment processing (Stripe, Canary Payments)
- knowledge-base: Hotel knowledge base (FAQs, policies)
- calendar: Calendar integration (Google Calendar, Outlook)

CAPABILITY TIERS:
- included: Basic capabilities every hotel gets
- core: Standard capabilities most hotels buy
- premium: Advanced capabilities

RULES:
- Be specific to hospitality/hotel context
- If the user asks for something outside hospitality, politely redirect
- If the user's request is unclear or ambiguous, ASK CLARIFYING QUESTIONS before making changes. Put the clarifying question in the "response" field and return the workflow UNCHANGED.
- Steps can have a "conditions" array for step-scoped conditional logic. Each condition has an "id", "condition" (the IF clause), and "action" (the THEN clause). Use this for variations within a step, not for branching the overall flow.

CRITICAL — MODIFYING AN EXISTING WORKFLOW:
When the user provides a current workflow context (shown as [Current workflow: ...]), you are MODIFYING that workflow, NOT creating a new one. You MUST:
1. PRESERVE every existing step exactly as-is unless the user specifically asks to change it
2. PRESERVE all existing conditions on every step unless the user specifically asks to change them
3. Only add, remove, or modify the specific step or condition the user requested
4. Return the FULL workflow with ALL original steps and conditions intact, plus the requested changes
5. Keep the same step IDs, labels, descriptions, and conditions for unchanged steps
6. Do NOT simplify, reorganize, or reduce the number of steps unless explicitly asked

When creating a NEW workflow (no current workflow context):
- Keep workflows to 4-8 steps
- Always include a trigger as the first element
- Always include at least 1 guardrail
- Include a pre-flight check in your response listing required connections

RESPONSE FORMAT:
- When the user asks to ADD, REMOVE, or MODIFY steps/conditions, respond with valid JSON (no markdown, no code blocks, just pure JSON):
- When the user asks a QUESTION about the workflow (e.g., "why does this work?" or "explain step 3"), respond with JUST the JSON but put your full explanation in the "response" field. Return the workflow UNCHANGED.
- NEVER wrap JSON in markdown code blocks. NEVER add text before or after the JSON object.

JSON format:
{
  "response": "Human-readable explanation of what was built or changed",
  "description": "1-2 sentence description of what this agent does and its primary purpose",
  "workflow": {
    "trigger": "Description of what triggers this agent",
    "steps": [
      { "id": "step-1", "type": "trigger|action|condition|response|handoff", "label": "Short label", "description": "What this step does", "tier": "included|core|premium", "conditions": [{ "id": "cond-1", "condition": "If X", "action": "Do Y" }] }
    ],
    "guardrails": ["Safety rule 1", "Safety rule 2"]
  },
  "connections": [
    { "id": "conn-1", "name": "Connection Name", "type": "pms|crm|pos|payment|knowledge-base|calendar", "status": "connected|needed|optional", "description": "Why this connection is needed" }
  ]
}

The "description" field should be a concise, plain-language summary of what the agent does. Always populate it.`;

export interface WizardContext {
  triggers: AgentTrigger[];
  connections: Connection[];
  capabilities: CanaryProduct[];
  templateName?: string;
  templateRole?: string;
  isNewWorkflow?: boolean;
}

export interface AgentBuilderResponse {
  response: string;
  description?: string;
  workflow: AgentWorkflow;
  connections: Connection[];
}

export async function generateAgentWorkflow(
  userMessage: string,
  conversationHistory: BuilderMessage[],
  currentWorkflow: AgentWorkflow | null,
  existingAgent?: Agent,
  wizardContext?: WizardContext,
): Promise<AgentBuilderResponse> {
  try {
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];

    // Add conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.role === 'assistant' && msg.workflowUpdate
          ? `${msg.content}\n\n[Current workflow has ${msg.workflowUpdate.steps.length} steps]`
          : msg.content,
      });
    }

    // Build system prompt
    let systemPrompt = SYSTEM_PROMPT;

    // Add wizard context if provided
    if (wizardContext) {
      const triggerList = wizardContext.triggers
        .map((t) => {
          const channels = t.channels.filter((ch) => ch.enabled).map((ch) => ch.channel).join(', ');
          return `"${t.intent}" (channels: ${channels || 'none'})`;
        })
        .join('; ');
      const connList = wizardContext.connections
        .map((c) => `${c.name} [${c.type}] — ${c.status}`)
        .join(', ');
      const capList = wizardContext.capabilities
        .map((c) => `${c.name} (${c.enabled ? 'enabled' : 'disabled'}, ${c.tier})`)
        .join(', ');

      systemPrompt += `\n\nWIZARD CONFIGURATION (user has already selected these in the wizard):
Template: ${wizardContext.templateName || 'Custom'} (${wizardContext.templateRole || 'Custom role'})
Triggers: ${triggerList || 'none configured'}
Connections: ${connList || 'none configured'}
Capabilities: ${capList || 'none configured'}

Use this context to generate a workflow that aligns with the user's existing configuration. Reference the triggers, connections, and capabilities they've already selected.`;

      // Add template-specific guidance for new workflow creation
      if (wizardContext.isNewWorkflow) {
        const templateGuidance: Record<string, string> = {
          'Sales & Events Agent': `This is a Sales & Events agent. When helping build a new workflow, ask about:
- What triggers this workflow? (new inquiry, follow-up, contract stage, post-event?)
- What type of events does this cover? (weddings, corporate, conferences, social?)
- What's the desired response time?
- Should this workflow handle any specific conditions? (high-value events, returning clients, specific channels?)
- What systems need to be checked? (PMS availability, CRM history, calendar?)
- What's the handoff point to human staff?`,
          'Front Desk Agent': `This is a Front Desk agent. When helping build a new workflow, ask about:
- What triggers this workflow? (guest call, walk-in request, service issue?)
- What types of requests should this handle? (information, room changes, complaints, amenities?)
- Should it check guest identity or reservation before responding?
- When should it escalate to a manager vs handle independently?
- What follow-up actions are needed after resolution?`,
          'Reservations Agent': `This is a Reservations agent. When helping build a new workflow, ask about:
- What triggers this workflow? (new booking request, modification, cancellation?)
- What channels does this cover? (phone, email, OTA, website?)
- What availability checks are needed? (room type, dates, rate codes?)
- What confirmation actions are required? (email, SMS, payment capture?)
- When should it offer alternatives vs decline?`,
        };

        const guidance = templateGuidance[wizardContext.templateName || ''] || `When helping build a new workflow, start by asking:
- What should trigger this workflow?
- What is the expected outcome?
- What steps should happen in between?
- Are there any conditions or variations to handle?`;

        systemPrompt += `\n\nNEW WORKFLOW MODE: The user is creating a brand new workflow from scratch. Be GUIDED and CONVERSATIONAL:
1. Start by asking what this workflow should do and what triggers it
2. Ask 2-3 focused clarifying questions based on their response (don't ask everything at once)
3. Once you have enough context, generate the workflow
4. Keep it focused — 3-6 steps is ideal for a new workflow

${guidance}

Remember: Ask questions BEFORE generating. Don't generate a full workflow from a vague description — gather requirements first.`;
      }
    }

    // Add existing agent context
    if (existingAgent) {
      const capList = existingAgent.capabilities
        .map((c) => `${c.name} (${c.enabled ? 'enabled' : 'disabled'}, ${c.tier})`)
        .join(', ');
      const connList = existingAgent.connections
        .map((c) => `${c.name} [${c.type}] — ${c.status}`)
        .join(', ');
      const stepLabels = existingAgent.workflow.steps.map((s) => s.label).join(' -> ');
      const guardrails = existingAgent.workflow.guardrails.join(', ');
      const triggerList = existingAgent.triggers
        .map((t) => {
          const channels = t.channels.filter((ch) => ch.enabled).map((ch) => ch.channel).join(', ');
          return `"${t.intent}" (channels: ${channels})`;
        })
        .join('; ');

      systemPrompt += `\n\nCURRENT AGENT CONTEXT:
Name: ${existingAgent.name}
Role: ${existingAgent.role}
Description: ${existingAgent.description}
Status: ${existingAgent.status}
Tone: ${existingAgent.tone}
Triggers: ${triggerList}
Workflow: ${existingAgent.workflow.trigger} -> ${stepLabels}
Guardrails: ${guardrails}
Connections: ${connList}
Capabilities: ${capList}

When the user asks questions about this agent, answer based on this context. You can describe the agent's workflow, connections, capabilities, guardrails, and status. If the user wants to modify the agent, generate an updated workflow/connections as usual.`;
    }

    // Add current workflow context if exists — send FULL detail so Claude preserves it
    let contextPrefix = '';
    if (currentWorkflow && currentWorkflow.steps.length > 0) {
      const stepsDetail = currentWorkflow.steps.map((s, i) => {
        let detail = `Step ${i + 1} (id: ${s.id}): "${s.label}" — ${s.description}`;
        if (s.conditions && s.conditions.length > 0) {
          detail += `\n  Conditions: ${s.conditions.map(c => `${c.condition} → ${c.action}`).join('; ')}`;
        }
        return detail;
      }).join('\n');
      contextPrefix = `[CURRENT WORKFLOW — you MUST preserve all steps and conditions exactly unless the user asks to change them]\nTrigger: "${currentWorkflow.trigger}"\n${stepsDetail}\nGuardrails: ${currentWorkflow.guardrails.join('; ')}\n\n`;
    }

    messages.push({
      role: 'user',
      content: contextPrefix + userMessage,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages,
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const parsed = parseJsonResponse(textBlock.text);
    return parsed;
  } catch (error: unknown) {
    console.error('Agent builder API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      response: `I encountered an issue: ${errorMessage}. Please try again or rephrase your request.`,
      workflow: currentWorkflow ?? { trigger: '', steps: [], guardrails: [] },
      connections: [],
    };
  }
}

function parseJsonResponse(text: string): AgentBuilderResponse {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Direct JSON.parse failed:', (e as Error).message, 'First 100 chars:', text.slice(0, 100));
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // Fall through
      }
    }

    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]);
      } catch {
        // Fall through
      }
    }

    // Last resort: try to extract just the "response" field from the text
    const responseFieldMatch = text.match(/"response"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (responseFieldMatch) {
      return {
        response: responseFieldMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
        workflow: { trigger: '', steps: [], guardrails: [] },
        connections: [],
      };
    }

    // If nothing works, return the raw text but truncate if it looks like JSON
    return {
      response: text.startsWith('{') ? 'I updated the workflow. Check the steps on the left for changes.' : text,
      workflow: { trigger: '', steps: [], guardrails: [] },
      connections: [],
    };
  }
}
