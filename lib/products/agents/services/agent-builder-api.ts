/**
 * Agent Builder API — Claude Sonnet Integration (v3: tool_use)
 *
 * Uses Claude's tool_use to return structured workflow data reliably.
 * No more JSON parsing — Claude calls a tool with the exact schema we need.
 *
 * Two tools:
 * 1. update_workflow — returns structured workflow + connections + explanation
 * 2. ask_question — returns a conversational response without workflow changes
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Agent, AgentWorkflow, AgentTrigger, CanaryProduct, Connection, BuilderMessage } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ---------------------------------------------------------------------------
// Tool definitions for Claude
// ---------------------------------------------------------------------------

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'update_workflow',
    description: 'Update or create a workflow with steps, conditions, and connections. Use this when the user asks to add, remove, or modify workflow steps or conditions. Always return the FULL workflow with ALL steps — not just the changed ones.',
    input_schema: {
      type: 'object' as const,
      properties: {
        explanation: {
          type: 'string',
          description: 'A brief, friendly explanation of what was changed or created. This is shown to the user in the chat.',
        },
        workflow: {
          type: 'object',
          properties: {
            trigger: { type: 'string', description: 'What triggers this workflow' },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string', enum: ['trigger', 'action', 'condition', 'response', 'handoff'] },
                  label: { type: 'string' },
                  description: { type: 'string' },
                  conditions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        condition: { type: 'string', description: 'The IF clause' },
                        action: { type: 'string', description: 'The THEN clause' },
                      },
                      required: ['id', 'condition', 'action'],
                    },
                  },
                },
                required: ['id', 'type', 'label', 'description'],
              },
            },
            guardrails: { type: 'array', items: { type: 'string' } },
          },
          required: ['trigger', 'steps', 'guardrails'],
        },
        connections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string', enum: ['pms', 'crm', 'pos', 'payment', 'knowledge-base', 'calendar'] },
              status: { type: 'string', enum: ['connected', 'needed', 'optional'] },
              description: { type: 'string' },
            },
            required: ['id', 'name', 'type', 'status'],
          },
        },
        description: {
          type: 'string',
          description: 'A 1-2 sentence summary of what this workflow does.',
        },
      },
      required: ['explanation', 'workflow'],
    },
  },
  {
    name: 'respond',
    description: 'Send a conversational response to the user WITHOUT changing the workflow. Use this for questions, clarifications, explanations, or when you need more information before making changes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        message: {
          type: 'string',
          description: 'The message to show to the user. Supports markdown: **bold**, bullet lists, numbered lists.',
        },
      },
      required: ['message'],
    },
  },
];

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an AI workflow builder for Canary Technologies, a hotel software platform. Hotels use you to create and modify agent workflows that automate operations.

You have two tools:
1. "update_workflow" — Use this when the user wants to ADD, REMOVE, or MODIFY workflow steps or conditions. Always return the FULL workflow with ALL steps, not just changes.
2. "respond" — Use this for questions, clarifications, explanations, or when you need more info.

WORKFLOW STEP TYPES:
- trigger: What starts the workflow
- action: An action the agent performs
- condition: A decision point
- response: Agent sends a message
- handoff: Escalate to staff

STEP CONDITIONS: Steps can have a "conditions" array for IF/THEN logic within that step. Each condition has an id, condition (the IF), and action (the THEN).

RULES:
- Be specific to hospitality/hotel context
- If unclear, use "respond" to ask EXACTLY 1 clarifying question — keep it short and specific
- When MODIFYING an existing workflow: PRESERVE every step and condition unless the user specifically asks to change it. Return the FULL workflow.
- When CREATING a new workflow: keep to 3-6 steps, always include a trigger step
- Never say "human" — say "staff" or "team member"
- Keep explanations concise — 1-2 sentences`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

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
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else {
        // For assistant messages, reconstruct as text (tool results aren't in history)
        messages.push({ role: 'assistant', content: msg.content });
      }
    }

    // Build system prompt with context
    let systemPrompt = SYSTEM_PROMPT;

    // Add wizard context
    if (wizardContext) {
      const capList = wizardContext.capabilities
        .filter((c) => c.enabled)
        .map((c) => c.name)
        .join(', ');

      systemPrompt += `\n\nAGENT CONTEXT:
Template: ${wizardContext.templateName || 'Custom'} (${wizardContext.templateRole || 'Custom role'})
Enabled capabilities: ${capList || 'none'}`;

      if (wizardContext.isNewWorkflow) {
        systemPrompt += `\n\nNEW WORKFLOW MODE: The user is creating a new workflow. Use "respond" to ask 1 focused question at a time. After 2-3 rounds, use "update_workflow" to generate it.`;
      }
    }

    // Add existing agent context
    if (existingAgent) {
      systemPrompt += `\n\nEXISTING AGENT: ${existingAgent.name} (${existingAgent.role}), status: ${existingAgent.status}, tone: ${existingAgent.tone}`;
    }

    // Send current workflow as structured JSON in the system prompt — not as user message prefix
    if (currentWorkflow && currentWorkflow.steps.length > 0) {
      const workflowJson = JSON.stringify({
        trigger: currentWorkflow.trigger,
        steps: currentWorkflow.steps.map((s) => ({
          id: s.id,
          type: s.type,
          label: s.label,
          description: s.description,
          conditions: s.conditions || [],
        })),
        guardrails: currentWorkflow.guardrails,
      }, null, 2);

      systemPrompt += `\n\nCURRENT WORKFLOW (preserve ALL steps and conditions unless user asks to change them):\n${workflowJson}`;
    }

    // Add user message
    messages.push({ role: 'user', content: userMessage });

    // Call Claude with tools
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages,
      tools: TOOLS,
    });

    // Process tool use response
    for (const block of response.content) {
      if (block.type === 'tool_use') {
        if (block.name === 'update_workflow') {
          const input = block.input as {
            explanation: string;
            workflow: AgentWorkflow;
            connections?: Connection[];
            description?: string;
          };

          return {
            response: input.explanation,
            description: input.description,
            workflow: input.workflow,
            connections: input.connections || [],
          };
        }

        if (block.name === 'respond') {
          const input = block.input as { message: string };
          return {
            response: input.message,
            workflow: currentWorkflow ?? { trigger: '', steps: [], guardrails: [] },
            connections: [],
          };
        }
      }

      // Fallback: if Claude returned text instead of tool use
      if (block.type === 'text' && block.text) {
        return {
          response: block.text,
          workflow: currentWorkflow ?? { trigger: '', steps: [], guardrails: [] },
          connections: [],
        };
      }
    }

    // Should not reach here
    return {
      response: 'I didn\'t quite understand that. Could you rephrase what you\'d like to change?',
      workflow: currentWorkflow ?? { trigger: '', steps: [], guardrails: [] },
      connections: [],
    };
  } catch (error: unknown) {
    console.error('Agent builder API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      response: `I encountered an issue: ${errorMessage}. Please try again.`,
      workflow: currentWorkflow ?? { trigger: '', steps: [], guardrails: [] },
      connections: [],
    };
  }
}

/**
 * Generate a short description for a workflow based on its steps.
 */
export async function generateWorkflowDescription(workflow: AgentWorkflow): Promise<string> {
  try {
    const stepsText = workflow.steps
      .map((s, i) => `Step ${i + 1}: ${s.label} — ${s.description}`)
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Write a 1-sentence description (under 25 words) for this hotel agent workflow. No quotes, no markdown, just the sentence.\n\nWorkflow: ${workflow.name || 'Untitled'}\nTrigger: ${workflow.trigger}\nSteps:\n${stepsText}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (textBlock && textBlock.type === 'text') {
      return textBlock.text.trim();
    }
    return '';
  } catch (error) {
    console.error('Failed to generate workflow description:', error);
    return '';
  }
}
