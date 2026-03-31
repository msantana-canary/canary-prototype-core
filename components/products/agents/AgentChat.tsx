'use client';

/**
 * AgentChat — Persistent chat panel for the agent builder.
 *
 * Used in two contexts:
 * 1. Wizard workflow step — receives wizard context (triggers, connections, capabilities)
 * 2. Agent detail view — receives existingAgent context
 *
 * Handles user input, calls the AI API, updates the store with workflow
 * and connection changes, signals tab switches to the parent, and
 * progressively reveals AI responses with a typing effect.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiSendOutline } from '@mdi/js';
import {
  CanaryButton,
  CanaryChip,
  CanaryTextArea,
  ButtonType,
  ButtonSize,
  ChipType,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import { generateAgentWorkflow } from '@/lib/products/agents/services/agent-builder-api';
import type { Agent, AgentViewTab } from '@/lib/products/agents/types';

interface AgentChatProps {
  onTabSwitch: (tab: AgentViewTab, animate?: boolean) => void;
  existingAgent?: Agent;
  /** Sidebar mode: hides header, uses compact styling */
  sidebar?: boolean;
}

const SCRATCH_CHIPS = [
  'Handle guest inquiries',
  'Automate front desk tasks',
  'Manage event bookings',
];

const TEMPLATE_CHIP_MAP: Record<string, string[]> = {
  'Front Desk Agent': ['Add complaint handling workflow', 'Set up room change requests', 'Configure call routing'],
  'Sales & Events Agent': ['Set response time to under 5 minutes', 'Add ACH payment preference', 'Include contract generation step'],
  'Reservations Agent': ['Add modification handling', 'Set up cancellation workflow', 'Include booking confirmation'],
  'Concierge Agent': ['Add restaurant recommendation flow', 'Set up activity booking', 'Include transportation arrangements'],
  'Voice AI Agent': ['Configure call greeting', 'Add voicemail handling', 'Set up call transfer rules'],
  'Guest Messaging Agent': ['Add multilingual support', 'Set up OTA channel handling', 'Configure auto-responses'],
  'Housekeeping Agent': ['Add room inspection workflow', 'Set up priority scheduling', 'Configure turndown service'],
  'Service Task Agent': ['Add follow-up questions flow', 'Set up ticket assignment', 'Configure escalation rules'],
  'No-Show Prevention Agent': ['Set outreach schedule', 'Add SMS follow-up', 'Configure charge rules'],
};

function getTemplateChips(templateName: string): string[] {
  return TEMPLATE_CHIP_MAP[templateName] ?? ['Customize the workflow', 'Add a new capability', 'Modify the guardrails'];
}

export default function AgentChat({ onTabSwitch, existingAgent, sidebar }: AgentChatProps) {
  const {
    builderMessages,
    addBuilderMessage,
    isGenerating,
    setIsGenerating,
    setBuilderWorkflow,
    setBuilderConnections,
    setAgentDescription,
    agentName,
    wizardTemplate,
    wizardTriggers,
    wizardConnections,
    wizardCapabilities,
  } = useAgentStore();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Typing effect state
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingProgress, setTypingProgress] = useState(0);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Seed initial AI message in sidebar mode — context-aware per workflow
  const currentWorkflow = useAgentStore((s) => s.currentWorkflow);
  const seededWorkflowRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sidebar || !currentWorkflow?.id) return;
    // Only seed once per workflow (reset when switching workflows)
    if (seededWorkflowRef.current === currentWorkflow.id) return;
    seededWorkflowRef.current = currentWorkflow.id;

    const name = currentWorkflow.name || '';
    const stepCount = currentWorkflow.steps.length;
    const isNew = stepCount === 0;
    const hasConditions = currentWorkflow.steps.some((s) => s.conditions && s.conditions.length > 0);

    if (isNew) {
      const templateName = wizardTemplate?.name || 'your agent';
      addBuilderMessage({
        role: 'assistant',
        content: `Let's build a new workflow for your **${templateName}**.\n\nTo get started, tell me:\n- What should trigger this workflow?\n- What's the goal or expected outcome?\n- Are there any specific steps or conditions you already have in mind?\n\nDescribe what you need and I'll create the workflow for you.`,
      });
    } else {
      addBuilderMessage({
        role: 'assistant',
        content: `You're viewing **${name}** — a ${stepCount}-step workflow.${hasConditions ? ' It includes conditional logic for handling different scenarios at key steps.' : ''}\n\nIf you'd like to make changes — add a step, modify conditions, or adjust the flow — just describe what you need.`,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebar, currentWorkflow?.id]);

  // Auto-scroll on new messages or typing progress
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [builderMessages, isGenerating, typingProgress]);

  // When a new assistant message appears, start typing effect
  useEffect(() => {
    if (builderMessages.length === 0) return;
    const lastMsg = builderMessages[builderMessages.length - 1];
    if (lastMsg.role !== 'assistant' || lastMsg.id === typingMessageId) return;

    const hasUserMessages = builderMessages.some((m) => m.role === 'user');
    if (!hasUserMessages) return;

    const words = lastMsg.content.split(' ');
    setTypingMessageId(lastMsg.id);
    setTypingProgress(0);

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    let wordIndex = 0;
    const interval = setInterval(() => {
      wordIndex++;
      if (wordIndex >= words.length) {
        clearInterval(interval);
        setTypingProgress(words.length);
        setTimeout(() => setTypingMessageId(null), 100);
      } else {
        setTypingProgress(wordIndex);
      }
    }, 40);

    typingIntervalRef.current = interval;
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builderMessages.length]);

  const handleSend = useCallback(
    async (text?: string) => {
      const message = text || inputValue.trim();
      if (!message || isGenerating) return;

      addBuilderMessage({ role: 'user', content: message });
      setInputValue('');
      setIsGenerating(true);

      try {
        const freshState = useAgentStore.getState();

        // Build wizard context for the API — includes template info for guided questions
        const isNewWorkflow = freshState.currentWorkflow === null || freshState.currentWorkflow.steps.length === 0;
        const wizardContext = {
          triggers: freshState.wizardTriggers,
          connections: freshState.wizardConnections,
          capabilities: freshState.wizardCapabilities,
          templateName: freshState.wizardTemplate?.name,
          templateRole: freshState.wizardTemplate?.role,
          isNewWorkflow,
        };

        const result = await generateAgentWorkflow(
          message,
          freshState.builderMessages,
          freshState.currentWorkflow,
          existingAgent,
          wizardContext,
        );

        if (result.description) {
          setAgentDescription(result.description);
        }

        if (result.workflow && Array.isArray(result.workflow.steps) && result.workflow.steps.length > 0) {
          setBuilderWorkflow(result.workflow);
          if (!existingAgent) {
            onTabSwitch('workflows', true);
          }
        }

        if (result.connections && Array.isArray(result.connections) && result.connections.length > 0) {
          setBuilderConnections(result.connections);
          if (!existingAgent && !result.workflow?.steps?.length) {
            onTabSwitch('connectors');
          }
        }

        addBuilderMessage({
          role: 'assistant',
          content: result.response,
          workflowUpdate: result.workflow.steps.length > 0 ? result.workflow : undefined,
          connectionsUpdate: result.connections.length > 0 ? result.connections : undefined,
        });
      } catch (error: unknown) {
        console.error('AgentChat handleSend error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addBuilderMessage({
          role: 'assistant',
          content: `I encountered an issue: ${errorMessage}. Please try again or rephrase your request.`,
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [inputValue, isGenerating, addBuilderMessage, setIsGenerating, setBuilderWorkflow, setBuilderConnections, setAgentDescription, onTabSwitch, existingAgent],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Listen for programmatic send events
  useEffect(() => {
    const listener = (e: Event) => {
      const { text } = (e as CustomEvent<{ text: string }>).detail;
      if (text) handleSend(text);
    };
    window.addEventListener('agent-builder:send-message', listener);
    return () => window.removeEventListener('agent-builder:send-message', listener);
  }, [handleSend]);

  const hasUserMessages = builderMessages.some((m) => m.role === 'user');
  const isExistingContext = !!existingAgent && !hasUserMessages;

  const chips = isExistingContext
    ? [
        `How is ${existingAgent.name} performing?`,
        'Show me the connections',
        'What are the guardrails?',
      ]
    : wizardTemplate
    ? getTemplateChips(wizardTemplate.name)
    : SCRATCH_CHIPS;

  const headerSubtitle = existingAgent
    ? 'Ask me anything about this agent or request changes'
    : 'Describe what you want and I will build the workflow';

  const getDisplayText = (msg: { id: string; content: string }) => {
    if (msg.id === typingMessageId) {
      const words = msg.content.split(' ');
      return words.slice(0, typingProgress).join(' ');
    }
    return msg.content;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: colors.colorWhite,
      }}
    >
      {/* Chat header — hidden in sidebar mode (sidebar has its own header) */}
      {!sidebar && (
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${colors.colorBlack6}`,
            flexShrink: 0,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: colors.colorBlack2 }}>
            {agentName || 'Agent Builder'}
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.colorBlack4, marginTop: 2 }}>
            {headerSubtitle}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {isExistingContext && (
          <ChatBubble
            role="assistant"
            content={`You're viewing **${existingAgent.name}**, the ${existingAgent.role}. Ask me anything about this agent or tell me what you'd like to modify.`}
          />
        )}

        {/* Initial AI message is now added to builderMessages via useEffect below */}

        {builderMessages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={getDisplayText(msg)} />
        ))}

        {isGenerating && (
          <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}>
            <style>{`
              @keyframes chatPulse {
                0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                40% { opacity: 1; transform: scale(1); }
              }
            `}</style>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: colors.colorBlack4,
                  animation: 'chatPulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        )}

        {!hasUserMessages && !isGenerating && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {chips.map((chip) => (
              <CanaryChip
                key={chip}
                label={chip}
                chipType={ChipType.SELECTABLE}
                onClick={() => handleSend(chip)}
              />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {/* Composer — messaging-style: bordered box, textarea top, divider, send button bottom-right */}
      <div style={{ padding: sidebar ? '16px 16px 40px 16px' : '10px 16px 14px' }}>
        <div
          style={{
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          {/* Auto-resizing textarea */}
          <div style={{ padding: 8 }}>
            <textarea
              ref={(el) => {
                if (el) {
                  el.style.height = '0px';
                  el.style.height = Math.max(22, el.scrollHeight) + 'px';
                }
              }}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                const el = e.target;
                el.style.height = '0px';
                el.style.height = Math.max(22, el.scrollHeight) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={sidebar ? 'Describe what you want to build...' : 'Describe what your agent should do...'}
              autoComplete="off"
              rows={1}
              style={{
                width: '100%',
                resize: 'none',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                lineHeight: '22px',
                color: '#000',
                fontFamily: "var(--font-roboto), 'Roboto', sans-serif",
                minHeight: 22,
                overflow: 'hidden',
              }}
            />
          </div>
          {/* Divider */}
          <div style={{ height: 1, backgroundColor: '#E5E5E5' }} />
          {/* Toolbar: just Send button on the right */}
          <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <CanaryButton
              type={ButtonType.PRIMARY}
              size={ButtonSize.COMPACT}
              onClick={() => handleSend()}
              isDisabled={!inputValue.trim() || isGenerating}
            >
              Send
            </CanaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';

  const renderInline = (text: string, keyPrefix: string) => {
    // Handle **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
    });
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = () => {
      if (!currentList) return;
      const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
      elements.push(
        <ListTag key={`list-${elements.length}`} style={{ margin: '4px 0', paddingLeft: 20, listStyle: currentList.type === 'ul' ? 'disc' : 'decimal' }}>
          {currentList.items.map((item, i) => (
            <li key={i} style={{ marginBottom: 2 }}>{renderInline(item, `li-${elements.length}-${i}`)}</li>
          ))}
        </ListTag>
      );
      currentList = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const bulletMatch = line.match(/^[\s]*[-•]\s+(.*)/);
      const numberMatch = line.match(/^[\s]*(\d+)[.)]\s+(.*)/);

      if (bulletMatch) {
        if (!currentList || currentList.type !== 'ul') { flushList(); currentList = { type: 'ul', items: [] }; }
        currentList.items.push(bulletMatch[1]);
      } else if (numberMatch) {
        if (!currentList || currentList.type !== 'ol') { flushList(); currentList = { type: 'ol', items: [] }; }
        currentList.items.push(numberMatch[2]);
      } else {
        flushList();
        if (line.trim() === '') {
          elements.push(<div key={`br-${i}`} style={{ height: 8 }} />);
        } else {
          elements.push(<p key={`p-${i}`} style={{ margin: 0 }}>{renderInline(line, `p-${i}`)}</p>);
        }
      }
    }
    flushList();
    return elements;
  };

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '88%',
          padding: '8px 16px',
          borderRadius: isUser
            ? '16px 0 16px 16px'   // user: top-right square (staff/blue side)
            : '0 16px 16px 16px',  // agent: top-left square (grey side)
          backgroundColor: isUser ? '#EAEEF9' : '#F0F0F0',
          fontSize: 14,
          color: '#2D2D2D',
          lineHeight: '22px',
          fontFamily: 'var(--font-roboto), sans-serif',
        }}
      >
        {renderContent(content)}
      </div>
    </div>
  );
}
