'use client';

/**
 * AgentProfileStep — Step 1 of the creation wizard.
 *
 * Defines the agent's identity: name, description, responsibilities,
 * communication style, behavioral guidelines, guardrails, and avoided topics.
 * Matches Figma node 101-15807.
 */

import React, { useState, KeyboardEvent } from 'react';
import Icon from '@mdi/react';
import { mdiAccountGroupOutline, mdiDeleteOutline, mdiChevronDown, mdiChevronRight } from '@mdi/js';
import {
  CanaryInput,
  CanaryInputMultiple,
  CanarySelect,
  CanaryTextArea,
  InputSize,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';

const COMMUNICATION_STYLES = [
  { value: 'Formal', label: 'Formal — Polished and professional. Uses full greetings like "Dear Guest," more structured language.' },
  { value: 'Conversational', label: 'Conversational — Relaxed and friendly. Uses casual greetings, first names when available.' },
  { value: 'Luxury', label: 'Luxury — Elevated and refined. Uses sophisticated language appropriate for high-end properties.' },
  { value: 'Natural', label: 'Natural — Balanced and adaptive. Matches the guest\'s tone and formality level.' },
];

export default function AgentProfileStep() {
  const agentName = useAgentStore((s) => s.agentName);
  const agentDescription = useAgentStore((s) => s.agentDescription);
  const setAgentName = useAgentStore((s) => s.setAgentName);
  const setAgentDescription = useAgentStore((s) => s.setAgentDescription);

  const responsibilities = useAgentStore((s) => s.wizardResponsibilities);
  const setResponsibilities = useAgentStore((s) => s.setWizardResponsibilities);
  const behavioralGuidelines = useAgentStore((s) => s.wizardBehavioralGuidelines);
  const setBehavioralGuidelines = useAgentStore((s) => s.setWizardBehavioralGuidelines);
  const guardrailsText = useAgentStore((s) => s.wizardGuardrailsText);
  const setGuardrailsText = useAgentStore((s) => s.setWizardGuardrailsText);
  const avoidedTopics = useAgentStore((s) => s.wizardAvoidedTopics);
  const setAvoidedTopics = useAgentStore((s) => s.setWizardAvoidedTopics);
  const communicationStyle = useAgentStore((s) => s.wizardCommunicationStyle);
  const setCommunicationStyle = useAgentStore((s) => s.setWizardCommunicationStyle);
  const wizardTemplate = useAgentStore((s) => s.wizardTemplate);
  const isScratch = wizardTemplate?.id === 'tpl-scratch' || !wizardTemplate;

  const [newResponsibility, setNewResponsibility] = useState('');

  const handleAddResponsibility = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility.trim()]);
      setNewResponsibility('');
    }
  };

  const handleRemoveResponsibility = (idx: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Agent description — shown for templates only (read-only context) */}
      {!isScratch && agentDescription && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#EAEEF9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 8,
            }}
          >
            <Icon path={mdiAccountGroupOutline} size={1} color={colors.colorBlueDark1} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '24px', color: '#000', margin: 0, flex: 1 }}>
            {agentDescription}
          </p>
        </div>
      )}

      {/* Agent name — same tile style as workflow name */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #E5E5E5',
          borderRadius: 4,
          padding: 16,
        }}
      >
        <CanaryInput
          size={InputSize.NORMAL}
          value={agentName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgentName(e.target.value)}
          placeholder="Agent name"
          label="Agent name"
        />
      </div>

      {/* Responsibilities card — white bg on #FAFAFA */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: 0 }}>
            Responsibilities
          </p>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '24px', color: '#000', margin: '4px 0 0 0' }}>
            What tasks is this agent accountable for?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CanaryInput
            size={InputSize.NORMAL}
            value={newResponsibility}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewResponsibility(e.target.value)}
            onKeyDown={handleAddResponsibility}
            placeholder="Add a responsibility"
            helperText="Press Enter to add to list below"
          />

          {responsibilities.length > 0 && (
            <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
              {responsibilities.map((resp, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    backgroundColor: '#fff',
                    borderBottom: idx < responsibilities.length - 1 ? '1px solid #E5E5E5' : 'none',
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    color: '#000',
                    fontFamily: 'var(--font-roboto), sans-serif',
                  }}
                >
                  <span>{resp}</span>
                  <button
                    onClick={() => handleRemoveResponsibility(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 4,
                      color: colors.colorBlueDark1,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon path={mdiDeleteOutline} size={0.83} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Operating Rules — always shown */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: 0 }}>
            Operating Rules
          </p>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '24px', color: '#000', margin: '4px 0 0 0' }}>
            Define how this agent should operate and what it should never do.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CanaryTextArea
            label="Rules & Guidelines"
            value={behavioralGuidelines}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBehavioralGuidelines(e.target.value)}
            placeholder="Enter operating rules and guidelines..."
            rows={6}
          />

          <CanaryTextArea
            label="Guardrails"
            value={guardrailsText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGuardrailsText(e.target.value)}
            placeholder="Enter guardrails (what the agent should never do)..."
            rows={4}
          />
        </div>
      </div>

      {/* Communication Settings — optional, collapsible */}
      <CommunicationSettings
        communicationStyle={communicationStyle}
        setCommunicationStyle={setCommunicationStyle}
        avoidedTopics={avoidedTopics}
        setAvoidedTopics={setAvoidedTopics}
      />
    </div>
  );
}

/** Collapsible Communication Settings section */
function CommunicationSettings({
  communicationStyle,
  setCommunicationStyle,
  avoidedTopics,
  setAvoidedTopics,
}: {
  communicationStyle: string;
  setCommunicationStyle: (s: string) => void;
  avoidedTopics: string[];
  setAvoidedTopics: (t: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(
    // Default open if there's already a communication style set (template flow)
    communicationStyle !== '' && communicationStyle !== 'Natural'
  );

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#000', margin: 0 }}>
            Communication Settings
          </p>
          <p style={{ fontSize: 14, fontWeight: 400, lineHeight: '22px', color: '#999', margin: '4px 0 0 0' }}>
            Optional — configure how this agent communicates with guests
          </p>
        </div>
        <Icon
          path={isOpen ? mdiChevronDown : mdiChevronRight}
          size={1}
          color="#999"
        />
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CanarySelect
            label="Communication style"
            size={InputSize.NORMAL}
            value={communicationStyle}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCommunicationStyle(e.target.value)}
            options={COMMUNICATION_STYLES}
          />

          <CanaryInputMultiple
            label="Avoided Topics"
            values={avoidedTopics}
            onChange={(values: string[]) => setAvoidedTopics(values)}
            placeholder="Add topics..."
          />
        </div>
      )}
    </div>
  );
}
