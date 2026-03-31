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
import { mdiAccountGroupOutline, mdiDeleteOutline } from '@mdi/js';
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
      {/* Agent identity — no card bg, sits directly on #FAFAFA page */}
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
        <div style={{ flex: 1 }}>
          <input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            style={{
              fontSize: 18,
              fontWeight: 500,
              lineHeight: '28px',
              color: '#000',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              padding: 0,
              marginBottom: 4,
              fontFamily: 'var(--font-roboto), sans-serif',
            }}
            placeholder="Agent name"
          />
          <textarea
            ref={(el) => {
              if (el) {
                el.style.height = '0px';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
            value={agentDescription}
            onChange={(e) => {
              setAgentDescription(e.target.value);
              const el = e.target;
              el.style.height = '0px';
              el.style.height = el.scrollHeight + 'px';
            }}
            rows={1}
            style={{
              fontSize: 16,
              fontWeight: 400,
              lineHeight: '24px',
              color: '#000',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              padding: 0,
              resize: 'none',
              overflow: 'hidden',
              fontFamily: 'var(--font-roboto), sans-serif',
            }}
            placeholder="Describe what this agent does..."
          />
        </div>
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

      {/* Guidelines & Tone card — white bg on #FAFAFA */}
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
            Guidelines & Tone
          </p>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '24px', color: '#000', margin: '4px 0 0 0' }}>
            How should this agent communicate and behave?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CanarySelect
            label="Communication style"
            size={InputSize.NORMAL}
            value={communicationStyle}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCommunicationStyle(e.target.value)}
            options={COMMUNICATION_STYLES}
          />

          <CanaryTextArea
            label="Behavioral Guidelines"
            value={behavioralGuidelines}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBehavioralGuidelines(e.target.value)}
            placeholder="Enter behavioral guidelines..."
            rows={6}
          />

          <CanaryTextArea
            label="Guardrails"
            value={guardrailsText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGuardrailsText(e.target.value)}
            placeholder="Enter guardrails (what the agent should never do)..."
            rows={4}
          />

          <CanaryInputMultiple
            label="Avoided Topics"
            values={avoidedTopics}
            onChange={(values: string[]) => setAvoidedTopics(values)}
            placeholder="Add topics..."
          />
        </div>
      </div>
    </div>
  );
}
