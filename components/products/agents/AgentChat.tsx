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

// Per-workflow chips — contextual to the specific workflow being edited
const WORKFLOW_CHIP_MAP: Record<string, string[]> = {
  // Sales & Events
  'Sales Inquiry Response': ['Add urgency detection for events within 7 days', 'Include site visit scheduling', 'Add budget-based response tiers'],
  'Cold Lead Follow-up': ['Change follow-up interval to 72 hours', 'Add re-engagement discount offer', 'Include win-back email template'],
  'Post-Meeting Contract Prep': ['Add BEO (banquet event order) generation', 'Include attrition clause conditions', 'Add multi-signer routing'],
  // Front Desk
  'Booking Request': ['Add rate comparison across room types', 'Include cancellation policy in confirmation', 'Add group booking handling'],
  'FAQ & Information': ['Add seasonal hours handling', 'Include nearby restaurant recommendations', 'Add multilingual response support'],
  'Service Request': ['Add priority escalation for VIP guests', 'Include photo upload for issue reporting', 'Add duplicate request detection'],
  'Upsell Offer': ['Add time-based offers (afternoon upgrade deals)', 'Include loyalty member pricing', 'Add bundle discount for multiple upsells'],
  'Guest Checkout': ['Add express checkout option', 'Include rebooking incentive in departure message', 'Add dispute resolution escalation path'],
  'Survey Response': ['Add sentiment analysis for open-ended feedback', 'Include automatic review site redirect for 5-star ratings', 'Add manager follow-up for 1-2 star reviews'],
  'Staff Escalation': ['Add department-specific routing rules', 'Include guest history summary in escalation', 'Add re-escalation timer customization'],
  // Voice AI
  'Inbound Call Handler': ['Add after-hours greeting variation', 'Include caller ID-based personalization', 'Add Spanish language support'],
  // Housekeeping
  'Housekeeping Service Request': ['Add minibar restock as a separate category', 'Include estimated delivery time by request type', 'Add VIP priority handling'],
  // No-Show Prevention
  'Pre-Arrival Outreach': ['Change outreach window to 5 days before arrival', 'Add loyalty-specific messaging', 'Include weather-based local tips in messages'],
  // Email Reservation
  'Process Cancellation Email': ['Add partial cancellation handling (reduce room count)', 'Include waitlist offer for cancelled dates', 'Add group cancellation routing'],
  'Process Modification Email': ['Add rate lock guarantee messaging', 'Include upgrade suggestions when changing dates', 'Add multi-room modification handling'],
  'Process Confirmation Email': ['Add pre-arrival upsell offer in confirmation', 'Include parking and transport info', 'Add loyalty enrollment prompt'],
  // Check-in Processing
  'Process Submission': ['Add auto-assign room on verification', 'Include welcome SMS on successful processing', 'Add special request flagging for housekeeping'],
  'ID Verification Review': ['Add secondary document acceptance (utility bill)', 'Include name mismatch tolerance threshold', 'Add VIP bypass for known returning guests'],
  'Payment Reconciliation': ['Add automatic retry schedule (1hr, 4hr, 12hr)', 'Include alternative payment method prompt', 'Add surcharge calculation for international cards'],
  'Room Assignment & Key': ['Add floor preference matching', 'Include connecting room logic for families', 'Add accessibility room auto-assignment'],
  'Upsell Processing': ['Add dynamic pricing based on occupancy', 'Include bundle discount when multiple upsells accepted', 'Add waitlist for sold-out upgrades'],
  // Service Ticket
  'Service Ticket Resolution': ['Add photo attachment requirement for maintenance', 'Include guest satisfaction check 30 min after resolution', 'Add recurring issue detection across stays'],
};

// Chips for creating a brand new workflow
const NEW_WORKFLOW_CHIPS: Record<string, string[]> = {
  'Sales & Events Agent': ['Build a rebooking outreach workflow', 'Create a post-event feedback collector', 'Set up a contract renewal reminder'],
  'Front Desk Agent': ['Build a lost and found request handler', 'Create a VIP arrival preparation workflow', 'Set up a noise complaint resolution flow'],
  'Voice AI Agent': ['Build a reservation confirmation call flow', 'Create an after-hours voicemail handler', 'Set up a wake-up call workflow'],
  'Housekeeping Agent': ['Build a proactive mid-stay housekeeping offer', 'Create a turndown service workflow', 'Set up a deep clean scheduling flow'],
  'No-Show Prevention Agent': ['Build a rebooking incentive for past no-shows', 'Create a VIP concierge pre-arrival workflow', 'Set up a transportation arrangement outreach'],
  'Check-in Processing Agent': ['Build a group check-in batch processor', 'Create a loyalty welcome package trigger', 'Set up an early arrival room readiness workflow'],
  'Email Reservation Agent': ['Build a waitlist management workflow', 'Create an OTA rate parity checker', 'Set up a booking anniversary outreach'],
  'Service Ticket Agent': ['Build a preventive maintenance scheduler', 'Create a guest compensation workflow', 'Set up a recurring issue alert for engineering'],
};

function getWorkflowChips(workflowName: string | undefined, templateName: string | undefined, isNew: boolean): string[] {
  if (isNew && templateName) {
    return NEW_WORKFLOW_CHIPS[templateName] ?? ['Describe the trigger for this workflow', 'What should happen when it runs?', 'What conditions should it handle?'];
  }
  if (workflowName && WORKFLOW_CHIP_MAP[workflowName]) {
    return WORKFLOW_CHIP_MAP[workflowName];
  }
  if (templateName) {
    return TEMPLATE_CHIP_MAP[templateName] ?? ['Customize the workflow', 'Add a new step', 'Modify conditions'];
  }
  return SCRATCH_CHIPS;
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
    // Only seed once per workflow — reset when switching
    if (seededWorkflowRef.current === currentWorkflow.id) return;
    // If messages were cleared (workflow switch), allow re-seeding
    if (builderMessages.length > 0) return;
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
          // Preserve user's workflow name and id when AI updates steps
          const current = useAgentStore.getState().currentWorkflow;
          setBuilderWorkflow({
            ...result.workflow,
            id: current?.id || result.workflow.id,
            name: current?.name || result.workflow.name,
          });
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

  const isNewWorkflow = sidebar && currentWorkflow && currentWorkflow.steps.length === 0;
  const chips = isExistingContext
    ? [
        `How is ${existingAgent.name} performing?`,
        'Show me the connections',
        'What are the guardrails?',
      ]
    : sidebar
    ? getWorkflowChips(currentWorkflow?.name || undefined, wizardTemplate?.name, !!isNewWorkflow)
    : wizardTemplate
    ? TEMPLATE_CHIP_MAP[wizardTemplate.name] ?? SCRATCH_CHIPS
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

    // Group lines into numbered sections with optional bullet sub-items
    interface ListSection { title: string; subItems: string[] }
    let numberedSections: ListSection[] = [];
    let currentBullets: string[] = [];
    let inNumberedList = false;

    const flushNumbered = () => {
      if (numberedSections.length === 0) return;
      elements.push(
        <ol key={`ol-${elements.length}`} style={{ margin: '4px 0', paddingLeft: 20, listStyle: 'decimal' }}>
          {numberedSections.map((section, si) => (
            <li key={si} style={{ marginBottom: section.subItems.length > 0 ? 8 : 2 }}>
              {renderInline(section.title, `oli-${elements.length}-${si}`)}
              {section.subItems.length > 0 && (
                <ul style={{ margin: '4px 0', paddingLeft: 16, listStyle: 'disc' }}>
                  {section.subItems.map((sub, subi) => (
                    <li key={subi} style={{ marginBottom: 2 }}>{renderInline(sub, `sub-${elements.length}-${si}-${subi}`)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      );
      numberedSections = [];
      inNumberedList = false;
    };

    const flushBullets = () => {
      if (currentBullets.length === 0) return;
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ margin: '4px 0', paddingLeft: 20, listStyle: 'disc' }}>
          {currentBullets.map((item, i) => (
            <li key={i} style={{ marginBottom: 2 }}>{renderInline(item, `uli-${elements.length}-${i}`)}</li>
          ))}
        </ul>
      );
      currentBullets = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const bulletMatch = line.match(/^[\s]*[-•]\s+(.*)/);
      const numberMatch = line.match(/^[\s]*(\d+)[.)]\s+(.*)/);

      if (numberMatch) {
        // Flush standalone bullets if any
        if (!inNumberedList) flushBullets();
        inNumberedList = true;
        numberedSections.push({ title: numberMatch[2], subItems: [] });
      } else if (bulletMatch && inNumberedList && numberedSections.length > 0) {
        // Sub-bullet under a numbered item
        numberedSections[numberedSections.length - 1].subItems.push(bulletMatch[1]);
      } else if (bulletMatch) {
        // Standalone bullet (not under a number)
        flushNumbered();
        currentBullets.push(bulletMatch[1]);
      } else {
        if (line.trim() === '') {
          // Empty line — don't flush numbered lists (they often have blank lines between items)
          // Only add spacing if we're NOT in the middle of a numbered list
          if (!inNumberedList && currentBullets.length === 0) {
            elements.push(<div key={`br-${i}`} style={{ height: 8 }} />);
          }
        } else {
          // Actual non-list text — flush everything
          flushNumbered();
          flushBullets();
          elements.push(<p key={`p-${i}`} style={{ margin: 0 }}>{renderInline(line, `p-${i}`)}</p>);
        }
      }
    }
    flushNumbered();
    flushBullets();
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
