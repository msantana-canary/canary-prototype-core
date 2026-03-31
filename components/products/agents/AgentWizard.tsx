// @ts-nocheck — This file will be deleted in Phase 8 (replaced by WizardLayout + step components)
'use client';

/**
 * AgentWizard — Conversational AI-guided agent creation.
 *
 * Two-panel layout:
 * - Left (~55%): Growing summary card that fills in as the AI configures things
 * - Right (~45%): Guided conversation with quick reply choices
 *
 * The conversation is scripted (deterministic state machine), not calling
 * the Claude API. Each turn updates the store and the left summary.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@mdi/react';
import {
  mdiCheckCircleOutline,
  mdiArrowLeft,
  mdiRobotOutline,
  mdiSendOutline,
  mdiChevronRight,
} from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
  ButtonColor,
  CanaryTextArea,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import type { AgentTemplate, Connection } from '@/lib/products/agents/types';

// ---------------------------------------------------------------------------
// Conversation State Machine
// ---------------------------------------------------------------------------

type ConversationTurnId =
  | 'channels'
  | 'connections'
  | 'tone'
  | 'guardrails'
  | 'workflow'
  | 'done'
  | 'customize';

interface QuickReply {
  label: string;
  value: string;
  action: 'next' | 'select' | 'custom';
}

interface ConversationTurn {
  id: ConversationTurnId;
  getAiMessage: (ctx: ConversationContext) => string;
  quickReplies: (ctx: ConversationContext) => QuickReply[];
  multiSelect?: boolean;
  summarySection: string; // which summary section this turn fills
}

interface ConversationContext {
  template: AgentTemplate;
  selectedChannels: string[];
  selectedTone: string;
  selectedGuardrails: string[];
  connections: Connection[];
}

// Helper to format connection status display
function formatConnections(connections: Connection[]): string {
  return connections
    .map((c) => {
      const icon = c.status === 'connected' ? '\u2705' : c.status === 'needed' ? '\u26A0\uFE0F' : '\u2139\uFE0F';
      const statusText =
        c.status === 'connected'
          ? 'Connected'
          : c.status === 'needed'
          ? 'Setup Required'
          : 'Optional';
      return `${icon} **${c.name}** \u2014 ${statusText}`;
    })
    .join('\n');
}

const CONVERSATION_TURNS: ConversationTurn[] = [
  {
    id: 'channels',
    getAiMessage: (ctx) =>
      `Great choice! The **${ctx.template.name}** ${ctx.template.description.charAt(0).toLowerCase()}${ctx.template.description.slice(1)}\n\nLet me set this up for you.\n\nFirst, where do your inquiries come in?`,
    quickReplies: () => [
      { label: 'Email', value: 'email', action: 'next' },
      { label: 'Phone', value: 'voice', action: 'next' },
      { label: 'Email & Phone', value: 'email,voice', action: 'next' },
      { label: 'All Channels', value: 'all', action: 'next' },
    ],
    summarySection: 'template',
  },
  {
    id: 'connections',
    getAiMessage: (ctx) => {
      const channelLabel =
        ctx.selectedChannels.length === 1
          ? ctx.selectedChannels[0]
          : ctx.selectedChannels.length <= 3
          ? ctx.selectedChannels.join(' & ')
          : 'all channels';
      return `Got it \u2014 I'll monitor **${channelLabel}**. Let me check your integrations...\n\n${formatConnections(ctx.connections)}\n\nWant to continue with this setup, or adjust connections later?`;
    },
    quickReplies: (ctx) => {
      const hasNeeded = ctx.connections.some((c) => c.status === 'needed');
      const replies: QuickReply[] = [{ label: 'Continue with this setup', value: 'continue', action: 'next' }];
      if (hasNeeded) {
        replies.push({ label: "I'll set up missing ones later", value: 'later', action: 'next' });
      }
      replies.push({ label: 'Tell me more', value: 'more', action: 'next' });
      return replies;
    },
    summarySection: 'channels',
  },
  {
    id: 'tone',
    getAiMessage: (ctx) =>
      `What tone should I use when responding to ${ctx.template.role.toLowerCase().includes('sales') ? 'event planners and leads' : 'guests'}?`,
    quickReplies: () => [
      { label: 'Formal & Professional', value: 'Formal', action: 'next' },
      { label: 'Friendly & Warm', value: 'Natural', action: 'next' },
      { label: 'Match their tone', value: 'Adaptive', action: 'next' },
      { label: 'Luxury & Elevated', value: 'Luxury', action: 'next' },
    ],
    summarySection: 'connections',
  },
  {
    id: 'guardrails',
    getAiMessage: () =>
      `Any rules I should follow? Here are common ones for this type of agent:`,
    quickReplies: (ctx) => {
      const defaults = ctx.template.defaultWorkflow.guardrails.slice(0, 3);
      const replies: QuickReply[] = defaults.map((g) => ({
        label: g.length > 50 ? g.slice(0, 47) + '...' : g,
        value: g,
        action: 'select' as const,
      }));
      replies.push(
        { label: 'Always include meeting CTA', value: 'Always include meeting CTA', action: 'select' },
        { label: 'Custom rule...', value: 'custom', action: 'custom' },
      );
      return replies;
    },
    multiSelect: true,
    summarySection: 'tone',
  },
  {
    id: 'workflow',
    getAiMessage: (ctx) => {
      const steps = ctx.template.defaultWorkflow.steps;
      const stepList = steps
        .map((s, i) => `${i + 1}. ${s.label} \u2014 ${s.description}`)
        .join('\n');
      return `Here's how your agent will handle inquiries:\n\n${stepList}\n\nWant to customize this flow, or does this look good?`;
    },
    quickReplies: () => [
      { label: 'Looks good!', value: 'approve', action: 'next' },
      { label: 'I want to customize', value: 'customize', action: 'custom' },
      { label: 'Add a step', value: 'add', action: 'custom' },
    ],
    summarySection: 'guardrails',
  },
  {
    id: 'done',
    getAiMessage: (ctx) =>
      `Your **${ctx.template.name}** is ready to deploy! Check the summary on the left \u2014 everything looks good. Hit **Deploy Agent** when you're ready.`,
    quickReplies: () => [],
    summarySection: 'workflow',
  },
];

// Channel display name mapping
const CHANNEL_NAMES: Record<string, string> = {
  email: 'Email',
  voice: 'Phone',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  webchat: 'Webchat',
  'booking-com': 'Booking.com',
  expedia: 'Expedia',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AgentWizard() {
  const {
    wizardTemplate,
    wizardConnections,
    wizardGuardrails,
    wizardTone,
    agentName,
    agentDescription,
    currentWorkflow,
    deployAgent,
    goBack,
    setWizardTone,
    setWizardGuardrails,
    setWizardTriggers,
  } = useAgentStore();

  // Conversation state
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState(wizardTone);
  const [selectedGuardrails, setSelectedGuardrails] = useState<string[]>([...wizardGuardrails]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingProgress, setTypingProgress] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const template = wizardTemplate;

  // Build context
  const getContext = useCallback((): ConversationContext => ({
    template: template!,
    selectedChannels,
    selectedTone,
    selectedGuardrails,
    connections: wizardConnections,
  }), [template, selectedChannels, selectedTone, selectedGuardrails, wizardConnections]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, typingProgress]);

  // Typing effect for AI messages
  const typeMessage = useCallback((messageId: string, content: string) => {
    const words = content.split(' ');
    setTypingMessageId(messageId);
    setTypingProgress(0);
    setIsTyping(true);

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    let wordIndex = 0;
    const interval = setInterval(() => {
      wordIndex++;
      if (wordIndex >= words.length) {
        clearInterval(interval);
        setTypingProgress(words.length);
        setIsTyping(false);
        setTimeout(() => setTypingMessageId(null), 100);
      } else {
        setTypingProgress(wordIndex);
      }
    }, 30);

    typingIntervalRef.current = interval;
  }, []);

  // Add AI message with typing effect
  const addAiMessage = useCallback((content: string) => {
    const id = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setMessages((prev) => [...prev, { id, role: 'assistant', content }]);
    typeMessage(id, content);
  }, [typeMessage]);

  // Add user message (no typing effect)
  const addUserMessage = useCallback((content: string) => {
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setMessages((prev) => [...prev, { id, role: 'user', content }]);
  }, []);

  // Initialize first AI message
  useEffect(() => {
    if (!template || messages.length > 0) return;
    const turn = CONVERSATION_TURNS[0];
    const ctx = getContext();
    const msg = turn.getAiMessage(ctx);
    addAiMessage(msg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

  // Advance to next turn
  const advanceToTurn = useCallback((turnIndex: number, sectionToComplete?: string) => {
    if (sectionToComplete) {
      setCompletedSections((prev) => new Set([...prev, sectionToComplete]));
    }

    if (turnIndex >= CONVERSATION_TURNS.length) return;

    const turn = CONVERSATION_TURNS[turnIndex];
    setCurrentTurnIndex(turnIndex);

    // Small delay so user message appears first
    setTimeout(() => {
      const ctx = getContext();
      const msg = turn.getAiMessage(ctx);
      addAiMessage(msg);

      // If this is the done turn, mark the final section
      if (turn.id === 'done') {
        setCompletedSections((prev) => new Set([...prev, 'workflow']));
      }
    }, 600);
  }, [getContext, addAiMessage]);

  // Handle quick reply selection
  const handleQuickReply = useCallback((reply: QuickReply) => {
    const currentTurn = CONVERSATION_TURNS[currentTurnIndex];

    if (reply.action === 'custom') {
      if (currentTurn.id === 'guardrails' && reply.value === 'custom') {
        setShowCustomInput(true);
        return;
      }
      // "I want to customize" or "Add a step" goes to customize mode
      addUserMessage(reply.label);
      setShowCustomInput(true);
      return;
    }

    if (reply.action === 'select' && currentTurn.multiSelect) {
      // Toggle selection for multi-select
      setSelectedGuardrails((prev) => {
        const exists = prev.includes(reply.value);
        return exists ? prev.filter((g) => g !== reply.value) : [...prev, reply.value];
      });
      return;
    }

    // Regular next action
    addUserMessage(reply.label);

    // Process based on current turn
    switch (currentTurn.id) {
      case 'channels': {
        const channels = reply.value === 'all'
          ? ['email', 'voice', 'sms', 'whatsapp', 'webchat']
          : reply.value.split(',');
        setSelectedChannels(channels);

        // Update store triggers with selected channels
        if (template) {
          const updatedTriggers = template.defaultTriggers.map((t) => ({
            ...t,
            channels: t.channels.map((ch) => ({
              ...ch,
              enabled: channels.includes(ch.channel),
            })),
          }));
          setWizardTriggers(updatedTriggers);
        }

        advanceToTurn(currentTurnIndex + 1, 'template');
        break;
      }
      case 'connections': {
        advanceToTurn(currentTurnIndex + 1, 'channels');
        break;
      }
      case 'tone': {
        setSelectedTone(reply.value);
        setWizardTone(reply.value);
        advanceToTurn(currentTurnIndex + 1, 'connections');
        break;
      }
      case 'workflow': {
        if (reply.value === 'approve') {
          advanceToTurn(currentTurnIndex + 1, 'guardrails');
        }
        break;
      }
      default:
        advanceToTurn(currentTurnIndex + 1, currentTurn.summarySection);
    }
  }, [currentTurnIndex, template, addUserMessage, advanceToTurn, setWizardTone, setWizardTriggers]);

  // Handle guardrails "Done" button
  const handleGuardrailsDone = useCallback(() => {
    const label = selectedGuardrails.length === 0
      ? 'No specific rules'
      : `${selectedGuardrails.length} rule${selectedGuardrails.length > 1 ? 's' : ''} selected`;
    addUserMessage(label);
    setWizardGuardrails(selectedGuardrails);
    advanceToTurn(currentTurnIndex + 1, 'tone');
  }, [selectedGuardrails, addUserMessage, setWizardGuardrails, advanceToTurn, currentTurnIndex]);

  // Handle custom text input
  const handleCustomSubmit = useCallback(() => {
    if (!customInput.trim()) return;
    const currentTurn = CONVERSATION_TURNS[currentTurnIndex];

    if (currentTurn.id === 'guardrails') {
      setSelectedGuardrails((prev) => [...prev, customInput.trim()]);
      setCustomInput('');
      setShowCustomInput(false);
      return;
    }

    // For workflow customization, add the user message and show a confirmation
    addUserMessage(customInput.trim());
    setCustomInput('');
    setShowCustomInput(false);

    // Simulate AI acknowledgment and move to done
    setTimeout(() => {
      addAiMessage(`Got it, I've noted your customization. Your **${template?.name}** is ready to deploy! Check the summary on the left.`);
      setCompletedSections((prev) => new Set([...prev, 'guardrails', 'workflow']));
      setCurrentTurnIndex(CONVERSATION_TURNS.length - 1);
    }, 600);
  }, [customInput, currentTurnIndex, addUserMessage, addAiMessage, template]);

  // Get displayed text during typing effect
  const getDisplayText = (msg: ChatMessage) => {
    if (msg.id === typingMessageId) {
      const words = msg.content.split(' ');
      return words.slice(0, typingProgress).join(' ');
    }
    return msg.content;
  };

  const currentTurn = CONVERSATION_TURNS[currentTurnIndex];
  const isDone = currentTurn?.id === 'done' || completedSections.has('workflow');

  if (!template) return null;

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <style>{`
        @keyframes summaryFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* ================================================================ */}
      {/* LEFT PANEL — Growing Summary                                     */}
      {/* ================================================================ */}
      <div
        style={{
          width: '55%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${colors.colorBlack6}`,
          backgroundColor: colors.colorBlack7,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: `1px solid ${colors.colorBlack6}`,
            backgroundColor: colors.colorWhite,
            flexShrink: 0,
          }}
        >
          <CanaryButton
            type={ButtonType.TEXT}
            size={ButtonSize.COMPACT}
            icon={<Icon path={mdiArrowLeft} size={0.7} />}
            onClick={goBack}
          >
            Back
          </CanaryButton>
        </div>

        {/* Summary content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Agent identity */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: colors.colorBlueDark5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon path={mdiRobotOutline} size={1.1} color={colors.colorBlueDark1} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.125rem', color: colors.colorBlack1 }}>
                {agentName || template.name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: colors.colorBlack3, marginTop: 2 }}>
                {agentDescription || template.description}
              </div>
            </div>
          </div>

          {/* Summary sections — fade in as completed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SummarySection
              visible={completedSections.has('template')}
              title="Template"
              subtitle={`${template.name}`}
              description={`"${template.description}"`}
            />

            <SummarySection
              visible={completedSections.has('channels')}
              title="Channels"
              subtitle={selectedChannels.map((c) => CHANNEL_NAMES[c] || c).join(', ')}
              description={`Monitoring ${selectedChannels.length === 1 ? 'your' : 'your'} ${selectedChannels.length > 1 ? 'inboxes' : 'inbox'}`}
            />

            <SummarySection
              visible={completedSections.has('connections')}
              title="Connections"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {wizardConnections.map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
                    <span style={{ color: c.status === 'connected' ? colors.colorLightGreen1 : colors.colorWheat1 }}>
                      {c.status === 'connected' ? '\u2713' : '\u26A0'}
                    </span>
                    <span style={{ color: colors.colorBlack2 }}>{c.name}</span>
                    <span style={{ color: colors.colorBlack4 }}>
                      \u2014 {c.status === 'connected' ? 'Connected' : c.status === 'needed' ? 'Setup Required' : 'Optional'}
                    </span>
                  </div>
                ))}
              </div>
            </SummarySection>

            <SummarySection
              visible={completedSections.has('connections')}
              title="Capabilities"
              description={template.defaultCapabilities
                .map((id) => {
                  const names: Record<string, string> = {
                    'prod-messages': 'Messages',
                    'prod-calls': 'Calls',
                    'prod-checkin': 'Check-in',
                    'prod-checkout': 'Checkout',
                    'prod-contracts': 'Contracts',
                    'prod-knowledge-base': 'Knowledge Base',
                    'prod-upsells': 'Upsells',
                    'prod-payment-links': 'Payment Links',
                    'prod-authorizations': 'Authorizations',
                    'prod-digital-tips': 'Digital Tips',
                  };
                  return names[id] || id;
                })
                .join(', ')}
            />

            <SummarySection
              visible={completedSections.has('tone')}
              title="Tone"
              subtitle={selectedTone}
            />

            <SummarySection
              visible={completedSections.has('guardrails') || completedSections.has('workflow')}
              title="Guardrails"
            >
              {(selectedGuardrails.length > 0 || wizardGuardrails.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {(selectedGuardrails.length > 0 ? selectedGuardrails : wizardGuardrails).map((g, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.8125rem', color: colors.colorBlack3 }}>
                      <span style={{ color: colors.colorBlack4, flexShrink: 0 }}>&bull;</span>
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              )}
            </SummarySection>

            <SummarySection
              visible={completedSections.has('workflow')}
              title="Workflow"
            >
              {currentWorkflow && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {currentWorkflow.steps.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8125rem' }}>
                      <span style={{ color: colors.colorBlack4, fontWeight: 600, flexShrink: 0, width: 16, textAlign: 'right' }}>{i + 1}.</span>
                      <span style={{ color: colors.colorBlack2 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </SummarySection>
          </div>
        </div>

        {/* Deploy footer — only when done */}
        {isDone && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: `1px solid ${colors.colorBlack6}`,
              backgroundColor: colors.colorWhite,
              flexShrink: 0,
              animation: 'summaryFadeIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex' }}>
              <CanaryButton
                type={ButtonType.PRIMARY}
                color={ButtonColor.SUCCESS}
                size={ButtonSize.NORMAL}
                onClick={deployAgent}
              >
                Deploy Agent
              </CanaryButton>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* RIGHT PANEL — Conversational AI                                  */}
      {/* ================================================================ */}
      <div
        style={{
          width: '45%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.colorWhite,
        }}
      >
        {/* Chat header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${colors.colorBlack6}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: colors.colorBlueDark5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon path={mdiRobotOutline} size={0.65} color={colors.colorBlueDark1} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: colors.colorBlack2 }}>
                Canary AI
              </div>
              <div style={{ fontSize: '0.6875rem', color: colors.colorBlack4 }}>
                Setting up your agent
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
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
          {messages.map((msg) => (
            <ConversationBubble key={msg.id} role={msg.role} content={getDisplayText(msg)} />
          ))}

          {/* Typing indicator */}
          {isTyping && typingProgress === 0 && (
            <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}>
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

          {/* Quick replies — show only when not typing */}
          {!isTyping && !isDone && currentTurn && (
            <QuickReplies
              turn={currentTurn}
              context={getContext()}
              selectedGuardrails={selectedGuardrails}
              onSelect={handleQuickReply}
              onGuardrailsDone={handleGuardrailsDone}
              showCustomInput={showCustomInput}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Custom text input — shown when user picks "Custom rule..." or "I want to customize" */}
        {showCustomInput && (
          <div
            style={{
              padding: '10px 16px 14px',
              borderTop: `1px solid ${colors.colorBlack6}`,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
            }}
          >
            <div style={{ flex: 1 }}>
              <CanaryTextArea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCustomSubmit();
                  }
                }}
                placeholder={currentTurn?.id === 'guardrails' ? 'Type a custom rule...' : 'Describe your customization...'}
                rows={2}
              />
            </div>
            <CanaryButton
              type={ButtonType.PRIMARY}
              size={ButtonSize.NORMAL}
              icon={<Icon path={mdiSendOutline} size={0.8} />}
              onClick={handleCustomSubmit}
              isDisabled={!customInput.trim()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary Section Component
// ---------------------------------------------------------------------------

function SummarySection({
  visible,
  title,
  subtitle,
  description,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  if (!visible) return null;

  return (
    <div
      style={{
        backgroundColor: colors.colorWhite,
        border: `1px solid ${colors.colorBlack6}`,
        borderRadius: 8,
        padding: '12px 16px',
        animation: 'summaryFadeIn 0.4s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon path={mdiCheckCircleOutline} size={0.7} color={colors.colorLightGreen1} />
        <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.colorBlack2 }}>{title}</span>
        {subtitle && (
          <>
            <span style={{ color: colors.colorBlack5 }}>:</span>
            <span style={{ fontSize: '0.8125rem', color: colors.colorBlack3 }}>{subtitle}</span>
          </>
        )}
      </div>
      {description && (
        <div style={{ fontSize: '0.75rem', color: colors.colorBlack4, marginTop: 4, marginLeft: 28 }}>
          {description}
        </div>
      )}
      {children && <div style={{ marginLeft: 28 }}>{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversation Bubble
// ---------------------------------------------------------------------------

function ConversationBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';

  const renderContent = (text: string) => {
    // Split on markdown bold, newlines, and emoji indicators
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part.split('\n').map((line, j) => (
        <React.Fragment key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </React.Fragment>
      ));
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '88%',
          padding: '9px 14px',
          borderRadius: 12,
          backgroundColor: isUser ? colors.colorBlueDark5 : colors.colorBlack7,
          border: isUser ? 'none' : `1px solid ${colors.colorBlack6}`,
          fontSize: '0.8125rem',
          color: isUser ? colors.colorBlueDark1 : colors.colorBlack2,
          lineHeight: 1.55,
        }}
      >
        {renderContent(content)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Replies
// ---------------------------------------------------------------------------

function QuickReplies({
  turn,
  context,
  selectedGuardrails,
  onSelect,
  onGuardrailsDone,
  showCustomInput,
}: {
  turn: ConversationTurn;
  context: ConversationContext;
  selectedGuardrails: string[];
  onSelect: (reply: QuickReply) => void;
  onGuardrailsDone: () => void;
  showCustomInput: boolean;
}) {
  const replies = turn.quickReplies(context);
  if (replies.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {replies.map((reply) => {
          const isSelected = turn.multiSelect && selectedGuardrails.includes(reply.value);
          return (
            <CanaryButton
              key={reply.value}
              type={isSelected ? ButtonType.PRIMARY : ButtonType.SHADED}
              size={ButtonSize.COMPACT}
              onClick={() => onSelect(reply)}
            >
              {reply.label}
            </CanaryButton>
          );
        })}
      </div>

      {/* Done button for multi-select (guardrails) */}
      {turn.multiSelect && !showCustomInput && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <CanaryButton
            type={ButtonType.PRIMARY}
            size={ButtonSize.COMPACT}
            icon={<Icon path={mdiChevronRight} size={0.7} />}
            onClick={onGuardrailsDone}
          >
            Continue
          </CanaryButton>
        </div>
      )}
    </div>
  );
}
